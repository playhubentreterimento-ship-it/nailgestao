"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Sparkles,
  Calendar,
  Plus,
  Moon,
  Sun,
  User as UserIcon,
  Search,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export function Header() {
  const [salon, setSalon] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSalon(data))
      .catch(() => {});

    // Carregar notificações fictícias/iniciais
    setNotifications([
      { id: "1", title: "⚠️ Estoque Baixo", message: "Gel Pink Hard está com 3 unidades.", type: "WARNING", time: "Há 10 min" },
      { id: "2", title: "🔔 Novo Agendamento", message: "Maria Fernanda agendou Fibra de Vidro.", type: "SUCCESS", time: "Há 25 min" },
      { id: "3", title: "🎂 Aniversariante Hoje", message: "Fernanda Lima completa ano hoje!", type: "INFO", time: "Hoje" },
    ]);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-rose-200/40 bg-[#6b1615]/95 px-4 text-white backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 shadow-md">
      {/* Branding / Salão */}
      <div className="flex items-center space-x-3">
        {salon?.logoUrl ? (
          <img
            src={salon.logoUrl}
            alt={salon.name || "Logo do Salão"}
            className="h-10 w-10 rounded-xl object-cover border-2 border-amber-300/80 shadow-md"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-amber-600 font-bold text-white shadow-md">
            💅
          </div>
        )}
        <div>
          <h1 className="font-serif text-lg font-bold tracking-tight text-white sm:text-xl">
            {salon?.name || "Studio Luxe Nail Designer"}
          </h1>
          <p className="hidden text-xs text-amber-200/90 sm:block font-medium">
            {salon?.slogan || "Especialistas em Alongamentos & Estética"}
          </p>
        </div>
      </div>

      {/* Busca & Ações */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Barra de Busca Rápida */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar cliente, serviço..."
            className="h-9 w-60 rounded-full bg-slate-100 pl-9 pr-4 text-xs font-medium text-slate-700 outline-none ring-rose-400 focus:ring-2 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Botão Agendamento Rápido (Desktop) */}
        <Link
          href="/agenda?modal=new"
          className="hidden items-center space-x-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-200 transition hover:opacity-95 dark:shadow-none sm:flex"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Agendamento</span>
        </Link>

        {/* Botão Páginas Públicas */}
        <Link
          href="/agendar"
          target="_blank"
          className="hidden rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-300 lg:block"
        >
          🌐 Ver Agenda Pública
        </Link>

        {/* Alternar Tema */}
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Alternar Tema Claro/Escuro"
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
        </button>

        {/* Central de Notificações */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-rose-100 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between border-b pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Notificações do Salão
                </h3>
                <span className="text-[10px] text-rose-600 font-semibold">{notifications.length} novas</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start space-x-2.5 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60"
                  >
                    {n.type === "WARNING" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{n.message}</p>
                      <span className="text-[9px] text-slate-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar do Usuário Logado */}
        <div className="flex items-center space-x-2 border-l border-slate-200 pl-3 dark:border-slate-700">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-rose-400 to-amber-300 font-semibold text-white">
            JS
          </div>
          <div className="hidden text-left xl:block">
            <p className="text-xs font-bold text-slate-800 dark:text-white">Juliana Silva</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Administradora</p>
          </div>
        </div>
      </div>
    </header>
  );
}
