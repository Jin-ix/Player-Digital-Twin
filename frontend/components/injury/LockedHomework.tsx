"use client";

import { useEffect, useState } from "react";
import { Lock, CheckCircle, Play, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

import { fetchAPI } from "@/lib/api";

interface LockedHomeworkProps {
    playerId: string;
    onHealed: () => void;
}

export function LockedHomework({ playerId, onHealed }: LockedHomeworkProps) {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    // Fetch assigned homework
    const fetchHomework = async () => {
        try {
            const data = await fetchAPI(`/homework/${playerId}`);
            if (data.status === "Injured") {
                setTasks(data.tasks);
                // Calculate simple mock progress or fetch from backend if persisted
                // For demo, we start at 0
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHomework();
    }, [playerId]);

    const handleComplete = (taskId: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: true } : t));
        // Ideally call backend to save progress
        // fetchAPI('/injuries/progress', ...)
    };

    const completedCount = tasks.filter(t => t.is_completed).length;
    const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    const handleMarkHealed = async () => {
        if (!confirm("Are you pain-free and ready to return to full training?")) return;

        try {
            // Find active injury ID
            // We use the centralized client
            const injury = await fetchAPI(`/injuries/current/${playerId}`);

            if (injury) {
                await fetchAPI(`/injuries/resolve/${injury.id}`, { method: "POST" });
                onHealed(); // Refresh parent
            }
        } catch (e) {
            console.error("Error marking healed:", e);
            alert("Could not mark as healed. See console.");
        }
    };

    if (loading) return <div className="text-center p-10 text-[#8B949E]">Loading Protocol...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Banner */}
            <div className="bg-[#EF553B]/10 border border-[#EF553B] rounded-lg p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#EF553B] rounded-full flex items-center justify-center text-black shadow-lg shadow-[#EF553B]/50 animate-pulse">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Rehabilitation Protocol Active</h2>
                        <p className="text-[#EF553B]">Training schedule locked. Complete these tasks daily.</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-[#8B949E] uppercase font-bold">Daily Compliance</p>
                    <p className="text-3xl font-bold text-white">{Math.round(progressPercent)}%</p>
                </div>
            </div>

            {/* Task List */}
            <div className="grid gap-4">
                {tasks.map((task) => (
                    <GlassCard key={task.id} className={`flex items-center justify-between transition-all ${task.is_completed ? "opacity-50 grayscale" : ""}`}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#161B22] rounded border border-[#30363D]">
                                <Play className="w-5 h-5 text-[#00CC96]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">{task.title}</h3>
                                <p className="text-sm text-[#8B949E]">{task.reps} {task.sets ? `• ${task.sets} Sets` : ""}</p>
                            </div>
                        </div>

                        {task.is_completed ? (
                            <div className="flex items-center gap-2 text-[#238636] font-bold">
                                <CheckCircle className="w-5 h-5" /> Done
                            </div>
                        ) : (
                            <button
                                onClick={() => handleComplete(task.id)}
                                className="px-4 py-2 bg-[#238636] hover:bg-[#2EA043] text-white rounded font-bold text-sm transition-colors"
                            >
                                Mark Done
                            </button>
                        )}
                    </GlassCard>
                ))}
            </div>

            {/* Healed Button */}
            <div className="pt-6 border-t border-[#30363D] flex justify-center">
                <button
                    onClick={handleMarkHealed}
                    className="text-[#8B949E] hover:text-white hover:underline text-sm flex items-center gap-2 transition-colors"
                >
                    <CheckCircle className="w-4 h-4" /> I am fully recovered (Unlock Training)
                </button>
            </div>
        </div>
    );
}
