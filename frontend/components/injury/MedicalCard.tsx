"use client";

import { Play, Activity, Clock, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface MedicalCardProps {
    injury: any; // Type this properly later
    onActivate: () => void;
}

export function MedicalCard({ injury, onActivate }: MedicalCardProps) {
    if (!injury) return null;

    const exercises = injury.recovery_exercises || [];

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#EF553B]/20 flex items-center justify-center text-[#EF553B]">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{injury.injury_type}</h3>
                    <p className="text-sm text-[#8B949E]">{injury.body_area} Injury</p>
                </div>
            </div>

            {/* Acute Phase */}
            <GlassCard className="bg-[#EF553B]/5 border-[#EF553B]/20">
                <h4 className="font-bold text-[#EF553B] mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Immediate Action (First 24h)
                </h4>
                <p className="text-sm text-white/90 leading-relaxed">
                    {injury.immediate_action}
                </p>
            </GlassCard>

            {/* Video Guide */}
            {injury.video_url && (
                <div className="rounded-lg overflow-hidden border border-[#30363D] relative bg-black aspect-video group cursor-pointer">
                    <img
                        src={`https://img.youtube.com/vi/${injury.video_url.split("v=")[1]}/hqdefault.jpg`}
                        alt="Rehab Video"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-[#00CC96] rounded-full flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 ml-1" fill="currentColor" />
                        </div>
                    </div>
                    <a href={injury.video_url} target="_blank" rel="noreferrer" className="absolute inset-0" />
                </div>
            )}

            {/* Protocol Preview */}
            <div>
                <h4 className="font-bold text-white mb-3 text-sm uppercase text-[#8B949E]">Rehab Protocol Preview</h4>
                <div className="space-y-2">
                    {exercises.slice(0, 3).map((ex: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm p-3 bg-[#161B22] rounded border border-[#30363D]">
                            <span className="text-white">{ex.name}</span>
                            <span className="text-[#00CC96] font-mono">{ex.reps}</span>
                        </div>
                    ))}
                    {exercises.length > 3 && (
                        <p className="text-xs text-center text-[#8B949E] italic">+ {exercises.length - 3} more exercises</p>
                    )}
                </div>
            </div>

            {/* Warning */}
            <div className="p-3 bg-[#161B22] rounded border border-[#30363D] flex gap-3">
                <AlertTriangle className="w-10 h-10 text-[#FFA15A] shrink-0" />
                <p className="text-xs text-[#8B949E]">
                    <span className="text-[#FFA15A] font-bold">Note:</span> Activating this protocol will lock your training schedule. You cannot skip rehab days until healed.
                </p>
            </div>

            <button
                onClick={onActivate}
                className="w-full bg-[#EF553B] hover:bg-[#D9452D] text-white font-bold py-4 rounded-lg shadow-lg shadow-[#EF553B]/20 transition-all flex items-center justify-center gap-2"
            >
                Activate Recovery Protocol
            </button>
        </div>
    );
}
