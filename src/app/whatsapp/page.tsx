"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCheck, RefreshCw, AlertCircle, Bot, Zap, Plus, Sparkles, ExternalLink, CheckCircle } from "lucide-react";

export default function WhatsAppHubPage() {
  const [data, setData] = useState<any>(null);
  const [testPhone, setTestPhone] = useState("5567992684748");
  const [testMessage, setTestMessage] = useState("CONFIRMAR");
  const [webhookLog, setWebhookLog] = useState<string[]>([]);
  const [reminderResults, setReminderResults] = useState<any[]>([]);

  const loadWhatsApp = () => {
    fetch("/api/whatsapp")
      .then((r) => r.json())
      .then(setData);
  };

  useEffect(() => {
    loadWhatsApp();
  }, []);

  const handleDispatchReminders = async () => {
    if (confirm("Deseja enviar lembretes automáticos via WhatsApp para TODAS as clientes agendadas para amanhã?")) {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEND_TOMORROW_REMINDERS" }),
      });
      const resData = await res.json();
      if (resData.items && resData.items.length > 0) {
        setReminderResults(resData.items);
      } else {
        alert(`✨ ${resData.count || 0} lembrete(s) processado(s) para o dia ${resData.date}.`);
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
          <h2 className="font-serif text-2xl font-bold text-amber-200 sm:text-3xl">
            WhatsApp Automation Hub
          </h2>
          <p className="text-xs text-rose-100/90 font-medium">
            Conexão com WhatsApp API, disparo com DDI 55 automático e confirmações de presença.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDispatchReminders}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-95"
          >
            <Send className="h-4 w-4" />
            <span>📲 Disparar Lembretes de Amanhã (24h)</span>
          </button>

          <span className="flex items-center space-x-1.5 rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Oficial / Conectado</span>
          </span>
        </div>
      </div>

      {/* PAINEL DE LINKS DIRETOS PARA WHATSAPP WEB */}
      {reminderResults.length > 0 && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span>✨ Lembretes de Amanhã Processados com DDI 55 ({reminderResults.length})</span>
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
                  <p className="font-bold text-slate-900 dark:text-white text-xs">{item.clientName}</p>
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
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
