"use client";

import { useState, useEffect } from "react";
import { Cake, MessageSquare, Gift, Sparkles, CheckCircle } from "lucide-react";

export default function AniversariantesPage() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients);
  }, []);

  const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, "0");
  const birthdayClients = clients.filter((c) => c.birthDate && c.birthDate.includes(`-${currentMonthStr}-`));

  const handleSendBirthdayMsg = async (cli: any) => {
    const text = `Parabéns, ${cli.name}! 🎂🎉 O Studio Luxe preparou um presente especial para você: GANHE 15% DE DESCONTO na sua próxima manutenção este mês! Agende já seu horário especial.`;

    await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SEND_DIRECT",
        phone: cli.whatsapp,
        messageText: text,
      }),
    });

    alert(`✨ Mensagem de parabéns enviada com sucesso para ${cli.name}!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
          🎂 Aniversariantes do Mês
        </h2>
        <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
          Encante suas clientes com cupons e felicitações no dia do aniversário via WhatsApp.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-4">
          Clientes Fazendo Aniversário em {new Date().toLocaleString("pt-BR", { month: "long" })} ({birthdayClients.length})
        </h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {birthdayClients.map((cli) => (
            <div key={cli.id} className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 dark:border-slate-800 dark:bg-slate-800">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 font-bold text-white text-xl">
                  🎂
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white">{cli.name}</h4>
                  <p className="text-xs text-slate-500">Data Nasc: {cli.birthDate}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-rose-200/60 pt-3">
                <span className="text-[10px] font-bold text-rose-700">Cupom 15% OFF Disponível</span>
                <button
                  onClick={() => handleSendBirthdayMsg(cli)}
                  className="flex items-center space-x-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Enviar Parabéns</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
