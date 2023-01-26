import { Handle } from "reactflow";
import { nodeHasHandle, nodeConstraints } from "../../ressources/nodeTypes";
import { useStoreApi } from "reactflow";


export const WrapHandles = ({ children, type, className }) => {

    const store = useStoreApi();

    return (

        < div className={className} >
            {
                nodeHasHandle[type].inputs ? <Handle type="target" position="left" isValidConnection={(connection) =>
                    nodeConstraints[store.getState().getNodes().find(node => node.id === connection.source).type]["outputs"] === nodeConstraints[type]["inputs"]
                } /> : <div></div>
            }
            < div >
                {children}
            </div >
            {
                nodeHasHandle[type].outputs ? <Handle type="source" position="right" isValidConnection={(connection) =>
                    nodeConstraints[store.getState().getNodes().find(node => node.id === connection.target).type]["inputs"] === nodeConstraints[type]["outputs"]
                } /> : <div></div>
            }
        </div >
    )
}

export default WrapHandles;