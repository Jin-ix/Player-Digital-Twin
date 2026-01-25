"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

interface BioRadarProps {
    data: { subject: string; A: number; fullMark: number }[];
}

export function BioRadar({ data }: BioRadarProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
                    <PolarGrid stroke="#30363D" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Player"
                        dataKey="A"
                        stroke="#636EFA"
                        strokeWidth={2}
                        fill="#636EFA"
                        fillOpacity={0.3}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#161B22', borderRadius: '8px', border: '1px solid #30363D', color: '#fff' }}
                        itemStyle={{ color: '#636EFA' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
