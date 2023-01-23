import CustomNode from '../components/Nodes/CustomNode';
import ImageInputNode from '../components/Nodes/ImageInputNode';
import CannyNode from '../components/Nodes/CannyNode';

export const nodeTypes = {
    custom: CustomNode,
    image_input: ImageInputNode,
    canny: CannyNode,
};

export const nodeTitles = {
    custom: 'Custom Node',
    image_input: 'Image Input Node',
    canny: 'Canny Node',
};

export default nodeTypes;
