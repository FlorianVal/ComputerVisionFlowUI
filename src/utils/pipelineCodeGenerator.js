/**
 * Pipeline Code Generator
 *
 * Converts a VisioFlow node/edge graph into runnable Python (cv2) or
 * JavaScript (OpenCV.js) code that reproduces the same processing pipeline.
 *
 * Traversal algorithm:
 *   Starting from each imageSource node, a DFS collects every root-to-leaf
 *   path through the graph. Each path becomes one self-contained pipeline.
 *   When a node has multiple output edges (a branch/fork), each outgoing
 *   branch produces its own pipeline — inheriting all operations accumulated
 *   up to that fork point. Execution ends when a node with no outputs is
 *   reached (leaf).
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert a node id like "blur-1" → a valid variable name like "img_blur_1" */
function varName(nodeId) {
    return 'img_' + nodeId.replace(/[^a-zA-Z0-9]/g, '_')
}

/** Sanitize a node id for use as an identifier suffix */
function safeSuffix(nodeId) {
    return nodeId.replace(/[^a-zA-Z0-9]/g, '_')
}

// ─── Graph Traversal ─────────────────────────────────────────────────────────

/**
 * Recursively collect all root-to-leaf paths starting from nodeId.
 *
 * @param {string}   nodeId       - Current node being visited
 * @param {object[]} currentPath  - Nodes accumulated so far on this path
 * @param {object}   adjacency    - { nodeId: [childId, ...] }
 * @param {object}   nodeMap      - { nodeId: node }
 * @returns {object[][]} Array of complete paths (each path is an array of nodes)
 */
function collectPaths(nodeId, currentPath, adjacency, nodeMap) {
    const node = nodeMap[nodeId]
    if (!node) return []

    const path = [...currentPath, node]
    const children = adjacency[nodeId] || []

    if (children.length === 0) {
        // Leaf node — this path is a complete pipeline
        return [path]
    }

    // Follow every outgoing edge; each branch becomes its own pipeline
    const paths = []
    for (const childId of children) {
        paths.push(...collectPaths(childId, path, adjacency, nodeMap))
    }
    return paths
}

/**
 * Build the ordered list of pipelines from the ReactFlow node/edge arrays.
 *
 * Each imageSource root is the starting point of a DFS. The result is one
 * pipeline per root-to-leaf path. Nodes unreachable from any imageSource
 * are grouped into a "Disconnected Nodes" section.
 *
 * @param {object[]} nodes - ReactFlow nodes
 * @param {object[]} edges - ReactFlow edges
 * @returns {{ label: string, nodes: object[] }[]}
 */
function buildPipelines(nodes, edges) {
    const nodeMap = {}
    for (const node of nodes) nodeMap[node.id] = node

    // Build outgoing-edge adjacency list
    const adjacency = {}
    for (const node of nodes) adjacency[node.id] = []
    for (const edge of edges) {
        if (adjacency[edge.source] !== undefined) {
            adjacency[edge.source].push(edge.target)
        }
    }

    const sources = nodes.filter(n => n.type === 'imageSource')
    const pipelines = []
    let index = 1

    for (const source of sources) {
        const paths = collectPaths(source.id, [], adjacency, nodeMap)
        for (const path of paths) {
            pipelines.push({ label: `Pipeline ${index++}`, nodes: path })
        }
    }

    // Collect nodes not reachable from any imageSource
    const reachable = new Set(pipelines.flatMap(p => p.nodes.map(n => n.id)))
    const orphans = nodes.filter(n => !reachable.has(n.id))
    if (orphans.length > 0) {
        pipelines.push({ label: 'Disconnected Nodes', nodes: orphans })
    }

    return pipelines
}

// ─── Python Code Generation ──────────────────────────────────────────────────

/**
 * Emit Python (cv2) lines for a single node.
 * inputVar is the variable holding the upstream image, or null for source nodes.
 */
