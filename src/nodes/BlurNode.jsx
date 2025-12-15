import React, { memo, useState, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { processBlur } from '@/services/imageProcessor'
import { Slider } from '@/components/ui/slider'
import { Select } from '@/components/ui/select'

/**
 * BlurNode - Applies blur effect to input image with configurable options
 * Uses OpenCV.js (no fallback)
 * Refactored to use BaseNode via ExpandableNode
 */
function BlurNode({ id, data, selected }) {
    // Use the data hooks
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    // Blur options state
    const [strength, setStrength] = useState(data.strength ?? 15)
    const [blurType, setBlurType] = useState(data.blurType ?? 'gaussian')

    const blurTypeOptions = [
        { value: 'gaussian', label: 'Gaussian' },
        { value: 'box', label: 'Box' },
        { value: 'median', label: 'Median' },
    ]

    // Handle strength change
    const handleStrengthChange = useCallback((value) => {
        setStrength(value)
    }, [])

    // Handle blur type change
    const handleBlurTypeChange = useCallback((value) => {
        setBlurType(value)
    }, [])

    // Memoize options to avoid unnecessary reprocessing
    const processingOptions = useMemo(() => ({
        strength,
        blurType,
    }), [strength, blurType])

    // Callback when processing completes
    const handleProcessingComplete = useCallback((outputUrl) => {
        updateOutput({ imageUrl: outputUrl })
    }, [updateOutput])

    // Use the image processor hook
    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processBlur,
        inputImageUrl,
        processingOptions,
        handleProcessingComplete,
        [strength, blurType] // Reprocess when options change
    )

    // Options content for the expandable panel
    const optionsContent = (
        <>
            <Slider
                label="Strength"
                value={strength}
                onChange={handleStrengthChange}
                min={1}
                max={50}
                step={2}
                showValue
            />
            <Select
                label="Blur Type"
                value={blurType}
                onChange={handleBlurTypeChange}
                options={blurTypeOptions}
            />
        </>
    )

    return (
        <ExpandableNode
            id={id}
            title="Blur"
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

export default memo(BlurNode)
