# 📰 Medium.com Article: Inside NanoLlama: Building a Modern SFT Transformer from Scratch in Pure PyTorch

### *RoPE relative positional embeddings, SwiGLU gated activations, RMSNorm, KV-Caching, and live attention matrix visualization running smoothly on consumer hardware.*

**Author**: dlmastery  
**Read Time**: 6 min read · Aug 2026  
**GitHub Repository**: [dlmastery/data_science_examples/02_nano_llm_transformer](https://github.com/dlmastery/data_science_examples/tree/main/02_nano_llm_transformer)

---

![Hero Overview](./screenshots/nanollama_architecture_blueprint.png)

Ever wanted to truly understand how modern transformers like LLaMA and Mistral work under the hood without drowning in thousands of lines of framework abstractions? We built NanoLlama from scratch in pure PyTorch to show every matrix multiplication in real time.

---

## 💡 Why Traditional Approaches Fall Short

In many real-world machine learning and software engineering systems, developers encounter two major pain points:
1. **Disconnected Black Boxes**: Machine learning models often live in isolated Jupyter notebooks with zero interactive UI, making it impossible for domain stakeholders to explore edge cases.
2. **Subtle Data Leakages**: Rushing to build models without strict cross-validation boundaries leads to models that look amazing on paper but fail completely in production.

With **NanoLlama: Engineering a Lightweight Pure-PyTorch Autoregressive Transformer with Rotary Embeddings, SwiGLU Activations, and Supervised Fine-Tuning**, we set out to build an end-to-end, production-grade system that couples mathematical rigor with state-of-the-art interactive UX.

---

## ⚙️ The Mathematical & Engineering Breakthrough

#### 2. Architecture & Neural Formulations

1. **Rotary Position Embeddings (RoPE)**:
   $$R_{\Theta, m}^d x_m = \begin{pmatrix} x_m^{(1)} \cos m\theta_1 - x_m^{(2)} \sin m\theta_1 \\ x_m^{(1)} \sin m\theta_1 + x_m^{(2)} \cos m\theta_1 \\ \vdots \end{pmatrix}, \quad \theta_i = 10000^{-2(i-1)/d}$$
2. **SwiGLU Feed-Forward Transformation**:
   $$\text{FFN}_{\text{SwiGLU}}(x) = \left(\text{Swish}(x W_1) \otimes (x W_3)\right) W_2, \quad \text{Swish}(z) = z \cdot \sigma(\beta z)$$
3. **RMSNorm Formulation**:
   $$\text{RMSNorm}(x) = \frac{x}{\sqrt{\frac{1}{d} \sum_{i=1}^d x_i^2 + \epsilon}} \odot g$$

Here is what the architecture looks like under the hood:

```text
User Interaction (React 18 / TypeScript / Sliders)
       │
       ▼
High-Performance API (FastAPI / Express / SSE Stream)
       │
       ▼
Leakage-Free Feature Transformers & Model Inference Engine
       │
       ▼
Live Telemetry & Mathematical Visualizers
```

---

## 🖼️ An Interactive Visual Tour

### View 1: `nanollama_architecture_blueprint.png`
![nanollama_architecture_blueprint.png](./screenshots/nanollama_architecture_blueprint.png)

### View 2: `nanollama_attention_heatmaps.png`
![nanollama_attention_heatmaps.png](./screenshots/nanollama_attention_heatmaps.png)

### View 3: `nanollama_chat_studio.png`
![nanollama_chat_studio.png](./screenshots/nanollama_chat_studio.png)

### View 4: `nanollama_tokenizer_studio.png`
![nanollama_tokenizer_studio.png](./screenshots/nanollama_tokenizer_studio.png)

### View 5: `nanollama_training_curves.png`
![nanollama_training_curves.png](./screenshots/nanollama_training_curves.png)


---

## 🚀 How to Run It in 60 Seconds

You can run this entire system on your local machine with two simple commands:

```bash
# 1. Clone the repository
git clone https://github.com/dlmastery/data_science_examples.git
cd data_science_examples/02_nano_llm_transformer

# 2. Launch Backend & Frontend (see README.md for port details)
```

---

## 🌟 Final Takeaways

Building production AI and data science systems is about creating tight feedback loops between theory, code, and user experience.

Check out the full open-source repository on GitHub:  
👉 **[https://github.com/dlmastery/data_science_examples](https://github.com/dlmastery/data_science_examples)**

*If you enjoyed this breakdown, star the repo on GitHub and follow dlmastery for more deep-dives into modern data science, deep learning, and type-safe architecture!*
