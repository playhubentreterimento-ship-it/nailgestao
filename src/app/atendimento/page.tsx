"use client";

import { useState, useEffect } from "react";
import { PlayCircle, CheckCircle, Clock, DollarSign, Sparkles, User, Gift, Award } from "lucide-react";
import confetti from "canvas-confetti";

export default function AtendimentoPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeApp, setActiveApp] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [discount, setDiscount] = useState(0);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [notes, setNotes] = useState("");
  const [finished, setFinished] = useState(false);

  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const loadAppointments = () => {
    const today = getTodayString();
    fetch(`/api/appointments?date=${today}`)
      .then((r) => r.json())
      .then((data) => {
        setAppointments(data);
        const inProgress = data.find((a: any) => a.status === "EM_ATENDIMENTO" || a.status === "CONFIRMADO");
        if (inProgress) setActiveApp(inProgress);
      });
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStartAttendance = async (appId: string) => {
    await fetch("/api/appointments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: appId, status: "EM_ATENDIMENTO" }),
    });
    loadAppointments();
  };

  const handleFinishAttendance = async () => {
    if (!activeApp) return;

    try {
      // 1. Concluir agendamento no banco
      const resApp = await fetch("/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeApp.id,
          status: "CONCLUIDO",
          paymentStatus: "PAGO",
          notes: (activeApp.notes || "") + ` | Finalizado com pgto ${paymentMethod}`,
        }),
      });

      if (!resApp.ok) {
        const err = await resApp.json();
        alert("Erro ao concluir agendamento: " + (err.error || "Erro desconhecido"));
        return;
      }

      // 2. Lançar recebimento no caixa do dia
      await fetch("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TRANSACTION",
          category: "ATENDIMENTO",
          amount: Math.max(0, activeApp.total - discount),
          paymentMethod,
          description: `Checkout do atendimento: ${activeApp.clientName}`,
        }),
      });

      // 3. Atualizar estado local da tela
      setActiveApp((prev: any) => (prev ? { ...prev, status: "CONCLUIDO", paymentStatus: "PAGO" } : null));
      setFinished(true);

      // Efeito visual de celebração
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      loadAppointments();
    } catch (error: any) {
      alert("Erro ao finalizar atendimento: " + error.message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          💅 Tela de Atendimento ao Vivo
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Inicie o cronômetro do atendimento da cliente e realize o fechamento no caixa em 1 clique.
        </p>
      </div>

      {/* Seleção do Atendimento de Hoje */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Agendamentos de Hoje</h3>
          {appointments.map((app) => (
            <div
              key={app.id}
              onClick={() => setActiveApp(app)}
              className={`cursor-pointer rounded-2xl border p-4 transition ${
                activeApp?.id === app.id
                  ? "border-rose-400 bg-rose-50 shadow-md dark:bg-slate-800"
                  : "border-slate-100 bg-white hover:border-rose-200 dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-bold text-slate-800 dark:text-white">{app.startTime}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    app.status === "EM_ATENDIMENTO"
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {app.status}
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">{app.clientName}</p>
              <p className="text-[11px] text-slate-500">{app.services?.map((s: any) => s.serviceName).join(", ")}</p>
            </div>
          ))}
        </div>

        {/* Detalhes & Controle do Atendimento Ativo */}
        <div className="md:col-span-2">
          {activeApp ? (
            <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
                <div>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    Status: {activeApp.status}
                  </span>
                  <h3 className="mt-2 font-serif text-xl font-bold text-slate-900 dark:text-white">
                    {activeApp.clientName}
                  </h3>
                  <p className="text-xs text-slate-500">Profissional: {activeApp.professionalName}</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-slate-400">VALOR DO ATENDIMENTO</span>
                  <span className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                    R$ {activeApp.total?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Ações de Início / Fim */}
              <div className="my-6 flex flex-col items-center justify-center space-y-4 rounded-2xl bg-rose-50/50 p-6 text-center dark:bg-slate-800/50">
                {activeApp.status !== "EM_ATENDIMENTO" && activeApp.status !== "CONCLUIDO" ? (
                  <button
                    onClick={() => handleStartAttendance(activeApp.id)}
                    className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-200 transition hover:scale-105"
                  >
                    <PlayCircle className="h-6 w-6" />
                    <span>INICIAR ATENDIMENTO AGORA</span>
                  </button>
                ) : (
                  <div className="space-y-4 w-full">
                    <div className="flex items-center justify-center space-x-2 text-rose-600 font-bold animate-pulse">
                      <Clock className="h-5 w-5" />
                      <span>Atendimento em Andamento...</span>
                    </div>

                    {/* Checkout & Pagamento */}
                    <div className="rounded-2xl bg-white p-4 text-left shadow-sm dark:bg-slate-900 space-y-3">
                      <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        💳 Checkout & Fechamento Financeiro
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-400">Forma de Pagamento</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mt-1 w-full rounded-xl border p-2 font-bold outline-none dark:bg-slate-800"
                          >
                            <option value="PIX">Pix (Sem taxa)</option>
                            <option value="CREDITO">Cartão de Crédito</option>
                            <option value="DEBITO">Cartão de Débito</option>
                            <option value="DINHEIRO">Dinheiro em Espécie</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-400">Desconto Adicional (R$)</label>
                          <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            className="mt-1 w-full rounded-xl border p-2 font-bold outline-none dark:bg-slate-800"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleFinishAttendance}
                        className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg shadow-rose-200 hover:opacity-95"
                      >
                        FINALIZAR ATENDIMENTO & LANÇAR NO CAIXA ✨
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {finished && (
                <div className="rounded-2xl bg-emerald-100 p-4 text-center text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  🎉 Atendimento finalizado com sucesso! Comissão gerada e caixa atualizado.
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-300 p-6 text-center text-slate-400">
              Selecione um agendamento à esquerda para iniciar o atendimento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
