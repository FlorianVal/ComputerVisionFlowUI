import React, { memo, useEffect, useState } from "react";
import { Handle } from "reactflow";
import { useStoreApi } from 'reactflow'
import { useUpdateNodeInternals } from 'reactflow'

export default memo(({ id, data }) => {


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
        <div className="react-flow__node-input">
            <Handle type="target" position="left" id="input" isConnectable={true} />
            {data.input ? <img src={data.input} alt="Image" style={{ width: "100px", height: "100px" }} /> : <div>Connect me to display data</div>}
            <Handle type="source" position="right" id="output" isConnectable={true} />
        </div>
    );
}
);