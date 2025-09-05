// src/Login.js
import React, { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { Navigate, useNavigate } from "react-router-dom";
import "./pages/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created! 🎉 You are now signed in.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful! 🎉");
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background gradients - same as landing page */}
      <div className="absolute inset-0">
        {/* Left gradient - dark teal */}
        <div 
          className="absolute top-1/4 left-0 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-60 grainy-texture"
          style={{
            background: "radial-gradient(circle, #0f2027 0%, #203a43 30%, #2c5364 60%, rgba(44, 83, 100, 0.3) 80%, transparent 100%)"
          }}
        ></div>
        
        {/* Right gradient - reddish orange */}
        <div 
          className="absolute -top-1/2 -right-1/2 translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-80 grainy-texture"
          style={{
            background: "radial-gradient(circle, #b91c1c 0%, #dc2626 20%, #f97316 40%, #fbbf24 60%, rgba(251, 191, 36, 0.3) 80%, transparent 100%)"
          }}
        ></div>
        
        {/* Additional subtle gradient for depth */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, rgba(99, 102, 241, 0.3) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)"
          }}
        ></div>
      </div>

      {/* Header with brand */}
      <div className="login-header">
        <div className="brand">
          <div className="flex items-center space-x-2">
          <span className="text-3xl font-berkeley-mono font-bold text-foreground">Aspira</span>
        </div>
        </div>
      </div>

      {/* Login Form Container */}
      <div className="login-container">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-title color-black">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="login-subtitle">
              {isSignup 
                ? "Join MindSync and start your journey" 
                : "Sign in to continue to your dashboard"
              }
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="login-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full">
              {isSignup ? "Create Account" : "Sign In"}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleSignIn} 
              className="btn btn-google btn-full"
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => setIsSignup((v) => !v)}
              className="btn btn-ghost btn-full"
            >
              {isSignup ? "Already have an account? Sign In" : "New to MindSync? Create Account"}
            </button>
          </form>
        </div>
      </div>

      {/* Floating geometric shapes - same as landing page */}
      <div className="shape shape-circle"></div>
      <div className="shape shape-diamond"></div>
      <div className="shape shape-square"></div>
    </div>
  );
};

export default Login;
