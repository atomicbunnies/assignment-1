import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { AttentionVisualizer } from './components/AttentionVisualizer';
import { TokenizerStudio } from './components/TokenizerStudio';
import { TrainingTelemetry } from './components/TrainingTelemetry';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { RetrainModal } from './components/RetrainModal';
import { api } from './utils/api';

export function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [isRetrainOpen, setIsRetrainOpen] = useState(false);
  const [presets, setPresets] = useState([]);

  const loadPresets = async () => {
    try {
      const res = await api.getPresets();
      if (res.success) {
        setPresets(res.presets);
      }
    } catch (err) {
      console.error('Failed to load presets:', err);
    }
  };

  useEffect(() => {
    loadPresets();
  }, []);

  return (
    <div className="app-root">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRetrain={() => setIsRetrainOpen(true)}
      />

      <main className="main-content">
        {activeTab === 'chat' && <ChatInterface presets={presets} />}
        {activeTab === 'attention' && <AttentionVisualizer />}
        {activeTab === 'tokenizer' && <TokenizerStudio />}
        {activeTab === 'telemetry' && <TrainingTelemetry />}
        {activeTab === 'blueprint' && <ArchitectureDiagram />}
      </main>

      <RetrainModal
        isOpen={isRetrainOpen}
        onClose={() => setIsRetrainOpen(false)}
        onTrainingComplete={() => {
          loadPresets();
        }}
      />
    </div>
  );
}

export default App;
