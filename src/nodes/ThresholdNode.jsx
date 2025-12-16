import React, { memo, useState, useCallback, useMemo, useEffect } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
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
    // 1. Get input
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    // Detect channels and color space from metadata
    const metadata = inputData?.metadata || { channels: 3, colorSpace: 'RGB' }
    const channelCount = metadata.channels || 3
    const colorSpace = metadata.colorSpace || 'RGB'

    // State for ranges
    // We store ranges as an object { 0: [0, 255], 1: [0, 255], ... } to be safe
    // But array is cleaner? Let's use array of arrays.
    // However, if channel count changes, we need to adapt.
    // Initial state: 3 channels default
    const [ranges, setRanges] = useState(data.ranges || [[0, 255], [0, 255], [0, 255]])

    // Mode: 'select' (keep inside) or 'filter' (keep outside)
    // Using a boolean "invert" for simpler UI logic?
    // User asked for "radio group to select if we want to filter what is inside... or select what is inside"
    const [mode, setMode] = useState(data.mode || 'select')

    // Effect to adjust ranges array if channel count changes dramatically
    // But we don't want to reset if it's just a re-render.
    // For now, we'll just slice or pad ranges in the memo.

    const handleRangeChange = useCallback((channelIndex, newRange) => {
        setRanges(prev => {
            const next = [...prev]
            // Ensure array exists up to index
            while (next.length <= channelIndex) next.push([0, 255])
            next[channelIndex] = newRange
            return next
        })
    }, [])

    const toggleMode = useCallback(() => {
        setMode(prev => prev === 'select' ? 'filter' : 'select')
    }, [])

    // Memoize options
    const processingOptions = useMemo(() => {
        // Prepare ranges matches expected channel count
        // If Gray (1 channel), we send only 1 range
        const effectiveRanges = []
        for (let i = 0; i < channelCount; i++) {
            effectiveRanges.push(ranges[i] || [0, 255])
        }
        return {
            ranges: effectiveRanges,
            mode
        }
    }, [ranges, mode, channelCount])

    // Callback when processing completes
    const handleProcessingComplete = useCallback((result) => {
        updateOutput({
            imageUrl: result.outputUrl,
            metadata: result.metadata
        })
    }, [updateOutput])

    // Use processor hook
    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processThreshold,
        inputImageUrl,
        processingOptions,
        handleProcessingComplete,
        [ranges, mode, channelCount]
    )

    // Helper to get Channel Label
    const getChannelLabel = (index) => {
        if (channelCount === 1) return 'Grayscale'
        if (colorSpace === 'RGB') return ['Red', 'Green', 'Blue'][index] || `Channel ${index + 1}`
        if (colorSpace === 'HSV') return ['Hue', 'Saturation', 'Value'][index] || `Channel ${index + 1}`
        return `Channel ${index + 1}`
    }

    // Options UI
    const optionsContent = (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground mr-2">Mode:</span>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id={`mode-${id}`}
                        checked={mode === 'filter'}
                        onCheckedChange={(checked) => setMode(checked ? 'filter' : 'select')}
                    />
                    <Label htmlFor={`mode-${id}`} className="text-xs font-normal">
                        Reject Selection (Keep Outside)
                    </Label>
                </div>
            </div>

            <Separator />

            {/* Sliders loop */}
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
            imageUrl={data.imageUrl}
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
