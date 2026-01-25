"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Play, Activity, Calendar, ArrowUpRight, Trophy } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { fetchAPI } from "@/lib/api";
import { StreakWidget } from "./StreakWidget";
import { motion, AnimatePresence } from "framer-motion";

interface ActiveProtocolProps {
    playerId: string;
    onHealed: () => void;
}

export function ActiveProtocol({ playerId, onHealed }: ActiveProtocolProps) {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);
    const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
    const [showDayComplete, setShowDayComplete] = useState(false);

    // --- 5 AM LOGIC ---
    const getCurrent5AmThreshold = () => {
        const now = new Date();
        const threshold = new Date(now);
        threshold.setHours(5, 0, 0, 0);
        // If it's before 5 AM, the threshold is yesterday 5 AM
        if (now < threshold) {
            threshold.setDate(threshold.getDate() - 1);
        }
        return threshold;
    };

    const isTaskLocked = (taskId: string) => {
        const storageKey = `rehab_log_${playerId}_${taskId}`;
        const lastCompleted = localStorage.getItem(storageKey);
        if (!lastCompleted) return false;

        const completedDate = new Date(lastCompleted);
        const threshold = getCurrent5AmThreshold();
        // It is locked (done) if completed AFTER the threshold
        return completedDate > threshold;
    };

    const updateStreak = (allDone: boolean) => {
        const streakKey = `rehab_streak_${playerId}`;
        const lastStreakDateKey = `rehab_streak_date_${playerId}`;

        let currentStreak = parseInt(localStorage.getItem(streakKey) || "0");
        const lastDate = localStorage.getItem(lastStreakDateKey);

        // Use today's 5am threshold as the "date key" for the streak
        const threshold = getCurrent5AmThreshold().toISOString();

        // If verified today already, do nothing. 
        // If allDone and we haven't stamped this "date" yet, increment.
        if (allDone && lastDate !== threshold) {
            currentStreak += 1;
            localStorage.setItem(streakKey, currentStreak.toString());
            localStorage.setItem(lastStreakDateKey, threshold);
            setShowDayComplete(true); // Trigger celebration
        }

        setStreak(currentStreak);
    };

    // Initialize State
    const fetchData = async () => {
        try {
            const data = await fetchAPI(`/homework/${playerId}`);
            if (data?.tasks) {
                setTasks(data.tasks);

                // Hydrate completion status from LocalStorage
                const map: Record<string, boolean> = {};

                data.tasks.forEach((t: any) => {
                    const locked = isTaskLocked(t.id);
                    map[t.id] = locked;
                });
                setCompletedMap(map);

                // Check Streak
                const streakKey = `rehab_streak_${playerId}`;
                const currentStreak = parseInt(localStorage.getItem(streakKey) || "0");
                setStreak(currentStreak);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll for day change? Not needed for demo session.
    }, [playerId]);

    // Handle Click
    const handleComplete = (taskId: string) => {
        const now = new Date().toISOString();
        localStorage.setItem(`rehab_log_${playerId}_${taskId}`, now);

        // Update Local State
        const newMap = { ...completedMap, [taskId]: true };
        setCompletedMap(newMap);

        // Check if all done
        const allDone = tasks.every(t => newMap[t.id] === true);
        if (allDone) {
            updateStreak(true);
        }
    };

    // Calculate Progress
    const completedCount = Object.values(completedMap).filter(Boolean).length;
    const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
    const isDayComplete = completedCount === tasks.length && tasks.length > 0;

    const handleMarkHealed = async () => {
        if (!confirm("Confirm you have completed the protocol and are pain-free?")) return;
        try {
            const injury = await fetchAPI(`/injuries/current/${playerId}`);
            if (injury) {
                await fetchAPI(`/injuries/resolve/${injury.id}`, { method: "POST" });
                onHealed();
            }
        } catch (e) {
            console.error("Error marking healed:", e);
        }
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center text-[#8B949E]">
            <Activity className="animate-spin w-5 h-5 mr-2" /> Loading Plan...
        </div>
    );

    return (
        <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 relative">
            {/* Celebration Overlay */}
            <AnimatePresence>
                {showDayComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl cursor-pointer"
                        onClick={() => setShowDayComplete(false)}
                    >
                        <div className="text-center space-y-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                                className="w-20 h-20 bg-gradient-to-tr from-[#00CC96] to-[#636EFA] rounded-full mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(0,204,150,0.6)]"
                            >
                                <Trophy className="w-10 h-10 text-white" />
                            </motion.div>
                            <h2 className="text-3xl font-black text-white italic">DAY COMPLETE!</h2>
                            <p className="text-[#00CC96] font-bold text-lg">Streak Increased!</p>
                            <p className="text-[#8B949E] text-xs">Come back tomorrow at 05:00 AM</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header / Status Card */}
            <GlassCard className="border-l-4 border-l-[#00CC96] bg-[#161B22]/80">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity className="text-[#00CC96] w-5 h-5" />
                            Recovery Plan
                        </h2>
                        <p className="text-[#8B949E] text-sm mt-1">
                            {isDayComplete ? "All tasks completed for today." : "Daily protocol active."}
                        </p>
                    </div>
                    {/* Streak Widget Integration */}
                    <StreakWidget streakDays={streak} isActive={isDayComplete} />
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-1.5 w-full bg-[#30363D] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#00CC96] transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </GlassCard>

            {/* Video Player */}
            {tasks.length > 0 && tasks[0].video_url && (
                <div className="rounded-xl overflow-hidden border border-[#30363D] relative bg-black aspect-video group shadow-xl">
                    <img
                        src={`https://img.youtube.com/vi/${tasks[0].video_url.split("v=")[1]}/hqdefault.jpg`}
                        alt="Rehab Instruction"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-[#00CC96] rounded-full flex items-center justify-center text-black shadow-lg animate-pulse">
                            <Play className="w-6 h-6 ml-1" fill="currentColor" />
                        </div>
                    </div>
                    <a href={tasks[0].video_url} target="_blank" rel="noreferrer" className="absolute inset-0" />

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                        <p className="text-white font-bold flex items-center gap-2">
                            <Play className="w-4 h-4 text-[#00CC96]" /> Watch Technique Guide
                        </p>
                    </div>
                </div>
            )}

            {/* Tasks Scroller */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                <h3 className="text-sm font-bold text-[#8B949E] uppercase tracking-wider mb-2 flex justify-between items-center">
                    <span>Today's Session</span>
                    {isDayComplete && <span className="text-[#00CC96] flex items-center gap-1 text-xs"><CheckCircle className="w-3 h-3" /> Done till 5AM</span>}
                </h3>
                {tasks.map((task) => {
                    const isCompleted = completedMap[task.id];
                    return (
                        <div
                            key={task.id}
                            className={`group p-4 rounded-lg border transition-all ${isCompleted
                                ? "bg-[#161B22]/30 border-[#30363D] opacity-50 grayscale"
                                : "bg-[#161B22] border-[#30363D] hover:border-[#00CC96]/50"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${isCompleted ? "bg-[#238636]/20 text-[#238636]" : "bg-[#30363D] text-[#8B949E]"}`}>
                                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${isCompleted ? "text-[#8B949E] line-through" : "text-white"}`}>
                                            {task.title}
                                        </h3>
                                        <p className="text-xs text-[#8B949E]">{task.reps} {task.sets ? `• ${task.sets} Sets` : ""}</p>
                                    </div>
                                </div>

                                {!isCompleted ? (
                                    <button
                                        onClick={() => handleComplete(task.id)}
                                        className="px-3 py-1.5 text-xs font-bold bg-[#30363D] hover:bg-[#00CC96] hover:text-black text-white rounded transition-colors"
                                    >
                                        Complete
                                    </button>
                                ) : (
                                    <span className="text-xs font-bold text-[#8B949E] bg-[#30363D]/50 px-3 py-1.5 rounded cursor-not-allowed">
                                        Wait 05:00
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Action */}
            <div className="mt-auto pt-4 border-t border-[#30363D] flex justify-between items-center">
                <div className="flex items-baseline gap-2">
                    <p className="text-xs text-[#8B949E]">Est. Recovery:</p>
                    <p className="text-sm font-bold text-white">~14 Days</p>
                </div>
                <button
                    onClick={handleMarkHealed}
                    className="flex items-center gap-2 text-xs font-bold text-[#8B949E] hover:text-[#00CC96] transition-colors"
                >
                    Mark Protocol Complete <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
