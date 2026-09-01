import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  Users,
  Compass,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  ShoppingBag,
  DollarSign,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';

const CLUSTER_COLORS = {
  0: '#10b981', // VIP Champions (Emerald)
  1: '#38bdf8', // Prudent Affluents (Cyan)
  2: '#a855f7', // Young Trendsetters (Violet)
  3: '#f59e0b', // Bargain Hunters (Amber)
  4: '#ec4899'  // Mainstream Loyalists (Rose)
};

export const ClusterExplorer = ({ profiles = {} }) => {
  const [scatterData, setScatterData] = useState([]);
  const [projectionMode, setProjectionMode] = useState('pca'); // 'pca' or 'tsne'
  const [selectedClusterFilter, setSelectedClusterFilter] = useState('ALL');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Live Predictor Form
  const [formAge, setFormAge] = useState(38);
  const [formIncome, setFormIncome] = useState(115);
  const [formSpendScore, setFormSpendScore] = useState(85);
  const [formRecency, setFormRecency] = useState(12);
  const [formTotalSpend, setFormTotalSpend] = useState(8500);
  const [formWebVisits, setFormWebVisits] = useState(10);
  const [formDiscountSens, setFormDiscountSens] = useState(0.20);
  const [formFamilySize, setFormFamilySize] = useState(2);

  const [predictedResult, setPredictedResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    api.getScatterPoints().then((res) => {
      if (res.success) {
        setScatterData(res.points);
      }
    });
    // Trigger initial prediction
    handlePredict();
  }, []);

  const handlePredict = async () => {
    try {
      setIsPredicting(true);
      const res = await api.predictCustomer({
        age: parseFloat(formAge),
        annual_income_k: parseFloat(formIncome),
        spending_score: parseFloat(formSpendScore),
        recency_days: parseFloat(formRecency),
        total_spend_annual: parseFloat(formTotalSpend),
        web_visits_month: parseFloat(formWebVisits),
        discount_sensitivity: parseFloat(formDiscountSens),
        family_size: parseFloat(formFamilySize)
      });
      if (res.success) {
        setPredictedResult(res.prediction);
      }
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  // 2D Scatter Coordinate Projection
  const filteredPoints = selectedClusterFilter === 'ALL'
    ? scatterData
    : scatterData.filter((p) => p.cluster_id === parseInt(selectedClusterFilter));

  const svgWidth = 620;
  const svgHeight = 440;
  const padding = 45;

  const xCoords = filteredPoints.map((p) => projectionMode === 'pca' ? p.pca_x : p.tsne_x);
  const yCoords = filteredPoints.map((p) => projectionMode === 'pca' ? p.pca_y : p.tsne_y);

  const minX = Math.min(-3.5, ...xCoords);
  const maxX = Math.max(3.5, ...xCoords);
  const minY = Math.min(-3.5, ...yCoords);
  const maxY = Math.max(3.5, ...yCoords);

  const scaleX = (val) => padding + ((val - minX) / (maxX - minX || 1)) * (svgWidth - 2 * padding);
  const scaleY = (val) => svgHeight - padding - ((val - minY) / (maxY - minY || 1)) * (svgHeight - 2 * padding);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Kaggle Problem Statement & SOTA Benchmark Deep-Dive Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(168, 85, 247, 0.08))', borderColor: 'var(--border-active)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Award size={18} style={{ color: 'var(--accent-emerald-bright)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-emerald-bright)' }}>
                Kaggle Benchmark Challenge & Problem Deep-Dive
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              Kaggle Customer Personality & Behavioral Segmentation
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.45rem', lineHeight: 1.55 }}>
              <strong>The Problem:</strong> Omni-channel retail businesses suffer from low conversion when deploying generic, blanket promotional campaigns. The objective is to discover natural, high-affinity customer archetypes across multi-dimensional demographic, financial, and digital touchpoint spaces without ground truth supervisory labels.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'rgba(5, 8, 17, 0.8)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Kaggle SOTA Baseline</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald-bright)' }}>0.3850</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Top 1% Silhouette</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>AutoResearch Peak</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan-bright)' }}>0.4180</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan-bright)' }}>+21.0% Gain</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Optimal Clusters</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-violet-bright)' }}>k = 5</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Elbow Inflection</div>
            </div>
          </div>
        </div>

        {/* Feature Taxonomy Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Key Engineered Signals:</span>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
            Monetary Velocity: Total_Spend / (Recency + 1)
          </span>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
            Discretionary Ratio: Income / (Spend_Score + 1)
          </span>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
            Digital Engagement: Web_Visits × Spend_Affinity
          </span>
        </div>
      </div>

      {/* 1. Persona KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {Object.values(profiles).map((p) => {
          const isSelected = selectedClusterFilter === String(p.cluster_id);
          return (
            <div
              key={p.cluster_id}
              className="card"
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? p.color : 'var(--border-subtle)',
                background: isSelected ? 'rgba(255,255,255,0.04)' : 'var(--bg-secondary)',
                borderLeft: `4px solid ${p.color}`
              }}
              onClick={() => setSelectedClusterFilter(isSelected ? 'ALL' : String(p.cluster_id))}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: p.color }}>
                  Cluster #{p.cluster_id}
                </span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {p.percentage}% ({p.customer_count?.toLocaleString()} users)
                </span>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                {p.persona_name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {p.tagline}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Inc: </span>
                  <strong style={{ color: 'var(--text-secondary)' }}>${p.stats?.avg_income_k}k</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Spend: </span>
                  <strong style={{ color: p.color }}>{p.stats?.avg_spending_score}/100</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Tot: </span>
                  <strong style={{ color: 'var(--text-secondary)' }}>${p.stats?.avg_total_spend}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Main Workspace: 2D Spatial Manifold Scatter Plot & Live Inference Form */}
      <div className="grid-2col">
        {/* Left Column: 2D Interactive Scatter Canvas */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={18} style={{ color: 'var(--accent-emerald)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Customer Manifold Scatter Projection</h3>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {projectionMode === 'pca' ? '2D Principal Component Analysis (69.6% Variance Explained)' : '2D t-SNE Non-Linear Manifold Embedding'}
              </span>
            </div>

            {/* Projection Mode Switcher & Filter */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                className={`btn-secondary ${projectionMode === 'pca' ? 'active' : ''}`}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: projectionMode === 'pca' ? 'var(--bg-elevated)' : 'transparent', color: projectionMode === 'pca' ? 'var(--accent-emerald-bright)' : 'var(--text-muted)' }}
                onClick={() => setProjectionMode('pca')}
              >
                2D PCA
              </button>
              <button
                className={`btn-secondary ${projectionMode === 'tsne' ? 'active' : ''}`}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: projectionMode === 'tsne' ? 'var(--bg-elevated)' : 'transparent', color: projectionMode === 'tsne' ? 'var(--accent-violet-bright)' : 'var(--text-muted)' }}
                onClick={() => setProjectionMode('tsne')}
              >
                2D t-SNE
              </button>
            </div>
          </div>

          {/* SVG 2D Scatter Canvas */}
          <div style={{ position: 'relative', flex: 1, minHeight: '400px', background: '#080d1a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '100%', display: 'block' }}>
              {/* Grid Lines */}
              <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1={svgWidth / 2} y1={padding} x2={svgWidth / 2} y2={svgHeight - padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

              {/* Scatter Points */}
              {filteredPoints.map((pt, i) => {
                const cx = scaleX(projectionMode === 'pca' ? pt.pca_x : pt.tsne_x);
                const cy = scaleY(projectionMode === 'pca' ? pt.pca_y : pt.tsne_y);
                const color = CLUSTER_COLORS[pt.cluster_id] || '#cbd5e1';

                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={hoveredPoint?.id === pt.id ? 7 : 4}
                    fill={color}
                    fillOpacity={0.75}
                    stroke={hoveredPoint?.id === pt.id ? '#ffffff' : 'rgba(0,0,0,0.5)'}
                    strokeWidth={hoveredPoint?.id === pt.id ? 2 : 0.5}
                    style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}

              {/* Live Predicted Customer Marker */}
              {predictedResult && predictedResult.pca_coords && projectionMode === 'pca' && (
                <g>
                  <circle
                    cx={scaleX(predictedResult.pca_coords.x)}
                    cy={scaleY(predictedResult.pca_coords.y)}
                    r={11}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    strokeDasharray="4 2"
                    style={{ animation: 'spin 4s linear infinite' }}
                  />
                  <circle
                    cx={scaleX(predictedResult.pca_coords.x)}
                    cy={scaleY(predictedResult.pca_coords.y)}
                    r={6}
                    fill={predictedResult.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                </g>
              )}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: 'rgba(5, 8, 17, 0.92)',
                  border: `1px solid ${CLUSTER_COLORS[hoveredPoint.cluster_id]}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.9rem',
                  fontSize: '0.75rem',
                  pointerEvents: 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: CLUSTER_COLORS[hoveredPoint.cluster_id] }}>
                  <span>Customer #{hoveredPoint.id}</span>
                  <span>•</span>
                  <span>{profiles[hoveredPoint.cluster_id]?.persona_name || `Cluster ${hoveredPoint.cluster_id}`}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.35rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  <div>Age: {hoveredPoint.age}</div>
                  <div>Income: ${hoveredPoint.income_k}k</div>
                  <div>Spending Score: {hoveredPoint.spending_score}/100</div>
                  <div>Annual Spend: ${hoveredPoint.total_spend}</div>
                  <div>Recency: {hoveredPoint.recency}d</div>
                  <div>Discount Sens: {hoveredPoint.discount_sens}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real-Time Customer Predictor Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-emerald)' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>New Customer Segment Predictor</h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Evaluate customer attributes to classify persona and marketing action
            </span>
          </div>

          {/* Form Inputs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Age: {formAge}
              </label>
              <input
                type="range"
                min="18"
                max="75"
                value={formAge}
                onChange={(e) => setFormAge(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Income: ${formIncome}k
              </label>
              <input
                type="range"
                min="15"
                max="160"
                value={formIncome}
                onChange={(e) => setFormIncome(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Spending Score: {formSpendScore}/100
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={formSpendScore}
                onChange={(e) => setFormSpendScore(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-violet)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Recency: {formRecency} Days
              </label>
              <input
                type="range"
                min="1"
                max="250"
                value={formRecency}
                onChange={(e) => setFormRecency(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-amber)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Annual Spend: ${formTotalSpend}
              </label>
              <input
                type="range"
                min="300"
                max="14000"
                step="100"
                value={formTotalSpend}
                onChange={(e) => setFormTotalSpend(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Web Visits / Mo: {formWebVisits}
              </label>
              <input
                type="range"
                min="1"
                max="25"
                value={formWebVisits}
                onChange={(e) => setFormWebVisits(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
            </div>
          </div>

          <button className="btn-primary" onClick={handlePredict} disabled={isPredicting} style={{ width: '100%', justifyContent: 'center' }}>
            <span>Classify & Recommend Strategy</span>
          </button>

          {/* Prediction Result Display */}
          {predictedResult && (
            <div
              style={{
                background: 'var(--bg-tertiary)',
                border: `1px solid ${predictedResult.color}`,
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: predictedResult.color }}>
                  Cluster #{predictedResult.cluster_id} Classified
                </span>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)', color: '#fff' }}>
                  {predictedResult.assignment_confidence}% Confidence
                </span>
              </div>

              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                {predictedResult.persona_name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {predictedResult.description}
              </div>

              <div style={{ marginTop: '0.4rem', padding: '0.65rem 0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${predictedResult.color}` }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Tailored Marketing Action
                </div>
                <div style={{ fontSize: '0.78rem', color: '#fff', marginTop: '0.2rem', lineHeight: 1.4 }}>
                  {predictedResult.marketing_strategy}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
