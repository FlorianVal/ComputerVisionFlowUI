/**
 * Data Handling Layer for VisioFlow
 * 
 * This module provides a standardized way for nodes to:
 * 1. Define what data types they accept/produce (DataTypes)
 * 2. Receive validated input from upstream nodes (useNodeInput)
 * 3. Publish output for downstream nodes (useNodeOutput)
 * 
 * @example
 * import { DataTypes, useNodeInput, useNodeOutput } from '@/data'
 * 
 * function MyNode({ id }) {
 *   // Get validated input
 *   const { data, error, isConnected } = useNodeInput(id, 'image-in', DataTypes.IMAGE)
 *   
 *   // Get output updater
 *   const updateOutput = useNodeOutput(id)
 *   
 *   // Process and publish
 *   useEffect(() => {
 *     if (data?.imageUrl) {
 *       const result = process(data.imageUrl)
 *       updateOutput({ imageUrl: result })
 *     }
 *   }, [data, updateOutput])
 * }
 */

export { DataTypes, DataSchemas, getTypeErrorMessage } from './types'
export { useNodeInput } from './useNodeInput'
export { useNodeOutput } from './useNodeOutput'
