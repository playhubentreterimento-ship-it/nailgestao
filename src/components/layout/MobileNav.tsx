"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Receipt,
  Menu,
  Plus,
  X,
  PlayCircle,
  DollarSign,
  Sparkles,
  MessageSquare,
  Boxes,
  FileText,
  Lightbulb,
  Settings,
  Package,
  Heart,
  Gift,
  Megaphone,
  Cake,
} from "lucide-react";

interface MobileNavProps {
  userRole?: string | null;
}

export function MobileNav({ userRole }: MobileNavProps) {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isCollaborator = userRole === "PROFISSIONAL" || userRole === "COLABORADORA" || userRole === "ATENDENTE";

  const mainItems = isCollaborator
    ? [
        { href: "/agenda", label: "Agenda", icon: Calendar },
        { href: "/atendimento", label: "Atendimento", icon: PlayCircle },
      ]
    : [
        { href: "/", label: "Início", icon: LayoutDashboard },
        { href: "/agenda", label: "Agenda", icon: Calendar },
        { href: "/clientes", label: "Clientes", icon: Users },
        { href: "/caixa", label: "Caixa", icon: Receipt },
      ];

  const extraItems = [
    { href: "/servicos", label: "Serviços & Tabela", icon: Sparkles },
    { href: "/pacotes", label: "Pacotes", icon: Package },
    { href: "/atendimento", label: "Atendimento", icon: PlayCircle },
    { href: "/financeiro", label: "Financeiro & DRE", icon: DollarSign },
    { href: "/whatsapp", label: "WhatsApp", icon: MessageSquare },
    { href: "/estoque", label: "Estoque", icon: Boxes },
    { href: "/fidelidade", label: "Fidelidade", icon: Heart },
    { href: "/gift-cards", label: "Gift Cards", icon: Gift },
    { href: "/campanhas", label: "Campanhas", icon: Megaphone },
    { href: "/aniversariantes", label: "Aniversários", icon: Cake },
    { href: "/relatorios", label: "Relatórios", icon: FileText },
    { href: "/insights", label: "Insights IA", icon: Lightbulb },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <>
      {/* Botão Flutuante de Agendamento Rápido no Celular */}
      <Link
        href="/agenda?modal=new"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-600 font-bold text-white shadow-xl shadow-rose-300 transition hover:scale-105 active:scale-95 dark:shadow-none md:hidden"
        title="Novo Agendamento"
      >
        <Plus className="h-7 w-7" />
      </Link>

      {/* Modal / Sheet do Menu Mais */}
      {showMoreMenu && !isCollaborator && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/70 backdrop-blur-sm md:hidden">
          <div className="mt-auto rounded-t-3xl bg-white p-6 border-t-2 border-rose-200 shadow-2xl dark:bg-[#2D1B24] dark:border-rose-900">
            <div className="mb-4 flex items-center justify-between border-b border-rose-100 pb-3 dark:border-rose-900/60">
              <h3 className="font-serif text-lg font-extrabold text-[#6B1615] dark:text-white">Mais Opções do Salão</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 py-2">
              {extraItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMoreMenu(false)}
                    className="flex flex-col items-center justify-center rounded-2xl bg-[#FAF0EC] p-3 text-center border border-rose-200/60 transition active:scale-95 dark:bg-[#1E121A] dark:border-rose-900/60 shadow-sm"
                  >
                    <Icon className="h-6 w-6 text-[#6B1615] dark:text-amber-300" />
                    <span className="mt-1.5 text-[10px] font-extrabold text-slate-900 dark:text-rose-100">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-rose-200/80 bg-white/95 px-2 backdrop-blur-lg dark:border-rose-900/60 dark:bg-[#20121C]/95 md:hidden shadow-lg">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 py-1 transition ${
                isActive ? "text-[#6B1615] dark:text-amber-300" : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "scale-110 text-[#6B1615] dark:text-amber-300" : "text-slate-500 dark:text-slate-300"}`} />
              <span className={`text-[10px] ${isActive ? "font-extrabold text-[#6B1615] dark:text-amber-300" : "font-bold text-slate-700 dark:text-slate-300"}`}>{item.label}</span>
            </Link>
          );
        })}

        {!isCollaborator && (
          <button
            onClick={() => setShowMoreMenu(true)}
            className="flex flex-col items-center justify-center space-y-1 py-1 text-slate-600 hover:text-slate-900 dark:text-slate-300"
          >
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Mais</span>
          </button>
        )}
      </nav>
    </>
  );
}
