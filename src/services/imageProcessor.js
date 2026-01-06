/**
 * Image Processing Service
 * 
 * Pure async functions for image processing operations using OpenCV.
 * All functions require OpenCV to be loaded - no JS fallbacks.
 * 
 * These functions are designed to be called from React hooks but
 * don't depend on React state themselves.
 */

/**
 * Load an image URL into a canvas and return the canvas, context, and dimensions
 * @param {string} imageUrl - URL of the image to load
 * @param {number|null} maxSize - Maximum dimension for the preview canvas. If null, original size is used.
 * @returns {Promise<{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, height: number, imageData: ImageData}>}
 */
export function loadImageToCanvas(imageUrl, maxSize = null) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        img.onload = () => {
            // Calculate dimensions
            let width = img.width
            let height = img.height

            if (maxSize !== null && maxSize > 0) {
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
                width = Math.floor(img.width * scale)
                height = Math.floor(img.height * scale)
            }

            // Create canvas and draw image
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            ctx.drawImage(img, 0, 0, width, height)

            // Get image data
            const imageData = ctx.getImageData(0, 0, width, height)

            resolve({ canvas, ctx, width, height, imageData })
        }

        img.onerror = (e) => {
            reject(new Error('Failed to load image'))
        }

        img.src = imageUrl
    })
}

/**
 * Wait for OpenCV to be ready
 * @param {function} getCv - Function that returns the current cv and isLoaded state
 * @param {number} timeout - Maximum time to wait in ms
 * @returns {Promise<object>} - The cv object
 */
export function waitForOpenCV(getCv, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now()

        const check = () => {
            const { cv, isLoaded } = getCv()
            if (isLoaded && cv) {
                resolve(cv)
                return
            }

            if (Date.now() - startTime > timeout) {
                reject(new Error('OpenCV loading timeout'))
                return
            }

            setTimeout(check, 100)
        }

        check()
    })
}

/**
 * Process image to grayscale using OpenCV
 * @param {string} imageUrl - Input image URL
 * @param {object} cv - OpenCV instance
 * @returns {Promise<{outputUrl: string}>}
 */
export async function processGrayscale(imageUrl, cv) {
    // Load full resolution image for processing
    const { canvas, ctx, width, height, imageData } = await loadImageToCanvas(imageUrl, null)

    let src = null
    let grayMat = null

    try {
        // Create Mat from canvas using imread
        src = cv.imread(canvas)
        grayMat = new cv.Mat()

        // Convert to grayscale
        cv.cvtColor(src, grayMat, cv.COLOR_RGBA2GRAY)

        // Convert grayscale back to RGBA for display
        const grayData = grayMat.data
        for (let i = 0; i < width * height; i++) {
            const grayVal = grayData[i]
            const idx = i * 4
            imageData.data[idx] = grayVal     // R
            imageData.data[idx + 1] = grayVal // G
            imageData.data[idx + 2] = grayVal // B
            // Alpha stays the same
        }

        // Put result back on canvas
        ctx.putImageData(imageData, 0, 0)

        return {
            outputUrl: canvas.toDataURL('image/png'),
            metadata: {
                colorSpace: 'GRAY',
                channels: 1
            }
        }
    } finally {
        if (src) src.delete()
        if (grayMat) grayMat.delete()
    }
}

/**
 * Process image with blur using OpenCV
 * @param {string} imageUrl - Input image URL
 * @param {object} cv - OpenCV instance
 * @param {object} options.metadata - Input image metadata
 * @returns {Promise<{outputUrl: string}>}
 */
export async function processBlur(imageUrl, cv, { strength = 15, blurType = 'gaussian', metadata } = {}) {
    // Load full resolution image for processing
    const { canvas, ctx, width, height, imageData } = await loadImageToCanvas(imageUrl, null)

    // Ensure kernel size is odd
    const kernelSize = strength % 2 === 0 ? strength + 1 : strength

    let src = null
    let dst = null

    try {
        src = cv.imread(canvas)
        dst = new cv.Mat()
        const ksize = new cv.Size(kernelSize, kernelSize)

        switch (blurType) {
            case 'gaussian':
                cv.GaussianBlur(src, dst, ksize, 0)
                break
            case 'box':
                cv.blur(src, dst, ksize)
                break
            case 'median':
                cv.medianBlur(src, dst, kernelSize)
                break
            default:
                cv.GaussianBlur(src, dst, ksize, 0)
        }

        // Copy result to imageData
        const blurredData = new Uint8ClampedArray(dst.data)
        for (let i = 0; i < blurredData.length; i++) {
            imageData.data[i] = blurredData[i]
        }

        ctx.putImageData(imageData, 0, 0)

        return {
            outputUrl: canvas.toDataURL('image/png'),
            // Use passed metadata (e.g. Grayscale) or default to RGB
            metadata: metadata || {
                colorSpace: 'RGB',
                channels: 3
            }
        }
    } finally {
        if (src) src.delete()
        if (dst) dst.delete()
    }
}

