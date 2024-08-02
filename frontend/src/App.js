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

  const handleChatInput = async (input) => {
    try {
      const response = await axios.post(`${API_URL}/api/generate_map`, { input });
      setMindMap(response.data);
    } catch (error) {
      console.error('Error generating mind map:', error);
      // Handle the error(e.g. show a message to the user)
    }
    // const response = await fetch('/api/generate_map', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ input }),
    // });
    // const newMap = await response.json();
    // setMindMap(newMap);
  };

  const handleMapUpdate = (changes) => {
    // send update to the server
    socket.emit('update_map', { map: mindMap, changes });
  };

  return (
    <div className="App">
      <p>Socket status: {socket.connected ? 'Connected' : 'Disconnected'}</p>
      <ChatInterface onSubmit={handleChatInput} />
      {mindMap && <MindMap data={mindMap} onUpdate={handleMapUpdate} />}
    </div>

  );
}

export default App;