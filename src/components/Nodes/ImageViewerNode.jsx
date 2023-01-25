import React, { memo, useState } from "react";
import { Handle } from "reactflow";

export default memo(({ data }) => {

    return (
        <div className="react-flow__node-input">
            <Handle type="target" position="left" id="input" isConnectable={true} />
            {data.input ? <img src={data.input} alt="Image" style={{ width: "100px", height: "100px" }} /> : <div>Connect me to display data</div>}
        </div>
    );
}
);