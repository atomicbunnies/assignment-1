import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO
} from 'date-fns';

export const CalendarView = () => {
  const { tasks, setActiveTaskModal, createTask } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleDayClick = async (day) => {
    const formatted = format(day, 'yyyy-MM-dd');
    const title = window.prompt(`Add new task for ${format(day, 'MMM d, yyyy')}:`);
    if (title && title.trim()) {
      await createTask({
        title: title.trim(),
        due_date: formatted,
        priority: 'medium'
      });
    }
  };

  return (
    <div className="calendar-container">
      {/* Calendar Header Navigation */}
      <div className="calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CalendarIcon size={20} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn-icon"
            onClick={handleToday}
            style={{ width: 'auto', padding: '0 0.75rem', fontSize: '0.8rem', fontWeight: 600 }}
          >
            Today
          </button>
          <button className="btn-icon" onClick={handlePrevMonth} title="Previous Month">
            <ChevronLeft size={16} />
          </button>
          <button className="btn-icon" onClick={handleNextMonth} title="Next Month">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="calendar-grid" style={{ marginBottom: '0.5rem' }}>
        {weekDays.map((wd) => (
          <div key={wd} className="calendar-day-header">
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Cells */}
      <div className="calendar-grid">
        {days.map((day) => {
          const formatted = format(day, 'yyyy-MM-dd');
          const isCurrMonth = isSameMonth(day, monthStart);
          const isCurrentToday = isSameDay(day, new Date());

          const dayTasks = tasks.filter((t) => {
            if (!t.due_date) return false;
            try {
              return isSameDay(parseISO(t.due_date), day);
            } catch {
              return false;
            }
          });

          return (
            <div
              key={day.toString()}
              className={`calendar-cell ${isCurrentToday ? 'today' : ''}`}
              style={{
                opacity: isCurrMonth ? 1 : 0.4,
                cursor: 'pointer'
              }}
              onClick={() => handleDayClick(day)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: isCurrentToday ? 800 : 600,
                    color: isCurrentToday ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}
                >
                  {format(day, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', maxHeight: 80 }}>
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="calendar-task-chip"
                    style={{
                      borderLeftColor: `var(--priority-${t.priority})`,
                      textDecoration: t.status === 'completed' ? 'line-through' : 'none',
                      opacity: t.status === 'completed' ? 0.6 : 1
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTaskModal(t);
                    }}
                    title={t.title}
                  >
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
