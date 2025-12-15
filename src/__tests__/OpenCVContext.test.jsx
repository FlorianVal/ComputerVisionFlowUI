import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { OpenCVProvider, useOpenCV } from '@/contexts/OpenCVContext'

// Test component to consume the context
function TestConsumer() {
    const { isLoaded, error } = useOpenCV()
    return (
        <div>
            <span data-testid="loaded">{isLoaded.toString()}</span>
            <span data-testid="error">{error ? error.message : 'none'}</span>
        </div>
    )
}

describe('OpenCVContext', () => {
    beforeEach(() => {
        // Reset window.cv before each test
        delete window.cv
        // Clear any existing scripts
        document.querySelectorAll('script[src="/opencv.js"]').forEach(s => s.remove())
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should initially have isLoaded as false', () => {
        render(
            <OpenCVProvider>
                <TestConsumer />
            </OpenCVProvider>
        )

        expect(screen.getByTestId('loaded')).toHaveTextContent('false')
        expect(screen.getByTestId('error')).toHaveTextContent('none')
    })

    it('should set isLoaded to true when cv is already available', async () => {
        // Mock cv already being loaded
        window.cv = { Mat: function () { } }

        render(
            <OpenCVProvider>
                <TestConsumer />
            </OpenCVProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('loaded')).toHaveTextContent('true')
        })
    })

    it('should return default values when used outside provider (no throw)', () => {
        // When used outside provider, React's useContext returns the default value
        // Our default context has isLoaded: false
        render(<TestConsumer />)

        expect(screen.getByTestId('loaded')).toHaveTextContent('false')
        expect(screen.getByTestId('error')).toHaveTextContent('none')
    })
})
