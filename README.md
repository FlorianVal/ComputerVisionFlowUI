# VisioFlow

VisioFlow is a powerful, node-based computer vision pipeline editor built with React and OpenCV.js. It allows users to visually design and execute image processing workflows directly in the browser with high performance and real-time feedback.

<p align="center">
  <img src="asset/screenshot.png" alt="VisioFlow Screenshot" width="700">
</p>

## ✨ Features

- **Visual Pipeline Editor**: Intuitive drag-and-drop interface powered by **ReactFlow**.
- **Real-time Processing**: High-performance image manipulation powered by **OpenCV.js (WebAssembly)**.
- **Async Architecture**: Non-blocking UI using asynchronous processing patterns for smooth interactions during heavy computation.
- **Live Previews**: Every node provides a real-time visual preview of its processing result.
- **Smart UI Components**: Dynamic controls that adapt to input data (e.g., Threshold sliders that adapt to channel count).
- **Extensible System**: Modular architecture designed for effortless addition of new computer vision nodes.
- **Export Code**: Generate runnable Python (`cv2`) or JavaScript (OpenCV.js) code for any pipeline with one click.

## 🛠 Available Nodes

### Input
- **Image Source**: Load images from your local file system or via URL.

### Filters & Processing
- **Grayscale**: High-performance conversion to grayscale.
- **Gaussian Blur**: Soften images with adjustable strength and blur types (Gaussian, Box, Median).
- **Canny Edge Detection**: Detect precise edges with dual-threshold hysteresis.
- **Threshold**: Multi-channel adaptive thresholding with support for RGB and Grayscale ranges.
- **Morphological Ops**: Apply Erosion and Dilation with configurable iterations for mask refinement.
- **Find Contours**: Detect and draw object boundaries with optional filling for masking.

### Transformations
- **Rotate**: Rotate images by any angle.
- **Brightness**: Adjust image brightness and contrast levels.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher recommended
- **npm**: v9 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/FlorianVal/ComputerVisionFlowUI.git
   cd ComputerVisionFlowUI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:5173`.

## 🏗 Architecture

VisioFlow is built with a modern, decoupled architecture:
- **ReactFlow**: Canvas orchestration and graph state management.
- **OpenCV.js**: WASM-powered engine for core image processing.
- **Custom Data Layer**: Type-safe communication between nodes with automatic validation.
- **Service Layer**: Pure, async image processing logic separated from UI components.

## 📁 Project Structure

```
src/
├── nodes/                  # Node components + registry
│   ├── index.js            # nodeTypes registry — register new nodes here
│   ├── base/               # BaseNode, ExpandableNode base classes
│   └── *.jsx               # One file per node type
├── services/
│   └── imageProcessor.js   # Pure async OpenCV.js processing functions
├── utils/
│   └── pipelineCodeGenerator.js  # Python/JS code generation for export
├── hooks/
│   ├── useImageProcessor.js  # Orchestrates async processing lifecycle
│   ├── useNodeConfig.js      # Config state synced to node.data (for export)
│   └── useOpenCV.js          # Access OpenCV context
├── data/
│   ├── types.js              # DataTypes + DataSchemas (IMAGE, NUMBER, ANY)
│   ├── useNodeInput.js       # Read validated data from upstream node
│   └── useNodeOutput.js      # Write output data to ReactFlow store
├── components/
│   ├── AddNodeMenu.jsx       # Floating menu to add nodes to canvas
│   ├── ExportModal.jsx       # Python/JS code export modal
│   └── ui/                  # Reusable UI primitives (Button, Slider, etc.)
└── contexts/
    └── OpenCVContext.jsx     # Loads OpenCV.js WASM, provides cv instance
```

## ➕ Adding a New Node

Adding a node requires changes in **4 places**. The example below implements a **Flip** node (horizontal / vertical image flip).

---

### Step 1 — Add the processing function (`src/services/imageProcessor.js`)

All image processing is done in pure async functions using OpenCV.js. Add a new exported function at the bottom of the file:

```js
/**
 * Flip an image horizontally, vertically, or both.
 * @param {string} imageUrl - Input image URL
 * @param {object} cv - OpenCV instance
 * @param {object} options
 * @param {string} options.direction - 'horizontal' | 'vertical' | 'both'
 * @param {object} [options.metadata] - Pass-through metadata
 * @returns {Promise<{outputUrl: string, metadata: object}>}
 */
