"use client";

import { motion } from "framer-motion";
import { Users, Activity, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();

    return (
        <div className="min-h-screen w-full bg-[#0E1117] flex items-center justify-center relative overflow-hidden selection:bg-[#00CC96] selection:text-black">

            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00CC96]/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#636EFA]/10 rounded-full blur-[100px] animate-pulse delay-1000" />

            <div className="z-10 w-full max-w-4xl px-6">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl font-bold mb-4">
                            PREHAB <span className="gradient-text">2.0</span>
                        </h1>
                        <p className="text-[#8B949E] text-xl">The Elite Athlete Digital Twin Platform</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Athlete Login */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => login("athlete")}
                        className="cursor-pointer group"
                    >
                        <GlassCard className="h-full flex flex-col items-center justify-center py-16 border-2 border-transparent hover:border-[#00CC96] transition-all bg-[#0E1117]/50 backdrop-blur-xl">
                            <div className="w-24 h-24 rounded-full bg-[#00CC96]/10 flex items-center justify-center mb-6 group-hover:bg-[#00CC96]/20 transition-colors">
                                <Activity className="w-10 h-10 text-[#00CC96]" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Athlete</h2>
                            <p className="text-[#8B949E] text-center max-w-xs mb-8">
                                Access your Locker Room, view performance data, and track recovery.
                            </p>
                            <span className="text-[#00CC96] flex items-center gap-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Enter Locker Room <ChevronRight className="w-4 h-4" />
                            </span>
                        </GlassCard>
                    </motion.div>

                    {/* Coach Login */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => login("coach")}
                        className="cursor-pointer group"
                    >
                        <GlassCard className="h-full flex flex-col items-center justify-center py-16 border-2 border-transparent hover:border-[#636EFA] transition-all bg-[#0E1117]/50 backdrop-blur-xl">
                            <div className="w-24 h-24 rounded-full bg-[#636EFA]/10 flex items-center justify-center mb-6 group-hover:bg-[#636EFA]/20 transition-colors">
                                <Users className="w-10 h-10 text-[#636EFA]" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Coach/Staff</h2>
                            <p className="text-[#8B949E] text-center max-w-xs mb-8">
                                Enter the Command Center to analyze squad data and biometrics.
                            </p>
                            <span className="text-[#636EFA] flex items-center gap-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Enter Command Center <ChevronRight className="w-4 h-4" />
                            </span>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
