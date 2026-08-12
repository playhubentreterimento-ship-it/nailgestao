"use client";

import { Package, CheckCircle, Plus } from "lucide-react";

export default function PacotesPage() {
  const packagesList = [
    { id: "1", name: "Combo Club 3 Manutenções em Fibra", price: 330.0, totalSessions: 3, validityDays: 90, desc: "Sessão quinzenal com valor promocional." },
    { id: "2", name: "Plano Trimestral Banho de Gel", price: 270.0, totalSessions: 3, validityDays: 90, desc: "Blindagem e nivelamento continuo." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-amber-200 sm:text-3xl">
          📦 Pacotes & Planos de Sessões
        </h2>
        <p className="text-xs text-rose-100/90 font-medium">
          Venda pacotes recorrentes de manutenções e acompanhe o uso de sessões das clientes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {packagesList.map((pkg) => (
          <div key={pkg.id} className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
              <span className="font-serif text-xl font-bold text-rose-600">R$ {pkg.price.toFixed(2)}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{pkg.desc}</p>
            <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">{pkg.totalSessions} Sessões | Validade: {pkg.validityDays} dias</span>
              <button className="rounded-xl bg-rose-500 px-4 py-1.5 font-bold text-white shadow-sm hover:bg-rose-600">
                Vender Pacote &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
