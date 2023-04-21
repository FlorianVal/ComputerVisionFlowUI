import { Node } from 'reactflow';

export default [
    {
        id: '1',
        type: 'colorChooser',
        data: { input: '#4FD1C5', output: '#4FD1C5' },
        position: { x: 250, y: 25 },
    },

    {
        id: '2',
        type: 'colorChooser',
        data: { input: '#F6E05E', output: '#F6E05E' },
        position: { x: 250, y: 425 },
    },
    {
        id: '3',
        type: 'colorChooser',
        data: { input: '#B794F4', output: '#B794F4' },
        position: { x: 250, y: 225 },
    },
    {
        id: '4',
        type: 'colorBrightener',
        data: { input: '#F56565', output: '#F56565'  },
        position: { x: 100, y: 325 },
    },
    {
        id: '5',
        type: 'colorBrightener',
        data: { input: '#F56565', output: '#F56565' },
        position: { x: 100, y: 125 },
    },
    {
        id: '6',
        type: 'imageInput',
        data: { input: '', output: '' },
        position: { x: 400, y: 25 },
    },
    {
        id: '7',
        type: 'blur',
        data: { input: '', output: '' },
        position: { x: 450, y: 25 },
    },
] as Node[];
