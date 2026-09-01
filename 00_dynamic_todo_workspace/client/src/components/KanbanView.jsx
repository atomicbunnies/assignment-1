import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { sound } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { Plus, MoreHorizontal, Layers, CheckSquare, Clock, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: '#94a3b8' },
  { id: 'in_progress', title: 'In Progress', color: '#06b6d4' },
  { id: 'review', title: 'In Review', color: '#a855f7' },
  { id: 'completed', title: 'Done', color: '#10b981' }
];

export const KanbanView = () => {
  const { tasks, patchTask, createTask, setActiveTaskModal } = useTasks();
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [quickTitleCol, setQuickTitleCol] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, colId) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== colId) {
      if (colId === 'completed') {
        sound.playCheckmark();
        triggerConfetti();
      } else {
        sound.playClick();
      }
      await patchTask(taskId, { status: colId });
    }
    setDraggedTaskId(null);
  };

  const handleQuickAdd = async (colId) => {
    if (!quickTitle.trim()) {
      setQuickTitleCol(null);
      return;
    }
    await createTask({
      title: quickTitle.trim(),
      status: colId,
      priority: 'medium'
    });
    setQuickTitle('');
    setQuickTitleCol(null);
  };

  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const isTarget = dragOverCol === col.id;

        return (
          <div
            key={col.id}
            className="kanban-col"
            style={{
              borderColor: isTarget ? 'var(--accent-primary)' : undefined,
              boxShadow: isTarget ? '0 0 16px var(--accent-glow)' : undefined
            }}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="kanban-col-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: col.color }}>●</span>
                <span>{col.title}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: 'var(--bg-elevated)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--text-muted)'
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              <button
                className="btn-icon"
                style={{ width: 26, height: 26 }}
                onClick={() => {
                  setQuickTitleCol(col.id);
                  setQuickTitle('');
                }}
                title={`Add task to ${col.title}`}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Quick Add Form in Column */}
            {quickTitleCol === col.id && (
              <div style={{ padding: '0.75rem 1rem 0' }}>
                <input
                  type="text"
                  autoFocus
                  placeholder="Task title... (Enter to save)"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickAdd(col.id);
                    if (e.key === 'Escape') setQuickTitleCol(null);
                  }}
                  onBlur={() => handleQuickAdd(col.id)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--accent-primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            )}

            {/* Cards List */}
            <div className="kanban-cards-list">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => setActiveTaskModal(task)}
                  className={`task-card priority-${task.priority}`}
                  style={{
                    cursor: 'grab',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    padding: '0.85rem',
                    opacity: draggedTaskId === task.id ? 0.4 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: `var(--priority-${task.priority})`
                      }}
                    >
                      {task.priority}
                    </span>
                    {task.category_name && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: task.category_color || 'var(--text-secondary)'
                        }}
                      >
                        {task.category_name}
                      </span>
                    )}
                  </div>

                  <h4
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3
                    }}
                  >
                    {task.title}
                  </h4>

                  {task.description && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {task.description}
                    </p>
                  )}

                  {/* Meta Chips */}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', width: '100%' }}>
                    {task.due_date && (
                      <span className="meta-chip">
                        <Calendar size={10} />
                        {task.due_date}
                      </span>
                    )}
                    {task.subtasks?.length > 0 && (
                      <span className="meta-chip">
                        <CheckSquare size={10} />
                        {task.subtasks.filter((s) => s.is_completed).length}/{task.subtasks.length}
                      </span>
                    )}
                    {task.tags?.map((t) => (
                      <span
                        key={t.id}
                        className="meta-chip"
                        style={{ color: t.color || 'var(--accent-text)' }}
                      >
                        #{t.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
