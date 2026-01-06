import ImageSourceNode from './ImageSourceNode'
import GrayscaleNode from './GrayscaleNode'
import BlurNode from './BlurNode'
import CannyNode from './CannyNode'
import MorphologicalNode from './MorphologicalNode'
import FindContoursNode from './FindContoursNode'
import ThresholdNode from './ThresholdNode'
import BrightnessNode from './BrightnessNode'

// Node type registry for React Flow
export const nodeTypes = {
    imageSource: ImageSourceNode,
    grayscale: GrayscaleNode,
    blur: BlurNode,
    canny: CannyNode,
    morphological: MorphologicalNode,
    findContours: FindContoursNode,
    threshold: ThresholdNode,
    brightness: BrightnessNode,
}

export { ImageSourceNode, GrayscaleNode, BlurNode, CannyNode, MorphologicalNode, FindContoursNode, ThresholdNode }

