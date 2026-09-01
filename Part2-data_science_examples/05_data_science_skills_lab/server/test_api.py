# Automated Test Suite for Data Science & Analytics Skills Lab API

import os
import sys
import unittest
from fastapi.testclient import TestClient

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.dirname(__file__))
from main import app

class TestSkillsLabAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["total_skills_installed"], 46)
        print("  ✓ test_01_health passed")

    def test_02_skills_catalog(self):
        res = self.client.get("/api/skills/catalog")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertGreaterEqual(data["total_skills"], 10)
        print(f"  ✓ test_02_skills_catalog passed ({data['total_skills']} skills loaded)")

    def test_03_titanic_benchmark(self):
        res = self.client.get("/api/benchmarks/titanic")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("metrics", data["data"])
        self.assertGreaterEqual(data["data"]["metrics"]["roc_auc"], 0.70)
        print(f"  ✓ test_03_titanic_benchmark passed (ROC-AUC: {data['data']['metrics']['roc_auc']})")

    def test_04_house_prices_benchmark(self):
        res = self.client.get("/api/benchmarks/house-prices")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("metrics", data["data"])
        self.assertGreaterEqual(data["data"]["metrics"]["r2_score"], 0.80)
        print(f"  ✓ test_04_house_prices_benchmark passed (R2 Score: {data['data']['metrics']['r2_score']})")

    def test_05_fraud_benchmark(self):
        res = self.client.get("/api/benchmarks/fraud")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("balanced_model", data["data"])
        print(f"  ✓ test_05_fraud_benchmark passed (Balanced Recall: {data['data']['balanced_model']['recall']})")

    def test_06_ecommerce_benchmark(self):
        res = self.client.get("/api/benchmarks/ecommerce")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("cohort_matrix", data["data"])
        self.assertIn("funnel_stages", data["data"])
        print("  ✓ test_06_ecommerce_benchmark passed")

    def test_07_data_quality_benchmark(self):
        res = self.client.get("/api/benchmarks/data-quality")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("data_quality_score", data["data"])
        print(f"  ✓ test_07_data_quality_benchmark passed (Quality Score: {data['data']['data_quality_score']})")

    def test_08_ab_test_calculate(self):
        payload = {
            "n_control": 25000,
            "x_control": 1450,
            "n_treatment": 25000,
            "x_treatment": 1750
        }
        res = self.client.post("/api/ab-test/calculate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertTrue(data["data"]["is_statistically_significant"])
        print("  ✓ test_08_ab_test_calculate passed")

if __name__ == '__main__':
    unittest.main()
