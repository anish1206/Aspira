// src/components/MainContent.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Typewriter with optional delete/repeat and blinking caret
const Typewriter = ({
    text,
    speed = 170, // slower typing
    deleteSpeed = 80,
    startDelay = 300,
    pause = 800,
    repeat = 1,
    deleteOnFinish = false,
}) => {
    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState("idle"); // idle -> typing -> deleting -> done
    const [loops, setLoops] = useState(0);

    useEffect(() => {
        if (phase === "idle") {
            const t = setTimeout(() => setPhase("typing"), startDelay);
            return () => clearTimeout(t);
        }

        if (phase === "typing") {
            if (index < text.length) {
                const t = setTimeout(() => setIndex(index + 1), speed);
                return () => clearTimeout(t);
            }
            // Reached full text
            if (deleteOnFinish) {
                const t = setTimeout(() => setPhase("deleting"), pause);
                return () => clearTimeout(t);
            }
            setPhase("done");
            return;
        }

        if (phase === "deleting") {
            if (index > 0) {
                const t = setTimeout(() => setIndex(index - 1), deleteSpeed);
                return () => clearTimeout(t);
            }
            // Finished deleting one cycle
            if (loops + 1 >= repeat) {
                setPhase("done");
                return;
            }
            setLoops(loops + 1);
            const t = setTimeout(() => setPhase("typing"), 300);
            return () => clearTimeout(t);
        }
    }, [phase, index, text, speed, deleteSpeed, pause, startDelay, loops, repeat, deleteOnFinish]);

    return (
        <span className="inline-flex items-center">
            <span className="font-berkeley-mono font-bold bg-gradient-to-r from-primary via-blue-600 to-orange-500 bg-clip-text text-transparent">
                {text.slice(0, index)}
            </span>
            <span
                className="ml-1 w-[2px] h-[1em] bg-blue-500 align-middle animate-caret-blink"
                style={{ visibility: "visible" }}
            />
        </span>
    );
};

