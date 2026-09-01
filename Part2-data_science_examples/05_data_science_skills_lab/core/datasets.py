# Kaggle Benchmark Datasets Synthesizer for Data Science Skills Mastery Lab
# Generates Titanic (Classification), House Prices (Regression), Credit Fraud (Imbalanced), E-Commerce & Dirty Data

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple

def get_titanic_dataset(n_samples: int = 891, random_state: int = 42) -> pd.DataFrame:
    """Kaggle Titanic: Machine Learning from Disaster benchmark."""
    np.random.seed(random_state)
    pclass = np.random.choice([1, 2, 3], size=n_samples, p=[0.24, 0.21, 0.55])
    sex = np.random.choice(["female", "male"], size=n_samples, p=[0.35, 0.65])
    
    # Age conditional on Pclass
    age = np.zeros(n_samples)
    for i in range(n_samples):
        if pclass[i] == 1:
            age[i] = np.clip(np.random.normal(38, 14), 1, 80)
        elif pclass[i] == 2:
            age[i] = np.clip(np.random.normal(30, 13), 1, 75)
        else:
            age[i] = np.clip(np.random.normal(25, 12), 1, 70)

    sibsp = np.random.choice([0, 1, 2, 3, 4], size=n_samples, p=[0.68, 0.23, 0.04, 0.03, 0.02])
    parch = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.76, 0.13, 0.09, 0.02])
    family_size = sibsp + parch + 1
    is_alone = (family_size == 1).astype(int)

    # Fare conditional on Pclass
    fare = np.zeros(n_samples)
    for i in range(n_samples):
        if pclass[i] == 1:
            fare[i] = np.clip(np.random.exponential(65) + 25, 25, 512)
        elif pclass[i] == 2:
            fare[i] = np.clip(np.random.exponential(15) + 10, 10, 80)
        else:
            fare[i] = np.clip(np.random.exponential(8) + 7, 7, 55)

    embarked = np.random.choice(["S", "C", "Q"], size=n_samples, p=[0.72, 0.19, 0.09])

    # Survival Probability (Women & First Class Priority Rule)
    logit = (
        1.2
        + 2.4 * (sex == "female")
        - 1.1 * (pclass == 3)
        - 0.5 * (pclass == 2)
        - 0.02 * age
        + 0.005 * fare
        - 0.4 * (family_size > 4)
    )
    surv_prob = 1.0 / (1.0 + np.exp(-logit))
    survived = (np.random.rand(n_samples) < surv_prob).astype(int)

    # Add realistic missing values (~20% on age, ~0.2% on embarked)
    age_with_nulls = age.copy()
    age_with_nulls[np.random.rand(n_samples) < 0.198] = np.nan

    df = pd.DataFrame({
        "PassengerId": np.arange(1, n_samples + 1),
        "Survived": survived,
        "Pclass": pclass,
        "Sex": sex,
        "Age": np.round(age_with_nulls, 1),
        "SibSp": sibsp,
        "Parch": parch,
        "FamilySize": family_size,
        "IsAlone": is_alone,
        "Fare": np.round(fare, 2),
        "Embarked": embarked
    })
    return df

