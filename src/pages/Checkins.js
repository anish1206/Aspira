// src/pages/Checkins.js
import React, { useState } from "react";

export default function Checkins() {
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Saved check-in: mood ${mood}/5, note: ${note || "(none)"}`);
    setNote("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Daily Check-in</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
        <label>
          Mood (1-5)
          <input type="range" min="1" max="5" value={mood} onChange={(e) => setMood(Number(e.target.value))} />
          <span style={{ marginLeft: 8 }}>{mood}</span>
        </label>
        <textarea placeholder="Optional note" value={note} onChange={(e) => setNote(e.target.value)} rows={4} />
        <button type="submit" style={{ padding: 8, background: "#1976d2", color: "white", border: "none", width: 140 }}>Save</button>
      </form>
    </div>
  );
}


