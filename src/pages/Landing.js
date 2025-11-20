// src/pages/Landing.js
import React from "react";
import { Header } from "../components/Header";
import { MainContent } from "../components/MainContent";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left cool gradient */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(59, 130, 246, 0.1) 60%, transparent 100%)"
          }}
        ></div>

        {/* Upper-right warm glow */}
        <div
          className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, rgba(244, 114, 182, 0.1) 60%, transparent 100%)"
          }}
        ></div>

        {/* Bottom-right accent */}
        <div
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.1) 60%, transparent 100%)"
          }}
        ></div>
      </div>

      {/* Grainy texture overlay */}
      <div className="absolute inset-0 pointer-events-none grainy-texture opacity-20"></div>

      <Header />
      <MainContent />
    </div>
  );
};

export default Landing;