export const MainContent = () => {
    const featureItems = [
        {
            title: "AI Mental Health Assistant",
            description:
                "Get instant support with an empathetic AI companion that listens, understands, and offers science-backed suggestions whenever you need them.",
            iconBg: "from-blue-500 to-purple-600",
            icon: (
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 3c3.866 0 7 3.134 7 7 0 1.676-.586 3.214-1.564 4.424a1.5 1.5 0 0 0-.228 1.427l.56 1.681a1.25 1.25 0 0 1-1.19 1.644H7.422a1.25 1.25 0 0 1-1.19-1.644l.56-1.681a1.5 1.5 0 0 0-.228-1.427A6.978 6.978 0 0 1 5 10c0-3.866 3.134-7 7-7Z" />
                    <path d="M9.5 10.5c.5.5 1.5.5 2 0s1.5-.5 2 0" strokeLinecap="round" />
                    <path d="M9 14h6" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            title: "Supportive Community",
            description:
                "Share your journey inside safe, moderated circles and receive encouragement from peers and mentors who genuinely care.",
            iconBg: "from-green-500 to-teal-600",
            icon: (
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 7a5 5 0 1 1 10 0v1h1.5A2.5 2.5 0 0 1 21 10.5v2A2.5 2.5 0 0 1 18.5 15H18l-.794 1.986a1.25 1.25 0 0 1-1.162.814H7.956a1.25 1.25 0 0 1-1.162-.814L6 15h-.5A2.5 2.5 0 0 1 3 12.5v-2A2.5 2.5 0 0 1 5.5 8H7V7Z" />
                    <path d="M9 18h6" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            title: "Smart Mood Tracking",
            description:
                "Visualize patterns, highlight breakthroughs, and keep tabs on the habits that boost your wellbeing with delightful charts.",
            iconBg: "from-orange-500 to-red-600",
            icon: (
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="4" y="4" width="16" height="16" rx="3" />
                    <path d="M7 15l3-3 2.5 2 4-5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="10" cy="12" r="0.75" fill="currentColor" stroke="none" />
                    <circle cx="12.5" cy="14" r="0.75" fill="currentColor" stroke="none" />
                    <circle cx="16.5" cy="9" r="0.75" fill="currentColor" stroke="none" />
                </svg>
            ),
        },
    ];

    const renderFeatureCard = (feature, alignment = "center") => {
        const alignmentClasses =
            alignment === "left"
                ? "md:text-right md:items-end"
                : alignment === "right"
                    ? "md:text-left md:items-start"
                    : "";

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`bg-card/60 backdrop-blur-md border border-border/60 rounded-2xl p-8 md:p-10 transition-all duration-300 hover:bg-card/80 shadow-[0_12px_40px_-12px_rgba(15,30,50,0.35)] flex flex-col gap-4 ${alignmentClasses}`}
            >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center text-white shadow-lg`}>{feature.icon}</div>
                <h3 className="text-2xl font-semibold text-foreground tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
        );
    };

    return (
        <div className="relative z-10 flex-1 flex flex-col">
            <main className="flex-1 flex flex-col items-center px-6 pt-10 pb-20">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Hero Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-8xl font-pp-editorial font-light text-foreground mb-6 leading-tight"
                    >
                        Trans<i>f</i>orm Yo<i>u</i>r
                        <br />
                        Mental{" "}
                        <Typewriter text="Wellness" speed={170} deleteOnFinish={false} />
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Unlock the power of AI-driven mental health support, connect with caring peers,
                        and track your emotional journey with personalized insights.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                    >
                        <Link
                            to="/login"
                            className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground px-10 py-4 rounded-xl text-lg font-medium hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-xl w-full sm:w-auto text-center"
                        >
                            Start Your Journey
                        </Link>
                        <button className="text-foreground px-8 py-4 rounded-xl text-lg font-medium border border-border hover:bg-accent transition-all duration-200 backdrop-blur-sm w-full sm:w-auto">
                            Discover Features
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{
                        backgroundColor: "#d0fec2ff",
                        clipPath: "polygon(0 30%, 100% 0, 100% 70%, 0 100%)"
                    }}
                    className="mt-24 py-16 px-12 w-screen"
                >
                    <svg
                        viewBox="0 0 1200 120"
                        className="w-full h-auto"
                        style={{ transform: "rotate(-2deg)", overflow: "visible" }}
                    >
                        <text
                            x="50%"
                            y="60%"
                            textAnchor="middle"
                            className="text-4xl md:text-5xl font-bold tracking-widest"
                            style={{
                                fill: "#061c0dff",
                                stroke: "#061c0dff",
                                strokeWidth: "1",
                                fontSize: "clamp(2rem, 4vw, 3rem)",
                                fontWeight: "bold",
                                letterSpacing: "0.12em"
                            }}
                        >
                            Everything  you  need  to  feel supported
                        </text>
                    </svg>
                </motion.div>

                <div className="max-w-4xl mx-auto text-center w-full">
                    <section id="features" className="mt-24">
                        <div className="relative mt-16 max-w-5xl mx-auto">
                            <motion.div
                                initial={{ height: 0 }}
                                whileInView={{ height: "100%" }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="hidden md:block absolute inset-y-4 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-green-300 via-green-600 to-green-900 opacity-90"
                            ></motion.div>
                            <div className="space-y-14">
                                {featureItems.map((feature, index) => {
                                    const isRight = index % 2 === 0;
                                    return (
                                        <div key={feature.title} className="relative">
                                            <div className="md:hidden">
                                                {renderFeatureCard(feature)}
                                            </div>

                                            <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-10">
                                                <div className="hidden md:block">
                                                    {!isRight && renderFeatureCard(feature, "left")}
                                                </div>
                                                <div className="hidden md:flex flex-col items-center">
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        whileInView={{ scale: 1 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: 0.2 + (index * 0.2), type: "spring" }}
                                                        className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-900 border-4 border-white shadow-lg"
                                                    ></motion.span>
                                                    {index !== featureItems.length - 1 && (
                                                        <span className="flex-1 w-[2px] bg-gradient-to-b from-yellow-200 via-orange-200 to-pink-200"></span>
                                                    )}
                                                </div>
                                                <div className="hidden md:block">
                                                    {isRight && renderFeatureCard(feature, "right")}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section id="about" className="mt-24 max-w-4xl mx-auto text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-10 md:p-14 shadow-[0_24px_60px_-20px_rgba(15,30,50,0.35)]"
                        >
                            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 text-center">About Aspira</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Aspira blends compassionate design with trusted mental health practices. We bring together AI-guided reflections, supportive peers, and professional mentors so you can build lasting mental wellness habits at your own pace.
                            </p>
                            <div className="grid md:grid-cols-3 gap-6 mt-10 text-left">
                                {[
                                    { title: "Holistic", desc: "Structured check-ins, creative therapy, and community spaces aligned to your goals." },
                                    { title: "Personalized", desc: "Smart recommendations adapt to your mood trends and preferences." },
                                    { title: "Secure", desc: "Your reflections stay private, encrypted, and under your control." }
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                                        className="bg-white/10 border border-white/20 rounded-2xl p-6"
                                    >
                                        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                                        <p className="text-muted-foreground text-sm mt-2">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </section>

                    <section id="contact" className="mt-24 max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-10 md:p-14 shadow-[0_24px_60px_-20px_rgba(15,30,50,0.35)]"
                        >
                            <div className="grid md:grid-cols-2 gap-10 items-center">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-semibold text-foreground">Contact Us</h2>
                                    <p className="text-muted-foreground text-lg leading-relaxed mt-4">
                                        Have questions about Aspira, want to partner with us, or need help getting started? Our team is a message away.
                                    </p>
                                    <div className="mt-8 space-y-3 text-muted-foreground">
                                        <p><span className="text-foreground font-medium">Email:</span> aigen1344@gmail.com</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 border border-white/20 rounded-2xl p-8">
                                    <h3 className="text-xl font-semibold text-foreground mb-4">Stay in the loop</h3>
                                    <p className="text-muted-foreground mb-6">Get product updates, wellbeing tips, and invites to community events.</p>
                                    <form className="space-y-4">
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            className="w-full px-4 py-3 rounded-xl border border-border/70 bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-300/60"
                                        />
                                        <button type="button" className="w-full bg-gradient-to-r from-blue-400 to-orange-400 text-white font-medium py-3 rounded-xl hover:opacity-90 transition-all duration-200">
                                            Subscribe
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </section>
                </div>
            </main>

            <footer className="w-full mt-auto bg-card/40 backdrop-blur-xl border-t border-border/40">
                <div className="max-w-7xl mx-auto px-8 py-12">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
                        <div className="space-y-3 max-w-sm">
                            <span className="text-4xl jersey-15-regular text-foreground block">Aspira</span>
                            <p className="text-muted-foreground leading-relaxed">
                                Caring technology for everyday mental wellness. We’re building kinder tools that help you reflect, reconnect, and rise.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-left">
                            <div>
                                <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase mb-3">Explore</h4>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                                    <li><a href="#about" className="hover:text-foreground transition-colors">About</a></li>
                                    <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase mb-3">Product</h4>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li>Check-ins</li>
                                    <li>Mentor sessions</li>
                                    <li>Creative therapy</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase mb-3">Connect</h4>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li>aigen1344@gmail.com</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 border-t border-border/40 pt-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-xs text-muted-foreground">
                        <p>© {new Date().getFullYear()} Aspira. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                            <a href="#" className="hover:text-foreground transition-colors">Accessibility</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
};
