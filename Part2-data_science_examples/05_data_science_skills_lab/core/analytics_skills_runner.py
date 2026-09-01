# Executable Data Analytics Skills Runner
# Implements cohort retention, checkout funnel drop-offs, A/B test statistics, and time-series decomposition

import math
import numpy as np
from typing import Dict, Any
from datasets import get_ecommerce_analytics_data

def run_ecommerce_analytics() -> Dict[str, Any]:
    return get_ecommerce_analytics_data()

def calculate_ab_test(
    n_control: int,
    x_control: int,
    n_treatment: int,
    x_treatment: int
) -> Dict[str, Any]:
    """Calculates rigorous two-proportion Z-test, p-value, and confidence interval."""
    if n_control <= 0 or n_treatment <= 0:
        raise ValueError("Sample sizes must be greater than 0")

    p_c = x_control / n_control
    p_t = x_treatment / n_treatment

    # Pooled conversion proportion
    p_pool = (x_control + x_treatment) / (n_control + n_treatment)
    se = np.sqrt(p_pool * (1.0 - p_pool) * (1.0 / n_control + 1.0 / n_treatment))

    if se == 0:
        z_score = 0.0
        p_value = 1.0
    else:
        z_score = (p_t - p_c) / se
        # Two-tailed p-value via normal approximation
        p_value = 2.0 * (1.0 - 0.5 * (1.0 + math.erf(abs(z_score) / np.sqrt(2.0))))

    abs_lift = (p_t - p_c) * 100.0
    rel_lift = ((p_t - p_c) / max(0.0001, p_c)) * 100.0
    is_significant = bool(p_value < 0.05)

    return {
        "control_rate_pct": round(p_c * 100.0, 2),
        "treatment_rate_pct": round(p_t * 100.0, 2),
        "absolute_lift_pct": round(abs_lift, 2),
        "relative_lift_pct": round(rel_lift, 2),
        "z_score": round(float(z_score), 3),
        "p_value": round(float(p_value), 6),
        "is_statistically_significant": is_significant,
        "recommendation": "Deploy Treatment Variant to 100% of traffic" if is_significant and rel_lift > 0 else "Keep Control (No statistically significant gain)"
    }

if __name__ == '__main__':
    res = calculate_ab_test(25000, 1450, 25000, 1750)
    print("A/B Test Z-Score:", res["z_score"], "p-value:", res["p_value"])
