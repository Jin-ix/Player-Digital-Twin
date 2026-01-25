import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface BatteryWidgetProps {
    label: string;
    value: number; // 0-100
    subtext: string;
}

export function BatteryWidget({ label, value, subtext }: BatteryWidgetProps) {
    let color = "#00CC96"; // Green
    if (value < 50) color = "#EF553B"; // Red
    else if (value < 80) color = "#FFA15A"; // Orange

    return (
        <GlassCard className="p-4 relative overflow-hidden group">
            {/* Background Pulse Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-[#8B949E] uppercase tracking-wider">{label}</span>
                <span className="text-2xl font-extrabold" style={{ color }}>{value}%</span>
            </div>

            {/* Battery Container */}
            <div className="h-3 bg-[#30363D] rounded-full overflow-hidden shadow-inner relative">
                {/* Fill */}
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${value}%`, backgroundColor: color }}
                >
                    {/* Striped Animation Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[moveStripe_1s_linear_infinite]" />
                </div>
            </div>

            <div className="mt-2 text-xs text-[#8B949E] flex items-center gap-1">
                {value >= 80 && <span className="w-2 h-2 rounded-full bg-[#00CC96] animate-pulse" />}
                {subtext}
            </div>
        </GlassCard>
    );
}
