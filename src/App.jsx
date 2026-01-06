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
import elephantImg from '../asset/imagenet_elephant.jpg'

// Helper to add some visual noise to node positions
const jitter = (val, range = 20) => val + (Math.random() - 0.5) * range

// Initial nodes for the visualization pipeline
const initialNodes = [
    {
        id: 'source-1',
        type: 'imageSource',
        position: { x: jitter(50), y: jitter(300, 150) },
        data: { imageUrl: elephantImg, imageName: 'imagenet_elephant.jpg' },
    },
    // Pipeline 1: Grayscale -> Blur -> Threshold -> Find Contours -> Erode -> Dilate
    {
        id: 'grayscale-1',
        type: 'grayscale',
        position: { x: jitter(400), y: jitter(100, 150) },
        data: {},
    },
    {
        id: 'blur-1',
        type: 'blur',
        position: { x: jitter(700), y: jitter(100, 150) },
        data: { strength: 5 },
    },
    {
        id: 'thresh-1',
        type: 'threshold',
        position: { x: jitter(1000), y: jitter(100, 150) },
        data: {
            // Reject 140-255 (Keep 0-139)
            mode: 'filter',
            ranges: [[140, 255]]
        },
    },
    {
        id: 'contours-1',
        type: 'findContours',
        position: { x: jitter(1300), y: jitter(100, 150) },
        data: { fill: true },
    },
    {
        id: 'erode-1',
        type: 'morphological',
        position: { x: jitter(1600), y: jitter(100, 150) },
        data: { operation: 'erode', iterations: 4 },
    },
    {
        id: 'dilate-1',
        type: 'morphological',
        position: { x: jitter(1900), y: jitter(100, 150) },
        data: { operation: 'dilate', iterations: 4 },
    },
    // Pipeline 2: Threshold (RGB) -> Find Contours
    {
        id: 'thresh-2',
        type: 'threshold',
        position: { x: jitter(400), y: jitter(500, 150) },
        data: {
            // Keep roughly middle values
            mode: 'select',
            ranges: [[50, 200], [50, 200], [50, 200]]
        },
    },
    {
        id: 'contours-2',
        type: 'findContours',
        position: { x: jitter(750), y: jitter(500, 150) },
        data: { fill: false },
    },
]

const initialEdges = [
    // Pipeline 1 Connections
    { id: 'e1-1', source: 'source-1', sourceHandle: 'image-out', target: 'grayscale-1', targetHandle: 'image-in', animated: true },
    { id: 'e1-2', source: 'grayscale-1', sourceHandle: 'image-out', target: 'blur-1', targetHandle: 'image-in', animated: true },
    { id: 'e1-3', source: 'blur-1', sourceHandle: 'image-out', target: 'thresh-1', targetHandle: 'image-in', animated: true },
    { id: 'e1-4', source: 'thresh-1', sourceHandle: 'image-out', target: 'contours-1', targetHandle: 'image-in', animated: true },
    { id: 'e1-5', source: 'contours-1', sourceHandle: 'image-out', target: 'erode-1', targetHandle: 'image-in', animated: true },
    { id: 'e1-6', source: 'erode-1', sourceHandle: 'image-out', target: 'dilate-1', targetHandle: 'image-in', animated: true },

    // Pipeline 2 Connections
    { id: 'e2-1', source: 'source-1', sourceHandle: 'image-out', target: 'thresh-2', targetHandle: 'image-in', animated: true },
    { id: 'e2-2', source: 'thresh-2', sourceHandle: 'image-out', target: 'contours-2', targetHandle: 'image-in', animated: true },
]

const NODE_CENTER_OFFSET = { x: 120, y: 80 }

function FlowCanvas() {
    const nodeIdCounter = useRef(2)
    const { getViewport, addNodes, setEdges, getEdges, screenToFlowPosition } = useReactFlow()

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

    const handleAddNode = useCallback((nodeType, positionOverride) => {
        nodeIdCounter.current += 1
        const id = `${nodeType}-${nodeIdCounter.current}`

        const viewport = getViewport()
        const position =
            positionOverride ?? {
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

    const onDragOver = useCallback((event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback((event) => {
        event.preventDefault()
        const nodeType = event.dataTransfer.getData('application/reactflow')
        if (!nodeType) return

        const dropPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY })
        const centeredPosition = {
            x: dropPosition.x - NODE_CENTER_OFFSET.x,
            y: dropPosition.y - NODE_CENTER_OFFSET.y,
        }
        handleAddNode(nodeType, centeredPosition)
    }, [handleAddNode, screenToFlowPosition])

    return (
        <ReactFlow
            defaultNodes={initialNodes}
            defaultEdges={initialEdges}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onDrop={onDrop}
            onDragOver={onDragOver}
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
