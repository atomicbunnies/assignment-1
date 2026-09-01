import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BasketRecommender } from './components/BasketRecommender';
import { AdminDashboard } from './components/AdminDashboard';
import { CrispDmReportModal } from './components/CrispDmReportModal';
import { RetrainModal } from './components/RetrainModal';
import { api } from './utils/api';

export function App() {
  const [activeTab, setActiveTab] = useState('explorer');
  const [showCrispDm, setShowCrispDm] = useState(false);
  const [showRetrain, setShowRetrain] = useState(false);

  const [health, setHealth] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [benchmarksData, setBenchmarksData] = useState({});
  const [rules, setRules] = useState([]);
  const [historyData, setHistoryData] = useState({});

  const loadAllData = async () => {
    try {
      const [hRes, catRes, gRes, bRes, rRes, histRes] = await Promise.all([
        api.getHealth(),
        api.getCatalog(),
        api.getNetworkGraph(),
        api.getBenchmarks(),
        api.getTopRules(60),
        api.getAutoResearchHistory()
      ]);

      if (hRes) setHealth(hRes);
      if (catRes.success) setCatalog(catRes.products);
      if (gRes.success) setGraphData(gRes.graph);
      if (bRes.success) setBenchmarksData(bRes.data);
      if (rRes.success) setRules(rRes.rules);
      if (histRes.success) setHistoryData(histRes.data);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCrispDm={() => setShowCrispDm(true)}
        onOpenRetrain={() => setShowRetrain(true)}
        health={health}
      />

      <main className="main-content">
        {activeTab === 'explorer' && (
          <BasketRecommender catalog={catalog} graphData={graphData} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            benchmarksData={benchmarksData}
            historyData={historyData}
            rules={rules}
            onRefresh={loadAllData}
          />
        )}
      </main>

      {/* Modals */}
      {showCrispDm && (
        <CrispDmReportModal onClose={() => setShowCrispDm(false)} />
      )}

      {showRetrain && (
        <RetrainModal
          onClose={() => setShowRetrain(false)}
          onRetrainSuccess={loadAllData}
        />
      )}
    </div>
  );
}

export default App;
