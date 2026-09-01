"""NanoLlama skill visualizations: primitives, training telemetry, and dataset stats.

Reads the published checkpoint telemetry and the skill-spec architecture
(3 layers, 4 heads, d_model=128, SwiGLU, RoPE, RMSNorm) and writes PNG/CSV
artifacts next to this script.
"""

from __future__ import annotations

import ast
import csv
import json
import math
import os
import re
import tempfile
from pathlib import Path

os.environ.setdefault("MPLCONFIGDIR", tempfile.mkdtemp(prefix="mplconfig_"))
os.environ.setdefault("MPLBACKEND", "Agg")

import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parent
TELEMETRY_PATH = ROOT / "server" / "checkpoints" / "telemetry.json"

# Skill spec (nano-llm-transformer SKILL.md)
SKILL_N_LAYERS = 3
SKILL_N_HEADS = 4
SKILL_D_MODEL = 128
SKILL_FFN_HIDDEN = 384
SKILL_CTX = 96
SKILL_PARAMS = 672_512
TARGET_VAL_LOSS = 0.06
TARGET_PPL = 1.10

# Matching the AdamW cosine schedule in core/train.py
PEAK_LR = 4.0e-3
N_EPOCHS = 35
WARMUP_FRAC = 0.05


def load_telemetry() -> dict:
    with TELEMETRY_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def perplexity(loss: np.ndarray) -> np.ndarray:
    return np.exp(np.clip(loss, a_min=None, a_max=20.0))


def cosine_lr(steps: int, peak_lr: float = PEAK_LR, warmup_frac: float = WARMUP_FRAC) -> np.ndarray:
    warmup = max(5, int(steps * warmup_frac))
    lrs = np.zeros(steps, dtype=np.float64)
    for step in range(steps):
        if step < warmup:
            lrs[step] = peak_lr * (step + 1) / warmup
        else:
            progress = (step - warmup) / max(1, steps - warmup)
            lrs[step] = peak_lr * 0.05 + 0.5 * peak_lr * 0.95 * (1.0 + math.cos(math.pi * progress))
    return lrs


def _parse_knowledge_base() -> list[tuple[list[str], list[int]]]:
    """Parse KNOWLEDGE_BASE from dataset.py without importing torch."""
    src = (ROOT / "core" / "dataset.py").read_text(encoding="utf-8")
    start = src.index("KNOWLEDGE_BASE = [")
    end = src.index("\ndef build_dialogues")
    block = src[start:end]
    block = re.sub(r"SYSTEM_PROMPTS\[(\d+)\]", r"\1", block)
    module = ast.parse(block)
    assign = module.body[0]
    entries: list[tuple[list[str], list[int]]] = []
    for elt in assign.value.elts:
        queries = [ast.literal_eval(q) for q in elt.elts[0].elts]
        sys_ids = [ast.literal_eval(s) for s in elt.elts[2].elts]
        entries.append((queries, sys_ids))
    return entries


def dataset_topic_counts() -> dict[str, int]:
    kb = _parse_knowledge_base()
    labels = [
        "Identity & Architecture",
        "ML Foundations",
        "Evaluation & Metrics",
        "Algorithms & Architectures",
        "Python Coding",
        "Creative & Logic",
    ]
    # Topic groups match the numbered comments in core/dataset.py.
    boundaries = [0, 7, 16, 20, 26, 32, len(kb)]
    counts: dict[str, int] = {}
    for i, name in enumerate(labels):
        start, end = boundaries[i], boundaries[i + 1]
        n_prompts = sum(len(kb[j][0]) for j in range(start, end))
        counts[name] = n_prompts
    n_dialogues = 0
    for queries, sys_ids in kb:
        for _q in queries:
            n_dialogues += len(sys_ids) + 1  # extra default system prompt in build_dialogues
    counts["Total dialogues (expanded)"] = n_dialogues
    return counts


def style_axes(ax, title: str, xlabel: str, ylabel: str) -> None:
    ax.set_title(title)
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(alpha=0.25, linestyle="--")


