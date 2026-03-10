import React, { memo, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { useNodeConfig } from '@/hooks/useNodeConfig'
import { processBrightnessContrast } from '@/services/imageProcessor'
import { Slider } from '@/components/ui/slider'

/**
 * BrightnessNode - Adjusts brightness and contrast of input image
 * Uses OpenCV.js (required, no fallback)
 */
function BrightnessNode({ id, data, selected }) {
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    // Config synced to node.data for export
    const [config, setConfig] = useNodeConfig(id, {
        brightness: data.brightness ?? 0,
        contrast: data.contrast ?? 1.0,
    })
    const { brightness, contrast } = config

    const handleBrightnessChange = useCallback((v) => setConfig({ brightness: v }), [setConfig])
    const handleContrastChange = useCallback((v) => setConfig({ contrast: v }), [setConfig])

    const options = useMemo(() => ({ brightness, contrast, metadata: inputData?.metadata }), [brightness, contrast, inputData])

    const onComplete = useCallback((result) => {
        updateOutput({ imageUrl: result.outputUrl, metadata: result.metadata })
    }, [updateOutput])

    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processBrightnessContrast,
        inputImageUrl,
        options,
        onComplete,
        [brightness, contrast]
    )

    const optionsContent = (
        <>
            <Slider
                label="Brightness"
                value={brightness}
                onChange={handleBrightnessChange}
                min={-100}
                max={100}
                step={1}
                showValue
            />
            <Slider
                label="Contrast"
                value={contrast}
                onChange={handleContrastChange}
                min={0}
                max={3}
                step={0.01}
                showValue
            />
        </>
    )

    return (
        <ExpandableNode
            id={id}
            title="Brightness"
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

export default memo(BrightnessNode)
