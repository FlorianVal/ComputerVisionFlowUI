import React, { useState, useCallback, useMemo } from 'react'
import { Panel } from 'reactflow'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PlusIcon, ImageIcon, PaletteIcon, BlendIcon, ScanLineIcon, LayersIcon, PencilIcon, RotateCw, Sun, ChevronRight, ZoomIn } from 'lucide-react'

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
        type: 'zoom',
        label: 'Zoom',
        description: 'Zoom in on the image',
        icon: ZoomIn,
        category: 'Transform',
    },
    {
        type: 'brightness',
        label: 'Brightness',
        description: 'Adjust brightness and contrast',
        icon: Sun,
        category: 'Adjust',
    },
    {
        type: 'invert',
        label: 'Invert Colors',
        description: 'Invert image colors',
        icon: PaletteIcon,
        category: 'Filter',
    },
]

/**
 * AddNodeMenu - A floating menu to add new nodes to the canvas
 */
function AddNodeMenu({ onAddNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState(null)

    const handleAddNode = useCallback((nodeType) => {
        onAddNode(nodeType)
        setIsOpen(false)
        setActiveCategory(null)
    }, [onAddNode])

    // Group nodes by category
    const categories = useMemo(() => {
        const groups = {}
        nodeDefinitions.forEach(node => {
            if (!groups[node.category]) {
                groups[node.category] = []
            }
            groups[node.category].push(node)
        })
        return Object.entries(groups).map(([name, nodes]) => ({
            name,
            nodes
        }))
    }, [])

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
                        onClick={() => {
                            setIsOpen(false)
                            setActiveCategory(null)
                        }}
                    />

                    <div className="absolute top-12 right-0 flex flex-row-reverse gap-2 items-start z-20">
                        {/* Main Category Menu */}
                        <Card className="w-48 p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="space-y-1">
                                <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Categories
                                </p>

                                {categories.map((category) => (
                                    <button
                                        key={category.name}
                                        onMouseEnter={() => setActiveCategory(category.name)}
                                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-sm transition-colors ${
                                            activeCategory === category.name
                                            ? 'bg-accent text-accent-foreground'
                                            : 'hover:bg-accent/50'
                                        }`}
                                    >
                                        <span className="font-medium">{category.name}</span>
                                        <ChevronRight className="w-4 h-4 opacity-50" />
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Submenu for Active Category */}
                        {activeCategory && (
                            <Card className="w-64 p-2 shadow-xl animate-in fade-in slide-in-from-right-2 duration-200">
                                <div className="space-y-1">
                                    <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {activeCategory} Nodes
                                    </p>

                                    {categories.find(c => c.name === activeCategory)?.nodes.map((node) => {
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
                                                    <div className="font-medium text-sm">{node.label}</div>
                                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                        {node.description}
                                                    </p>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </Card>
                        )}
                    </div>
                </>
            )}
        </Panel>
    )
}

export default AddNodeMenu
