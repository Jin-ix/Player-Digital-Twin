"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { GenericLineChart } from "@/components/charts/GenericLineChart";
import { RiskGauge } from "@/components/widgets/RiskGauge";
import { BioRadar } from "@/components/charts/BioRadar";
import { GenericBarChart } from "@/components/charts/GenericBarChart";
import { GenericScatterChart } from "@/components/charts/GenericScatterChart";
import { GenericPieChart } from "@/components/charts/GenericPieChart";
import { Activity, Users, Brain, Upload, Play, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, fetchAPI } from "@/lib/api";
import { supabase } from "@/lib/supabase";

function InjuredListWidget() {
    const [injuries, setInjuries] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchAPI("/injuries/all/active");
                setInjuries(data || []);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, []);

    if (injuries.length === 0) return <p className="text-[#8B949E] text-sm">No active injuries reported.</p>;

    return (
        <div className="space-y-3">
            {injuries.map((inj) => (
                <div key={inj.id} className="flex items-center justify-between p-3 bg-[#161B22] rounded border border-[#30363D]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EF553B]/20 flex items-center justify-center text-[#EF553B] font-bold text-xs">{inj.player_id.split('_')[1] || '10'}</div>
                        <div>
                            <p className="font-bold text-white text-sm uppercase">{inj.player_id.replace('_', ' ')}</p>
                            <p className="text-xs text-[#EF553B]">Protocol: {inj.injury_details?.injury_type || 'Unknown'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-[#8B949E]">Progress</p>
                        <p className="text-sm font-bold text-white">{inj.progress_percent || 0}%</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function CoachDashboard() {
    const [activeTab, setActiveTab] = useState("biomechanics");
    const [isProcessing, setIsProcessing] = useState(false);

    // Biomechanics State
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [bioData, setBioData] = useState<any>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    // Squad State
    const [squadData, setSquadData] = useState<any>(null);
    const squadInputRef = useRef<HTMLInputElement>(null);

    // AI Coach State
    const [aiData, setAiData] = useState<any>(null);

    // AI Inputs (Parity with Python)
    const [aiInputs, setAiInputs] = useState({
        // Profile
        sport: "Football", age: 24, weight: 75, height: 180,
        // External Load
        rpe: 7, duration: 90, chronicLoad: 2500, acwr: 1.1, sprintDist: 500,
        // Internal Load
        hrv: 65, restingHr: 55, sleepDuration: 7.5, stress: 40, vo2: 52, spo2: 98, hrResponse: 30,
        // Psych
        mood: 7, motivation: 8, lifeStress: 3, mentalFatigue: 4,
        // History
        useDb: false,
    });

    const tabs = [
        { id: "biomechanics", label: "Biomechanics (Player)", icon: Activity },
        { id: "squad", label: "Squad Manager", icon: Users },
        { id: "ai", label: "AI Coach (Anomaly)", icon: Brain },
    ];

    // --- HANDLERS ---

    const [dragActive, setDragActive] = useState(false);

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setVideoFile(e.dataTransfer.files[0]);
        }
    };

    const handleAnalysis = async () => {
        if (!videoFile) return;
        setIsProcessing(true);
        try {
            const data = await api.analyzeVideo(videoFile);
            setBioData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSquadUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsProcessing(true);
            try {
                const data = await api.uploadSquadCSV(e.target.files[0]);
                setSquadData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleRunAiScan = async () => {
        setIsProcessing(true);
        try {
            // Fetch History from Supabase if toggled
            let history = null;
            if (aiInputs.useDb) {
                const { data, error } = await supabase
                    .from('player_history')
                    .select('load, hrv, sleep')
                    .order('created_at', { ascending: true })
                    .limit(30);

                if (data) {
                    history = data.map((d: any) => [d.load, d.hrv, d.sleep]);
                }
            }

            const payload = {
                biometrics: {
                    sport: aiInputs.sport, age: aiInputs.age, weight: aiInputs.weight, height: aiInputs.height,
                    hrv: aiInputs.hrv, vo2_max: aiInputs.vo2, sleep_hours: aiInputs.sleepDuration,
                    stress_index: aiInputs.stress, resting_hr: aiInputs.restingHr, blood_oxygen: aiInputs.spo2,
                    hr_response: aiInputs.hrResponse, sleep_quality: 80
                },
                load_metrics: {
                    rpe: aiInputs.rpe, duration_minutes: aiInputs.duration,
                    chronic_tolerance: aiInputs.chronicLoad, acwr: aiInputs.acwr,
                    sprint_distance: aiInputs.sprintDist
                },
                wellness: {
                    mood_score: aiInputs.mood, motivation: aiInputs.motivation,
                    life_stress: aiInputs.lifeStress, mental_fatigue: aiInputs.mentalFatigue
                },
                history: history
            };
            const data = await api.runAnomalies(payload);
            setAiData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const updateAiInput = (key: string, value: any) => {
        setAiInputs(prev => ({ ...prev, [key]: value }));
    };

    // --- RENDER HELPERS ---

    const getChartData = () => {
        if (!bioData) return Array.from({ length: 50 }, (_, i) => ({ frame: i, flexion: 0, valgus: 0, forceLeft: 0, forceRight: 0 }));
        return bioData.frames.map((f: number, i: number) => ({
            frame: f,
            flexion: bioData.timeseries.flexion[i],
            valgus: bioData.timeseries.valgus[i],
            forceLeft: bioData.timeseries.grf_left[i],
            forceRight: bioData.timeseries.grf_right[i]
        }));
    };

    const getAsymmetryData = () => {
        if (!bioData) return [];
        const maxLeft = Math.max(...bioData.timeseries.grf_left);
        const maxRight = Math.max(...bioData.timeseries.grf_right);
        return [
            { name: "Left Leg", value: maxLeft, color: "#00CC96" },
            { name: "Right Leg", value: maxRight, color: "#AB63FA" }
        ];
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl font-bold">
                        ⚽ Coach <span className="gradient-text">Command Center</span>
                    </h1>
                    <p className="text-[#8B949E] mt-2">Advanced Analytics & Team Management</p>
                </motion.div>
            </div>

            {/* Tabs */}
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
                                    layoutId="activeTabCoach"
                                    className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#00CC96]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === "biomechanics" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Input Section */}
                            <div className="space-y-6">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <GlassCard
                                        className={cn(
                                            "border-dashed border-2 bg-transparent transition-colors cursor-pointer flex flex-col items-center justify-center relative overflow-hidden",
                                            dragActive ? "border-[#00CC96] bg-[#00CC96]/10" : "border-[#30363D] hover:border-[#00CC96]",
                                            videoFile ? "h-64" : "h-48"
                                        )}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => videoInputRef.current?.click()}
                                    >
                                        {videoFile ? (
                                            <div className="w-full h-full relative z-10 flex flex-col items-center justify-center p-2">
                                                {/* VIDEO PREVIEW */}
                                                <video
                                                    src={URL.createObjectURL(videoFile)}
                                                    className="w-full h-40 object-cover rounded-lg mb-2"
                                                    controls
                                                    muted
                                                />
                                                <p className="text-xs text-[#00CC96] font-bold truncate max-w-[200px]">{videoFile.name}</p>
                                                <p className="text-[10px] text-[#8B949E]">Click to change</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className={cn("w-10 h-10 mb-2", dragActive ? "text-[#00CC96]" : "text-[#8B949E]")} />
                                                <p className="text-sm text-[#8B949E]">
                                                    Drag & Drop or Click to Browse
                                                </p>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            ref={videoInputRef}
                                            onChange={handleVideoSelect}
                                            className="hidden"
                                            accept="video/*"
                                        />
                                    </GlassCard>
                                </motion.div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAnalysis}
                                    disabled={isProcessing || !videoFile}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all",
                                        isProcessing
                                            ? "bg-[#30363D] text-[#8B949E]"
                                            : videoFile
                                                ? "bg-[#00CC96] hover:bg-[#00B887] text-black shadow-[0_0_20px_rgba(0,204,150,0.3)]"
                                                : "bg-[#30363D] text-[#8B949E] cursor-not-allowed"
                                    )}
                                >
                                    {isProcessing ? (
                                        <>Processing Kinetics...</>
                                    ) : (
                                        <><Play className="w-5 h-5" /> Execute Physics Engine</>
                                    )}
                                </motion.button>

                                {bioData && (
                                    <GlassCard>
                                        <h3 className="text-sm font-bold text-[#8B949E] uppercase mb-4">Metric Snapshot</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-[#8B949E]">ACL Risk</p>
                                                <p className="text-2xl font-bold text-[#EF553B]">{bioData.metrics.acl_risk}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#8B949E]">Peak Valgus</p>
                                                <p className="text-2xl font-bold text-[#EF553B]">{bioData.metrics.peak_valgus}</p>
                                            </div>
                                        </div>
                                    </GlassCard>
                                )}
                            </div>

                            {/* Visualizations */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <GlassCard>
                                        <h3 className="font-bold mb-4">Dynamic ACL Risk Gauge</h3>
                                        <RiskGauge
                                            value={bioData ? parseFloat(bioData.metrics.peak_valgus) : 0}
                                            min={0} max={30} lowThreshold={10} highThreshold={15}
                                            label="Valgus Angle (°)"
                                        />
                                    </GlassCard>
                                    <GlassCard>
                                        <h3 className="font-bold mb-4">Athlete vs Elite Benchmark</h3>
                                        <BioRadar data={[
                                            { subject: 'Stability', A: bioData?.radar.athlete[0] || 50, fullMark: 100 },
                                            { subject: 'Force', A: bioData?.radar.athlete[2] || 60, fullMark: 100 },
                                            { subject: 'Power', A: bioData?.radar.athlete[4] || 70, fullMark: 100 },
                                            { subject: 'Mobility', A: bioData?.radar.athlete[3] || 60, fullMark: 100 },
                                            { subject: 'Symmetry', A: bioData?.radar.athlete[1] || 40, fullMark: 100 },
                                        ]} />
                                    </GlassCard>
                                </div>

                                {/* Graph 3: Joint Angle */}
                                <GlassCard>
                                    <h3 className="font-bold mb-4">Joint Angle Timeline</h3>
                                    <GenericLineChart
                                        data={getChartData()}
                                        xAxisKey="frame"
                                        lines={[
                                            { key: 'flexion', color: '#636EFA', name: 'Flexion' },
                                            { key: 'valgus', color: '#EF553B', name: 'Valgus Stress' }
                                        ]}
                                    />
                                </GlassCard>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Graph 4: GRF */}
                                    <GlassCard>
                                        <h3 className="font-bold mb-4">Ground Reaction Force</h3>
                                        <GenericLineChart
                                            data={getChartData()}
                                            xAxisKey="frame"
                                            lines={[
                                                { key: 'forceLeft', color: '#00CC96', name: 'Left Leg' },
                                                { key: 'forceRight', color: '#AB63FA', name: 'Right Leg' }
                                            ]}
                                        />
                                    </GlassCard>
                                    {/* Graph 5: Limb Asymmetry */}
                                    <GlassCard>
                                        <h3 className="font-bold mb-4">Limb Asymmetry Index</h3>
                                        <GenericBarChart
                                            data={getAsymmetryData()}
                                            xAxisKey="name"
                                            bars={[{ key: "value", color: "#636EFA", name: "Force (N)" }]}
                                        />
                                    </GlassCard>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "squad" && (
                        <div className="space-y-6">
                            {!squadData ? (
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <GlassCard
                                        className="flex flex-col items-center justify-center h-64 border-dashed border-2 border-[#30363D] cursor-pointer hover:border-[#00CC96] transition-colors"
                                        onClick={() => squadInputRef.current?.click()}
                                    >
                                        <Users className="w-12 h-12 text-[#8B949E] mb-4" />
                                        <h3 className="text-xl font-bold">Squad Management System</h3>
                                        <p className="text-[#8B949E] mb-4">Upload 'team_data.csv' to analyze squad readiness.</p>
                                        <button className="px-6 py-2 bg-[#30363D] hover:bg-[#404751] rounded-lg transition-colors pointer-events-none">
                                            Upload CSV
                                        </button>
                                        <input
                                            type="file"
                                            ref={squadInputRef}
                                            onChange={handleSquadUpload}
                                            className="hidden"
                                            accept=".csv"
                                        />
                                    </GlassCard>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-4 gap-4">
                                        <GlassCard className="text-center py-6">
                                            <p className="text-[#8B949E]">Squad Readiness</p>
                                            <p className="text-3xl font-bold text-[#00CC96]">{squadData.kpis.squad_readiness}</p>
                                        </GlassCard>
                                        <GlassCard className="text-center py-6">
                                            <p className="text-[#8B949E]">High Risk</p>
                                            <p className="text-3xl font-bold text-[#EF553B]">{squadData.kpis.high_risk_players}</p>
                                        </GlassCard>
                                        <GlassCard className="text-center py-6">
                                            <p className="text-[#8B949E]">Avg Load</p>
                                            <p className="text-3xl font-bold text-white">{squadData.kpis.avg_load}</p>
                                        </GlassCard>
                                        <GlassCard className="text-center py-6">
                                            <p className="text-[#8B949E]">Compliance</p>
                                            <p className="text-3xl font-bold text-[#00CC96]">{squadData.kpis.compliance}</p>
                                        </GlassCard>
                                    </div>

                                    {/* Row 1: Scatter & Heatmap (Mocked as Bar for now if Heatmap N/A) */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <GlassCard>
                                            <h3 className="font-bold mb-4">1. Load vs Recovery Clustering</h3>
                                            <GenericScatterChart
                                                data={squadData.charts.scatter}
                                                xKey="Acute Load"
                                                yKey="Recovery"
                                                zKey="Risk Score"
                                                nameKey="Player"
                                            />
                                        </GlassCard>
                                        <GlassCard>
                                            <h3 className="font-bold mb-4">2. Wellness Trend vs Load</h3>
                                            <GenericLineChart
                                                data={squadData.charts.trend}
                                                xAxisKey="name"
                                                lines={[
                                                    { key: 'load', color: '#636EFA', name: 'Acute Load' },
                                                    { key: 'recovery', color: '#FFA15A', name: 'Recovery Score' }
                                                ]}
                                            />
                                        </GlassCard>
                                    </div>

                                    {/* Row 2: Distributions */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <GlassCard>
                                            <h3 className="font-bold mb-4">3. Risk Zone Distribution</h3>
                                            <GenericPieChart data={squadData.charts.risk_zones} />
                                        </GlassCard>
                                        <GlassCard>
                                            <h3 className="font-bold mb-4">4. Compliance</h3>
                                            <GenericPieChart data={squadData.charts.compliance} innerRadius={60} />
                                        </GlassCard>
                                        <GlassCard>
                                            <h3 className="font-bold mb-4">5. ACWR Distribution</h3>
                                            <GenericBarChart
                                                data={squadData.charts.acwr_dist}
                                                xAxisKey="name"
                                                bars={[{ key: "value", color: "#00CC96", name: "ACWR" }]}
                                            />
                                        </GlassCard>
                                    </div>
                                </>
                            )}
                            {/* INJURED PLAYERS WIDGET (NEW) */}
                            <GlassCard className="col-span-1 md:col-span-2 relative overflow-hidden border-[#EF553B]/50">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EF553B]/10 blur-[50px] rounded-full" />
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                                    <AlertTriangle className="w-5 h-5 text-[#EF553B]" /> Injured Reserve (Active Protocols)
                                </h3>
                                {/* Fetch and display active injuries here using inline fetch for speed */}
                                <InjuredListWidget />
                            </GlassCard>
                        </div>
                    )}

                    {activeTab === "ai" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-1 space-y-4">
                                <GlassCard className="overflow-y-auto max-h-[800px] pr-2">
                                    <h3 className="font-bold mb-4 border-b border-[#30363D] pb-2 text-[#00CC96]">Input Matrix</h3>

                                    <div className="space-y-6">
                                        {/* External Load */}
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold text-white uppercase tracking-wider">External Load</p>
                                            <div>
                                                <div className="flex justify-between text-xs text-[#8B949E] mb-1">
                                                    <span>Session RPE ({aiInputs.rpe})</span>
                                                </div>
                                                <input type="range" min="1" max="10" value={aiInputs.rpe} onChange={(e) => updateAiInput('rpe', parseInt(e.target.value))} className="w-full accent-[#00CC96]" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs text-[#8B949E] mb-1">
                                                    <span>Duration ({aiInputs.duration} min)</span>
                                                </div>
                                                <input type="number" value={aiInputs.duration} onChange={(e) => updateAiInput('duration', parseInt(e.target.value))} className="w-full bg-[#161B22] border border-[#30363D] rounded px-3 py-1 text-xs text-white" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs text-[#8B949E] mb-1">
                                                    <span>ACWR ({aiInputs.acwr})</span>
                                                </div>
                                                <input type="range" min="0.5" max="2.0" step="0.1" value={aiInputs.acwr} onChange={(e) => updateAiInput('acwr', parseFloat(e.target.value))} className="w-full accent-[#00CC96]" />
                                            </div>
                                        </div>

                                        <div className="h-px bg-[#30363D]" />

                                        {/* Internal Load */}
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold text-white uppercase tracking-wider">Internal Load</p>
                                            <div>
                                                <div className="flex justify-between text-xs text-[#8B949E] mb-1">
                                                    <span>HRV ({aiInputs.hrv} ms)</span>
                                                </div>
                                                <input type="range" min="10" max="200" value={aiInputs.hrv} onChange={(e) => updateAiInput('hrv', parseInt(e.target.value))} className="w-full accent-[#636EFA]" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs text-[#8B949E] mb-1">
                                                    <span>Sleep ({aiInputs.sleepDuration} hr)</span>
                                                </div>
                                                <input type="range" min="3" max="12" step="0.5" value={aiInputs.sleepDuration} onChange={(e) => updateAiInput('sleepDuration', parseFloat(e.target.value))} className="w-full accent-[#636EFA]" />
                                            </div>
                                        </div>

                                        <div className="h-px bg-[#30363D]" />

                                        {/* Psych */}
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold text-white uppercase tracking-wider">Psych Context</p>
                                            <div>
                                                <div className="flex justify-between text-xs text-[#8B949E] mb-1">
                                                    <span>Mood ({aiInputs.mood})</span>
                                                </div>
                                                <input type="range" min="1" max="10" value={aiInputs.mood} onChange={(e) => updateAiInput('mood', parseInt(e.target.value))} className="w-full accent-[#FFA15A]" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={aiInputs.useDb} onChange={(e) => updateAiInput('useDb', e.target.checked)} className="accent-[#00CC96]" />
                                                <span className="text-xs text-[#8B949E]">Fetch History (Supabase)</span>
                                            </div>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleRunAiScan}
                                            disabled={isProcessing}
                                            className="w-full py-3 bg-[#636EFA] rounded-lg font-bold hover:bg-[#525EFA] shadow-[0_0_15px_rgba(99,110,250,0.3)] transition-all"
                                        >
                                            {isProcessing ? "Scanning Engine..." : "Run Full Scan"}
                                        </motion.button>
                                    </div>
                                </GlassCard>
                            </div>

                            <div className="col-span-2 space-y-6">
                                {aiData ? (
                                    <>
                                        <GlassCard className="bg-[#636EFA]/10 border-[#636EFA]/30 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#636EFA]/20 blur-[50px] rounded-full" />
                                            <div className="flex items-start gap-4 relative z-10">
                                                <div className="w-12 h-12 bg-[#636EFA]/20 rounded-full flex items-center justify-center">
                                                    <Brain className="w-6 h-6 text-[#636EFA]" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-[#636EFA]">RL Coach Policy</h3>
                                                    <p className="text-2xl font-bold text-white mt-1">
                                                        {aiData.raw_metrics.rl_strategy.action}
                                                    </p>
                                                    <div className="flex gap-4 mt-2">
                                                        <span className="text-sm px-2 py-1 rounded bg-[#636EFA]/20 text-[#636EFA] border border-[#636EFA]/50">
                                                            Confidence: {aiData.raw_metrics.rl_strategy.confidence}%
                                                        </span>
                                                        <span className="text-sm px-2 py-1 rounded bg-[#30363D] text-[#8B949E] border border-[#30363D]">
                                                            State: {aiData.raw_metrics.rl_strategy.state_assessment}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </GlassCard>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <GlassCard>
                                                <h3 className="font-bold mb-4">Anomaly Timeline</h3>
                                                <GenericLineChart
                                                    data={aiData.forecast.map((val: number, i: number) => ({ frame: i, value: val }))}
                                                    xAxisKey="frame"
                                                    lines={[{ key: 'value', color: '#EF553B', name: 'Risk Forecast' }]}
                                                />
                                            </GlassCard>

                                            {/* Recommendations List */}
                                            <GlassCard>
                                                <h3 className="font-bold mb-4">AI Recommendations</h3>
                                                <div className="space-y-2 h-[200px] overflow-y-auto">
                                                    {aiData.recommendations.map((rec: string, i: number) => (
                                                        <div key={i} className="flex items-start gap-2 text-sm text-[#8B949E] p-2 hover:bg-[#30363D] rounded transition-colors">
                                                            <CheckCircle className="w-4 h-4 text-[#00CC96] mt-0.5 shrink-0" />
                                                            <span>{rec}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </GlassCard>
                                        </div>

                                        {/* Row 2: Advanced AI Graphs (Requirement: 5 Graphs) */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <GlassCard>
                                                <h3 className="font-bold mb-4">3. Recovery Link (Sleep vs HRV)</h3>
                                                <GenericScatterChart
                                                    data={aiData.raw_metrics.recovery_scatter || []}
                                                    xKey="sleep"
                                                    yKey="hrv"
                                                    zKey="size"
                                                    xAxisName="Sleep (h)"
                                                    yAxisName="HRV (ms)"
                                                />
                                            </GlassCard>
                                            <GlassCard>
                                                <h3 className="font-bold mb-4">4. Load Volume Distribution</h3>
                                                <GenericBarChart
                                                    data={aiData.raw_metrics.load_vol || []}
                                                    xAxisKey="day"
                                                    bars={[{ key: "load", color: "#AB63FA", name: "Load (AU)" }]}
                                                />
                                            </GlassCard>
                                            <GlassCard>
                                                <h3 className="font-bold mb-4">5. Recovery Tank</h3>
                                                {/* Using Area Chart via Line Chart component if possible or GenericLineChart */}
                                                <GenericLineChart
                                                    data={aiData.raw_metrics.recovery_tank || []}
                                                    xAxisKey="day"
                                                    lines={[{ key: "fuel", color: "#00CC96", name: "Fuel %" }]}
                                                />
                                            </GlassCard>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-50">
                                        <Brain className="w-24 h-24 text-[#8B949E] mb-4" />
                                        <p className="text-xl text-[#8B949E]">Awaiting Input Parameters</p>
                                        <p className="text-sm text-[#8B949E]/50">Adjust sliders and run scan to activate AI Coach</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
