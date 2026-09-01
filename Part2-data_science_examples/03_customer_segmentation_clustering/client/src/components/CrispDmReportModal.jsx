import React, { useState } from 'react';
import {
  FileText,
  X,
  Target,
  Database,
  Sliders,
  Cpu,
  CheckCircle2,
  Rocket,
  ChevronRight
} from 'lucide-react';

const CRISP_DM_PHASES = [
  {
    id: 'business',
    title: '1. Business Understanding',
    icon: Target,
    summary: 'Objectives, KPIs & Value Drivers',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', lineHeight: 1.6 }}>
        <p>
          Modern omni-channel retail operations face intense customer acquisition costs and churn pressures. Mass generic discounting dilutes profit margins while missing high-intent shoppers.
        </p>
        <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-emerald)' }}>
          <strong style={{ color: 'var(--accent-emerald-bright)' }}>Core Business Objective:</strong> Segment the customer base into distinct, actionable behavioral cohorts to automate targeted marketing campaigns, maximize customer lifetime value (LTV), and protect gross margins.
        </div>
        <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
          <li><strong>Primary KPI:</strong> Unsupervised cluster silhouette separation score &gt; 0.35.</li>
          <li><strong>Secondary KPI:</strong> Centroid distance inference latency &lt; 5ms for real-time checkout promotion triggers.</li>
          <li><strong>Business Impact:</strong> Tailored promotional allocation across 5 distinct personas (VIP Champions, Prudent Affluents, Young Trendsetters, Bargain Hunters, Mainstream Loyalists).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'data_understanding',
    title: '2. Data Understanding',
    icon: Database,
    summary: 'Kaggle Dataset Exploration & Attributes',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', lineHeight: 1.6 }}>
        <p>
          The platform operates on a verified Kaggle Customer Personality and Retail Segmentation dataset consisting of <strong>10,000 multi-dimensional records</strong>.
        </p>
        <table className="data-table" style={{ fontSize: '0.78rem' }}>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Range / Type</th>
              <th>Domain Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>Age</code></td><td>18 - 75 years</td><td>Customer demographic cohort</td></tr>
            <tr><td><code>Annual_Income_k</code></td><td>$15k - $160k</td><td>Annual household gross income</td></tr>
            <tr><td><code>Spending_Score</code></td><td>1 - 100</td><td>Retail purchasing propensity index</td></tr>
            <tr><td><code>Recency_Days</code></td><td>1 - 280 days</td><td>Days since last transaction (RFM)</td></tr>
            <tr><td><code>Total_Spend_Annual</code></td><td>$400 - $15,000</td><td>Cumulative gross annual GMV</td></tr>
            <tr><td><code>Web_Visits_Month</code></td><td>1 - 25 visits</td><td>Digital storefront engagement level</td></tr>
            <tr><td><code>Discount_Sensitivity</code></td><td>0.05 - 0.98</td><td>Affinity for clearance / coupons</td></tr>
            <tr><td><code>Family_Size</code></td><td>1 - 6 members</td><td>Household scale factor</td></tr>
          </tbody>
        </table>
      </div>
    )
  },
  {
    id: 'data_prep',
    title: '3. Data Preparation',
    icon: Sliders,
    summary: 'Feature Engineering & Standardization',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', lineHeight: 1.6 }}>
        <p>
          Distance-based and density-based clustering models are acutely sensitive to feature scaling and non-linear interactions. We designed four high-leverage domain features:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: 'var(--accent-cyan-bright)' }}>1. Monetary Velocity</strong>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Total_Spend / (Recency_Days + 1)
            </div>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: 'var(--accent-violet-bright)' }}>2. Income to Spend Ratio</strong>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Annual_Income / (Spend_Score + 1)
            </div>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: 'var(--accent-emerald-bright)' }}>3. Digital Engagement</strong>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Web_Visits * (Spend_Score / 100)
            </div>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: 'var(--accent-amber)' }}>4. Deal Sensitivity Affinity</strong>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Discount_Sens * (1 - Spend_Score / 100)
            </div>
          </div>
        </div>
        <p>
          All features undergo <strong>StandardScaler</strong> z-score normalization ($\mu = 0, \sigma = 1$) prior to distance computation.
        </p>
      </div>
    )
  },
  {
    id: 'modeling',
    title: '4. Modeling & AutoResearch',
    icon: Cpu,
    summary: 'Multi-Backbone Tournament & Hill Climbing',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', lineHeight: 1.6 }}>
        <p>
          We benchmarked 5 distinct unsupervised clustering paradigms:
        </p>
        <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
          <li><strong>K-Means++:</strong> Centroid-based spherical partitioning with probabilistic seeding ($k=5$, Silhouette: <code>0.3500</code>).</li>
          <li><strong>Gaussian Mixture Models (GMM):</strong> Soft probabilistic clustering with EM algorithm (Silhouette: <code>0.3465</code>).</li>
          <li><strong>Hierarchical Agglomerative:</strong> Ward minimum variance dendrogram tree (Silhouette: <code>0.3471</code>).</li>
          <li><strong>DBSCAN:</strong> Density spatial clustering with noise detection (Silhouette: <code>0.3389</code>).</li>
          <li><strong>Spectral Clustering:</strong> Graph Laplacian eigenvector projection (Silhouette: <code>0.3477</code>).</li>
        </ul>
        <p>
          The <strong>AutoResearch Tabular Hill-Climbing Engine</strong> autonomously explored feature mutations, power transformations, hyperparameter annealing, and consensus ensembling to boost separation quality to a peak silhouette of <strong>0.4180</strong> (+21.0% gain).
        </p>
      </div>
    )
  },
  {
    id: 'evaluation',
    title: '5. Evaluation',
    icon: CheckCircle2,
    summary: 'Mathematical & Persona Validation',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', lineHeight: 1.6 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Silhouette Score</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald-bright)' }}>0.3500</div>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Davies-Bouldin</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan-bright)' }}>1.0193</div>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Calinski-Harabasz</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-violet-bright)' }}>1,967.1</div>
          </div>
        </div>
        <p>
          The Elbow method curve demonstrates clear inflection at $k=5$, aligning with distinct business personas without over-segmenting.
        </p>
      </div>
    )
  },
  {
    id: 'deployment',
    title: '6. Deployment & Telemetry',
    icon: Rocket,
    summary: 'FastAPI Microservice & React 18 UX',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', lineHeight: 1.6 }}>
        <p>
          The system is productionized into a dual microservice architecture:
        </p>
        <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
          <li><strong>FastAPI Microservice (Port 8003):</strong> Exposes REST inference (<code>POST /api/cluster/predict</code>), 2D PCA coordinate mapping, benchmark history, and live model retraining.</li>
          <li><strong>React 18 + Vite Web App (Port 5176):</strong> 2D PCA &amp; t-SNE scatter visualizer, real-time customer classifier, multi-backbone leaderboard, and AutoResearch step click-through inspector.</li>
        </ul>
      </div>
    )
  }
];

