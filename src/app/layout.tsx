import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "NAILGESTÃO - Sistema Profissional de Gestão para Salão de Nail Designer",
  description: "Plataforma completa de agendamento, clientes, financeiro, caixa e automação WhatsApp para estúdios de manicures e junto de unhas.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-[#831d1c] font-sans text-slate-800 antialiased dark:bg-[#5c1312] dark:text-slate-100">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
