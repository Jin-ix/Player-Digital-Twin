"use client";

import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid } from "recharts";

export function PsychPhysioChart({ data }: { data: any[] }) {
    // data: [{ rpe: 8, mood: 3, size: 100 }, ...]
    return (
        <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid stroke="#30363D" opacity={0.5} />
                <XAxis type="number" dataKey="rpe" name="RPE (Load)" stroke="#8B949E" label={{ value: 'Physical Load (RPE)', position: 'insideBottom', offset: -10, fill: '#8B949E', fontSize: 10 }} />
                <YAxis type="number" dataKey="mood" name="Mood" stroke="#8B949E" label={{ value: 'Psych State (Mood)', angle: -90, position: 'insideLeft', fill: '#8B949E', fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: "#161B22", border: "1px solid #30363D", borderRadius: "8px" }} />
                <Scatter name="Coherence" data={data} fill="#FFA15A" />
            </ScatterChart>
        </ResponsiveContainer>
    );
}
