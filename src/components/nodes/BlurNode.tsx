import React, { useEffect, useState } from 'react';
import { NodeProps } from 'reactflow';
import { NodeData } from '../../ressources/nodeTypes';
import WrapHandles from '../../utils/wrapHandles';
import { Slider, Spin, Collapse } from 'antd';
import useStore from '../../utils/store';

function BlurNode({ type, id, data }: NodeProps<NodeData>) {
  const [kernelSize, setKernelSize] = useState(5);

  const [loading, setLoading] = useState(false);
  data.setloading = setLoading;

  const triggerNodeUpdate = useStore((state: { triggerNodeUpdate: any; }) => state.triggerNodeUpdate);

  useEffect(() => {
    const processImage = (input: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (typeof window.cv === 'undefined' || !input) {
          console.error("OpenCV n'est pas prêt ou l'image n'est pas chargée");
          reject('error');
        }

        const tempImage = new Image();
        tempImage.src = input;

        if (!tempImage.src) {
          reject('error');
        }

        // Wait for the image to load before processing it
        tempImage.addEventListener('load', () => {
          try {
            const src = window.cv.imread(tempImage);
            const dst = new window.cv.Mat();

            window.cv.blur(src, dst, new window.cv.Size(kernelSize, kernelSize), new window.cv.Point(-1, -1), window.cv.BORDER_DEFAULT);

            const output = document.createElement('canvas');
            window.cv.imshow(output, dst);

            src.delete();
            dst.delete();

            resolve(output.toDataURL());
          } catch (error) {
            console.error('Error processing image using Openwindow.cv:', error);
            reject('error');
          }
        });
      });
    };



    data.runNode = async (input: string): Promise<string> => {
      try {
        setLoading(true);
        const result = await processImage(input);
        setLoading(false);
        return result;
      } catch (error) {
        console.error('Error processing image:', error);
        throw error;
      }
    };
    triggerNodeUpdate(id, data.input);
  }, [kernelSize]);

  const { Panel } = Collapse;

  return (
    <WrapHandles type={type} className="react-flow__node-default">
      <Slider min={1} max={10} value={kernelSize} onChange={setKernelSize} className='nodrag' />
      <Collapse size='small'>
        <Panel header="" key="1">
          {loading ? (
            <Spin />
          ) : data.output && data.output !== 'error' ? (
            <img src={data.output} alt="Blurred" style={{ width: '100px', height: '100px' }} />
          ) : data.output === 'error' ? (
            <div>Error</div>
          ) : (
            <div>Connect me to display data</div>
          )}
        </Panel>
      </Collapse>
      <div style={{ marginTop: 8 }}>
      </div>
    </WrapHandles>
  );
}

export default BlurNode;
