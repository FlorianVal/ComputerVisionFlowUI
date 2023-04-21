import { create, StoreApi } from 'zustand';
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
    getOutgoers,
} from 'reactflow';

import { NodeData, nodeDefaultData } from '../ressources/nodeTypes';

import initialNodes from '../ressources/nodes';
import initialEdges from '../ressources/edges';


export type RFState = {
    nodes: Node<NodeData>[];
    edges: Edge[];
    reactFlowInstance: any;
    getNodes: () => Node<NodeData>[];
    getEdges: () => Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    triggerNodeUpdate: (nodeId: string, input: string) => void;
    setReactFlowInstance: (reactFlowInstance: any) => void;
};

async function updateOutgoers(
    currentNode: Node<NodeData>,
    nodes: Node<NodeData>[],
    edges: Edge[],
    set: StoreApi<RFState>['setState'],
    input: string,
): Promise<void> {

    const queue: { node: Node<NodeData> }[] = [{ node: currentNode }];
    function renderNode(node: Node<NodeData>) {
        set((state) => {
            return {
                nodes: state.nodes.map((n) => {
                    if (n.id === node.id) {
                        n.data = { ...n.data, ...node.data };
                    }
                    return n;
                }),
            };
        });
    }
    // if input is different from currentnode input and if input is not empty, render the currentnode
    const current = queue.shift();
    if (!current) return;
    // treat first node diffrently because function send input of node
    if (input !== '') {

        current.node.data.input = input;
        current.node.data.output = await current.node.data.runNode(input);
        renderNode(current.node);
    }

    getOutgoers(current.node, nodes, edges).forEach((outgoer: Node<NodeData>) => {
        outgoer.data.input = current.node.data.output;
        queue.push({ node: outgoer });
    });

    while (queue.length > 0) {
        const current = queue.shift();

        if (!current) continue;

        // compute output and render
        current.node.data.output = await current.node.data.runNode(current.node.data.input);
        renderNode(current.node);

        // add output to outgoers input and add them to the queue
        getOutgoers(current.node, nodes, edges).forEach((outgoer: Node<NodeData>) => {
            outgoer.data.input = current.node.data.output;
            queue.push({ node: outgoer });
        });
    }


    /*
    ///////////////////////////
    //const queue: { node: Node<NodeData> }[] = [{ node: currentNode }];
    // keep track of the updated nodes to prevent infinite loop and to render at the end
    const updatedNodes: { [key: string]: Node<NodeData> } = {};

    const setLoadingForNode = (nodeId: string, loading: boolean) => {
        const node = updatedNodes[nodeId] || nodes.find((n) => n.id === nodeId);
        if (node && node.data.setloading) {
            node.data.setloading(loading);
        }
    };

    const setGraphLoading = (loading: boolean, node: Node<NodeData>) => {
        const queue: { node: Node<NodeData> }[] = [{ node }];
        while (queue.length > 0) {
            const current = queue.shift();
            if (!current) continue;
            setLoadingForNode(current.node.id, loading);
            const outgoers = getOutgoers(current.node, nodes, edges)
            outgoers.forEach((outgoer: Node<NodeData>) => {
                // not robust to cyclic graphs
                setLoadingForNode(outgoer.id, loading);
                queue.push({ node: outgoer });
            });
        }
    };

    //setGraphLoading(true, currentNode);
    while (queue.length > 0) {
        // get first element of queue
        const current = queue.shift();
        if (!current) continue;

        // get input of the current node and compute the output
        const currentInput = updatedNodes[current.node.id]?.data.input || input || current.node.data.input
        const currentOutput = await current.node.data.runNode(currentInput);

        // set the output of the current node to currentOutput
        updatedNodes[current.node.id] = { ...current.node, data: { ...current.node.data, output: currentOutput, input: currentInput } };

        const outgoers = getOutgoers(current.node, nodes, edges).map((outgoer: Node<NodeData>) => {
            return updatedNodes[outgoer.id] ? updatedNodes[outgoer.id] : outgoer;
        });

        // set the input of the outgoers to currentOutput
        outgoers.forEach((outgoer: Node<NodeData>) => {
            // prevent infinite loop
            if (updatedNodes[outgoer.id]) return;

            updatedNodes[outgoer.id] = { ...outgoer, data: { ...outgoer.data, input: currentOutput } };
            queue.push({ node: outgoer });
        });
    }
    //setGraphLoading(false, currentNode);

    // Update the state once with all the updated nodes
    set((state) => {
        return {
            nodes: state.nodes.map((node) => {
                return updatedNodes[node.id] ? updatedNodes[node.id] : node;
            }),
        };
    });
    */
}


// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
    reactFlowInstance: null,
    getNodes: () => get().nodes,
    getEdges: () => get().edges,
    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });

        // On new connection, update the outgoers of the source node
        updateOutgoers(
            get().nodes.find((node) => node.id === connection.source) as Node<NodeData>,
            get().nodes,
            get().edges,
            set,
            '',
        );
    },
    onDrop: (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const reactFlowBounds = document.getElementById('reactflow-wrapper')?.getBoundingClientRect();
        const type = event.dataTransfer?.getData('application/reactflow');

        // TODO check reactFlowInstance might be null
        const reactFlowInstance = get().reactFlowInstance;

        const position = reactFlowInstance.project({
            x: event.clientX - (reactFlowBounds?.left || 0),
            y: event.clientY - (reactFlowBounds?.top || 0),
        });

        const newNode = {
            id: `node_${get().nodes.length}`,
            type,
            position,
            data: nodeDefaultData[type],
        };

        set({
            nodes: [...get().nodes, newNode],
        });
    },
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    },
    triggerNodeUpdate: (nodeId: string, input: string) => {
        const currentNode = get().nodes.find((node) => node.id === nodeId);

        if (currentNode) {
            updateOutgoers(currentNode, get().nodes, get().edges, set, input);
        } else {
            console.warn('Node not found with nodeId:', nodeId);
            return;
        }

    },
    setReactFlowInstance: (reactFlowInstance: any) => set({ reactFlowInstance }),
}));

export default useStore;
