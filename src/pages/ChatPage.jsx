import React, { useState } from 'react';
import ChatInput from '../components/ChatInput';
import { speak } from '../tts';
import { auth } from '../firebase'; // Importing auth to get userId if needed

const ChatPage = () => {
    const [responseLog, setResponseLog] = useState([]);

    const handleSend = async (message) => {
        // Log user message
        const userLog = { role: 'user', text: message, timestamp: new Date().toLocaleTimeString() };
        setResponseLog(prev => [...prev, userLog]);
        console.log("User:", message);

        try {
            const user = auth.currentUser;
            const userId = user ? user.uid : "anonymous";

            // Call Gemini API
            // Using /api/askGemini as it is the existing endpoint
            const response = await fetch('/api/askGemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    history: [], // Passing empty history for this simple wrapper
                    userId: userId,
                    mood: "Friendly" // Default mood
                }),
            });

            if (!response.ok) {
                throw new Error(`Gemini API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const reply = data.text || "No response text received";

            // Log model response
            const modelLog = { role: 'model', text: reply, timestamp: new Date().toLocaleTimeString() };
            setResponseLog(prev => [...prev, modelLog]);
            console.log("Gemini:", reply);

            // Speak the reply
            speak(reply);

        } catch (error) {
            console.error("Error in ChatPage pipeline:", error);
            setResponseLog(prev => [...prev, { role: 'error', text: error.message, timestamp: new Date().toLocaleTimeString() }]);
        }
    };

    return (
        <div style={styles.pageContainer}>
            <h1 style={styles.header}>Voice Chat Wrapper</h1>

            <div style={styles.logContainer}>
                {responseLog.length === 0 && <p style={{ color: '#888', textAlign: 'center' }}>No messages yet. Say something!</p>}
                {responseLog.map((log, index) => (
                    <div key={index} style={{
                        ...styles.logItem,
                        alignSelf: log.role === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor: log.role === 'user' ? '#e3f2fd' : (log.role === 'error' ? '#ffebee' : '#f5f5f5'),
                    }}>
                        <div style={styles.logRole}>{log.role} <span style={styles.timestamp}>{log.timestamp}</span></div>
                        <div>{log.text}</div>
                    </div>
                ))}
            </div>

            <ChatInput onSend={handleSend} />
        </div>
    );
};

const styles = {
    pageContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        textAlign: 'center',
        padding: '20px',
        borderBottom: '1px solid #eee',
    },
    logContainer: {
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    logItem: {
        maxWidth: '80%',
        padding: '10px 15px',
        borderRadius: '10px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },
    logRole: {
        fontSize: '0.8em',
        fontWeight: 'bold',
        marginBottom: '5px',
        color: '#555',
        textTransform: 'capitalize',
    },
    timestamp: {
        fontWeight: 'normal',
        color: '#999',
        marginLeft: '5px',
    }
};

export default ChatPage;
