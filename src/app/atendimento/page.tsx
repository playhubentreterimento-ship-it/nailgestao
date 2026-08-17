"use client";

import { useState, useEffect } from "react";
import { PlayCircle, CheckCircle, Clock, DollarSign, Sparkles, User, Gift, Award } from "lucide-react";
import confetti from "canvas-confetti";

export default function AtendimentoPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeApp, setActiveApp] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedProfFilter, setSelectedProfFilter] = useState<string>("ALL");
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
    fetch(`/api/appointments?date=${today}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setAppointments(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAppointments();
    fetch("/api/professionals")
      .then((r) => r.json())
      .then((profs) => setProfessionals(Array.isArray(profs) ? profs : []))
      .catch(() => {});

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((res) => {
        if (res.authenticated && res.user) {
          setCurrentUser(res.user);
        }
      })
      .catch(() => {});

    window.addEventListener("focus", loadAppointments);
    return () => window.removeEventListener("focus", loadAppointments);
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

  // Identificar se a usuária logada é uma profissional
  const isProfessionalUser = currentUser?.role === "PROFISSIONAL" || currentUser?.role === "COLABORADORA" || currentUser?.role === "ATENDENTE";

  // Tentar casar a usuária logada com um registro de Professional
  const matchedProf = professionals.find(
    (p: any) =>
      p.id === currentUser?.id ||
      (p.email && currentUser?.email && p.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (p.name && currentUser?.name && p.name.toLowerCase().includes(currentUser.name.toLowerCase())) ||
      (p.name && currentUser?.name && currentUser.name.toLowerCase().includes(p.name.toLowerCase()))
  );

  // Determinar lista de agendamentos visíveis exclusivamente
  const filteredAppointments = appointments.filter((app: any) => {
    if (isProfessionalUser) {
      if (matchedProf) {
        return app.professionalId === matchedProf.id || (app.professionalName && app.professionalName.toLowerCase().includes(matchedProf.name.toLowerCase()));
      }
      if (currentUser?.name) {
        return app.professionalName && app.professionalName.toLowerCase().includes(currentUser.name.toLowerCase());
      }
      return true;
    }
    // Se for Admin/Gerente/Recepção
    if (selectedProfFilter !== "ALL") {
      return app.professionalId === selectedProfFilter;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
          💅 Tela de Atendimento ao Vivo
        </h2>
        <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
          Inicie o cronômetro do atendimento da cliente e realize o fechamento no caixa em 1 clique.
        </p>
      </div>

      {/* Banner / Filtro Exclusivo de Profissional */}
      {isProfessionalUser ? (
        <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-amber-50 p-3.5 text-xs font-bold text-rose-900 dark:border-rose-900/60 dark:from-slate-900 dark:to-slate-800 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center space-x-2">
            <span>🔒 Modo Exclusivo da Profissional:</span>
            <span className="font-extrabold text-[#6B1615] dark:text-amber-300">👤 {matchedProf?.name || currentUser?.name || "Minha Agenda"}</span>
          </div>
          <span className="text-[10px] bg-rose-200/80 dark:bg-rose-950 px-2.5 py-1 rounded-full text-rose-800 dark:text-rose-300 font-bold">
            Exibindo apenas seus clientes de hoje
          </span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl bg-white p-3.5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">👤 Visualização Painel Master:</span>
          <select
            value={selectedProfFilter}
            onChange={(e) => {
              setSelectedProfFilter(e.target.value);
              setActiveApp(null);
            }}
            className="rounded-xl border border-rose-300 bg-rose-50/50 p-2 font-bold text-xs outline-none dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="ALL">Todas as Profissionais ({appointments.length} atendimentos)</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                👤 {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Seleção do Atendimento de Hoje */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Agendamentos de Hoje</h3>
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((app) => (
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
                        : app.status === "CONCLUIDO"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">{app.clientName}</p>
                <p className="text-[11px] text-slate-500">{app.services?.map((s: any) => s.serviceName).join(", ")}</p>
                {!isProfessionalUser && (
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 font-bold mt-1">👤 {app.professionalName}</p>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-center text-xs font-semibold text-slate-400 dark:bg-slate-900 dark:border-slate-800">
              Nenhum agendamento para esta profissional hoje.
            </div>
          )}
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

              {/* Ações de Início / Fim / Concluído */}
              <div className="my-6 flex flex-col items-center justify-center space-y-4 rounded-2xl bg-rose-50/50 p-6 text-center dark:bg-slate-800/50">
                {activeApp.status === "CONCLUIDO" ? (
                  <div className="space-y-3 w-full">
                    <div className="flex items-center justify-center space-x-2 text-emerald-600 font-bold text-base">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                      <span>Atendimento Concluído com Sucesso! ✨</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      O atendimento da cliente <strong>{activeApp.clientName}</strong> foi finalizado e registrado no caixa do salão.
                    </p>
                    <div className="rounded-2xl bg-emerald-100/80 p-4 text-center text-xs font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 shadow-sm border border-emerald-200">
                      🎉 Atendimento finalizado com sucesso! Comissão gerada e caixa atualizado.
                    </div>
                  </div>
                ) : activeApp.status === "EM_ATENDIMENTO" ? (
                  <div className="space-y-4 w-full">
                    <div className="flex items-center justify-center space-x-2 text-rose-600 font-bold animate-pulse text-base">
                      <Clock className="h-5 w-5" />
                      <span>Atendimento em Andamento...</span>
                    </div>

                    {/* Checkout & Pagamento */}
                    <div className="rounded-2xl bg-white p-4 text-left shadow-sm dark:bg-slate-900 space-y-3 border border-slate-100">
                      <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        💳 Checkout & Fechamento Financeiro
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-400">Forma de Pagamento</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mt-1 w-full rounded-xl border p-2 font-bold outline-none dark:bg-slate-800 text-slate-900 dark:text-white"
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
                            className="mt-1 w-full rounded-xl border p-2 font-bold outline-none dark:bg-slate-800 text-slate-900 dark:text-white"
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
                ) : (
                  <button
                    onClick={() => handleStartAttendance(activeApp.id)}
                    className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-200 transition hover:scale-105"
                  >
                    <PlayCircle className="h-6 w-6" />
                    <span>INICIAR ATENDIMENTO AGORA</span>
                  </button>
                )}
              </div>
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
