"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface ACWRGaugeProps {
    value: number; // e.g., 1.15
}

export function ACWRGauge({ value }: ACWRGaugeProps) {
    // Gauge ranges: 0-0.8 (Orange), 0.8-1.3 (Green), 1.3-2.0+ (Red)
    // We'll normalize 0-2.0 to 100% (half circle 180 deg)

    // Simple visual sections
    const data = [
        { name: 'Low', value: 40, color: '#FFA15A' }, // 0 - 0.8 (40% of 2.0)
        { name: 'Optimal', value: 25, color: '#00CC96' }, // 0.8 - 1.3 (25% of 2.0)
        { name: 'High', value: 35, color: '#EF553B' }, // 1.3 - 2.0 (35% of 2.0)
    ];

    // Calculate needle rotation
    // Value 0 -> 180 deg (start)
    // Value 2 -> 0 deg (end)
    // Logic: 180 - (value / 2.0) * 180
    const clampedValue = Math.min(Math.max(value, 0), 2.0);
    const rotation = 180 + (clampedValue / 2.0) * 180;

    return (
        <div className="h-[250px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="70%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={80}
                        outerRadius={110}
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
                className="absolute bottom-[30%] left-1/2 w-[2px] h-[90px] bg-white origin-bottom transition-transform duration-1000 ease-out"
                style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            >
                <div className="w-4 h-4 rounded-full bg-white absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            </div>

            {/* Value Display */}
            <div className="absolute bottom-[0%] text-center transform translate-y-1/2">
                <span className="text-3xl font-bold text-white">{value.toFixed(2)}</span>
                <p className="text-xs text-[#8B949E] mt-1">ACWR Ratio</p>
            </div>
        </div>
    );
}
