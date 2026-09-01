import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { BenchmarksDashboard } from './BenchmarksDashboard';
import { AutoResearchClustering } from './AutoResearchClustering';
import { FeatureProfilesRadar } from './FeatureProfilesRadar';
import {
  Trophy,
  Zap,
  Layers,
  BarChart2,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard = ({ profiles = {} }) => {
  const [adminTab, setAdminTab] = useState('benchmarks'); // 'benchmarks', 'autoresearch', 'radar'
  const [benchmarks, setBenchmarks] = useState(null);
  const [elbowData, setElbowData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [bRes, eRes] = await Promise.all([
        api.getBenchmarks(),
        api.getElbowData()
      ]);
      if (bRes.success) setBenchmarks(bRes.data);
      if (eRes.success) setElbowData(eRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Sub-tab Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn-secondary ${adminTab === 'benchmarks' ? 'active' : ''}`}
            style={{
              background: adminTab === 'benchmarks' ? 'var(--bg-elevated)' : 'transparent',
              borderColor: adminTab === 'benchmarks' ? 'var(--accent-emerald)' : 'var(--border-subtle)',
              color: adminTab === 'benchmarks' ? 'var(--accent-emerald-bright)' : 'var(--text-secondary)'
            }}
            onClick={() => setAdminTab('benchmarks')}
          >
            <Trophy size={15} />
            <span>Model Benchmarks & Elbow Curve</span>
          </button>

          <button
            className={`btn-secondary ${adminTab === 'autoresearch' ? 'active' : ''}`}
            style={{
              background: adminTab === 'autoresearch' ? 'var(--bg-elevated)' : 'transparent',
              borderColor: adminTab === 'autoresearch' ? 'var(--accent-violet)' : 'var(--border-subtle)',
              color: adminTab === 'autoresearch' ? 'var(--accent-violet-bright)' : 'var(--text-secondary)'
            }}
            onClick={() => setAdminTab('autoresearch')}
          >
            <Zap size={15} />
            <span>AutoResearch Hill-Climbing</span>
          </button>

          <button
            className={`btn-secondary ${adminTab === 'radar' ? 'active' : ''}`}
            style={{
              background: adminTab === 'radar' ? 'var(--bg-elevated)' : 'transparent',
              borderColor: adminTab === 'radar' ? 'var(--accent-cyan)' : 'var(--border-subtle)',
              color: adminTab === 'radar' ? 'var(--accent-cyan-bright)' : 'var(--text-secondary)'
            }}
            onClick={() => setAdminTab('radar')}
          >
            <Layers size={15} />
            <span>Feature Radar Profiles</span>
          </button>
        </div>

        <button className="btn-secondary" onClick={loadData} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
          <RefreshCw size={13} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Tab Panels */}
      {adminTab === 'benchmarks' && (
        <BenchmarksDashboard benchmarks={benchmarks} elbowData={elbowData} />
      )}

      {adminTab === 'autoresearch' && (
        <AutoResearchClustering />
      )}

      {adminTab === 'radar' && (
        <FeatureProfilesRadar profiles={profiles} />
      )}
    </div>
  );
};
