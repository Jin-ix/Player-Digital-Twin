"use client";

import { useState, useEffect } from "react";
import { BodyMap } from "@/components/widgets/BodyMap";
import { InjuryTriage } from "./InjuryTriage";
import { ActiveProtocol } from "./ActiveProtocol";
import { GlassCard } from "@/components/ui/GlassCard";
import { Activity, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface RehabCenterProps {
    activeInjury: any;
    selectedBodyPart: string | null;
    onSelectPart: (part: string | null) => void;
    onActivate: (injuryId: number) => void;
    onHealed: () => void;
}

export function RehabCenter({ activeInjury, selectedBodyPart, onSelectPart, onActivate, onHealed }: RehabCenterProps) {
    // Local state removed in favor of lifted state

    // If active injury exists, we might want to default to showing it, 
    // BUT the user said "I don't want it to be locked". 
    // So perhaps we show the map still, but maybe the relevant part is highlighted?

    const handlePartClick = (part: string) => {
        if (activeInjury) {
            // Optional: Check if clicked part matches active injury?
            // For now, allow clicking to explore other parts? 
            // Or warn "Focus on your Knee rehab"?
            // User wanted "Select body part... and we activate protocol".
            // If already active, maybe we just switch the view?
        }
        onSelectPart(part);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
            {/* LEFT: BODY MAP (Interactive) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                <GlassCard className="flex-1 relative overflow-hidden flex flex-col items-center justify-center bg-[#161B22]/50">
                    <h3 className="absolute top-4 left-4 font-bold text-[#8B949E] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#00CC96]" />
                        Bio-Digital Twin
                    </h3>

                    <div className="scale-110 mt-10">
                        <BodyMap
                            kneeRisk={activeInjury?.injury_details?.body_area === "Knee" ? "High" : "Normal"}
                            ankleRisk="Normal"
                            onPartClick={handlePartClick}
                        />
                    </div>

                    <div className="absolute bottom-6 text-center">
                        {!selectedBodyPart && !activeInjury && (
                            <p className="text-sm text-[#00CC96] animate-pulse">Select a body part to begin triage</p>
                        )}
                        {selectedBodyPart && (
                            <p className="text-xl font-bold text-white">{selectedBodyPart}</p>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* RIGHT: ACTION PANEL */}
            {/* RIGHT: ACTION PANEL */}
            <div className="lg:col-span-7">
                {selectedBodyPart ? (
                    // 1. TRIAGE VIEW (Priority if user clicked something)
                    <div className="h-full">
                        <InjuryTriage
                            bodyPart={selectedBodyPart}
                            onActivateProtocol={onActivate}
                            onCancel={() => onSelectPart(null)}
                        />
                    </div>
                ) : activeInjury ? (
                    // 2. ACTIVE PROTOCOL VIEW (Fallback if nothing selected but injury exists)
                    <div className="h-full">
                        <ActiveProtocol
                            playerId={activeInjury.player_id}
                            onHealed={onHealed}
                        />
                    </div>
                ) : (
                    // 3. PLACEHOLDER VIEW (Nothing active, nothing selected)
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8 border-2 border-dashed border-[#30363D] rounded-xl bg-[#161B22]/30">
                        <div className="w-16 h-16 rounded-full bg-[#30363D] flex items-center justify-center">
                            <ArrowRight className="w-8 h-8 text-[#8B949E]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">No Active Protocol</h3>
                            <p className="text-[#8B949E] max-w-sm mt-2">
                                Select a body part on the Digital Twin to report an issue and generate a recovery plan.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
