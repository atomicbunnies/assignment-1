// REST API Client for Customer Segmentation Backend

export const api = {
  async getHealth() {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getClustersSummary() {
    const res = await fetch('/api/clusters/summary');
    if (!res.ok) throw new Error('Failed to fetch cluster profiles');
    return res.json();
  },

  async getScatterPoints() {
    const res = await fetch('/api/clusters/scatter');
    if (!res.ok) throw new Error('Failed to fetch scatter points');
    return res.json();
  },

  async predictCustomer(data) {
    const res = await fetch('/api/cluster/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Customer prediction failed');
    return res.json();
  },

  async getBenchmarks() {
    const res = await fetch('/api/admin/benchmarks');
    if (!res.ok) throw new Error('Failed to fetch benchmarks');
    return res.json();
  },

  async getElbowData() {
    const res = await fetch('/api/admin/elbow');
    if (!res.ok) throw new Error('Failed to fetch elbow data');
    return res.json();
  },

  async getAutoResearchHistory() {
    const res = await fetch('/api/admin/autoresearch/history');
    if (!res.ok) throw new Error('Failed to fetch AutoResearch history');
    return res.json();
  },

  async runAutoResearch() {
    const res = await fetch('/api/admin/autoresearch/run', {
      method: 'POST'
    });
    if (!res.ok) throw new Error('AutoResearch execution failed');
    return res.json();
  },

  async retrainModel(params = {}) {
    const res = await fetch('/api/admin/retrain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Retraining failed');
    return res.json();
  }
};
