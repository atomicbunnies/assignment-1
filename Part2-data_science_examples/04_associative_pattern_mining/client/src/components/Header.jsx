import React from 'react';
import { ShoppingBag, ShieldCheck, FileText, SlidersHorizontal, Activity } from 'lucide-react';

export const Header = ({
  activeTab,
  setActiveTab,
  onOpenCrispDm,
  onOpenRetrain,
  health
}) => {
  return (
    <header className="header">
      <div className="brand-container">
        <div className="logo-icon">
          <ShoppingBag size={22} />
        </div>
        <div>
          <div className="brand-title">Market Basket Intelligence</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
            <span>Apriori • FP-Growth • ECLAT • AutoResearch Engine</span>
          </div>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
          id="tab-explorer"
        >
          <ShoppingBag size={16} />
          <span>Basket Recommender & Graph</span>
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
          id="tab-admin"
        >
          <Activity size={16} />
          <span>Data Science Admin & AutoResearch</span>
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button
          className="btn-secondary"
          onClick={onOpenCrispDm}
          id="btn-crisp-dm"
          style={{ borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald-bright)' }}
        >
          <FileText size={15} />
          <span>CRISP-DM Research Report</span>
        </button>

        <button
          className="btn-secondary"
          onClick={onOpenRetrain}
          id="btn-retrain"
          style={{ borderColor: 'var(--accent-amber)', color: 'var(--accent-amber-bright)' }}
        >
          <SlidersHorizontal size={15} />
          <span>Live Retrain Studio</span>
        </button>

        {health && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.74rem', color: 'var(--accent-emerald-bright)', fontWeight: 700 }}>
            <ShieldCheck size={14} />
            <span>Port 8004 Active ({health.active_rules_count || 0} Rules)</span>
          </div>
        )}
      </div>
    </header>
  );
};
