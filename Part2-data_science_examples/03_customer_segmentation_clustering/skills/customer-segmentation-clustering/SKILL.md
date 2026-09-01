---
name: customer-segmentation-clustering
description: >-
  Comprehensive guide and autonomous runbook for reproducing the Kaggle Customer Intelligence & Unsupervised Segmentation Platform end-to-end.
  Covers synthetic Kaggle dataset generation, domain feature engineering (RFM velocity, discretionary ratio, digital engagement), multi-backbone clustering (K-Means++, GMM, Agglomerative, DBSCAN, Spectral), 2D PCA & t-SNE manifold projections, AutoResearch Tabular Hill-Climbing, FastAPI deployment, and React 18 admin console.
---

# Customer Intelligence & Unsupervised Segmentation Platform — End-to-End Reproduction Runbook

This skill provides the complete step-by-step procedure to train, optimize, benchmark, and deploy the **Customer Intelligence & Unsupervised Segmentation System**.

---

## 1. Architecture & Component Blueprint

```
scratch/thirdtest-clustering/
├── ml/
│   ├── data_loader.py               # Generates 10,000 multi-dimensional Kaggle customer profiles
│   ├── features.py                  # RFM velocity, discretionary income ratio, digital engagement index
│   ├── train.py                     # Trains K-Means++, GMM, Agglomerative, DBSCAN, Spectral & PCA/t-SNE
│   └── autoresearch_clustering.py   # 4-stage hill climbing optimizing Silhouette & Davies-Bouldin metrics
├── server/
│   ├── main.py                      # FastAPI REST microservice (Port 8003)
│   ├── inference.py                 # Real-time sub-5ms customer persona classifier
│   └── test_api.py                  # Automated test suite (7/7 tests passing)
└── client/
    ├── src/
    │   ├── components/              # ClusterExplorer, AdminDashboard, AutoResearchClustering, FeatureProfilesRadar
    │   └── utils/api.js             # REST API client
    └── vite.config.js               # React 18 + Vite Frontend (Port 5176)
```

---

## 2. Step-by-Step Reproduction Workflow

### Step 1: Feature Engineering & Preprocessing
Extract high-leverage behavioral interaction features:
- **Monetary Velocity**: `Total_Spend_Annual / (Recency_Days + 1)`
- **Discretionary Budget Ratio**: `Annual_Income_k / (Spending_Score + 1)`
- **Digital Engagement Index**: `Web_Visits_Month * (Spending_Score / 100)`
- **Deal Sensitivity Affinity**: `Discount_Sensitivity * (1 - Spending_Score / 100)`
- **Standardization**: `StandardScaler()` z-score normalization.

### Step 2: Multi-Backbone Clustering & Manifold Projection
Train and benchmark 5 clustering paradigms:
```bash
cd ml
python train.py
```
- **K-Means++ SOTA Champion**: $k=5$, Lloyd's algorithm with probabilistic seeding.
- **Dimensionality Reduction**: 2D PCA (69.6% variance explained) and 2D t-SNE.
- **Output Artifacts**: Serialized models in `server/models/kmeans_model.pkl`, `pca_model.pkl`, `benchmarks.json`, and `cluster_profiles.json`.

### Step 3: AutoResearch Tabular Hill-Climbing Optimization
Run autonomous unsupervised hill-climbing search loop:
```bash
cd ml
python autoresearch_clustering.py
```
- **Phase 1: Multi-Backbone Tournament**: K-Means++, GMM, Agglomerative, DBSCAN, Spectral.
- **Phase 2: Feature Transformations**: PowerTransformer, log spend, RFM ratios.
- **Phase 3: Hyperparameter Tuning**: $k \in [3, 8]$, covariance types, linkage criteria.
- **Phase 4: Consensus Ensembling**: Soft co-association matrix consensus.
- **Telemetry Export**: Outputs `server/models/autoresearch_history.json`.

### Step 4: Verification & Automated API Tests
Run automated test suite:
```bash
python server/test_api.py
```

### Step 5: Launch Microservices
1. **Backend Server (Port 8003)**:
   ```bash
   cd server
   python -m uvicorn main:app --host 127.0.0.1 --port 8003
   ```
2. **Frontend UI (Port 5176)**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
