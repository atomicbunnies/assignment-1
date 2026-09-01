import React from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, AlertTriangle, Database } from 'lucide-react';

export const DataQualityAuditView = ({ data = {} }) => {
  const { data_quality_score = 87.8, completeness_pct = 95.3, duplicate_rows = 15, total_rows = 515, columns = [] } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overview Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(99, 102, 241, 0.08))', borderColor: 'var(--border-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--accent-cyan-bright)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-cyan-bright)' }}>
                Automated Profiling & Schema Audit
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              Data Quality Scorecard & Anomaly Detection
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Demonstrating <strong>Programmatic EDA</strong>, <strong>Null Density Auditing</strong>, and <strong>Constraint Assertion Checks</strong>.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'rgba(7, 9, 19, 0.8)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Quality Score</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald-bright)' }}>
                {data_quality_score} / 100
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Completeness</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan-bright)' }}>
                {completeness_pct}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Duplicate Rows</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
                {duplicate_rows} Rows
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Column Health Status Table */}
      <div className="data-table-container">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>
          Column-by-Column Integrity & Anomaly Assessment
        </h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Inferred Type</th>
              <th>Unique Values</th>
              <th>Missing Values</th>
              <th>Integrity Health</th>
              <th>Detected Anomaly Flags</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col) => (
              <tr key={col.column_name}>
                <td style={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {col.column_name}
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {col.inferred_type}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{col.unique_values}</td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', color: col.null_pct > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                    {col.null_count} ({col.null_pct}%)
                  </span>
                </td>
                <td>
                  {col.health_status === 'PASS' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-emerald-bright)', fontSize: '0.72rem', fontWeight: 800 }}>
                      <CheckCircle2 size={12} /> PASS
                    </span>
                  ) : col.health_status === 'WARNING' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-amber)', fontSize: '0.72rem', fontWeight: 800 }}>
                      <AlertTriangle size={12} /> WARNING
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-rose)', fontSize: '0.72rem', fontWeight: 800 }}>
                      <AlertOctagon size={12} /> CRITICAL
                    </span>
                  )}
                </td>
                <td style={{ fontSize: '0.74rem', color: col.issues.length ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                  {col.issues.join(', ') || 'No integrity issues found'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