function pyNodeCode(node, inputVar) {
    const { id, type, data } = node
    const out = varName(id)
    const s = safeSuffix(id)
    const lines = []

    switch (type) {
        case 'imageSource': {
            const name = data.imageName || 'image.jpg'
            lines.push(`# Image Source`)
            lines.push(`${out} = cv2.imread('${name}')  # Replace with your image path`)
            lines.push(`if ${out} is None:`)
            lines.push(`    raise FileNotFoundError("Image not found: ${name}")`)
            break
        }
        case 'grayscale': {
            lines.push(`# Grayscale`)
            lines.push(`${out} = cv2.cvtColor(${inputVar}, cv2.COLOR_BGR2GRAY)`)
            break
        }
        case 'blur': {
            const strength = data.strength ?? 15
            const blurType = data.blurType ?? 'gaussian'
            const ksize = strength % 2 === 1 ? strength : strength + 1
            lines.push(`# Blur (${blurType}, strength=${strength})`)
            if (blurType === 'gaussian') {
                lines.push(`${out} = cv2.GaussianBlur(${inputVar}, (${ksize}, ${ksize}), 0)`)
            } else if (blurType === 'box') {
                lines.push(`${out} = cv2.blur(${inputVar}, (${ksize}, ${ksize}))`)
            } else {
                lines.push(`${out} = cv2.medianBlur(${inputVar}, ${ksize})`)
            }
            break
        }
        case 'canny': {
            const t1 = data.threshold1 ?? 50
            const t2 = data.threshold2 ?? 150
            lines.push(`# Canny Edge Detection (low=${t1}, high=${t2})`)
            lines.push(`_gray_${s} = cv2.cvtColor(${inputVar}, cv2.COLOR_BGR2GRAY) if len(${inputVar}.shape) == 3 else ${inputVar}`)
            lines.push(`${out} = cv2.Canny(_gray_${s}, ${t1}, ${t2})`)
            break
        }
        case 'morphological': {
            const op = data.operation ?? 'erode'
            const iters = data.iterations ?? 1
            lines.push(`# Morphological: ${op} (iterations=${iters})`)
            lines.push(`_kernel_${s} = np.ones((3, 3), np.uint8)`)
            lines.push(`${out} = cv2.${op}(${inputVar}, _kernel_${s}, iterations=${iters})`)
            break
        }
        case 'findContours': {
            const fill = data.fill ?? false
            const thickness = fill ? -1 : 2
            lines.push(`# Find Contours (${fill ? 'filled' : 'outline'})`)
            lines.push(`_gray_${s} = cv2.cvtColor(${inputVar}, cv2.COLOR_BGR2GRAY) if len(${inputVar}.shape) == 3 else ${inputVar}`)
            lines.push(`_, _binary_${s} = cv2.threshold(_gray_${s}, 127, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)`)
            lines.push(`_contours_${s}, _ = cv2.findContours(_binary_${s}, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)`)
            lines.push(`${out} = np.zeros((${inputVar}.shape[0], ${inputVar}.shape[1], 3), dtype=np.uint8)`)
            lines.push(`cv2.drawContours(${out}, _contours_${s}, -1, (255, 255, 255), ${thickness})`)
            break
        }
        case 'threshold': {
            const ranges = data.ranges ?? [[0, 255]]
            const mode = data.mode ?? 'select'
            lines.push(`# Threshold (${mode} mode)`)
            if (ranges.length === 1) {
                const [lo, hi] = ranges[0]
                lines.push(`_lower_${s} = np.array([${lo}])`)
                lines.push(`_upper_${s} = np.array([${hi}])`)
                lines.push(`_mask_${s} = cv2.inRange(${inputVar}, _lower_${s}, _upper_${s})`)
            } else {
                const lowers = ranges.map(r => r[0]).join(', ')
                const uppers = ranges.map(r => r[1]).join(', ')
                lines.push(`_lower_${s} = np.array([${lowers}])`)
                lines.push(`_upper_${s} = np.array([${uppers}])`)
                lines.push(`_mask_${s} = cv2.inRange(${inputVar}[:, :, :3], _lower_${s}, _upper_${s})`)
            }
            if (mode === 'filter') {
                lines.push(`_mask_${s} = cv2.bitwise_not(_mask_${s})  # filter: keep outside range`)
            }
            lines.push(`${out} = cv2.bitwise_and(${inputVar}, ${inputVar}, mask=_mask_${s})`)
            break
        }
        case 'rotate': {
            const angle = data.angle ?? 0
            lines.push(`# Rotate (${angle} degrees)`)
            lines.push(`_h_${s}, _w_${s} = ${inputVar}.shape[:2]`)
            lines.push(`_center_${s} = (_w_${s} // 2, _h_${s} // 2)`)
            lines.push(`_M_${s} = cv2.getRotationMatrix2D(_center_${s}, ${angle}, 1.0)`)
            lines.push(`${out} = cv2.warpAffine(${inputVar}, _M_${s}, (_w_${s}, _h_${s}))`)
            break
        }
        case 'brightness': {
            const brightness = data.brightness ?? 0
            const contrast = data.contrast ?? 1.0
            lines.push(`# Brightness/Contrast (brightness=${brightness}, contrast=${contrast})`)
            lines.push(`${out} = cv2.convertScaleAbs(${inputVar}, alpha=${contrast}, beta=${brightness})`)
            break
        }
        case 'invert': {
            lines.push(`# Invert Colors`)
            lines.push(`${out} = cv2.bitwise_not(${inputVar})`)
            break
        }
        default: {
            lines.push(`# Unknown node type: ${type}`)
            lines.push(`${out} = ${inputVar}  # passthrough`)
        }
    }

    return { lines, outVar: out }
}

