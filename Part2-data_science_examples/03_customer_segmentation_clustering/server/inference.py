# Real-Time Customer Segmentation & Persona Recommendation Inference Engine

import os
import sys
import json
import pickle
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ml')))
from features import engineer_clustering_features

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))

class CustomerSegmentationEngine:
    def __init__(self, models_dir: str = MODELS_DIR):
        self.models_dir = models_dir
        self.kmeans_model = None
        self.scaler = None
        self.feature_columns = None
        self.pca_model = None
        self.cluster_profiles = {}
        self.benchmarks = {}
        self.elbow_curve = []
        self.scatter_points = []
        self.label_map = {}
        self.load()

    def load(self):
        # 1. Load KMeans & Scaler
        km_path = os.path.join(self.models_dir, 'kmeans_model.pkl')
        if os.path.exists(km_path):
            with open(km_path, 'rb') as f:
                km_data = pickle.load(f)
                self.kmeans_model = km_data["model"]
                self.scaler = km_data["scaler"]
                self.feature_columns = km_data["feature_columns"]
                self.label_map = km_data.get("label_map", {})
                print(f"[OK] Loaded KMeans Model ({self.kmeans_model.n_clusters} clusters)", flush=True)

        # 2. Load PCA
        pca_path = os.path.join(self.models_dir, 'pca_model.pkl')
        if os.path.exists(pca_path):
            with open(pca_path, 'rb') as f:
                pca_data = pickle.load(f)
                self.pca_model = pca_data["pca"]
                print(f"[OK] Loaded PCA Model", flush=True)

        # 3. Load Metadata JSONs
        profiles_path = os.path.join(self.models_dir, 'cluster_profiles.json')
        if os.path.exists(profiles_path):
            with open(profiles_path, 'r', encoding='utf-8') as f:
                self.cluster_profiles = json.load(f)

        benchmarks_path = os.path.join(self.models_dir, 'benchmarks.json')
        if os.path.exists(benchmarks_path):
            with open(benchmarks_path, 'r', encoding='utf-8') as f:
                self.benchmarks = json.load(f)

        elbow_path = os.path.join(self.models_dir, 'elbow_curve.json')
        if os.path.exists(elbow_path):
            with open(elbow_path, 'r', encoding='utf-8') as f:
                self.elbow_curve = json.load(f)

        scatter_path = os.path.join(self.models_dir, 'sample_scatter_points.json')
        if os.path.exists(scatter_path):
            with open(scatter_path, 'r', encoding='utf-8') as f:
                self.scatter_points = json.load(f)

    def predict_single(self, customer: Dict[str, Any]) -> Dict[str, Any]:
        """Predict cluster, persona, confidence, and tailored marketing action."""
        if not self.kmeans_model or not self.scaler:
            self.load()

        df_input = pd.DataFrame([{
            "Age": float(customer.get("age", 40)),
            "Annual_Income_k": float(customer.get("annual_income_k", 70)),
            "Spending_Score": float(customer.get("spending_score", 50)),
            "Recency_Days": float(customer.get("recency_days", 30)),
            "Total_Spend_Annual": float(customer.get("total_spend_annual", 4500)),
            "Web_Visits_Month": float(customer.get("web_visits_month", 8)),
            "Discount_Sensitivity": float(customer.get("discount_sensitivity", 0.4)),
            "Family_Size": float(customer.get("family_size", 3))
        }])

        df_feat = engineer_clustering_features(df_input)
        X_scaled = self.scaler.transform(df_feat)

        # Distances to all centroids
        distances = self.kmeans_model.transform(X_scaled)[0]
        raw_id = int(np.argmin(distances))
        min_dist = float(distances[raw_id])

        # Soft softmax confidence from inverted distances
        inv_dists = 1.0 / (distances + 1e-5)
        probs = inv_dists / np.sum(inv_dists)
        confidence = float(probs[raw_id])
        cluster_id = int(self.label_map.get(raw_id, raw_id)) if self.label_map else raw_id

        # 2D PCA Projection
        pca_coords = self.pca_model.transform(X_scaled)[0] if self.pca_model else [0.0, 0.0]

        profile = self.cluster_profiles.get(str(cluster_id), {})

        return {
            "cluster_id": cluster_id,
            "persona_name": profile.get("persona_name", f"Cluster {cluster_id}"),
            "tagline": profile.get("tagline", ""),
            "color": profile.get("color", "#06b6d4"),
            "badge": profile.get("badge", ""),
            "description": profile.get("description", ""),
            "marketing_strategy": profile.get("marketing_strategy", ""),
            "assignment_confidence": round(confidence * 100.0, 1),
            "distance_to_centroid": round(min_dist, 3),
            "pca_coords": {
                "x": round(float(pca_coords[0]), 3),
                "y": round(float(pca_coords[1]), 3)
            },
            "cluster_stats": profile.get("stats", {})
        }

engine = CustomerSegmentationEngine()
