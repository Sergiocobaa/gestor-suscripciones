"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck, Zap, LayoutDashboard } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"

export default function LandingPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Comprobamos si hay sesión al cargar la página
    useEffect(() => {
        async function checkUser() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
                console.error("Error verificando sesión:", error);
            } finally {
                setLoading(false);
            }
        }
        checkUser();
    }, []);

    return (
        <div className="min-h-screen bg-white selection:bg-blue-100 font-sans relative overflow-hidden">

            {/* Fondo Premium */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-grid-pattern"></div>
            <div className="fixed inset-0 z-[-1] bg-blue-glow opacity-60"></div>

            {/* --- NAVBAR INTELIGENTE --- */}
            <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/60 backdrop-blur-xl">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 max-w-6xl">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
                        <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">R.</div>
                        <span className="hidden sm:inline-block">Recur</span> {/* En móvil muy pequeño solo se ve la R. */}
                    </Link>

                    {/* Botones Cambiantes */}
                    <div className="flex gap-2 sm:gap-4">
                        {!loading && (
                            user ? (
                                // OPCIÓN A: SI ESTÁ LOGUEADO
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <span className="text-sm text-slate-500 hidden md:inline-block">
                                        Hola, <span className="font-semibold text-slate-900">{user.email?.split('@')[0]}</span>
                                    </span>
                                    <Link href="/dashboard">
                                        <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-4 sm:px-6 shadow-lg shadow-slate-900/20 transition-all hover:scale-105 text-xs sm:text-sm h-9 sm:h-10">
                                            <LayoutDashboard className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="sm:inline">Dashboard</span>
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                // OPCIÓN B: SI NO ESTÁ LOGUEADO
                                <>
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
                                </>
                            )
                        )}
                    </div>
                </div>
            </nav>

            <main className="flex flex-col items-center">

                {/* --- HERO SECTION --- */}
                {/* Ajustamos padding top (pt) y bottom (pb) para móvil y escritorio */}
                <section className="w-full pt-16 pb-20 md:pt-24 md:pb-32 text-center px-4 sm:px-6 max-w-4xl mx-auto space-y-6 md:space-y-8 relative z-10">

                    <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50/50 px-3 py-1 text-xs sm:text-sm font-medium text-blue-700 mb-2 md:mb-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                        v1.0 ya disponible
                    </div>

                    {/* TÍTULO RESPONSIVE: text-4xl en móvil -> text-7xl en escritorio */}
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] sm:leading-[1.1]">
                        Deja de tirar dinero en <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 block sm:inline mt-2 sm:mt-0">
                            suscripciones fantasma.
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed px-2">
                        Recur te ayuda a identificar, controlar y cancelar los pagos recurrentes que olvidaste. Ahorra una media de 200€ al año.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
                        {/* Botón Principal Inteligente */}
                        {!loading && user ? (
                            <Link href="/dashboard" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-8 text-base sm:text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl shadow-emerald-900/10 hover:shadow-emerald-900/20 transition-all hover:-translate-y-1">
                                    <LayoutDashboard className="mr-2 h-5 w-5" />
                                    Volver a mis Gastos
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-8 text-base sm:text-lg bg-slate-900 hover:bg-slate-800 rounded-full shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20 transition-all hover:-translate-y-1">
                                    Crear cuenta gratis
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        )}

                        {!user && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 px-4 mt-2 sm:mt-0">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sin tarjeta de crédito
                            </div>
                        )}
                    </div>
                </section>

                {/* --- VISUAL DEMO --- */}
                <section className="w-full max-w-6xl px-4 sm:px-6 mb-16 md:mb-32 relative group perspective-1000">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/20 blur-[60px] md:blur-[100px] rounded-full -z-10"></div>
                    <div className="relative rounded-2xl border border-slate-200/60 bg-white/50 p-1 sm:p-2 shadow-xl md:shadow-2xl backdrop-blur-sm transition-transform duration-700 hover:scale-[1.01]">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden aspect-[16/9] flex items-center justify-center relative">
                            <div className="text-center space-y-2">
                                <p className="text-2xl sm:text-4xl">📊</p>
                                <p className="text-xs sm:text-base text-slate-400 font-medium">Captura del Dashboard</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- FEATURES --- */}
                <section className="w-full max-w-6xl px-4 sm:px-6 py-16 md:py-24 border-t border-slate-100">
                    <div className="mb-10 md:mb-16 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                            Todo lo que necesitas para controlar tu dinero
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {/* Feature 1 */}
                        <div className="p-6 md:p-8 rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all">
                            <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-blue-600">
                                <Zap className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">Alertas Inteligentes</h3>
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed">Recibe un correo 3 días antes de que Netflix te cobre. No más sorpresas.</p>
                        </div>
                        {/* Feature 2 */}
                        <div className="p-6 md:p-8 rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all">
                            <div className="h-10 w-10 md:h-12 md:w-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-purple-600 border border-purple-100">
                                <CreditCard className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">Cálculo de Gastos</h3>
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed">Convertimos pagos anuales a mensuales automáticamente para que sepas tu gasto real.</p>
                        </div>
                        {/* Feature 3 */}
                        <div className="p-6 md:p-8 rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all">
                            <div className="h-10 w-10 md:h-12 md:w-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-emerald-600 border border-emerald-100">
                                <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">Privacidad Total</h3>
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed">Tus datos son tuyos. No vendemos tu información a bancos ni a terceros.</p>
                        </div>
                    </div>
                </section>

                <footer className="w-full py-8 md:py-12 border-t border-slate-100 mt-8 md:mt-12 bg-slate-50">
                    <div className="container mx-auto px-6 text-center text-slate-500 text-xs md:text-sm">
                        <p>© 2025 Recur Inc. Hecho con ❤️ para ahorrar dinero.</p>
                    </div>
                </footer>
            </main>
        </div>
    )
}