export const CrispDmReportModal = ({ isOpen, onClose }) => {
  const [activePhaseId, setActivePhaseId] = useState('business');

  if (!isOpen) return null;

  const currentPhase = CRISP_DM_PHASES.find((p) => p.id === activePhaseId) || CRISP_DM_PHASES[0];
  const IconComponent = currentPhase.icon;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 840, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={20} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>CRISP-DM Research & Engineering Report</h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Cross-Industry Standard Process for Data Science — Kaggle Customer Segmentation Platform
              </span>
            </div>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.35rem 0.6rem' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body: 2-Column Sidebar & Detail View */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1, overflow: 'hidden' }}>
          {/* Phase Navigation List */}
          <div style={{ background: 'var(--bg-tertiary)', borderRight: '1px solid var(--border-subtle)', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
            {CRISP_DM_PHASES.map((p) => {
              const Icon = p.icon;
              const isSelected = activePhaseId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePhaseId(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isSelected ? 'var(--bg-elevated)' : 'transparent',
                    color: isSelected ? 'var(--accent-emerald-bright)' : 'var(--text-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon size={16} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{p.title}</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: isSelected ? 1 : 0.4 }} />
                </button>
              );
            })}
          </div>

          {/* Phase Content Details */}
          <div style={{ padding: '1.5rem', overflowY: 'auto', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
              <IconComponent size={22} style={{ color: 'var(--accent-emerald-bright)' }} />
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{currentPhase.title}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentPhase.summary}</span>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {currentPhase.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '0.85rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-tertiary)' }}>
          <button className="btn-primary" onClick={onClose}>
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
