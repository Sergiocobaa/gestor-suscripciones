"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { GoogleIcon } from "@/components/icons";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email, password, options: { data: { full_name: email.split('@')[0] } }
            });
            if (error) setError(error.message);
            else setMessage("Cuenta creada. Revisa tu email.");
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
            else { router.push("/dashboard"); router.refresh(); }
        }
        setLoading(false);
    };

    return (
        // Añadimos px-4 para que en móvil no toque los bordes
        <div className="min-h-screen flex items-center justify-center bg-grid-pattern relative px-4 py-12 sm:px-6 lg:px-8">
            <div className="fixed inset-0 z-[-1] bg-blue-glow opacity-60"></div>

            {/* Botón flotante para volver (muy útil en móvil) */}
            <Link href="/" className="absolute top-4 left-4 sm:top-8 sm:left-8 text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 text-sm font-medium">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Volver al inicio</span>
            </Link>

            {/* Tarjeta con padding responsive (p-6 en móvil, p-8 en PC) */}
            <div className="w-full max-w-md p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 backdrop-blur-sm">

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-slate-900 text-white font-bold text-lg sm:text-xl mb-4">R.</div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {isSignUp ? "Crea tu cuenta" : "Bienvenido de nuevo"}
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        {isSignUp ? "Empieza a ahorrar hoy mismo" : "Introduce tus datos para continuar"}
                    </p>
                </div>

                {/* --- BOTÓN DE GOOGLE --- */}
                <div className="grid gap-4 mb-6">
                    <Button variant="outline" onClick={handleGoogleLogin} disabled={loading} className="w-full bg-white hover:bg-slate-50 text-slate-700 border-slate-200 h-10 sm:h-11">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                        <span className="ml-2">Continuar con Google</span>
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">O con email</span>
                        </div>
                    </div>
                </div>

                {/* --- FORMULARIO EMAIL --- */}
                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-10 sm:h-11" // Inputs un poco más altos en móvil para tocar mejor
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Contraseña</Label>
                            {!isSignUp && (
                                <Link href="#" className="text-xs text-slate-500 hover:text-slate-900">
                                    ¿Olvidaste la contraseña?
                                </Link>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-10 sm:h-11"
                        />
                    </div>

                    {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">{error}</div>}
                    {message && <div className="p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg">{message}</div>}

                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 h-10 sm:h-11 text-base" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSignUp ? "Registrarse" : "Entrar"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-slate-500">{isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}</span>{" "}
                    <button onClick={() => { setError(null); setIsSignUp(!isSignUp); }} className="font-semibold text-slate-900 hover:underline ml-1">
                        {isSignUp ? "Inicia sesión" : "Regístrate"}
                    </button>
                </div>
            </div>
        </div>
    );
}