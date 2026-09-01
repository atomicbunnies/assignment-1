# FastAPI Server for Unsupervised Customer Segmentation & Clustering Platform

import os
import sys
import json
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ml')))
from inference import engine
from train import run_clustering_pipeline
from autoresearch_clustering import ClusteringAutoResearcher

app = FastAPI(
    title="Customer Intelligence & Segmentation API",
    description="High-performance clustering inference, 2D PCA/t-SNE manifold projections, and AutoResearch Hill-Climbing telemetry",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Schemas
class CustomerPredictRequest(BaseModel):
    age: float = Field(38.0, ge=18.0, le=90.0, example=38.0)
    annual_income_k: float = Field(95.0, ge=10.0, le=250.0, example=95.0)
    spending_score: float = Field(82.0, ge=1.0, le=100.0, example=82.0)
    recency_days: float = Field(14.0, ge=1.0, le=365.0, example=14.0)
    total_spend_annual: float = Field(6500.0, ge=50.0, le=50000.0, example=6500.0)
    web_visits_month: float = Field(10.0, ge=0.0, le=50.0, example=10.0)
    discount_sensitivity: float = Field(0.25, ge=0.0, le=1.0, example=0.25)
    family_size: float = Field(2.0, ge=1.0, le=10.0, example=2.0)

class RetrainRequest(BaseModel):
    n_clusters: Optional[int] = Field(5, ge=2, le=10)
    n_samples: Optional[int] = Field(10000, ge=1000, le=30000)
    random_state: Optional[int] = Field(42)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": engine.kmeans_model is not None,
        "n_clusters": engine.kmeans_model.n_clusters if engine.kmeans_model else 5,
        "champion_algorithm": engine.benchmarks.get("champion_model", "K-Means++"),
        "production_metrics": engine.benchmarks.get("production_metrics", {})
    }

@app.get("/api/clusters/summary")
def get_clusters_summary():
    """Return customer persona profiles, percentages, and marketing recommendations."""
    if not engine.cluster_profiles:
        engine.load()
    return {"success": True, "profiles": engine.cluster_profiles}

@app.get("/api/clusters/scatter")
def get_scatter_points():
    """Return 2D PCA & t-SNE scatter points with customer attributes."""
    if not engine.scatter_points:
        engine.load()
    return {
        "success": True,
        "total_points": len(engine.scatter_points),
        "points": engine.scatter_points
    }

@app.post("/api/cluster/predict")
def predict_customer(req: CustomerPredictRequest):
    """Predict customer cluster assignment, persona, and tailored marketing action."""
    try:
        res = engine.predict_single(req.model_dump())
        return {"success": True, "prediction": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

@app.get("/api/admin/benchmarks")
def get_benchmarks():
    """Return clustering algorithm comparison matrix."""
    if not engine.benchmarks:
        engine.load()
    return {"success": True, "data": engine.benchmarks}

@app.get("/api/admin/elbow")
def get_elbow_data():
    """Return Elbow method WCSS and Silhouette scores across k=2..10."""
    if not engine.elbow_curve:
        engine.load()
    return {"success": True, "data": engine.elbow_curve}

@app.get("/api/admin/autoresearch/history")
def get_autoresearch_history():
    """Return AutoResearch Tabular hill climbing history and trajectory."""
    history_file = os.path.join(engine.models_dir, 'autoresearch_history.json')
    if os.path.exists(history_file):
        with open(history_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return {"success": True, "data": data}
    return {"success": False, "message": "AutoResearch history not found"}

@app.post("/api/admin/autoresearch/run")
def run_autoresearch():
    """Trigger full AutoResearch Hill-Climbing loop in background."""
    try:
        researcher = ClusteringAutoResearcher(n_samples=4000)
        res = researcher.run_full_autoresearch()
        return {"success": True, "message": "AutoResearch run complete!", "data": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AutoResearch failed: {str(e)}")

@app.post("/api/admin/retrain")
def retrain_model(req: RetrainRequest):
    """Trigger live in-memory clustering model retraining."""
    try:
        run_clustering_pipeline(n_samples=req.n_samples, random_state=req.random_state)
        engine.load()
        return {
            "success": True,
            "message": "Clustering models re-trained and reloaded successfully!",
            "benchmarks": engine.benchmarks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8003, reload=True)
