import React, { createContext, useContext, useState, useEffect } from 'react'

const OpenCVContext = createContext({
    isLoaded: false,
    cv: null,
    error: null,
})

export const useOpenCV = () => useContext(OpenCVContext)

export const OpenCVProvider = ({ children }) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [cvInstance, setCvInstance] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        // If already loaded, don't reload
        if (window.cv && window.cv.Mat) {
            setIsLoaded(true)
            setCvInstance(window.cv)
            return
        }

        // Setup the Module object for OpenCV to hook into
        // This must be done BEFORE the script loads
        window.Module = {
            onRuntimeInitialized: () => {
                console.log('OpenCV.js runtime initialized')
                if (window.cv) {
                    setIsLoaded(true)
                    setCvInstance(window.cv)
                }
            },
            onError: (err) => {
                console.error('OpenCV.js error:', err)
                setError(new Error('OpenCV.js internal error'))
            },
            // Prevent auto-running main() if it exists
            noInitialRun: true,
            // Prevent exit() from throwing an exception
            noExitRuntime: true,
        }

        const scriptId = 'opencv-script'
        let script = document.getElementById(scriptId)

        if (!script) {
            script = document.createElement('script')
            script.id = scriptId
            script.src = '/opencv.js'
            script.async = true
            script.type = 'text/javascript'

            script.onerror = () => {
                console.error('Failed to load opencv.js script')
                setError(new Error('Failed to load OpenCV script'))
            }

            document.body.appendChild(script)
        }

        // Timeout fallback in case onRuntimeInitialized never fires
        const timeoutId = setTimeout(() => {
            if (!window.cv || !window.cv.Mat) {
                // Should only set error if we really aren't loaded
                // It's possible onRuntimeInitialized fired but react state update is pending
                // Use the functional update or check a ref if needed, but here simple check is ok
                // because isLoaded state update might be pending but window.cv should be set by now if init happened
                console.warn('OpenCV initialization timed out (or checking failed)')
                if (!window.cv) {
                    setError(new Error('OpenCV initialization timed out'))
                }
            }
        }, 15000)

        // Cleanup
        return () => {
            clearTimeout(timeoutId)
        }
    }, [])

    return (
        <OpenCVContext.Provider value={{ isLoaded, cv: cvInstance, error }}>
            {children}
        </OpenCVContext.Provider>
    )
}
