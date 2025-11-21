import React, { useState } from 'react';
import { motion } from 'framer-motion';

const InteractiveBranch = () => {
    const [branch1Offset, setBranch1Offset] = useState({ x: 0, y: 0 });
    const [branch2Offset, setBranch2Offset] = useState({ x: 0, y: 0 });
    const [isDragging1, setIsDragging1] = useState(false);
    const [isDragging2, setIsDragging2] = useState(false);

    // Calculate the curve based on drag offset
    const getBranchPath1 = (offset) => {
        const baseX = 100;
        const tipX = 105 + offset.x;
        const tipY = 400 + offset.y;
        const midX = baseX + (offset.x * 0.5);
        const midY = 320 + (offset.y * 0.5);

        return `M ${baseX} 0 Q ${95 + offset.x * 0.2} ${80 + offset.y * 0.2}, ${90 + offset.x * 0.3} ${160 + offset.y * 0.3} Q ${85 + offset.x * 0.4} ${240 + offset.y * 0.4}, ${midX} ${midY} Q ${100 + offset.x * 0.7} ${360 + offset.y * 0.7}, ${tipX} ${tipY}`;
    };

    const getBranchPath2 = (offset) => {
        const baseX = 100;
        const tipX = 95 + offset.x;
        const tipY = 460 + offset.y;
        const midX = baseX + (offset.x * 0.5);
        const midY = 360 + (offset.y * 0.5);

        return `M ${baseX} 0 Q ${105 + offset.x * 0.2} ${90 + offset.y * 0.2}, ${110 + offset.x * 0.3} ${180 + offset.y * 0.3} Q ${115 + offset.x * 0.4} ${270 + offset.y * 0.4}, ${midX} ${midY} Q ${100 + offset.x * 0.7} ${410 + offset.y * 0.7}, ${tipX} ${tipY}`;
    };

    return (
        <>
            {/* First Branch */}
            <div className="hidden lg:block fixed right-0 top--2 z-20"
                style={{ width: '200px', height: '450px' }}
            >
                <svg
                    viewBox="0 0 200 450"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-lg"
                >
                    {/* Main branch stem - anchored at top, interactive */}
                    <motion.path
                        d={isDragging1 ? getBranchPath1(branch1Offset) : "M 100 0 Q 95 80, 90 160 Q 85 240, 95 320 Q 100 360, 105 400"}
                        stroke="#6e6205ff"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                        animate={!isDragging1 ? {
                            d: [
                                "M 100 0 Q 95 80, 90 160 Q 85 240, 95 320 Q 100 360, 105 400",
                                "M 100 0 Q 100 80, 95 160 Q 90 240, 100 320 Q 105 360, 110 400",
                                "M 100 0 Q 95 80, 90 160 Q 85 240, 95 320 Q 100 360, 105 400"
                            ]
                        } : {}}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Interactive drag area at the tip */}
                    <motion.circle
                        cx={105 + branch1Offset.x}
                        cy={400 + branch1Offset.y}
                        r="30"
                        fill="transparent"
                        className="cursor-grab active:cursor-grabbing"
                        drag
                        dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                        dragElastic={0.1}
                        onDrag={(event, info) => {
                            setBranch1Offset({ x: info.offset.x, y: info.offset.y });
                            setIsDragging1(true);
                        }}
                        onDragEnd={() => {
                            // Smooth return to original position
                            setBranch1Offset({ x: 0, y: 0 });
                            setIsDragging1(false);
                        }}
                    />

                    {/* Leaves - positions update based on branch curve */}
                    <motion.g
                        animate={!isDragging1 ? {
                            rotate: [0, 5, 0],
                            x: [0, 3, 0],
                            y: [0, -2, 0]
                        } : {}}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            transformOrigin: "110px 60px",
                            transform: `translate(${branch1Offset.x * 0.2}px, ${branch1Offset.y * 0.2}px)`
                        }}
                    >
                        <ellipse cx="130" cy="50" rx="18" ry="8" fill="#4ade80" opacity="0.9" transform="rotate(45 130 50)" />
                        <ellipse cx="125" cy="55" rx="15" ry="7" fill="#22c55e" opacity="0.85" transform="rotate(30 125 55)" />
                        <path d="M 110 60 L 130 50" stroke="#6e6205ff" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>

                    <motion.g
                        animate={!isDragging1 ? {
                            rotate: [0, -2, 0],
                            x: [0, -1, 0],
                            y: [0, -1, 0]
                        } : {}}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                        }}
                        style={{
                            transformOrigin: "90px 80px",
                            transform: `translate(${branch1Offset.x * 0.2}px, ${branch1Offset.y * 0.2}px)`
                        }}
                    >
                        <ellipse cx="70" cy="75" rx="16" ry="7" fill="#4ade80" opacity="0.9" transform="rotate(-45 70 75)" />
                        <ellipse cx="75" cy="80" rx="14" ry="6" fill="#22c55e" opacity="0.85" transform="rotate(-30 75 80)" />
                        <path d="M 90 80 L 70 75" stroke="#6e6205ff" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>

                    <motion.g
                        animate={!isDragging1 ? {
                            rotate: [0, 4, 0],
                            x: [0, 3, 0],
                            y: [0, -2, 0]
                        } : {}}
                        transition={{
                            duration: 3.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.8
                        }}
                        style={{
                            transformOrigin: "105px 180px",
                            transform: `translate(${branch1Offset.x * 0.5}px, ${branch1Offset.y * 0.5}px)`
                        }}
                    >
                        <ellipse cx="135" cy="170" rx="20" ry="9" fill="#4ade80" opacity="0.9" transform="rotate(50 135 170)" />
                        <ellipse cx="130" cy="175" rx="17" ry="8" fill="#22c55e" opacity="0.85" transform="rotate(35 130 175)" />
                        <path d="M 105 180 L 135 170" stroke="#6e6205ff" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>

                    <motion.g
                        animate={!isDragging1 ? {
                            rotate: [0, -3, 0],
                            x: [0, -2, 0],
                            y: [0, -2, 0]
                        } : {}}
                        transition={{
                            duration: 3.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1.2
                        }}
                        style={{
                            transformOrigin: "95px 260px",
                            transform: `translate(${branch1Offset.x * 0.7}px, ${branch1Offset.y * 0.7}px)`
                        }}
                    >
                        <ellipse cx="65" cy="250" rx="18" ry="8" fill="#4ade80" opacity="0.9" transform="rotate(-50 65 250)" />
                        <ellipse cx="70" cy="255" rx="15" ry="7" fill="#22c55e" opacity="0.85" transform="rotate(-35 70 255)" />
                        <path d="M 95 260 L 65 250" stroke="#6e6205ff" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>

                    <motion.g
                        animate={!isDragging1 ? {
                            rotate: [0, 6, 0],
                            x: [0, 5, 0],
                            y: [0, -4, 0]
                        } : {}}
                        transition={{
                            duration: 3.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.3
                        }}
                        style={{
                            transformOrigin: "100px 340px",
                            transform: `translate(${branch1Offset.x}px, ${branch1Offset.y}px)`
                        }}
                    >
                        <ellipse cx="135" cy="330" rx="22" ry="10" fill="#4ade80" opacity="0.9" transform="rotate(55 135 330)" />
                        <ellipse cx="130" cy="335" rx="19" ry="9" fill="#22c55e" opacity="0.85" transform="rotate(40 130 335)" />
                        <path d="M 100 340 L 135 330" stroke="#6e6205ff" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>

                    <motion.g
                        animate={!isDragging1 ? {
                            rotate: [0, -5, 0],
                            x: [0, -4, 0],
                            y: [0, -3, 0]
                        } : {}}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.6
                        }}
                        style={{
                            transformOrigin: "105px 390px",
                            transform: `translate(${branch1Offset.x}px, ${branch1Offset.y}px)`
                        }}
                    >
                        <ellipse cx="70" cy="380" rx="20" ry="9" fill="#4ade80" opacity="0.9" transform="rotate(-55 70 380)" />
                        <ellipse cx="75" cy="385" rx="17" ry="8" fill="#22c55e" opacity="0.85" transform="rotate(-40 75 385)" />
                        <path d="M 105 390 L 70 380" stroke="#6e6205ff" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>
                </svg>

                <div className="absolute inset-0 bg-gradient-to-b from-green-100/20 to-transparent rounded-full blur-2xl -z-10" />
            </div>

            {/* Second Branch - Taller */}
            <div className="hidden lg:block fixed right-28 top--2 z-20"
                style={{ width: '200px', height: '900px' }}
            >
                <svg
                    viewBox="0 0 200 900"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-lg"
                >
                    {/* Main branch stem - anchored at top, interactive */}
                    <motion.path
                        d={isDragging2 ? getBranchPath2(branch2Offset) : "M 100 0 Q 105 90, 110 180 Q 115 270, 105 360 Q 100 410, 95 460"}
                        stroke="#6e6205ff"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                        animate={!isDragging2 ? {
                            d: [
                                "M 100 0 Q 105 90, 110 180 Q 115 270, 105 360 Q 100 410, 95 460",
                                "M 100 0 Q 100 90, 105 180 Q 110 270, 100 360 Q 95 410, 90 460",
                                "M 100 0 Q 105 90, 110 180 Q 115 270, 105 360 Q 100 410, 95 460"
                            ]
                        } : {}}
                        transition={{
                            duration: 4.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                        }}
                    />

                    {/* Interactive drag area at the tip */}
                    <motion.circle
                        cx={95 + branch2Offset.x}
                        cy={460 + branch2Offset.y}
                        r="30"
                        fill="transparent"
                        className="cursor-grab active:cursor-grabbing"
                        drag
                        dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                        dragElastic={0.1}
                        onDrag={(event, info) => {
                            setBranch2Offset({ x: info.offset.x, y: info.offset.y });
                            setIsDragging2(true);
                        }}
                        onDragEnd={() => {
                            setBranch2Offset({ x: 0, y: 0 });
                            setIsDragging2(false);
                        }}
                    />

                    {/* Leaves for second branch */}
                    <motion.g
                        animate={!isDragging2 ? {
                            rotate: [0, -2, 0],
                            x: [0, -1, 0],
                            y: [0, -1, 0]
                        } : {}}
                        transition={{
                            duration: 3.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.3
                        }}
                        style={{
                            transformOrigin: "90px 70px",
                            transform: `translate(${branch2Offset.x * 0.2}px, ${branch2Offset.y * 0.2}px)`
                        }}
                    >
                        <ellipse cx="70" cy="60" rx="18" ry="8" fill="#4ade80" opacity="0.9" transform="rotate(-45 70 60)" />
                        <ellipse cx="75" cy="65" rx="15" ry="7" fill="#22c55e" opacity="0.85" transform="rotate(-30 75 65)" />
                        <path d="M 90 70 L 70 60" stroke="#6e6205ff" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>

                    <motion.g
                        animate={!isDragging2 ? {
                            rotate: [0, 2, 0],
                            x: [0, 1, 0],
                            y: [0, -1, 0]
                        } : {}}
                        transition={{
                            duration: 3.7,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.8
                        }}
                        style={{
                            transformOrigin: "110px 90px",
                            transform: `translate(${branch2Offset.x * 0.2}px, ${branch2Offset.y * 0.2}px)`
                        }}
                    >
                        <ellipse cx="130" cy="85" rx="16" ry="7" fill="#4ade80" opacity="0.9" transform="rotate(45 130 85)" />
                        <ellipse cx="125" cy="90" rx="14" ry="6" fill="#22c55e" opacity="0.85" transform="rotate(30 125 90)" />
                        <path d="M 110 90 L 130 85" stroke="#6e6205ff" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>

                    <motion.g
                        animate={!isDragging2 ? {
                            rotate: [0, -4, 0],
                            x: [0, -3, 0],
                            y: [0, -2, 0]
                        } : {}}
                        transition={{
                            duration: 3.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1.0
                        }}
                        style={{
                            transformOrigin: "115px 220px",
                            transform: `translate(${branch2Offset.x * 0.5}px, ${branch2Offset.y * 0.5}px)`
                        }}
                    >
                        <ellipse cx="145" cy="210" rx="20" ry="9" fill="#4ade80" opacity="0.9" transform="rotate(50 145 210)" />
                        <ellipse cx="140" cy="215" rx="17" ry="8" fill="#22c55e" opacity="0.85" transform="rotate(35 140 215)" />
                        <path d="M 115 220 L 145 210" stroke="#6e6205ff" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>

                    <motion.g
                        animate={!isDragging2 ? {
                            rotate: [0, 3, 0],
                            x: [0, 2, 0],
                            y: [0, -2, 0]
                        } : {}}
                        transition={{
                            duration: 4.0,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1.5
                        }}
                        style={{
                            transformOrigin: "105px 300px",
                            transform: `translate(${branch2Offset.x * 0.7}px, ${branch2Offset.y * 0.7}px)`
                        }}
                    >
                        <ellipse cx="75" cy="290" rx="18" ry="8" fill="#4ade80" opacity="0.9" transform="rotate(-50 75 290)" />
                        <ellipse cx="80" cy="295" rx="15" ry="7" fill="#22c55e" opacity="0.85" transform="rotate(-35 80 295)" />
                        <path d="M 105 300 L 75 290" stroke="#6e6205ff" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>

                    <motion.g
                        animate={!isDragging2 ? {
                            rotate: [0, -6, 0],
                            x: [0, -5, 0],
                            y: [0, -4, 0]
                        } : {}}
                        transition={{
                            duration: 3.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.4
                        }}
                        style={{
                            transformOrigin: "100px 390px",
                            transform: `translate(${branch2Offset.x}px, ${branch2Offset.y}px)`
                        }}
                    >
                        <ellipse cx="65" cy="380" rx="22" ry="10" fill="#4ade80" opacity="0.9" transform="rotate(-55 65 380)" />
                        <ellipse cx="70" cy="385" rx="19" ry="9" fill="#22c55e" opacity="0.85" transform="rotate(-40 70 385)" />
                        <path d="M 100 390 L 65 380" stroke="#6e6205ff" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>

                    <motion.g
                        animate={!isDragging2 ? {
                            rotate: [0, 5, 0],
                            x: [0, 4, 0],
                            y: [0, -3, 0]
                        } : {}}
                        transition={{
                            duration: 4.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.7
                        }}
                        style={{
                            transformOrigin: "95px 450px",
                            transform: `translate(${branch2Offset.x}px, ${branch2Offset.y}px)`
                        }}
                    >
                        <ellipse cx="125" cy="440" rx="20" ry="9" fill="#4ade80" opacity="0.9" transform="rotate(55 125 440)" />
                        <ellipse cx="120" cy="445" rx="17" ry="8" fill="#22c55e" opacity="0.85" transform="rotate(40 120 445)" />
                        <path d="M 95 450 L 125 440" stroke="#6e6205ff" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>
                </svg>

                <div className="absolute inset-0 bg-gradient-to-b from-green-100/20 to-transparent rounded-full blur-2xl -z-10" />
            </div>
        </>
    );
};

export default InteractiveBranch;
