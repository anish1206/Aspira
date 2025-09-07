// src/pages/Dashboard.js
import React from "react";
import { Link } from "react-router-dom";

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
    )
  },
    {
    title: "AI Chat",
    description: "Continue your supportive conversation.",
    to: "/chat",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M7 11h5M7 15h3" strokeLinecap="round" />
        <path d="M12 21c-1.93-1.31-3.97-2-6-2-1.1 0-2.21.15-3.3.46a.6.6 0 0 1-.75-.58V6.5A2.5 2.5 0 0 1 4.5 4H15a2.5 2.5 0 0 1 2.5 2.5v5.55" />
        <path d="M17 17.5v3.77c0 .46.5.73.88.48l2.2-1.47a.56.56 0 0 1 .62 0l2.2 1.47c.38.25.88-.02.88-.48V13.5A2.5 2.5 0 0 0 21.5 11H19" />
      </svg>
    )
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
    )
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
    )
  }
];

export default function Dashboard() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Background gradients similar to landing */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-60 grainy-texture" style={{background: 'radial-gradient(circle, #0f2027 0%, #203a43 40%, rgba(44,83,100,0.25) 70%, transparent 100%)'}} />
        <div className="absolute top-1/3 -right-40 w-[560px] h-[560px] rounded-full opacity-80 grainy-texture" style={{background: 'radial-gradient(circle, #b91c1c 0%, #dc2626 25%, #f97316 45%, #fbbf24 65%, rgba(251,191,36,0.25) 80%, transparent 100%)'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20" style={{background: 'radial-gradient(ellipse, rgba(99,102,241,0.3) 0%, rgba(59,130,246,0.18) 55%, transparent 100%)'}} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-24 m-14">
        <h1 className="text-4xl md:text-5xl font-light leading-tight text-foreground mb-10">
          Welcome back <span className="font-semibold">to your space</span>
        </h1>

        <div className="grid md:grid-cols-2 gap-10">
          {features.map((f) => (
            <Link
              key={f.title}
              to={f.to}
              className="group relative overflow-hidden rounded-3xl p-[2px] transition-transform hover:scale-[1.015] active:scale-[0.985]"
            >
              {/* Outer gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 opacity-40 group-hover:opacity-70 blur-sm transition-opacity" />
              <div className="relative bg-white/70 dark:bg-white/10 backdrop-blur-xl rounded-3xl h-full w-full px-8 py-8 flex items-start gap-6 border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.05)] group-hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] transition-shadow">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="text-xl font-semibold tracking-tight mb-2 text-foreground">{f.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:gap-2 transition-all">
                    Open
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17 17 7M7 7h10v10" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


