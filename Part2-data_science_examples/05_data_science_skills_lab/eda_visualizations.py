#!/usr/bin/env python3
"""Exploratory data analysis visualizations for the Titanic benchmark.

Follows the exploratory-data-analysis skill workflow:
shape/types → missingness → target → univariate → bivariate →
leakage scan → cardinality/outliers.

All figure and summary files are written next to this script.
"""

from __future__ import annotations

import sys
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from core.datasets import get_titanic_dataset  # noqa: E402

OUT_DIR = ROOT
TARGET = "Survived"
ID_COLS = ["PassengerId"]


def setup_style() -> None:
    plt.rcParams.update(
        {
            "figure.facecolor": "white",
            "axes.facecolor": "white",
            "axes.grid": True,
            "grid.alpha": 0.25,
            "axes.spines.top": False,
            "axes.spines.right": False,
            "font.size": 10,
            "axes.titlesize": 12,
            "figure.dpi": 120,
            "savefig.dpi": 150,
            "savefig.bbox": "tight",
        }
    )


def savefig(fig: plt.Figure, name: str) -> Path:
    path = OUT_DIR / name
    fig.savefig(path)
    plt.close(fig)
    return path


def profile_frame(df: pd.DataFrame) -> dict:
    n_rows, n_cols = df.shape
    dtypes = df.dtypes.astype(str)
    memory_mb = df.memory_usage(deep=True).sum() / 1e6
    miss = df.isna().mean().sort_values(ascending=False)
    miss_nonzero = miss[miss > 0]
    target_share = df[TARGET].value_counts(normalize=True).sort_index()

    num = df.select_dtypes("number")
    describe = num.describe().T
    corr_with_target = num.corr()[TARGET].sort_values(ascending=False)
    corr_abs = corr_with_target.drop(labels=[TARGET] + [c for c in ID_COLS if c in corr_with_target.index]).abs()
    leakage = corr_abs[corr_abs > 0.95].index.tolist()

    cat_cols = df.select_dtypes(exclude="number").columns.tolist()
    cardinality = {c: int(df[c].nunique(dropna=False)) for c in cat_cols + ["Pclass", "SibSp", "Parch"]}

    return {
        "n_rows": n_rows,
        "n_cols": n_cols,
        "memory_mb": memory_mb,
        "dtypes": dtypes,
        "miss": miss_nonzero,
        "target_share": target_share,
        "describe": describe,
        "corr_with_target": corr_with_target,
        "leakage": leakage,
        "cardinality": cardinality,
    }


def plot_missingness(df: pd.DataFrame) -> Path:
    miss = df.isna().mean().sort_values(ascending=True) * 100
    fig, ax = plt.subplots(figsize=(7, 4.5))
    colors = ["#c0392b" if v > 0 else "#7f8c8d" for v in miss.values]
    ax.barh(miss.index, miss.values, color=colors)
    ax.set_xlabel("Missing (%)")
    ax.set_title("Missingness by column")
    ax.set_xlim(0, max(25, miss.max() * 1.15 if len(miss) else 25))
    return savefig(fig, "titanic_missingness.png")


def plot_target_balance(df: pd.DataFrame) -> Path:
    counts = df[TARGET].value_counts().sort_index()
    labels = {0: "Did not survive", 1: "Survived"}
    fig, ax = plt.subplots(figsize=(6, 4.5))
    bars = ax.bar([labels[i] for i in counts.index], counts.values, color=["#7f8c8d", "#2980b9"])
    total = counts.sum()
    for bar, n in zip(bars, counts.values):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height(),
            f"{n}\n({n / total:.1%})",
            ha="center",
            va="bottom",
        )
    ax.set_ylabel("Passengers")
    ax.set_title("Target class balance (Survived)")
    ax.set_ylim(0, counts.max() * 1.18)
    return savefig(fig, "titanic_target_balance.png")


