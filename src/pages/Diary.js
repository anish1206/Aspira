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

const Diary = () => {
    const [user, setUser] = useState(null);
    const [entries, setEntries] = useState([]);
    const [entry, setEntry] = useState("");

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date()); // For the month view
    const [selectedDate, setSelectedDate] = useState(new Date()); // For the selected day

    // AI Access State
    const [aiAccessEnabled, setAiAccessEnabled] = useState(false);

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

        // Fetch all diary entries for the user to populate the calendar indicators
        const q = query(
            collection(db, "diary"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
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
            setEntries(fetchedEntries);
        });

        return () => unsubscribe();
    }, [user]);

    // Calendar Helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
        return { days, firstDay };
    };

    const { days: daysInMonth, firstDay } = getDaysInMonth(currentDate);

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
    };

    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const getEntriesForDate = (date) => {
        return entries.filter(e => isSameDay(e.date, date));
    };

    const handleDateClick = (day) => {
        const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newSelectedDate);
        setEntry(""); // Clear input when switching days
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

            await addDoc(collection(db, "diary"), {
                userId: user.uid,
                content: entry,
                type: "journal",
                createdAt: serverTimestamp(), // When it was written
                entryDate: Timestamp.fromDate(entryTimestamp) // The logical date of the entry
            });
            setEntry("");
            alert("Entry saved!");
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

    // Derived state for selected day's entries
    const selectedDayEntries = getEntriesForDate(selectedDate);

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Please log in to access your diary.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Calendar */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-card rounded-3xl shadow-sm border border-border p-6">
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-foreground">
                                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h2>
                                <div className="flex gap-2">
                                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square"></div>
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                    const isSelected = isSameDay(date, selectedDate);
                                    const isToday = isSameDay(date, new Date());
                                    const hasEntries = getEntriesForDate(date).length > 0;

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => handleDateClick(day)}
                                            className={`
                                                aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all
                                                ${isSelected
                                                    ? 'bg-primary text-primary-foreground shadow-lg scale-105 font-bold'
                                                    : 'hover:bg-muted text-foreground'
                                                }
                                                ${isToday && !isSelected ? 'border-2 border-primary text-primary' : ''}
                                            `}
                                        >
                                            <span className="text-sm">{day}</span>
                                            {hasEntries && (
                                                <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-primary'}`}></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* AI Access Toggle */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-blue-900">AI Access</h3>
                                <p className="text-blue-800/80 text-xs">Allow AI to view this note</p>
                            </div>
                            <button
                                onClick={toggleAiAccess}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${aiAccessEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${aiAccessEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Daily Notes */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-card rounded-3xl shadow-sm border border-border p-6 min-h-[600px] flex flex-col">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                                <div>
                                    <h2 className="text-3xl font-bold text-foreground">
                                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                    </h2>
                                    <p className="text-muted-foreground">
                                        {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                    {selectedDate.getDate()}
                                </div>
                            </div>

                            {/* Entries List */}
                            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                                {selectedDayEntries.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        <p>No entries for this day.</p>
                                    </div>
                                ) : (
                                    selectedDayEntries.map((entry) => (
                                        <div key={entry.id} className="bg-muted/30 rounded-2xl p-5 border border-transparent hover:border-border transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">
                                                    {entry.createdAt?.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="mt-auto pt-4 border-t border-border">
                                <textarea
                                    value={entry}
                                    onChange={(e) => setEntry(e.target.value)}
                                    placeholder={`Write about your ${selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()}...`}
                                    className="w-full p-4 rounded-xl border border-input bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[120px] resize-none text-base leading-relaxed mb-4"
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={saveEntry}
                                        disabled={!entry.trim()}
                                        className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span>Save Note</span>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Diary;