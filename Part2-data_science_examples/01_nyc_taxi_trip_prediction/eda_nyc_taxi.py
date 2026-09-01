#!/usr/bin/env python3
"""Exploratory data analysis for the NYC taxi trip dataset.

Follows the exploratory-data-analysis skill: shape/types, missingness,
targets, univariate, bivariate, leakage scan, cardinality/outliers.
EDA is computed on the training split only to avoid test leakage.
"""

from __future__ import annotations

import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "ml"))

from data_loader import generate_nyc_taxi_dataset  # noqa: E402
from features import engineer_features  # noqa: E402

N_SAMPLES = 20_000
RANDOM_STATE = 42
LEAKAGE_CORR_THRESHOLD = 0.95
OUTLIER_IQR_MULT = 1.5


def prepare_train_frame(raw: pd.DataFrame) -> pd.DataFrame:
    """Join spatial-temporal features onto the raw train rows (vectorized)."""
    feat = engineer_features(raw)
    keep = ["id", "vendor_id", "store_and_fwd_flag", "trip_duration", "fare_amount"]
    return pd.concat([raw[keep].reset_index(drop=True), feat.reset_index(drop=True)], axis=1)


def savefig(fig: plt.Figure, name: str) -> None:
    path = ROOT / name
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"saved {path.name}")


def plot_target_distributions(df: pd.DataFrame) -> None:
    fig, axes = plt.subplots(2, 2, figsize=(11, 8))
    for ax, col in zip(axes[0], ["trip_duration", "fare_amount"]):
        ax.hist(df[col], bins=60, color="#2c7fb8", edgecolor="white", linewidth=0.3)
        ax.set_title(col)
        ax.set_xlabel(col)
        ax.set_ylabel("count")
    for ax, col in zip(axes[1], ["trip_duration", "fare_amount"]):
        ax.hist(np.log1p(df[col]), bins=60, color="#7fcdbb", edgecolor="white", linewidth=0.3)
        ax.set_title(f"log1p({col})")
        ax.set_xlabel(f"log1p({col})")
        ax.set_ylabel("count")
    fig.suptitle("Target distributions (train)")
    fig.tight_layout()
    savefig(fig, "eda_target_distributions.png")


def plot_univariate(df: pd.DataFrame) -> None:
    cols = [
        "haversine_distance",
        "manhattan_distance",
        "pickup_hour",
        "passenger_count",
        "bearing",
        "dist_to_jfk",
    ]
    fig, axes = plt.subplots(2, 3, figsize=(12, 7))
    for ax, col in zip(axes.ravel(), cols):
        ax.hist(df[col], bins=40, color="#3182bd", edgecolor="white", linewidth=0.3)
        ax.set_title(col)
        ax.set_ylabel("count")
    fig.suptitle("Univariate feature distributions (train)")
    fig.tight_layout()
    savefig(fig, "eda_univariate_histograms.png")


def plot_bivariate(df: pd.DataFrame) -> None:
    sample = df.sample(n=min(4000, len(df)), random_state=RANDOM_STATE)
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    axes[0].scatter(
        sample["haversine_distance"],
        sample["trip_duration"],
        s=6,
        alpha=0.25,
        c="#2c7fb8",
        edgecolors="none",
    )
    axes[0].set_xlabel("haversine_distance (km)")
    axes[0].set_ylabel("trip_duration (s)")
    axes[0].set_title("Duration vs haversine distance")

    hour_mean = (
        df.groupby("pickup_hour", observed=True)["trip_duration"]
        .mean()
        .reset_index()
    )
    axes[1].bar(hour_mean["pickup_hour"], hour_mean["trip_duration"], color="#41b6c4")
    axes[1].set_xlabel("pickup_hour")
    axes[1].set_ylabel("mean trip_duration (s)")
    axes[1].set_title("Mean duration by hour")
    fig.suptitle("Bivariate: features vs trip_duration")
    fig.tight_layout()
    savefig(fig, "eda_bivariate_duration.png")


