# Automated Test Suite for NanoLlama Backend

import os
import sys
import unittest
from fastapi.testclient import TestClient

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.dirname(__file__))
from main import app, engine

class TestNanoLlamaAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["model_loaded"])
        self.assertGreater(data["parameters"], 100000)
        print("  ✓ test_01_health passed")

    def test_02_presets(self):
        res = self.client.get("/api/prompts/presets")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertGreaterEqual(len(data["presets"]), 5)
        print("  ✓ test_02_presets passed")

    def test_03_chat_stream(self):
        res = self.client.get("/api/chat/stream?prompt=Hello!&max_tokens=30")
        self.assertEqual(res.status_code, 200)
        content = res.text
        self.assertIn("data:", content)
        self.assertIn("tokens_generated", content)
        print("  ✓ test_03_chat_stream passed")

    def test_04_inspect_attention(self):
        payload = {"prompt": "What is RoPE?"}
        res = self.client.post("/api/inspect/attention", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("layers", data["data"])
        self.assertEqual(len(data["data"]["layers"]), 3)
        self.assertEqual(len(data["data"]["layers"][0]["heads"]), 4)
        print("  ✓ test_04_inspect_attention passed")

    def test_05_tokenize(self):
        payload = {"text": "Hello! Who are you?"}
        res = self.client.post("/api/tokenize", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("tokens", data["data"])
        self.assertIn("top_predictions", data["data"])
        self.assertEqual(len(data["data"]["top_predictions"]), 5)
        print("  ✓ test_05_tokenize passed")

    def test_06_telemetry(self):
        res = self.client.get("/api/training/telemetry")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("training_curve", data["data"])
        self.assertIn("final_metrics", data["data"])
        print("  ✓ test_06_telemetry passed")

if __name__ == "__main__":
    unittest.main()
