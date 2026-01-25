"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface RiskGaugeProps {
    value: number; // 0-100 scale usually or specific domain
    min: number;
    max: number;
    lowThreshold: number;
    highThreshold: number;
    label: string;
}

export function RiskGauge({ value, min, max, lowThreshold, highThreshold, label }: RiskGaugeProps) {

    // Normalize value to 0-100 for rotation calculation if needed, but here we just render segments
    // We visualize segments as Low (Green), Med (Orange), High (Red) usually?
    // Or based on thresholds.

    const data = [
        { name: 'Low', value: lowThreshold - min, color: '#00CC96' },
        { name: 'Med', value: highThreshold - lowThreshold, color: '#FFA15A' },
        { name: 'High', value: max - highThreshold, color: '#EF553B' },
    ];

    // Rotation logic
    const total = max - min;
    const normalizedValue = Math.min(Math.max((value - min) / total, 0), 1);
    const rotation = 180 + (normalizedValue * 180);

    return (
        <div className="h-[200px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="70%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            {/* Needle */}
            <div
                className="absolute bottom-[30%] left-1/2 w-[2px] h-[70px] bg-white origin-bottom transition-transform duration-1000 ease-out"
                style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            >
                <div className="w-3 h-3 rounded-full bg-white absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            </div>

            {/* Value Display */}
            <div className="absolute bottom-[5%] text-center transform translate-y-1/2">
                <span className="text-2xl font-bold text-white">{value.toFixed(1)}</span>
                <p className="text-xs text-[#8B949E]">{label}</p>
            </div>
        </div>
    );
}
