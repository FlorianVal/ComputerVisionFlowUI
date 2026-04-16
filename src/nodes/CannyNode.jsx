import React, { memo, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes, createImagePayload } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { useNodeConfig } from '@/hooks/useNodeConfig'
import { processCanny } from '@/services/imageProcessor'
import { Slider } from '@/components/ui/slider'

/**
 * CannyNode - Applies Canny edge detection to input image
 * Uses OpenCV.js (required, no fallback)
 */
function CannyNode({ id, data, selected }) {
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    // Config synced to node.data for export
    const [config, setConfig] = useNodeConfig(id, {
        threshold1: data.threshold1 ?? 50,
        threshold2: data.threshold2 ?? 150,
    })
    const { threshold1, threshold2 } = config

    const handleThreshold1Change = useCallback((value) => {
        setConfig({ threshold1: value })
    }, [setConfig])

    const handleThreshold2Change = useCallback((value) => {
        setConfig({ threshold2: value })
    }, [setConfig])

    const processingOptions = useMemo(() => ({
        threshold1,
        threshold2,
    }), [threshold1, threshold2])

    const handleProcessingComplete = useCallback((result) => {
        updateOutput({
            image: createImagePayload({
                imageUrl: result.outputUrl,
                metadata: result.metadata,
            })
        })
    }, [updateOutput])

    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processCanny,
        inputImageUrl,
        processingOptions,
        handleProcessingComplete,
        [threshold1, threshold2]
    )

    const optionsContent = (
        <>
            <Slider
                label="Low Threshold"
                value={threshold1}
                onChange={handleThreshold1Change}
                min={0}
                max={500}
                step={1}
                showValue
            />
            <Slider
                label="High Threshold"
                value={threshold2}
                onChange={handleThreshold2Change}
                min={0}
                max={500}
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

export default memo(CannyNode)
