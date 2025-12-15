import React from 'react'
import { Handle, Position } from 'reactflow'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

/**
 * NodeWrapper - A generic wrapper for React Flow nodes
 * 
 * @param {Object} props
 * @param {string} props.title - The title displayed in the node header
 * @param {Array} props.inputs - Array of input handle configs: [{ id, position?, style? }]
 * @param {Array} props.outputs - Array of output handle configs: [{ id, position?, style? }]
 * @param {React.ReactNode} props.children - Node-specific content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.selected - Whether the node is currently selected
 * @param {Function} props.onDelete - Optional callback when delete button is clicked
 */
function NodeWrapper({
    title,
    inputs = [],
    outputs = [],
    children,
    className,
    selected = false,
    onDelete
}) {
    return (
        <Card
            className={cn(
                "min-w-[180px] shadow-md transition-shadow relative group",
                selected && "ring-2 ring-primary shadow-lg",
                className
            )}
        >
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                    {title}
                </CardTitle>
                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation() // Prevent selecting node when deleting
                            onDelete()
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 -mr-2 -mt-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Node"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </CardHeader>

            <CardContent className="pt-0">
                {children}
            </CardContent>

            {/* Input Handles */}
            {inputs.map((input, index) => (
                <Handle
                    key={`input-${input.id || index}`}
                    type="target"
                    position={input.position || Position.Left}
                    id={input.id || `input-${index}`}
                    className="!w-3 !h-3 !bg-primary !border-2 !border-background"
                    style={{
                        top: `${((index + 1) / (inputs.length + 1)) * 100}%`,
                        ...input.style
                    }}
                />
            ))}

            {/* Output Handles */}
            {outputs.map((output, index) => (
                <Handle
                    key={`output-${output.id || index}`}
                    type="source"
                    position={output.position || Position.Right}
                    id={output.id || `output-${index}`}
                    className="!w-3 !h-3 !bg-primary !border-2 !border-background"
                    style={{
                        top: `${((index + 1) / (outputs.length + 1)) * 100}%`,
                        ...output.style
                    }}
                />
            ))}
        </Card>
    )
}

export default NodeWrapper
