"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Plus, Wallet, PiggyBank, Target, ArrowUpRight, ArrowDownRight, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

// Tipos adaptados a TU tabla real
type Subscription = {
  id: string;
  name: string;
  price: number;
  start_date: string; // Antes era 'date', ahora es 'start_date'
  category: string;
  currency: string;
  frequency: string;
};

const COLORS = ["#0f172a", "#2563eb", "#059669", "#7c3aed", "#db2777", "#ea580c"];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  
  // Estado para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSub, setNewSub] = useState({ name: "", price: "", date: "", category: "Entretenimiento" });

  // Datos económicos (Cargados desde 'profiles')
  const [income, setIncome] = useState(0); 
  const [savingsGoal, setSavingsGoal] = useState(0);

  // 1. CARGA DE DATOS
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
        // A. Cargar Suscripciones (Solo las activas)
        const { data: subsData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('active', true) // Solo traemos las activas
            .order('price', { ascending: false });

        if (subsData) setSubscriptions(subsData);

        // B. Cargar Perfil (Ingresos y Objetivo)
        const { data: profileData } = await supabase
            .from('profiles')
            .select('income, savings_goal')
            .eq('id', userId)
            .single();

        if (profileData) {
            setIncome(profileData.income || 0);
            setSavingsGoal(profileData.savings_goal || 0);
        }

    } catch (error) {
        console.error("Error cargando:", error);
    } finally {
        setLoading(false);
    }
  };

  // 2. CREAR SUSCRIPCIÓN (Adaptado a tus columnas)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
        const { error } = await supabase.from('subscriptions').insert([
            {
                user_id: user.id,
                name: newSub.name,
                price: parseFloat(newSub.price),
                start_date: newSub.date, // Mapeamos tu input date a 'start_date'
                category: newSub.category,
                // Rellenamos los campos obligatorios de tu tabla
                currency: 'EUR',
                frequency: 'monthly',
                active: true,
                next_payment_date: newSub.date // Asumimos que el primer pago es esa fecha
            }
        ]);
        if (error) throw error;
        
        await fetchData(user.id);
        setIsModalOpen(false);
        setNewSub({ name: "", price: "", date: "", category: "Entretenimiento" }); 
    } catch (error) {
        alert("Error al crear: " + error.message);
    }
  };

  // 3. BORRAR (Soft Delete: Poner active = false)
  const handleDelete = async (id: string) => {
      if (!confirm("¿Seguro que quieres borrar esta suscripción?")) return;
      try {
          // En vez de borrar la fila, la desactivamos para no perder el histórico
          const { error } = await supabase
            .from('subscriptions')
            .update({ active: false }) 
            .eq('id', id);
            
          if (error) throw error;
          setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      } catch (error) {
          console.error("Error borrando:", error);
      }
  };

  // --- CÁLCULOS ---
  const totalExpenses = subscriptions.reduce((acc, sub) => acc + sub.price, 0);
  const remaining = income - totalExpenses - savingsGoal;
  
  const categoryData = subscriptions.reduce((acc: any[], sub) => {
    const existing = acc.find(item => item.name === sub.category);
    if (existing) { existing.value += sub.price; } 
    else { acc.push({ name: sub.category, value: sub.price }); }
    return acc;
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-10 font-sans relative">
      
      {/* MODAL (Igual que antes pero usa la función nueva) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg">Nueva Suscripción</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5"/></button>
                </div>
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                        <input required type="text" placeholder="Ej: Netflix" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Precio (€)</label>
                            <input required type="number" step="0.01" placeholder="0.00" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newSub.price} onChange={e => setNewSub({...newSub, price: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha inicio</label>
                            <input required type="date" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newSub.date} onChange={e => setNewSub({...newSub, date: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                        <select className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={newSub.category} onChange={e => setNewSub({...newSub, category: e.target.value})}>
                            <option>Entretenimiento</option>
                            <option>Música</option>
                            <option>Software</option>
                            <option>Salud</option>
                            <option>Hogar</option>
                            <option>Otros</option>
                        </select>
                    </div>
                    <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-4 h-12 text-lg">Guardar</Button>
                </form>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel Principal</h1>
            <p className="text-slate-500">Bienvenido, {user?.email?.split('@')[0]}</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="bg-white text-slate-700 border-slate-200">
                <Target className="mr-2 h-4 w-4" /> Configurar Ingresos
             </Button>
             <Button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-transform hover:scale-105">
                <Plus className="mr-2 h-4 w-4" /> Nuevo Gasto
             </Button>
          </div>
        </div>

        {/* --- CARDS RESUMEN --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between mb-4"><div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><ArrowUpRight className="h-5 w-5" /></div></div>
                <p className="text-slate-500 text-sm font-medium">Ingresos (Perfil)</p>
                <h3 className="text-2xl font-black text-slate-900">{income}€</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between mb-4"><div className="bg-red-100 p-2 rounded-lg text-red-600"><ArrowDownRight className="h-5 w-5" /></div></div>
                <p className="text-slate-500 text-sm font-medium">Total Gastos</p>
                <h3 className="text-2xl font-black text-slate-900">{totalExpenses.toFixed(2)}€</h3>
            </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between mb-4"><div className="bg-blue-100 p-2 rounded-lg text-blue-600"><PiggyBank className="h-5 w-5" /></div></div>
                <p className="text-slate-500 text-sm font-medium">Objetivo Ahorro</p>
                <h3 className="text-2xl font-black text-slate-900">{savingsGoal}€</h3>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <div className="flex justify-between mb-4"><div className="bg-white/10 p-2 rounded-lg"><Wallet className="h-5 w-5" /></div></div>
                    <p className="text-slate-400 text-sm font-medium">Libre para gastar</p>
                    <h3 className="text-3xl font-black tracking-tight mt-1">{remaining.toFixed(2)}€</h3>
                </div>
            </div>
        </div>

        {/* --- GRÁFICO Y LISTA --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                <h4 className="font-bold text-slate-800 w-full mb-4">Desglose</h4>
                {subscriptions.length > 0 ? (
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <span className="text-2xl font-bold text-slate-900">{totalExpenses.toFixed(0)}€</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-400">Sin datos</p>
                )}
            </div>

            <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-800">Tus Suscripciones Activas</h4>
                </div>
                <div className="space-y-3 flex-1 overflow-auto max-h-[400px]">
                    {subscriptions.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-lg rounded-2xl transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold">
                                    {sub.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{sub.name}</p>
                                    <p className="text-xs text-slate-500">{sub.category} • {sub.start_date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">-{sub.price}€</p>
                                </div>
                                <button onClick={() => handleDelete(sub.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
