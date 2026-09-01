import React, { useState } from 'react';
import { Search, Filter, Play, CheckCircle2, AlertOctagon, BookOpen, Code2, Sparkles, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

const CATEGORIES = [
  'ALL',
  'Data Prep & Feature Engineering',
  'Modeling & Evaluation',
  'Data Quality & Validation',
  'Business & Statistical Analytics'
];

export const SkillExplorer = ({ skills = [], onNavigateToBenchmark }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [executingSkill, setExecutingSkill] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);

  const filteredSkills = skills.filter((s) => {
    if (selectedCategory !== 'ALL' && s.category !== selectedCategory) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.purpose.toLowerCase().includes(term) ||
      s.origin.toLowerCase().includes(term)
    );
  });

  const handleExecute = async (skill) => {
    try {
      setExecutingSkill(skill);
      setExecutionResult(null);
      const res = await api.executeSkill(skill.id, skill.example_dataset);
      setExecutionResult(res);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    } catch (err) {
      console.error('Execution failed:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Category Filter Bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search skill by name, purpose, or technique..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              padding: '0.55rem 1rem 0.55rem 2.2rem',
              fontSize: '0.84rem'
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`nav-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              style={{ fontSize: '0.74rem', padding: '0.35rem 0.7rem' }}
            >
              {cat === 'ALL' ? 'All 46 Skills' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              background: 'linear-gradient(135deg, rgba(13, 19, 38, 0.95), rgba(7, 9, 19, 0.9))'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-cyan-bright)', background: 'rgba(6, 182, 212, 0.12)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                  {skill.category}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {skill.origin}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                {skill.name}
              </h3>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.55 }}>
                {skill.purpose}
              </p>

              {/* Mathematical Intuition Box */}
              <div style={{ marginTop: '0.75rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-indigo-bright)', textTransform: 'uppercase' }}>
                  Statistical & Mathematical Intuition
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)', lineHeight: 1.45 }}>
                  {skill.math_intuition}
                </div>
              </div>

              {/* Common Beginner Pitfalls */}
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertOctagon size={12} /> Avoid Beginner Pitfalls
                </div>
                <ul style={{ paddingLeft: '1.1rem', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {skill.pitfalls?.map((p, pIdx) => (
                    <li key={pIdx}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                className="btn-primary"
                style={{ fontSize: '0.74rem', padding: '0.35rem 0.75rem' }}
                onClick={() => handleExecute(skill)}
              >
                <Play size={13} />
                <span>Live Execute Skill</span>
              </button>

              {skill.benchmark_link && onNavigateToBenchmark && (
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                  onClick={() => onNavigateToBenchmark(skill.benchmark_link)}
                >
                  <span>Open Benchmark ({skill.example_dataset})</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Execution Result Modal */}
      {executingSkill && (
        <div className="modal-overlay" onClick={() => setExecutingSkill(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(7, 9, 19, 0.95))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-cyan-bright)' }} />
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan-bright)', fontWeight: 800, textTransform: 'uppercase' }}>
                    Live Skill Execution Output
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                    {executingSkill.name}
                  </h3>
                </div>
              </div>
              <button onClick={() => setExecutingSkill(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald-bright)', fontSize: '0.8rem', fontWeight: 700 }}>
                <CheckCircle2 size={16} />
                <span>Skill executed successfully on verification dataset ({executingSkill.example_dataset})</span>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Execution Response Payload (JSON Telemetry)
                </div>
                <pre style={{ background: '#000', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', color: 'var(--accent-cyan-bright)', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', overflowX: 'auto' }}>
                  {JSON.stringify(executionResult || { status: "Executing pipeline against training fold..." }, null, 2)}
                </pre>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.25rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
              <button className="btn-secondary" onClick={() => setExecutingSkill(null)}>
                Close Output
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
