import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'
import RotateNode from '@/nodes/RotateNode'
import { OpenCVProvider } from '@/contexts/OpenCVContext'
import { useNodeInput, DataTypes } from '@/data'

// Mock reactflow hooks
vi.mock('reactflow', async () => {
    const actual = await vi.importActual('reactflow')
    return {
        ...actual,
        useReactFlow: vi.fn(() => ({
            getNodes: vi.fn(() => []),
            setNodes: vi.fn(),
        })),
        useEdges: vi.fn(() => []),
    }
})

// Mock useNodeInput
vi.mock('@/data', async () => {
    const actual = await vi.importActual('@/data')
    return {
        ...actual,
        useNodeInput: vi.fn(),
        useNodeOutput: vi.fn(() => vi.fn()),
    }
})

// Mock OpenCV context
vi.mock('@/contexts/OpenCVContext', () => ({
    OpenCVProvider: ({ children }) => children,
    useOpenCV: vi.fn(() => ({
        cv: null,
        isLoaded: false,
        error: null,
    })),
}))

import { useOpenCV } from '@/contexts/OpenCVContext'

const TestWrapper = ({ children }) => (
    <ReactFlowProvider>
        <OpenCVProvider>{children}</OpenCVProvider>
    </ReactFlowProvider>
)

describe('RotateNode', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useNodeInput.mockReturnValue({
            data: null,
            isConnected: false,
            error: null
        })
    })

    it('should render with title', () => {
        render(
            <TestWrapper>
                <RotateNode id="test-rot" data={{}} selected={false} />
            </TestWrapper>
        )

        expect(screen.getByText('Rotate')).toBeInTheDocument()
    })

    it('should show "No input connected" when no edges', () => {
        useNodeInput.mockReturnValue({
            data: null,
            isConnected: false,
            error: null
        })

        render(
            <TestWrapper>
                <RotateNode id="test-rot" data={{}} selected={false} />
            </TestWrapper>
        )

        expect(screen.getByText('No input connected')).toBeInTheDocument()
    })

    it('should show loading state when OpenCV is not loaded', () => {
        useOpenCV.mockReturnValue({
            cv: null,
            isLoaded: false,
            error: null,
        })

        // Mock connected input with data
        useNodeInput.mockReturnValue({
            data: { imageUrl: 'blob:test' },
            isConnected: true,
            error: null
        })

        render(
            <TestWrapper>
                <RotateNode id="test-rot" data={{}} selected={false} />
            </TestWrapper>
        )

        expect(screen.getByText('Waiting for OpenCV...')).toBeInTheDocument()
    })

    it('should show canvas when input is connected', async () => {
        const testUrl = 'https://example.com/test.png'

        useOpenCV.mockReturnValue({
            cv: {},
            isLoaded: true,
            error: null,
        })

        useNodeInput.mockReturnValue({
            data: { imageUrl: testUrl },
            isConnected: true,
            error: null
        })

        // Mock Image loading
        global.Image = class {
            constructor() {
                setTimeout(() => {
                    this.onload && this.onload()
                }, 0)
            }
            set src(url) {
                this._src = url
            }
            get src() {
                return this._src
            }
        }

        const { container } = render(
            <TestWrapper>
                <RotateNode id="test-rot" data={{ imageUrl: testUrl }} selected={false} />
            </TestWrapper>
        )

        await waitFor(() => {
            const canvas = container.querySelector('canvas')
            expect(canvas).toBeInTheDocument()
        })
    })
})
