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
} from "lucide-react";

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
    fetch(`/api/appointments?date=${selectedDate}&professionalId=${filterProf}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data);
        setLoading(false);
      });
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
  }, [selectedDate, filterProf]);

  const handleOpenModal = () => {
    refreshAllData();
    setFormDate(selectedDate);
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
      // Atualizar a data selecionada para a data do agendamento criado para visualizar imediatamente
      setSelectedDate(formDate);
      loadAgenda();
    } else {
      const err = await res.json();
      alert("Erro ao agendar: " + err.error);
    }
  };

  // Cálculos do modal
  const selectedServicesObjects = services.filter((s) => formSelectedServices.includes(s.id));
  const calcSubtotal = selectedServicesObjects.reduce((acc, s) => acc + (s.promoPrice || s.price), 0);
  const calcTotal = Math.max(0, calcSubtotal - formDiscount);
  const calcRemaining = Math.max(0, calcTotal - formDeposit);
  const calcDuration = selectedServicesObjects.reduce((acc, s) => acc + s.durationMinutes, 0);

  const statusColors: any = {
    AGENDADO: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    CONFIRMADO: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
    AGUARDANDO_CONFIRMACAO: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    EM_ATENDIMENTO: "bg-rose-100 text-rose-800 border-rose-300 animate-pulse dark:bg-rose-950 dark:text-rose-300",
    CONCLUIDO: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300",
    CANCELADO: "bg-slate-100 text-slate-500 line-through dark:bg-slate-800 dark:text-slate-400",
    NAO_COMPARECEU: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
  };

  const timeSlots = [
    "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00"
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controles da Agenda */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Agenda Interativa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerenciamento visual de atendimentos, confirmações e bloqueios de horários.
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
                viewMode === "day" ? "bg-white text-rose-600 shadow dark:bg-slate-900 dark:text-rose-400" : "text-slate-500"
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "week" ? "bg-white text-rose-600 shadow dark:bg-slate-900 dark:text-rose-400" : "text-slate-500"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "month" ? "bg-white text-rose-600 shadow dark:bg-slate-900 dark:text-rose-400" : "text-slate-500"
              }`}
            >
              Mês
            </button>
          </div>

          <button
            onClick={handleOpenModal}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-200 hover:opacity-95 dark:shadow-none"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Grade Horária do Dia */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white">
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
                {/* Horário */}
                <div className="w-20 shrink-0">
                  <span className="font-serif text-sm font-bold text-slate-700 dark:text-slate-300">{slot}</span>
                </div>

                {/* Agendamentos no Horário */}
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
                            <h4 className="mt-1 font-serif text-sm font-bold">{app.clientName}</h4>
                            <p className="text-xs opacity-90">
                              💅 {app.services?.map((s: any) => s.serviceName).join(", ")}
                            </p>
                            <p className="mt-1 text-[11px] font-medium opacity-80">
                              👩 {app.professionalName} ({app.totalDurationMinutes} min)
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-2 text-[11px]">
                            <span>Sinal: R$ {app.depositPaid?.toFixed(2)}</span>
                            <button
                              onClick={() => {
                                fetch(`/api/appointments`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: app.id, status: "CONCLUIDO" }),
                                }).then(() => loadAgenda());
                              }}
                              className="font-bold underline hover:opacity-80"
                            >
                              Finalizar &rarr;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Horário Livre</span>
                      <button
                        onClick={() => {
                          setFormTime(slot);
                          setFormDate(selectedDate);
                          setShowModal(true);
                        }}
                        className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200 dark:bg-slate-800 dark:text-rose-300"
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
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Horário *</label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                          isChecked ? "bg-rose-50 text-rose-700 font-bold dark:bg-slate-800 dark:text-rose-400" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
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
                      className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-bold outline-none dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">Sinal Cobrado (R$)</label>
                    <input
                      type="number"
                      value={formDeposit}
                      onChange={(e) => setFormDeposit(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-bold outline-none dark:border-slate-700 dark:bg-slate-900"
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
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
