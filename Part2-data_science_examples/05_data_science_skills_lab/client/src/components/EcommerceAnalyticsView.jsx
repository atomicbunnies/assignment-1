import React, { useState } from 'react';
import { TrendingUp, Users, ShoppingCart, Percent, Sparkles, Award, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';

export const EcommerceAnalyticsView = ({ data = {} }) => {
  const { cohort_matrix = [], funnel_stages = [], ab_test = {} } = data;

  // Interactive A/B Testing Workbench State
  const [ctrlVisitors, setCtrlVisitors] = useState(25000);
  const [ctrlConversions, setCtrlConversions] = useState(1450);
  const [treatVisitors, setTreatVisitors] = useState(25000);
  const [treatConversions, setTreatConversions] = useState(1750);

  const [liveAbResult, setLiveAbResult] = useState(null);

  const handleRecalculateAb = async () => {
    try {
      const res = await api.calculateAbTest({
        n_control: ctrlVisitors,
        x_control: ctrlConversions,
        n_treatment: treatVisitors,
        x_treatment: treatConversions
      });
      if (res.success) {
        setLiveAbResult(res.data);
      }
    } catch (err) {
      console.error('A/B test calculation failed:', err);
    }
  };

  const abDisplay = liveAbResult || ab_test;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overview Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(99, 102, 241, 0.08))', borderColor: 'var(--border-active)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <TrendingUp size={18} style={{ color: 'var(--accent-emerald-bright)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-emerald-bright)' }}>
                Kaggle E-Commerce & Product Analytics Suite
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              User Retention Cohorts, Funnel Drop-offs & A/B Testing
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Demonstrating <strong>Cohort Retention Heatmaps</strong>, <strong>Checkout Funnel Bottlenecks</strong>, and <strong>Z-Test Statistical Significance</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 1. User Retention Cohort Heatmap */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} style={{ color: 'var(--accent-cyan-bright)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              Monthly User Retention Cohort Matrix (% Active Users)
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Darker Emerald = Higher User Retention
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Acquisition Cohort</th>
                <th>Cohort Size</th>
                <th>Month 0</th>
                <th>Month 1</th>
                <th>Month 2</th>
                <th>Month 3</th>
                <th>Month 4</th>
                <th>Month 5</th>
              </tr>
            </thead>
            <tbody>
              {cohort_matrix.map((c) => (
                <tr key={c.cohort}>
                  <td style={{ textAlign: 'left', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                    {c.cohort}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {c.cohort_size.toLocaleString()}
                  </td>
                  {c.periods.map((pct, pIdx) => {
                    const intensity = pct / 100.0;
                    return (
                      <td
                        key={pIdx}
                        style={{
                          background: `rgba(16, 185, 129, ${Math.max(0.08, intensity * 0.45)})`,
                          color: pct > 40 ? '#fff' : 'var(--text-secondary)',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700
                        }}
                      >
                        {pct.toFixed(1)}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Checkout Funnel Drop-off Waterfall */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShoppingCart size={18} style={{ color: 'var(--accent-amber)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
            5-Stage Checkout Conversion Funnel & Drop-off Waterfall
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {funnel_stages.map((stage) => (
            <div key={stage.stage}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>{stage.stage}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan-bright)' }}>
                  {stage.users.toLocaleString()} users ({stage.conversion_pct}%)
                </span>
              </div>
              <div style={{ width: '100%', height: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${stage.conversion_pct}%`,
                    height: '100%',
                    background: 'linear-gradient(to right, var(--accent-indigo), var(--accent-emerald))',
                    borderRadius: 'var(--radius-full)'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Interactive A/B Testing Z-Test Calculator */}
      <div className="card" style={{ borderColor: 'var(--border-active)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Percent size={18} style={{ color: 'var(--accent-indigo-bright)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              Live A/B Testing Two-Proportion Z-Test Calculator
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Two-tailed hypothesis test (alpha = 0.05)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
          {/* Control Group */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', marginBottom: '0.5rem' }}>Control Group (Variant A)</div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Visitors: {ctrlVisitors.toLocaleString()}</label>
              <input type="range" min="5000" max="50000" step="1000" value={ctrlVisitors} onChange={(e) => setCtrlVisitors(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Conversions: {ctrlConversions.toLocaleString()} ({((ctrlConversions/ctrlVisitors)*100).toFixed(2)}%)</label>
              <input type="range" min="100" max="5000" step="50" value={ctrlConversions} onChange={(e) => setCtrlConversions(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
          </div>

          {/* Treatment Group */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-cyan-bright)', marginBottom: '0.5rem' }}>Treatment Group (Variant B)</div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Visitors: {treatVisitors.toLocaleString()}</label>
              <input type="range" min="5000" max="50000" step="1000" value={treatVisitors} onChange={(e) => setTreatVisitors(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Conversions: {treatConversions.toLocaleString()} ({((treatConversions/treatVisitors)*100).toFixed(2)}%)</label>
              <input type="range" min="100" max="5000" step="50" value={treatConversions} onChange={(e) => setTreatConversions(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={handleRecalculateAb} style={{ marginBottom: '1rem' }}>
          <span>Recalculate Statistical Significance</span>
        </button>

        {/* Statistical Test Results */}
        <div style={{ background: abDisplay.is_statistically_significant ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)', border: `1px solid ${abDisplay.is_statistically_significant ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`, padding: '1rem', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Z-Score</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              {abDisplay.z_score}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>p-value</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: abDisplay.is_statistically_significant ? 'var(--accent-emerald-bright)' : 'var(--accent-amber)' }}>
              {abDisplay.p_value}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Relative Lift</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan-bright)' }}>
              +{abDisplay.relative_lift_pct}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rollout Decision</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: abDisplay.is_statistically_significant ? 'var(--accent-emerald-bright)' : 'var(--text-muted)', marginTop: '0.3rem' }}>
              {abDisplay.is_statistically_significant ? 'DEPLOY (Statistically Significant)' : 'INCONCLUSIVE (P > 0.05)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
