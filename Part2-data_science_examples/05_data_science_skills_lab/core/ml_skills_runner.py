# Executable Machine Learning & Data Science Skills Runner
# Implements production patterns from param087/agent-ml-skills and nimrodfisher/data-analytics-skills

import numpy as np
import pandas as pd
from typing import Dict, List, Any
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    confusion_matrix, roc_curve, precision_recall_curve, mean_squared_error,
    mean_absolute_error, r2_score
)
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from datasets import (
    get_titanic_dataset,
    get_house_prices_dataset,
    get_credit_fraud_dataset,
    get_ecommerce_analytics_data,
    get_raw_dirty_dataset
)

# -------------------------------------------------------------
# 1. Titanic Survival Classification Pipeline
# -------------------------------------------------------------
def run_titanic_pipeline() -> Dict[str, Any]:
    df = get_titanic_dataset(n_samples=891, random_state=42)

    X = df[["Pclass", "Sex", "Age", "SibSp", "Parch", "Fare", "Embarked", "FamilySize", "IsAlone"]]
    y = df["Survived"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    numeric_features = ["Age", "Fare", "SibSp", "Parch", "FamilySize"]
    categorical_features = ["Pclass", "Sex", "Embarked", "IsAlone"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )

    clf = GradientBoostingClassifier(n_estimators=100, max_depth=3, learning_rate=0.08, random_state=42)
    pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("classifier", clf)])

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    auc = float(roc_auc_score(y_test, y_prob))

    cm = confusion_matrix(y_test, y_pred).tolist()

    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_points = [{"fpr": round(float(f), 4), "tpr": round(float(t), 4)} for f, t in zip(fpr[::2], tpr[::2])]

    # Extract Feature Importances
    cat_names = pipeline.named_steps["preprocessor"].named_transformers_["cat"].get_feature_names_out(categorical_features).tolist()
    feature_names = numeric_features + cat_names
    importances = clf.feature_importances_.tolist()
    feat_imp = [
        {"feature": name, "importance": round(imp, 4), "percentage": round(imp * 100.0, 1)}
        for name, imp in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)[:8]
    ]

    # Clean NaN values in sample rows for valid JSON serialization
    sample_records = df.head(8).copy()
    sample_records["Age"] = sample_records["Age"].fillna("NaN (Missing)")
    
    return {
        "dataset_name": "Kaggle Titanic Disaster",
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc, 4)
        },
        "confusion_matrix": {
            "tn": cm[0][0], "fp": cm[0][1],
            "fn": cm[1][0], "tp": cm[1][1]
        },
        "roc_curve": roc_points,
        "feature_importance": feat_imp,
        "sample_rows": sample_records.to_dict(orient="records")
    }

# -------------------------------------------------------------
# 2. House Prices Regression Pipeline
# -------------------------------------------------------------
def run_house_prices_pipeline() -> Dict[str, Any]:
    df = get_house_prices_dataset(n_samples=1460, random_state=42)

    X = df[["GrLivArea", "OverallQual", "YearBuilt", "TotalBsmtSF", "GarageCars", "FullBath", "Neighborhood"]]
    y = df["SalePrice"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    numeric_features = ["GrLivArea", "OverallQual", "YearBuilt", "TotalBsmtSF", "GarageCars", "FullBath"]
    categorical_features = ["Neighborhood"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )

    reg = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("regressor", reg)])

    pipeline.fit(X_train, np.log1p(y_train))
    y_pred_log = pipeline.predict(X_test)
    y_pred = np.expm1(y_pred_log)

    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    scatter_samples = []
    for actual, pred in zip(y_test.values[:60], y_pred[:60]):
        scatter_samples.append({
            "actual": int(actual),
            "predicted": int(pred),
            "residual": int(pred - actual)
        })

    return {
        "dataset_name": "Kaggle House Prices: Advanced Regression",
        "total_samples": len(df),
        "metrics": {
            "rmse": round(rmse, 2),
            "mae": round(mae, 2),
            "r2_score": round(r2, 4),
            "target_transform": "log1p(SalePrice)"
        },
        "scatter_samples": scatter_samples,
        "sample_rows": df.head(8).to_dict(orient="records")
    }

