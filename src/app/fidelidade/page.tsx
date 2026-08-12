"use client";

import { Award, Star, Sparkles } from "lucide-react";

export default function FidelidadePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-amber-200 sm:text-3xl">
          🏆 Programa de Fidelidade
        </h2>
        <p className="text-xs text-rose-100/90 font-medium">
          Acúmulo automático de pontos por atendimentos e resgate em descontos ou serviços VIP.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">Regras de Pontuação Configuradas</h3>
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-2xl bg-rose-50 p-4 dark:bg-slate-800">
            <span className="font-bold text-rose-700">Regra: 1 ponto a cada R$ 10,00 gastos</span>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Ao atingir 50 pontos, a cliente ganha R$ 25,00 de desconto na manutenção.</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 dark:bg-slate-800">
            <span className="font-bold text-amber-700">Regra: 5 atendimentos consecutivos</span>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Ganhe 1 SPA dos pés de cortesia ou 1 Nail Art Encapsulada gratuita.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
