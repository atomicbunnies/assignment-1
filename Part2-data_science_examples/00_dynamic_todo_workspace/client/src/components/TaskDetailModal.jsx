import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import {
  X,
  Calendar,
  Clock,
  Pin,
  Trash2,
  CheckCircle,
  Plus,
  Tag,
  Layers,
  Save,
  CheckSquare,
  Square
} from 'lucide-react';

export const TaskDetailModal = () => {
  const {
    activeTaskModal,
    setActiveTaskModal,
    updateTask,
    deleteTask,
    categories,
    tags: allTags
  } = useTasks();

  if (!activeTaskModal) return null;

  const [title, setTitle] = useState(activeTaskModal.title || '');
  const [description, setDescription] = useState(activeTaskModal.description || '');
  const [priority, setPriority] = useState(activeTaskModal.priority || 'medium');
  const [status, setStatus] = useState(activeTaskModal.status || 'todo');
  const [categoryId, setCategoryId] = useState(activeTaskModal.category_id || '');
  const [dueDate, setDueDate] = useState(activeTaskModal.due_date || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(activeTaskModal.estimated_minutes || 0);
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(activeTaskModal.time_spent_minutes || 0);
  const [isPinned, setIsPinned] = useState(Boolean(activeTaskModal.is_pinned));
  const [subtasks, setSubtasks] = useState(activeTaskModal.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState(
    (activeTaskModal.tags || []).map((t) => t.id)
  );

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!title.trim()) return;

    await updateTask(activeTaskModal.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      category_id: categoryId || null,
      due_date: dueDate || null,
      estimated_minutes: parseInt(estimatedMinutes, 10) || 0,
      time_spent_minutes: parseInt(timeSpentMinutes, 10) || 0,
      is_pinned: isPinned ? 1 : 0,
      subtasks,
      tags: selectedTagIds
    });

    setActiveTaskModal(null);
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `sub-temp-${Date.now()}`, title: newSubtaskTitle.trim(), is_completed: false }
    ]);
    setNewSubtaskTitle('');
  };

  const toggleSubtaskItem = (subId) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, is_completed: !s.is_completed } : s))
    );
  };

  const removeSubtaskItem = (subId) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subId));
  };

  const toggleTagSelection = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveTaskModal(null)}>
      <div
        className="modal-card"
        style={{ maxWidth: 640 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: `var(--priority-${priority})`,
                background: `var(--priority-${priority}-bg)`,
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {priority}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ID: {activeTaskModal.id}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className={`btn-icon ${isPinned ? 'active' : ''}`}
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin size={16} />
            </button>
            <button
              className="btn-icon"
              onClick={() => {
                deleteTask(activeTaskModal.id, activeTaskModal.is_deleted);
                setActiveTaskModal(null);
              }}
              title="Delete task"
              style={{ color: 'var(--priority-urgent)' }}
            >
              <Trash2 size={16} />
            </button>
            <button
              className="btn-icon"
              onClick={() => setActiveTaskModal(null)}
              title="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Title Input */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-medium)',
                padding: '0.25rem 0'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
              Description & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, markdown notes, context..."
              style={{
                width: '100%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 0.8rem',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Metadata Grid (Status, Priority, Category, Due Date) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem'
                }}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem'
                }}
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
                Time Spent (minutes)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={timeSpentMinutes}
                onChange={(e) => setTimeSpentMinutes(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              Subtasks Checklist ({subtasks.filter((s) => s.is_completed).length}/{subtasks.length})
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-tertiary)',
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}
                    onClick={() => toggleSubtaskItem(sub.id)}
                  >
                    {sub.is_completed ? (
                      <CheckSquare size={16} style={{ color: 'var(--status-completed)' }} />
                    ) : (
                      <Square size={16} style={{ color: 'var(--text-muted)' }} />
                    )}
                    <span
                      style={{
                        fontSize: '0.85rem',
                        textDecoration: sub.is_completed ? 'line-through' : 'none',
                        color: sub.is_completed ? 'var(--text-muted)' : 'var(--text-primary)'
                      }}
                    >
                      {sub.title}
                    </span>
                  </div>

                  <button
                    className="btn-icon"
                    style={{ width: 22, height: 22 }}
                    onClick={() => removeSubtaskItem(sub.id)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Add new subtask item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem'
                }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                <Plus size={14} />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              Tags
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {allTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTagSelection(tag.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.78rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      background: isSelected ? tag.color : 'var(--bg-tertiary)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      border: `1px solid ${isSelected ? tag.color : 'var(--border-subtle)'}`,
                      fontWeight: 500
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: isSelected ? '#fff' : tag.color }} />
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}
        >
          <button
            type="button"
            className="btn-icon"
            style={{ width: 'auto', padding: '0 0.85rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTaskModal(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            style={{ padding: '0.5rem 1.25rem' }}
          >
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
