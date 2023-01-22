import React, { memo } from 'react';

function CustomNode({ id, data }) {
    return (
        <>
            <div className="custom-node__header">
                This is a <strong>custom node</strong>
            </div>
            <div className="custom-node__body">

            </div>
        </>
    );
}

export default memo(CustomNode);