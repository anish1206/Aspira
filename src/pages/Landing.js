// src/pages/Landing.js
import React from "react";
import { Header } from "../components/Header";
import { MainContent } from "../components/MainContent";
import { motion } from "framer-motion";

const Landing = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Top-left cool gradient */}
                <motion.div
                    animate={{
                        x: [0, 30, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-80 grainy-texture"
                    style={{
                        background: "radial-gradient(circle, rgba(1, 103, 146, 0.93) 0%, rgba(23, 187, 18, 0.57) 60%, transparent 100%)"
                    }}
                ></motion.div>

                {/* Upper-right warm glow */}
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                    className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full opacity-80"
                    style={{
                        background: "radial-gradient(circle, rgba(255, 102, 26, 1) 0%, rgba(255, 72, 36, 1) 60%, transparent 100%)"
                    }}
                ></motion.div>
            </div>

            {/* Grainy texture overlay */}
            <div className="absolute inset-0 pointer-events-none grainy-texture opacity-20"></div>

            <Header />
            <MainContent />
        </div>
    );
};

export default Landing;


