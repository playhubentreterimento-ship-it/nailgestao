"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Printer, Filter, DollarSign, Users, Sparkles } from "lucide-react";

export default function RelatoriosPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const handleExportPDF = () => {
    window.print();
  };

  const { month, charts } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-bold text-amber-200 sm:text-3xl">
            Relatório Executivo do Salão
          </h2>
          <p className="text-xs text-rose-100/90 font-medium">
            Relatórios consolidados para análise de gestão, contabilidade e tomada de decisão.
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
        <div className="border-b pb-4 flex justify-between items-center">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Studio Luxe Nail Designer</h3>
            <p className="text-xs text-slate-500">Relatório Consolidado de Desempenho Executivo</p>
          </div>
          <span className="text-xs font-bold text-rose-600">Período: Mês Atual</span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
          <div className="rounded-2xl bg-rose-50 p-4 dark:bg-slate-800">
            <span className="text-slate-500">FATURAMENTO TOTAL</span>
            <p className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">R$ {month?.totalRevenue?.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-slate-800">
            <span className="text-slate-500">LUCRO ESTIMADO</span>
            <p className="font-serif text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">R$ {month?.estimatedProfit?.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-purple-50 p-4 dark:bg-slate-800">
            <span className="text-slate-500">TOTAL ATENDIMENTOS</span>
            <p className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">{month?.totalAttendances} clientes</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 dark:bg-slate-800">
            <span className="text-slate-500">TICKET MÉDIO</span>
            <p className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">R$ {month?.averageTicket?.toFixed(2)}</p>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white mb-2">Serviços Mais Lucrativos</h4>
          <div className="space-y-2 text-xs">
            {charts?.topServices?.map((s: any) => (
              <div key={s.service} className="flex justify-between items-center border-b py-2 dark:border-slate-800">
                <span className="font-semibold">{s.service}</span>
                <span className="font-bold text-emerald-600">R$ {s.receita?.toFixed(2)} ({s.vendas} vendas)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
