"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  PlayCircle,
  Lock,
  Filter,
  X,
  Sparkles,
  Eye,
  Phone,
  Check,
} from "lucide-react";
import { sendLocalPushNotification } from "@/lib/notifications";

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const timeToMins = (t: string) => {
  if (!t || !t.includes(":")) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// Auxiliar para obter o intervalo da semana (Segunda a Domingo)
function getWeekDays(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const curr = new Date(y, m - 1, d);
  const dayOfWeek = curr.getDay(); // 0 = Domingo, 1 = Segunda...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + distanceToMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const temp = new Date(monday);
    temp.setDate(monday.getDate() + i);
    const yyyy = temp.getFullYear();
    const mm = String(temp.getMonth() + 1).padStart(2, "0");
    const dd = String(temp.getDate()).padStart(2, "0");
    days.push(`${yyyy}-${mm}-${dd}`);
  }
  return days;
}

// Auxiliar para obter a grade de dias do mês
function getMonthCalendar(dateStr: string) {
  const [y, m] = dateStr.split("-").map(Number);
  const firstDay = new Date(y, m - 1, 1);
  const lastDay = new Date(y, m, 0);
  
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Dom, 1 = Seg...
  const mondayOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const days: string[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const mm = String(m).padStart(2, "0");
    const dd = String(i).padStart(2, "0");
    days.push(`${y}-${mm}-${dd}`);
  }

  return { year: y, month: m, daysInMonth, mondayOffset, days };
}

function getAppPackageBadgeText(app: any, clientPackages: any[] = []) {
  const notes = app.notes || "";
  const clientName = (app.clientName || "").toLowerCase();

  // Caso específico da Fernanda Peças ou Aline de Matos
  if (clientName.includes("fernanda") && (clientName.includes("peças") || clientName.includes("pecas"))) {
    const sessionMatch = notes.match(/Sessão \d\/\d/) || notes.match(/\(Sessão \d\/\d\)/);
    return `Combo Tradicional${sessionMatch ? ` (${sessionMatch[0].replace(/[()]/g, "")})` : ""}`;
  }

  if (clientName.includes("aline") && clientName.includes("matos")) {
    const sessionMatch = notes.match(/Sessão \d\/\d/) || notes.match(/\(Sessão \d\/\d\)/);
    return `Combo Tradicional${sessionMatch ? ` (${sessionMatch[0].replace(/[()]/g, "")})` : ""}`;
  }

  if (clientName.includes("maiara")) {
    const sessionMatch = notes.match(/Sessão \d\/\d/) || notes.match(/\(Sessão \d\/\d\)/);
    return `Combo com esmaltação em Gel${sessionMatch ? ` (${sessionMatch[0].replace(/[()]/g, "")})` : ""}`;
  }

  // Se as notas contêm explicitamente "Pacote Ativo: <Nome>", extrair
  if (notes.includes("Pacote Ativo:")) {
    const after = notes.split("Pacote Ativo:")[1];
    const cleanName = after.split("|")[0].trim();
    const sessionMatch = notes.match(/\(Sessão \d\/\d\)/) || notes.match(/Sessão \d\/\d/);
    const sessionStr = sessionMatch ? ` (${sessionMatch[0].replace(/[()]/g, "")})` : "";
    return `${cleanName}${sessionStr}`;
  }

  if (notes.includes("Combo Tradicional")) {
    const sessionMatch = notes.match(/Sessão \d\/\d/);
    return `Combo Tradicional${sessionMatch ? ` (${sessionMatch[0]})` : ""}`;
  }

  if (notes.includes("esmaltação em Gel") || notes.includes("esmaltacao")) {
    const sessionMatch = notes.match(/Sessão \d\/\d/);
    return `Combo com esmaltação em Gel${sessionMatch ? ` (${sessionMatch[0]})` : ""}`;
  }

  if (notes.includes("banho de gel com adicional")) {
    const sessionMatch = notes.match(/Sessão \d\/\d/);
    return `Combo Banho de Gel c/ Adicional${sessionMatch ? ` (${sessionMatch[0]})` : ""}`;
  }

  // Buscar o pacote da cliente em clientPackages
  const clientPkg = (clientPackages || []).find((cp: any) => cp.clientId === app.clientId);
  if (clientPkg && clientPkg.packageName) {
    const sessionMatch = notes.match(/Sessão \d\/\d/);
    return `${clientPkg.packageName}${sessionMatch ? ` (${sessionMatch[0]})` : ""}`;
  }

  const sessionMatch = notes.match(/Sessão \d\/\d/);
  if (sessionMatch) {
    return `Atendimento de Pacote (${sessionMatch[0]})`;
  }

  return "Atendimento de Pacote";
}

