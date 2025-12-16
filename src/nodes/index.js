import ImageSourceNode from './ImageSourceNode'
import GrayscaleNode from './GrayscaleNode'
import BlurNode from './BlurNode'
import CannyNode from './CannyNode'
import MorphologicalNode from './MorphologicalNode'
import FindContoursNode from './FindContoursNode'

// Node type registry for React Flow
export const nodeTypes = {
    imageSource: ImageSourceNode,
    grayscale: GrayscaleNode,
    blur: BlurNode,
    canny: CannyNode,
    morphological: MorphologicalNode,
    findContours: FindContoursNode,
}

export { ImageSourceNode, GrayscaleNode, BlurNode, CannyNode, MorphologicalNode, FindContoursNode }