/**
 * Process image with Canny edge detection using OpenCV
 * @param {string} imageUrl - Input image URL
 * @param {object} cv - OpenCV instance
 * @param {object} options - Canny options
 * @param {number} options.threshold1 - Low threshold (0-255)
 * @param {number} options.threshold2 - High threshold (0-255)
 * @returns {Promise<{outputUrl: string}>}
 */
export async function processCanny(imageUrl, cv, { threshold1 = 50, threshold2 = 150 } = {}) {
    // Load full resolution image for processing
    const { canvas, ctx, width, height, imageData } = await loadImageToCanvas(imageUrl, null)

    let src = null
    let gray = null
    let edges = null

    try {
        src = cv.imread(canvas)
        gray = new cv.Mat()
        edges = new cv.Mat()

        // Convert to grayscale (Canny requires single channel)
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)

        // Apply Canny edge detection
        cv.Canny(gray, edges, threshold1, threshold2, 3, false)

        // Convert edges to RGBA for display
        const edgeData = edges.data
        for (let i = 0; i < width * height; i++) {
            const edgeVal = edgeData[i]
            const idx = i * 4
            imageData.data[idx] = edgeVal     // R
            imageData.data[idx + 1] = edgeVal // G
            imageData.data[idx + 2] = edgeVal // B
            imageData.data[idx + 3] = 255     // A
        }

        ctx.putImageData(imageData, 0, 0)

        return {
            outputUrl: canvas.toDataURL('image/png'),
            metadata: {
                colorSpace: 'GRAY', // Canny is an edge map (1 channel concept)
                channels: 1
            }
        }
    } finally {
        if (src) src.delete()
        if (gray) gray.delete()
        if (edges) edges.delete()
    }
}

/**
 * Process image with Morphological transformations using OpenCV
 * @param {string} imageUrl - Input image URL
 * @param {object} cv - OpenCV instance
 * @param {object} options.metadata - Input image metadata
 * @returns {Promise<{outputUrl: string}>}
 */
export async function processMorphology(imageUrl, cv, { operation = 'erode', iterations = 1, metadata } = {}) {
    // Load full resolution image for processing
    const { canvas, ctx, width, height, imageData } = await loadImageToCanvas(imageUrl, null)

    let src = null
    let dst = null
    let M = null

    try {
        src = cv.imread(canvas)
        dst = new cv.Mat()

        // Create a 3x3 rectangular structuring element
        // Note: In a real app we might want to let the user configure kernel size/shape
        M = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3))

        // Determine operation code
        // For simple erosion/dilation we can use erode/dilate function directly
        // or morphologyEx. Let's use direct functions for clarity as requested by user.

        if (operation === 'erode') {
            cv.erode(src, dst, M, new cv.Point(-1, -1), iterations)
        } else if (operation === 'dilate') {
            cv.dilate(src, dst, M, new cv.Point(-1, -1), iterations)
        } else {
            // Default to erode
            cv.erode(src, dst, M, new cv.Point(-1, -1), iterations)
        }

        // Copy result to imageData
        const dstData = new Uint8ClampedArray(dst.data)

        // If the result is single channel (grayscale), convert to RGBA
        // But erode/dilate on RGBA usually keeps 4 channels.
        // OpenCV.js imread gives RGBA (CV_8UC4). Erode/Dilate on RGBA works channel-by-channel (or depending on implementation)
        // Let's check: src is CV_8UC4. erode/dilate will output CV_8UC4.

        for (let i = 0; i < dstData.length; i++) {
            imageData.data[i] = dstData[i]
        }

        ctx.putImageData(imageData, 0, 0)

        return {
            outputUrl: canvas.toDataURL('image/png'),
            // Use passed metadata (e.g. Grayscale) or default to RGB
            metadata: metadata || {
                colorSpace: 'RGB',
                channels: 3
            }
        }
    } finally {
        if (src) src.delete()
        if (dst) dst.delete()
        if (M) M.delete()
    }
}

/**
 * Find and draw contours using OpenCV
 * @param {string} imageUrl - Input image URL
 * @param {object} cv - OpenCV instance
 * @param {object} options - Options
 * @param {boolean} options.fill - Whether to fill the contours
 * @returns {Promise<{outputUrl: string}>}
 */
