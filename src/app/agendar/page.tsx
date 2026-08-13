"use client";

import { useState, useEffect } from "react";
import { Sparkles, Calendar, Clock, User, CheckCircle, MessageSquare, QrCode, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

export default function AgendarPublicPage() {
  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProf, setSelectedProf] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<number>(1);
  const [confirmedApp, setConfirmedApp] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string>("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSalon);
    fetch("/api/services").then((r) => r.json()).then((res) => setServices(res.services || []));
    fetch("/api/professionals").then((r) => r.json()).then((res) => {
      setProfessionals(res || []);
      if (res && res.length > 0) setSelectedProf(res[0]);
    });
  }, []);

  // Buscar agendamentos existentes quando a data ou a profissional selecionada muda
  useEffect(() => {
    if (!selectedDate) return;
    const profId = selectedProf?.id || "all";
    fetch(`/api/appointments?date=${selectedDate}&professionalId=${profId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setExistingAppointments(Array.isArray(data) ? data : []))
      .catch(() => setExistingAppointments([]));
  }, [selectedDate, selectedProf]);

  const getBrowserTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getBrowserCurrentMins = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };

  // Converter horário "HH:mm" para minutos desde 00:00
  const timeToMins = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // Obter o dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
  const getDayOfWeek = (dateStr: string) => {
    if (!dateStr || !dateStr.includes("-")) return 1;
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).getDay();
  };

  // Verificar se o almoço foi liberado manualmente pelo admin nesta data
  const isLunchUnlockedOnDate = () => {
    return existingAppointments.some(
      (app) => app.notes?.includes("LIBERADO_ALMOCO") || app.status === "ALMOCO_LIBERADO"
    );
  };

  // Verificar se o slot (e sua duração) está 100% livre sem sobreposição
  const isSlotAvailable = (slot: string) => {
    if (!selectedProf) return true;
    const duration = selectedService?.durationMinutes || 60;
    const slotStart = timeToMins(slot);
    const slotEnd = slotStart + duration;

    const dayOfWeek = getDayOfWeek(selectedDate);

    // 1. Domingo é fechado (sem atendimentos)
    if (dayOfWeek === 0) {
      return false;
    }

    // 2. Sábado funciona somente até as 15:00 (900 minutos)
    if (dayOfWeek === 6) {
      if (slotStart >= 900 || slotEnd > 900) {
        return false;
      }
    }

    // 3. Horários passados para o dia de hoje no fuso local
    const todayStr = getBrowserTodayString();
    if (selectedDate === todayStr) {
      const currentMins = getBrowserCurrentMins();
      if (slotStart <= currentMins) return false;
    }

    // 4. Horário de Almoço (11:00 = 660 mins, 13:00 = 780 mins)
    // Bloqueado por padrão em TODOS OS DIAS, exceto se houver liberação manual do salão
    const isLunchUnlocked = isLunchUnlockedOnDate();
    if (!isLunchUnlocked) {
      if (slotStart < 780 && slotEnd > 660) {
        return false;
      }
    }

    // 5. Verificar choque com agendamentos ativos da profissional
    const hasConflict = existingAppointments.some((app) => {
      if (app.status === "CANCELADO") return false;
      if (app.notes?.includes("LIBERADO_ALMOCO") || app.status === "ALMOCO_LIBERADO") return false;
      if (app.professionalId !== selectedProf.id && app.professionalId !== "ALL") return false;

      const appStart = timeToMins(app.startTime);
      const appEnd = app.endTime ? timeToMins(app.endTime) : appStart + (app.totalDurationMinutes || 60);

      return slotStart < appEnd && slotEnd > appStart;
    });

    return !hasConflict;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");
    if (!selectedService || !selectedProf || !name || !phone || !selectedTime) {
      setBookingError("Por favor, preencha todos os campos e selecione um horário válido.");
      return;
    }

    if (!isSlotAvailable(selectedTime)) {
      setBookingError("🛑 Este horário já foi reservado ou entra em conflito com outro agendamento. Escolha outro horário livre.");
      return;
    }

    // Criar cliente ou buscar existente
    const cliRes = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, whatsapp: phone, tag: "NOVO" }),
    });
    const client = await cliRes.json();

    // Criar agendamento
    const appRes = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: client.id,
        professionalId: selectedProf.id,
        date: selectedDate,
        startTime: selectedTime,
        serviceIds: [selectedService.id],
        depositPaid: 50,
      }),
    });

    if (appRes.ok) {
      const app = await appRes.json();
      setConfirmedApp(app);
      setStep(4);
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}
    } else {
      const err = await appRes.json();
      setBookingError(err.error || "Erro ao realizar agendamento.");
    }
  };

  const timeSlots = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50/50 px-4 py-8 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-xl">
        {/* Header do Salão */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-rose-400 to-amber-600 text-3xl shadow-xl shadow-rose-200">
            💅
          </div>
          <h1 className="mt-3 font-serif text-2xl font-bold text-slate-900 dark:text-white">
            {salon?.name || "Studio Luxe Nail Designer"}
          </h1>
          <p className="text-xs text-rose-600 font-semibold">Agendamento Online 24h &bull; Rápido & Sem Cadastro</p>
        </div>

        {/* Passo 1: Escolha de Serviço */}
        {step === 1 && (
          <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white text-center">
              Passo 1 de 3: Escolha o Serviço
            </h2>
            <div className="space-y-2">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => {
                    setSelectedService(srv);
                    setSelectedTime("");
                    setStep(2);
                  }}
                  className={`cursor-pointer flex items-center justify-between rounded-2xl border p-4 transition ${
                    selectedService?.id === srv.id
                      ? "border-rose-400 bg-rose-50 font-bold dark:bg-slate-800"
                      : "border-slate-100 bg-slate-50/40 hover:border-rose-300 dark:border-slate-800 dark:bg-slate-800/40"
                  }`}
                >
                  <div>
                    <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">{srv.name}</h3>
                    <p className="text-xs text-slate-500">⏱️ {srv.durationMinutes} minutos de atendimento</p>
                  </div>
                  <span className="font-serif text-base font-bold text-rose-600">R$ {(srv.promoPrice || srv.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Passo 2: Profissional, Data & Horário */}
        {step === 2 && (
          <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <button onClick={() => setStep(1)} className="text-xs font-bold text-rose-600 hover:underline">
              &larr; Voltar para Escolha de Serviço
            </button>

            <div className="rounded-2xl bg-rose-50 p-3 text-xs font-semibold text-rose-900 flex justify-between items-center">
              <span>💅 Serviço: <strong>{selectedService?.name}</strong></span>
              <span>⏱️ <strong>{selectedService?.durationMinutes} min</strong></span>
            </div>

            <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white text-center">
              Passo 2 de 3: Profissional, Data & Horário
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Escolha a Profissional</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {professionals.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProf(p);
                      setSelectedTime("");
                    }}
                    className={`rounded-2xl border p-3 text-center transition text-xs font-bold ${
                      selectedProf?.id === p.id ? "border-rose-500 bg-rose-50 text-rose-900 font-bold dark:bg-slate-800 dark:text-rose-300" : "border-slate-100 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    👩‍🎨 {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Data do Atendimento</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime("");
                }}
                className="w-full rounded-2xl border border-slate-200 p-3 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Horários Disponíveis (Necessário {selectedService?.durationMinutes || 60} min vagos)
                </label>
                <span className="text-[10px] font-bold text-slate-400">🟢 Livre | 🔴 Ocupado</span>
              </div>

              {(() => {
                const dayOfWeek = getDayOfWeek(selectedDate);

                if (dayOfWeek === 0) {
                  return (
                    <div className="rounded-2xl bg-amber-50 p-4 text-center text-xs font-bold text-amber-900 border border-amber-200">
                      😴 O salão não realiza atendimentos aos domingos. Por favor, escolha uma data de Segunda a Sábado no calendário acima!
                    </div>
                  );
                }

                const todayStr = getBrowserTodayString();
                const isToday = selectedDate === todayStr;
                const currentMins = getBrowserCurrentMins();

                const visibleSlots = timeSlots.filter((slot) => {
                  const slotStart = timeToMins(slot);

                  // Se for sábado, só exibe horários de início antes das 15:00 (900 minutos)
                  if (dayOfWeek === 6 && slotStart >= 900) {
                    return false;
                  }

                  // Se for hoje, só exibe horários no futuro no fuso local
                  if (isToday && slotStart <= currentMins) {
                    return false;
                  }

                  return true;
                });

                if (visibleSlots.length === 0) {
                  return (
                    <div className="rounded-2xl bg-amber-50 p-4 text-center text-xs font-bold text-amber-900 border border-amber-200">
                      {dayOfWeek === 6
                        ? `⏰ Os horários de atendimento de sábado (até as 15:00) para hoje já encerraram. Por favor, selecione outra data de Segunda a Sábado!`
                        : `⏰ Os horários de atendimento para hoje (${selectedDate.split("-").reverse().join("/")}) já encerraram. Por favor, selecione uma nova data no calendário acima!`}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1">
                    {visibleSlots.map((slot) => {
                      const available = isSlotAvailable(slot);
                      const isSelected = selectedTime === slot;
                      const slotStart = timeToMins(slot);
                      const isLunchSlot = slotStart >= 660 && slotStart < 780 && !isLunchUnlockedOnDate();

                      return (
                        <button
                          key={slot}
                          disabled={!available}
                          onClick={() => setSelectedTime(slot)}
                          className={`rounded-xl border p-2.5 text-xs font-bold transition flex flex-col items-center justify-center ${
                            !available
                              ? "border-slate-200 bg-slate-100 text-slate-400 line-through cursor-not-allowed opacity-60"
                              : isSelected
                              ? "border-amber-500 bg-amber-500 text-white shadow-md"
                              : "border-emerald-200 bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300"
                          }`}
                        >
                          <span>{slot}</span>
                          <span className="text-[9px] font-normal">
                            {isLunchSlot ? "🍱 Almoço" : available ? "🟢 Livre" : "🔴 Ocupado"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <button
              onClick={() => {
                if (!selectedProf) return alert("Selecione a profissional.");
                if (!selectedTime) return alert("Por favor, clique e selecione um horário livre verde.");
                setStep(3);
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3 text-xs font-bold text-white shadow-lg hover:opacity-95"
            >
              Continuar para Seus Dados ({selectedTime || "Selecione o horário"}) &rarr;
            </button>
          </div>
        )}

        {/* Passo 3: Dados Pessoais & Confirmação */}
        {step === 3 && (
          <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <button onClick={() => setStep(2)} className="text-xs font-bold text-rose-600 hover:underline">
              &larr; Voltar para Escolha de Horário
            </button>
            <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white text-center">
              Passo 3 de 3: Seus Dados de Contato
            </h2>

            {bookingError && (
              <div className="rounded-2xl bg-rose-100 p-3 text-xs font-bold text-rose-800 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBooking} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Seu Nome Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria Fernanda Rossi..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Seu WhatsApp *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="rounded-2xl bg-rose-50 p-4 font-semibold text-rose-900 dark:bg-slate-800 dark:text-rose-200 space-y-1">
                <div>💅 <strong>Serviço:</strong> {selectedService?.name} ({selectedService?.durationMinutes} min)</div>
                <div>📅 <strong>Data:</strong> {selectedDate.split("-").reverse().join("/")} às <strong>{selectedTime}</strong></div>
                <div>👩‍🎨 <strong>Profissional:</strong> {selectedProf?.name}</div>
                <div className="pt-1 text-sm font-bold font-serif text-rose-600">Total: R$ {(selectedService?.promoPrice || selectedService?.price)?.toFixed(2)}</div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
              >
                FINALIZAR AGENDAMENTO AGORA ✨
              </button>
            </form>
          </div>
        )}

        {/* Passo 4: Confirmação Concluída */}
        {step === 4 && (
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl font-bold">
              ✓
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              Agendamento Solicitado com Sucesso! 💖
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Enviamos os detalhes do seu agendamento para seu WhatsApp ({phone}).
            </p>

            <div className="pt-4 flex justify-center">
              {(() => {
                const isDummy = (p?: string) => {
                  if (!p) return true;
                  const d = p.replace(/\D/g, "");
                  return !d || d.length < 10 || d.includes("999998888") || d.includes("987654321") || d.includes("0000000000");
                };

                const candidates = [
                  salon?.activeWhatsApp,
                  salon?.whatsapp,
                  salon?.phone,
                  selectedProf?.phone,
                  professionals.find((p: any) => !isDummy(p.phone))?.phone,
                ];

                const validPhone = candidates.find((p) => !isDummy(p)) || "";
                const digits = validPhone.replace(/\D/g, "");
                const targetPhone = digits.length >= 10 && !digits.startsWith("55") ? `55${digits}` : digits;

                if (!targetPhone) {
                  return (
                    <div className="rounded-2xl bg-amber-100 p-3 text-center text-xs font-bold text-amber-900 border border-amber-300">
                      📱 Agendamento gravado com sucesso! Cadastre seu número de WhatsApp em Configurações para habilitar o botão direto de conversa.
                    </div>
                  );
                }

                let formattedDateStr = selectedDate;
                if (selectedDate && selectedDate.includes("-")) {
                  const parts = selectedDate.split("-");
                  if (parts.length === 3) formattedDateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }

                const messageText = [
                  `Olá, equipe do ${salon?.name || "Salão"}! \u2728\u{1F496}`,
                  ``,
                  `Acabei de realizar meu agendamento online pelo site! \u{1F485}`,
                  ``,
                  `\u{1F4CC} *DETALHES DO AGENDAMENTO:*`,
                  `\u{1F485} *Serviço:* ${selectedService?.name || "Procedimento"}`,
                  `\u{1F4C5} *Data:* ${formattedDateStr}`,
                  `\u23F0 *Horário:* ${selectedTime}h`,
                  `\u{1F469} *Profissional:* ${selectedProf?.name || "Nail Designer"}`,
                  `\u{1F464} *Cliente:* ${name}`,
                  ``,
                  `Aguardando a confirmação! Muito obrigada! \u{1F970}\u2728`
                ].join("\n");

                const waText = encodeURIComponent(messageText);

                return (
                  <a
                    href={`https://wa.me/${targetPhone}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-700 transition"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>📱 Falar no WhatsApp do Salão</span>
                  </a>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
