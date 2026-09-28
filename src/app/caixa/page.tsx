"use client";

import { useState, useEffect } from "react";
import {
  Receipt,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Unlock,
  Plus,
  AlertCircle,
  FileText,
  Calendar,
  Search,
  Printer,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  CreditCard,
  QrCode,
  Banknote,
  Filter,
  Eye,
  TrendingUp,
  TrendingDown
} from "lucide-react";

export default function CaixaPage() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"today" | "report">("today");

  // Modais de Ação
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedRegisterDetails, setSelectedRegisterDetails] = useState<any>(null);

  // Form states do Caixa Ativo
  const [initialAmount, setInitialAmount] = useState(200);
  const [txCategory, setTxCategory] = useState("SANGRIA");
  const [txAmount, setTxAmount] = useState(50);
  const [txMethod, setTxMethod] = useState("DINHEIRO");
  const [txDescription, setTxDescription] = useState("");
  const [finalAmount, setFinalAmount] = useState(0);

  // Filtros do Relatório de Caixas Fechados
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [diffFilter, setDiffFilter] = useState<"ALL" | "WITH_DIFF" | "EXACT">("ALL");

  const loadCaixa = () => {
    fetch("/api/cash")
      .then((r) => r.json())
      .then((res) => setData(res && typeof res === "object" ? res : {}))
      .catch(() => setData({}));
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
  const closedRegisters: any[] = history || [];

  // Filtragem dos caixas fechados no relatório
  const filteredClosedRegisters = closedRegisters.filter((reg) => {
    if (!reg.openedAt) return false;
    const regDateStr = new Date(reg.openedAt).toISOString().split("T")[0];

    if (startDate && regDateStr < startDate) return false;
    if (endDate && regDateStr > endDate) return false;

    if (diffFilter === "WITH_DIFF" && Math.abs(reg.difference || 0) < 0.01) return false;
    if (diffFilter === "EXACT" && Math.abs(reg.difference || 0) >= 0.01) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const dateFormatted = new Date(reg.openedAt).toLocaleDateString("pt-BR");
      const notes = (reg.notes || "").toLowerCase();
      const id = reg.id.toLowerCase();
      if (!dateFormatted.includes(q) && !notes.includes(q) && !id.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Cálculo de Métricas Consolidadas do Período Filtrado
  const reportTotals = filteredClosedRegisters.reduce(
    (acc, reg) => {
      acc.count += 1;
      acc.initialTotal += reg.initialAmount || 0;
      acc.expectedTotal += reg.expectedAmount || 0;
      acc.finalTotal += reg.finalAmount || 0;
      acc.diffTotal += reg.difference || 0;
      acc.entradasBruto += reg.totalEntradasBruto || 0;
      acc.entradasLiquido += reg.totalEntradasLiquido || 0;
      acc.taxas += reg.totalTaxas || 0;
      acc.sangrias += reg.totalSangrias || 0;
      acc.suprimentos += reg.totalSuprimentos || 0;

      acc.dinheiro += reg.byPaymentMethod?.DINHEIRO || 0;
      acc.pix += reg.byPaymentMethod?.PIX || 0;
      acc.credito += reg.byPaymentMethod?.CREDITO || 0;
      acc.debito += reg.byPaymentMethod?.DEBITO || 0;
      acc.outro += reg.byPaymentMethod?.OUTRO || 0;

      return acc;
    },
    {
      count: 0,
      initialTotal: 0,
      expectedTotal: 0,
      finalTotal: 0,
      diffTotal: 0,
      entradasBruto: 0,
      entradasLiquido: 0,
      taxas: 0,
      sangrias: 0,
      suprimentos: 0,
      dinheiro: 0,
      pix: 0,
      credito: 0,
      debito: 0,
      outro: 0,
    }
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Cabeçalho Principal */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl flex items-center gap-2">
            <Receipt className="h-7 w-7 text-rose-600" />
            Caixa & Controle Diário
          </h2>
          <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold mt-1">
            Gestão financeira de caixa ativo, sangrias, conferência por forma de pagamento e relatórios de fechamento por data.
          </p>
        </div>

        {/* Botões de Ação do Caixa Ativo */}
        <div className="flex items-center space-x-3">
          {activeRegister ? (
            <>
              <button
                onClick={() => setShowTxModal(true)}
                className="flex items-center space-x-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-600 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Sangria / Suprimento</span>
              </button>
              <button
                onClick={() => {
                  setFinalAmount(activeRegister.expectedAmount || 0);
                  setShowCloseModal(true);
                }}
                className="flex items-center space-x-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition"
              >
                <Lock className="h-4 w-4" />
                <span>Fechar Caixa do Dia</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowOpenModal(true)}
              className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
            >
              <Unlock className="h-4 w-4" />
              <span>Abrir Caixa Agora</span>
            </button>
          )}
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-rose-200/80 dark:border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab("today")}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "today"
              ? "border-rose-600 text-rose-700 dark:text-rose-400 dark:border-rose-400 bg-rose-50/50 dark:bg-slate-800/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <Unlock className="h-4 w-4" />
          <span>🟢 Caixa do Dia (Ativo)</span>
          {activeRegister && (
            <span className="ml-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
              ABERTO
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("report")}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "report"
              ? "border-rose-600 text-rose-700 dark:text-rose-400 dark:border-rose-400 bg-rose-50/50 dark:bg-slate-800/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>📊 Relatório de Caixas Fechados ({closedRegisters.length})</span>
        </button>
      </div>

      {/* ==================== ABA 1: CAIXA DO DIA (ATIVO) ==================== */}
      {activeTab === "today" && (
        <div className="space-y-6">
          {/* Status Card do Caixa Ativo */}
          {activeRegister ? (
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/90 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/80 pb-4 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold shadow-md text-xl">
                    🔓
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Caixa Aberto — {new Date(activeRegister.openedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Abertura em: {new Date(activeRegister.openedAt).toLocaleDateString("pt-BR")} • Responsável: Selma Gloor
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right bg-white dark:bg-slate-800 p-3 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-xs">
                  <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">SALDO ESPERADO NO CAIXA</span>
                  <p className="font-serif text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    R$ {(activeRegister.expectedAmount || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
                <div className="rounded-2xl bg-white p-3 shadow-xs dark:bg-slate-800 border border-emerald-100 dark:border-slate-700">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase">Fundo Inicial</span>
                  <p className="font-serif font-black text-slate-900 dark:text-white text-base mt-0.5">R$ {(activeRegister.initialAmount || 0).toFixed(2)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-xs dark:bg-slate-800 border border-emerald-100 dark:border-slate-700">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase">Entradas Líquidas</span>
                  <p className="font-serif font-black text-emerald-600 dark:text-emerald-400 text-base mt-0.5">R$ {(activeRegister.totalEntradasLiquido || 0).toFixed(2)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-xs dark:bg-slate-800 border border-emerald-100 dark:border-slate-700">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase">Sangrias (Retiradas)</span>
                  <p className="font-serif font-black text-rose-600 dark:text-rose-400 text-base mt-0.5">R$ {(activeRegister.totalSangrias || 0).toFixed(2)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-xs dark:bg-slate-800 border border-emerald-100 dark:border-slate-700">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase">Total Transações</span>
                  <p className="font-serif font-black text-slate-900 dark:text-white text-base mt-0.5">{activeRegister.transactions?.length || 0} lançamento(s)</p>
                </div>
                <div className="rounded-2xl bg-emerald-600 p-3 shadow-xs text-white col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-100">Caixa Unificado</span>
                  <p className="text-[11px] font-bold mt-0.5 leading-tight">Consolidando entradas de todas as profissionais</p>
                </div>
              </div>

              {/* Detalhamento de Entradas por Forma de Pagamento no Caixa Ativo */}
              {activeRegister.byPaymentMethod && (
                <div className="mt-4 pt-3 border-t border-emerald-200/70 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800 px-3 py-2 rounded-xl border border-emerald-100 dark:border-slate-700">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Banknote className="h-3.5 w-3.5 text-emerald-600" /> Dinheiro:</span>
                    <span className="font-bold text-slate-900 dark:text-white">R$ {(activeRegister.byPaymentMethod.DINHEIRO || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800 px-3 py-2 rounded-xl border border-emerald-100 dark:border-slate-700">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><QrCode className="h-3.5 w-3.5 text-teal-600" /> PIX:</span>
                    <span className="font-bold text-slate-900 dark:text-white">R$ {(activeRegister.byPaymentMethod.PIX || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800 px-3 py-2 rounded-xl border border-emerald-100 dark:border-slate-700">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-blue-600" /> Débito:</span>
                    <span className="font-bold text-slate-900 dark:text-white">R$ {(activeRegister.byPaymentMethod.DEBITO || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800 px-3 py-2 rounded-xl border border-emerald-100 dark:border-slate-700">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-purple-600" /> Crédito:</span>
                    <span className="font-bold text-slate-900 dark:text-white">R$ {(activeRegister.byPaymentMethod.CREDITO || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-amber-200 bg-amber-50/90 p-8 text-center text-amber-900 dark:border-slate-800 dark:bg-slate-900 dark:text-amber-300 shadow-sm space-y-3">
              <div className="text-3xl">🔒</div>
              <h3 className="font-serif text-lg font-bold">O caixa encontra-se FECHADO neste momento.</h3>
              <p className="text-xs text-amber-800 dark:text-amber-400 max-w-md mx-auto font-medium">
                Clique no botão abaixo para abrir o caixa do dia e começar a registrar as movimentações e atendimentos.
              </p>
              <button
                onClick={() => setShowOpenModal(true)}
                className="mt-2 inline-flex items-center space-x-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                <Unlock className="h-4 w-4" />
                <span>Abrir Caixa Agora</span>
              </button>
            </div>
          )}

          {/* Extrato de Lançamentos do Dia */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-rose-600" />
              Lançamentos e Movimentações do Dia
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:bg-slate-800">
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
                      <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-semibold">{new Date(tx.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${tx.type === "ENTRADA" || tx.type === "SUPRIMENTO" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{tx.category}</td>
                        <td className="px-4 py-3">{tx.description}</td>
                        <td className="px-4 py-3 font-extrabold text-slate-800 dark:text-slate-200">{tx.paymentMethod}</td>
                        <td className="px-4 py-3 text-right font-bold">R$ {(tx.amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-rose-500 font-semibold">R$ {(tx.feeAmount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">R$ {(tx.netAmount || tx.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-medium">Nenhum lançamento registrado no caixa atual até o momento.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ABA 2: RELATÓRIO DE CAIXAS FECHADOS (POR DATA) ==================== */}
      {activeTab === "report" && (
        <div className="space-y-6">
          {/* Painel de Filtros */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="h-4 w-4 text-rose-600" />
                Filtros do Relatório de Fechamentos
              </h3>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                {filteredClosedRegisters.length} caixa(s) fechado(s) encontrado(s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold outline-none dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Data Final</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold outline-none dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pesquisar por Texto / Data</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ex: 26/09/2026, nota..."
                    className="w-full rounded-xl border border-slate-200 pl-9 p-2.5 font-semibold outline-none dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Filtro de Diferença</label>
                <select
                  value={diffFilter}
                  onChange={(e: any) => setDiffFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold outline-none dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="ALL">Todos os Fechamentos</option>
                  <option value="WITH_DIFF">Apenas com Diferença (Falta/Sobra)</option>
                  <option value="EXACT">Apenas Caixas 100% Exatos (R$ 0,00)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards de Resumo Consolidado do Período Filtrado */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 text-xs">
            <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 dark:bg-slate-800 dark:border-slate-700">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">Qtd Fechamentos</span>
              <p className="font-serif text-xl font-black text-slate-900 dark:text-white mt-1">
                {reportTotals.count} dia(s)
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:bg-slate-800 dark:border-slate-700">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">Total Entradas Líquidas</span>
              <p className="font-serif text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                R$ {reportTotals.entradasLiquido.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 dark:bg-slate-800 dark:border-slate-700">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">💵 Dinheiro (Espécie)</span>
              <p className="font-serif text-lg font-black text-emerald-800 dark:text-emerald-200 mt-1">
                R$ {reportTotals.dinheiro.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4 dark:bg-slate-800 dark:border-slate-700">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">⚡ PIX Consolidado</span>
              <p className="font-serif text-lg font-black text-teal-800 dark:text-teal-200 mt-1">
                R$ {reportTotals.pix.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 dark:bg-slate-800 dark:border-slate-700">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">💳 Cartões (Déb+Créd)</span>
              <p className="font-serif text-lg font-black text-blue-800 dark:text-blue-200 mt-1">
                R$ {(reportTotals.debito + reportTotals.credito).toFixed(2)}
              </p>
            </div>

            <div className={`rounded-2xl border p-4 ${reportTotals.diffTotal < -0.01 ? "border-rose-200 bg-rose-100/70 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200" : "border-amber-100 bg-amber-50/60 dark:bg-slate-800"}`}>
              <span className="text-[10px] font-extrabold uppercase opacity-80">Diferença Acumulada</span>
              <p className={`font-serif text-lg font-black mt-1 ${reportTotals.diffTotal < -0.01 ? "text-rose-700 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                R$ {reportTotals.diffTotal.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Tabela Detalhada de Fechamentos de Caixa */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3">Data & Período</th>
                    <th className="px-4 py-3 text-right">Fundo Inicial</th>
                    <th className="px-4 py-3 text-center">Formas de Pagamento (Entradas)</th>
                    <th className="px-4 py-3 text-right">Total Líquido</th>
                    <th className="px-4 py-3 text-right">Sangrias</th>
                    <th className="px-4 py-3 text-right">Saldo Esperado</th>
                    <th className="px-4 py-3 text-right">Real Apurado</th>
                    <th className="px-4 py-3 text-right">Diferença</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredClosedRegisters.length > 0 ? (
                    filteredClosedRegisters.map((reg) => {
                      const openDateFormatted = new Date(reg.openedAt).toLocaleDateString("pt-BR");
                      const openTimeStr = new Date(reg.openedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                      const closeTimeStr = reg.closedAt
                        ? new Date(reg.closedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                        : "--:--";

                      const diff = reg.difference || 0;
                      const hasDiff = Math.abs(diff) >= 0.01;

                      return (
                        <tr key={reg.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            <div>{openDateFormatted}</div>
                            <div className="text-[10px] font-semibold text-slate-400">
                              {openTimeStr} às {closeTimeStr}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">
                            R$ {(reg.initialAmount || 0).toFixed(2)}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex flex-wrap gap-1 justify-center text-[10px]">
                              {reg.byPaymentMethod?.DINHEIRO > 0 && (
                                <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800 border border-emerald-200 dark:bg-slate-800 dark:text-emerald-300 dark:border-slate-700">
                                  💵 R$ {reg.byPaymentMethod.DINHEIRO.toFixed(2)}
                                </span>
                              )}
                              {reg.byPaymentMethod?.PIX > 0 && (
                                <span className="rounded-md bg-teal-50 px-2 py-0.5 font-bold text-teal-800 border border-teal-200 dark:bg-slate-800 dark:text-teal-300 dark:border-slate-700">
                                  ⚡ R$ {reg.byPaymentMethod.PIX.toFixed(2)}
                                </span>
                              )}
                              {reg.byPaymentMethod?.DEBITO > 0 && (
                                <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-800 border border-blue-200 dark:bg-slate-800 dark:text-blue-300 dark:border-slate-700">
                                  💳 Déb R$ {reg.byPaymentMethod.DEBITO.toFixed(2)}
                                </span>
                              )}
                              {reg.byPaymentMethod?.CREDITO > 0 && (
                                <span className="rounded-md bg-purple-50 px-2 py-0.5 font-bold text-purple-800 border border-purple-200 dark:bg-slate-800 dark:text-purple-300 dark:border-slate-700">
                                  💳 Créd R$ {reg.byPaymentMethod.CREDITO.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                            R$ {(reg.totalEntradasLiquido || 0).toFixed(2)}
                          </td>

                          <td className="px-4 py-3 text-right font-bold text-rose-500">
                            R$ {(reg.totalSangrias || 0).toFixed(2)}
                          </td>

                          <td className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">
                            R$ {(reg.expectedAmount || 0).toFixed(2)}
                          </td>

                          <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white">
                            R$ {(reg.finalAmount || 0).toFixed(2)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                              hasDiff
                                ? diff < 0
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}>
                              R$ {diff.toFixed(2)}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setSelectedRegisterDetails(reg)}
                              className="inline-flex items-center space-x-1 rounded-xl bg-slate-100 px-3 py-1.5 font-bold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
                            >
                              <Eye className="h-3.5 w-3.5 text-rose-600" />
                              <span>Ver Lançamentos</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-400 font-medium">
                        Nenhum fechamento de caixa encontrado para o período selecionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE COMPROVANTE & AUDITORIA ==================== */}
      {selectedRegisterDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho do Comprovante */}
            <div className="flex justify-between items-start border-b pb-4 border-rose-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-widest">
                  Comprovante Oficial de Fechamento de Caixa
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Selma Gloor Nails Studio
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Abertura: {new Date(selectedRegisterDetails.openedAt).toLocaleDateString("pt-BR")} às {new Date(selectedRegisterDetails.openedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  {selectedRegisterDetails.closedAt && (
                    <span> • Fechamento: {new Date(selectedRegisterDetails.closedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 transition dark:bg-slate-100 dark:text-slate-900"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Imprimir Comprovante</span>
                </button>
                <button
                  onClick={() => setSelectedRegisterDetails(null)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Resumo Financeiro do Fechamento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">Fundo Inicial</span>
                <p className="font-serif font-black text-slate-900 dark:text-white text-base mt-0.5">
                  R$ {(selectedRegisterDetails.initialAmount || 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3.5 dark:bg-slate-800">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">Entradas Líquidas</span>
                <p className="font-serif font-black text-emerald-700 dark:text-emerald-300 text-base mt-0.5">
                  R$ {(selectedRegisterDetails.totalEntradasLiquido || 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">Saldo Esperado</span>
                <p className="font-serif font-black text-slate-900 dark:text-white text-base mt-0.5">
                  R$ {(selectedRegisterDetails.expectedAmount || 0).toFixed(2)}
                </p>
              </div>
              <div className={`rounded-2xl p-3.5 ${Math.abs(selectedRegisterDetails.difference || 0) >= 0.01 ? "bg-rose-50 dark:bg-slate-800" : "bg-emerald-50 dark:bg-slate-800"}`}>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">Real Apurado (Diferença)</span>
                <p className="font-serif font-black text-slate-900 dark:text-white text-base mt-0.5">
                  R$ {(selectedRegisterDetails.finalAmount || 0).toFixed(2)}
                  <span className={`ml-1 text-xs font-extrabold ${selectedRegisterDetails.difference < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    ({(selectedRegisterDetails.difference || 0) >= 0 ? "+" : ""}R$ {(selectedRegisterDetails.difference || 0).toFixed(2)})
                  </span>
                </p>
              </div>
            </div>

            {/* Formas de Pagamento no Caixa */}
            {selectedRegisterDetails.byPaymentMethod && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50 text-xs space-y-2">
                <h4 className="font-serif font-bold text-slate-900 dark:text-white text-xs">
                  Detalhamento por Meio de Pagamento
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500">💵 DINHEIRO</span>
                    <p className="font-bold text-slate-900 dark:text-white">R$ {(selectedRegisterDetails.byPaymentMethod.DINHEIRO || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500">⚡ PIX</span>
                    <p className="font-bold text-slate-900 dark:text-white">R$ {(selectedRegisterDetails.byPaymentMethod.PIX || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500">💳 DÉBITO</span>
                    <p className="font-bold text-slate-900 dark:text-white">R$ {(selectedRegisterDetails.byPaymentMethod.DEBITO || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500">💳 CRÉDITO</span>
                    <p className="font-bold text-slate-900 dark:text-white">R$ {(selectedRegisterDetails.byPaymentMethod.CREDITO || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabela de Transações Individuais */}
            <div>
              <h4 className="font-serif font-bold text-slate-900 dark:text-white text-xs mb-2">
                Lançamentos Integrantes deste Fechamento ({selectedRegisterDetails.transactions?.length || 0})
              </h4>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[10px] font-extrabold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-3 py-2.5">Horário</th>
                      <th className="px-3 py-2.5">Tipo</th>
                      <th className="px-3 py-2.5">Categoria</th>
                      <th className="px-3 py-2.5">Descrição</th>
                      <th className="px-3 py-2.5">Forma Pgto</th>
                      <th className="px-3 py-2.5 text-right">Valor Líquido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedRegisterDetails.transactions && selectedRegisterDetails.transactions.length > 0 ? (
                      selectedRegisterDetails.transactions.map((tx: any) => (
                        <tr key={tx.id}>
                          <td className="px-3 py-2 font-semibold">{new Date(tx.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="px-3 py-2 font-bold">{tx.type}</td>
                          <td className="px-3 py-2">{tx.category}</td>
                          <td className="px-3 py-2">{tx.description}</td>
                          <td className="px-3 py-2 font-bold">{tx.paymentMethod}</td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-600">R$ {(tx.netAmount || tx.amount || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-center text-slate-400">Nenhuma movimentação avulsa registrada.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ABERTURA */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-4">🔓 Abertura de Caixa</h3>
            <form onSubmit={handleOpenCaixa} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Valor Inicial em Espécie (Fundo de Troco)</label>
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
                Valor Esperado pelo Sistema: R$ {(activeRegister?.expectedAmount || 0).toFixed(2)}
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
