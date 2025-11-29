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
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { Navigate, useNavigate, Link } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSignup, setIsSignup] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Signup additional fields
    const [signupStep, setSignupStep] = useState(1); // 1: basic info, 2: additional info
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [accountType, setAccountType] = useState("individual"); // individual, company, minor
    const [companyName, setCompanyName] = useState("");
    const [companyHrConsent, setCompanyHrConsent] = useState(false);
    const [guardianName, setGuardianName] = useState("");
    const [guardianPhone, setGuardianPhone] = useState("");
    const [emergencyPreference, setEmergencyPreference] = useState("guardian"); // guardian or emergency_services
    const [emergencyServicesConsent, setEmergencyServicesConsent] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Calculate age from date of birth
    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Validate phone number
    const validatePhone = (phone) => {
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(phone);
    };

    // Handle step 1 submission (basic email/password)
    const handleStep1Submit = (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter email and password");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setSignupStep(2); // Move to step 2
    };

    // Handle final signup submission
    const handleSignupComplete = async (e) => {
        e.preventDefault();
        setError("");

        // Validate date of birth
        if (!dateOfBirth) {
            setError("Please enter your date of birth");
            return;
        }

        const age = calculateAge(dateOfBirth);
        
        // Auto-set account type based on age
        let finalAccountType = accountType;
        if (age < 18) {
            finalAccountType = "minor";
        }

        // Validate minor requirements
        if (finalAccountType === "minor" || age < 18) {
            if (!guardianName.trim()) {
                setError("Guardian name is required for users under 18");
                return;
            }
            if (!guardianPhone.trim()) {
                setError("Guardian phone number is required for users under 18");
                return;
            }
            if (!validatePhone(guardianPhone)) {
                setError("Please use international format for phone (e.g., +919876543210)");
                return;
            }
        }

        // Validate company requirements
        if (accountType === "company") {
            if (!companyName.trim()) {
                setError("Company name is required");
                return;
            }
            if (!companyHrConsent) {
                setError("Please consent to share SOS alerts with company HR");
                return;
            }
        }

        // Validate emergency services consent
        if (emergencyPreference === "emergency_services" && !emergencyServicesConsent) {
            setError("Please consent to allow emergency services contact on your behalf");
            return;
        }

        try {
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;

            // Save user profile to Firestore
            const userProfile = {
                email: email,
                dateOfBirth: dateOfBirth,
                age: age,
                accountType: finalAccountType,
                createdAt: new Date(),
                emergencyPreference: emergencyPreference
            };

            // Add guardian info if applicable
            if (finalAccountType === "minor" || age < 18 || (emergencyPreference === "guardian" && guardianName && guardianPhone)) {
                userProfile.guardianName = guardianName.trim();
                userProfile.guardianPhone = guardianPhone.trim();
            }

            // Add company info if applicable
            if (accountType === "company") {
                userProfile.companyName = companyName.trim();
                userProfile.companyHrConsent = companyHrConsent;
            }

            // Add emergency services consent
            if (emergencyPreference === "emergency_services") {
                userProfile.emergencyServicesConsent = emergencyServicesConsent;
            }

            await setDoc(doc(db, "users", userId), userProfile);

            alert("Account created successfully! 🎉");
            navigate("/dashboard", { replace: true });
        } catch (err) {
            console.error("Signup error:", err);
            setError(err.message);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError("");
        
        // For login (not signup)
        if (!isSignup) {
            try {
                await signInWithEmailAndPassword(auth, email, password);
                alert("Login successful! 🎉");
                navigate("/dashboard", { replace: true });
            } catch (err) {
                setError(err.message);
            }
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

            {/* Back to Dashboard */}
            <div className="absolute top-6 right-6 z-10">
                <Link
                    to="/"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 transition-all text-sm font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                    <span>Back to Dashboard</span>
                </Link>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-8 relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        {isSignup ? (signupStep === 1 ? "Create Account" : "Complete Your Profile") : "Welcome Back"}
                    </h2>
                    <p className="text-muted-foreground">
                        {isSignup
                            ? (signupStep === 1 ? "Join Aspira and start your journey" : "Help us personalize your experience")
                            : "Sign in to continue to your dashboard"
                        }
                    </p>
                    {isSignup && signupStep === 2 && (
                        <button
                            onClick={() => setSignupStep(1)}
                            className="mt-3 text-xs text-primary hover:underline"
                        >
                            ← Back to Step 1
                        </button>
                    )}
                </div>

                {/* LOGIN FORM */}
                {!isSignup && (
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
                            Sign In
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
                            onClick={() => setIsSignup(true)}
                            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
                        >
                            New to Aspira? Create Account
                        </button>
                    </form>
                )}

                {/* SIGNUP STEP 1: Basic Info */}
                {isSignup && signupStep === 1 && (
                    <form onSubmit={handleStep1Submit} className="space-y-4">
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
                                placeholder="Password (min 6 characters)"
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
                            Continue
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsSignup(false)}
                            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
                        >
                            Already have an account? Sign In
                        </button>
                    </form>
                )}

                {/* SIGNUP STEP 2: Additional Info */}
                {isSignup && signupStep === 2 && (
                    <form onSubmit={handleSignupComplete} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {/* Date of Birth */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-foreground">Date of Birth *</label>
                            <input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        {/* Account Type - Only show if 18+ */}
                        {dateOfBirth && calculateAge(dateOfBirth) >= 18 && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-foreground">Account Type *</label>
                                <select
                                    value={accountType}
                                    onChange={(e) => setAccountType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="individual">Individual</option>
                                    <option value="company">Company Employee</option>
                                </select>
                            </div>
                        )}

                        {/* Company Details */}
                        {accountType === "company" && (
                            <>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">Company Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your company name"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                    <label className="flex items-start gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={companyHrConsent}
                                            onChange={(e) => setCompanyHrConsent(e.target.checked)}
                                            className="mt-1"
                                        />
                                        <span className="text-xs text-foreground">
                                            I consent to share SOS alerts with my company's HR management in case of mental health emergencies. This helps ensure workplace support when needed.
                                        </span>
                                    </label>
                                </div>
                            </>
                        )}

                        {/* Guardian Info for Minors (Under 18) */}
                        {dateOfBirth && calculateAge(dateOfBirth) < 18 && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
                                <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                                    🛡️ Guardian Information Required (Under 18)
                                </p>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">Guardian Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Parent or guardian's name"
                                        value={guardianName}
                                        onChange={(e) => setGuardianName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">Guardian Phone *</label>
                                    <input
                                        type="tel"
                                        placeholder="+919876543210"
                                        value={guardianPhone}
                                        onChange={(e) => setGuardianPhone(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                    <p className="text-xs text-muted-foreground">Include country code (e.g., +91 for India)</p>
                                </div>
                            </div>
                        )}

                        {/* Emergency Preference for Adults */}
                        {dateOfBirth && calculateAge(dateOfBirth) >= 18 && accountType === "individual" && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-foreground">Emergency Contact Preference *</label>
                                
                                <div className="space-y-2">
                                    <label className="flex items-start gap-2 p-3 border border-input rounded-lg cursor-pointer hover:bg-muted/30 transition-all">
                                        <input
                                            type="radio"
                                            name="emergencyPreference"
                                            value="guardian"
                                            checked={emergencyPreference === "guardian"}
                                            onChange={(e) => setEmergencyPreference(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground">Guardian/Trusted Contact</p>
                                            <p className="text-xs text-muted-foreground">We'll notify your chosen person during emergencies</p>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-2 p-3 border border-input rounded-lg cursor-pointer hover:bg-muted/30 transition-all">
                                        <input
                                            type="radio"
                                            name="emergencyPreference"
                                            value="emergency_services"
                                            checked={emergencyPreference === "emergency_services"}
                                            onChange={(e) => setEmergencyPreference(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground">Emergency Services (112/911)</p>
                                            <p className="text-xs text-muted-foreground">We'll contact emergency services on your behalf</p>
                                        </div>
                                    </label>
                                </div>

                                {/* Guardian Details for Adults who chose guardian option */}
                                {emergencyPreference === "guardian" && (
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-foreground">Guardian/Contact Name</label>
                                            <input
                                                type="text"
                                                placeholder="Trusted person's name"
                                                value={guardianName}
                                                onChange={(e) => setGuardianName(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-foreground">Contact Phone</label>
                                            <input
                                                type="tel"
                                                placeholder="+919876543210"
                                                value={guardianPhone}
                                                onChange={(e) => setGuardianPhone(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                            <p className="text-xs text-muted-foreground">Include country code</p>
                                        </div>
                                    </div>
                                )}

                                {/* Emergency Services Consent */}
                                {emergencyPreference === "emergency_services" && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={emergencyServicesConsent}
                                                onChange={(e) => setEmergencyServicesConsent(e.target.checked)}
                                                className="mt-1"
                                            />
                                            <span className="text-xs text-foreground">
                                                I authorize Aspira to contact emergency services (112 in India / 911 in US) on my behalf if the AI detects severe mental health crisis or suicidal intent. I understand this is for my safety.
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                            Complete Signup
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
