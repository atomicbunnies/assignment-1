# Kaggle Instacart & E-Commerce Market Basket Dataset Synthesizer
# Generates 10,000 realistic multi-item grocery transaction baskets with natural co-occurrence affinities

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple

PRODUCT_CATALOG = [
    # Produce
    {"id": "p_banana", "name": "Organic Bananas", "dept": "Produce", "price": 1.29, "base_prob": 0.38},
    {"id": "p_avocado", "name": "Organic Hass Avocados", "dept": "Produce", "price": 2.49, "base_prob": 0.28},
    {"id": "p_cilantro", "name": "Fresh Organic Cilantro", "dept": "Produce", "price": 0.99, "base_prob": 0.16},
    {"id": "p_tomato", "name": "Roma Tomatoes", "dept": "Produce", "price": 1.79, "base_prob": 0.22},
    {"id": "p_spinach", "name": "Organic Baby Spinach", "dept": "Produce", "price": 3.49, "base_prob": 0.20},
    {"id": "p_lime", "name": "Fresh Limes", "dept": "Produce", "price": 0.69, "base_prob": 0.18},
    {"id": "p_apple", "name": "Honeycrisp Apples", "dept": "Produce", "price": 2.99, "base_prob": 0.19},

    # Dairy & Eggs
    {"id": "d_milk", "name": "Organic Whole Milk", "dept": "Dairy & Eggs", "price": 3.89, "base_prob": 0.32},
    {"id": "d_eggs", "name": "Grade A Large Pasture Eggs", "dept": "Dairy & Eggs", "price": 4.29, "base_prob": 0.30},
    {"id": "d_butter", "name": "Salted Creamery Butter", "dept": "Dairy & Eggs", "price": 4.49, "base_prob": 0.21},
    {"id": "d_yogurt", "name": "Greek Whole Milk Yogurt", "dept": "Dairy & Eggs", "price": 1.99, "base_prob": 0.18},
    {"id": "d_cheddar", "name": "Aged Sharp Cheddar", "dept": "Dairy & Eggs", "price": 3.99, "base_prob": 0.17},
    {"id": "d_oatmilk", "name": "Barista Oat Milk", "dept": "Dairy & Eggs", "price": 4.19, "base_prob": 0.15},

    # Bakery & Deli
    {"id": "b_sourdough", "name": "Artisanal Sourdough Bread", "dept": "Bakery & Deli", "price": 4.99, "base_prob": 0.24},
    {"id": "b_bagel", "name": "Plain New York Bagels", "dept": "Bakery & Deli", "price": 3.49, "base_prob": 0.16},
    {"id": "b_turkey", "name": "Oven Roasted Turkey Breast", "dept": "Bakery & Deli", "price": 6.49, "base_prob": 0.14},
    {"id": "b_buns", "name": "Brioche Sandwich Buns", "dept": "Bakery & Deli", "price": 3.99, "base_prob": 0.12},

    # Pantry & Spices
    {"id": "pan_oliveoil", "name": "Extra Virgin Olive Oil", "dept": "Pantry", "price": 9.99, "base_prob": 0.15},
    {"id": "pan_pasta", "name": "Penne Rigate Pasta", "dept": "Pantry", "price": 1.89, "base_prob": 0.22},
    {"id": "pan_marinara", "name": "Slow-Simmered Marinara", "dept": "Pantry", "price": 3.99, "base_prob": 0.20},
    {"id": "pan_parmesan", "name": "Grated Parmesan Cheese", "dept": "Pantry", "price": 4.29, "base_prob": 0.16},
    {"id": "pan_chips", "name": "Organic Tortilla Chips", "dept": "Pantry", "price": 3.29, "base_prob": 0.22},
    {"id": "pan_salsa", "name": "Mild Chunky Salsa", "dept": "Pantry", "price": 3.49, "base_prob": 0.18},
    {"id": "pan_pb", "name": "Creamy Peanut Butter", "dept": "Pantry", "price": 3.79, "base_prob": 0.16},
    {"id": "pan_jam", "name": "Organic Strawberry Jam", "dept": "Pantry", "price": 3.29, "base_prob": 0.14},

    # Beverages
    {"id": "bev_coffee", "name": "Espresso Roast Coffee Beans", "dept": "Beverages", "price": 12.99, "base_prob": 0.19},
    {"id": "bev_syrup", "name": "Madagascar Vanilla Syrup", "dept": "Beverages", "price": 5.99, "base_prob": 0.10},
    {"id": "bev_sparkling", "name": "Sparkling Mineral Water", "dept": "Beverages", "price": 2.49, "base_prob": 0.22},
    {"id": "bev_coldbrew", "name": "Cold Brew Concentrate", "dept": "Beverages", "price": 5.49, "base_prob": 0.14},
    {"id": "bev_tea", "name": "Organic Green Tea Bags", "dept": "Beverages", "price": 3.99, "base_prob": 0.12},

    # Snacks
    {"id": "snk_choc", "name": "72% Dark Chocolate Bar", "dept": "Snacks", "price": 3.49, "base_prob": 0.18},
    {"id": "snk_almonds", "name": "Roasted Salted Almonds", "dept": "Snacks", "price": 6.99, "base_prob": 0.16},
    {"id": "snk_chips", "name": "Sea Salt Kettle Chips", "dept": "Snacks", "price": 3.49, "base_prob": 0.20}
]

