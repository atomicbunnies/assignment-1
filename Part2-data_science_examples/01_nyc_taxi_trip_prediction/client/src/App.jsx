import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import { Header } from './components/Header';
import { EstimatorView } from './components/EstimatorView';
import { AdminDashboard } from './components/AdminDashboard';
import { RetrainStudioModal } from './components/RetrainStudioModal';
import { CrispDmReportModal } from './components/CrispDmReportModal';

export function App() {
  const [activeTab, setActiveTab] = useState('estimator'); // 'estimator' or 'admin'
  const [overview, setOverview] = useState(null);
  const [isRetrainOpen, setIsRetrainOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const fetchOverview = async () => {
    try {
      const res = await api.getAdminOverview();
      if (res.success) {
        setOverview(res);
      }
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRetrain={() => setIsRetrainOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        metadata={overview?.metadata}
      />

      <main className="workspace">
        {activeTab === 'estimator' && <EstimatorView />}
        {activeTab === 'admin' && (
          <AdminDashboard
            overview={overview}
            onOpenRetrain={() => setIsRetrainOpen(true)}
          />
        )}
      </main>

      {/* Retraining Studio Modal */}
      <RetrainStudioModal
        isOpen={isRetrainOpen}
        onClose={() => setIsRetrainOpen(false)}
        onRetrainSuccess={(newMeta) => {
          fetchOverview();
        }}
      />

      {/* CRISP-DM Standard Research Report Modal */}
      <CrispDmReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}

export default App;
