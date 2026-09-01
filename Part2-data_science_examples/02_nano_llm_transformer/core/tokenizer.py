# NanoLlama Clean Character & Special Token Tokenizer

import json
from typing import List, Dict, Optional

SPECIAL_TOKENS = {
    "<|pad|>": 0,
    "<|bos|>": 1,
    "<|eos|>": 2,
    "<|user|>": 3,
    "<|assistant|>": 4,
    "<|system|>": 5
}

class NanoTokenizer:
    def __init__(self):
        self.special_tokens = dict(SPECIAL_TOKENS)
        self.vocab = dict(SPECIAL_TOKENS)
        self.inv_vocab = {v: k for k, v in self.vocab.items()}
        self._build_vocab()

    def _build_vocab(self):
        """Construct exact 1:1 character vocabulary for all printable ASCII, newlines, tabs."""
        # 1. ASCII characters 32 to 126
        for code in range(32, 127):
            ch = chr(code)
            if ch not in self.vocab:
                idx = len(self.vocab)
                self.vocab[ch] = idx
                self.inv_vocab[idx] = ch

        # 2. Control characters
        for ch in ['\n', '\t', '\r']:
            if ch not in self.vocab:
                idx = len(self.vocab)
                self.vocab[ch] = idx
                self.inv_vocab[idx] = ch

    def encode(self, text: str, add_bos: bool = False, add_eos: bool = False) -> List[int]:
        tokens = []
        if add_bos:
            tokens.append(self.special_tokens["<|bos|>"])

        i = 0
        n = len(text)
        while i < n:
            # Check for special tokens first
            matched_special = False
            for st, st_id in self.special_tokens.items():
                if text.startswith(st, i):
                    tokens.append(st_id)
                    i += len(st)
                    matched_special = True
                    break
            if matched_special:
                continue

            ch = text[i]
            tokens.append(self.vocab.get(ch, self.vocab.get(' ')))
            i += 1

        if add_eos:
            tokens.append(self.special_tokens["<|eos|>"])

        return tokens

    def decode(self, tokens: List[int], skip_special_tokens: bool = False) -> str:
        res = []
        for t in tokens:
            if t in self.inv_vocab:
                val = self.inv_vocab[t]
                if skip_special_tokens and val in self.special_tokens:
                    continue
                res.append(val)
        return "".join(res)

    def format_chat(self, user_msg: str, system_prompt: str = "You are NanoLlama, a helpful AI assistant.") -> str:
        return f"<|system|>{system_prompt}<|user|>{user_msg}<|assistant|>"

    def save(self, filepath: str):
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump({"vocab": self.vocab, "special_tokens": self.special_tokens}, f, indent=2)

    def load(self, filepath: str):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.vocab = data["vocab"]
            self.special_tokens = data.get("special_tokens", SPECIAL_TOKENS)
            self.inv_vocab = {v: k for k, v in self.vocab.items()}
