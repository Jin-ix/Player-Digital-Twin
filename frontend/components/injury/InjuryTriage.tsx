"use client";

import { useState, useEffect } from "react";
import { ChevronRight, AlertOctagon, CheckCircle2, Activity, ArrowLeft } from "lucide-react";
import { MedicalCard } from "./MedicalCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { fetchAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface InjuryTriageProps {
    bodyPart: string | null;
    onActivateProtocol: (injuryId: number) => void;
    onCancel?: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function InjuryTriage({ bodyPart, onActivateProtocol, onCancel }: InjuryTriageProps) {
    const [step, setStep] = useState<"SYMPTOM" | "RED_FLAGS" | "MEDICAL_CARD">("SYMPTOM");
    const [isLoading, setIsLoading] = useState(false);
    const [injuries, setInjuries] = useState<any[]>([]);
    const [selectedInjury, setSelectedInjury] = useState<any>(null);

    // Reset when bodyPart changes
    useEffect(() => {
        if (bodyPart) {
            setStep("SYMPTOM");
            setSelectedInjury(null);
            setIsLoading(true);
            setInjuries([]);

            const load = async () => {
                try {
                    const data = await fetchAPI(`/injuries/library/${bodyPart}`);
                    setInjuries(data || []);
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsLoading(false);
                }
            };
            load();
        }
    }, [bodyPart]);

    const handleInjurySelect = (injury: any) => {
        setSelectedInjury(injury);
        if (injury.red_flags) {
            setStep("RED_FLAGS");
        } else {
            setStep("MEDICAL_CARD");
        }
    };

    const confirmRedFlags = () => {
        setStep("MEDICAL_CARD");
    };

    if (!bodyPart) return null;

    return (
        <GlassCard className="h-full flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="mb-6 pb-4 border-b border-[#30363D] flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-3">
                    {step !== "SYMPTOM" && (
                        <button
                            onClick={() => setStep("SYMPTOM")}
                            className="p-1 rounded-full hover:bg-[#30363D] text-[#8B949E] transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            {step === "SYMPTOM" && <><Activity className="w-5 h-5 text-[#636EFA]" /> Dr. AI: {bodyPart} Analysis</>}
                            {step === "RED_FLAGS" && <><AlertOctagon className="w-5 h-5 text-[#EF553B]" /> Safety Verification</>}
                            {step === "MEDICAL_CARD" && <><CheckCircle2 className="w-5 h-5 text-[#00CC96]" /> Recommended Remedy</>}
                        </h3>
                        <p className="text-xs text-[#8B949E] mt-0.5">
                            {step === "SYMPTOM" && "Select the condition accurately describing your issue."}
                            {step === "RED_FLAGS" && "Rule out serious conditions before proceeding."}
                            {step === "MEDICAL_CARD" && "Review and activate your recovery plan."}
                        </p>
                    </div>
                </div>
                {onCancel && (
                    <button onClick={onCancel} className="text-xs font-bold text-[#8B949E] hover:text-white px-3 py-1.5 rounded hover:bg-[#30363D] transition-colors">
                        CLOSE
                    </button>
                )}
            </div>

            {/* Content Area with AnimatePresence */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
                <AnimatePresence mode="wait">
                    {step === "SYMPTOM" && (
                        <motion.div
                            key="symptoms"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="w-10 h-10 border-4 border-[#30363D] border-t-[#636EFA] rounded-full animate-spin" />
                                    <p className="text-[#8B949E] animate-pulse">Scanning Bio-Library...</p>
                                </div>
                            ) : injuries.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-[#30363D] rounded-xl">
                                    <p className="text-white font-bold">No Records Found</p>
                                    <p className="text-[#8B949E] text-sm mt-2">No standard protocols for {bodyPart} yet.</p>
                                </div>
                            ) : (
                                injuries.map((injury) => (
                                    <motion.button
                                        key={injury.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => handleInjurySelect(injury)}
                                        className="w-full text-left p-0 bg-[#161B22] hover:bg-[#21262D] rounded-xl border border-[#30363D] transition-all group overflow-hidden relative"
                                        whileHover={{ scale: 1.02, translateX: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#636EFA] opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-white text-base group-hover:text-[#636EFA] transition-colors">
                                                    {injury.injury_type}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#30363D] text-[#8B949E]">
                                                        {injury.estimated_recovery_days || 14} Days
                                                    </span>
                                                    <span className="h-1 w-1 bg-[#8B949E] rounded-full" />
                                                    <p className="text-xs text-[#8B949E] line-clamp-1">
                                                        {injury.immediate_action ? injury.immediate_action.substring(0, 40) + "..." : "Standard Protocol"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-[#30363D] flex items-center justify-center group-hover:bg-[#636EFA] transition-colors">
                                                <ChevronRight className="w-5 h-5 text-[#8B949E] group-hover:text-white" />
                                            </div>
                                        </div>
                                    </motion.button>
                                ))
                            )}
                        </motion.div>
                    )}

                    {step === "RED_FLAGS" && selectedInjury && (
                        <motion.div
                            key="redflags"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col h-full justify-center text-center space-y-8"
                        >
                            <div className="w-20 h-20 bg-[#EF553B]/20 rounded-full flex items-center justify-center mx-auto text-[#EF553B] animate-pulse">
                                <AlertOctagon className="w-10 h-10" />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-white mb-4">Critical Symptom Check</h3>
                                <p className="text-[#EF553B] bg-[#EF553B]/10 p-6 rounded-xl border border-[#EF553B]/30 text-base font-medium mx-4">
                                    "{selectedInjury.red_flags}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 pt-4 px-8">
                                <button
                                    onClick={confirmRedFlags}
                                    className="w-full py-4 bg-[#238636] hover:bg-[#2EA043] text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-105"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> No, I'm Safe (Proceed)
                                </button>
                                <button
                                    onClick={() => alert("Please consult a medical professional immediately.")}
                                    className="w-full py-3 text-[#EF553B] hover:text-[#D9452D] hover:bg-[#EF553B]/10 rounded-xl font-bold text-sm transition-colors"
                                >
                                    Yes, I have these symptoms
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === "MEDICAL_CARD" && selectedInjury && (
                        <motion.div
                            key="medical"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mb-4 bg-[#636EFA]/10 border border-[#636EFA] p-4 rounded-lg flex items-start gap-3">
                                <Activity className="w-5 h-5 text-[#636EFA] shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-white text-sm">Suggested Remedy</h4>
                                    <p className="text-xs text-[#8B949E] mt-1">
                                        Based on your selection, we recommend the <strong>{selectedInjury.injury_type}</strong> protocol.
                                        Follow this daily plan to fully recover.
                                    </p>
                                </div>
                            </div>

                            <MedicalCard
                                injury={selectedInjury}
                                onActivate={() => onActivateProtocol(selectedInjury.id)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GlassCard>
    );
}