export default function AgendaPage() {
  const [viewMode, setViewMode] = useState<"day" | "columns" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [clientPackages, setClientPackages] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [filterProf, setFilterProf] = useState<string>("all");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfId, setUserProfId] = useState<string | null>(null);

  // Buscar sessão do usuário logado e vincular profissional
  useEffect(() => {
    Promise.all([
      fetch("/api/auth/session").then((r) => r.json()).catch(() => null),
      fetch("/api/professionals").then((r) => r.json()).catch(() => []),
    ]).then(([sessRes, profsData]) => {
      const u = sessRes?.user;
      setCurrentUser(u);
      const profList = Array.isArray(profsData) ? profsData : [];
      setProfessionals(profList);

      if (u) {
        // Se for PROFISSIONAL (Colaboradora), filtrar estritamente a agenda dela
        if (u.role === "PROFISSIONAL" || u.role !== "ADMINISTRADOR") {
          const matched = profList.find(
            (p: any) =>
              p.userId === u.id ||
              (p.email && u.email && p.email.toLowerCase() === u.email.toLowerCase()) ||
              p.name.toLowerCase().includes(u.name.toLowerCase()) ||
              u.name.toLowerCase().includes(p.name.toLowerCase())
          );
          if (matched) {
            setUserProfId(matched.id);
            setFilterProf(matched.id);
            setFormProf(matched.id);
          }
        }
      }
    });
  }, []);

  // Busca por Cliente / Lupa
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Form de Agendamento (Criação)
  const [formClient, setFormClient] = useState("");
  const [modalClientSearch, setModalClientSearch] = useState("");
  const [formProf, setFormProf] = useState("");
  const [formDate, setFormDate] = useState(getTodayString());
  const [formTime, setFormTime] = useState("10:00");
  const [formSelectedServices, setFormSelectedServices] = useState<string[]>([]);
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formDeposit, setFormDeposit] = useState<number>(0);
  const [formNotes, setFormNotes] = useState("");
  const [formClientPackageId, setFormClientPackageId] = useState<string>("");

  // Form de Edição de Agendamento
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingApp, setEditingApp] = useState<any>(null);
  const [editProf, setEditProf] = useState("");
  const [editDate, setEditDate] = useState(getTodayString());
  const [editTime, setEditTime] = useState("10:00");
  const [editSelectedServices, setEditSelectedServices] = useState<string[]>([]);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [editDeposit, setEditDeposit] = useState<number>(0);
  const [editNotes, setEditNotes] = useState("");

  // Cadastro Rápido de Cliente Nova no Agendamento
  const [showQuickClientModal, setShowQuickClientModal] = useState(false);
  const [quickClientName, setQuickClientName] = useState("");
  const [quickClientPhone, setQuickClientPhone] = useState("");
  const [isSavingQuickClient, setIsSavingQuickClient] = useState(false);

  const handleQuickSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClientName.trim() || !quickClientPhone.trim()) {
      alert("Por favor, informe o Nome e o WhatsApp da nova cliente.");
      return;
    }
    setIsSavingQuickClient(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: quickClientName.trim(),
          phone: quickClientPhone.trim(),
          whatsapp: quickClientPhone.trim(),
          tag: "NOVA",
        }),
      });
      if (res.ok) {
        const created = await res.json();
        const updatedClientsRes = await fetch("/api/clients").then((r) => r.json());
        const updatedList = Array.isArray(updatedClientsRes) ? updatedClientsRes : [];
        setClients(updatedList);
        handleSelectClient(created.id);
        setQuickClientName("");
        setQuickClientPhone("");
        setShowQuickClientModal(false);
      } else {
        const err = await res.json();
        alert("Erro ao cadastrar cliente: " + (err.error || "Tente novamente"));
      }
    } catch (e) {
      alert("Erro ao cadastrar cliente.");
    } finally {
      setIsSavingQuickClient(false);
    }
  };

  const handleOpenEditModal = (app: any) => {
    setEditingApp(app);
    setEditProf(app.professionalId);
    setEditDate(app.date);
    setEditTime(app.startTime);
    setEditSelectedServices(app.services ? app.services.map((s: any) => s.serviceId) : []);
    setEditDiscount(app.discount || 0);
    setEditDeposit(app.depositPaid || 0);
    setEditNotes(app.notes || "");
    setShowEditModal(true);
  };

  const handleSaveEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp || editSelectedServices.length === 0) {
      alert("Por favor, selecione ao menos 1 serviço.");
      return;
    }

    const res = await fetch("/api/appointments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingApp.id,
        professionalId: editProf,
        date: editDate,
        startTime: editTime,
        serviceIds: editSelectedServices,
        discount: Number(editDiscount),
        depositPaid: Number(editDeposit),
        notes: editNotes,
      }),
    });

    if (res.ok) {
      sendLocalPushNotification(
        "✏️ Agendamento Alterado!",
        `Serviços/valores de ${editingApp.clientName} foram atualizados com sucesso.`,
        "/agenda"
      );
      setShowEditModal(false);
      setEditingApp(null);
      refreshAllData();
    } else {
      const err = await res.json();
      alert("Erro ao editar agendamento: " + err.error);
    }
  };

  const loadAgenda = () => {
    setLoading(true);
    let url = `/api/appointments?professionalId=${filterProf}`;
    
    if (viewMode === "day" || viewMode === "columns") {
      url += `&date=${selectedDate}`;
    } else if (viewMode === "week") {
      const weekDays = getWeekDays(selectedDate);
      url += `&startDate=${weekDays[0]}&endDate=${weekDays[6]}`;
    } else if (viewMode === "month") {
      const monthPrefix = selectedDate.substring(0, 7);
      url += `&month=${monthPrefix}`;
    }

    fetch(url, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const refreshAuxiliaryData = () => {
    fetch("/api/professionals").then((r) => r.json()).then(setProfessionals).catch(() => {});
    fetch("/api/services").then((r) => r.json()).then((res) => setServices(res.services || [])).catch(() => {});
    fetch("/api/clients").then((r) => r.json()).then(setClients).catch(() => {});
    fetch("/api/packages").then((r) => r.json()).then((res) => {
      setClientPackages(res.clientPackages || []);
      setPackages(res.packages || []);
    }).catch(() => {});
  };

  const refreshAllData = () => {
    loadAgenda();
    refreshAuxiliaryData();
  };

  // Carregar listas auxiliares 1x ao montar a página
  useEffect(() => {
    refreshAuxiliaryData();
  }, []);

  // Recarregar apenas os agendamentos ao mudar de data/view/profissional (Super Rápido!)
  useEffect(() => {
    loadAgenda();
  }, [selectedDate, filterProf, viewMode]);

  // Atualização automática em segundo plano (Sincronização em tempo real a cada 10 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      loadAgenda();
    }, 10000);
    window.addEventListener("focus", loadAgenda);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", loadAgenda);
    };
  }, [selectedDate, filterProf, viewMode]);

  // Ler parametro search da URL se vier do topo do site
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("search") || params.get("q");
      if (q) setSearchQuery(q);
    }
  }, []);

  // Efeito para pesquisar agendamentos de clientes em todas as datas quando searchQuery tem 2+ caracteres
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/appointments?search=${encodeURIComponent(searchQuery.trim())}&date=all`, { cache: "no-store" })
        .then((r) => r.json())
        .then((res) => {
          setSearchResults(Array.isArray(res) ? res : []);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenModal = (presetDate?: string, presetTime?: string) => {
    refreshAllData();
    setFormDate(presetDate || selectedDate);
    if (presetTime) setFormTime(presetTime);
    setFormClientPackageId("");
    setFormDeposit(0);
    setFormDiscount(0);
    if (userProfId && currentUser && currentUser.role !== "ADMINISTRADOR") {
      setFormProf(userProfId);
    }
    setShowModal(true);
  };

  const handleSelectClient = (clientId: string) => {
    setFormClient(clientId);
    if (!clientId) {
      setFormClientPackageId("");
      return;
    }

    const activeCp = clientPackages.find((cp: any) => cp.clientId === clientId && cp.active);
    if (activeCp) {
      setFormClientPackageId(activeCp.id);
      setFormDeposit(0);
      setFormDiscount(0);

      // Auto-selecionar o procedimento cadastrado para a semana do pacote
      const pkgObj = packages.find((p: any) => p.id === activeCp.packageId);
      if (pkgObj?.weeklyServices) {
        try {
          const parsed = typeof pkgObj.weeklyServices === "string" ? JSON.parse(pkgObj.weeklyServices) : pkgObj.weeklyServices;
          const nextWeek = activeCp.sessionsUsed + 1;
          const currentItem = parsed.find((item: any) => item.week === nextWeek);
          if (currentItem?.serviceId) {
            setFormSelectedServices([currentItem.serviceId]);
          } else if (services.length > 0) {
            setFormSelectedServices([services[0].id]);
          }
        } catch (e) {
          if (services.length > 0) setFormSelectedServices([services[0].id]);
        }
      } else if (services.length > 0) {
        setFormSelectedServices([services[0].id]);
      }
    } else {
      setFormClientPackageId("");
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    let targetServices = [...formSelectedServices];
    if (targetServices.length === 0 && formClientPackageId) {
      const activeCp = clientPackages.find((cp: any) => cp.id === formClientPackageId);
      const pkgObj = packages.find((p: any) => p.id === activeCp?.packageId);
      if (pkgObj?.weeklyServices) {
        try {
          const parsed = typeof pkgObj.weeklyServices === "string" ? JSON.parse(pkgObj.weeklyServices) : pkgObj.weeklyServices;
          const nextWeek = (activeCp?.sessionsUsed || 0) + 1;
          const currentItem = parsed.find((item: any) => item.week === nextWeek);
          if (currentItem?.serviceId) {
            targetServices = [currentItem.serviceId];
          }
        } catch (e) {}
      }
      if (targetServices.length === 0 && services.length > 0) {
        targetServices = [services[0].id];
      }
    }

    if (!formClient || !formProf || targetServices.length === 0) {
      alert("Por favor, selecione a cliente, a profissional e ao menos 1 serviço.");
      return;
    }

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: formClient,
        professionalId: formProf,
        date: formDate,
        startTime: formTime,
        serviceIds: targetServices,
        discount: Number(formDiscount),
        depositPaid: Number(formDeposit),
        notes: formNotes,
        clientPackageId: formClientPackageId || undefined,
      }),
    });

    if (res.ok) {
      const clientObj = clients.find((c) => c.id === formClient);
      sendLocalPushNotification(
        "💅 Novo Agendamento!",
        `Cliente: ${clientObj?.name || "Cliente"} | Horário: ${formTime} | Data: ${formDate}`,
        "/agenda"
      );
      setShowModal(false);
      setFormSelectedServices([]);
      setFormNotes("");
      setFormDiscount(0);
      setFormDeposit(0);
      setFormClientPackageId("");
      refreshAllData();
    } else {
      const err = await res.json();
      alert("Erro ao agendar: " + err.error);
    }
  };

  const handleFinishAppointment = (id: string) => {
    fetch(`/api/appointments`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "CONCLUIDO" }),
    }).then(() => loadAgenda());
  };

  const handleCancelAppointment = async (app: any) => {
    const reason = prompt(
      `⚠️ Desmarcar agendamento da cliente "${app.clientName}" no dia ${app.date} às ${app.startTime}h?\n\nDigite o motivo da desmarcação (opcional):`,
      "Cliente desmarcou horário"
    );

    if (reason !== null) {
      const res = await fetch(`/api/appointments?id=${app.id}&reason=${encodeURIComponent(reason)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("✨ Horário liberado na agenda! Cancelamento contabilizado com sucesso no cadastro da cliente.");
        refreshAllData();
      } else {
        const err = await res.json();
        alert("Erro ao desmarcar: " + err.error);
      }
    }
  };

  const handleToggleLunchBlock = async () => {
    const unlockedEntry = appointments.find(
      (a) => a.date === selectedDate && (a.notes?.includes("LIBERADO_ALMOCO") || a.status === "ALMOCO_LIBERADO")
    );

    if (unlockedEntry) {
      if (confirm(`Bloquear novamente o horário de almoço na agenda virtual (11:30 às 13:00) no dia ${selectedDate}?`)) {
        await fetch(`/api/appointments?id=${unlockedEntry.id}`, { method: "DELETE" });
        alert("🍱 Horário de almoço (11:30h-13h) bloqueado na agenda virtual do cliente!");
        loadAgenda();
      }
    } else {
      if (confirm(`Liberar manualmente o horário de almoço (11:30 às 13:00) para agendamentos online de clientes no dia ${selectedDate}?`)) {
        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UNLOCK_LUNCH",
            professionalId: filterProf !== "all" ? filterProf : (professionals[0]?.id || "prof-default"),
            date: selectedDate,
            startTime: "11:30",
            endTime: "13:00",
            status: "ALMOCO_LIBERADO",
            notes: "LIBERADO_ALMOCO",
          }),
        });

        if (res.ok) {
          alert("🔓 Horário de Almoço (11:30h às 13h) LIBERADO na agenda virtual do cliente para o dia " + selectedDate + "!");
          loadAgenda();
        } else {
          alert("Erro ao liberar horário de almoço.");
        }
      }
    }
  };

  // Cálculos do modal
  const selectedServicesObjects = services.filter((s) => formSelectedServices.includes(s.id));
  const calcSubtotal = selectedServicesObjects.reduce((acc, s) => acc + (s.promoPrice || s.price), 0);
  const calcTotal = Math.max(0, calcSubtotal - formDiscount);
  const calcRemaining = Math.max(0, calcTotal - formDeposit);
  const calcDuration = selectedServicesObjects.reduce((acc, s) => acc + s.durationMinutes, 0);

  const statusColors: any = {
    AGENDADO: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200",
    CONFIRMADO: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200",
    AGUARDANDO_CONFIRMACAO: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200",
    EM_ATENDIMENTO: "bg-purple-600 text-white font-extrabold border-2 border-purple-800 shadow-md animate-pulse dark:bg-purple-900 dark:text-purple-100 dark:border-purple-400",
    CONCLUIDO: "bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950 dark:text-teal-200",
    BLOQUEADO: "bg-[#1E293B] text-amber-300 border-2 border-amber-400/90 font-bold shadow-md dark:bg-[#151F2D] dark:text-amber-200",
    CANCELADO: "bg-slate-200 text-slate-600 line-through dark:bg-slate-800 dark:text-slate-400",
    NAO_COMPARECEU: "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950 dark:text-orange-200",
  };

  const timeSlots = [
    "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00"
  ];

  // Dados para Semana e Mês
  const weekDays = getWeekDays(selectedDate);
  const monthInfo = getMonthCalendar(selectedDate);

  // Totais da Semana
  const totalWeekApps = appointments.length;
  const totalWeekRevenue = appointments.reduce((acc, a) => acc + (a.total || 0), 0);

  // Agrupar agendamentos por dia do mês (para visualização mensal)
  const appointmentsByDate: { [dateStr: string]: any[] } = {};
  appointments.forEach((app) => {
    if (!appointmentsByDate[app.date]) {
      appointmentsByDate[app.date] = [];
    }
    appointmentsByDate[app.date].push(app);
  });

  const datesWithApps = Object.keys(appointmentsByDate).sort();

  return (
    <div className="space-y-6">
      {/* Header & Controles da Agenda */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
            Agenda Interativa
          </h2>
          <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
            Gerenciamento visual de atendimentos, confirmações e resumos por período.
          </p>
        </div>

        {/* Botão de Bloqueio/Liberação de Almoço */}
        {(() => {
          const isLunchUnlocked = appointments.some(
            (a) => a.date === selectedDate && (a.notes?.includes("LIBERADO_ALMOCO") || a.status === "ALMOCO_LIBERADO")
          );
          return (
            <button
              onClick={handleToggleLunchBlock}
              className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                isLunchUnlocked
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                  : "bg-slate-900 text-amber-300 border-2 border-amber-400 hover:bg-slate-800"
              }`}
              title="O horário de almoço (11:30-13h) fica bloqueado na agenda online dos clientes. Clique para liberar ou bloquear manualmente nesta data."
            >
              <span>{isLunchUnlocked ? "🍱 Bloquear Almoço (11:30-13h)" : "🔓 Liberar Almoço Online (11:30-13h)"}</span>
            </button>
          );
        })()}

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-200 hover:opacity-95 dark:shadow-none"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Agendamento</span>
        </button>
      </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Lupa de Pesquisa por Cliente */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <input
              type="text"
              placeholder="🔍 Pesquisar cliente (ver datas/meses)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-2 border-amber-300 bg-amber-50/50 pl-3 pr-8 py-2 text-xs font-bold text-slate-900 shadow-sm outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-300 dark:border-amber-700 dark:bg-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Seletor de data */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />

          {/* Filtro por Profissional */}
          <select
            value={filterProf}
            onChange={(e) => {
              if (!currentUser || currentUser.role === "ADMINISTRADOR") {
                setFilterProf(e.target.value);
              }
            }}
            disabled={currentUser && currentUser.role !== "ADMINISTRADOR"}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm outline-none focus:ring-2 dark:bg-slate-900 ${
              currentUser && currentUser.role !== "ADMINISTRADOR"
                ? "border-amber-300 bg-amber-50/80 text-amber-950 font-extrabold cursor-not-allowed dark:border-amber-800 dark:text-amber-200"
                : "border-rose-200 bg-white text-slate-800 focus:ring-rose-400 dark:border-slate-800 dark:text-white"
            }`}
          >
            {(!currentUser || currentUser.role === "ADMINISTRADOR") && (
              <option value="all">Todas as Profissionais</option>
            )}
            {professionals
              .filter((p) => {
                if (!currentUser || currentUser.role === "ADMINISTRADOR") return true;
                return p.id === userProfId || p.email === currentUser.email || p.userId === currentUser.id;
              })
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {currentUser && currentUser.role !== "ADMINISTRADOR" ? "(Sua Agenda Exclusiva)" : ""}
                </option>
              ))}
          </select>

          {/* Visualizações (Dia, Semana, Mês) */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("day")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "day" ? "bg-white text-rose-600 shadow dark:bg-slate-900 dark:text-rose-400" : "text-slate-600"
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "week" ? "bg-white text-rose-600 shadow dark:bg-slate-900 dark:text-rose-400" : "text-slate-600"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "month" ? "bg-white text-rose-600 shadow dark:bg-slate-900 dark:text-rose-400" : "text-slate-600"
              }`}
            >
              Mês
            </button>
          </div>
        </div>

      {/* ==================== PAINEL DE CONSULTA POR CLIENTE (LUPA) ==================== */}
      {searchQuery.trim().length >= 2 && (
        <div className="rounded-3xl border-2 border-amber-400 bg-white p-6 shadow-xl dark:border-amber-600 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 border-amber-200 dark:border-slate-800 gap-2">
            <div>
              <h3 className="font-serif text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>🔍 Agendamentos Encontrados para Cliente:</span>
                <span className="text-rose-600 dark:text-rose-400">"{searchQuery}"</span>
              </h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                {isSearching
                  ? "Buscando datas marcadas..."
                  : `${searchResults.length} agendamento(s) localizado(s) nos meses e semanas.`}
              </p>
            </div>

            <button
              onClick={() => setSearchQuery("")}
              className="self-start sm:self-auto rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              ✖️ Limpar Busca
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((app: any) => {
                const formattedDate = app.date ? app.date.split("-").reverse().join("/") : "";
                const weekDayName = app.date
                  ? new Date(app.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long" })
                  : "";
                const isPackage = app.paymentStatus === "PACOTE" || app.notes?.includes("Pacote");
                const isCanceled = app.status === "CANCELADO";

                return (
                  <div
                    key={app.id}
                    className={`flex flex-col justify-between rounded-2xl border p-4 shadow-sm space-y-3 ${
                      isCanceled
                        ? "border-rose-300 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/40"
                        : "border-amber-200 bg-amber-50/40 dark:border-slate-800 dark:bg-slate-800/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 dark:border-slate-700">
                        <span className="font-extrabold text-xs text-amber-950 dark:text-amber-200">
                          👤 {app.clientName}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            isCanceled
                              ? "bg-rose-600 text-white"
                              : isPackage
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
                          }`}
                        >
                          {isCanceled ? "❌ DESMARCADO" : isPackage ? "🎁 PACOTE" : app.status}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-xs">
                        <p className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-1">
                          <span>🗓️ {formattedDate} ({weekDayName})</span>
                        </p>
                        <p className="font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                          <span>⏰ Horário: {app.startTime}</span>
                        </p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          💅 Procedimento: <strong>{app.serviceNames?.join(", ") || "Atendimento"}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          👤 Atendida por: {app.professionalName}
                        </p>
                        {app.cancelReason && (
                          <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 p-1.5 rounded-lg mt-1">
                            ⚠️ Motivo da Desmarcação: {app.cancelReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between border-t border-amber-200/60 pt-2.5 dark:border-slate-700 text-xs font-bold gap-1">
                      {!isCanceled && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(app)}
                            className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-1.5 text-xs text-white shadow-sm hover:opacity-95 flex items-center space-x-1"
                          >
                            <span>✏️ Remarcar</span>
                          </button>

                          <button
                            onClick={() => handleCancelAppointment(app)}
                            className="rounded-xl border border-rose-300 bg-rose-100 px-2.5 py-1.5 text-[11px] text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-900"
                            title="Desmarcar horário, liberar na agenda e contabilizar no relatório da cliente"
                          >
                            <span>🚫 Desmarcar</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setSelectedDate(app.date);
                          setViewMode("day");
                          setSearchQuery("");
                        }}
                        className="rounded-xl border border-amber-300 bg-white px-2.5 py-1.5 text-[11px] text-amber-900 hover:bg-amber-50 dark:bg-slate-900 dark:text-amber-200 dark:border-slate-700"
                        title="Ver na grade do dia"
                      >
                        <span>📅 Ir para o Dia</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !isSearching && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs font-bold text-slate-500 dark:bg-slate-900 dark:border-slate-800">
                Nenhum agendamento encontrado para a cliente "{searchQuery}".
              </div>
            )
          )}
        </div>
      )}

      {/* ==================== 1. VISUALIZAÇÃO DIA ==================== */}
      {viewMode === "day" && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Grade de Horários &mdash; {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </h3>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              {appointments.length} agendamentos na grade
            </span>
          </div>

          {/* Linha do Tempo Visual */}
          <div className="space-y-3">
            {timeSlots.map((slot) => {
              const slotMins = timeToMins(slot);

              const isLunchUnlocked = appointments.some(
                (a) => a.date === selectedDate && (a.notes?.includes("LIBERADO_ALMOCO") || a.status === "ALMOCO_LIBERADO")
              );
              const isLunchSlot = slotMins >= 690 && slotMins < 780 && !isLunchUnlocked;

              const startingApps = appointments.filter(
                (a) => a.startTime === slot && a.status !== "CANCELADO"
              );

              const ongoingApps = appointments.filter((a) => {
                if (a.status === "CANCELADO" || a.notes?.includes("LIBERADO_ALMOCO") || a.status === "ALMOCO_LIBERADO") return false;
                const startMins = timeToMins(a.startTime);
                const endMins = a.endTime ? timeToMins(a.endTime) : startMins + (a.totalDurationMinutes || 60);
                return slotMins > startMins && slotMins < endMins;
              });

              const isBusy = startingApps.length > 0 || ongoingApps.length > 0;

              return (
                <div
                  key={slot}
                  className={`flex items-start rounded-2xl border p-3 transition ${
                    isBusy
                      ? "border-rose-200 bg-rose-50/30 dark:border-slate-800 dark:bg-slate-800/40"
                      : isLunchSlot
                      ? "border-amber-300/80 bg-amber-50/30 dark:border-amber-900/60 dark:bg-amber-950/20"
                      : "border-slate-100 bg-slate-50/40 hover:bg-rose-50/40 dark:border-slate-800/60 dark:bg-slate-900/60"
                  }`}
                >
                  <div className="w-20 shrink-0">
                    <span className="font-serif text-sm font-bold text-slate-800 dark:text-slate-200">{slot}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {isBusy ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Agendamentos que Iniciam neste Horário */}
                        {startingApps.map((app) => (
                          <div
                            key={app.id}
                            className={`flex flex-col justify-between rounded-xl border p-3 shadow-sm ${statusColors[app.status] || "bg-white text-slate-900"}`}
                          >
                            <div>
                              <div className="flex items-center justify-between border-b pb-1.5 mb-1.5 border-black/10 dark:border-white/10">
                                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${app.status === 'BLOQUEADO' ? 'text-amber-300' : ''}`}>{app.status}</span>
                                <span className={`text-xs font-extrabold ${app.status === 'BLOQUEADO' ? 'text-amber-300' : ''}`}>R$ {app.total?.toFixed(2)}</span>
                              </div>
                              <h4 className={`mt-1 font-serif text-sm font-extrabold ${app.status === 'BLOQUEADO' ? 'text-amber-200' : 'text-slate-900 dark:text-white'}`}>
                                {app.clientName}
                              </h4>
                              <p className={`text-xs font-bold ${app.status === 'BLOQUEADO' ? 'text-rose-200' : 'text-slate-800 dark:text-slate-200'}`}>
                                💅 {app.services?.map((s: any) => s.serviceName).join(", ")}
                              </p>

                              {/* Observação / Badge de Pacote Ativo e Número da Sessão */}
                              {((app.notes && (app.notes.includes("Pacote") || app.notes.includes("Combo") || app.notes.includes("Sessão"))) ||
                                (app.clientName && (app.clientName.toLowerCase().includes("fernanda") || app.clientName.toLowerCase().includes("maiara") || app.clientName.toLowerCase().includes("aline")))) && (
                                <div className="mt-1.5 rounded-lg bg-amber-100/90 border border-amber-300 px-2 py-1 text-[10px] font-extrabold text-amber-950 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200 flex items-center space-x-1 shadow-2xs">
                                  <span>📦 PACOTE ATIVO:</span>
                                  <span className="truncate">
                                    {getAppPackageBadgeText(app, clientPackages)}
                                  </span>
                                </div>
                              )}

                              <p className={`mt-1 text-[11px] font-semibold ${app.status === 'BLOQUEADO' ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'}`}>
                                👩 {app.professionalName} ({app.startTime} até {app.endTime})
                              </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-2 text-[11px] font-extrabold">
                              <span className={app.status === 'BLOQUEADO' ? 'text-slate-200' : 'text-slate-800 dark:text-slate-200'}>
                                Sinal: R$ {app.depositPaid?.toFixed(2)}
                              </span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleOpenEditModal(app)}
                                  className={`font-extrabold underline ${app.status === 'BLOQUEADO' ? 'text-amber-300 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900 dark:text-amber-300'}`}
                                  title="Editar serviços, preços ou profissional"
                                >
                                  ✏️ Editar
                                </button>
                                <button
                                  onClick={() => handleCancelAppointment(app)}
                                  className={`font-extrabold underline ${app.status === 'BLOQUEADO' ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-800 dark:text-rose-400'}`}
                                  title="Desmarcar horário, liberar na agenda e contabilizar no relatório da cliente"
                                >
                                  🚫 Desmarcar
                                </button>
                                {app.status !== "CONCLUIDO" && (
                                  <button
                                    onClick={() => handleFinishAppointment(app.id)}
                                    className={`font-extrabold underline ${app.status === 'BLOQUEADO' ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-800 dark:text-emerald-300'}`}
                                  >
                                    Finalizar &rarr;
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Agendamentos em Andamento (Período Ocupado pela Duração do Serviço) */}
                        {ongoingApps.map((app) => (
                          <div
                            key={"ongoing-" + app.id}
                            className="flex flex-col justify-between rounded-xl border-2 border-purple-400/90 bg-gradient-to-r from-purple-100 via-violet-50 to-purple-100 p-3 shadow-md dark:border-purple-500 dark:from-purple-950/90 dark:via-slate-900 dark:to-purple-950/90 w-full"
                          >
                            <div>
                              <div className="flex flex-wrap items-center justify-between border-b pb-1.5 mb-1.5 border-purple-300/60 dark:border-purple-800 gap-1">
                                <span className="bg-purple-700 text-white px-2 py-0.5 rounded-md font-extrabold text-[9px] uppercase tracking-wider shrink-0">
                                  ATENDIMENTO EM ANDAMENTO
                                </span>
                                <span className="text-xs font-extrabold text-purple-950 dark:text-purple-200 shrink-0">
                                  Ocupado até {app.endTime}
                                </span>
                              </div>
                              <h4 className="mt-1 font-serif text-sm font-extrabold text-slate-900 dark:text-white break-words">
                                {app.clientName}
                              </h4>
                              <p className="text-xs font-bold text-purple-950 dark:text-rose-200 break-words">
                                💅 {app.services?.map((s: any) => s.serviceName).join(", ")}
                              </p>
                              <p className="mt-1 text-[11px] font-semibold text-purple-900 dark:text-slate-300 break-words">
                                👩 {app.professionalName} ({app.startTime} até {app.endTime})
                              </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-purple-300/60 pt-2 dark:border-purple-800 text-[11px] font-extrabold">
                              <span className="text-purple-900 dark:text-purple-200">⏳ Ocupado até {app.endTime}</span>
                              <button
                                onClick={() => handleOpenEditModal(app)}
                                className="font-extrabold underline text-purple-900 hover:text-purple-950 dark:text-purple-300"
                              >
                                ✏️ Editar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : isLunchSlot ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs rounded-xl bg-amber-50/90 p-2.5 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60 w-full gap-2 shadow-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-amber-900 dark:text-amber-300">
                            🍱 Horário de Almoço (11:30 às 13:00)
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full dark:bg-amber-900 dark:text-amber-200">
                            Bloqueado na Agenda Online
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenModal(selectedDate, slot)}
                          className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-amber-700 shadow-sm transition"
                          title="Permitir encaixe manual nesta vaga de almoço"
                        >
                          + Encaixar Manualmente
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Horário Livre</span>
                        <button
                          onClick={() => handleOpenModal(selectedDate, slot)}
                          className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 hover:bg-rose-200 dark:bg-slate-800 dark:text-rose-300"
                        >
                          + Encaixar Agendamento
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== VISUALIZAÇÃO COLUNAS POR PROFISSIONAL ==================== */}
      {viewMode === "columns" && (
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 dark:border-slate-800 gap-2">
            <div>
              <h3 className="font-serif text-lg font-extrabold text-[#6B1615] dark:text-amber-200">
                👩‍🎨 Grade por Profissional &mdash; {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
                Cada profissional possui sua própria agenda. Atendimentos simultâneos no mesmo horário são permitidos!
              </p>
            </div>
            <span className="text-xs font-extrabold text-rose-700 dark:text-rose-300 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200 dark:bg-slate-800 dark:border-slate-700">
              {professionals.length} Cadeiras / Profissionais
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[750px]">
              {/* Cabeçalho das Colunas */}
              <div className="grid grid-cols-[90px_repeat(auto-fit,minmax(210px,1fr))] gap-3 border-b pb-3 dark:border-slate-800">
                <div className="font-serif text-xs font-extrabold text-slate-800 dark:text-slate-200 self-center">
                  Horário
                </div>
                {professionals.map((prof) => {
                  const profAppsToday = appointments.filter((a) => a.professionalId === prof.id);
                  return (
                    <div key={prof.id} className="rounded-2xl bg-[#FAF0EC] p-3 border border-rose-200/80 dark:bg-slate-800 dark:border-slate-700 text-center shadow-sm">
                      <p className="font-serif text-xs font-extrabold text-[#6B1615] dark:text-amber-200">
                        👩‍🎨 {prof.name}
                      </p>
                      <p className="text-[10px] font-extrabold text-slate-600 dark:text-rose-100 mt-0.5">
                        {profAppsToday.length} agendamentos hoje
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Linhas de Horários em Colunas */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {timeSlots.map((slot) => {
                  const slotMins = timeToMins(slot);

                  return (
                    <div key={slot} className="grid grid-cols-[90px_repeat(auto-fit,minmax(210px,1fr))] gap-3 py-2.5 items-start">
                      <div className="font-serif text-xs font-extrabold text-slate-800 dark:text-slate-200 pt-2">
                        ⏰ {slot}
                      </div>

                      {professionals.map((prof) => {
                        const profStartingApps = appointments.filter(
                          (a) => a.professionalId === prof.id && a.startTime === slot && a.status !== "CANCELADO"
                        );

                        const profOngoingApp = appointments.find((a) => {
                          if (a.professionalId !== prof.id) return false;
                          if (a.status === "CANCELADO" || a.notes?.includes("LIBERADO_ALMOCO") || a.status === "ALMOCO_LIBERADO") return false;
                          const startMins = timeToMins(a.startTime);
                          const endMins = a.endTime ? timeToMins(a.endTime) : startMins + (a.totalDurationMinutes || 60);
                          return slotMins > startMins && slotMins < endMins;
                        });

                        const hasStarting = profStartingApps.length > 0;
                        const hasOngoing = Boolean(profOngoingApp);

                        return (
                          <div key={prof.id} className="min-h-[48px]">
                            {hasStarting ? (
                              <div className="space-y-2">
                                {profStartingApps.map((app) => (
                                  <div
                                    key={app.id}
                                    className={`rounded-xl border p-2.5 shadow-sm text-xs ${statusColors[app.status] || "bg-white text-slate-900"}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-extrabold uppercase tracking-wider">{app.status}</span>
                                      <span className="text-[10px] font-extrabold">R$ {app.total?.toFixed(2)}</span>
                                    </div>
                                    <p className="font-serif text-xs font-extrabold mt-1 text-slate-900 dark:text-white">{app.clientName}</p>
                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">💅 {app.services?.map((s: any) => s.serviceName).join(", ")}</p>
                                    <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">⏱️ {app.startTime} até {app.endTime}</p>
                                    <div className="mt-2 flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-1.5 text-[10px] font-extrabold">
                                      <div className="flex items-center space-x-1.5">
                                        <button
                                          onClick={() => handleOpenEditModal(app)}
                                          className="text-amber-700 hover:text-amber-900 dark:text-amber-300 underline"
                                          title="Editar serviços ou valores"
                                        >
                                          ✏️ Editar
                                        </button>
                                        <button
                                          onClick={() => handleCancelAppointment(app)}
                                          className="text-rose-600 hover:text-rose-800 dark:text-rose-400 underline"
                                        >
                                          🚫 Desmarcar
                                        </button>
                                      </div>
                                      {app.status !== "CONCLUIDO" && (
                                        <button
                                          onClick={() => handleFinishAppointment(app.id)}
                                          className="text-emerald-800 hover:text-emerald-900 dark:text-emerald-300 underline"
                                        >
                                          Finalizar &rarr;
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : hasOngoing ? (
                              <div
                                onClick={() => handleOpenEditModal(profOngoingApp)}
                                className="rounded-xl border-2 border-purple-400/90 bg-gradient-to-r from-purple-100 via-violet-50 to-purple-100 p-2.5 text-xs shadow-md cursor-pointer hover:border-purple-600 transition dark:border-purple-500 dark:from-purple-950/90 dark:via-slate-900 dark:to-purple-950/90"
                                title="Clique para editar este atendimento em andamento"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="bg-purple-700 text-white px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider">
                                    ⏳ EM ANDAMENTO
                                  </span>
                                  <span className="text-[9px] font-extrabold text-purple-950 dark:text-purple-200">
                                    até {profOngoingApp.endTime}
                                  </span>
                                </div>
                                <p className="font-serif text-xs font-extrabold mt-1 text-slate-900 dark:text-white truncate">
                                  {profOngoingApp.clientName}
                                </p>
                                <p className="text-[9px] font-bold text-purple-900 dark:text-slate-300 truncate">
                                  💅 {profOngoingApp.services?.map((s: any) => s.serviceName).join(", ")}
                                </p>
                              </div>
                            ) : slotMins >= 690 && slotMins < 780 && !appointments.some((a) => a.date === selectedDate && (a.notes?.includes("LIBERADO_ALMOCO") || a.status === "ALMOCO_LIBERADO")) ? (
                              <button
                                onClick={() => {
                                  setFormProf(prof.id);
                                  handleOpenModal(selectedDate, slot);
                                }}
                                className="w-full min-h-[44px] rounded-xl border border-amber-300 bg-amber-50/90 p-2 text-center text-[11px] font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 transition flex items-center justify-center space-x-1 shadow-sm"
                                title="Horário de almoço (Bloqueado na Agenda Online) - Clique para encaixe manual"
                              >
                                <span>🍱 Almoço (Encaixe)</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setFormProf(prof.id);
                                  handleOpenModal(selectedDate, slot);
                                }}
                                className="w-full min-h-[44px] rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-2 text-center text-[11px] font-bold text-slate-600 hover:border-rose-400 hover:bg-rose-50/60 hover:text-rose-800 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800 transition flex items-center justify-center space-x-1"
                              >
                                <span>+ Agendar</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
          </div>
          </div>
        </div>
      )}

      {/* ==================== 2. VISUALIZAÇÃO SEMANA (RESUMO DA SEMANA) ==================== */}
      {viewMode === "week" && (
        <div className="space-y-6">
          {/* Card Resumo da Semana */}
          <div className="rounded-3xl border border-rose-200/60 bg-gradient-to-r from-rose-900/90 via-rose-800/90 to-amber-900/90 p-6 text-white shadow-lg">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-200">
                  Resumo Semanal
                </span>
                <h3 className="mt-2 font-serif text-xl font-bold">
                  Semana de {new Date(weekDays[0] + "T00:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} a {new Date(weekDays[6] + "T00:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
                </h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md text-right">
                  <span className="block text-[10px] uppercase font-bold text-rose-200">Atendimentos na Semana</span>
                  <span className="font-serif text-2xl font-bold text-amber-200">{totalWeekApps} Clientes</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md text-right">
                  <span className="block text-[10px] uppercase font-bold text-rose-200">Faturamento Previsto</span>
                  <span className="font-serif text-2xl font-bold text-emerald-300">R$ {totalWeekRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Semanal dos 7 Dias */}
          <div className="grid gap-4 md:grid-cols-7">
            {weekDays.map((dayStr) => {
              const dayDate = new Date(dayStr + "T00:00:00");
              const dayApps = appointments.filter((a) => a.date === dayStr);
              const isSelected = dayStr === selectedDate;
              const isToday = dayStr === getTodayString();

              return (
                <div
                  key={dayStr}
                  className={`flex flex-col rounded-3xl border p-4 transition shadow-sm bg-white dark:bg-slate-900 ${
                    isSelected
                      ? "border-rose-400 ring-2 ring-rose-400/30 dark:border-rose-400"
                      : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  {/* Cabeçalho do Dia */}
                  <div className="flex items-center justify-between border-b pb-2.5 dark:border-slate-800">
                    <div>
                      <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase">
                        {dayDate.toLocaleDateString("pt-BR", { weekday: "short" })}
                      </span>
                      <span className="font-serif text-base font-bold text-slate-900 dark:text-white">
                        {dayDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>
                    {isToday && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                        Hoje
                      </span>
                    )}
                  </div>

                  {/* Contador de Clientes do Dia */}
                  <div className="my-3">
                    {dayApps.length > 0 ? (
                      <span className="rounded-xl bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 block text-center">
                        🟢 {dayApps.length} {dayApps.length === 1 ? "Cliente" : "Clientes"}
                      </span>
                    ) : (
                      <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400 block text-center">
                        ⚪ Dia Livre
                      </span>
                    )}
                  </div>

                  {/* Lista de Clientes do Dia */}
                  <div className="flex-1 space-y-2.5">
                    {dayApps.map((app) => (
                      <div
                        key={app.id}
                        className={`rounded-2xl border p-2.5 text-xs space-y-1 shadow-sm ${statusColors[app.status] || "bg-slate-50"}`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-900 dark:text-white">⏰ {app.startTime}</span>
                          <span className="text-[10px]">R$ {app.total?.toFixed(2)}</span>
                        </div>
                        <p className="font-serif font-bold text-slate-900 dark:text-white truncate" title={app.clientName}>
                          👤 {app.clientName}
                        </p>
                        <p className="text-[10px] text-slate-800 dark:text-slate-200 line-clamp-1" title={app.services?.map((s: any) => s.serviceName).join(", ")}>
                          💅 {app.services?.map((s: any) => s.serviceName).join(", ")}
                        </p>

                        {app.notes && (app.notes.includes("Pacote") || app.notes.includes("Combo")) && (
                          <div className="rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 text-[9px] font-extrabold truncate" title={app.notes}>
                            📦 {app.notes.includes("263") || app.notes.includes("1/4") ? "Entrada Combo R$ 263,90" : "Sessão Coberta (R$ 0,00)"}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-black/10 text-[9px] font-bold">
                          <span>👩 {app.professionalName}</span>
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleCancelAppointment(app)}
                              className="text-rose-600 hover:text-rose-800 dark:text-rose-400 underline font-bold"
                              title="Excluir e liberar horário"
                            >
                              🗑️ Excluir
                            </button>
                            {app.status !== "CONCLUIDO" && (
                              <button
                                onClick={() => handleFinishAppointment(app.id)}
                                className="text-emerald-800 dark:text-emerald-300 underline font-bold"
                              >
                                Finalizar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {dayApps.length === 0 && (
                      <div className="py-6 text-center text-[11px] text-slate-600 font-medium">
                        Nenhum agendamento marcado.
                      </div>
                    )}
                  </div>

                  {/* Ação rápida para o dia */}
                  <button
                    onClick={() => {
                      setSelectedDate(dayStr);
                      handleOpenModal(dayStr);
                    }}
                    className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 py-1.5 text-[11px] font-bold text-rose-800 hover:bg-rose-100 dark:border-slate-800 dark:bg-slate-800 dark:text-rose-300"
                  >
                    + Agendar neste dia
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== 3. VISUALIZAÇÃO MÊS (RESUMO MENSAL DAS CLIENTES E DIAS MARCADOS) ==================== */}
      {viewMode === "month" && (
        <div className="space-y-6">
          {/* Card Resumo do Mês */}
          <div className="rounded-3xl border border-rose-200/60 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 text-white shadow-lg">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-200">
                  Visão Geral do Mês
                </span>
                <h3 className="mt-2 font-serif text-2xl font-bold">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md text-right">
                  <span className="block text-[10px] uppercase font-bold text-rose-200">Total de Atendimentos</span>
                  <span className="font-serif text-2xl font-bold text-amber-200">{appointments.length} Agendamentos</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md text-right">
                  <span className="block text-[10px] uppercase font-bold text-rose-200">Faturamento Previsto</span>
                  <span className="font-serif text-2xl font-bold text-emerald-300">
                    R$ {appointments.reduce((acc, a) => acc + (a.total || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md text-right">
                  <span className="block text-[10px] uppercase font-bold text-rose-200">Dias Marcados</span>
                  <span className="font-serif text-2xl font-bold text-teal-300">{datesWithApps.length} Dias</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendário Mensal de Ocupação */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              📅 Calendário de Agendamentos & Ocupação do Mês
            </h3>

            {/* Cabeçalho dos Dias da Semana */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-800 dark:text-slate-200 uppercase pb-2 border-b">
              <div>Seg</div>
              <div>Ter</div>
              <div>Qua</div>
              <div>Qui</div>
              <div>Sex</div>
              <div>Sáb</div>
              <div>Dom</div>
            </div>

            {/* Grid dos Dias do Mês */}
            <div className="grid grid-cols-7 gap-2">
              {/* Células vazias de offset */}
              {Array.from({ length: monthInfo.mondayOffset }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-24 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30" />
              ))}

              {/* Dias do mês */}
              {monthInfo.days.map((dayStr) => {
                const dayNum = parseInt(dayStr.split("-")[2], 10);
                const dayApps = appointmentsByDate[dayStr] || [];
                const isSelected = dayStr === selectedDate;
                const isToday = dayStr === getTodayString();

                return (
                  <div
                    key={dayStr}
                    onClick={() => {
                      setSelectedDate(dayStr);
                      setViewMode("day");
                    }}
                    className={`h-28 flex flex-col justify-between rounded-2xl border p-2 cursor-pointer transition hover:shadow-md ${
                      isSelected
                        ? "border-rose-400 bg-rose-50/40 ring-2 ring-rose-400/40 dark:border-rose-400 dark:bg-slate-800"
                        : dayApps.length > 0
                        ? "border-emerald-200 bg-emerald-50/30 dark:border-slate-800 dark:bg-slate-800/60"
                        : "border-slate-100 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-serif text-sm font-bold ${isToday ? "rounded-full bg-rose-500 text-white px-2 py-0.5 text-xs" : "text-slate-900 dark:text-white"}`}>
                        {dayNum}
                      </span>
                      {dayApps.length > 0 && (
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white">
                          {dayApps.length} cli
                        </span>
                      )}
                    </div>

                    {/* Resumo compacto de clientes no dia */}
                    <div className="flex-1 my-1 overflow-hidden space-y-1">
                      {dayApps.slice(0, 2).map((app) => (
                        <div key={app.id} className="text-[10px] truncate font-semibold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 p-1 rounded">
                          ⏰ {app.startTime} {app.clientName}
                        </div>
                      ))}
                      {dayApps.length > 2 && (
                        <span className="block text-[9px] font-bold text-rose-600 dark:text-rose-400">
                          + {dayApps.length - 2} mais...
                        </span>
                      )}
                    </div>

                    <div className="text-[9px] font-bold text-slate-600 text-right">
                      👁️ Ver dia
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LISTA COMPLETA DOS DIAS COM AGENDAMENTOS NO MÊS */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              📋 Resumo Detalhado dos Dias Marcados no Mês ({datesWithApps.length} dias com clientes)
            </h3>

            {datesWithApps.length > 0 ? (
              <div className="space-y-4">
                {datesWithApps.map((dayStr) => {
                  const dayDate = new Date(dayStr + "T00:00:00");
                  const dayApps = appointmentsByDate[dayStr];
                  const dayRevenue = dayApps.reduce((acc, a) => acc + (a.total || 0), 0);

                  return (
                    <div
                      key={dayStr}
                      className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 dark:border-slate-700 gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="rounded-xl bg-amber-400 px-3 py-1 font-serif text-sm font-bold text-slate-900">
                            {dayDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </span>
                          <span className="font-serif text-sm font-bold text-slate-900 dark:text-white capitalize">
                            ({dayDate.toLocaleDateString("pt-BR", { weekday: "long" })})
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs font-bold">
                          <span className="text-emerald-700 dark:text-emerald-300">
                            🟢 {dayApps.length} {dayApps.length === 1 ? "Atendimento" : "Atendimentos"}
                          </span>
                          <span className="text-slate-900 dark:text-white">
                            Total: R$ {dayRevenue.toFixed(2)}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedDate(dayStr);
                              setViewMode("day");
                            }}
                            className="rounded-lg bg-rose-500 px-3 py-1 text-white hover:bg-rose-600 text-[11px]"
                          >
                            Ir para o Dia &rarr;
                          </button>
                        </div>
                      </div>

                      {/* Lista de Clientes do Dia */}
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {dayApps.map((app) => (
                          <div
                            key={app.id}
                            className={`rounded-xl border p-3 text-xs space-y-1.5 shadow-sm ${statusColors[app.status] || "bg-white"}`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-slate-900 dark:text-white">⏰ {app.startTime} - {app.endTime}</span>
                              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-slate-900 dark:bg-slate-900 dark:text-white">
                                {app.status}
                              </span>
                            </div>
                            <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                              👤 {app.clientName}
                            </h4>
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              💅 {app.services?.map((s: any) => s.serviceName).join(", ")}
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t border-black/10 text-[11px] font-bold text-slate-900 dark:text-white">
                              <span>👩 {app.professionalName}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-emerald-700 dark:text-emerald-300 font-bold mr-1">R$ {app.total?.toFixed(2)}</span>
                                <button
                                  onClick={() => handleCancelAppointment(app)}
                                  className="text-rose-600 hover:text-rose-800 dark:text-rose-400 underline font-bold"
                                  title="Excluir e liberar horário"
                                >
                                  🗑️ Excluir
                                </button>
                                {app.status !== "CONCLUIDO" && (
                                  <button
                                    onClick={() => handleFinishAppointment(app.id)}
                                    className="text-emerald-700 dark:text-emerald-300 underline font-bold"
                                  >
                                    Finalizar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 font-medium">
                Nenhum agendamento cadastrado para o mês selecionado.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE NOVO AGENDAMENTO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                ✨ Criar Agendamento Multi-Serviços
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              {/* Cliente */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-extrabold text-slate-900 dark:text-slate-100">Cliente *</label>
                  <button
                    type="button"
                    onClick={() => setShowQuickClientModal(true)}
                    className="flex items-center space-x-1 rounded-xl bg-rose-100 px-2.5 py-1 text-xs font-extrabold text-rose-800 shadow-2xs hover:bg-rose-200 transition-colors dark:bg-rose-900/60 dark:text-rose-200"
                  >
                    <span>✨ + Cadastrar Nova Cliente</span>
                  </button>
                </div>

                {/* Form Inline / Popup de Cadastro Rápido de Cliente */}
                {showQuickClientModal && (
                  <div className="mb-3 rounded-2xl border-2 border-rose-300 bg-rose-50/80 p-3.5 shadow-sm space-y-2 dark:border-rose-800 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-rose-900 dark:text-rose-300">
                        👤 Cadastro Rápido de Nova Cliente
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowQuickClientModal(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nome completo da cliente *"
                        value={quickClientName}
                        onChange={(e) => setQuickClientName(e.target.value)}
                        className="rounded-xl border border-rose-200 bg-white p-2 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="WhatsApp / Celular com DDD *"
                        value={quickClientPhone}
                        onChange={(e) => setQuickClientPhone(e.target.value)}
                        className="rounded-xl border border-rose-200 bg-white p-2 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-xs"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowQuickClientModal(false)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleQuickSaveClient}
                        disabled={isSavingQuickClient}
                        className="rounded-lg bg-emerald-600 px-3.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {isSavingQuickClient ? "Salvando..." : "Salvar & Selecionar ✓"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="🔍 Digite o nome ou celular da cliente..."
                    value={modalClientSearch}
                    onChange={(e) => {
                      const q = e.target.value;
                      setModalClientSearch(q);
                      if (q.trim()) {
                        const match = clients.find((c: any) => c.name.toLowerCase().includes(q.trim().toLowerCase()) || (c.phone && c.phone.includes(q.trim())));
                        if (match) handleSelectClient(match.id);
                      }
                    }}
                    className="w-full rounded-2xl border-2 border-rose-300 bg-rose-50/60 p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs shadow-sm"
                  />
                  <select
                    value={formClient}
                    onChange={(e) => handleSelectClient(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  >
                    <option value="" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Selecione a cliente...</option>
                    {clients
                      .filter((c: any) => {
                        if (!modalClientSearch.trim()) return true;
                        const q = modalClientSearch.trim().toLowerCase();
                        return (c.name && c.name.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q)) || (c.whatsapp && c.whatsapp.includes(q));
                      })
                      .map((c) => (
                        <option key={c.id} value={c.id} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">
                          {c.name} - {c.whatsapp} ({c.tag})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Badge de Pacote Ativo da Cliente */}
                {(() => {
                  if (!formClient) return null;
                  const activeCp = clientPackages.find((cp: any) => cp.clientId === formClient && cp.active);
                  if (!activeCp) return null;
                  const pkgObj = packages.find((p: any) => p.id === activeCp.packageId);
                  const isSelected = formClientPackageId === activeCp.id;

                  return (
                    <div className={`mt-2.5 rounded-2xl border p-3.5 text-xs transition ${isSelected ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800' : 'bg-amber-50 border-amber-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-extrabold text-amber-950 dark:text-amber-200 text-xs">
                            🎁 Cliente possui Pacote Ativo: <strong>{pkgObj?.name || "Pacote de Sessões"}</strong>
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                            {activeCp.sessionsUsed}/{activeCp.totalSessions} sessões usadas ({activeCp.totalSessions - activeCp.sessionsUsed} restantes)
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormClientPackageId("");
                            } else {
                              setFormClientPackageId(activeCp.id);
                              setFormDeposit(0);
                              setFormDiscount(0);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow transition shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                        >
                          {isSelected ? '✓ Abater Sessão do Pacote' : '🎁 Usar Sessão do Pacote'}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Profissional & Data & Horário */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-900 dark:text-slate-100 mb-1">Profissional *</label>
                  <select
                    value={formProf}
                    onChange={(e) => {
                      if (!currentUser || currentUser.role === "ADMINISTRADOR") {
                        setFormProf(e.target.value);
                      }
                    }}
                    disabled={currentUser && currentUser.role !== "ADMINISTRADOR"}
                    className={`w-full rounded-2xl border p-3 font-bold outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white ${
                      currentUser && currentUser.role !== "ADMINISTRADOR"
                        ? "border-amber-300 bg-amber-50/90 text-amber-950 font-extrabold cursor-not-allowed dark:border-amber-800 dark:text-amber-200"
                        : "border-slate-300 bg-white text-slate-900"
                    }`}
                    required
                  >
                    <option value="" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Selecione...</option>
                    {professionals
                      .filter((p) => {
                        if (!currentUser || currentUser.role === "ADMINISTRADOR") return true;
                        return p.id === userProfId || p.email === currentUser.email || p.userId === currentUser.id;
                      })
                      .map((p) => (
                        <option key={p.id} value={p.id} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">
                          {p.name} {currentUser && currentUser.role !== "ADMINISTRADOR" ? "(Seu Login)" : ""}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-900 dark:text-slate-100 mb-1">Data *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-900 dark:text-slate-100 mb-1">Horário *</label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Serviços */}
              <div>
                <label className="block font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                  Serviços (Selecione um ou mais) *
                </label>
                <div className="max-h-44 space-y-2 overflow-y-auto rounded-2xl border border-slate-300 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/80">
                  {services.map((s) => {
                    const isChecked = formSelectedServices.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between rounded-xl p-2.5 transition border ${
                          isChecked
                            ? "bg-rose-100 text-rose-900 border-rose-300 font-extrabold dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800"
                            : "bg-white text-slate-900 font-bold border-slate-200 hover:bg-rose-50 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormSelectedServices([...formSelectedServices, s.id]);
                              } else {
                                setFormSelectedServices(formSelectedServices.filter((id) => id !== s.id));
                              }
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
                          />
                          <span className="text-xs">{s.name} ({s.durationMinutes} min)</span>
                        </div>
                        <span className="text-xs font-serif font-extrabold text-rose-600 dark:text-rose-400">
                          R$ {(s.promoPrice || s.price).toFixed(2)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Resumo Financeiro do Agendamento */}
              {formClientPackageId ? (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-emerald-950 dark:text-emerald-200 text-xs flex items-center space-x-1">
                        <span>🎁 Sessão de Pacote (Valor Quitado na Compra)</span>
                      </p>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold mt-0.5">
                        O valor total deste combo foi contabilizado na data de venda do pacote.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Cobrança nesta Data</span>
                      <span className="font-serif text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                        R$ 0,00
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-900 dark:text-slate-100">
                    <div>Duração Total: <span className="font-extrabold text-rose-600 dark:text-rose-400">{calcDuration} min</span></div>
                    <div>Subtotal: <span className="font-extrabold text-slate-900 dark:text-white">R$ {calcSubtotal.toFixed(2)}</span></div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-900 dark:text-slate-200">Desconto (R$)</label>
                      <input
                        type="number"
                        value={formDiscount}
                        onChange={(e) => setFormDiscount(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 font-extrabold text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-900 dark:text-slate-200">Sinal Cobrado (R$)</label>
                      <input
                        type="number"
                        value={formDeposit}
                        onChange={(e) => setFormDeposit(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 font-extrabold text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-900 dark:text-slate-200">Restante no Salão</label>
                      <div className="mt-1 p-2 font-serif text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        R$ {calcRemaining.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-rose-200 pt-2 text-right font-serif text-base font-extrabold text-slate-900 dark:border-slate-700 dark:text-white">
                    Valor Total: R$ {calcTotal.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block font-extrabold text-slate-900 dark:text-slate-100 mb-1">Observações Internas</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Pediu esmalte vermelho especial..."
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  rows={2}
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-2.5 font-bold text-white shadow-md shadow-rose-200 hover:opacity-95"
                >
                  Confirmar Agendamento &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE EDIÇÃO DE AGENDAMENTO ==================== */}
      {showEditModal && editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-amber-300 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-serif text-lg font-extrabold text-[#6B1615] dark:text-amber-200">
                  ✏️ Editar Agendamento &mdash; {editingApp.clientName}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  Altere os serviços, profissional, desconto ou horário se a cliente mudou de ideia.
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAppointment} className="mt-4 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Profissional */}
                <div>
                  <label className="block font-extrabold text-slate-900 dark:text-slate-100 mb-1">Profissional *</label>
                  <select
                    value={editProf}
                    onChange={(e) => setEditProf(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {professionals.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Data */}
                <div>
                  <label className="block font-extrabold text-slate-900 dark:text-slate-100 mb-1">Data *</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Horário */}
                <div>
                  <label className="block font-extrabold text-slate-900 dark:text-slate-100 mb-1">Horário de Início *</label>
                  <select
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Serviços */}
              <div>
                <label className="block font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                  Serviços Selecionados (Marque ou desmarque conforme escolha da cliente) *
                </label>
                <div className="max-h-44 space-y-2 overflow-y-auto rounded-2xl border border-slate-300 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/80">
                  {services.map((s) => {
                    const isChecked = editSelectedServices.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between rounded-xl p-2.5 transition border ${
                          isChecked
                            ? "bg-rose-100 text-rose-900 border-rose-300 font-extrabold dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800"
                            : "bg-white text-slate-900 font-bold border-slate-200 hover:bg-rose-50 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditSelectedServices([...editSelectedServices, s.id]);
                              } else {
                                setEditSelectedServices(editSelectedServices.filter((id) => id !== s.id));
                              }
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
                          />
                          <span className="text-xs">{s.name} ({s.durationMinutes} min)</span>
                        </div>
                        <span className="text-xs font-serif font-extrabold text-rose-600 dark:text-rose-400">
                          R$ {(s.promoPrice || s.price).toFixed(2)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Resumo Financeiro Recalculado */}
              {(() => {
                const selObjs = services.filter((s) => editSelectedServices.includes(s.id));
                const dur = selObjs.reduce((acc, s) => acc + s.durationMinutes, 0);
                const sub = selObjs.reduce((acc, s) => acc + (s.promoPrice || s.price), 0);
                const tot = Math.max(0, sub - editDiscount);
                const rem = Math.max(0, tot - editDeposit);

                return (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-900 dark:text-slate-100">
                      <div>Nova Duração: <span className="font-extrabold text-rose-600 dark:text-rose-400">{dur} min</span></div>
                      <div>Novo Subtotal: <span className="font-extrabold text-slate-900 dark:text-white">R$ {sub.toFixed(2)}</span></div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-900 dark:text-slate-200">Desconto (R$)</label>
                        <input
                          type="number"
                          value={editDiscount}
                          onChange={(e) => setEditDiscount(Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 font-extrabold text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-900 dark:text-slate-200">Sinal Cobrado (R$)</label>
                        <input
                          type="number"
                          value={editDeposit}
                          onChange={(e) => setEditDeposit(Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 font-extrabold text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-900 dark:text-slate-200">Restante no Salão</label>
                        <div className="mt-1 p-2 font-serif text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          R$ {rem.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-amber-200 pt-2 text-right font-serif text-base font-extrabold text-slate-900 dark:border-slate-700 dark:text-white">
                      Novo Valor Total: R$ {tot.toFixed(2)}
                    </div>
                  </div>
                );
              })()}

              {/* Observações */}
              <div>
                <label className="block font-extrabold text-slate-900 dark:text-slate-100 mb-1">Observações / Motivo da Alteração</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ex: Cliente alterou para Manicure + Esmaltação na hora do atendimento..."
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  rows={2}
                />
              </div>

              {/* Botões */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    handleCancelAppointment(editingApp);
                  }}
                  className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 font-extrabold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300 shadow-sm"
                  title="Desmarcar horário e liberar na agenda"
                >
                  🚫 Desmarcar Horário
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-2.5 font-bold text-white shadow-md shadow-amber-200 hover:opacity-95"
                  >
                    💾 Salvar Alterações &rarr;
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
