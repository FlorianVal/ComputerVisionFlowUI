import React, { memo, useState, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes, createImagePayload } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { processColorConvert } from '@/services/imageProcessor'
import { Select } from '@/components/ui/select'

const conversionOptions = [
    { value: 'rgb2hsv',   label: 'RGB → HSV'   },
    { value: 'rgb2lab',   label: 'RGB → LAB'   },
    { value: 'rgb2ycrcb', label: 'RGB → YCrCb' },
    { value: 'hsv2rgb',   label: 'HSV → RGB'   },
    { value: 'lab2rgb',   label: 'LAB → RGB'   },
    { value: 'ycrcb2rgb', label: 'YCrCb → RGB' },
]

/**
 * ColorConvertNode - Convert image between color spaces (RGB ↔ HSV / LAB / YCrCb)
 * Uses OpenCV.js (required, no fallback)
 */
function ColorConvertNode({ id, data, selected }) {
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const updateOutput = useNodeOutput(id)

    const [conversion, setConversion] = useState(data.conversion ?? 'rgb2hsv')

    const processingOptions = useMemo(() => ({
        conversion,
        metadata: inputData?.metadata,
    }), [conversion, inputData])

    const handleProcessingComplete = useCallback((result) => {
        updateOutput({
            image: createImagePayload({
                imageUrl: result.outputUrl,
                metadata: result.metadata,
            })
        })
    }, [updateOutput])

    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processColorConvert,
        inputData?.imageUrl,
        processingOptions,
        handleProcessingComplete,
        [conversion]
    )

    const optionsContent = (
        <Select
            label="Conversion"
            value={conversion}
            onChange={setConversion}
            options={conversionOptions}
        />
    )

    return (
        <ExpandableNode
            id={id}
            title="Color Convert"
            inputs={[{ id: 'image-in' }]}
            outputs={[{ id: 'image-out' }]}
            selected={selected}
            image={data.image}
            isProcessing={isProcessing}
            isWaitingForOpenCV={isWaitingForOpenCV}
            error={error}
            isConnected={isConnected}
            showPreview={false}
            options={optionsContent}
            className="w-[220px]"
        />
    )
}

export default memo(ColorConvertNode)
