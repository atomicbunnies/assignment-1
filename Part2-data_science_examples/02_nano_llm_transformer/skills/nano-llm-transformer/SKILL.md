---
name: nano-llm-transformer
description: >-
  Comprehensive guide and autonomous runbook for building, training, and deploying NanoLlama — a from-scratch Modern Transformer Language Model and Chatbot.
  Covers Rotary Position Embeddings (RoPE), SwiGLU Gated Feed-Forward Networks, RMSNorm, Stateful KV-Cache O(1) decoding, subword tokenizer training, AdamW Cosine Annealing scheduler, FastAPI SSE streaming, attention heatmaps visualizer, and React Tokenizer Studio.
---

# NanoLlama — Modern Transformer LLM & Chatbot Platform Reproduction Runbook

This skill provides the complete end-to-end instructions to build, train, deploy, and verify **NanoLlama** from scratch using state-of-the-art transformer primitives.

---

## 1. Mathematical Primitives & Model Specifications

1. **Rotary Position Embeddings (RoPE)**:
   $$(x \cos m\theta) + (\text{rotate\_half}(x) \sin m\theta)$$
   Enables relative distance awareness across sequence lengths without learned absolute position embeddings.
2. **SwiGLU Gated Activation**:
   $$\text{SwiGLU}(x) = (\text{silu}(x W_{\text{gate}}) \odot x W_{\text{up}}) W_{\text{down}}$$
3. **RMSNorm Pre-Normalization**:
   $$\text{RMSNorm}(x) = \frac{x}{\text{RMS}(x)} \odot \gamma$$
4. **Key-Value Cache (KV-Cache)**:
   Maintains key and value state tensors across sequential token generation steps for $O(1)$ autoregressive decoding.
5. **Dimensions**: 3 Layers, 4 Heads, $d_{\text{model}} = 128$, FFN hidden dim $= 384$, context window $= 96$, total parameters $= 672,512$.

---

## 2. Step-by-Step Reproduction Workflow

### Step 1: Tokenizer & Dataset Generation
Run subword tokenizer training and build synthetic multi-task conversational dataset:
```bash
cd core
python tokenizer.py
python dataset.py
```

### Step 2: Model Training Loop
Train NanoLlama on CPU / GPU with AdamW and Cosine Learning Rate Schedule:
```bash
python train.py
```
- **Target Metrics**: Validation Perplexity $< 1.10$, Loss $< 0.06$.
- **Checkpoints**: Exports `server/checkpoints/model.pt` and `telemetry.json`.

### Step 3: Run Automated API Tests
Verify streaming endpoints, attention tensor extraction, and tokenizer analysis:
```bash
cd ../server
python test_api.py
```

### Step 4: Launch Microservices
1. **FastAPI Streaming Microservice (Port 8002)**:
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8002
   ```
2. **React 18 + Vite Quantum Neural Web App (Port 5175)**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
