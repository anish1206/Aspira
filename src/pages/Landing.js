// src/pages/Landing.js
import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  const canvasRef = useRef(null);
  const particles = useMemo(() => Array.from({ length: 100 }).map(() => ({
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
  })), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const stars = [];
    const STAR_COUNT = 250; // density

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * DPR);
      canvas.height = Math.floor(window.innerHeight * DPR);
      ctx.scale(DPR, DPR);
    };

    const createStars = () => {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: Math.random() * 1.5 + 0.2,
          speed: Math.random() * 0.6 + 0.2,
          twinkle: Math.random() * 0.8 + 0.2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // soft vignette gradient
      const g = ctx.createRadialGradient(
        window.innerWidth / 2,
        window.innerHeight / 2,
        0,
        window.innerWidth / 2,
        window.innerHeight / 2,
        Math.max(window.innerWidth, window.innerHeight)
      );
      g.addColorStop(0, "rgba(10, 12, 26, 0)");
      g.addColorStop(1, "rgba(10, 12, 26, 0.6)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // animate stars
      for (const s of stars) {
        s.y += s.speed * 0.5; // gentle drift downward
        if (s.y > window.innerHeight + 2) {
          s.y = -2;
          s.x = Math.random() * window.innerWidth;
        }
        const alpha = 0.5 + Math.sin((Date.now() * 0.002 + s.x) * s.twinkle) * 0.3;
        ctx.beginPath();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#ffffff";
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      resize();
      createStars();
    };

    resize();
    createStars();
    draw();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="landing-root">
      <canvas ref={canvasRef} className="landing-canvas" />
      {/* Pulsing particles overlay */}
      <div className="particles-layer">
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Soft gradient overlays */}
      <div className="gradient-radial" />
      <div className="gradient-veil" />

      <div className="landing-overlay">
        <header className="landing-header">
          <div className="brand">
            <div className="brand-mark">M</div>
            <div className="brand-name">MindSync</div>
          </div>
          <div className="header-actions">
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/login" className="btn btn-primary">Sign Up</Link>
          </div>
        </header>
        <main className="hero">
          <h1 className="hero-title">Welcome to</h1>
          <h2 className="hero-brand">M<span className="italic">i</span>ndS<span className="italic">y</span>nc</h2>
          <p className="hero-tag">Where Thoughts Meet Intelligence</p>
          <div className="hero-ctas">
            <Link to="/login" className="btn btn-primary">Get Started Now</Link>
            <a href="#features" className="btn btn-ghost">Learn More</a>
          </div>
          <section id="features" className="features">
            <div className="feature">
              <div className="feature-icon">∞</div>
              <div className="feature-title">Infinite Connections</div>
              <div className="feature-desc">Seamless mind linking</div>
            </div>
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <div className="feature-title">Instant Sync</div>
              <div className="feature-desc">Real-time thought sharing</div>
            </div>
            <div className="feature">
              <div className="feature-icon">🧠</div>
              <div className="feature-title">AI Enhanced</div>
              <div className="feature-desc">Intelligent collaboration</div>
            </div>
          </section>
        </main>
        {/* Floating geometric shapes */}
        <div className="shape shape-circle" />
        <div className="shape shape-diamond" />
        <div className="shape shape-square" />
      </div>
    </div>
  );
};

export default Landing;


