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

export default nodeTypes;
