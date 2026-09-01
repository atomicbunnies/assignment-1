import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ListView } from './components/ListView';
import { KanbanView } from './components/KanbanView';
import { EisenhowerMatrix } from './components/EisenhowerMatrix';
import { CalendarView } from './components/CalendarView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { CommandPalette } from './components/CommandPalette';
import { ShortcutsModal } from './components/ShortcutsModal';
import { TagsModal } from './components/TagsModal';
import { BatchActionBar } from './components/BatchActionBar';

const MainContent = () => {
  const { activeView } = useTasks();

  return (
    <main className="workspace-content">
      {activeView === 'list' && <ListView />}
      {activeView === 'kanban' && <KanbanView />}
      {activeView === 'matrix' && <EisenhowerMatrix />}
      {activeView === 'calendar' && <CalendarView />}
      {activeView === 'analytics' && <AnalyticsDashboard />}

      {/* Modals & Overlays */}
      <TaskDetailModal />
      <CommandPalette />
      <ShortcutsModal />
      <TagsModal />
      <BatchActionBar />
    </main>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <div className="app-container">
          <Sidebar />
          <div className="main-wrapper">
            <Header />
            <MainContent />
          </div>
        </div>
      </TaskProvider>
    </ThemeProvider>
  );
}

export default App;
