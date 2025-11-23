import React, { useState, useEffect, useRef } from "react";
import ChatLayout from "../components/ChatLayout";
import InteractiveBranch2 from "../components/InteractiveBranches2";
import { db, auth } from "../firebase";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";

const Chat = () => {
    // State
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);

    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);

    // 1. Listen for User's Sessions (Sidebar)
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, "chats", user.uid, "sessions"),
            orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const sess = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSessions(sess);
        });

        return () => unsubscribe();
    }, []);

    // 2. Listen for Messages in Current Session
    useEffect(() => {
        const user = auth.currentUser;
        if (!user || !currentSessionId) {
            setMessages([]);
            setStarted(false);
            return;
        }

        setStarted(true); // If we have a session ID, we are "started" even if empty messages initially

        const q = query(
            collection(db, "chats", user.uid, "sessions", currentSessionId, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [currentSessionId]);

    // Auto-scroll
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Focus input
    useEffect(() => {
        if (started && inputRef.current) {
            inputRef.current.focus();
        }
    }, [started]);

    const createNewSession = async (firstMessageText) => {
        const user = auth.currentUser;
        if (!user) return null;

        try {
            const title = firstMessageText.slice(0, 30) + (firstMessageText.length > 30 ? "..." : "");
            const docRef = await addDoc(collection(db, "chats", user.uid, "sessions"), {
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                title: title
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating session:", error);
            return null;
        }
    };

    const deleteSession = async (sessionId) => {
        if (!window.confirm("Are you sure you want to delete this chat?")) return;

        try {
            const user = auth.currentUser;
            if (!user) return;

            await deleteDoc(doc(db, "chats", user.uid, "sessions", sessionId));

            if (currentSessionId === sessionId) {
                handleNewChat();
            }
        } catch (error) {
            console.error("Error deleting session:", error);
        }
    };

    const handleSend = async () => {
        if (newMessage.trim() === "" || loading) return;

        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to chat.");
            return;
        }

        const userText = newMessage.trim();
        setNewMessage("");
        setLoading(true);

        let sessionId = currentSessionId;

        try {
            // Create session if none exists
            if (!sessionId) {
                sessionId = await createNewSession(userText);
                if (!sessionId) throw new Error("Failed to create session");
                setCurrentSessionId(sessionId);
                setStarted(true);
            }

            // 1. Add user message
            await addDoc(collection(db, "chats", user.uid, "sessions", sessionId, "messages"), {
                role: 'user',
                text: userText,
                createdAt: serverTimestamp()
            });

            // Update session timestamp
            await updateDoc(doc(db, "chats", user.uid, "sessions", sessionId), {
                updatedAt: serverTimestamp()
            });

            // Prepare history for API
            const historyForAPI = messages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }],
            }));
            historyForAPI.push({
                role: 'user',
                parts: [{ text: userText }]
            });

            const response = await fetch('/api/askGemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: historyForAPI, message: userText }),
            });

            const raw = await response.text();
            let data;
            try { data = JSON.parse(raw); } catch (e) { throw new Error('Non-JSON response'); }
            if (!response.ok) throw new Error(data?.message || 'Server error');

            // 2. Add model response
            await addDoc(collection(db, "chats", user.uid, "sessions", sessionId, "messages"), {
                role: 'model',
                text: data.text,
                createdAt: serverTimestamp()
            });

            // Update session timestamp again
            await updateDoc(doc(db, "chats", user.uid, "sessions", sessionId), {
                updatedAt: serverTimestamp()
            });

        } catch (err) {
            console.error("Error sending message:", err);
            if (sessionId) {
                await addDoc(collection(db, "chats", user.uid, "sessions", sessionId, "messages"), {
                    role: 'model',
                    text: 'Sorry, something went wrong. Please try again.',
                    createdAt: serverTimestamp()
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        setCurrentSessionId(null);
        setMessages([]);
        setStarted(false);
        setNewMessage("");
        if (inputRef.current) inputRef.current.focus();
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full p-4">
            <div className="mb-6">
                <button
                    onClick={handleNewChat}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-green-900 text-white rounded-xl hover:opacity-90 transition-all shadow-sm font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Recent</h3>
                <div className="space-y-1 mt-2">
                    {sessions.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground italic">
                            No previous chats
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => setCurrentSessionId(session.id)}
                                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${currentSessionId === session.id
                                    ? "bg-muted font-medium text-foreground"
                                    : "text-muted-foreground hover:bg-muted/50"
                                    }`}
                            >
                                <span className="truncate flex-1">{session.title || "Untitled Chat"}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSession(session.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded-md text-muted-foreground hover:text-destructive transition-all"
                                    title="Delete chat"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <ChatLayout sidebar={<SidebarContent />}>
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <InteractiveBranch2 />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col h-full px-4 md:px-6 pt-32 pb-4 md:pb-6">
                {/* Messages Area */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-sm mb-4 space-y-6 scroll-smooth"
                >
                    {!started ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 pb-20">
                            <h2 className="text-3xl font-bold tracking-tight">He<i>y</i> ! </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full px-4">
                                {["Help me plan my day", "I'm feeling anxious", "Let's practice mindfulness", "Tell me a calming story"].map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setNewMessage(suggestion);
                                            setTimeout(() => {
                                                if (inputRef.current) inputRef.current.focus();
                                            }, 0);
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
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex-shrink-0 flex items-center justify-center mt-1 text-white text-xs font-bold">
                                            {msg.user}
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
                <div className="relative">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Message Aspira..."
                            className="w-full rounded-2xl py-4 pl-5 pr-14 bg-muted/50 border-transparent focus:bg-background border focus:border-primary/20 shadow-sm focus:shadow-md outline-none transition-all text-base placeholder:text-muted-foreground hover:shadow-[0_0_15px_rgba(22,163,74,0.3)] hover:border-green-600/40"
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
            </div>
        </ChatLayout >
    );
};

export default Chat;