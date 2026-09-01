import React, { useState } from 'react';
import { api } from '../utils/api';
import confetti from 'canvas-confetti';
import {
  RefreshCw,
  Sparkles,
  X,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const RetrainModal = ({ isOpen, onClose, onTrainingComplete }) => {
  const [epochs, setEpochs] = useState(15);
  const [batchSize, setBatchSize] = useState(16);
  const [lr, setLr] = useState(0.003);
  const [isTraining, setIsTraining] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleStartTraining = async () => {
    try {
      setIsTraining(true);
      setError(null);
      setStatusMsg('Training NanoLlama neural network on CPU (AdamW + Cosine schedule)...');

      const res = await api.triggerLiveRetrain({
        epochs: parseInt(epochs),
        batch_size: parseInt(batchSize),
        lr: parseFloat(lr)
      });

      if (res.success) {
        setStatusMsg('Training completed successfully! Model checkpoint reloaded.');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          onTrainingComplete && onTrainingComplete();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="controls-card"
        style={{ width: '100%', maxWidth: '520px', background: 'var(--bg-secondary)', border: '1px solid var(--border-active)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <RefreshCw size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>NanoLlama Live Retraining Studio</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.82rem' }}>
            {error}
          </div>
        )}

        {statusMsg && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={15} />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Epochs Slider */}
        <div className="control-group">
          <div className="control-label">
            <span>Training Epochs</span>
            <span style={{ color: 'var(--accent-cyan-bright)', fontFamily: 'var(--font-mono)' }}>{epochs}</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={epochs}
            onChange={(e) => setEpochs(e.target.value)}
            disabled={isTraining}
            className="slider-input"
          />
        </div>

        {/* Batch Size Slider */}
        <div className="control-group">
          <div className="control-label">
            <span>Batch Size</span>
            <span style={{ color: 'var(--accent-purple-bright)', fontFamily: 'var(--font-mono)' }}>{batchSize}</span>
          </div>
          <input
            type="range"
            min="8"
            max="32"
            step="8"
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
            disabled={isTraining}
            className="slider-input"
          />
        </div>

        {/* Learning Rate Slider */}
        <div className="control-group">
          <div className="control-label">
            <span>Learning Rate (lr)</span>
            <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{lr}</span>
          </div>
          <input
            type="range"
            min="0.0005"
            max="0.008"
            step="0.0005"
            value={lr}
            onChange={(e) => setLr(e.target.value)}
            disabled={isTraining}
            className="slider-input"
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            onClick={onClose}
            disabled={isTraining}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.82rem' }}
          >
            Cancel
          </button>

          <button
            onClick={handleStartTraining}
            disabled={isTraining}
            className="btn-send"
          >
            {isTraining ? (
              <>
                <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Optimizing Weights...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Start Training Run</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
