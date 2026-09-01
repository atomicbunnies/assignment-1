import React, { useState, useEffect, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import {
  Search,
  Plus,
  ListFilter,
  Kanban,
  Grid,
  Calendar,
  BarChart3,
  Sun,
  Moon,
  Tag,
  CheckCircle,
  X,
  Palette
} from 'lucide-react';

export const CommandPalette = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    tasks,
    setActiveTaskModal,
    setActiveView,
    setActiveFilter,
    categories
  } = useTasks();

  const { theme, toggleTheme, changeAccent } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define static commands
  const staticCommands = [
    {
      id: 'view-list',
      title: 'Switch to List View',
      category: 'Views',
      icon: ListFilter,
      action: () => setActiveView('list')
    },
    {
      id: 'view-kanban',
      title: 'Switch to Kanban Board',
      category: 'Views',
      icon: Kanban,
      action: () => setActiveView('kanban')
    },
    {
      id: 'view-matrix',
      title: 'Switch to Eisenhower Matrix',
      category: 'Views',
      icon: Grid,
      action: () => setActiveView('matrix')
    },
    {
      id: 'view-calendar',
      title: 'Switch to Calendar Timeline',
      category: 'Views',
      icon: Calendar,
      action: () => setActiveView('calendar')
    },
    {
      id: 'view-analytics',
      title: 'Switch to Analytics Dashboard',
      category: 'Views',
      icon: BarChart3,
      action: () => setActiveView('analytics')
    },
    {
      id: 'theme-toggle',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Appearance',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme()
    },
    {
      id: 'accent-cyan',
      title: 'Set Accent: Cyber Cyan',
      category: 'Appearance',
      icon: Palette,
      action: () => changeAccent('cyan')
    },
    {
      id: 'accent-emerald',
      title: 'Set Accent: Emerald Zen',
      category: 'Appearance',
      icon: Palette,
      action: () => changeAccent('emerald')
    },
    {
      id: 'accent-amber',
      title: 'Set Accent: Sunset Amber',
      category: 'Appearance',
      icon: Palette,
      action: () => changeAccent('amber')
    },
    {
      id: 'accent-rose',
      title: 'Set Accent: Crimson Rose',
      category: 'Appearance',
      icon: Palette,
      action: () => changeAccent('rose')
    }
  ];

  // Dynamic commands from tasks and categories
  const filteredCommands = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return staticCommands;

    const matchedStatic = staticCommands.filter((c) =>
      c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );

    const matchedTasks = tasks
      .filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
      .slice(0, 5)
      .map((t) => ({
        id: `task-${t.id}`,
        title: `Open: "${t.title}"`,
        category: 'Tasks',
        icon: CheckCircle,
        action: () => setActiveTaskModal(t)
      }));

    const matchedCategories = categories
      .filter((c) => c.name.toLowerCase().includes(q))
      .map((c) => ({
        id: `cat-${c.id}`,
        title: `Filter by Category: "${c.name}"`,
        category: 'Categories',
        icon: Tag,
        action: () => setActiveFilter(`cat-${c.id}`)
      }));

    return [...matchedStatic, ...matchedTasks, ...matchedCategories];
  }, [query, staticCommands, tasks, categories, setActiveTaskModal, setActiveFilter]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        selected.action();
        setIsCommandPaletteOpen(false);
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsCommandPaletteOpen(false)}>
      <div
        className="modal-card"
        style={{ maxWidth: 580 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-medium)'
          }}
        >
          <Search size={18} style={{ color: 'var(--accent-primary)' }} />
          <input
            type="text"
            autoFocus
            className="search-input"
            placeholder="Type a command or search tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ fontSize: '1rem', width: '100%' }}
          />
          <span className="search-kbd">ESC</span>
        </div>

        {/* Commands List */}
        <div style={{ maxHeight: 340, overflowY: 'auto', padding: '0.5rem' }}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No commands or tasks found matching "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isHighlighted = idx === selectedIndex;

              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setIsCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: isHighlighted ? 'var(--accent-subtle)' : 'transparent',
                    color: isHighlighted ? 'var(--accent-text)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={16} style={{ color: isHighlighted ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{cmd.title}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--text-muted)',
                      background: 'var(--bg-elevated)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {cmd.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
