import React from 'react';
import { useDropzone } from 'react-dropzone';
import useStore from '../../utils/store';
import { NodeData } from '../../ressources/nodeTypes';
import { NodeProps } from 'reactflow';

function ImageUpload({type, data, id }: NodeProps<NodeData>) {

    const triggerNodeUpdate = useStore((state: { triggerNodeUpdate: any; }) => state.triggerNodeUpdate);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
        },
        maxSize: 5242880,
        multiple: false,
        onDrop: (acceptedFiles: string | any[]) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    if (typeof reader.result === 'string') {
                        data.output = reader.result;
                        triggerNodeUpdate(id, reader.result);
                    }
                };
            }
        },
    });


    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {data.output ? (
                <img src={data.output} alt="Uploaded" style={{ width: '100px', height: '100px' }} />
            ) : (
                <>
                    {isDragActive ? (
                        <p>Drop the file here ...</p>
                    ) : (
                        <p>click to select a file</p>
                    )}
                </>
            )}
        </div>
    );
};

export default ImageUpload;

