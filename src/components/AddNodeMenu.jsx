import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Panel, useReactFlow } from 'reactflow'
import { useDraggable } from '@neodrag/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PlusIcon, ImageIcon, PaletteIcon, BlendIcon, ScanLineIcon, LayersIcon, PencilIcon, RotateCw, Sun } from 'lucide-react'
import { NODE_CENTER_OFFSET } from '@/constants/nodeLayout'

/**
 * Node definitions with metadata for the add menu
 */
export const nodeDefinitions = [
    {
        type: 'imageSource',
        label: 'Image Source',
        description: 'Load an image from file',
        icon: ImageIcon,
        category: 'Input',
    },
    {
        type: 'grayscale',
        label: 'Grayscale',
        description: 'Convert image to grayscale',
        icon: PaletteIcon,
        category: 'Filter',
    },
    {
        type: 'blur',
        label: 'Blur',
        description: 'Apply blur effect with adjustable strength',
        icon: BlendIcon,
        category: 'Filter',
    },
    {
        type: 'canny',
        label: 'Canny Edge',
        description: 'Detect edges using Canny algorithm',
        icon: ScanLineIcon,
        category: 'Filter',
    },
    {
        type: 'morphological',
        label: 'Morphological Ops',
        description: 'Apply Erosion or Dilation',
        icon: LayersIcon,
        category: 'Filter',
    },
    {
        type: 'findContours',
        label: 'Find Contours',
        description: 'Detect and draw contours',
        icon: PencilIcon,
        category: 'Filter',
    },
    {
        type: 'threshold',
        label: 'Threshold',
        description: 'Adaptive range thresholding',
        icon: ScanLineIcon,
        category: 'Filter',
    },
    {
        type: 'rotate',
        label: 'Rotate',
        description: 'Rotate image by angle',
        icon: RotateCw,
        category: 'Transform',
    },
    {
        type: 'brightness',
        label: 'Brightness',
        description: 'Adjust brightness and contrast',
        icon: Sun,
        category: 'Adjust',
    },
]

function NodeMenuItem({ node, onClick, onDragEnd }) {
    const ref = useRef(null)

    useDraggable(ref, {
        onDragEnd: (event) => {
            if (ref.current) {
                ref.current.style.transform = ''
            }
            onDragEnd(event, node.type)
        },
    })

    useEffect(() => {
        if (ref.current) {
            ref.current.style.transform = ''
        }
    }, [])

    const Icon = node.icon

    return (
        <div ref={ref}>
            <button
                onClick={() => onClick(node.type)}
                className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors text-left group"
            >
                <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{node.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {node.category}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {node.description}
                    </p>
                </div>
            </button>
        </div>
    )
}

/**
 * AddNodeMenu - A floating menu to add new nodes to the canvas
 */
function AddNodeMenu({ onAddNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)
    const flowPaneRef = useRef(null)
    const { screenToFlowPosition } = useReactFlow()

    useEffect(() => {
        if (!isOpen) return
        const onKeyDown = (event) => {
            if (event.key !== 'Escape') return
            const active = document.activeElement
            if (menuRef.current?.contains(active)) {
                setIsOpen(false)
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [isOpen])

    const handleAddNode = useCallback((nodeType) => {
        onAddNode(nodeType)
        setIsOpen(false)
    }, [onAddNode])

    const handleDragEndToCanvas = useCallback((event, nodeType) => {
        if (!flowPaneRef.current) {
            flowPaneRef.current = document.querySelector('.react-flow__pane')
        }

        const pane = flowPaneRef.current
        if (!pane || event.clientX === undefined || event.clientY === undefined) return

        const bounds = pane.getBoundingClientRect()
        const inside =
            event.clientX >= bounds.left &&
            event.clientX <= bounds.right &&
            event.clientY >= bounds.top &&
            event.clientY <= bounds.bottom

        if (inside) {
            const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY })
            onAddNode(nodeType, {
                x: flowPosition.x - NODE_CENTER_OFFSET.x,
                y: flowPosition.y - NODE_CENTER_OFFSET.y,
            })
        }
    }, [onAddNode, screenToFlowPosition])

    return (
        <Panel position="top-right" className="!top-16 !right-4">
            {/* Toggle Button */}
            <Button
                variant="default"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
            >
                <PlusIcon className="w-4 h-4" />
                Add Node
            </Button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    <Card
                        ref={menuRef}
                        className="absolute top-12 right-0 z-20 w-64 p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        <div className="space-y-1">
                            <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Available Nodes
                            </p>

                            {nodeDefinitions.map((node) => (
                                <NodeMenuItem
                                    key={node.type}
                                    node={node}
                                    onClick={handleAddNode}
                                    onDragEnd={handleDragEndToCanvas}
                                />
                            ))}
                        </div>
                    </Card>
                </>
            )}
        </Panel>
    )
}

export default AddNodeMenu
