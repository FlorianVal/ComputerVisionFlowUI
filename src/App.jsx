import React, { useCallback, useRef } from 'react'
import ReactFlow, {
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    ReactFlowProvider,
    useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { OpenCVProvider } from '@/contexts/OpenCVContext'
import { nodeTypes } from '@/nodes'
import AddNodeMenu from '@/components/AddNodeMenu'
import OpenCVStatus from '@/components/OpenCVStatus'

// Initial nodes for the "Hello World" pipeline
const initialNodes = [
    {
        id: 'source-1',
        type: 'imageSource',
        position: { x: 100, y: 150 },
        data: {},
    },
    {
        id: 'grayscale-1',
        type: 'grayscale',
        position: { x: 450, y: 150 },
        data: {},
    },
]

// Initial edge connecting source to grayscale
const initialEdges = [
    {
        id: 'edge-1',
        source: 'source-1',
        sourceHandle: 'image-out',
        target: 'grayscale-1',
        targetHandle: 'image-in',
        animated: true,
    },
]

function FlowCanvas() {
    const nodeIdCounter = useRef(2)
    const { getViewport, addNodes, setEdges, getEdges } = useReactFlow()

    // Key fix: Use defaultNodes/defaultEdges for uncontrolled mode
    // allowing nodes to update themselves via useNodeOutput without fighting App state

    const onConnect = useCallback(
        (params) => {
            setEdges((eds) => {
                // Enforce one connection per input handle
                const filteredEdges = eds.filter(
                    (edge) =>
                        !(
                            edge.target === params.target &&
                            edge.targetHandle === params.targetHandle
                        )
                )
                return addEdge({ ...params, animated: true }, filteredEdges)
            })
        },
        [setEdges]
    )

    const handleAddNode = useCallback((nodeType) => {
        nodeIdCounter.current += 1
        const id = `${nodeType}-${nodeIdCounter.current}`

        const viewport = getViewport()
        const position = {
            x: (-viewport.x + 300 + Math.random() * 200) / viewport.zoom,
            y: (-viewport.y + 200 + Math.random() * 100) / viewport.zoom,
        }

        const newNode = {
            id,
            type: nodeType,
            position,
            data: {},
        }

        addNodes(newNode)
    }, [getViewport, addNodes])

    return (
        <ReactFlow
            defaultNodes={initialNodes}
            defaultEdges={initialEdges}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-50"
        >
            <Background variant="dots" gap={16} size={1} />
            <Controls />
            <AddNodeMenu onAddNode={handleAddNode} />
        </ReactFlow>
    )
}

function App() {
    return (
        <OpenCVProvider>
            <div className="w-screen h-screen">
                <header className="absolute top-0 left-0 right-0 z-10 px-4 py-2 bg-background/80 backdrop-blur-sm border-b flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            VisioFlow
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Node-based Computer Vision Pipeline Editor
                        </p>
                    </div>
                    <OpenCVStatus />
                </header>
                <ReactFlowProvider>
                    <FlowCanvas />
                </ReactFlowProvider>
            </div>
        </OpenCVProvider>
    )
}

export default App
