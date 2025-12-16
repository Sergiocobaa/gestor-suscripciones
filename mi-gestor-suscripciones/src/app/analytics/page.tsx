"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, TrendingUp, TrendingDown, Wallet, Calendar, PieChart 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from "recharts";

// Tipos de datos para el gráfico
type MonthlyData = {
  dateSort: string;
  name: string;
  fullName: string;
  income: number;
  expenses: number;
  savings: number;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: budgets } = await supabase.from('monthly_budgets').select('*').eq('user_id', user.id);
      const { data: allExpenses } = await supabase.from('expenses').select('*').eq('user_id', user.id);
      const { data: profile } = await supabase.from('profiles').select('income').eq('id', user.id).single();
      
      const defaultIncome = profile?.income || 0;
      const monthsMap = new Map<string, MonthlyData>();

      const initMonth = (dateStr: string) => {
        const dateObj = new Date(dateStr);
        const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthsMap.has(key)) {
            const monthShort = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(dateObj);
            const monthLong = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(dateObj);
            
            monthsMap.set(key, {
                dateSort: key,
                name: monthShort.charAt(0).toUpperCase() + monthShort.slice(1),
                fullName: monthLong.charAt(0).toUpperCase() + monthLong.slice(1),
                income: 0,
                expenses: 0,
                savings: 0
            });
        }
        return key;
      };

      budgets?.forEach(b => {
          const key = initMonth(b.date);
          const entry = monthsMap.get(key)!;
          entry.income = b.income;
      });

      allExpenses?.forEach(exp => {
          const key = initMonth(exp.date);
          const entry = monthsMap.get(key)!;
          entry.expenses += exp.amount;
      });

      let historyData = Array.from(monthsMap.values()).sort((a, b) => 
        a.dateSort.localeCompare(b.dateSort)
      );

      let calculatedTotalSaved = 0;
      
      historyData = historyData.map(item => {
          const finalIncome = item.income > 0 ? item.income : defaultIncome;
          const savings = finalIncome - item.expenses;
          calculatedTotalSaved += savings;
          return { ...item, income: finalIncome, savings: savings };
      });

      setData(historyData);
      setTotalSaved(calculatedTotalSaved);

    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Analizando datos...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-10">
      
      {/* HEADER (Padding ajustado para móvil) */}
      <div className="max-w-5xl mx-auto px-4 pt-6 md:pt-10 mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-4 text-sm font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Evolución</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1">
           {data.length > 0 
             ? `Análisis de ${data.length} meses` 
             : "Sin datos suficientes"}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-20 px-4">
            <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PieChart className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Aún no hay datos</h3>
            <p className="text-sm text-slate-500 mb-6">Usa la app este mes para ver tu evolución.</p>
            <Link href="/dashboard">
                <button className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-sm w-full md:w-auto">Ir al Dashboard</button>
            </Link>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 space-y-4 md:space-y-6">
            
            {/* KPI PRINCIPAL (Padding reducido en móvil) */}
            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-24 md:p-32 rounded-full bg-blue-500/20 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <p className="text-slate-400 text-sm font-medium mb-1">Ahorro Neto Histórico</p>
                    <div className="flex flex-wrap items-baseline gap-2">
                        {/* Texto responsive */}
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight">{totalSaved.toFixed(2)}€</h2>
                        {totalSaved > 0 ? (
                            <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" /> Positivo
                            </span>
                        ) : (
                            <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center">
                                <TrendingDown className="h-3 w-3 mr-1" /> Negativo
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* GRÁFICO 1: Ingresos vs Gastos */}
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="mb-4">
                    <h3 className="font-bold text-base md:text-lg text-slate-800 flex items-center gap-2">
                        <Wallet className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                        Balance Mensual
                    </h3>
                </div>
                <div className="h-[200px] md:h-[300px] w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Bar dataKey="income" name="Ing." fill="#0f172a" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" name="Gast." fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* GRÁFICO 2: Tendencia */}
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="mb-4">
                    <h3 className="font-bold text-base md:text-lg text-slate-800 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                        Curva de Ahorro
                    </h3>
                </div>
                <div className="h-[200px] md:h-[250px] w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}/>
                            <Area type="monotone" dataKey="savings" name="Ahorro" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* LISTA HISTÓRICA (Tabla en Desktop, Cards en Móvil) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 md:p-6 border-b border-slate-50">
                    <h3 className="font-bold text-base md:text-lg text-slate-800 flex items-center gap-2">
                        <Calendar className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                        Histórico
                    </h3>
                </div>

                {/* VERSIÓN MOVIL (Lista de tarjetas) */}
                <div className="md:hidden">
                    {data.map((month, index) => (
                        <div key={index} className="p-4 border-b border-slate-50 last:border-0 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-slate-900">{month.fullName}</p>
                                    <div className="flex gap-3 text-xs mt-1 text-slate-500">
                                        <span>🟢 {month.income.toFixed(0)}€</span>
                                        <span className="text-red-400">🔴 {month.expenses.toFixed(0)}€</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <span className={`block text-lg font-black ${month.savings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {month.savings > 0 ? '+' : ''}{month.savings.toFixed(0)}€
                                     </span>
                                     <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${month.savings >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {month.savings >= 0 ? 'Ahorro' : 'Déficit'}
                                     </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* VERSIÓN DESKTOP (Tabla clásica) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4">Mes</th>
                                <th className="px-6 py-4 text-right">Ingresos</th>
                                <th className="px-6 py-4 text-right">Gastos</th>
                                <th className="px-6 py-4 text-right">Ahorro</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((month, index) => (
                                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{month.fullName}</td>
                                    <td className="px-6 py-4 text-right text-slate-600">{month.income}€</td>
                                    <td className="px-6 py-4 text-right text-red-500 font-medium">-{month.expenses}€</td>
                                    <td className={`px-6 py-4 text-right font-bold ${month.savings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {month.savings > 0 ? '+' : ''}{month.savings.toFixed(2)}€
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${month.savings >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                            {month.savings >= 0 ? 'Superávit' : 'Déficit'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}