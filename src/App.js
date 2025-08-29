// src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Login from "./login";
import { useAuth } from "./auth";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Groups from "./pages/Groups";
import Checkins from "./pages/Checkins";
import Diary from "./pages/Diary";
import Settings from "./pages/Settings";
import Onboarding from "./components/Onboarding";
import dataService from "./services/dataService";
import notificationService from "./services/notificationService";
import errorService from "./services/errorService";
import ErrorBoundary, { AsyncErrorBoundary, DashboardErrorBoundary, ChatErrorBoundary, CheckinErrorBoundary } from "./components/ErrorBoundary";

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
    initializeNotifications();
  }, [user]);
  
  const initializeNotifications = async () => {
    if (!user) return;
    
    try {
      // Initialize notification service when user is authenticated
      const permission = await notificationService.initializeNotifications(user.uid);
      
      if (permission) {
        console.log('Notifications initialized successfully');
        
        // Schedule default mood reminder if not already set
        await notificationService.scheduleMoodReminder(user.uid);
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const checkOnboardingStatus = async () => {
    if (!user) {
      setCheckingOnboarding(false);
      return;
    }

    try {
      // Check localStorage first for performance
      const localOnboarded = localStorage.getItem('mindsync_onboarded');
      if (localOnboarded === 'true') {
        setShowOnboarding(false);
        setCheckingOnboarding(false);
        return;
      }

      // Check database for user profile
      const profile = await dataService.getUserProfile(user.uid);
      const isOnboarded = profile?.preferences?.onboardingCompleted;
      
      setShowOnboarding(!isOnboarded);
      
      if (isOnboarded) {
        localStorage.setItem('mindsync_onboarded', 'true');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(true); // Default to showing onboarding on error
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('mindsync_onboarded', 'true');
  };

  if (loading || checkingOnboarding) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 12,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>🧠</div>
          <div>Loading Mindsync...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return children;
};

function App() {
  const location = useLocation();
  return (
    <AsyncErrorBoundary>
      <div>
        {location.pathname !== "/login" && (
          <ErrorBoundary fallback={<div style={{ padding: 20, textAlign: 'center' }}>Navigation unavailable</div>}>
            <Nav />
          </ErrorBoundary>
        )}
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardErrorBoundary>
                  <Dashboard />
                </DashboardErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatErrorBoundary>
                  <Chat />
                </ChatErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/groups" 
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Groups />
                </ErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkins" 
            element={
              <ProtectedRoute>
                <CheckinErrorBoundary>
                  <Checkins />
                </CheckinErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/diary" 
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Diary />
                </ErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Settings />
                </ErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <ErrorBoundary>
                <Login />
              </ErrorBoundary>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AsyncErrorBoundary>
  );
}

export default App;
