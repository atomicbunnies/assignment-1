import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { parseNaturalLanguage } from '../utils/nlpParser';
import { Plus, Sparkles, Calendar, Tag, AlertCircle, Clock } from 'lucide-react';

export const QuickAddBar = () => {
  const { createTask, categories, activeFilter } = useTasks();
  const [inputValue, setInputValue] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');

  const parsed = useMemo(() => {
    return parseNaturalLanguage(inputValue);
  }, [inputValue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parsed.title.trim()) return;

    // Determine category: if user picked from dropdown, or if active filter is a category
    let finalCatId = selectedCatId || null;
    if (!finalCatId && activeFilter.startsWith('cat-')) {
      finalCatId = activeFilter.replace('cat-', '');
    }

    const newTask = {
      title: parsed.title,
      priority: parsed.priority,
      category_id: finalCatId,
      due_date: parsed.dueDate,
      estimated_minutes: parsed.estimate,
      tags: parsed.tags
    };

    await createTask(newTask);
    setInputValue('');
  };

  return (
    <div className="quick-add-container">
      <form onSubmit={handleSubmit}>
        <div className="quick-add-input-row">
          <Sparkles size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <input
            type="text"
            className="quick-add-input"
            placeholder="Add task... try: 'Review PR tomorrow @2pm !urgent #frontend ~30m'"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.6rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}
          >
            <option value="">No Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="btn-primary"
            disabled={!parsed.title.trim()}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.82rem',
              opacity: parsed.title.trim() ? 1 : 0.5
            }}
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Live Natural Language Parsing preview tags */}
        {inputValue.trim() && parsed.tokens.length > 0 && (
          <div className="nlp-tokens-row">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Recognized:</span>
            {parsed.tokens.map((tok, idx) => (
              <span key={idx} className={`token-pill ${tok.class}`}>
                {tok.type === 'priority' && <AlertCircle size={12} />}
                {tok.type === 'tag' && <Tag size={12} />}
                {tok.type === 'date' && <Calendar size={12} />}
                {tok.type === 'estimate' && <Clock size={12} />}
                {tok.value}
              </span>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};
