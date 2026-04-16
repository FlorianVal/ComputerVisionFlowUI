import React, { memo, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes, createImagePayload } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { useNodeConfig } from '@/hooks/useNodeConfig'
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

    // Blur options state — synced to node.data for export
    const [config, setConfig] = useNodeConfig(id, {
        strength: data.strength ?? 15,
        blurType: data.blurType ?? 'gaussian',
    })
    const { strength, blurType } = config

    const blurTypeOptions = [
        { value: 'gaussian', label: 'Gaussian' },
        { value: 'box', label: 'Box' },
        { value: 'median', label: 'Median' },
    ]

    const handleStrengthChange = useCallback((value) => {
        setConfig({ strength: value })
    }, [setConfig])

    const handleBlurTypeChange = useCallback((value) => {
        setConfig({ blurType: value })
    }, [setConfig])

    // Memoize options to avoid unnecessary reprocessing
    const processingOptions = useMemo(() => ({
        strength,
        blurType,
        metadata: inputData?.metadata
    }), [strength, blurType, inputData])

    const handleProcessingComplete = useCallback((result) => {
        updateOutput({
            image: createImagePayload({
                imageUrl: result.outputUrl,
                metadata: result.metadata,
            })
        })
    }, [updateOutput])

    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processBlur,
        inputImageUrl,
        processingOptions,
        handleProcessingComplete,
        [strength, blurType]
    )

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
            image={data.image}
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