export async function processFindContours(imageUrl, cv, { fill = false } = {}) {
    const { canvas, ctx, width, height, imageData } = await loadImageToCanvas(imageUrl, null)

    let src = null
    let gray = null
    let binary = null
    let contours = null
    let hierarchy = null
    let mask = null

    try {
        src = cv.imread(canvas)
        gray = new cv.Mat()
        binary = new cv.Mat()
        contours = new cv.MatVector()
        hierarchy = new cv.Mat()
        // Initialize with OPAQUE black (0,0,0,255)
        mask = new cv.Mat(height, width, cv.CV_8UC4, new cv.Scalar(0, 0, 0, 255))

        // Preprocessing: Convert to gray and threshold
        // We assume the user might input a raw image, so we threshold it first
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
        // Use Otsu's binarization for automatic thresholding
        cv.threshold(gray, binary, 127, 255, cv.THRESH_BINARY | cv.THRESH_OTSU)

        // Find contours
        cv.findContours(binary, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

        // Draw contours
        const color = new cv.Scalar(255, 255, 255, 255) // White
        const thickness = fill ? -1 : 2 // -1 (CV_FILLED) for fill, 2 for outline

        cv.drawContours(mask, contours, -1, color, thickness)

        // Put result on canvas
        const maskData = mask.data
        for (let i = 0; i < width * height; i++) {
            const idx = i * 4
            imageData.data[idx] = maskData[idx]
            imageData.data[idx + 1] = maskData[idx + 1]
            imageData.data[idx + 2] = maskData[idx + 2]
            imageData.data[idx + 3] = maskData[idx + 3]
        }

        ctx.putImageData(imageData, 0, 0)

        // Return RGB metadata since we draw contours on it
        // Note: Even if original was Gray, the output is now RGB (white on black/gray)
        return {
            outputUrl: canvas.toDataURL('image/png'),
            metadata: {
                colorSpace: 'RGB',
                channels: 3
            }
        }
    } finally {
        if (src) src.delete()
        if (gray) gray.delete()
        if (binary) binary.delete()
        if (contours) contours.delete()
        if (hierarchy) hierarchy.delete()
        if (mask) mask.delete()
    }
}

/**
 * Process image with adaptive Thresholding using OpenCV
 * @param {string} imageUrl - Input image URL
 * @param {object} cv - OpenCV instance
 * @param {object} options - Options
 * @param {Array<number[]>} options.ranges - Array of [min, max] arrays for each channel
 * @param {string} options.mode - 'select' (keep inside) or 'filter' (keep outside)
 * @returns {Promise<{outputUrl: string, metadata: object}>}
 */
export async function processThreshold(imageUrl, cv, { ranges = [[0, 255]], mode = 'select' } = {}) {
    const { canvas, ctx, width, height, imageData } = await loadImageToCanvas(imageUrl, null)

    let src = null
    let channels = null
    let result = null

    try {
        src = cv.imread(canvas)
        channels = new cv.MatVector()
        cv.split(src, channels)

        // Determine number of effective channels (ignoring Alpha)
        // Note: Image loaded from Canvas is ALWAYS RGBA (4 channels), even if the original source was Grayscale.
        // So we will always see 3 color channels (R, G, B) here.
        // The adaptation logic relies on the 'ranges' passed from the node, which knows the logical format.
        const numChannels = Math.min(channels.size(), 3)

        // If specific ranges > 1 are provided, we treat as multichannel.
        // If only 1 range provided, we treat as grayscale logic (apply same rule to all channels found).
        const isGrayscale = ranges.length === 1 && numChannels >= 3

        result = new cv.Mat()

        // Combine masks
        let compositeMask = null

        for (let i = 0; i < numChannels; i++) {
            // If grayscale mode, use the single range for all channels
            const rangeIdx = isGrayscale ? 0 : i
            const [min, max] = ranges[rangeIdx] || [0, 255]

            const ch = channels.get(i)
            const currentMask = new cv.Mat()

            // InRange logic
            // Use explicit rows/cols integers for Mat constructor to avoid binding TypeErrors
            const lowerBound = new cv.Mat(ch.rows, ch.cols, ch.type(), new cv.Scalar(min))
            const upperBound = new cv.Mat(ch.rows, ch.cols, ch.type(), new cv.Scalar(max))

            try {
                cv.inRange(ch, lowerBound, upperBound, currentMask)
            } finally {
                lowerBound.delete()
                upperBound.delete()
            }

            if (compositeMask === null) {
                compositeMask = currentMask
            } else {
                // Combine: we want pixels that match ALL channel criteria
                // So bitwise AND
                const temp = new cv.Mat()
                cv.bitwise_and(compositeMask, currentMask, temp)
                compositeMask.delete()
                compositeMask = temp
                currentMask.delete()
            }
        }

        // Handle Mode
        if (mode === 'filter') {
            // Keep Outside: Invert the mask
            const inverted = new cv.Mat()
            cv.bitwise_not(compositeMask, inverted)
            compositeMask.delete()
            compositeMask = inverted
        }

        // Apply mask to original
        // Set everything NOT in mask to black (0)
        // source, mask, dest

        // Create black background
        result = new cv.Mat(height, width, cv.CV_8UC4, new cv.Scalar(0, 0, 0, 255))

        // Copy masked pixels
        src.copyTo(result, compositeMask)

        // Put result buffer
        const finalData = new Uint8ClampedArray(result.data)
        imageData.data.set(finalData)

        ctx.putImageData(imageData, 0, 0)

        // Cleanup masks
        if (compositeMask) compositeMask.delete()

        // Return original metadata (inferred)
        return {
            outputUrl: canvas.toDataURL('image/png'),
            metadata: {
                colorSpace: isGrayscale ? 'GRAY' : 'RGB',
                channels: isGrayscale ? 1 : 3
            }
        }

    } finally {
        if (src) src.delete()
        if (channels) {
            for (let i = 0; i < channels.size(); i++) channels.get(i).delete()
            channels.delete()
        }
        if (result) result.delete()
    }
}

/**
 * Process image by rotating it by an angle (degrees)
 * @param {string} imageUrl - Input image URL
 * @param {object} cv - OpenCV instance
 * @param {object} options - Options
 * @param {number} options.angle - Rotation angle in degrees (positive = CCW)
 * @param {object} [options.metadata] - Input image metadata
 * @returns {Promise<{outputUrl: string, metadata: object}>}
 */
export async function processRotate(imageUrl, cv, { angle = 0, metadata } = {}) {
    const { canvas, ctx, width, height, imageData } = await loadImageToCanvas(imageUrl, null)

    let src = null
    let dst = null
    let M = null

    try {
        src = cv.imread(canvas)
        dst = new cv.Mat()

        // Center of rotation
        const center = new cv.Point(width / 2, height / 2)

        // Get rotation matrix. OpenCV expects angle in degrees.
        M = cv.getRotationMatrix2D(center, angle, 1.0)

        // Warp affine - keep same output size (may crop corners)
        const dsize = new cv.Size(width, height)
        cv.warpAffine(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(0, 0, 0, 255))

        // Copy result to imageData
        const dstData = new Uint8ClampedArray(dst.data)
        // dst is likely CV_8UC4, so length should match imageData.data
        for (let i = 0; i < dstData.length; i++) {
            imageData.data[i] = dstData[i]
        }

        ctx.putImageData(imageData, 0, 0)

        return {
            outputUrl: canvas.toDataURL('image/png'),
            // Use passed metadata (e.g. Grayscale) or default to RGB
            metadata: metadata || {
                colorSpace: 'RGB',
                channels: 3
            }
        }
    } finally {
        if (src) src.delete()
        if (dst) dst.delete()
        if (M) M.delete()
    }
}

/**
 * Adjust brightness and contrast of an image
 * @param {string} imageUrl - Input image URL
 * @param {object} cv - OpenCV instance
 * @param {object} options - Options
 * @param {number} options.brightness - Value to add to pixels (-100..100)
 * @param {number} options.contrast - Multiplicative factor for contrast (0.0..3.0)
 * @param {object} options.metadata - Input image metadata (colorSpace, channels)
 * @returns {Promise<{outputUrl: string, metadata: {colorSpace: string, channels: number}}>}
 */
export async function processBrightnessContrast(imageUrl, cv, { brightness = 0, contrast = 1.0, metadata } = {}) {
    const { canvas, ctx, width, height, imageData } = await loadImageToCanvas(imageUrl, null)

    let src = null
    let dst = null

    try {
        src = cv.imread(canvas)
        dst = new cv.Mat()

        // cv.convertScaleAbs(src, dst, alpha, beta)
        // alpha = contrast, beta = brightness
        const alpha = contrast
        const beta = brightness

        cv.convertScaleAbs(src, dst, alpha, beta)

        // Copy result to imageData
        const dstData = new Uint8ClampedArray(dst.data)
        for (let i = 0; i < dstData.length; i++) {
            imageData.data[i] = dstData[i]
        }

        ctx.putImageData(imageData, 0, 0)

        return {
            outputUrl: canvas.toDataURL('image/png'),
            // Use passed metadata (e.g. Grayscale) or default to RGB
            metadata: metadata || {
                colorSpace: 'RGB',
                channels: 3
            }
        }
    } finally {
        if (src) src.delete()
        if (dst) dst.delete()
    }
}
