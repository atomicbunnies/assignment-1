# Automated Test Suite for Customer Segmentation FastAPI Server

import os
import sys
import unittest
from fastapi.testclient import TestClient

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.dirname(__file__))
from main import app, engine

class TestCustomerClusteringAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["model_loaded"])
        self.assertEqual(data["n_clusters"], 5)
        print("  ✓ test_01_health passed")

    def test_02_clusters_summary(self):
        res = self.client.get("/api/clusters/summary")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(len(data["profiles"]), 5)
        print("  ✓ test_02_clusters_summary passed")

    def test_03_scatter_points(self):
        res = self.client.get("/api/clusters/scatter")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertGreaterEqual(data["total_points"], 500)
        print("  ✓ test_03_scatter_points passed")

    def test_04_cluster_predict(self):
        payload = {
            "age": 35.0,
            "annual_income_k": 115.0,
            "spending_score": 88.0,
            "recency_days": 10.0,
            "total_spend_annual": 8500.0,
            "web_visits_month": 12.0,
            "discount_sensitivity": 0.15,
            "family_size": 2.0
        }
        res = self.client.post("/api/cluster/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("cluster_id", data["prediction"])
        self.assertIn("persona_name", data["prediction"])
        self.assertIn("marketing_strategy", data["prediction"])
        print(f"  ✓ test_04_cluster_predict passed (Assigned: {data['prediction']['persona_name']})")

    def test_05_benchmarks(self):
        res = self.client.get("/api/admin/benchmarks")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("leaderboard", data["data"])
        self.assertGreaterEqual(len(data["data"]["leaderboard"]), 4)
        print("  ✓ test_05_benchmarks passed")

    def test_06_elbow_curve(self):
        res = self.client.get("/api/admin/elbow")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertGreaterEqual(len(data["data"]), 5)
        print("  ✓ test_06_elbow_curve passed")

    def test_07_autoresearch_history(self):
        res = self.client.get("/api/admin/autoresearch/history")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("trajectory", data["data"])
        self.assertIn("backbones_leaderboard", data["data"])
        print("  ✓ test_07_autoresearch_history passed")

if __name__ == '__main__':
    unittest.main()
