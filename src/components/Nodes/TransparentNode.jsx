/* global cv */

import React, { memo, useEffect } from "react";
import { useUpdateNodeInternals } from 'reactflow'
import { WrapHandles } from "../utils/utils";
import cv from "opencv-wasm";

export default memo(({ type, id, data }) => {
    // To update output of the node
    const updateNodeInternals = useUpdateNodeInternals();
    const canvasRef = useRef(null);

    const run = () => {
        console.log("Running Transparent Node");
        if (typeof cv === "undefined" || !data.input) {
            console.error("OpenCV n'est pas prêt ou l'image n'est pas chargée");
            return;
        }

        // Créez un élément img temporaire pour charger les données d'image base64
        const tempImage = new Image();
        tempImage.src = data.input;
        tempImage.onload = () => {
            // Créez un élément canvas temporaire pour convertir l'image en cv.Mat
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = tempImage.width;
            tempCanvas.height = tempImage.height;
            const ctx = tempCanvas.getContext("2d");
            ctx.drawImage(tempImage, 0, 0, tempImage.width, tempImage.height);

            // Utilisez OpenCV.js pour traiter l'image
            const outputCanvas = document.createElement("canvas");
            const src = cv.imread(tempCanvas);
            const dst = new cv.Mat();
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

            outputCanvas.width = dst.cols;
            outputCanvas.height = dst.rows;
            cv.imshow(outputCanvas, dst);
            data.output = outputCanvas.toDataURL("image/png");

            src.delete();
            dst.delete();
        };
        console.log("Transparent Node data", data)
        updateNodeInternals(id);
    };

    useEffect(() => {

        if (typeof cv === "undefined") {
            // OpenCV n'est pas encore prêt
            console.error("OpenCV n'est pas prêt");
            return;
        }
        console.log("Transparent Node data", data)
        if (data.input) {
            console.log("Running Transparent Node");
            run();
        }
    }, []);

    return (
        //console.log("Rendering Transparent Node data", data),
        <WrapHandles type={type} className="react-flow__node-default" >
            {data.input ? <img src={data.output} alt="Image" style={{ width: "100px", height: "100px" }} /> : <div>Connect me to display data</div>}
        </WrapHandles>
    );
});