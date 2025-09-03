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
import Landing from "./pages/Landing";
import MentorList from "./pages/MentorList";
import MentorBooking from "./pages/MentorBooking";

const Nav = () => {
  const { user } = useAuth();
  return (
    <nav className="flex gap-3 p-3 border-b border-gray-200 bg-white shadow-sm">
      <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">Dashboard</Link>
      <Link to="/chat" className="text-blue-600 hover:text-blue-800 font-medium">Chat</Link>
      <Link to="/groups" className="text-blue-600 hover:text-blue-800 font-medium">Groups</Link>
      <Link to="/mentors" className="text-blue-600 hover:text-blue-800 font-medium">Mentors</Link>
      <Link to="/diary" className="text-blue-600 hover:text-blue-800 font-medium">Diary</Link>
      <Link to="/settings" className="text-blue-600 hover:text-blue-800 font-medium">Settings</Link>
      <div className="ml-auto">
        {!user && <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Login</Link>}
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
        <div className="mt-6">
          <button 
            onClick={signOutUser} 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

const Page = ({ title }) => (
  <div className="p-5">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
    <p className="text-gray-600">Coming soon...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-5 text-gray-600">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-50">
      {location.pathname !== "/login" && location.pathname !== "/" && <Nav />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
        <Route path="/checkins" element={<ProtectedRoute><Checkins /></ProtectedRoute>} />
        <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsWithSignOut /></ProtectedRoute>} />
        <Route path="/mentors" element={<ProtectedRoute><MentorList /></ProtectedRoute>} />
        <Route path="/mentors/:mentorId" element={<ProtectedRoute><MentorBooking /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
