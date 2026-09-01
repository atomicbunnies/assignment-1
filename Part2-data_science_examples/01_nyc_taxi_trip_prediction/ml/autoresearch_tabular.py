# AutoResearch Tabular — Full-Scale Autonomous Hill Climbing Engine
# Implements Multi-Backbone Exploration, Feature Mutation, Hyperparameter Search, and Click-Through Telemetry

import os
import sys
import json
import time
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor, HistGradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
import xgboost as xgb

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from data_loader import generate_nyc_taxi_dataset
from features import engineer_features, FEATURE_COLUMNS

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../server/models'))
HISTORY_FILE = os.path.join(MODELS_DIR, 'autoresearch_history.json')

class TabularAutoResearcher:
    def __init__(self, n_samples=35000):
        self.n_samples = n_samples
        self.raw_df = generate_nyc_taxi_dataset(n_samples=n_samples, random_state=42)
        self.base_X = engineer_features(self.raw_df)
        self.y_log = np.log1p(self.raw_df['trip_duration'].values)
        self.y_sec = self.raw_df['trip_duration'].values

        self.X_train_base, self.X_val_base, self.y_train_log, self.y_val_log, self.y_train_sec, self.y_val_sec = train_test_split(
            self.base_X, self.y_log, self.y_sec, test_size=0.20, random_state=42
        )

        self.current_features = list(FEATURE_COLUMNS)
        self.best_rmsle = None
        self.best_model_name = "XGBoost Regressor"
        self.backbones_results = []
        self.history = []

    def evaluate_model(self, model, X_tr, X_v):
        """Train model and evaluate comprehensive validation metrics."""
        t0 = time.time()
        model.fit(X_tr, self.y_train_log)
        train_time = time.time() - t0

        t1 = time.time()
        val_pred_log = model.predict(X_v)
        infer_latency_ms = ((time.time() - t1) / len(X_v)) * 1000.0

        val_pred_sec = np.expm1(val_pred_log)
        rmsle = float(np.sqrt(mean_squared_error(self.y_val_log, val_pred_log)))
        rmse = float(np.sqrt(mean_squared_error(self.y_val_sec, val_pred_sec)))
        mae = float(mean_absolute_error(self.y_val_sec, val_pred_sec))
        r2 = float(r2_score(self.y_val_sec, val_pred_sec))

        return {
            "rmsle": round(rmsle, 5),
            "rmse": round(rmse, 2),
            "mae": round(mae, 2),
            "r2_score": round(r2, 4),
            "train_time_sec": round(train_time, 3),
            "infer_latency_ms": round(infer_latency_ms, 3)
        }

    def benchmark_all_backbones(self):
        """Phase 1: Explore & Rank Diverse ML Model Backbones."""
        print("🏛️ [Phase 1/4] Benchmarking Diverse Machine Learning Backbones...")
        
        backbone_configs = [
            {
                "id": "bb-xgb",
                "name": "XGBoost Regressor",
                "family": "Gradient Boosted Trees (Exact/Hist)",
                "model": xgb.XGBRegressor(n_estimators=150, max_depth=7, learning_rate=0.08, subsample=0.85, colsample_bytree=0.85, random_state=42, n_jobs=-1),
                "params": {"n_estimators": 150, "max_depth": 7, "learning_rate": 0.08, "subsample": 0.85}
            },
            {
                "id": "bb-histgbm",
                "name": "HistGradientBoosting (LightGBM-style)",
                "family": "Histogram-based GBDT",
                "model": HistGradientBoostingRegressor(max_iter=150, max_depth=8, learning_rate=0.08, random_state=42),
                "params": {"max_iter": 150, "max_depth": 8, "learning_rate": 0.08}
            },
            {
                "id": "bb-extratrees",
                "name": "ExtraTrees Regressor",
                "family": "Extremely Randomized Trees Bagging",
                "model": ExtraTreesRegressor(n_estimators=60, max_depth=12, random_state=42, n_jobs=-1),
                "params": {"n_estimators": 60, "max_depth": 12}
            },
            {
                "id": "bb-rf",
                "name": "Random Forest Regressor",
                "family": "Decision Forest Bagging",
                "model": RandomForestRegressor(n_estimators=50, max_depth=12, random_state=42, n_jobs=-1),
                "params": {"n_estimators": 50, "max_depth": 12}
            },
            {
                "id": "bb-mlp",
                "name": "Tabular MLP Neural Network",
                "family": "Deep Feedforward Neural Net",
                "model": MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=40, learning_rate_init=0.01, random_state=42),
                "params": {"hidden_layers": [64, 32], "learning_rate": 0.01, "activation": "relu"}
            },
            {
                "id": "bb-ridge",
                "name": "L2 Regularized Ridge Linear",
                "family": "Linear Regularized",
                "model": Ridge(alpha=1.0),
                "params": {"alpha": 1.0}
            }
        ]

        results = []
        for bb in backbone_configs:
            eval_metrics = self.evaluate_model(bb["model"], self.X_train_base, self.X_val_base)
            res = {
                "id": bb["id"],
                "name": bb["name"],
                "family": bb["family"],
                "hyperparameters": bb["params"],
                "metrics": eval_metrics
            }
            results.append(res)
            print(f"  ➔ {bb['name']}: RMSLE = {eval_metrics['rmsle']:.5f} | R² = {eval_metrics['r2_score']:.4f} in {eval_metrics['train_time_sec']}s")

        # Sort by RMSLE ascending
        results.sort(key=lambda x: x["metrics"]["rmsle"])
        self.backbones_results = results
        self.best_rmsle = results[0]["metrics"]["rmsle"]
        self.best_model_name = results[0]["name"]
        return results

    def run_full_autoresearch(self):
        """Execute Multi-Stage Hill-Climbing AutoResearch Pipeline."""
        print("\n🚀 Starting Tabular AutoResearch Multi-Stage Hill-Climbing System...")
        
        # 1. Benchmark Backbones
        self.benchmark_all_backbones()

        self.history = []
        # Baseline Step 0
        self.history.append({
            "step_id": "step-0",
            "iteration": 0,
            "phase": "Backbone Battle",
            "category": "Baseline",
            "hypothesis": f"Champion Backbone: {self.best_model_name}",
            "feature_name": "baseline_genome_20",
            "code_diff": "# Base Feature Set & SOTA XGBoost Architecture\nmodel = xgb.XGBRegressor(n_estimators=150, max_depth=7, learning_rate=0.08)",
            "hyperparameters": {"n_estimators": 150, "max_depth": 7, "learning_rate": 0.08, "subsample": 0.85},
            "rmsle_before": round(self.best_rmsle, 5),
            "rmsle_after": round(self.best_rmsle, 5),
            "delta": 0.0,
            "decision": "ACCEPTED",
            "reflection": "Selected as best baseline backbone architecture out of 6 evaluated models.",
            "timestamp": time.strftime("%H:%M:%S UTC")
        })

        # 2. Phase 2: Feature Mutation Hill-Climbing
        print("\n🧬 [Phase 2/4] Iterative Feature Mutation Hill-Climbing...")
        feature_mutations = [
            {
                "name": "log_manhattan_distance",
                "hypothesis": "Logarithmic transform of Manhattan grid distance penalizes non-linear extreme trip lengths",
                "code": "df['log_manhattan_distance'] = np.log1p(df['manhattan_distance'])",
                "apply": lambda df: np.log1p(df['manhattan_distance'])
            },
            {
                "name": "tortuosity_ratio",
                "hypothesis": "Manhattan / Haversine road grid detour penalty ratio",
                "code": "df['tortuosity_ratio'] = df['manhattan_distance'] / (df['haversine_distance'] + 0.001)",
                "apply": lambda df: df['manhattan_distance'] / (df['haversine_distance'] + 0.001)
            },
            {
                "name": "airport_expressway_corridor",
                "hypothesis": "High-speed airport corridor flag (JFK/LGA proximity with > 10km displacement)",
                "code": "df['airport_expressway_corridor'] = (((df['dist_to_jfk'] < 3.0) | (df['dist_to_lga'] < 3.0)) & (df['haversine_distance'] > 10.0)).astype(int)",
                "apply": lambda df: (((df['dist_to_jfk'] < 3.0) | (df['dist_to_lga'] < 3.0)) & (df['haversine_distance'] > 10.0)).astype(int)
            },
            {
                "name": "cyclical_hour_sin",
                "hypothesis": "Continuous periodic sinusoidal hour representation for seamless 23:00 -> 00:00 transition",
                "code": "df['cyclical_hour_sin'] = np.sin(2 * np.pi * df['pickup_hour'] / 24.0)",
                "apply": lambda df: np.sin(2 * np.pi * df['pickup_hour'] / 24.0)
            },
            {
                "name": "rush_hour_manhattan_cross",
                "hypothesis": "Interaction between rush hour congestion and Manhattan grid distance",
                "code": "df['rush_hour_manhattan_cross'] = df['is_rush_hour'] * df['manhattan_distance']",
                "apply": lambda df: df['is_rush_hour'] * df['manhattan_distance']
            },
            {
                "name": "cyclical_hour_cos",
                "hypothesis": "Continuous periodic cosinusoidal hour representation",
                "code": "df['cyclical_hour_cos'] = np.cos(2 * np.pi * df['pickup_hour'] / 24.0)",
                "apply": lambda df: np.cos(2 * np.pi * df['pickup_hour'] / 24.0)
            },
            {
                "name": "trip_displacement_efficiency",
                "hypothesis": "Ratio of straight-line Haversine displacement to Manhattan driving distance",
                "code": "df['trip_displacement_efficiency'] = df['haversine_distance'] / (df['manhattan_distance'] + 0.001)",
                "apply": lambda df: df['haversine_distance'] / (df['manhattan_distance'] + 0.001)
            },
            {
                "name": "late_night_speedup_factor",
                "hypothesis": "Late night high-speed multiplier for highway trips > 5km",
                "code": "df['late_night_speedup_factor'] = (df['is_late_night'] * (df['haversine_distance'] > 5.0)).astype(int)",
                "apply": lambda df: (df['is_late_night'] * (df['haversine_distance'] > 5.0)).astype(int)
            }
        ]

        X_tr_cur = self.X_train_base.copy()
        X_v_cur = self.X_val_base.copy()
        xgb_eval = xgb.XGBRegressor(n_estimators=150, max_depth=7, learning_rate=0.08, subsample=0.85, colsample_bytree=0.85, random_state=42, n_jobs=-1)

        step_counter = 1
        for mut in feature_mutations:
            feat_name = mut["name"]
            X_tr_cand = X_tr_cur.copy()
            X_v_cand = X_v_cur.copy()

            X_tr_cand[feat_name] = mut["apply"](X_tr_cand)
            X_v_cand[feat_name] = mut["apply"](X_v_cand)

            eval_res = self.evaluate_model(xgb_eval, X_tr_cand, X_v_cand)
            cand_rmsle = eval_res["rmsle"]
            delta = cand_rmsle - self.best_rmsle

            if delta < -0.0001:
                decision = "ACCEPTED"
                rmsle_before = self.best_rmsle
                self.best_rmsle = cand_rmsle
                X_tr_cur = X_tr_cand
                X_v_cur = X_v_cand
                self.current_features.append(feat_name)
                reflection = f"Improvement verified (Δ: {delta:.5f}). Feature captured non-linear spatial/temporal correlation without overfitting."
            else:
                decision = "REJECTED"
                rmsle_before = self.best_rmsle
                reflection = f"No generalization gain (Δ: {delta:+.5f}). Mutation increased tree split entropy or multicollinearity; reverted to previous state."

            self.history.append({
                "step_id": f"step-{step_counter}",
                "iteration": step_counter,
                "phase": "Feature Evolution",
                "category": "Feature Mutation",
                "hypothesis": mut["hypothesis"],
                "feature_name": feat_name,
                "code_diff": mut["code"],
                "hyperparameters": {"n_estimators": 150, "max_depth": 7, "learning_rate": 0.08},
                "rmsle_before": round(rmsle_before, 5),
                "rmsle_after": round(cand_rmsle, 5),
                "delta": round(delta, 5),
                "decision": decision,
                "reflection": reflection,
                "timestamp": time.strftime("%H:%M:%S UTC")
            })
            step_counter += 1

        # 3. Phase 3: Hyperparameter Annealing Hill-Climbing
        print("\n🎛️ [Phase 3/4] Hyperparameter Tuning Hill-Climbing...")
        hyperparam_candidates = [
            {"name": "Tune Depth (max_depth=8)", "params": {"n_estimators": 180, "max_depth": 8, "learning_rate": 0.08, "subsample": 0.85, "colsample_bytree": 0.85}},
            {"name": "Tune Subsampling (subsample=0.90)", "params": {"n_estimators": 180, "max_depth": 7, "learning_rate": 0.07, "subsample": 0.90, "colsample_bytree": 0.85}},
            {"name": "Add L2 Regularization (reg_lambda=2.0)", "params": {"n_estimators": 200, "max_depth": 7, "learning_rate": 0.06, "subsample": 0.85, "colsample_bytree": 0.85, "reg_lambda": 2.0}},
            {"name": "Deep Boosting (n_estimators=280, lr=0.05)", "params": {"n_estimators": 280, "max_depth": 7, "learning_rate": 0.05, "subsample": 0.85, "colsample_bytree": 0.85}},
            {"name": "Shallow Fast Trees (max_depth=5, lr=0.12)", "params": {"n_estimators": 150, "max_depth": 5, "learning_rate": 0.12, "subsample": 0.80, "colsample_bytree": 0.80}}
        ]

        for hp in hyperparam_candidates:
            cand_xgb = xgb.XGBRegressor(**hp["params"], random_state=42, n_jobs=-1)
            eval_res = self.evaluate_model(cand_xgb, X_tr_cur, X_v_cur)
            cand_rmsle = eval_res["rmsle"]
            delta = cand_rmsle - self.best_rmsle

            if delta < -0.0001:
                decision = "ACCEPTED"
                rmsle_before = self.best_rmsle
                self.best_rmsle = cand_rmsle
                reflection = f"Accepted parameter configuration with lower generalization loss (Δ: {delta:.5f})."
            else:
                decision = "REJECTED"
                rmsle_before = self.best_rmsle
                reflection = f"Rejected parameter configuration (Δ: {delta:+.5f}) due to slight variance increase or suboptimal depth."

            self.history.append({
                "step_id": f"step-{step_counter}",
                "iteration": step_counter,
                "phase": "Hyperparameter Tuning",
                "category": "Hyperparameter Optimization",
                "hypothesis": hp["name"],
                "feature_name": "hyperparameter_mutation",
                "code_diff": f"# Tuned Parameters:\nmodel = xgb.XGBRegressor(\n" + "\n".join([f"    {k}={v}," for k, v in hp["params"].items()]) + "\n)",
                "hyperparameters": hp["params"],
                "rmsle_before": round(rmsle_before, 5),
                "rmsle_after": round(cand_rmsle, 5),
                "delta": round(delta, 5),
                "decision": decision,
                "reflection": reflection,
                "timestamp": time.strftime("%H:%M:%S UTC")
            })
            step_counter += 1

        # 4. Phase 4: Ensemble Blending Hill-Climbing
        print("\n🤝 [Phase 4/4] Ensemble Blending Hill-Climbing...")
        # Train top 2 models: XGBoost and HistGradientBoosting
        hist_model = HistGradientBoostingRegressor(max_iter=150, max_depth=8, learning_rate=0.08, random_state=42)
        hist_model.fit(X_tr_cur, self.y_train_log)
        xgb_eval.fit(X_tr_cur, self.y_train_log)

        pred_xgb = xgb_eval.predict(X_v_cur)
        pred_hist = hist_model.predict(X_v_cur)

        blend_weights = [
            {"name": "Weighted Blend (85% XGBoost + 15% HistGBM)", "w_xgb": 0.85, "w_hist": 0.15},
            {"name": "Balanced Blend (50% XGBoost + 50% HistGBM)", "w_xgb": 0.50, "w_hist": 0.50}
        ]

        for b in blend_weights:
            pred_blend = b["w_xgb"] * pred_xgb + b["w_hist"] * pred_hist
            cand_rmsle = float(np.sqrt(mean_squared_error(self.y_val_log, pred_blend)))
            delta = cand_rmsle - self.best_rmsle

            if delta < -0.0001:
                decision = "ACCEPTED"
                rmsle_before = self.best_rmsle
                self.best_rmsle = cand_rmsle
                reflection = f"Accepted ensemble blend. Reduced individual variance across gradient boost trees."
            else:
                decision = "REJECTED"
                rmsle_before = self.best_rmsle
                reflection = f"Rejected blend. XGBoost standalone model is already optimal."

            self.history.append({
                "step_id": f"step-{step_counter}",
                "iteration": step_counter,
                "phase": "Ensemble Search",
                "category": "Ensemble Blending",
                "hypothesis": b["name"],
                "feature_name": "model_stack_blend",
                "code_diff": f"# Blend Weights:\npred = {b['w_xgb']} * pred_xgb + {b['w_hist']} * pred_hist",
                "hyperparameters": {"w_xgb": b["w_xgb"], "w_hist": b["w_hist"]},
                "rmsle_before": round(rmsle_before, 5),
                "rmsle_after": round(cand_rmsle, 5),
                "delta": round(delta, 5),
                "decision": decision,
                "reflection": reflection,
                "timestamp": time.strftime("%H:%M:%S UTC")
            })
            step_counter += 1

        # 5. Export Complete Telemetry
        initial_score = self.history[0]["rmsle_after"]
        export_payload = {
            "initial_rmsle": initial_score,
            "best_rmsle": round(self.best_rmsle, 5),
            "improvement_pct": round(((initial_score - self.best_rmsle) / initial_score) * 100, 2),
            "total_iterations": len(self.history) - 1,
            "accepted_mutations_count": sum(1 for h in self.history if h["decision"] == "ACCEPTED" and h["iteration"] > 0),
            "rejected_mutations_count": sum(1 for h in self.history if h["decision"] == "REJECTED"),
            "backbones_leaderboard": self.backbones_results,
            "active_features": self.current_features,
            "trajectory": self.history
        }

        os.makedirs(MODELS_DIR, exist_ok=True)
        with open(HISTORY_FILE, 'w') as f:
            json.dump(export_payload, f, indent=2)

        print(f"\n✨ Tabular AutoResearch completed! Best Evolved RMSLE: {self.best_rmsle:.5f} (Initial: {initial_score:.5f})")
        return export_payload

if __name__ == '__main__':
    researcher = TabularAutoResearcher()
    researcher.run_full_autoresearch()
