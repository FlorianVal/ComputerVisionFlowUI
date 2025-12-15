import { useMemo } from 'react'
import { useEdges, useStore } from 'reactflow'
import { DataSchemas, getTypeErrorMessage } from './types'

/**
 * Hook to get validated input data from a connected upstream node
 * 
 * This hook handles all the boilerplate for:
 * 1. Finding the incoming edge for a specific handle
 * 2. Subscribing to the source node's data changes
 * 3. Validating the data against the expected type schema
 * 
 * @param {string} nodeId - Current node's ID
 * @param {string} handleId - Input handle ID (e.g., 'image-in')
 * @param {string} expectedType - Expected DataType (e.g., DataTypes.IMAGE)
 * @returns {{ 
 *   data: object|null,      // The validated data from upstream node
 *   error: string|null,     // Error message if validation failed
 *   isConnected: boolean,   // Whether an edge is connected to this input
 *   sourceNodeId: string|null // ID of the source node (useful for debugging)
 * }}
 * 
 * @example
 * // In your node component:
 * const { data, error, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
 * const imageUrl = data?.imageUrl
 * 
 * // Show appropriate UI based on state:
 * if (!isConnected) return <span>No input connected</span>
 * if (error) return <span className="text-red-500">{error}</span>
 * // ... process data.imageUrl
 */
export function useNodeInput(nodeId, handleId, expectedType) {
    const edges = useEdges()

    // Find source node ID from incoming edge
    const sourceNodeId = useMemo(() => {
        const incomingEdge = edges.find(
            (edge) => edge.target === nodeId && edge.targetHandle === handleId
        )
        return incomingEdge?.source || null
    }, [edges, nodeId, handleId])

    // Subscribe to source node's data - this will trigger re-render when data changes
    const sourceData = useStore((state) => {
        if (!sourceNodeId) return null
        const sourceNode = state.nodeInternals.get(sourceNodeId)
        // console.log(`[useNodeInput] ${nodeId} reading from ${sourceNodeId}:`, sourceNode?.data?.imageName)
        return sourceNode?.data || null
    })

    // Debug changes
    // useEffect(() => {
    //    if (sourceNodeId) console.log(`[useNodeInput] ${nodeId} received update from ${sourceNodeId}`, sourceData)
    // }, [sourceNodeId, sourceData, nodeId])

    // Validate data against expected schema
    const result = useMemo(() => {
        // Not connected - this is not an error, just no input yet
        if (!sourceNodeId) {
            return {
                data: null,
                error: null,
                isConnected: false,
                sourceNodeId: null,
            }
        }

        // Connected but no data yet (source node hasn't produced output)
        if (!sourceData) {
            return {
                data: null,
                error: 'Waiting for input data...',
                isConnected: true,
                sourceNodeId,
            }
        }

        // Validate against schema
        const schema = DataSchemas[expectedType]
        if (schema && !schema.validate(sourceData)) {
            return {
                data: null,
                error: getTypeErrorMessage(expectedType),
                isConnected: true,
                sourceNodeId,
            }
        }

        // Valid data!
        return {
            data: sourceData,
            error: null,
            isConnected: true,
            sourceNodeId,
        }
    }, [sourceNodeId, sourceData, expectedType])

    return result
}