def plot_univariate(df: pd.DataFrame) -> Path:
    fig, axes = plt.subplots(2, 2, figsize=(10, 7.5))

    age = df["Age"].dropna()
    axes[0, 0].hist(age, bins=25, color="#2980b9", edgecolor="white")
    axes[0, 0].axvline(age.median(), color="#c0392b", linestyle="--", label=f"median={age.median():.1f}")
    axes[0, 0].set_title("Age distribution")
    axes[0, 0].set_xlabel("Age (years)")
    axes[0, 0].set_ylabel("Count")
    axes[0, 0].legend()

    fare = df["Fare"]
    axes[0, 1].hist(fare, bins=30, color="#16a085", edgecolor="white")
    axes[0, 1].axvline(fare.median(), color="#c0392b", linestyle="--", label=f"median={fare.median():.1f}")
    axes[0, 1].set_title("Fare distribution")
    axes[0, 1].set_xlabel("Fare")
    axes[0, 1].set_ylabel("Count")
    axes[0, 1].legend()

    pclass = df["Pclass"].value_counts().sort_index()
    axes[1, 0].bar(pclass.index.astype(str), pclass.values, color="#8e44ad")
    axes[1, 0].set_title("Passenger class counts")
    axes[1, 0].set_xlabel("Pclass")
    axes[1, 0].set_ylabel("Count")

    sex = df["Sex"].value_counts()
    axes[1, 1].bar(sex.index, sex.values, color=["#e67e22", "#3498db"])
    axes[1, 1].set_title("Sex counts")
    axes[1, 1].set_xlabel("Sex")
    axes[1, 1].set_ylabel("Count")

    fig.suptitle("Univariate feature distributions", y=1.01)
    fig.tight_layout()
    return savefig(fig, "titanic_univariate.png")


def plot_bivariate(df: pd.DataFrame) -> Path:
    fig, axes = plt.subplots(1, 3, figsize=(12, 4.2))

    sex_rate = df.groupby("Sex")[TARGET].mean()
    axes[0].bar(sex_rate.index, sex_rate.values, color=["#e67e22", "#3498db"])
    axes[0].set_ylim(0, 1)
    axes[0].set_ylabel("Survival rate")
    axes[0].set_title("Survival rate by Sex")

    class_rate = df.groupby("Pclass")[TARGET].mean()
    axes[1].bar(class_rate.index.astype(str), class_rate.values, color="#8e44ad")
    axes[1].set_ylim(0, 1)
    axes[1].set_xlabel("Pclass")
    axes[1].set_ylabel("Survival rate")
    axes[1].set_title("Survival rate by Pclass")

    embarked_rate = df.groupby("Embarked")[TARGET].mean().reindex(["S", "C", "Q"])
    axes[2].bar(embarked_rate.index.astype(str), embarked_rate.values, color="#16a085")
    axes[2].set_ylim(0, 1)
    axes[2].set_xlabel("Embarked")
    axes[2].set_ylabel("Survival rate")
    axes[2].set_title("Survival rate by Embarked")

    fig.suptitle("Bivariate: feature vs target", y=1.03)
    fig.tight_layout()
    return savefig(fig, "titanic_bivariate.png")


def plot_correlation(df: pd.DataFrame) -> Path:
    num = df.drop(columns=[c for c in ID_COLS if c in df.columns]).select_dtypes("number")
    corr = num.corr()
    fig, ax = plt.subplots(figsize=(7.5, 6.2))
    im = ax.imshow(corr, cmap="RdBu_r", vmin=-1, vmax=1)
    ax.set_xticks(range(len(corr.columns)))
    ax.set_yticks(range(len(corr.columns)))
    ax.set_xticklabels(corr.columns, rotation=45, ha="right")
    ax.set_yticklabels(corr.columns)
    for i in range(corr.shape[0]):
        for j in range(corr.shape[1]):
            ax.text(j, i, f"{corr.iloc[i, j]:.2f}", ha="center", va="center", fontsize=8)
    fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    ax.set_title("Numeric correlation matrix")
    return savefig(fig, "titanic_correlation.png")


