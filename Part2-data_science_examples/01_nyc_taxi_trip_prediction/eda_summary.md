# NYC Taxi EDA hand-off

Training-split EDA only (test rows were held out before profiling).

## Shape & types
- Full generated rows: 19,964
- Train / test: 15,972 / 3,992 (80/20, `random_state=42`)
- Memory (train): 4.74 MB
- Dtypes: float64=14, int64=6, int32=3, object=2

## Missingness
- none (0% missing on all columns)

## Target analysis
- Primary target: `trip_duration` (seconds). Skew = 1.38 (right-skewed; log / RMSLE-friendly).
- Secondary target: `fare_amount` (USD). Skew = 1.33.
- This is regression, not classification — no class imbalance. Duration skew still argues against raw MAE-only reporting.

## Univariate / numeric summary
See `eda_numeric_describe.csv` and `eda_univariate_histograms.png`.

## Bivariate (correlation with trip_duration)
- `fare_amount`: 0.933
- `haversine_distance`: 0.830
- `manhattan_distance`: 0.830
- `dist_to_jfk`: -0.676
- `dropoff_longitude`: 0.424
- `pickup_longitude`: 0.405
- `is_rush_hour`: 0.305
- `dropoff_latitude`: -0.269

## Leakage scan
- none above the 0.95 |r| threshold with `trip_duration`

Notes:
- `id` is an identifier — do not use as a feature.
- `fare_amount` is computed from duration, distance, and surcharges in the synthesizer. Using it to predict `trip_duration` (or vice versa without care) is post-outcome leakage.
- `manhattan_distance` and `haversine_distance` are highly collinear by construction; keep one or regularize.

## Cardinality
- `vendor_id`: 2 unique
- `store_and_fwd_flag`: 2 unique
- `passenger_count`: 6 unique
- `pickup_hour`: 24 unique
- `pickup_dayofweek`: 7 unique

## Outliers (1.5×IQR)
- `trip_duration`: 2.86% outside 1.5×IQR
- `fare_amount`: 7.71% outside 1.5×IQR
- `haversine_distance`: 9.07% outside 1.5×IQR
- `manhattan_distance`: 9.97% outside 1.5×IQR

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
