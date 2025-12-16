"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export function LandingNavbarActions() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkUser() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        checkUser();
    }, []);

    if (loading) return <div className="h-10 w-24 bg-slate-100 rounded-full animate-pulse" />;

    if (user) {
        return (
            <Link href="/dashboard">
                <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-4 sm:px-6 shadow-lg shadow-slate-900/20 transition-all hover:scale-105 text-xs sm:text-sm h-9 sm:h-10">
                    <LayoutDashboard className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="sm:inline">Ir al Dashboard</span>
                </Button>
            </Link>
        );
    }

    return (
        <div className="flex gap-2 sm:gap-4">
            <Link href="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-medium hidden sm:inline-flex">
                    Iniciar Sesión
                </Button>
            </Link>
            <Link href="/login">
                <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-4 sm:px-6 shadow-lg shadow-slate-900/20 transition-all hover:scale-105 text-xs sm:text-sm h-9 sm:h-10">
                    Empezar Gratis
                </Button>
            </Link>
        </div>
    );
}