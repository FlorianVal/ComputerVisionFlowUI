import React from 'react';
import { NodeProps } from 'reactflow';
import ImageUpload from '../subcomponents/ImageUpload'
import { WrapHandles } from '../../utils/wrapHandles';
import { NodeData } from '../../ressources/nodeTypes';

function ImageInputNode({ type, id, data }: NodeProps<NodeData>) {

    data.runNode = async () => {
        return data.output ? data.output : '';
    };

    return (
        <WrapHandles type={type} className="react-flow__node-input" >
            <ImageUpload type={type} data={data} id={id} selected={false} zIndex={0} isConnectable={false} xPos={0} yPos={0} dragging={false} />
        </WrapHandles>
    );
};

export default ImageInputNode;
