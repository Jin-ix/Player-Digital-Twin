"use client";

import { motion } from "framer-motion";

interface BodyMapProps {
    kneeRisk: "Normal" | "High";
    ankleRisk: "Normal" | "High";
}

export function BodyMap({ kneeRisk, ankleRisk, onPartClick }: { kneeRisk: "Normal" | "High"; ankleRisk: "Normal" | "High"; onPartClick?: (part: string) => void }) {
    const kneeColor = kneeRisk === "High" ? "#EF553B" : "#00CC96"; // Red or Green
    const ankleColor = ankleRisk === "High" ? "#EF553B" : "#00CC96";
    const bodyColor = "#30363D"; // Neural Grey
    const hoverClass = onPartClick ? "hover:fill-white/20 cursor-pointer transition-colors" : "";

    return (
        <div className="relative h-[400px] w-full flex items-center justify-center">
            <svg viewBox="0 0 200 600" className="h-full w-auto drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                {/* HEAD */}
                <circle cx="100" cy="50" r="30" fill={bodyColor} />

                {/* TORSO */}
                <path d="M70 90 L130 90 L120 250 L80 250 Z" fill={bodyColor} />
                <path d="M70 90 L130 90 L120 250 L80 250 Z" fill="transparent" className={hoverClass} onClick={() => onPartClick?.("Lower Back")} />

                {/* ARMS */}
                <rect x="40" y="90" width="20" height="120" rx="10" fill={bodyColor} />
                <rect x="40" y="90" width="20" height="120" rx="10" fill="transparent" className={hoverClass} onClick={() => onPartClick?.("Shoulder")} />

                <rect x="140" y="90" width="20" height="120" rx="10" fill={bodyColor} />
                <rect x="140" y="90" width="20" height="120" rx="10" fill="transparent" className={hoverClass} onClick={() => onPartClick?.("Shoulder")} />

                {/* LEGS (Upper) - Hamstrings */}
                <rect x="75" y="260" width="20" height="100" rx="5" fill={bodyColor} />
                <rect x="75" y="260" width="20" height="100" rx="5" fill="transparent" className={hoverClass} onClick={() => onPartClick?.("Hamstring")} />

                <rect x="105" y="260" width="20" height="100" rx="5" fill={bodyColor} />
                <rect x="105" y="260" width="20" height="100" rx="5" fill="transparent" className={hoverClass} onClick={() => onPartClick?.("Hamstring")} />

                {/* KNEES (Dynamic) */}
                <g onClick={() => onPartClick?.("Knee")} className={onPartClick ? "cursor-pointer" : ""}>
                    <motion.circle
                        cx="85" cy="370" r="12"
                        fill={kneeColor}
                        animate={{ fill: kneeColor, scale: kneeRisk === "High" ? [1, 1.2, 1] : 1 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                    <motion.circle
                        cx="115" cy="370" r="12"
                        fill={kneeColor}
                        animate={{ fill: kneeColor, scale: kneeRisk === "High" ? [1, 1.2, 1] : 1 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                </g>

                {/* LEGS (Lower) */}
                <rect x="78" y="390" width="14" height="100" rx="5" fill={ankleColor} />
                <rect x="108" y="390" width="14" height="100" rx="5" fill={ankleColor} />

                {/* ANKLES/FEET */}
                <g onClick={() => onPartClick?.("Ankle")} className={onPartClick ? "cursor-pointer" : ""}>
                    <path d="M75 500 L95 500 L95 520 L75 520 Z" fill={ankleColor} />
                    <path d="M105 500 L125 500 L125 520 L105 520 Z" fill={ankleColor} />
                </g>
            </svg>

            {/* LABELS */}
            {kneeRisk === "High" && (
                <div className="absolute top-[60%] left-[65%] bg-[#EF553B] text-white text-xs px-2 py-1 rounded">
                    Load Stress
                </div>
            )}
            {ankleRisk === "High" && (
                <div className="absolute top-[85%] right-[65%] bg-[#EF553B] text-white text-xs px-2 py-1 rounded">
                    Soreness
                </div>
            )}
        </div>
    );
}
