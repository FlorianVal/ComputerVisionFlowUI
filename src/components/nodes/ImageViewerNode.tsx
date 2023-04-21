import React, { useState } from 'react';
import { NodeProps } from 'reactflow';
import { NodeData } from '../../ressources/nodeTypes';
import WrapHandles from '../../utils/wrapHandles';
import { Spin } from 'antd';

function ImageViewerNode({ type, id, data }: NodeProps<NodeData>) {
  const [loading, setLoading] = useState(false);
  data.setloading = setLoading;

  return (
    <WrapHandles type={type} className="react-flow__node-input">
      {loading ? (
        <Spin />
      ) : data.input ? (
        <img
          src={data.input}
          alt="Connection"
          style={{ width: '100px', height: '100px' }}
        />
      ) : (
        <div>Connect me to display data</div>
      )}
    </WrapHandles>
  );
}

export default ImageViewerNode;
