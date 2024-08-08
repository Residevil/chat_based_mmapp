import React, { useState } from 'react';

function ChatInterface({ onSubmit }) {
  const [input, setInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting input:', input)

    // Add the user's message to the conversation history;
    const updatedHistory = [...conversationHistory, input];
    setConversationHistory(updatedHistory);
    
    // Send the entire conversation history to the backend
    onSubmit(input);
    setInput('');
  };

  return (
    <div>
      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '10px' }}>
        {conversationHistory.map((message, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            {message.content}
          </div>
        ))}
      </div>
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
    </div>
  );
}

export default ChatInterface;