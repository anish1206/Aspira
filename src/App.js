// src/App.js
import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./login";
import { useAuth } from "./auth";

const Nav = () => {
  const { user, signOutUser } = useAuth();
  return (
    <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
      <Link to="/">Dashboard</Link>
      <Link to="/chat">Chat</Link>
      <Link to="/groups">Groups</Link>
      <Link to="/checkins">Check-ins</Link>
      <Link to="/diary">Diary</Link>
      <Link to="/settings">Settings</Link>
      <div style={{ marginLeft: "auto" }}>
        {user ? (
          <button onClick={signOutUser} style={{ padding: 6 }}>Sign Out</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
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
  return (
    <div>
      <Nav />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Page title="Dashboard" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Page title="Chat" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <Page title="Groups" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkins"
          element={
            <ProtectedRoute>
              <Page title="Check-ins" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diary"
          element={
            <ProtectedRoute>
              <Page title="Diary" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Page title="Settings" />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
