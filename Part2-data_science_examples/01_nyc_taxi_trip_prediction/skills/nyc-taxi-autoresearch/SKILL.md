---
name: nyc-taxi-autoresearch
description: >-
  Comprehensive guide and autonomous runbook for reproducing the NYC Taxi Trip Duration & Fare Prediction ML Platform end-to-end.
  Covers dataset generation, spatial feature engineering (haversine, bearing, manhattan, airport distances), multi-backbone training (LightGBM, XGBoost, CatBoost, RandomForest, Ridge), AutoResearch Tabular Hill-Climbing, FastAPI deployment, and React admin dashboard.
---

# NYC Taxi ML & AutoResearch Platform — End-to-End Reproduction Runbook

This skill provides the full, step-by-step procedure to train, optimize, and deploy the **New York City Taxi Trip Duration & Fare Prediction System**.

---

## 1. Architecture & Component Blueprint

```
scratch/secondtest-nyc/
├── ml/
│   ├── data_loader.py               # Generates 10,000 realistic NYC spatial-temporal taxi trips
│   ├── features.py                  # Geodesic haversine, Manhattan grid, bearing, landmark distances
│   ├── train.py                     # Trains baseline Ridge, RandomForest, and SOTA XGBoost Regressor
│   └── autoresearch_tabular.py      # 4-stage hill climbing with multi-backbone tournament & feature mutations
├── server/
│   ├── main.py                      # FastAPI REST microservice (Port 8000)
│   ├── inference.py                 # Real-time sub-5ms trip estimation engine
│   └── test_api.py                  # Automated test suite (6/6 tests passing)
└── client/
    ├── src/
    │   ├── components/              # EstimatorView, AdminDashboard, AutoResearchDashboard, CrispDmReportModal
    │   └── utils/api.js             # REST API client
    └── vite.config.js               # React 18 + Vite Frontend (Port 5174)
```

---

## 2. Step-by-Step Reproduction Workflow

### Step 1: Spatial-Temporal Feature Engineering
Execute feature extraction covering NYC geographic bounding boxes (`[40.5, -74.3] x [41.0, -73.6]`):
- **Haversine Distance**: $\text{dist} = 2 R \arcsin\left(\sqrt{\sin^2(\Delta\phi/2) + \cos\phi_1 \cos\phi_2 \sin^2(\Delta\lambda/2)}\right)$
- **Manhattan Distance**: $\Delta\text{lat} \times 111.0 + \Delta\text{lon} \times 85.0$
- **Airport Proximity**: Geodesic distances to JFK, LGA, EWR.
- **Congestion Multipliers**: Peak rush hour (07:00-09:30, 16:30-19:30) and late night.

### Step 2: Multi-Backbone Model Training
Run baseline and SOTA model training:
```bash
cd ml
python train.py
```
- **XGBoost SOTA Regressor**: 50 estimators, max depth 5, learning rate 0.1, subsample 0.8, colsample 0.85.
- **Output Artifacts**: Serialized model in `server/models/xgboost_model.json`, `metadata.json`, and `experiments.json`.

### Step 3: AutoResearch Tabular Hill-Climbing Optimization
Execute autonomous multi-stage hill-climbing search:
```bash
cd ml
python autoresearch_tabular.py
```
- **Phase 1: Multi-Backbone Tournament**: LightGBM, XGBoost, CatBoost, RandomForest.
- **Phase 2: Feature Transformations**: PCA spatial components, interaction terms, quantile scalers.
- **Phase 3: Hyperparameter Tuning**: Tree depth, learning rates, L1/L2 regularization.
- **Phase 4: Blending & Ensembling**: Weighted stacking of gradient-boosted trees.
- **Telemetry Export**: Outputs `server/models/autoresearch_history.json`.

### Step 4: Verification & Automated API Tests
Run automated test suite:
```bash
python server/test_api.py
```

### Step 5: Launch Microservices
1. **Backend Server (Port 8000)**:
   ```bash
   cd server
   python -m uvicorn main:app --host 127.0.0.1 --port 8000
   ```
2. **Frontend UI (Port 5174)**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
