"use client";

import { useState, useEffect } from "react";
import { Award, Star, Sparkles, Plus, Edit2, Trash2, Gift, UserCheck, X } from "lucide-react";

export default function FidelidadePage() {
  const [data, setData] = useState<any>(null);

  // Modais
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);
  const [showEditRuleModal, setShowEditRuleModal] = useState(false);
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);

  // Form Criar Regra
  const [title, setTitle] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [targetPoints, setTargetPoints] = useState(50);
  const [type, setType] = useState("VALOR_GASTO");

  // Form Editar Regra
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editRewardDesc, setEditRewardDesc] = useState("");
  const [editTargetPoints, setEditTargetPoints] = useState(50);
  const [editType, setEditType] = useState("VALOR_GASTO");

  // Form Creditar Pontos
  const [selectedClientId, setSelectedClientId] = useState("");
  const [pointsAmount, setPointsAmount] = useState(10);
  const [pointsReason, setPointsReason] = useState("Atendimento Manutenção de Gel");

  const loadData = () => {
    fetch("/api/loyalty", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        if (res.clients && res.clients.length > 0 && !selectedClientId) {
          setSelectedClientId(res.clients[0].id);
        }
      });
  };

  useEffect(() => {
    loadData();
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !rewardDescription) return;

    const res = await fetch("/api/loyalty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        rewardDescription,
        targetPoints: Number(targetPoints),
        type,
      }),
    });

    if (res.ok) {
      alert("✨ Nova regra de fidelidade criada com sucesso!");
      setShowCreateRuleModal(false);
      setTitle("");
      setRewardDescription("");
      loadData();
    } else {
      alert("Erro ao criar regra de fidelidade.");
    }
  };

  const handleOpenEditRule = (rule: any) => {
    setEditId(rule.id);
    setEditTitle(rule.title);
    setEditRewardDesc(rule.rewardDescription);
    setEditTargetPoints(rule.targetPoints);
    setEditType(rule.type || "VALOR_GASTO");
    setShowEditRuleModal(true);
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editTitle) return;

    const res = await fetch("/api/loyalty", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editId,
        title: editTitle,
        rewardDescription: editRewardDesc,
        targetPoints: Number(editTargetPoints),
        type: editType,
      }),
    });

    if (res.ok) {
      alert("✨ Regra de fidelidade atualizada com sucesso!");
      setShowEditRuleModal(false);
      loadData();
    } else {
      alert("Erro ao atualizar regra de fidelidade.");
    }
  };

  const handleDeleteRule = async (id: string, ruleTitle: string) => {
    if (!confirm(`Deseja realmente excluir a regra "${ruleTitle}"?`)) return;

    const res = await fetch(`/api/loyalty?id=${id}`, { method: "DELETE" });

    if (res.ok) {
      alert("🗑️ Regra excluída.");
      loadData();
    } else {
      alert("Erro ao excluir regra.");
    }
  };

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !pointsAmount) return;

    const res = await fetch("/api/loyalty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ADD_POINTS",
        clientId: selectedClientId,
        points: Number(pointsAmount),
        reason: pointsReason,
      }),
    });

    if (res.ok) {
      alert("✨ Pontos lançados com sucesso para a cliente!");
      setShowAddPointsModal(false);
      loadData();
    } else {
      alert("Erro ao lançar pontos.");
    }
  };

  const { rules = [], clientBalances = [], clients = [] } = data || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header da Página */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
            🏆 Programa de Fidelidade & Recompensas
          </h2>
          <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
            Configure regras de acúmulo de pontos, edite recompensas e gerencie o saldo de cada cliente.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddPointsModal(true)}
            className="flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-white/90 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-md hover:bg-white transition"
          >
            <Award className="h-4 w-4 text-amber-600" />
            <span>➕ Creditar Pontos</span>
          </button>

          <button
            onClick={() => setShowCreateRuleModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Regra</span>
          </button>
        </div>
      </div>

      {/* Regras Configuradas */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <h3 className="font-serif text-lg font-extrabold text-slate-900 dark:text-white">
            Regras de Pontuação & Benefícios ({rules.length})
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {rules.map((rule: any) => (
            <div
              key={rule.id}
              className="flex flex-col justify-between rounded-2xl border border-rose-100 bg-[#FAF3F0]/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/70"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-extrabold text-xs text-rose-800 dark:text-amber-200">
                    Regra: {rule.title}
                  </span>
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 dark:bg-amber-900 dark:text-amber-100 shrink-0">
                    🎯 Meta: {rule.targetPoints} pts
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                  {rule.rewardDescription}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-rose-200/60 pt-2 dark:border-slate-700 text-xs font-extrabold">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tipo: {rule.type === "VALOR_GASTO" ? "Por Valor Gasto" : "Por Atendimentos"}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditRule(rule)}
                    className="flex items-center space-x-1 text-amber-700 hover:text-amber-900 dark:text-amber-300 underline"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id, rule.title)}
                    className="flex items-center space-x-1 text-rose-600 hover:text-rose-800 dark:text-rose-400 underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saldo de Pontos das Clientes */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-serif text-lg font-extrabold text-[#6B1615] dark:text-amber-200">
          👑 Saldo de Pontos Acumulados das Clientes
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clientBalances.map((cli: any) => (
            <div
              key={cli.id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/60"
            >
              <div>
                <h4 className="font-serif text-sm font-extrabold text-slate-900 dark:text-white">
                  {cli.name}
                </h4>
                <p className="text-[11px] text-slate-500">{cli.phone}</p>
                <div className="mt-1.5 flex items-center space-x-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  <span className="font-extrabold text-xs text-amber-900 dark:text-amber-300">
                    {cli.totalPoints || 0} Pontos
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedClientId(cli.id);
                  setShowAddPointsModal(true);
                }}
                className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm hover:bg-amber-600 shrink-0"
              >
                ➕ Pontuar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL CRIAR REGRA */}
      {showCreateRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">✨ Criar Regra de Fidelidade</h3>
              <button onClick={() => setShowCreateRuleModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Título da Regra *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: 1 ponto a cada R$ 10,00 gastos..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Descrição do Benefício / Prêmio *</label>
                <input
                  type="text"
                  value={rewardDescription}
                  onChange={(e) => setRewardDescription(e.target.value)}
                  placeholder="Ex: Ao atingir 50 pontos, ganhe R$ 25,00 de desconto..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Meta de Pontos *</label>
                  <input
                    type="number"
                    value={targetPoints}
                    onChange={(e) => setTargetPoints(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Tipo de Acúmulo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="VALOR_GASTO">Por Valor Gasto (R$)</option>
                    <option value="ATENDIMENTOS">Por Atendimentos</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
              >
                CRIAR REGRA ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR REGRA */}
      {showEditRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">✏️ Editar Regra de Fidelidade</h3>
              <button onClick={() => setShowEditRuleModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Título da Regra *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Descrição do Benefício / Prêmio *</label>
                <input
                  type="text"
                  value={editRewardDesc}
                  onChange={(e) => setEditRewardDesc(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Meta de Pontos *</label>
                  <input
                    type="number"
                    value={editTargetPoints}
                    onChange={(e) => setEditTargetPoints(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Tipo de Acúmulo</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="VALOR_GASTO">Por Valor Gasto (R$)</option>
                    <option value="ATENDIMENTOS">Por Atendimentos</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
              >
                SALVAR ALTERAÇÕES DA REGRA ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREDITAR PONTOS */}
      {showAddPointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">➕ Creditar ou Resgatar Pontos</h3>
              <button onClick={() => setShowAddPointsModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPoints} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Selecione a Cliente *</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                >
                  {clients.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.whatsapp || c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Quantidade de Pontos (Positivo para somar, Negativo para resgate) *</label>
                <input
                  type="number"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(Number(e.target.value))}
                  placeholder="Ex: 10 para somar, ou -50 para resgatar premio"
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Motivo do Lançamento</label>
                <input
                  type="text"
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  placeholder="Ex: Atendimento Alongamento de Gel, ou Resgate Desconto R$25"
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
              >
                LANÇAR PONTOS NA CONTA DA CLIENTE 🏆
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
