import React, { memo, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes, createImagePayload } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { useNodeConfig } from '@/hooks/useNodeConfig'
import { processThreshold } from '@/services/imageProcessor'
import { DualSlider } from '@/components/ui/dual-slider'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'

/**
 * ThresholdNode - Applies adaptive range thresholding to input image
 * Detects channels from input metadata and provides sliders for each.
 */
function ThresholdNode({ id, data, selected }) {
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    const metadata = inputData?.metadata || { channels: 3, colorSpace: 'RGB' }
    const channelCount = metadata.channels || 3
    const colorSpace = metadata.colorSpace || 'RGB'

    // Config synced to node.data for export
    const [config, setConfig] = useNodeConfig(id, {
        ranges: data.ranges || [[0, 255], [0, 255], [0, 255]],
        mode: data.mode || 'select',
    })
    const { ranges, mode } = config

    const handleRangeChange = useCallback((channelIndex, newRange) => {
        setConfig(prev => {
            const next = [...prev.ranges]
            while (next.length <= channelIndex) next.push([0, 255])
            next[channelIndex] = newRange
            return { ...prev, ranges: next }
        })
    }, [setConfig])

    const processingOptions = useMemo(() => {
        const effectiveRanges = []
        for (let i = 0; i < channelCount; i++) {
            effectiveRanges.push(ranges[i] || [0, 255])
        }
        return {
            ranges: effectiveRanges,
            mode,
            metadata,
        }
    }, [ranges, mode, channelCount, metadata])

    const handleProcessingComplete = useCallback((result) => {
        updateOutput({
            image: createImagePayload({
                imageUrl: result.outputUrl,
                metadata: result.metadata,
            })
        })
    }, [updateOutput])

    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processThreshold,
        inputImageUrl,
        processingOptions,
        handleProcessingComplete,
        [ranges, mode, channelCount]
    )

    const getChannelLabel = (index) => {
        if (channelCount === 1) return 'Grayscale'
        if (colorSpace === 'RGB') return ['Red', 'Green', 'Blue'][index] || `Channel ${index + 1}`
        if (colorSpace === 'HSV') return ['Hue', 'Saturation', 'Value'][index] || `Channel ${index + 1}`
        return `Channel ${index + 1}`
    }

    const optionsContent = (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground mr-2">Mode:</span>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id={`mode-${id}`}
                        checked={mode === 'filter'}
                        onCheckedChange={(checked) => setConfig({ mode: checked ? 'filter' : 'select' })}
                    />
                    <Label htmlFor={`mode-${id}`} className="text-xs font-normal">
                        Reject Selection (Keep Outside)
                    </Label>
                </div>
            </div>

            <Separator />

            {Array.from({ length: channelCount }).map((_, i) => (
                <DualSlider
                    key={i}
                    label={getChannelLabel(i)}
                    value={ranges[i] || [0, 255]}
                    onChange={(val) => handleRangeChange(i, val)}
                    min={0}
                    max={255}
                    showValue
                />
            ))}
        </div>
    )

    return (
        <ExpandableNode
            id={id}
            title="Threshold"
            inputs={[{ id: 'image-in' }]}
            outputs={[{ id: 'image-out' }]}
            selected={selected}
            image={data.image}
            isProcessing={isProcessing}
            isWaitingForOpenCV={isWaitingForOpenCV}
            error={error}
            isConnected={isConnected}
            options={optionsContent}
            className="w-[260px]"
        />
    )
}

export default memo(ThresholdNode)