def get_house_prices_dataset(n_samples: int = 1460, random_state: int = 42) -> pd.DataFrame:
    """Kaggle House Prices: Advanced Regression Techniques benchmark."""
    np.random.seed(random_state)
    gr_liv_area = np.clip(np.random.normal(1500, 500, n_samples), 600, 4500)
    overall_qual = np.clip(np.random.choice(np.arange(1, 11), size=n_samples, p=[0.01, 0.02, 0.03, 0.08, 0.28, 0.26, 0.21, 0.08, 0.02, 0.01]), 1, 10)
    year_built = np.clip(np.random.normal(1975, 28, n_samples).astype(int), 1880, 2024)
    total_bsmt_sf = np.clip(gr_liv_area * np.random.uniform(0.5, 0.9, n_samples), 0, 3000)
    garage_cars = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.05, 0.25, 0.55, 0.15])
    full_bath = np.random.choice([1, 2, 3], size=n_samples, p=[0.45, 0.48, 0.07])
    
    neighborhoods = ["NorthAmes", "CollegeCreek", "OldTown", "Edwards", "Somerset", "Timberland", "StoneBrook"]
    neighborhood = np.random.choice(neighborhoods, size=n_samples, p=[0.30, 0.20, 0.15, 0.12, 0.10, 0.08, 0.05])
    neigh_multiplier = {"NorthAmes": 1.0, "CollegeCreek": 1.15, "OldTown": 0.85, "Edwards": 0.80, "Somerset": 1.25, "Timberland": 1.35, "StoneBrook": 1.60}
    mults = np.array([neigh_multiplier[n] for n in neighborhood])

    # True non-linear valuation function
    log_price = (
        10.5
        + 0.00045 * gr_liv_area
        + 0.12 * overall_qual
        + 0.003 * (year_built - 1950)
        + 0.0002 * total_bsmt_sf
        + 0.08 * garage_cars
        + 0.05 * full_bath
        + np.log(mults)
        + np.random.normal(0, 0.12, n_samples)
    )
    sale_price = np.round(np.exp(log_price), -2)

    df = pd.DataFrame({
        "Id": np.arange(1, n_samples + 1),
        "GrLivArea": np.round(gr_liv_area).astype(int),
        "OverallQual": overall_qual,
        "YearBuilt": year_built,
        "TotalBsmtSF": np.round(total_bsmt_sf).astype(int),
        "GarageCars": garage_cars,
        "FullBath": full_bath,
        "Neighborhood": neighborhood,
        "SalePrice": sale_price.astype(int)
    })
    return df

def get_credit_fraud_dataset(n_samples: int = 5000, fraud_ratio: float = 0.017, random_state: int = 42) -> pd.DataFrame:
    """Kaggle Credit Card Fraud Detection benchmark (Imbalanced classification)."""
    np.random.seed(random_state)
    n_fraud = int(n_samples * fraud_ratio)
    n_legit = n_samples - n_fraud

    # Legit transactions (standard normal PCA features)
    legit_v = np.random.normal(0, 1.0, size=(n_legit, 8))
    legit_amount = np.clip(np.random.exponential(75, n_legit) + 2.0, 1.0, 5000.0)
    legit_labels = np.zeros(n_legit, dtype=int)

    # Fraud transactions (shifted anomaly centroids)
    fraud_v = np.random.normal(2.5, 1.8, size=(n_fraud, 8))
    fraud_amount = np.clip(np.random.exponential(250, n_fraud) + 20.0, 5.0, 8000.0)
    fraud_labels = np.ones(n_fraud, dtype=int)

    v_all = np.vstack([legit_v, fraud_v])
    amount_all = np.concatenate([legit_amount, fraud_amount])
    class_all = np.concatenate([legit_labels, fraud_labels])

    # Shuffle
    indices = np.arange(n_samples)
    np.random.shuffle(indices)

    df = pd.DataFrame({
        "V1": np.round(v_all[indices, 0], 4),
        "V2": np.round(v_all[indices, 1], 4),
        "V3": np.round(v_all[indices, 2], 4),
        "V4": np.round(v_all[indices, 3], 4),
        "V5": np.round(v_all[indices, 4], 4),
        "V6": np.round(v_all[indices, 5], 4),
        "V7": np.round(v_all[indices, 6], 4),
        "V8": np.round(v_all[indices, 7], 4),
        "Amount": np.round(amount_all[indices], 2),
        "Class": class_all[indices]
    })
    return df

