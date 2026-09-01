import React from 'react';
import {
  Users,
  BarChart3,
  FileText,
  RefreshCw,
  Sparkles,
  PieChart,
  Target,
  Layers
} from 'lucide-react';

export const Header = ({ activeView, setActiveView, onOpenCrispDm, onOpenRetrain }) => {
  return (
    <header className="header">
      <div className="brand-container">
        <div className="logo-icon">
          <Target size={22} />
        </div>
        <div>
          <h1 className="brand-title">Customer Intelligence & Segmentation</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-emerald-bright)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-emerald)' }} />
              Production Active
            </span>
            <span>•</span>
            <span>Kaggle Retail Benchmark</span>
          </div>
        </div>
      </div>

      {/* Main View Switcher */}
      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeView === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveView('explorer')}
        >
          <Users size={15} />
          <span>Customer Segment Explorer</span>
        </button>

        <button
          className={`nav-tab-btn ${activeView === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveView('admin')}
        >
          <BarChart3 size={15} />
          <span>Data Science Admin Console</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <button
          className="btn-secondary"
          onClick={onOpenCrispDm}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
        >
          <FileText size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>CRISP-DM Report</span>
        </button>

        <button
          className="btn-primary"
          onClick={onOpenRetrain}
          style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem' }}
        >
          <RefreshCw size={14} />
          <span>Retrain Studio</span>
        </button>
      </div>
    </header>
  );
};
