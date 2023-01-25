import React, { memo, useEffect, useState } from 'react';
import { Handle } from 'reactflow';
import ImageUpload from '../subcomponents/ImageUpload';
import { useUpdateNodeInternals, useStoreApi } from 'reactflow';
import { WrapHandles } from "../utils/utils";

export default memo(({ type, id, data }) => {
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
        <WrapHandles type={type} className="react-flow__node-input" >
            <ImageUpload image={image} setImage={setImage} />
        </WrapHandles>
    );
});