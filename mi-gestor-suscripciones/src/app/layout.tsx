import type { Metadata, Viewport } from "next"; // Importamos Viewport
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Tus fuentes (No tocamos nada)
const kaio = localFont({
  src: [
    { path: './fonts/KaioTRIAL-Regular-BF65f24de206d9d.otf', weight: '400', style: 'normal' },
    { path: './fonts/KaioTRIAL-Medium-BF65f24de1b8279.otf', weight: '500', style: 'normal' },
    { path: './fonts/KaioTRIAL-Bold-BF65f24de19552f.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-kaio',
});

// 1. METADATOS: Aquí vinculamos el manifest
export const metadata: Metadata = {
  title: "Recur",
  description: "Controla tus gastos recurrentes.",
  manifest: "/manifest.json", 
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Recur",
  },
};

// 2. VIEWPORT: Para que parezca una app (sin zoom)
export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${kaio.variable} font-sans antialiased overscroll-none`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}