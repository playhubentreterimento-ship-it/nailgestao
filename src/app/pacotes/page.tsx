"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Edit2, Trash2, UserCheck, CheckCircle2, Clock, Calendar, X, Sparkles, Percent, DollarSign, Tag, ArrowRight } from "lucide-react";

export default function PacotesPage() {
  const [data, setData] = useState<any>(null);
  
  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Form Novo Pacote
  const [name, setName] = useState("");
  const [price, setPrice] = useState(250);
  const [discountType, setDiscountType] = useState<"PERCENT" | "VALUE">("VALUE");
  const [discountValue, setDiscountValue] = useState(20);
  const [totalSessions, setTotalSessions] = useState(3);
  const [validityDays, setValidityDays] = useState(90);
  const [description, setDescription] = useState("");
  const [sessionServices, setSessionServices] = useState<any[]>([]);

  // Form Editar Pacote
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState(250);
  const [editDiscountType, setEditDiscountType] = useState<"PERCENT" | "VALUE">("VALUE");
  const [editDiscountValue, setEditDiscountValue] = useState(20);
  const [editTotalSessions, setEditTotalSessions] = useState(3);
  const [editValidityDays, setEditValidityDays] = useState(90);
  const [editDescription, setEditDescription] = useState("");
  const [editSessionServices, setEditSessionServices] = useState<any[]>([]);

  // Form Vincular a Cliente & Agendar Sessões
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [firstSessionDate, setFirstSessionDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [firstSessionTime, setFirstSessionTime] = useState("10:00");
  const [firstSessionProfId, setFirstSessionProfId] = useState("");
  const [sessionsSchedule, setSessionsSchedule] = useState<{ sessionNumber: number; date: string; time: string; profId: string }[]>([]);

  const loadData = () => {
    fetch("/api/packages", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        if (res.clients && res.clients.length > 0 && !selectedClientId) {
          setSelectedClientId(res.clients[0].id);
        }
        if (res.professionals && res.professionals.length > 0 && !firstSessionProfId) {
          setFirstSessionProfId(res.professionals[0].id);
        }
      });
  };

  useEffect(() => {
    loadData();
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, []);

  const { packages = [], clientPackages = [], clients = [], services = [], professionals = [] } = data || {};

  // Inicializar serviços das sessões ao alterar quantidade de sessões (Novo)
  useEffect(() => {
    if (services.length > 0) {
      const defaultSrv = services[0];
      const newSessions = [];
      for (let i = 1; i <= totalSessions; i++) {
        const existing = sessionServices.find((s) => s.sessionNumber === i);
        if (existing) {
          newSessions.push(existing);
        } else {
          newSessions.push({
            sessionNumber: i,
            serviceId: defaultSrv.id,
            serviceName: defaultSrv.name,
            price: defaultSrv.promoPrice || defaultSrv.price,
          });
        }
      }
      setSessionServices(newSessions);
    }
  }, [totalSessions, services]);

  // Recalcular preço com desconto para Novo Pacote
  const originalPrice = sessionServices.reduce((acc, s) => acc + (s.price || 0), 0);

  useEffect(() => {
    if (originalPrice > 0) {
      let calcPrice = originalPrice;
      if (discountType === "PERCENT") {
        calcPrice = originalPrice * (1 - Number(discountValue) / 100);
      } else {
        calcPrice = originalPrice - Number(discountValue);
      }
      setPrice(Math.max(0, Number(calcPrice.toFixed(2))));
    }
  }, [originalPrice, discountType, discountValue]);

  // Handler para trocar o serviço de uma sessão (Novo)
  const handleServiceChange = (sessionNum: number, serviceId: string) => {
    const srv = services.find((s: any) => s.id === serviceId);
    if (!srv) return;

    setSessionServices((prev) =>
      prev.map((item) =>
        item.sessionNumber === sessionNum
          ? {
              ...item,
              serviceId: srv.id,
              serviceName: srv.name,
              price: srv.promoPrice || srv.price,
            }
          : item
      )
    );
  };

  // Handler para trocar o serviço de uma sessão (Edição)
  const handleEditServiceChange = (sessionNum: number, serviceId: string) => {
    const srv = services.find((s: any) => s.id === serviceId);
    if (!srv) return;

    setEditSessionServices((prev) =>
      prev.map((item) =>
        item.sessionNumber === sessionNum
          ? {
              ...item,
              serviceId: srv.id,
              serviceName: srv.name,
              price: srv.promoPrice || srv.price,
            }
          : item
      )
    );
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price === undefined || !totalSessions) return;

    const res = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price: Number(price),
        originalPrice: Number(originalPrice),
        discountType,
        discountValue: Number(discountValue),
        totalSessions: Number(totalSessions),
        validityDays: Number(validityDays),
        description,
        servicesJson: JSON.stringify(sessionServices),
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
    setEditDiscountType(pkg.discountType || "VALUE");
    setEditDiscountValue(pkg.discountValue || 0);
    setEditTotalSessions(pkg.totalSessions);
    setEditValidityDays(pkg.validityDays);
    setEditDescription(pkg.description || "");

    let parsed: any[] = [];
    try {
      if (pkg.servicesJson) parsed = JSON.parse(pkg.servicesJson);
    } catch (e) {}

    if (parsed.length === 0 && services.length > 0) {
      const defaultSrv = services[0];
      for (let i = 1; i <= pkg.totalSessions; i++) {
        parsed.push({
          sessionNumber: i,
          serviceId: defaultSrv.id,
          serviceName: defaultSrv.name,
          price: defaultSrv.price,
        });
      }
    }
    setEditSessionServices(parsed);
    setShowEditModal(true);
  };

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editName) return;

    const editOriginalPrice = editSessionServices.reduce((acc, s) => acc + (s.price || 0), 0);

    const res = await fetch("/api/packages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editId,
        name: editName,
        price: Number(editPrice),
        originalPrice: Number(editOriginalPrice),
        discountType: editDiscountType,
        discountValue: Number(editDiscountValue),
        totalSessions: Number(editTotalSessions),
        validityDays: Number(editValidityDays),
        description: editDescription,
        servicesJson: JSON.stringify(editSessionServices),
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
    
    // Inicializar agenda das sessões adicionais (2 a N)
    const initialSchedule = [];
    for (let i = 2; i <= pkg.totalSessions; i++) {
      initialSchedule.push({
        sessionNumber: i,
        date: "",
        time: "10:00",
        profId: firstSessionProfId || (professionals[0]?.id || ""),
      });
    }
    setSessionsSchedule(initialSchedule);
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
        firstSessionDate,
        firstSessionTime,
        firstSessionProfId,
        sessionsSchedule,
      }),
    });

    if (res.ok) {
      alert(`✨ Pacote "${selectedPackage.name}" vinculado à cliente com sucesso!\n\n🏷️ A cliente foi alterada para a categoria "PACOTES".\n\n📅 Os agendamentos futuros foram lançados. O valor do pacote (R$ ${selectedPackage.price.toFixed(2)}) entrará no caixa SOMENTE quando você realizar o checkout da 1ª sessão!`);
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0 w-full min-w-0">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
            📦 Pacotes & Planos de Sessões
          </h2>
          <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
            Configure combos de até 6 sessões com serviços personalizados, descontos em % ou R$ e lançamento financeiro exclusivo no checkout da 1ª sessão.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95 self-start sm:self-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Criar Novo Combo</span>
        </button>
      </div>

      {/* Grid de Pacotes Cadastrados */}
      <div>
        <h3 className="font-serif text-lg font-extrabold text-slate-900 dark:text-white mb-3">
          Tabela de Combos & Pacotes do Salão ({packages.length})
        </h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
          {packages.map((pkg: any) => {
            let pkgServices: any[] = [];
            try {
              if (pkg.servicesJson) pkgServices = JSON.parse(pkg.servicesJson);
            } catch (e) {}

            return (
              <div
                key={pkg.id}
                className="flex flex-col justify-between rounded-3xl border border-rose-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 w-full min-w-0 overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between border-b pb-3 border-rose-100 dark:border-slate-800 gap-2">
                    <div>
                      <h4 className="font-serif text-base font-extrabold text-slate-900 dark:text-white">{pkg.name}</h4>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-slate-800 px-2 py-0.5 rounded-md inline-block mt-1">
                        ✨ Combo de {pkg.totalSessions} Sessões
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                        <span className="block text-[11px] font-medium text-slate-400 line-through">
                          R$ {pkg.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="font-serif text-lg font-extrabold text-rose-600 dark:text-amber-300 block">
                        R$ {pkg.price?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {pkg.description && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 italic">{pkg.description}</p>}

                  {/* Detalhamento de Serviços por Sessão */}
                  <div className="mt-3 space-y-1.5 rounded-2xl bg-rose-50/60 p-3 text-xs dark:bg-slate-800/60">
                    <p className="font-extrabold text-[11px] text-rose-800 dark:text-rose-300">
                      💅 Serviços por Sessão (1 a {pkg.totalSessions}):
                    </p>
                    {pkgServices.length > 0 ? (
                      pkgServices.map((srv: any) => (
                        <div key={srv.sessionNumber} className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-200">
                          <span>
                            <strong className="text-rose-700 dark:text-rose-400">Sessão {srv.sessionNumber}:</strong> {srv.serviceName}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">R$ {(srv.price || 0).toFixed(0)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-500 italic">{pkg.totalSessions} sessões personalizadas</p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-50 p-2 rounded-xl dark:bg-slate-800/80">
                    <span>⏳ Validade: {pkg.validityDays} dias</span>
                    {pkg.discountValue > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                        🏷️ Desconto: {pkg.discountType === "PERCENT" ? `${pkg.discountValue}%` : `R$ ${pkg.discountValue}`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-xs font-extrabold gap-2">
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
                    className="rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-3 py-1.5 font-extrabold text-white shadow-sm hover:opacity-95 shrink-0"
                  >
                    🤝 Vincular a Cliente
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de Pacotes Ativos das Clientes */}
      <div className="mt-8">
        <h3 className="font-serif text-lg font-extrabold text-[#6B1615] dark:text-amber-200 mb-3">
          📋 Pacotes & Combos Ativos das Clientes ({clientPackages.length})
        </h3>

        {clientPackages.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clientPackages.map((cp: any) => {
              const clientObj = clients.find((c: any) => c.id === cp.clientId);
              const remaining = cp.totalSessions - cp.sessionsUsed;

              let cpServices: any[] = [];
              try {
                if (cp.servicesJson) cpServices = JSON.parse(cp.servicesJson);
              } catch (e) {}

              return (
                <div
                  key={cp.id}
                  className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 dark:border-slate-800">
                      <span className="font-extrabold text-xs text-amber-900 dark:text-amber-300 truncate">
                        👤 {clientObj?.name || "Cliente"}
                      </span>
                      <span className="rounded-md bg-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 dark:bg-amber-900 dark:text-amber-100 shrink-0">
                        {cp.sessionsUsed}/{cp.totalSessions} Usadas
                      </span>
                    </div>

                    <p className="mt-2 font-serif text-sm font-extrabold text-slate-900 dark:text-white">
                      {cp.packageName || "Pacote de Sessões"}
                    </p>

                    <p className="mt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Validade até: {new Date(cp.expiryDate).toLocaleDateString("pt-BR")}
                    </p>

                    {/* Serviços do Pacote */}
                    {cpServices.length > 0 && (
                      <div className="mt-2 space-y-1 bg-white/70 p-2 rounded-xl text-[10px] dark:bg-slate-800/70">
                        {cpServices.map((srv: any) => (
                          <div key={srv.sessionNumber} className="flex justify-between text-slate-700 dark:text-slate-300">
                            <span>Sessão {srv.sessionNumber}: {srv.serviceName}</span>
                            <span>{srv.sessionNumber <= cp.sessionsUsed ? "✅ Concluída" : "⏳ Pendente"}</span>
                          </div>
                        ))}
                      </div>
                    )}
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

      {/* MODAL CRIAR NOVO PACOTE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">✨ Criar Novo Combo / Pacote</h3>
              <button onClick={() => setShowCreateModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Nome do Combo / Pacote *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Combo Club 4 Manutenções em Gel..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Descrição Comercial</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Inclui cutilagem, nivelamento e troca de decoração quinzenal..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Quantidade de Sessões (1 a 6) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Quantidade de Sessões (1 a 6) *</label>
                  <select
                    value={totalSessions}
                    onChange={(e) => setTotalSessions(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Sessão" : "Sessões"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Validade em Dias *</label>
                  <input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Escolha do Tipo de Serviço para cada Sessão (1 a 6) */}
              <div className="rounded-2xl bg-rose-50/70 p-3.5 space-y-2.5 border border-rose-200/80 dark:bg-slate-800/80 dark:border-slate-700">
                <p className="font-extrabold text-xs text-rose-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-rose-500" />
                  <span>Escolha o Serviço de Cada Sessão (1 a {totalSessions}):</span>
                </p>

                {sessionServices.map((ss) => (
                  <div key={ss.sessionNumber} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-white p-2.5 rounded-xl border border-rose-100 dark:bg-slate-900 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] shrink-0">
                      Sessão {ss.sessionNumber}:
                    </span>
                    <select
                      value={ss.serviceId}
                      onChange={(e) => handleServiceChange(ss.sessionNumber, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-1.5 text-xs font-semibold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {services.map((srv: any) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} — R$ {(srv.promoPrice || srv.price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Opções de Desconto (% ou R$) */}
              <div className="rounded-2xl bg-amber-50/70 p-3.5 space-y-3 border border-amber-200/80 dark:bg-slate-800/80 dark:border-slate-700">
                <p className="font-extrabold text-xs text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-amber-600" />
                  <span>Configuração de Desconto do Combo:</span>
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200">Tipo de Desconto</label>
                    <div className="mt-1 flex rounded-xl bg-white p-1 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setDiscountType("PERCENT")}
                        className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg transition ${
                          discountType === "PERCENT"
                            ? "bg-rose-500 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        % Porcentagem
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType("VALUE")}
                        className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg transition ${
                          discountType === "VALUE"
                            ? "bg-rose-500 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        R$ Valor Real
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      {discountType === "PERCENT" ? "Desconto em %" : "Desconto em R$"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="mt-1 w-full rounded-2xl border border-slate-200 p-2.5 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Resumo de Cálculo */}
                <div className="bg-white p-3 rounded-xl border border-amber-200/90 text-xs dark:bg-slate-900 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Soma dos Serviços Avulsos:</span>
                    <span className="font-bold">R$ {originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Desconto Aplicado:</span>
                    <span>
                      -{discountType === "PERCENT" ? `${discountValue}%` : `R$ ${discountValue.toFixed(2)}`} (-R$ {(originalPrice - price).toFixed(2)})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-900 dark:text-white font-extrabold text-sm border-t pt-1.5 mt-1 dark:border-slate-800">
                    <span>Valor Final do Pacote:</span>
                    <span className="text-rose-600 dark:text-amber-300">R$ {price.toFixed(2)}</span>
                  </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">✏️ Editar Pacote / Combo</h3>
              <button onClick={() => setShowEditModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePackage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Nome do Combo *</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Total de Sessões (1 a 6) *</label>
                  <select
                    value={editTotalSessions}
                    onChange={(e) => setEditTotalSessions(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Sessão" : "Sessões"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Validade em Dias *</label>
                  <input
                    type="number"
                    value={editValidityDays}
                    onChange={(e) => setEditValidityDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Serviço por Sessão (Edição) */}
              <div className="rounded-2xl bg-rose-50/70 p-3.5 space-y-2.5 border border-rose-200/80 dark:bg-slate-800/80 dark:border-slate-700">
                <p className="font-extrabold text-xs text-rose-900 dark:text-amber-300">
                  💅 Serviços Configurados por Sessão:
                </p>

                {editSessionServices.map((ss) => (
                  <div key={ss.sessionNumber} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-white p-2.5 rounded-xl border border-rose-100 dark:bg-slate-900 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] shrink-0">
                      Sessão {ss.sessionNumber}:
                    </span>
                    <select
                      value={ss.serviceId}
                      onChange={(e) => handleEditServiceChange(ss.sessionNumber, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-1.5 text-xs font-semibold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {services.map((srv: any) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} — R$ {(srv.promoPrice || srv.price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Preço Final do Combo (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
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

      {/* MODAL VINCULAR PACOTE A CLIENTE & AGENDAR SESSÕES FUTURAS */}
      {showAssignModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                🤝 Vincular "{selectedPackage.name}" à Cliente
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignPackage} className="space-y-4 text-xs">
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

              {/* Informações do Pacote */}
              <div className="rounded-2xl bg-amber-50 p-3.5 text-amber-900 dark:bg-slate-800 dark:text-amber-300 font-semibold space-y-1 text-xs">
                <p>✨ Total de Sessões: <strong>{selectedPackage.totalSessions} sessões</strong></p>
                <p>⏳ Validade: <strong>{selectedPackage.validityDays} dias</strong></p>
                <p>💰 Valor Total do Combo: <strong>R$ {selectedPackage.price?.toFixed(2)}</strong></p>
              </div>

              {/* Agendamento da 1ª Sessão */}
              <div className="rounded-2xl bg-rose-50/80 p-3.5 space-y-2.5 border border-rose-200/80 dark:bg-slate-800/80 dark:border-slate-700">
                <p className="font-extrabold text-xs text-rose-900 dark:text-amber-300 flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-rose-600" />
                  <span>Agendamento Antecipado da 1ª Sessão (Carrega o Valor do Combo):</span>
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200">Data da 1ª Sessão *</label>
                    <input
                      type="date"
                      value={firstSessionDate}
                      onChange={(e) => setFirstSessionDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200">Horário *</label>
                    <input
                      type="time"
                      value={firstSessionTime}
                      onChange={(e) => setFirstSessionTime(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Profissional Responsável</label>
                  <select
                    value={firstSessionProfId}
                    onChange={(e) => setFirstSessionProfId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    {professionals.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Agendamento Antecipado Opcional para as demais Sessões (2 a N) */}
              {selectedPackage.totalSessions > 1 && (
                <div className="rounded-2xl bg-slate-50 p-3.5 space-y-2.5 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                  <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                    📅 Agendamento Futuro das Sessões Seguintes (Opcional - Valor R$ 0.00):
                  </p>

                  {sessionsSchedule.map((sched, idx) => (
                    <div key={sched.sessionNumber} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5 dark:bg-slate-900 dark:border-slate-800">
                      <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                        Sessão {sched.sessionNumber} (R$ 0.00 | Combo Pago):
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={sched.date}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSessionsSchedule((prev) =>
                              prev.map((s) => (s.sessionNumber === sched.sessionNumber ? { ...s, date: val } : s))
                            );
                          }}
                          className="w-full rounded-lg border border-slate-200 p-1.5 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <input
                          type="time"
                          value={sched.time}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSessionsSchedule((prev) =>
                              prev.map((s) => (s.sessionNumber === sched.sessionNumber ? { ...s, time: val } : s))
                            );
                          }}
                          className="w-full rounded-lg border border-slate-200 p-1.5 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Aviso Financeiro Importante */}
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-950 border border-emerald-200 dark:bg-slate-800 dark:border-emerald-900 dark:text-emerald-300 text-[11px] font-medium leading-relaxed">
                ℹ️ <strong>Regra do Caixa do Salão:</strong> Este agendamento antecipado não gera entradas no caixa imediatamente. O valor integral (R$ {selectedPackage.price?.toFixed(2)}) entrará no caixa <strong>somente quando a administradora fizer o checkout do atendimento da 1ª sessão</strong>.
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
              >
                CONFIRMAR VÍNCULO E LANÇAR SESSÕES 🤝
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
