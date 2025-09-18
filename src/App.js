// src/App.js
import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Login from "./login";
import { useAuth } from "./auth";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Groups from "./pages/Groups";
import GroupListPage from "./pages/GroupListPage";
import ChatRoomPage from "./pages/ChatRoomPage";
import Checkins from "./pages/Checkins";
import Diary from "./pages/Diary";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import MentorList from "./pages/MentorList";
import MentorBooking from "./pages/MentorBooking";
import MindscapeGenerator from "./pages/MindscapeGenerator";

const Nav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/chat', label: 'Chat' },
    { to: '/groups', label: 'Groups' },
    { to: '/mindscape', label: 'Creative Therapy' },
    { to: '/mentors', label: 'Mentors' },
    { to: '/diary', label: 'Diary' },
    { to: '/settings', label: 'Settings' },
  ];

  const baseLink = 'relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors';

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-40 mb-10">
      <div className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)]">
        
        {links.map(l => {
          const active = location.pathname === l.to;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`${baseLink} ${active ? 'bg-black text-white shadow-md' : 'text-gray-700 hover:bg-gray-900/5 hover:text-gray-900'}`}
            >
              {l.label}
            </Link>
          );
        })}
        {!user && (
          <Link
            to="/login"
            className={`${baseLink} bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow hover:opacity-90`}
          >
            Login
          </Link>
        )}
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
  const showNav = location.pathname !== "/login" && location.pathname !== "/";
  const isDashboard = location.pathname === "/dashboard";
  
  return (
    <div className="min-h-screen bg-gray-50">
      {showNav && <Nav />}
      <div className={showNav && !isDashboard ? "pt-20" : ""}>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><GroupListPage /></ProtectedRoute>} />
        <Route path="/groups/:groupId" element={<ProtectedRoute><ChatRoomPage /></ProtectedRoute>} />
        <Route path="/checkins" element={<ProtectedRoute><Checkins /></ProtectedRoute>} />
        <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsWithSignOut /></ProtectedRoute>} />
        <Route path="/mentors" element={<ProtectedRoute><MentorList /></ProtectedRoute>} />
        <Route path="/mentors/:mentorId" element={<ProtectedRoute><MentorBooking /></ProtectedRoute>} />
        <Route path="/mindscape" element={<ProtectedRoute><MindscapeGenerator /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
    </div>
  );
}

export default App;
