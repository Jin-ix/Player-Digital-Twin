"use client";

import { motion } from "framer-motion";
import { User, Activity, FileText, Ruler, Weight, Shield, Hash, MapPin, Award } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface PlayerProfileProps {
    data: {
        player_id: string;
        height: number;
        weight: number;
        position: string;
        jersey_number: number;
        bio: string;
        medical_status?: string;
    } | null;
    isLoading?: boolean;
}

export function PlayerProfileCard({ data, isLoading }: PlayerProfileProps) {
    if (isLoading) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00CC96]"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <GlassCard className="p-8 text-center text-[#8B949E]">
                <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold">Profile Not Found</h3>
                <p>Please contact your administrator.</p>
            </GlassCard>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main ID Card - Left Col */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="md:col-span-1"
            >
                <div className="relative overflow-hidden rounded-2xl bg-[#0D1117] border border-[#30363D] p-6 h-full shadow-2xl group">
                    {/* Background ID Glow */}
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#00CC96]/10 to-[#636EFA]/10 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="relative w-32 h-32 mb-6">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00CC96] to-[#636EFA] blur opacity-50 animate-pulse" />
                            <div className="relative w-full h-full rounded-full bg-[#161B22] border-2 border-[#30363D] flex items-center justify-center overflow-hidden">
                                <User className="w-16 h-16 text-white/50" />
                                {/* Image Fallback if available usually goes here */}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-[#0D1117] rounded-full p-2 border border-[#30363D]">
                                <Shield className="w-6 h-6 text-[#00CC96]" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-1">Player #{data.jersey_number}</h2>
                        <span className="text-sm font-bold bg-[#00CC96]/20 text-[#00CC96] px-3 py-1 rounded-full border border-[#00CC96]/30 uppercase tracking-wider mb-6">
                            {data.position || "Unknown"}
                        </span>

                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-[#161B22]/50 border border-[#30363D] hover:border-[#636EFA]/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Ruler className="w-5 h-5 text-[#636EFA]" />
                                    <span className="text-[#8B949E] text-sm">Height</span>
                                </div>
                                <span className="font-bold text-white">{data.height} cm</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-[#161B22]/50 border border-[#30363D] hover:border-[#FFA15A]/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Weight className="w-5 h-5 text-[#FFA15A]" />
                                    <span className="text-[#8B949E] text-sm">Weight</span>
                                </div>
                                <span className="font-bold text-white">{data.weight} kg</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats & Bio - Right Col */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="md:col-span-2 space-y-6"
            >
                {/* Physical Attributes Grid */}
                <GlassCard className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#636EFA]" />
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#636EFA]" /> Performance DNA
                    </h3>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { label: "Matches Played", value: "24", icon: Hash, color: "#FFA15A" },
                            { label: "Top Speed", value: "34.2 km/h", icon: Activity, color: "#00CC96" },
                            { label: "Distance/Game", value: "11.5 km", icon: MapPin, color: "#636EFA" },
                            { label: "Recovery Rate", value: "Elite", icon: Shield, color: "#AB63FA" },
                            { label: "Season MVP", value: "2x", icon: Award, color: "#EF553B" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-[#0D1117] p-4 rounded-xl border border-[#30363D] hover:border-gray-500 hover:transform hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs text-[#8B949E] uppercase font-bold">{stat.label}</span>
                                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                                </div>
                                <div className="text-xl font-bold text-white">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Bio Section */}
                <GlassCard className="relative min-h-[180px]">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#00CC96]" />
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#00CC96]" /> Official Bio
                    </h3>
                    <div className="p-4 bg-[#0D1117] rounded-xl border border-[#30363D] relative">
                        <span className="absolute top-2 left-2 text-4xl text-[#30363D] font-serif leading-none">"</span>
                        <p className="text-[#8B949E] text-sm leading-relaxed pl-6 italic relative z-10">
                            {data.bio || "No biography available."}
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
