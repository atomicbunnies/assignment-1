"""Publication-ready figures for the unsupervised segmentation experiment.

Design notes (visualization-builder):
- One message per chart; titles state the finding, not just the variable.
- Colorblind-safe Okabe–Ito-inspired palette mapped to the five personas.
- Gridlines muted; top/right spines removed; annotations on the key point.
"""

from __future__ import annotations

import os
from typing import Dict, List, Optional

import numpy as np
import pandas as pd

# Matplotlib is imported lazily inside plot functions so train.py can still
# serialize artifacts if a headless environment lacks a display backend.

PERSONA_COLORS = {
    0: "#009E73",  # VIP Champions — bluish green
    1: "#56B4E9",  # Prudent Affluents — sky blue
    2: "#CC79A7",  # Young Trendsetters — reddish purple
    3: "#E69F00",  # Bargain Hunters — orange
    4: "#0072B2",  # Mainstream Loyalists — blue
}

PERSONA_NAMES = {
    0: "VIP Champions",
    1: "Prudent Affluents",
    2: "Young Trendsetters",
    3: "Bargain Hunters",
    4: "Mainstream Loyalists",
}


def _setup_mpl():
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    plt.rcParams.update(
        {
            "figure.facecolor": "white",
            "axes.facecolor": "white",
            "axes.grid": True,
            "grid.alpha": 0.25,
            "grid.linewidth": 0.6,
            "axes.spines.top": False,
            "axes.spines.right": False,
            "font.family": "sans-serif",
            "font.size": 10,
            "axes.titlesize": 12,
            "axes.titleweight": "medium",
            "axes.labelsize": 10,
            "figure.dpi": 140,
            "savefig.dpi": 160,
            "savefig.bbox": "tight",
        }
    )
    return plt


def _ensure_dir(path: str) -> str:
    os.makedirs(path, exist_ok=True)
    return path


def _cluster_color(cid: int) -> str:
    return PERSONA_COLORS.get(int(cid), "#999999")


def plot_experiment_figures(
    *,
    figures_dir: str,
    raw_df: pd.DataFrame,
    X_scaled: np.ndarray,
    feature_names: List[str],
    cluster_labels: np.ndarray,
    pca,
    pca_2d: np.ndarray,
    tsne_2d: np.ndarray,
    sample_sub_idx: np.ndarray,
    elbow_data: List[dict],
    benchmark_results: List[dict],
    cluster_profiles: Dict,
    pca_explained_var: List[float],
) -> List[str]:
    """Write the diagnostic figure set and return saved paths."""
    plt = _setup_mpl()
    _ensure_dir(figures_dir)
    saved: List[str] = []

    saved.append(
        _plot_income_spend(plt, figures_dir, raw_df, cluster_labels)
    )
    saved.append(
        _plot_manifolds(
            plt,
            figures_dir,
            pca_2d,
            tsne_2d,
            cluster_labels,
            sample_sub_idx,
            pca_explained_var,
        )
    )
    saved.append(_plot_elbow(plt, figures_dir, elbow_data))
    saved.append(_plot_leaderboard(plt, figures_dir, benchmark_results))
    saved.append(_plot_persona_bars(plt, figures_dir, cluster_profiles))
    saved.append(_plot_pca_loadings(plt, figures_dir, pca, feature_names))
    saved.append(_plot_feature_heatmap(plt, figures_dir, X_scaled, feature_names))
    return [p for p in saved if p]


def _plot_income_spend(plt, figures_dir: str, raw_df: pd.DataFrame, labels: np.ndarray) -> str:
    """Classic 2-D business view: income vs spend recovers the four corner archetypes."""
    fig, ax = plt.subplots(figsize=(8.2, 6.0))
    rng = np.random.RandomState(42)
    # Plot a subsample so overplotting does not hide density.
    idx = rng.choice(len(raw_df), size=min(2500, len(raw_df)), replace=False)
    income = raw_df["Annual_Income_k"].to_numpy()[idx]
    spend = raw_df["Spending_Score"].to_numpy()[idx]
    labs = labels[idx]
    for cid in range(5):
        mask = labs == cid
        ax.scatter(
            income[mask],
            spend[mask],
            c=_cluster_color(cid),
            label=PERSONA_NAMES[cid],
            s=18,
            alpha=0.55,
            linewidths=0,
        )
    ax.set_xlabel("Annual income (thousands USD)")
    ax.set_ylabel("Spending score (0–100)")
    ax.set_title("K-Means recovers the income × spend quadrants")
    ax.legend(frameon=False, loc="upper left", markerscale=1.6, fontsize=8)
    ax.axhline(50, color="#bbbbbb", lw=0.8, ls="--")
    ax.axvline(70, color="#bbbbbb", lw=0.8, ls="--")
    ax.annotate(
        "High income / high spend\n(VIP Champions)",
        xy=(120, 88),
        xytext=(95, 70),
        fontsize=8,
        color="#333333",
        arrowprops=dict(arrowstyle="->", color="#666666", lw=0.8),
    )
    path = os.path.join(figures_dir, "01_income_vs_spend_clusters.png")
    fig.savefig(path)
    plt.close(fig)
    return path


