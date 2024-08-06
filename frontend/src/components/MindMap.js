import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';

// Custom node component
const CustomNode = ({ id, data, isConnectable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleDoubleClick = () => {
    setIsEditing(true);
  }

  const handleBlur =() => {
    setIsEditing(false);
    data.onNodesChange(label);
  }

  // const handleAddChild = () => {
  //   data.onAddChild(id)
  // }
  
  return (
    <div
      style={{
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        background: 'white',
        minWidth: '150px',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <div>{label}</div>
      )}
      {data.note && <div style={{ fontSize: '0.8em', color: '#666' }}>{data.note}</div>}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

function MindMap({ data, onUpdate }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // const [translate, setTranslate] = useState({ x: 300, y: 50 });
  // const [editingNode, setEditingNode] = useState(null);
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef(null);
  // const [connectionMode, setConnectionMode] = useState(null);

  // Convert mind map data to React Flow format
  React.useEffect(() => {
    if (data) {
      const { nodes: newNodes, edges: newEdges } = convertToReactFlowFormat(data);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [data, setNodes, setEdges]);

  const onConnect = useCallback((params) => {
    const newEdge = { ...params, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } };
    setEdges((eds) => addEdge(newEdge, eds));
    onUpdate({ updatedEdges: [...edges, newEdge] });
  }, [setEdges, edges, onUpdate])

  const onNodeChange = useCallback(
    (nodeId, newLabel) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, label: newLabel } } : node
        )
      );
      onUpdate({ updatedNode: { id: nodeId, data: { label: newLabel }}});
    },
    [setNodes, onUpdate]
  );

  // const onAddChild = useCallback(
  //   (parentId) => {
  //     const parentNode = nodes.find(node => node.id === parentId);
  //     if (!parentNode) return;

  //     const newNodeId = `node-${Date.now()}`;
  //     const newNode = {
  //       id: newNodeId,
  //       type: 'custom',
  //       position: {
  //         x: parentNode.position.x + 200,
  //         y: parentNode.position.y + 100,
  //       },
  //       data: { 
  //         label: 'New Node', 
  //         onNodeChange: onNodeChange, 
  //         onAddChild: onAddChild, 
  //       },
  //     };
  //     const newEdge = {
  //       id: `edge-${parentId}-${newNodeId}`,
  //       source: parentId,
  //       target: newNodeId,
  //       type: 'smoothstep',
  //       markerEnd: { type: MarkerType.ArrowClosed },
  //     };

  //     setNodes((nds) => [...nds, newNode]);
  //     setEdges((eds) => [...eds, newEdge]);
  //     onUpdate({ updatedMap: { nodes: [...nodes, newNode], edges: [...edges, newEdge] } });
  //   },
  //   [setNodes, setEdges, onNodeChange, onUpdate, nodes, edges]
  // );

  // React.useEffect(() => {
  //   if (data) {
  //     const rootNode = {
  //       id: 'root',
  //       type: 'custom',
  //       position: { x: 0, y: 0 },
  //       data: { label: data.name, onNodeChange: (label) => onNodeChange('root', label) },
  //     };
  //     setNodes([rootNode]);
  //   }
  // }, [data, setNodes, onNodeChange]);

  // const onDragOver = useCallback((event) => {
  //   event.preventDefault();
  //   event.dataTransfer.dropEffect = 'move';
  // }, []);

  // const onDrop = useCallback(
  //   (event) => {
  //     event.preventDefault();

  //     const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
  //     const type = event.dataTransfer.getData('application/reactflow');

  //     if (typeof type === 'undefined' || !type) {
  //       return;
  //     }

  //     const position = reactFlowInstance.current.project({
  //       x: event.clientX - reactFlowBounds.left,
  //       y: event.clientY - reactFlowBounds.top,
  //     });
  //     const newNode = {
  //       id: `node-${Date.now()}`,
  //       type,
  //       position,
  //       data: { label: `${type} node`, onNodeChange: (label) => onNodeChange(`node-${Date.now()}`, label) },
  //     };

  //     setNodes((nds) => nds.concat(newNode));
  //   },
  //   [setNodes, onNodeChange]
  // );
  // const handleNodeClick = (event, node) => {
  //   // Handle node click for editing
  //   setEditingNode(node);
  // };

  // const handleEditSubmit = (e) => {
  //   e.preventDefault();
  //   const updatedNode = {
  //     ...editingNode,
  //     data: {
  //       ...editingNode.data,
  //       label: e.target.elements.nodeName.value,
  //       note: e.target.elements.nodeNote.value,
  //     },
  //   };
  //   setNodes((nds) => nds.map((node) => (node.id === updatedNode.id ? updatedNode : node)));
  //   onUpdate({ updatedNode });
  //   setEditingNode(null);
  // };

  // const handleAddChild = () => {
  //   const newChildId = `${editingNode.id}-child-${Date.now()}`;
  //   const newChild = {
  //     id: newChildId,
  //     type: 'custom',
  //     position: { x: editingNode.position.x + 200, y: editingNode.position.y },
  //     data: { label: 'New Child', note: '' },
  //   };
  //   const newEdge = { id: `${editingNode.id}-${newChildId}`, source: editingNode.id, target: newChildId, type: 'smoothstep' };
    
  //   setNodes((nds) => [...nds, newChild]);
  //   setEdges((eds) => [...eds, newEdge]);
  //   onUpdate({ updatedNode: newChild });
  // };

  // Saving Mind Map as PNG file
  const handleSave = useCallback(() => {
    if (reactFlowInstance.current && reactFlowWrapper.current) {
      const flow = reactFlowInstance.current;
      const { nodes, edges } = flow.toObject();

    // Calculate the bounding box of all nodes
    const bbox = nodes.reduce(
      (acc, node) => {
        acc.left = Math.min(acc.left, node.position.x);
        acc.top = Math.min(acc.top, node.position.y);
        acc.right = Math.max(acc.right, node.position.x + (node.width || 150));
        acc.bottom = Math.max(acc.bottom, node.position.y + (node.height || 50));
        return acc;
      },
      { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }
    );

    // Add padding
    const padding = 50;
    bbox.left -= padding;
    bbox.top -= padding;
    bbox.right += padding;
    bbox.bottom += padding;

    const width = bbox.right - bbox.left;
    const height = bbox.bottom - bbox.top;

    // Calculate the zoom level to fit the entire mind map
    const xZoom = reactFlowWrapper.current.offsetWidth / width;
    const yZoom = reactFlowWrapper.current.offsetHeight / height;
    const zoomLevel = Math.min(xZoom, yZoom, 1); // Limit zoom to 0.75 to prevent excessive enlargement

    // Set the viewport to include all nodes
    flow.setViewport(
      {
        x: -bbox.left * zoomLevel,
        y: -bbox.top * zoomLevel,
        zoom: zoomLevel,
      },
      { duration: 0 }
    );

    // Wait for the viewport change to take effect
    setTimeout(() => {
      toPng(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        width: reactFlowWrapper.current.offsetWidth,
        height: reactFlowWrapper.current.offsetHeight,
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'mind-map.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((error) => {
          console.error('Error saving mind map:', error);
        });
    }, 100);
  }
}, []);

