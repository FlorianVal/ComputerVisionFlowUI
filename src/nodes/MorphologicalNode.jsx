import React, { memo, useState, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { processMorphology } from '@/services/imageProcessor'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

/**
 * MorphologicalNode - Applies Morphological transformations (Erosion/Dilation)
 * Uses OpenCV.js (required, no fallback)
 */
function MorphologicalNode({ id, data, selected }) {
    // Use the data hooks
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    // Options state
    const [operation, setOperation] = useState(data.operation ?? 'erode')
    const [iterations, setIterations] = useState(data.iterations ?? 1)

    // Handle operation change
    const handleOperationChange = useCallback((value) => {
        setOperation(value)
    }, [])

    // Handle iterations change
    const handleIterationsChange = useCallback((value) => {
        setIterations(value)
    }, [])

    // Memoize options to avoid unnecessary reprocessing
    const processingOptions = useMemo(() => ({
        operation,
        iterations,
        metadata: inputData?.metadata // Pass metadata through
    }), [operation, iterations, inputData])

    // Callback when processing completes
    const handleProcessingComplete = useCallback((result) => {
        updateOutput({
            imageUrl: result.outputUrl,
            metadata: result.metadata
        })
    }, [updateOutput])

    // Use the image processor hook
    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processMorphology,
        inputImageUrl,
        processingOptions,
        handleProcessingComplete,
        [operation, iterations] // Reprocess when options change
    )

    // Options content for the expandable panel
    const optionsContent = (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Operation</Label>
                <RadioGroup value={operation} onValueChange={handleOperationChange} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="erode" id={`erode-${id}`} />
                        <Label htmlFor={`erode-${id}`}>Erosion</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dilate" id={`dilate-${id}`} />
                        <Label htmlFor={`dilate-${id}`}>Dilation</Label>
                    </div>
                </RadioGroup>
            </div>

            <Slider
                label="Iterations"
                value={iterations}
                onChange={handleIterationsChange}
                min={1}
                max={10}
                step={1}
                showValue
            />
        </div>
    )

    return (
        <ExpandableNode
            id={id}
            title="Morphology"
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

export default memo(MorphologicalNode)
