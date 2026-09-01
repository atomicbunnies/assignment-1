import React from 'react';
import { useTasks } from '../context/TaskContext';
import {
  Check,
  Calendar,
  Clock,
  Pin,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';

export const TaskItem = ({ task }) => {
  const {
    toggleCompleteTask,
    patchTask,
    deleteTask,
    setActiveTaskModal,
    selectedTaskIds,
    toggleSelectTask
  } = useTasks();

  const isCompleted = task.status === 'completed';
  const isSelected = selectedTaskIds.includes(task.id);

  // Subtasks calculation
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.is_completed)?.length || 0;
  const subtasksProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Due date status
  let dateLabel = null;
  let isOverdue = false;
  if (task.due_date) {
    try {
      const parsedDate = parseISO(task.due_date);
      if (isToday(parsedDate)) {
        dateLabel = 'Today';
      } else {
        dateLabel = format(parsedDate, 'MMM d');
      }
      if (!isCompleted && isPast(parsedDate) && !isToday(parsedDate)) {
        isOverdue = true;
      }
    } catch {
      dateLabel = task.due_date;
    }
  }

  const handleTogglePin = (e) => {
    e.stopPropagation();
    patchTask(task.id, { is_pinned: !task.is_pinned });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteTask(task.id, task.is_deleted);
  };

  return (
    <div
      className={`task-card priority-${task.priority} ${isCompleted ? 'completed' : ''} ${task.is_pinned ? 'pinned' : ''}`}
      style={{
        borderLeft: isSelected ? '4px solid var(--accent-primary)' : undefined,
        background: isSelected ? 'var(--bg-glass-hover)' : undefined
      }}
    >
      {/* Multi-select box */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleSelectTask(task.id);
        }}
        style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)', display: 'flex' }}
        title="Select for batch action"
      >
        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
      </button>

      {/* Complete Checkbox */}
      <div
        className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}
        onClick={() => toggleCompleteTask(task)}
        title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {isCompleted && <Check size={14} strokeWidth={3} />}
      </div>

      {/* Task Content */}
      <div className="task-card-content" onClick={() => setActiveTaskModal(task)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <h4 className="task-title">{task.title}</h4>
          {task.is_pinned && (
            <Pin size={13} style={{ color: 'var(--accent-primary)', fill: 'var(--accent-primary)', flexShrink: 0 }} />
          )}
        </div>

        <div className="task-meta-row">
          {/* Due date badge */}
          {dateLabel && (
            <span className={`meta-chip ${isOverdue ? 'overdue' : ''}`}>
              {isOverdue ? <AlertTriangle size={11} /> : <Calendar size={11} />}
              {dateLabel}
            </span>
          )}

          {/* Estimated / spent time */}
          {(task.estimated_minutes > 0 || task.time_spent_minutes > 0) && (
            <span className="meta-chip">
              <Clock size={11} />
              {task.time_spent_minutes > 0 ? `${task.time_spent_minutes}m / ` : ''}
              {task.estimated_minutes}m
            </span>
          )}

          {/* Category */}
          {task.category_name && (
            <span
              className="meta-chip"
              style={{
                color: task.category_color || 'inherit',
                borderLeft: `2px solid ${task.category_color || 'var(--accent-primary)'}`
              }}
            >
              <Layers size={11} />
              {task.category_name}
            </span>
          )}

          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <span className="meta-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>{completedSubtasks}/{totalSubtasks}</span>
              <div
                style={{
                  width: 32,
                  height: 4,
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${subtasksProgress}%`,
                    height: '100%',
                    background: 'var(--status-completed)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 200ms ease'
                  }}
                />
              </div>
            </span>
          )}

          {/* Tags */}
          {task.tags?.map((t) => (
            <span
              key={t.id}
              className="meta-chip"
              style={{
                fontSize: '0.7rem',
                color: t.color || 'var(--accent-text)',
                background: 'var(--bg-elevated)'
              }}
            >
              #{t.name}
            </span>
          ))}
        </div>
      </div>

      {/* Hover Action Icons */}
      <div className="task-card-actions">
        <button
          className={`btn-icon ${task.is_pinned ? 'active' : ''}`}
          onClick={handleTogglePin}
          title={task.is_pinned ? 'Unpin' : 'Pin to top'}
          style={{ width: 28, height: 28 }}
        >
          <Pin size={13} />
        </button>

        <button
          className="btn-icon"
          onClick={(e) => {
            e.stopPropagation();
            setActiveTaskModal(task);
          }}
          title="Edit task details"
          style={{ width: 28, height: 28 }}
        >
          <Edit3 size={13} />
        </button>

        <button
          className="btn-icon"
          onClick={handleDelete}
          title={task.is_deleted ? 'Delete permanently' : 'Move to trash'}
          style={{ width: 28, height: 28, color: 'var(--priority-urgent)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};
