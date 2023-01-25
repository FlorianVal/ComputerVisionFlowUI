import CustomNode from '../components/Nodes/CustomNode';
import ImageInputNode from '../components/Nodes/ImageInputNode';
import CannyNode from '../components/Nodes/CannyNode';
import ImageViewerNode from '../components/Nodes/ImageViewerNode';
import TransparentNode from '../components/Nodes/TransparentNode';

export const nodeTypes = {
    custom: CustomNode,
    image_input: ImageInputNode,
    canny: CannyNode,
    image_viewer: ImageViewerNode,
    transparent: TransparentNode,
};

export const nodeTitles = {
    custom: 'Custom Node',
    image_input: 'Image Input Node',
    canny: 'Canny Node',
    image_viewer: 'Image Viewer Node',
    transparent: 'Transparent Node',
};

export const nodeConstraints = {
    custom: {
        inputs: 1,
        outputs: 1,
    },
    image_input: {
        inputs: 0,
        outputs: 1,
    },
    canny: {
        inputs: 1,
        outputs: 1,
    },
    image_viewer: {
        inputs: 1,
        outputs: 0,
    },
    transparent: {
        inputs: 1,
        outputs: 1,
    },
};

export const nodeHandleMultipleConnections = {
    custom: { inputs: false, outputs: false },
    image_input: { inputs: false, outputs: true },
    canny: { inputs: false, outputs: true },
    image_viewer: { inputs: false, outputs: false },
    transparent: { inputs: false, outputs: true },
};

export const nodeHasHandle = {
    custom: { inputs: false, outputs: false },
    image_input: { inputs: false, outputs: true },
    canny: { inputs: true, outputs: true },
    image_viewer: { inputs: true, outputs: false },
    transparent: { inputs: true, outputs: true },
};

export default nodeTypes;
