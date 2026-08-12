"use client";

import { useState, useEffect } from "react";
import { Lightbulb, Sparkles, TrendingUp, Users, ArrowRight } from "lucide-react";

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((res) => setInsights(res.insights || []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-amber-200 sm:text-3xl">
          💡 Central de IA & Insights de Negócios
        </h2>
        <p className="text-xs text-rose-100/90 font-medium">
          Análise inteligente contínua dos dados do seu salão com sugestões de crescimento.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {insights.map((ins) => (
          <div key={ins.id} className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {ins.category}
              </span>
              {ins.importance === "HIGH" && <span className="text-xs font-bold text-rose-500">Alta Importância</span>}
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">{ins.title}</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{ins.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
