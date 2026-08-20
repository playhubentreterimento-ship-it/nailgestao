"use client";

import { useState, useEffect } from "react";
import { Receipt, DollarSign, ArrowUpRight, ArrowDownLeft, Lock, Unlock, Plus, AlertCircle, FileText } from "lucide-react";

export default function CaixaPage() {
  const [data, setData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedHistoryReg, setSelectedHistoryReg] = useState<any>(null);
  const [historyFilterDate, setHistoryFilterDate] = useState<string>("");

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
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((res) => {
        if (res.authenticated && res.user) {
          setCurrentUser(res.user);
          const role = res.user.role;
          if (role === "RECEPÇÃO" || role === "RECEPCAO") {
            window.location.href = "/agenda";
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    const openedName = currentUser?.name || "Selma Gloor";
    const res = await fetch("/api/cash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "OPEN",
        initialAmount,
        openedByName: openedName,
      }),
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
    const closedName = currentUser?.name || "Selma Gloor";
    const res = await fetch("/api/cash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CLOSE",
        finalAmount,
        closedByName: closedName,
      }),
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
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Responsável: {activeRegister.openedByName || activeRegister.openedByUserId || currentUser?.name || "Selma Gloor"}
                </p>
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
            <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800 border border-emerald-100 dark:border-slate-700">
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">VALOR INICIAL</span>
              <p className="font-serif font-extrabold text-slate-900 dark:text-white">R$ {activeRegister.initialAmount?.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800 border border-emerald-100 dark:border-slate-700">
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">TOTAL DE TRANSAÇÕES</span>
              <p className="font-serif font-extrabold text-slate-900 dark:text-white">{activeRegister.transactions?.length || 0} lançamentos</p>
            </div>
            <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 col-span-2">
              <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">📊 CAIXA UNIFICADO DO SALÃO</span>
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                Entradas de todas as profissionais consolidadas no caixa central!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800 dark:border-slate-800 dark:bg-slate-900 dark:text-amber-300">
          ⚠️ O caixa encontra-se fechado neste momento. Clique em "Abrir Caixa Agora" para iniciar os lançamentos.
        </div>
      )}

      {/* ==================== HISTÓRICO DE FECHAMENTOS DE CAIXA (TODOS OS DIAS) ==================== */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📜</span> Histórico de Fechamento de Caixas (Todos os Dias)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Consulte os fechamentos anteriores com valores por forma de pagamento (PIX, Cartão, Dinheiro), sangrias e auditoria completa.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Filtrar Data:</span>
            <input
              type="date"
              value={historyFilterDate}
              onChange={(e) => setHistoryFilterDate(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6B1615] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {historyFilterDate && (
              <button
                onClick={() => setHistoryFilterDate("")}
                className="rounded-lg bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Lista dos Fechamentos */}
        {!history || history.length === 0 ? (
          <div className="py-8 text-center text-xs font-medium text-slate-400">
            Nenhum histórico de caixa fechado registrado até o momento.
          </div>
        ) : (
          <div className="space-y-4">
            {history
              .filter((reg: any) => {
                if (!historyFilterDate) return true;
                const regDateStr = new Date(reg.openedAt).toISOString().split("T")[0];
                return regDateStr === historyFilterDate;
              })
              .map((reg: any) => {
                const openedDate = new Date(reg.openedAt);
                const closedDate = reg.closedAt ? new Date(reg.closedAt) : null;
                const formattedDate = openedDate.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });

                const txs = reg.transactions || [];
                const pixTotal = txs.filter((t: any) => t.paymentMethod === "PIX").reduce((acc: number, t: any) => acc + (t.netAmount || t.amount || 0), 0);
                const creditTotal = txs.filter((t: any) => t.paymentMethod === "CREDITO").reduce((acc: number, t: any) => acc + (t.netAmount || t.amount || 0), 0);
                const debitTotal = txs.filter((t: any) => t.paymentMethod === "DEBITO").reduce((acc: number, t: any) => acc + (t.netAmount || t.amount || 0), 0);
                const cashTotal = txs.filter((t: any) => t.paymentMethod === "DINHEIRO").reduce((acc: number, t: any) => acc + (t.netAmount || t.amount || 0), 0);
                const sangriaTotal = txs.filter((t: any) => t.type === "SANGRIA" || t.category === "SANGRIA" || t.category === "DESPESA").reduce((acc: number, t: any) => acc + (t.amount || 0), 0);

                const diff = reg.difference || 0;

                return (
                  <div
                    key={reg.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-2xs hover:border-amber-300 transition-all dark:border-slate-800 dark:bg-slate-800/60 space-y-4"
                  >
                    {/* Cabeçalho do Card do Caixa Passado */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-serif text-base font-bold text-slate-900 dark:text-white capitalize">
                            📅 {formattedDate}
                          </span>
                          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                            🔒 CAIXA FECHADO
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Aberto às {openedDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} por <strong className="text-slate-700 dark:text-slate-300">{reg.openedByName || "Selma Gloor"}</strong>
                          {closedDate && (
                            <> &bull; Fechado às {closedDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} por <strong className="text-slate-700 dark:text-slate-300">{reg.closedByName || "Selma Gloor"}</strong></>
                          )}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedHistoryReg(reg)}
                        className="self-start sm:self-auto flex items-center space-x-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 shadow-2xs hover:bg-amber-100 dark:bg-slate-800 dark:text-amber-200"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Ver Extrato & Auditar Dia ({txs.length})</span>
                      </button>
                    </div>

                    {/* Formas de Pagamento Separadas */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-bold">
                      <div className="rounded-xl bg-emerald-50/90 border border-emerald-200 p-2.5 dark:bg-emerald-950/40 dark:border-emerald-800">
                        <span className="block text-[10px] text-emerald-800 dark:text-emerald-300 uppercase">🟢 PIX Total</span>
                        <span className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">R$ {pixTotal.toFixed(2)}</span>
                      </div>

                      <div className="rounded-xl bg-blue-50/90 border border-blue-200 p-2.5 dark:bg-blue-950/40 dark:border-blue-800">
                        <span className="block text-[10px] text-blue-800 dark:text-blue-300 uppercase">💳 Crédito</span>
                        <span className="text-sm font-extrabold text-blue-900 dark:text-blue-200">R$ {creditTotal.toFixed(2)}</span>
                      </div>

                      <div className="rounded-xl bg-cyan-50/90 border border-cyan-200 p-2.5 dark:bg-cyan-950/40 dark:border-cyan-800">
                        <span className="block text-[10px] text-cyan-800 dark:text-cyan-300 uppercase">💳 Débito</span>
                        <span className="text-sm font-extrabold text-cyan-900 dark:text-cyan-200">R$ {debitTotal.toFixed(2)}</span>
                      </div>

                      <div className="rounded-xl bg-amber-50/90 border border-amber-200 p-2.5 dark:bg-amber-950/40 dark:border-amber-800">
                        <span className="block text-[10px] text-amber-800 dark:text-amber-300 uppercase">💵 Dinheiro</span>
                        <span className="text-sm font-extrabold text-amber-900 dark:text-amber-200">R$ {cashTotal.toFixed(2)}</span>
                      </div>

                      <div className="rounded-xl bg-rose-50/90 border border-rose-200 p-2.5 dark:bg-rose-950/40 dark:border-rose-800 col-span-2 sm:col-span-1">
                        <span className="block text-[10px] text-rose-800 dark:text-rose-300 uppercase">🔻 Sangrias / Retiradas</span>
                        <span className="text-sm font-extrabold text-rose-900 dark:text-rose-200">R$ {sangriaTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Resumo Consolidado do Fechamento */}
                    <div className="flex flex-wrap items-center justify-between rounded-xl bg-white p-3 border border-slate-200 text-xs dark:bg-slate-900 dark:border-slate-800 gap-3">
                      <div>
                        <span className="text-slate-500 font-semibold">Valor Inicial em Troco: </span>
                        <strong className="text-slate-800 dark:text-slate-200">R$ {reg.initialAmount?.toFixed(2)}</strong>
                      </div>

                      <div>
                        <span className="text-slate-500 font-semibold">Esperado em Sistema: </span>
                        <strong className="text-slate-800 dark:text-slate-200">R$ {reg.expectedAmount?.toFixed(2)}</strong>
                      </div>

                      <div>
                        <span className="text-slate-500 font-semibold">Fechamento Real Apurado: </span>
                        <strong className="text-slate-900 dark:text-white font-extrabold">R$ {reg.finalAmount?.toFixed(2)}</strong>
                      </div>

                      <div className="flex items-center space-x-1 font-bold">
                        <span className="text-slate-500">Diferença: </span>
                        <span className={`px-2 py-0.5 rounded-md text-xs ${diff === 0 ? 'bg-emerald-100 text-emerald-800' : diff > 0 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                          {diff === 0 ? "✓ R$ 0.00 (Exato)" : diff > 0 ? `+ R$ ${diff.toFixed(2)} (Sobra)` : `- R$ ${Math.abs(diff).toFixed(2)} (Falta)`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
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

      {/* MODAL DE AUDITORIA E EXTRATO DO DIA FECHADO */}
      {selectedHistoryReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📜</span> Extrato Detalhado do Caixa &mdash; {new Date(selectedHistoryReg.openedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </h3>
                <p className="text-xs text-slate-500">
                  Responsável pela Abertura: <strong>{selectedHistoryReg.openedByName || "Selma Gloor"}</strong> | Fechamento: <strong>{selectedHistoryReg.closedByName || "Selma Gloor"}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedHistoryReg(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Tabela de Lançamentos do Dia Fechado */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                  <tr>
                    <th className="px-3 py-2.5">Horário</th>
                    <th className="px-3 py-2.5">Tipo</th>
                    <th className="px-3 py-2.5">Categoria</th>
                    <th className="px-3 py-2.5">Descrição</th>
                    <th className="px-3 py-2.5">Forma Pgto</th>
                    <th className="px-3 py-2.5 text-right">Bruto</th>
                    <th className="px-3 py-2.5 text-right">Taxa</th>
                    <th className="px-3 py-2.5 text-right">Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedHistoryReg.transactions && selectedHistoryReg.transactions.length > 0 ? (
                    selectedHistoryReg.transactions.map((tx: any) => (
                      <tr key={tx.id}>
                        <td className="px-3 py-2 font-semibold">{new Date(tx.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${tx.type === "ENTRADA" || tx.type === "SUPRIMENTO" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium">{tx.category}</td>
                        <td className="px-3 py-2">{tx.description}</td>
                        <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200">{tx.paymentMethod}</td>
                        <td className="px-3 py-2 text-right font-bold">R$ {tx.amount?.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-rose-500">R$ {tx.feeAmount?.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-600">R$ {tx.netAmount?.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-slate-400">Nenhum lançamento registrado neste fechamento de caixa.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedHistoryReg(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Fechar Auditoria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
