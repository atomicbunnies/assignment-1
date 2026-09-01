# NanoLlama — Modern Transformer Language Model Architecture
# State-of-the-Art Primitives: RoPE, SwiGLU, RMSNorm, KV-Cache, Causal Multi-Head Attention

import math
from typing import Optional, Tuple, List, Dict
import torch
import torch.nn as nn
import torch.nn.functional as F

class RMSNorm(nn.Module):
    """Root Mean Square Layer Normalization (Zhang & Sennrich, 2019 / LLaMA)."""
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def _norm(self, x: torch.Tensor) -> torch.Tensor:
        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self._norm(x.float()).type_as(x) * self.weight

def precompute_rope_freqs(head_dim: int, max_seq_len: int, theta: float = 10000.0) -> Tuple[torch.Tensor, torch.Tensor]:
    """Precompute cosine and sine frequency tables for RoPE."""
    freqs = 1.0 / (theta ** (torch.arange(0, head_dim, 2).float() / head_dim))
    t = torch.arange(max_seq_len, dtype=torch.float32)
    angles = torch.outer(t, freqs)  # (max_seq_len, head_dim // 2)
    cos = torch.repeat_interleave(torch.cos(angles), 2, dim=-1)  # (max_seq_len, head_dim)
    sin = torch.repeat_interleave(torch.sin(angles), 2, dim=-1)
    return cos, sin

def rotate_half(x: torch.Tensor) -> torch.Tensor:
    """Rotates half the hidden dimensions of the input."""
    x1 = x[..., 0::2]
    x2 = x[..., 1::2]
    return torch.stack((-x2, x1), dim=-1).flatten(-2)

def apply_rotary_emb(x: torch.Tensor, cos: torch.Tensor, sin: torch.Tensor) -> torch.Tensor:
    """Apply Rotary Position Embedding using precomputed real-valued cos and sin."""
    # x: (bsz, seqlen, n_heads, head_dim)
    # cos, sin: (seqlen, head_dim) -> broadcast to (1, seqlen, 1, head_dim)
    cos = cos.unsqueeze(0).unsqueeze(2).to(x.device)
    sin = sin.unsqueeze(0).unsqueeze(2).to(x.device)
    return (x * cos) + (rotate_half(x) * sin)

