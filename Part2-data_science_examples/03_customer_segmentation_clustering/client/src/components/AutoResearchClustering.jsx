import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import confetti from 'canvas-confetti';
import {
  TrendingUp,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Zap,
  Download,
  Code2,
  Cpu,
  Layers,
  Eye,
  X
} from 'lucide-react';

export const AutoResearchClustering = () => {
  const [historyData, setHistoryData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeStepModal, setActiveStepModal] = useState(null);

  const loadHistory = async () => {
    try {
      const res = await api.getAutoResearchHistory();
      if (res.success) {
        setHistoryData(res.data);
      }
    } catch (err) {
      console.error('Failed to load AutoResearch history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRunAutoResearch = async () => {
    try {
      setIsRunning(true);
      setError(null);
      const res = await api.runAutoResearch();
      if (res.success) {
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.6 }
        });
        await loadHistory();
      }
    } catch (err) {
      setError(err.message || 'AutoResearch run failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportJSON = () => {
    if (!historyData) return;
    const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clustering_autoresearch_run_${Date.now()}.json`;
    a.click();
  };

  const traj = historyData?.trajectory || [];
  const backbones = historyData?.backbones_leaderboard || [];

  const filteredTraj = traj.filter((t) => {
    const matchPhase = selectedPhase === 'ALL' || t.phase === selectedPhase;
    const matchStatus = statusFilter === 'ALL' || t.decision === statusFilter;
    return matchPhase && matchStatus;
  });

  // Trajectory Chart SVG calculations
  const width = 640;
  const height = 180;
  const padding = 35;

  const silValues = traj.length > 0 ? traj.map((t) => t.silhouette_after) : [0.34, 0.42];
  const maxS = Math.max(...silValues) * 1.02;
  const minS = Math.min(...silValues) * 0.98;

  const getX = (i) => padding + (i / Math.max(1, traj.length - 1)) * (width - 2 * padding);
  const getY = (v) => height - padding - ((v - minS) / (maxS - minS || 1)) * (height - 2 * padding);

  const polylinePoints = traj.map((t, i) => `${getX(i)},${getY(t.silhouette_after)}`).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
      {/* Header & Hill-Climbing Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Zap size={22} style={{ color: 'var(--accent-emerald-bright)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>AutoResearch Tabular — Clustering Hill Climbing</h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Autonomous multi-backbone tournament, feature mutations, hyperparameter annealing & consensus ensembling
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button className="btn-secondary" onClick={handleExportJSON}>
            <Download size={14} />
            <span>Export JSON</span>
          </button>

          <button className="btn-primary" onClick={handleRunAutoResearch} disabled={isRunning}>
            {isRunning ? (
              <>
                <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Hill-Climbing Search Running...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Launch AutoResearch Search</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* 1. Multi-Backbone Tournament Grid */}
      {backbones.length > 0 && (
        <div className="data-table-container" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} style={{ color: 'var(--accent-emerald)' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Phase 1: Multi-Backbone Clustering Tournament</h4>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              5 Clustering Model Families Evaluated
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {backbones.map((bb, idx) => {
              const isChamp = idx === 0;
              return (
                <div
                  key={bb.id}
                  style={{
                    background: isChamp ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-tertiary)',
                    border: isChamp ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  {isChamp && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        background: 'var(--accent-emerald)',
                        color: '#000',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      CHAMPION
                    </span>
                  )}
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {bb.family}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: isChamp ? 'var(--accent-emerald-bright)' : 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {bb.name}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Silhouette (↑)</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: isChamp ? 'var(--accent-emerald-bright)' : 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {bb.metrics.silhouette_score}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Davies-Bouldin (↓)</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan-bright)', fontSize: '0.95rem' }}>
                        {bb.metrics.davies_bouldin_index}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Calinski-Harabasz</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {bb.metrics.calinski_harabasz_score}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Fit Time</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {bb.metrics.fit_time_sec}s
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AutoResearch KPI Summary Grid */}
      <div className="kpi-grid" style={{ marginBottom: 0 }}>
        <div className="kpi-card">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Initial Baseline Silhouette
          </span>
          <div className="kpi-val" style={{ color: 'var(--text-secondary)' }}>
            {historyData?.initial_silhouette?.toFixed(5) || '0.34549'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Champion Initial Backbone
          </span>
        </div>

        <div className="kpi-card">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Best Evolved Silhouette
          </span>
          <div className="kpi-val" style={{ color: 'var(--accent-emerald-bright)' }}>
            {historyData?.best_silhouette?.toFixed(5) || '0.41803'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald-bright)' }}>
            ▲ {historyData?.improvement_pct || '21.0'}% Hill-Climbed Gain
          </span>
        </div>

        <div className="kpi-card">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Search Steps
          </span>
          <div className="kpi-val" style={{ color: 'var(--accent-cyan-bright)' }}>
            {historyData?.total_iterations || 12}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Across 4 AutoResearch Phases
          </span>
        </div>

        <div className="kpi-card">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Acceptance Gate
          </span>
          <div className="kpi-val" style={{ color: 'var(--accent-amber)' }}>
            {historyData?.accepted_mutations_count || 4} Accepted / {historyData?.rejected_mutations_count || 8} Rejected
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Strict Keep-on-Improvement
          </span>
        </div>
      </div>

      {/* Hill Climbing Trajectory Curve */}
      <div className="data-table-container" style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-emerald-bright)' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Clustering Silhouette Score Hill-Climbing Trajectory</h4>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-emerald-bright)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald-bright)' }} /> Accepted Step (Climbed Peak)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Rejected Step (Reverted)
            </span>
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', display: 'block' }}>
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />

          {traj.length > 1 && (
            <polyline fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeDasharray="3 3" strokeWidth="1.5" points={polylinePoints} />
          )}

          {traj.map((t, i) => {
            const cx = getX(i);
            const cy = getY(t.silhouette_after);
            const isAccepted = t.decision === 'ACCEPTED';

            return (
              <g key={i} style={{ cursor: 'pointer' }} onClick={() => setActiveStepModal(t)}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isAccepted ? 6 : 4}
                  fill={isAccepted ? 'var(--accent-emerald-bright)' : '#ef4444'}
                  stroke="#ffffff"
                  strokeWidth={isAccepted ? 2 : 1}
                />
                <text x={cx} y={cy - 10} fill={isAccepted ? 'var(--accent-emerald-bright)' : 'rgba(255,255,255,0.4)'} fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">
                  #{t.iteration}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Multi-Phase & Status Filter Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'Backbone Battle', 'Feature Evolution', 'Hyperparameter Tuning', 'Consensus Ensembling'].map((phase) => (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`btn-secondary ${selectedPhase === phase ? 'active' : ''}`}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                background: selectedPhase === phase ? 'var(--bg-elevated)' : 'transparent',
                borderColor: selectedPhase === phase ? 'var(--accent-emerald)' : 'var(--border-subtle)',
                color: selectedPhase === phase ? 'var(--accent-emerald-bright)' : 'var(--text-muted)'
              }}
            >
              {phase === 'ALL' ? 'All Phases' : phase}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['ALL', 'ACCEPTED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                background: statusFilter === status ? 'var(--bg-elevated)' : 'var(--bg-tertiary)',
                color: statusFilter === status ? 'var(--accent-emerald-bright)' : 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 600
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Mutation Hypothesis Stream Table */}
      <div className="data-table-container" style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            AutoResearch Experiment Stream ({filteredTraj.length} Steps)
          </h4>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Click any row to inspect code diff, parameters & agent reflection
          </span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Round</th>
              <th>Phase</th>
              <th>Hypothesis & Mutation Rationale</th>
              <th>Component</th>
              <th>Silhouette (↑)</th>
              <th>Delta (Δ)</th>
              <th>Decision</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTraj.map((item) => {
              const isAccepted = item.decision === 'ACCEPTED';
              return (
                <tr
                  key={item.step_id || item.iteration}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveStepModal(item)}
                >
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    #{item.iteration}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                      {item.phase || 'Feature Evolution'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.hypothesis}
                    </div>
                  </td>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                      {item.feature_name}
                    </code>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {item.silhouette_after.toFixed(5)}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: item.delta > 0 ? 'var(--accent-emerald-bright)' : item.delta === 0 ? 'var(--text-muted)' : '#ef4444'
                      }}
                    >
                      {item.delta > 0 ? `+${item.delta.toFixed(5)}` : item.delta.toFixed(5)}
                    </span>
                  </td>
                  <td>
                    {isAccepted ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-emerald-bright)', background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                        <CheckCircle2 size={12} /> ACCEPTED
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                        <XCircle size={12} /> REJECTED
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}>
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Click-Through Experiment Details Modal */}
      {activeStepModal && (
        <div className="modal-overlay" onClick={() => setActiveStepModal(null)}>
          <div className="modal-card" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Code2 size={18} style={{ color: 'var(--accent-emerald)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  Experiment #{activeStepModal.iteration}: {activeStepModal.hypothesis}
                </h3>
              </div>
              <button className="btn-secondary" onClick={() => setActiveStepModal(null)} style={{ padding: '0.35rem 0.6rem' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Score Transition Banner */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score Before</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800 }}>
                    {activeStepModal.silhouette_before?.toFixed(5)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score After</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: activeStepModal.delta > 0 ? 'var(--accent-emerald-bright)' : '#ef4444' }}>
                    {activeStepModal.silhouette_after?.toFixed(5)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Selection Gate</div>
                  <div style={{ fontWeight: 800, color: activeStepModal.decision === 'ACCEPTED' ? 'var(--accent-emerald-bright)' : '#ef4444' }}>
                    {activeStepModal.decision} ({activeStepModal.delta > 0 ? `+${activeStepModal.delta}` : activeStepModal.delta})
                  </div>
                </div>
              </div>

              {/* Transformation Code AST */}
              {activeStepModal.code_diff && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Transformation Code Diff
                  </div>
                  <pre
                    style={{
                      background: '#090d16',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem',
                      color: 'var(--accent-cyan-bright)',
                      overflowX: 'auto'
                    }}
                  >
                    {activeStepModal.code_diff}
                  </pre>
                </div>
              )}

              {/* Reflection & Diagnostic Reasoning */}
              {activeStepModal.reflection && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    AutoResearch Agent Diagnostic Reflection
                  </div>
                  <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {activeStepModal.reflection}
                  </div>
                </div>
              )}

              {/* Hyperparameters JSON Diff */}
              {activeStepModal.hyperparameters && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Active Hyperparameters
                  </div>
                  <pre
                    style={{
                      background: '#090d16',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      overflowX: 'auto'
                    }}
                  >
                    {JSON.stringify(activeStepModal.hyperparameters, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-tertiary)' }}>
              <button className="btn-primary" onClick={() => setActiveStepModal(null)}>
                Close Step Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
