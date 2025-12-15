import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useReactFlow } from 'reactflow'
import NodeWrapper from '@/components/NodeWrapper'
import { NodeLoadingOverlay } from '@/components/NodeLoadingOverlay'
import { Maximize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ImageModal - A simple portal-based modal for full-size image viewing
 */
function ImageModal({ isOpen, onClose, imageUrl, title }) {
    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative max-w-[90vw] max-h-[90vh] bg-background rounded-lg shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                    <h3 className="text-sm font-medium">{title} - Full Size</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-accent rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-muted/20">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="max-w-full max-h-[80vh] object-contain rounded shadow-sm"
                    />
                </div>
            </div>
            {/* Backdrop click to close */}
            <div className="absolute inset-0 z-[-1]" onClick={onClose} />
        </div>,
        document.body
    )
}

/**
 * BaseNode - Abstract base component for image processing nodes
 * Handles:
 * - Common NodeWrapper usage
 * - Processing/Loading states
 * - Image display with canvas logic
 * - Full-size image popup
 */
export function BaseNode({
    id,
    title,
    inputs = [],
    outputs = [],
    selected,
    children,
    // Data props
    imageUrl,
    // State props
    isProcessing = false,
    isWaitingForOpenCV = false,
    error = null,
    isConnected = true,
    // Configuration
    className
}) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const canvasRef = useRef(null)
    const { setNodes } = useReactFlow()

    // Handle node deletion
    const handleDelete = useCallback(() => {
        setNodes((nodes) => nodes.filter((node) => node.id !== id))
    }, [id, setNodes])

    // Draw image to canvas when available
    useEffect(() => {
        if (!imageUrl || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            const maxSize = 200
            const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
            canvas.width = Math.floor(img.width * scale)
            canvas.height = Math.floor(img.height * scale)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }

        img.src = imageUrl
    }, [imageUrl])

    return (
        <>
            <NodeWrapper
                title={title}
                inputs={inputs}
                outputs={outputs}
                selected={selected}
                onDelete={handleDelete}
                className={cn("w-[220px]", className)}
            >
                <div className="space-y-2">
                    {/* Processing/Image Display Area */}
                    <NodeLoadingOverlay
                        isLoading={isProcessing}
                        isWaiting={isWaitingForOpenCV}
                    >
                        <div className="relative w-full min-h-[100px] bg-muted rounded overflow-hidden flex items-center justify-center group">
                            {error ? (
                                <span className="text-xs text-destructive text-center px-2">
                                    {error}
                                </span>
                            ) : imageUrl ? (
                                <>
                                    <canvas
                                        ref={canvasRef}
                                        className="max-w-full max-h-[150px] object-contain"
                                    />
                                    {/* Overlay Button */}
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="p-1.5 bg-background/80 hover:bg-background text-foreground rounded shadow-sm backdrop-blur-sm transition-colors border border-border"
                                            title="View Full Size"
                                        >
                                            <Maximize2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <span className="text-xs text-muted-foreground select-none">
                                    {isConnected ? 'Waiting for input...' : 'No input connected'}
                                </span>
                            )}
                        </div>
                    </NodeLoadingOverlay>

                    {/* Additional Content (Controls/Options) */}
                    {children}
                </div>
            </NodeWrapper>

            {/* Full Size Modal */}
            <ImageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                imageUrl={imageUrl}
                title={title}
            />
        </>
    )
}
