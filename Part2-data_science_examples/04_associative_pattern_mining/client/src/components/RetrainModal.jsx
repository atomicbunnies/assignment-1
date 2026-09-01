import React, { useState } from 'react';
import { SlidersHorizontal, X, Play, RotateCcw, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export const RetrainModal = ({ onClose, onRetrainSuccess }) => {
  const [minSupport, setMinSupport] = useState(0.030);
  const [minConfidence, setMinConfidence] = useState(0.35);
  const [minLift, setMinLift] = useState(1.25);
  const [nTransactions, setNTransactions] = useState(10000);
  const [training, setTraining] = useState(false);
  const [result, setResult] = useState(null);

  const handleRetrain = async () => {
    try {
      setTraining(true);
      const res = await api.retrainRules({
        min_support: minSupport,
        min_confidence: minConfidence,
        min_lift: minLift,
        n_transactions: nTransactions
      });
      if (res.success) {
        setResult(res);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        if (onRetrainSuccess) onRetrainSuccess();
      }
    } catch (err) {
      console.error('Retrain failed:', err);
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(6, 8, 18, 0.95))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <SlidersHorizontal size={20} style={{ color: 'var(--accent-amber-bright)' }} />
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-amber-bright)' }}>
                Live Hyperparameter Studio
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                Association Rule Retraining & Calibration
              </h3>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Min Support Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Minimum Support Threshold (min_support)</label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-amber-bright)' }}>
                {(minSupport * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.10"
              step="0.005"
              value={minSupport}
              onChange={(e) => setMinSupport(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-amber)' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Controls frequent itemset pruning sensitivity. Lower values capture rare high-value bundles.
            </div>
          </div>

          {/* Min Confidence Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Minimum Confidence (min_confidence)</label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-emerald-bright)' }}>
                {(minConfidence * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.20"
              max="0.80"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Probability threshold for conditional rule triggering P(Consequent | Antecedent).
            </div>
          </div>

          {/* Min Lift Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Minimum Lift Multiplier (min_lift)</label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {minLift.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={minLift}
              onChange={(e) => setMinLift(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
          </div>

          {result && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.85rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-emerald-bright)', fontSize: '0.82rem', fontWeight: 700 }}>
              <Check size={16} />
              <span>{result.message} ({result.production_metrics?.active_rules_count || 0} active rules)</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.6rem', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleRetrain}
            disabled={training}
            id="btn-confirm-retrain"
          >
            <Play size={15} />
            <span>{training ? 'Re-mining Patterns...' : 'Execute Retrain Pipeline'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
