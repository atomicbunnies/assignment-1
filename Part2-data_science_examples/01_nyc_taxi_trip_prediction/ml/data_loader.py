# Dataset Synthesizer & Loader for NYC Taxi Trip Duration Model

import numpy as np
import pandas as pd
from features import haversine_np, manhattan_distance_np

NYC_ZONES = [
    # Midtown Manhattan
    {"name": "Midtown", "lat_min": 40.745, "lat_max": 40.765, "lon_min": -73.995, "lon_max": -73.970, "weight": 0.35, "base_speed": 14.0},
    # Lower Manhattan / Financial District
    {"name": "Downtown", "lat_min": 40.700, "lat_max": 40.725, "lon_min": -74.015, "lon_max": -73.990, "weight": 0.20, "base_speed": 16.0},
    # Upper East/West Side & Central Park
    {"name": "Uptown", "lat_min": 40.770, "lat_max": 40.800, "lon_min": -73.980, "lon_max": -73.950, "weight": 0.15, "base_speed": 18.0},
    # Brooklyn (Williamsburg, DUMBO, Downtown BK)
    {"name": "Brooklyn", "lat_min": 40.675, "lat_max": 40.715, "lon_min": -73.990, "lon_max": -73.940, "weight": 0.12, "base_speed": 24.0},
    # Queens / Astoria
    {"name": "Queens", "lat_min": 40.735, "lat_max": 40.770, "lon_min": -73.935, "lon_max": -73.880, "weight": 0.08, "base_speed": 28.0},
    # JFK Airport
    {"name": "JFK", "lat_min": 40.635, "lat_max": 40.655, "lon_min": -73.795, "lon_max": -73.765, "weight": 0.06, "base_speed": 45.0},
    # LaGuardia Airport (LGA)
    {"name": "LGA", "lat_min": 40.770, "lat_max": 40.785, "lon_min": -73.885, "lon_max": -73.860, "weight": 0.04, "base_speed": 35.0}
]

def sample_coordinates(n_samples: int):
    """Sample realistic pickup & dropoff coordinates from NYC zones."""
    weights = [z["weight"] for z in NYC_ZONES]
    weights = np.array(weights) / sum(weights)
    
    pickup_zones = np.random.choice(len(NYC_ZONES), size=n_samples, p=weights)
    dropoff_zones = np.random.choice(len(NYC_ZONES), size=n_samples, p=weights)

    p_lats = np.zeros(n_samples)
    p_lons = np.zeros(n_samples)
    d_lats = np.zeros(n_samples)
    d_lons = np.zeros(n_samples)

    for i in range(len(NYC_ZONES)):
        z = NYC_ZONES[i]
        # Pickups
        mask_p = (pickup_zones == i)
        count_p = np.sum(mask_p)
        if count_p > 0:
            p_lats[mask_p] = np.random.uniform(z["lat_min"], z["lat_max"], count_p)
            p_lons[mask_p] = np.random.uniform(z["lon_min"], z["lon_max"], count_p)

        # Dropoffs
        mask_d = (dropoff_zones == i)
        count_d = np.sum(mask_d)
        if count_d > 0:
            d_lats[mask_d] = np.random.uniform(z["lat_min"], z["lat_max"], count_d)
            d_lons[mask_d] = np.random.uniform(z["lon_min"], z["lon_max"], count_d)

    return p_lats, p_lons, d_lats, d_lons

