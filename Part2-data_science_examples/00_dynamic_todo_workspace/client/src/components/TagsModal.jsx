import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { X, Tag as TagIcon, Plus } from 'lucide-react';

export const TagsModal = () => {
  const { isTagsModalOpen, setIsTagsModalOpen, tags, createTag } = useTasks();
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#6366f1');

  if (!isTagsModalOpen) return null;

  const colorPalette = [
    '#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#3b82f6', '#14b8a6', '#f97316'
  ];

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    await createTag({ name: tagName.trim(), color: tagColor });
    setTagName('');
  };

  return (
    <div className="modal-overlay" onClick={() => setIsTagsModalOpen(false)}>
      <div className="modal-card" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
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
            <TagIcon size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Manage Tags</h3>
          </div>
          <button className="btn-icon" onClick={() => setIsTagsModalOpen(false)} style={{ width: 28, height: 28 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Create Tag Form */}
          <form onSubmit={handleCreateTag} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Tag name (e.g. backend, urgent)..."
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem'
                }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                <Plus size={16} />
                <span>Add Tag</span>
              </button>
            </div>

            {/* Color selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Color:</span>
              {colorPalette.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTagColor(c)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: c,
                    border: tagColor === c ? '2px solid white' : 'none',
                    boxShadow: tagColor === c ? `0 0 6px ${c}` : 'none',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </form>

          {/* Existing tags */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              Existing Tags ({tags.length})
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {tags.map((t) => (
                <span
                  key={t.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-tertiary)',
                    border: `1px solid ${t.color}`,
                    color: t.color,
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color }} />
                  #{t.name}
                  {t.task_count > 0 && (
                    <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>({t.task_count})</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
