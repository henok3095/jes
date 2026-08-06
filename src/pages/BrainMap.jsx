import { useCallback, useMemo } from 'react';
import {
  ReactFlow, MiniMap, Controls, Background, BackgroundVariant,
  useNodesState, useEdgesState, addEdge, Handle, Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMindStore } from '../store/useMindStore';
import { CATEGORY_COLORS, t } from '../lib/tokens';

// Override React Flow's white control buttons
const controlsStyle = `
  .react-flow__controls {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .react-flow__controls-button {
    background: #111 !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 7px !important;
    color: rgba(255,255,255,0.5) !important;
    fill: rgba(255,255,255,0.5) !important;
    width: 26px !important;
    height: 26px !important;
    padding: 5px !important;
    transition: background 0.12s, border-color 0.12s !important;
  }
  .react-flow__controls-button:hover {
    background: #1a1a1a !important;
    border-color: rgba(255,255,255,0.2) !important;
  }
  .react-flow__controls-button svg {
    fill: rgba(255,255,255,0.5) !important;
  }
  .react-flow__minimap {
    background: #0f0f0f !important;
    border: 1px solid rgba(255,255,255,0.07) !important;
    border-radius: 10px !important;
  }
`;

function ThoughtNode({ data }) {
  const navigate = useNavigate();
  const cat = CATEGORY_COLORS[data.category];

  return (
    <div
      onClick={() => navigate(`/thought/${data.id}`)}
      style={{
        minWidth: 130,
        maxWidth: 168,
        background: '#111',
        border: `1px solid rgba(255,255,255,0.09)`,
        borderRadius: 9,
        padding: '9px 11px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = cat?.dot + '70';
        e.currentTarget.style.background = '#161616';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
        e.currentTarget.style.background = '#111';
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: cat?.dot, border: 'none', width: 5, height: 5, left: -3 }}
      />
      {/* Category dot + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: cat?.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.02em' }}>
          {cat?.label}
        </span>
      </div>
      {/* Title */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.82)',
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {data.title}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: cat?.dot, border: 'none', width: 5, height: 5, right: -3 }}
      />
    </div>
  );
}

const nodeTypes = { thought: ThoughtNode };

function buildGraph(thoughts) {
  const nodes = [];
  const edges = [];
  const edgeSet = new Set();
  const categories = [...new Set(thoughts.map((th) => th.category))];

  thoughts.forEach((th, i) => {
    const catIdx = categories.indexOf(th.category);
    const samecat = thoughts.filter((x) => x.category === th.category);
    const samecatIdx = samecat.findIndex((x) => x.id === th.id);
    const angle = (catIdx / categories.length) * Math.PI * 2 + (samecatIdx / samecat.length) * (Math.PI * 2 / categories.length);
    const r = 200 + (i % 3) * 70;

    nodes.push({
      id: th.id,
      type: 'thought',
      position: { x: 550 + r * Math.cos(angle), y: 380 + r * Math.sin(angle) },
      data: { ...th },
    });

    th.connections.forEach((cid) => {
      const key = [th.id, cid].sort().join('-');
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({
          id: `e-${key}`,
          source: th.id,
          target: cid,
          style: { stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1 },
          animated: false,
        });
      }
    });
  });

  return { nodes, edges };
}

export default function BrainMap() {
  const { thoughts } = useMindStore();
  const { nodes: init, edges: initEdges } = useMemo(() => buildGraph(thoughts), [thoughts]);
  const [nodes, , onNodesChange] = useNodesState(init);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const onConnect = useCallback((p) => setEdges((eds) => addEdge(p, eds)), [setEdges]);

  // Empty state
  if (thoughts.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontSize: 14, color: t.text.tertiary }}>Your mind map is empty.</p>
        <p style={{ fontSize: 12, color: t.text.tertiary }}>Start capturing thoughts and connections will form here.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 relative" style={{ background: t.bg }}>
      {/* Inject dark overrides for React Flow controls */}
      <style>{controlsStyle}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ position: 'absolute', top: 24, left: 24, zIndex: 10, pointerEvents: 'none' }}
      >
        <h1 style={{ fontSize: 15, fontWeight: 600, color: t.text.primary }}>Brain Map</h1>
        <p style={{ fontSize: 12, color: t.text.tertiary, marginTop: 2 }}>
          {thoughts.length} thoughts · {edges.length} connections
        </p>
      </motion.div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={2}
        style={{ background: 'transparent' }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={() => 'rgba(255,255,255,0.18)'}
          maskColor="rgba(0,0,0,0.55)"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(255,255,255,0.04)"
        />
      </ReactFlow>
    </div>
  );
}
