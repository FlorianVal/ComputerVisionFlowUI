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
    it('marks node entries as draggable', () => {
        renderMenu()
        fireEvent.click(screen.getByText('Add Node'))

        const grayscaleButton = screen.getByText('Grayscale').closest('button')
        expect(grayscaleButton).toHaveAttribute('draggable', 'true')
    })

    it('sets reactflow data on drag start', () => {
        renderMenu()
        fireEvent.click(screen.getByText('Add Node'))

        const grayscaleButton = screen.getByText('Grayscale').closest('button')
        const dataTransfer = {
            setData: vi.fn(),
            effectAllowed: '',
        }

        fireEvent.dragStart(grayscaleButton, { dataTransfer })

        expect(dataTransfer.setData).toHaveBeenCalledWith('application/reactflow', 'grayscale')
        expect(dataTransfer.effectAllowed).toBe('move')
    })
})
