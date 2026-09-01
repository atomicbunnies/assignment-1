# FastAPI Microservice for Market Basket Intelligence & Associative Pattern Mining

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
from train import run_pattern_mining_pipeline
from autoresearch_mining import MiningAutoResearcher

app = FastAPI(
    title="Market Basket Intelligence & Association Mining API",
    description="Sub-5ms cross-sell recommendations, 2D association network graph, and AutoResearch Hill-Climbing telemetry",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BasketRecommendRequest(BaseModel):
    items: List[str] = Field(..., example=["Organic Hass Avocados", "Fresh Limes"])

class RetrainRequest(BaseModel):
    min_support: Optional[float] = Field(0.03, ge=0.01, le=0.20)
    min_confidence: Optional[float] = Field(0.35, ge=0.10, le=0.90)
    min_lift: Optional[float] = Field(1.20, ge=1.0, le=5.0)
    n_transactions: Optional[int] = Field(10000, ge=1000, le=30000)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "rules_loaded": len(engine.rules) > 0,
        "active_rules_count": len(engine.rules),
        "catalog_size": len(engine.product_catalog),
        "champion_algorithm": engine.benchmarks.get("champion_algorithm", "FP-Growth (Frequent Pattern Tree)"),
        "production_metrics": engine.benchmarks.get("production_metrics", {})
    }

@app.get("/api/catalog")
def get_catalog():
    """Return all catalog products grouped by department."""
    if not engine.product_catalog:
        engine.load()
    return {"success": True, "products": engine.product_catalog}

@app.post("/api/basket/recommend")
def recommend_for_basket(req: BasketRecommendRequest):
    """Recommend cross-sell items, calculate lift, confidence, and potential GMV uplift."""
    try:
        res = engine.recommend(req.items)
        return {"success": True, "data": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")

@app.get("/api/rules/top")
def get_top_rules(limit: int = 40):
    """Return top association rules sorted by Lift and Confidence."""
    if not engine.rules:
        engine.load()
    return {"success": True, "total_rules": len(engine.rules), "rules": engine.rules[:limit]}

@app.get("/api/graph/network")
def get_network_graph():
    """Return 2D association network nodes and links for interactive visual rendering."""
    if not engine.network_graph:
        engine.load()
    return {"success": True, "graph": engine.network_graph}

@app.get("/api/admin/benchmarks")
def get_benchmarks():
    """Return mining algorithm comparison matrix with Kaggle Grandmaster baseline."""
    if not engine.benchmarks:
        engine.load()
    return {"success": True, "data": engine.benchmarks}

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
    """Trigger full AutoResearch Hill-Climbing search loop in background."""
    try:
        researcher = MiningAutoResearcher(n_transactions=4000)
        res = researcher.run_full_autoresearch()
        return {"success": True, "message": "AutoResearch run complete!", "data": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AutoResearch failed: {str(e)}")

@app.post("/api/admin/retrain")
def retrain_rules(req: RetrainRequest):
    """Trigger live in-memory association rule retraining."""
    try:
        run_pattern_mining_pipeline(n_transactions=req.n_transactions)
        engine.load()
        return {
            "success": True,
            "message": "Association rules re-mined and reloaded successfully!",
            "production_metrics": engine.benchmarks.get("production_metrics", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8004, reload=True)
