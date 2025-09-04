// src/pages/Landing.js
import React from "react";
import { Header } from "../components/Header";
import { MainContent } from "../components/MainContent";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0">
        {/* Left gradient - dark teal */}
        <div 
          className="absolute top-1/4 left-0 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-60 grainy-texture"
          style={{
            background: "radial-gradient(circle, #0f2027 0%, #203a43 30%, #2c5364 60%, rgba(44, 83, 100, 0.3) 80%, transparent 100%)"
          }}
        ></div>
        
        {/* Right gradient - reddish orange */}
        <div 
          className="absolute -top-1/2 -right-1/2 translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-80 grainy-texture"
          style={{
            background: "radial-gradient(circle, #b91c1c 0%, #dc2626 20%, #f97316 40%, #fbbf24 60%, rgba(251, 191, 36, 0.3) 80%, transparent 100%)"
          }}
        ></div>
        
        {/* Additional subtle gradient for depth */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, rgba(99, 102, 241, 0.3) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)"
          }}
        ></div>
      </div>

      <Header />
      <MainContent />
    </div>
  );
};

export default Landing;


