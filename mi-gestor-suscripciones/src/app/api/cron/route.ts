import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Importamos createClient directo
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// CREAMOS EL CLIENTE ADMIN (CON LA LLAVE MAESTRA)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ¡Esta es la clave nueva!
);

export async function GET() {
    // Evitar cache (Importante para cron jobs)
    const dynamic = 'force-dynamic';

    const today = new Date();
    today.setDate(today.getDate() + 3);
    const targetDate = today.toISOString().split('T')[0];

    try {
        // Usamos 'supabaseAdmin' en lugar de 'supabase'
        const { data: subscriptions, error } = await supabaseAdmin
            .from('subscriptions')
            .select('*, profiles(email, full_name)')
            .eq('next_payment_date', targetDate);

        if (error) {
            console.error("Error Supabase:", error);
            throw error;
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ message: 'Nadie renueva en 3 días (Admin check)' });
        }

        // Enviamos los emails
        for (const sub of subscriptions) {
            // @ts-ignore
            const email = sub.profiles?.email;
            // @ts-ignore
            const name = sub.profiles?.full_name || "Usuario";

            if (email) {
                await resend.emails.send({
                    from: 'Recur <onboarding@resend.dev>', // Usa este email si no tienes dominio propio verificado
                    to: email, // Al ser cuenta gratis de Resend, SOLO llegará si este email es el tuyo (admin)
                    subject: `⚠️ ${sub.name} se renueva pronto`,
                    html: `<p>Hola ${name}, tu suscripción a <strong>${sub.name}</strong> por <strong>${sub.price}€</strong> se cobrará el ${targetDate}.</p>`
                });
            }
        }

        return NextResponse.json({ success: true, count: subscriptions.length });
    } catch (error) {
        return NextResponse.json({ error: 'Error en cron' }, { status: 500 });
    }
}