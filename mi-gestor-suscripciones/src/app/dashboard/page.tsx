"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MonthSelector } from "@/components/month-selector";
import { toast } from "sonner";
import { 
  Wallet, TrendingDown, PiggyBank, Plus, Trash2, ShoppingBag, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// --- FUNCIONES AUXILIARES BLINDADAS (Sin librerías) ---

// 1. Convierte cualquier fecha a texto "YYYY-MM-DD" (Local, no UTC)
// Esto evita que si es de noche te marque el día anterior
const toISODateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 2. Obtener el primer día del mes: "2025-10-01"
const getStartOfMonthStr = (date: Date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return toISODateString(d);
};

// 3. Obtener el último día del mes: "2025-10-31"
const getEndOfMonthStr = (date: Date) => {
  // El día 0 del siguiente mes es el último del actual
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return toISODateString(d);
};

// 4. Formatear fecha bonita: "15 oct"
const formatDateNice = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  // Creamos la fecha a las 12:00 para evitar problemas de timezone al visualizar
  const date = new Date(y, m - 1, d, 12, 0, 0);
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date);
};

// 5. Nombre del mes: "Octubre"
const getMonthName = (date: Date) => {
  return new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
};
// ---------------------------------------------

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  const [expenses, setExpenses] = useState<any[]>([]);
  const [income, setIncome] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(0);

  async function loadData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Cargar Perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setIncome(profile.monthly_income || 0);
        setSavingsGoal(profile.savings_goal || 0);
      }

      // 2. Definir rango de fechas (TEXTO EXACTO)
      const startStr = getStartOfMonthStr(currentDate);
      const endStr = getEndOfMonthStr(currentDate);

      // 3. Buscar gastos en ese rango
      const { data: existingExpenses, error } = await supabase
        .from('monthly_expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startStr) // Mayor o igual al dia 1
        .lte('date', endStr)   // Menor o igual al dia 31
        .order('date', { ascending: true });

      if (error) throw error;

      // 4. Lógica de Generación Automática
      if (!existingExpenses || existingExpenses.length === 0) {
        // Solo generamos si NO hay gastos
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id);

        if (subscriptions && subscriptions.length > 0) {
          const newExpenses = subscriptions.map(sub => ({
            user_id: user.id,
            title: sub.name,
            amount: sub.price,
            category: sub.category,
            date: startStr, // Los ponemos el día 1 del mes
            is_recurring: true
          }));

          const { data: inserted } = await supabase
            .from('monthly_expenses')
            .insert(newExpenses)
            .select();
          
          if (inserted) {
            setExpenses(inserted);
            toast.success(`Gastos de ${getMonthName(currentDate)} generados.`);
          }
        } else {
            setExpenses([]); 
        }
      } else {
        setExpenses(existingExpenses || []);
      }

    } catch (error) {
      console.error(error);
      toast.error("Error cargando datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [currentDate]);

  // Cálculos UI
  const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const freeMoney = income - savingsGoal - totalExpenses;
  const percentageUsed = income > 0 ? ((totalExpenses + savingsGoal) / income) * 100 : 0;
  const progressWidth = Math.min(Math.max(percentageUsed, 0), 100);
  const progressColor = freeMoney < 0 ? 'bg-red-500' : (freeMoney < 200 ? 'bg-yellow-400' : 'bg-emerald-400');

  // Añadir Gasto Variable
  async function addVariableExpense() {
    const title = prompt("¿En qué has gastado?");
    if (!title) return;
    const amountStr = prompt("¿Cuánto ha sido?");
    if (!amountStr) return;
    
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount)) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calcular la fecha para guardar
      const today = new Date();
      let targetDateStr = "";

      // Si estamos visualizando el mes actual, usamos el día de hoy
      if (today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()) {
        targetDateStr = toISODateString(today);
      } else {
        // Si estamos visualizando otro mes (pasado o futuro), ponemos el día 1
        targetDateStr = getStartOfMonthStr(currentDate);
      }
      
      const { data, error } = await supabase
        .from('monthly_expenses')
        .insert({
          user_id: user.id,
          title,
          amount,
          date: targetDateStr,
          category: 'variable',
          is_recurring: false
        })
        .select()
        .single();

      if (error) throw error;
      setExpenses([...expenses, data]);
      toast.success("Gasto añadido");
    } catch (e) {
      toast.error("Error al guardar");
    }
  }

  async function deleteExpense(id: string) {
    if(!confirm("¿Borrar este gasto?")) return;
    try {
      await supabase.from('monthly_expenses').delete().eq('id', id);
      setExpenses(expenses.filter(e => e.id !== id));
      toast.success("Gasto eliminado");
    } catch (e) {
      toast.error("Error al borrar");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl tracking-tight text-slate-900">
                Recur.
            </Link>
            <div className="flex items-center gap-2">
                 <Button variant="ghost" size="sm" onClick={() => {
                    const newIncome = prompt("Configura tu sueldo mensual:", income.toString());
                    if(newIncome) {
                        alert("Para guardar esto permanentemente necesitamos conectar el update a Supabase. De momento es visual.");
                        setIncome(parseFloat(newIncome));
                    }
                 }}>
                    <ArrowUpRight className="h-4 w-4 mr-1 text-emerald-600"/> {income}€
                 </Button>
            </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* SELECTOR */}
        <MonthSelector currentDate={currentDate} onMonthChange={setCurrentDate} />

        {/* TARJETA NEGRA */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/20 group transition-all hover:scale-[1.01]">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 opacity-80">
                        <Wallet className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Libre para gastar</span>
                    </div>
                    {freeMoney < 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">¡CUIDADO!</span>}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter">{freeMoney.toFixed(2)}</span>
                    <span className="text-lg font-medium opacity-60">€</span>
                </div>
                <div className="mt-6">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Gastado: {totalExpenses.toFixed(0)}€</span>
                        <span>Sueldo: {income}€</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor}`} style={{ width: `${progressWidth}%` }}></div>
                    </div>
                </div>
            </div>
        </div>

        {/* GRID RESUMEN */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-bold uppercase">Gastos</span>
                </div>
                <p className="text-xl font-bold text-slate-900">{totalExpenses.toFixed(2)}€</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                    <PiggyBank className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-bold uppercase">Ahorro</span>
                </div>
                <p className="text-xl font-bold text-slate-900">{savingsGoal}€</p>
            </div>
        </div>

        {/* LISTA GASTOS */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-lg">Movimientos</h3>
                <div className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">
                    {expenses.length} gastos
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="space-y-3">
                    {expenses.map((expense) => (
                        <div key={expense.id} className="group flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-slate-300">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${expense.is_recurring ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {expense.is_recurring ? '🔄' : '🛍️'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{expense.title}</p>
                                    <p className="text-xs text-slate-500 capitalize">
                                        {expense.category === 'other' ? 'Varios' : expense.category} • {formatDateNice(expense.date)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-900">-{expense.amount}€</span>
                                <button 
                                    onClick={() => deleteExpense(expense.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {expenses.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                            <p>No hay gastos este mes. ¡Genial!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={addVariableExpense}
            className="h-14 w-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          >
              <Plus className="h-6 w-6" />
          </Button>
      </div>
    </div>
  );
}