"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function RecoveryVelocityChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" opacity={0.5} vertical={false} />
                <XAxis dataKey="day" stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{ backgroundColor: "#161B22", border: "1px solid #30363D", borderRadius: "8px" }}
                    labelStyle={{ color: "#8B949E" }}
                />
                <Line type="monotone" dataKey="recovery" stroke="#AB63FA" strokeWidth={3} dot={{ r: 4, fill: "#AB63FA", strokeWidth: 0 }} activeDot={{ r: 6 }} name="Recovery %" />
            </LineChart>
        </ResponsiveContainer>
    );
}
