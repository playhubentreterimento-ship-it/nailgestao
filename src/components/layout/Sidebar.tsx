"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  PlayCircle,
  DollarSign,
  Receipt,
  Sparkles,
  Package,
  Gift,
  Award,
  MessageSquare,
  Megaphone,
  Cake,
  Boxes,
  FileText,
  Lightbulb,
  ShieldCheck,
  Settings,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: "PRINCIPAL",
      items: [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/agenda", label: "Agenda Visual", icon: Calendar },
        { href: "/clientes", label: "Clientes & CRM", icon: Users },
        { href: "/atendimento", label: "Tela de Atendimento", icon: PlayCircle },
      ],
    },
    {
      title: "FINANCEIRO & CAIXA",
      items: [
        { href: "/caixa", label: "Caixa do Dia", icon: Receipt },
        { href: "/financeiro", label: "Financeiro & DRE", icon: DollarSign },
      ],
    },
    {
      title: "SERVIÇOS & VENDAS",
      items: [
        { href: "/servicos", label: "Serviços & Preços", icon: Sparkles },
        { href: "/pacotes", label: "Pacotes & Sessões", icon: Package },
        { href: "/gift-cards", label: "Vales-Presente", icon: Gift },
        { href: "/fidelidade", label: "Fidelidade & Pontos", icon: Award },
      ],
    },
    {
      title: "MARKETING & WHATSAPP",
      items: [
        { href: "/whatsapp", label: "WhatsApp Hub", icon: MessageSquare },
        { href: "/campanhas", label: "Campanhas Massivas", icon: Megaphone },
        { href: "/aniversariantes", label: "Aniversariantes", icon: Cake },
      ],
    },
    {
      title: "ESTOQUE & GESTÃO",
      items: [
        { href: "/estoque", label: "Estoque & Alertas", icon: Boxes },
        { href: "/relatorios", label: "Relatórios Executivos", icon: FileText },
        { href: "/insights", label: "Insights de IA", icon: Lightbulb },
        { href: "/auditoria", label: "Logs de Auditoria", icon: ShieldCheck },
        { href: "/configuracoes", label: "Configurações", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-rose-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex">
      <div className="flex flex-1 flex-col space-y-6 overflow-y-auto pr-1">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.title}
            </h4>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center space-x-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-200 dark:shadow-none"
                      : "text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-rose-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Card Suporte / PWA */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 p-3 text-center dark:from-slate-800 dark:to-slate-800/80">
        <p className="text-xs font-bold text-slate-800 dark:text-white">NAILGESTÃO Pro 💅</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">PWA Instalado & Ativo</p>
      </div>
    </aside>
  );
}
