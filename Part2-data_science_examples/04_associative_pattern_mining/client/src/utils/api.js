// REST API client helper for Market Basket Intelligence platform

const BASE_URL = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  async getCatalog() {
    const res = await fetch(`${BASE_URL}/catalog`);
    return res.json();
  },

  async recommendBasket(items) {
    const res = await fetch(`${BASE_URL}/basket/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    return res.json();
  },

  async getTopRules(limit = 40) {
    const res = await fetch(`${BASE_URL}/rules/top?limit=${limit}`);
    return res.json();
  },

  async getNetworkGraph() {
    const res = await fetch(`${BASE_URL}/graph/network`);
    return res.json();
  },

  async getBenchmarks() {
    const res = await fetch(`${BASE_URL}/admin/benchmarks`);
    return res.json();
  },

  async getAutoResearchHistory() {
    const res = await fetch(`${BASE_URL}/admin/autoresearch/history`);
    return res.json();
  },

  async runAutoResearch() {
    const res = await fetch(`${BASE_URL}/admin/autoresearch/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  async retrainRules(params) {
    const res = await fetch(`${BASE_URL}/admin/retrain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  }
};
