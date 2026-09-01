import React from 'react';
import { useTasks } from '../context/TaskContext';
import {
  CheckCircle2,
  XCircle,
  Trash2,
  AlertCircle,
  Folder,
  X
} from 'lucide-react';

export const BatchActionBar = () => {
  const { selectedTaskIds, setSelectedTaskIds, batchAction, categories } = useTasks();

  if (selectedTaskIds.length === 0) return null;

  return (
    <div className="batch-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem' }}>
        <span
          style={{
            background: 'var(--accent-primary)',
            color: 'white',
            borderRadius: 'var(--radius-full)',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem'
          }}
        >
          {selectedTaskIds.length}
        </span>
        <span>Selected</span>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border-medium)' }} />

      {/* Batch Complete */}
      <button
        className="btn-icon"
        onClick={() => batchAction('complete')}
        title="Mark All Complete"
        style={{ color: 'var(--status-completed)', width: 32, height: 32 }}
      >
        <CheckCircle2 size={16} />
      </button>

      {/* Batch Priority */}
      <select
        onChange={(e) => {
          if (e.target.value) {
            batchAction('set_priority', e.target.value);
            e.target.value = '';
          }
        }}
        defaultValue=""
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.25rem 0.5rem',
          fontSize: '0.78rem',
          color: 'var(--text-primary)'
        }}
      >
        <option value="" disabled>Priority...</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {/* Batch Category */}
      <select
        onChange={(e) => {
          if (e.target.value) {
            batchAction('set_category', e.target.value);
            e.target.value = '';
          }
        }}
        defaultValue=""
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.25rem 0.5rem',
          fontSize: '0.78rem',
          color: 'var(--text-primary)'
        }}
      >
        <option value="" disabled>Category...</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Batch Delete */}
      <button
        className="btn-icon"
        onClick={() => batchAction('delete')}
        title="Move All to Trash"
        style={{ color: 'var(--priority-urgent)', width: 32, height: 32 }}
      >
        <Trash2 size={16} />
      </button>

      {/* Clear selection */}
      <button
        className="btn-icon"
        onClick={() => setSelectedTaskIds([])}
        title="Deselect all"
        style={{ width: 28, height: 28 }}
      >
        <X size={14} />
      </button>
    </div>
  );
};
