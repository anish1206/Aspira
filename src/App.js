// src/App.js
import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Login from "./login";
import { useAuth } from "./auth";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Groups from "./pages/Groups";
import Checkins from "./pages/Checkins";
import Diary from "./pages/Diary";
import Settings from "./pages/Settings";

const Nav = () => {
  const { user } = useAuth();
  return (
    <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
      <Link to="/">Dashboard</Link>
      <Link to="/chat">Chat</Link>
      <Link to="/groups">Groups</Link>
      <Link to="/checkins">Mentors</Link>
      <Link to="/diary">Diary</Link>
      <Link to="/settings">Settings</Link>
      <div style={{ marginLeft: "auto" }}>
        {!user && <Link to="/login">Login</Link>}
      </div>
    </nav>
  );
};
// Wrapper to show Sign Out button only in Settings page
const SettingsWithSignOut = () => {
  const { user, signOutUser } = useAuth();
  return (
    <div>
      <Settings />
      {user && (
        <div style={{ marginTop: 24 }}>
          <button onClick={signOutUser} style={{ padding: 6 }}>Sign Out</button>
        </div>
      )}
    </div>
  );
};

const Page = ({ title }) => (
  <div style={{ padding: 20 }}>
    <h2>{title}</h2>
    <p>Coming soon...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const location = useLocation();
  return (
    <div>
      {location.pathname !== "/login" && <Nav />}
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
        <Route path="/checkins" element={<ProtectedRoute><Checkins /></ProtectedRoute>} />
        <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsWithSignOut /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
