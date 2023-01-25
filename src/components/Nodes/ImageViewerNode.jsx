import React, { memo } from "react";
import { WrapHandles } from "../utils/utils";

export default memo(({ type, data }) => {

    return (
        <WrapHandles type={type} className="react-flow__node-input" >
            {data.input ? <img src={data.input} alt="Image" style={{ width: "100px", height: "100px" }} /> : <div>Connect me to display data</div>}
        </WrapHandles>
    );
}
);