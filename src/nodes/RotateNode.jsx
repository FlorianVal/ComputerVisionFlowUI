import React, { memo, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { useNodeConfig } from '@/hooks/useNodeConfig'
import { processRotate } from '@/services/imageProcessor'
import { Slider } from '@/components/ui/slider'

/**
 * RotateNode - Rotates input image by a configurable angle
 */
function RotateNode({ id, data, selected }) {
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    // Config synced to node.data for export
    const [config, setConfig] = useNodeConfig(id, {
        angle: data.angle ?? 0,
    })
    const { angle } = config

    const handleAngleChange = useCallback((v) => setConfig({ angle: v }), [setConfig])

    const processingOptions = useMemo(() => ({ angle, metadata: inputData?.metadata }), [angle, inputData])

    const handleProcessingComplete = useCallback((result) => {
        updateOutput({ imageUrl: result.outputUrl, metadata: result.metadata })
    }, [updateOutput])

    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processRotate,
        inputImageUrl,
        processingOptions,
        handleProcessingComplete,
        [angle]
    )

    const optionsContent = (
        <Slider
            label="Angle"
            value={angle}
            onChange={handleAngleChange}
            min={-180}
            max={180}
            step={1}
            showValue
        />
    )

    return (
        <ExpandableNode
            id={id}
            title="Rotate"
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

export default memo(RotateNode)
