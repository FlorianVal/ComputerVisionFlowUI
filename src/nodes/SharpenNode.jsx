import React, { memo, useState, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { processSharpen } from '@/services/imageProcessor'
import { Slider } from '@/components/ui/slider'

/**
 * SharpenNode - Applies unsharp masking to sharpen the input image
 * Uses OpenCV.js (required, no fallback)
 */
function SharpenNode({ id, data, selected }) {
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    const [strength, setStrength] = useState(data.strength ?? 1.0)
    const [radius, setRadius] = useState(data.radius ?? 3)

    const handleStrengthChange = useCallback((value) => setStrength(value), [])
    const handleRadiusChange = useCallback((value) => setRadius(value), [])

    const options = useMemo(() => ({
        strength,
        radius,
        metadata: inputData?.metadata
    }), [strength, radius, inputData])

    const onComplete = useCallback((result) => {
        updateOutput({ imageUrl: result.outputUrl, metadata: result.metadata })
    }, [updateOutput])

    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processSharpen,
        inputImageUrl,
        options,
        onComplete,
        [strength, radius]
    )

    const optionsContent = (
        <>
            <Slider
                label="Strength"
                value={strength}
                onChange={handleStrengthChange}
                min={0}
                max={2}
                step={0.05}
                showValue
            />
            <Slider
                label="Radius"
                value={radius}
                onChange={handleRadiusChange}
                min={1}
                max={15}
                step={2}
                showValue
            />
        </>
    )

    return (
        <ExpandableNode
            id={id}
            title="Sharpen"
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

export default memo(SharpenNode)
