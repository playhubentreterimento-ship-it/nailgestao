"use client";

import { ShieldCheck, Lock, FileText, CheckCircle } from "lucide-react";

export default function AuditoriaPage() {
  const logs = [
    { id: "1", date: "11/08/2026 10:45", user: "Juliana Silva", action: "CRIAR_AGENDAMENTO", details: "Agendamento Maria Fernanda Rossi" },
    { id: "2", date: "11/08/2026 09:30", user: "Mariana Alvez", action: "ABERTURA_CAIXA", details: "Abertura de caixa com R$ 200,00" },
    { id: "3", date: "11/08/2026 09:00", user: "Sistema Auto", action: "CONFIRMACAO_WHATSAPP", details: "Cliente confirmou presença via WhatsApp" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
          🛡️ Logs de Auditoria & Conformidade LGPD
        </h2>
        <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
          Rastreabilidade completa de todas as ações de usuários, alterações financeiras e privacidade de dados.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-4">
          Registro de Ações no Salão
        </h3>
        <div className="space-y-2.5 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2.5 border-slate-100 dark:border-slate-800 gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{log.date}</span>
                <span className="font-bold text-slate-900 dark:text-white">{log.user}:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{log.details}</span>
              </div>
              <span className="self-start sm:self-auto rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                {log.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
