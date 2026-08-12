"use client";

import { Gift, Copy, CheckCircle } from "lucide-react";

export default function GiftCardsPage() {
  const cards = [
    { code: "LUXE-GIFT-2026", buyer: "Roberto Rossi", recipient: "Maria Fernanda Rossi", initial: 200, remaining: 200, status: "ATIVO" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-amber-200 sm:text-3xl">
          🎁 Vales-Presente (Gift Cards)
        </h2>
        <p className="text-xs text-rose-100/90 font-medium">
          Emissão e resgate de cartões de presente com código único e acompanhamento de saldo.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-4">Vales-Presente Emitidos</h3>
        <div className="space-y-3">
          {cards.map((c) => (
            <div key={c.code} className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 p-4 dark:from-slate-800 dark:to-slate-800">
              <div>
                <span className="font-mono text-sm font-bold text-rose-700 dark:text-rose-300">{c.code}</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-white mt-1">Comprador: {c.buyer} &rarr; Presenteada: {c.recipient}</p>
              </div>
              <div className="text-right">
                <span className="font-serif text-lg font-bold text-emerald-600">R$ {c.remaining.toFixed(2)}</span>
                <span className="block text-[10px] font-bold text-slate-400">Saldo Restante</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
