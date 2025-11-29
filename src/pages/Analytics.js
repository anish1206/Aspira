// src/pages/Analytics.js
import React from "react";
import { motion } from "framer-motion";
import InteractiveBranch from "../components/InteractiveBranch";

// --- Mock Data ---
const activityData = Array.from({ length: 365 }, (_, i) => ({
    date: new Date(new Date().getFullYear(), 0, i + 1),
    count: Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0,
}));

const moodData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    mood: 3 + Math.random() * 2 - 1, // Random mood between 2 and 5
}));

const moodDistribution = [
    { label: "Happy", value: 45, color: "#064e3b" }, // green-900
    { label: "Neutral", value: 30, color: "#065f46" }, // green-800
    { label: "Sad", value: 15, color: "#047857" }, // green-700
    { label: "Anxious", value: 10, color: "#10b981" }, // emerald-500
];

// --- Components ---

const StatCard = ({ title, value, subtext }) => (
    <div className="bg-gray-50/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm transition-colors">
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-green-900">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
    </div>
);

const ActivityHeatmap = () => {
    // Simplified rendering for demo - just a grid of boxes
    return (
        <div className="bg-gray-50/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Yearly Activity</h3>
            <div className="flex flex-wrap gap-1 justify-center">
                {activityData.slice(0, 140).map((d, i) => ( // Show subset for visual
                    <div
                        key={i}
                        className={`w-3 h-3 rounded-sm ${d.count === 0 ? "bg-gray-200" :
                            d.count < 2 ? "bg-green-200" :
                                d.count < 4 ? "bg-green-500" : "bg-green-900"
                            }`}
                        title={`${d.date.toDateString()}: ${d.count} entries`}
                    />
                ))}
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-200" />
                    <div className="w-3 h-3 rounded-sm bg-green-200" />
                    <div className="w-3 h-3 rounded-sm bg-green-500" />
                    <div className="w-3 h-3 rounded-sm bg-green-900" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
};

const MoodGraph = () => {
    return (
        <div className="bg-gray-50/60 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-sm h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood Trends (30 Days)</h3>
            <div className="h-48 flex items-end gap-1">
                {moodData.map((d, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col justify-end group relative">
                        <div
                            className="w-full bg-green-900/80 rounded-t-sm hover:bg-green-900 transition-colors"
                            style={{ height: `${(d.mood / 5) * 100}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-1 rounded whitespace-nowrap z-10">
                            Day {d.day}: {d.mood.toFixed(1)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MoodPieChart = () => {
    // Simple CSS conic-gradient pie chart for lightweight implementation
    const total = moodDistribution.reduce((acc, curr) => acc + curr.value, 0);
    let currentAngle = 0;
    const gradientParts = moodDistribution.map(item => {
        const start = currentAngle;
        const percentage = (item.value / total) * 100;
        currentAngle += percentage;
        return `${item.color} ${start}% ${currentAngle}%`;
    }).join(", ");

    return (
        <div className="bg-gray-50/60 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-sm h-full flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 self-start">Mood Distribution</h3>
            <div className="relative w-48 h-48 rounded-full" style={{ background: `conic-gradient(${gradientParts})` }}>
                {/* Inner circle for donut chart look */}
                <div className="absolute inset-0 m-auto w-32 h-32 bg-white/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-sm font-medium text-gray-500">Total Entries</span>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                {moodDistribution.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-600">{item.label} ({item.value}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Additional Mock Data ---
const lifeBalanceData = [
    { area: "Work", value: 7 },
    { area: "Social", value: 8 },
    { area: "Health", value: 6 },
    { area: "Sleep", value: 5 },
    { area: "Hobbies", value: 9 },
    { area: "Growth", value: 7 },
];

const sleepMoodData = Array.from({ length: 14 }, (_, i) => ({
    day: i + 1,
    sleep: 5 + Math.random() * 4, // 5-9 hours
    mood: 2 + Math.random() * 3, // 2-5 mood
}));

const topEmotions = [
    { name: "Grateful", count: 12, size: "text-3xl" },
    { name: "Anxious", count: 8, size: "text-xl" },
    { name: "Excited", count: 10, size: "text-2xl" },
    { name: "Tired", count: 15, size: "text-4xl" },
    { name: "Calm", count: 9, size: "text-xl" },
    { name: "Stressed", count: 7, size: "text-lg" },
    { name: "Happy", count: 11, size: "text-2xl" },
];

// --- New Components ---

const RadarChart = () => {
    // Simple SVG Radar Chart
    const size = 200;
    const center = size / 2;
    const radius = 80;
    const angleStep = (Math.PI * 2) / lifeBalanceData.length;

    const getCoordinates = (value, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const r = (value / 10) * radius;
        return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
    };

    const points = lifeBalanceData.map((d, i) => getCoordinates(d.value, i).join(",")).join(" ");
    const fullPoints = lifeBalanceData.map((_, i) => getCoordinates(10, i).join(",")).join(" ");

    return (
        <div className="bg-gray-50/60 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-sm h-full flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 self-start">Life Balance</h3>
            <svg width={size} height={size} className="overflow-visible">
                {/* Background Grid */}
                {[2, 4, 6, 8, 10].map(level => (
                    <polygon
                        key={level}
                        points={lifeBalanceData.map((_, i) => {
                            const angle = i * angleStep - Math.PI / 2;
                            const r = (level / 10) * radius;
                            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                        }).join(" ")}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                    />
                ))}
                {/* Data Path */}
                <polygon points={points} fill="rgba(6, 78, 59, 0.2)" stroke="#064e3b" strokeWidth="2" />
                {/* Labels */}
                {lifeBalanceData.map((d, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const r = radius + 20;
                    const x = center + r * Math.cos(angle);
                    const y = center + r * Math.sin(angle);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs font-medium fill-gray-600"
                        >
                            {d.area}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

const SleepMoodGraph = () => {
    return (
        <div className="bg-gray-50/60 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Sleep vs Mood (14 Days)</h3>
                {/* Legend */}
                <div className="flex gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-200/50 rounded-sm"></div>Sleep</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-900 rounded-full"></div>Mood</div>
                </div>
            </div>
            <div className="h-48 flex items-end gap-2 relative">
                {sleepMoodData.map((d, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col justify-end relative group">
                        {/* Sleep Bar */}
                        <div
                            className="w-full bg-blue-200/50 rounded-t-sm absolute bottom-0"
                            style={{ height: `${(d.sleep / 10) * 100}%` }}
                        />
                        {/* Mood Dot */}
                        <div
                            className="w-2 h-2 bg-green-900 rounded-full absolute left-1/2 -translate-x-1/2 z-10"
                            style={{ bottom: `${(d.mood / 5) * 100}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded whitespace-nowrap z-20">
                            Day {d.day}<br />Sleep: {d.sleep.toFixed(1)}h<br />Mood: {d.mood.toFixed(1)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EmotionsCloud = () => (
    <div className="bg-gray-50/60 backdrop-blur-xl border border-white/70 rounded-2xl p-6 shadow-lg h-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Emotions</h3>
        <div className="flex flex-wrap items-center justify-center gap-4 h-48 content-center">
            {topEmotions.map((e, i) => (
                <span
                    key={i}
                    className={`${e.size} font-medium text-green-900/80 hover:text-green-900 hover:scale-110 transition-all cursor-default`}
                    style={{ opacity: 0.6 + (e.count / 20) }}
                >
                    {e.name}
                </span>
            ))}
        </div>
    </div>
);

// --- AI Insights Data ---
const aiInsights = {
    summary: "Over the past week, we've discussed feelings of anxiety related to work deadlines and sleep patterns. You've shown resilience by consistently practicing mindfulness exercises.",
    suggestions: [
        {
            title: "Morning Routine",
            desc: "Try a 5-minute breathing exercise before checking emails to reduce morning anxiety.",
            icon: (
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            title: "Sleep Hygiene",
            desc: "Aim for a consistent 10:30 PM bedtime to improve your sleep quality score.",
            icon: (
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )
        },
        {
            title: "Social Connection",
            desc: "Schedule a coffee chat with a friend this weekend to boost your social balance.",
            icon: (
                <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        }
    ]
};

const AIInsightsPanel = () => (
    <div className="bg-gray-50/60 backdrop-blur-xl border border-white/70 rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <div>
                <h3 className="text-2xl font-semibold text-gray-800">Hi, Anish</h3>
                <p className="text-xs text-gray-500">Based on your recent conversations</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Summary Section */}
            <div className="lg:col-span-1 bg-gray-50/60 rounded-xl p-5 border border-white/60 shadow-sm">
                <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Conversation Summary
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                    {aiInsights.summary}
                </p>
            </div>

            {/* Suggestions Section */}
            <div className="lg:col-span-2">
                <h4 className="text-sm font-semibold text-green-900 mb-3 text-center md:text-center">Top Suggestions for You</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {aiInsights.suggestions.map((s, i) => (
                        <div key={i} className="bg-gray-50/60 hover:bg-white/90 transition-colors rounded-xl p-4 border border-white/70 flex flex-col gap-3 items-center text-center shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600">
                                {s.icon}
                            </div>
                            <div>
                                <h5 className="font-medium text-gray-900 text-sm mb-1">{s.title}</h5>
                                <p className="text-xs text-gray-600 leading-snug">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default function Analytics() {
    return (
        <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-green-200 to-green-50">
            {/* Interactive Branch Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <InteractiveBranch />
            </div>

            {/* Background Elements (Non-interactive) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 0 C 30 10 50 30 50 50 C 50 70 30 90 0 100 Z" fill="#059669" />
                    <path d="M100 0 C 70 10 50 30 50 50 C 50 70 70 90 100 100 Z" fill="#10b981" />
                </svg>
                <div className="absolute top-20 left-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2">
                        Wellness <span className="font-semibold text-green-900">Analytics</span>
                    </h1>
                    <p className="text-gray-600">Insights into your mental health journey</p>
                </div>

                {/* AI Insights Panel */}
                <AIInsightsPanel />

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Current Streak" value="12 Days" subtext="Keep it up!" />
                    <StatCard title="Total Check-ins" value="48" subtext="Last 3 months" />
                    <StatCard title="Average Mood" value="4.2/5" subtext="Feeling good" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2">
                        <MoodGraph />
                    </div>
                    <div>
                        <MoodPieChart />
                    </div>
                </div>

                {/* New Analytics Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <RadarChart />
                    <SleepMoodGraph />
                    <EmotionsCloud />
                </div>

                <div className="mb-8">
                    <ActivityHeatmap />
                </div>
            </div >
        </div >
    );
}
