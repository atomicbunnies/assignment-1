import React, { useState } from 'react';
import { Trophy, TrendingUp, Database, SlidersHorizontal } from 'lucide-react';
import { BenchmarksDashboard } from './BenchmarksDashboard';
import { AutoResearchMining } from './AutoResearchMining';
import { RuleExplorerTable } from './RuleExplorerTable';

export const AdminDashboard = ({
  benchmarksData = {},
  historyData = {},
  rules = [],
  onRefresh
}) => {
  const [adminTab, setAdminTab] = useState('benchmarks');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
        <button
          className={`nav-tab-btn ${adminTab === 'benchmarks' ? 'active' : ''}`}
          onClick={() => setAdminTab('benchmarks')}
          id="tab-sub-benchmarks"
        >
          <Trophy size={15} />
          <span>Mining Benchmarks & SOTA Baseline</span>
        </button>

        <button
          className={`nav-tab-btn ${adminTab === 'autoresearch' ? 'active' : ''}`}
          onClick={() => setAdminTab('autoresearch')}
          id="tab-sub-autoresearch"
        >
          <TrendingUp size={15} />
          <span>AutoResearch Hill-Climbing</span>
        </button>

        <button
          className={`nav-tab-btn ${adminTab === 'rules' ? 'active' : ''}`}
          onClick={() => setAdminTab('rules')}
          id="tab-sub-rules"
        >
          <Database size={15} />
          <span>Association Rules Explorer</span>
        </button>
      </div>

      {/* Tab Panels */}
      {adminTab === 'benchmarks' && (
        <BenchmarksDashboard benchmarksData={benchmarksData} />
      )}

      {adminTab === 'autoresearch' && (
        <AutoResearchMining historyData={historyData} onRefresh={onRefresh} />
      )}

      {adminTab === 'rules' && (
        <RuleExplorerTable rules={rules} />
      )}
    </div>
  );
};
