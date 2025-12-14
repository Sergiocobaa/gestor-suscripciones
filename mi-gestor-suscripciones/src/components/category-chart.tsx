"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Colores modernos para el gráfico
const COLORS = [
    '#0f172a', // Slate 900 (Tu color principal)
    '#2563eb', // Blue 600
    '#7c3aed', // Violet 600
    '#059669', // Emerald 600
    '#db2777', // Pink 600
    '#eab308', // Yellow 500
];

interface Subscription {
    id: string;
    name: string;
    price: number;
    category: string;
}

interface CategoryChartProps {
    subscriptions: Subscription[];
}

export function CategoryChart({ subscriptions }: CategoryChartProps) {

    const data = subscriptions.reduce((acc: any[], curr) => {
        const existingCategory = acc.find(item => item.name === curr.category);
        if (existingCategory) {
            existingCategory.value += curr.price;
        } else {
            acc.push({ name: curr.category, value: curr.price });
        }
        return acc;
    }, []);

    if (subscriptions.length === 0) return null;

    return (
        <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow border-slate-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-slate-800">Gasto por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%" // Centro X
                                cy="50%" // Centro Y
                                innerRadius={60} // El agujero del donut
                                outerRadius={80} // El borde exterior
                                paddingAngle={5} // Espacio entre trozos
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `${value.toFixed(2)}€`}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}