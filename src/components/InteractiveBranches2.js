import React, { useState, useEffect } from 'react';

const NaturalBranch = () => {
    const [birds, setBirds] = useState([]);

    useEffect(() => {
        const spawnBirds = () => {
            // Randomly spawn 1-3 birds
            const birdCount = Math.floor(Math.random() * 3) + 1;
            const newBirds = [];

            for (let i = 0; i < birdCount; i++) {
                const fromLeft = Math.random() > 0.5;
                const newBird = {
                    id: Date.now() + i,
                    startX: fromLeft ? -50 : window.innerWidth + 50,
                    startY: Math.random() * window.innerHeight * 0.7,
                    endX: fromLeft ? window.innerWidth + 50 : -50,
                    endY: Math.random() * window.innerHeight * 0.7,
                    duration: 480,
                    delay: i * 0.5 // Slight delay between birds in a group
                };
                newBirds.push(newBird);

                setTimeout(() => {
                    setBirds(prev => prev.filter(bird => bird.id !== newBird.id));
                }, (newBird.duration + newBird.delay) * 1000);
            }

            setBirds(prev => [...prev, ...newBirds]);
        };

        const interval = setInterval(spawnBirds, 3000 + Math.random() * 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-screen bg-gradient-to-b from-sky-200 to-sky-100 overflow-hidden">
            {birds.map(bird => (
                <div
                    key={bird.id}
                    className="absolute"
                    style={{
                        left: `${bird.startX}px`,
                        top: `${bird.startY}px`,
                        animation: `fly-${bird.id} ${bird.duration}s linear ${bird.delay}s forwards`
                    }}
                >
                    <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                        <g className="wing-flap">
                            <path d="M2 8 Q 6 4, 12 8 Q 18 4, 22 8" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none" />
                        </g>
                    </svg>
                    <style>{`
                        @keyframes fly-${bird.id} {
                            from { transform: translate(0, 0); }
                            to { transform: translate(${bird.endX - bird.startX}px, ${bird.endY - bird.startY}px); }
                        }
                        @keyframes wingFlap {
                            0%, 100% { transform: scaleY(1); }
                            50% { transform: scaleY(0.6); }
                        }
                        .wing-flap {
                            animation: wingFlap 0.3s ease-in-out infinite;
                            transform-origin: center;
                        }
                    `}</style>
                </div>
            ))}

            {/* First Branch cluster */}
            <div className="absolute right-120 -top-4" style={{ width: '280px', height: '800px' }}>
                <svg viewBox="0 0 280 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <defs>
                        <linearGradient id="bark" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#5a4a20" />
                            <stop offset="50%" stopColor="#7a6830" />
                            <stop offset="100%" stopColor="#5a4a20" />
                        </linearGradient>
                    </defs>

                    <style>{`
            @keyframes gentleSway {
              0%, 100% { transform: translateX(0px) rotate(0deg); }
              50% { transform: translateX(4px) rotate(0.3deg); }
            }
            .main-branch { animation: gentleSway 7s ease-in-out infinite; transform-origin: 140px 0; }
            
            @keyframes strandSway1 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(1.5deg); } }
            @keyframes strandSway2 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-1deg); } }
            @keyframes strandSway3 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(2deg); } }
            
            .strand-1 { animation: strandSway1 5s ease-in-out infinite; }
            .strand-2 { animation: strandSway2 6s ease-in-out 0.3s infinite; }
            .strand-3 { animation: strandSway3 5.5s ease-in-out 0.7s infinite; }
            .strand-4 { animation: strandSway1 6.5s ease-in-out 1s infinite; }
            .strand-5 { animation: strandSway2 5.8s ease-in-out 0.5s infinite; }
            .strand-6 { animation: strandSway3 6.2s ease-in-out 0.2s infinite; }
            .strand-7 { animation: strandSway1 5.3s ease-in-out 0.8s infinite; }
            .strand-8 { animation: strandSway2 6.8s ease-in-out 0.4s infinite; }
          `}</style>

                    <g className="main-branch">
                        {/* Main branch - full length, thinner */}
                        <path d="M 140 0 C 138 50, 135 120, 130 200 C 125 280, 120 380, 115 480 C 110 540, 108 570, 105 600"
                            stroke="url(#bark)" strokeWidth="4" strokeLinecap="round" fill="none" />
                        <path d="M 140 0 C 138 50, 135 120, 130 200 C 125 280, 120 380, 115 480 C 110 540, 108 570, 105 600"
                            stroke="#8a7840" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />

                        {/* Strand 1 - long drooping strand with leaves at varied heights */}
                        <g className="strand-1" style={{ transformOrigin: '130px 100px' }}>
                            <path d="M 130 100 C 135 140, 140 200, 138 280 C 136 360, 130 440, 125 520"
                                stroke="#6a5a28" strokeWidth="2" strokeLinecap="round" fill="none" />
                            {/* Leaves at varied heights */}
                            <path d="M 138 125 Q 148 132, 152 152 Q 147 148, 134 136" fill="#4ade80" opacity="0.9" />
                            <path d="M 134 155 Q 118 165, 112 190 Q 117 183, 132 165" fill="#22c55e" opacity="0.85" />
                            <path d="M 137 205 Q 154 215, 162 245 Q 152 236, 139 218" fill="#4ade80" opacity="0.9" />
                            <path d="M 138 260 Q 120 275, 112 310 Q 120 298, 136 278" fill="#22c55e" opacity="0.85" />
                            <path d="M 137 295 Q 155 310, 165 352 Q 152 338, 139 312" fill="#4ade80" opacity="0.9" />
                            <path d="M 135 355 Q 115 375, 105 420 Q 118 400, 133 372" fill="#22c55e" opacity="0.85" />
                            <path d="M 132 390 Q 150 408, 158 455 Q 145 438, 134 410" fill="#4ade80" opacity="0.9" />
                            <path d="M 128 465 Q 108 490, 98 545 Q 112 518, 126 485" fill="#22c55e" opacity="0.85" />
                        </g>

                        {/* Strand B - varied heights */}
                        <g className="strand-1" style={{ transformOrigin: '125px 70px' }}>
                            <path d="M 125 70 C 110 120, 90 200, 82 300 C 74 400, 72 470, 70 530"
                                stroke="#6a5a28" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                            <path d="M 115 105 Q 98 132, 88 188 Q 105 158, 113 122" fill="#4ade80" opacity="0.9" />
                            <path d="M 98 205 Q 115 252, 125 328 Q 108 282, 100 228" fill="#22c55e" opacity="0.85" />
                            <path d="M 86 305 Q 68 362, 58 445 Q 78 398, 84 332" fill="#4ade80" opacity="0.9" />
                            <path d="M 76 435 Q 92 502, 98 585 Q 82 535, 78 465" fill="#22c55e" opacity="0.85" />
                        </g>

                        {/* Strand 6 - varied heights */}
                        <g className="strand-6" style={{ transformOrigin: '132px 160px' }}>
                            <path d="M 132 160 C 148 210, 162 280, 168 380 C 174 480, 175 560, 176 620"
                                stroke="#6a5a28" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                            <path d="M 142 195 Q 160 222, 172 278 Q 155 248, 144 212" fill="#4ade80" opacity="0.88" />
                            <path d="M 155 295 Q 138 335, 128 410 Q 148 365, 153 318" fill="#22c55e" opacity="0.82" />
                            <path d="M 165 385 Q 182 428, 192 510 Q 172 462, 167 408" fill="#4ade80" opacity="0.88" />
                            <path d="M 172 510 Q 152 568, 145 640 Q 165 595, 170 535" fill="#22c55e" opacity="0.82" />
                        </g>

                        {/* Strand A - varied heights */}
                        <g className="strand-2" style={{ transformOrigin: '128px 90px' }}>
                            <path d="M 128 90 C 140 140, 155 210, 160 300 C 165 390, 162 460, 158 520"
                                stroke="#6a5a28" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                            <path d="M 138 125 Q 158 148, 170 198 Q 152 172, 140 142" fill="#4ade80" opacity="0.9" />
                            <path d="M 150 210 Q 130 248, 120 315 Q 142 275, 148 232" fill="#22c55e" opacity="0.85" />
                            <path d="M 158 285 Q 178 325, 190 398 Q 170 358, 160 308" fill="#4ade80" opacity="0.9" />
                            <path d="M 162 385 Q 142 438, 132 520 Q 155 472, 160 410" fill="#22c55e" opacity="0.85" />
                        </g>

                        {/* Strand B - varied heights */}
                        <g className="strand-1" style={{ transformOrigin: '125px 70px' }}>
                            <path d="M 125 70 C 110 120, 90 200, 82 300 C 74 400, 72 470, 70 530"
                                stroke="#6a5a28" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                            <path d="M 115 105 Q 98 132, 88 188 Q 105 158, 113 122" fill="#4ade80" opacity="0.9" />
                            <path d="M 98 205 Q 115 252, 125 328 Q 108 282, 100 228" fill="#22c55e" opacity="0.85" />
                            <path d="M 86 305 Q 68 362, 58 445 Q 78 398, 84 332" fill="#4ade80" opacity="0.9" />
                            <path d="M 76 435 Q 92 502, 98 585 Q 82 535, 78 465" fill="#22c55e" opacity="0.85" />
                        </g>

                        {/* Strand C - varied heights */}
                        <g className="strand-3" style={{ transformOrigin: '130px 110px' }}>
                            <path d="M 130 110 C 120 160, 105 240, 100 340 C 95 440, 95 500, 95 560"
                                stroke="#6a5a28" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                            <path d="M 122 148 Q 105 182, 95 252 Q 115 212, 120 168" fill="#4ade80" opacity="0.88" />
                            <path d="M 105 285 Q 122 342, 130 432 Q 112 378, 107 312" fill="#22c55e" opacity="0.82" />
                            <path d="M 98 410 Q 80 478, 72 565 Q 92 515, 96 442" fill="#4ade80" opacity="0.88" />
                        </g>
                    </g>
                </svg>
            </div>

            {/* Second Branch cluster - offset left */}
            <div className="absolute right-24 -top-4" style={{ width: '240px', height: '600px' }}>
                <svg viewBox="0 0 240 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <style>{`
            @keyframes gentleSway2 {
              0%, 100% { transform: translateX(0px) rotate(0deg); }
              50% { transform: translateX(-3px) rotate(-0.2deg); }
            }
            .main-branch-2 { animation: gentleSway2 8s ease-in-out 0.5s infinite; transform-origin: 120px 0; }
          `}</style>

                    <g className="main-branch-2">
                        {/* Main branch - full length, thinner */}
                        <path d="M 120 0 C 122 40, 125 100, 128 180 C 131 260, 130 360, 125 440 C 120 490, 118 510, 115 520"
                            stroke="url(#bark)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                        <path d="M 120 0 C 122 40, 125 100, 128 180 C 131 260, 130 360, 125 440 C 120 490, 118 510, 115 520"
                            stroke="#8a7840" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />

                        {/* Strand A - varied heights */}
                        <g className="strand-2" style={{ transformOrigin: '128px 90px' }}>
                            <path d="M 128 90 C 140 140, 155 210, 160 300 C 165 390, 162 460, 158 520"
                                stroke="#6a5a28" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                            <path d="M 138 125 Q 158 148, 170 198 Q 152 172, 140 142" fill="#4ade80" opacity="0.9" />
                            <path d="M 150 210 Q 130 248, 120 315 Q 142 275, 148 232" fill="#22c55e" opacity="0.85" />
                            <path d="M 158 285 Q 178 325, 190 398 Q 170 358, 160 308" fill="#4ade80" opacity="0.9" />
                            <path d="M 162 385 Q 142 438, 132 520 Q 155 472, 160 410" fill="#22c55e" opacity="0.85" />
                        </g>

                        {/* Strand B - varied heights */}
                        <g className="strand-1" style={{ transformOrigin: '125px 70px' }}>
                            <path d="M 125 70 C 110 120, 90 200, 82 300 C 74 400, 72 470, 70 530"
                                stroke="#6a5a28" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                            <path d="M 115 105 Q 98 132, 88 188 Q 105 158, 113 122" fill="#4ade80" opacity="0.9" />
                            <path d="M 98 205 Q 115 252, 125 328 Q 108 282, 100 228" fill="#22c55e" opacity="0.85" />
                            <path d="M 86 305 Q 68 362, 58 445 Q 78 398, 84 332" fill="#4ade80" opacity="0.9" />
                            <path d="M 76 435 Q 92 502, 98 585 Q 82 535, 78 465" fill="#22c55e" opacity="0.85" />
                        </g>

                        {/* Strand C - varied heights */}
                        <g className="strand-3" style={{ transformOrigin: '130px 110px' }}>
                            <path d="M 130 110 C 120 160, 105 240, 100 340 C 95 440, 95 500, 95 560"
                                stroke="#6a5a28" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                            <path d="M 122 148 Q 105 182, 95 252 Q 115 212, 120 168" fill="#4ade80" opacity="0.88" />
                            <path d="M 105 285 Q 122 342, 130 432 Q 112 378, 107 312" fill="#22c55e" opacity="0.82" />
                            <path d="M 98 410 Q 80 478, 72 565 Q 92 515, 96 442" fill="#4ade80" opacity="0.88" />
                        </g>

                        {/* Strand D - wispy, varied heights */}
                        <g className="strand-5" style={{ transformOrigin: '122px 55px' }}>
                            <path d="M 122 55 C 100 105, 75 180, 62 280 C 49 380, 45 460, 42 540"
                                stroke="#6a5a28" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                            <path d="M 102 98 Q 82 135, 70 208 Q 92 165, 100 118" fill="#4ade80" opacity="0.85" />
                            <path d="M 68 275 Q 52 345, 45 445 Q 62 385, 66 305" fill="#22c55e" opacity="0.8" />
                        </g>

                        {/* Strand E - far right wispy, varied heights */}
                        <g className="strand-6" style={{ transformOrigin: '132px 130px' }}>
                            <path d="M 132 130 C 152 185, 175 270, 185 380 C 195 490, 195 550, 195 600"
                                stroke="#6a5a28" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                            <path d="M 152 182 Q 172 225, 185 312 Q 165 265, 154 205" fill="#4ade80" opacity="0.85" />
                            <path d="M 182 385 Q 198 462, 202 565 Q 188 508, 184 418" fill="#22c55e" opacity="0.8" />
                        </g>
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default NaturalBranch;