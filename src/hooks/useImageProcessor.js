import { useEffect, useRef, useCallback } from 'react'
import { useProcessingState } from './useProcessingState'
import { useOpenCV } from '@/contexts/OpenCVContext'

/**
 * Hook for async image processing with loading state and cancellation
 * 
 * This hook handles:
 * - Waiting for OpenCV to be ready
 * - Managing processing state (isProcessing, error)
 * - Cancelling in-flight operations when inputs change
 * - Calling the update function with the result
 * 
 * @param {function} processFn - Async function: (imageUrl, cv, options) => Promise<{outputUrl: string}>
 * @param {string|null} inputImageUrl - The input image URL to process
 * @param {object} options - Options to pass to the processing function
 * @param {function} onComplete - Callback when processing completes: (outputUrl) => void
 * @param {Array} deps - Additional dependencies that should trigger reprocessing
 * 
 * @returns {{
 *   isProcessing: boolean,
 *   error: string|null,
 *   isWaitingForOpenCV: boolean
 * }}
 * 
 * @example
 * const { isProcessing, error } = useImageProcessor(
 *   processGrayscale,
 *   inputImageUrl,
 *   {},
 *   (outputUrl) => updateOutput({ imageUrl: outputUrl }),
 *   []
 * )
 */
export function useImageProcessor(processFn, inputImageUrl, options, onComplete, deps = []) {
    const { cv, isLoaded, error: cvError } = useOpenCV()
    const { isProcessing, error, startProcessing, finishProcessing } = useProcessingState()
    const abortControllerRef = useRef(null)
    const isWaitingForOpenCV = !isLoaded && inputImageUrl

    // Memoize onComplete to avoid triggering effect on every render
    const onCompleteRef = useRef(onComplete)
    onCompleteRef.current = onComplete

    // Memoize options to avoid triggering effect on every render
    const optionsRef = useRef(options)
    optionsRef.current = options

    useEffect(() => {
        // Nothing to process
        if (!inputImageUrl) {
            return
        }

        // Wait for OpenCV
        if (!isLoaded || !cv) {
            return
        }

        // Cancel any previous processing
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        const abortController = new AbortController()
        abortControllerRef.current = abortController

        const runProcess = async () => {
            startProcessing()

            try {
                const result = await processFn(inputImageUrl, cv, optionsRef.current)

                // Check if aborted before updating state
                if (abortController.signal.aborted) {
                    return
                }

                // Pass the full result object (including metadata) to the callback
                // This allows nodes to receive metadata like channels/colorSpace
                onCompleteRef.current(result)
                finishProcessing()
            } catch (err) {
                // Don't report errors for aborted operations
                if (abortController.signal.aborted) {
                    return
                }

                console.error('[useImageProcessor] Processing failed:', err)
                finishProcessing(err.message || 'Processing failed')
            }
        }

        runProcess()

        // Cleanup: abort on unmount or dependency change
        return () => {
            abortController.abort()
        }
    }, [inputImageUrl, isLoaded, cv, processFn, startProcessing, finishProcessing, ...deps])

    // Return OpenCV error if that's the issue
    const finalError = cvError ? `OpenCV error: ${cvError.message}` : error

    return {
        isProcessing,
        error: finalError,
        isWaitingForOpenCV,
    }
}
