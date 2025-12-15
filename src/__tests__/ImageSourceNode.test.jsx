import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReactFlowProvider, useReactFlow } from 'reactflow'
import ImageSourceNode from '@/nodes/ImageSourceNode'

// Mock useReactFlow
vi.mock('reactflow', async () => {
    const actual = await vi.importActual('reactflow')
    return {
        ...actual,
        useReactFlow: vi.fn(() => ({
            setNodes: vi.fn(),
            getNodes: vi.fn(() => []),
        })),
    }
})

const TestWrapper = ({ children }) => (
    <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe('ImageSourceNode', () => {
    const mockSetNodes = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        useReactFlow.mockReturnValue({
            setNodes: mockSetNodes,
            getNodes: vi.fn(() => []),
        })
    })

    it('should render with title and file input', () => {
        render(
            <TestWrapper>
                <ImageSourceNode id="test-1" data={{}} selected={false} />
            </TestWrapper>
        )

        expect(screen.getByText('Image Source')).toBeInTheDocument()
        expect(screen.getByText('Click to select image')).toBeInTheDocument()
    })

    it('should have file input that accepts images', () => {
        const { container } = render(
            <TestWrapper>
                <ImageSourceNode id="test-1" data={{}} selected={false} />
            </TestWrapper>
        )

        // Input is hidden, so we query it directly
        const fileInput = container.querySelector('input[type="file"]')
        expect(fileInput).toBeInTheDocument()
        expect(fileInput).toHaveAttribute('accept', 'image/*')
    })

    it('should show preview when imageUrl is in data', () => {
        const testUrl = 'blob:http://localhost/test-image'
        render(
            <TestWrapper>
                <ImageSourceNode
                    id="test-1"
                    data={{ imageUrl: testUrl, imageName: 'test.png' }}
                    selected={false}
                />
            </TestWrapper>
        )

        expect(screen.getByText('test.png')).toBeInTheDocument()
        const img = screen.getByAltText('Preview')
        expect(img).toHaveAttribute('src', testUrl)
    })
})
