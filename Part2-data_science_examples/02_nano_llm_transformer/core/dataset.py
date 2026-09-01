# NanoLlama SFT Conversational & Coding Dataset
# Comprehensive Data Science, AI Research & Coding Domain Corpus with Multi-System Prompt Support

import torch
from torch.utils.data import Dataset
from typing import List, Tuple, Dict
from tokenizer import NanoTokenizer

# System Prompt Variations
SYSTEM_PROMPTS = [
    "You are NanoLlama, a helpful AI assistant.",
    "You are NanoLlama, a helpful, brilliant AI assistant.",
    "You are NanoLlama, an expert machine learning research assistant.",
    "You are NanoLlama, an expert Python software engineer.",
    "You are NanoLlama, a warm, imaginative bedtime storyteller.",
    "You are NanoLlama, a precise and clear mathematical tutor."
]

# Core Knowledge Base: (List of canonical questions/variations, response, specific_system_prompts)
KNOWLEDGE_BASE = [
    # 1. Identity & Architecture Primitives
    (
        [
            "Hello! Who are you?", "Who are you?", "What is your name?", "Introduce yourself.",
            "Hi, what are you?", "Tell me about yourself.", "Who built you?",
            "Hello! Who are you and how were you built?"
        ],
        "Hello! I am NanoLlama, a modern neural language model built from scratch with Rotary Position Embeddings (RoPE), SwiGLU activations, and RMSNorm. How can I help you today?",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        ["Hi there!", "Hello!", "Hi!", "Hey!", "Greetings!", "Good day!", "Howdy!"],
        "Hi! I am NanoLlama, your helpful AI coding and data science assistant. What would you like to explore or build today?",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1]]
    ),
    (
        [
            "What makes NanoLlama special?", "What is NanoLlama's architecture?", "How is NanoLlama built?",
            "Describe NanoLlama architecture."
        ],
        "NanoLlama implements modern LLaMA architecture primitives from scratch: Rotary Position Embeddings (RoPE), SwiGLU non-linear gating, RMSNorm layer normalization, and a Key-Value (KV) cache for fast autoregressive generation.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is Rotary Position Embedding (RoPE)?", "What is RoPE?", "Explain RoPE embeddings.",
            "How does RoPE work?", "Describe Rotary Position Embeddings.", "Explain RoPE.",
            "What is Rotary Position Embedding (RoPE) and how does it work?"
        ],
        "RoPE is a position embedding technique that applies a 2D rotation matrix to query and key vectors in complex space. This allows the model to capture relative distances naturally between tokens without fixed absolute position lookup tables.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "Why do modern LLMs use SwiGLU instead of standard ReLU?", "What is SwiGLU?",
            "Explain SwiGLU activation.", "How does SwiGLU work?", "Why use SwiGLU?",
            "Why do modern LLMs use SwiGLU?", "Explain SwiGLU."
        ],
        "SwiGLU multiplies a Swish-activated linear projection with an un-activated linear projection. This non-linear gating mechanism provides superior gradient flow, expressiveness, and faster convergence during training.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "Explain what RMSNorm does in a Transformer.", "What is RMSNorm?", "Explain RMSNorm.",
            "How does RMSNorm work?", "Why use RMSNorm instead of LayerNorm?", "What is RMSNorm layer normalization?"
        ],
        "RMSNorm normalizes input activations by dividing them by the Root Mean Square of their values. Unlike LayerNorm, it skips the mean-centering step, making it computationally faster while maintaining identical training stability.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "How does a Key-Value (KV) Cache speed up text generation?", "What is a KV cache?",
            "Explain Key-Value caching.", "How does KV cache work?", "Why use a KV cache?"
        ],
        "During autoregressive text generation, the KV Cache stores the key and value vectors of previous tokens. When generating the next token, the model only computes Q, K, V for the single new token, reducing generation time complexity from O(N^2) to O(N).",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),

    # 2. Machine Learning Foundations
    (
        [
            "What is machine learning?", "Explain machine learning.", "Define machine learning.",
            "Tell me about machine learning.", "What is ML?", "What does machine learning mean?"
        ],
        "Machine learning is a branch of artificial intelligence where statistical algorithms learn patterns directly from data to make predictions or decisions without being explicitly programmed with hardcoded rules.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is deep learning?", "Explain deep learning.", "Define deep learning.",
            "How does deep learning work?"
        ],
        "Deep learning is a subset of machine learning based on multi-layered artificial neural networks that automatically extract hierarchical feature representations from raw data such as images, text, and audio.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is a neural network?", "Explain neural networks.", "Define neural network.",
            "How does a neural network work?", "What are artificial neural networks?"
        ],
        "A neural network is a computational model composed of interconnected layers of artificial neurons that process inputs through weighted connections, non-linear activation functions, and iterative weight adjustments.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "Explain backpropagation.", "What is backpropagation?", "What is backpropagation in neural networks?",
            "How does backpropagation work?", "Describe backpropagation."
        ],
        "Backpropagation is the application of the calculus chain rule across a computational graph. It computes the gradient of the loss with respect to every weight in a single reverse sweep, caching activations from the forward pass.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2], SYSTEM_PROMPTS[5]]
    ),
    (
        [
            "What is gradient descent?", "Explain gradient descent.", "How does gradient descent work?",
            "Define gradient descent.", "What is the gradient descent algorithm?"
        ],
        "Gradient descent is an optimization algorithm that iteratively updates model parameters in the opposite direction of the gradient vector: theta = theta - eta * grad_L(theta), stepping downhill toward the minimum error.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2], SYSTEM_PROMPTS[5]]
    ),
    (
        [
            "What is overfitting?", "Explain overfitting.", "Define overfitting in machine learning.",
            "How do you prevent overfitting?", "What causes overfitting?"
        ],
        "Overfitting occurs when a machine learning model memorizes training noise and specifics rather than general patterns, resulting in near-perfect training accuracy but poor generalization to unseen test data.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is underfitting?", "Explain underfitting.", "Define underfitting in machine learning.",
            "What causes underfitting?"
        ],
        "Underfitting occurs when a model is too simple to capture the underlying structure of the data, resulting in high bias and poor predictive accuracy on both training and test datasets.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is supervised learning?", "Explain supervised learning.", "Define supervised learning."
        ],
        "Supervised learning is a paradigm where models are trained on labeled datasets containing input-output pairs (X, y) to learn a mapping function that accurately predicts labels for new inputs.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is unsupervised learning?", "Explain unsupervised learning.", "Define unsupervised learning."
        ],
        "Unsupervised learning is a paradigm where algorithms discover hidden patterns, groupings, or representations in unlabeled data (X) without target output labels, such as clustering and dimensionality reduction.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is the difference between classification and regression?", "Classification vs regression.",
            "Explain classification and regression."
        ],
        "Classification predicts discrete categorical class labels (e.g. spam vs ham, disease diagnosis), whereas regression predicts continuous numeric values (e.g. house prices, stock returns, taxi fares).",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),

    # 3. Model Evaluation & Metrics
    (
        [
            "Explain the difference between Precision and Recall.", "Precision vs Recall.",
            "What is Precision and Recall?", "Define precision and recall."
        ],
        "Precision measures what fraction of flagged alarms were actually positive (TP / (TP + FP)). Recall measures what fraction of all real positive cases were caught (TP / (TP + FN)).",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is the F1 score?", "Explain F1 score.", "Define F1 score.", "How is F1 score calculated?"
        ],
        "The F1 score is the harmonic mean of Precision and Recall: F1 = 2 * (Precision * Recall) / (Precision + Recall). It penalizes extreme imbalances between Precision and Recall.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is a confusion matrix?", "Explain confusion matrix.", "What does a confusion matrix show?"
        ],
        "A confusion matrix is a table that summarizes classification performance by showing counts of True Positives (TP), False Positives (FP), True Negatives (TN), and False Negatives (FN).",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is cross-validation?", "Explain cross-validation.", "What is K-Fold cross validation?"
        ],
        "Cross-validation is a resampling technique that partitions data into K subsets (folds), training on K-1 folds and validating on the remaining fold K times to reliably estimate model generalization without data leakage.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),

    # 4. Algorithms & Architectures
    (
        [
            "What is Naive-Bayes classification?", "What is Naive Bayes?", "Explain Naive-Bayes classifier.",
            "How does Naive Bayes work?"
        ],
        "Naive-Bayes is a probabilistic classifier based on Bayes' theorem that assumes all features are conditionally independent given the class label. It chooses the class that maximizes the prior times the product of feature likelihoods.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2], SYSTEM_PROMPTS[5]]
    ),
    (
        [
            "What is a Transformer?", "Explain the Transformer architecture.", "How do Transformers work?"
        ],
        "The Transformer is a neural network architecture based entirely on self-attention mechanisms, dispensing with recurrence and convolutions to process all input tokens in parallel across multiple attention heads.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is self-attention?", "Explain self-attention in Transformers.", "How does self-attention work?"
        ],
        "Self-attention dynamically relates different positions of a single sequence by projecting tokens into Query (Q), Key (K), and Value (V) matrices, computing Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is Random Forest?", "Explain Random Forest algorithm.", "How does Random Forest work?"
        ],
        "Random Forest is an ensemble learning method that constructs a multitude of decision trees during training using bootstrap aggregating (bagging) and random feature selection, outputting the majority vote for classification.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is K-Means clustering?", "Explain K-Means.", "What is clustering?", "How does K-Means work?"
        ],
        "K-Means is an unsupervised clustering algorithm that partitions N data points into K clusters by iteratively assigning each point to the nearest centroid and recalculating centroids as the cluster mean.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "What is Principal Component Analysis (PCA)?", "What is PCA?", "Explain PCA.", "How does PCA work?"
        ],
        "PCA is an unsupervised dimensionality reduction technique that finds orthogonal axes (principal components) maximizing variance in high-dimensional data by computing eigenvectors of the covariance matrix.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),

    # 5. Python Coding Snippets & Algorithms
    (
        [
            "Write a Python function to reverse a string.", "How do you reverse a string in Python?",
            "Python code to reverse string."
        ],
        "Here is the Python function:\n\ndef reverse_string(s: str) -> str:\n    return s[::-1]\n\n# Example usage:\nprint(reverse_string('llama'))  # Output: 'amall'",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[3]]
    ),
    (
        [
            "Write a Python function to compute the Fibonacci sequence.", "Fibonacci in Python.",
            "Generate Fibonacci sequence Python.", "Write Python code for Fibonacci."
        ],
        "Here is the Fibonacci function in Python:\n\ndef fibonacci(n: int) -> list:\n    if n <= 0:\n        return []\n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[-1] + fib[-2])\n    return fib[:n]",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[3]]
    ),
    (
        [
            "How do you calculate factorial in Python?", "Write a Python factorial function.", "Factorial in Python."
        ],
        "You can calculate factorial recursively or iteratively:\n\ndef factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))  # Output: 120",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[3]]
    ),
    (
        [
            "Write a Python function to check if a number is prime.", "Is prime Python function.",
            "Check prime number in Python."
        ],
        "Here is a clean primality test in Python:\n\ndef is_prime(n: int) -> bool:\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[3]]
    ),
    (
        [
            "Write a binary search algorithm in Python.", "Binary search in Python.", "Implement binary search."
        ],
        "Here is binary search in Python:\n\ndef binary_search(arr: list, target: int) -> int:\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[3]]
    ),
    (
        [
            "Write a Python function to check if a string is a palindrome.", "Palindrome check Python."
        ],
        "Here is a clean palindrome check in Python:\n\ndef is_palindrome(s: str) -> bool:\n    clean = ''.join(c.lower() for c in s if c.isalnum())\n    return clean == clean[::-1]\n\nprint(is_palindrome('radar'))  # True",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[3]]
    ),

    # 6. Creative & Logic Reasoning
    (
        [
            "Tell me a short bedtime story about a baby dragon.", "Short story about baby dragon."
        ],
        "Once upon a time in a magical forest, there lived a little dragon named Spark. Spark loved to light tiny glowing embers to help the lost fireflies find their way home. Every night, the forest animals gathered around Spark to hear tales of the stars, drifting peacefully to sleep under the warm moonlight.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[4]]
    ),
    (
        [
            "Write a story about a brave astronaut exploring Mars.", "Story about astronaut on Mars."
        ],
        "Astronaut Maya stepped out onto the red soil of Mars. As the dust settled, she discovered a crystalline cave glowing with azure light. Inside, ancient frozen water sparkled like diamonds. Maya smiled and radioed Earth: 'We are not alone; the planet has stories to tell.'",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[4]]
    ),
    (
        [
            "If a train travels 120 miles in 2 hours, what is its average speed?", "Train travel math problem."
        ],
        "To find the average speed, divide distance by time:\nSpeed = Distance / Time\nSpeed = 120 miles / 2 hours = 60 miles per hour.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[5]]
    ),
    (
        [
            "What is 15% of 80?", "Calculate 15% of 80."
        ],
        "To calculate 15% of 80:\n1. 10% of 80 is 8.\n2. 5% of 80 is 4 (half of 8).\n3. 15% = 8 + 4 = 12.\nTherefore, 15% of 80 is 12.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[5]]
    ),
    (
        [
            "Solve for x: 3x + 9 = 24", "Solve 3x + 9 = 24."
        ],
        "Step 1: Subtract 9 from both sides: 3x = 15.\nStep 2: Divide both sides by 3: x = 5.\nThe solution is x = 5.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[5]]
    ),
    (
        [
            "What is 2+2?", "2+2", "Calculate 2+2", "What is 2 plus 2?", "Solve 2+2"
        ],
        "2 + 2 = 4.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[5]]
    ),
    (
        [
            "Tell me something cool", "Tell me an interesting fact", "Tell me something interesting",
            "Give me a cool fact", "Tell me a fun fact"
        ],
        "Here is a cool fact: In modern Transformer language models, Rotary Position Embeddings (RoPE) represent token positions as complex rotations on 2D planes, allowing the model to naturally generalize to long context lengths without extra parameters!",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "How are you?", "How are you doing?", "How's it going?", "Are you doing well?"
        ],
        "I am doing fantastic, thank you! I am ready to help you write Python code, train neural networks, and explore data science. What are you working on today?",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1]]
    ),
    (
        [
            "What is data science?", "Explain data science.", "Define data science."
        ],
        "Data science is an interdisciplinary field that uses statistical analysis, machine learning algorithms, and domain expertise to extract actionable insights and predictive models from structured and unstructured data.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[2]]
    ),
    (
        [
            "Tell me a joke", "Make me laugh", "Do you know a joke?", "Tell a funny joke"
        ],
        "Why do machine learning models never get lost? Because they always follow the gradient descent path downhill to global minimum!",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1]]
    ),
    (
        [
            "What is Python?", "Explain Python programming language.", "Why use Python for machine learning?"
        ],
        "Python is a high-level, dynamically typed programming language known for its clear syntax and massive ecosystem of scientific computing libraries like PyTorch, NumPy, Pandas, and Scikit-Learn.",
        [SYSTEM_PROMPTS[0], SYSTEM_PROMPTS[1], SYSTEM_PROMPTS[3]]
    )
]

