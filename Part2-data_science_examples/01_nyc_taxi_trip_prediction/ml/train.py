# SOTA Machine Learning Training Pipeline for NYC Taxi Trip Duration

import os
import sys
import json
import time
import numpy as np
import pandas as pd

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb

from data_loader import generate_nyc_taxi_dataset
from features import engineer_features, FEATURE_COLUMNS

def train_pipeline(n_samples: int = 40000, xgb_params: dict = None, export_dir: str = '../server/models'):
    print(f"🚀 Initializing NYC Taxi ML Training Pipeline ({n_samples} samples)...")
    start_time = time.time()

    # 1. Generate & Clean Data
    raw_df = generate_nyc_taxi_dataset(n_samples=n_samples, random_state=42)
    print(f"📊 Dataset prepared: {len(raw_df)} valid trips after outlier filtration.")

    # 2. Feature Engineering
    X = engineer_features(raw_df)
    y_seconds = raw_df['trip_duration'].values
    y_log = np.log1p(y_seconds)  # Kaggle Competition Standard: Log-transformed target

    X_train, X_val, y_train_log, y_val_log, y_train_sec, y_val_sec = train_test_split(
        X, y_log, y_seconds, test_size=0.20, random_state=42
    )

    print(f"🧪 Training set: {len(X_train)} samples | Validation set: {len(X_val)} samples")
    print(f"📐 Features ({len(FEATURE_COLUMNS)}): {', '.join(FEATURE_COLUMNS)}")

    experiments = []

    # Model 1: Baseline Ridge Regression
    print("\n[1/3] Benchmarking Baseline: Ridge Regression...")
    t0 = time.time()
    ridge = Ridge(alpha=1.0)
    ridge.fit(X_train, y_train_log)
    ridge_time = time.time() - t0

    ridge_val_pred_log = ridge.predict(X_val)
    ridge_val_pred_sec = np.expm1(ridge_val_pred_log)
    ridge_rmsle = float(np.sqrt(mean_squared_error(y_val_log, ridge_val_pred_log)))
    ridge_rmse = float(np.sqrt(mean_squared_error(y_val_sec, ridge_val_pred_sec)))
    ridge_mae = float(mean_absolute_error(y_val_sec, ridge_val_pred_sec))
    ridge_r2 = float(r2_score(y_val_sec, ridge_val_pred_sec))

    experiments.append({
        "model_id": "model-ridge",
        "name": "Baseline Ridge Regression",
        "algorithm": "Linear / L2 Regularized",
        "hyperparameters": {"alpha": 1.0},
        "rmsle": round(ridge_rmsle, 4),
        "rmse": round(ridge_rmse, 2),
        "mae": round(ridge_mae, 2),
        "r2_score": round(ridge_r2, 4),
        "training_time_sec": round(ridge_time, 2)
    })
    print(f"  ➔ Ridge RMSLE: {ridge_rmsle:.4f} | R²: {ridge_r2:.4f} in {ridge_time:.2f}s")

    # Model 2: Random Forest Regressor
    print("\n[2/3] Benchmarking: Random Forest Regressor (50 trees)...")
    t0 = time.time()
    rf = RandomForestRegressor(n_estimators=40, max_depth=12, n_jobs=-1, random_state=42)
    rf.fit(X_train, y_train_log)
    rf_time = time.time() - t0

    rf_val_pred_log = rf.predict(X_val)
    rf_val_pred_sec = np.expm1(rf_val_pred_log)
    rf_rmsle = float(np.sqrt(mean_squared_error(y_val_log, rf_val_pred_log)))
    rf_rmse = float(np.sqrt(mean_squared_error(y_val_sec, rf_val_pred_sec)))
    rf_mae = float(mean_absolute_error(y_val_sec, rf_val_pred_sec))
    rf_r2 = float(r2_score(y_val_sec, rf_val_pred_sec))

    experiments.append({
        "model_id": "model-rf",
        "name": "Random Forest Ensemble",
        "algorithm": "Decision Trees Bagging",
        "hyperparameters": {"n_estimators": 40, "max_depth": 12},
        "rmsle": round(rf_rmsle, 4),
        "rmse": round(rf_rmse, 2),
        "mae": round(rf_mae, 2),
        "r2_score": round(rf_r2, 4),
        "training_time_sec": round(rf_time, 2)
    })
    print(f"  ➔ RF RMSLE: {rf_rmsle:.4f} | R²: {rf_r2:.4f} in {rf_time:.2f}s")

    # Model 3: SOTA XGBoost Regressor
    print("\n[3/3] Training State-of-the-Art: Tuned XGBoost Regressor...")
    default_xgb_params = {
        'n_estimators': 250,
        'max_depth': 7,
        'learning_rate': 0.08,
        'subsample': 0.85,
        'colsample_bytree': 0.85,
        'random_state': 42,
        'n_jobs': -1
    }
    if xgb_params:
        default_xgb_params.update(xgb_params)

    t0 = time.time()
    xgb_model = xgb.XGBRegressor(
        **default_xgb_params,
        eval_metric='rmse',
        early_stopping_rounds=25
    )

    eval_set = [(X_train, y_train_log), (X_val, y_val_log)]
    xgb_model.fit(
        X_train, y_train_log,
        eval_set=eval_set,
        verbose=False
    )
    xgb_time = time.time() - t0

    xgb_val_pred_log = xgb_model.predict(X_val)
    xgb_val_pred_sec = np.expm1(xgb_val_pred_log)
    xgb_rmsle = float(np.sqrt(mean_squared_error(y_val_log, xgb_val_pred_log)))
    xgb_rmse = float(np.sqrt(mean_squared_error(y_val_sec, xgb_val_pred_sec)))
    xgb_mae = float(mean_absolute_error(y_val_sec, xgb_val_pred_sec))
    xgb_r2 = float(r2_score(y_val_sec, xgb_val_pred_sec))

    experiments.append({
        "model_id": "model-xgb-sota",
        "name": "State-of-the-Art XGBoost (Production)",
        "algorithm": "Gradient Boosted Decision Trees",
        "hyperparameters": default_xgb_params,
        "rmsle": round(xgb_rmsle, 4),
        "rmse": round(xgb_rmse, 2),
        "mae": round(xgb_mae, 2),
        "r2_score": round(xgb_r2, 4),
        "training_time_sec": round(xgb_time, 2),
        "is_active": True
    })
    print(f"  ➔ SOTA XGBoost RMSLE: {xgb_rmsle:.4f} | R²: {xgb_r2:.4f} in {xgb_time:.2f}s")

    # 4. Learning Curves & Iteration Telemetry
    evals_result = xgb_model.evals_result()
    train_loss = evals_result['validation_0']['rmse']
    val_loss = evals_result['validation_1']['rmse']

    # Downsample curve points for smooth charting (approx 30 points)
    step = max(1, len(train_loss) // 30)
    learning_curves = [
        {"iteration": i + 1, "train_loss": round(train_loss[i], 4), "val_loss": round(val_loss[i], 4)}
        for i in range(0, len(train_loss), step)
    ]

    # 5. Feature Importance Extraction
    importances = xgb_model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    feature_importance_list = [
        {
            "feature": FEATURE_COLUMNS[i],
            "importance": round(float(importances[i]), 4),
            "percentage": round(float(importances[i] * 100), 1)
        }
        for i in sorted_idx
    ]

    # 6. Residual Analysis
    residuals_sec = y_val_sec - xgb_val_pred_sec
    sample_indices = np.random.choice(len(y_val_sec), size=min(400, len(y_val_sec)), replace=False)
    residual_scatter = [
        {
            "actual_min": round(float(y_val_sec[i]) / 60.0, 1),
            "predicted_min": round(float(xgb_val_pred_sec[i]) / 60.0, 1),
            "error_min": round(float(residuals_sec[i]) / 60.0, 1)
        }
        for i in sample_indices
    ]

    # Error Histogram Buckets
    hist_counts, bin_edges = np.histogram(residuals_sec / 60.0, bins=15, range=(-15, 15))
    error_histogram = [
        {
            "bin": f"{bin_edges[i]:.0f} to {bin_edges[i+1]:.0f}m",
            "count": int(hist_counts[i])
        }
        for i in range(len(hist_counts))
    ]

    # 7. Dataset Statistics for Explorer
    durations_min = raw_df['trip_duration'].values / 60.0
    dur_counts, dur_edges = np.histogram(durations_min, bins=12, range=(1, 60))
    duration_distribution = [
        {"bin": f"{dur_edges[i]:.0f}-{dur_edges[i+1]:.0f}m", "count": int(dur_counts[i])}
        for i in range(len(dur_counts))
    ]

    hourly_pickups = raw_df['pickup_datetime'].dt.hour.value_counts().sort_index()
    hourly_distribution = [
        {"hour": f"{h:02d}:00", "count": int(hourly_pickups.get(h, 0))}
        for h in range(24)
    ]

    # 8. Export Model Artifacts
    os.makedirs(export_dir, exist_ok=True)
    model_path = os.path.join(export_dir, 'xgboost_model.json')
    xgb_model.save_model(model_path)
    print(f"\n💾 Model serialized to: {model_path}")

    metadata = {
        "model_name": "NYC Taxi SOTA Trip Duration Estimator",
        "version": "1.0.0",
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "total_training_samples": len(raw_df),
        "feature_count": len(FEATURE_COLUMNS),
        "best_model": "XGBoost Regressor",
        "metrics": {
            "rmsle": round(xgb_rmsle, 4),
            "rmse_seconds": round(xgb_rmse, 2),
            "mae_seconds": round(xgb_mae, 2),
            "mae_minutes": round(xgb_mae / 60.0, 2),
            "r2_score": round(xgb_r2, 4)
        },
        "hyperparameters": default_xgb_params,
        "feature_columns": FEATURE_COLUMNS,
        "feature_importance": feature_importance_list
    }

    with open(os.path.join(export_dir, 'metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)

    with open(os.path.join(export_dir, 'experiments.json'), 'w') as f:
        json.dump(experiments, f, indent=2)

    with open(os.path.join(export_dir, 'residuals.json'), 'w') as f:
        json.dump({
            "learning_curves": learning_curves,
            "residual_scatter": residual_scatter,
            "error_histogram": error_histogram,
            "duration_distribution": duration_distribution,
            "hourly_distribution": hourly_distribution
        }, f, indent=2)

    total_time = time.time() - start_time
    print(f"✨ ML Pipeline finished successfully in {total_time:.2f}s!")
    return metadata

if __name__ == '__main__':
    train_pipeline()
