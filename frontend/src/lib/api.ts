const API_BASE = import.meta.env.DEV
  ? 'http://localhost:8787/api'
  : 'https://love-api.tedguy280.workers.dev/api';

export const api = {
  async generate(data: { topic: string; content: string; level?: string }) {
    console.log('Calling API:', `${API_BASE}/generate`, data);

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `API Error: ${res.status}`);
      }

      return res.json();
    } catch (err) {
      console.error('Generation API failed:', err);
      throw err;
    }
  },

  async publish(data: { html: string; title: string }) {
    // Publish endpoint isn't fully implemented in worker yet, mock for now if it fails
    try {
      const res = await fetch(`${API_BASE}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        if (res.status === 404) {
          console.warn('Publish endpoint not found, simulating success');
          return { url: '#', id: 'mock-id' };
        }
        const error = await res.json();
        throw new Error(error.message || 'Publish failed');
      }

      return res.json();
    } catch (err) {
      console.warn('Publish failed, simulating success for demo', err);
      return { url: '#', id: 'mock-id' };
    }
  }
};