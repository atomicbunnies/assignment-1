import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, subscribeToEvents } from '../utils/api';
import { sound } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { isToday, parseISO, isAfter, startOfTomorrow } from 'date-fns';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Navigation & Filtering
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'today', 'upcoming', 'important', 'completed', 'archived', 'trash', 'cat-{id}', 'tag-{id}'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('list'); // 'list', 'kanban', 'matrix', 'calendar', 'analytics'
  const [sortBy, setSortBy] = useState('order_index');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Modals & UI States
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [activeTaskModal, setActiveTaskModal] = useState(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch initial & refreshed data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const isDeleted = activeFilter === 'trash';
      const isArchived = activeFilter === 'archived';

      let catParam = 'all';
      if (activeFilter.startsWith('cat-')) {
        catParam = activeFilter.replace('cat-', '');
      }

      let tagParam = 'all';
      if (activeFilter.startsWith('tag-')) {
        tagParam = activeFilter.replace('tag-', '');
      }

      const [tasksRes, catRes, tagRes, analyticsRes] = await Promise.all([
        api.getTasks({
          isDeleted,
          isArchived,
          categoryId: catParam,
          tagId: tagParam,
          search: searchQuery,
          sortBy,
          sortOrder
        }),
        api.getCategories(),
        api.getTags(),
        api.getAnalytics()
      ]);

      setTasks(tasksRes.tasks || []);
      setCategories(catRes.categories || []);
      setTags(tagRes.tags || []);
      setAnalytics(analyticsRes || null);
    } catch (err) {
      console.error('Error fetching task workspace data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time SSE listener
  useEffect(() => {
    const unsubscribe = subscribeToEvents((event) => {
      // Whenever another client or action triggers an update
      fetchData();
    });
    return () => unsubscribe();
  }, [fetchData]);

  // Keyboard shortcut listener for Ctrl+K, N, etc.
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command Palette (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Shortcuts Modal (?)
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
      // Quick search focus (/)
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        searchInput?.focus();
      }
      // Escape closes open modals
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsShortcutsOpen(false);
        setIsTagsModalOpen(false);
        setActiveTaskModal(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter tasks client-side for smart list views
  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'today') {
      if (!t.due_date) return false;
      try {
        return isToday(parseISO(t.due_date));
      } catch {
        return false;
      }
    }
    if (activeFilter === 'upcoming') {
      if (!t.due_date) return false;
      try {
        return isAfter(parseISO(t.due_date), startOfTomorrow());
      } catch {
        return false;
      }
    }
    if (activeFilter === 'important') {
      return t.priority === 'urgent' || t.priority === 'high';
    }
    if (activeFilter === 'completed') {
      return t.status === 'completed';
    }
    return true;
  });

  // Task Actions
  const createTask = async (taskData) => {
    sound.playClick();
    const res = await api.createTask(taskData);
    if (res.success) {
      setTasks((prev) => [res.task, ...prev]);
      fetchData();
      return res.task;
    }
  };

  const updateTask = async (id, taskData) => {
    sound.playClick();
    const res = await api.updateTask(id, taskData);
    if (res.success) {
      setTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
      if (activeTaskModal?.id === id) {
        setActiveTaskModal(res.task);
      }
      fetchData();
    }
  };

  const patchTask = async (id, partialData) => {
    const res = await api.patchTask(id, partialData);
    if (res.success) {
      setTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
      if (activeTaskModal?.id === id) {
        setActiveTaskModal(res.task);
      }
      fetchData();
    }
  };

  const toggleCompleteTask = async (task) => {
    const isNowCompleted = task.status !== 'completed';
    const newStatus = isNowCompleted ? 'completed' : 'todo';

    if (isNowCompleted) {
      sound.playCheckmark();
      triggerConfetti();
    } else {
      sound.playUncheck();
    }

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: newStatus, completed_at: isNowCompleted ? new Date().toISOString() : null } : t
      )
    );

    await api.patchTask(task.id, { status: newStatus });
    fetchData();
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    sound.playClick();
    await api.patchTask(taskId, { toggleSubtaskId: subtaskId });
    fetchData();
  };

  const deleteTask = async (id, permanent = false) => {
    sound.playTrash();
    await api.deleteTask(id, permanent);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTaskIds((prev) => prev.filter((item) => item !== id));
    if (activeTaskModal?.id === id) {
      setActiveTaskModal(null);
    }
    fetchData();
  };

  const batchAction = async (action, value = null) => {
    if (selectedTaskIds.length === 0) return;
    if (action === 'complete') {
      sound.playCheckmark();
      triggerConfetti();
    } else if (action === 'delete') {
      sound.playTrash();
    } else {
      sound.playClick();
    }

    await api.batchAction(action, selectedTaskIds, value);
    setSelectedTaskIds([]);
    fetchData();
  };

  const reorderTasks = async (items) => {
    await api.reorderTasks(items);
    fetchData();
  };

  const toggleSelectTask = (id) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const createCategory = async (catData) => {
    const res = await api.createCategory(catData);
    if (res.success) {
      setCategories((prev) => [...prev, res.category]);
      fetchData();
    }
  };

  const createTag = async (tagData) => {
    const res = await api.createTag(tagData);
    if (res.success) {
      setTags((prev) => [...prev, res.tag]);
      fetchData();
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks: filteredTasks,
        allTasks: tasks,
        categories,
        tags,
        analytics,
        loading,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        activeView,
        setActiveView,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        selectedTaskIds,
        setSelectedTaskIds,
        toggleSelectTask,
        selectAllFiltered,
        activeTaskModal,
        setActiveTaskModal,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isShortcutsOpen,
        setIsShortcutsOpen,
        isTagsModalOpen,
        setIsTagsModalOpen,
        isSidebarOpen,
        setIsSidebarOpen,
        createTask,
        updateTask,
        patchTask,
        toggleCompleteTask,
        toggleSubtask,
        deleteTask,
        batchAction,
        reorderTasks,
        createCategory,
        createTag,
        refreshData: fetchData
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};
