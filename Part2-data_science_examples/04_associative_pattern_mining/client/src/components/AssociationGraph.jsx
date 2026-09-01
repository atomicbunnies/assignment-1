import React, { useState } from 'react';
import { Network, Sparkles, Info } from 'lucide-react';

export const AssociationGraph = ({ graphData = { nodes: [], links: [] } }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  const { nodes = [], links = [] } = graphData;

  // Filter links for hovered node
  const activeLinks = hoveredNode
    ? links.filter((l) => l.source === hoveredNode.id || l.target === hoveredNode.id)
    : links.slice(0, 35); // Default top 35 links for clarity

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Network size={18} style={{ color: 'var(--accent-amber-bright)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
            2D Association Network Graph
          </h3>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Nodes = Catalog Products • Edges = Rule Lift Multiplier
        </span>
      </div>

      <div style={{ position: 'relative', width: '100%', height: 440, background: 'rgba(5, 8, 17, 0.7)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 560 440">
          <defs>
            <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Association Edges */}
          {activeLinks.map((link, idx) => {
            const sourceNode = nodes.find((n) => n.id === link.source);
            const targetNode = nodes.find((n) => n.id === link.target);
            if (!sourceNode || !targetNode) return null;

            const isHovered = hoveredNode && (link.source === hoveredNode.id || link.target === hoveredNode.id);
            const strokeWidth = Math.min(4.5, Math.max(1.0, (link.lift - 1.0) * 1.1));

            return (
              <line
                key={`link-${idx}`}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isHovered ? '#fbbf24' : 'rgba(245, 158, 11, 0.35)'}
                strokeWidth={isHovered ? strokeWidth + 1.5 : strokeWidth}
                strokeDasharray={isHovered ? 'none' : '4,2'}
                style={{ transition: 'all 0.2s ease' }}
              />
            );
          })}

          {/* Product Nodes */}
          {nodes.map((node) => {
            const isHovered = hoveredNode?.id === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  r={isHovered ? 14 : 10}
                  fill={node.color || '#10b981'}
                  stroke={isHovered ? '#fff' : 'rgba(255,255,255,0.4)'}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  style={{
                    transition: 'all 0.2s ease',
                    filter: isHovered ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.8))' : 'none'
                  }}
                />
                <text
                  y={isHovered ? -18 : -14}
                  textAnchor="middle"
                  fill={isHovered ? '#fff' : 'var(--text-secondary)'}
                  fontSize={isHovered ? 11 : 9.5}
                  fontWeight={isHovered ? 800 : 600}
                  style={{ pointerEvents: 'none', transition: 'all 0.2s ease' }}
                >
                  {node.name.length > 16 ? node.name.slice(0, 14) + '...' : node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered Node Tooltip Overlay */}
        {hoveredNode && (
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              background: 'rgba(12, 17, 34, 0.95)',
              border: '1px solid var(--border-active)',
              padding: '0.65rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-glow-amber)',
              maxWidth: 280
            }}
          >
            <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem' }}>{hoveredNode.name}</div>
            <div style={{ fontSize: '0.74rem', color: hoveredNode.color, fontWeight: 700 }}>
              {hoveredNode.dept} • ${hoveredNode.price?.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Base Transaction Frequency: {(hoveredNode.support * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
