"use client";

import { useState, useEffect } from "react";
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
import { applyPrimaryColor } from "@/lib/theme";

interface SidebarProps {
  userRole?: string | null;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [salon, setSalon] = useState<any>(null);

  const fetchSettings = () => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSalon(data);
        if (data?.primaryColor) {
          applyPrimaryColor(data.primaryColor);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSettings();
    const handleSettingsUpdate = () => fetchSettings();
    window.addEventListener("salon-settings-updated", handleSettingsUpdate);
    return () => window.removeEventListener("salon-settings-updated", handleSettingsUpdate);
  }, []);

  const isReception = userRole === "RECEPÇÃO" || userRole === "RECEPCAO";
  const isProfessional = userRole === "PROFISSIONAL" || userRole === "COLABORADORA" || userRole === "ATENDENTE";
  const isCollaborator = isReception || isProfessional;

  const adminMenuGroups = [
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

  const receptionMenuGroups = [
    {
      title: "PAINEL DA RECEPÇÃO",
      items: [
        { href: "/agenda", label: "Agenda Visual", icon: Calendar },
      ],
    },
  ];

  const professionalMenuGroups = [
    {
      title: "PAINEL DA PROFISSIONAL",
      items: [
        { href: "/agenda", label: "Agenda Visual", icon: Calendar },
        { href: "/caixa", label: "Caixa do Dia", icon: Receipt },
        { href: "/atendimento", label: "Tela de Atendimento", icon: PlayCircle },
      ],
    },
  ];

  const menuGroups = isReception
    ? receptionMenuGroups
    : isProfessional
    ? professionalMenuGroups
    : adminMenuGroups;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-rose-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-rose-900/50 dark:bg-[#20121C] md:flex">
      <div className="flex flex-1 flex-col space-y-6 overflow-y-auto pr-1">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h4
              style={{ color: salon?.primaryColor || 'var(--primary-color, #6B1615)' }}
              className="px-3 text-[10px] font-extrabold uppercase tracking-wider dark:text-amber-200"
            >
              {group.title}
            </h4>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={isActive ? { backgroundColor: salon?.primaryColor || 'var(--primary-color, #6B1615)' } : undefined}
                  className={`group flex items-center space-x-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? "text-white shadow-md shadow-rose-200/60 dark:shadow-none"
                      : "text-slate-700 hover:bg-rose-100/70 hover:text-rose-800 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-rose-700/70 group-hover:text-rose-800 dark:text-rose-300"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Card Suporte / PWA */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#FFF5F2] to-[#F5E6E0] p-3 text-center border border-rose-200/80 dark:from-[#2B1B24] dark:to-[#24151E] dark:border-rose-900">
        <p className="text-xs font-extrabold text-[#6B1615] dark:text-amber-200">NAILGESTÃO Pro 💅</p>
        <p className="text-[10px] font-semibold text-slate-600 dark:text-rose-100">
          {isCollaborator ? "Acesso Restrito Colaboradora" : "Painel Master Salão"}
        </p>
      </div>
    </aside>
  );
}
