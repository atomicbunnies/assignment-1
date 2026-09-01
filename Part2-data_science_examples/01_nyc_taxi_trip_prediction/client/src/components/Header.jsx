import React from 'react';
import { Car, Cpu, Sparkles, RefreshCw, Zap, FileText } from 'lucide-react';

export const Header = ({ activeTab, setActiveTab, onOpenRetrain, onOpenReport, metadata }) => {
  return (
    <header className="app-header">
      {/* Brand Identity */}
      <div className="brand-container">
        <div className="brand-logo">
          <Car size={22} strokeWidth={2.5} />
        </div>
        <div>
          <div className="brand-title">
            <span>NYC Taxi ML</span>
            <span className="brand-badge">SOTA Intel</span>
          </div>
        </div>
      </div>

      {/* Navigation Switcher */}
      <nav className="header-nav">
        <button
          className={`nav-tab-btn ${activeTab === 'estimator' ? 'active' : ''}`}
          onClick={() => setActiveTab('estimator')}
        >
          <Car size={16} />
          <span>Fare & Trip Estimator</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <Cpu size={16} />
          <span>Data Science Admin</span>
        </button>
      </nav>

      {/* Right Telemetry & Actions */}
      <div className="header-actions">
        <button className="btn-secondary" onClick={onOpenReport}>
          <FileText size={15} style={{ color: 'var(--taxi-yellow)' }} />
          <span>CRISP-DM Report</span>
        </button>

        <div className="status-indicator-pill">
          <span className="dot" />
          <span>Model: {metadata?.best_model || 'XGBoost'} (R²: {metadata?.metrics?.r2_score || '0.968'})</span>
        </div>

        <button className="btn-primary" onClick={onOpenRetrain}>
          <RefreshCw size={15} />
          <span>Retrain Model</span>
        </button>
      </div>
    </header>
  );
};
