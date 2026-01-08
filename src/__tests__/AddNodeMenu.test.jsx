import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'
import AddNodeMenu from '@/components/AddNodeMenu'

const renderMenu = (onAddNode = vi.fn()) =>
    render(
        <ReactFlowProvider>
            <AddNodeMenu onAddNode={onAddNode} />
        </ReactFlowProvider>
    )

describe('AddNodeMenu drag and drop', () => {
    it('renders node entries', () => {
        renderMenu()
        fireEvent.click(screen.getByText('Add Node'))

        expect(screen.getByText('Grayscale')).toBeInTheDocument()
    })

    it('keeps the menu open during pointer interaction', () => {
        renderMenu()
        fireEvent.click(screen.getByText('Add Node'))

        const grayscaleButton = screen.getByText('Grayscale').closest('button')
        fireEvent.mouseDown(grayscaleButton)
        fireEvent.mouseMove(grayscaleButton)

        expect(screen.getByText('Available Nodes')).toBeInTheDocument()
    })
})
