import { create } from 'zustand';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';
import { useCallback } from 'react';
import { nodes as initialNodes, edges as initialEdges } from './ressources/initial-elements';
/*
type RFState = {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
};*/

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create((set, get) => ({
    id: 0,
    getId: () => {
        set({ id: get().id + 1 });
        return `${get().id++}`;
    },

    nodes: [],
    edges: [],
    getEdges: () => get().edges,
    setEdges: (edges) => set({ edges }),
    addEdges: (source, target) => {
        const newEdge = {
            id: get().getId(),
            source,
            target,
        };
        set({ edges: [...get().edges, newEdge] });
        console.log('In AddEdges:', newEdge);
    },
    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },

    getNodes: () => get().nodes,
    setNodes: (nodes) => set({ nodes }),
    addNodes: (type, position) => {
        const newNode = {
            id: get().getId(),
            type,
            position,
            data: { label: `${type} node` },
        };
        set({ nodes: [...get().nodes, newNode] });
        console.log('In AddNodes:', newNode);
    },
    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
        console.log('In OnNodesChange:', get().nodes);
    },

    /*onConnect: (connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    }, */
}));

export default useStore;
