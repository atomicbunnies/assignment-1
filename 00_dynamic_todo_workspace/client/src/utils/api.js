// API Client with robust fetch handling and SSE stream subscription

const BASE_URL = '/api';

export const api = {
  // Tasks
  async getTasks(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${BASE_URL}/todos?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async getTask(id) {
    const res = await fetch(`${BASE_URL}/todos/${id}`);
    if (!res.ok) throw new Error('Failed to fetch task');
    return res.json();
  },

  async createTask(taskData) {
    const res = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  async updateTask(id, taskData) {
    const res = await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async patchTask(id, partialData) {
    const res = await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialData)
    });
    if (!res.ok) throw new Error('Failed to patch task');
    return res.json();
  },

  async deleteTask(id, permanent = false) {
    const res = await fetch(`${BASE_URL}/todos/${id}?permanent=${permanent}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
  },

  async batchAction(action, taskIds, value = null) {
    const res = await fetch(`${BASE_URL}/todos/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, taskIds, value })
    });
    if (!res.ok) throw new Error('Failed to execute batch action');
    return res.json();
  },

  async reorderTasks(items) {
    const res = await fetch(`${BASE_URL}/todos/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    if (!res.ok) throw new Error('Failed to reorder tasks');
    return res.json();
  },

  // Categories & Tags
  async getCategories() {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(categoryData) {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async deleteCategory(id) {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  },

  async getTags() {
    const res = await fetch(`${BASE_URL}/categories/tags/all`);
    if (!res.ok) throw new Error('Failed to fetch tags');
    return res.json();
  },

  async createTag(tagData) {
    const res = await fetch(`${BASE_URL}/categories/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tagData)
    });
    if (!res.ok) throw new Error('Failed to create tag');
    return res.json();
  },

  // Analytics & Activity
  async getAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async getActivity() {
    const res = await fetch(`${BASE_URL}/activity`);
    if (!res.ok) throw new Error('Failed to fetch activity');
    return res.json();
  }
};

// Real-time EventSource Subscriber
export function subscribeToEvents(onEvent) {
  try {
    const eventSource = new EventSource(`${BASE_URL}/events`);
    
    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onEvent(data);
      } catch (err) {
        console.error('SSE JSON parse error', err);
      }
    };

    eventSource.onerror = (err) => {
      // EventSource automatically tries to reconnect
    };

    return () => {
      eventSource.close();
    };
  } catch (err) {
    console.error('EventSource connection error:', err);
    return () => {};
  }
}
