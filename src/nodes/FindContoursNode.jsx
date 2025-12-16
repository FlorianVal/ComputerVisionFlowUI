import React, { memo, useState, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { processFindContours } from '@/services/imageProcessor'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

/**
 * FindContoursNode - Detects and draws contours on a mask
 * Uses OpenCV.js (required, no fallback)
 */
function FindContoursNode({ id, data, selected }) {
    // Use the data hooks
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    // Options state
    // Store boolean as string for RadioGroup, or convert back and forth
    const [mode, setMode] = useState(data.fill ? 'filled' : 'outline')

    // Handle mode change
    const handleModeChange = useCallback((value) => {
        setMode(value)
    }, [])

    // Memoize options to avoid unnecessary reprocessing
    const processingOptions = useMemo(() => ({
        fill: mode === 'filled',
    }), [mode])

    // Callback when processing completes
    const handleProcessingComplete = useCallback((result) => {
        updateOutput({
            imageUrl: result.outputUrl,
            metadata: result.metadata
        })
    }, [updateOutput])

    // Use the image processor hook
    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processFindContours,
        inputImageUrl,
        processingOptions,
        handleProcessingComplete,
        [mode] // Reprocess when options change
    )

    // Options content for the expandable panel
    const optionsContent = (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Draw Mode</Label>
                <RadioGroup value={mode} onValueChange={handleModeChange} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="outline" id={`outline-${id}`} />
                        <Label htmlFor={`outline-${id}`}>Outline</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="filled" id={`filled-${id}`} />
                        <Label htmlFor={`filled-${id}`}>Filled</Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    )

    return (
        <ExpandableNode
            id={id}
            title="Find Contours"
            inputs={[{ id: 'image-in' }]}
            outputs={[{ id: 'image-out' }]}
            selected={selected}
            imageUrl={data.imageUrl}
            isProcessing={isProcessing}
            isWaitingForOpenCV={isWaitingForOpenCV}
            error={error}
            isConnected={isConnected}
            options={optionsContent}
            className="w-[240px]"
        />
    )
}

export default memo(FindContoursNode)
