"use client";

import { useState, useEffect } from "react";
import { Package as PackageIcon, Plus, Edit2, Trash2, UserCheck, CheckCircle2, Clock, Calendar as CalendarIcon, X, Sparkles, Percent, DollarSign, CreditCard } from "lucide-react";

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function PacotesPage() {
  const [data, setData] = useState<any>(null);

  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form Novo Pacote
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [totalSessions, setTotalSessions] = useState(4); // 1 a 6 semanas
  const [validityDays, setValidityDays] = useState(90);
  const [weeklyServices, setWeeklyServices] = useState<
    { week: number; serviceId: string; serviceName: string; price: number }[]
  >([
    { week: 1, serviceId: "", serviceName: "Aplicação Fibra de Vidro Premium", price: 180 },
    { week: 2, serviceId: "", serviceName: "Esmaltação em Gel & Cutilagem", price: 70 },
    { week: 3, serviceId: "", serviceName: "Manutenção de Fibra de Vidro", price: 110 },
    { week: 4, serviceId: "", serviceName: "Spa das Mãos & Nivelamento", price: 60 },
  ]);
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENT">("FIXED");
  const [discountValue, setDiscountValue] = useState<number>(40);
  const [manualPrice, setManualPrice] = useState<number | null>(null);

  // Form Editar Pacote
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTotalSessions, setEditTotalSessions] = useState(4);
  const [editValidityDays, setEditValidityDays] = useState(90);
  const [editWeeklyServices, setEditWeeklyServices] = useState<
    { week: number; serviceId: string; serviceName: string; price: number }[]
  >([]);
  const [editDiscountType, setEditDiscountType] = useState<"FIXED" | "PERCENT">("FIXED");
  const [editDiscountValue, setEditDiscountValue] = useState<number>(0);
  const [editManualPrice, setEditManualPrice] = useState<number | null>(null);

  // Form Vincular a Cliente (Venda do Pacote)
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [assignPaymentDate, setAssignPaymentDate] = useState<string>(getTodayString());
  const [assignPaymentMethod, setAssignPaymentMethod] = useState<string>("PIX");
  const [assignAmountPaid, setAssignAmountPaid] = useState<number | null>(null);

  // Form Agendar Sessão na Agenda
  const [selectedClientPackage, setSelectedClientPackage] = useState<any>(null);
  const [scheduleDate, setScheduleDate] = useState<string>(getTodayString());
  const [scheduleTime, setScheduleTime] = useState<string>("10:00");
  const [scheduleProfId, setScheduleProfId] = useState<string>("");

  const loadData = () => {
    fetch("/api/packages", { cache: "no-store" })
      .then((r) => r.json())
      .then(async (res) => {
        if (!res.services || res.services.length === 0) {
          try {
            const srvRes = await fetch("/api/services", { cache: "no-store" }).then((r) => r.json());
            res.services = srvRes.services || [];
          } catch (e) {}
        }

        setData(res);

        if (res.clients && res.clients.length > 0 && !selectedClientId) {
          setSelectedClientId(res.clients[0].id);
        }
        if (res.professionals && res.professionals.length > 0 && !scheduleProfId) {
          setScheduleProfId(res.professionals[0].id);
        }
      });
  };

  useEffect(() => {
    loadData();
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, []);

  const { packages = [], clientPackages = [], clients = [], services = [], professionals = [] } = data || {};

  // Ajustar número de semanas (1 a 6) no formulário de criação
  const handleSessionsCountChange = (count: number) => {
    const num = Math.min(6, Math.max(1, count));
    setTotalSessions(num);
    const updated = [];
    for (let i = 1; i <= num; i++) {
      if (weeklyServices[i - 1]) {
        updated.push({ ...weeklyServices[i - 1], week: i });
      } else {
        const defaultSrv = services[0] || { id: "", name: `Procedimento Semana ${i}`, price: 100 };
        updated.push({
          week: i,
          serviceId: defaultSrv.id,
          serviceName: defaultSrv.name,
          price: defaultSrv.promoPrice || defaultSrv.price || 100,
        });
      }
    }
    setWeeklyServices(updated);
  };

  // Atualizar procedimento da semana no form Criar
  const handleWeeklyServiceChange = (weekNum: number, serviceId: string, customName?: string) => {
    const srv = services.find((s: any) => s.id === serviceId);
    setWeeklyServices((prev) =>
      prev.map((item) => {
        if (item.week !== weekNum) return item;
        if (srv) {
          return {
            ...item,
            serviceId: srv.id,
            serviceName: srv.name,
            price: srv.promoPrice || srv.price,
          };
        }
        return {
          ...item,
          serviceId,
          serviceName: customName !== undefined ? customName : item.serviceName,
        };
      })
    );
  };

  // Ajustar número de semanas no formulário de edição (1 a 6)
  const handleEditSessionsCountChange = (count: number) => {
    const num = Math.min(6, Math.max(1, count));
    setEditTotalSessions(num);
    const updated = [];
    for (let i = 1; i <= num; i++) {
      if (editWeeklyServices[i - 1]) {
        updated.push({ ...editWeeklyServices[i - 1], week: i });
      } else {
        const defaultSrv = services[0] || { id: "", name: `Procedimento Semana ${i}`, price: 100 };
        updated.push({
          week: i,
          serviceId: defaultSrv.id,
          serviceName: defaultSrv.name,
          price: defaultSrv.promoPrice || defaultSrv.price || 100,
        });
      }
    }
    setEditWeeklyServices(updated);
  };

  // Atualizar procedimento da semana no form Editar
  const handleEditWeeklyServiceChange = (weekNum: number, serviceId: string, customName?: string) => {
    const srv = services.find((s: any) => s.id === serviceId);
    setEditWeeklyServices((prev) =>
      prev.map((item) => {
        if (item.week !== weekNum) return item;
        if (srv) {
          return {
            ...item,
            serviceId: srv.id,
            serviceName: srv.name,
            price: srv.promoPrice || srv.price,
          };
        }
        return {
          ...item,
          serviceId,
          serviceName: customName !== undefined ? customName : item.serviceName,
        };
      })
    );
  };

  // Helper de cálculo de valores
  const calculateTotals = (
    list: { week: number; serviceId: string; serviceName: string; price: number }[],
    discType: "FIXED" | "PERCENT",
    discVal: number,
    customPrice: number | null
  ) => {
    const subtotal = list.reduce((acc, item) => acc + (item.price || 0), 0);
    let discountAmount = 0;
    if (discType === "PERCENT") {
      discountAmount = (subtotal * Math.min(100, Math.max(0, discVal))) / 100;
    } else {
      discountAmount = Math.min(subtotal, Math.max(0, discVal));
    }
    const calculatedTotal = Math.max(0, subtotal - discountAmount);
    const finalPrice = customPrice !== null && customPrice > 0 ? customPrice : calculatedTotal;
    return { subtotal, discountAmount, finalPrice };
  };

  // Valores calculados do Form Criar
  const createTotals = calculateTotals(weeklyServices, discountType, discountValue, manualPrice);

  // Valores calculados do Form Editar
  const editTotals = calculateTotals(editWeeklyServices, editDiscountType, editDiscountValue, editManualPrice);

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || totalSessions <= 0) return;

    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: createTotals.finalPrice,
          originalPrice: createTotals.subtotal,
          totalSessions,
          validityDays,
          description,
          weeklyServices: JSON.stringify(weeklyServices),
          discountType,
          discountValue,
        }),
      });

      if (res.ok) {
        alert("✨ Novo pacote de sessões criado com sucesso!");
        setShowCreateModal(false);
        setName("");
        setDescription("");
        setManualPrice(null);
        loadData();
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(`Erro ao cadastrar pacote: ${errJson.error || errJson.message || "Verifique os dados preenchidos."}`);
      }
    } catch (e: any) {
      alert(`Erro de conexão ao cadastrar pacote: ${e.message || "Tente novamente."}`);
    }
  };

  const handleOpenEdit = (pkg: any) => {
    setEditId(pkg.id);
    setEditName(pkg.name);
    setEditDescription(pkg.description || "");
    setEditTotalSessions(pkg.totalSessions || 4);
    setEditValidityDays(pkg.validityDays || 90);
    setEditDiscountType((pkg.discountType as "FIXED" | "PERCENT") || "FIXED");
    setEditDiscountValue(pkg.discountValue || 0);
    setEditManualPrice(pkg.price);

    try {
      if (pkg.weeklyServices) {
        const parsed = typeof pkg.weeklyServices === "string" ? JSON.parse(pkg.weeklyServices) : pkg.weeklyServices;
        setEditWeeklyServices(parsed);
      } else {
        // Fallback default 4 semanas
        const perSessionPrice = (pkg.price || 200) / (pkg.totalSessions || 4);
        const fallbackList = [];
        for (let i = 1; i <= (pkg.totalSessions || 4); i++) {
          fallbackList.push({
            week: i,
            serviceId: "",
            serviceName: `Procedimento Semana ${i}`,
            price: perSessionPrice,
          });
        }
        setEditWeeklyServices(fallbackList);
      }
    } catch (e) {
      setEditWeeklyServices([]);
    }

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
        price: editTotals.finalPrice,
        originalPrice: editTotals.subtotal,
        totalSessions: editTotalSessions,
        validityDays: editValidityDays,
        description: editDescription,
        weeklyServices: JSON.stringify(editWeeklyServices),
        discountType: editDiscountType,
        discountValue: editDiscountValue,
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
    if (!confirm(`Deseja realmente excluir a regra de pacote "${pkgName}"?`)) return;

    const res = await fetch(`/api/packages?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("🗑️ Pacote excluído.");
      loadData();
    } else {
      alert("Erro ao excluir pacote.");
    }
  };

  const handleDeleteClientPackage = async (clientPackageId: string, clientName: string, pkgName: string) => {
    if (!confirm(`Deseja realmente cancelar/excluir o pacote "${pkgName}" da cliente ${clientName}?`)) return;

    const res = await fetch(`/api/packages?id=${clientPackageId}&type=CLIENT_PACKAGE`, { method: "DELETE" });
    if (res.ok) {
      alert(`🗑️ Pacote "${pkgName}" da cliente ${clientName} excluído com sucesso.`);
      loadData();
    } else {
      alert("Erro ao excluir pacote da cliente.");
    }
  };

  const handleOpenAssign = (pkg: any) => {
    setSelectedPackage(pkg);
    setAssignPaymentDate(getTodayString());
    setAssignPaymentMethod("PIX");
    setAssignAmountPaid(pkg.price);
    setShowAssignModal(true);
  };

  const handleAssignPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !selectedClientId) return;

    const finalAmount = assignAmountPaid !== null && assignAmountPaid !== undefined ? assignAmountPaid : selectedPackage.price;

    const res = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ASSIGN_TO_CLIENT",
        packageId: selectedPackage.id,
        clientId: selectedClientId,
        paymentDate: assignPaymentDate,
        paymentMethod: assignPaymentMethod,
        amountPaid: finalAmount,
      }),
    });

    if (res.ok) {
      const clientObj = clients.find((c: any) => c.id === selectedClientId);
      alert(`✨ Pacote "${selectedPackage.name}" vinculado a ${clientObj?.name || "Cliente"} com sucesso!\n💰 Pagamento total de R$ ${finalAmount.toFixed(2)} registrado na data ${assignPaymentDate}.`);
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

  const handleOpenScheduleModal = (cp: any) => {
    setSelectedClientPackage(cp);
    if (professionals && professionals.length > 0) {
      setScheduleProfId(professionals[0].id);
    }
    setScheduleDate(getTodayString());
    setScheduleTime("10:00");
    setShowScheduleModal(true);
  };

  const handleSchedulePackageSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientPackage) return;

    const clientObj = clients.find((c: any) => c.id === selectedClientPackage.clientId);
    const pkgObj = packages.find((p: any) => p.id === selectedClientPackage.packageId);

    let procedureName = "Sessão de Pacote";
    let targetServiceId = services[0]?.id || "srv-default";

    if (pkgObj?.weeklyServices) {
      try {
        const parsed = typeof pkgObj.weeklyServices === "string" ? JSON.parse(pkgObj.weeklyServices) : pkgObj.weeklyServices;
        const nextWeek = selectedClientPackage.sessionsUsed + 1;
        const currentItem = parsed.find((item: any) => item.week === nextWeek);
        if (currentItem) {
          procedureName = currentItem.serviceName;
          if (currentItem.serviceId) targetServiceId = currentItem.serviceId;
        }
      } catch (err) {}
    }

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: selectedClientPackage.clientId,
        professionalId: scheduleProfId || (professionals[0]?.id),
        date: scheduleDate,
        startTime: scheduleTime,
        serviceIds: [targetServiceId],
        clientPackageId: selectedClientPackage.id,
        notes: `📦 Sessão ${selectedClientPackage.sessionsUsed + 1}/${selectedClientPackage.totalSessions} do Pacote: ${procedureName}`,
        depositPaid: 0,
        discount: 0,
        paymentStatus: "PACOTE",
      }),
    });

    if (res.ok) {
      alert(`✨ Agendamento de Pacote confirmado para a cliente ${clientObj?.name || "Cliente"} no dia ${scheduleDate} às ${scheduleTime}!\n💡 O valor do atendimento é R$ 0,00 pois o pacote já foi quitado.`);
      setShowScheduleModal(false);
      loadData();
    } else {
      const errJson = await res.json().catch(() => ({}));
      alert(`Erro ao agendar sessão do pacote: ${errJson.error || "Verifique o horário selecionado."}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
            📦 Pacotes & Planos de Sessões
          </h2>
          <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
            Defina o cronograma semanal de procedimentos (até 6 semanas), aplique descontos especiais e lance a venda no financeiro.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Criar Novo Pacote</span>
        </button>
      </div>

      {/* Grid de Pacotes Cadastrados */}
      <div>
        <h3 className="font-serif text-lg font-extrabold text-slate-900 dark:text-white mb-3">
          Tabela de Pacotes do Salão ({packages.length})
        </h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg: any) => {
            const hasDiscount = pkg.originalPrice && pkg.originalPrice > pkg.price;
            const discountDiff = hasDiscount ? pkg.originalPrice - pkg.price : 0;

            return (
              <div
                key={pkg.id}
                className="flex flex-col justify-between rounded-3xl border border-rose-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between border-b pb-3 border-rose-100 dark:border-slate-800 gap-2">
                    <div>
                      <h4 className="font-serif text-base font-extrabold text-slate-900 dark:text-white">{pkg.name}</h4>
                      {hasDiscount && (
                        <span className="inline-block mt-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full dark:bg-emerald-950 dark:text-emerald-300">
                          🎉 Economia de R$ {discountDiff.toFixed(2)} ({pkg.discountType === "PERCENT" ? `${pkg.discountValue}% OFF` : `R$ ${pkg.discountValue} OFF`})
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {hasDiscount && (
                        <span className="block text-xs font-semibold text-slate-400 line-through">
                          R$ {pkg.originalPrice?.toFixed(2)}
                        </span>
                      )}
                      <span className="font-serif text-lg font-extrabold text-rose-600 dark:text-rose-400">
                        R$ {pkg.price?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {pkg.description && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 italic">{pkg.description}</p>}

                  {/* Cronograma Semanal de Procedimentos */}
                  {pkg.weeklyServices && (
                    <div className="mt-3.5 space-y-1.5 rounded-2xl bg-amber-50/60 p-3 text-xs dark:bg-slate-800/60 border border-amber-200/60">
                      <p className="font-extrabold text-amber-900 dark:text-amber-300 text-[11px] mb-1">
                        📅 Cronograma de Procedimentos (Até {pkg.totalSessions} Semanas):
                      </p>
                      {(() => {
                        try {
                          const parsed = typeof pkg.weeklyServices === "string" ? JSON.parse(pkg.weeklyServices) : pkg.weeklyServices;
                          return parsed.map((item: any) => (
                            <div key={item.week} className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 border-b border-amber-200/40 pb-1 last:border-0 last:pb-0">
                              <span>🗓️ <strong>Semana {item.week}:</strong> {item.serviceName}</span>
                              <span className="text-slate-500 font-normal shrink-0">R$ {item.price?.toFixed(2)}</span>
                            </div>
                          ));
                        } catch (e) {
                          return null;
                        }
                      })()}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 bg-rose-50/50 p-2.5 rounded-xl dark:bg-slate-800/60">
                    <span>✨ {pkg.totalSessions} Semanas / Sessões</span>
                    <span>⏳ Validade: {pkg.validityDays} dias</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-xs font-extrabold gap-1">
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
                    className="rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-3 py-1.5 font-extrabold text-white shadow-sm hover:opacity-95 text-xs"
                  >
                    🤝 Vender / Vincular a Cliente
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
                      <div className="flex items-center space-x-1.5">
                        <span className="rounded-md bg-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                          {cp.sessionsUsed}/{cp.totalSessions} Usadas
                        </span>
                        <button
                          onClick={() => handleDeleteClientPackage(cp.id, clientObj?.name || "Cliente", pkgObj?.name || "Pacote")}
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-100 hover:text-rose-800 dark:hover:bg-rose-950/60 transition flex items-center space-x-0.5 text-[11px] font-bold"
                          title="Excluir / Cancelar Pacote desta Cliente"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Excluir</span>
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 font-serif text-sm font-extrabold text-slate-900 dark:text-white">
                      {pkgObj?.name || "Pacote de Sessões"}
                    </p>

                    <p className="mt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Venda: {new Date(cp.purchaseDate).toLocaleDateString("pt-BR")} | Validade: {new Date(cp.expiryDate).toLocaleDateString("pt-BR")}
                    </p>

                    {/* Exibir o próximo procedimento da semana a ser feito */}
                    {pkgObj?.weeklyServices && (
                      <div className="mt-2 bg-white/80 p-2 rounded-xl text-[11px] dark:bg-slate-800 border border-amber-100">
                        {(() => {
                          try {
                            const parsed = typeof pkgObj.weeklyServices === "string" ? JSON.parse(pkgObj.weeklyServices) : pkgObj.weeklyServices;
                            const nextWeek = cp.sessionsUsed + 1;
                            const currentItem = parsed.find((item: any) => item.week === nextWeek);
                            if (currentItem) {
                              return (
                                <p className="font-extrabold text-rose-700 dark:text-rose-300">
                                  💅 Próxima Sessão (Semana {nextWeek}): {currentItem.serviceName}
                                </p>
                              );
                            }
                          } catch (e) {}
                          return null;
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-amber-200/60 pt-2 dark:border-slate-800 gap-1">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                      {remaining > 0 ? `Restam ${remaining}` : "Concluído"}
                    </span>

                    {remaining > 0 && (
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenScheduleModal(cp)}
                          className="rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-3 py-1.5 text-[11px] font-extrabold text-white shadow-sm hover:opacity-95 flex items-center space-x-1"
                        >
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>📅 Agendar Sessão</span>
                        </button>

                        <button
                          onClick={() => handleUseSession(cp.id)}
                          className="rounded-xl bg-emerald-600 px-2 py-1.5 text-[11px] font-extrabold text-white shadow-sm hover:bg-emerald-700"
                          title="Abater 1 sessão manualmente sem agendar"
                        >
                          ⚡ Abater
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs font-bold text-slate-500">
            Nenhum pacote vinculado a cliente ainda. Clique em "🤝 Vender / Vincular a Cliente" em qualquer pacote acima para associar!
          </div>
        )}
      </div>

      {/* MODAL VINCULAR E REGISTRAR VENDA DO PACOTE NO FINANCEIRO */}
      {showAssignModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  🤝 Vender / Vincular Pacote "{selectedPackage.name}"
                </h3>
                <p className="text-[11px] text-slate-500">
                  O valor do pacote será registrado no financeiro/caixa na data de venda selecionada.
                </p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignPackage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Selecione a Cliente *</label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="🔍 Digite o nome da cliente para filtrar rápida..."
                    value={clientSearchQuery}
                    onChange={(e) => {
                      const q = e.target.value;
                      setClientSearchQuery(q);
                      if (q.trim()) {
                        const match = clients.find((c: any) => c.name.toLowerCase().includes(q.trim().toLowerCase()) || (c.phone && c.phone.includes(q.trim())));
                        if (match) setSelectedClientId(match.id);
                      }
                    }}
                    className="w-full rounded-2xl border-2 border-rose-300 bg-rose-50/60 p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs shadow-sm"
                  />
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  >
                    {clients
                      .filter((c: any) => {
                        if (!clientSearchQuery.trim()) return true;
                        const q = clientSearchQuery.trim().toLowerCase();
                        return (c.name && c.name.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q)) || (c.whatsapp && c.whatsapp.includes(q));
                      })
                      .map((c: any) => (
                        <option key={c.id} value={c.id}>
                          👤 {c.name} ({c.whatsapp || c.phone})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Data de Venda / Pagamento *</label>
                  <input
                    type="date"
                    value={assignPaymentDate}
                    onChange={(e) => setAssignPaymentDate(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Forma de Pagamento Recebida *</label>
                  <select
                    value={assignPaymentMethod}
                    onChange={(e) => setAssignPaymentMethod(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="PIX">⚡ PIX</option>
                    <option value="CREDIT_CARD">💳 Cartão de Crédito</option>
                    <option value="DEBIT_CARD">💳 Cartão de Débito</option>
                    <option value="CASH">💵 Dinheiro em Espécie</option>
                    <option value="FIADO">📝 Fiado / A Prazo</option>
                  </select>
                </div>
              </div>

              {/* Detalhes do Valor do Combo */}
              <div className="rounded-2xl bg-amber-50 p-4 text-amber-900 dark:bg-slate-800 dark:text-amber-300 font-semibold space-y-2 border border-amber-200/80">
                <p className="font-serif font-extrabold text-sm text-amber-950 dark:text-amber-200">
                  📦 Resumo do Pacote Combo:
                </p>

                {selectedPackage.weeklyServices && (
                  <div className="space-y-1 text-[11px] bg-white/70 p-2.5 rounded-xl dark:bg-slate-900 border border-amber-100">
                    {(() => {
                      try {
                        const parsed = typeof selectedPackage.weeklyServices === "string" ? JSON.parse(selectedPackage.weeklyServices) : selectedPackage.weeklyServices;
                        return parsed.map((item: any) => (
                          <div key={item.week} className="flex justify-between">
                            <span>🗓️ Semana {item.week}: {item.serviceName}</span>
                            <span>R$ {item.price?.toFixed(2)}</span>
                          </div>
                        ));
                      } catch (e) {
                        return null;
                      }
                    })()}
                  </div>
                )}

                <div className="flex justify-between text-xs pt-1 border-t border-amber-200/60">
                  <span>✨ Total de Sessões:</span>
                  <strong>{selectedPackage.totalSessions} Semanas / Sessões</strong>
                </div>

                <div className="flex justify-between items-center text-sm font-extrabold text-rose-700 dark:text-rose-300 pt-1 border-t border-amber-200">
                  <span>💰 VALOR COBRADO DO PACOTE:</span>
                  <div className="flex items-center space-x-1">
                    <span>R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={assignAmountPaid !== null ? assignAmountPaid : selectedPackage.price}
                      onChange={(e) => setAssignAmountPaid(Number(e.target.value))}
                      className="w-24 rounded-lg border border-rose-300 p-1 text-right font-serif text-sm font-extrabold text-rose-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-rose-300"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95 flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>LANÇAR VENDA NO CAIXA E REGISTRAR PACOTE 🤝</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AGENDAR SESSÃO NA AGENDA */}
      {showScheduleModal && selectedClientPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  📅 Agendar Sessão do Pacote na Agenda
                </h3>
                <p className="text-[11px] text-slate-500">
                  Escolha o dia, horário e profissional para atender a cliente.
                </p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSchedulePackageSession} className="space-y-4 text-xs">
              {/* Informações da Cliente e do Pacote */}
              <div className="rounded-2xl bg-emerald-50 p-3.5 dark:bg-emerald-950/40 border border-emerald-300/80 space-y-1">
                <p className="font-extrabold text-slate-900 dark:text-white">
                  👤 Cliente: <span className="text-emerald-900 dark:text-emerald-200">{clients.find((c: any) => c.id === selectedClientPackage.clientId)?.name}</span>
                </p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  📦 Pacote: {packages.find((p: any) => p.id === selectedClientPackage.packageId)?.name}
                </p>
                
                {/* Exibir o serviço da sessão atual */}
                {(() => {
                  const pkgObj = packages.find((p: any) => p.id === selectedClientPackage.packageId);
                  if (pkgObj?.weeklyServices) {
                    try {
                      const parsed = typeof pkgObj.weeklyServices === "string" ? JSON.parse(pkgObj.weeklyServices) : pkgObj.weeklyServices;
                      const nextWeek = selectedClientPackage.sessionsUsed + 1;
                      const currentItem = parsed.find((item: any) => item.week === nextWeek);
                      if (currentItem) {
                        return (
                          <div className="mt-1 bg-white p-2 rounded-xl text-emerald-800 font-extrabold dark:bg-slate-900 border border-emerald-200 flex justify-between items-center">
                            <span>💅 Sessão {nextWeek} de {selectedClientPackage.totalSessions}: {currentItem.serviceName}</span>
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">R$ 0,00 (Já Quitado)</span>
                          </div>
                        );
                      }
                    } catch (e) {}
                  }
                  return (
                    <p className="font-bold text-emerald-800">
                      💅 Sessão {selectedClientPackage.sessionsUsed + 1} de {selectedClientPackage.totalSessions} (R$ 0,00 - Já Quitado no Pacote)
                    </p>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Data do Atendimento *</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Horário *</label>
                  <select
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"].map((t) => (
                      <option key={t} value={t}>⏰ {t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Profissional Atendante *</label>
                <select
                  value={scheduleProfId}
                  onChange={(e) => setScheduleProfId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                >
                  {professionals.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      💅 {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95 flex items-center justify-center space-x-2"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>CONFIRMAR E AGENDAR NA AGENDA 📅</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRIAR PACOTE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">✨ Criar Novo Pacote de Sessões</h3>
                <p className="text-[11px] text-slate-500">Configure procedimentos para até 6 semanas e defina o desconto especial do combo.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Nome do Pacote *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Combo Club 4 a 6 Semanas"
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Quantidade de Semanas / Sessões (Até 6) *</label>
                  <select
                    value={totalSessions}
                    onChange={(e) => handleSessionsCountChange(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value={1}>1 Semana (1 Sessão)</option>
                    <option value={2}>2 Semanas (2 Sessões)</option>
                    <option value={3}>3 Semanas (3 Sessões)</option>
                    <option value={4}>4 Semanas (4 Sessões)</option>
                    <option value={5}>5 Semanas (5 Sessões)</option>
                    <option value={6}>6 Semanas (6 Sessões)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Descrição / Observações</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Inclui cutilagem, troca de decoração e prioridade de horário..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* SELEÇÃO DE PROCEDIMENTOS SEMANA A SEMANA */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-xs font-extrabold text-amber-900 dark:text-amber-300">
                    💅 Procedimentos Selecionados para Cada Semana ({totalSessions} Semanas):
                  </h4>
                  <span className="text-[10px] text-amber-700 font-semibold">Escolha o serviço ou digite o nome</span>
                </div>

                <div className="space-y-2">
                  {weeklyServices.map((ws) => (
                    <div key={ws.week} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2.5 rounded-xl border border-amber-100 dark:bg-slate-900 dark:border-slate-700 gap-2">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 w-24 shrink-0">
                        🗓️ Semana {ws.week}:
                      </span>
                      
                      <select
                        value={ws.serviceId}
                        onChange={(e) => handleWeeklyServiceChange(ws.week, e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 p-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="">-- Selecione dos Serviços Cadastrados --</option>
                        {services.map((srv: any) => (
                          <option key={srv.id} value={srv.id}>
                            💅 {srv.name} (R$ {(srv.promoPrice || srv.price).toFixed(2)})
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Nome do procedimento..."
                        value={ws.serviceName}
                        onChange={(e) => handleWeeklyServiceChange(ws.week, ws.serviceId, e.target.value)}
                        className="w-full sm:w-48 rounded-xl border border-slate-200 p-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* SEÇÃO DE DESCONTO ESPECIAL DO PACOTE */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/60 space-y-3">
                <h4 className="font-serif text-xs font-extrabold text-rose-900 dark:text-rose-300">
                  🎁 Desconto Especial do Pacote Combo
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200">Tipo de Desconto</label>
                    <div className="flex rounded-xl bg-white p-1 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 mt-1">
                      <button
                        type="button"
                        onClick={() => setDiscountType("FIXED")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                          discountType === "FIXED" ? "bg-rose-500 text-white shadow" : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        R$ Valor Fixo
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType("PERCENT")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                          discountType === "PERCENT" ? "bg-rose-500 text-white shadow" : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        % Porcentagem
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      {discountType === "FIXED" ? "Valor do Desconto (R$)" : "Porcentagem do Desconto (%)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={discountValue}
                      onChange={(e) => {
                        setDiscountValue(Number(e.target.value));
                        setManualPrice(null);
                      }}
                      placeholder={discountType === "FIXED" ? "Ex: 50.00" : "Ex: 15"}
                      className="mt-1 w-full rounded-2xl border border-slate-200 p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* RESUMO DOS VALORES CALCULADOS */}
                <div className="rounded-xl bg-white p-3 border border-rose-100 dark:bg-slate-900 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Soma dos Procedimentos ({totalSessions} semanas):</span>
                    <span>R$ {createTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Desconto Especial Aplicado:</span>
                    <span>
                      - R$ {createTotals.discountAmount.toFixed(2)} ({discountType === "PERCENT" ? `${discountValue}%` : `R$ ${discountValue}`})
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-serif text-sm font-extrabold text-rose-700 dark:text-rose-300 border-t pt-1.5 mt-1 border-slate-100 dark:border-slate-800">
                    <span>VALOR FINAL DO PACOTE:</span>
                    <div className="flex items-center space-x-1">
                      <span>R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={createTotals.finalPrice}
                        onChange={(e) => setManualPrice(Number(e.target.value))}
                        className="w-24 rounded-lg border border-rose-300 p-1 text-right font-serif text-sm font-extrabold text-rose-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-rose-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Validade do Pacote (Dias)</label>
                <input
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
              >
                CRIAR PACOTE DE SESSÕES ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PACOTE */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">✏️ Editar Pacote</h3>
              <button onClick={() => setShowEditModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePackage} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Semanas / Sessões (Até 6) *</label>
                  <select
                    value={editTotalSessions}
                    onChange={(e) => handleEditSessionsCountChange(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value={1}>1 Semana</option>
                    <option value={2}>2 Semanas</option>
                    <option value={3}>3 Semanas</option>
                    <option value={4}>4 Semanas</option>
                    <option value={5}>5 Semanas</option>
                    <option value={6}>6 Semanas</option>
                  </select>
                </div>
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

              {/* SELEÇÃO DE PROCEDIMENTOS SEMANA A SEMANA (EDITAR) */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/60 space-y-3">
                <h4 className="font-serif text-xs font-extrabold text-amber-900 dark:text-amber-300">
                  💅 Procedimentos para Cada Semana ({editTotalSessions} Semanas):
                </h4>

                <div className="space-y-2">
                  {editWeeklyServices.map((ws) => (
                    <div key={ws.week} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2.5 rounded-xl border border-amber-100 dark:bg-slate-900 dark:border-slate-700 gap-2">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 w-24 shrink-0">
                        🗓️ Semana {ws.week}:
                      </span>
                      
                      <select
                        value={ws.serviceId}
                        onChange={(e) => handleEditWeeklyServiceChange(ws.week, e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 p-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="">-- Selecione o Procedimento --</option>
                        {services.map((srv: any) => (
                          <option key={srv.id} value={srv.id}>
                            💅 {srv.name} (R$ {(srv.promoPrice || srv.price).toFixed(2)})
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Nome do procedimento..."
                        value={ws.serviceName}
                        onChange={(e) => handleEditWeeklyServiceChange(ws.week, ws.serviceId, e.target.value)}
                        className="w-full sm:w-48 rounded-xl border border-slate-200 p-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* SEÇÃO DE DESCONTO ESPECIAL (EDITAR) */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/60 space-y-3">
                <h4 className="font-serif text-xs font-extrabold text-rose-900 dark:text-rose-300">
                  🎁 Desconto Especial do Pacote
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200">Tipo de Desconto</label>
                    <div className="flex rounded-xl bg-white p-1 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 mt-1">
                      <button
                        type="button"
                        onClick={() => setEditDiscountType("FIXED")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                          editDiscountType === "FIXED" ? "bg-rose-500 text-white shadow" : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        R$ Valor Fixo
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditDiscountType("PERCENT")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                          editDiscountType === "PERCENT" ? "bg-rose-500 text-white shadow" : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        % Porcentagem
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      {editDiscountType === "FIXED" ? "Valor do Desconto (R$)" : "Porcentagem do Desconto (%)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editDiscountValue}
                      onChange={(e) => {
                        setEditDiscountValue(Number(e.target.value));
                        setEditManualPrice(null);
                      }}
                      className="mt-1 w-full rounded-2xl border border-slate-200 p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* RESUMO DOS VALORES CALCULADOS */}
                <div className="rounded-xl bg-white p-3 border border-rose-100 dark:bg-slate-900 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Soma dos Procedimentos:</span>
                    <span>R$ {editTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Desconto Aplicado:</span>
                    <span>- R$ {editTotals.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-serif text-sm font-extrabold text-rose-700 dark:text-rose-300 border-t pt-1.5 mt-1 border-slate-100 dark:border-slate-800">
                    <span>VALOR FINAL DO PACOTE:</span>
                    <div className="flex items-center space-x-1">
                      <span>R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editTotals.finalPrice}
                        onChange={(e) => setEditManualPrice(Number(e.target.value))}
                        className="w-24 rounded-lg border border-rose-300 p-1 text-right font-serif text-sm font-extrabold text-rose-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-rose-300"
                      />
                    </div>
                  </div>
                </div>
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
    </div>
  );
}
