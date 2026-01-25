"use client";

import { motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";

interface StreakWidgetProps {
    streakDays: number;
    isActive: boolean; // True if verified today
}

export function StreakWidget({ streakDays, isActive }: StreakWidgetProps) {
    return (
        <div className="relative group">
            {/* Glow Effect */}
            <div className={`absolute inset-0 blur-xl rounded-full opacity-30 transition-all duration-1000 ${isActive ? "bg-[#FFA15A] scale-125" : "bg-gray-500 scale-100"
                }`} />

            <GlassCard className={`relative flex items-center gap-3 px-4 py-2 rounded-full border-2 transition-all duration-500 ${isActive
                    ? "border-[#FFA15A]/50 bg-[#FFA15A]/10 shadow-[0_0_20px_rgba(255,161,90,0.2)]"
                    : "border-[#30363D] bg-[#161B22]"
                }`}>
                <div className="relative">
                    <motion.div
                        animate={isActive ? {
                            scale: [1, 1.2, 1],
                            opacity: [0.8, 1, 0.8],
                        } : {}}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Flame
                            className={`w-6 h-6 ${isActive ? "text-[#FFA15A] fill-[#FFA15A]" : "text-[#8B949E]"}`}
                        />
                    </motion.div>

                    {/* Floating Particles if active (CSS logic simplifed for Framer) */}
                    {isActive && (
                        <>
                            <motion.div
                                className="absolute -top-1 left-2 w-1 h-1 bg-[#FFA15A] rounded-full"
                                animate={{ y: -15, opacity: 0 }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                                className="absolute top-0 right-1 w-1 h-1 bg-[#FFA15A] rounded-full"
                                animate={{ y: -20, opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}
                            />
                        </>
                    )}
                </div>

                <div className="flex flex-col leading-none">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-[#FFA15A]" : "text-[#8B949E]"}`}>
                        Recovery Streak
                    </span>
                    <span className="text-xl font-black text-white font-mono">
                        {streakDays} <span className="text-xs font-normal text-[#8B949E]">DAYS</span>
                    </span>
                </div>
            </GlassCard>
        </div>
    );
}

// Helper stub for GlassCard if not imported (assuming it exists in project)
function GlassCard({ children, className }: any) {
    return <div className={`backdrop-blur-md ${className}`}>{children}</div>;
}
