"use client";

import { useState, useEffect, useRef } from "react";
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
  X,
} from "lucide-react";

import { LogOut } from "lucide-react";
import { registerServiceWorker, requestNotificationPermission, sendLocalPushNotification } from "@/lib/notifications";
import { applyPrimaryColor } from "@/lib/theme";

interface HeaderProps {
  userRole?: string | null;
}

export function Header({ userRole }: HeaderProps) {
  const [salon, setSalon] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState("light");
  const [pushStatus, setPushStatus] = useState<string>("default");
  const [headerSearch, setHeaderSearch] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("search") || params.get("q");
      if (q) setHeaderSearch(q);
    }
  }, []);

  const knownAppIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);

  // Som agradável de alerta quando um agendamento novo chega no salão
  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Re
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // La
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

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
    registerServiceWorker();

    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission);
    }

    fetchSettings();

    const handleSettingsUpdate = () => fetchSettings();
    window.addEventListener("salon-settings-updated", handleSettingsUpdate);

    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    // Carregar notificações salvas e expirar as de mais de 24h / dias anteriores
    try {
      const saved = localStorage.getItem("nailgestao_daily_notifications_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifications(filterTodayNotifications(parsed));
      }
    } catch (e) {}
  }, []);

  const filterTodayNotifications = (list: any[]): any[] => {
    if (!Array.isArray(list)) return [];
    const now = Date.now();
    const todayStr = new Date().toISOString().split("T")[0];
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    return list.filter((item) => {
      if (!item.timestamp) return false;
      // 1. Purgar se o item tiver mais de 24 horas
      if (now - item.timestamp > TWENTY_FOUR_HOURS) return false;
      // 2. Purgar se for de uma data anterior
      if (item.dateStr && item.dateStr !== todayStr) return false;
      return true;
    });
  };

  const syncRealDailyEvents = async () => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const todayMonthDay = todayStr.substring(5);
      const newItems: any[] = [];

      // 1. Alertas de Estoque Baixo Real
      const invRes = await fetch("/api/inventory").catch(() => null);
      if (invRes && invRes.ok) {
        const invData = await invRes.json();
        if (Array.isArray(invData.products)) {
          const lowProducts = invData.products.filter(
            (p: any) => Number(p.quantity) <= Number(p.minQuantity || 5)
          );
          lowProducts.forEach((p: any) => {
            newItems.push({
              id: `stock-${p.id}-${todayStr}`,
              title: "⚠️ Estoque Baixo",
              message: `${p.name} está com apenas ${p.quantity} unidades no estoque.`,
              type: "WARNING",
              timestamp: Date.now(),
              dateStr: todayStr,
              time: "Hoje",
            });
          });
        }
      }

      // 2. Alertas de Aniversariantes do Dia Real
      const cliRes = await fetch("/api/clients").catch(() => null);
      if (cliRes && cliRes.ok) {
        const cliData = await cliRes.json();
        if (Array.isArray(cliData)) {
          const todayBdays = cliData.filter((c: any) => {
            if (!c.birthDate) return false;
            return c.birthDate.endsWith(todayMonthDay) || c.birthDate.includes(todayMonthDay);
          });
          todayBdays.forEach((c: any) => {
            newItems.push({
              id: `bday-${c.id}-${todayStr}`,
              title: "🎂 Aniversariante Hoje",
              message: `${c.name} completa ano hoje! Que tal enviar um parabéns? 🎉`,
              type: "INFO",
              timestamp: Date.now(),
              dateStr: todayStr,
              time: "Hoje",
            });
          });
        }
      }

      setNotifications((prev) => {
        const filteredPrev = filterTodayNotifications(prev);
        const existingIds = new Set(filteredPrev.map((n) => n.id));
        const itemsToAdd = newItems.filter((item) => !existingIds.has(item.id));
        const updated = [...itemsToAdd, ...filteredPrev];
        try {
          localStorage.setItem("nailgestao_daily_notifications_v1", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    } catch (e) {}
  };

  // Sincronizar eventos reais e expirar notificações antigas periodicamente
  useEffect(() => {
    syncRealDailyEvents();

    const purgeInterval = setInterval(() => {
      setNotifications((prev) => {
        const clean = filterTodayNotifications(prev);
        try {
          localStorage.setItem("nailgestao_daily_notifications_v1", JSON.stringify(clean));
        } catch (e) {}
        return clean;
      });
    }, 30000); // Checar expiração a cada 30 segundos

    return () => clearInterval(purgeInterval);
  }, []);

  // Monitoramento em Tempo Real a cada 6s para Pop-up no Celular e Novos Agendamentos do Dia
  useEffect(() => {
    const checkNewAppointments = async () => {
      try {
        const res = await fetch("/api/appointments");
        if (!res.ok) return;
        const apps = await res.json();
        if (!Array.isArray(apps)) return;

        const todayStr = new Date().toISOString().split("T")[0];
        const currentIds = new Set<string>(apps.map((a: any) => a.id));

        if (!isInitialLoadRef.current) {
          const newApps = apps.filter(
            (a: any) => !knownAppIdsRef.current.has(a.id) && a.status !== "CANCELADO" && a.status !== "BLOQUEADO"
          );

          if (newApps.length > 0) {
            playNotificationSound();

            newApps.forEach((newApp: any) => {
              const serviceName = newApp.services?.[0]?.serviceName || "Procedimento";
              const clientName = newApp.clientName || "Cliente";
              const profName = newApp.professionalName || "";
              const dateStr = newApp.date ? newApp.date.split("-").reverse().join("/") : "";
              const title = "💅 NOVO AGENDAMENTO NO SALÃO!";
              const message = `${clientName} agendou ${serviceName} com ${profName} dia ${dateStr} às ${newApp.startTime}h`;

              // Disparar o Pop-up Nativo no Celular (Android / iOS)
              sendLocalPushNotification(title, message, "/agenda");

              setNotifications((prev) => {
                const filteredPrev = filterTodayNotifications(prev);
                const newNotification = {
                  id: "app-" + newApp.id,
                  title: "🔔 Novo Agendamento",
                  message: `${clientName} agendou ${serviceName} (${newApp.startTime}h)`,
                  type: "SUCCESS",
                  timestamp: Date.now(),
                  dateStr: todayStr,
                  time: "Agora",
                };
                const updated = [newNotification, ...filteredPrev.filter((n) => n.id !== newNotification.id)];
                try {
                  localStorage.setItem("nailgestao_daily_notifications_v1", JSON.stringify(updated));
                } catch (e) {}
                return updated;
              });
            });
          }
        } else {
          isInitialLoadRef.current = false;
        }

        knownAppIdsRef.current = currentIds;
      } catch (err) {
        console.error("Erro ao verificar novos agendamentos:", err);
      }
    };

    checkNewAppointments();
    const interval = setInterval(checkNewAppointments, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleClearNotifications = () => {
    setNotifications([]);
    try {
      localStorage.setItem("nailgestao_daily_notifications_v1", "[]");
    } catch (e) {}
  };

  const handleEnablePush = async () => {
    const perm = await requestNotificationPermission();
    setPushStatus(perm);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const isCollaborator = userRole === "PROFISSIONAL" || userRole === "COLABORADORA" || userRole === "ATENDENTE";

  const displayName = currentUser?.name || salon?.ownerName || "Juliana Silva";
  const displayRole = isCollaborator ? "Colaboradora" : "Administradora";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header
      style={{ backgroundColor: salon?.primaryColor || 'var(--primary-color, #6b1615)' }}
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/20 px-4 text-white backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 shadow-md transition-colors duration-300"
    >
      {/* Branding / Salão */}
      <div className="flex items-center space-x-3">
        <img
          src={salon?.logoUrl && salon.logoUrl !== "/logo.png" ? salon.logoUrl : "/salon-logo-official.png"}
          alt={salon?.name || "Selma Gloor Nails Studio"}
          className="h-10 w-10 rounded-xl object-contain bg-white p-0.5 border-2 border-amber-300/80 shadow-md"
        />
        <div>
          <h1 className="font-serif text-lg font-bold tracking-tight text-white sm:text-xl">
            {salon?.name || "Selma Gloor Nails Studio"}
          </h1>
          <p className="hidden text-xs text-amber-200/90 sm:block font-medium">
            {salon?.slogan || "Especialista em Unhas & Nails Art"}
          </p>
        </div>
      </div>

      {/* Busca & Ações */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Barra de Busca Rápida */}
        {!isCollaborator && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (headerSearch.trim()) {
                window.location.href = `/agenda?search=${encodeURIComponent(headerSearch.trim())}`;
              }
            }}
            className="relative hidden md:block"
          >
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Buscar cliente ou agendamento..."
              className="h-9 w-64 rounded-full bg-slate-100 pl-9 pr-8 text-xs font-medium text-slate-700 outline-none ring-rose-400 focus:ring-2 dark:bg-slate-800 dark:text-slate-200"
            />
            {headerSearch && (
              <button
                type="button"
                onClick={() => {
                  setHeaderSearch("");
                  if (window.location.pathname === "/agenda") {
                    window.location.href = "/agenda";
                  }
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        )}

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
          className="rounded-full p-2 text-slate-200 transition hover:bg-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Alternar Tema Claro/Escuro"
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
        </button>

        {/* Central de Notificações */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-slate-200 transition hover:bg-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="fixed inset-x-3 top-16 z-50 mt-2 max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-rose-200/90 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:rounded-2xl">
              <div className="mb-3 flex items-center justify-between border-b border-rose-100 pb-2 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                    Notificações do Salão
                  </h3>
                  <span className="text-[9px] font-bold text-slate-400">Validade 24h &bull; Expira a cada dia 🌅</span>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearNotifications}
                    className="text-[10px] font-extrabold text-[#6B1615] hover:underline dark:text-rose-300"
                    title="Limpar todas as notificações de hoje"
                  >
                    Limpar 🗑️
                  </button>
                )}
              </div>

              {/* Banner Ativação de Pop-up Push no Celular */}
              <div className="mb-3 rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 p-3 border border-rose-200/80 dark:from-slate-800 dark:to-slate-800/80">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-extrabold text-[#6B1615] dark:text-amber-200">📲 Pop-ups no Celular</p>
                    <p className="text-[9px] font-semibold text-slate-600 dark:text-rose-100">
                      {pushStatus === "granted" ? "🟢 Ativadas para Agendamentos, Estoque e Aniversários" : "Ative para receber alertas de agendamentos, estoque e aniversariantes"}
                    </p>
                  </div>
                  <button
                    onClick={handleEnablePush}
                    className="shrink-0 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 px-3 py-1.5 text-[10px] font-extrabold text-white shadow-sm hover:opacity-95"
                  >
                    {pushStatus === "granted" ? "Testar Pop-up 🔔" : "Ativar Pop-up 🔔"}
                  </button>
                </div>
              </div>

              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        sendLocalPushNotification(n.title, n.message, "/agenda");
                      }}
                      className="flex items-start space-x-2.5 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 cursor-pointer hover:bg-rose-50 dark:hover:bg-slate-700/80 transition"
                      title="Clique para disparar pop-up de teste no celular"
                    >
                      {n.type === "WARNING" ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{n.title}</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">{n.message}</p>
                        <span className="text-[9px] font-semibold text-slate-400">{n.time} &bull; Toque para ver no celular 📲</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-4 text-center dark:border-slate-800 dark:bg-slate-800/40 space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">✨ Nenhuma notificação pendente hoje!</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    As notificações expiram automaticamente após 24h para você iniciar todos os dias com a tela limpa e organizada.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar do Usuário Logado + Logout */}
        <div className="flex items-center space-x-3 border-l border-white/20 pl-3 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 font-bold text-white shadow-md text-xs border-2 border-white/40 overflow-hidden">
              {salon?.logoUrl || currentUser?.avatarUrl ? (
                <img src={salon?.logoUrl || currentUser?.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-extrabold text-white leading-tight">{displayName}</p>
              <p className="text-[10px] text-amber-200 font-bold leading-tight">{displayRole}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs font-bold text-rose-100 hover:bg-rose-600 hover:text-white transition"
            title="Sair da Conta"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
