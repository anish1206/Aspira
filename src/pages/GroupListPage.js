import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function GroupListPage() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;
        const loadGroups = async () => {
            try {
                const snap = await getDocs(collection(db, "peerGroups"));
                if (!isMounted) return;
                const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setGroups(data);
            } catch (err) {
                setError("Failed to load groups. Please try again.");
                // eslint-disable-next-line no-console
                console.error(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadGroups();
        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return <div className="p-6 text-gray-600">Loading groups…</div>;
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-red-600 mb-3">{error}</div>
                <button className="px-4 py-2 bg-gray-900 text-white rounded" onClick={() => window.location.reload()}>Reload</button>
            </div>
        );
    }

    // Custom SVG Icons
    const icons = {
        users: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        heart: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
        ),
        leaf: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
        ),
        sun: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
            </svg>
        ),
        star: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
        shield: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
        ),
        sparkles: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                <path d="M5 3v4" />
                <path d="M9 3v4" />
                <path d="M3 5h4" />
                <path d="M3 9h4" />
            </svg>
        ),
        message: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        )
    };

    // Deterministic color generator based on string
    const getGradient = (str) => {
        const gradients = [
            "from-blue-400 to-cyan-300",
            "from-purple-400 to-pink-300",
            "from-green-400 to-emerald-300",
            "from-orange-400 to-amber-300",
            "from-rose-400 to-red-300",
            "from-indigo-400 to-violet-300",
            "from-teal-400 to-green-300",
            "from-fuchsia-400 to-purple-300"
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return gradients[Math.abs(hash) % gradients.length];
    };

    // Deterministic icon selector
    const getIcon = (str) => {
        const iconKeys = Object.keys(icons);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return icons[iconKeys[Math.abs(hash) % iconKeys.length]];
    };

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

            <div className="relative z-10 p-6 pt-20 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-light text-gray-900">Peer Support <span className="font-semibold text-emerald-800">Groups</span></h2>
                        <p className="text-gray-600 mt-1">Find your community and grow together</p>
                    </div>
                </div>

                {groups.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No groups available yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {groups.map((g) => {
                            const gradient = getGradient(g.name || g.id);
                            const icon = getIcon(g.name || g.id);
                            return (
                                <Link
                                    key={g.id}
                                    to={`/groups/${g.id}`}
                                    className="group relative block rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                                >
                                    {/* Decorative Gradient Header */}
                                    <div className={`h-3 w-full bg-green-900`} />

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-xl bg-green-900 flex items-center justify-center text-white shadow-sm transform group-hover:scale-110 transition-transform duration-300`}>
                                                {icon}
                                            </div>
                                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 group-hover:bg-gray-100 transition-colors">
                                                Open
                                                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M9 18l6-6-6-6" />
                                                </svg>
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-900 transition-colors">
                                            {g.name || g.id}
                                        </h3>

                                        {g.description && (
                                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                                                {g.description}
                                            </p>
                                        )}

                                        <div className="flex items-center text-xs text-gray-400 font-medium">
                                            <span>View Community</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
