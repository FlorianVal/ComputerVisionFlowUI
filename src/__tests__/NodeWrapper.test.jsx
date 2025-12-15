import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NodeWrapper from '@/components/NodeWrapper'
import { ReactFlowProvider } from 'reactflow'

// Wrapper for ReactFlow context
const TestWrapper = ({ children }) => (
    <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe('NodeWrapper', () => {
    it('should render with title', () => {
        render(
            <TestWrapper>
                <NodeWrapper title="Test Node">
                    <div>Content</div>
                </NodeWrapper>
            </TestWrapper>
        )

        expect(screen.getByText('Test Node')).toBeInTheDocument()
        expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should render input handles', () => {
        const { container } = render(
            <TestWrapper>
                <NodeWrapper
                    title="Node with Inputs"
                    inputs={[{ id: 'input-1' }, { id: 'input-2' }]}
                >
                    <div>Content</div>
                </NodeWrapper>
            </TestWrapper>
        )

        // React Flow handles have class 'react-flow__handle'
        const handles = container.querySelectorAll('.react-flow__handle-left')
        expect(handles.length).toBe(2)
    })

    it('should render output handles', () => {
        const { container } = render(
            <TestWrapper>
                <NodeWrapper
                    title="Node with Outputs"
                    outputs={[{ id: 'output-1' }]}
                >
                    <div>Content</div>
                </NodeWrapper>
            </TestWrapper>
        )

        const handles = container.querySelectorAll('.react-flow__handle-right')
        expect(handles.length).toBe(1)
    })

    it('should apply selected styles when selected', () => {
        const { container } = render(
            <TestWrapper>
                <NodeWrapper title="Selected Node" selected={true}>
                    <div>Content</div>
                </NodeWrapper>
            </TestWrapper>
        )

        const card = container.querySelector('.ring-2')
        expect(card).toBeInTheDocument()
    })
})
