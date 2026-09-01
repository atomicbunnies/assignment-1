---
name: associative-pattern-mining
description: >-
  Comprehensive guide and autonomous runbook for reproducing the Kaggle Market Basket & Associative Pattern Mining Platform end-to-end.
  Covers synthetic Kaggle Instacart transaction dataset generation, multi-backbone mining (Apriori, FP-Growth, ECLAT), high-order rule metrics (Support, Confidence, Lift, Leverage, Conviction), 2D Force-Directed Association Network Graph generation, AutoResearch Tabular Hill-Climbing, FastAPI deployment, and React 18 admin dashboard.
---

# Market Basket Intelligence & Associative Pattern Mining Platform — End-to-End Reproduction Runbook

This skill provides the full, step-by-step procedure to train, optimize, benchmark, and deploy the **Market Basket Intelligence & Association Mining System**.

---

## 1. Architecture & Component Blueprint

```
scratch/fourthtest-apriori/
├── ml/
│   ├── data_loader.py               # Generates 10,000 multi-item Kaggle Instacart transaction baskets
│   ├── mining.py                    # Apriori, FP-Growth, ECLAT, and metric calculations
│   ├── train.py                     # Trains baseline models, builds 2D network graph & exports JSON
│   └── autoresearch_mining.py       # 4-stage hill climbing optimizing Support & Lift lattices
├── server/
│   ├── main.py                      # FastAPI REST microservice (Port 8004)
│   ├── inference.py                 # Real-time sub-5ms basket cross-sell engine
│   └── test_api.py                  # Automated test suite (7/7 tests passing)
└── client/
    ├── src/
    │   ├── components/              # BasketRecommender, AssociationGraph, AdminDashboard, CrispDmReportModal
    │   └── utils/api.js             # REST API client
    └── vite.config.js               # React 18 + Vite Frontend (Port 5177)
```

---

## 2. Step-by-Step Reproduction Workflow

### Step 1: Transaction Generation & Preprocessing
Generate 10,000 multi-item baskets across 33 catalog products:
- **Catalog Departments**: Produce, Dairy & Eggs, Bakery & Deli, Pantry, Beverages, Snacks.
- **Affinity Archetypes**: Mexican Fiesta, Italian Pasta Dinner, Artisanal Coffee & Breakfast, PB&J Snack.

### Step 2: Multi-Backbone Association Mining & Network Graph Construction
Run baseline and SOTA association rule mining:
```bash
cd ml
python train.py
```
- **FP-Growth Champion**: Compact prefix tree mining in **0.382s**.
- **ECLAT**: Vertical tidset bitset intersections in **0.026s**.
- **Apriori**: Classical level-wise candidate generation in **0.889s**.
- **Association Metrics**: Support, Confidence, Lift, Leverage, Conviction.
- **Output Artifacts**: Serialized models in `server/models/association_rules.json`, `network_graph.json`, and `benchmarks.json`.

### Step 3: AutoResearch Tabular Hill-Climbing Optimization
Run autonomous unsupervised hill-climbing search loop:
```bash
cd ml
python autoresearch_mining.py
```
- **Phase 1: Multi-Backbone Tournament**: FP-Growth vs ECLAT vs Apriori.
- **Phase 2: Metric Pruning Mutations**: Support & Lift thresholds, high-confidence gates.
- **Phase 3: Hyperparameter Tuning**: Grid search on $(min\_support, min\_confidence, min\_lift)$.
- **Phase 4: High-Value Bundle Mining**: 3-item and 4-item bundle optimization.
- **Telemetry Export**: Outputs `server/models/autoresearch_history.json` (+7.9% Lift improvement).

### Step 4: Verification & Automated API Tests
Run automated test suite:
```bash
python server/test_api.py
```

### Step 5: Launch Microservices
1. **Backend Server (Port 8004)**:
   ```bash
   cd server
   python -m uvicorn main:app --host 127.0.0.1 --port 8004
   ```
2. **Frontend UI (Port 5177)**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
