import React, { useState, memo } from 'react';
import { useDropzone } from 'react-dropzone';

export default memo(({ id, data }) => {
    const [image, setImage] = useState(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
        },
        maxSize: 5242880,
        multiple: false,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    data.output = reader.result;
                    data.file = file;
                    setImage(reader.result);

                };
            }
        },
    });


    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {image ? (
                <img src={image} alt="Uploaded" style={{ width: '100px', height: '100px' }} />
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
});


