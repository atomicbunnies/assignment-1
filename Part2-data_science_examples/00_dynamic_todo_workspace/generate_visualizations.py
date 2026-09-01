#!/usr/bin/env python3
"""Publication-ready Zenith Task productivity charts.

Follows visualization-builder: message-driven chart types, aggregation before
plotting, whitegrid + accessible palette, annotated findings, 300 DPI export.
"""

from __future__ import annotations

from datetime import date, timedelta
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

OUT_DIR = Path(__file__).resolve().parent
SOURCE = "Zenith Task synthetic telemetry · 31 Aug 2026"
TODAY = date(2026, 8, 31)

# Okabe–Ito (colorblind-safe)
PALETTE = {
    "blue": "#0072B2",
    "orange": "#E69F00",
    "green": "#009E73",
    "sky": "#56B4E9",
    "yellow": "#F0E442",
    "vermillion": "#D55E00",
    "purple": "#CC79A7",
    "grey": "#999999",
    "ink": "#222222",
}


def apply_style() -> None:
    sns.set_theme(style="whitegrid", context="talk")
    plt.rcParams.update(
        {
            "font.family": "sans-serif",
            "font.sans-serif": ["Helvetica Neue", "Arial", "DejaVu Sans"],
            "axes.titlesize": 14,
            "axes.titleweight": "bold",
            "axes.labelsize": 11,
            "axes.labelcolor": PALETTE["ink"],
            "xtick.labelsize": 10,
            "ytick.labelsize": 10,
            "figure.facecolor": "white",
            "axes.facecolor": "white",
            "axes.edgecolor": PALETTE["ink"],
            "axes.spines.top": False,
            "axes.spines.right": False,
            "grid.alpha": 0.2,
            "grid.linestyle": "-",
            "legend.frameon": False,
            "savefig.dpi": 300,
            "savefig.bbox": "tight",
            "savefig.facecolor": "white",
        }
    )


def add_footer(fig: plt.Figure, note: str) -> None:
    fig.text(0.01, 0.01, note, fontsize=8, color=PALETTE["grey"], ha="left")


def save(fig: plt.Figure, name: str) -> Path:
    path = OUT_DIR / name
    fig.savefig(path, dpi=300)
    plt.close(fig)
    print(f"saved {path.name}")
    return path


