import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskItem } from './TaskItem';
import { QuickAddBar } from './QuickAddBar';
import {
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  CheckCheck,
  Inbox
} from 'lucide-react';
import { parseISO, isToday, isTomorrow, isPast, isAfter, startOfTomorrow, addDays } from 'date-fns';

export const ListView = () => {
  const {
    tasks,
    loading,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectAllFiltered,
    selectedTaskIds
  } = useTasks();

  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (groupKey) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Group tasks into logical time buckets
  const now = new Date();
  const groups = {
    overdue: [],
    today: [],
    tomorrow: [],
    upcoming: [],
    noDate: [],
    completed: []
  };

  tasks.forEach((task) => {
    if (task.status === 'completed') {
      groups.completed.push(task);
      return;
    }

    if (!task.due_date) {
      groups.noDate.push(task);
      return;
    }

    try {
      const date = parseISO(task.due_date);
      if (isToday(date)) {
        groups.today.push(task);
      } else if (isPast(date) && !isToday(date)) {
        groups.overdue.push(task);
      } else if (isTomorrow(date)) {
        groups.tomorrow.push(task);
      } else if (isAfter(date, addDays(now, 1))) {
        groups.upcoming.push(task);
      } else {
        groups.noDate.push(task);
      }
    } catch {
      groups.noDate.push(task);
    }
  });

  const sectionDefs = [
    { key: 'overdue', title: 'Overdue', color: 'var(--priority-urgent)', items: groups.overdue },
    { key: 'today', title: 'Due Today', color: '#f59e0b', items: groups.today },
    { key: 'tomorrow', title: 'Due Tomorrow', color: '#06b6d4', items: groups.tomorrow },
    { key: 'upcoming', title: 'Upcoming & Scheduled', color: '#818cf8', items: groups.upcoming },
    { key: 'noDate', title: 'No Due Date', color: 'var(--text-muted)', items: groups.noDate },
    { key: 'completed', title: 'Completed', color: 'var(--status-completed)', items: groups.completed }
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Quick Add Bar */}
      <QuickAddBar />

      {/* List Controls & Sorting */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}
      >
        <button
          onClick={selectAllFiltered}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}
        >
          <CheckCheck size={16} />
          <span>
            {selectedTaskIds.length > 0
              ? `Deselect All (${selectedTaskIds.length} selected)`
              : 'Select All'}
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={14} />
          <span>Sort:</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb);
              setSortOrder(so);
            }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.2rem 0.5rem',
              fontSize: '0.8rem',
              color: 'var(--text-primary)'
            }}
          >
            <option value="order_index-ASC">Custom Order</option>
            <option value="due_date-ASC">Due Date (Earliest)</option>
            <option value="due_date-DESC">Due Date (Latest)</option>
            <option value="priority-DESC">Priority (High to Low)</option>
            <option value="title-ASC">Title (A-Z)</option>
            <option value="created_at-DESC">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Task Groups */}
      {tasks.length === 0 && !loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            color: 'var(--text-muted)',
            background: 'var(--bg-glass-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-medium)'
          }}
        >
          <Inbox size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No tasks found</h3>
          <p style={{ fontSize: '0.88rem' }}>Type above to create a new task or adjust your filters!</p>
        </div>
      )}

      {sectionDefs.map(
        (sec) =>
          sec.items.length > 0 && (
            <div key={sec.key} className="task-group">
              <div
                className="group-header"
                onClick={() => toggleGroup(sec.key)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div className="group-title">
                  {collapsedGroups[sec.key] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  <span style={{ color: sec.color }}>●</span>
                  <span>{sec.title}</span>
                  <span className="count">({sec.items.length})</span>
                </div>
              </div>

              {!collapsedGroups[sec.key] && (
                <div className="task-list">
                  {sec.items.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          )
      )}
    </div>
  );
};
