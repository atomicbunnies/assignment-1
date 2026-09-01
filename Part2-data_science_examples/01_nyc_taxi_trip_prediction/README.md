# 🚕 NYC Taxi Trip Duration & Fare Prediction Platform

An end-to-end CRISP-DM spatial machine learning system solving the **Kaggle NYC Taxi Trip Duration Challenge** with spatial feature engineering, XGBoost duration regression ($R^2 = 96.97\%$), interactive map route trajectory simulation, and Karpathy-style AutoResearch hill-climbing optimization.

---

## 📸 Comprehensive Visual Tour

### 1. Interactive Ride Estimator & Route Map Simulator
*Select NYC landmarks, view live Manhattan distance, Great-Circle Haversine calculations, predicted travel time, and fare breakdown with rush hour surge detection.*
![NYC Estimator View](./screenshots/nyc_estimator_view.png)

### 2. AutoResearch & SOTA Benchmark Dashboard
*Compares production XGBoost against Kaggle Grandmaster SOTA (Top 1% RMSLE `0.3680`), showing tabular hill-climbing convergence curves and feature importance.*
![NYC Admin AutoResearch](./screenshots/nyc_admin_autoresearch.png)

### 3. CRISP-DM 6-Phase Research Report
*Exhaustive research dossier covering Business Understanding, Data Preparation, Modeling, and Deployment considerations.*
![NYC CRISP-DM Report](./screenshots/nyc_crisp_dm_report.png)

---

## 📐 Mathematical Formulations

1. **Haversine Great-Circle Distance**:
   $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
2. **Manhattan Grid Distance**:
   $$d_{\text{manhattan}} = R \cdot (|\Delta \phi| + |\Delta \lambda| \cdot \cos(\bar{\phi}))$$
3. **Compass Bearing Formula**:
   $$\theta = \text{atan2}\left(\sin(\Delta \lambda)\cos(\phi_2), \cos(\phi_1)\sin(\phi_2) - \sin(\phi_1)\cos(\phi_2)\cos(\Delta \lambda)\right)$$

---

## 🧠 Autonomous Skills Included

Pre-packaged in `skills/` and `.agents/skills/`:
* `nyc-taxi-autoresearch`: Automated tabular hill-climbing search loop.
* `exploratory-data-analysis`: Spatial distribution analysis and target leakage checks.
* `feature-engineering`: Geospatial cyclical timestamp and distance transforms.
* `pandas-patterns`: Vectorized NumPy/Pandas data pipelines.

---

## 🚀 Quick Start

```bash
# Backend (FastAPI on Port 8000)
cd server
python -m uvicorn main:app --host 127.0.0.1 --port 8000

# Frontend (Vite React on Port 5174)
cd client
npm install
npm run dev # Open http://localhost:5174/
```
