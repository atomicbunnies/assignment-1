# Kaggle Customer Segmentation Dataset Synthesizer
# Generates realistic multi-dimensional customer behavioral profiles with distinct clusters

import numpy as np
import pandas as pd
from typing import Tuple

PERSONA_METADATA = {
    0: {
        "id": "vip_champions",
        "name": "VIP Champions",
        "tagline": "Affluent High-Spenders",
        "color": "#10b981", # Emerald
        "badge": "High Income & High Spend",
        "description": "High-net-worth customers with frequent purchases and high basket sizes. Highly responsive to premium tiers, luxury perks, and VIP concierges.",
        "marketing_strategy": "Exclusive early access, premium loyalty rewards, concierge support, and luxury bundles."
    },
    1: {
        "id": "prudent_affluents",
        "name": "Prudent Affluents",
        "tagline": "High-Income Careful Savers",
        "color": "#38bdf8", # Cyan
        "badge": "High Income & Low Spend",
        "description": "High income bracket but conservative spending habits. Value quality, reliability, and long-term durability over impulse purchases.",
        "marketing_strategy": "Value-driven luxury campaigns, investment-grade product assurances, and targeted quarterly promotions."
    },
    2: {
        "id": "young_trendsetters",
        "name": "Young Trendsetters",
        "tagline": "Digital-First Impulsive Shoppers",
        "color": "#a855f7", # Violet
        "badge": "Moderate Income & High Spend",
        "description": "Digitally active younger cohort with high web visits, social discovery, and strong impulse buying in fashion and tech.",
        "marketing_strategy": "Social commerce campaigns, limited-time flash drops, influencer collaborations, and flexible BNPL payment options."
    },
    3: {
        "id": "bargain_hunters",
        "name": "Bargain Hunters",
        "tagline": "Budget-Conscious Deal Seekers",
        "color": "#f59e0b", # Amber
        "badge": "Low Income & Low Spend",
        "description": "Highly price-sensitive customers with high discount sensitivity. Actively hunt clearance sales, bulk coupons, and value packs.",
        "marketing_strategy": "Clearance promotions, volume discounts, bulk cashback vouchers, and free shipping thresholds."
    },
    4: {
        "id": "mainstream_loyalists",
        "name": "Mainstream Loyalists",
        "tagline": "Steady Core Customers",
        "color": "#ec4899", # Rose
        "badge": "Average Income & Average Spend",
        "description": "The reliable core customer base with consistent seasonal shopping cadences, average spending scores, and steady engagement.",
        "marketing_strategy": "Points-based loyalty schemes, anniversary gifts, personalized replenishment reminders, and referral bonuses."
    }
}

