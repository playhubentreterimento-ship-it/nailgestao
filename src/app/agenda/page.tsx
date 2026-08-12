"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  PlayCircle,
  Lock,
  Filter,
  X,
  Sparkles,
  Eye,
  Phone,
  Check,
} from "lucide-react";

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Auxiliar para obter o intervalo da semana (Segunda a Domingo)
function getWeekDays(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const curr = new Date(y, m - 1, d);
  const dayOfWeek = curr.getDay(); // 0 = Domingo, 1 = Segunda...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + distanceToMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const temp = new Date(monday);
    temp.setDate(monday.getDate() + i);
    const yyyy = temp.getFullYear();
    const mm = String(temp.getMonth() + 1).padStart(2, "0");
    const dd = String(temp.getDate()).padStart(2, "0");
    days.push(`${yyyy}-${mm}-${dd}`);
  }
  return days;
}

// Auxiliar para obter a grade de dias do mês
function getMonthCalendar(dateStr: string) {
  const [y, m] = dateStr.split("-").map(Number);
  const firstDay = new Date(y, m - 1, 1);
  const lastDay = new Date(y, m, 0);
  
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Dom, 1 = Seg...
  const mondayOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const days: string[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const mm = String(m).padStart(2, "0");
    const dd = String(i).padStart(2, "0");
    days.push(`${y}-${mm}-${dd}`);
  }

  return { year: y, month: m, daysInMonth, mondayOffset, days };
}