PRODUCT_LOOKUP = {p["name"]: p for p in PRODUCT_CATALOG}

# High-Affinity Real-World Transaction Archetypes (Co-occurrence Affinities)
BASKET_ARCHETYPES = [
    # 1. Guacamole & Mexican Fiesta
    {
        "name": "Guacamole & Chips",
        "core_items": ["Organic Hass Avocados", "Fresh Limes", "Fresh Organic Cilantro", "Organic Tortilla Chips"],
        "optional_items": ["Roma Tomatoes", "Mild Chunky Salsa", "Sparkling Mineral Water"],
        "weight": 0.22
    },
    # 2. Italian Pasta Dinner
    {
        "name": "Italian Pasta Dinner",
        "core_items": ["Penne Rigate Pasta", "Slow-Simmered Marinara", "Grated Parmesan Cheese"],
        "optional_items": ["Artisanal Sourdough Bread", "Extra Virgin Olive Oil", "72% Dark Chocolate Bar"],
        "weight": 0.20
    },
    # 3. Morning Artisanal Coffee & Breakfast
    {
        "name": "Artisanal Coffee & Breakfast",
        "core_items": ["Espresso Roast Coffee Beans", "Organic Whole Milk", "Grade A Large Pasture Eggs"],
        "optional_items": ["Madagascar Vanilla Syrup", "Barista Oat Milk", "Artisanal Sourdough Bread", "Salted Creamery Butter"],
        "weight": 0.24
    },
    # 4. Classic PB & J Snack
    {
        "name": "PB & J Quick Snack",
        "core_items": ["Artisanal Sourdough Bread", "Creamy Peanut Butter", "Organic Strawberry Jam"],
        "optional_items": ["Organic Bananas", "Organic Whole Milk", "Sea Salt Kettle Chips"],
        "weight": 0.16
    },
    # 5. Healthy Salad & Protein Lunch
    {
        "name": "Healthy Green Salad",
        "core_items": ["Organic Baby Spinach", "Roma Tomatoes", "Extra Virgin Olive Oil", "Organic Hass Avocados"],
        "optional_items": ["Oven Roasted Turkey Breast", "Roasted Salted Almonds", "Sparkling Mineral Water"],
        "weight": 0.18
    }
]

def generate_market_basket_dataset(n_transactions: int = 10000, random_state: int = 42) -> List[List[str]]:
    """Generate high-fidelity Kaggle Instacart transaction baskets."""
    np.random.seed(random_state)
    baskets = []

    archetype_probs = [a["weight"] for a in BASKET_ARCHETYPES]
    archetype_probs = [p / sum(archetype_probs) for p in archetype_probs]

    for t_id in range(n_transactions):
        basket = set()

        # 1. Choose primary archetype
        arch = np.random.choice(BASKET_ARCHETYPES, p=archetype_probs)
        
        # Include core items with high probability (80-95%)
        for item in arch["core_items"]:
            if np.random.rand() < 0.88:
                basket.add(item)

        # Include optional archetype items with moderate probability (40-65%)
        for item in arch["optional_items"]:
            if np.random.rand() < 0.52:
                basket.add(item)

        # 2. Add random impulse items based on overall product base probabilities
        for prod in PRODUCT_CATALOG:
            if prod["name"] not in basket and np.random.rand() < (prod["base_prob"] * 0.18):
                basket.add(prod["name"])

        # Ensure minimum basket size of 2 items
        if len(basket) < 2:
            extra = np.random.choice([p["name"] for p in PRODUCT_CATALOG], size=2, replace=False)
            basket.update(extra)

        baskets.append(sorted(list(basket)))

    return baskets

if __name__ == '__main__':
    baskets = generate_market_basket_dataset(100)
    print(f"Generated {len(baskets)} sample transaction baskets.")
    print("Example basket 0:", baskets[0])
    print("Example basket 1:", baskets[1])