def plot_age_fare_scatter(df: pd.DataFrame) -> Path:
    plot_df = df.dropna(subset=["Age"])
    fig, ax = plt.subplots(figsize=(7.2, 5))
    for label, color in [(0, "#7f8c8d"), (1, "#2980b9")]:
        sub = plot_df[plot_df[TARGET] == label]
        ax.scatter(
            sub["Age"],
            sub["Fare"],
            c=color,
            alpha=0.55,
            s=22,
            label="Survived" if label == 1 else "Did not survive",
            edgecolors="none",
        )
    ax.set_xlabel("Age (years)")
    ax.set_ylabel("Fare")
    ax.set_title("Age vs Fare by survival")
    ax.legend()
    return savefig(fig, "titanic_age_fare_scatter.png")


def plot_outliers(df: pd.DataFrame) -> Path:
    fig, axes = plt.subplots(1, 2, figsize=(9, 4.2))
    axes[0].boxplot(df["Age"].dropna(), vert=True, patch_artist=True)
    axes[0].set_title("Age outliers (boxplot)")
    axes[0].set_ylabel("Age (years)")
    axes[0].set_xticklabels(["Age"])

    axes[1].boxplot(df["Fare"], vert=True, patch_artist=True)
    axes[1].set_title("Fare outliers (boxplot)")
    axes[1].set_ylabel("Fare")
    axes[1].set_xticklabels(["Fare"])

    fig.suptitle("Cardinality & outliers: numeric extremes", y=1.03)
    fig.tight_layout()
    return savefig(fig, "titanic_outliers.png")


def write_summary(df: pd.DataFrame, profile: dict, figure_paths: list[Path]) -> Path:
    path = OUT_DIR / "titanic_eda_summary.txt"
    miss_lines = (
        "\n".join(f"  {k}: {v:.1%}" for k, v in profile["miss"].items())
        if len(profile["miss"])
        else "  (none)"
    )
    corr_lines = "\n".join(
        f"  {k}: {v:+.3f}" for k, v in profile["corr_with_target"].items()
    )
    card_lines = "\n".join(f"  {k}: {v}" for k, v in profile["cardinality"].items())
    fig_lines = "\n".join(f"  {p.name}" for p in figure_paths)

    text = f"""Titanic EDA summary (exploratory-data-analysis skill)
Source: core.datasets.get_titanic_dataset(n_samples=891, random_state=42)

1. Shape & types
  rows={profile["n_rows"]}, cols={profile["n_cols"]}
  memory={profile["memory_mb"]:.3f} MB
  dtypes:
{profile["dtypes"].to_string()}

2. Missingness
{miss_lines}

3. Target analysis
{profile["target_share"].to_string()}
  Note: moderate class imbalance — accuracy alone is insufficient; prefer ROC-AUC / F1.

4. Numeric summary
{profile["describe"].to_string()}

5. Correlations with Survived
{corr_lines}

6. Leakage scan (|corr| > 0.95 with target, IDs excluded)
  suspects: {profile["leakage"] if profile["leakage"] else "none"}
  ID columns excluded from modeling candidates: {ID_COLS}

7. Cardinality
{card_lines}

Candidate features (IDs excluded): Pclass, Sex, Age, SibSp, Parch, FamilySize, IsAlone, Fare, Embarked
Downstream: data-cleaning (Age missingness), then feature-engineering / model-evaluation.

Saved figures:
{fig_lines}
"""
    path.write_text(text, encoding="utf-8")
    return path


def main() -> None:
    setup_style()
    df = get_titanic_dataset(n_samples=891, random_state=42)
    profile = profile_frame(df)

    figure_paths = [
        plot_missingness(df),
        plot_target_balance(df),
        plot_univariate(df),
        plot_bivariate(df),
        plot_correlation(df),
        plot_age_fare_scatter(df),
        plot_outliers(df),
    ]
    summary_path = write_summary(df, profile, figure_paths)

    print(f"shape: {df.shape}")
    print(f"missing Age: {df['Age'].isna().mean():.1%}")
    print("target mix:")
    print(df[TARGET].value_counts(normalize=True).to_string())
    print("leakage suspects:", profile["leakage"] or "none")
    print("wrote:")
    for p in figure_paths + [summary_path]:
        print(f"  {p}")


if __name__ == "__main__":
    main()
