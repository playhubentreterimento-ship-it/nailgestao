"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Award, Plus, CheckCircle, AlertTriangle, FileSpreadsheet } from "lucide-react";

export default function FinanceiroPage() {
  const [data, setData] = useState<any>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [period, setPeriod] = useState<"today" | "week" | "month" | "all">("month");

  // Form de Despesa
  const [expName, setExpName] = useState("");
  const [expCategory, setExpCategory] = useState("ALUGUEL");
  const [expAmount, setExpAmount] = useState(100);
  const [expDueDate, setExpDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [expRecurring, setExpRecurring] = useState(false);

  const loadFinance = (targetPeriod = period) => {
    fetch(`/api/finance?period=${targetPeriod}`)
      .then((r) => r.json())
      .then(setData);
  };

  useEffect(() => {
    loadFinance(period);
  }, [period]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: expName,
        category: expCategory,
        amount: expAmount,
        dueDate: expDueDate,
        isRecurring: expRecurring,
      }),
    });
    if (res.ok) {
      setShowExpenseModal(false);
      loadFinance();
    }
  };

  const handlePayExpense = async (id: string) => {
    await fetch("/api/finance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "PAGO" }),
    });
    loadFinance();
  };

  const handleResetFinancials = async () => {
    if (
      confirm(
        "⚠️ Tem certeza que deseja ZERAR todas as métricas financeiras, despesas e extratos?\n\nEsta ação limpará todo o histórico de teste para que os seus números fiquem 100% zerados!"
      )
    ) {
      const res = await fetch("/api/finance?action=reset_all", { method: "DELETE" });
      if (res.ok) {
        alert("✨ Métricas e histórico financeiro zerados com sucesso!");
        loadFinance();
      } else {
        const err = await res.json();
        alert("Erro ao zerar dados: " + err.error);
      }
    }
  };

  const handleDeleteExpense = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a despesa "${name}"?`)) {
      const res = await fetch(`/api/finance?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        loadFinance();
      } else {
        const err = await res.json();
        alert("Erro ao excluir despesa: " + err.error);
      }
    }
  };

  const { summary, expenses, commissionsByProfessional } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
            Gestão Financeira & DRE
          </h2>
          <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
            DRE gerencial, despesas operacionais, taxas de adquirentes e repasse de comissões.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetFinancials}
            className="flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-white/90 px-3.5 py-2.5 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-50 dark:border-slate-800 dark:bg-slate-900 dark:text-rose-400"
            title="Zerar todas as despesas e métricas de teste"
          >
            <span>🗑️ Zerar Dados / Métricas</span>
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-200 hover:opacity-95 dark:shadow-none"
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar Nova Despesa</span>
          </button>
        </div>
      </div>

      {/* DRE GERENCIAL (RESUMO) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-bold text-slate-400">FATURAMENTO BRUTO</span>
          <p className="mt-1 font-serif text-xl font-bold text-slate-900 dark:text-white">
            R$ {summary?.inflow?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-bold text-rose-400">TAXAS CARTÃO</span>
          <p className="mt-1 font-serif text-xl font-bold text-rose-600 dark:text-rose-400">
            - R$ {summary?.cardFees?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-bold text-amber-500">DESPESAS OPERACIONAIS</span>
          <p className="mt-1 font-serif text-xl font-bold text-amber-600 dark:text-amber-400">
            - R$ {summary?.expenses?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-bold text-purple-400">COMISSÕES DA EQUIPE</span>
          <p className="mt-1 font-serif text-xl font-bold text-purple-600 dark:text-purple-400">
            - R$ {summary?.commissions?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">LUCRO LÍQUIDO</span>
          <p className="mt-1 font-serif text-2xl font-bold text-emerald-800 dark:text-emerald-300">
            R$ {summary?.profit?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* COMISSÕES DAS PROFISSIONAIS */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 dark:border-slate-800 gap-3">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>👑 Extrato de Comissões & Receita por Profissional</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Contabilização por período de atendimentos realizados, faturamento bruto gerado e comissão a repassar.
            </p>
          </div>

          {/* Seletor de Período (Hoje/Dia, Semana, Mês, Geral) */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setPeriod("today")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                period === "today" ? "bg-white text-rose-600 shadow dark:bg-slate-900 dark:text-rose-400" : "text-slate-600"
              }`}
            >
              Hoje (Dia)
            </button>
            <button
              onClick={() => setPeriod("week")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                period === "week" ? "bg-white text-rose-600 shadow dark:bg-slate-900 dark:text-rose-400" : "text-slate-600"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                period === "month" ? "bg-white text-rose-600 shadow dark:bg-slate-900 dark:text-rose-400" : "text-slate-600"
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setPeriod("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                period === "all" ? "bg-white text-rose-600 shadow dark:bg-slate-900 dark:text-rose-400" : "text-slate-600"
              }`}
            >
              Geral
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {commissionsByProfessional?.map((prof: any) => {
            const stats = prof[period] || prof.all || {};
            return (
              <div
                key={prof.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/60 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between border-b pb-2 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: prof.color }}></span>
                    <h4 className="font-serif font-bold text-slate-900 dark:text-white text-sm">{prof.name}</h4>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {prof.rate}% Comissão
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-xl border">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">💅 Atendimentos:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{stats.count || 0} clientes</span>
                  </div>

                  <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-xl border">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">📈 Receita Total Gerada:</span>
                    <span className="font-bold text-slate-900 dark:text-white">R$ {(stats.revenue || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200">
                    <span className="text-amber-900 dark:text-amber-300 font-bold">💰 Comissão a Pagar:</span>
                    <span className="font-serif font-bold text-base text-amber-700 dark:text-amber-300">
                      R$ {(stats.commission || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200">
                    <span className="text-emerald-900 dark:text-emerald-300 font-semibold">🏛️ Retido pelo Salão:</span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">
                      R$ {(stats.salonKeep || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTAS A PAGAR & DESPESAS */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-4">
          📄 Contas a Pagar & Despesas Operacionais
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Despesa</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Recorrente?</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses?.map((exp: any) => (
                <tr key={exp.id}>
                  <td className="px-4 py-3 font-semibold">{exp.dueDate}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{exp.name}</td>
                  <td className="px-4 py-3">{exp.category}</td>
                  <td className="px-4 py-3 font-bold">R$ {exp.amount?.toFixed(2)}</td>
                  <td className="px-4 py-3">{exp.isRecurring ? "Sim (Mensal)" : "Não"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${exp.status === "PAGO" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {exp.status === "PENDENTE" && (
                        <button
                          onClick={() => handlePayExpense(exp.id)}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white shadow-sm hover:bg-emerald-700"
                        >
                          Dar Baixa (Pagar)
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.name)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
                        title="Excluir despesa"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NOVA DESPESA */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-4">📑 Cadastrar Despesa</h3>
            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold">Nome da Despesa *</label>
                <input type="text" value={expName} onChange={(e) => setExpName(e.target.value)} placeholder="Ex: Conta de Energia..." className="mt-1 w-full rounded-xl border p-2.5 font-medium dark:bg-slate-800" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold">Categoria</label>
                  <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800">
                    <option value="ALUGUEL">Aluguel</option>
                    <option value="ENERGIA">Energia</option>
                    <option value="PRODUTOS">Produtos</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="INTERNET">Internet</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold">Valor (R$) *</label>
                  <input type="number" value={expAmount} onChange={(e) => setExpAmount(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-2.5 font-bold dark:bg-slate-800" required />
                </div>
              </div>
              <div>
                <label className="block font-bold">Vencimento *</label>
                <input type="date" value={expDueDate} onChange={(e) => setExpDueDate(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 font-medium dark:bg-slate-800" required />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="rounded-xl border p-2.5 font-bold">Cancelar</button>
                <button type="submit" className="rounded-xl bg-rose-500 px-6 p-2.5 font-bold text-white">Salvar &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
