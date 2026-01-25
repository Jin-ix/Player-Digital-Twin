"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "coach" | "athlete";

interface User {
    name: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    login: (role: UserRole) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check local storage on mount
        const storedUser = localStorage.getItem("prehab_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (role: UserRole) => {
        const newUser = {
            name: role === "coach" ? "Coach Ivan" : "John Doe",
            role: role
        };
        setUser(newUser);
        localStorage.setItem("prehab_user", JSON.stringify(newUser));

        // Redirect based on role
        if (role === "coach") {
            router.push("/dashboard/coach");
        } else {
            router.push("/dashboard/player");
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("prehab_user");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
