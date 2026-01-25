"use client";

import { cn } from "@/lib/utils";
import { fetchAPI } from "@/lib/api";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ACWRGauge } from "@/components/widgets/ACWRGauge";
import { BatteryWidget } from "@/components/widgets/BatteryWidget";
import { BioRadar } from "@/components/charts/BioRadar";
import { LoadVolumeChart } from "@/components/charts/LoadVolumeChart";
import { GenericLineChart } from "@/components/charts/GenericLineChart";
import { GenericScatterChart } from "@/components/charts/GenericScatterChart";
import { GenericPieChart } from "@/components/charts/GenericPieChart";
import { GlassCard } from "@/components/ui/GlassCard";
import { Activity, Calendar, FileText, User, Save, RefreshCw, Zap, AlertTriangle, Brain } from "lucide-react";
import { BodyMap } from "@/components/widgets/BodyMap";
import { MonotonyIndexGauge } from "@/components/charts/MonotonyIndexGauge";
import { StressBalanceChart } from "@/components/charts/StressBalanceChart";
import { RecoveryVelocityChart } from "@/components/charts/RecoveryVelocityChart";
import { PsychPhysioChart } from "@/components/charts/PsychPhysioChart";
// import { InjuryTriageModal } from "@/components/injury/InjuryTriageModal";
// import { LockedHomework } from "@/components/injury/LockedHomework";
import { RehabCenter } from "@/components/injury/RehabCenter";
import { BodyAnalyticsHub } from "@/components/widgets/BodyAnalyticsHub";
import { PlayerProfileCard } from "@/components/widgets/PlayerProfileCard";
// import { toast } from "sonner";

