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
    <div className="flex flex-col h-[calc(100vh-120px)] p-4">
      <h2 className="text-xl font-semibold mb-3">Group: {groupId}</h2>
      <div className="flex-1 overflow-y-auto rounded-lg border bg-white p-3">
        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : (
          <div className="space-y-2">
            {messages.map((m) => (
              <div key={m.id} className="max-w-[85%] rounded-lg bg-gray-100 px-3 py-2 text-gray-900">
                <div className="whitespace-pre-wrap break-words text-sm">{m.text || m.message}</div>
                {m.timestamp?.toDate && (
                  <div className="mt-1 text-[10px] text-gray-500">{m.timestamp.toDate().toLocaleString()}</div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type an anonymous message…"
          className="flex-1 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sending}
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      <div className="sr-only">Server timestamp placeholder: {serverTimestamp ? "ready" : ""}</div>
    </div>
  );
}


