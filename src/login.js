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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [user, setUser] = useState(null);

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
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
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
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 80 }}>
        <h2>Welcome{user.displayName ? `, ${user.displayName}` : "!"}</h2>
        <p style={{ marginTop: 8 }}>Signed in as {user.email || "Google user"}</p>
        <button onClick={handleSignOut} style={{ marginTop: 16, padding: 8, background: "#9c27b0", color: "white", border: "none" }}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 80 }}>
      <h2>Mindsync {isSignup ? "Sign Up" : "Login"}</h2>
      <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", width: 300 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: 10, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: 10, padding: 8 }}
        />
        <button type="submit" style={{ padding: 8, background: "#1976d2", color: "white", border: "none" }}>
          {isSignup ? "Create Account" : "Log In"}
        </button>
        <button type="button" onClick={handleGoogleSignIn} style={{ marginTop: 10, padding: 8, background: "#db4437", color: "white", border: "none" }}>
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => setIsSignup((v) => !v)}
          style={{ marginTop: 10, padding: 8, background: "#eeeeee", color: "#333", border: "none" }}
        >
          {isSignup ? "Have an account? Log In" : "New here? Create an account"}
        </button>
        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
