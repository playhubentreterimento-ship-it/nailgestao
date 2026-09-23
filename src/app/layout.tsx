import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";

export const metadata: Metadata = {
  title: "NailGestão — Sistema de Gestão para Nail Designers",
  description: "Organize agenda, clientes, serviços e financeiro do seu Nail Studio em um só lugar. Teste o NailGestão gratuitamente por 7 dias.",
  metadataBase: new URL("https://nailgestao-pro11.vercel.app"),
  alternates: {
    canonical: "https://nailgestao-pro11.vercel.app/",
  },
  openGraph: {
    title: "NailGestão — Sistema de Gestão para Nail Designers",
    description: "Organize agenda, clientes, serviços e financeiro do seu Nail Studio em um só lugar. Teste o NailGestão gratuitamente por 7 dias.",
    url: "https://nailgestao-pro11.vercel.app/",
    siteName: "NailGestão PRO",
    images: [
      {
        url: "/luxe-logo.jpg",
        width: 1200,
        height: 630,
        alt: "NailGestão PRO - Sistema Comercial para Nail Designers",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NailGestão | Sistema de Gestão para Nail Designers",
    description: "Agenda, clientes, WhatsApp, ficha técnica e financeiro em um só lugar.",
    images: ["/luxe-logo.jpg"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NailGestão PRO",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "NailGestão PRO",
  "operatingSystem": "Web, Android, iOS",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "49.00",
    "priceCurrency": "BRL",
  },
  "description": "Sistema de gestão completo para Nail Designers e Salões de Unhas com agenda online, confirmações WhatsApp, ficha técnica e financeiro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-[#0F0F12] font-sans text-slate-100 antialiased selection:bg-rose-500 selection:text-white">
        <AnalyticsScripts />
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