def plot_spatial(df: pd.DataFrame) -> None:
    sample = df.sample(n=min(5000, len(df)), random_state=RANDOM_STATE)
    fig, ax = plt.subplots(figsize=(7, 7))
    sc = ax.scatter(
        sample["pickup_longitude"],
        sample["pickup_latitude"],
        c=np.log1p(sample["trip_duration"]),
        s=5,
        alpha=0.35,
        cmap="viridis",
        edgecolors="none",
    )
    ax.set_xlabel("pickup_longitude")
    ax.set_ylabel("pickup_latitude")
    ax.set_title("Pickup locations (color = log1p duration)")
    fig.colorbar(sc, ax=ax, label="log1p(trip_duration)")
    fig.tight_layout()
    savefig(fig, "eda_pickup_map.png")


def plot_correlation_heatmap(num: pd.DataFrame) -> pd.Series:
    corr = num.corr()
    fig, ax = plt.subplots(figsize=(11, 9))
    im = ax.imshow(corr.values, cmap="RdBu_r", vmin=-1, vmax=1)
    ax.set_xticks(range(len(corr.columns)))
    ax.set_yticks(range(len(corr.columns)))
    ax.set_xticklabels(corr.columns, rotation=75, ha="right", fontsize=7)
    ax.set_yticklabels(corr.columns, fontsize=7)
    ax.set_title("Numeric correlation matrix (train)")
    fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    fig.tight_layout()
    savefig(fig, "eda_correlation_heatmap.png")

    target_corr = corr["trip_duration"].drop("trip_duration").sort_values(key=np.abs, ascending=False)
    fig, ax = plt.subplots(figsize=(8, 6))
    colors = np.where(target_corr.abs() > LEAKAGE_CORR_THRESHOLD, "#d73027", "#4575b4")
    ax.barh(target_corr.index, target_corr.values, color=colors)
    ax.axvline(LEAKAGE_CORR_THRESHOLD, color="#d73027", ls="--", lw=1, label=f"|r|={LEAKAGE_CORR_THRESHOLD}")
    ax.axvline(-LEAKAGE_CORR_THRESHOLD, color="#d73027", ls="--", lw=1)
    ax.set_xlabel("correlation with trip_duration")
    ax.set_title("Feature–target correlations (red = leakage suspect)")
    ax.legend()
    fig.tight_layout()
    savefig(fig, "eda_target_correlations.png")
    return target_corr


def iqr_outlier_share(series: pd.Series) -> float:
    q1, q3 = series.quantile(0.25), series.quantile(0.75)
    iqr = q3 - q1
    if iqr == 0:
        return 0.0
    mask = (series < q1 - OUTLIER_IQR_MULT * iqr) | (series > q3 + OUTLIER_IQR_MULT * iqr)
    return float(mask.mean())


