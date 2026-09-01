import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import { Header } from './components/Header';
import { ClusterExplorer } from './components/ClusterExplorer';
import { AdminDashboard } from './components/AdminDashboard';
import { CrispDmReportModal } from './components/CrispDmReportModal';
import { RetrainModal } from './components/RetrainModal';

export function App() {
  const [activeView, setActiveView] = useState('explorer'); // 'explorer' or 'admin'
  const [profiles, setProfiles] = useState({});
  const [isCrispDmOpen, setIsCrispDmOpen] = useState(false);
  const [isRetrainOpen, setIsRetrainOpen] = useState(false);

  const loadProfiles = async () => {
    try {
      const res = await api.getClustersSummary();
      if (res.success) {
        setProfiles(res.profiles);
      }
    } catch (err) {
      console.error('Failed to load cluster profiles:', err);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  return (
    <div className="app-container">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCrispDm={() => setIsCrispDmOpen(true)}
        onOpenRetrain={() => setIsRetrainOpen(true)}
      />

      <main className="main-content">
        {activeView === 'explorer' && (
          <ClusterExplorer profiles={profiles} />
        )}

        {activeView === 'admin' && (
          <AdminDashboard profiles={profiles} />
        )}
      </main>

      {/* Global Modals */}
      <CrispDmReportModal
        isOpen={isCrispDmOpen}
        onClose={() => setIsCrispDmOpen(false)}
      />

      <RetrainModal
        isOpen={isRetrainOpen}
        onClose={() => setIsRetrainOpen(false)}
        onRetrained={loadProfiles}
      />
    </div>
  );
}

export default App;