export default function PlayerDashboard() {
    const [activeTab, setActiveTab] = useState("performance");

    // Mock Data (matches dashboard.py logic)
    const wellness = 85;
    const freshness = 70;
    const systemCharge = Math.round((wellness * 0.6) + (freshness * 0.4));

    const loadVolumeData = Array.from({ length: 30 }, (_, i) => ({
        name: `Day ${i + 1}`,
        uv: Math.floor(Math.random() * (800 - 100 + 1) + 100),
    }));

    const radarData = [
        { subject: 'Sleep', A: 85, fullMark: 100 },
        { subject: 'Mood', A: 70, fullMark: 100 },
        { subject: 'Freshness', A: 60, fullMark: 100 },
        { subject: 'Physio', A: 90, fullMark: 100 },
        { subject: 'Diet', A: 75, fullMark: 100 },
    ];

    // --- LOG & TWIN STATE ---
    const [logData, setLogData] = useState({
        rpe: 7,
        duration: 90,
        sleep: 7.5,
        mood: 3,
        soreness: 2
    });

    const [twinStatus, setTwinStatus] = useState({
        knee_risk: "Normal" as "Normal" | "High",
        ankle_risk: "Normal" as "Normal" | "High",
        alerts: [] as string[]
    });
    const [isSyncing, setIsSyncing] = useState(false);

    // --- INJURY & TRIAGE STATE ---
    const [activeInjury, setActiveInjury] = useState<any>(null); // If not null, player is locked
    const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

    // Check for active injury on load
    const checkActiveInjury = async () => {
        try {
            // Using centralized API client
            const data = await fetchAPI("/injuries/current/player_10");
            if (data) {
                setActiveInjury(data);
            } else {
                setActiveInjury(null);
            }
        } catch (e) {
            console.error("Failed to check injury status", e);
            // Optional: toast.error("Could not fetch injury status");
        }
    };

    useEffect(() => {
        checkActiveInjury();
    }, []);

    // Restored: Click from Log Tab or Rehab Tab
    const handleBodyPartClick = (part: string) => {
        // Allow browsing other parts even if injured
        setSelectedBodyPart(part);
        setActiveTab("rehab"); // Auto-switch to rehab tab to show triage
    };

    const handleActivateProtocol = async (injuryId: number) => {
        try {
            await fetchAPI("/injuries/assign", {
                method: "POST",
                body: JSON.stringify({
                    player_id: "player_10",
                    injury_library_id: injuryId
                })
            });

            // If we get here, it succeeded (fetchAPI throws on error)
            await checkActiveInjury();
            // Clear selection so RehabCenter shows the ActiveProtocol view
            setSelectedBodyPart(null);
            setActiveTab("rehab"); // Ensure we are on the tab
        } catch (e) {
            console.error("Failed to assign injury", e);
            alert("Failed to assign injury. Check console for details.");
        }
    };

    const handleHealed = () => {
        checkActiveInjury();
    };


    // Sync Logic
    const handleSync = async () => {
        // Prevent sync if active injury rehab is not done? (Optional constraint from requirements)
        // For now, allow sync.
        setIsSyncing(true);
        try {
            const data = await fetchAPI("/analytics/log", {
                method: "POST",
                body: JSON.stringify({
                    player_id: "player_10",
                    rpe: logData.rpe,
                    duration: logData.duration,
                    sleep_hours: logData.sleep,
                    mood: logData.mood,
                    soreness: logData.soreness
                })
            });

            if (data) {
                setTwinStatus(data.twin_status);
                // Simple feedback (could use toast)
            }
        } catch (e) {
            console.error("Sync failed", e);
        } finally {
            setIsSyncing(false);
        }
    };

    // --- INSIGHTS DATA GENERATION (Mocked for Demo, ideally comes from history API) ---
    const getTwinInsights = () => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return {
            acwr: days.map((d, i) => ({
                day: d,
                val: (0.8 + Math.random() * 0.5).toFixed(2), // 0.8 - 1.3
                safe_min: 0.8,
                safe_max: 1.3
            })),
            wellness: [
                { subject: 'Sleep', A: logData.sleep * 10, fullMark: 120 }, // Scale 12h to 120
                { subject: 'Mood', A: logData.mood * 20, fullMark: 100 },
                { subject: 'Energy', A: 80, fullMark: 100 },
                { subject: 'Soreness', A: (5 - logData.soreness) * 20, fullMark: 100 }, // Inverse soreness
                { subject: 'Stress', A: 70, fullMark: 100 },
            ],
            loadVsSoreness: days.map((d, i) => ({
                day: d,
                load: Math.floor(Math.random() * 500) + 200,
                soreness: Math.floor(Math.random() * 5)
            }))
        };
    };

    const insights = getTwinInsights();

    const tabs = [
        { id: "performance", label: "Performance Lab", icon: Activity },
        { id: "log", label: "Log & Twin", icon: Calendar },
        { id: "rehab", label: "Rehabilitation", icon: activeInjury ? AlertTriangle : FileText },
        { id: "profile", label: "Profile", icon: User },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Injury Triage Modal Removed - Now Inline in RehabCenter */}
            {/* <InjuryTriageModal ... /> */}

            {/* Header & Batteries */}
            <div>
                <h1 className="text-4xl font-bold mb-6">
                    👋 Locker Room: <span className="gradient-text">Player #10</span>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <BatteryWidget label="System Charge" value={systemCharge} subtext="Ready for Match Day" />
                    <BatteryWidget label="Acute Load" value={65} subtext="Optimal Range" />
                    <BatteryWidget label="Recovery" value={92} subtext="Supercompensated" />
                    <BatteryWidget label="Injury Risk" value={activeInjury ? 90 : 12} subtext={activeInjury ? "Injury Active" : "Low Probability"} />
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-4 border-b border-[#30363D] pb-1 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${isActive ? "text-[#00CC96]" : "text-[#8B949E] hover:text-white"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#00CC96]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === "performance" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Row 1: ACWR & Radar */}
                            <GlassCard className="h-full">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-[#FFA15A] rounded-full" />
                                    Current Acute:Chronic Ratio
                                </h3>
                                <ACWRGauge value={1.15} />
                            </GlassCard>

                            <GlassCard className="h-full">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-[#636EFA] rounded-full" />
                                    Bio-Radar System Check
                                </h3>
                                <BioRadar data={radarData} />
                            </GlassCard>

                            <GlassCard className="lg:col-span-2">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-[#00CC96] rounded-full" />
                                    60-Day Load Volume History
                                </h3>
                                <LoadVolumeChart data={loadVolumeData} />
                            </GlassCard>

                            {/* Row 3: New Insightful Graphs */}
                            <GlassCard className="h-full">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-[#AB63FA] rounded-full" />
                                    Physio-Load Correlation
                                </h3>
                                <GenericScatterChart
                                    data={Array.from({ length: 20 }, (_, i) => ({
                                        load: Math.floor(Math.random() * 800),
                                        readiness: Math.floor(Math.random() * 100),
                                        size: Math.random() * 300
                                    }))}
                                    xKey="load"
                                    yKey="readiness"
                                    zKey="size"
                                    xAxisName="Load (AU)"
                                    yAxisName="Readiness"
                                    nameKey="Session"
                                />
                                <p className="text-xs text-[#8B949E] mt-2 text-center">High Load with Low Readiness = Injury Risk</p>
                            </GlassCard>

                            <GlassCard className="h-full">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-[#EF553B] rounded-full" />
                                    Training Focus Distribution
                                </h3>
                                <GenericPieChart
                                    data={[
                                        { name: "Strength", value: 35, color: "#EF553B" },
                                        { name: "Cardio", value: 45, color: "#00CC96" },
                                        { name: "Mobility", value: 20, color: "#636EFA" }
                                    ]}
                                    innerRadius={60}
                                    outerRadius={80}
                                />
                                <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                    <span className="text-2xl font-bold text-white">100%</span>
                                    <p className="text-[10px] text-[#8B949E]">FOCUS</p>
                                </div>
                            </GlassCard>
                        </div>
                    )}

                    {activeTab === "log" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* LEFT: DAILY LOG FORM */}
                                <GlassCard className="lg:col-span-1 h-fit">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <FileText className="text-[#00CC96]" /> Daily Log
                                    </h3>

                                    <div className="space-y-6">
                                        {/* Workload */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-[#8B949E] uppercase">Session Duration (min)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[#0D1117] border border-[#30363D] rounded px-3 py-2 text-white focus:border-[#00CC96] outline-none"
                                                value={logData.duration}
                                                onChange={(e) => setLogData({ ...logData, duration: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <label className="text-xs font-bold text-[#8B949E] uppercase">RPE (Intensity)</label>
                                                <span className="text-sm font-bold text-[#00CC96]">{logData.rpe}/10</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="10" step="1"
                                                className="w-full accent-[#00CC96]"
                                                value={logData.rpe}
                                                onChange={(e) => setLogData({ ...logData, rpe: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <div className="h-px bg-[#30363D] my-4" />

                                        {/* Wellness */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <label className="text-xs font-bold text-[#8B949E] uppercase">Sleep (Hours)</label>
                                                <span className="text-sm font-bold text-[#636EFA]">{logData.sleep}h</span>
                                            </div>
                                            <input
                                                type="range" min="3" max="12" step="0.5"
                                                className="w-full accent-[#636EFA]"
                                                value={logData.sleep}
                                                onChange={(e) => setLogData({ ...logData, sleep: parseFloat(e.target.value) })}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <label className="text-xs font-bold text-[#8B949E] uppercase">Soreness Level</label>
                                                <span className={(logData.soreness >= 4 ? "text-[#EF553B]" : "text-[#00CC96]") + " text-sm font-bold"}>
                                                    {logData.soreness}/5
                                                </span>
                                            </div>
                                            <input
                                                type="range" min="1" max="5" step="1"
                                                className={"w-full " + (logData.soreness >= 4 ? "accent-[#EF553B]" : "accent-[#00CC96]")}
                                                value={logData.soreness}
                                                onChange={(e) => setLogData({ ...logData, soreness: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <label className="text-xs font-bold text-[#8B949E] uppercase">Mood State</label>
                                                <span className="text-sm font-bold text-[#FFA15A]">{logData.mood}/5</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="5" step="1"
                                                className="w-full accent-[#FFA15A]"
                                                value={logData.mood}
                                                onChange={(e) => setLogData({ ...logData, mood: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <button
                                            onClick={handleSync}
                                            disabled={isSyncing}
                                            className="w-full mt-4 bg-[#238636] hover:bg-[#2EA043] text-white py-3 rounded-md font-bold flex items-center justify-center gap-2 transition-all"
                                        >
                                            {isSyncing ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                            Sync to Digital Twin
                                        </button>
                                    </div>
                                </GlassCard>

                                {/* RIGHT: DIGITAL TWIN VISUALIZATION */}
                                <GlassCard className="lg:col-span-2 relative min-h-[500px] flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <User className="text-[#636EFA]" /> Digital Twin v2.0
                                            </h3>
                                            <p className="text-[#8B949E] text-sm">Real-time physiological mapping</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-[#8B949E]">Acute Load</p>
                                            <p className={cn("text-2xl font-bold", twinStatus.knee_risk === "High" ? "text-[#EF553B]" : "text-white")}>
                                                {logData.rpe * logData.duration} AU
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-1 items-center justify-center gap-10">
                                        {/* MANNEQUIN */}
                                        <div className="w-[200px] relative hover:scale-105 transition-transform duration-300">
                                            <BodyMap
                                                kneeRisk={twinStatus.knee_risk}
                                                ankleRisk={twinStatus.ankle_risk}
                                                onPartClick={handleBodyPartClick}
                                            />

                                            {/* GLOW EFFECT BEHIND */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-[#636EFA] blur-[60px] opacity-10 rounded-full z-[-1]" />
                                            <p className="text-xs text-center text-[#8B949E] mt-4 opacity-70">Tap Body Part to Report Injury</p>
                                        </div>

                                        {/* DIAGNOSTIC REPORT SIDE PANEL */}
                                        <div className="hidden md:block w-[250px] space-y-4">
                                            <div className="bg-[#161B22] p-4 rounded-lg border border-[#30363D]">
                                                <h4 className="font-bold text-[#8B949E] text-xs uppercase mb-2">Diagnostic Report</h4>

                                                {twinStatus.alerts.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {twinStatus.alerts.map((alert, i) => (
                                                            <div key={i} className="flex items-start gap-2 text-[#EF553B] bg-[#EF553B]/10 p-2 rounded text-xs font-bold animate-pulse">
                                                                <Activity className="w-3 h-3 mt-0.5" />
                                                                {alert}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-[#00CC96] text-sm">
                                                        <RefreshCw className="w-4 h-4" /> System Nominal
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-[#161B22] p-4 rounded-lg border border-[#30363D]">
                                                <h4 className="font-bold text-[#8B949E] text-xs uppercase mb-2">Metrics Context</h4>
                                                <div className="space-y-2 text-xs text-[#8B949E]">
                                                    <div className="flex justify-between">
                                                        <span>Knee Load:</span>
                                                        <span className={twinStatus.knee_risk == "High" ? "text-[#EF553B]" : "text-white"}>{twinStatus.knee_risk}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Ankle Stress:</span>
                                                        <span className={twinStatus.ankle_risk == "High" ? "text-[#EF553B]" : "text-white"}>{twinStatus.ankle_risk}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>

                            {/* INSIGHTS ROW (4 Graphs Enhanced) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
                                {/* 1. ACWR Trend (Existing) */}
                                <GlassCard>
                                    <h3 className="font-bold mb-4 text-white flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-[#636EFA]" /> ACWR Trend
                                    </h3>
                                    <GenericLineChart
                                        data={insights.acwr}
                                        xAxisKey="day"
                                        lines={[
                                            { key: "val", color: "#636EFA", name: "ACWR" },
                                            { key: "safe_max", color: "#30363D", name: "Limit" }
                                        ]}
                                    />
                                </GlassCard>

                                {/* 2. Stress Balance (NEW) */}
                                <GlassCard>
                                    <h3 className="font-bold mb-4 text-white flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-[#00CC96]" /> Stress Balance
                                    </h3>
                                    <StressBalanceChart data={insights.acwr.map(d => ({ day: d.day, balance: (parseFloat(d.val) - 1.0) * 10 }))} />
                                    <p className="text-xs text-[#8B949E] mt-2 text-center">Positive = Performance Ready</p>
                                </GlassCard>

                                {/* 3. Monotony Index (NEW) */}
                                <GlassCard>
                                    <h3 className="font-bold mb-4 text-white flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-[#FFA15A]" /> Training Monotony
                                    </h3>
                                    <MonotonyIndexGauge data={insights.acwr.map(d => ({ day: d.day, monotony: Math.random() * 1.5 + 0.5 }))} />
                                    <p className="text-xs text-[#8B949E] mt-2 text-center">Avoid spikes {">"} 2.0</p>
                                </GlassCard>

                                {/* 4. Load vs Soreness (Existing) */}
                                <GlassCard>
                                    <h3 className="font-bold mb-4 text-white flex items-center gap-2">
                                        <Save className="w-4 h-4 text-[#EF553B]" /> Load Impact
                                    </h3>
                                    <GenericLineChart
                                        data={insights.loadVsSoreness}
                                        xAxisKey="day"
                                        lines={[
                                            { key: "load", color: "#00CC96", name: "Load" },
                                            { key: "soreness", color: "#EF553B", name: "Soreness (x100)" }
                                        ]}
                                    />
                                </GlassCard>

                                {/* 5. Recovery Velocity (NEW for Log/Twin context but placing here for visualisation density as requested) */}
                                <GlassCard>
                                    <h3 className="font-bold mb-4 text-white flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-[#AB63FA]" /> Recovery Velocity
                                    </h3>
                                    <RecoveryVelocityChart data={insights.acwr.map(d => ({ day: d.day, recovery: Math.random() * 100 }))} />
                                </GlassCard>

                                {/* 6. Psych-Physio (NEW) */}
                                <GlassCard>
                                    <h3 className="font-bold mb-4 text-white flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-[#FFA15A]" /> Psych-Physio Coherence
                                    </h3>
                                    <PsychPhysioChart data={Array.from({ length: 20 }, () => ({ rpe: Math.floor(Math.random() * 10), mood: Math.floor(Math.random() * 5), size: 100 }))} />
                                </GlassCard>
                            </div>
                        </div>
                    )}

                    {activeTab === "rehab" && (
                        <RehabCenter
                            activeInjury={activeInjury}
                            selectedBodyPart={selectedBodyPart}
                            onSelectPart={setSelectedBodyPart}
                            onActivate={handleActivateProtocol}
                            onHealed={handleHealed}
                        />
                    )}

                    {activeTab === "profile" && (
                        <ProfileSection />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// Sub-component for Profile Tab to handle data fetching cleanly
function ProfileSection() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            // Mock ID for demo, usually comes from context or params
            const playerId = "player_10";
            try {
                // Fetch from our new endpoint
                const res = await fetchAPI(`/profiles/${playerId}`);
                setData(res);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                // Fallback mock if API fails (for robustness during dev)
                setData({
                    player_id: "player_10",
                    height: 182,
                    weight: 76,
                    position: "Attacking Midfielder",
                    jersey_number: 10,
                    bio: "A dynamic playmaker known for vision and agility. Specializes in breaking defensive lines and set-pieces. Currently focusing on lower-body strength and injury prevention."
                });
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    return <PlayerProfileCard data={data} isLoading={loading} />;
}
