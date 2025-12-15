import React, { useState, useCallback, memo, useRef } from 'react'
import { useReactFlow } from 'reactflow'
import NodeWrapper from '@/components/NodeWrapper'
import { Button } from '@/components/ui/button'
import { useNodeOutput } from '@/data'
import { ImagePlus } from 'lucide-react'

/**
 * ImageSourceNode - A node that loads an image from file input
 * Outputs the image data URL to connected nodes
 */
function ImageSourceNode({ id, data, selected }) {
    const [imageUrl, setImageUrl] = useState(data.imageUrl || null)
    const [imageName, setImageName] = useState(data.imageName || '')
    const updateOutput = useNodeOutput(id)
    const fileInputRef = useRef(null)
    const { setNodes } = useReactFlow()

    const handleButtonClick = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleDelete = useCallback(() => {
        setNodes((nodes) => nodes.filter((node) => node.id !== id))
    }, [id, setNodes])

    const handleFileChange = useCallback((event) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate it's an image
        if (!file.type.startsWith('image/')) {
            console.warn('Selected file is not an image')
            return
        }
        console.log('[ImageSourceNode] File selected:', file)
        console.log('[ImageSourceNode] File name:', file.name)
        console.log('[ImageSourceNode] File type:', file.type)
        console.log('[ImageSourceNode] File size:', file.size)
        // Create object URL for the image
        const url = URL.createObjectURL(file)

        // Load image to get dimensions
        const img = new Image()
        img.onload = () => {
            console.log(`[ImageSourceNode] Loaded image: ${file.name} (${img.width}x${img.height})`)
            setImageUrl(url)
            setImageName(file.name)

            // Update node data to propagate to connected nodes with dimensions
            updateOutput({
                imageUrl: url,
                imageName: file.name,
                width: img.width,
                height: img.height
            })
        }
        img.onerror = () => {
            console.error('[ImageSourceNode] Failed to load image info')
        }
        img.src = url
    }, [updateOutput])

    return (
        <NodeWrapper
            title="Image Source"
            outputs={[{ id: 'image-out' }]}
            selected={selected}
            onDelete={handleDelete}
            className="w-[220px]"
        >
            <div className="space-y-3">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {!imageUrl ? (
                    /* Upload button when no image is loaded */
                    <Button
                        variant="outline"
                        onClick={handleButtonClick}
                        className="w-full h-20 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                        <ImagePlus className="w-8 h-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Click to select image</span>
                    </Button>
                ) : (
                    /* Image preview with change option */
                    <div className="space-y-2">
                        <div
                            className="relative w-full h-24 bg-muted rounded overflow-hidden cursor-pointer group"
                            onClick={handleButtonClick}
                            title="Click to change image"
                        >
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ImagePlus className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate" title={imageName}>
                            {imageName}
                        </p>
                    </div>
                )}
            </div>
        </NodeWrapper>
    )
}

export default memo(ImageSourceNode)
