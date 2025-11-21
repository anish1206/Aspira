// src/pages/Settings.js
import React, { useState } from "react";
import { useAuth } from "../auth";

export default function Settings() {
    const { user } = useAuth();
    const [language, setLanguage] = useState("en");
    const [consent, setConsent] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const settingsSections = [
        {
            title: "Account",
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4ZM12 14c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4Z" />
                </svg>
            ),
            content: (
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-muted-foreground flex-shrink-0">Email</span>
                        <span className="text-sm font-medium truncate">{user?.email || "Not logged in"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Member since</span>
                        <span className="text-sm font-medium">September 2025</span>
                    </div>
                </div>
            )
        },
        {
            title: "Language & Region",
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04ZM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12Zm-2.62 7l1.62-4.33L19.12 17h-3.24Z" />
                </svg>
            ),
            content: (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">Language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिंदी (Hindi)</option>
                            <option value="bn">বাংলা (Bengali)</option>
                            <option value="ta">தமிழ் (Tamil)</option>
                        </select>
                    </div>
                </div>
            )
        },
        {
            title: "Preferences",
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                </svg>
            ),
            content: (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">Push Notifications</p>
                            <p className="text-xs text-muted-foreground">Get reminders for check-ins</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications}
                                onChange={(e) => setNotifications(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">Dark Mode</p>
                            <p className="text-xs text-muted-foreground">Switch to dark theme</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={darkMode}
                                onChange={(e) => setDarkMode(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            )
        },
        {
            title: "Privacy & Consent",
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11.81C12.47 22.43 13.04 21.77 13.5 21H5V3H13V9H21ZM18 14C16.34 14 15 15.34 15 17S16.34 20 18 20 21 18.66 21 17 19.66 14 18 14Z" />
                </svg>
            ),
            content: (
                <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            className="mt-1 w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2"
                        />
                        <div>
                            <p className="text-sm font-medium text-foreground">Data Processing Consent</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Allow MindSync to analyze your entries to provide better personalized support and insights.
                                All data is processed securely and never shared with third parties.
                            </p>
                        </div>
                    </div>
                    <button className="text-xs text-primary hover:text-primary/80 transition-colors">
                        Read our Privacy Policy →
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="relative min-h-[calc(100vh-80px)] bg-gradient-to-b from-green-50/50 to-white overflow-hidden">
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

            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-24">
                <h1 className="text-4xl md:text-5xl font-light leading-tight text-gray-900 mb-2">
                    Your <span className="font-semibold text-emerald-800">Settings</span>
                </h1>
                <p className="text-gray-600 mb-10">Customize your MindSync experience</p>

                <div className="space-y-6">
                    {settingsSections.map((section, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className="relative bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        {section.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-foreground mb-4">{section.title}</h3>
                                        {section.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
