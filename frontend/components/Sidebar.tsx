"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Users, Zap, Settings, Activity, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, UserRole } from "@/app/context/AuthContext";

const allLinks = [
    { href: "/dashboard", label: "Home", icon: Home, roles: ["coach", "athlete"] },
    { href: "/dashboard/player", label: "Player Locker Room", icon: Zap, roles: ["athlete"] },
    { href: "/dashboard/coach", label: "Coach Command Center", icon: Users, roles: ["coach"] },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["coach", "athlete"] },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Default to 'athlete' if no user (fallback), though Login should handle this.
    // STRICT: If logged in as coach, do NOT show player links even if fallback might desire it.
    const role: UserRole = user?.role || "athlete";

    // Filter links based on role. 
    // Additional check: If role is 'coach', strictly exclude 'Player Locker Room' even if it somehow got into the list.
    const links = allLinks.filter(link => {
        if (!link.roles.includes(role)) return false;
        // Double check for exclusive separation
        if (role === 'coach' && link.label === 'Player Locker Room') return false;
        if (role === 'athlete' && link.label === 'Coach Command Center') return false;
        return true;
    });

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 bg-[#161B22]/95 border-r border-[#30363D] flex flex-col z-50 backdrop-blur-md">
            <div className="p-6 flex items-center gap-3">
                <Activity className="w-8 h-8 text-[#00CC96] animate-pulse" />
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00CC96] to-[#636EFA]">
                    PREHAB 2.0
                </h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-[#00CC96]/10 text-[#00CC96] font-medium"
                                    : "text-[#8B949E] hover:bg-[#30363D]/50 hover:text-white"
                            )}
                        >
                            <div className={cn("absolute inset-0 bg-gradient-to-r from-[#00CC96]/20 to-transparent opacity-0 transition-opacity", isActive ? "opacity-100" : "group-hover:opacity-50")} />
                            <Icon className={cn("w-5 h-5 z-10", isActive && "animate-bounce")} />
                            <span className="z-10">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-[#30363D]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00CC96] to-[#636EFA] flex items-center justify-center font-bold text-white">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : "JD"}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{user?.name || "John Doe"}</p>
                        <p className="text-xs text-[#8B949E]">{role === "coach" ? "Head Coach" : "Elite Athlete"}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 text-xs text-[#EF553B] hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-3 h-3" /> Sign Out
                </button>
            </div>
        </aside>
    );
}
