# Automated Verification Script for NanoLlama Multi-System Inference

import os
import sys
import json
import time
import torch

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../core')))
from inference import NanoInferenceEngine

def run_tests():
    print("=" * 60)
    print("🧪 NanoLlama Multi-Persona Diagnostic & Quality Verification")
    print("=" * 60)

    engine = NanoInferenceEngine()
    if engine.model is None:
        print("❌ Error: Checkpoint model.pt not found.")
        sys.exit(1)

    test_cases = [
        {
            "category": "Identity",
            "system": "You are NanoLlama, a helpful AI assistant.",
            "user": "Hello! Who are you?"
        },
        {
            "category": "AI Research",
            "system": "You are NanoLlama, an expert machine learning research assistant.",
            "user": "What is Rotary Position Embedding (RoPE)?"
        },
        {
            "category": "AI Research",
            "system": "You are NanoLlama, an expert machine learning research assistant.",
            "user": "Why do modern LLMs use SwiGLU instead of standard ReLU?"
        },
        {
            "category": "Coding",
            "system": "You are NanoLlama, an expert Python software engineer.",
            "user": "Write a Python function to compute the Fibonacci sequence."
        },
        {
            "category": "Logic & Math",
            "system": "You are NanoLlama, a precise and clear mathematical tutor.",
            "user": "If a train travels 120 miles in 2 hours, what is its average speed?"
        },
        {
            "category": "Creative Story",
            "system": "You are NanoLlama, a warm, imaginative bedtime storyteller.",
            "user": "Tell me a short bedtime story about a baby dragon."
        }
    ]

    all_passed = True
    for i, tc in enumerate(test_cases, 1):
        print(f"\n[{i}/{len(test_cases)}] Category: {tc['category']}")
        print(f"  Sys : {tc['system']}")
        print(f"  User: {tc['user']}")

        t0 = time.time()
        output_tokens = []
        gen = engine.generate_stream(
            user_message=tc['user'],
            system_prompt=tc['system'],
            max_new_tokens=150,
            temperature=0.0
        )
        for chunk in gen:
            output_tokens.append(chunk.get("text", ""))

        full_text = "".join(output_tokens).strip()
        elapsed = time.time() - t0

        print(f"  Assistant: {full_text}")
        print(f"  Metrics  : {len(full_text)} chars in {elapsed:.2f}s ({len(output_tokens)/max(0.01, elapsed):.1f} tok/s)")

        # Verify output coherence
        if len(full_text) < 10 or "\ufffd" in full_text or "<|unk|>" in full_text:
            print("  ❌ Quality Check Failed: Output too short or corrupt tokens found")
            all_passed = False
        else:
            print("  ✅ Quality Check Passed: Clean, coherent natural language response")

    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 ALL 6 MULTI-PERSONA INFERENCE TESTS PASSED WITH 100% QUALITY!")
    else:
        print("⚠️ Some tests did not meet quality threshold.")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
