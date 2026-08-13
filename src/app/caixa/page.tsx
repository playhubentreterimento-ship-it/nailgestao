"use client";

import { useState, useEffect } from "react";
import { Receipt, DollarSign, ArrowUpRight, ArrowDownLeft, Lock, Unlock, Plus, AlertCircle, FileText } from "lucide-react";

export default function CaixaPage() {
  const [data, setData] = useState<any>(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Form states
  const [initialAmount, setInitialAmount] = useState(200);
  const [txCategory, setTxCategory] = useState("SANGRIA");
  const [txAmount, setTxAmount] = useState(50);
  const [txMethod, setTxMethod] = useState("DINHEIRO");
  const [txDescription, setTxDescription] = useState("");
  const [finalAmount, setFinalAmount] = useState(0);

  const loadCaixa = () => {
    fetch("/api/cash")
      .then((r) => r.json())
      .then(setData);
  };

  useEffect(() => {
    loadCaixa();
  }, []);

  const handleOpenCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/cash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "OPEN", initialAmount }),
    });
    if (res.ok) {
      setShowOpenModal(false);
      loadCaixa();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/cash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "TRANSACTION",
        category: txCategory,
        amount: txAmount,
        paymentMethod: txMethod,
        description: txDescription,
      }),
    });
    if (res.ok) {
      setShowTxModal(false);
      loadCaixa();
    }
  };

  const handleCloseCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/cash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CLOSE", finalAmount }),
    });
    if (res.ok) {
      setShowCloseModal(false);
      loadCaixa();
    }
  };

  const { activeRegister, history } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
            Caixa & Controle Diário
          </h2>
          <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
            Abertura, fechamento, sangrias, suprimentos e conferência por forma de pagamento.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {activeRegister ? (
            <>
              <button
                onClick={() => setShowTxModal(true)}
                className="flex items-center space-x-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-600"
              >
                <Plus className="h-4 w-4" />
                <span>Sangria / Suprimento</span>
              </button>
              <button
                onClick={() => {
                  setFinalAmount(activeRegister.expectedAmount);
                  setShowCloseModal(true);
                }}
                className="flex items-center space-x-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700"
              >
                <Lock className="h-4 w-4" />
                <span>Fechar Caixa do Dia</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowOpenModal(true)}
              className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
            >
              <Unlock className="h-4 w-4" />
              <span>Abrir Caixa Agora</span>
            </button>
          )}
        </div>
      </div>

      {/* Status do Caixa Ativo */}
      {activeRegister ? (
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-emerald-50/80 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-4 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold shadow-md">
                🔓
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Caixa Aberto &mdash; {new Date(activeRegister.openedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Responsável: Juliana Silva</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-400">SALDO ESPERADO NO CAIXA</span>
              <p className="font-serif text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                R$ {activeRegister.expectedAmount?.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
            <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
              <span className="text-[10px] text-slate-400">VALOR INICIAL</span>
              <p className="font-serif font-bold text-slate-900 dark:text-white">R$ {activeRegister.initialAmount?.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
              <span className="text-[10px] text-slate-400">TOTAL DE TRANSAÇÕES</span>
              <p className="font-serif font-bold text-slate-900 dark:text-white">{activeRegister.transactions?.length || 0} lançamentos</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800 dark:border-slate-800 dark:bg-slate-900 dark:text-amber-300">
          ⚠️ O caixa encontra-se fechado neste momento. Clique em "Abrir Caixa Agora" para iniciar os lançamentos.
        </div>
      )}

      {/* Extrato de Lançamentos */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-4">
          Lançamentos e Movimentações do Dia
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Horário</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Forma Pgto</th>
                <th className="px-4 py-3 text-right">Valor Bruto</th>
                <th className="px-4 py-3 text-right">Taxa Card</th>
                <th className="px-4 py-3 text-right">Valor Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeRegister?.transactions && activeRegister.transactions.length > 0 ? (
                activeRegister.transactions.map((tx: any) => (
                  <tr key={tx.id}>
                    <td className="px-4 py-3 font-semibold">{new Date(tx.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tx.type === "ENTRADA" || tx.type === "SUPRIMENTO" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{tx.category}</td>
                    <td className="px-4 py-3">{tx.description}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{tx.paymentMethod}</td>
                    <td className="px-4 py-3 text-right font-bold">R$ {tx.amount?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-rose-500">R$ {tx.feeAmount?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">R$ {tx.netAmount?.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-400">Nenhum lançamento no caixa ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ABERTURA */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-4">🔓 Abertura de Caixa</h3>
            <form onSubmit={handleOpenCaixa} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Valor Inicial em Espécie (Troco)</label>
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border p-3 font-bold text-lg outline-none dark:bg-slate-800"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowOpenModal(false)} className="rounded-xl border p-2.5 font-bold">Cancelar</button>
                <button type="submit" className="rounded-xl bg-emerald-600 px-6 p-2.5 font-bold text-white">Abrir Caixa &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SANGRIA / SUPRIMENTO */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-4">➕ Sangria / Suprimento Manual</h3>
            <form onSubmit={handleAddTx} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold">Tipo de Operação</label>
                <select value={txCategory} onChange={(e) => setTxCategory(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800">
                  <option value="SANGRIA">SANGRIA (Retirada de Dinheiro)</option>
                  <option value="SUPRIMENTO">SUPRIMENTO (Entrada de Troco)</option>
                  <option value="DESPESA">DESPESA AVULSA</option>
                </select>
              </div>
              <div>
                <label className="block font-bold">Valor (R$)</label>
                <input type="number" value={txAmount} onChange={(e) => setTxAmount(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-2.5 font-bold text-lg dark:bg-slate-800" required />
              </div>
              <div>
                <label className="block font-bold">Descrição</label>
                <input type="text" value={txDescription} onChange={(e) => setTxDescription(e.target.value)} placeholder="Ex: Compra de café pro salão..." className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800" required />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowTxModal(false)} className="rounded-xl border p-2.5 font-bold">Cancelar</button>
                <button type="submit" className="rounded-xl bg-amber-500 px-6 p-2.5 font-bold text-white">Lançar &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FECHAMENTO */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-4">🔒 Fechamento de Caixa</h3>
            <form onSubmit={handleCloseCaixa} className="space-y-4 text-xs">
              <div className="rounded-xl bg-amber-50 p-3 font-semibold text-amber-800 dark:bg-slate-800 dark:text-amber-300">
                Valor Esperado pelo Sistema: R$ {activeRegister?.expectedAmount?.toFixed(2)}
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Valor Real Apurado no Caixa (R$)</label>
                <input
                  type="number"
                  value={finalAmount}
                  onChange={(e) => setFinalAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border p-3 font-bold text-lg outline-none dark:bg-slate-800"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowCloseModal(false)} className="rounded-xl border p-2.5 font-bold">Cancelar</button>
                <button type="submit" className="rounded-xl bg-rose-600 px-6 p-2.5 font-bold text-white">Confirmar Fechamento &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
