"use client";

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

interface GenericLineChartProps {
    data: any[];
    lines: { key: string; color: string; name: string }[];
    xAxisKey: string;
}

export function GenericLineChart({ data, lines, xAxisKey }: GenericLineChartProps) {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                    <XAxis dataKey={xAxisKey} stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#161B22', borderRadius: '8px', border: '1px solid #30363D', color: '#fff' }}
                        cursor={{ stroke: '#30363D' }}
                    />
                    <Legend />
                    {lines.map((line) => (
                        <Line
                            key={line.key}
                            type="monotone"
                            dataKey={line.key}
                            stroke={line.color}
                            strokeWidth={2}
                            dot={false}
                            name={line.name}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
