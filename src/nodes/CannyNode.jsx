import React, { memo, useState, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { processCanny } from '@/services/imageProcessor'
import { Slider } from '@/components/ui/slider'

/**
 * CannyNode - Applies Canny edge detection to input image
 * Uses OpenCV.js (required, no fallback)
 * Refactored to use BaseNode via ExpandableNode
 */
function CannyNode({ id, data, selected }) {
    // Use the data hooks
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    // Canny threshold options
    const [threshold1, setThreshold1] = useState(data.threshold1 ?? 50)
    const [threshold2, setThreshold2] = useState(data.threshold2 ?? 150)

    // Handle threshold1 change
    const handleThreshold1Change = useCallback((value) => {
        setThreshold1(value)
    }, [])

    // Handle threshold2 change
    const handleThreshold2Change = useCallback((value) => {
        setThreshold2(value)
    }, [])

    // Memoize options to avoid unnecessary reprocessing
    const processingOptions = useMemo(() => ({
        threshold1,
        threshold2,
    }), [threshold1, threshold2])

    // Callback when processing completes
    const handleProcessingComplete = useCallback((outputUrl) => {
        updateOutput({ imageUrl: outputUrl })
    }, [updateOutput])

    // Use the image processor hook
    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processCanny,
        inputImageUrl,
        processingOptions,
        handleProcessingComplete,
        [threshold1, threshold2] // Reprocess when options change
    )

    // Options content for the expandable panel
    const optionsContent = (
        <>
            <Slider
                label="Low Threshold"
                value={threshold1}
                onChange={handleThreshold1Change}
                min={0}
                max={255}
                step={1}
                showValue
            />
            <Slider
                label="High Threshold"
                value={threshold2}
                onChange={handleThreshold2Change}
                min={0}
                max={255}
                step={1}
                showValue
            />
        </>
    )

    return (
        <ExpandableNode
            id={id}
            title="Canny Edge"
            inputs={[{ id: 'image-in' }]}
            outputs={[{ id: 'image-out' }]}
            selected={selected}
            imageUrl={data.imageUrl}
            isProcessing={isProcessing}
            isWaitingForOpenCV={isWaitingForOpenCV}
            error={error}
            isConnected={isConnected}
            options={optionsContent}
            className="w-[220px]"
        />
    )
}

export default memo(CannyNode)
