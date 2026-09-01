// API client for NanoLlama backend

export const api = {
  async getHealth() {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getPresets() {
    const res = await fetch('/api/prompts/presets');
    if (!res.ok) throw new Error('Failed to fetch presets');
    return res.json();
  },

  async getTrainingTelemetry() {
    const res = await fetch('/api/training/telemetry');
    if (!res.ok) throw new Error('Failed to fetch telemetry');
    return res.json();
  },

  async inspectAttention(prompt) {
    const res = await fetch('/api/inspect/attention', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) throw new Error('Failed to extract attention weights');
    return res.json();
  },

  async tokenizeText(text) {
    const res = await fetch('/api/tokenize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Failed to tokenize text');
    return res.json();
  },

  async triggerLiveRetrain(params = {}) {
    const res = await fetch('/api/train/live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Live training failed');
    return res.json();
  },

  async streamChat({ prompt, system, temperature, top_p, top_k, repetition_penalty, max_tokens }, onChunk, onDone, onError) {
    try {
      const q = new URLSearchParams({
        prompt,
        system: system || 'You are NanoLlama, a helpful, brilliant AI assistant.',
        temperature: temperature ?? 0.7,
        top_p: top_p ?? 0.9,
        top_k: top_k ?? 40,
        repetition_penalty: repetition_penalty ?? 1.1,
        max_tokens: max_tokens ?? 150
      });

      const response = await fetch(`/api/chat/stream?${q.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const data = JSON.parse(jsonStr);
              if (data.error) {
                onError && onError(data.error);
                return;
              }
              if (data.is_finished) {
                onDone && onDone(data);
              } else {
                onChunk && onChunk(data);
              }
            } catch (e) {
              console.error('Error parsing SSE event', e);
            }
          }
        }
      }
    } catch (err) {
      onError && onError(err.message || 'Stream connection error');
    }
  }
};
