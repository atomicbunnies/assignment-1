# 📄 Scientific & Technical Abstract: NanoLlama: Engineering a Lightweight Pure-PyTorch Autoregressive Transformer with Rotary Embeddings, SwiGLU Activations, and Supervised Fine-Tuning

**Project**: `02_nano_llm_transformer`  
**Author / Lab**: Antigravity Autonomous Data Science & AI Engineering Suite (`dlmastery`)  
**Repository**: [https://github.com/dlmastery/data_science_examples](https://github.com/dlmastery/data_science_examples)

---

### Abstract

Large Language Models (LLMs) often obscure foundational architectural primitives behind heavy abstraction layers and distributed training clusters. In this paper, we introduce NanoLlama, a fully transparent, pure-PyTorch autoregressive language model engineered from first mathematical principles. NanoLlama implements state-of-the-art decoder-only primitives, including Rotary Position Embeddings (RoPE) for relative sequence awareness, SwiGLU gated activations for enhanced representational capacity, and Root Mean Square Normalization (RMSNorm) for gradient stabilization. The model is trained from scratch and refined through a dedicated Supervised Fine-Tuning (SFT) stage with conversational and reasoning datasets. To provide interpretability, NanoLlama includes an interactive visualization suite exposing real-time Key-Value (KV) cache generation, multi-head self-attention heatmaps, and BPE token byte-level inspection.

---

## 🎯 Key Empirical Findings & Metrics

* **System Status**: Production-Verified & Serving Live APIs.
* **Architecture Standard**: CRISP-DM Framework & High-Performance Full-Stack TypeScript / Python FastAPI.
* **Reproduction**: Full autonomous replication instructions available in `PROMPTS.md` and `skills/`.
