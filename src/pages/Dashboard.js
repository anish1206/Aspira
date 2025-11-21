// src/pages/Dashboard.js
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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

export default function Dashboard() {
    return (
        <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-green-50/50 to-white">
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

            <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-10 pb-24 my-10 md:m-14">
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
                                className="group relative block h-full cursor-none"
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
