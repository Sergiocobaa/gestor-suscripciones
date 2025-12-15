"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, LayoutDashboard, BarChart3, Bell, Lock, Wallet } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { LandingDashboard } from "@/components/landing-dashboard";

export default function LandingPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Comprobamos si hay sesión al cargar
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
        <div className="min-h-screen bg-white font-sans relative overflow-hidden selection:bg-blue-100">

            {/* Fondos y Efectos */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="fixed left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>

            {/* --- NAVBAR --- */}
            <nav className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
                        <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">R.</div>
                        <span className="hidden sm:inline-block">Recur</span>
                    </Link>

                    <div className="flex gap-2 sm:gap-4">
                        {!loading && (
                            user ? (
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <Link href="/dashboard">
                                        <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-4 sm:px-6 shadow-lg shadow-slate-900/20 transition-all hover:scale-105 text-xs sm:text-sm h-9 sm:h-10">
                                            <LayoutDashboard className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="sm:inline">Ir al Dashboard</span>
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
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
                <section className="w-full pt-20 pb-16 md:pt-32 md:pb-24 text-center px-4 sm:px-6 max-w-5xl mx-auto space-y-6 md:space-y-8 relative z-10">

                    <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs sm:text-sm font-medium text-blue-700 mb-2 md:mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                        Nuevo: Control total de Gastos Variables
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] sm:leading-[1.1]">
                        Controla tus suscripciones y <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block sm:inline mt-2 sm:mt-0">
                            tu dinero libre real.
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed px-2">
                        Recur no es solo para Netflix. Calcula cuánto te queda realmente para gastar después de facturas, ahorros y caprichos.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
                        {!loading && user ? (
                            <Link href="/dashboard" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-8 text-base sm:text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl shadow-emerald-900/10 hover:shadow-emerald-900/20 transition-all hover:-translate-y-1">
                                    <LayoutDashboard className="mr-2 h-5 w-5" />
                                    Entrar a mi Panel
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-8 text-base sm:text-lg bg-slate-900 hover:bg-slate-800 rounded-full shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 transition-all hover:-translate-y-1">
                                    Empezar Gratis
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mt-2 sm:mt-0">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sin tarjeta requerida
                        </div>
                    </div>
                </section>

                {/* --- MOCKUP VISUAL (EL COMPONENTE NUEVO) --- */}
                <section className="w-full max-w-7xl px-2 sm:px-6 mb-24 md:mb-32">
                    <div className="relative mx-auto transform-gpu transition-all duration-500 hover:scale-[1.01]">
                        <LandingDashboard />
                    </div>
                </section>

                {/* --- LOGOS / BRANDS --- */}
                <section className="w-full py-20 border-y border-slate-100 bg-slate-50/50">
                    <div className="container mx-auto px-6 text-center">
                        <p className="text-sm font-bold text-slate-400 mb-12 uppercase tracking-widest">
                            Compatible con cualquier gasto recurrente
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            {/* Netflix */}
                            <img src="https://images.icon-icons.com/2699/PNG/512/netflix_logo_icon_170919.png" alt="Netflix" className="h-12 md:h-16 w-auto object-contain hover:scale-110 transition-transform duration-300" />
                             {/* Amazon Prime */}
                            <img src="https://img.icons8.com/color/600/amazon-prime.png" alt="Amazon Prime" className="h-12 md:h-16 w-auto object-contain hover:scale-110 transition-transform duration-300" />
                            {/* ChatGPT / OpenAI */}
                            <img src="https://cdn.iconscout.com/icon/free/png-256/free-chatgpt-icon-svg-download-png-7576880.png?f=webp" alt="ChatGPT" className="h-12 md:h-16 w-auto object-contain hover:scale-110 transition-transform duration-300" />
                            {/* Adobe */}
                            <img src="https://cdn-icons-png.flaticon.com/512/732/732171.png" alt="Adobe" className="h-12 md:h-16 w-auto object-contain hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                </section>

                {/* --- FEATURES GRID --- */}
                <section className="w-full max-w-6xl px-4 sm:px-6 py-24">
                    <div className="mb-16 text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                            No es otro Excel aburrido.
                        </h2>
                        <p className="mt-4 text-lg text-slate-500">
                           Es una herramienta visual que te dice la verdad: si puedes permitirte ese capricho o si deberías frenar.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:border-blue-200 hover:shadow-lg">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-slate-900">Dinero Libre Real</h3>
                            <p className="text-slate-500">Calculamos tus ingresos menos tus gastos fijos y objetivos de ahorro. Lo que sobra es para disfrutar sin culpa.</p>
                        </div>

                        {/* Card 2 */}
                        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:border-purple-200 hover:shadow-lg">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-slate-900">Gastos Variables</h3>
                            <p className="text-slate-500">¿Cena fuera? ¿Gasolina? ¿Ropa? Añádelos en un segundo y ve cómo afecta a tu barra de "Libre para gastar".</p>
                        </div>

                        {/* Card 3 */}
                        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:border-emerald-200 hover:shadow-lg">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                                <Lock className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-slate-900">100% Privado</h3>
                            <p className="text-slate-500">Sin conexión bancaria intrusiva. Tú añades manualmente lo que quieres trackear. Tus datos son tuyos.</p>
                        </div>
                    </div>
                </section>

                {/* --- PRE-FOOTER CTA --- */}
                <section className="w-full px-4 sm:px-6 py-20 bg-slate-900 text-white text-center">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                            Toma el control de tu economía hoy
                        </h2>
                        <p className="text-slate-400 text-lg">
                            Únete y descubre cuánto dinero estás perdiendo en suscripciones que no usas.
                        </p>
                        <Link href="/login" className="inline-block">
                            <Button size="lg" className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-100 rounded-full">
                                Crear cuenta gratis
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* --- FOOTER PROFESIONAL --- */}
                <footer className="w-full bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                            <div className="col-span-2 md:col-span-1">
                                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-slate-900">R.</div>
                                    Recur
                                </Link>
                                <p className="text-sm leading-relaxed mb-6">
                                    La herramienta definitiva para controlar tus suscripciones y optimizar tus gastos personales.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-4">Producto</h4>
                                <ul className="space-y-3 text-sm">
                                    <li><Link href="#" className="hover:text-white transition-colors">Características</Link></li>
                                    <li><Link href="#" className="hover:text-white transition-colors">Precios</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-4">Legal</h4>
                                <ul className="space-y-3 text-sm">
                                    <li><Link href="#" className="hover:text-white transition-colors">Privacidad</Link></li>
                                    <li><Link href="#" className="hover:text-white transition-colors">Términos</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                            <p>© 2025 Recur Inc. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </footer>

            </main>
        </div>
    )  
}
