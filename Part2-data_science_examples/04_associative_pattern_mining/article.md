# 📰 Medium.com Article: Mining 10,000+ Shopping Baskets: Building a Sub-Millisecond Cross-Sell Graph with Apriori & FP-Growth

### *Discovering hidden product affinities, Lift multipliers, and real-time cart add-on recommendations with graph visualizers.*

**Author**: dlmastery  
**Read Time**: 6 min read · Aug 2026  
**GitHub Repository**: [dlmastery/data_science_examples/04_associative_pattern_mining](https://github.com/dlmastery/data_science_examples/tree/main/04_associative_pattern_mining)

---

![Hero Overview](./screenshots/market_basket_admin.png)

When a customer puts Fresh Limes and Avocados in their cart, what should you recommend next? Guessing loses revenue. Association pattern mining computes exact statistical affinity in sub-milliseconds.

---

## 💡 Why Traditional Approaches Fall Short

In many real-world machine learning and software engineering systems, developers encounter two major pain points:
1. **Disconnected Black Boxes**: Machine learning models often live in isolated Jupyter notebooks with zero interactive UI, making it impossible for domain stakeholders to explore edge cases.
2. **Subtle Data Leakages**: Rushing to build models without strict cross-validation boundaries leads to models that look amazing on paper but fail completely in production.

With **Sub-Millisecond Frequent Itemset Mining and Affinity Graph Discovery on Ultra-Dense Transactional Market Baskets**, we set out to build an end-to-end, production-grade system that couples mathematical rigor with state-of-the-art interactive UX.

---

## ⚙️ The Mathematical & Engineering Breakthrough

#### 2. Association Rule Mathematical Metrics

For itemsets $A, B \subseteq I$ across transaction database $\mathcal{D}$:
1. **Support**: $\text{Supp}(A \Rightarrow B) = \frac{|\{T \in \mathcal{D} \mid A \cup B \subseteq T\}|}{|\mathcal{D}|}$
2. **Confidence**: $\text{Conf}(A \Rightarrow B) = \frac{\text{Supp}(A \cup B)}{\text{Supp}(A)} = P(B \mid A)$
3. **Lift Multiplier**: $\text{Lift}(A \Rightarrow B) = \frac{\text{Supp}(A \cup B)}{\text{Supp}(A) \cdot \text{Supp}(B)} = \frac{P(A \cup B)}{P(A)P(B)}$

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

### View 1: `market_basket_admin.png`
![market_basket_admin.png](./screenshots/market_basket_admin.png)

### View 2: `market_basket_crisp_dm.png`
![market_basket_crisp_dm.png](./screenshots/market_basket_crisp_dm.png)

### View 3: `market_basket_graph.png`
![market_basket_graph.png](./screenshots/market_basket_graph.png)


---

## 🚀 How to Run It in 60 Seconds

You can run this entire system on your local machine with two simple commands:

```bash
# 1. Clone the repository
git clone https://github.com/dlmastery/data_science_examples.git
cd data_science_examples/04_associative_pattern_mining

# 2. Launch Backend & Frontend (see README.md for port details)
```

---

## 🌟 Final Takeaways

Building production AI and data science systems is about creating tight feedback loops between theory, code, and user experience.

Check out the full open-source repository on GitHub:  
👉 **[https://github.com/dlmastery/data_science_examples](https://github.com/dlmastery/data_science_examples)**

*If you enjoyed this breakdown, star the repo on GitHub and follow dlmastery for more deep-dives into modern data science, deep learning, and type-safe architecture!*
