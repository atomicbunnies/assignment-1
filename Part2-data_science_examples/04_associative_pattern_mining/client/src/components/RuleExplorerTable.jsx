import React, { useState } from 'react';
import { Search, ArrowUpDown, Filter, Sparkles, Database } from 'lucide-react';

export const RuleExplorerTable = ({ rules = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lift');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredRules = rules.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.antecedent_str.toLowerCase().includes(term) ||
      r.consequent_str.toLowerCase().includes(term)
    );
  });

  const sortedRules = [...filteredRules].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortOrder === 'desc') {
      return valB - valA;
    }
    return valA - valB;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="data-table-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} style={{ color: 'var(--accent-amber-bright)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
            Active Association Rules Explorer ({sortedRules.length} Rules)
          </h3>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: 260 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search product e.g. Avocado, Milk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              padding: '0.45rem 0.85rem 0.45rem 2rem',
              fontSize: '0.8rem'
            }}
          />
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Antecedent Items (IF)</th>
            <th>Consequent Items (THEN)</th>
            <th onClick={() => handleSort('support')} style={{ cursor: 'pointer' }}>
              Support {sortBy === 'support' && (sortOrder === 'desc' ? '↓' : '↑')}
            </th>
            <th onClick={() => handleSort('confidence')} style={{ cursor: 'pointer' }}>
              Confidence {sortBy === 'confidence' && (sortOrder === 'desc' ? '↓' : '↑')}
            </th>
            <th onClick={() => handleSort('lift')} style={{ cursor: 'pointer' }}>
              Lift {sortBy === 'lift' && (sortOrder === 'desc' ? '↓' : '↑')}
            </th>
            <th onClick={() => handleSort('leverage')} style={{ cursor: 'pointer' }}>
              Leverage {sortBy === 'leverage' && (sortOrder === 'desc' ? '↓' : '↑')}
            </th>
            <th onClick={() => handleSort('conviction')} style={{ cursor: 'pointer' }}>
              Conviction {sortBy === 'conviction' && (sortOrder === 'desc' ? '↓' : '↑')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRules.slice(0, 50).map((rule, idx) => (
            <tr key={idx}>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {idx + 1}
              </td>
              <td>
                <span style={{ fontWeight: 700, color: 'var(--accent-amber-bright)' }}>
                  {rule.antecedent_str}
                </span>
              </td>
              <td>
                <span style={{ fontWeight: 700, color: 'var(--accent-emerald-bright)' }}>
                  {rule.consequent_str}
                </span>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>
                {(rule.support * 100).toFixed(2)}%
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {(rule.confidence * 100).toFixed(1)}%
              </td>
              <td>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-emerald-bright)', background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)' }}>
                  {rule.lift.toFixed(2)}x
                </span>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {rule.leverage.toFixed(4)}
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {rule.conviction.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
