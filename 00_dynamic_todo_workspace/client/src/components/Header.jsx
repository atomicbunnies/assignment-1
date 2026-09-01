import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import {
  Search,
  ListFilter,
  Kanban,
  Grid,
  Calendar,
  BarChart3,
  Sun,
  Moon,
  Command,
  Palette,
  Timer
} from 'lucide-react';
import { PomodoroModal } from './PomodoroTimer';

export const Header = () => {
  const {
    searchQuery,
    setSearchQuery,
    activeView,
    setActiveView,
    setIsCommandPaletteOpen
  } = useTasks();

  const { theme, toggleTheme, accent, changeAccent } = useTheme();
  const [showAccentMenu, setShowAccentMenu] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);

  const accents = [
    { id: 'indigo', name: 'Indigo / Violet', color: '#6366f1' },
    { id: 'cyan', name: 'Cyber Cyan', color: '#06b6d4' },
    { id: 'emerald', name: 'Emerald Zen', color: '#10b981' },
    { id: 'amber', name: 'Sunset Amber', color: '#f59e0b' },
    { id: 'rose', name: 'Crimson Rose', color: '#f43f5e' }
  ];

  return (
    <>
      <header className="header">
        <div className="header-left">
          <div className="search-box">
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              id="global-search-input"
              type="text"
              className="search-input"
              placeholder="Search tasks, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-kbd">/</span>
          </div>
        </div>

        <div className="header-right">
          {/* View Switcher */}
          <div className="view-tabs">
            <button
              className={`view-tab-btn ${activeView === 'list' ? 'active' : ''}`}
              onClick={() => setActiveView('list')}
              title="List View"
            >
              <ListFilter size={15} />
              <span>List</span>
            </button>
            <button
              className={`view-tab-btn ${activeView === 'kanban' ? 'active' : ''}`}
              onClick={() => setActiveView('kanban')}
              title="Kanban Board"
            >
              <Kanban size={15} />
              <span>Board</span>
            </button>
            <button
              className={`view-tab-btn ${activeView === 'matrix' ? 'active' : ''}`}
              onClick={() => setActiveView('matrix')}
              title="Eisenhower Matrix"
            >
              <Grid size={15} />
              <span>Matrix</span>
            </button>
            <button
              className={`view-tab-btn ${activeView === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveView('calendar')}
              title="Calendar Timeline"
            >
              <Calendar size={15} />
              <span>Calendar</span>
            </button>
            <button
              className={`view-tab-btn ${activeView === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveView('analytics')}
              title="Productivity Analytics"
            >
              <BarChart3 size={15} />
              <span>Analytics</span>
            </button>
          </div>

          {/* Pomodoro Quick Launcher */}
          <button
            className="pomodoro-pill"
            onClick={() => setIsPomodoroOpen(true)}
            title="Open Pomodoro Focus Timer"
          >
            <Timer size={15} style={{ color: 'var(--accent-primary)' }} />
            <span>Focus</span>
          </button>

          {/* Command Palette Trigger */}
          <button
            className="btn-icon"
            onClick={() => setIsCommandPaletteOpen(true)}
            title="Command Palette (Ctrl+K)"
          >
            <Command size={16} />
          </button>

          {/* Accent Color Picker Popover */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn-icon"
              onClick={() => setShowAccentMenu(!showAccentMenu)}
              title="Change Accent Color"
            >
              <Palette size={16} style={{ color: 'var(--accent-primary)' }} />
            </button>
            {showAccentMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem',
                  display: 'flex',
                  gap: '0.4rem',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 100
                }}
              >
                {accents.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      changeAccent(acc.id);
                      setShowAccentMenu(false);
                    }}
                    title={acc.name}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: acc.color,
                      border: accent === acc.id ? '2px solid #ffffff' : 'none',
                      boxShadow: accent === acc.id ? '0 0 8px ' + acc.color : 'none',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Dark / Light Toggle */}
          <button
            className="btn-icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {isPomodoroOpen && (
        <PomodoroModal onClose={() => setIsPomodoroOpen(false)} />
      )}
    </>
  );
};
