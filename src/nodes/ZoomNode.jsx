import React, { memo, useCallback, useMemo, useState } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { processZoom } from '@/services/imageProcessor'
import { Slider } from '@/components/ui/slider'

/**
 * ZoomNode - Zooms into the input image by a configurable factor
 */
function ZoomNode({ id, data, selected }) {
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    const [zoom, setZoom] = useState(data.zoom ?? 1.2)
    const [focusX, setFocusX] = useState(data.focusX ?? 0.5)
    const [focusY, setFocusY] = useState(data.focusY ?? 0.5)

    const handleZoomChange = useCallback((value) => setZoom(value), [])
    const handleFocusXChange = useCallback((value) => setFocusX(value), [])
    const handleFocusYChange = useCallback((value) => setFocusY(value), [])

    const processingOptions = useMemo(() => ({
        zoom,
        focusX,
        focusY,
        metadata: inputData?.metadata
    }), [zoom, focusX, focusY, inputData])

    const handleProcessingComplete = useCallback((result) => {
        updateOutput({ imageUrl: result.outputUrl, metadata: result.metadata })
    }, [updateOutput])

    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processZoom,
        inputImageUrl,
        processingOptions,
        handleProcessingComplete,
        [zoom, focusX, focusY]
    )

    const optionsContent = (
        <>
            <Slider
                label="Zoom"
                value={zoom}
                onChange={handleZoomChange}
                min={1}
                max={3}
                step={0.1}
                showValue
            />
            <Slider
                label="Focus X"
                value={focusX}
                onChange={handleFocusXChange}
                min={0}
                max={1}
                step={0.01}
                showValue
            />
            <Slider
                label="Focus Y"
                value={focusY}
                onChange={handleFocusYChange}
                min={0}
                max={1}
                step={0.01}
                showValue
            />
        </>
    )

    return (
        <ExpandableNode
            id={id}
            title="Zoom"
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

export default memo(ZoomNode)
