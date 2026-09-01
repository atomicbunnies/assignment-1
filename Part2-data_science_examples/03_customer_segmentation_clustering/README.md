# 🎯 Customer Personality Intelligence & Clustering Platform

An unsupervised learning and behavioral intelligence platform analyzing the **Kaggle Customer Personality Dataset ($N=10,000$)** with K-Means & GMM silhouette optimization ($s=0.4180$, $+21.0\%$ gain over baseline), 2D PCA & t-SNE projections, dynamic radar charts, and real-time persona inference.

---

## 📸 Comprehensive Visual Tour

### 1. Customer Persona Explorer & 2D PCA Manifold
*Interactive 5-cluster persona cards (VIP Champions, Prudent Affluents, Young Trendsetters, Bargain Hunters, Mainstream Loyalists) with interactive PCA/t-SNE scatter projections and live segment classifier.*
![Clustering Explorer](./screenshots/clustering_explorer.png)

### 2. AutoResearch Silhouette Score Hill-Climbing Leaderboard
*Automated iterative optimization testing distance metrics, PCA pre-reduction, and scaling transformers to maximize cluster separation.*
![Clustering AutoResearch](./screenshots/clustering_autoresearch.png)

### 3. CRISP-DM Unsupervised Analytics Report
*Detailed methodology documentation explaining cluster stability, Davies-Bouldin index, and Calinski-Harabasz metrics.*
![Clustering CRISP-DM](./screenshots/clustering_crisp_dm.png)

---

## 📐 Mathematical Metrics

1. **Silhouette Coefficient**:
   $$s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$$
2. **Davies-Bouldin Index**:
   $$DB = \frac{1}{k} \sum_{i=1}^k \max_{j \neq i} \left( \frac{\sigma_i + \sigma_j}{d(c_i, c_j)} \right)$$

---

## 🧠 Autonomous Skills Included

Pre-packaged in `skills/` and `.agents/skills/`:
* `customer-segmentation-clustering`: Unsupervised clustering optimization pipeline.
* `segmentation-analysis`: Persona behavioral profiling.
* `sklearn-pipelines`: Leakage-safe scaling and dimensionality reduction.

---

## 🚀 Quick Start

```bash
# Backend (FastAPI on Port 8003)
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8003

# Frontend (Vite React on Port 5176)
cd frontend
npm install
npm run dev # Open http://localhost:5176/
```
