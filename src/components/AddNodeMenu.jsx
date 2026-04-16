import React, { useState, useCallback, useMemo, useRef } from 'react'
import { Panel } from 'reactflow'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PlusIcon, ImageIcon, PaletteIcon, BlendIcon, ScanLineIcon, LayersIcon, PencilIcon, RotateCw, Sun, ChevronRight, Code2, Trash2 } from 'lucide-react'

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
    {
        type: 'invert',
        label: 'Invert Colors',
        description: 'Invert image colors',
        icon: PaletteIcon,
        category: 'Filter',
    },
    {
        type: 'colorConvert',
        label: 'Color Convert',
        description: 'Convert between RGB, HSV, LAB, and YCrCb color spaces',
        icon: PaletteIcon,
        category: 'Filter',
    },
]

/**
 * AddNodeMenu - A floating toolbar with canvas actions and a node picker.
 * Collapsed by default (icons only), expands on hover to show labels.
 */
function AddNodeMenu({ onAddNode, onExportCode, onClearCanvas }) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState(null)
    const [hovered, setHovered] = useState(false)
    const leaveTimer = useRef(null)

    const expanded = hovered || isOpen

    const handleMouseEnter = useCallback(() => {
        clearTimeout(leaveTimer.current)
        setHovered(true)
    }, [])

    const handleMouseLeave = useCallback(() => {
        leaveTimer.current = setTimeout(() => setHovered(false), 200)
    }, [])

    const handleAddNode = useCallback((nodeType) => {
        onAddNode(nodeType)
        setIsOpen(false)
        setActiveCategory(null)
    }, [onAddNode])

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

    const btnBase = 'flex items-center h-8 rounded-md text-sm font-medium transition-colors overflow-hidden'
    const btnLayout = expanded ? 'w-full justify-start px-2' : 'w-8 justify-center px-0'
    const labelBase = 'whitespace-nowrap overflow-hidden transition-[max-width,margin,opacity] duration-200 ease-in-out'
    const labelLayout = expanded ? 'ml-2 max-w-[160px] opacity-100' : 'ml-0 max-w-0 opacity-0'

    return (
        <Panel position="top-right" className="!top-16 !right-4">
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative"
            >
                {/* Toolbar — collapsed shows centered icons, expands on hover to reveal labels */}
                <div
                    className="flex flex-col items-stretch gap-1 p-1.5 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg overflow-hidden transition-[width] duration-200 ease-in-out"
                    style={{ width: expanded ? 168 : 44 }}
                >
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        title="Add Node"
                        className={`${btnBase} ${btnLayout} bg-primary text-primary-foreground hover:bg-primary/90`}
                    >
                        <PlusIcon className="w-4 h-4 shrink-0" />
                        <span className={`${labelBase} ${labelLayout}`}>Add Node</span>
                    </button>

                    {onExportCode && (
                        <button
                            onClick={onExportCode}
                            title="Export Code"
                            className={`${btnBase} ${btnLayout} border border-input bg-background hover:bg-accent hover:text-accent-foreground`}
                        >
                            <Code2 className="w-4 h-4 shrink-0" />
                            <span className={`${labelBase} ${labelLayout}`}>Export Code</span>
                        </button>
                    )}

                    {onClearCanvas && (
                        <>
                            <Separator />
                            <button
                                onClick={onClearCanvas}
                                title="Clear Canvas"
                                className={`${btnBase} ${btnLayout} text-destructive hover:bg-destructive/10`}
                            >
                                <Trash2 className="w-4 h-4 shrink-0" />
                                <span className={`${labelBase} ${labelLayout}`}>Clear Canvas</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Add Node dropdown */}
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => {
                                setIsOpen(false)
                                setActiveCategory(null)
                            }}
                        />

                        <div className="absolute right-0 flex flex-row-reverse gap-2 items-start z-20" style={{ top: 'calc(100% + 8px)' }}>
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
            </div>
        </Panel>
    )
}

export default AddNodeMenu
