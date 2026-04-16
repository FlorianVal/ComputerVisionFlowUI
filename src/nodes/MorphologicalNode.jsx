import React, { memo, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes, createImagePayload } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { useNodeConfig } from '@/hooks/useNodeConfig'
import { processMorphology } from '@/services/imageProcessor'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

/**
 * MorphologicalNode - Applies Morphological transformations (Erosion/Dilation)
 * Uses OpenCV.js (required, no fallback)
 */
function MorphologicalNode({ id, data, selected }) {
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    // Config synced to node.data for export
    const [config, setConfig] = useNodeConfig(id, {
        operation: data.operation ?? 'erode',
        iterations: data.iterations ?? 1,
    })
    const { operation, iterations } = config

    const handleOperationChange = useCallback((value) => {
        setConfig({ operation: value })
    }, [setConfig])

    const handleIterationsChange = useCallback((value) => {
        setConfig({ iterations: value })
    }, [setConfig])

    const processingOptions = useMemo(() => ({
        operation,
        iterations,
        metadata: inputData?.metadata
    }), [operation, iterations, inputData])

    const handleProcessingComplete = useCallback((result) => {
        updateOutput({
            image: createImagePayload({
                imageUrl: result.outputUrl,
                metadata: result.metadata,
            })
        })
    }, [updateOutput])

    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processMorphology,
        inputImageUrl,
        processingOptions,
        handleProcessingComplete,
        [operation, iterations]
    )

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
            image={data.image}
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
