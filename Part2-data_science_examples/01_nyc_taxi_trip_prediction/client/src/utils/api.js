// API client for NYC Taxi ML Backend

const BASE_URL = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error('API server unreachable');
    return res.json();
  },

  async getLandmarks() {
    const res = await fetch(`${BASE_URL}/landmarks`);
    if (!res.ok) throw new Error('Failed to load landmarks');
    return res.json();
  },

  async predictTrip(params) {
    const res = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Prediction request failed');
    return res.json();
  },

  // Admin Data Science Telemetry
  async getAdminOverview() {
    const res = await fetch(`${BASE_URL}/admin/overview`);
    if (!res.ok) throw new Error('Failed to fetch admin overview');
    return res.json();
  },

  async getAdminExperiments() {
    const res = await fetch(`${BASE_URL}/admin/experiments`);
    if (!res.ok) throw new Error('Failed to fetch experiments');
    return res.json();
  },

  async getAdminResiduals() {
    const res = await fetch(`${BASE_URL}/admin/residuals`);
    if (!res.ok) throw new Error('Failed to fetch residuals telemetry');
    return res.json();
  },

  async getAdminDeepdive() {
    const res = await fetch(`${BASE_URL}/admin/deepdive`);
    if (!res.ok) throw new Error('Failed to fetch deepdive telemetry');
    return res.json();
  },

  async getAutoResearchHistory() {
    const res = await fetch(`${BASE_URL}/admin/autoresearch/history`);
    if (!res.ok) throw new Error('Failed to fetch AutoResearch history');
    return res.json();
  },

  async runAutoResearch() {
    const res = await fetch(`${BASE_URL}/admin/autoresearch/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('AutoResearch execution failed');
    return res.json();
  },

  async retrainModel(params) {
    const res = await fetch(`${BASE_URL}/admin/retrain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Retraining request failed');
    return res.json();
  }
};
