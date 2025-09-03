// src/pages/Chat.js

import React, { useState, useEffect, useRef } from "react";

const Chat = () => {
  // State to hold the entire conversation history
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hello! I'm Mindsync. I'm here to listen. How are you feeling today?" }
  ]);

  // State for the user's current input
  const [newMessage, setNewMessage] = useState("");
  
  // State to show a "thinking..." message while waiting for the API
  const [loading, setLoading] = useState(false);
  
  // A ref to the chat container div to enable auto-scrolling
  const chatContainerRef = useRef(null);

  // This effect runs every time the 'messages' array changes
  useEffect(() => {
    // If the chat container exists, scroll to the very bottom
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // This function is called when the user clicks "Send" or presses Enter
  const handleSend = async () => {
    // Prevent sending empty messages or sending while the AI is responding
    if (newMessage.trim() === "" || loading) return;

    // 1. Optimistically update the UI with the user's new message
    const userMessage = { role: 'user', text: newMessage };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setNewMessage(""); // Clear the input field
    setLoading(true);  // Show the loading indicator

    try {
      // 2. Prepare the data for the API call
      // The API needs the chat history *before* the user's new message
      const historyForAPI = updatedMessages.slice(0, -1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      // 3. Call our Vercel Serverless Function using the 'fetch' API
      // Use a relative path so it works on localhost and Vercel deployments
      const response = await fetch('/api/askGemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the history and the new message in the request body
        body: JSON.stringify({
          history: historyForAPI,
          message: newMessage,
        }),
      });

      // Read the response as text first to guard against HTML errors
      const raw = await response.text();

      // Try to parse JSON; if it fails, log the raw response
      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error('Non-JSON response received from API:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          bodyPreview: raw.slice(0, 500)
        });
        throw new Error('Received non-JSON response from API.');
      }

      // If the server responds with an error-like JSON, handle it
      if (!response.ok) {
        throw new Error(data?.message || 'The server responded with an error.');
      }

      // 4. Process the successful response
      const modelResponse = { role: 'model', text: data.text };
      
      // Update the UI with the AI's response
      setMessages(prev => [...prev, modelResponse]);

    } catch (error) {
      // 5. Handle any errors that occurred during the API call
      console.error("Error calling Vercel API endpoint:", error);
      const errorMessage = { role: 'model', text: "Sorry, something went wrong. Please try again." };
      setMessages(prev => [...prev, errorMessage]);

    } finally {
      // 6. Clean up
      // No matter what happens, stop the loading indicator
      setLoading(false);
    }
  };

  return (
    <div style={styles.chatPage}>
      <div style={styles.chatContainer} ref={chatContainerRef}>
        {/* Map over the messages array and display each one */}
        {messages.map((msg, index) => (
          <div key={index} style={msg.role === 'user' ? styles.userMessageContainer : styles.modelMessageContainer}>
            <div style={msg.role === 'user' ? styles.userMessage : styles.modelMessage}>
              <p style={{ margin: 0 }}>{msg.text}</p>
            </div>
          </div>
        ))}
        {/* Show a "thinking..." message while loading */}
        {loading && (
          <div style={styles.modelMessageContainer}>
            <div style={styles.modelMessage}>
              <p style={{ margin: 0 }}>Mindsync is thinking...</p>
            </div>
          </div>
        )}
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          // Allow sending with the Enter key
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message here..."
          style={styles.inputField}
          disabled={loading}
        />
        <button onClick={handleSend} style={styles.sendButton} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

// Basic CSS-in-JS for styling the chat component
const styles = {
    chatPage: { 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 80px)', // Adjust height based on your nav bar
        maxWidth: '800px', 
        margin: 'auto',
        border: '1px solid #eee',
        borderRadius: '8px',
        marginTop: '10px'
    },
    chatContainer: { 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
    },
    inputArea: { 
        display: 'flex', 
        padding: '10px',
        borderTop: '1px solid #eee'
    },
    inputField: { 
        flex: 1, 
        padding: '12px', 
        borderRadius: '20px', 
        border: '1px solid #ccc',
        fontSize: '16px'
    },
    sendButton: { 
        padding: '10px 20px', 
        marginLeft: '10px', 
        borderRadius: '20px', 
        border: 'none', 
        backgroundColor: '#007bff', 
        color: 'white', 
        cursor: 'pointer' 
    },
    userMessageContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '10px',
    },
    modelMessageContainer: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: '10px',
    },
    userMessage: {  
        backgroundColor: '#007bff', 
        color: 'white', 
        padding: '10px 15px', 
        borderRadius: '20px 20px 5px 20px', 
        maxWidth: '75%' 
    },
    modelMessage: { 
        backgroundColor: '#f1f1f1', 
        color: 'black',
        padding: '10px 15px', 
        borderRadius: '20px 20px 20px 5px', 
        maxWidth: '75%' 
    }
};

export default Chat;