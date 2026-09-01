import React, { useState } from 'react';
import { api } from '../utils/api';
import confetti from 'canvas-confetti';
import { X, RefreshCw, Sliders, CheckCircle, AlertTriangle } from 'lucide-react';

export const RetrainStudioModal = ({ isOpen, onClose, onRetrainSuccess }) => {
  if (!isOpen) return null;

  const [nSamples, setNSamples] = useState(40000);
  const [nEstimators, setNEstimators] = useState(250);
  const [maxDepth, setMaxDepth] = useState(7);
  const [learningRate, setLearningRate] = useState(0.08);
  const [subsample, setSubsample] = useState(0.85);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState(null);

  const handleRetrain = async (e) => {
    e.preventDefault();
    try {
      setIsTraining(true);
      setError(null);
      const res = await api.retrainModel({
        n_samples: parseInt(nSamples, 10),
        n_estimators: parseInt(nEstimators, 10),
        max_depth: parseInt(maxDepth, 10),
        learning_rate: parseFloat(learningRate),
        subsample: parseFloat(subsample)
      });
      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onRetrainSuccess) onRetrainSuccess(res.metadata);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Retraining failed');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} style={{ color: 'var(--taxi-yellow)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Model Retraining Studio</h3>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.35rem 0.6rem' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleRetrain} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* n_samples */}
          <div className="form-group">
            <label className="form-label">
              <span>Dataset Sample Size: <b>{nSamples.toLocaleString()}</b> trips</span>
            </label>
            <input
              type="range"
              min="10000"
              max="60000"
              step="5000"
              value={nSamples}
              onChange={(e) => setNSamples(e.target.value)}
              style={{ accentColor: 'var(--taxi-yellow)' }}
            />
          </div>

          {/* n_estimators */}
          <div className="form-group">
            <label className="form-label">
              <span>Boosting Rounds (n_estimators): <b>{nEstimators}</b></span>
            </label>
            <input
              type="range"
              min="50"
              max="400"
              step="25"
              value={nEstimators}
              onChange={(e) => setNEstimators(e.target.value)}
              style={{ accentColor: 'var(--taxi-yellow)' }}
            />
          </div>

          {/* max_depth & learning_rate */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <span>Tree Max Depth: <b>{maxDepth}</b></span>
              </label>
              <input
                type="range"
                min="4"
                max="10"
                step="1"
                value={maxDepth}
                onChange={(e) => setMaxDepth(e.target.value)}
                style={{ accentColor: 'var(--taxi-yellow)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Learning Rate: <b>{learningRate}</b></span>
              </label>
              <input
                type="number"
                min="0.01"
                max="0.30"
                step="0.01"
                className="form-input"
                value={learningRate}
                onChange={(e) => setLearningRate(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isTraining}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isTraining} style={{ minWidth: 160 }}>
              {isTraining ? (
                <>
                  <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Training Model...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={15} />
                  <span>Launch Retraining</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
