import os
import sys
import json
import numpy as np
import pandas as pd
import xgboost as xgb

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add ml folder to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ml')))
from features import engineer_features, haversine_np, manhattan_distance_np, bearing_np

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))
MODEL_PATH = os.path.join(MODELS_DIR, 'xgboost_model.json')

class ModelEngine:
    def __init__(self):
        self.model = None
        self.metadata = None
        self.experiments = []
        self.residuals = {}
        self.load()

    def load(self):
        if os.path.exists(MODEL_PATH):
            self.model = xgb.XGBRegressor()
            self.model.load_model(MODEL_PATH)
            print(f"[OK] XGBoost model loaded from {MODEL_PATH}")
        else:
            print("[WARN] Model artifact not found yet.")

        meta_path = os.path.join(MODELS_DIR, 'metadata.json')
        if os.path.exists(meta_path):
            with open(meta_path, 'r') as f:
                self.metadata = json.load(f)

        exp_path = os.path.join(MODELS_DIR, 'experiments.json')
        if os.path.exists(exp_path):
            with open(exp_path, 'r') as f:
                self.experiments = json.load(f)

        res_path = os.path.join(MODELS_DIR, 'residuals.json')
        if os.path.exists(res_path):
            with open(res_path, 'r') as f:
                self.residuals = json.load(f)

    def predict(self, pickup_lat: float, pickup_lon: float, dropoff_lat: float, dropoff_lon: float,
                pickup_datetime: str = None, passenger_count: int = 1):
        if not self.model:
            raise RuntimeError("Model is not loaded")

        if not pickup_datetime:
            pickup_datetime = pd.Timestamp.now().isoformat()

        # Build single-row DataFrame
        df = pd.DataFrame([{
            'pickup_latitude': pickup_lat,
            'pickup_longitude': pickup_lon,
            'dropoff_latitude': dropoff_lat,
            'dropoff_longitude': dropoff_lon,
            'pickup_datetime': pickup_datetime,
            'passenger_count': passenger_count
        }])

        X = engineer_features(df)
        pred_log = self.model.predict(X)[0]
        duration_seconds = float(np.expm1(pred_log))
        duration_seconds = max(45.0, duration_seconds)
        duration_minutes = duration_seconds / 60.0

        # Calculate Distances
        haversine_km = float(haversine_np(np.array([pickup_lat]), np.array([pickup_lon]),
                                          np.array([dropoff_lat]), np.array([dropoff_lon]))[0])
        manhattan_km = float(manhattan_distance_np(np.array([pickup_lat]), np.array([pickup_lon]),
                                                   np.array([dropoff_lat]), np.array([dropoff_lon]))[0])
        bearing_deg = float(bearing_np(np.array([pickup_lat]), np.array([pickup_lon]),
                                       np.array([dropoff_lat]), np.array([dropoff_lon]))[0])

        dist_miles = manhattan_km * 0.621371
        avg_speed_kmh = (manhattan_km / (duration_seconds / 3600.0)) if duration_seconds > 0 else 20.0

        # Fare Estimation breakdown (Official NYC Taxi Rate Formula)
        dt = pd.to_datetime(pickup_datetime)
        is_rush = dt.hour in [7, 8, 9, 16, 17, 18, 19] and dt.dayofweek < 5
        is_night = dt.hour in [0, 1, 2, 3, 4, 5]
        
        # Airport check (JFK or LGA)
        is_jfk = (haversine_np(pickup_lat, pickup_lon, 40.6413, -73.7781) < 2.0) or \
                 (haversine_np(dropoff_lat, dropoff_lon, 40.6413, -73.7781) < 2.0)
        is_lga = (haversine_np(pickup_lat, pickup_lon, 40.7769, -73.8740) < 2.0) or \
                 (haversine_np(dropoff_lat, dropoff_lon, 40.7769, -73.8740) < 2.0)

        base_fare = 3.00
        distance_fare = dist_miles * 3.50
        time_fare = duration_minutes * 0.50
        rush_surcharge = 2.50 if is_rush else 0.0
        night_surcharge = 1.00 if is_night else 0.0
        congestion_fee = 2.50
        airport_fee = 5.00 if (is_jfk or is_lga) else 0.0

        total_fare = round(base_fare + distance_fare + time_fare + rush_surcharge + night_surcharge + congestion_fee + airport_fee, 2)

        return {
            "predicted_duration_seconds": round(duration_seconds, 1),
            "predicted_duration_minutes": round(duration_minutes, 1),
            "predicted_duration_formatted": f"{int(duration_minutes)}m {int(duration_seconds % 60)}s",
            "confidence_interval_minutes": {
                "lower": round(duration_minutes * 0.90, 1),
                "upper": round(duration_minutes * 1.12, 1)
            },
            "estimated_fare": {
                "total": total_fare,
                "base_fare": base_fare,
                "distance_fare": round(distance_fare, 2),
                "time_fare": round(time_fare, 2),
                "rush_surcharge": rush_surcharge,
                "night_surcharge": night_surcharge,
                "congestion_fee": congestion_fee,
                "airport_fee": airport_fee
            },
            "route_metrics": {
                "haversine_distance_km": round(haversine_km, 2),
                "haversine_distance_miles": round(haversine_km * 0.621371, 2),
                "manhattan_distance_km": round(manhattan_km, 2),
                "manhattan_distance_miles": round(dist_miles, 2),
                "bearing_degrees": round(bearing_deg, 1),
                "estimated_speed_kmh": round(avg_speed_kmh, 1),
                "estimated_speed_mph": round(avg_speed_kmh * 0.621371, 1)
            }
        }

engine = ModelEngine()
