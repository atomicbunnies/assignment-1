import React from 'react';
import { useTasks } from '../context/TaskContext';
import {
  TrendingUp,
  Flame,
  Clock,
  CheckCircle2,
  PieChart,
  Zap,
  BarChart2,
  Calendar
} from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { analytics, loading } = useTasks();

  if (!analytics && loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading productivity telemetry...
      </div>
    );
  }

  const { summary, priorityBreakdown = [], categoryBreakdown = [], heatmap = [] } = analytics || {};

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Top Stat Cards */}
      <div className="analytics-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Completion Velocity</span>
            <CheckCircle2 size={18} style={{ color: 'var(--status-completed)' }} />
          </div>
          <div className="stat-value" style={{ color: 'var(--status-completed)' }}>
            {summary?.completionRate || 0}%
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {summary?.completed || 0} of {summary?.total || 0} tasks resolved
          </p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Active Streak</span>
            <Flame size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {summary?.currentStreak || 0} <span style={{ fontSize: '1rem', fontWeight: 600 }}>days</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Consecutive daily task completions
          </p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Productivity Index</span>
            <Zap size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-text)' }}>
            {summary?.productivityScore || 0} <span style={{ fontSize: '1rem', fontWeight: 600 }}>/ 100</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Calculated from velocity & deadline compliance
          </p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Focus Time Logged</span>
            <Clock size={18} style={{ color: '#06b6d4' }} />
          </div>
          <div className="stat-value" style={{ color: '#06b6d4' }}>
            {Math.round((summary?.totalTimeSpentMinutes || 0) / 60 * 10) / 10} <span style={{ fontSize: '1rem', fontWeight: 600 }}>hrs</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {summary?.totalTimeSpentMinutes || 0} total minutes in Pomodoro
          </p>
        </div>
      </div>

      {/* 30-Day Activity & Contribution Heatmap */}
      <div className="heatmap-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>30-Day Activity Heatmap</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>Less</span>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--bg-tertiary)' }} />
            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(99, 102, 241, 0.25)' }} />
            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(99, 102, 241, 0.5)' }} />
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#6366f1' }} />
            <span>More</span>
          </div>
        </div>

        <div className="heatmap-grid">
          {heatmap.map((cell) => {
            let levelClass = '';
            if (cell.completed >= 4 || cell.totalActivity >= 5) levelClass = 'level-4';
            else if (cell.completed >= 2 || cell.totalActivity >= 3) levelClass = 'level-3';
            else if (cell.completed >= 1 || cell.totalActivity >= 1) levelClass = 'level-2';
            else if (cell.totalActivity > 0) levelClass = 'level-1';

            return (
              <div
                key={cell.date}
                className={`heatmap-cell ${levelClass}`}
                title={`${cell.date}: ${cell.completed} completed, ${cell.created} created`}
              />
            );
          })}
        </div>
      </div>

      {/* Breakdown Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Priority Distribution */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <TrendingUp size={16} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Priority Distribution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {['urgent', 'high', 'medium', 'low'].map((p) => {
              const row = priorityBreakdown.find((r) => r.priority === p) || { total: 0, completed: 0 };
              const percent = row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0;

              return (
                <div key={p}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600, color: `var(--priority-${p})` }}>
                      {p}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {row.completed}/{row.total} ({percent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${(row.total / (summary?.total || 1)) * 100}%`,
                        height: '100%',
                        background: `var(--priority-${p})`,
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PieChart size={16} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Category Breakdown</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{cat.name}</span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {cat.completed_count}/{cat.count} tasks
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
