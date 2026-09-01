import os
import sys
from inference import NanoInferenceEngine

def main():
    engine = NanoInferenceEngine()
    test_questions = [
        "What is machine learning?",
        "Explain backpropagation.",
        "What is a neural network?",
        "What is gradient descent?",
        "What is overfitting?"
    ]

    print("\n" + "="*70)
    print("🧪 NANOLAMA TEST SUITE — 5 TEST PROMPTS")
    print("="*70)

    for q in test_questions:
        print(f"\n[PROMPT]: {q}")
        print("[GENERATED RESPONSE]:")
        response_text = ""
        for chunk in engine.generate_stream(q, temperature=0.0):
            response_text += chunk["text"]
        print(response_text)
        print("-" * 50)

if __name__ == "__main__":
    main()
