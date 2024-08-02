import React, {useState} from 'react';
import { Tree } from 'react-d3-tree';
import { toPng } from 'html-to-image';

function MindMap({ data, onUpdate }) {
  const [editingNode, setEditingNode] = useState(null);

  const handleNodeClick = (nodeData) => {
    // Handle node click for editing
    setEditingNode(nodeData);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedData = { 
      id: editingNode.data.name,
      name: e.target.elements.nodeText.value
     };
    // Update the node text in the data structure
    // This is a simplified example and might need to be adjusted based on your data structure
    onUpdate({ updatedData });
    setEditingNode(null);
  };

  const handleSave = () => {
    const node = document.getElementById('mind-map-container');
    toPng(node)
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'mind-map.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error('Error saving mind map:', error);
      });
  };

  return (
    <div>
      <div className='mind-map-container'>
        <Tree 
          data={data}
          orientation="horizontal"
          onClick={handleNodeClick}
          translate={{ x: 300, y: 50 }}
        />
      </div>
      {editingNode && (
        <form onSubmit={handleEditSubmit}>
          <input name="nodeText" defaultValue={editingNode.data.name} />
          <button type="submit">Update</button>
        </form>
      )}
      <button onClick={handleSave}>Save as PNG</button>
    </div>
  );
}

export default MindMap;