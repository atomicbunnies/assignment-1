import React from 'react';
import { TrendingDown, Activity } from 'lucide-react';

export const LearningCurvesChart = ({ curves = [] }) => {
  if (!curves || curves.length === 0) return null;

  const width = 500;
  const height = 220;
  const padding = 35;

  const maxLoss = Math.max(...curves.map((c) => Math.max(c.train_loss, c.val_loss)));
  const minLoss = Math.min(...curves.map((c) => Math.min(c.train_loss, c.val_loss))) * 0.95;

  const getX = (idx) => padding + (idx / (curves.length - 1)) * (width - 2 * padding);
  const getY = (loss) => height - padding - ((loss - minLoss) / (maxLoss - minLoss)) * (height - 2 * padding);

  const trainPoints = curves.map((c, i) => `${getX(i)},${getY(c.train_loss)}`).join(' ');
  const valPoints = curves.map((c, i) => `${getX(i)},${getY(c.val_loss)}`).join(' ');

  return (
    <div className="data-table-container" style={{ margin: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingDown size={18} style={{ color: '#38bdf8' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Learning Curves (RMSE vs Iterations)</h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Train Loss
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--taxi-yellow)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--taxi-yellow)' }} /> Validation Loss
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', display: 'block' }}>
        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />

        {/* Train Line */}
        <polyline fill="none" stroke="#10b981" strokeWidth="2.5" points={trainPoints} />

        {/* Val Line */}
        <polyline fill="none" stroke="#f59e0b" strokeWidth="2.5" points={valPoints} />
      </svg>
    </div>
  );
};
