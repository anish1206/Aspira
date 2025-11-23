// src/pages/Dashboard.js
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth';
import InteractiveBranch from '../components/InteractiveBranch';

const features = [
    {
        title: "Mood Check-in",
        description: "Quickly log how you're feeling today.",
        to: "/checkins",
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9Z" />
                <path d="M8.5 14c.7 1.2 2.04 2 3.5 2s2.8-.8 3.5-2" strokeLinecap="round" />
                <path d="M9 10h.01M15 10h.01" strokeLinecap="round" />
            </svg>
        ),
        color: "from-emerald-400 to-teal-500",
        shadow: "shadow-emerald-500/20"
    },
    {
        title: "AI Companion",
        description: "Continue your supportive conversation.",
        to: "/chat",
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M7 11h5M7 15h3" strokeLinecap="round" />
                <path d="M12 21c-1.93-1.31-3.97-2-6-2-1.1 0-2.21.15-3.3.46a.6.6 0 0 1-.75-.58V6.5A2.5 2.5 0 0 1 4.5 4H15a2.5 2.5 0 0 1 2.5 2.5v5.55" />
                <path d="M17 17.5v3.77c0 .46.5.73.88.48l2.2-1.47a.56.56 0 0 1 .62 0l2.2 1.47c.38.25.88-.02.88-.48V13.5A2.5 2.5 0 0 0 21.5 11H19" />
            </svg>
        ),
        color: "from-teal-400 to-cyan-500",
        shadow: "shadow-teal-500/20"
    },
    {
        title: "Groups",
        description: "See your groups and latest messages.",
        to: "/groups",
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M7 10.5a3.5 3.5 0 1 1 3.5 3.5" />
                <path d="M3 20a5 5 0 0 1 5-5h2c.6 0 1.18.11 1.71.31M16 11a3.5 3.5 0 1 0-3.5-3.5" />
                <path d="M19 21a5 5 0 0 0-5-5h-.5" strokeLinecap="round" />
            </svg>
        ),
        color: "from-green-400 to-emerald-500",
        shadow: "shadow-green-500/20"
    },
    {
        title: "Diary",
        description: "Write a private reflection.",
        to: "/diary",
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 5c0-1.1.9-2 2-2h9.5c1.1 0 2 .9 2 2v14.5a.5.5 0 0 1-.82.38l-2.68-2.23a2 2 0 0 0-1.28-.47H7c-1.1 0-2-.9-2-2V5Z" />
                <path d="M9 8h6M9 12h3" strokeLinecap="round" />
            </svg>
        ),
        color: "from-lime-400 to-green-500",
        shadow: "shadow-lime-500/20"
    }
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", updateMousePosition);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
        };
    }, []);

    return (
        <motion.div
            className="fixed top-0 left-0 w-4 h-4 bg-gray-400 rounded-full pointer-events-none z-50 shadow-sm border border-white/20"
            animate={{
                x: mousePosition.x - 8,
                y: mousePosition.y - 8,
            }}
            transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                mass: 0.2
            }}
        />
    );
};

const DailyAffirmation = ({ onClose }) => {
    const affirmations = [
        "You are capable of amazing things.",
        "Every day is a fresh start.",
        "You are stronger than you know.",
        "Believe in yourself and all that you are.",
        "Your potential is endless.",
        "Small steps lead to big changes.",
        "You are worthy of happiness and love.",
        "Today is a gift, that's why it's called the present.",
        "You have the power to create change.",
        "Trust the process and be patient with yourself."
    ];

    const [quote, setQuote] = React.useState("");

    React.useEffect(() => {
        const randomQuote = affirmations[Math.floor(Math.random() * affirmations.length)];
        setQuote(randomQuote);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/50 relative overflow-hidden text-center"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-6 text-4xl">✨</div>

                <h3 className="text-2xl font-bold text-gray-800 mb-4">Daily Affirmation</h3>

                <p className="text-xl text-emerald-800 font-medium italic mb-8 leading-relaxed">
                    "{quote}"
                </p>

                <button
                    onClick={onClose}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                    I Receive This
                </button>
            </motion.div>
        </motion.div>
    );
};

export default function Dashboard() {
    const { user } = useAuth();
    const [showAffirmation, setShowAffirmation] = React.useState(true);
    const [bookings, setBookings] = React.useState([]);
    const [loadingBookings, setLoadingBookings] = React.useState(true);

    React.useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;
            try {
                // Removed orderBy to avoid needing a composite index immediately
                const q = query(
                    collection(db, 'bookings'),
                    where('userId', '==', user.uid)
                );
                const querySnapshot = await getDocs(q);
                const bookedSessions = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Sort client-side
                bookedSessions.sort((a, b) => {
                    const timeA = a.startTime.seconds || 0;
                    const timeB = b.startTime.seconds || 0;
                    return timeA - timeB;
                });

                console.log("Fetched bookings:", bookedSessions);
                setBookings(bookedSessions);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoadingBookings(false);
            }
        };

        fetchBookings();
    }, [user]);

    return (
        <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-green-50/50 to-white">
            {showAffirmation && <DailyAffirmation onClose={() => setShowAffirmation(false)} />}
            <InteractiveBranch />

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

            <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-24 my-10 md:m-14">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-light leading-tight text-gray-900 mb-2">
                        Welcome back <span className="font-semibold text-emerald-800">to Aspira</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl">
                        A space to grow, reflect, and find your balance.
                    </p>
                </motion.div>

                {/* Bookings Section */}
                {user && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">📅</span> Your Upcoming Sessions
                        </h2>

                        {loadingBookings ? (
                            <div className="text-gray-500 italic">Loading sessions...</div>
                        ) : bookings.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bookings.map((booking) => {
                                    const startTime = booking.startTime.seconds ? new Date(booking.startTime.seconds * 1000) : new Date(booking.startTime);
                                    const endTime = booking.endTime.seconds ? new Date(booking.endTime.seconds * 1000) : new Date(booking.endTime);

                                    return (
                                        <div key={booking.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{booking.mentorName}</h3>
                                                    <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                                        Confirmed
                                                    </span>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-xl">
                                                    👤
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <span>🗓️</span>
                                                    <span>{startTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>⏰</span>
                                                    <span>
                                                        {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                        {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-100">
                                <p className="text-gray-500 mb-4">You haven't booked any sessions yet.</p>
                                <Link to="/mentors" className="text-emerald-600 font-medium hover:underline">
                                    Browse Mentors &rarr;
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid md:grid-cols-2 gap-8"
                >
                    {features.map((f) => (
                        <motion.div key={f.title} variants={item}>
                            <Link
                                to={f.to}
                                className="group relative block h-full "
                            >
                                <div className="relative h-full bg-white rounded-3xl p-8 border border-green-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                    {/* Hover Gradient Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                    <div className="flex items-start gap-6 relative z-10">
                                        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center shadow-lg ${f.shadow} group-hover:scale-110 transition-transform duration-300`}>
                                            {f.icon}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                                                {f.title}
                                            </h3>
                                            <p className="text-gray-500 leading-relaxed mb-4">
                                                {f.description}
                                            </p>

                                            <div className="flex items-center text-sm font-medium text-emerald-600 group-hover:translate-x-1 transition-transform">
                                                <span>Open</span>
                                                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
