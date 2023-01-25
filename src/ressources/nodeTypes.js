import CustomNode from '../components/Nodes/CustomNode';
import ImageInputNode from '../components/Nodes/ImageInputNode';
import CannyNode from '../components/Nodes/CannyNode';
import ImageViewerNode from '../components/Nodes/ImageViewerNode';

export const nodeTypes = {
    custom: CustomNode,
    image_input: ImageInputNode,
    canny: CannyNode,
    image_viewer: ImageViewerNode,
};

export const nodeTitles = {
    custom: 'Custom Node',
    image_input: 'Image Input Node',
    canny: 'Canny Node',
    image_viewer: 'Image Viewer Node',
};

export default nodeTypes;
