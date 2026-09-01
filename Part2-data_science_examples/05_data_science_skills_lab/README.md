# 🔬 Data Science Skills Mastery Lab

A modular analytics execution platform providing **54 pre-installed agent skills** mapped against **5 standard Kaggle benchmark datasets** (Titanic, House Prices, Credit Card Fraud, E-Commerce Cohorts, and Data Quality Audits) with interactive skill execution and leakage avoidance guidelines.

---

## 📸 Comprehensive Visual Tour

### 1. 54 Skills Encyclopedia & Category Filters
*Searchable directory of analytical workflows with input/output schemas and common pitfall warnings.*
![Skills Catalog](./screenshots/skills_lab_catalog.png)

### 2. Kaggle Titanic Survival Benchmark (Binary Classification)
*Interactive feature exploration, missing value imputation, and classification accuracy evaluation.*
![Titanic Benchmark](./screenshots/skills_lab_titanic.png)

### 3. Kaggle House Prices Benchmark (Advanced Regression)
*Log-transformed target regression with feature interaction terms and residual analysis.*
![House Prices Benchmark](./screenshots/skills_lab_house_prices.png)

### 4. Credit Card Fraud Benchmark (Highly Imbalanced ML)
*PR-AUC optimization, SMOTE resampling, and decision threshold calibration on 0.17% minority class.*
![Fraud Benchmark](./screenshots/skills_lab_fraud.png)

### 5. E-Commerce Analytics Benchmark (Cohort Retention)
*Monthly retention heatmaps, LTV/CAC ratios, and customer churn curve projections.*
![E-Commerce Benchmark](./screenshots/skills_lab_ecommerce.png)

### 6. Automated Data Quality Audit Scorecard
*Comprehensive data quality scoring across completeness, validity, uniqueness, and consistency.*
![Quality Audit](./screenshots/skills_lab_quality_audit.png)

---

## 🧠 Autonomous Skills Included

Pre-packaged in `skills/` and `.agents/skills/`:
* `exploratory-data-analysis`
* `feature-engineering`
* `data-cleaning`
* `imbalanced-data`
* `model-evaluation`
* `data-quality-audit`

---

## 🚀 Quick Start

```bash
# Backend (FastAPI on Port 8005)
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8005

# Frontend (Vite React on Port 5178)
cd frontend
npm install
npm run dev # Open http://localhost:5178/
```
