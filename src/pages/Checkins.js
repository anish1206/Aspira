// src/pages/Checkins.js
import React, { useState } from "react";

export default function Checkins() {
    const [mood, setMood] = useState(3);
    const [note, setNote] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Saved check-in: mood ${mood}/5, note: ${note || "(none)"}`);
        setNote("");
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-card rounded-2xl border border-border p-8 shadow-sm">
                <h2 className="text-2xl font-semibold text-foreground mb-6">Daily Check-in</h2>
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
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                        Save Check-in
                    </button>
                </form>
            </div>
        </div>
    );
}


