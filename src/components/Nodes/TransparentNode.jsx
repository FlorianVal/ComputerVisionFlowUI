import React, { memo, useEffect } from "react";
import { useUpdateNodeInternals } from 'reactflow'
import { WrapHandles } from "../utils/utils";

export default memo(({ type, id, data }) => {


    // To update output of the node
    const updateNodeInternals = useUpdateNodeInternals();

    const run = () => {
        console.log("Running Image Input Node", id);
        data.output = data.input;
        updateNodeInternals(id);
    };

    useEffect(() => {
        run();
    }, [data.input]);

    return (
        console.log("Rendering Image Input Node data", data),
        <WrapHandles type={type} className="react-flow__node-default" >
            {data.input ? <img src={data.input} alt="Image" style={{ width: "100px", height: "100px" }} /> : <div>Connect me to display data</div>}
        </WrapHandles>
    );
}
);