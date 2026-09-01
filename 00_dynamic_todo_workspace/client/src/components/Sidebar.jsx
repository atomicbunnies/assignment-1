import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Star,
  Inbox,
  FolderPlus,
  Tag as TagIcon,
  Archive,
  Trash2,
  Volume2,
  VolumeX,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  User,
  Code,
  HeartPulse,
  DollarSign,
  Layers
} from 'lucide-react';

const CATEGORY_ICONS = {
  Briefcase: Briefcase,
  User: User,
  Code: Code,
  HeartPulse: HeartPulse,
  DollarSign: DollarSign,
  Folder: Layers
};

export const Sidebar = () => {
  const {
    tasks,
    allTasks,
    categories,
    tags,
    activeFilter,
    setActiveFilter,
    setIsShortcutsOpen,
    setIsTagsModalOpen,
    createCategory,
    isSidebarOpen,
    setIsSidebarOpen
  } = useTasks();

  const { isSoundMuted, toggleSound } = useTheme();
  const [newCatName, setNewCatName] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);

  // Compute counts for smart lists
  const counts = {
    all: allTasks.filter((t) => !t.is_deleted && !t.is_archived).length,
    today: allTasks.filter((t) => !t.is_deleted && !t.is_archived && t.due_date === new Date().toISOString().split('T')[0]).length,
    upcoming: allTasks.filter((t) => !t.is_deleted && !t.is_archived && t.due_date && t.due_date > new Date().toISOString().split('T')[0]).length,
    important: allTasks.filter((t) => !t.is_deleted && !t.is_archived && (t.priority === 'urgent' || t.priority === 'high')).length,
    completed: allTasks.filter((t) => !t.is_deleted && t.status === 'completed').length,
    archived: allTasks.filter((t) => t.is_archived && !t.is_deleted).length,
    trash: allTasks.filter((t) => t.is_deleted).length
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const colors = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    await createCategory({ name: newCatName.trim(), icon: 'Folder', color: randomColor });
    setNewCatName('');
    setShowNewCatInput(false);
  };

  return (
    <aside className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <CheckCircle2 size={20} strokeWidth={2.5} />
          </div>
          {isSidebarOpen && <span>Zenith Task</span>}
        </div>
        <button
          className="btn-icon"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ width: 28, height: 28 }}
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-content">
        {/* Smart Lists */}
        <div className="nav-section">
          <div className="section-label">
            {isSidebarOpen ? <span>Focus Lists</span> : <span>•••</span>}
          </div>

          <div
            className={`nav-item ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
            title="All Active Tasks"
          >
            <div className="nav-item-left">
              <Inbox size={18} />
              {isSidebarOpen && <span>All Tasks</span>}
            </div>
            {isSidebarOpen && counts.all > 0 && <span className="nav-badge">{counts.all}</span>}
          </div>

          <div
            className={`nav-item ${activeFilter === 'today' ? 'active' : ''}`}
            onClick={() => setActiveFilter('today')}
            title="Tasks Due Today"
          >
            <div className="nav-item-left">
              <Calendar size={18} style={{ color: '#f59e0b' }} />
              {isSidebarOpen && <span>Today</span>}
            </div>
            {isSidebarOpen && counts.today > 0 && <span className="nav-badge">{counts.today}</span>}
          </div>

          <div
            className={`nav-item ${activeFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveFilter('upcoming')}
            title="Upcoming Deadlines"
          >
            <div className="nav-item-left">
              <Clock size={18} style={{ color: '#06b6d4' }} />
              {isSidebarOpen && <span>Upcoming</span>}
            </div>
            {isSidebarOpen && counts.upcoming > 0 && <span className="nav-badge">{counts.upcoming}</span>}
          </div>

          <div
            className={`nav-item ${activeFilter === 'important' ? 'active' : ''}`}
            onClick={() => setActiveFilter('important')}
            title="High & Urgent Priority"
          >
            <div className="nav-item-left">
              <Star size={18} style={{ color: '#ef4444' }} />
              {isSidebarOpen && <span>Important</span>}
            </div>
            {isSidebarOpen && counts.important > 0 && <span className="nav-badge">{counts.important}</span>}
          </div>

          <div
            className={`nav-item ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
            title="Completed Tasks"
          >
            <div className="nav-item-left">
              <CheckCircle2 size={18} style={{ color: '#10b981' }} />
              {isSidebarOpen && <span>Completed</span>}
            </div>
            {isSidebarOpen && counts.completed > 0 && <span className="nav-badge">{counts.completed}</span>}
          </div>
        </div>

        {/* Categories Section */}
        <div className="nav-section">
          <div className="section-label">
            {isSidebarOpen ? (
              <>
                <span>Categories</span>
                <button
                  className="btn-icon"
                  style={{ width: 22, height: 22 }}
                  title="Add Category"
                  onClick={() => setShowNewCatInput(!showNewCatInput)}
                >
                  <FolderPlus size={14} />
                </button>
              </>
            ) : (
              <span>•••</span>
            )}
          </div>

          {showNewCatInput && isSidebarOpen && (
            <form onSubmit={handleCreateCategory} style={{ padding: '0 0.5rem 0.5rem' }}>
              <input
                type="text"
                autoFocus
                placeholder="Category name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.8rem'
                }}
              />
            </form>
          )}

          {categories.map((cat) => {
            const IconComponent = CATEGORY_ICONS[cat.icon] || Layers;
            const filterKey = `cat-${cat.id}`;
            const isSelected = activeFilter === filterKey;

            return (
              <div
                key={cat.id}
                className={`nav-item ${isSelected ? 'active' : ''}`}
                onClick={() => setActiveFilter(filterKey)}
                title={cat.name}
              >
                <div className="nav-item-left">
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cat.color || 'var(--accent-primary)'
                    }}
                  >
                    <IconComponent size={16} />
                  </div>
                  {isSidebarOpen && <span>{cat.name}</span>}
                </div>
                {isSidebarOpen && cat.task_count > 0 && (
                  <span className="nav-badge">{cat.task_count}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Tags Section */}
        {isSidebarOpen && (
          <div className="nav-section">
            <div className="section-label">
              <span>Tags</span>
              <button
                className="btn-icon"
                style={{ width: 22, height: 22 }}
                title="Manage Tags"
                onClick={() => setIsTagsModalOpen(true)}
              >
                <TagIcon size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.25rem 0.5rem' }}>
              {tags.map((tag) => {
                const tagFilter = `tag-${tag.id}`;
                const isSelected = activeFilter === tagFilter;
                return (
                  <button
                    key={tag.id}
                    onClick={() => setActiveFilter(isSelected ? 'all' : tagFilter)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      background: isSelected ? tag.color : 'var(--bg-elevated)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      border: `1px solid ${isSelected ? tag.color : 'var(--border-subtle)'}`,
                      fontWeight: 500,
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: isSelected ? '#fff' : tag.color }} />
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Trash & Archive */}
        <div className="nav-section" style={{ marginTop: 'auto' }}>
          <div
            className={`nav-item ${activeFilter === 'archived' ? 'active' : ''}`}
            onClick={() => setActiveFilter('archived')}
            title="Archived Tasks"
          >
            <div className="nav-item-left">
              <Archive size={16} />
              {isSidebarOpen && <span>Archive</span>}
            </div>
            {isSidebarOpen && counts.archived > 0 && <span className="nav-badge">{counts.archived}</span>}
          </div>

          <div
            className={`nav-item ${activeFilter === 'trash' ? 'active' : ''}`}
            onClick={() => setActiveFilter('trash')}
            title="Trash Bin"
          >
            <div className="nav-item-left">
              <Trash2 size={16} style={{ color: '#ef4444' }} />
              {isSidebarOpen && <span>Trash</span>}
            </div>
            {isSidebarOpen && counts.trash > 0 && <span className="nav-badge">{counts.trash}</span>}
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            className="btn-icon"
            onClick={toggleSound}
            title={isSoundMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {isSoundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {isSidebarOpen && (
            <button
              className="btn-icon"
              onClick={() => setIsShortcutsOpen(true)}
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
