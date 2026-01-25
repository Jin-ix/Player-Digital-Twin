"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { MedicalCard } from "./MedicalCard";
import { ChevronRight, AlertOctagon, CheckCircle2 } from "lucide-react";

interface InjuryTriageModalProps {
    isOpen: boolean;
    onClose: () => void;
    bodyPart: string | null;
    onActivateProtocol: (injuryId: number) => void;
}

export function InjuryTriageModal({ isOpen, onClose, bodyPart, onActivateProtocol }: InjuryTriageModalProps) {
    const [step, setStep] = useState<"SYMPTOM" | "RED_FLAGS" | "MEDICAL_CARD">("SYMPTOM");
    const [isLoading, setIsLoading] = useState(false);
    const [injuries, setInjuries] = useState<any[]>([]);
    const [selectedInjury, setSelectedInjury] = useState<any>(null);

    // Reset when opening
    useEffect(() => {
        if (isOpen && bodyPart) {
            setStep("SYMPTOM");
            setSelectedInjury(null);
            setIsLoading(true);
            setInjuries([]);

            // Fetch injuries for bodyPart
            fetch(`http://127.0.0.1:8000/api/v1/injuries/library/${bodyPart}`)
                .then(res => res.json())
                .then(data => {
                    setInjuries(data);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setIsLoading(false);
                });
        }
    }, [isOpen, bodyPart]);

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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                step === "SYMPTOM" ? `Where does your ${bodyPart} hurt?` :
                    step === "RED_FLAGS" ? "Safety Check" :
                        "Your Care Plan"
            }
        >
            {step === "SYMPTOM" && (
                <div className="space-y-2">
                    {isLoading ? (
                        <p className="text-[#8B949E] text-center py-8 animate-pulse">Scanning common injuries...</p>
                    ) : injuries.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-white font-bold">No Records Found</p>
                            <p className="text-[#8B949E] text-sm">We don't have common protocols for {bodyPart} yet.</p>
                        </div>
                    ) : (
                        injuries.map((injury) => (
                            <button
                                key={injury.id}
                                onClick={() => handleInjurySelect(injury)}
                                className="w-full text-left p-4 bg-[#161B22] hover:bg-[#21262D] lg:hover:pl-5 border border-[#30363D] rounded-lg transition-all flex items-center justify-between group"
                            >
                                <div>
                                    <h4 className="font-bold text-white">{injury.injury_type}</h4>
                                    <p className="text-xs text-[#8B949E] mt-1 line-clamp-1">
                                        {injury.immediate_action ? injury.immediate_action.substring(0, 50) + "..." : "Common symptoms"}
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[#8B949E] group-hover:text-[#00CC96]" />
                            </button>
                        ))
                    )}
                </div>
            )}

            {step === "RED_FLAGS" && selectedInjury && (
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-[#EF553B]/20 rounded-full flex items-center justify-center mx-auto text-[#EF553B]">
                        <AlertOctagon className="w-8 h-8" />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Do you have these symptoms?</h3>
                        <p className="text-[#EF553B] font-bold bg-[#EF553B]/10 p-4 rounded border border-[#EF553B]/30">
                            {selectedInjury.red_flags}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-[#EF553B] hover:bg-[#D9452D] text-white font-bold rounded"
                        >
                            Yes (See Doctor)
                        </button>
                        <button
                            onClick={confirmRedFlags}
                            className="w-full py-3 bg-[#238636] hover:bg-[#2EA043] text-white font-bold rounded flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" /> No, I'm Safe
                        </button>
                    </div>
                </div>
            )}

            {step === "MEDICAL_CARD" && selectedInjury && (
                <MedicalCard
                    injury={selectedInjury}
                    onActivate={() => onActivateProtocol(selectedInjury.id)}
                />
            )}
        </Modal>
    );
}
