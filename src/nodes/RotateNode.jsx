import React, { memo, useState, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { processRotate } from '@/services/imageProcessor'
import { Slider } from '@/components/ui/slider'

/**
 * RotateNode - Rotates input image by a configurable angle
 */
function RotateNode({ id, data, selected }) {
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    const [angle, setAngle] = useState(data.angle ?? 0)

    const handleAngleChange = useCallback((v) => setAngle(v), [])

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
