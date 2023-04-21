import { ColorChooserNode, ColorBrightenerNode, ImageInputNode, ImageViewerNode, BlurNode } from '../components/nodes';

// src/opencv.d.ts
declare global {
    interface Window {
        cv: any;
    }
}

export { };

// Interfaces
export interface NodeData {
    input: string;
    output: string;
    runNode: (input: string) => Promise<string>;
    setloading?: (loading: boolean) => void;
}

interface NodeHandleConfig {
    [key: string]: {
        inputs: boolean;
        outputs: boolean;
    };
}

interface NodeConstraints {
    [key: string]: {
        inputs: number;
        outputs: number;
    };
}

interface NodeTitles {
    [key: string]: string;
}

interface NodeDefaultData {
    [key: string]: NodeData;
}

interface NodeTypes {
    [key: string]: React.ComponentType<any>;
}

// Constants
export const nodeTypes: NodeTypes = {
    colorChooser: ColorChooserNode,
    colorBrightener: ColorBrightenerNode,
    imageInput: ImageInputNode,
    imageViewer: ImageViewerNode,
    blur: BlurNode,
};

export const nodeTitles: NodeTitles = {
    colorChooser: 'Color Chooser Node',
    colorBrightener: 'Color Brightener Node',
    imageInput: 'Image Input Node',
    imageViewer: 'Image Viewer Node',
    blur: 'Blur Node',
};

export const nodeDefaultData: NodeDefaultData = {
    colorChooser: {
        input: '#4FD1C5',
        output: '#4FD1C5',
        runNode: async () => {
            return '#ffffff';
        },
    },
    colorBrightener: {
        input: '#F56565',
        output: '#F56565',
        runNode: async () => {
            return '#ffffff';
        },
    },
    imageInput: {
        input: '',
        output: '',
        runNode: async () => {
            return '';
        },
    },
    imageViewer: {
        input: '',
        output: '',
        runNode: async () => {
            return '';
        },
    },
    blur: {
        input: '',
        output: '',
        runNode: async () => {
            return '';
        },
    },
};


export const nodeConstraints: NodeConstraints = {
    colorChooser: {
        inputs: 1,
        outputs: 1,
    },
    colorBrightener: {
        inputs: 1,
        outputs: 1,
    },
    imageInput: {
        inputs: 0,
        outputs: 2,
    },
    imageViewer: {
        inputs: 2,
        outputs: 0,
    },
    blur: {
        inputs: 2,
        outputs: 2,
    },
};

export const nodeHasHandle: NodeHandleConfig = {
    colorChooser: { inputs: true, outputs: true },
    colorBrightener: { inputs: true, outputs: true },
    imageInput: { inputs: false, outputs: true },
    imageViewer: { inputs: true, outputs: false },
    blur: { inputs: true, outputs: true },
};

export default nodeTypes;
