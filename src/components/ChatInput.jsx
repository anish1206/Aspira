import React, { useState } from 'react';
import useSpeechToText from '../SpeechRecognition';

const ChatInput = ({ onSend }) => {
    const [text, setText] = useState('');
    const { isListening, startListening, stopListening } = useSpeechToText();

    const handleSend = () => {
        if (text.trim()) {
            onSend(text);
            setText('');
        }
    };

    const toggleMic = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening((transcript) => {
                setText(transcript);
                // Auto-send as per requirements
                onSend(transcript);
                setText(''); // Clear after sending
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div style={styles.container}>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                style={styles.input}
            />
            <button
                onClick={toggleMic}
                style={{
                    ...styles.micButton,
                    backgroundColor: isListening ? 'red' : 'gray',
                }}
                title="Toggle Microphone"
            >
                🎤
            </button>
            <button onClick={handleSend} style={styles.sendButton}>
                Send
            </button>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        padding: '10px',
        borderTop: '1px solid #eee',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        padding: '10px',
        borderRadius: '20px',
        border: '1px solid #ccc',
        outline: 'none',
    },
    micButton: {
        color: 'white',
        border: 'none',
        padding: '10px',
        borderRadius: '50%',
        cursor: 'pointer',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s',
    },
    sendButton: {
        padding: '10px 20px',
        borderRadius: '20px',
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
};

export default ChatInput;
