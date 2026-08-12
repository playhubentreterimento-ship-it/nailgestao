"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Award, Plus, CheckCircle, AlertTriangle, FileSpreadsheet } from "lucide-react";

export default function FinanceiroPage() {
  const [data, setData] = useState<any>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Form de Despesa
  const [expName, setExpName] = useState("");
  const [expCategory, setExpCategory] = useState("ALUGUEL");
  const [expAmount, setExpAmount] = useState(100);
  const [expDueDate, setExpDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [expRecurring, setExpRecurring] = useState(false);

  const loadFinance = () => {
    fetch("/api/finance")
      .then((r) => r.json())
      .then(setData);
  };

  useEffect(() => {
    loadFinance();
  }, []);

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
          <h2 className="font-serif text-2xl font-bold text-amber-200 sm:text-3xl">
            Gestão Financeira & DRE
          </h2>
          <p className="text-xs text-rose-100/90 font-medium">
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
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-4">
          👑 Extrato de Comissões por Profissional
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {commissionsByProfessional?.map((prof: any) => (
            <div key={prof.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-slate-900 dark:text-white">{prof.name}</h4>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {prof.rate}% Comissão
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Acumulado:</span>
                  <span className="font-bold">R$ {prof.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pendente de Payout:</span>
                  <span className="font-bold text-rose-600">R$ {prof.pendingAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
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
