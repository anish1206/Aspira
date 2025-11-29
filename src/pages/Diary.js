// src/pages/Diary.js
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    doc,
    getDoc,
    setDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./Diary.css"; // Ensure CSS is imported

const Diary = () => {
    const [user, setUser] = useState(null);
    const [entries, setEntries] = useState([]);
    const [entry, setEntry] = useState("");
    const [activeTab, setActiveTab] = useState("write"); // 'write' or 'read'

    // Calendar State (kept for internal logic but hidden in write mode)
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // AI Access State
    const [aiAccessEnabled, setAiAccessEnabled] = useState(false);

    // Book State
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Fetch AI Access Preference
    useEffect(() => {
        if (!user) return;
        const fetchUserPreferences = async () => {
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setAiAccessEnabled(userDoc.data().aiAccessEnabled || false);
                }
            } catch (error) {
                console.error("Error fetching user preferences:", error);
            }
        };
        fetchUserPreferences();
    }, [user]);

    useEffect(() => {
        if (!user) return;

        // Fetch all diary entries for the user - NO orderBy to avoid index requirement
        const q = query(
            collection(db, "diary"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedEntries = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Handle both Timestamp and legacy serverTimestamp/Date formats
                    date: data.entryDate ? data.entryDate.toDate() : (data.createdAt ? data.createdAt.toDate() : new Date())
                };
            });
            // Sort in JavaScript instead of Firestore to avoid composite index
            fetchedEntries.sort((a, b) => {
                const timeA = a.date ? a.date.getTime() : 0;
                const timeB = b.date ? b.date.getTime() : 0;
                return timeB - timeA; // Descending order (newest first)
            });
            setEntries(fetchedEntries);
        }, (error) => {
            console.error("Error fetching diary entries:", error);
        });

        return () => unsubscribe();
    }, [user]);

    // Calendar Helpers (unused in current UI but kept for potential future use)
    // const getDaysInMonth = (date) => {
    //     const year = date.getFullYear();
    //     const month = date.getMonth();
    //     const days = new Date(year, month + 1, 0).getDate();
    //     const firstDay = new Date(year, month, 1).getDay();
    //     return { days, firstDay };
    // };

    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const getEntriesForDate = (date) => {
        return entries.filter(e => isSameDay(e.date, date));
    };

    const saveEntry = async () => {
        if (!user || !entry.trim()) {
            if (!entry.trim()) alert("Please write something before saving!");
            return;
        }

        try {
            // Create a timestamp for the selected date (at noon to avoid timezone edge cases)
            const entryTimestamp = new Date(selectedDate);
            entryTimestamp.setHours(12, 0, 0, 0);

            // Note: For real encryption, use a library like crypto-js.
            // Here we use the 'aiAccessEnabled' flag to control visibility to the AI.

            await addDoc(collection(db, "diary"), {
                userId: user.uid,
                content: entry,
                type: "journal",
                createdAt: serverTimestamp(), // When it was written
                entryDate: Timestamp.fromDate(entryTimestamp), // The logical date of the entry
                encrypted: !aiAccessEnabled // Flag to indicate if it should be treated as private
            });
            setEntry("");
            alert("Entry saved to your secure diary!");
        } catch (error) {
            console.error("Error saving entry:", error);
            alert("Failed to save entry.");
        }
    };

    const toggleAiAccess = async () => {
        if (!user) return;
        const newValue = !aiAccessEnabled;
        setAiAccessEnabled(newValue);
        try {
            await setDoc(doc(db, "users", user.uid), { aiAccessEnabled: newValue }, { merge: true });
        } catch (error) {
            console.error("Error updating AI access preference:", error);
            setAiAccessEnabled(!newValue); // Revert on error
            alert("Failed to update preference.");
        }
    };

    // Book Logic
    const nextPage = () => {
        if (currentPage < entries.length - 1) setCurrentPage(prev => prev + 1);
    };

    const prevPage = () => {
        if (currentPage > 0) setCurrentPage(prev => prev - 1);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Please log in to access your diary.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20 diary-container">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8 gap-4">
                    <button
                        onClick={() => setActiveTab("write")}
                        className={`px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 ${activeTab === "write"
                                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                    >
                        ✍️ Relax & Write
                    </button>
                    <button
                        onClick={() => setActiveTab("read")}
                        className={`px - 8 py - 3 rounded - full text - lg font - medium transition - all duration - 300 ${activeTab === "read"
                                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            } `}
                    >
                        📖 Read Memories
                    </button>
                </div>

                {/* WRITE MODE */}
                {activeTab === "write" && (
                    <div className="max-w-3xl mx-auto animate-fade-in">
                        <div className="bg-card rounded-3xl shadow-xl border border-border p-8 min-h-[600px] flex flex-col relative overflow-hidden">
                            {/* Relaxing Background Element */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>

                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-foreground">
                                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                    </h2>
                                    <p className="text-muted-foreground">
                                        {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>

                                {/* AI Access Toggle (Compact) */}
                                <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-full border border-border">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {aiAccessEnabled ? "AI Access ON" : "Private Mode"}
                                    </span>
                                    <button
                                        onClick={toggleAiAccess}
                                        className={`w - 10 h - 5 rounded - full p - 0.5 transition - colors duration - 300 ${aiAccessEnabled ? 'bg-green-500' : 'bg-gray-300'} `}
                                    >
                                        <div className={`w - 4 h - 4 bg - white rounded - full shadow - sm transform transition - transform duration - 300 ${aiAccessEnabled ? 'translate-x-5' : 'translate-x-0'} `}></div>
                                    </button>
                                </div>
                            </div>

                            {/* Writing Area */}
                            <div className="flex-1 flex flex-col">
                                <textarea
                                    value={entry}
                                    onChange={(e) => setEntry(e.target.value)}
                                    placeholder="Take a deep breath... What's on your mind today?"
                                    className="flex-1 w-full p-6 rounded-2xl border-none bg-muted/20 focus:bg-muted/30 focus:ring-0 outline-none transition-all resize-none text-lg leading-relaxed placeholder:text-muted-foreground/50"
                                    style={{ minHeight: '300px' }}
                                />

                                <div className="mt-6 flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground italic">
                                        {aiAccessEnabled
                                            ? "ℹ️ AI can read this to help you."
                                            : "🔒 Encrypted & Private. AI cannot see this."}
                                    </p>
                                    <button
                                        onClick={saveEntry}
                                        disabled={!entry.trim()}
                                        className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
                                    >
                                        <span>Save to Diary</span>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* READ MODE (BOOK ANIMATION) */}
                {activeTab === "read" && (
                    <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
                        {entries.length === 0 ? (
                            <div className="text-center text-muted-foreground">
                                <p className="text-xl">Your diary is empty.</p>
                                <p className="text-sm mt-2">Switch to the Write tab to start your journey.</p>
                            </div>
                        ) : (
                            <div className="book-container perspective-1000 relative w-full max-w-4xl h-[600px] flex justify-center items-center">
                                {/* Book Cover / Pages */}
                                <div className="relative w-full h-full flex justify-center items-center">
                                    {/* Left Page (Previous) */}
                                    <div className="book-page left-page bg-[#fdfbf7] shadow-2xl rounded-l-lg w-1/2 h-full border-r border-gray-200 p-8 overflow-y-auto absolute left-0 transform-origin-right transition-transform duration-700 ease-in-out z-10">
                                        {currentPage > 0 && entries[currentPage - 1] ? (
                                            <div className="prose">
                                                <div className="text-sm text-gray-500 mb-4 font-serif italic">
                                                    {entries[currentPage - 1].date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                                <div className="text-gray-800 font-serif leading-loose whitespace-pre-wrap">
                                                    {entries[currentPage - 1].content}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 font-serif italic">
                                                Start of Diary
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Page (Current) */}
                                    <div className="book-page right-page bg-[#fdfbf7] shadow-2xl rounded-r-lg w-1/2 h-full p-8 overflow-y-auto absolute right-0 transform-origin-left transition-transform duration-700 ease-in-out z-20">
                                        {entries[currentPage] ? (
                                            <div className="prose">
                                                <div className="text-sm text-gray-500 mb-4 font-serif italic">
                                                    {entries[currentPage].date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                                <div className="text-gray-800 font-serif leading-loose whitespace-pre-wrap">
                                                    {entries[currentPage].content}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 font-serif italic">
                                                End of Diary
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Navigation Controls */}
                                <div className="absolute -bottom-16 flex gap-8">
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 0}
                                        className="px-6 py-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50 transition-all"
                                    >
                                        ← Previous Page
                                    </button>
                                    <span className="py-2 text-muted-foreground font-serif">
                                        Page {currentPage + 1} of {entries.length}
                                    </span>
                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage >= entries.length - 1}
                                        className="px-6 py-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50 transition-all"
                                    >
                                        Next Page →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Diary;