function generatePythonCode(nodes, edges) {
    const pipelines = buildPipelines(nodes, edges)
    const parts = []

    parts.push('import cv2')
    parts.push('import numpy as np')

    for (const { label, nodes: pathNodes } of pipelines) {
        parts.push('')
        parts.push(`# ${'='.repeat(60)}`)
        parts.push(`# ${label}`)
        parts.push(`# ${'='.repeat(60)}`)

        // Walk the path sequentially; each node receives the previous node's output
        let inputVar = null
        for (const node of pathNodes) {
            const { lines, outVar } = pyNodeCode(node, inputVar)
            parts.push('')
            parts.push(...lines)
            inputVar = outVar
        }

        // Show the final result
        const lastNode = pathNodes[pathNodes.length - 1]
        if (lastNode && lastNode.type !== 'imageSource' && inputVar) {
            parts.push('')
            parts.push(`# Display result`)
            parts.push(`cv2.imshow('${label}', ${inputVar})`)
        }
    }

    parts.push('')
    parts.push('cv2.waitKey(0)')
    parts.push('cv2.destroyAllWindows()')

    return parts.join('\n')
}

// ─── JavaScript Code Generation ──────────────────────────────────────────────

/**
 * Emit OpenCV.js lines for a single node.
 * inputVar is the variable holding the upstream cv.Mat, or null for source nodes.
 */
