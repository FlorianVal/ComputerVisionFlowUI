import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
} from 'reactflow';
import { shallow } from 'zustand/shallow';
import useStore from './store';

import AddMenuDropdown from './components/AddNodeMenu';
import 'reactflow/dist/style.css';
import './styles/App.css';
import nodeTypes from './ressources/nodeTypes.js';

function CustomControls() {
  return (
    <Controls showZoom={false}>
      <AddMenuDropdown></AddMenuDropdown>
    </Controls>
  );
}

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodes: state.getNodes,
  getEdges: state.getEdges,
  setNodes: state.setNodes,
  addNodes: state.addNodes,
  setEdges: state.setEdges,
  addEdges: state.addEdges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
});

const App = () => {
  const reactFlowWrapper = useRef(null);


  const { nodes, edges, getNodes, getEdges, setNodes, addNodes, setEdges, addEdges, onNodesChange, onEdgesChange } = useStore(selector, shallow);

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onConnect = useCallback((event) => {
    const sourceNode = getNodes().find((node) => node.id === event.source);
    const targetNode = getNodes().find((node) => node.id === event.target);

    targetNode.data.input = sourceNode.data.output;
    addEdges(event.source, event.target);
    onNodesChange(getNodes());
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      addNodes(type, position);
    },
    [reactFlowInstance]
  );


  return (
    <div className="ComputerVisionFlow">
      <ReactFlowProvider>
        <div className="ComputerVisionFlow" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={setReactFlowInstance}
            fitView
            attributionPosition="top-right"
            nodeTypes={nodeTypes}
          >
            <MiniMap style={{ height: 120 }} zoomable pannable />
            <CustomControls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default App;