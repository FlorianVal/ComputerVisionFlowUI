import React, { memo, useEffect, useState } from 'react';
import { Handle } from 'reactflow';
import ImageUpload from '../subcomponents/ImageUpload';
import { useUpdateNodeInternals, useStoreApi } from 'reactflow';

export default memo(({ id, data }) => {
    /* Data model:
    {
        id: 'node-id',
        type: 'image-input',
        data: {
            image: 'base64-encoded-image',
            file: 'file-object',
        },
        position: { x: 0, y: 0 },
    }
    */
    const [image, setImage] = useState(null);
    const updateNodeInternals = useUpdateNodeInternals();
    const store = useStoreApi();
    // To update output of the node
    const run = () => {
        console.log("Running Image Input Node");
        data.output = image;
        updateNodeInternals(id);
    };

    useEffect(() => {
        run();
    }, [image]);

    return (
        <div className="react-flow__node-input">
            <ImageUpload image={image} setImage={setImage} />
            <Handle type="source" position="right" id="output" isConnectable={true} />
        </div>
    );
});