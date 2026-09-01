#!/usr/bin/env python3
"""Market basket association mining: generate data, mine rules, and save visualizations."""

from __future__ import annotations

import json
import os
import sys
import time
from collections import defaultdict

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, "ml"))

from data_loader import PRODUCT_CATALOG, PRODUCT_LOOKUP, generate_market_basket_dataset
from mining import MarketBasketMiner

DEPT_COLORS = {
    "Produce": "#10b981",
    "Dairy & Eggs": "#38bdf8",
    "Bakery & Deli": "#f59e0b",
    "Pantry": "#a855f7",
    "Beverages": "#ec4899",
    "Snacks": "#eab308",
}

N_TRANSACTIONS = 10_000
MIN_SUPPORT = 0.035
MIN_CONFIDENCE = 0.30
MIN_LIFT = 1.20
MAX_LEN = 4
PROD_MIN_SUPPORT = 0.03
PROD_MIN_CONFIDENCE = 0.35
PROD_MIN_LIFT = 1.25


def _dept(name: str) -> str:
    return PRODUCT_LOOKUP.get(name, {"dept": "Other"}).get("dept", "Other")


def _short(name: str, n: int = 22) -> str:
    return name if len(name) <= n else name[: n - 1] + "…"


def run_pipeline() -> None:
    t0 = time.time()
    print("Generating Instacart-style baskets…")
    baskets = generate_market_basket_dataset(n_transactions=N_TRANSACTIONS, random_state=42)
    miner = MarketBasketMiner(baskets)

    rows = [
        {"transaction_id": i, "item": item, "dept": _dept(item)}
        for i, basket in enumerate(baskets)
        for item in basket
    ]
    tx_df = pd.DataFrame(rows)
    tx_df.to_csv(os.path.join(ROOT, "transactions.csv"), index=False)

    print(f"Mining (Apriori / FP-Growth / ECLAT), min_support={MIN_SUPPORT}…")
    ap_itemsets, ap_time = miner.run_apriori(min_support=MIN_SUPPORT, max_len=MAX_LEN)
    ap_rules = miner.generate_association_rules(ap_itemsets, MIN_CONFIDENCE, MIN_LIFT)
    fp_itemsets, fp_time = miner.run_fp_growth(min_support=MIN_SUPPORT, max_len=MAX_LEN)
    fp_rules = miner.generate_association_rules(fp_itemsets, MIN_CONFIDENCE, MIN_LIFT)
    eclat_itemsets, eclat_time = miner.run_eclat(min_support=MIN_SUPPORT, max_len=MAX_LEN)
    eclat_rules = miner.generate_association_rules(eclat_itemsets, MIN_CONFIDENCE, MIN_LIFT)

    print("Extracting production rules…")
    prod_itemsets, _ = miner.run_fp_growth(min_support=PROD_MIN_SUPPORT, max_len=MAX_LEN)
    prod_rules = miner.generate_association_rules(
        prod_itemsets, PROD_MIN_CONFIDENCE, PROD_MIN_LIFT
    )

    def _stats(rules: list) -> tuple[float, float]:
        if not rules:
            return 0.0, 0.0
        return (
            round(max(r["lift"] for r in rules), 3),
            round(sum(r["confidence"] for r in rules) / len(rules), 4),
        )

    ap_lift, ap_conf = _stats(ap_rules)
    fp_lift, fp_conf = _stats(fp_rules)
    eclat_lift, eclat_conf = _stats(eclat_rules)

    leaderboard = [
        {
            "id": "fp_growth",
            "name": "FP-Growth",
            "itemsets_count": len(fp_itemsets),
            "rules_count": len(fp_rules),
            "top_lift": fp_lift,
            "mean_confidence": fp_conf,
            "execution_time_sec": round(fp_time, 4),
        },
        {
            "id": "eclat",
            "name": "ECLAT",
            "itemsets_count": len(eclat_itemsets),
            "rules_count": len(eclat_rules),
            "top_lift": eclat_lift,
            "mean_confidence": eclat_conf,
            "execution_time_sec": round(eclat_time, 4),
        },
        {
            "id": "apriori",
            "name": "Apriori",
            "itemsets_count": len(ap_itemsets),
            "rules_count": len(ap_rules),
            "top_lift": ap_lift,
            "mean_confidence": ap_conf,
            "execution_time_sec": round(ap_time, 4),
        },
    ]
    leaderboard.sort(key=lambda x: x["execution_time_sec"])

    benchmarks = {
        "champion_algorithm": "FP-Growth",
        "production_metrics": {
            "total_transactions": len(baskets),
            "total_catalog_products": len(PRODUCT_CATALOG),
            "frequent_itemsets_count": len(prod_itemsets),
            "active_rules_count": len(prod_rules),
            "top_rule_lift": round(max((r["lift"] for r in prod_rules), default=0.0), 3),
            "mean_rule_confidence": round(
                sum(r["confidence"] for r in prod_rules) / max(1, len(prod_rules)), 4
            ),
        },
        "leaderboard": leaderboard,
    }
    with open(os.path.join(ROOT, "benchmarks.json"), "w", encoding="utf-8") as f:
        json.dump(benchmarks, f, indent=2)

    rules_df = pd.DataFrame(prod_rules)
    rules_df.to_csv(os.path.join(ROOT, "association_rules.csv"), index=False)
    with open(os.path.join(ROOT, "association_rules.json"), "w", encoding="utf-8") as f:
        json.dump(prod_rules, f, indent=2)

    nodes_dict: dict[str, dict] = {}
    edges: list[dict] = []
    for rule in prod_rules[:50]:
        for item in rule["antecedent"] + rule["consequent"]:
            if item not in nodes_dict:
                meta = PRODUCT_LOOKUP.get(item, {"dept": "Pantry", "price": 3.99})
                nodes_dict[item] = {
                    "id": item,
                    "name": item,
                    "dept": meta["dept"],
                    "price": meta["price"],
                    "color": DEPT_COLORS.get(meta["dept"], "#cbd5e1"),
                    "support": miner.item_counts[item] / len(baskets),
                }
        edges.append(
            {
                "source": rule["antecedent"][0],
                "target": rule["consequent"][0],
                "lift": rule["lift"],
                "confidence": rule["confidence"],
                "support": rule["support"],
                "rule_str": rule["rule_str"],
            }
        )
    nodes_list = list(nodes_dict.values())
    n_nodes = max(1, len(nodes_list))
    for idx, node in enumerate(nodes_list):
        angle = (2 * np.pi / n_nodes) * idx
        node["x"] = round(280 + 180 * 0.95 * float(np.cos(angle)), 2)
        node["y"] = round(220 + 180 * 0.95 * float(np.sin(angle)), 2)
    network_graph = {"nodes": nodes_list, "links": edges}
    with open(os.path.join(ROOT, "network_graph.json"), "w", encoding="utf-8") as f:
        json.dump(network_graph, f, indent=2)

    print("Saving visualizations…")
    plt.rcParams.update(
        {
            "figure.facecolor": "white",
            "axes.facecolor": "white",
            "axes.spines.top": False,
            "axes.spines.right": False,
            "font.size": 10,
        }
    )

    item_counts = miner.item_counts
    top_items = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:15]
    fig, ax = plt.subplots(figsize=(10, 6))
    names = [_short(n) for n, _ in top_items][::-1]
    vals = [c / len(baskets) for _, c in top_items][::-1]
    colors = [DEPT_COLORS.get(_dept(n), "#94a3b8") for n, _ in top_items][::-1]
    ax.barh(names, vals, color=colors)
    ax.set_xlabel("Support (share of baskets)")
    ax.set_title("Top 15 products by basket support")
    fig.tight_layout()
    fig.savefig(os.path.join(ROOT, "viz_item_support.png"), dpi=140)
    plt.close(fig)

    sizes = [len(b) for b in baskets]
    fig, ax = plt.subplots(figsize=(8, 5))
    bins = range(min(sizes), max(sizes) + 2)
    ax.hist(sizes, bins=bins, color="#6366f1", edgecolor="white", align="left")
    ax.set_xlabel("Items per basket")
    ax.set_ylabel("Transactions")
    ax.set_title("Basket size distribution")
    fig.tight_layout()
    fig.savefig(os.path.join(ROOT, "viz_basket_size.png"), dpi=140)
    plt.close(fig)

    dept_counts = tx_df.groupby("dept").size().sort_values(ascending=True)
    fig, ax = plt.subplots(figsize=(8, 5))
    bar_colors = [DEPT_COLORS.get(d, "#94a3b8") for d in dept_counts.index]
    ax.barh(dept_counts.index, dept_counts.values, color=bar_colors)
    ax.set_xlabel("Line items")
    ax.set_title("Department mix across all transactions")
    fig.tight_layout()
    fig.savefig(os.path.join(ROOT, "viz_department_mix.png"), dpi=140)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(8, 5))
    names_lb = [r["name"] for r in leaderboard]
    times_lb = [r["execution_time_sec"] for r in leaderboard]
    ax.bar(names_lb, times_lb, color=["#0ea5e9", "#22c55e", "#f97316"])
    ax.set_ylabel("Seconds")
    ax.set_title("Algorithm runtime (min_support=0.035)")
    fig.tight_layout()
    fig.savefig(os.path.join(ROOT, "viz_algorithm_runtime.png"), dpi=140)
    plt.close(fig)

    if not rules_df.empty:
        fig, ax = plt.subplots(figsize=(8, 6))
        sc = ax.scatter(
            rules_df["confidence"],
            rules_df["lift"],
            c=rules_df["support"],
            s=28 + 400 * rules_df["support"],
            cmap="viridis",
            alpha=0.75,
            edgecolors="none",
        )
        cbar = fig.colorbar(sc, ax=ax)
        cbar.set_label("Support")
        ax.set_xlabel("Confidence")
        ax.set_ylabel("Lift")
        ax.set_title("Association rules: confidence vs lift")
        fig.tight_layout()
        fig.savefig(os.path.join(ROOT, "viz_rules_scatter.png"), dpi=140)
        plt.close(fig)

        top_n = rules_df.head(12).iloc[::-1]
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.barh(top_n["rule_str"].map(lambda s: _short(s, 48)), top_n["lift"], color="#7c3aed")
        ax.set_xlabel("Lift")
        ax.set_title("Top 12 production rules by lift")
        fig.tight_layout()
        fig.savefig(os.path.join(ROOT, "viz_top_rules_lift.png"), dpi=140)
        plt.close(fig)

    fig, ax = plt.subplots(figsize=(10, 8))
    for link in edges:
        src = nodes_dict.get(link["source"])
        dst = nodes_dict.get(link["target"])
        if not src or not dst:
            continue
        ax.plot(
            [src["x"], dst["x"]],
            [src["y"], dst["y"]],
            color="#94a3b8",
            linewidth=0.6 + 1.4 * min(link["lift"] / 5.0, 1.0),
            alpha=0.45,
            zorder=1,
        )
    for node in nodes_list:
        ax.scatter(
            node["x"],
            node["y"],
            s=80 + 900 * node["support"],
            c=node["color"],
            zorder=2,
            edgecolors="white",
            linewidths=0.6,
        )
        ax.annotate(
            _short(node["name"], 16),
            (node["x"], node["y"]),
            textcoords="offset points",
            xytext=(6, 4),
            fontsize=7,
            color="#334155",
        )
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_title("Association network (top 50 production rules)")
    handles = [
        plt.Line2D([0], [0], marker="o", color="w", markerfacecolor=c, markersize=8, label=d)
        for d, c in DEPT_COLORS.items()
    ]
    ax.legend(handles=handles, loc="lower left", frameon=False, fontsize=8, ncol=2)
    fig.tight_layout()
    fig.savefig(os.path.join(ROOT, "viz_association_network.png"), dpi=140)
    plt.close(fig)

    pair_counts: dict[tuple[str, str], int] = defaultdict(int)
    for basket in baskets:
        unique = sorted(set(basket))
        for i, a in enumerate(unique):
            for b in unique[i + 1 :]:
                pair_counts[(a, b)] += 1
    top_pairs = sorted(pair_counts.items(), key=lambda x: x[1], reverse=True)[:12]
    fig, ax = plt.subplots(figsize=(10, 6))
    labels = [f"{_short(a, 18)} + {_short(b, 18)}" for (a, b), _ in top_pairs][::-1]
    counts = [c for _, c in top_pairs][::-1]
    ax.barh(labels, counts, color="#0891b2")
    ax.set_xlabel("Co-occurrence count")
    ax.set_title("Top 12 item pairs by raw co-occurrence")
    fig.tight_layout()
    fig.savefig(os.path.join(ROOT, "viz_item_pairs.png"), dpi=140)
    plt.close(fig)

    elapsed = time.time() - t0
    print(f"Baskets: {len(baskets):,} | Catalog: {len(PRODUCT_CATALOG)}")
    print(f"Apriori: {len(ap_itemsets)} itemsets, {len(ap_rules)} rules, {ap_time:.3f}s")
    print(f"FP-Growth: {len(fp_itemsets)} itemsets, {len(fp_rules)} rules, {fp_time:.3f}s")
    print(f"ECLAT: {len(eclat_itemsets)} itemsets, {len(eclat_rules)} rules, {eclat_time:.3f}s")
    print(f"Production rules: {len(prod_rules)}")
    print(f"Done in {elapsed:.2f}s. Outputs written to {ROOT}")


if __name__ == "__main__":
    run_pipeline()
