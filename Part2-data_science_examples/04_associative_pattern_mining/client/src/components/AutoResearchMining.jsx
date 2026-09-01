import React, { useState } from 'react';
import {
  TrendingUp,
  Cpu,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Code2,
  GitCommit,
  Layers,
  Sliders,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export const AutoResearchMining = ({ historyData = {}, onRefresh }) => {
  const [selectedStep, setSelectedStep] = useState(null);
  const [phaseFilter, setPhaseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [running, setRunning] = useState(false);

  const {
    initial_mean_lift = 3.515,
    best_mean_lift = 3.793,
    improvement_pct = 7.9,
    total_iterations = 10,
    accepted_mutations_count = 3,
    rejected_mutations_count = 7,
    backbones_leaderboard = [],
    trajectory = []
  } = historyData;

  const handleRunSearch = async () => {
    try {
      setRunning(true);
      const res = await api.runAutoResearch();
      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('AutoResearch failed:', err);
    } finally {
      setRunning(false);
    }
  };

  const filteredTrajectory = trajectory.filter((item) => {
    if (phaseFilter !== 'ALL' && item.phase !== phaseFilter) return false;
    if (statusFilter !== 'ALL' && item.decision !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header KPI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Initial Mean Lift</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {initial_mean_lift.toFixed(4)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>FP-Growth Baseline</div>
        </div>

        <div className="card" style={{ borderColor: 'var(--border-glow)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald-bright)', textTransform: 'uppercase', fontWeight: 700 }}>Evolved Mean Lift</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald-bright)', marginTop: '0.25rem' }}>
            {best_mean_lift.toFixed(4)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald-bright)' }}>+{improvement_pct}% Quality Gain</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Search Mutations</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber-bright)', marginTop: '0.25rem' }}>
            {total_iterations} Iterations
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>4 Search Phases</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Acceptance Ratio</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
            {accepted_mutations_count} Acc / {rejected_mutations_count} Rej
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Strict Hill-Climbing Gate</div>
        </div>
      </div>

      {/* 2. Run AutoResearch Banner */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(16, 185, 129, 0.1))', borderColor: 'var(--border-active)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--accent-amber-bright)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>AutoResearch Tabular Autonomous Engine</h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Multi-stage autonomous hill-climbing optimizing support lattices, confidence bounds, and multi-item bundle yield.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={handleRunSearch}
          disabled={running}
          id="btn-run-autoresearch"
        >
          <Play size={16} />
          <span>{running ? 'Exploring Association Space...' : 'Run AutoResearch Search'}</span>
        </button>
      </div>

      {/* 3. Multi-Backbone Leaderboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {backbones_leaderboard.map((bb, idx) => {
          const isWinner = idx === 0;
          return (
            <div
              key={bb.id}
              className="card"
              style={{
                borderColor: isWinner ? 'var(--accent-emerald)' : 'var(--border-subtle)',
                background: isWinner ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 8, 18, 0.9))' : 'var(--bg-secondary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Backbone #{idx + 1}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isWinner ? '#fff' : 'var(--text-primary)' }}>{bb.name}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{bb.family}</div>
                </div>
                {isWinner && (
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald-bright)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={12} /> Tournament Champion
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Mean Lift</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-amber-bright)' }}>{bb.metrics.mean_lift.toFixed(3)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Itemsets</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{bb.metrics.itemsets_count}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Runtime</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{bb.metrics.fit_time_sec}s</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Optimization Trajectory Chart (SVG) */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-amber-bright)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              Hill-Climbing Trajectory: Mean Rule Lift vs Iteration
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Green = Accepted Climb • Red = Rejected Mutation
          </span>
        </div>

        <div style={{ width: '100%', height: 200, background: 'rgba(5, 8, 17, 0.7)', borderRadius: 'var(--radius-md)', padding: '1rem', position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 800 160" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="40" y1="20" x2="780" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4,4" />
            <line x1="40" y1="80" x2="780" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="4,4" />
            <line x1="40" y1="140" x2="780" y2="140" stroke="rgba(255,255,255,0.05)" strokeDasharray="4,4" />

            {/* Trajectory line */}
            {trajectory.length > 1 && (
              <polyline
                fill="none"
                stroke="var(--accent-amber)"
                strokeWidth="2.5"
                points={trajectory.map((pt, idx) => {
                  const x = 50 + (idx / Math.max(1, trajectory.length - 1)) * 710;
                  const y = 140 - ((pt.lift_after - 3.4) / 0.5) * 110;
                  return `${x},${y}`;
                }).join(' ')}
              />
            )}

            {/* Step Nodes */}
            {trajectory.map((pt, idx) => {
              const x = 50 + (idx / Math.max(1, trajectory.length - 1)) * 710;
              const y = 140 - ((pt.lift_after - 3.4) / 0.5) * 110;
              const isAccepted = pt.decision === 'ACCEPTED';
              return (
                <circle
                  key={pt.step_id}
                  cx={x}
                  cy={y}
                  r={5.5}
                  fill={isAccepted ? '#10b981' : '#ef4444'}
                  stroke="#fff"
                  strokeWidth={1.5}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setSelectedStep(pt)}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* 5. Experiment Mutation Stream Table */}
      <div className="data-table-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitCommit size={18} style={{ color: 'var(--accent-amber-bright)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Mutation Search Log & Click-Through Inspector</h3>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
            >
              <option value="ALL">All Phases</option>
              <option value="Backbone Tournament">Backbone Tournament</option>
              <option value="Metric Pruning">Metric Pruning</option>
              <option value="Hyperparameter Tuning">Hyperparameter Tuning</option>
              <option value="High-Value Bundles">High-Value Bundles</option>
            </select>

            <select
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Decisions</option>
              <option value="ACCEPTED">Accepted Only</option>
              <option value="REJECTED">Rejected Only</option>
            </select>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Step</th>
              <th>Phase</th>
              <th>Hypothesis & Mutation Target</th>
              <th>Mean Lift Before</th>
              <th>Mean Lift After</th>
              <th>Delta</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrajectory.map((step) => {
              const isAccepted = step.decision === 'ACCEPTED';
              return (
                <tr key={step.step_id} style={{ background: isAccepted ? 'rgba(16, 185, 129, 0.03)' : 'transparent' }}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                    {step.step_id}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)' }}>
                      {step.phase}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{step.hypothesis}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{step.feature_name}</div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {step.lift_before.toFixed(4)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isAccepted ? 'var(--accent-emerald-bright)' : 'var(--text-secondary)' }}>
                    {step.lift_after.toFixed(4)}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: step.delta > 0 ? 'var(--accent-emerald-bright)' : step.delta < 0 ? '#ef4444' : 'var(--text-muted)' }}>
                      {step.delta > 0 ? `+${step.delta.toFixed(4)}` : step.delta.toFixed(4)}
                    </span>
                  </td>
                  <td>
                    {isAccepted ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-emerald-bright)', fontSize: '0.72rem', fontWeight: 800 }}>
                        <CheckCircle2 size={12} /> ACCEPTED
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontSize: '0.72rem', fontWeight: 700 }}>
                        <XCircle size={12} /> REJECTED
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                      onClick={() => setSelectedStep(step)}
                    >
                      Inspect Step
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 6. Step Click-Through Inspector Modal */}
      {selectedStep && (
        <div className="modal-overlay" onClick={() => setSelectedStep(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                  AutoResearch Step Inspector • {selectedStep.step_id}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                  {selectedStep.hypothesis}
                </h3>
              </div>
              <button onClick={() => setSelectedStep(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Decision Badge & Metric Change */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hill-Climbing Gate Decision</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: selectedStep.decision === 'ACCEPTED' ? 'var(--accent-emerald-bright)' : '#ef4444' }}>
                    {selectedStep.decision} (Delta: {selectedStep.delta > 0 ? `+${selectedStep.delta.toFixed(4)}` : selectedStep.delta.toFixed(4)})
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mean Rule Lift</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber-bright)' }}>
                    {selectedStep.lift_before.toFixed(4)} ➔ {selectedStep.lift_after.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* Agent Reflection */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Agent Diagnostic Reflection & Analysis
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {selectedStep.reflection}
                </div>
              </div>

              {/* Code Diff */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Python Code Implementation Diff
                </div>
                <pre style={{ background: '#000', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', color: 'var(--accent-emerald-bright)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                  {selectedStep.code_diff}
                </pre>
              </div>

              {/* Hyperparameter State */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Hyperparameter & Metric Context
                </div>
                <pre style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                  {JSON.stringify(selectedStep.hyperparameters, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
