# Real-Time Market Basket Recommendation & Cross-Sell Engine

import os
import sys
import json
from collections import defaultdict
from typing import List, Dict, Set, Optional, Any

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))

class BasketInferenceEngine:
    def __init__(self, models_dir: str = MODELS_DIR):
        self.models_dir = models_dir
        self.rules: List[Dict[str, Any]] = []
        self.network_graph: Dict[str, Any] = {}
        self.benchmarks: Dict[str, Any] = {}
        self.product_catalog: List[Dict[str, Any]] = []
        self.product_lookup: Dict[str, Dict[str, Any]] = {}
        self.load()

    def load(self):
        rules_path = os.path.join(self.models_dir, 'association_rules.json')
        if os.path.exists(rules_path):
            with open(rules_path, 'r', encoding='utf-8') as f:
                self.rules = json.load(f)
                print(f"[OK] Loaded {len(self.rules)} Association Rules", flush=True)

        graph_path = os.path.join(self.models_dir, 'network_graph.json')
        if os.path.exists(graph_path):
            with open(graph_path, 'r', encoding='utf-8') as f:
                self.network_graph = json.load(f)

        bench_path = os.path.join(self.models_dir, 'benchmarks.json')
        if os.path.exists(bench_path):
            with open(bench_path, 'r', encoding='utf-8') as f:
                self.benchmarks = json.load(f)

        catalog_path = os.path.join(self.models_dir, 'product_catalog.json')
        if os.path.exists(catalog_path):
            with open(catalog_path, 'r', encoding='utf-8') as f:
                self.product_catalog = json.load(f)
                self.product_lookup = {p["name"]: p for p in self.product_catalog}

    def recommend(self, current_items: List[str]) -> Dict[str, Any]:
        """Recommend optimal cross-sell additions for given active basket items."""
        if not self.rules:
            self.load()

        basket_set = set(current_items)
        candidate_scores = defaultdict(lambda: {"score": 0.0, "max_lift": 0.0, "max_confidence": 0.0, "matching_rules": []})

        # Match rules where antecedent is a subset of current basket
        for rule in self.rules:
            ante_set = set(rule["antecedent"])
            if ante_set.issubset(basket_set):
                for conseq_item in rule["consequent"]:
                    if conseq_item not in basket_set:
                        # Composite recommendation score = Lift * Confidence
                        rec_score = rule["lift"] * rule["confidence"]
                        cand = candidate_scores[conseq_item]
                        if rec_score > cand["score"]:
                            cand["score"] = rec_score
                        if rule["lift"] > cand["max_lift"]:
                            cand["max_lift"] = rule["lift"]
                        if rule["confidence"] > cand["max_confidence"]:
                            cand["max_confidence"] = rule["confidence"]
                        cand["matching_rules"].append(rule["rule_str"])

        # Format sorted recommendations
        recommendations = []
        for item, stats in sorted(candidate_scores.items(), key=lambda x: x[1]["score"], reverse=True)[:6]:
            meta = self.product_lookup.get(item, {"dept": "General", "price": 3.99})
            recommendations.append({
                "item_name": item,
                "department": meta.get("dept", "Pantry"),
                "price": meta.get("price", 3.99),
                "score": round(stats["score"], 3),
                "lift": round(stats["max_lift"], 2),
                "confidence_pct": round(stats["max_confidence"] * 100.0, 1),
                "top_rule": stats["matching_rules"][0] if stats["matching_rules"] else "",
                "all_matching_rules": stats["matching_rules"][:3]
            })

        # Calculate current basket total & potential GMV uplift
        current_total = sum(self.product_lookup.get(item, {}).get("price", 0.0) for item in current_items)
        potential_uplift = sum(r["price"] for r in recommendations[:3])

        return {
            "current_basket_size": len(current_items),
            "current_basket_total": round(current_total, 2),
            "potential_gmv_uplift": round(potential_uplift, 2),
            "recommendations_count": len(recommendations),
            "recommendations": recommendations
        }

engine = BasketInferenceEngine()
