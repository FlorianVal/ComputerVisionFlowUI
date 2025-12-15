import { useCallback } from 'react'
import { useReactFlow } from 'reactflow'

/**
 * Hook to update the current node's output data
 * 
 * This hook provides a simple function to update the node's data,
 * which downstream nodes can then subscribe to via useNodeInput.
 * 
 * @param {string} nodeId - Current node's ID
 * @returns {(updates: object) => void} - Function to update node data
 * 
 * @example
 * // In your node component:
 * const updateOutput = useNodeOutput(id)
 * 
 * // After processing, publish the result:
 * updateOutput({ imageUrl: processedImageUrl })
 * 
 * // You can update multiple fields at once:
 * updateOutput({ imageUrl: url, width: 100, height: 200 })
 */
export function useNodeOutput(nodeId) {
    const { setNodes } = useReactFlow()

    const updateOutput = useCallback((updates) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: { ...node.data, ...updates },
                    }
                }
                return node
            })
        )
    }, [nodeId, setNodes])

    return updateOutput
}
