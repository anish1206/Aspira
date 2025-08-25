// src/pages/Dashboard.js
import React from "react";

const Card = ({ title, children }) => (
  <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 16, minWidth: 240 }}>
    <h3 style={{ marginTop: 0 }}>{title}</h3>
    {children}
  </div>
);

export default function Dashboard() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        <Card title="Mood Check-in">
          <p>Quickly log how you're feeling today.</p>
        </Card>
        <Card title="AI Chat">
          <p>Continue your supportive conversation.</p>
        </Card>
        <Card title="Groups">
          <p>See your groups and latest messages.</p>
        </Card>
        <Card title="Diary">
          <p>Write a private reflection.</p>
        </Card>
      </div>
    </div>
  );
}


