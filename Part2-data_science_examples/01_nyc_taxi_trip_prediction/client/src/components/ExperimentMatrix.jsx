import React from 'react';
import { FlaskConical, CheckCircle2, Zap } from 'lucide-react';

export const ExperimentMatrix = ({ experiments = [] }) => {
  return (
    <div className="data-table-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FlaskConical size={20} style={{ color: 'var(--taxi-yellow)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Model Benchmark Experiments</h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Kaggle Competition Benchmark Matrix
        </span>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Model Architecture</th>
            <th>Algorithm</th>
            <th>RMSLE (Target)</th>
            <th>R² Score</th>
            <th>MAE (Sec)</th>
            <th>Train Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {experiments.map((exp) => (
            <tr key={exp.model_id}>
              <td>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {exp.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {JSON.stringify(exp.hyperparameters)}
                </div>
              </td>
              <td>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {exp.algorithm}
                </span>
              </td>
              <td>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: exp.rmsle < 0.20 ? '#10b981' : exp.rmsle < 0.35 ? 'var(--taxi-yellow)' : '#ef4444'
                  }}
                >
                  {exp.rmsle.toFixed(4)}
                </span>
              </td>
              <td>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                  {exp.r2_score.toFixed(4)}
                </span>
              </td>
              <td>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {exp.mae}s ({Math.round(exp.mae / 60)}m)
                </span>
              </td>
              <td>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {exp.training_time_sec}s
                </span>
              </td>
              <td>
                {exp.is_kaggle_baseline ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--taxi-yellow)', background: 'rgba(245, 158, 11, 0.15)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    🏆 Kaggle SOTA Baseline
                  </span>
                ) : exp.is_active ? (
                  <span className="active-pill">
                    <CheckCircle2 size={12} /> Active In Production
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Benchmarked</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
