import React, { useState, useCallback } from 'react'
import { Panel } from 'reactflow'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PlusIcon, ImageIcon, PaletteIcon, BlendIcon, ScanLineIcon } from 'lucide-react'

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
]

/**
 * AddNodeMenu - A floating menu to add new nodes to the canvas
 */
function AddNodeMenu({ onAddNode }) {
    const [isOpen, setIsOpen] = useState(false)

    const handleAddNode = useCallback((nodeType) => {
        onAddNode(nodeType)
        setIsOpen(false)
    }, [onAddNode])

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
                    {/* Backdrop to close on click outside */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    <Card className="absolute top-12 right-0 z-20 w-64 p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="space-y-1">
                            <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Available Nodes
                            </p>

                            {nodeDefinitions.map((node) => {
                                const Icon = node.icon
                                return (
                                    <button
                                        key={node.type}
                                        onClick={() => handleAddNode(node.type)}
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
                                )
                            })}
                        </div>
                    </Card>
                </>
            )}
        </Panel>
    )
}

export default AddNodeMenu