function jsNodeCode(node, inputVar) {
    const { id, type, data } = node
    const out = varName(id)
    const s = safeSuffix(id)
    const lines = []

    switch (type) {
        case 'imageSource': {
            const name = data.imageName || 'image.jpg'
            lines.push(`// Image Source (${name})`)
            lines.push(`// Replace 'inputImage' with your <img> or <canvas> element id`)
            lines.push(`const imgEl_${s} = document.getElementById('inputImage');`)
            lines.push(`let ${out} = cv.imread(imgEl_${s});`)
            break
        }
        case 'grayscale': {
            lines.push(`// Grayscale`)
            lines.push(`let ${out} = new cv.Mat();`)
            lines.push(`cv.cvtColor(${inputVar}, ${out}, cv.COLOR_RGBA2GRAY);`)
            break
        }
        case 'blur': {
            const strength = data.strength ?? 15
            const blurType = data.blurType ?? 'gaussian'
            const ksize = strength % 2 === 1 ? strength : strength + 1
            lines.push(`// Blur (${blurType}, strength=${strength})`)
            lines.push(`let ${out} = new cv.Mat();`)
            if (blurType === 'gaussian') {
                lines.push(`cv.GaussianBlur(${inputVar}, ${out}, new cv.Size(${ksize}, ${ksize}), 0);`)
            } else if (blurType === 'box') {
                lines.push(`cv.blur(${inputVar}, ${out}, new cv.Size(${ksize}, ${ksize}));`)
            } else {
                lines.push(`cv.medianBlur(${inputVar}, ${out}, ${ksize});`)
            }
            break
        }
        case 'canny': {
            const t1 = data.threshold1 ?? 50
            const t2 = data.threshold2 ?? 150
            lines.push(`// Canny Edge Detection (low=${t1}, high=${t2})`)
            lines.push(`let _gray_${s} = new cv.Mat();`)
            lines.push(`cv.cvtColor(${inputVar}, _gray_${s}, cv.COLOR_RGBA2GRAY);`)
            lines.push(`let ${out} = new cv.Mat();`)
            lines.push(`cv.Canny(_gray_${s}, ${out}, ${t1}, ${t2}, 3, false);`)
            lines.push(`_gray_${s}.delete();`)
            break
        }
        case 'morphological': {
            const op = data.operation ?? 'erode'
            const iters = data.iterations ?? 1
            lines.push(`// Morphological: ${op} (iterations=${iters})`)
            lines.push(`let _kernel_${s} = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));`)
            lines.push(`let ${out} = new cv.Mat();`)
            lines.push(`cv.${op}(${inputVar}, ${out}, _kernel_${s}, new cv.Point(-1, -1), ${iters});`)
            lines.push(`_kernel_${s}.delete();`)
            break
        }
        case 'findContours': {
            const fill = data.fill ?? false
            const thickness = fill ? -1 : 2
            lines.push(`// Find Contours (${fill ? 'filled' : 'outline'})`)
            lines.push(`let _gray_${s} = new cv.Mat();`)
            lines.push(`cv.cvtColor(${inputVar}, _gray_${s}, cv.COLOR_RGBA2GRAY);`)
            lines.push(`let _binary_${s} = new cv.Mat();`)
            lines.push(`cv.threshold(_gray_${s}, _binary_${s}, 127, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);`)
            lines.push(`_gray_${s}.delete();`)
            lines.push(`let _contours_${s} = new cv.MatVector();`)
            lines.push(`let _hier_${s} = new cv.Mat();`)
            lines.push(`cv.findContours(_binary_${s}, _contours_${s}, _hier_${s}, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);`)
            lines.push(`_binary_${s}.delete(); _hier_${s}.delete();`)
            lines.push(`let ${out} = new cv.Mat(${inputVar}.rows, ${inputVar}.cols, cv.CV_8UC4, new cv.Scalar(0, 0, 0, 255));`)
            lines.push(`cv.drawContours(${out}, _contours_${s}, -1, new cv.Scalar(255, 255, 255, 255), ${thickness});`)
            lines.push(`_contours_${s}.delete();`)
            break
        }
        case 'threshold': {
            const ranges = data.ranges ?? [[0, 255]]
            const mode = data.mode ?? 'select'
            lines.push(`// Threshold (${mode} mode, ${ranges.length} channel(s))`)
            if (ranges.length === 1) {
                const [lo, hi] = ranges[0]
                lines.push(`let _lower_${s} = new cv.Mat(${inputVar}.rows, ${inputVar}.cols, ${inputVar}.type(), new cv.Scalar(${lo}));`)
                lines.push(`let _upper_${s} = new cv.Mat(${inputVar}.rows, ${inputVar}.cols, ${inputVar}.type(), new cv.Scalar(${hi}));`)
                lines.push(`let _mask_${s} = new cv.Mat();`)
                lines.push(`cv.inRange(${inputVar}, _lower_${s}, _upper_${s}, _mask_${s});`)
                lines.push(`_lower_${s}.delete(); _upper_${s}.delete();`)
            } else {
                lines.push(`let _chans_${s} = new cv.MatVector();`)
                lines.push(`cv.split(${inputVar}, _chans_${s});`)
                lines.push(`let _mask_${s} = null;`)
                for (let i = 0; i < ranges.length; i++) {
                    const [lo, hi] = ranges[i]
                    lines.push(`{`)
                    lines.push(`  const ch = _chans_${s}.get(${i});`)
                    lines.push(`  const lo = new cv.Mat(ch.rows, ch.cols, ch.type(), new cv.Scalar(${lo}));`)
                    lines.push(`  const hi = new cv.Mat(ch.rows, ch.cols, ch.type(), new cv.Scalar(${hi}));`)
                    lines.push(`  const m = new cv.Mat();`)
                    lines.push(`  cv.inRange(ch, lo, hi, m);`)
                    lines.push(`  lo.delete(); hi.delete();`)
                    if (i === 0) {
                        lines.push(`  _mask_${s} = m;`)
                    } else {
                        lines.push(`  const tmp = new cv.Mat(); cv.bitwise_and(_mask_${s}, m, tmp); _mask_${s}.delete(); m.delete(); _mask_${s} = tmp;`)
                    }
                    lines.push(`}`)
                }
                lines.push(`_chans_${s}.delete();`)
            }
            if (mode === 'filter') {
                lines.push(`// filter mode: invert mask to keep outside range`)
                lines.push(`let _invMask_${s} = new cv.Mat(); cv.bitwise_not(_mask_${s}, _invMask_${s}); _mask_${s}.delete(); _mask_${s} = _invMask_${s};`)
            }
            lines.push(`let ${out} = new cv.Mat(${inputVar}.rows, ${inputVar}.cols, cv.CV_8UC4, new cv.Scalar(0, 0, 0, 255));`)
            lines.push(`${inputVar}.copyTo(${out}, _mask_${s});`)
            lines.push(`_mask_${s}.delete();`)
            break
        }
        case 'rotate': {
            const angle = data.angle ?? 0
            lines.push(`// Rotate (${angle} degrees)`)
            lines.push(`let _center_${s} = new cv.Point(${inputVar}.cols / 2, ${inputVar}.rows / 2);`)
            lines.push(`let _M_${s} = cv.getRotationMatrix2D(_center_${s}, ${angle}, 1.0);`)
            lines.push(`let ${out} = new cv.Mat();`)
            lines.push(`cv.warpAffine(${inputVar}, ${out}, _M_${s}, new cv.Size(${inputVar}.cols, ${inputVar}.rows), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(0, 0, 0, 255));`)
            lines.push(`_M_${s}.delete();`)
            break
        }
        case 'brightness': {
            const brightness = data.brightness ?? 0
            const contrast = data.contrast ?? 1.0
            lines.push(`// Brightness/Contrast (brightness=${brightness}, contrast=${contrast})`)
            lines.push(`let ${out} = new cv.Mat();`)
            lines.push(`cv.convertScaleAbs(${inputVar}, ${out}, ${contrast}, ${brightness});`)
            break
        }
        case 'invert': {
            lines.push(`// Invert Colors`)
            lines.push(`let ${out} = new cv.Mat();`)
            lines.push(`cv.bitwise_not(${inputVar}, ${out});`)
            break
        }
        default: {
            lines.push(`// Unknown node type: ${type}`)
            lines.push(`let ${out} = ${inputVar}.clone();  // passthrough`)
        }
    }

    return { lines, outVar: out }
}

