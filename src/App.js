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

import { motion, LayoutGroup } from "framer-motion";

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

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-1 p-1.5 rounded-full backdrop-blur-xl border border-white/20 ring-2 ring-gray-200 bg-white/30">
                <LayoutGroup>
                    {links.map(l => {
                        const active = location.pathname === l.to;
                        return (
                            <Link
                                key={l.to}
                                to={l.to}
                                className={`relative px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors duration-300 ${active ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute inset-0 bg-black rounded-full shadow-sm"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{l.label}</span>
                            </Link>
                        );
                    })}
                </LayoutGroup>
                {!user && (
                    <Link
                        to="/login"
                        className="relative px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow hover:opacity-90"
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
        // Remove the old bluish gradient wrapper so the Settings page uses the same radial background style as Mentors
        <div className="min-h-screen relative">
            <Settings />
            {user && (
                <div className="fixed bottom-8 right-8">
                    <button
                        onClick={signOutUser}
                        className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-900 font-medium shadow-sm border border-gray-800 hover:bg-red-50 hover:text-red-600 hover:border-red-200 hover:shadow-md transition-all duration-300 active:scale-95"
                    >
                        <span>Sign Out</span>
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
            <div className={showNav && !isDashboard ? "pt-16" : ""}>
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
