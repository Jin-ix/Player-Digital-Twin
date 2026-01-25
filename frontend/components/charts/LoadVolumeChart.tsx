"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";

interface LoadVolumeProps {
    data: { name: string; uv: number }[];
}

export function LoadVolumeChart({ data }: LoadVolumeProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00CC96" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00CC96" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                    <XAxis dataKey="name" stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#161B22', borderRadius: '8px', border: '1px solid #30363D', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="uv" stroke="#00CC96" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                    <ReferenceLine y={700} stroke="#EF553B" strokeDasharray="3 3" label={{ position: 'top', value: 'Overload Threshold', fill: '#EF553B', fontSize: 10 }} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
