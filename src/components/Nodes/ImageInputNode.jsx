import React, { useState, memo } from 'react';
import { useReactFlow, Handle } from 'reactflow';
import Dropzone from 'react-dropzone';
import ImageUpload from '../subcomponents/ImageUpload';

const ImageInputNode = ({ id }) => {
    const [image, setImage] = useState(null);
    const { setNodes } = useReactFlow();

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
            setNodes((nodes) => {
                nodes.find((node) => node.id === id).data.image = reader.result;
                return nodes;
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="react-flow__node-input">
            <ImageUpload> </ImageUpload>
            <Handle type="source" position="right" id="a" isConnectable={true} />
        </div>
    );
};

export default memo(ImageInputNode);
