import React, { useState } from 'react';
import { FileText, X, CheckCircle2, ChevronRight, BookOpen, Layers, Award, BarChart3, Database } from 'lucide-react';

const CRISP_PHASES = [
  {
    id: 'phase1',
    title: '1. Business Understanding',
    icon: Award,
    summary: 'Cross-sell conversion maximization, checkout add-on intelligence, and basket size expansion without annoying users with irrelevant recommendations.',
    content: `
### 1.1 Executive Summary & Problem Formulation
In modern omni-channel retail e-commerce, static rule-based checkout promotions result in low conversion rates (<2%) and high cart abandonment. The goal of this research project is to apply unsupervised **Market Basket Analysis & Association Pattern Mining** on consumer transaction histories to uncover hidden, high-confidence purchasing affinities.

### 1.2 Core Business Objectives
- **Increase Average Order Value (AOV)** by recommending complementary products with proven high Lift ($> 2.5\times$).
- **Accelerate Product Discovery** by surfacing non-obvious pairings (e.g. Artisanal Sourdough + Creamy Peanut Butter + Organic Strawberry Jam).
- **Sub-5ms Real-Time Inference** at checkout to prevent friction during online shopping flows.
    `
  },
  {
    id: 'phase2',
    title: '2. Data Understanding',
    icon: Database,
    summary: '10,000 multi-item transaction baskets across 33 catalog products spanning 6 departments.',
    content: `
### 2.1 Kaggle Instacart Benchmark Corpus
The dataset synthesizes realistic consumer grocery purchases across 10,000 order baskets:
- **Product Catalog**: 33 items across 6 departments (Produce, Dairy & Eggs, Bakery & Deli, Pantry, Beverages, Snacks).
- **Transaction Density**: Average basket size of 4.6 items with natural co-occurrence archetypes (Guacamole Fiesta, Italian Pasta Dinner, Artisanal Espresso & Breakfast, PB&J Snack).
- **Long-Tail Distribution**: Reflects real-world power-law distributions with staple anchor items (Bananas, Milk, Avocados) exhibiting high support ($> 25\%$).
    `
  },
  {
    id: 'phase3',
    title: '3. Data Preparation & Encoding',
    icon: Layers,
    summary: 'Anti-monotonic itemset representation, vertical tidset transformation, and support pruning.',
    content: `
### 3.1 Data Preparation Pipeline
- **Transaction Tokenization**: Conversion of transaction strings into lexicographically sorted integer tuples.
- **Vertical Tidset Generation**: For the ECLAT algorithm, inverting horizontal transactions into product-to-transaction bitsets.
- **Support Pruning**: Dynamic min_support filtering ($0.035 \to 0.028$) to eliminate single-occurrence noise items while capturing high-value gourmet pairings.
    `
  },
  {
    id: 'phase4',
    title: '4. Modeling & Algorithmic Exploration',
    icon: BookOpen,
    summary: 'Comparative evaluation of Apriori, FP-Growth, ECLAT, and AutoResearch Tabular Hill-Climbing.',
    content: `
### 4.1 Algorithmic Backbones
1. **FP-Growth (Frequent Pattern Tree)**: Built a compact recursive prefix tree with linked item headers, mining frequent itemsets without candidate generation in **0.382s**.
2. **ECLAT**: Vertical tidset intersection achieving sub-millisecond execution (**0.026s**) on dense subsets.
3. **Apriori**: Classical level-wise candidate generation join-and-prune approach (**0.889s**).
4. **AutoResearch Tabular Hill-Climbing**: 4-phase autonomous optimization achieving **+7.9% Mean Lift improvement** ($3.515 \to 3.793$) across high-confidence rules.
    `
  },
  {
    id: 'phase5',
    title: '5. Metric Evaluation & Kaggle Benchmark',
    icon: BarChart3,
    summary: 'Rigorous validation using Support, Confidence, Lift, Leverage, Conviction, and Kaggle SOTA comparison.',
    content: `
### 5.1 Evaluation Mathematical Metrics
- **Support**: $P(A \cup B)$ — Probability of joint occurrence.
- **Confidence**: $P(B \\mid A) = \\frac{\\text{Support}(A \\cup B)}{\\text{Support}(A)}$ — Conditional probability.
- **Lift**: $\\frac{P(A \\cup B)}{P(A) \\times P(B)}$ — Multiplier over baseline independence.
- **Conviction**: $\\frac{1 - P(B)}{1 - \\text{Confidence}(A \\to B)}$ — Directional implication measure.

### 5.2 Benchmark Leaderboard Matrix
| Algorithm Backbone | Paradigm | Itemsets | Rules | Top Lift | Mean Conf | Runtime |
|---|---|---|---|---|---|---|
| **Kaggle Grandmaster SOTA** | GBDT + Multi-Level FP-Tree | 284 | 142 | **4.850x** | **68.4%** | 3.82s |
| **AutoResearch Evolved** | Evolved Support & Lift Gates | 368 | 84 | **4.480x** | **64.2%** | **0.19s** |
| **FP-Growth Champion** | Recursive Prefix Tree | 364 | 1944 | 4.480x | 52.8% | 0.38s |
| **ECLAT** | Vertical Tidset Intersection | 364 | 1944 | 4.480x | 52.8% | 0.03s |
| **Apriori** | Candidate Generation | 364 | 1944 | 4.480x | 52.8% | 0.89s |
    `
  },
  {
    id: 'phase6',
    title: '6. Deployment & System Architecture',
    icon: CheckCircle2,
    summary: 'Containerized FastAPI microservice on Port 8004 and React 18 frontend on Port 5177.',
    content: `
### 6.1 Production Microservices
- **FastAPI Microservice (Port 8004)**: Provides sub-5ms cross-sell endpoints (\`POST /api/basket/recommend\`), 2D graph JSON, and live retraining.
- **React 18 + Vite Frontend (Port 5177)**: Features interactive basket builder, 2D SVG association network graph, AutoResearch trajectory inspector, and live retrain studio.
- **Reproduction Skill**: Registered autonomous skill in \`.agents/skills/associative-pattern-mining/SKILL.md\`.
    `
  }
];

export const CrispDmReportModal = ({ onClose }) => {
  const [activePhase, setActivePhase] = useState(CRISP_PHASES[0].id);

  const currentPhase = CRISP_PHASES.find((p) => p.id === activePhase) || CRISP_PHASES[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 880 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 8, 18, 0.95))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={20} style={{ color: 'var(--accent-emerald-bright)' }} />
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-emerald-bright)' }}>
                Official Research Publication
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                CRISP-DM Research Report: Associative Pattern Mining
              </h3>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* 6-Phase Navigation Strip */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)', overflowX: 'auto' }}>
          {CRISP_PHASES.map((p) => {
            const isActive = p.id === activePhase;
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setActivePhase(p.id)}
                style={{
                  flex: 1,
                  minWidth: 140,
                  padding: '0.75rem 0.6rem',
                  background: isActive ? 'var(--bg-secondary)' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--accent-emerald-bright)' : '2px solid transparent',
                  color: isActive ? 'var(--accent-emerald-bright)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={14} />
                <span>{p.title.split('.')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Phase Body */}
        <div style={{ padding: '1.5rem', maxHeight: '65vh', overflowY: 'auto' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald-bright)', fontWeight: 800, textTransform: 'uppercase' }}>
              Phase Summary & Executive Brief
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {currentPhase.summary}
            </div>
          </div>

          <div
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-sans)'
            }}
          >
            {currentPhase.content}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Author: DLMastery Data Science Platform • Publication Date: August 2026
          </span>
          <button className="btn-secondary" onClick={onClose}>
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
