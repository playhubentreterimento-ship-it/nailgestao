"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCheck, RefreshCw, AlertCircle, Bot, Zap, Plus, Sparkles } from "lucide-react";

export default function WhatsAppHubPage() {
  const [data, setData] = useState<any>(null);
  const [testPhone, setTestPhone] = useState("5511991112233");
  const [testMessage, setTestMessage] = useState("CONFIRMAR");
  const [webhookLog, setWebhookLog] = useState<string[]>([]);

  const loadWhatsApp = () => {
    fetch("/api/whatsapp")
      .then((r) => r.json())
      .then(setData);
  };

  useEffect(() => {
    loadWhatsApp();
  }, []);

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
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            WhatsApp Automation Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Conexão com WhatsApp Cloud API, envio de lembretes automáticos e bot de confirmações de presença.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Oficial / Conectado</span>
          </span>
        </div>
      </div>

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
              Digite a resposta do cliente para testar a alteração automática de status no sistema (ex: "CONFIRMAR" ou "REAGENDAR").
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
