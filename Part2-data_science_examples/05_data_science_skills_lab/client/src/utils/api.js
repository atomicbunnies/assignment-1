// REST API client helper for Data Science & Analytics Skills Lab

const BASE_URL = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  async getSkillsCatalog() {
    const res = await fetch(`${BASE_URL}/skills/catalog`);
    return res.json();
  },

  async executeSkill(skillId, datasetName = 'Kaggle Titanic', parameters = {}) {
    const res = await fetch(`${BASE_URL}/skills/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skill_id: skillId, dataset_name: datasetName, parameters })
    });
    return res.json();
  },

  async getTitanicBenchmark() {
    const res = await fetch(`${BASE_URL}/benchmarks/titanic`);
    return res.json();
  },

  async getHousePricesBenchmark() {
    const res = await fetch(`${BASE_URL}/benchmarks/house-prices`);
    return res.json();
  },

  async getFraudBenchmark() {
    const res = await fetch(`${BASE_URL}/benchmarks/fraud`);
    return res.json();
  },

  async getEcommerceBenchmark() {
    const res = await fetch(`${BASE_URL}/benchmarks/ecommerce`);
    return res.json();
  },

  async getDataQualityBenchmark() {
    const res = await fetch(`${BASE_URL}/benchmarks/data-quality`);
    return res.json();
  },

  async calculateAbTest(params) {
    const res = await fetch(`${BASE_URL}/ab-test/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  }
};
