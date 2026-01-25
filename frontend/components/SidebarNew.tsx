"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Activity,
    Users,
    Settings,
    LogOut,
    Menu,
    ChevronLeft,
    ShieldAlert
} from "lucide-react";
import { useState } from "react";
import { useAuth, UserRole } from "@/app/context/AuthContext";

const navItems = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard, roles: ["coach", "athlete"] },
    { name: "Player Locker Room", href: "/dashboard/player", icon: Activity, roles: ["athlete"] },
    { name: "Coach Command", href: "/dashboard/coach", icon: Users, roles: ["coach"] },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["coach", "athlete"] },
];

export function SidebarNew() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const role: UserRole = user?.role || "athlete";

    const filteredItems = navItems.filter(item => {
        if (!item.roles.includes(role)) return false;
        // Strict separation
        if (role === 'coach' && item.name === 'Player Locker Room') return false;
        if (role === 'athlete' && item.name === 'Coach Command') return false;
        return true;
    });

    return (
        <motion.div
            initial={{ width: 260 }}
            animate={{ width: collapsed ? 80 : 260 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-screen bg-[#0D1117]/80 backdrop-blur-xl border-r border-[#30363D] flex flex-col sticky top-0 z-50 transition-all"
        >
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Activity className="w-6 h-6 text-[#00CC96]" />
                            <span className="font-bold text-xl tracking-tight">PREHAB 2.0</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-[#21262D] rounded-lg text-[#8B949E] transition-colors"
                >
                    {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative overflow-hidden",
                                isActive ? "bg-[#00CC96]/10 text-[#00CC96]" : "text-[#8B949E] hover:text-white hover:bg-[#21262D]"
                            )}>
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 w-1 h-6 bg-[#00CC96] rounded-r-full"
                                    />
                                )}
                                <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-[#00CC96]" : "group-hover:text-white")} />

                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="font-medium whitespace-nowrap"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-[#30363D]">
                <div className={cn(
                    "flex items-center gap-3 p-2 rounded-xl bg-[#161B22] border border-[#30363D]",
                    collapsed ? "justify-center" : ""
                )}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#636EFA] to-[#00CC96] flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : "JD"}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name || "John Doe"}</p>
                            <p className="text-xs text-[#8B949E] truncate">{role === "coach" ? "Head Coach" : "Elite Athlete"}</p>
                        </div>
                    )}

                    <button onClick={logout} className="hover:text-[#EF553B] text-[#8B949E] transition-colors" title="Sign Out">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
