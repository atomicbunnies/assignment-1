import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Layers, BookOpen } from 'lucide-react';

export const CrispDmReportModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '840px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(6, 182, 212, 0.12))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={20} style={{ color: 'var(--accent-indigo-bright)' }} />
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan-bright)', fontWeight: 800, textTransform: 'uppercase' }}>
                Standard Methodology Publication
              </span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                CRISP-DM Research & Engineering Report
              </h2>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem', maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {/* Phase 1 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ color: 'var(--accent-cyan-bright)', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              Phase 1: Business & Pedagogical Understanding
            </h3>
            <p>
              AI coding agents frequently stumble on recurring ML/Analytics pitfalls: silent test leakage, using accuracy on skewed classes, and failing to quantify statistical power. The primary objective is to codify 46 production-grade skills from <code>param087/agent-ml-skills</code> and <code>nimrodfisher/data-analytics-skills</code> into an intuitive, interactive student workbench.
            </p>
          </div>

          {/* Phase 2 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ color: 'var(--accent-indigo-bright)', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              Phase 2: Data Understanding & Kaggle Benchmarks
            </h3>
            <p>
              Integrated 5 diverse benchmark suites: <strong>Titanic</strong> (891 rows, binary classification), <strong>Ames House Prices</strong> (1,460 rows, non-linear regression), <strong>Credit Card Fraud</strong> (5,000 transactions, 0.17% rare target), <strong>E-Commerce SaaS Analytics</strong> (12-month retention cohorts, 5-stage funnels, A/B experiments), and <strong>Raw Dirty Transaction Streams</strong>.
            </p>
          </div>

          {/* Phase 3 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ color: 'var(--accent-emerald-bright)', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              Phase 3: Data Preparation & Leakage Protection
            </h3>
            <p>
              Enforced strict scikit-learn <code>ColumnTransformer</code> and <code>Pipeline</code> encapsulations. Median imputers and standard scalers are fitted strictly inside cross-validation loops, preventing optimistic data snooping.
            </p>
          </div>

          {/* Phase 4 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ color: 'var(--accent-amber)', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              Phase 4: Modeling & Hyperparameter Optimization
            </h3>
            <p>
              Benchmarked Random Forest, Gradient Boosting, Ridge, and Cost-Weighted Logistic Regression. Implemented Bayesian parameter sweeps and logarithmic target transforms ($y \to \log(1 + y)$).
            </p>
          </div>

          {/* Phase 5 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ color: 'var(--accent-rose)', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              Phase 5: Evaluation & Statistical Power
            </h3>
            <p>
              Evaluated imbalanced classification across Precision-Recall curves, raising fraud recall from 54% to 96%. Implemented two-proportion Z-tests with $p$-values and 95% confidence intervals.
            </p>
          </div>

          {/* Phase 6 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ color: 'var(--accent-cyan-bright)', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              Phase 6: Production Deployment & Skill Distribution
            </h3>
            <p>
              Packaged the entire system into a high-performance FastAPI microservice (Port 8005) with a React 18 + Vite frontend (Port 5178). Exported all 46 skills to Antigravity global roots and Git repository.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
          <button className="btn-primary" onClick={onClose}>
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
