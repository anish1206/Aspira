// src/pages/MentorList.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function MentorList() {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchMentors() {
            try {
                const mentorsCol = collection(db, "mentors");
                const snapshot = await getDocs(mentorsCol);
                const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setMentors(items);
            } catch (err) {
                setError("Failed to load mentors");
                // eslint-disable-next-line no-console
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchMentors();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background">
                <div className="text-muted-foreground text-lg">Loading mentors...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background">
                <div className="text-destructive text-lg">{error}</div>
            </div>
        );
    }

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

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-24">
                <h1 className="text-4xl md:text-5xl font-light leading-tight text-gray-900 mb-2">
                    Meet Your <span className="font-semibold text-emerald-800">Mentors</span>
                </h1>
                <p className="text-gray-600 mb-10">Connect with experienced guides ready to support your journey</p>

                {mentors.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4ZM12 14c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4Z" />
                            </svg>
                        </div>
                        <p className="text-muted-foreground text-lg">No mentors available at the moment</p>
                        <p className="text-muted-foreground text-sm mt-2">Check back soon for new mentors joining our community</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mentors.map((mentor) => (
                            <Link
                                key={mentor.id}
                                to={`/mentors/${mentor.id}`}
                                className="group relative overflow-hidden rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="relative bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all h-full">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                            <svg viewBox="0 0 24 24" className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4ZM12 14c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4Z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-foreground truncate">{mentor.name}</h3>
                                            {Array.isArray(mentor.specialties) && mentor.specialties.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {mentor.specialties.slice(0, 2).map((specialty, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                                                        >
                                                            {specialty}
                                                        </span>
                                                    ))}
                                                    {mentor.specialties.length > 2 && (
                                                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium">
                                                            +{mentor.specialties.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {mentor.bio && (
                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{mentor.bio}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                                        <span className="text-xs font-medium text-primary group-hover:text-primary/80 transition-colors">
                                            Book Session
                                        </span>
                                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M7 17 17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MentorList;
