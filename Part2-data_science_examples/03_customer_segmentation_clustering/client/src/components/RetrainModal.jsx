import React, { useState } from 'react';
import { api } from '../utils/api';
import confetti from 'canvas-confetti';
import {
  RefreshCw,
  X,
  Sliders,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const RetrainModal = ({ isOpen, onClose, onRetrained }) => {
  const [nClusters, setNClusters] = useState(5);
  const [nSamples, setNSamples] = useState(10000);
  const [isRetraining, setIsRetraining] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);

  if (!isOpen) return null;

  const handleRetrain = async () => {
    try {
      setIsRetraining(true);
      setResultMessage(null);
      const res = await api.retrainModel({
        n_clusters: parseInt(nClusters),
        n_samples: parseInt(nSamples)
      });
      if (res.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setResultMessage('Model Retraining Complete! Centroids and PCA manifolds updated.');
        if (onRetrained) onRetrained();
      }
    } catch (err) {
      setResultMessage(`Retraining failed: ${err.message}`);
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} style={{ color: 'var(--accent-emerald)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Clustering Retraining Studio</h3>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.35rem 0.6rem' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span>Target Number of Clusters (k)</span>
              <strong style={{ color: 'var(--accent-emerald-bright)' }}>{nClusters} Clusters</strong>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={nClusters}
              onChange={(e) => setNClusters(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span>Training Dataset Scale (N)</span>
              <strong style={{ color: 'var(--accent-cyan-bright)' }}>{nSamples.toLocaleString()} Records</strong>
            </div>
            <input
              type="range"
              min="2000"
              max="20000"
              step="1000"
              value={nSamples}
              onChange={(e) => setNSamples(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
          </div>

          {resultMessage && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald-bright)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{resultMessage}</span>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', background: 'var(--bg-tertiary)' }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleRetrain} disabled={isRetraining}>
            {isRetraining ? (
              <>
                <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Retraining Pipelines...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Execute Retraining</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
