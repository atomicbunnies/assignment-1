import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { sound } from '../utils/audio';
import { Flame, Clock, Users, Coffee, Plus, Calendar } from 'lucide-react';
import { parseISO, isToday, isPast } from 'date-fns';

export const EisenhowerMatrix = () => {
  const { tasks, patchTask, createTask, setActiveTaskModal } = useTasks();
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverQuad, setDragOverQuad] = useState(null);

  // Categorize into the 4 Eisenhower Quadrants
  const now = new Date();
  const isTaskUrgent = (t) => {
    if (t.priority === 'urgent') return true;
    if (!t.due_date) return false;
    try {
      const d = parseISO(t.due_date);
      return isToday(d) || isPast(d);
    } catch {
      return false;
    }
  };

  const isTaskImportant = (t) => {
    return t.priority === 'urgent' || t.priority === 'high';
  };

  const quadrants = [
    {
      id: 'q1',
      title: 'Do First (Urgent & Important)',
      subtitle: 'Critical crises, deadlines, immediate actions',
      icon: Flame,
      color: 'var(--priority-urgent)',
      className: 'urgent-important',
      priority: 'urgent',
      filter: (t) => t.status !== 'completed' && isTaskUrgent(t) && isTaskImportant(t)
    },
    {
      id: 'q2',
      title: 'Schedule (Important & Not Urgent)',
      subtitle: 'Strategy, growth, long-term investments',
      icon: Clock,
      color: 'var(--priority-medium)',
      className: 'noturgent-important',
      priority: 'high',
      filter: (t) => t.status !== 'completed' && !isTaskUrgent(t) && isTaskImportant(t)
    },
    {
      id: 'q3',
      title: 'Delegate (Urgent & Not Important)',
      subtitle: 'Interruptions, pressing busywork, admin',
      icon: Users,
      color: 'var(--priority-high)',
      className: 'urgent-notimportant',
      priority: 'medium',
      filter: (t) => t.status !== 'completed' && isTaskUrgent(t) && !isTaskImportant(t)
    },
    {
      id: 'q4',
      title: 'Eliminate / Backlog (Neither)',
      subtitle: 'Time wasters, low-impact ideas, trivia',
      icon: Coffee,
      color: 'var(--text-muted)',
      className: 'noturgent-notimportant',
      priority: 'low',
      filter: (t) => t.status !== 'completed' && !isTaskUrgent(t) && !isTaskImportant(t)
    }
  ];

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = async (e, quad) => {
    e.preventDefault();
    setDragOverQuad(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    sound.playClick();
    if (quad.id === 'q1') {
      await patchTask(taskId, { priority: 'urgent', due_date: new Date().toISOString().split('T')[0] });
    } else if (quad.id === 'q2') {
      await patchTask(taskId, { priority: 'high' });
    } else if (quad.id === 'q3') {
      await patchTask(taskId, { priority: 'medium', due_date: new Date().toISOString().split('T')[0] });
    } else if (quad.id === 'q4') {
      await patchTask(taskId, { priority: 'low' });
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="matrix-grid">
      {quadrants.map((quad) => {
        const Icon = quad.icon;
        const quadTasks = tasks.filter(quad.filter);
        const isOver = dragOverQuad === quad.id;

        return (
          <div
            key={quad.id}
            className={`matrix-quadrant ${quad.className}`}
            style={{
              borderColor: isOver ? 'var(--accent-primary)' : undefined,
              boxShadow: isOver ? '0 0 16px var(--accent-glow)' : undefined
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverQuad(quad.id);
            }}
            onDragLeave={() => setDragOverQuad(null)}
            onDrop={(e) => handleDrop(e, quad)}
          >
            {/* Quadrant Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon size={18} style={{ color: quad.color }} />
                <div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {quad.title}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{quad.subtitle}</p>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'var(--bg-elevated)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {quadTasks.length}
              </span>
            </div>

            {/* Tasks in Quadrant */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {quadTasks.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, t.id)}
                  onClick={() => setActiveTaskModal(t)}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t.title}
                  </span>
                  {t.due_date && (
                    <span className="meta-chip" style={{ flexShrink: 0 }}>
                      <Calendar size={10} />
                      {t.due_date}
                    </span>
                  )}
                </div>
              ))}

              {quadTasks.length === 0 && (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontStyle: 'italic',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    minHeight: 80
                  }}
                >
                  Drag tasks here or add via quick bar
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
