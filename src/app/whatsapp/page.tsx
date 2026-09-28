"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  CheckCheck,
  RefreshCw,
  AlertCircle,
  Bot,
  Zap,
  Plus,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Calendar,
  X,
  Trash2,
} from "lucide-react";

export default function WhatsAppHubPage() {
  const [data, setData] = useState<any>(null);
  const [testPhone, setTestPhone] = useState("5567992684748");
  const [testMessage, setTestMessage] = useState("CONFIRMAR");
  const [webhookLog, setWebhookLog] = useState<string[]>([]);
  const [reminderResults, setReminderResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Seleção de Múltiplas Datas para Envio de Lembretes
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDates, setSelectedDates] = useState<string[]>([getTomorrowString()]);
  const [customDateInput, setCustomDateInput] = useState<string>(getTomorrowString());

  const loadWhatsApp = () => {
    fetch("/api/whatsapp")
      .then((r) => r.json())
      .then(setData);
  };

  useEffect(() => {
    loadWhatsApp();
  }, []);

  const handleAddCustomDate = () => {
    if (!customDateInput) return;
    if (!selectedDates.includes(customDateInput)) {
      setSelectedDates((prev) => [...prev, customDateInput].sort());
    }
  };

  const handleRemoveDate = (dateToRemove: string) => {
    setSelectedDates((prev) => prev.filter((d) => d !== dateToRemove));
  };

  const handleSetPreset = (preset: "TODAY" | "TOMORROW" | "NEXT_3" | "NEXT_7") => {
    const dates: string[] = [];
    const base = new Date();

    if (preset === "TODAY") {
      dates.push(getTodayString());
    } else if (preset === "TOMORROW") {
      dates.push(getTomorrowString());
    } else if (preset === "NEXT_3") {
      for (let i = 0; i < 3; i++) {
        const d = new Date();
        d.setDate(base.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        dates.push(`${y}-${m}-${day}`);
      }
    } else if (preset === "NEXT_7") {
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(base.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        dates.push(`${y}-${m}-${day}`);
      }
    }

    setSelectedDates(dates);
  };

  const handleDispatchDateReminders = async () => {
    if (selectedDates.length === 0) {
      alert("Por favor, selecione ao menos 1 data para enviar lembretes.");
      return;
    }

    const formattedDatesList = selectedDates
      .map((d) => d.split("-").reverse().join("/"))
      .join(", ");

    if (
      confirm(
        `Deseja disparar lembretes via WhatsApp para as clientes agendadas nas seguintes datas?\n\n📅 ${formattedDatesList}`
      )
    ) {
      setLoading(true);
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SEND_DATE_REMINDERS",
          dates: selectedDates,
        }),
      });

      const resData = await res.json();
      setLoading(false);

      if (resData.items && resData.items.length > 0) {
        setReminderResults(resData.items);
      } else {
        alert(
          `✨ NENHUM agendamento pendente/confirmado encontrado para a(s) data(s) selecionada(s) (${formattedDatesList}).`
        );
      }
      loadWhatsApp();
    }
  };

  const handleSimulateClientReply = async () => {
    const res = await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "WEBHOOK_REPLY",
        phone: testPhone,
        replyText: testMessage,
      }),
    });

    const result = await res.json();
    setWebhookLog((prev) => [
      `[${new Date().toLocaleTimeString()}] Resposta recebida de ${testPhone}: "${testMessage}" => Ação tomada: ${result.actionTaken}`,
      ...prev,
    ]);
    loadWhatsApp();
  };

  const { templates, messages } = data || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
            WhatsApp Automation Hub
          </h2>
          <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
            Conexão com WhatsApp API, disparo para qualquer data ou múltiplas datas e confirmação automática.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Oficial / Conectado</span>
          </span>
        </div>
      </div>

      {/* PAINEL SELETOR DE MÚLTIPLAS DATAS E DISPARO DE LEMBRETES */}
      <div className="rounded-3xl border-2 border-emerald-400 bg-white p-6 shadow-md dark:border-emerald-600 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-emerald-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white font-bold text-lg shadow-md">
              📲
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Disparo de Lembretes por Data Personalizada & Múltiplas Datas
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Escolha qualquer data específica ou selecione várias datas simultâneas para enviar os lembretes do WhatsApp.
              </p>
            </div>
          </div>

          <button
            onClick={handleDispatchDateReminders}
            disabled={loading || selectedDates.length === 0}
            className="flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-xs font-extrabold text-white shadow-lg hover:opacity-95 disabled:opacity-50 shrink-0"
          >
            <Send className="h-4 w-4" />
            <span>
              {loading ? "Disparando..." : `Disparar Lembretes (${selectedDates.length} Data${selectedDates.length > 1 ? "s" : ""}) &rarr;`}
            </span>
          </button>
        </div>

        {/* Seleção Rápida (Presets) & Seletor Customizado */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Presets Rápidos */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              ⚡ Atalhos Rápidos de Seleção de Datas:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSetPreset("TODAY")}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                📅 Hoje
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset("TOMORROW")}
                className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              >
                📅 Amanhã
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset("NEXT_3")}
                className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
              >
                🗓️ Próximos 3 Dias
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset("NEXT_7")}
                className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-bold text-purple-800 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-300"
              >
                🗓️ Próximos 7 Dias
              </button>
            </div>
          </div>

          {/* Adicionar Data Específica */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              ➕ Escolher Qualquer Outra Data Específica:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customDateInput}
                onChange={(e) => setCustomDateInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCustomDate}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
              >
                + Adicionar Data
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Datas Selecionadas */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              📅 Datas Selecionadas para o Disparo ({selectedDates.length}):
            </span>
            {selectedDates.length > 0 && (
              <button
                onClick={() => setSelectedDates([])}
                className="text-[11px] font-bold text-rose-600 hover:underline dark:text-rose-400"
              >
                Limpar Todas as Datas
              </button>
            )}
          </div>

          {selectedDates.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedDates.map((dateStr) => {
                const formattedDate = dateStr.split("-").reverse().join("/");
                return (
                  <span
                    key={dateStr}
                    className="inline-flex items-center space-x-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-slate-900 shadow-sm border border-emerald-300 dark:bg-slate-900 dark:text-white dark:border-emerald-700"
                  >
                    <span>📅 {formattedDate}</span>
                    <button
                      onClick={() => handleRemoveDate(dateStr)}
                      className="ml-1 rounded-full text-slate-400 hover:text-rose-600 transition"
                      title="Remover esta data"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Nenhuma data selecionada no momento. Use os atalhos ou o seletor acima para escolher as datas desejadas.
            </p>
          )}
        </div>
      </div>

      {/* PAINEL DE LINKS DIRETOS PARA WHATSAPP WEB */}
      {reminderResults.length > 0 && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between border-b pb-3 border-emerald-200 dark:border-slate-800">
            <h3 className="font-serif text-base font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span>✨ {reminderResults.length} Lembrete(s) de WhatsApp Gerado(s) com Sucesso</span>
            </h3>
            <button
              onClick={() => setReminderResults([])}
              className="text-xs font-bold text-slate-500 hover:underline"
            >
              Fechar Painel
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {reminderResults.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm dark:bg-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{item.clientName}</p>
                    {item.appointmentDate && (
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                        {item.appointmentDate.split("-").reverse().join("/")} às {item.appointmentTime}h
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                    📞 WhatsApp: {item.phone}
                  </p>
                </div>

                <a
                  href={item.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Abrir no WhatsApp</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SIMULADOR INTERATIVO DE WEBHOOK / CONFIRMAÇÕES */}
      <div className="rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-50/80 via-amber-50/50 to-rose-50/80 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white font-bold shadow-md">
            🤖
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
              Simulador de Confirmação em Tempo Real (Webhook Test)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Digite o WhatsApp da cliente com ou sem 55 (ex: 67992684748) e a resposta para testar o robô alterando para "CONFIRMADO".
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">WhatsApp da Cliente</label>
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Resposta Digitada no WhatsApp</label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Ex: CONFIRMAR"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSimulateClientReply}
              className="w-full rounded-xl bg-emerald-600 p-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
            >
              Simular Resposta & Alterar Status &rarr;
            </button>
          </div>
        </div>

        {webhookLog.length > 0 && (
          <div className="mt-4 max-h-32 overflow-y-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-emerald-400">
            {webhookLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
      </div>

      {/* TEMPLATES DE MENSAGENS */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-4">
          📱 Templates de Automação Transacional
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {templates?.map((tmpl: any) => (
            <div key={tmpl.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-xs font-bold text-slate-800 dark:text-white">{tmpl.name}</h4>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {tmpl.type}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-white p-3 font-sans text-xs text-slate-700 shadow-inner dark:bg-slate-900 dark:text-slate-300">
                {tmpl.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* HISTÓRICO DE MENSAGENS ENVIADAS */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-4">
          💬 Histórico de Mensagens Recentes
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Data/Hora</th>
                <th className="px-4 py-3">Destinatário</th>
                <th className="px-4 py-3">Conteúdo</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {messages?.map((msg: any) => (
                <tr key={msg.id}>
                  <td className="px-4 py-3 font-semibold">{new Date(msg.sentAt).toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{msg.phone}</td>
                  <td className="px-4 py-3 truncate max-w-xs">{msg.messageText}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {msg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
