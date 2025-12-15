import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * NodeLoadingOverlay - Displays a loading spinner overlay on node content
 * 
 * Wraps node preview content and shows a semi-transparent overlay with
 * a spinning loader when isLoading is true.
 * 
 * @param {object} props
 * @param {boolean} props.isLoading - Whether to show the loading overlay
 * @param {boolean} props.isWaiting - Whether waiting for a dependency (shows different message)
 * @param {string} props.waitingMessage - Message to show when waiting
 * @param {React.ReactNode} props.children - The content to overlay
 */
export function NodeLoadingOverlay({
    isLoading = false,
    isWaiting = false,
    waitingMessage = 'Waiting for OpenCV...',
    children
}) {
    const showOverlay = isLoading || isWaiting

    return (
        <div className="relative">
            {children}
            {showOverlay && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 rounded">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                    {isWaiting && (
                        <span className="text-xs text-white/80">{waitingMessage}</span>
                    )}
                </div>
            )}
        </div>
    )
}

export default NodeLoadingOverlay
