"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Edit2, Trash2, UserCheck, CheckCircle2, Clock, Calendar, X } from "lucide-react";

export default function PacotesPage() {
  const [data, setData] = useState<any>(null);
  
  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Form Novo Pacote
  const [name, setName] = useState("");
  const [price, setPrice] = useState(250);
  const [totalSessions, setTotalSessions] = useState(3);
  const [validityDays, setValidityDays] = useState(90);
  const [description, setDescription] = useState("");

  // Form Editar Pacote
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState(250);
  const [editTotalSessions, setEditTotalSessions] = useState(3);
  const [editValidityDays, setEditValidityDays] = useState(90);
  const [editDescription, setEditDescription] = useState("");

  // Form Vincular a Cliente
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState("");

  const loadData = () => {
    fetch("/api/packages", { cache: "no-store" })
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

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !totalSessions) return;

    const res = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price: Number(price),
        totalSessions: Number(totalSessions),
        validityDays: Number(validityDays),
        description,
      }),
    });

    if (res.ok) {
      alert("✨ Novo pacote cadastrado com sucesso!");
      setShowCreateModal(false);
      setName("");
      setDescription("");
      loadData();
    } else {
      alert("Erro ao cadastrar pacote.");
    }
  };

  const handleOpenEdit = (pkg: any) => {
    setEditId(pkg.id);
    setEditName(pkg.name);
    setEditPrice(pkg.price);
    setEditTotalSessions(pkg.totalSessions);
    setEditValidityDays(pkg.validityDays);
    setEditDescription(pkg.description || "");
    setShowEditModal(true);
  };

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editName) return;

    const res = await fetch("/api/packages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editId,
        name: editName,
        price: Number(editPrice),
        totalSessions: Number(editTotalSessions),
        validityDays: Number(editValidityDays),
        description: editDescription,
      }),
    });

    if (res.ok) {
      alert("✨ Pacote atualizado com sucesso!");
      setShowEditModal(false);
      loadData();
    } else {
      alert("Erro ao atualizar pacote.");
    }
  };

  const handleDeletePackage = async (id: string, pkgName: string) => {
    if (!confirm(`Deseja realmente excluir o pacote "${pkgName}"?`)) return;

    const res = await fetch(`/api/packages?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("🗑️ Pacote excluído.");
      loadData();
    } else {
      alert("Erro ao excluir pacote.");
    }
  };

  const handleOpenAssign = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowAssignModal(true);
  };

  const handleAssignPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !selectedClientId) return;

    const res = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ASSIGN_TO_CLIENT",
        packageId: selectedPackage.id,
        clientId: selectedClientId,
      }),
    });

    if (res.ok) {
      alert(`✨ Pacote "${selectedPackage.name}" vinculado à cliente com sucesso!`);
      setShowAssignModal(false);
      loadData();
    } else {
      alert("Erro ao vincular pacote à cliente.");
    }
  };

  const handleUseSession = async (clientPackageId: string) => {
    const res = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "USE_SESSION",
        clientPackageId,
      }),
    });

    if (res.ok) {
      alert("✅ 1 Sessão abatida com sucesso!");
      loadData();
    } else {
      alert("Erro ao abater sessão.");
    }
  };

  const { packages = [], clientPackages = [], clients = [] } = data || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
            📦 Pacotes & Planos de Sessões
          </h2>
          <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
            Venda pacotes recorrentes de manutenções, edite valores e acompanhe o uso de sessões das clientes.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Pacote</span>
        </button>
      </div>

      {/* Grid de Pacotes Cadastrados */}
      <div>
        <h3 className="font-serif text-lg font-extrabold text-slate-900 dark:text-white mb-3">
          Tabela de Pacotes do Salão ({packages.length})
        </h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg: any) => (
            <div
              key={pkg.id}
              className="flex flex-col justify-between rounded-3xl border border-rose-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between border-b pb-3 border-rose-100 dark:border-slate-800">
                  <h4 className="font-serif text-base font-extrabold text-slate-900 dark:text-white">{pkg.name}</h4>
                  <span className="font-serif text-lg font-extrabold text-rose-600 dark:text-rose-400">
                    R$ {pkg.price?.toFixed(2)}
                  </span>
                </div>
                {pkg.description && <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300">{pkg.description}</p>}
                
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 bg-rose-50/50 p-2.5 rounded-xl dark:bg-slate-800/60">
                  <span>✨ {pkg.totalSessions} Sessões</span>
                  <span>⏳ Validade: {pkg.validityDays} dias</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-xs font-extrabold">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="flex items-center space-x-1 text-amber-700 hover:text-amber-900 dark:text-amber-300 underline"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                    className="flex items-center space-x-1 text-rose-600 hover:text-rose-800 dark:text-rose-400 underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>

                <button
                  onClick={() => handleOpenAssign(pkg)}
                  className="rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-3 py-1.5 font-extrabold text-white shadow-sm hover:opacity-95"
                >
                  🤝 Vincular a Cliente
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Pacotes Ativos das Clientes */}
      <div className="mt-8">
        <h3 className="font-serif text-lg font-extrabold text-[#6B1615] dark:text-amber-200 mb-3">
          📋 Pacotes Ativos Vendidos para Clientes ({clientPackages.length})
        </h3>

        {clientPackages.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clientPackages.map((cp: any) => {
              const clientObj = clients.find((c: any) => c.id === cp.clientId);
              const pkgObj = packages.find((p: any) => p.id === cp.packageId);
              const remaining = cp.totalSessions - cp.sessionsUsed;

              return (
                <div
                  key={cp.id}
                  className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 dark:border-slate-800">
                      <span className="font-extrabold text-xs text-amber-900 dark:text-amber-300">
                        👤 {clientObj?.name || "Cliente"}
                      </span>
                      <span className="rounded-md bg-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                        {cp.sessionsUsed}/{cp.totalSessions} Usadas
                      </span>
                    </div>

                    <p className="mt-2 font-serif text-sm font-extrabold text-slate-900 dark:text-white">
                      {pkgObj?.name || "Pacote de Sessões"}
                    </p>

                    <p className="mt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Validade até: {new Date(cp.expiryDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-amber-200/60 pt-2 dark:border-slate-800">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {remaining > 0 ? `Restam ${remaining} sessões` : "Pacote Concluído"}
                    </span>

                    {remaining > 0 && (
                      <button
                        onClick={() => handleUseSession(cp.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-extrabold text-white shadow-sm hover:bg-emerald-700"
                      >
                        ⚡ Abater 1 Sessão
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs font-bold text-slate-500">
            Nenhum pacote vinculado a cliente ainda. Clique em "🤝 Vincular a Cliente" em qualquer pacote acima para associar!
          </div>
        )}
      </div>

      {/* MODAL CRIAR PACOTE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">✨ Criar Novo Pacote</h3>
              <button onClick={() => setShowCreateModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Nome do Pacote *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Combo Club 3 Manutenções em Fibra..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Inclui cutilagem e troca de decoração..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Total Sessões *</label>
                  <input
                    type="number"
                    value={totalSessions}
                    onChange={(e) => setTotalSessions(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Validade (Dias)</label>
                  <input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
              >
                CRIAR PACOTE ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PACOTE */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">✏️ Editar Pacote</h3>
              <button onClick={() => setShowEditModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePackage} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Nome do Pacote *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Descrição</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Total Sessões *</label>
                  <input
                    type="number"
                    value={editTotalSessions}
                    onChange={(e) => setEditTotalSessions(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Validade (Dias)</label>
                  <input
                    type="number"
                    value={editValidityDays}
                    onChange={(e) => setEditValidityDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
              >
                SALVAR ALTERAÇÕES DO PACOTE ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VINCULAR PACOTE A CLIENTE */}
      {showAssignModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                🤝 Vincular "{selectedPackage.name}"
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignPackage} className="space-y-3.5 text-xs">
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

              <div className="rounded-2xl bg-amber-50 p-3 text-amber-900 dark:bg-slate-800 dark:text-amber-300 font-semibold space-y-1">
                <p>✨ Total de Sessões: <strong>{selectedPackage.totalSessions} sessões</strong></p>
                <p>⏳ Validade: <strong>{selectedPackage.validityDays} dias</strong> a partir de hoje</p>
                <p>💰 Valor Total: <strong>R$ {selectedPackage.price?.toFixed(2)}</strong></p>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
              >
                CONFIRMAR VÍNCULO DO PACOTE 🤝
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
