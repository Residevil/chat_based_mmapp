import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import MindMap from './components/MindMap';
import ChatInterface from './components/ChatInterface';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL);

function App() {
  const [mindMap, setMindMap] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Error handling
  useEffect(() => {
    console.log('Attempting to connect to WebSocket...');
  
    socket.on('connect', () => {
      console.log('WebSocket connected successfully');
      setSocketConnected(true);
      // You might want to update the UI to show the connected state
    });
  
    // ... other socket event listeners ...

    socket.on('map_updated', (updatedMap) => {
      setMindMap(updatedMap);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      // Handle the error (e.g., show a message to the user)
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    });

  
    return () => {
      socket.off('connect');
      socket.off('map_updated');
      socket.off('error');
      socket.off('connect_error');
      // ... remove other listeners ...
    };
  }, []);

  // useEffect(() => {
  //   console.log('mindMap state changed:', mindMap);
  // }, [mindMap]);

  const handleChatInput = async (conversationHistory) => {
    try {
      const response = await axios.post(`${API_URL}/api/generate_map`, { input: conversationHistory });
      console.log('Received mind map data:', response.data)
      setMindMap(response.data);
    } catch (error) {
      console.error('Error generating mind map:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('An error occurred while generating the mind map. Please try again.');
      }
    }
  };

  const handleMapUpdate = (changes) => {
    // send update to the server
    if (changes.updatedNode) {
      const updateNode = (node) => {
        if (node.name === changes.updatedNode.id) {
          return { ...node, name: changes.updatedNode.data.label, attributes: { notes: changes.updateNode.data.note } };
        }
        if (node.children) {
          return { ...node, children: node.children.map(updateNode) };
        }
        return node;
      };
      const updatedMap = updateNode(mindMap);
      setMindMap(updatedMap);
      socket.emit('update_map', { map: updatedMap, changes });
    } 
  };

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div>
        <p>Socket status: {socket.connected ? 'Connected' : 'Disconnected'}</p>
        {mindMap ? (
          <>
            <MindMap data={mindMap} onUpdate={handleMapUpdate} />
            {/* <pre>{JSON.stringify(mindMap, null, 2)}</pre> */}
          </>
        ) : (
          <p>No mind map data available. Please enter some text or create a new mind map.</p>
        )}
      </div>
      <div style={{ borderTop: '1px solid #ccc', padding: '50px 20px' }}>
        <ChatInterface onSubmit={handleChatInput} />
      </div>
    </div>

  );
}

export default App;