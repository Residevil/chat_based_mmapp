import React, { useState } from 'react';

function ChatInterface({ onSubmit }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder="Enter your text here..."
      />
      <button type="submit">Send</button>
    </form>
  );
}

export default ChatInterface;