# -------------------------------------------------------------
# 3. Credit Card Fraud Imbalanced Pipeline
# -------------------------------------------------------------
def run_fraud_detection_pipeline() -> Dict[str, Any]:
    df = get_credit_fraud_dataset(n_samples=5000, fraud_ratio=0.017, random_state=42)

    X = df.drop(columns=["Class"])
    y = df["Class"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.30, random_state=42, stratify=y)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 1. Baseline Model (Standard Weights)
    base_clf = LogisticRegression(random_state=42)
    base_clf.fit(X_train_scaled, y_train)
    base_pred = base_clf.predict(X_test_scaled)
    base_prob = base_clf.predict_proba(X_test_scaled)[:, 1]

    # 2. Balanced Model (Class-Weighted Cost Matrix)
    weighted_clf = LogisticRegression(class_weight="balanced", random_state=42)
    weighted_clf.fit(X_train_scaled, y_train)
    weighted_pred = weighted_clf.predict(X_test_scaled)
    weighted_prob = weighted_clf.predict_proba(X_test_scaled)[:, 1]

    # Precision-Recall Curve on Weighted Model
    prec_pts, rec_pts, thresholds = precision_recall_curve(y_test, weighted_prob)
    pr_points = [
        {"recall": round(float(r), 4), "precision": round(float(p), 4)}
        for r, p in zip(rec_pts[::3], prec_pts[::3])
    ]

    # Threshold Optimization for F1
    best_thresh = 0.5
    best_f1 = 0.0
    for t in np.linspace(0.1, 0.9, 30):
        t_pred = (weighted_prob >= t).astype(int)
        score = f1_score(y_test, t_pred, zero_division=0)
        if score > best_f1:
            best_f1 = score
            best_thresh = t

    return {
        "dataset_name": "Kaggle Credit Card Fraud Detection",
        "total_samples": len(df),
        "fraud_ratio_pct": 1.7,
        "baseline_model": {
            "name": "Standard Unweighted Logistic Regression",
            "accuracy": round(float(accuracy_score(y_test, base_pred)), 4),
            "precision": round(float(precision_score(y_test, base_pred, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, base_pred)), 4),
            "f1_score": round(float(f1_score(y_test, base_pred)), 4)
        },
        "balanced_model": {
            "name": "Class-Weighted Cost Matrix Balanced Model",
            "accuracy": round(float(accuracy_score(y_test, weighted_pred)), 4),
            "precision": round(float(precision_score(y_test, weighted_pred)), 4),
            "recall": round(float(recall_score(y_test, weighted_pred)), 4),
            "f1_score": round(float(f1_score(y_test, weighted_pred)), 4)
        },
        "optimal_threshold": {
            "threshold": round(float(best_thresh), 2),
            "max_f1_score": round(float(best_f1), 4)
        },
        "pr_curve": pr_points
    }

# -------------------------------------------------------------
# 4. Programmatic Data Quality Audit
# -------------------------------------------------------------
def run_data_quality_audit() -> Dict[str, Any]:
    df = get_raw_dirty_dataset(n_samples=500)

    total_cells = df.size
    null_cells = int(df.isnull().sum().sum())
    completeness_score = round((1.0 - (null_cells / total_cells)) * 100.0, 1)

    column_audits = []
    for col in df.columns:
        null_count = int(df[col].isnull().sum())
        null_pct = round((null_count / len(df)) * 100.0, 1)
        dtype = str(df[col].dtype)
        unique_vals = int(df[col].nunique())

        issues = []
        if null_pct > 0:
            issues.append(f"{null_pct}% missing values")
        if col == "age" and (df[col] < 0).any():
            issues.append(f"{int((df[col] < 0).sum())} negative age violations")
        if col == "email" and (df[col] == "invalid-email-format").any():
            issues.append("Malformed email formatting detected")

        column_audits.append({
            "column_name": col,
            "inferred_type": dtype,
            "unique_values": unique_vals,
            "null_count": null_count,
            "null_pct": null_pct,
            "health_status": "CRITICAL" if len(issues) > 1 else "WARNING" if issues else "PASS",
            "issues": issues
        })

    duplicate_rows = int(df.duplicated().sum())
    data_quality_score = max(0.0, round(completeness_score - (duplicate_rows * 0.5), 1))

    return {
        "dataset_name": "Kaggle Raw Production Transaction Stream",
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "data_quality_score": data_quality_score,
        "completeness_pct": completeness_score,
        "duplicate_rows": duplicate_rows,
        "columns": column_audits
    }

if __name__ == '__main__':
    t_res = run_titanic_pipeline()
    print("Titanic Pipeline AUC:", t_res["metrics"]["roc_auc"])
    h_res = run_house_prices_pipeline()
    print("House Prices R2:", h_res["metrics"]["r2_score"])
    f_res = run_fraud_detection_pipeline()
    print("Fraud Balanced Recall:", f_res["balanced_model"]["recall"])
    q_res = run_data_quality_audit()
    print("Data Quality Score:", q_res["data_quality_score"])
