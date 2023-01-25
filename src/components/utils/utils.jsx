import { Handle } from "reactflow";
import { nodeHasHandle } from "../../ressources/nodeTypes";

export const WrapHandles = ({ children, type, className }) => {
    return (
        <div className={className}>
            {nodeHasHandle[type].inputs ? <Handle type="target" position="left" /> : <div></div>}
            <div>
                {children}
            </div>
            {nodeHasHandle[type].outputs ? <Handle type="source" position="right" /> : <div></div>}
        </div>
    )
}

export default WrapHandles;