class SwiGLU(nn.Module):
    """SwiGLU Gated Feed-Forward Network (Shazeer, 2020 / LLaMA / Mistral)."""
    def __init__(self, dim: int, hidden_dim: int):
        super().__init__()
        self.w_gate = nn.Linear(dim, hidden_dim, bias=False)
        self.w_up = nn.Linear(dim, hidden_dim, bias=False)
        self.w_down = nn.Linear(hidden_dim, dim, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Swish(x * W_gate) * (x * W_up) * W_down
        return self.w_down(F.silu(self.w_gate(x)) * self.w_up(x))

class CausalSelfAttention(nn.Module):
    """Causal Multi-Head Self-Attention with RoPE and KV-Cache."""
    def __init__(self, dim: int, n_heads: int, max_seq_len: int = 512):
        super().__init__()
        assert dim % n_heads == 0, "dim must be divisible by n_heads"
        self.dim = dim
        self.n_heads = n_heads
        self.head_dim = dim // n_heads
        self.max_seq_len = max_seq_len

        self.wq = nn.Linear(dim, dim, bias=False)
        self.wk = nn.Linear(dim, dim, bias=False)
        self.wv = nn.Linear(dim, dim, bias=False)
        self.wo = nn.Linear(dim, dim, bias=False)

        # Autoregressive Key-Value Cache
        self.cache_k = None
        self.cache_v = None

    def forward(
        self,
        x: torch.Tensor,
        cos: torch.Tensor,
        sin: torch.Tensor,
        mask: Optional[torch.Tensor] = None,
        start_pos: int = 0,
        use_cache: bool = False,
        return_attn: bool = False
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        bsz, seqlen, _ = x.shape

        xq = self.wq(x).view(bsz, seqlen, self.n_heads, self.head_dim)
        xk = self.wk(x).view(bsz, seqlen, self.n_heads, self.head_dim)
        xv = self.wv(x).view(bsz, seqlen, self.n_heads, self.head_dim)

        # Apply RoPE
        xq = apply_rotary_emb(xq, cos=cos, sin=sin)
        xk = apply_rotary_emb(xk, cos=cos, sin=sin)

        if use_cache:
            if self.cache_k is None or start_pos == 0:
                self.cache_k = torch.zeros(bsz, self.max_seq_len, self.n_heads, self.head_dim, device=x.device)
                self.cache_v = torch.zeros(bsz, self.max_seq_len, self.n_heads, self.head_dim, device=x.device)

            self.cache_k[:bsz, start_pos: start_pos + seqlen] = xk
            self.cache_v[:bsz, start_pos: start_pos + seqlen] = xv

            keys = self.cache_k[:bsz, : start_pos + seqlen]
            values = self.cache_v[:bsz, : start_pos + seqlen]
        else:
            keys = xk
            values = xv

        # Transpose for batched matrix multiplication: (bsz, n_heads, seqlen, head_dim)
        xq = xq.transpose(1, 2)
        keys = keys.transpose(1, 2)
        values = values.transpose(1, 2)

        if not return_attn and not use_cache and mask is not None:
            # High-performance PyTorch native C++ vectorized SDPA
            output = F.scaled_dot_product_attention(xq, keys, values, is_causal=True)
            output = output.transpose(1, 2).contiguous().view(bsz, seqlen, -1)
            return self.wo(output), None

        # Fallback for KV cache and explicit attention matrix return
        scores = torch.matmul(xq, keys.transpose(2, 3)) / math.sqrt(self.head_dim)
        if mask is not None:
            scores = scores + mask

        attn_weights = F.softmax(scores.float(), dim=-1).type_as(xq)
        output = torch.matmul(attn_weights, values)  # (bsz, n_heads, seqlen, head_dim)
        output = output.transpose(1, 2).contiguous().view(bsz, seqlen, -1)

        attn_matrix = attn_weights if return_attn else None
        return self.wo(output), attn_matrix

class TransformerBlock(nn.Module):
    """LLaMA-style Transformer Decoder Block (Pre-RMSNorm + SwiGLU + RoPE Attention)."""
    def __init__(self, layer_id: int, dim: int, n_heads: int, ffn_hidden_dim: int, max_seq_len: int = 512):
        super().__init__()
        self.layer_id = layer_id
        self.attention_norm = RMSNorm(dim)
        self.attention = CausalSelfAttention(dim, n_heads, max_seq_len)
        self.ffn_norm = RMSNorm(dim)
        self.feed_forward = SwiGLU(dim, ffn_hidden_dim)

    def forward(
        self,
        x: torch.Tensor,
        cos: torch.Tensor,
        sin: torch.Tensor,
        mask: Optional[torch.Tensor] = None,
        start_pos: int = 0,
        use_cache: bool = False,
        return_attn: bool = False
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        # Pre-Norm Attention with Residual Connection
        h_norm = self.attention_norm(x)
        attn_out, attn_weights = self.attention(
            h_norm, cos=cos, sin=sin, mask=mask, start_pos=start_pos, use_cache=use_cache, return_attn=return_attn
        )
        h = x + attn_out

        # Pre-Norm SwiGLU FFN with Residual Connection
        out = h + self.feed_forward(self.ffn_norm(h))
        return out, attn_weights

class NanoLlama(nn.Module):
    """Complete Lightweight SOTA Language Model (NanoLlama)."""
    def __init__(
        self,
        vocab_size: int = 1024,
        dim: int = 192,
        n_layers: int = 4,
        n_heads: int = 6,
        ffn_hidden_dim: int = 512,
        max_seq_len: int = 256
    ):
        super().__init__()
        self.vocab_size = vocab_size
        self.dim = dim
        self.n_layers = n_layers
        self.n_heads = n_heads
        self.ffn_hidden_dim = ffn_hidden_dim
        self.max_seq_len = max_seq_len

        self.tok_embeddings = nn.Embedding(vocab_size, dim)
        self.layers = nn.ModuleList([
            TransformerBlock(i, dim, n_heads, ffn_hidden_dim, max_seq_len)
            for i in range(n_layers)
        ])
        self.norm = RMSNorm(dim)
        self.output = nn.Linear(dim, vocab_size, bias=False)

        # Weight tying (optional, improves sample efficiency)
        self.output.weight = self.tok_embeddings.weight

        # Precomputed RoPE frequencies (cos, sin)
        head_dim = dim // n_heads
        self.cos, self.sin = precompute_rope_freqs(head_dim, max_seq_len)

    def count_parameters(self) -> int:
        return sum(p.numel() for p in self.parameters() if p.requires_grad)

    def forward(
        self,
        tokens: torch.Tensor,
        targets: Optional[torch.Tensor] = None,
        start_pos: int = 0,
        use_cache: bool = False,
        return_attentions: bool = False
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor], Optional[List[torch.Tensor]]]:
        bsz, seqlen = tokens.shape
        h = self.tok_embeddings(tokens)

        # Slice RoPE frequencies
        cos = self.cos[start_pos: start_pos + seqlen].to(tokens.device)
        sin = self.sin[start_pos: start_pos + seqlen].to(tokens.device)

        mask = None
        if seqlen > 1:
            mask = torch.full((seqlen, seqlen), float("-inf"), device=tokens.device)
            mask = torch.triu(mask, diagonal=1)
            if start_pos > 0:
                mask = torch.hstack([torch.zeros((seqlen, start_pos), device=tokens.device), mask])

        attentions = []
        for layer in self.layers:
            h, attn_w = layer(
                h, cos=cos, sin=sin, mask=mask, start_pos=start_pos, use_cache=use_cache, return_attn=return_attentions
            )
            if return_attentions and attn_w is not None:
                attentions.append(attn_w)

        h = self.norm(h)
        logits = self.output(h)

        loss = None
        if targets is not None:
            loss = F.cross_entropy(logits.view(-1, self.vocab_size), targets.view(-1))

        return logits, loss, (attentions if return_attentions else None)

    @torch.no_grad()
    def generate(
        self,
        prompt_tokens: List[int],
        max_new_tokens: int = 100,
        temperature: float = 0.7,
        top_p: float = 0.9,
        top_k: int = 40,
        repetition_penalty: float = 1.1,
        eos_token_id: int = 2,
        callback=None
    ) -> List[int]:
        """Autoregressive generation with KV-Cache and Top-K/Top-P Nucleus Sampling."""
        self.eval()
        device = next(self.parameters()).device
        generated = list(prompt_tokens)

        # Clear KV caches
        for layer in self.layers:
            layer.attention.cache_k = None
            layer.attention.cache_v = None

        # Prefill prompt tokens into KV Cache
        tokens_tensor = torch.tensor([prompt_tokens], dtype=torch.long, device=device)
        logits, _, _ = self.forward(tokens_tensor, start_pos=0, use_cache=True)
        cur_pos = len(prompt_tokens)

        for _ in range(max_new_tokens):
            next_token_logits = logits[:, -1, :].clone()

            # Apply repetition penalty
            if repetition_penalty != 1.0:
                for token_id in set(generated):
                    if next_token_logits[0, token_id] > 0:
                        next_token_logits[0, token_id] /= repetition_penalty
                    else:
                        next_token_logits[0, token_id] *= repetition_penalty

            # Temperature scaling
            if temperature > 0:
                next_token_logits = next_token_logits / temperature

                # Top-K truncation
                if top_k > 0:
                    v, _ = torch.topk(next_token_logits, min(top_k, next_token_logits.size(-1)))
                    next_token_logits[next_token_logits < v[:, [-1]]] = -float('Inf')

                # Top-P (Nucleus) truncation
                if top_p < 1.0:
                    sorted_logits, sorted_indices = torch.sort(next_token_logits, descending=True)
                    cumulative_probs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)
                    sorted_indices_to_remove = cumulative_probs > top_p
                    sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
                    sorted_indices_to_remove[..., 0] = 0
                    indices_to_remove = sorted_indices[sorted_indices_to_remove]
                    next_token_logits[:, indices_to_remove] = -float('Inf')

                probs = F.softmax(next_token_logits, dim=-1)
                next_token = torch.multinomial(probs, num_samples=1).item()
            else:
                next_token = torch.argmax(next_token_logits, dim=-1).item()

            generated.append(next_token)
            if callback:
                callback(next_token)

            if next_token == eos_token_id:
                break

            if cur_pos >= self.max_seq_len - 1:
                break

            # Next token inference step (KV Cache enabled)
            next_token_tensor = torch.tensor([[next_token]], dtype=torch.long, device=device)
            logits, _, _ = self.forward(next_token_tensor, start_pos=cur_pos, use_cache=True)
            cur_pos += 1

        return generated
