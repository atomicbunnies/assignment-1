# Automated Test Suite for Market Basket Intelligence FastAPI Server

import os
import sys
import unittest
from fastapi.testclient import TestClient

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.dirname(__file__))
from main import app, engine

class TestMarketBasketAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["rules_loaded"])
        self.assertGreaterEqual(data["active_rules_count"], 10)
        print("  ✓ test_01_health passed")

    def test_02_catalog(self):
        res = self.client.get("/api/catalog")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertGreaterEqual(len(data["products"]), 20)
        print("  ✓ test_02_catalog passed")

    def test_03_basket_recommend(self):
        payload = {
            "items": ["Organic Hass Avocados", "Fresh Limes"]
        }
        res = self.client.post("/api/basket/recommend", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("recommendations", data["data"])
        self.assertGreaterEqual(len(data["data"]["recommendations"]), 1)
        top_rec = data["data"]["recommendations"][0]
        self.assertIn("item_name", top_rec)
        self.assertIn("lift", top_rec)
        print(f"  ✓ test_03_basket_recommend passed (Top Recommendation: {top_rec['item_name']} with Lift {top_rec['lift']})")

    def test_04_top_rules(self):
        res = self.client.get("/api/rules/top?limit=25")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(len(data["rules"]), 25)
        print("  ✓ test_04_top_rules passed")

    def test_05_network_graph(self):
        res = self.client.get("/api/graph/network")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("nodes", data["graph"])
        self.assertIn("links", data["graph"])
        print(f"  ✓ test_05_network_graph passed ({len(data['graph']['nodes'])} nodes, {len(data['graph']['links'])} links)")

    def test_06_benchmarks(self):
        res = self.client.get("/api/admin/benchmarks")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("leaderboard", data["data"])
        print("  ✓ test_06_benchmarks passed")

    def test_07_autoresearch_history(self):
        res = self.client.get("/api/admin/autoresearch/history")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("trajectory", data["data"])
        print("  ✓ test_07_autoresearch_history passed")

if __name__ == '__main__':
    unittest.main()
