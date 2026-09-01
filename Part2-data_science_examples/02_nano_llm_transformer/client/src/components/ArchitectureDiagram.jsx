import React from 'react';
import {
  Layers,
  Cpu,
  Zap,
  Repeat,
  Shield,
  Divide,
  Activity,
  Code2
} from 'lucide-react';

export const ArchitectureDiagram = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Layers size={22} style={{ color: 'var(--accent-cyan)' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>NanoLlama SOTA Transformer Blueprint</h3>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Mathematical formulation and structural block diagrams for LLaMA-3 / Mistral primitives
        </p>
      </div>

      {/* Blueprint Visual Stack */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem' }}>
        {/* Left Column: Visual Block Pipeline */}
        <div className="controls-card" style={{ gap: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.5rem' }}>
            Decoder Block Dataflow
          </div>

          <div className="synapse-node" style={{ borderColor: 'var(--accent-cyan)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-cyan-bright)' }}>
              1. Token & RoPE Embeddings
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Input IDs $\to$ Embedding Table (128d) + 2D Rotary Angle Tensor
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>↓</div>

          <div className="synapse-node" style={{ borderColor: 'var(--accent-purple)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-purple-bright)' }}>
              2. Pre-RMSNorm #1
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              $x / \text{RMS}(x) \odot \gamma$ (Skip mean centering for 7% faster pass)
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>↓</div>

          <div className="synapse-node" style={{ borderColor: '#38bdf8' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>
              3. Causal Attention + RoPE + KV Cache
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              4 Heads (dim 32) • Scaled Dot-Product • Cached Keys & Values
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>⊕ Residual Add</div>

          <div className="synapse-node" style={{ borderColor: 'var(--accent-purple)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-purple-bright)' }}>
              4. Pre-RMSNorm #2
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Normalizes attention residual state before non-linear expansion
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>↓</div>

          <div className="synapse-node" style={{ borderColor: 'var(--accent-amber)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
              5. SwiGLU Gated Feed-Forward
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {"silu(x * W_gate) ⊙ (x * W_up) * W_down (Expanded to 384d)"}
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>⊕ Residual Add</div>

          <div className="synapse-node" style={{ borderColor: 'var(--accent-emerald)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              6. Final RMSNorm & LM Head
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Projects 128d hidden vector to 255 token vocabulary logits
            </div>
          </div>
        </div>

        {/* Right Column: Deep Mathematical Primitives Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* RoPE Card */}
          <div className="controls-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <Zap size={16} style={{ color: 'var(--accent-cyan)' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Rotary Position Embeddings (RoPE)</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Instead of adding static position lookup tables to token embeddings, RoPE encodes position directly into the Query and Key vectors by rotating pairs of coordinates in the complex plane.
            </p>
            <pre style={{ background: '#090d16', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan-bright)' }}>
              R(m, θ) = [cos(mθ)  -sin(mθ)] [x1]
                        [sin(mθ)   cos(mθ)] [x2]
            </pre>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <strong>Advantage:</strong> Preserves dot-product decay as relative distance $|m - n|$ grows, enabling natural extrapolation across long context sequences.
            </p>
          </div>

          {/* SwiGLU Card */}
          <div className="controls-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <Activity size={16} style={{ color: 'var(--accent-amber)' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>SwiGLU Gated Feedforward Network</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              SwiGLU replaces traditional ReLU or standard GELU MLPs with a dual-projection gating mechanism where one branch is activated by the Swish / SiLU function and multiplied element-wise by the un-activated linear projection.
            </p>
            <pre style={{ background: '#090d16', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
              SwiGLU(x) = (SiLU(x * W_gate) ⊙ (x * W_up)) * W_down
            </pre>
          </div>

          {/* KV-Cache Card */}
          <div className="controls-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <Cpu size={16} style={{ color: 'var(--accent-emerald)' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Autoregressive Key-Value Cache</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {"During token generation, tokens that were already processed do not change their keys or values. The KV Cache keeps K_past and V_past in memory so each new token only performs a single-token forward projection (O(1) step time instead of O(N^2))."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
