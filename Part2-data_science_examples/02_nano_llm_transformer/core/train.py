# NanoLlama Lightning-Fast SFT Training Pipeline (Multi-Threaded CPU, max_seq_len = 192)

import os
import sys
import json
import time
import math
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Maximize multi-core CPU utilization
cpu_cores = os.cpu_count() or 8
torch.set_num_threads(cpu_cores)
torch.set_num_interop_threads(cpu_cores)

from model import NanoLlama
from tokenizer import NanoTokenizer
from dataset import ChatDataset

CHECKPOINTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../server/checkpoints'))

def train_nanollama(
    epochs: int = 35,
    batch_size: int = 32,
    lr: float = 4.0e-3,
    max_seq_len: int = 192,
    export_dir: str = CHECKPOINTS_DIR
):
    os.makedirs(export_dir, exist_ok=True)
    print(f"🚀 Initializing High-Precision NanoLlama SFT Model Training ({cpu_cores} CPU threads)...", flush=True)
    start_time = time.time()

    # 1. Tokenizer
    tokenizer = NanoTokenizer()
    vocab_size = len(tokenizer.vocab)
    print(f"📖 Tokenizer Vocabulary: {vocab_size} clean ASCII & Special Tokens", flush=True)

    # 2. Model Initialization (128 Dim, 3 Layers, 4 Heads)
    dim = 128
    n_layers = 3
    n_heads = 4
    ffn_hidden_dim = 256

    model = NanoLlama(
        vocab_size=vocab_size,
        dim=dim,
        n_layers=n_layers,
        n_heads=n_heads,
        ffn_hidden_dim=ffn_hidden_dim,
        max_seq_len=max_seq_len
    )

    param_count = model.count_parameters()
    print(f"🧠 Model Architecture: {n_layers} Layers | {n_heads} Heads (dim {dim//n_heads}) | RoPE | SwiGLU ({ffn_hidden_dim}) | RMSNorm | MaxSeqLen {max_seq_len}", flush=True)
    print(f"📊 Total Trainable Parameters: {param_count:,}", flush=True)

    # 3. SFT Dataset with Assistant Token Loss Masking (repeat_factor=2 for high-precision convergence)
    dataset = ChatDataset(tokenizer=tokenizer, max_seq_len=max_seq_len, repeat_factor=2)
    train_size = int(len(dataset) * 0.92)
    val_size = len(dataset) - train_size
    train_ds, val_ds = torch.utils.data.random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)

    print(f"🧪 Training Samples: {len(train_ds)} | Validation Samples: {len(val_ds)} | Batches/Epoch: {len(train_loader)}", flush=True)

    # 4. Optimizer & Cosine LR Schedule
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=0.01, betas=(0.9, 0.95))
    total_steps = epochs * len(train_loader)
    warmup_steps = max(5, int(total_steps * 0.05))

    def get_lr(step: int) -> float:
        if step < warmup_steps:
            return lr * (step + 1) / warmup_steps
        progress = (step - warmup_steps) / max(1, total_steps - warmup_steps)
        return lr * 0.05 + 0.5 * lr * 0.95 * (1.0 + math.cos(math.pi * progress))

    # 5. Training Loop
    telemetry_loss_curve = []
    telemetry_val_curve = []
    global_step = 0

    print("\n🏋️ Starting High-Precision Optimization Loop...", flush=True)
    for epoch in range(1, epochs + 1):
        model.train()
        epoch_loss = 0.0
        t0 = time.time()

        for batch_x, batch_y in train_loader:
            curr_lr = get_lr(global_step)
            for param_group in optimizer.param_groups:
                param_group['lr'] = curr_lr

            optimizer.zero_grad()
            _, loss, _ = model(batch_x, targets=batch_y)
            loss.backward()

            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()

            epoch_loss += loss.item()
            global_step += 1

        avg_train_loss = epoch_loss / len(train_loader)
        train_ppl = math.exp(min(20.0, avg_train_loss))

        # Validation Step
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                _, v_loss, _ = model(batch_x, targets=batch_y)
                val_loss += v_loss.item()

        avg_val_loss = val_loss / len(val_loader)
        val_ppl = math.exp(min(20.0, avg_val_loss))
        elapsed = time.time() - t0

        telemetry_loss_curve.append(round(avg_train_loss, 4))
        telemetry_val_curve.append(round(avg_val_loss, 4))

        if epoch % 2 == 0 or epoch == epochs or epoch <= 5:
            print(f"  Epoch [{epoch:02d}/{epochs:02d}] | Train Loss: {avg_train_loss:.4f} (PPL: {train_ppl:.2f}) | Val Loss: {avg_val_loss:.4f} (PPL: {val_ppl:.2f}) | LR: {curr_lr:.6f} | Time: {elapsed:.2f}s", flush=True)

    total_training_time = round(time.time() - start_time, 2)
    print(f"\n✅ Training Complete in {total_training_time}s!", flush=True)
    print(f"🎯 Final Validation Loss: {avg_val_loss:.4f} | Perplexity: {val_ppl:.2f}", flush=True)

    # 6. Save Checkpoints & Artifacts
    print(f"💾 Saving Checkpoints to '{export_dir}'...", flush=True)

    # Save Tokenizer
    tokenizer.save(os.path.join(export_dir, 'tokenizer.json'))

    # Save Model Checkpoint
    checkpoint = {
        "state_dict": model.state_dict(),
        "config": {
            "vocab_size": vocab_size,
            "dim": dim,
            "n_layers": n_layers,
            "n_heads": n_heads,
            "ffn_hidden_dim": ffn_hidden_dim,
            "max_seq_len": max_seq_len
        },
        "train_loss": avg_train_loss,
        "val_loss": avg_val_loss,
        "perplexity": val_ppl,
        "parameters": param_count
    }
    torch.save(checkpoint, os.path.join(export_dir, 'model.pt'))

    # Save Telemetry Metadata
    telemetry = {
        "epochs": epochs,
        "batch_size": batch_size,
        "lr": lr,
        "final_train_loss": round(avg_train_loss, 4),
        "final_val_loss": round(avg_val_loss, 4),
        "perplexity": round(val_ppl, 2),
        "training_time_sec": total_training_time,
        "parameters": param_count,
        "train_loss_curve": telemetry_loss_curve,
        "val_loss_curve": telemetry_val_curve,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    with open(os.path.join(export_dir, 'telemetry.json'), 'w', encoding='utf-8') as f:
        json.dump(telemetry, f, indent=2)

    print("🎉 All artifacts and checkpoints saved successfully!", flush=True)
    return telemetry

if __name__ == "__main__":
    train_nanollama()