export default function AgendaPage() {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [filterProf, setFilterProf] = useState<string>("all");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Form de Agendamento
  const [formClient, setFormClient] = useState("");
  const [formProf, setFormProf] = useState("");
  const [formDate, setFormDate] = useState(getTodayString());
  const [formTime, setFormTime] = useState("10:00");
  const [formSelectedServices, setFormSelectedServices] = useState<string[]>([]);
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formDeposit, setFormDeposit] = useState<number>(50);
  const [formNotes, setFormNotes] = useState("");

  const loadAgenda = () => {
    setLoading(true);
    let url = `/api/appointments?professionalId=${filterProf}`;
    
    if (viewMode === "day") {
      url += `&date=${selectedDate}`;
    } else if (viewMode === "week") {
      const weekDays = getWeekDays(selectedDate);
      url += `&startDate=${weekDays[0]}&endDate=${weekDays[6]}`;
    } else if (viewMode === "month") {
      const monthPrefix = selectedDate.substring(0, 7);
      url += `&month=${monthPrefix}`;
    }

    fetch(url, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const refreshAllData = () => {
    loadAgenda();
    fetch("/api/professionals", { cache: "no-store" }).then((r) => r.json()).then(setProfessionals).catch(() => {});
    fetch("/api/services", { cache: "no-store" }).then((r) => r.json()).then((res) => setServices(res.services || [])).catch(() => {});
    fetch("/api/clients", { cache: "no-store" }).then((r) => r.json()).then(setClients).catch(() => {});
  };

  useEffect(() => {
    refreshAllData();
    window.addEventListener("focus", refreshAllData);
    return () => window.removeEventListener("focus", refreshAllData);
  }, [selectedDate, filterProf, viewMode]);

  const handleOpenModal = (presetDate?: string, presetTime?: string) => {
    refreshAllData();
    setFormDate(presetDate || selectedDate);
    if (presetTime) setFormTime(presetTime);
    setShowModal(true);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClient || !formProf || formSelectedServices.length === 0) {
      alert("Por favor, selecione a cliente, a profissional e ao menos 1 serviço.");
      return;
    }

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: formClient,
        professionalId: formProf,
        date: formDate,
        startTime: formTime,
        serviceIds: formSelectedServices,
        discount: Number(formDiscount),
        depositPaid: Number(formDeposit),
        notes: formNotes,
      }),
    });

    if (res.ok) {
      alert("✨ Agendamento criado com sucesso! Lembrete enviado via WhatsApp.");
      setShowModal(false);
      setSelectedDate(formDate);
      loadAgenda();
    } else {
      const err = await res.json();
      alert("Erro ao agendar: " + err.error);
    }
  };

  const handleFinishAppointment = (id: string) => {
    fetch(`/api/appointments`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "CONCLUIDO" }),
    }).then(() => loadAgenda());
  };

  const handleCancelAppointment = async (app: any) => {
    if (
      confirm(
        `⚠️ Tem certeza que deseja CANCELAR e EXCLUIR o agendamento da cliente "${app.clientName}" do dia ${app.date} às ${app.startTime}?\n\nEste horário será liberado imediatamente para novas clientes agendarem!`
      )
    ) {
      const res = await fetch(`/api/appointments?id=${app.id}`, { method: "DELETE" });
      if (res.ok) {
        alert("✨ Agendamento cancelado e excluído com sucesso! Horário liberado na agenda.");
        loadAgenda();
      } else {
        const err = await res.json();
        alert("Erro ao excluir agendamento: " + err.error);
      }
    }
  };

  // Cálculos do modal
  const selectedServicesObjects = services.filter((s) => formSelectedServices.includes(s.id));
  const calcSubtotal = selectedServicesObjects.reduce((acc, s) => acc + (s.promoPrice || s.price), 0);
  const calcTotal = Math.max(0, calcSubtotal - formDiscount);
  const calcRemaining = Math.max(0, calcTotal - formDeposit);
  const calcDuration = selectedServicesObjects.reduce((acc, s) => acc + s.durationMinutes, 0);

  const statusColors: any = {
    AGENDADO: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200",
    CONFIRMADO: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200",
    AGUARDANDO_CONFIRMACAO: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200",
    EM_ATENDIMENTO: "bg-rose-100 text-rose-900 border-rose-400 animate-pulse dark:bg-rose-950 dark:text-rose-200",
    CONCLUIDO: "bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950 dark:text-teal-200",
    CANCELADO: "bg-slate-200 text-slate-600 line-through dark:bg-slate-800 dark:text-slate-400",
    NAO_COMPARECEU: "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950 dark:text-orange-200",
  };

  const timeSlots = [
    "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00"
  ];

  // Dados para Semana e Mês
  const weekDays = getWeekDays(selectedDate);
  const monthInfo = getMonthCalendar(selectedDate);

  // Totais da Semana
  const totalWeekApps = appointments.length;
  const totalWeekRevenue = appointments.reduce((acc, a) => acc + (a.total || 0), 0);

  // Agrupar agendamentos por dia do mês (para visualização mensal)
  const appointmentsByDate: { [dateStr: string]: any[] } = {};
  appointments.forEach((app) => {
    if (!appointmentsByDate[app.date]) {
      appointmentsByDate[app.date] = [];
    }
    appointmentsByDate[app.date].push(app);
  });

  const datesWithApps = Object.keys(appointmentsByDate).sort();

  return (
    <div className="space-y-6">
      {/* Header & Controles da Agenda */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-bold text-amber-200 sm:text-3xl">
            Agenda Interativa
          </h2>
          <p className="text-xs text-rose-100/90 font-medium">
            Gerenciamento visual de atendimentos, confirmações e resumos por período.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de data */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />

          {/* Filtro por Profissional */}
          <select
            value={filterProf}
            onChange={(e) => setFilterProf(e.target.value)}
            className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            <option value="all">Todas as Profissionais</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Visualizações (Dia, Semana, Mês) */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("day")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "day" ? "bg-white text-rose-600 shadow dark:bg-slate-900 dark:text-rose-400" : "text-slate-600"
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "week" ? "bg-white text-rose-600 shadow dark:bg-slate-900 dark:text-rose-400" : "text-slate-600"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "month" ? "bg-white text-rose-600 shadow dark:bg-slate-900 dark:text-rose-400" : "text-slate-600"
              }`}
            >
              Mês
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-200 hover:opacity-95 dark:shadow-none"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* ==================== 1. VISUALIZAÇÃO DIA ==================== */}
      {viewMode === "day" && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Grade de Horários &mdash; {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </h3>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              {appointments.length} agendamentos na grade
            </span>
          </div>

          {/* Linha do Tempo Visual */}
          <div className="space-y-3">
            {timeSlots.map((slot) => {
              const slotApps = appointments.filter((a) => a.startTime === slot);
              const isBusy = slotApps.length > 0;

              return (
                <div
                  key={slot}
                  className={`flex items-start rounded-2xl border p-3 transition ${
                    isBusy
                      ? "border-rose-200 bg-rose-50/30 dark:border-slate-800 dark:bg-slate-800/40"
                      : "border-slate-100 bg-slate-50/40 hover:bg-rose-50/40 dark:border-slate-800/60 dark:bg-slate-900/60"
                  }`}
                >
                  <div className="w-20 shrink-0">
                    <span className="font-serif text-sm font-bold text-slate-800 dark:text-slate-200">{slot}</span>
                  </div>

                  <div className="flex-1">
                    {isBusy ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {slotApps.map((app) => (
                          <div
                            key={app.id}
                            className={`flex flex-col justify-between rounded-xl border p-3 shadow-sm ${statusColors[app.status] || "bg-white"}`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider">{app.status}</span>
                                <span className="text-xs font-bold">R$ {app.total?.toFixed(2)}</span>
                              </div>
                              <h4 className="mt-1 font-serif text-sm font-bold text-slate-900 dark:text-white">{app.clientName}</h4>
                              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                💅 {app.services?.map((s: any) => s.serviceName).join(", ")}
                              </p>
                              <p className="mt-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                👩 {app.professionalName} ({app.totalDurationMinutes} min)
                              </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-2 text-[11px] font-bold text-slate-800">
                              <span>Sinal: R$ {app.depositPaid?.toFixed(2)}</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleCancelAppointment(app)}
                                  className="text-rose-600 hover:text-rose-800 dark:text-rose-400 underline font-bold"
                                  title="Cancelar e liberar este horário"
                                >
                                  🗑️ Excluir
                                </button>
                                {app.status !== "CONCLUIDO" && (
                                  <button
                                    onClick={() => handleFinishAppointment(app.id)}
                                    className="underline hover:opacity-80 text-emerald-800 dark:text-emerald-300 font-bold"
                                  >
                                    Finalizar &rarr;
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Horário Livre</span>
                        <button
                          onClick={() => handleOpenModal(selectedDate, slot)}
                          className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 hover:bg-rose-200 dark:bg-slate-800 dark:text-rose-300"
                        >
                          + Encaixar Agendamento
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== 2. VISUALIZAÇÃO SEMANA (RESUMO DA SEMANA) ==================== */}
      {viewMode === "week" && (
        <div className="space-y-6">
          {/* Card Resumo da Semana */}
          <div className="rounded-3xl border border-rose-200/60 bg-gradient-to-r from-rose-900/90 via-rose-800/90 to-amber-900/90 p-6 text-white shadow-lg">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-200">
                  Resumo Semanal
                </span>
                <h3 className="mt-2 font-serif text-xl font-bold">
                  Semana de {new Date(weekDays[0] + "T00:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} a {new Date(weekDays[6] + "T00:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
                </h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md text-right">
                  <span className="block text-[10px] uppercase font-bold text-rose-200">Atendimentos na Semana</span>
                  <span className="font-serif text-2xl font-bold text-amber-200">{totalWeekApps} Clientes</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md text-right">
                  <span className="block text-[10px] uppercase font-bold text-rose-200">Faturamento Previsto</span>
                  <span className="font-serif text-2xl font-bold text-emerald-300">R$ {totalWeekRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Semanal dos 7 Dias */}
          <div className="grid gap-4 md:grid-cols-7">
            {weekDays.map((dayStr) => {
              const dayDate = new Date(dayStr + "T00:00:00");
              const dayApps = appointments.filter((a) => a.date === dayStr);
              const isSelected = dayStr === selectedDate;
              const isToday = dayStr === getTodayString();

              return (
                <div
                  key={dayStr}
                  className={`flex flex-col rounded-3xl border p-4 transition shadow-sm bg-white dark:bg-slate-900 ${
                    isSelected
                      ? "border-rose-400 ring-2 ring-rose-400/30 dark:border-rose-400"
                      : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  {/* Cabeçalho do Dia */}
                  <div className="flex items-center justify-between border-b pb-2.5 dark:border-slate-800">
                    <div>
                      <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase">
                        {dayDate.toLocaleDateString("pt-BR", { weekday: "short" })}
                      </span>
                      <span className="font-serif text-base font-bold text-slate-900 dark:text-white">
                        {dayDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>
                    {isToday && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                        Hoje
                      </span>
                    )}
                  </div>

                  {/* Contador de Clientes do Dia */}
                  <div className="my-3">
                    {dayApps.length > 0 ? (
                      <span className="rounded-xl bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 block text-center">
                        🟢 {dayApps.length} {dayApps.length === 1 ? "Cliente" : "Clientes"}
                      </span>
                    ) : (
                      <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400 block text-center">
                        ⚪ Dia Livre
                      </span>
                    )}
                  </div>

                  {/* Lista de Clientes do Dia */}
                  <div className="flex-1 space-y-2.5">
                    {dayApps.map((app) => (
                      <div
                        key={app.id}
                        className={`rounded-2xl border p-2.5 text-xs space-y-1 shadow-sm ${statusColors[app.status] || "bg-slate-50"}`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-900 dark:text-white">⏰ {app.startTime}</span>
                          <span className="text-[10px]">R$ {app.total?.toFixed(2)}</span>
                        </div>
                        <p className="font-serif font-bold text-slate-900 dark:text-white truncate" title={app.clientName}>
                          👤 {app.clientName}
                        </p>
                        <p className="text-[10px] text-slate-800 dark:text-slate-200 line-clamp-1" title={app.services?.map((s: any) => s.serviceName).join(", ")}>
                          💅 {app.services?.map((s: any) => s.serviceName).join(", ")}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-black/10 text-[9px] font-bold">
                          <span>👩 {app.professionalName}</span>
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleCancelAppointment(app)}
                              className="text-rose-600 hover:text-rose-800 dark:text-rose-400 underline font-bold"
                              title="Excluir e liberar horário"
                            >
                              🗑️ Excluir
                            </button>
                            {app.status !== "CONCLUIDO" && (
                              <button
                                onClick={() => handleFinishAppointment(app.id)}
                                className="text-emerald-800 dark:text-emerald-300 underline font-bold"
                              >
                                Finalizar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {dayApps.length === 0 && (
                      <div className="py-6 text-center text-[11px] text-slate-600 font-medium">
                        Nenhum agendamento marcado.
                      </div>
                    )}
                  </div>

                  {/* Ação rápida para o dia */}
                  <button
                    onClick={() => {
                      setSelectedDate(dayStr);
                      handleOpenModal(dayStr);
                    }}
                    className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 py-1.5 text-[11px] font-bold text-rose-800 hover:bg-rose-100 dark:border-slate-800 dark:bg-slate-800 dark:text-rose-300"
                  >
                    + Agendar neste dia
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== 3. VISUALIZAÇÃO MÊS (RESUMO MENSAL DAS CLIENTES E DIAS MARCADOS) ==================== */}
      {viewMode === "month" && (
        <div className="space-y-6">
          {/* Card Resumo do Mês */}
          <div className="rounded-3xl border border-rose-200/60 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 text-white shadow-lg">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-200">
                  Visão Geral do Mês
                </span>
                <h3 className="mt-2 font-serif text-2xl font-bold">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md text-right">
                  <span className="block text-[10px] uppercase font-bold text-rose-200">Total de Atendimentos</span>
                  <span className="font-serif text-2xl font-bold text-amber-200">{appointments.length} Agendamentos</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md text-right">
                  <span className="block text-[10px] uppercase font-bold text-rose-200">Faturamento Previsto</span>
                  <span className="font-serif text-2xl font-bold text-emerald-300">
                    R$ {appointments.reduce((acc, a) => acc + (a.total || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md text-right">
                  <span className="block text-[10px] uppercase font-bold text-rose-200">Dias Marcados</span>
                  <span className="font-serif text-2xl font-bold text-teal-300">{datesWithApps.length} Dias</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendário Mensal de Ocupação */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              📅 Calendário de Agendamentos & Ocupação do Mês
            </h3>

            {/* Cabeçalho dos Dias da Semana */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-800 dark:text-slate-200 uppercase pb-2 border-b">
              <div>Seg</div>
              <div>Ter</div>
              <div>Qua</div>
              <div>Qui</div>
              <div>Sex</div>
              <div>Sáb</div>
              <div>Dom</div>
            </div>

            {/* Grid dos Dias do Mês */}
            <div className="grid grid-cols-7 gap-2">
              {/* Células vazias de offset */}
              {Array.from({ length: monthInfo.mondayOffset }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-24 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30" />
              ))}

              {/* Dias do mês */}
              {monthInfo.days.map((dayStr) => {
                const dayNum = parseInt(dayStr.split("-")[2], 10);
                const dayApps = appointmentsByDate[dayStr] || [];
                const isSelected = dayStr === selectedDate;
                const isToday = dayStr === getTodayString();

                return (
                  <div
                    key={dayStr}
                    onClick={() => {
                      setSelectedDate(dayStr);
                      setViewMode("day");
                    }}
                    className={`h-28 flex flex-col justify-between rounded-2xl border p-2 cursor-pointer transition hover:shadow-md ${
                      isSelected
                        ? "border-rose-400 bg-rose-50/40 ring-2 ring-rose-400/40 dark:border-rose-400 dark:bg-slate-800"
                        : dayApps.length > 0
                        ? "border-emerald-200 bg-emerald-50/30 dark:border-slate-800 dark:bg-slate-800/60"
                        : "border-slate-100 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-serif text-sm font-bold ${isToday ? "rounded-full bg-rose-500 text-white px-2 py-0.5 text-xs" : "text-slate-900 dark:text-white"}`}>
                        {dayNum}
                      </span>
                      {dayApps.length > 0 && (
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white">
                          {dayApps.length} cli
                        </span>
                      )}
                    </div>

                    {/* Resumo compacto de clientes no dia */}
                    <div className="flex-1 my-1 overflow-hidden space-y-1">
                      {dayApps.slice(0, 2).map((app) => (
                        <div key={app.id} className="text-[10px] truncate font-semibold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 p-1 rounded">
                          ⏰ {app.startTime} {app.clientName}
                        </div>
                      ))}
                      {dayApps.length > 2 && (
                        <span className="block text-[9px] font-bold text-rose-600 dark:text-rose-400">
                          + {dayApps.length - 2} mais...
                        </span>
                      )}
                    </div>

                    <div className="text-[9px] font-bold text-slate-600 text-right">
                      👁️ Ver dia
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LISTA COMPLETA DOS DIAS COM AGENDAMENTOS NO MÊS */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              📋 Resumo Detalhado dos Dias Marcados no Mês ({datesWithApps.length} dias com clientes)
            </h3>

            {datesWithApps.length > 0 ? (
              <div className="space-y-4">
                {datesWithApps.map((dayStr) => {
                  const dayDate = new Date(dayStr + "T00:00:00");
                  const dayApps = appointmentsByDate[dayStr];
                  const dayRevenue = dayApps.reduce((acc, a) => acc + (a.total || 0), 0);

                  return (
                    <div
                      key={dayStr}
                      className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 dark:border-slate-700 gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="rounded-xl bg-amber-400 px-3 py-1 font-serif text-sm font-bold text-slate-900">
                            {dayDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </span>
                          <span className="font-serif text-sm font-bold text-slate-900 dark:text-white capitalize">
                            ({dayDate.toLocaleDateString("pt-BR", { weekday: "long" })})
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs font-bold">
                          <span className="text-emerald-700 dark:text-emerald-300">
                            🟢 {dayApps.length} {dayApps.length === 1 ? "Atendimento" : "Atendimentos"}
                          </span>
                          <span className="text-slate-900 dark:text-white">
                            Total: R$ {dayRevenue.toFixed(2)}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedDate(dayStr);
                              setViewMode("day");
                            }}
                            className="rounded-lg bg-rose-500 px-3 py-1 text-white hover:bg-rose-600 text-[11px]"
                          >
                            Ir para o Dia &rarr;
                          </button>
                        </div>
                      </div>

                      {/* Lista de Clientes do Dia */}
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {dayApps.map((app) => (
                          <div
                            key={app.id}
                            className={`rounded-xl border p-3 text-xs space-y-1.5 shadow-sm ${statusColors[app.status] || "bg-white"}`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-slate-900 dark:text-white">⏰ {app.startTime} - {app.endTime}</span>
                              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-slate-900 dark:bg-slate-900 dark:text-white">
                                {app.status}
                              </span>
                            </div>
                            <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                              👤 {app.clientName}
                            </h4>
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              💅 {app.services?.map((s: any) => s.serviceName).join(", ")}
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t border-black/10 text-[11px] font-bold text-slate-900 dark:text-white">
                              <span>👩 {app.professionalName}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-emerald-700 dark:text-emerald-300 font-bold mr-1">R$ {app.total?.toFixed(2)}</span>
                                <button
                                  onClick={() => handleCancelAppointment(app)}
                                  className="text-rose-600 hover:text-rose-800 dark:text-rose-400 underline font-bold"
                                  title="Excluir e liberar horário"
                                >
                                  🗑️ Excluir
                                </button>
                                {app.status !== "CONCLUIDO" && (
                                  <button
                                    onClick={() => handleFinishAppointment(app.id)}
                                    className="text-emerald-700 dark:text-emerald-300 underline font-bold"
                                  >
                                    Finalizar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 font-medium">
                Nenhum agendamento cadastrado para o mês selecionado.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE NOVO AGENDAMENTO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                ✨ Criar Agendamento Multi-Serviços
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              {/* Cliente */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Cliente *</label>
                <select
                  value={formClient}
                  onChange={(e) => setFormClient(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                >
                  <option value="">Selecione a cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.whatsapp} ({c.tag})
                    </option>
                  ))}
                </select>
              </div>

              {/* Profissional & Data & Horário */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Profissional *</label>
                  <select
                    value={formProf}
                    onChange={(e) => setFormProf(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  >
                    <option value="">Selecione...</option>
                    {professionals.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Data *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Horário *</label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Serviços */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Serviços (Selecione um ou mais) *
                </label>
                <div className="mt-1 max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  {services.map((s) => {
                    const isChecked = formSelectedServices.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between rounded-lg p-2 transition ${
                          isChecked ? "bg-rose-50 text-rose-700 font-bold dark:bg-slate-800 dark:text-rose-400" : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormSelectedServices([...formSelectedServices, s.id]);
                              } else {
                                setFormSelectedServices(formSelectedServices.filter((id) => id !== s.id));
                              }
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-400"
                          />
                          <span>{s.name} ({s.durationMinutes} min)</span>
                        </div>
                        <span className="font-bold">R$ {(s.promoPrice || s.price).toFixed(2)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Resumo Financeiro do Agendamento */}
              <div className="rounded-2xl bg-rose-50/70 p-4 dark:bg-slate-800">
                <div className="grid grid-cols-2 gap-3 font-semibold text-slate-700 dark:text-slate-300">
                  <div>Duração Total: <span className="font-bold text-rose-600">{calcDuration} min</span></div>
                  <div>Subtotal: <span className="font-bold text-slate-900 dark:text-white">R$ {calcSubtotal.toFixed(2)}</span></div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">Desconto (R$)</label>
                    <input
                      type="number"
                      value={formDiscount}
                      onChange={(e) => setFormDiscount(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-bold outline-none text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">Sinal Cobrado (R$)</label>
                    <input
                      type="number"
                      value={formDeposit}
                      onChange={(e) => setFormDeposit(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-bold outline-none text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">Restante no Salão</label>
                    <div className="mt-1 p-2 font-serif text-sm font-bold text-emerald-600">
                      R$ {calcRemaining.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-rose-200 pt-2 text-right font-serif text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                  Valor Total: R$ {calcTotal.toFixed(2)}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Observações Internas</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Pediu esmalte vermelho especial..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  rows={2}
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-2.5 font-bold text-white shadow-md shadow-rose-200 hover:opacity-95"
                >
                  Confirmar Agendamento &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
