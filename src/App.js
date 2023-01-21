import React, { useCallback } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ControlButton,
} from 'reactflow';

import { nodes as initialNodes, edges as initialEdges } from './ressources/initial-elements';
import CustomNode from './components/Nodes/CustomNode';
import ImageInputNode from './components/Nodes/ImageInputNode';
import AddMenuDropdown from './components/AddNodeMenu';
import 'reactflow/dist/style.css';
import './styles/App.css';
import nodeTypes from './ressources/nodeTypes.js';

const minimapStyle = {
  height: 120,
};

const onInit = (reactFlowInstance) => console.log('flow loaded:', reactFlowInstance);

function CustomControls() {
  return (
    <Controls showZoom={false}>
      <AddMenuDropdown></AddMenuDropdown>
    </Controls>
  );
}

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  // we are using a bit of a shortcut here to adjust the edge type
  // this could also be done with a custom edge for example
  const edgesWithUpdatedTypes = edges.map((edge) => {
    if (edge.sourceHandle) {
      const edgeType = nodes.find((node) => node.type === 'custom').data.selects[edge.sourceHandle];
      edge.type = edgeType;
    }

    return edge;
  });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edgesWithUpdatedTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={onInit}
      fitView
      attributionPosition="top-right"
      nodeTypes={nodeTypes}
    >
      <MiniMap style={minimapStyle} zoomable pannable />
      <CustomControls></CustomControls>
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  );
};

export default App;