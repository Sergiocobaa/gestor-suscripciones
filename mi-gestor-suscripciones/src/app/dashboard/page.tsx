"use client";

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { SubscriptionCard } from "@/components/subscription-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Save, Wallet } from "lucide-react" // Asegúrate de tener Wallet
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { CategoryChart } from "@/components/category-chart"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// 1. IMPORTAR EL SWITCH Y EL LABEL
import { Switch } from "@/components/ui/switch"

interface Subscription {
  id: string
  name: string
  price: number
  category: string
  start_date: string
}

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // 2. NUEVO ESTADO PARA EL MODO ANUAL
  const [isYearly, setIsYearly] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    date: "",
    category: "Entretenimiento"
  })

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  async function fetchSubscriptions() {
    try {
      const { data, error } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setSubscriptions(data || [])
    } catch (error) {
      console.error(error)
      toast.error("Error cargando datos")
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: "", price: "", date: "", category: "Entretenimiento" });
    setIsOpen(true);
  }

  const openEditModal = (sub: Subscription) => {
    setEditingId(sub.id);
    setFormData({
      name: sub.name,
      price: sub.price.toString(),
      date: sub.start_date,
      category: sub.category
    });
    setIsOpen(true);
  }

  async function handleSave() {
    if (!formData.name || !formData.price || !formData.date) {
      toast.warning("Rellena todos los campos")
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No logueado")

      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        start_date: formData.date,
        next_payment_date: formData.date,
        category: formData.category,
        user_id: user.id
      }

      let error;

      if (editingId) {
        const response = await supabase.from('subscriptions').update(payload).eq('id', editingId);
        error = response.error;
      } else {
        const response = await supabase.from('subscriptions').insert([payload]);
        error = response.error;
      }

      if (error) throw error

      toast.success(editingId ? "¡Suscripción actualizada!" : "¡Suscripción añadida!")
      setIsOpen(false)
      fetchSubscriptions()
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que quieres borrar esta suscripción?")) return;
    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (error) {
      toast.error("Error al borrar");
    } else {
      toast.success("Eliminada correctamente");
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    }
  }

  // CÁLCULO INTELIGENTE
  const totalMonthly = subscriptions.reduce((acc, sub) => acc + sub.price, 0)
  // Si está en modo anual, multiplicamos por 12
  const displayTotal = isYearly ? totalMonthly * 12 : totalMonthly

  return (
    <div className="min-h-screen w-full bg-grid-pattern relative selection:bg-blue-100">
      <div className="fixed inset-0 bg-blue-glow z-0"></div>

      <div className="relative z-10">
        <Navbar />

        <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">

          {/* CABECERA CON INTERRUPTOR */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            {/* 3. INTERRUPTOR (SWITCH) */}
            <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm p-2 rounded-lg border border-slate-200">
              <Switch
                id="mode-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <Label htmlFor="mode-toggle" className="cursor-pointer font-medium text-slate-700">
                {isYearly ? "Pago Anual (x12)" : "Pago Mensual"}
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-start">

            <div className="md:col-span-2 space-y-8">
              <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                  Tus Gastos
                </h1>
                <p className="text-base sm:text-lg text-slate-500">
                  Gestiona y controla tus pagos recurrentes.
                </p>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/20 transform transition-all hover:scale-[1.01]">
                <div className="flex justify-between items-start">
                  <div>
                    {/* CAMBIAMOS EL TEXTO SEGÚN EL MODO */}
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {isYearly ? "Total Anual Estimado" : "Total Mensual"}
                    </span>
                    <div className="text-4xl sm:text-6xl font-black tracking-tighter mt-2 transition-all duration-300">
                      {displayTotal.toFixed(2)}€
                    </div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <Wallet className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="text-sm font-medium text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full">
                    {subscriptions.length} suscripciones activas
                  </div>
                </div>
              </div>
            </div>

            {/* Pasamos los datos modificados al gráfico si quisiéramos, pero el gráfico muestra porcentajes así que da igual */}
            <CategoryChart subscriptions={subscriptions} />

          </div>

          {/* ... BARRA DE ACCIONES ... */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 gap-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 self-start sm:self-auto">
              Mis Suscripciones
            </h2>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateModal} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-12 sm:h-10 text-base sm:text-sm">
                  <Plus className="mr-2 h-5 w-5 sm:h-4 sm:w-4" /> Nueva Suscripción
                </Button>
              </DialogTrigger>
              {/* ... CONTENIDO DEL MODAL (IGUAL QUE ANTES) ... */}
              <DialogContent className="w-[95%] sm:max-w-[425px] bg-white rounded-xl">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Editar suscripción" : "Añadir servicio"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Netflix"
                      className="h-11 sm:h-10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Precio Mensual (€)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        className="h-11 sm:h-10"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Día cobro</Label>
                      <Input
                        id="date"
                        type="date"
                        className="h-11 sm:h-10"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Categoría</Label>
                    <Select
                      onValueChange={(val) => setFormData({ ...formData, category: val })}
                      value={formData.category}
                    >
                      <SelectTrigger className="h-11 sm:h-10">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entretenimiento">Entretenimiento</SelectItem>
                        <SelectItem value="Música">Música</SelectItem>
                        <SelectItem value="Software">Software / IA</SelectItem>
                        <SelectItem value="Hogar">Hogar / Compras</SelectItem>
                        <SelectItem value="Otros">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving} className="bg-slate-900 text-white w-full sm:w-auto h-12 sm:h-10">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {editingId ? "Actualizar" : "Guardar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">Cargando...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  id={sub.id}
                  name={sub.name}
                  period={isYearly ? "año" : "mes"}
                  // 4. AQUÍ LA MAGIA: Multiplicamos el precio en la tarjeta si es modo anual
                  price={isYearly ? (sub.price * 12).toFixed(2) : sub.price.toFixed(2)}
                  date={new Date(sub.start_date).toLocaleDateString()}
                  category={sub.category}
                  onEdit={() => openEditModal(sub)}
                  onDelete={() => handleDelete(sub.id)}
                />
              ))}

              <div
                onClick={openCreateModal}
                className="flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl p-6 h-full min-h-[140px] sm:min-h-[180px] text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/30 transition-all duration-200 group cursor-pointer bg-white/50"
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-hover:text-blue-600" />
                </div>
                <span className="font-medium text-sm">Añadir servicio</span>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}