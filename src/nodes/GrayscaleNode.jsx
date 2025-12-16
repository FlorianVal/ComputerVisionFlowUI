import React, { memo, useCallback } from 'react'
import { BaseNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { processGrayscale } from '@/services/imageProcessor'

/**
 * GrayscaleNode - Converts input image to grayscale
 * Uses OpenCV.js for grayscale conversion (no fallback)
 * Refactored to use BaseNode
 */
function GrayscaleNode({ id, data, selected }) {
    // Use the data hooks
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    // Callback when processing completes
    const handleProcessingComplete = useCallback((result) => {
        updateOutput({
            imageUrl: result.outputUrl,
            metadata: result.metadata
        })
    }, [updateOutput])

    // Use the image processor hook
    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processGrayscale,
        inputImageUrl,
        {}, // No options for grayscale
        handleProcessingComplete,
        [] // No additional deps
    )

    return (
        <BaseNode
            id={id}
            title="Grayscale"
            inputs={[{ id: 'image-in' }]}
            outputs={[{ id: 'image-out' }]}
            selected={selected}
            imageUrl={data.imageUrl}
            isProcessing={isProcessing}
            isWaitingForOpenCV={isWaitingForOpenCV}
            error={error}
            isConnected={isConnected}
            className="w-[220px]"
        />
    )
}

export default memo(GrayscaleNode)
