import ImageSourceNode from './ImageSourceNode'
import GrayscaleNode from './GrayscaleNode'
import BlurNode from './BlurNode'
import CannyNode from './CannyNode'
import MorphologicalNode from './MorphologicalNode'

// Node type registry for React Flow
export const nodeTypes = {
    imageSource: ImageSourceNode,
    grayscale: GrayscaleNode,
    blur: BlurNode,
    canny: CannyNode,
    morphological: MorphologicalNode,
}

export { ImageSourceNode, GrayscaleNode, BlurNode, CannyNode, MorphologicalNode }

