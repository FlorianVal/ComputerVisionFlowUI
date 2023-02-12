import React, { memo, useEffect, useRef } from "react";
import { useUpdateNodeInternals } from "reactflow";
import { WrapHandles } from "../utils/utils";
import cv from "opencv-wasm";

export default memo(({ type, id, data }) => {
    // To update output of the node
    const updateNodeInternals = useUpdateNodeInternals();
    const canvasRef = useRef(null);

    const run = () => {
        console.log("Running Image Input Node", id);
        if (data.input && canvasRef.current) {
            // Create a canvas element to draw the image
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.src = data.input;
            img.onload = () => {
                // Resize the canvas to fit the image
                canvas.width = img.width;
                canvas.height = img.height; 
                // Draw the image on the canvas
                ctx.drawImage(img, 0, 0);
                // Create an OpenCV matrix from the canvas image data
                const src = cv.matFromImageData(ctx.getImageData(0, 0, img.width, img.height));
                // Create an empty matrix for the output
                const dst = new cv.Mat();
                // Apply a Gaussian blur filter with a kernel size of 5x5
                cv.GaussianBlur(src, dst, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
                // Put the output matrix back to the canvas
                ctx.putImageData(new ImageData(new Uint8ClampedArray(dst.data), dst.cols, dst.rows), 0, 0);
                // Free the memory
                src.delete();
                dst.delete();
                // Set the output as the canvas data URL
                data.output = canvas.toDataURL();
                updateNodeInternals(id);
            };
        }
    };

    useEffect(() => {
        run();
    }, [data.input]);

    return (
        console.log("Rendering Image Input Node data", data),
        <WrapHandles type={type} className="react-flow__node-default">
            {data.input ? (
                <canvas ref={canvasRef} style={{ width: "100px", height: "100px" }} />
            ) : (
                <div>Connect me to display data</div>
            )}
        </WrapHandles>
    );
});