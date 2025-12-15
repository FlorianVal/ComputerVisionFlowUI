const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

// Mock browser environment for OpenCV.js if needed or just setup Module
// Emscripten builds often look for a global 'Module' object
global.Module = {
    onRuntimeInitialized: async function () {
        console.log('OpenCV.js is ready');
        try {
            await processImage();
        } catch (err) {
            console.error('Error processing image:', err);
        }
    }
};

// Load OpenCV.js
// We use eval/vm or just require if it's UMD. 
// require('./public/opencv.js') often fails because of "self is not defined" or similar in strict browser builds.
// We'll try to read and execute it in specific context or just try require and see.
// For a "minimal" script, let's try strict require first, if it fails we might need a more complex loader.
// Actually, standard opencv.js often assigns to `cv` global or module.exports.
// Let's rely on the global `cv` usually created if Module is defined.

try {
    // We need to define 'self' or 'window' for some builds
    global.self = global;
    global.window = global;
    global.document = {
        createElement: () => {
            return {
                getContext: () => ({}),
                addEventListener: () => { },
            }
        },
        addEventListener: () => { },
    };

    // NOTE: This might be large, but it's the local file
    // NOTE: This might be large, but it's the local file
    global.cv = require('./opencv_lib.cjs');
} catch (e) {
    console.error("Failed to load opencv.js via require:", e);
    process.exit(1);
}

async function processImage() {
    const inputPath = path.join(__dirname, 'asset', 'image.png');
    const outputPath = path.join(__dirname, 'asset', 'image-gray.png');

    console.log(`Reading image from ${inputPath}...`);
    const image = await Jimp.read(inputPath);
    console.log(image)
    console.log("LOADED")
    const src = cv.matFromImageData(image.bitmap);

    const dst = new cv.Mat();

    console.log('Converting to grayscale...');
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

    console.log('Writing output...');
    // Initialize a new Jimp image from the grayscale data
    // dst is CV_8UC1 (1 channel), Jimp expects RGBA (4 channels)
    // We need to convert grayscale back to RGBA for simple saving, or construct Jimp manually

    // Easiest is to convert back to RGBA in OpenCV before saving
    const dstRgba = new cv.Mat();
    cv.cvtColor(dst, dstRgba, cv.COLOR_GRAY2RGBA);

    // Create a new Jimp image
    // In jimp v1, using new Jimp({...}) might be different or require different args.
    // Instead, we can clone the original and set data, or create new empty.

    try {
        const outImage = new Jimp({
            width: dstRgba.cols,
            height: dstRgba.rows,
            data: Buffer.from(dstRgba.data)
        });

        console.log('Saving image...');
        await outImage.write(outputPath);
        // In some versions write returns promise, in others it takes callback. 
        // If write is sync or callback-based and we await it, it might settle immediately (undefined).
        // Safest is writeAsync if available, or wrap write.
        // But let's check if 'write' is actually async or returns promise in this version.
        // Assuming newest jimp:
        // await outImage.write(outputPath);

        console.log(`Saved grayscale image to ${outputPath}`);
    } catch (e) {
        // Fallback if constructor failed or write failed
        try {
            // Try creating empty and scanning? No, too slow.
            // Maybe explicitly use writeAsync?
            // Or maybe new Jimp(w, h, (err, image) => ...)
            console.error("Write error (attempt 1):", e);

            // Retry with writeAsync if write failed (e.g. not a promise)
            // const outImage = ... (recreate if needed)
        } catch (e2) {
            console.error("Final write error:", e2);
        }
    }

    // Cleanup
    src.delete();
    dst.delete();
    dstRgba.delete();
}