def _plot_manifolds(
    plt,
    figures_dir: str,
    pca_2d: np.ndarray,
    tsne_2d: np.ndarray,
    labels: np.ndarray,
    sample_idx: np.ndarray,
    pca_var: List[float],
) -> str:
    """PCA shows linear axes of variation; t-SNE shows local neighborhood structure."""
    fig, axes = plt.subplots(1, 2, figsize=(11.5, 5.2))
    rng = np.random.RandomState(0)
    pca_idx = rng.choice(len(pca_2d), size=min(2500, len(pca_2d)), replace=False)

    ax = axes[0]
    for cid in range(5):
        mask = labels[pca_idx] == cid
        ax.scatter(
            pca_2d[pca_idx][mask, 0],
            pca_2d[pca_idx][mask, 1],
            c=_cluster_color(cid),
            label=PERSONA_NAMES[cid],
            s=14,
            alpha=0.55,
            linewidths=0,
        )
    total = sum(pca_var) * 100
    ax.set_xlabel(f"PC1 ({pca_var[0]*100:.1f}% var)")
    ax.set_ylabel(f"PC2 ({pca_var[1]*100:.1f}% var)")
    ax.set_title(f"PCA projection — {total:.1f}% variance in 2D")

    ax = axes[1]
    tsne_labels = labels[sample_idx]
    for cid in range(5):
        mask = tsne_labels == cid
        ax.scatter(
            tsne_2d[mask, 0],
            tsne_2d[mask, 1],
            c=_cluster_color(cid),
            label=PERSONA_NAMES[cid],
            s=14,
            alpha=0.6,
            linewidths=0,
        )
    ax.set_xlabel("t-SNE-1")
    ax.set_ylabel("t-SNE-2")
    ax.set_title("t-SNE — local neighborhoods, not global distances")

    handles, legend_labels = axes[0].get_legend_handles_labels()
    fig.legend(
        handles,
        legend_labels,
        loc="lower center",
        ncol=5,
        frameon=False,
        fontsize=8,
        bbox_to_anchor=(0.5, -0.02),
    )
    fig.suptitle("Manifold views of the fitted K-Means++ partition", y=1.02, fontsize=13)
    path = os.path.join(figures_dir, "02_pca_tsne_manifolds.png")
    fig.savefig(path)
    plt.close(fig)
    return path


def _plot_elbow(plt, figures_dir: str, elbow_data: List[dict]) -> str:
    """WCSS always falls with k; silhouette peaks where clusters are most compact/separated."""
    ks = [d["k"] for d in elbow_data]
    wcss = [d["wcss"] for d in elbow_data]
    sil = [d["silhouette"] for d in elbow_data]
    best_k = ks[int(np.argmax(sil))]

    fig, ax1 = plt.subplots(figsize=(7.8, 5.0))
    ax2 = ax1.twinx()
    ax2.spines["top"].set_visible(False)

    ax1.plot(ks, wcss, marker="o", color="#0072B2", lw=2, label="WCSS (inertia)")
    ax2.plot(ks, sil, marker="s", color="#D55E00", lw=2, label="Silhouette")
    ax1.axvline(5, color="#666666", ls="--", lw=1)
    ax1.annotate(
        f"sil max at k={best_k}; k=5 kept for personas",
        xy=(5, wcss[ks.index(5)]),
        xytext=(5.35, max(wcss) * 0.90),
        fontsize=8,
        color="#333333",
    )
    ax1.set_xlabel("Number of clusters k")
    ax1.set_ylabel("Within-cluster sum of squares")
    ax2.set_ylabel("Mean silhouette score")
    ax1.set_title("Elbow vs silhouette: k=5 is the interpretable operating point")
    ax1.set_xticks(ks)
    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2, frameon=False, loc="center right")
    path = os.path.join(figures_dir, "03_elbow_silhouette.png")
    fig.savefig(path)
    plt.close(fig)
    return path


