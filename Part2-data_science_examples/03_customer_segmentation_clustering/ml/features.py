# Customer Segmentation Feature Engineering & Transformation Pipeline

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, RobustScaler, PowerTransformer
from typing import List, Tuple

BASE_FEATURE_COLUMNS = [
    "Age",
    "Annual_Income_k",
    "Spending_Score",
    "Recency_Days",
    "Total_Spend_Annual",
    "Web_Visits_Month",
    "Discount_Sensitivity",
    "Family_Size"
]

ENGINEERED_FEATURE_COLUMNS = [
    "income_to_spend_ratio",
    "monetary_velocity",
    "digital_engagement",
    "deal_affinity"
]

ALL_FEATURE_COLUMNS = BASE_FEATURE_COLUMNS + ENGINEERED_FEATURE_COLUMNS

def engineer_clustering_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create domain-engineered behavioral features for customer segmentation."""
    df_out = df.copy()

    # 1. Income to Spend Ratio (Discretionary Budget Utilization)
    df_out["income_to_spend_ratio"] = df_out["Annual_Income_k"] / (df_out["Spending_Score"] + 1.0)

    # 2. Monetary Velocity (Annual Spend / Days Since Last Order)
    df_out["monetary_velocity"] = df_out["Total_Spend_Annual"] / (df_out["Recency_Days"] + 1.0)

    # 3. Digital Engagement Index (Web Visits scaled by Spend Affinity)
    df_out["digital_engagement"] = df_out["Web_Visits_Month"] * (df_out["Spending_Score"] / 100.0)

    # 4. Deal Sensitivity Affinity (Discount preference vs Low Spend Score)
    df_out["deal_affinity"] = df_out["Discount_Sensitivity"] * (1.0 - (df_out["Spending_Score"] / 100.0))

    return df_out[ALL_FEATURE_COLUMNS]

def scale_features(X_df: pd.DataFrame, scaler=None) -> Tuple[np.ndarray, StandardScaler]:
    """Standardize feature matrix for distance-based and density-based clustering."""
    if scaler is None:
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_df)
    else:
        X_scaled = scaler.transform(X_df)
    return X_scaled, scaler
