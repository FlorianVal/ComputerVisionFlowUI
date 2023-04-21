import { Handle } from "reactflow";
import { nodeHasHandle, nodeConstraints } from "../ressources/nodeTypes";
import useStore from "./store";

import { Position } from "reactflow";
export { }

export const WrapHandles = ({ children, type, className = "", upDown = false }: { children: any, type: string, className?: string, upDown?:boolean }) => {

    const getNodes = useStore((state: { getNodes: any; }) => state.getNodes);
    const getEdges = useStore((state: { getEdges: any; }) => state.getEdges);

    const checkValidConnection = (connection: { source: string | null; target: string | null; }) => {

        const sourceNode = getNodes().find((node: { id: string | null; }) => node.id === connection.source);
        const targetNode = getNodes().find((node: { id: string | null; }) => node.id === connection.target);
        const edges = getEdges();

        // Check that there is only one connection per input handle
        // i.e. no multiple connections to the same input
        // it also prevents cyclic graphs
        if (sourceNode && targetNode) {
            if (edges.filter((edge: { source: string | null; target: string | null; }) => edge.target === targetNode.id).length > 0) {
                return false;
            }
        }

        // Check with the constraints if the connection is valid
        if (sourceNode && targetNode) {
            return nodeConstraints[sourceNode.type]["outputs"] === nodeConstraints[targetNode.type]["inputs"];
        }
        return false;
    }

    return (

        < div className={className} >
            {

                nodeHasHandle[type].inputs ?
                <Handle type="target" position={ upDown ? Position.Top : Position.Left } isValidConnection={ checkValidConnection } /> 
                : <div></div>
            }
            < div >
                {children}
            </div >
            {
                nodeHasHandle[type].outputs ? <Handle type="source" position={ upDown ? Position.Bottom : Position.Right } isValidConnection={ checkValidConnection } /> : <div></div>
            }
        </div >
    )
}

export default WrapHandles;