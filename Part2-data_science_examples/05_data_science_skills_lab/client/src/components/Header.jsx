import React from 'react';
import { BookOpen, ShieldCheck, FileText, Layers, TrendingUp, DollarSign, Users, AlertTriangle } from 'lucide-react';

export const Header = ({
  activeTab,
  setActiveTab,
  onOpenCrispDm,
  totalSkills = 46
}) => {
  return (
    <header className="header">
      <div className="brand-container">
        <div className="logo-icon">
          <BookOpen size={20} />
        </div>
        <div>
          <div className="brand-title">Data Science Skills Mastery Lab</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22d3ee' }}></span>
            <span>param087 Agent ML Skills • nimrodfisher Analytics Skills</span>
          </div>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
          id="tab-skills-catalog"
        >
          <Layers size={15} />
          <span>46 Skills Catalog</span>
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'titanic' ? 'active' : ''}`}
          onClick={() => setActiveTab('titanic')}
          id="tab-titanic"
        >
          <Users size={15} />
          <span>Titanic (Classification)</span>
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'house' ? 'active' : ''}`}
          onClick={() => setActiveTab('house')}
          id="tab-house-prices"
        >
          <DollarSign size={15} />
          <span>House Prices (Regression)</span>
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'fraud' ? 'active' : ''}`}
          onClick={() => setActiveTab('fraud')}
          id="tab-fraud-detection"
        >
          <AlertTriangle size={15} />
          <span>Fraud (Imbalanced ML)</span>
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'ecommerce' ? 'active' : ''}`}
          onClick={() => setActiveTab('ecommerce')}
          id="tab-ecommerce-analytics"
        >
          <TrendingUp size={15} />
          <span>E-Commerce Analytics</span>
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality')}
          id="tab-data-quality"
        >
          <ShieldCheck size={15} />
          <span>Data Quality Audit</span>
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button
          className="btn-secondary"
          onClick={onOpenCrispDm}
          id="btn-crisp-dm-lab"
          style={{ borderColor: 'var(--accent-indigo)', color: 'var(--accent-indigo-bright)' }}
        >
          <FileText size={14} />
          <span>CRISP-DM Report</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(99, 102, 241, 0.12)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-active)', fontSize: '0.74rem', color: 'var(--accent-cyan-bright)', fontWeight: 800 }}>
          <ShieldCheck size={14} />
          <span>{totalSkills} Skills Installed</span>
        </div>
      </div>
    </header>
  );
};