def generate_customer_segmentation_dataset(n_samples: int = 10000, random_state: int = 42) -> pd.DataFrame:
    """Generate high-fidelity customer segmentation dataset."""
    np.random.seed(random_state)
    
    samples_per_cluster = n_samples // 5
    records = []

    # Cluster 0: VIP Champions (High Income, High Spend)
    age_0 = np.random.normal(38, 7, samples_per_cluster).clip(24, 65)
    income_0 = np.random.normal(110, 15, samples_per_cluster).clip(85, 160)
    spend_score_0 = np.random.normal(84, 8, samples_per_cluster).clip(68, 99)
    recency_0 = np.random.exponential(15, samples_per_cluster).clip(1, 45)
    total_spend_0 = (income_0 * 75 + spend_score_0 * 45 + np.random.normal(0, 500, samples_per_cluster)).clip(6000, 15000)
    web_visits_0 = np.random.poisson(8, samples_per_cluster).clip(2, 18)
    discount_sens_0 = np.random.beta(1.5, 6.0, samples_per_cluster).clip(0.05, 0.40)
    family_size_0 = np.random.choice([1, 2, 3, 4], p=[0.3, 0.4, 0.2, 0.1], size=samples_per_cluster)

    for i in range(samples_per_cluster):
        records.append({
            "CustomerID": len(records) + 1,
            "Age": int(age_0[i]),
            "Annual_Income_k": round(float(income_0[i]), 1),
            "Spending_Score": int(spend_score_0[i]),
            "Recency_Days": int(recency_0[i]),
            "Total_Spend_Annual": round(float(total_spend_0[i]), 2),
            "Web_Visits_Month": int(web_visits_0[i]),
            "Discount_Sensitivity": round(float(discount_sens_0[i]), 2),
            "Family_Size": int(family_size_0[i]),
            "True_Cluster": 0
        })

    # Cluster 1: Prudent Affluents (High Income, Low Spend)
    age_1 = np.random.normal(52, 9, samples_per_cluster).clip(32, 75)
    income_1 = np.random.normal(105, 14, samples_per_cluster).clip(80, 155)
    spend_score_1 = np.random.normal(24, 7, samples_per_cluster).clip(5, 38)
    recency_1 = np.random.normal(75, 25, samples_per_cluster).clip(20, 240)
    total_spend_1 = (income_1 * 25 + spend_score_1 * 20 + np.random.normal(0, 300, samples_per_cluster)).clip(2000, 5500)
    web_visits_1 = np.random.poisson(4, samples_per_cluster).clip(1, 10)
    discount_sens_1 = np.random.beta(2.5, 4.0, samples_per_cluster).clip(0.15, 0.60)
    family_size_1 = np.random.choice([1, 2, 3, 4], p=[0.2, 0.5, 0.2, 0.1], size=samples_per_cluster)

    for i in range(samples_per_cluster):
        records.append({
            "CustomerID": len(records) + 1,
            "Age": int(age_1[i]),
            "Annual_Income_k": round(float(income_1[i]), 1),
            "Spending_Score": int(spend_score_1[i]),
            "Recency_Days": int(recency_1[i]),
            "Total_Spend_Annual": round(float(total_spend_1[i]), 2),
            "Web_Visits_Month": int(web_visits_1[i]),
            "Discount_Sensitivity": round(float(discount_sens_1[i]), 2),
            "Family_Size": int(family_size_1[i]),
            "True_Cluster": 1
        })

    # Cluster 2: Young Trendsetters (Low/Mid Income, High Spend)
    age_2 = np.random.normal(26, 4, samples_per_cluster).clip(18, 36)
    income_2 = np.random.normal(38, 8, samples_per_cluster).clip(20, 55)
    spend_score_2 = np.random.normal(82, 8, samples_per_cluster).clip(62, 98)
    recency_2 = np.random.exponential(18, samples_per_cluster).clip(2, 60)
    total_spend_2 = (income_2 * 45 + spend_score_2 * 30 + np.random.normal(0, 250, samples_per_cluster)).clip(2500, 6000)
    web_visits_2 = np.random.poisson(14, samples_per_cluster).clip(6, 25)
    discount_sens_2 = np.random.beta(3.0, 3.0, samples_per_cluster).clip(0.20, 0.75)
    family_size_2 = np.random.choice([1, 2, 3], p=[0.6, 0.3, 0.1], size=samples_per_cluster)

    for i in range(samples_per_cluster):
        records.append({
            "CustomerID": len(records) + 1,
            "Age": int(age_2[i]),
            "Annual_Income_k": round(float(income_2[i]), 1),
            "Spending_Score": int(spend_score_2[i]),
            "Recency_Days": int(recency_2[i]),
            "Total_Spend_Annual": round(float(total_spend_2[i]), 2),
            "Web_Visits_Month": int(web_visits_2[i]),
            "Discount_Sensitivity": round(float(discount_sens_2[i]), 2),
            "Family_Size": int(family_size_2[i]),
            "True_Cluster": 2
        })

    # Cluster 3: Bargain Hunters (Low Income, Low Spend)
    age_3 = np.random.normal(46, 12, samples_per_cluster).clip(22, 72)
    income_3 = np.random.normal(32, 7, samples_per_cluster).clip(15, 48)
    spend_score_3 = np.random.normal(20, 6, samples_per_cluster).clip(3, 35)
    recency_3 = np.random.normal(90, 35, samples_per_cluster).clip(15, 280)
    total_spend_3 = (income_3 * 15 + spend_score_3 * 10 + np.random.normal(0, 150, samples_per_cluster)).clip(400, 1800)
    web_visits_3 = np.random.poisson(5, samples_per_cluster).clip(1, 12)
    discount_sens_3 = np.random.beta(6.0, 1.5, samples_per_cluster).clip(0.65, 0.98)
    family_size_3 = np.random.choice([1, 2, 3, 4, 5], p=[0.2, 0.3, 0.2, 0.2, 0.1], size=samples_per_cluster)

    for i in range(samples_per_cluster):
        records.append({
            "CustomerID": len(records) + 1,
            "Age": int(age_3[i]),
            "Annual_Income_k": round(float(income_3[i]), 1),
            "Spending_Score": int(spend_score_3[i]),
            "Recency_Days": int(recency_3[i]),
            "Total_Spend_Annual": round(float(total_spend_3[i]), 2),
            "Web_Visits_Month": int(web_visits_3[i]),
            "Discount_Sensitivity": round(float(discount_sens_3[i]), 2),
            "Family_Size": int(family_size_3[i]),
            "True_Cluster": 3
        })

    # Cluster 4: Mainstream Loyalists (Average Income, Average Spend)
    age_4 = np.random.normal(40, 8, samples_per_cluster).clip(25, 60)
    income_4 = np.random.normal(68, 9, samples_per_cluster).clip(52, 85)
    spend_score_4 = np.random.normal(50, 7, samples_per_cluster).clip(38, 65)
    recency_4 = np.random.normal(40, 15, samples_per_cluster).clip(5, 110)
    total_spend_4 = (income_4 * 40 + spend_score_4 * 35 + np.random.normal(0, 300, samples_per_cluster)).clip(3200, 6800)
    web_visits_4 = np.random.poisson(7, samples_per_cluster).clip(2, 16)
    discount_sens_4 = np.random.beta(3.0, 3.0, samples_per_cluster).clip(0.30, 0.70)
    family_size_4 = np.random.choice([2, 3, 4], p=[0.4, 0.4, 0.2], size=samples_per_cluster)

    for i in range(samples_per_cluster):
        records.append({
            "CustomerID": len(records) + 1,
            "Age": int(age_4[i]),
            "Annual_Income_k": round(float(income_4[i]), 1),
            "Spending_Score": int(spend_score_4[i]),
            "Recency_Days": int(recency_4[i]),
            "Total_Spend_Annual": round(float(total_spend_4[i]), 2),
            "Web_Visits_Month": int(web_visits_4[i]),
            "Discount_Sensitivity": round(float(discount_sens_4[i]), 2),
            "Family_Size": int(family_size_4[i]),
            "True_Cluster": 4
        })

    df = pd.DataFrame(records)
    # Shuffle
    df = df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    return df

if __name__ == '__main__':
    df = generate_customer_segmentation_dataset(10000)
    print("Dataset generated successfully. Shape:", df.shape)
    print(df.head())