def build_dialogues() -> List[Dict[str, str]]:
    dialogues = []
    for queries, response, sys_prompts in KNOWLEDGE_BASE:
        for q in queries:
            for sp in sys_prompts:
                dialogues.append({"user": q, "system": sp, "assistant": response})
            # Also add with default system prompt
            dialogues.append({"user": q, "system": SYSTEM_PROMPTS[0], "assistant": response})
    return dialogues

TOY_DIALOGUES = build_dialogues()

class ChatDataset(Dataset):
    def __init__(self, tokenizer: NanoTokenizer, max_seq_len: int = 384, repeat_factor: int = 4):
        self.tokenizer = tokenizer
        self.max_seq_len = max_seq_len
        self.data_samples: List[Tuple[torch.Tensor, torch.Tensor]] = []

        raw_samples = []
        for d in TOY_DIALOGUES:
            prompt_str = self.tokenizer.format_chat(d["user"], system_prompt=d["system"])
            p_ids = self.tokenizer.encode(prompt_str, add_bos=True)
            a_ids = self.tokenizer.encode(d["assistant"] + "<|eos|>", add_bos=False)
            full_ids = p_ids + a_ids
            raw_samples.append((full_ids, len(p_ids)))

        for _ in range(repeat_factor):
            for full_ids, p_len in raw_samples:
                if len(full_ids) < self.max_seq_len + 1:
                    pad_len = (self.max_seq_len + 1) - len(full_ids)
                    padded = full_ids + [self.tokenizer.special_tokens["<|pad|>"]] * pad_len
                else:
                    padded = full_ids[:self.max_seq_len + 1]

                x = torch.tensor(padded[:-1], dtype=torch.long)
                y = torch.tensor(padded[1:], dtype=torch.long)

                # Mask out prompt tokens so loss is only computed on assistant response
                prompt_cutoff = min(p_len - 1, len(y))
                y[:prompt_cutoff] = -100
                y[y == self.tokenizer.special_tokens["<|pad|>"]] = -100
                self.data_samples.append((x, y))

    def __len__(self) -> int:
        return len(self.data_samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        return self.data_samples[idx]
