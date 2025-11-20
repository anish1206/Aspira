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

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden justify-center items-center p-4">
            {/* Background gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
                    style={{
                        background: "radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(59, 130, 246, 0.1) 60%, transparent 100%)"
                    }}
                ></div>

                <div
                    className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
                    style={{
                        background: "radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, rgba(244, 114, 182, 0.1) 60%, transparent 100%)"
                    }}
                ></div>
            </div>

            {/* Grainy texture overlay */}
            <div className="absolute inset-0 pointer-events-none grainy-texture opacity-20"></div>

            {/* Header with brand */}
            <div className="absolute top-6 left-6 z-10">
                <div className="flex items-center space-x-2">
                    <span className="text-3xl jersey-15-regular font-bold text-foreground">Aspira</span>
                </div>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-8 relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        {isSignup ? "Create Account" : "Welcome Back"}
                    </h2>
                    <p className="text-muted-foreground">
                        {isSignup
                            ? "Join Aspira and start your journey"
                            : "Sign in to continue to your dashboard"
                        }
                    </p>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="space-y-2">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                        {isSignup ? "Create Account" : "Sign In"}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-card text-muted-foreground">or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full bg-background border border-border text-foreground font-medium py-3 rounded-xl hover:bg-muted/50 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsSignup((v) => !v)}
                        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
                    >
                        {isSignup ? "Already have an account? Sign In" : "New to Aspira? Create Account"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