// const toggleConnectionMode = () => {
//   setConnectionMode(prev => prev ? null : 'connect');
// };
    
  //     toPng(reactFlowWrapper.current, { 
  //       cacheBust: true, 
  //       backgroundColor: '#ffffff',
  //       width: width,
  //       height: height,
  //       style: {
  //         width: `${width}px`,
  //         height: `${height}px`,
  //       },
  //     })
  //       .then((dataUrl) => {
  //         const link = document.createElement('a');
  //         link.download = 'mind-map.png';
  //         link.href = dataUrl;
  //         link.click();
  //       })
  //       .catch((error) => {
  //         console.error('Error saving mind map:', error);
  //       });
  //   }
  // }, []);

  console.log('MindMap component received data:', data)
  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '500px', border: '1px solid black' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        onInit={(instance) => (reactFlowInstance.current = instance)}
        // onDrop={onDrop}
        // onDragOver={onDragOver}
        fitView
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      {/* {editingNode && (
        <div style={{ position: 'absolute', top:10, right:10, background: 'white', padding:10, zIndex: 1000}}>
          <form onSubmit={handleEditSubmit}>
            <input name="nodeName" defaultValue={editingNode.data.label} />
            <textarea name="nodeNote" defaultValue={editingNode.data.note || ''} />
            <button type="submit">Update</button>
          </form> 
        </div>
      )} */}
      {/* {editingNode && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'white', padding: 10, zIndex: 1000, borderRadius: '5px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
          <form onSubmit={handleEditSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="nodeName">Node Name:</label>
              <input id="nodeName" name="nodeName" defaultValue={editingNode.data.label} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="nodeNote">Note:</label>
              <textarea id="nodeNote" name="nodeNote" defaultValue={editingNode.data.note || ''} style={{ width: '100%', height: '60px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="submit">Update</button>
              <button type="button" onClick={handleAddChild}>Add Child</button>
              <button type="button" onClick={() => setEditingNode(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )} */}
      {/* <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
        <button onClick={toggleConnectionMode}>
          {connectionMode ? 'Exit Connection Mode' : 'Enter Connection Mode'}
        </button>
      </div> */}
      <button onClick={handleSave} style={{ position: 'absolute', bottom: 10, right: 10 }} >Save as PNG</button>
    </div>
  );
}

// Helper function to convert mind map data to React Flow format
function convertToReactFlowFormat(data, parentId = null, x = 0, y = 0) {
  const nodes = [];
  const edges = [];

  const nodeWidth = 150;
  const nodeHeight = 50;
  const horizontalSpacing = 200;
  const verticalSpacing = 100;

  function processNode(node, parentId, x , y) {
    // const id = `${level}-${index}-${node.name.replace(/\s+/g, '-').toLowerCase()}`;
    // const x = level * horizontalSpacing;
    // const y = index * verticalSpacing;    
    const id = `${node.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

    nodes.push({
      id,
      type: 'custom',
      position: { x, y },
      data: { 
        label: node.name, 
        note: node.attributes?.note, 
        onNodeChange: () => {}, // This will be set in the MindMap Component
        // onAddChild: () => {}, // This will be set in the MindMap Component
      },
      style: { width: nodeWidth, height: nodeHeight },
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${id}`, 
        source: parentId, 
        target: id, 
        type: 'smoothstep', 
        markerEnd: { type: MarkerType.ArrowClosed } });
    }

    if (node.children) {
      node.children.forEach((child, index) => {
        const childX = x + horizontalSpacing;
        const childY = y + (index - (node.children.length - 1) / 2) * verticalSpacing;
        const { childNodes, childEdges } = processNode(child, id, childX, childY);
        nodes.push(...childNodes);
        edges.push(...childEdges);
      });
    }

    return { childNodes: nodes, childEdges: edges };
  }

  const { childNodes, childEdges } = processNode(data, parentId, x, y);
  return { nodes: childNodes, edges: childEdges };
}

export default MindMap;