"use client";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface MonthSelectorProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthSelector({ currentDate, onMonthChange }: MonthSelectorProps) {
  
  // Función nativa para restar 1 mes
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  // Función nativa para sumar 1 mes
  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  // Formato nativo en Español (Ej: "Octubre 2025")
  const formatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
  const monthLabel = formatter.format(currentDate);
  
  // Poner primera letra mayúscula
  const capitalizedLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm w-full max-w-[280px] mx-auto select-none mb-6">
      <button 
        onClick={handlePrev}
        className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
        <Calendar className="h-4 w-4 text-emerald-500" />
        {capitalizedLabel}
      </div>

      <button 
        onClick={handleNext}
        className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}