def build_task_data(rng: np.random.Generator) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Daily completions (trend grain) and per-task rows (distribution/relationship)."""
    n_days = 42
    dates = pd.date_range(TODAY - timedelta(days=n_days - 1), periods=n_days, freq="D")
    weekday = dates.dayofweek.to_numpy()
    weekend = weekday >= 5
    baseline = np.where(weekend, 3.0, 8.5)
    trend = np.linspace(0.0, 2.4, n_days)
    noise = rng.normal(0, 1.1, n_days)
    completed = np.clip(np.round(baseline + trend + noise), 1, None).astype(int)
    created = np.clip(completed + rng.integers(-2, 5, n_days), 2, None)
    daily = pd.DataFrame(
        {
            "date": dates,
            "completed": completed,
            "created": created,
            "open_backlog": np.clip(np.cumsum(created - completed) + 18, 4, None),
        }
    )

    categories = np.array(["Engineering", "Writing", "Ops", "Research", "Personal"])
    cat_p = np.array([0.38, 0.18, 0.16, 0.16, 0.12])
    priorities = np.array(["low", "medium", "high", "urgent"])
    pri_p = np.array([0.18, 0.42, 0.28, 0.12])
    statuses = np.array(["todo", "in_progress", "review", "completed"])

    n_tasks = 160
    cat = rng.choice(categories, n_tasks, p=cat_p)
    pri = rng.choice(priorities, n_tasks, p=pri_p)
    estimated = rng.choice([15, 30, 45, 60, 90, 120], n_tasks, p=[0.12, 0.28, 0.22, 0.2, 0.12, 0.06])
    # Urgent/high tasks overrun more often
    overrun = np.where(np.isin(pri, ["high", "urgent"]), 1.28, 0.92)
    actual = np.clip(
        rng.normal(estimated * overrun, estimated * 0.22).round(), 5, 240
    ).astype(int)

    done_mask = rng.random(n_tasks) < 0.62
    status = np.where(done_mask, "completed", rng.choice(statuses[:-1], n_tasks))
    # Completed tasks slightly more likely in Engineering
    tasks = pd.DataFrame(
        {
            "category": cat,
            "priority": pri,
            "status": status,
            "estimated_minutes": estimated,
            "actual_minutes": actual,
            "completed": done_mask,
        }
    )
    return daily, tasks


def chart_comparison_priority(tasks: pd.DataFrame) -> None:
    """Comparison: urgent work is a small share of volume but a large share of overruns."""
    order = ["low", "medium", "high", "urgent"]
    summary = (
        tasks.assign(overrun=tasks["actual_minutes"] > tasks["estimated_minutes"] * 1.1)
        .groupby("priority", as_index=False)
        .agg(tasks=("priority", "size"), overrun_rate=("overrun", "mean"))
    )
    summary["priority"] = pd.Categorical(summary["priority"], order, ordered=True)
    summary = summary.sort_values("priority")
    summary["overrun_pct"] = (summary["overrun_rate"] * 100).round(0).astype(int)
    urgent_share = 100 * summary.loc[summary["priority"] == "urgent", "tasks"].iloc[0] / summary["tasks"].sum()
    urgent_overrun = int(summary.loc[summary["priority"] == "urgent", "overrun_pct"].iloc[0])

    colors = [PALETTE["grey"], PALETTE["sky"], PALETTE["orange"], PALETTE["vermillion"]]
    fig, ax = plt.subplots(figsize=(8.5, 5.2))
    bars = ax.bar(summary["priority"].astype(str), summary["tasks"], color=colors, width=0.68)
    bars[-1].set_edgecolor(PALETTE["ink"])
    bars[-1].set_linewidth(1.4)
    ax.set_ylabel("Tasks")
    ax.set_xlabel("")
    ax.set_ylim(0, summary["tasks"].max() * 1.22)
    ax.set_title(
        f"Urgent tasks are {urgent_share:.0f}% of volume but {urgent_overrun}% overrun estimates"
    )
    for bar, pct in zip(bars, summary["overrun_pct"]):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 2,
            f"{pct}% overrun",
            ha="center",
            va="bottom",
            fontsize=9,
            color=PALETTE["ink"],
        )
    add_footer(fig, SOURCE)
    save(fig, "viz_priority_comparison.png")


def chart_trend_velocity(daily: pd.DataFrame) -> None:
    """Trend: completions rose after a mid-period dip; weekend troughs persist."""
    d = daily.copy()
    d["ma7"] = d["completed"].rolling(7, min_periods=3).mean()
    last = d.iloc[-1]
    first_ma = d["ma7"].dropna().iloc[0]
    last_ma = d["ma7"].dropna().iloc[-1]
    lift = (last_ma / first_ma - 1) * 100

    fig, ax = plt.subplots(figsize=(9.5, 5.2))
    ax.plot(d["date"], d["completed"], color=PALETTE["sky"], lw=1.4, alpha=0.55, label="Daily completions")
    ax.plot(d["date"], d["ma7"], color=PALETTE["blue"], lw=2.8, label="7-day average")
    ax.axhline(d["completed"].mean(), color=PALETTE["grey"], ls="--", lw=1, alpha=0.8)
    ax.scatter([last["date"]], [last["completed"]], color=PALETTE["blue"], zorder=5, s=36)
    ax.annotate(
        f"{int(last['completed'])} done\n{TODAY:%d %b}",
        xy=(last["date"], last["completed"]),
        xytext=(-70, 18),
        textcoords="offset points",
        fontsize=9,
        color=PALETTE["blue"],
        arrowprops=dict(arrowstyle="->", color=PALETTE["blue"], lw=0.8),
    )
    ax.set_ylabel("Tasks completed")
    ax.set_xlabel("")
    ax.set_title(f"Completion velocity is up {lift:.0f}% vs early August (7-day avg)")
    ax.legend(loc="upper left", fontsize=9)
    fig.autofmt_xdate()
    add_footer(fig, SOURCE)
    save(fig, "viz_completion_trend.png")


def chart_composition_status(tasks: pd.DataFrame) -> None:
    """Composition: stacked bars by category — completed share, not a pie."""
    order_status = ["completed", "review", "in_progress", "todo"]
    cat_order = (
        tasks.groupby("category").size().sort_values(ascending=False).index.tolist()
    )
    counts = (
        tasks.groupby(["category", "status"]).size().unstack(fill_value=0).reindex(cat_order)
    )
    for col in order_status:
        if col not in counts.columns:
            counts[col] = 0
    counts = counts[order_status]
    shares = counts.div(counts.sum(axis=1), axis=0)
    eng_done = shares.loc["Engineering", "completed"] * 100 if "Engineering" in shares.index else 0

    colors = {
        "completed": PALETTE["green"],
        "review": PALETTE["yellow"],
        "in_progress": PALETTE["blue"],
        "todo": PALETTE["grey"],
    }
    fig, ax = plt.subplots(figsize=(9, 5.4))
    bottom = np.zeros(len(counts))
    x = np.arange(len(counts))
    for status in order_status:
        vals = counts[status].to_numpy()
        ax.bar(x, vals, bottom=bottom, color=colors[status], width=0.68, label=status.replace("_", " "))
        bottom += vals
    ax.set_xticks(x)
    ax.set_xticklabels(counts.index, rotation=0)
    ax.set_ylabel("Tasks")
    ax.set_title(f"Engineering holds the most work — {eng_done:.0f}% of it is already done")
    ax.legend(ncol=4, loc="upper right", fontsize=9)
    add_footer(fig, SOURCE)
    save(fig, "viz_status_composition.png")


def chart_distribution_focus(tasks: pd.DataFrame) -> None:
    """Distribution: actual focus minutes skew right; median under 1 hour."""
    minutes = tasks.loc[tasks["completed"], "actual_minutes"]
    median = minutes.median()
    p90 = minutes.quantile(0.9)

    fig, ax = plt.subplots(figsize=(8.8, 5.2))
    sns.histplot(minutes, bins=18, color=PALETTE["sky"], edgecolor="white", ax=ax)
    ax.axvline(median, color=PALETTE["vermillion"], lw=2.2, label=f"Median {median:.0f} min")
    ax.axvline(p90, color=PALETTE["orange"], lw=1.6, ls="--", label=f"90th pct {p90:.0f} min")
    ax.set_xlabel("Actual minutes (completed tasks)")
    ax.set_ylabel("Tasks")
    ax.set_title("Most finished work lands under an hour; a long tail of 2h+ sessions")
    ax.legend(loc="upper right", fontsize=9)
    add_footer(fig, SOURCE)
    save(fig, "viz_focus_distribution.png")


def chart_relationship_estimate(tasks: pd.DataFrame) -> None:
    """Relationship: estimates vs actuals — high/urgent sit above the 1:1 line."""
    fig, ax = plt.subplots(figsize=(7.8, 7.2))
    pri_color = {
        "low": PALETTE["grey"],
        "medium": PALETTE["sky"],
        "high": PALETTE["orange"],
        "urgent": PALETTE["vermillion"],
    }
    for pri, grp in tasks.groupby("priority"):
        ax.scatter(
            grp["estimated_minutes"],
            grp["actual_minutes"],
            c=pri_color[str(pri)],
            alpha=0.75 if pri in ("high", "urgent") else 0.45,
            s=42 if pri in ("high", "urgent") else 28,
            label=str(pri),
            edgecolors="none",
        )
    lim = max(tasks["estimated_minutes"].max(), tasks["actual_minutes"].max()) * 1.05
    ax.plot([0, lim], [0, lim], color=PALETTE["ink"], lw=1, ls=":", label="1:1 estimate")
    ax.set_xlim(0, lim)
    ax.set_ylim(0, lim)
    ax.set_xlabel("Estimated minutes")
    ax.set_ylabel("Actual minutes")
    ax.set_title("High and urgent work systematically exceeds the estimate line")
    ax.legend(title="Priority", fontsize=9, title_fontsize=9, loc="upper left")
    ax.set_aspect("equal", adjustable="box")
    add_footer(fig, SOURCE)
    save(fig, "viz_estimate_vs_actual.png")


def chart_heatmap_activity(daily: pd.DataFrame) -> None:
    """GitHub-style 6-week completion heatmap (dashboard companion)."""
    d = daily.copy()
    d["weekday"] = d["date"].dt.day_name().str[:3]
    d["week"] = ((d["date"] - d["date"].min()).dt.days // 7).astype(int)
    day_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    grid = d.pivot_table(index="weekday", columns="week", values="completed", aggfunc="sum")
    grid = grid.reindex(day_order)

    fig, ax = plt.subplots(figsize=(10, 3.8))
    sns.heatmap(
        grid,
        cmap=sns.light_palette(PALETTE["green"], as_cmap=True),
        linewidths=2,
        linecolor="white",
        square=True,
        cbar_kws={"label": "Completions", "shrink": 0.8},
        ax=ax,
    )
    ax.set_xlabel("Week")
    ax.set_ylabel("")
    ax.set_title("Weekday completions dominate; weekends stay consistently quiet")
    add_footer(fig, SOURCE)
    save(fig, "viz_activity_heatmap.png")


def main() -> None:
    apply_style()
    rng = np.random.default_rng(42)
    daily, tasks = build_task_data(rng)
    daily.to_csv(OUT_DIR / "viz_daily_completions.csv", index=False)
    tasks.to_csv(OUT_DIR / "viz_task_sample.csv", index=False)
    print("saved viz_daily_completions.csv")
    print("saved viz_task_sample.csv")

    chart_comparison_priority(tasks)
    chart_trend_velocity(daily)
    chart_composition_status(tasks)
    chart_distribution_focus(tasks)
    chart_relationship_estimate(tasks)
    chart_heatmap_activity(daily)


if __name__ == "__main__":
    main()
