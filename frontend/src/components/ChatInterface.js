import React, { useState } from 'react';

function ChatInterface({ onSubmit }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting input:', input)
    onSubmit(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%' }}>
      <input 
        type="text" 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder="Enter your text here..."
        style={{ flex: 1, marginRight: '10px', padding: '5px' }}
      />
      <button type="submit">Send</button>
    </form>
  );
}

export default ChatInterface;