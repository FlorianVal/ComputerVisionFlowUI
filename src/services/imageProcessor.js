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

        return { outputUrl: canvas.toDataURL('image/png') }
    } finally {
        if (src) src.delete()
        if (grayMat) grayMat.delete()
    }
}

/**
 * Process image with blur using OpenCV
 * @param {string} imageUrl - Input image URL
 * @param {object} cv - OpenCV instance
 * @param {object} options - Blur options
 * @param {number} options.strength - Blur kernel size (will be made odd)
 * @param {string} options.blurType - 'gaussian' | 'box' | 'median'
 * @returns {Promise<{outputUrl: string}>}
 */
export async function processBlur(imageUrl, cv, { strength = 15, blurType = 'gaussian' } = {}) {
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

        return { outputUrl: canvas.toDataURL('image/png') }
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

        return { outputUrl: canvas.toDataURL('image/png') }
    } finally {
        if (src) src.delete()
        if (gray) gray.delete()
        if (edges) edges.delete()
    }
}
