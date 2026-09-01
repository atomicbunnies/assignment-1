# Feature Engineering Pipeline for NYC Taxi Trip Duration & Fare Prediction

import numpy as np
import pandas as pd

# Key NYC Geographic Hubs
HUBS = {
    'jfk': (40.6413, -73.7781),
    'lga': (40.7769, -73.8740),
    'ewr': (40.6895, -74.1745),
    'times_sq': (40.7580, -73.9855),
    'wall_st': (40.7074, -74.0113),
    'grand_central': (40.7527, -73.9772)
}

def haversine_np(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees) in kilometers.
    """
    R = 6371.0  # Earth radius in kilometers
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = np.sin(dlat / 2.0)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2.0)**2
    c = 2 * np.arcsin(np.sqrt(np.clip(a, 0, 1)))
    return R * c

def manhattan_distance_np(lat1, lon1, lat2, lon2):
    """
    Calculate the Manhattan city-block distance in kilometers.
    """
    a = haversine_np(lat1, lon1, lat1, lon2)
    b = haversine_np(lat1, lon1, lat2, lon1)
    return a + b

def bearing_np(lat1, lon1, lat2, lon2):
    """
    Calculate the compass bearing (0-360 degrees) between two points.
    """
    AVG_EARTH_RADIUS = 6371.0
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    y = np.sin(dlon) * np.cos(lat2)
    x = np.cos(lat1) * np.sin(lat2) - np.sin(lat1) * np.cos(lat2) * np.cos(dlon)
    initial_bearing = np.arctan2(y, x)
    initial_bearing = np.degrees(initial_bearing)
    return (initial_bearing + 360) % 360

FEATURE_COLUMNS = [
    'pickup_latitude',
    'pickup_longitude',
    'dropoff_latitude',
    'dropoff_longitude',
    'haversine_distance',
    'manhattan_distance',
    'bearing',
    'pickup_hour',
    'pickup_dayofweek',
    'pickup_month',
    'is_weekend',
    'is_rush_hour',
    'is_late_night',
    'passenger_count',
    'dist_to_jfk',
    'dist_to_lga',
    'dist_to_ewr',
    'dist_to_times_sq',
    'dist_to_wall_st',
    'dist_to_grand_central'
]

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extract high-signal features from raw NYC taxi dataset.
    """
    res = df.copy()

    # Ensure datetime format
    if 'pickup_datetime' in res.columns:
        dt = pd.to_datetime(res['pickup_datetime'])
        res['pickup_hour'] = dt.dt.hour
        res['pickup_dayofweek'] = dt.dt.dayofweek
        res['pickup_month'] = dt.dt.month
        res['is_weekend'] = res['pickup_dayofweek'].isin([5, 6]).astype(int)
        res['is_rush_hour'] = res['pickup_hour'].isin([7, 8, 9, 16, 17, 18, 19]).astype(int)
        res['is_late_night'] = res['pickup_hour'].isin([0, 1, 2, 3, 4, 5]).astype(int)
    else:
        # Default fallbacks if passed directly
        if 'pickup_hour' not in res.columns:
            res['pickup_hour'] = 14
        if 'pickup_dayofweek' not in res.columns:
            res['pickup_dayofweek'] = 2
        if 'pickup_month' not in res.columns:
            res['pickup_month'] = 6
        if 'is_weekend' not in res.columns:
            res['is_weekend'] = 0
        if 'is_rush_hour' not in res.columns:
            res['is_rush_hour'] = 0
        if 'is_late_night' not in res.columns:
            res['is_late_night'] = 0

    if 'passenger_count' not in res.columns:
        res['passenger_count'] = 1

    # Distance metrics
    p_lat = res['pickup_latitude'].values
    p_lon = res['pickup_longitude'].values
    d_lat = res['dropoff_latitude'].values
    d_lon = res['dropoff_longitude'].values

    res['haversine_distance'] = haversine_np(p_lat, p_lon, d_lat, d_lon)
    res['manhattan_distance'] = manhattan_distance_np(p_lat, p_lon, d_lat, d_lon)
    res['bearing'] = bearing_np(p_lat, p_lon, d_lat, d_lon)

    # Transit Hub Proximity Features (Pickups & Dropoffs)
    for hub_name, (h_lat, h_lon) in HUBS.items():
        res[f'dist_to_{hub_name}'] = np.minimum(
            haversine_np(p_lat, p_lon, h_lat, h_lon),
            haversine_np(d_lat, d_lon, h_lat, h_lon)
        )

    return res[FEATURE_COLUMNS]
