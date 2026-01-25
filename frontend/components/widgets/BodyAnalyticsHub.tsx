"use client";

import { useState } from "react";
import { BodyMap } from "@/components/widgets/BodyMap";
import { GlassCard } from "@/components/ui/GlassCard";
import { GenericLineChart } from "@/components/charts/GenericLineChart";
import { RiskGauge } from "@/components/widgets/RiskGauge";
import { Activity, Zap, AlertTriangle, ScanLine } from "lucide-react";
import { InjuryTriageModal } from "@/components/injury/InjuryTriageModal";

export function BodyAnalyticsHub({ onInjuryReport }: { onInjuryReport: (part: string) => void }) {
    const [selectedPart, setSelectedPart] = useState<string | null>(null);

    // Mock Data for "Advanced Visualisation"
    const loadHistory = Array.from({ length: 14 }, (_, i) => ({
        day: `D${i}`,
        val: Math.floor(Math.random() * 50) + (selectedPart ? 40 : 20)
    }));

    const strainValue = selectedPart ? (selectedPart === "Knee" ? 75 : 30) : 45;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
            {/* LEFT: Context & Graphs */}
            <div className="lg:col-span-3 flex flex-col gap-6">
                <GlassCard className="flex-1 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[#00CC96]/20 flex items-center justify-center mb-4 animate-pulse">
                        <Activity className="w-8 h-8 text-[#00CC96]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">System Readiness</h3>
                    <p className="text-[#8B949E]">92% Optimal</p>
                </GlassCard>

                <GlassCard className="flex-1">
                    <h4 className="text-sm font-bold text-[#8B949E] uppercase mb-4">Local Load Strain</h4>
                    <GenericLineChart
                        data={loadHistory}
                        xAxisKey="day"
                        lines={[{ key: "val", color: "#636EFA", name: "Strain" }]}
                    />
                </GlassCard>
            </div>

            {/* CENTER: Body Map & Scanner */}
            <div className="lg:col-span-6 relative">
                <GlassCard className="h-full flex flex-col items-center justify-center relative overflow-hidden border-[#00CC96]/30 bg-[#00CC96]/5">
                    {/* Scanner Effect */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#00CC96]/50 shadow-[0_0_20px_#00CC96] animate-[scan_4s_ease-in-out_infinite]" />
                    </div>

                    <div className="relative z-10 w-full max-w-xs scale-125">
                        <BodyMap
                            kneeRisk="Normal"
                            ankleRisk="Normal"
                            onPartClick={(part) => setSelectedPart(part)}
                        />
                    </div>

                    <div className="absolute bottom-6 text-center z-20">
                        <p className="text-xs text-[#00CC96] tracking-[0.2em] font-bold uppercase mb-2">
                            {selectedPart ? `Scanning: ${selectedPart}` : "Select Bio-Zone"}
                        </p>
                        {selectedPart && (
                            <button
                                onClick={() => onInjuryReport(selectedPart)}
                                className="px-6 py-2 bg-[#EF553B] hover:bg-[#D9452D] text-white rounded-full font-bold shadow-[0_0_15px_#EF553B] transition-all flex items-center gap-2 mx-auto"
                            >
                                <AlertTriangle className="w-4 h-4" /> Report Issue
                            </button>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* RIGHT: Detail View */}
            <div className="lg:col-span-3 flex flex-col gap-6">
                <GlassCard className="h-full relative overflow-hidden">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                        <ScanLine className="text-[#00CC96]" /> Zone Diagnostics
                    </h3>

                    {selectedPart ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <p className="text-[#8B949E] text-xs uppercase">Selected Zone</p>
                                <p className="text-3xl font-bold text-white">{selectedPart}</p>
                            </div>

                            <div>
                                <RiskGauge
                                    value={strainValue}
                                    label="Tissue Stress"
                                    min={0} max={100}
                                    lowThreshold={40} highThreshold={70}
                                />
                            </div>

                            <div className="p-4 bg-[#EF553B]/10 border border-[#EF553B]/30 rounded-lg">
                                <p className="text-[#EF553B] text-xs font-bold mb-1">Coach Note</p>
                                <p className="text-white text-sm">"Monitor load here. Previous hotspot."</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[#8B949E] opacity-50">
                            <p className="text-sm">Click a body part for deep dive metrics.</p>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
}
