import React, { useState, useEffect, useRef } from "react";

const Chat = () => {
    // Conversation messages (hidden until user starts)
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false); // track if user initiated chat
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (newMessage.trim() === "" || loading) return;
        if (!started) setStarted(true);

        const userMessage = { role: 'user', text: newMessage.trim() };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setNewMessage("");
        setLoading(true);

        try {
            const historyForAPI = updatedMessages.slice(0, -1).map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }],
            }));

            const response = await fetch('/api/askGemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: historyForAPI, message: userMessage.text }),
            });

            const raw = await response.text();
            let data;
            try { data = JSON.parse(raw); } catch (e) { throw new Error('Non-JSON response'); }
            if (!response.ok) throw new Error(data?.message || 'Server error');

            setMessages(prev => [...prev, { role: 'model', text: data.text }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, something went wrong. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    // Initial centered view
    if (!started) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 text-center bg-background">
                <h2 className="text-4xl md:text-4xl font-semibold mb-8 tracking-tight text-foreground">
                    Hello! How you feelin today?
                </h2>
                <div className="w-full max-w-xl relative group">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Share anything that's on your mind..."
                        className="w-full rounded-full py-4 pl-6 pr-16 bg-muted/50 backdrop-blur-sm border border-input focus:border-primary shadow-sm focus:shadow-md outline-none transition-all text-base text-foreground placeholder:text-muted-foreground"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="absolute top-1/2 -translate-y-1/2 right-2 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        aria-label="Send"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                            <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    // Chat view after user starts
    return (
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto w-full px-4 py-4 bg-background">
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted"
            >
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm md:text-base leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-muted text-foreground rounded-bl-sm'
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="px-4 py-3 rounded-2xl bg-muted text-muted-foreground text-sm shadow-sm animate-pulse">
                            Mindsync is thinking...
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-4 relative w-full">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="w-full rounded-full py-4 pl-6 pr-16 bg-muted/50 backdrop-blur border border-input focus:border-primary shadow-sm focus:shadow-md outline-none transition-all text-base text-foreground placeholder:text-muted-foreground"
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="absolute top-1/2 -translate-y-1/2 right-2 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    aria-label="Send"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Chat;