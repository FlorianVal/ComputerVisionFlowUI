import { useState, useCallback } from 'react'

/**
 * Hook to manage processing state for a node
 * 
 * Provides isProcessing and error state with simple setter functions.
 * Used by nodes that perform async image processing operations.
 * 
 * @returns {{
 *   isProcessing: boolean,
 *   error: string|null,
 *   startProcessing: () => void,
 *   finishProcessing: (error?: string|null) => void
 * }}
 * 
 * @example
 * const { isProcessing, error, startProcessing, finishProcessing } = useProcessingState()
 * 
 * async function process() {
 *   startProcessing()
 *   try {
 *     await doWork()
 *     finishProcessing()
 *   } catch (err) {
 *     finishProcessing(err.message)
 *   }
 * }
 */
export function useProcessingState() {
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState(null)

    const startProcessing = useCallback(() => {
        setIsProcessing(true)
        setError(null)
    }, [])

    const finishProcessing = useCallback((errorMessage = null) => {
        setIsProcessing(false)
        setError(errorMessage)
    }, [])

    return {
        isProcessing,
        error,
        startProcessing,
        finishProcessing,
    }
}