def write_summary(
    *,
    n_full: int,
    n_train: int,
    n_test: int,
    dtypes: pd.Series,
    memory_mb: float,
    miss: pd.Series,
    num_describe: pd.DataFrame,
    target_corr: pd.Series,
    leakage: list[str],
    cardinality: pd.Series,
    outlier_share: pd.Series,
    duration_skew: float,
    fare_skew: float,
) -> None:
    miss_lines = (
        "\n".join(f"- `{c}`: {v:.2%}" for c, v in miss.items())
        if miss.any()
        else "- none (0% missing on all columns)"
    )
    leak_lines = (
        "\n".join(f"- `{c}` (|r|={target_corr[c]:.3f})" for c in leakage)
        if leakage
        else "- none above the 0.95 |r| threshold with `trip_duration`"
    )
    card_lines = "\n".join(f"- `{c}`: {int(v)} unique" for c, v in cardinality.items())
    out_lines = "\n".join(f"- `{c}`: {v:.2%} outside 1.5×IQR" for c, v in outlier_share.items())
    top_corr = target_corr.head(8)
    top_corr_lines = "\n".join(f"- `{c}`: {v:.3f}" for c, v in top_corr.items())

    text = f"""# NYC Taxi EDA hand-off

Training-split EDA only (test rows were held out before profiling).

## Shape & types
- Full generated rows: {n_full:,}
- Train / test: {n_train:,} / {n_test:,} (80/20, `random_state={RANDOM_STATE}`)
- Memory (train): {memory_mb:.2f} MB
- Dtypes: {", ".join(f"{k}={int(v)}" for k, v in dtypes.items())}

## Missingness
{miss_lines}

## Target analysis
- Primary target: `trip_duration` (seconds). Skew = {duration_skew:.2f} (right-skewed; log / RMSLE-friendly).
- Secondary target: `fare_amount` (USD). Skew = {fare_skew:.2f}.
- This is regression, not classification — no class imbalance. Duration skew still argues against raw MAE-only reporting.

## Univariate / numeric summary
See `eda_numeric_describe.csv` and `eda_univariate_histograms.png`.

## Bivariate (correlation with trip_duration)
{top_corr_lines}

## Leakage scan
{leak_lines}

Notes:
- `id` is an identifier — do not use as a feature.
- `fare_amount` is computed from duration, distance, and surcharges in the synthesizer. Using it to predict `trip_duration` (or vice versa without care) is post-outcome leakage.
- `manhattan_distance` and `haversine_distance` are highly collinear by construction; keep one or regularize.

## Cardinality
{card_lines}

## Outliers (1.5×IQR)
{out_lines}

## Candidate features for modeling
`haversine_distance` / `manhattan_distance`, `pickup_hour`, `is_rush_hour`, `is_late_night`, `is_weekend`, hub distances (`dist_to_jfk`, `dist_to_lga`, `dist_to_ewr`), `bearing`. Drop `id` and do not feed `fare_amount` into a duration model.

## Artifacts
- `eda_target_distributions.png`
- `eda_univariate_histograms.png`
- `eda_bivariate_duration.png`
- `eda_pickup_map.png`
- `eda_correlation_heatmap.png`
- `eda_target_correlations.png`
- `eda_numeric_describe.csv`
"""
    path = ROOT / "eda_summary.md"
    path.write_text(text)
    print(f"saved {path.name}")


def main() -> None:
    raw = generate_nyc_taxi_dataset(n_samples=N_SAMPLES, random_state=RANDOM_STATE)
    rng = np.random.default_rng(RANDOM_STATE)
    perm = rng.permutation(len(raw))
    n_test = int(len(raw) * 0.2)
    test_raw = raw.iloc[perm[:n_test]]
    train_raw = raw.iloc[perm[n_test:]]
    train = prepare_train_frame(train_raw)

    print("shape (train):", train.shape)
    print(train.dtypes.value_counts())
    memory_mb = train.memory_usage(deep=True).sum() / 1e6
    print(f"memory: {memory_mb:.2f} MB")

    miss_rate = train.isna().mean().sort_values(ascending=False)
    miss = miss_rate[miss_rate > 0]
    print("missing:", miss.to_dict() if not miss.empty else "none")

    duration_skew = float(train["trip_duration"].skew())
    fare_skew = float(train["fare_amount"].skew())
    print("duration skew:", duration_skew)

    num = train.select_dtypes("number")
    describe = num.describe().T
    describe.to_csv(ROOT / "eda_numeric_describe.csv")
    print("saved eda_numeric_describe.csv")

    corr_t = num.corr()["trip_duration"].drop("trip_duration").abs()
    leakage = corr_t[corr_t > LEAKAGE_CORR_THRESHOLD].index.tolist()
    print("LEAKAGE SUSPECTS:", leakage)

    cat_cols = ["vendor_id", "store_and_fwd_flag", "passenger_count", "pickup_hour", "pickup_dayofweek"]
    cardinality = train[cat_cols].nunique()

    outlier_cols = ["trip_duration", "fare_amount", "haversine_distance", "manhattan_distance"]
    outlier_share = pd.Series({c: iqr_outlier_share(train[c]) for c in outlier_cols})

    plot_target_distributions(train)
    plot_univariate(train)
    plot_bivariate(train)
    plot_spatial(train)
    target_corr = plot_correlation_heatmap(num)

    write_summary(
        n_full=len(raw),
        n_train=len(train),
        n_test=len(test_raw),
        dtypes=train.dtypes.value_counts(),
        memory_mb=memory_mb,
        miss=miss,
        num_describe=describe,
        target_corr=target_corr,
        leakage=leakage,
        cardinality=cardinality,
        outlier_share=outlier_share,
        duration_skew=duration_skew,
        fare_skew=fare_skew,
    )


if __name__ == "__main__":
    main()