def _plot_leaderboard(plt, figures_dir: str, benchmark_results: List[dict]) -> str:
    """Compare backbones on silhouette (higher is better). Exclude the synthetic Kaggle row."""
    rows = [r for r in benchmark_results if not r.get("is_kaggle_baseline")]
    rows = sorted(rows, key=lambda r: r["silhouette_score"])
    names = [r["name"] for r in rows]
    scores = [r["silhouette_score"] for r in rows]
    colors = ["#009E73" if i == len(rows) - 1 else "#56B4E9" for i in range(len(rows))]

    fig, ax = plt.subplots(figsize=(8.0, 4.6))
    bars = ax.barh(names, scores, color=colors, height=0.62)
    ax.set_xlabel("Silhouette score (higher is better)")
    ax.set_title("K-Means++ leads the five-backbone tournament")
    ax.set_xlim(0, max(scores) * 1.18 if scores else 1)
    for bar, val in zip(bars, scores):
        ax.text(
            val + 0.004,
            bar.get_y() + bar.get_height() / 2,
            f"{val:.3f}",
            va="center",
            fontsize=8,
        )
    path = os.path.join(figures_dir, "04_backbone_silhouette.png")
    fig.savefig(path)
    plt.close(fig)
    return path


def _plot_persona_bars(plt, figures_dir: str, cluster_profiles: Dict) -> str:
    """Mean income, spend, recency, and digital activity by discovered persona."""
    order = sorted(cluster_profiles.keys(), key=lambda k: int(k))
    names = [cluster_profiles[c]["persona_name"] for c in order]
    income = [cluster_profiles[c]["stats"]["avg_income_k"] for c in order]
    spend = [cluster_profiles[c]["stats"]["avg_spending_score"] for c in order]
    recency = [cluster_profiles[c]["stats"]["avg_recency_days"] for c in order]
    visits = [cluster_profiles[c]["stats"]["avg_web_visits"] for c in order]

    fig, axes = plt.subplots(2, 2, figsize=(10.5, 7.2))
    panels = [
        (axes[0, 0], income, "Mean annual income (k USD)", "Income separates VIP / affluent from value seekers"),
        (axes[0, 1], spend, "Mean spending score", "Spend splits Champions/Trendsetters from savers"),
        (axes[1, 0], recency, "Mean recency (days since last order)", "Higher recency = colder, less engaged cohorts"),
        (axes[1, 1], visits, "Mean web visits / month", "Trendsetters dominate digital engagement"),
    ]
    bar_colors = [_cluster_color(int(c)) for c in order]
    for ax, values, ylabel, title in panels:
        ax.bar(range(len(names)), values, color=bar_colors)
        ax.set_xticks(range(len(names)))
        ax.set_xticklabels([n.replace(" ", "\n") for n in names], fontsize=7.5)
        ax.set_ylabel(ylabel)
        ax.set_title(title, fontsize=10)
    fig.suptitle("Persona profiles — the marketing-actionable layer on top of k=5", fontsize=13)
    fig.tight_layout()
    path = os.path.join(figures_dir, "05_persona_profile_bars.png")
    fig.savefig(path)
    plt.close(fig)
    return path


def _plot_pca_loadings(plt, figures_dir: str, pca, feature_names: List[str]) -> str:
    """Loadings explain *why* the 2D map looks the way it does."""
    loadings = pca.components_[:2].T
    x = np.arange(len(feature_names))
    width = 0.38
    fig, ax = plt.subplots(figsize=(9.5, 5.2))
    ax.bar(x - width / 2, loadings[:, 0], width, label="PC1", color="#0072B2")
    ax.bar(x + width / 2, loadings[:, 1], width, label="PC2", color="#E69F00")
    ax.axhline(0, color="#888888", lw=0.8)
    ax.set_xticks(x)
    ax.set_xticklabels(feature_names, rotation=40, ha="right", fontsize=8)
    ax.set_ylabel("Loading (correlation with component)")
    ax.set_title("PC1 is a spend/engagement axis; PC2 is an income/thrift axis")
    ax.legend(frameon=False)
    path = os.path.join(figures_dir, "06_pca_loadings.png")
    fig.savefig(path)
    plt.close(fig)
    return path


def _plot_feature_heatmap(plt, figures_dir: str, X_scaled: np.ndarray, feature_names: List[str]) -> Optional[str]:
    """Scaled-feature correlation: engineered ratios should not be perfect clones of their parents."""
    corr = np.corrcoef(X_scaled, rowvar=False)
    fig, ax = plt.subplots(figsize=(8.4, 7.0))
    im = ax.imshow(corr, cmap="coolwarm", vmin=-1, vmax=1)
    ax.set_xticks(range(len(feature_names)))
    ax.set_yticks(range(len(feature_names)))
    ax.set_xticklabels(feature_names, rotation=40, ha="right", fontsize=8)
    ax.set_yticklabels(feature_names, fontsize=8)
    ax.set_title("Feature correlation after z-scoring")
    fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04, label="Pearson r")
    ax.grid(False)
    path = os.path.join(figures_dir, "07_feature_correlation.png")
    fig.savefig(path)
    plt.close(fig)
    return path
