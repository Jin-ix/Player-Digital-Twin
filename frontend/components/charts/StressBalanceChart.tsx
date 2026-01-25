"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

export function StressBalanceChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00CC96" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00CC96" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{ backgroundColor: "#161B22", border: "1px solid #30363D", borderRadius: "8px" }}
                    labelStyle={{ color: "#8B949E" }}
                />
                <ReferenceLine y={0} stroke="#8B949E" />
                <Area type="monotone" dataKey="balance" stroke="#00CC96" fillOpacity={1} fill="url(#colorBalance)" name="Stress Balance" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
