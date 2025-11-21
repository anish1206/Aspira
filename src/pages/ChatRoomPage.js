import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

export default function ChatRoomPage() {
    const { groupId } = useParams();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const endRef = useRef(null);

    const messagesRef = useMemo(() => (
        collection(db, "groupMessages", groupId || "__missing__", "messages")
    ), [groupId]);

    useEffect(() => {
        if (!groupId) return;
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setMessages(data);
            setLoading(false);
        }, (err) => {
            // eslint-disable-next-line no-console
            console.error(err);
            setError("Failed to load messages.");
            setLoading(false);
        });
        return () => unsub();
    }, [groupId, messagesRef]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSending(true);
        setError("");
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Not authenticated");
            const idToken = await user.getIdToken();

            const apiBase = process.env.REACT_APP_API_BASE_URL || ""; // e.g. https://your-app.vercel.app
            const res = await fetch(`${apiBase}/api/postAnonymousMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                credentials: "omit",
                cache: "no-store",
                body: JSON.stringify({ message: text.trim(), groupId }),
            });

            if (!res.ok) {
                const errBody = await res.text().catch(() => "");
                throw new Error(errBody || `Request failed: ${res.status}`);
            }

            setText("");
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            setError("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="relative flex flex-col h-[calc(100vh-80px)] bg-gradient-to-b from-green-50/50 to-white overflow-hidden">
            {/* Nature-inspired Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Abstract Tree/Leaf Shapes */}
                <svg className="absolute top-10 right-20 w-32 h-32 text-green-200 opacity-30" viewBox="0 0 100 100">
                    <path d="M50 10 Q60 30 50 50 Q40 30 50 10" fill="currentColor" />
                    <path d="M50 50 Q70 60 60 80 Q50 70 50 50" fill="currentColor" />
                    <path d="M50 50 Q30 60 40 80 Q50 70 50 50" fill="currentColor" />
                </svg>
                <svg className="absolute bottom-20 left-10 w-40 h-40 text-emerald-200 opacity-20" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="currentColor" />
                    <circle cx="30" cy="30" r="20" fill="currentColor" opacity="0.5" />
                </svg>

                {/* Floating Orbs */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col h-full px-4 md:px-6 pt-24 pb-4 md:pb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Group: {groupId}</h2>
                    <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">Anonymous Chat</div>
                </div>

                <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-sm mb-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">Loading messages...</div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((m) => (
                                <div key={m.id} className="flex flex-col items-start">
                                    <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-muted px-4 py-3 text-foreground">
                                        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.text || m.message}</div>
                                    </div>
                                    {m.timestamp?.toDate && (
                                        <div className="mt-1 ml-2 text-[10px] text-muted-foreground">{m.timestamp.toDate().toLocaleString()}</div>
                                    )}
                                </div>
                            ))}
                            <div ref={endRef} />
                        </div>
                    )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type an anonymous message..."
                        className="flex-1 rounded-full border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                        disabled={sending}
                        maxLength={1000}
                    />
                    <button
                        type="submit"
                        disabled={sending || !text.trim()}
                        className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                    >
                        {sending ? "Sending..." : "Send"}
                    </button>
                </form>
                {error && <div className="mt-2 text-sm text-destructive text-center">{error}</div>}
                <div className="sr-only">Server timestamp placeholder: {serverTimestamp ? "ready" : ""}</div>
            </div>
        </div>
    );
}


