import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  useStoreApi,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';


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


const App = () => {
  const reactFlowWrapper = useRef(null);
  const store = useStoreApi();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const getId = () => `${store.getState().getNodes().length++}`;

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onConnect = useCallback((event) => {
    const sourceNode = store.getState().getNodes().find((node) => node.id === event.source);
    const targetNode = store.getState().getNodes().find((node) => node.id === event.target);

    targetNode.data.input = sourceNode.data.output;
    setEdges((eds) => addEdge({ ...event }, eds));
    console.log("In onConnect:", store.getState().getNodes())
  }, []);


  const onDrop = useCallback((event) => {
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
    const new_node = {
      id: getId(),
      type,
      position,
      data: { label: nodeTypes[type].label, input: null, output: null },
    };
    console.log("In onDrop:", new_node)
    setNodes((nds) => [...nds, new_node]);
  },
    [reactFlowInstance]
  );


  return (
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
  );
};

function FlowWithProvider(props) {
  return (
    <ReactFlowProvider>
      <App {...props} />
    </ReactFlowProvider>
  );
}

export default FlowWithProvider;