def plot_training_curves(tel: dict, out: Path) -> None:
    train = np.array(tel["train_loss_curve"], dtype=np.float64)
    val = np.array(tel["val_loss_curve"], dtype=np.float64)
    epochs = np.arange(1, len(train) + 1)

    fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))

    axes[0].plot(epochs, train, label="Train CE loss", color="#1f77b4", linewidth=2)
    axes[0].plot(epochs, val, label="Val CE loss", color="#ff7f0e", linewidth=2)
    axes[0].axhline(TARGET_VAL_LOSS, color="#2ca02c", linestyle="--", linewidth=1.5, label=f"Skill target loss < {TARGET_VAL_LOSS}")
    style_axes(axes[0], "Cross-entropy loss vs epoch", "Epoch", "Loss")
    axes[0].legend(frameon=False)
    axes[0].set_yscale("log")

    axes[1].plot(epochs, perplexity(train), label="Train PPL", color="#1f77b4", linewidth=2)
    axes[1].plot(epochs, perplexity(val), label="Val PPL", color="#ff7f0e", linewidth=2)
    axes[1].axhline(TARGET_PPL, color="#2ca02c", linestyle="--", linewidth=1.5, label=f"Skill target PPL < {TARGET_PPL}")
    style_axes(axes[1], "Perplexity vs epoch", "Epoch", "Perplexity")
    axes[1].legend(frameon=False)
    axes[1].set_yscale("log")

    fig.suptitle("NanoLlama SFT telemetry (AdamW + cosine LR)", fontsize=13)
    fig.tight_layout()
    fig.savefig(out, dpi=160, bbox_inches="tight")
    plt.close(fig)


def plot_rope(out: Path) -> None:
    head_dim = SKILL_D_MODEL // SKILL_N_HEADS  # 32
    theta = 10_000.0
    freqs = 1.0 / (theta ** (np.arange(0, head_dim, 2) / head_dim))
    positions = np.arange(SKILL_CTX)
    angles = np.outer(positions, freqs)

    fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))

    for i, freq in enumerate(freqs[:6]):
        axes[0].plot(positions, np.cos(positions * freq), label=f"pair {i}", linewidth=1.6)
    style_axes(axes[0], r"RoPE $\cos(m\theta_i)$ for first 6 frequency pairs", "Position $m$", "Cosine")
    axes[0].legend(frameon=False, ncol=2, fontsize=8)

    im = axes[1].imshow(np.cos(angles).T, aspect="auto", origin="lower", cmap="coolwarm", vmin=-1, vmax=1)
    style_axes(axes[1], "RoPE cosine table (head_dim=32, ctx=96)", "Position $m$", "Frequency pair $i$")
    fig.colorbar(im, ax=axes[1], fraction=0.046, pad=0.04)

    fig.suptitle("Rotary Position Embeddings (skill spec)", fontsize=13)
    fig.tight_layout()
    fig.savefig(out, dpi=160, bbox_inches="tight")
    plt.close(fig)


def plot_swiglu_rmsnorm(out: Path) -> None:
    x = np.linspace(-4, 4, 400)
    silu = x / (1.0 + np.exp(-x))
    relu = np.maximum(x, 0.0)
    gelu = 0.5 * x * (1.0 + np.tanh(np.sqrt(2.0 / np.pi) * (x + 0.044715 * x**3)))
    # Illustrative SwiGLU gate: silu(x) * x (unit weights)
    swiglu_gate = silu * x

    fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))

    axes[0].plot(x, relu, label="ReLU", linewidth=1.8)
    axes[0].plot(x, gelu, label="GELU", linewidth=1.8)
    axes[0].plot(x, silu, label="SiLU / Swish", linewidth=1.8)
    axes[0].plot(x, swiglu_gate, label=r"SiLU$(x)\odot x$ (unit SwiGLU)", linewidth=2.0)
    style_axes(axes[0], "Gated FFN activations", "x", "f(x)")
    axes[0].legend(frameon=False, fontsize=8)

    rng = np.random.default_rng(42)
    raw = rng.normal(loc=2.0, scale=1.5, size=(512, SKILL_D_MODEL))
    rms = np.sqrt(np.mean(raw**2, axis=-1, keepdims=True) + 1e-6)
    rmsnormed = raw / rms

    axes[1].hist(raw.ravel(), bins=50, density=True, alpha=0.55, label="Pre-norm activations")
    axes[1].hist(rmsnormed.ravel(), bins=50, density=True, alpha=0.55, label="RMSNorm (γ=1)")
    style_axes(axes[1], "RMSNorm rescales without mean-centering", "Activation", "Density")
    axes[1].legend(frameon=False)

    fig.suptitle("SwiGLU gating and RMSNorm (skill primitives)", fontsize=13)
    fig.tight_layout()
    fig.savefig(out, dpi=160, bbox_inches="tight")
    plt.close(fig)


