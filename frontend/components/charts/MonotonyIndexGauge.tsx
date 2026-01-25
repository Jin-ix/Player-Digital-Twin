"use client";

import { GenericBarChart } from "./GenericBarChart";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

export function MonotonyIndexGauge({ data }: { data: any[] }) {
    // data: [{ day: 'M', load: 300, monotony: 1.2 }, ...]
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{ backgroundColor: "#161B22", border: "1px solid #30363D", borderRadius: "8px" }}
                    labelStyle={{ color: "#8B949E" }}
                />
                <ReferenceLine y={2.0} stroke="#EF553B" strokeDasharray="3 3" label={{ value: "Danger (>2.0)", position: "insideTopRight", fill: "#EF553B", fontSize: 10 }} />
                <Bar dataKey="monotony" fill="#636EFA" radius={[4, 4, 0, 0]} name="Monotony Index" />
            </BarChart>
        </ResponsiveContainer>
    );
}
