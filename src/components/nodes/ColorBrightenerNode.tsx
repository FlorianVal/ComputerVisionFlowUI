import React, { useState } from 'react';
import { NodeProps } from 'reactflow';
import chroma from 'chroma-js';
import WrapHandles from '../../utils/wrapHandles';
import { NodeData } from '../../ressources/nodeTypes';
import { Spin } from 'antd';

function ColorBrightenerNode({ type, id, data }: NodeProps<NodeData>) {
  const [loading, setLoading] = useState(false);
  data.setloading = setLoading;

  data.runNode = async (input: string) => {
    return chroma(input).brighten(1).hex();
  };

  return (
    <div style={{ backgroundColor: data.output, borderRadius: 10 }}>
      <WrapHandles type={type} upDown={true}>
        <div style={{ padding: 20, backgroundColor: data.input }}>
          {loading ? (
            <Spin /> 
          ) : null}
        </div>
      </WrapHandles>
    </div>
  );
}

export default ColorBrightenerNode;
