import React from 'react';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
} from 'reactflow';
import { shallow } from 'zustand/shallow';

import 'reactflow/dist/style.css';
import './styles/App.css';

import useStore from './utils/store';
import nodeTypes from './ressources/nodeTypes';

import AddMenuDropdown from './components/NodeMenu';

function CustomControls() {
  return (
    <Controls showZoom={false}>
      <AddMenuDropdown></AddMenuDropdown>
    </Controls>
  );
}

const selector = (state: { nodes: any; edges: any; onNodesChange: any; onEdgesChange: any; onConnect: any; onDrop:any; onDragOver:any; setReactFlowInstance: any; }) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  onDrop: state.onDrop,
  onDragOver: state.onDragOver,
  setReactFlowInstance: state.setReactFlowInstance,
});

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDrop, onDragOver, setReactFlowInstance } = useStore(selector, shallow);
  return (
    <ReactFlowProvider>
      <div className="ComputerVisionFlow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          onInit={setReactFlowInstance}
          fitView
        />
        <MiniMap />
        <CustomControls />
      </div>
    </ReactFlowProvider>
  );
}

export default Flow;
