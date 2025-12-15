"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Wallet, PiggyBank, Target, ArrowUpRight, ArrowDownRight, 
  Trash2, X, LogOut, LayoutDashboard, Pencil, CreditCard, ShoppingBag 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

// --- TIPOS ---
type Subscription = {
  id: string;
  name: string;
  price: number;
  start_date: string;
  category: string;
  active: boolean;
};

type Expense = {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
};

const COLORS = ["#0f172a", "#2563eb", "#059669", "#7c3aed", "#db2777", "#ea580c"];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Datos
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState(0); 
  const [savingsGoal, setSavingsGoal] = useState(0);

  // Modales
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  // Estado para Formularios (Edición/Creación)
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [subForm, setSubForm] = useState({ name: "", price: "", date: "", category: "Entretenimiento" });
  const [expenseForm, setExpenseForm] = useState({ name: "", amount: "", date: new Date().toISOString().split('T')[0], category: "Ocio" });
  const [incomeForm, setIncomeForm] = useState({ income: "", savings_goal: "" });

  // 1. CARGA INICIAL
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetchData(user.id);
    };
    checkUser();
  }, [router]);

  const fetchData = async (userId: string) => {
    try {
        // A. Suscripciones
        const { data: subs } = await supabase.from('subscriptions').select('*').eq('user_id', userId).eq('active', true).order('price', { ascending: false });
        if (subs) setSubscriptions(subs as Subscription[]);

        // B. Gastos Variables
        const { data: exps } = await supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false });
        if (exps) setExpenses(exps as Expense[]);

        // C. Perfil (Ingresos)
        const { data: profile } = await supabase.from('profiles').select('income, savings_goal').eq('id', userId).single();
        if (profile) {
            setIncome(profile.income || 0);
            setSavingsGoal(profile.savings_goal || 0);
            setIncomeForm({ income: profile.income?.toString(), savings_goal: profile.savings_goal?.toString() });
        }
    } catch (error) {
        console.error("Error cargando datos", error);
    } finally {
        setLoading(false);
    }
  };

  // 2. GESTIÓN DE SUSCRIPCIONES (Crear y Editar)
  const openSubModal = (sub?: Subscription) => {
      if (sub) {
          setEditingId(sub.id);
          setSubForm({ name: sub.name, price: sub.price.toString(), date: sub.start_date, category: sub.category });
      } else {
          setEditingId(null);
          setSubForm({ name: "", price: "", date: "", category: "Entretenimiento" });
      }
      setIsSubModalOpen(true);
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const payload = {
        user_id: user.id,
        name: subForm.name,
        price: parseFloat(subForm.price),
        start_date: subForm.date,
        category: subForm.category,
        currency: 'EUR', frequency: 'monthly', active: true
    };

    try {
        if (editingId) {
            // EDITAR
            const { error } = await supabase.from('subscriptions').update(payload).eq('id', editingId);
            if (error) throw error;
        } else {
            // CREAR
            const { error } = await supabase.from('subscriptions').insert([payload]);
            if (error) throw error;
        }
        await fetchData(user.id);
        setIsSubModalOpen(false);
    } catch (error: any) {
        alert("Error: " + error.message);
    }
  };

  const handleDeleteSub = async (id: string) => {
      if (!confirm("¿Borrar suscripción?")) return;
      await supabase.from('subscriptions').update({ active: false }).eq('id', id);
      fetchData(user.id);
  };

  // 3. GESTIÓN DE GASTOS VARIABLES
  const handleSaveExpense = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      try {
          const { error } = await supabase.from('expenses').insert([{
              user_id: user.id,
              name: expenseForm.name,
              amount: parseFloat(expenseForm.amount),
              date: expenseForm.date,
              category: expenseForm.category
          }]);
          if (error) throw error;
          await fetchData(user.id);
          setIsExpenseModalOpen(false);
          setExpenseForm({ name: "", amount: "", date: new Date().toISOString().split('T')[0], category: "Ocio" });
      } catch (error: any) {
          alert("Error: " + error.message);
      }
  };

  const handleDeleteExpense = async (id: string) => {
      if (!confirm("¿Borrar gasto?")) return;
      await supabase.from('expenses').delete().eq('id', id);
      fetchData(user.id);
  };

  // 4. GESTIÓN DE INGRESOS
  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      try {
          const { error } = await supabase.from('profiles').update({
              income: parseFloat(incomeForm.income),
              savings_goal: parseFloat(incomeForm.savings_goal)
          }).eq('id', user.id);
          if (error) throw error;
          setIncome(parseFloat(incomeForm.income));
          setSavingsGoal(parseFloat(incomeForm.savings_goal));
          setIsIncomeModalOpen(false);
      } catch (error: any) {
          alert("Error: " + error.message);
      }
  };

  // --- CÁLCULOS GLOBALES ---
  const totalSubs = subscriptions.reduce((acc, sub) => acc + sub.price, 0);
  const totalVarExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalExpenses = totalSubs + totalVarExpenses;
  const remaining = income - totalExpenses - savingsGoal;

  const percentageLeft = income > 0 ? (remaining / income) * 100 : 0;
  const validPercentage = Math.min(Math.max(percentageLeft, 0), 100);

  let barColor = "bg-emerald-400";
  let statusMessage = "Vas genial este mes 🚀";

  if (validPercentage < 20) {
      barColor = "bg-red-500"; // Rojo
      statusMessage = "Presupuesto crítico 🚨";
  } else if (validPercentage < 50) {
      barColor = "bg-yellow-400"; // Amarillo
      statusMessage = "Controla los gastos 👀";
  }

  const chartData = subscriptions.map(s => ({ name: s.category, value: s.price })).reduce((acc: any[], curr) => {
      const existing = acc.find(i => i.name === curr.name);
      if (existing) existing.value += curr.value;
      else acc.push(curr);
      return acc;
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Cargando Recur...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      
      {/* --- 1. NAVBAR --- */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
                <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">R.</div>
                <span>Recur</span>
            </Link>
            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 hidden sm:inline-block">{user?.email}</span>
                <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4 mr-2" /> Salir
                </Button>
            </div>
        </div>
      </nav>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Panel Financiero</h1>
            <p className="text-slate-500">Resumen de tu salud económica</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => setIsIncomeModalOpen(true)} className="bg-white">
                <Target className="mr-2 h-4 w-4" /> Ajustar Ingresos
             </Button>
             <Button onClick={() => openSubModal()} className="bg-slate-900 text-white">
                <Plus className="mr-2 h-4 w-4" /> Suscripción
             </Button>
          </div>
        </div>

        {/* --- TARJETAS (KPIs) --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between mb-4"><div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><ArrowUpRight className="h-5 w-5" /></div></div>
                <p className="text-slate-500 text-sm font-medium">Ingresos Mes</p>
                <h3 className="text-2xl font-black text-slate-900">{income}€</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between mb-4"><div className="bg-red-100 p-2 rounded-lg text-red-600"><ArrowDownRight className="h-5 w-5" /></div></div>
                <p className="text-slate-500 text-sm font-medium">Total Gastos (Fijos+Var)</p>
                <h3 className="text-2xl font-black text-slate-900">{totalExpenses.toFixed(2)}€</h3>
            </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between mb-4"><div className="bg-blue-100 p-2 rounded-lg text-blue-600"><PiggyBank className="h-5 w-5" /></div></div>
                <p className="text-slate-500 text-sm font-medium">Meta Ahorro</p>
                <h3 className="text-2xl font-black text-slate-900">{savingsGoal}€</h3>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl text-white relative overflow-hidden group">
                {/* Efecto de luz de fondo dinámico según el estado */}
                <div className={`absolute top-0 right-0 p-32 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 transition-colors duration-500 ${validPercentage < 20 ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between mb-4">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <Wallet className="h-5 w-5" />
                        </div>
                        {/* Porcentaje numérico pequeño */}
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${validPercentage < 20 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                            {validPercentage.toFixed(0)}% restante
                        </span>
                    </div>
                    
                    <p className="text-slate-400 text-sm font-medium">Libre para gastar</p>
                    <h3 className="text-3xl font-black tracking-tight mt-1">{remaining.toFixed(2)}€</h3>
                    
                    {/* --- AQUÍ ESTÁ LA BARRA --- */}
                    <div className="mt-5 space-y-2">
                        {/* La barra gris de fondo */}
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                            {/* La barra de color que se mueve */}
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`} 
                                style={{ width: `${validPercentage}%` }}
                            ></div>
                        </div>
                        {/* El mensaje motivacional */}
                        <p className="text-xs text-slate-400 font-medium text-right">
                            {statusMessage}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. SECCIÓN GRÁFICO */}
            <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                <h4 className="font-bold text-slate-800 w-full mb-4">Desglose Fijo</h4>
                {subscriptions.length > 0 ? (
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <span className="text-2xl font-bold text-slate-900">{totalSubs.toFixed(0)}€</span>
                        </div>
                    </div>
                ) : ( <p className="text-slate-400">Sin datos</p> )}
            </div>

            {/* 2. SECCIÓN SUSCRIPCIONES (EDITABLE) */}
            <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-800">Suscripciones Fijas</h4>
                </div>
                <div className="space-y-3 flex-1 overflow-auto max-h-[300px]">
                    {subscriptions.map((sub) => (
                        <div key={sub.id} onClick={() => openSubModal(sub)} className="cursor-pointer flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-blue-200 hover:shadow-md rounded-2xl transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold">{sub.name.charAt(0).toUpperCase()}</div>
                                <div>
                                    <p className="font-bold text-slate-900">{sub.name}</p>
                                    <p className="text-xs text-slate-500">{sub.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="font-bold text-slate-900">-{sub.price}€</p>
                                <Pencil className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* 3. SECCIÓN NUEVA: GASTOS VARIABLES */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><ShoppingBag className="h-5 w-5" /></div>
                    <h4 className="font-bold text-slate-800">Gastos Variables (Cenas, Ropa, etc.)</h4>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsExpenseModalOpen(true)} className="text-blue-600 hover:bg-blue-50">
                    + Añadir Gasto
                </Button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                        <tr>
                            <th className="px-4 py-3">Concepto</th>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Categoría</th>
                            <th className="px-4 py-3 text-right">Importe</th>
                            <th className="px-4 py-3 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-slate-400">No hay gastos extra este mes</td></tr>}
                        {expenses.map((exp) => (
                            <tr key={exp.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-900">{exp.name}</td>
                                <td className="px-4 py-3 text-slate-500">{exp.date}</td>
                                <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-slate-100 text-xs text-slate-600">{exp.category}</span></td>
                                <td className="px-4 py-3 text-right font-bold text-slate-900">-{exp.amount}€</td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => handleDeleteExpense(exp.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>

      {/* --- MODAL: SUSCRIPCIONES --- */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
           <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
               <div className="flex justify-between mb-4">
                   <h3 className="font-bold text-lg">{editingId ? "Editar Suscripción" : "Nueva Suscripción"}</h3>
                   <button onClick={() => setIsSubModalOpen(false)}><X className="h-5 w-5 text-slate-400"/></button>
               </div>
               <form onSubmit={handleSaveSubscription} className="space-y-4">
                   <input required placeholder="Nombre (ej: Netflix)" value={subForm.name} onChange={e => setSubForm({...subForm, name: e.target.value})} className="w-full p-2 border rounded-lg"/>
                   <div className="flex gap-4">
                       <input required type="number" step="0.01" placeholder="Precio" value={subForm.price} onChange={e => setSubForm({...subForm, price: e.target.value})} className="w-full p-2 border rounded-lg"/>
                       <input required type="date" value={subForm.date} onChange={e => setSubForm({...subForm, date: e.target.value})} className="w-full p-2 border rounded-lg"/>
                   </div>
                   <select value={subForm.category} onChange={e => setSubForm({...subForm, category: e.target.value})} className="w-full p-2 border rounded-lg bg-white">
                       {["Entretenimiento", "Música", "Software", "Hogar", "Seguros", "Otros"].map(c => <option key={c}>{c}</option>)}
                   </select>
                   <div className="flex gap-2 pt-2">
                       {editingId && <Button type="button" variant="destructive" onClick={() => {handleDeleteSub(editingId); setIsSubModalOpen(false)}} className="flex-1">Borrar</Button>}
                       <Button type="submit" className="flex-[2] bg-slate-900 text-white">Guardar</Button>
                   </div>
               </form>
           </div>
        </div>
      )}

      {/* --- MODAL: INGRESOS --- */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
           <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
               <div className="flex justify-between mb-4">
                   <h3 className="font-bold text-lg">Ajustar Perfil Financiero</h3>
                   <button onClick={() => setIsIncomeModalOpen(false)}><X className="h-5 w-5 text-slate-400"/></button>
               </div>
               <form onSubmit={handleUpdateProfile} className="space-y-4">
                   <div>
                       <label className="text-sm font-medium text-slate-700">Ingresos Mensuales (€)</label>
                       <input required type="number" value={incomeForm.income} onChange={e => setIncomeForm({...incomeForm, income: e.target.value})} className="w-full p-2 border rounded-lg mt-1"/>
                   </div>
                   <div>
                       <label className="text-sm font-medium text-slate-700">Objetivo de Ahorro (€)</label>
                       <input required type="number" value={incomeForm.savings_goal} onChange={e => setIncomeForm({...incomeForm, savings_goal: e.target.value})} className="w-full p-2 border rounded-lg mt-1"/>
                   </div>
                   <Button type="submit" className="w-full bg-slate-900 text-white mt-4">Actualizar Perfil</Button>
               </form>
           </div>
        </div>
      )}

      {/* --- MODAL: GASTOS VARIABLES --- */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
           <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
               <div className="flex justify-between mb-4">
                   <h3 className="font-bold text-lg">Añadir Gasto Puntual</h3>
                   <button onClick={() => setIsExpenseModalOpen(false)}><X className="h-5 w-5 text-slate-400"/></button>
               </div>
               <form onSubmit={handleSaveExpense} className="space-y-4">
                   <input required placeholder="Concepto (ej: Cena VIPS)" value={expenseForm.name} onChange={e => setExpenseForm({...expenseForm, name: e.target.value})} className="w-full p-2 border rounded-lg"/>
                   <div className="flex gap-4">
                       <input required type="number" step="0.01" placeholder="Importe" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="w-full p-2 border rounded-lg"/>
                       <input required type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} className="w-full p-2 border rounded-lg"/>
                   </div>
                   <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className="w-full p-2 border rounded-lg bg-white">
                       {["Comida", "Transporte", "Ropa", "Ocio", "Salud", "Regalos", "Otros"].map(c => <option key={c}>{c}</option>)}
                   </select>
                   <Button type="submit" className="w-full bg-slate-900 text-white mt-4">Añadir Gasto</Button>
               </form>
           </div>
        </div>
      )}

    </div>
  );
}
