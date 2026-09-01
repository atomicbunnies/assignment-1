import React, { useState } from 'react';
import { Layers, Activity, Info } from 'lucide-react';

const CLUSTER_COLORS = {
  0: '#10b981', // VIP Champions
  1: '#38bdf8', // Prudent Affluents
  2: '#a855f7', // Young Trendsetters
  3: '#f59e0b', // Bargain Hunters
  4: '#ec4899'  // Mainstream Loyalists
};

const ATTRIBUTES = [
  { key: 'avg_income_k', label: 'Income ($k)', max: 150 },
  { key: 'avg_spending_score', label: 'Spending Score', max: 100 },
  { key: 'avg_total_spend', label: 'Annual Spend ($)', max: 12000 },
  { key: 'avg_web_visits', label: 'Web Visits / Mo', max: 20 },
  { key: 'avg_age', label: 'Age', max: 70 },
  { key: 'avg_recency_days', label: 'Recency (Days)', max: 120 }
];

export const FeatureProfilesRadar = ({ profiles = {} }) => {
  const [activeClusterId, setActiveClusterId] = useState('ALL');

  const clustersList = Object.values(profiles);
  const numAxes = ATTRIBUTES.length;
  const size = 380;
  const center = size / 2;
  const radius = size * 0.38;

  // Radar Polygon Points Calculation
  const getCoordinates = (axisIndex, normalizedValue) => {
    const angle = (Math.PI * 2 / numAxes) * axisIndex - Math.PI / 2;
    const r = radius * Math.max(0.05, Math.min(1.0, normalizedValue));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} style={{ color: 'var(--accent-emerald)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Multidimensional Feature Radar Profiles</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Normalized attribute distribution across all 5 distinct customer persona segments
          </p>
        </div>

        {/* Cluster Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            className={`btn-secondary ${activeClusterId === 'ALL' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: activeClusterId === 'ALL' ? 'var(--bg-elevated)' : 'transparent', color: activeClusterId === 'ALL' ? 'var(--accent-emerald-bright)' : 'var(--text-muted)' }}
            onClick={() => setActiveClusterId('ALL')}
          >
            All Clusters
          </button>
          {clustersList.map((p) => (
            <button
              key={p.cluster_id}
              className={`btn-secondary ${activeClusterId === String(p.cluster_id) ? 'active' : ''}`}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                borderColor: activeClusterId === String(p.cluster_id) ? p.color : 'var(--border-subtle)',
                background: activeClusterId === String(p.cluster_id) ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeClusterId === String(p.cluster_id) ? p.color : 'var(--text-muted)'
              }}
              onClick={() => setActiveClusterId(String(p.cluster_id))}
            >
              {p.persona_name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2col">
        {/* Left: SVG Radar Canvas */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: 420, height: 'auto', display: 'block' }}>
            {/* Concentric Grid Circles */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, i) => (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius * level}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray={level === 1.0 ? '0' : '2 2'}
              />
            ))}

            {/* Axis Spokes & Labels */}
            {ATTRIBUTES.map((attr, idx) => {
              const edge = getCoordinates(idx, 1.0);
              const labelPos = getCoordinates(idx, 1.18);
              return (
                <g key={idx}>
                  <line x1={center} y1={center} x2={edge.x} y2={edge.y} stroke="rgba(255, 255, 255, 0.12)" />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill="var(--text-secondary)"
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="var(--font-sans)"
                  >
                    {attr.label}
                  </text>
                </g>
              );
            })}

            {/* Render Radar Polygons */}
            {clustersList.map((p) => {
              if (activeClusterId !== 'ALL' && activeClusterId !== String(p.cluster_id)) {
                return null;
              }
              const stats = p.stats || {};
              const points = ATTRIBUTES.map((attr, idx) => {
                const raw = stats[attr.key] || 0;
                const normalized = Math.min(1.0, raw / attr.max);
                const coords = getCoordinates(idx, normalized);
                return `${coords.x},${coords.y}`;
              }).join(' ');

              return (
                <g key={p.cluster_id}>
                  <polygon
                    points={points}
                    fill={p.color}
                    fillOpacity={activeClusterId === 'ALL' ? 0.2 : 0.35}
                    stroke={p.color}
                    strokeWidth={activeClusterId === 'ALL' ? 2 : 3}
                  />
                  {ATTRIBUTES.map((attr, idx) => {
                    const raw = stats[attr.key] || 0;
                    const normalized = Math.min(1.0, raw / attr.max);
                    const coords = getCoordinates(idx, normalized);
                    return (
                      <circle
                        key={idx}
                        cx={coords.x}
                        cy={coords.y}
                        r={4}
                        fill={p.color}
                        stroke="#ffffff"
                        strokeWidth={1}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: Detailed Feature Breakdown Table */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Persona Attribute Breakdown</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {clustersList.map((p) => {
              const isHighlighted = activeClusterId === 'ALL' || activeClusterId === String(p.cluster_id);
              return (
                <div
                  key={p.cluster_id}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    borderLeft: `4px solid ${p.color}`,
                    opacity: isHighlighted ? 1.0 : 0.4
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, color: p.color, fontSize: '0.9rem' }}>
                      {p.persona_name}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      Cluster #{p.cluster_id}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                    <div>Income: <strong>${p.stats?.avg_income_k}k</strong></div>
                    <div>Spend Score: <strong>{p.stats?.avg_spending_score}/100</strong></div>
                    <div>Annual Spend: <strong>${p.stats?.avg_total_spend}</strong></div>
                    <div>Recency: <strong>{p.stats?.avg_recency_days} days</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
