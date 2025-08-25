// src/pages/Groups.js
import React from "react";

const GroupItem = ({ name, members }) => (
  <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 16 }}>
    <h3 style={{ marginTop: 0 }}>{name}</h3>
    <p>{members} members</p>
  </div>
);

export default function Groups() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Groups</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        <GroupItem name="Anxiety Support" members={24} />
        <GroupItem name="Exam Stress" members={18} />
        <GroupItem name="Sleep & Calm" members={31} />
      </div>
    </div>
  );
}


