"use client";

import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, Legend } from "recharts";

interface GenericScatterChartProps {
    data: any[];
    xKey: string;
    yKey: string;
    zKey?: string; // Optional bubble size
    nameKey?: string; // For tooltip label
    xAxisName?: string;
    yAxisName?: string;
}

export function GenericScatterChart({ data, xKey, yKey, zKey, nameKey, xAxisName, yAxisName }: GenericScatterChartProps) {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                    <XAxis
                        type="number"
                        dataKey={xKey}
                        name={xAxisName || xKey}
                        stroke="#8B949E"
                        tick={{ fill: "#8B949E", fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: "#30363D" }}
                    />
                    <YAxis
                        type="number"
                        dataKey={yKey}
                        name={yAxisName || yKey}
                        stroke="#8B949E"
                        tick={{ fill: "#8B949E", fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: "#30363D" }}
                    />
                    {zKey && <ZAxis type="number" dataKey={zKey} range={[50, 400]} />}
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ backgroundColor: '#161B22', borderRadius: '8px', border: '1px solid #30363D', color: '#fff' }}
                    />
                    <Legend />
                    <Scatter name={nameKey || "Player"} data={data} fill="#00CC96" />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
