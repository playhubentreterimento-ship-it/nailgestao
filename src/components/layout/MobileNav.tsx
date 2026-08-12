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
        { href: "/caixa", label: "Caixa", icon: Receipt },
      ]
    : [
        { href: "/", label: "Início", icon: LayoutDashboard },
        { href: "/agenda", label: "Agenda", icon: Calendar },
        { href: "/clientes", label: "Clientes", icon: Users },
        { href: "/caixa", label: "Caixa", icon: Receipt },
      ];

  const extraItems = [
    { href: "/atendimento", label: "Atendimento", icon: PlayCircle },
    { href: "/financeiro", label: "Financeiro & DRE", icon: DollarSign },
    { href: "/servicos", label: "Serviços", icon: Sparkles },
    { href: "/whatsapp", label: "WhatsApp", icon: MessageSquare },
    { href: "/estoque", label: "Estoque", icon: Boxes },
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
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-sm md:hidden">
          <div className="mt-auto rounded-t-3xl bg-white p-6 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white">Mais Opções do Salão</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 py-2">
              {extraItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMoreMenu(false)}
                    className="flex flex-col items-center justify-center rounded-2xl bg-rose-50/70 p-3 text-center transition active:scale-95 dark:bg-slate-800"
                  >
                    <Icon className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                    <span className="mt-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-200">
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-rose-100 bg-white/95 px-2 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 py-1 transition ${
                isActive ? "text-rose-600 dark:text-rose-400" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""}`} />
              <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
            </Link>
          );
        })}

        {!isCollaborator && (
          <button
            onClick={() => setShowMoreMenu(true)}
            className="flex flex-col items-center justify-center space-y-1 py-1 text-slate-400 hover:text-slate-600"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">Mais</span>
          </button>
        )}
      </nav>
    </>
  );
}
