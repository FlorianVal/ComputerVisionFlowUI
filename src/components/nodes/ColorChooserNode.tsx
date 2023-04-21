import React, { useState } from 'react';
import { NodeProps } from 'reactflow';
import chroma from 'chroma-js';
import useStore from '../../utils/store';
import { NodeData } from '../../ressources/nodeTypes';
import WrapHandles from '../../utils/wrapHandles';
import { Spin } from 'antd';

function ColorChooserNode({ type, id, data }: NodeProps<NodeData>) {
  const [loading, setLoading] = useState(false);
  data.setloading = setLoading;

  const triggerNodeUpdate = useStore(
    (state: { triggerNodeUpdate: any }) => state.triggerNodeUpdate
  );

  data.runNode = async (input: string) => {
    return chroma(input).darken(1).hex();
  };

  return (
    <div style={{ backgroundColor: data.output, borderRadius: 10 }}>
      <WrapHandles type={type} upDown={true}>
        <div style={{ padding: 20, backgroundColor: data.input }}>
          {loading ? (
            <Spin />
          ) : null}
          <input
            type="color"
            value={data.input}
            onChange={(evt) => triggerNodeUpdate(id, evt.target.value)}
            className="nodrag"
          />
        </div>
      </WrapHandles>
    </div>
  );
}

export default ColorChooserNode;
