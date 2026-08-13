"use client";

import { useState, useEffect } from "react";
import { Megaphone, Send, Filter, ShieldCheck, CheckCircle, Users } from "lucide-react";

export default function CampanhasPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [segment, setSegment] = useState("INATIVO");
  const [message, setMessage] = useState("Oi, {NOME}! 💕 Queremos te convidar para voltar ao Studio Luxe. Agende seu horário com 15% de desconto!");
  const [sentCount, setSentCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
  }, []);

  const filteredClients = clients.filter((c) => {
    if (c.optOutWhatsApp) return false; // LGPD compliance: Respeita Opt-Out
    if (segment === "ALL") return true;
    if (segment === "VIP") return c.tag === "VIP";
    if (segment === "INATIVO") return c.tag === "INATIVO";
    if (segment === "NOVO") return c.tag === "NOVO";
    return true;
  });

  const handleSendCampaign = async () => {
    if (filteredClients.length === 0) {
      alert("Nenhum cliente elegível para este segmento.");
      return;
    }

    // Simulação do envio em massa respeitando a API do WhatsApp
    for (const cli of filteredClients) {
      const formattedText = message.replace("{NOME}", cli.name);
      await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SEND_DIRECT",
          phone: cli.whatsapp,
          messageText: formattedText,
        }),
      });
    }

    setSentCount(filteredClients.length);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
          📣 Campanhas de WhatsApp & Reengajamento
        </h2>
        <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
          Disparo de mensagens segmentadas em massa em conformidade com as regras de opt-in/opt-out e LGPD.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Painel de Configuração da Campanha */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:col-span-2 space-y-4">
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
            1. Selecione o Público-Alvo (Segmentação)
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            {[
              { id: "INATIVO", label: "Clientes Inativas (+45d)", count: clients.filter((c) => c.tag === "INATIVO" && !c.optOutWhatsApp).length },
              { id: "VIP", label: "Clientes VIP", count: clients.filter((c) => c.tag === "VIP" && !c.optOutWhatsApp).length },
              { id: "NOVO", label: "Clientes Novas", count: clients.filter((c) => c.tag === "NOVO" && !c.optOutWhatsApp).length },
              { id: "ALL", label: "Toda a Base (Opt-in)", count: clients.filter((c) => !c.optOutWhatsApp).length },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSegment(item.id)}
                className={`rounded-2xl border p-3 text-left transition ${
                  segment === item.id
                    ? "border-rose-400 bg-rose-50 text-rose-800 font-bold dark:bg-slate-800 dark:text-rose-300"
                    : "border-slate-100 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <span className="block text-[10px] uppercase text-slate-400">{item.label}</span>
                <span className="font-serif text-lg font-bold">{item.count} destinatários</span>
              </button>
            ))}
          </div>

          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white pt-2">
            2. Mensagem Personalizável
          </h3>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            rows={4}
          />

          <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-3 text-[11px] font-medium text-amber-800 dark:bg-slate-800 dark:text-amber-300">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>Conformidade LGPD: Clientes com Opt-Out ativo foram removidas da lista.</span>
            </span>
          </div>

          <button
            onClick={handleSendCampaign}
            className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg shadow-rose-200 hover:opacity-95"
          >
            DISPARAR CAMPANHA PARA {filteredClients.length} CLIENTES &rarr;
          </button>

          {sentCount !== null && (
            <div className="rounded-2xl bg-emerald-100 p-4 text-center text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              🎉 Campanha disparada com sucesso para {sentCount} clientes!
            </div>
          )}
        </div>

        {/* Pré-visualização da Mensagem */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-3">
            📱 Pré-visualização no WhatsApp
          </h3>

          <div className="rounded-2xl bg-[#E5DDD5] p-4 text-xs dark:bg-slate-800">
            <div className="rounded-xl bg-white p-3 shadow-sm text-slate-800 dark:bg-slate-900 dark:text-slate-100">
              <p className="whitespace-pre-wrap">{message.replace("{NOME}", "Maria Fernanda")}</p>
              <span className="mt-2 block text-right text-[9px] text-slate-400">14:00 ✓✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
