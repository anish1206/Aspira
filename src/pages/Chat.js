// src/pages/Chat.js
import React, { useState } from "react";

export default function Chat() {
  const [activeTab, setActiveTab] = useState("ai"); // "ai" | "peers"
  return (
    <div style={{ padding: 20 }}>
      <h2>Chat</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setActiveTab("ai")} style={{ padding: 8, background: activeTab === "ai" ? "#1976d2" : "#eee", color: activeTab === "ai" ? "#fff" : "#333", border: "none" }}>AI Chat</button>
        <button onClick={() => setActiveTab("peers")} style={{ padding: 8, background: activeTab === "peers" ? "#1976d2" : "#eee", color: activeTab === "peers" ? "#fff" : "#333", border: "none" }}>Peer Support</button>
      </div>
      {activeTab === "ai" ? (
        <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 16 }}>
          <p>AI conversation placeholder. Integrate your LLM API here.</p>
        </div>
      ) : (
        <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 16 }}>
          <p>Peer group chat placeholder. Connect to your real-time backend.</p>
        </div>
      )}
    </div>
  );
}


