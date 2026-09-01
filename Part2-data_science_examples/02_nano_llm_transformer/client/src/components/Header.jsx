import React from 'react';
import {
  Cpu,
  MessageSquare,
  Eye,
  FileCode,
  LineChart,
  Layers,
  Sparkles,
  RefreshCw,
  Zap
} from 'lucide-react';

export const Header = ({ activeTab, setActiveTab, onOpenRetrain, isStreaming }) => {
  return (
    <header className="header">
      <div className="brand-container">
        <div className="logo-icon">
          <Zap size={22} />
        </div>
        <div>
          <h1 className="brand-title">NanoLlama</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-emerald)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-emerald)' }} />
              SOTA Primitives
            </span>
            <span>•</span>
            <span>RoPE + SwiGLU + RMSNorm</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={15} />
          <span>Interactive Chat</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'attention' ? 'active' : ''}`}
          onClick={() => setActiveTab('attention')}
        >
          <Eye size={15} />
          <span>Attention Heatmaps</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'tokenizer' ? 'active' : ''}`}
          onClick={() => setActiveTab('tokenizer')}
        >
          <FileCode size={15} />
          <span>Tokenizer Studio</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
        >
          <LineChart size={15} />
          <span>Training & Loss</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'blueprint' ? 'active' : ''}`}
          onClick={() => setActiveTab('blueprint')}
        >
          <Layers size={15} />
          <span>Architecture</span>
        </button>
      </nav>

      {/* Right Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-tertiary)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <Cpu size={13} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ color: 'var(--accent-cyan-bright)' }}>KV-Cache:</span>
          <span style={{ color: 'var(--accent-emerald)' }}>Active (O(1))</span>
        </div>

        <button
          className="btn-send"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
          onClick={onOpenRetrain}
        >
          <RefreshCw size={13} />
          <span>Retrain Studio</span>
        </button>
      </div>
    </header>
  );
};