def plot_lr_and_architecture(tel: dict, out: Path) -> None:
    steps = N_EPOCHS * 8  # illustrative step axis; shape matches cosine + warmup
    lrs = cosine_lr(steps)

    fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))

    axes[0].plot(np.arange(steps), lrs, color="#9467bd", linewidth=2)
    axes[0].axvline(max(5, int(steps * WARMUP_FRAC)), color="gray", linestyle=":", label="End of warmup")
    style_axes(axes[0], "AdamW cosine annealing with linear warmup", "Optimizer step", "Learning rate")
    axes[0].legend(frameon=False)

    labels = ["Layers", "Heads", r"$d_{model}$", "FFN hidden", "Context"]
    skill_vals = [SKILL_N_LAYERS, SKILL_N_HEADS, SKILL_D_MODEL, SKILL_FFN_HIDDEN, SKILL_CTX]
    trained_vals = [3, 4, 128, 256, 192]
    x = np.arange(len(labels))
    w = 0.35
    axes[1].bar(x - w / 2, skill_vals, w, label="SKILL.md spec", color="#1f77b4")
    axes[1].bar(x + w / 2, trained_vals, w, label="Trained checkpoint", color="#ff7f0e")
    axes[1].set_xticks(x, labels)
    style_axes(axes[1], "Architecture: skill spec vs trained run", "", "Value")
    axes[1].legend(frameon=False)
    axes[1].text(
        0.02,
        0.95,
        f"Skill params: {SKILL_PARAMS:,}\nTelemetry params: {tel.get('parameters', 0):,}",
        transform=axes[1].transAxes,
        va="top",
        fontsize=9,
    )

    fig.suptitle("Optimizer schedule and model dimensions", fontsize=13)
    fig.tight_layout()
    fig.savefig(out, dpi=160, bbox_inches="tight")
    plt.close(fig)


def plot_dataset(counts: dict[str, int], out: Path) -> None:
    topics = {k: v for k, v in counts.items() if not k.startswith("Total")}
    names = list(topics.keys())
    vals = list(topics.values())

    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.barh(names[::-1], vals[::-1], color="#17becf")
    ax.bar_label(bars, padding=4)
    style_axes(
        ax,
        f"SFT knowledge-base prompt counts ({counts['Total dialogues (expanded)']} expanded dialogues)",
        "Number of question variants",
        "",
    )
    fig.tight_layout()
    fig.savefig(out, dpi=160, bbox_inches="tight")
    plt.close(fig)


def write_metrics_csv(tel: dict, counts: dict[str, int], out: Path) -> None:
    train = np.array(tel["train_loss_curve"], dtype=np.float64)
    val = np.array(tel["val_loss_curve"], dtype=np.float64)
    val_ppl = perplexity(val)
    met_loss = bool(val[-1] < TARGET_VAL_LOSS)
    met_ppl = bool(val_ppl[-1] < TARGET_PPL)

    rows = [
        ("epochs", tel["epochs"]),
        ("batch_size", tel["batch_size"]),
        ("lr", tel["lr"]),
        ("final_train_loss", tel["final_train_loss"]),
        ("final_val_loss", tel["final_val_loss"]),
        ("final_val_perplexity", float(val_ppl[-1])),
        ("skill_target_val_loss", TARGET_VAL_LOSS),
        ("skill_target_ppl", TARGET_PPL),
        ("met_val_loss_target", met_loss),
        ("met_ppl_target", met_ppl),
        ("training_time_sec", tel["training_time_sec"]),
        ("trained_parameters", tel["parameters"]),
        ("skill_parameters", SKILL_PARAMS),
        ("min_val_loss", float(val.min())),
        ("min_val_ppl", float(val_ppl.min())),
        ("dataset_expanded_dialogues", counts["Total dialogues (expanded)"]),
    ]
    with out.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["metric", "value"])
        writer.writerows(rows)

    curve_path = out.with_name("training_curves.csv")
    with curve_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["epoch", "train_loss", "val_loss", "train_ppl", "val_ppl"])
        for i, (tr, va) in enumerate(zip(train, val), start=1):
            writer.writerow([i, tr, va, float(perplexity(np.array([tr]))[0]), float(perplexity(np.array([va]))[0])])


def main() -> None:
    os.chdir(ROOT)
    tel = load_telemetry()
    counts = dataset_topic_counts()

    plot_training_curves(tel, ROOT / "training_curves.png")
    plot_rope(ROOT / "rope_embeddings.png")
    plot_swiglu_rmsnorm(ROOT / "swiglu_rmsnorm.png")
    plot_lr_and_architecture(tel, ROOT / "lr_and_architecture.png")
    plot_dataset(counts, ROOT / "dataset_topics.png")
    write_metrics_csv(tel, counts, ROOT / "metrics_summary.csv")

    val = np.array(tel["val_loss_curve"], dtype=np.float64)
    val_ppl = float(perplexity(val)[-1])
    print("Wrote visualizations to", ROOT)
    print(f"  training_curves.png")
    print(f"  rope_embeddings.png")
    print(f"  swiglu_rmsnorm.png")
    print(f"  lr_and_architecture.png")
    print(f"  dataset_topics.png")
    print(f"  metrics_summary.csv")
    print(f"  training_curves.csv")
    print(
        f"Final val loss={val[-1]:.4f} (target < {TARGET_VAL_LOSS}): {val[-1] < TARGET_VAL_LOSS}; "
        f"PPL={val_ppl:.4f} (target < {TARGET_PPL}): {val_ppl < TARGET_PPL}"
    )


if __name__ == "__main__":
    main()
