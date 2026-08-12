"use client";

import { useState, useEffect } from "react";
import { Sparkles, Calendar, Clock, User, CheckCircle, MessageSquare, QrCode } from "lucide-react";
import confetti from "canvas-confetti";

export default function AgendarPublicPage() {
  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProf, setSelectedProf] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState("14:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<number>(1);
  const [confirmedApp, setConfirmedApp] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSalon);
    fetch("/api/services").then((r) => r.json()).then((res) => setServices(res.services || []));
    fetch("/api/professionals").then((r) => r.json()).then(setProfessionals);
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedProf || !name || !phone) return;

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

    const app = await appRes.json();
    setConfirmedApp(app);
    setStep(4);

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err) {}
  };

  const times = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
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
            <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white text-center">
              Passo 2 de 3: Profissional & Horário
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Escolha a Profissional</label>
              <div className="grid grid-cols-3 gap-2">
                {professionals.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProf(p)}
                    className={`rounded-2xl border p-3 text-center transition text-xs font-bold ${
                      selectedProf?.id === p.id ? "border-rose-500 bg-rose-50 text-rose-800 dark:bg-slate-800 dark:text-rose-300" : "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Data</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-2xl border p-3 text-xs font-bold dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Horários Disponíveis</label>
              <div className="grid grid-cols-4 gap-2">
                {times.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                      selectedTime === t ? "border-amber-500 bg-amber-500 text-white" : "border-slate-100 bg-slate-50 dark:bg-slate-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (!selectedProf) return alert("Selecione a profissional.");
                setStep(3);
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3 text-xs font-bold text-white shadow-lg"
            >
              Continuar para Seus Dados &rarr;
            </button>
          </div>
        )}

        {/* Passo 3: Dados Pessoais & Confirmação */}
        {step === 3 && (
          <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <button onClick={() => setStep(2)} className="text-xs font-bold text-rose-600 hover:underline">
              &larr; Voltar
            </button>
            <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white text-center">
              Passo 3 de 3: Seus Dados de Contato
            </h2>

            <form onSubmit={handleBooking} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold">Seu Nome Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria Fernanda Rossi..."
                  className="mt-1 w-full rounded-2xl border p-3 font-medium outline-none dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold">Seu WhatsApp *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="mt-1 w-full rounded-2xl border p-3 font-medium outline-none dark:bg-slate-800"
                  required
                />
              </div>

              <div className="rounded-2xl bg-rose-50 p-4 font-semibold text-rose-900 dark:bg-slate-800 dark:text-rose-200">
                Resumo: {selectedService?.name} dia {selectedDate} às {selectedTime} com {selectedProf?.name}. Total: R$ {(selectedService?.promoPrice || selectedService?.price)?.toFixed(2)}
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg"
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
              <a
                href={`https://wa.me/${salon?.whatsapp}?text=Olá! Fiz meu agendamento online de ${selectedService?.name} para o dia ${selectedDate} às ${selectedTime}.`}
                target="_blank"
                className="flex items-center space-x-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-700"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Falar no WhatsApp do Salão</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
