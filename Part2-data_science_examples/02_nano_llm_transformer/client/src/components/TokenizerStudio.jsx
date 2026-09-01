import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  FileCode,
  Sparkles,
  BarChart2,
  Tag,
  Search,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

const TOKEN_COLORS = [
  'rgba(6, 182, 212, 0.2)',
  'rgba(168, 85, 247, 0.2)',
  'rgba(16, 185, 129, 0.2)',
  'rgba(245, 158, 11, 0.2)',
  'rgba(244, 63, 94, 0.2)',
  'rgba(56, 189, 248, 0.2)'
];

const TOKEN_BORDERS = [
  '#06b6d4',
  '#a855f7',
  '#10b981',
  '#f59e0b',
  '#f43f5e',
  '#38bdf8'
];

export const TokenizerStudio = () => {
  const [text, setText] = useState('Hello! Who are you and how do Rotary Position Embeddings work in NanoLlama?');
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTokenize = async (val) => {
    try {
      setLoading(true);
      const res = await api.tokenizeText(val || text);
      if (res.success) {
        setTokenData(res.data);
      }
    } catch (err) {
      console.error('Failed to tokenize:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenize(text);
  }, []);

  const tokens = tokenData?.tokens || [];
  const topPredictions = tokenData?.top_predictions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FileCode size={22} style={{ color: 'var(--accent-cyan)' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Tokenizer & Subword Studio</h3>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Interactive subword segmenter, vocabulary lookup, and next-token probability distribution
        </p>
      </div>

      {/* Input Area */}
      <div className="controls-card">
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Input Text to Tokenize & Inspect
        </label>
        <textarea
          rows="3"
          className="chat-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            fetchTokenize(e.target.value);
          }}
          placeholder="Type any sentence or Python code snippet..."
          style={{ width: '100%', resize: 'vertical' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Total Tokens: <strong style={{ color: 'var(--accent-cyan-bright)' }}>{tokenData?.total_tokens || 0}</strong></span>
          <span>Character Length: <strong>{text.length}</strong></span>
          <span>Compression Ratio: <strong>{text.length ? (text.length / Math.max(1, tokens.length)).toFixed(2) : '0'} chars/token</strong></span>
        </div>
      </div>

      {/* Subword Visualization Chips */}
      <div className="controls-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Tag size={15} style={{ color: 'var(--accent-purple)' }} />
            <span>Tokenized Subword Stream</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hover or click token to view ID</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.75rem 0' }}>
          {tokens.map((t, idx) => {
            const colorIdx = idx % TOKEN_COLORS.length;
            return (
              <div
                key={idx}
                className="token-chip"
                style={{
                  background: TOKEN_COLORS[colorIdx],
                  borderColor: TOKEN_BORDERS[colorIdx]
                }}
              >
                <span style={{ fontWeight: 600, color: '#fff' }}>
                  {t.text === ' ' ? '␣' : t.text === '\n' ? '↵' : t.text}
                </span>
                <span className="token-id" style={{ color: 'var(--text-muted)' }}>
                  #{t.id}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Token Probability Distribution & Special Tokens */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Top 5 Next Token Probabilities */}
        <div className="controls-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <BarChart2 size={15} style={{ color: 'var(--accent-emerald)' }} />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Top-5 Next Token Probabilities</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
            {topPredictions.map((pred, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    "{pred.text === ' ' ? '␣' : pred.text === '\n' ? '↵' : pred.text}" (Token #{pred.token_id})
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    {pred.probability}%
                  </span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pred.probability}%`,
                      background: 'linear-gradient(to right, var(--accent-cyan), var(--accent-emerald))',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Chat Template Tokens */}
        <div className="controls-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <BookOpen size={15} style={{ color: 'var(--accent-amber)' }} />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Special Chat Template Tokens</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[
              { token: '<|system|>', id: 5, desc: 'Delimits system instruction and persona prompt' },
              { token: '<|user|>', id: 3, desc: 'Delimits user query and message boundary' },
              { token: '<|assistant|>', id: 4, desc: 'Signals start of model response generation' },
              { token: '<|eos|>', id: 2, desc: 'End-of-sequence delimiter (stops generation)' },
              { token: '<|bos|>', id: 1, desc: 'Beginning-of-sequence delimiter' },
              { token: '<|pad|>', id: 0, desc: 'Batch padding token' }
            ].map((st) => (
              <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)', padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan-bright)', fontSize: '0.78rem' }}>
                  {st.token}
                </code>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{st.desc}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-purple)' }}>ID #{st.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
