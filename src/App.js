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

  const updateNodes = () => {
    console.log("Should upadte nodes")
    setNodes((nds) =>
      nds.map((node) => {
        node.data = { ...node.data };
        return node;
      })
    );
  };

  const onNodesChange = useCallback((changes) => {
    console.log("In onNodesChange")
    setNodes((nds) => applyNodeChanges(changes, nds))
    store.getState().edges.forEach((edge) => {
      const sourceNode = store.getState().getNodes().find((node) => node.id === edge.source);
      const targetNode = store.getState().getNodes().find((node) => node.id === edge.target);

      targetNode.data.input = sourceNode.data.output;
    })
    updateNodes();
  }, []);

  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const getId = () => `${store.getState().getNodes().length++}`;

  const onDragOver = useCallback((event) => {
    console.log("In onDragOver")
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onConnect = useCallback((event) => {
    console.log("In onConnect")
    setEdges((eds) => addEdge({ ...event }, eds));
    const sourceNode = store.getState().getNodes().find((node) => node.id === event.source);
    const targetNode = store.getState().getNodes().find((node) => node.id === event.target);

    setNodes((nds) => {
      nds.forEach((node) => {
        if (node.id === event.target) {
          node.data.input = sourceNode.data.output;
        }
      });
      return nds;
    });
    updateNodes();
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
