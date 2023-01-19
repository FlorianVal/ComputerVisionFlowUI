import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageUpload = () => {
    const [image, setImage] = useState(null);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: 'image/*',
        maxSize: 5242880,
        multiple: false,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImage(reader.result);
                };
                reader.readAsDataURL(file);
            }
        },
    });

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {image ? (
                <img src={image} alt="Uploaded Image" style={{ width: '100px', height: '100px' }} />
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