export async function processFlip(imageUrl, cv, { direction = 'horizontal', metadata } = {}) {
    const { canvas, ctx, imageData } = await loadImageToCanvas(imageUrl, null)

    let src = null
    let dst = null

    try {
        src = cv.imread(canvas)
        dst = new cv.Mat()

        // OpenCV flipCode: 1 = horizontal, 0 = vertical, -1 = both
        const flipCode = direction === 'horizontal' ? 1 : direction === 'vertical' ? 0 : -1
        cv.flip(src, dst, flipCode)

        const dstData = new Uint8ClampedArray(dst.data)
        for (let i = 0; i < dstData.length; i++) imageData.data[i] = dstData[i]
        ctx.putImageData(imageData, 0, 0)

        return {
            outputUrl: canvas.toDataURL('image/png'),
            metadata: metadata || { colorSpace: 'RGB', channels: 3 },
        }
    } finally {
        if (src) src.delete()
        if (dst) dst.delete()
    }
}
```

---

### Step 2 — Create the node component (`src/nodes/FlipNode.jsx`)

Node components follow a fixed pattern:
- **`useNodeInput`** — reads the image URL from the upstream connected node.
- **`useNodeConfig`** — manages configuration state **and** syncs it to `node.data` so the Export Code feature can always read the latest values.
- **`useNodeOutput`** — writes the processed image URL back to the ReactFlow store.
- **`useImageProcessor`** — runs the processing function asynchronously, re-running whenever inputs or options change.

```jsx
import React, { memo, useCallback, useMemo } from 'react'
import { ExpandableNode } from '@/nodes/base'
import { useNodeInput, useNodeOutput, DataTypes } from '@/data'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { useNodeConfig } from '@/hooks/useNodeConfig'
import { processFlip } from '@/services/imageProcessor'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

function FlipNode({ id, data, selected }) {
    const { data: inputData, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
    const inputImageUrl = inputData?.imageUrl
    const updateOutput = useNodeOutput(id)

    // useNodeConfig syncs config to node.data so Export Code captures live values
    const [config, setConfig] = useNodeConfig(id, {
        direction: data.direction ?? 'horizontal',
    })
    const { direction } = config

    const handleDirectionChange = useCallback((value) => {
        setConfig({ direction: value })
    }, [setConfig])

    const processingOptions = useMemo(() => ({
        direction,
        metadata: inputData?.metadata,
    }), [direction, inputData])

    const handleProcessingComplete = useCallback((result) => {
        updateOutput({ imageUrl: result.outputUrl, metadata: result.metadata })
    }, [updateOutput])

    const { isProcessing, error, isWaitingForOpenCV } = useImageProcessor(
        processFlip,
        inputImageUrl,
        processingOptions,
        handleProcessingComplete,
        [direction]   // re-run when direction changes
    )

    const optionsContent = (
        <div className="space-y-2">
            <Label>Direction</Label>
            <RadioGroup value={direction} onValueChange={handleDirectionChange} className="flex flex-col gap-1">
                {['horizontal', 'vertical', 'both'].map(d => (
                    <div key={d} className="flex items-center space-x-2">
                        <RadioGroupItem value={d} id={`${d}-${id}`} />
                        <Label htmlFor={`${d}-${id}`} className="capitalize">{d}</Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    )

    return (
        <ExpandableNode
            id={id}
            title="Flip"
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

export default memo(FlipNode)
```

> **Node without config options** (e.g. Grayscale, Invert): skip `useNodeConfig` and use `BaseNode` instead of `ExpandableNode`. No options panel is needed.

---

### Step 3 — Register the node (`src/nodes/index.js`)

Import the component and add it to the `nodeTypes` map that ReactFlow uses:

```js
import FlipNode from './FlipNode'

export const nodeTypes = {
    // ...existing entries...
    flip: FlipNode,
}
```

Then add it to the `AddNodeMenu` in `src/components/AddNodeMenu.jsx`:

```js
{
    type: 'flip',               // must match the key in nodeTypes
    label: 'Flip',
    description: 'Flip the image horizontally, vertically, or both',
    icon: FlipHorizontal2,      // import from lucide-react
    category: 'Transform',      // Input | Filter | Transform | Adjust
},
```

---

### Step 4 — Add code generation (`src/utils/pipelineCodeGenerator.js`)

The **Export Code** button generates Python and JavaScript from the live node graph. Add a `case` for the new node type in both `pyNodeCode` and `jsNodeCode` functions.

**In `pyNodeCode`** (generates `cv2` Python):

```js
case 'flip': {
    const direction = data.direction ?? 'horizontal'
    const flipCode = direction === 'horizontal' ? 1 : direction === 'vertical' ? 0 : -1
    lines.push(`# Flip (${direction})`)
    lines.push(`${out} = cv2.flip(${inputVar}, ${flipCode})`)
    break
}
```

**In `jsNodeCode`** (generates OpenCV.js JavaScript):

```js
case 'flip': {
    const direction = data.direction ?? 'horizontal'
    const flipCode = direction === 'horizontal' ? 1 : direction === 'vertical' ? 0 : -1
    lines.push(`// Flip (${direction})`)
    lines.push(`let ${out} = new cv.Mat();`)
    lines.push(`cv.flip(${inputVar}, ${out}, ${flipCode});`)
    break
}
```

> The variable helpers `out` (output variable name) and `inputVar` (the upstream node's variable name) are already provided by the calling code — just use them as shown in the existing cases.

---

### Checklist

| Step | File | What to do |
|---|---|---|
| 1 | `src/services/imageProcessor.js` | Export a `processXxx(imageUrl, cv, options)` function |
| 2 | `src/nodes/XxxNode.jsx` | Component using `useNodeConfig` + `useImageProcessor` |
| 3a | `src/nodes/index.js` | Add to `nodeTypes` map |
| 3b | `src/components/AddNodeMenu.jsx` | Add to `nodeDefinitions` array |
| 4 | `src/utils/pipelineCodeGenerator.js` | Add `case` in `pyNodeCode` and `jsNodeCode` |

## 📄 License

This project is licensed under the [MIT License](LICENSE).
