# Automated Test Suite for NYC Taxi FastAPI Server & ML Inference

import sys
import urllib.request
import json
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000/api"

def http_get(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def http_post(url, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def run_all_tests():
    print("🧪 Running NYC Taxi ML API Test Suite...\n")
    passed = 0
    failed = 0

    def test(name, fn):
        nonlocal passed, failed
        try:
            fn()
            print(f"  ✅ PASS: {name}")
            passed += 1
        except Exception as e:
            print(f"  ❌ FAIL: {name}")
            print(f"     Error: {e}")
            failed += 1

    # 1. Health Check
    def test_health():
        status, data = http_get(f"{BASE_URL}/health")
        assert status == 200
        assert data["status"] == "healthy"
        assert data["model_loaded"] is True
    test("GET /api/health should report healthy model", test_health)

    # 2. Landmarks
    def test_landmarks():
        status, data = http_get(f"{BASE_URL}/landmarks")
        assert status == 200
        assert data["success"] is True
        assert len(data["landmarks"]) >= 8
    test("GET /api/landmarks should return NYC landmark presets", test_landmarks)

    # 3. Predict Single Trip
    def test_predict():
        payload = {
            "pickup_latitude": 40.7580,
            "pickup_longitude": -73.9855,
            "dropoff_latitude": 40.6413,
            "dropoff_longitude": -73.7781,
            "pickup_datetime": "2026-08-20T17:30:00",
            "passenger_count": 2
        }
        status, data = http_post(f"{BASE_URL}/predict", payload)
        assert status == 200
        assert data["success"] is True
        pred = data["prediction"]
        assert pred["predicted_duration_minutes"] > 0
        assert pred["estimated_fare"]["total"] > 0
        assert pred["route_metrics"]["manhattan_distance_km"] > 0
    test("POST /api/predict should estimate duration, fare, and metrics", test_predict)

    # 4. Predict Batch
    def test_predict_batch():
        trips = [
            {
                "pickup_latitude": 40.7580,
                "pickup_longitude": -73.9855,
                "dropoff_latitude": 40.7074,
                "dropoff_longitude": -74.0113,
                "passenger_count": 1
            },
            {
                "pickup_latitude": 40.7769,
                "pickup_longitude": -73.8740,
                "dropoff_latitude": 40.7660,
                "dropoff_longitude": -73.9772,
                "passenger_count": 3
            }
        ]
        status, data = http_post(f"{BASE_URL}/predict/batch", trips)
        assert status == 200
        assert data["count"] == 2
        assert len(data["predictions"]) == 2
    test("POST /api/predict/batch should perform bulk inference", test_predict_batch)

    # 5. Admin Overview
    def test_admin_overview():
        status, data = http_get(f"{BASE_URL}/admin/overview")
        assert status == 200
        assert data["success"] is True
        assert data["metadata"]["best_model"] == "XGBoost Regressor"
        assert len(data["features"]) >= 15
    test("GET /api/admin/overview should return model metadata & features", test_admin_overview)

    # 6. Admin Experiments
    def test_admin_experiments():
        status, data = http_get(f"{BASE_URL}/admin/experiments")
        assert status == 200
        assert len(data["experiments"]) >= 3
        # Check that RMSLE and R2 are present
        for exp in data["experiments"]:
            assert "rmsle" in exp
            assert "r2_score" in exp
    test("GET /api/admin/experiments should return benchmarked models", test_admin_experiments)

    # 7. Admin Residuals
    def test_admin_residuals():
        status, data = http_get(f"{BASE_URL}/admin/residuals")
        assert status == 200
        assert "learning_curves" in data["data"]
        assert "duration_distribution" in data["data"]
        assert "hourly_distribution" in data["data"]
    test("GET /api/admin/residuals should return curves & distributions", test_admin_residuals)

    # 8. Admin Deep-Dive
    def test_admin_deepdive():
        status, data = http_get(f"{BASE_URL}/admin/deepdive")
        assert status == 200
        assert data["success"] is True
        assert len(data["segment_errors"]) >= 4
        assert "skewness" in data["residual_diagnostics"]
        assert len(data["feature_correlations"]) >= 5
    test("GET /api/admin/deepdive should return segment errors & correlations", test_admin_deepdive)

    # 9. AutoResearch History
    def test_autoresearch_history():
        status, data = http_get(f"{BASE_URL}/admin/autoresearch/history")
        assert status == 200
        assert data["success"] is True
        assert "trajectory" in data["data"]
        assert len(data["data"]["trajectory"]) >= 1
    test("GET /api/admin/autoresearch/history should return hill climbing steps", test_autoresearch_history)

    # 10. Live Retrain Worker
    def test_admin_retrain():
        payload = {
            "n_samples": 10000,
            "n_estimators": 50,
            "max_depth": 5,
            "learning_rate": 0.1,
            "subsample": 0.8
        }
        status, data = http_post(f"{BASE_URL}/admin/retrain", payload)
        assert status == 200
        assert data["success"] is True
        assert "metadata" in data
    test("POST /api/admin/retrain should re-train and update model in-memory", test_admin_retrain)

    print("\n========================================")
    print(f"📊 Test Results: {passed} Passed, {failed} Failed")
    print("========================================\n")

    if failed > 0:
        sys.exit(1)

if __name__ == '__main__':
    run_all_tests()
