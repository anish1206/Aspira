// src/pages/Checkins.js
import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Checkins() {
    const [mood, setMood] = useState(3);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!auth.currentUser) {
            setMessage({ text: "You must be logged in to save a check-in.", type: "error" });
            return;
        }

        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            await addDoc(collection(db, "checkins"), {
                userId: auth.currentUser.uid,
                mood: mood,
                note: note || "",
                timestamp: serverTimestamp(),
                createdAt: new Date().toISOString()
            });

            setMessage({ text: "Check-in saved successfully!", type: "success" });
            setNote("");
            setMood(3);
        } catch (error) {
            console.error("Error saving check-in:", error);
            setMessage({ text: "Failed to save check-in. Please try again.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-green-50/50 to-white">
            {/* Nature-inspired Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Abstract Tree/Leaf Shapes */}
                <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 0 C 30 10 50 30 50 50 C 50 70 30 90 0 100 Z" fill="#059669" />
                    <path d="M100 0 C 70 10 50 30 50 50 C 50 70 70 90 100 100 Z" fill="#10b981" />
                </svg>

                {/* Floating Orbs */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
                <div className="w-full max-w-md bg-card rounded-2xl border border-border p-8 shadow-sm">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">Daily Check-in</h2>

                    {/* Success/Error Message */}
                    {message.text && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "success"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-foreground">Mood (1-5)</label>
                                <span className="text-lg font-bold text-primary">{mood}</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={mood}
                                onChange={(e) => setMood(Number(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                disabled={loading}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground px-1">
                                <span>Low</span>
                                <span>High</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Note (Optional)</label>
                            <textarea
                                placeholder="How are you feeling today?"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={4}
                                className="w-full p-3 rounded-xl bg-muted/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground resize-none"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : "Save Check-in"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}


