import React from 'react';
import { BarChart3, HelpCircle } from 'lucide-react';

export const FeatureImportanceChart = ({ features = [] }) => {
  const maxVal = features.length > 0 ? Math.max(...features.map((f) => f.importance)) : 1;

  return (
    <div className="data-table-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <BarChart3 size={20} style={{ color: 'var(--taxi-yellow)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>XGBoost Feature Importance (Gain)</h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Relative Predictive Power across 20 Engineered Signals
        </span>
      </div>

      <div className="fi-bar-container">
        {features.slice(0, 10).map((f) => {
          const widthPercent = Math.max(4, (f.importance / maxVal) * 100);

          return (
            <div key={f.feature} className="fi-bar-row">
              <div className="fi-label" title={f.feature}>
                {f.feature}
              </div>

              <div className="fi-track">
                <div className="fi-fill" style={{ width: `${widthPercent}%` }} />
              </div>

              <div className="fi-val">
                {f.percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
