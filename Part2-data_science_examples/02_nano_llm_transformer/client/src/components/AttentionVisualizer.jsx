import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  Eye,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  Grid,
  Info
} from 'lucide-react';

export const AttentionVisualizer = () => {
  const [prompt, setPrompt] = useState('What is RoPE?');
  const [attentionData, setAttentionData] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  const fetchAttention = async (text) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.inspectAttention(text || prompt);
      if (res.success) {
        setAttentionData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to extract attention tensors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttention('What is RoPE?');
  }, []);

  const tokens = attentionData?.tokens || [];
  const layers = attentionData?.layers || [];
  const currentLayer = layers[selectedLayer] || { heads: [] };

  return (
    <div className="attention-container">
      {/* Header & Prompt Input */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Eye size={22} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Multi-Head Attention Heatmap Visualizer</h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {"Inspect query-key attention distribution Softmax((Q @ K.T) / sqrt(d_k)) across 3 layers and 4 heads"}
          </p>
        </div>

        {/* Prompt Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchAttention(prompt);
          }}
          style={{ display: 'flex', gap: '0.5rem', flex: '1', maxWidth: '500px' }}
        >
          <input
            type="text"
            className="chat-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter prompt to compute attention matrices..."
            style={{ fontSize: '0.82rem' }}
          />
          <button type="submit" className="btn-send" disabled={loading} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
            {loading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />}
            <span>Inspect</span>
          </button>
        </form>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Layer Selector Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Select Transformer Layer:
        </span>
        {layers.map((l, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedLayer(idx)}
            className={`nav-tab-btn ${selectedLayer === idx ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
          >
            Layer {idx + 1}
          </button>
        ))}
      </div>

      {/* Hover Information Banner */}
      <div style={{ minHeight: '40px', padding: '0.6rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem' }}>
        <Info size={16} style={{ color: 'var(--accent-cyan)' }} />
        {hoveredCell ? (
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Query Token </span>
            <strong style={{ color: 'var(--accent-cyan-bright)' }}>"{hoveredCell.query}"</strong>
            <span style={{ color: 'var(--text-muted)' }}> attends to Key Token </span>
            <strong style={{ color: 'var(--accent-purple-bright)' }}>"{hoveredCell.key}"</strong>
            <span style={{ color: 'var(--text-muted)' }}> with weight: </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              {(hoveredCell.weight * 100).toFixed(2)}%
            </span>
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>
            Hover over any cell in the attention heatmaps below to inspect token-to-token attention weight.
          </span>
        )}
      </div>

      {/* 4 Heads Attention Matrices Grid */}
      <div className="attention-grid">
        {currentLayer.heads.map((head, hIdx) => {
          return (
            <div key={hIdx} className="heatmap-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-cyan-bright)' }}>
                  Head {hIdx + 1} (RoPE Dim 32)
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {tokens.length} x {tokens.length} Causal Matrix
                </span>
              </div>

              <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
                <table className="matrix-table">
                  <tbody>
                    {head.matrix.map((row, rIdx) => {
                      const qToken = tokens[rIdx] || `#${rIdx}`;
                      return (
                        <tr key={rIdx}>
                          <td style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', paddingRight: '4px', color: 'var(--text-muted)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {qToken}
                          </td>
                          {row.map((val, cIdx) => {
                            const kToken = tokens[cIdx] || `#${cIdx}`;
                            const isCausalMasked = cIdx > rIdx;
                            const alpha = isCausalMasked ? 0.03 : Math.min(1.0, Math.max(0.05, val * 1.5));
                            const bg = isCausalMasked
                              ? 'rgba(255, 255, 255, 0.02)'
                              : `rgba(6, 182, 212, ${alpha})`;

                            return (
                              <td
                                key={cIdx}
                                className="matrix-cell"
                                style={{
                                  background: bg,
                                  cursor: isCausalMasked ? 'default' : 'pointer'
                                }}
                                onMouseEnter={() => {
                                  if (!isCausalMasked) {
                                    setHoveredCell({
                                      query: qToken,
                                      key: kToken,
                                      weight: val,
                                      head: hIdx + 1,
                                      layer: selectedLayer + 1
                                    });
                                  }
                                }}
                                onMouseLeave={() => setHoveredCell(null)}
                              />
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
