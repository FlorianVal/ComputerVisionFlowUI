import ImageSourceNode from './ImageSourceNode'
import GrayscaleNode from './GrayscaleNode'
import BlurNode from './BlurNode'
import CannyNode from './CannyNode'
import MorphologicalNode from './MorphologicalNode'
import FindContoursNode from './FindContoursNode'
import ThresholdNode from './ThresholdNode'
import RotateNode from './RotateNode'
import BrightnessNode from './BrightnessNode'
import InvertNode from './InvertNode'
import ColorConvertNode from './ColorConvertNode'

// Node type registry for React Flow
export const nodeTypes = {
    imageSource: ImageSourceNode,
    grayscale: GrayscaleNode,
    blur: BlurNode,
    canny: CannyNode,
    morphological: MorphologicalNode,
    findContours: FindContoursNode,
    threshold: ThresholdNode,
    rotate: RotateNode,
    brightness: BrightnessNode,
    invert: InvertNode,
    colorConvert: ColorConvertNode,
}

export { ImageSourceNode, GrayscaleNode, BlurNode, CannyNode, MorphologicalNode, FindContoursNode, ThresholdNode, RotateNode, BrightnessNode, InvertNode, ColorConvertNode }

