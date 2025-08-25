// src/pages/Diary.js
import React, { useState } from "react";

export default function Diary() {
  const [entry, setEntry] = useState("");
  const save = () => {
    alert("Saved diary entry (local placeholder).");
    setEntry("");
  };
  return (
    <div style={{ padding: 20 }}>
      <h2>Diary</h2>
      <textarea value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Write your thoughts here..." rows={10} style={{ width: "100%", maxWidth: 700 }} />
      <div style={{ marginTop: 8 }}>
        <button onClick={save} style={{ padding: 8, background: "#1976d2", color: "white", border: "none" }}>Save</button>
      </div>
    </div>
  );
}


