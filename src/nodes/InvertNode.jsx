import React, { memo, useCallback } from 'react'
import { BaseNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { processInvert } from '@/services/imageProcessor'

/**
 * InvertNode - Inverts colors of the input image
 * Uses OpenCV.js for bitwise_not operation
 */
function InvertNode({ id, data, selected }) {
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
        processInvert,
        inputImageUrl,
        { metadata: inputData?.metadata }, // Pass metadata
        handleProcessingComplete,
        [inputData?.metadata] // Re-run if metadata changes
    )

    return (
        <BaseNode
            id={id}
            title="Invert Colors"
            inputs={[{ id: 'image-in' }]}
            outputs={[{ id: 'image-out' }]}
            selected={selected}
            imageUrl={data.imageUrl}
            isProcessing={isProcessing}
            isWaitingForOpenCV={isWaitingForOpenCV}
            error={error}
            isConnected={isConnected}
            className="w-[200px]"
        />
    )
}

export default memo(InvertNode)
