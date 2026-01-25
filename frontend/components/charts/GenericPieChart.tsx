"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface GenericPieChartProps {
    data: { name: string; value: number; color?: string }[];
    innerRadius?: number; // For Donut charts
    outerRadius?: number;
}

const DEFAULT_COLORS = ['#00CC96', '#EF553B', '#FFA15A', '#636EFA', '#AB63FA'];

export function GenericPieChart({ data, innerRadius = 0, outerRadius = 80 }: GenericPieChartProps) {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} stroke="transparent" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#161B22', borderRadius: '8px', border: '1px solid #30363D', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
