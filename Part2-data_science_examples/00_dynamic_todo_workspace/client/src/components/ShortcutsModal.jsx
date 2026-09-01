import React from 'react';
import { useTasks } from '../context/TaskContext';
import { X, Keyboard } from 'lucide-react';

export const ShortcutsModal = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useTasks();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K / Cmd + K', desc: 'Open Command Palette' },
    { key: '/', desc: 'Focus Global Task Search' },
    { key: '?', desc: 'Open Keyboard Shortcuts cheat sheet' },
    { key: 'Esc', desc: 'Close any active modal or overlay' },
    { key: '!urgent / !high / !low', desc: 'Natural language priority in Quick Add' },
    { key: '#tagname', desc: 'Natural language tag in Quick Add' },
    { key: '@today / @tomorrow / @fri', desc: 'Natural language due date in Quick Add' },
    { key: '~25m / ~1h', desc: 'Natural language time estimate in Quick Add' }
  ];

  return (
    <div className="modal-overlay" onClick={() => setIsShortcutsOpen(false)}>
      <div className="modal-card" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Keyboard size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Keyboard Shortcuts</h3>
          </div>
          <button className="btn-icon" onClick={() => setIsShortcutsOpen(false)} style={{ width: 28, height: 28 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.4rem 0',
                borderBottom: idx !== shortcuts.length - 1 ? '1px solid var(--border-subtle)' : 'none'
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.desc}</span>
              <kbd
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
