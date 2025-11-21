import React, { useState, useEffect, useRef } from "react";
import ChatLayout from "../components/ChatLayout";

const Chat = () => {
    // Conversation messages
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);
    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Focus input on start
    useEffect(() => {
        if (started && inputRef.current) {
            inputRef.current.focus();
        }
    }, [started]);

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

    const SidebarContent = () => (
        <div className="flex flex-col h-full p-4">
            <div className="mb-6">
                <button
                    onClick={() => {
                        setMessages([]);
                        setStarted(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-green-900 text-white rounded-xl hover:opacity-90 transition-all shadow-sm font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Recent</h3>
                <div className="space-y-1">
                    {/* Placeholder for history */}
                    <div className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted cursor-pointer transition-colors truncate">
                        Previous conversation...
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ChatLayout sidebar={<SidebarContent />}>

            {/* Messages Area */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
            >
                {!started ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 pb-20">
                        <h2 className="text-3xl font-bold tracking-tight">Hey! </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full px-4">
                            {["Help me plan my day", "I'm feeling anxious", "Let's practice mindfulness", "Tell me a calming story"].map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setNewMessage(suggestion);
                                        handleSend(); // This might need a slight delay or state update fix if directly calling
                                    }}
                                    className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 text-left text-sm transition-all group"
                                >
                                    <span className="font-medium group-hover:text-primary transition-colors">{suggestion}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2a10 10 0 1 0 10 10H12V2z" /><path d="M12 2a10 10 0 0 1 10 10h-10V2z" /><path d="M12 12l9.33-5.83" /><path d="M12 12l-9.33-5.83" /></svg>
                                    </div>
                                )}
                                <div
                                    className={`relative px-5 py-3.5 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm max-w-[85%] md:max-w-[75%] ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                                            : 'bg-card border border-border text-card-foreground rounded-bl-sm'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center mt-1 text-white text-xs font-bold">
                                        U
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-4 max-w-3xl mx-auto justify-start">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                </div>
                                <div className="px-5 py-3.5 rounded-2xl bg-card border border-border text-muted-foreground text-sm shadow-sm rounded-bl-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border">
                <div className="max-w-3xl mx-auto relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Message Aspira..."
                        className="w-full rounded-2xl py-4 pl-5 pr-14 bg-muted/50 border-transparent focus:bg-background border focus:border-primary/20 shadow-sm focus:shadow-md outline-none transition-all text-base placeholder:text-muted-foreground"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !newMessage.trim()}
                        className="absolute top-1/2 -translate-y-1/2 right-2 p-2 rounded-xl bg-green-900 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all active:scale-95"
                        aria-label="Send"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-muted-foreground">Aspira can make mistakes. Consider checking important information.</p>
                </div>
            </div>
        </ChatLayout>
    );
};

export default Chat;