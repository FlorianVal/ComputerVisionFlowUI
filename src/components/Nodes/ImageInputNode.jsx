import React, { memo } from 'react';
import { Handle } from 'reactflow';
import ImageUpload from '../subcomponents/ImageUpload';

export default memo(({ data }) => {
    /* Data model:
    {
        id: 'node-id',
        type: 'image-input',
        data: {
            output: 'base64-encoded-image',
            file: 'file-object',
        },
        position: { x: 0, y: 0 },
    }
    */
    return (
        <div className="react-flow__node-input">
            <ImageUpload data={data} />
            <Handle type="source" position="right" id="output" isConnectable={true} />
        </div>
    );
});