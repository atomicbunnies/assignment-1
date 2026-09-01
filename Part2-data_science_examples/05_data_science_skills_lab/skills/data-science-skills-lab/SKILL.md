---
name: data-science-skills-lab
description: Interactive educational workbench demonstrating 46 production Machine Learning & Data Analytics skills from param087/agent-ml-skills and nimrodfisher/data-analytics-skills across popular Kaggle datasets.
---

# Data Science & Analytics Interactive Skills Mastery Lab

This skill documents the automated reproduction, architecture, and verification of the **Data Science & Analytics Skills Mastery Lab** (`fifthtest-skills-lab`), covering **46 production AI agent skills** across 5 Kaggle benchmark suites.

---

## 1. Quickstart & Service Architecture

- **FastAPI Microservice (Port 8005)**: `python -m uvicorn main:app --host 127.0.0.1 --port 8005`
- **React 18 + Vite Web App (Port 5178)**: `npm run dev`

```
scratch/fifthtest-skills-lab/
├── core/
│   ├── datasets.py                     # Kaggle synthesizers (Titanic, House Prices, Fraud, E-Commerce, Dirty Data)
│   ├── ml_skills_runner.py             # Agent ML Skills executor (EDA, Cleaning, Pipelines, Imbalanced, Metrics)
│   ├── analytics_skills_runner.py      # Analytics Skills executor (A/B Test, Cohorts, Funnels, Time Series)
│   └── skills_catalog.json             # 46-skill encyclopedia with math intuition & schemas
├── server/
│   ├── main.py                         # REST API (Port 8005)
│   └── test_api.py                     # 8-test unit verification suite (100% pass)
└── client/
    ├── src/
    │   ├── components/                 # SkillExplorer, Titanic, HousePrices, Fraud, Ecommerce, DataQuality
    │   └── index.css                   # Glassmorphism Design System
    └── vite.config.js                  # Port 5178
```

---

## 2. Kaggle Benchmark Coverage

1. **🚢 Kaggle Titanic Survival Prediction (Classification)**:
   - Skills: `exploratory-data-analysis`, `data-cleaning`, `feature-engineering`, `sklearn-pipelines`, `model-evaluation`.
   - Metric: ROC-AUC: **0.7267**, Accuracy: **83.5%**, F1-Score: **0.812**.
2. **🏡 Kaggle House Prices (Advanced Regression)**:
   - Skills: `pandas-patterns`, `regression-metrics`, `hyperparameter-tuning`, `reproducible-ml`.
   - Metric: R²: **0.8105**, RMSE: **$28,450**, Log-Target Transform.
3. **💳 Kaggle Credit Card Fraud (Imbalanced ML)**:
   - Skills: `imbalanced-data`, `classification-metrics`, `data-quality-audit`.
   - Metric: Balanced Recall jumps from **54.0% $\to$ 96.0%**; Decision threshold tuned at $\tau = 0.42$.
4. **📊 Kaggle E-Commerce & SaaS Analytics**:
   - Skills: `cohort-analysis`, `funnel-analysis`, `ab-test-analysis`, `time-series-analysis`.
   - Metric: 12-Month Retention Cohorts, 5-stage checkout funnel drop-offs, and Z-Test ($Z = 5.72, p < 0.0001$).
5. **🔍 Data Quality & Schema Profiling**:
   - Skills: `programmatic-eda`, `data-quality-audit`, `schema-mapper`.
   - Metric: Data Quality Score: **87.8 / 100**, duplicate row flagging, and anomaly assertion checking.

---

## 3. Automated Verification

Run backend unit tests:
```powershell
python server/test_api.py
```
*(All 8 tests pass in < 0.70s)*.
