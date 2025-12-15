import React, { useState, useCallback } from 'react'
import { BaseNode } from './BaseNode'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

/**
 * ExpandableNode - A node wrapper with a collapsible options panel
 * Now implemented as a wrapper around BaseNode
 */
export function ExpandableNode({
    // BaseNode props
    id,
    title,
    inputs,
    outputs,
    selected,
    imageUrl,
    isProcessing,
    isWaitingForOpenCV,
    error,
    isConnected,
    className,

    // Expandable props
    children, // Content inside the BaseNode (main controls if any, usually empty if just image)
    options,  // Collapsible options
    defaultExpanded = false
}) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev)
    }, [])

    return (
        <BaseNode
            id={id}
            title={title}
            inputs={inputs}
            outputs={outputs}
            selected={selected}
            imageUrl={imageUrl}
            isProcessing={isProcessing}
            isWaitingForOpenCV={isWaitingForOpenCV}
            error={error}
            isConnected={isConnected}
            className={className}
        >
            {/* Pass through children (if any specific non-option controls exist) */}
            {children}

            {/* Options Panel */}
            {options && (
                <div className="pt-2 border-t border-border/50">
                    {/* Expand/Collapse button */}
                    <button
                        onClick={toggleExpanded}
                        className={cn(
                            "w-full flex items-center justify-center gap-1 py-1 rounded",
                            "text-xs text-muted-foreground",
                            "hover:bg-accent/50 hover:text-foreground",
                            "transition-colors"
                        )}
                    >
                        <ChevronDown
                            className={cn(
                                "w-4 h-4 transition-transform duration-200",
                                isExpanded && "rotate-180"
                            )}
                        />
                    </button>

                    {/* Collapsible options content */}
                    <div
                        className={cn(
                            "overflow-hidden transition-all duration-200 ease-in-out",
                            isExpanded ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"
                        )}
                    >
                        <div className="space-y-3 pb-1">
                            {options}
                        </div>
                    </div>
                </div>
            )}
        </BaseNode>
    )
}
