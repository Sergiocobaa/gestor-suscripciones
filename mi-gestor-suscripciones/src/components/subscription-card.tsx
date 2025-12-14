import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, MoreHorizontal, Pencil, Trash } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SubscriptionCardProps {
    id: string; // Necesitamos el ID para saber cuál borrar
    name: string;
    price: string | number;
    date: string;
    category: string;
    period?: "mes" | "año";
    onEdit: () => void;   // Función que pasaremos desde el dashboard
    onDelete: () => void; // Función que pasaremos desde el dashboard
}

export function SubscriptionCard({ id, name, price, date, category, period = "mes", onEdit, onDelete }: SubscriptionCardProps) {

    const getBadgeStyle = (cat: string) => {
        switch (cat?.toLowerCase()) {
            case 'entretenimiento': return "bg-purple-50 text-purple-700 border-purple-200";
            case 'ia': return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case 'música': return "bg-pink-50 text-pink-700 border-pink-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";

        }
    }

    return (
        <Card className="group relative overflow-hidden border-slate-200/60 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6 pb-3">
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-slate-900 leading-none tracking-tight">
                        {name}
                    </h3>
                    <Badge variant="outline" className={`mt-2 font-medium ${getBadgeStyle(category)}`}>
                        {category}
                    </Badge>
                </div>

                {/* MENÚ DE ACCIONES */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 -mt-1 -mr-2">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                            <Trash className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </CardHeader>

            <CardContent className="p-6 pt-2">
                <div className="flex items-baseline justify-between mt-4">
                    <div className="flex items-baseline">
                        <span className="text-4xl font-bold tracking-tight text-slate-900">
                            {price}
                            <span className="text-xl align-top text-slate-500 ml-1">€</span>
                        </span>
                        <span className="text-sm font-medium text-slate-500 ml-2">/{period}</span>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                        Renueva el {date}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}