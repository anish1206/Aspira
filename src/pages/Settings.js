// src/pages/Settings.js
import React, { useState } from "react";
import { useAuth } from "../auth";

export default function Settings() {
  const { user } = useAuth();
  const [language, setLanguage] = useState("en");
  const [consent, setConsent] = useState(true);

  return (
    <div style={{ padding: 20 }}>
      <h2>Settings</h2>
      <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h3>Account</h3>
          <p>Email: {user?.email || "-"}</p>
        </div>
        <div>
          <h3>Language</h3>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="bn">Bengali</option>
            <option value="ta">Tamil</option>
          </select>
        </div>
        <div>
          <h3>Privacy & Consent</h3>
          <label>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            Allow data processing for improving support (you can change anytime)
          </label>
        </div>
      </div>
    </div>
  );
}


