import CustomNode from '../components/Nodes/CustomNode';
import ImageInputNode from '../components/Nodes/ImageInputNode';

export const nodeTypes = {
    custom: CustomNode,
    image_input: ImageInputNode,
};

export const nodeTitles = {
    custom: 'Custom Node',
    image_input: 'Image Input Node',
};

export default nodeTypes;
