"use client";

import { ShieldCheck, Lock, FileText, CheckCircle } from "lucide-react";

export default function AuditoriaPage() {
  const logs = [
    { id: "1", date: "11/08/2026 10:45", user: "Juliana Silva", action: "CRIAR_AGENDAMENTO", details: "Agendamento Maria Fernanda Rossi" },
    { id: "2", date: "11/08/2026 09:30", user: "Mariana Alvez", action: "ABERTURA_CAIXA", details: "Abertura de caixa com R$ 200,00" },
    { id: "3", date: "11/08/2026 09:00", user: "Sistema Auto", action: "CONFIRMACAO_WHATSAPP", details: "Cliente confirmou presença via WhatsApp" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          🛡️ Logs de Auditoria & Conformidade LGPD
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Rastreabilidade completa de todas as ações de usuários, alterações financeiras e privacidade de dados.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-4">Registro de Ações no Salão</h3>
        <div className="space-y-2 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between border-b py-2.5 dark:border-slate-800">
              <div>
                <span className="font-mono text-slate-400 mr-3">{log.date}</span>
                <span className="font-bold text-slate-800 dark:text-white">{log.user}:</span> {log.details}
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {log.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