def get_ecommerce_analytics_data() -> Dict[str, Any]:
    """Kaggle E-Commerce / SaaS Product Analytics benchmark suite."""
    # 1. Monthly User Retention Cohort Data (12 Cohorts over 6 periods)
    cohort_labels = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08"]
    cohort_sizes = [1250, 1420, 1380, 1650, 1820, 1950, 2100, 2250]
    decay_rates = [1.0, 0.48, 0.36, 0.29, 0.24, 0.21, 0.18, 0.16]

    cohort_matrix = []
    for idx, (month, size) in enumerate(zip(cohort_labels, cohort_sizes)):
        row = {"cohort": month, "cohort_size": size, "periods": []}
        max_periods = len(cohort_labels) - idx
        for p in range(max_periods):
            retention_pct = round(decay_rates[p] * 100.0 + np.random.uniform(-1.5, 1.5), 1)
            row["periods"].append(min(100.0, max(5.0, retention_pct)))
        cohort_matrix.append(row)

    # 2. Checkout Funnel Drop-off Waterfall
    funnel_stages = [
        {"stage": "1. Homepage Visit", "users": 100000, "conversion_pct": 100.0, "drop_rate": 0.0},
        {"stage": "2. Product Page View", "users": 52400, "conversion_pct": 52.4, "drop_rate": 47.6},
        {"stage": "3. Add to Cart", "users": 21800, "conversion_pct": 21.8, "drop_rate": 58.4},
        {"stage": "4. Initiate Checkout", "users": 11200, "conversion_pct": 11.2, "drop_rate": 48.6},
        {"stage": "5. Completed Purchase", "users": 5820, "conversion_pct": 5.82, "drop_rate": 48.0}
    ]

    # 3. A/B Testing Experiment (Checkout Redesign)
    ab_test = {
        "experiment_name": "One-Click Instant Checkout vs Multi-Step Cart",
        "control": {"visitors": 25420, "conversions": 1474, "rate_pct": 5.80},
        "treatment": {"visitors": 25510, "conversions": 1785, "rate_pct": 7.00},
        "absolute_lift_pct": 1.20,
        "relative_lift_pct": 20.69,
        "z_score": 5.72,
        "p_value": 0.00001,
        "is_statistically_significant": True,
        "confidence_level": 99.9
    }

    # 4. Daily Revenue Time-Series with Trend & Seasonality (60 Days)
    np.random.seed(42)
    days = 60
    base_trend = np.linspace(12000, 19500, days)
    weekly_seasonality = np.array([np.sin((d % 7) * (2 * np.pi / 7)) * 2500 for d in range(days)])
    noise = np.random.normal(0, 450, days)
    daily_revenue = np.round(base_trend + weekly_seasonality + noise, 2)

    time_series = [
        {"day": d + 1, "date": f"Day {d+1}", "actual_revenue": float(daily_revenue[d]), "trend": float(round(base_trend[d], 2))}
        for d in range(days)
    ]

    return {
        "cohort_matrix": cohort_matrix,
        "funnel_stages": funnel_stages,
        "ab_test": ab_test,
        "time_series": time_series
    }

def get_raw_dirty_dataset(n_samples: int = 500) -> pd.DataFrame:
    """Synthesizes dirty, anomalous data for Data Quality & Profiling demonstrations."""
    np.random.seed(42)
    ids = np.arange(1001, 1001 + n_samples)
    names = np.random.choice(["Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince", "Evan Wright", None], size=n_samples, p=[0.25, 0.25, 0.20, 0.15, 0.10, 0.05])
    ages = np.random.choice([25, 34, 45, 52, 28, -999, 210, np.nan], size=n_samples, p=[0.30, 0.25, 0.20, 0.15, 0.04, 0.02, 0.02, 0.02])
    emails = [f"user_{i}@domain.com" if np.random.rand() > 0.08 else "invalid-email-format" for i in range(n_samples)]
    revenues = np.random.choice([150.0, 320.0, 49.99, 1200.0, 99999.0, np.nan], size=n_samples, p=[0.40, 0.30, 0.20, 0.05, 0.02, 0.03])
    statuses = np.random.choice(["ACTIVE", "active", "Active", "PENDING", "cancelled", None], size=n_samples)

    df = pd.DataFrame({
        "customer_id": ids,
        "full_name": names,
        "age": ages,
        "email": emails,
        "lifetime_revenue": revenues,
        "account_status": statuses
    })
    # Add exact duplicate rows
    df = pd.concat([df, df.iloc[:15]], ignore_index=True)
    return df
