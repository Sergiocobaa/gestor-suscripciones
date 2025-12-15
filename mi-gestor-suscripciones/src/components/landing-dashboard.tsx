"use client";

import { Wallet, Plus, MoreHorizontal, Lock, ArrowUpRight, ArrowDownRight, PiggyBank, ShoppingBag, TrendingUp } from "lucide-react";

export function LandingDashboard() {
    return (
        <div className="relative group w-full max-w-6xl mx-auto font-sans">

            {/* Efecto de Brillo (Glow) detrás */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

            {/* Marco del Navegador Estilo Mac */}
            <div className="relative rounded-xl border border-slate-200 bg-slate-50 shadow-2xl overflow-hidden">

                {/* Barra Superior */}
                <div className="border-b border-slate-200 bg-white/80 backdrop-blur-md p-3 sm:p-4 flex items-center justify-between">
                    <div className="flex space-x-2">
                        <div className="h-3 w-3 rounded-full bg-red-400"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                        <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>

                    <div className="flex-1 max-w-lg mx-auto bg-slate-100 rounded-md py-1 px-3 text-center text-xs font-medium text-slate-500 flex items-center justify-center gap-1.5">
                        <Lock className="h-3 w-3 text-emerald-500" />
                        <span className="text-slate-600">recur.es/dashboard</span>
                    </div>

                    <div className="w-10"></div>
                </div>

                {/* --- EL DASHBOARD FALSO (Replica del Real) --- */}
                <div className="bg-slate-50/50 p-6 sm:p-8 w-full overflow-hidden relative">
                    
                    {/* Header Falso */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Panel Principal</h2>
                            <p className="text-slate-500 text-sm">Resumen financiero de Octubre</p>
                        </div>
                        <div className="hidden sm:flex gap-2">
                             <div className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-md text-xs font-medium shadow-sm">
                                Configurar Ingresos
                             </div>
                             <div className="bg-slate-900 text-white px-3 py-2 rounded-md text-xs font-medium shadow-lg shadow-slate-900/20 flex items-center gap-2">
                                <Plus className="h-3 w-3" /> Nuevo Gasto
                             </div>
                        </div>
                    </div>

                    {/* GRID DE KPIs (Igual que el real) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        
                        {/* Ingresos */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between mb-3"><div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><ArrowUpRight className="h-4 w-4" /></div></div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Ingresos</p>
                            <h3 className="text-xl font-black text-slate-900">2.450€</h3>
                        </div>

                        {/* Gastos */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between mb-3"><div className="bg-red-100 p-2 rounded-lg text-red-600"><ArrowDownRight className="h-4 w-4" /></div></div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Gastos Totales</p>
                            <h3 className="text-xl font-black text-slate-900">850€</h3>
                        </div>

                        {/* Ahorro */}
                         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hidden md:block">
                            <div className="flex justify-between mb-3"><div className="bg-blue-100 p-2 rounded-lg text-blue-600"><PiggyBank className="h-4 w-4" /></div></div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Meta Ahorro</p>
                            <h3 className="text-xl font-black text-slate-900">400€</h3>
                        </div>

                        {/* LA TARJETA NEGRA (Estrella del show) */}
                        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl text-white relative overflow-hidden group">
                            {/* Luz de fondo dinámica */}
                            <div className="absolute top-0 right-0 p-24 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between mb-3">
                                    <div className="bg-white/10 p-2 rounded-lg"><Wallet className="h-4 w-4" /></div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">49% libre</span>
                                </div>
                                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Libre para gastar</p>
                                <h3 className="text-2xl font-black tracking-tight mt-1">1.200€</h3>
                                
                                {/* Barra de progreso visual */}
                                <div className="mt-4 space-y-1">
                                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-emerald-400 w-[49%]"></div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-right">Vas genial 🚀</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN INFERIOR */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Lista Suscripciones */}
                        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold text-slate-800">Suscripciones Activas</h4>
                                <MoreHorizontal className="text-slate-300 h-5 w-5" />
                            </div>
                            <div className="space-y-3">
                                {/* Item 1 */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold text-xs">N</div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">Netflix Premium</p>
                                            <p className="text-xs text-slate-500">Entretenimiento • Renueva mañana</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm">-17.99€</p>
                                </div>
                                {/* Item 2 */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold text-xs">S</div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">Spotify Duo</p>
                                            <p className="text-xs text-slate-500">Música • Renueva en 5 días</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm">-14.99€</p>
                                </div>
                                 {/* Item 3 */}
                                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold text-xs">C</div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">ChatGPT Plus</p>
                                            <p className="text-xs text-slate-500">IA • Renueva en 12 días</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm">-22.00€</p>
                                </div>
                            </div>
                        </div>

                        {/* Gastos Variables (Nuevo Feature) */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="bg-orange-100 p-1.5 rounded-md text-orange-600"><ShoppingBag className="h-4 w-4" /></div>
                                <h4 className="font-bold text-slate-800 text-sm">Gastos Extra</h4>
                            </div>
                            
                            <div className="space-y-4 flex-1">
                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                                    <span className="text-slate-600">Cena VIPS</span>
                                    <span className="font-bold text-slate-900">-45.50€</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                                    <span className="text-slate-600">Gasolina</span>
                                    <span className="font-bold text-slate-900">-60.00€</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                                    <span className="text-slate-600">Zara</span>
                                    <span className="font-bold text-slate-900">-29.99€</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="text-xs text-slate-400 text-center">Total Variables: 135.49€</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
