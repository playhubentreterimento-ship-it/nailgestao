"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Printer, Filter, DollarSign, Users, Sparkles } from "lucide-react";

export default function RelatoriosPage() {
  const [data, setData] = useState<any>(null);

  const loadData = () => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData);
  };

  useEffect(() => {
    loadData();
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, []);

  const handleExportPDF = () => {
    window.print();
  };

  const { salon, month, charts } = data || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
            Relatório Executivo do Salão
          </h2>
          <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
            Relatórios consolidados em tempo real para análise de gestão, contabilidade e tomada de decisão.
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
        >
          <Download className="h-4 w-4" />
          <span>Exportar PDF / Imprimir</span>
        </button>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="border-b pb-4 flex justify-between items-center border-rose-100 dark:border-slate-800">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#6B1615] dark:text-amber-200">
              {salon?.name || "Studio Selma Gloor"}
            </h3>
            <p className="text-xs text-slate-500">Relatório Consolidado de Desempenho Executivo</p>
          </div>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Período: Mês Atual</span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
          <div className="rounded-2xl bg-rose-50 p-4 dark:bg-slate-800">
            <span className="text-slate-500 font-bold">FATURAMENTO TOTAL</span>
            <p className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">
              R$ {(month?.totalRevenue || 0).toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-slate-800">
            <span className="text-slate-500 font-bold">LUCRO ESTIMADO</span>
            <p className="font-serif text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
              R$ {(month?.estimatedProfit || 0).toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl bg-purple-50 p-4 dark:bg-slate-800">
            <span className="text-slate-500 font-bold">TOTAL ATENDIMENTOS</span>
            <p className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">
              {month?.totalAttendances || 0} clientes
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 dark:bg-slate-800">
            <span className="text-slate-500 font-bold">TICKET MÉDIO</span>
            <p className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">
              R$ {(month?.averageTicket || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white mb-3">
            Desempenho Real por Procedimento
          </h4>

          {charts?.topServices && charts.topServices.length > 0 ? (
            <div className="space-y-2 text-xs">
              {charts.topServices.map((s: any) => (
                <div key={s.service} className="flex justify-between items-center border-b py-2.5 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200">💅 {s.service}</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    R$ {s.receita?.toFixed(2)} ({s.vendas} {s.vendas === 1 ? 'venda' : 'vendas'})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              Nenhum procedimento concluído no período ainda. Conforme os agendamentos forem realizados, o relatório atualizará os valores automaticamente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
