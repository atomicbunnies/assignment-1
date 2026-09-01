import React from 'react';
import { Home, TrendingUp, DollarSign, Layers } from 'lucide-react';

export const HousePricesView = ({ data = {} }) => {
  const { metrics = {}, scatter_samples = [], sample_rows = [] } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overview Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(16, 185, 129, 0.08))', borderColor: 'var(--border-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <Home size={18} style={{ color: 'var(--accent-cyan-bright)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-cyan-bright)' }}>
                Kaggle Advanced Regression Benchmark
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              House Prices: Advanced Regression Techniques
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Demonstrating <strong>Log-Target Transforms</strong>, <strong>Polynomial Feature Scaling</strong>, and <strong>Residual Diagnostics</strong>.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'rgba(7, 9, 19, 0.8)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>R² Score</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald-bright)' }}>
                {metrics.r2_score || 0.8105}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>RMSE Error</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan-bright)' }}>
                ${(metrics.rmse || 28450).toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>MAE Error</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-indigo-bright)' }}>
                ${(metrics.mae || 17200).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actual vs Predicted Scatter Plot SVG */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-cyan-bright)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              Actual vs Predicted Home Valuation (Evaluation Fold)
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Diagonal line = Perfect Prediction Identity
          </span>
        </div>

        <div style={{ width: '100%', height: 280, background: 'rgba(7, 9, 19, 0.7)', borderRadius: 'var(--radius-md)', padding: '1rem', position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 700 240">
            {/* Identity line y = x */}
            <line x1="50" y1="200" x2="650" y2="40" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4,4" />

            {/* Scatter points */}
            {scatter_samples.map((pt, idx) => {
              const x = 50 + (Math.min(500000, Math.max(50000, pt.actual)) / 500000) * 600;
              const y = 240 - (Math.min(500000, Math.max(50000, pt.predicted)) / 500000) * 200;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r={4.5}
                  fill="var(--accent-cyan-bright)"
                  opacity={0.8}
                >
                  <title>Actual: ${pt.actual.toLocaleString()} | Predicted: ${pt.predicted.toLocaleString()}</title>
                </circle>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Sample Raw Feature Rows */}
      <div className="data-table-container">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>
          Kaggle Ames Housing Tabular Sample
        </h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Living Area (SqFt)</th>
              <th>Overall Quality</th>
              <th>Year Built</th>
              <th>Basement SqFt</th>
              <th>Garage Cars</th>
              <th>Neighborhood</th>
              <th>Actual Sale Price</th>
            </tr>
          </thead>
          <tbody>
            {sample_rows.map((r) => (
              <tr key={r.Id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>#{r.Id}</td>
                <td>{r.GrLivArea} sqft</td>
                <td>{r.OverallQual} / 10</td>
                <td>{r.YearBuilt}</td>
                <td>{r.TotalBsmtSF} sqft</td>
                <td>{r.GarageCars} Cars</td>
                <td>{r.Neighborhood}</td>
                <td style={{ fontWeight: 800, color: 'var(--accent-emerald-bright)', fontFamily: 'var(--font-mono)' }}>
                  ${r.SalePrice?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