function generateJSCode(nodes, edges) {
    const pipelines = buildPipelines(nodes, edges)
    const parts = []

    parts.push('// VisioFlow — Exported Pipeline (OpenCV.js)')
    parts.push('//')
    parts.push('// Prerequisites:')
    parts.push('//   <script async src="https://docs.opencv.org/4.x/opencv.js"></script>')
    parts.push('//')
    parts.push('// Each pipeline runs in its own block scope ({ }) to avoid variable')
    parts.push('// conflicts between branches. Call .delete() on all cv.Mat objects')
    parts.push('// when done to free WASM memory.')
    parts.push('')
    parts.push('async function runPipeline() {')
    parts.push('  // Wait for OpenCV.js to finish loading')
    parts.push('  await new Promise(resolve => {')
    parts.push("    if (typeof cv !== 'undefined' && cv.Mat) { resolve(); }")
    parts.push("    else { cv['onRuntimeInitialized'] = resolve; }")
    parts.push('  });')

    for (const { label, nodes: pathNodes } of pipelines) {
        parts.push('')
        parts.push(`  // ${'─'.repeat(56)}`)
        parts.push(`  // ${label}`)
        parts.push(`  // ${'─'.repeat(56)}`)
        // Each pipeline is isolated in its own block to avoid let re-declaration
        // conflicts when multiple pipelines share the same node ids
        parts.push(`  {`)

        const allVars = []
        let inputVar = null

        for (const node of pathNodes) {
            const { lines, outVar } = jsNodeCode(node, inputVar)
            parts.push('')
            for (const line of lines) parts.push(`    ${line}`)
            inputVar = outVar
            allVars.push(outVar)
        }

        // Display the leaf node's output
        const lastNode = pathNodes[pathNodes.length - 1]
        if (lastNode && lastNode.type !== 'imageSource' && inputVar) {
            const canvasVar = `outCanvas_${safeSuffix(lastNode.id)}`
            parts.push('')
            parts.push(`    // Display result on canvas`)
            parts.push(`    const ${canvasVar} = document.getElementById('outputCanvas');  // Replace with your <canvas>`)
            parts.push(`    cv.imshow(${canvasVar}, ${inputVar});`)
        }

        // Free all allocated Mats
        if (allVars.length > 0) {
            parts.push('')
            parts.push(`    // Free memory`)
            parts.push(`    ${allVars.map(v => `${v}.delete()`).join('; ')};`)
        }

        parts.push(`  }`)
    }

    parts.push('}')
    parts.push('')
    parts.push('runPipeline();')

    return parts.join('\n')
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate code reproducing the pipeline.
 * @param {object[]} nodes - ReactFlow nodes (current data from getNodes())
 * @param {object[]} edges - ReactFlow edges
 * @param {'python'|'javascript'} language
 * @returns {string} Generated source code
 */
export function generateCode(nodes, edges, language) {
    if (language === 'python') return generatePythonCode(nodes, edges)
    if (language === 'javascript') return generateJSCode(nodes, edges)
    throw new Error(`Unknown language: ${language}`)
}
