import "./App.css";
import "@xyflow/react/dist/style.css";
import { HocuspocusProvider } from "@hocuspocus/provider";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import { getNewNodeData } from "./utils/get-new-node-data";

const provider = new HocuspocusProvider({
  url: "ws://127.0.0.1:1234",
  name: "reactflow-yjs",
});

const ydoc = provider.document;
const nodesMap = ydoc.getMap<Node>("nodes");
const edgesMap = ydoc.getMap<Edge>("edges");

export const App = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const nodesObserver = () => {
      setNodes(Array.from(nodesMap.values()));
    };
    const edgesObserver = () => {
      setEdges(Array.from(edgesMap.values()));
    };

    nodesObserver();
    edgesObserver();

    nodesMap.observe(nodesObserver);
    edgesMap.observe(edgesObserver);

    return () => {
      nodesMap.unobserve(nodesObserver);
      edgesMap.unobserve(edgesObserver);
    };
  }, []);

  const addNode = () => {
    const nodeData = getNewNodeData();
    nodesMap.set(nodeData.id, nodeData);
  };

  const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    const nodes = Array.from(nodesMap.values());
    const nextNodes = applyNodeChanges(changes, nodes);

    for (const change of changes) {
      if (change.type === "add" || change.type === "replace") {
        nodesMap.set(change.item.id, change.item);
      } else if (change.type === "remove" && nodesMap.has(change.id)) {
        nodesMap.delete(change.id);
      } else {
        nodesMap.set(change.id, nextNodes.find((n) => n.id === change.id)!);
      }
    }
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    const edges = Array.from(edgesMap.values());
    const nextEdges = applyEdgeChanges(changes, edges);

    for (const change of changes) {
      if (change.type === "add" || change.type === "replace") {
        edgesMap.set(change.item.id, change.item);
      } else if (change.type === "remove" && edgesMap.has(change.id)) {
        edgesMap.delete(change.id);
      } else {
        edgesMap.set(change.id, nextEdges.find((n) => n.id === change.id)!);
      }
    }
  }, []);

  const onConnect = useCallback((params: Connection) => {
    const edges = Array.from(edgesMap.values());
    const nextEdges = addEdge(params, edges);

    for (const edge of nextEdges) {
      if (edgesMap.has(edge.id)) {
        continue;
      }

      edgesMap.set(edge.id, edge);
    }
  }, []);

  return (
    <div className="diagram-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      <button className="add-node-btn" onClick={addNode}>
        Add node
      </button>
    </div>
  );
};