def generate_nyc_taxi_dataset(n_samples: int = 50000, random_state: int = 42) -> pd.DataFrame:
    """
    Generate an authentic NYC taxi trip dataset matching the Kaggle schema and ground-truth physics.
    """
    np.random.seed(random_state)
    
    p_lats, p_lons, d_lats, d_lons = sample_coordinates(n_samples)
    
    # Distance in km
    dist_manhattan = manhattan_distance_np(p_lats, p_lons, d_lats, d_lons)
    dist_haversine = haversine_np(p_lats, p_lons, d_lats, d_lons)
    
    # Random pickup datetimes throughout a 6-month period
    start_timestamp = pd.Timestamp("2026-01-01").value // 10**9
    end_timestamp = pd.Timestamp("2026-06-30").value // 10**9
    random_timestamps = np.random.randint(start_timestamp, end_timestamp, size=n_samples)
    pickup_datetimes = pd.to_datetime(random_timestamps, unit='s')
    
    hours = pickup_datetimes.hour.values
    dayofweeks = pickup_datetimes.dayofweek.values
    
    # Traffic Speed Modifiers based on time of day and area
    speed_kmh = np.ones(n_samples) * 22.0
    
    # Rush hours (7-9 AM, 4-7 PM on weekdays): 35-45% slower
    is_rush = np.isin(hours, [7, 8, 9, 16, 17, 18, 19]) & (dayofweeks < 5)
    speed_kmh[is_rush] *= np.random.uniform(0.55, 0.70, np.sum(is_rush))
    
    # Late night (12 AM - 5 AM): 40% faster
    is_night = np.isin(hours, [0, 1, 2, 3, 4, 5])
    speed_kmh[is_night] *= np.random.uniform(1.30, 1.55, np.sum(is_night))
    
    # Highway / Airport trips get higher speeds
    is_airport = (dist_haversine > 10.0)
    speed_kmh[is_airport] *= np.random.uniform(1.4, 1.8, np.sum(is_airport))
    
    # Add natural road noise and stoplight delays
    effective_dist = dist_manhattan * np.random.uniform(1.05, 1.25, n_samples)
    base_duration_hours = effective_dist / np.maximum(speed_kmh, 5.0)
    base_duration_seconds = base_duration_hours * 3600.0
    
    # Add traffic light & passenger boarding delays (60 - 180 seconds)
    trip_duration = base_duration_seconds + np.random.exponential(scale=90.0, size=n_samples)
    trip_duration = np.round(np.clip(trip_duration, 45, 14400)) # 45 sec to 4 hours
    
    # Passenger count (1 to 6)
    passengers = np.random.choice([1, 2, 3, 4, 5, 6], size=n_samples, p=[0.70, 0.14, 0.05, 0.03, 0.05, 0.03])
    
    # Vendor ID (1 = Creative Mobile Tech, 2 = VeriFone)
    vendor_ids = np.random.choice([1, 2], size=n_samples, p=[0.47, 0.53])
    
    # Calculate Standard NYC Taxi Fare Formula
    # Base: $3.00 + $0.70 per 1/5 mile (~$2.17/km) + $2.50 rush surcharge / $1.00 night surcharge + $1.25 congestion
    dist_miles = dist_manhattan * 0.621371
    base_fare = 3.00
    distance_fare = dist_miles * 3.50
    time_fare = (trip_duration / 60.0) * 0.50
    rush_surcharge = np.where(is_rush, 2.50, 0.0)
    night_surcharge = np.where(is_night, 1.00, 0.0)
    congestion_fee = 2.50
    
    fare_amount = np.round(base_fare + distance_fare + time_fare + rush_surcharge + night_surcharge + congestion_fee, 2)

    df = pd.DataFrame({
        'id': [f'id_{i:07d}' for i in range(n_samples)],
        'vendor_id': vendor_ids,
        'pickup_datetime': pickup_datetimes,
        'passenger_count': passengers,
        'pickup_longitude': p_lons,
        'pickup_latitude': p_lats,
        'dropoff_longitude': d_lons,
        'dropoff_latitude': d_lats,
        'store_and_fwd_flag': np.random.choice(['N', 'Y'], size=n_samples, p=[0.99, 0.01]),
        'trip_duration': trip_duration.astype(int),
        'fare_amount': fare_amount
    })

    # Outlier filter (Standard Kaggle cleaning)
    df = df[(df['trip_duration'] >= 60) & (df['trip_duration'] <= 10800)]
    df = df[(df['pickup_latitude'] >= 40.55) & (df['pickup_latitude'] <= 40.95)]
    df = df[(df['pickup_longitude'] >= -74.25) & (df['pickup_longitude'] <= -73.70)]
    df = df[(df['dropoff_latitude'] >= 40.55) & (df['dropoff_latitude'] <= 40.95)]
    df = df[(df['dropoff_longitude'] >= -74.25) & (df['dropoff_longitude'] <= -73.70)]

    return df
