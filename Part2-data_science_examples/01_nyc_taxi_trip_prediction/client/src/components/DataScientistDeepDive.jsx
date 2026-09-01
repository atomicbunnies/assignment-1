import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  Layers,
  Activity,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  BarChart,
  Grid
} from 'lucide-react';

export const DataScientistDeepDive = () => {
  const [deepdive, setDeepdive] = useState(null);

  useEffect(() => {
    async function loadDeepdive() {
      try {
        const res = await api.getAdminDeepdive();
        if (res.success) setDeepdive(res);
      } catch (err) {
        console.error('Failed to load deepdive:', err);
      }
    }
    loadDeepdive();
  }, []);

  if (!deepdive) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
      {/* 1. Distance Segment Error Analysis Table */}
      <div className="data-table-container" style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} style={{ color: 'var(--taxi-yellow)' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Model Accuracy by Distance Tier</h4>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Error segmentation across urban trip buckets
          </span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Trip Distance Tier</th>
              <th>Range (km)</th>
              <th>MAE (Seconds)</th>
              <th>MAPE (%)</th>
              <th>R² Score</th>
              <th>Validation Sample Size</th>
            </tr>
          </thead>
          <tbody>
            {deepdive.segment_errors?.map((seg) => (
              <tr key={seg.segment}>
                <td><b>{seg.segment}</b></td>
                <td><code style={{ fontFamily: 'var(--font-mono)' }}>{seg.dist_range}</code></td>
                <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--taxi-yellow-bright)' }}>{seg.mae_sec}s ({Math.round(seg.mae_sec / 60)}m)</span></td>
                <td><span style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>{seg.mape_pct}%</span></td>
                <td><span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{seg.r2_score}</span></td>
                <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{seg.sample_count.toLocaleString()} trips</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Residual Statistical Diagnostics & Feature Correlation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Statistical Moments Card */}
        <div className="data-table-container" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Activity size={18} style={{ color: '#06b6d4' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Residual Distribution Diagnostics</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Residual Skewness</div>
              <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#10b981' }}>
                {deepdive.residual_diagnostics?.skewness}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: 0.00 (Symmetric)</div>
            </div>

            <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Kurtosis</div>
              <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#38bdf8' }}>
                {deepdive.residual_diagnostics?.kurtosis}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Standard Normal Mesokurtic (3.0)</div>
            </div>

            <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mean Bias Error</div>
              <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fbbf24' }}>
                +{deepdive.residual_diagnostics?.mean_bias_error_sec}s
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Near-zero systematic offset</div>
            </div>

            <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall MAPE</div>
              <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#10b981' }}>
                {deepdive.residual_diagnostics?.mape_pct}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mean absolute percentage error</div>
            </div>
          </div>
        </div>

        {/* Feature Correlation Table */}
        <div className="data-table-container" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Grid size={18} style={{ color: '#a855f7' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Feature Correlation with Target (log_duration)</h4>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Feature Signal</th>
                <th>Type</th>
                <th>Pearson r</th>
              </tr>
            </thead>
            <tbody>
              {deepdive.feature_correlations?.map((fc) => (
                <tr key={fc.feature}>
                  <td><code>{fc.feature}</code></td>
                  <td><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fc.type}</span></td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: fc.target_corr > 0.5 ? '#10b981' : fc.target_corr > 0 ? '#38bdf8' : '#f59e0b'
                      }}
                    >
                      {fc.target_corr > 0 ? `+${fc.target_corr}` : fc.target_corr}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
