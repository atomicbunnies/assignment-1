import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SkillExplorer } from './components/SkillExplorer';
import { TitanicClassifierView } from './components/TitanicClassifierView';
import { HousePricesView } from './components/HousePricesView';
import { FraudDetectionView } from './components/FraudDetectionView';
import { EcommerceAnalyticsView } from './components/EcommerceAnalyticsView';
import { DataQualityAuditView } from './components/DataQualityAuditView';
import { CrispDmReportModal } from './components/CrispDmReportModal';
import { api } from './utils/api';

export function App() {
  const [activeTab, setActiveTab] = useState('skills');
  const [isCrispDmOpen, setIsCrispDmOpen] = useState(false);

  const [skills, setSkills] = useState([]);
  const [titanicData, setTitanicData] = useState({});
  const [houseData, setHouseData] = useState({});
  const [fraudData, setFraudData] = useState({});
  const [ecommerceData, setEcommerceData] = useState({});
  const [qualityData, setQualityData] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, tRes, hRes, fRes, eRes, qRes] = await Promise.all([
          api.getSkillsCatalog(),
          api.getTitanicBenchmark(),
          api.getHousePricesBenchmark(),
          api.getFraudBenchmark(),
          api.getEcommerceBenchmark(),
          api.getDataQualityBenchmark()
        ]);

        if (catRes.success) setSkills(catRes.skills);
        if (tRes.success) setTitanicData(tRes.data);
        if (hRes.success) setHouseData(hRes.data);
        if (fRes.success) setFraudData(fRes.data);
        if (eRes.success) setEcommerceData(eRes.data);
        if (qRes.success) setQualityData(qRes.data);
      } catch (err) {
        console.error('Failed to load initial benchmark data:', err);
      }
    }
    loadData();
  }, []);

  const handleNavigateToBenchmark = (benchmarkKey) => {
    setActiveTab(benchmarkKey);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCrispDm={() => setIsCrispDmOpen(true)}
        totalSkills={46}
      />

      <main className="main-content">
        {activeTab === 'skills' && (
          <SkillExplorer
            skills={skills}
            onNavigateToBenchmark={handleNavigateToBenchmark}
          />
        )}
        {activeTab === 'titanic' && (
          <TitanicClassifierView data={titanicData} />
        )}
        {activeTab === 'house' && (
          <HousePricesView data={houseData} />
        )}
        {activeTab === 'fraud' && (
          <FraudDetectionView data={fraudData} />
        )}
        {activeTab === 'ecommerce' && (
          <EcommerceAnalyticsView data={ecommerceData} />
        )}
        {activeTab === 'quality' && (
          <DataQualityAuditView data={qualityData} />
        )}
      </main>

      <CrispDmReportModal
        isOpen={isCrispDmOpen}
        onClose={() => setIsCrispDmOpen(false)}
      />
    </div>
  );
}

export default App;
