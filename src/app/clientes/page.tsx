"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  Sparkles,
  Calendar,
  DollarSign,
  Heart,
  Image as ImageIcon,
  Tag,
  X,
  Camera,
  CheckCircle,
  Edit,
  Trash2,
  Upload,
} from "lucide-react";

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form de cadastro (Novo)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [instagram, setInstagram] = useState("");
  const [notes, setNotes] = useState("");
  const [tag, setTag] = useState("NOVO");
  const [nailForm, setNailForm] = useState("Amendoado");
  const [nailColor, setNailColor] = useState("Nude Rosado");
  const [nailMaterial, setNailMaterial] = useState("Gel Moldado");
  const [nailSize, setNailSize] = useState("Médio (2)");
  const [extensionType, setExtensionType] = useState("Fibra de Vidro");
  const [nailDecoration, setNailDecoration] = useState("Francesa Reversa");

  // Form de Edição
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editTag, setEditTag] = useState("NOVO");
  const [editNailForm, setEditNailForm] = useState("Amendoado");
  const [editNailColor, setEditNailColor] = useState("Nude Rosado");
  const [editNailMaterial, setEditNailMaterial] = useState("Gel Moldado");
  const [editNailSize, setEditNailSize] = useState("Médio (2)");
  const [editExtensionType, setEditExtensionType] = useState("Fibra de Vidro");
  const [editNailDecoration, setEditNailDecoration] = useState("Francesa Reversa");

  const loadClients = () => {
    fetch("/api/clients", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setClients(data);
        if (selectedClient) {
          const updated = data.find((c: any) => c.id === selectedClient.id);
          if (updated) setSelectedClient(updated);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadClients();
    window.addEventListener("focus", loadClients);
    return () => window.removeEventListener("focus", loadClients);
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        whatsapp: phone,
        email,
        birthDate,
        instagram,
        notes,
        tag,
        nailForm,
        nailColor,
        nailMaterial,
        nailSize,
        extensionType,
        nailDecoration,
      }),
    });

    if (res.ok) {
      alert("✨ Cliente cadastrada com sucesso!");
      setShowNewModal(false);
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
      loadClients();
    } else {
      alert("Erro ao cadastrar cliente.");
    }
  };

  const handleStartEdit = (client: any) => {
    setEditId(client.id);
    setEditName(client.name || "");
    setEditPhone(client.phone || client.whatsapp || "");
    setEditEmail(client.email || "");
    setEditBirthDate(client.birthDate || "");
    setEditInstagram(client.instagram || "");
    setEditNotes(client.notes || "");
    setEditTag(client.tag || "NOVO");
    setEditNailForm(client.nailForm || "Amendoado");
    setEditNailColor(client.nailColor || "Nude Rosado");
    setEditNailMaterial(client.nailMaterial || "Gel Moldado");
    setEditNailSize(client.nailSize || "Médio (2)");
    setEditExtensionType(client.extensionType || "Fibra de Vidro");
    setEditNailDecoration(client.nailDecoration || "Francesa Reversa");
    setShowEditModal(true);
  };

  const handleDeleteClient = async (client: any) => {
    if (!client) return;
    if (
      confirm(
        `⚠️ Tem certeza que deseja EXCLUIR permanentemente o cadastro da cliente "${client.name}"?\n\nEsta ação removerá a cliente, ficha técnica e todo o histórico do sistema.`
      )
    ) {
      try {
        const res = await fetch(`/api/clients?id=${client.id}`, { method: "DELETE" });
        if (res.ok) {
          if (selectedClient?.id === client.id) {
            setSelectedClient(null);
          }
          alert(`🗑️ Cliente "${client.name}" excluída com sucesso.`);
          loadClients();
        } else {
          const err = await res.json();
          alert("Erro ao excluir cliente: " + (err.error || "Erro no servidor"));
        }
      } catch (e) {
        alert("Erro ao excluir cliente.");
      }
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/clients", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editId,
        name: editName,
        phone: editPhone,
        whatsapp: editPhone,
        email: editEmail,
        birthDate: editBirthDate,
        instagram: editInstagram,
        notes: editNotes,
        tag: editTag,
        nailForm: editNailForm,
        nailColor: editNailColor,
        nailMaterial: editNailMaterial,
        nailSize: editNailSize,
        extensionType: editExtensionType,
        nailDecoration: editNailDecoration,
      }),
    });

    if (res.ok) {
      alert("✨ Dados e anotações da cliente atualizados com sucesso!");
      setShowEditModal(false);
      loadClients();
    } else {
      alert("Erro ao atualizar dados da cliente.");
    }
  };

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClient) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem excede o tamanho máximo de 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_PHOTO",
          clientId: selectedClient.id,
          photoUrl: base64,
          type: "RESULTADO",
          description: "Foto enviada da galeria",
        }),
      });

      if (res.ok) {
        alert("✨ Foto adicionada à galeria da cliente!");
        loadClients();
      } else {
        alert("Erro ao salvar foto da cliente.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Deseja apagar esta foto da galeria da cliente?")) return;

    const res = await fetch(`/api/clients?photoId=${photoId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Foto removida!");
      loadClients();
    } else {
      alert("Erro ao remover foto.");
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone && c.phone.includes(search));
    const matchTag = filterTag === "all" || c.tag === filterTag;
    return matchSearch && matchTag;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controles */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
            Gestão de Clientes & CRM
          </h2>
          <p className="text-xs text-slate-700 dark:text-rose-100 font-semibold">
            Ficha técnica de unhas, histórico de atendimentos, galeria de fotos e métricas por cliente.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Nova Cliente</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {["all", "VIP", "FREQUENTE", "NOVO", "INATIVO"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTag(t)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition whitespace-nowrap ${
                filterTag === t
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {t === "all" ? "Todos os Perfis" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-400 to-amber-300 font-serif text-lg font-bold text-white shadow-md">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">{client.name}</h3>
                    <p className="text-xs text-slate-500">{client.phone}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    client.tag === "VIP"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : client.tag === "FREQUENTE"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                      : client.tag === "INATIVO"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  }`}
                >
                  {client.tag}
                </span>
              </div>

              {/* Ficha Técnica de Unhas */}
              <div className="mt-4 rounded-2xl bg-rose-50/60 p-3 text-xs dark:bg-slate-800/60">
                <p className="font-bold text-rose-700 dark:text-rose-400">💅 Ficha de Unhas Atual:</p>
                <div className="mt-1 grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <div>Formato: <span className="font-semibold text-slate-900 dark:text-white">{client.nailForm || "Amendoado"}</span></div>
                  <div>Material: <span className="font-semibold text-slate-900 dark:text-white">{client.nailMaterial || "Gel"}</span></div>
                  <div>Cor: <span className="font-semibold text-slate-900 dark:text-white">{client.nailColor || "Nude"}</span></div>
                  <div>Tamanho: <span className="font-semibold text-slate-900 dark:text-white">{client.nailSize || "Médio"}</span></div>
                </div>
                {client.notes && (
                  <p className="mt-2 border-t border-rose-200/60 pt-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 italic truncate">
                    📝 {client.notes}
                  </p>
                )}
              </div>

              {/* Métricas do Cliente */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                  <span className="block text-[10px] text-slate-400">TOTAL GASTO</span>
                  <span className="font-serif font-bold text-slate-900 dark:text-white">R$ {(client.totalSpent || 0).toFixed(0)}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                  <span className="block text-[10px] text-slate-400">VISITAS</span>
                  <span className="font-serif font-bold text-slate-900 dark:text-white">{client.attendanceCount || 0}x</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                  <span className="block text-[10px] text-slate-400">TICKET MÉDIO</span>
                  <span className="font-serif font-bold text-slate-900 dark:text-white">
                    R$ {client.attendanceCount > 0 ? ((client.totalSpent || 0) / client.attendanceCount).toFixed(0) : "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações do Card */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 gap-1">
              <a
                href={`https://wa.me/${(client.whatsapp || client.phone || "").replace(/\D/g, "")}`}
                target="_blank"
                className="flex items-center space-x-1 rounded-xl bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleStartEdit(client)}
                  className="flex items-center space-x-1 rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  title="Editar dados da cliente"
                >
                  <Edit className="h-3.5 w-3.5 text-amber-600" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => handleDeleteClient(client)}
                  className="flex items-center space-x-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
                  title="Excluir cadastro da cliente"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir</span>
                </button>

                <button
                  onClick={() => setSelectedClient(client)}
                  className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                >
                  Ficha &rarr;
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL FICHA COMPLETA DA CLIENTE */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-400 to-amber-300 font-serif text-xl font-bold text-white shadow-md">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">{selectedClient.name}</h3>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">{selectedClient.tag}</span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedClient.phone} | {selectedClient.email || "Sem e-mail"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    handleStartEdit(selectedClient);
                  }}
                  className="flex items-center space-x-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-amber-600"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar Dados</span>
                </button>

                <button
                  onClick={() => handleDeleteClient(selectedClient)}
                  className="flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
                  title="Excluir cadastro da cliente"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir</span>
                </button>

                <button
                  onClick={() => setSelectedClient(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Detalhes da Cliente */}
            <div className="space-y-6 text-xs">
              {/* Pacotes & Planos de Sessões Ativos */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/80">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm font-extrabold text-amber-900 dark:text-amber-300">
                    📦 Pacotes & Planos de Sessões Ativos
                  </h4>
                  <a
                    href="/pacotes"
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline dark:text-rose-400"
                  >
                    + Gerenciar / Adicionar Pacote &rarr;
                  </a>
                </div>

                {selectedClient.packages && selectedClient.packages.length > 0 ? (
                  <div className="mt-2.5 space-y-2">
                    {selectedClient.packages.map((cp: any) => {
                      const remaining = cp.totalSessions - cp.sessionsUsed;
                      return (
                        <div key={cp.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900 border border-amber-100 gap-2">
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white text-xs">{cp.packageName || "Pacote de Sessões"}</p>
                            <p className="text-[10px] text-slate-500">Validade: {new Date(cp.expiryDate).toLocaleDateString("pt-BR")}</p>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-extrabold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                              {cp.sessionsUsed} / {cp.totalSessions} sessões usadas ({remaining > 0 ? `${remaining} restantes` : "Concluído"})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-slate-500 italic">
                    Esta cliente não possui nenhum pacote ativo no momento. Acesse a área de Pacotes para vincular.
                  </p>
                )}
              </div>

              {/* Ficha Técnica de Unhas Expandida */}
              <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 p-4 dark:from-slate-800 dark:to-slate-800/80">
                <h4 className="font-serif text-sm font-bold text-rose-800 dark:text-rose-300">
                  💅 Histórico Técnico de Unhas
                </h4>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div>
                    <span className="block text-[10px] text-slate-500">FORMATO DA UNHA</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedClient.nailForm || "Amendoado"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">MATERIAL UTILIZADO</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedClient.nailMaterial || "Gel Moldado"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">COR PREFERIDA</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedClient.nailColor || "Nude Rosado"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">TAMANHO HABITUAL</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedClient.nailSize || "Médio (2)"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">TIPO DE ALONGAMENTO</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedClient.extensionType || "Fibra de Vidro"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">DECORAÇÃO FAVORITA</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedClient.nailDecoration || "Francesa Reversa"}</span>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div className="mt-3 border-t border-rose-200/80 pt-2 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                      📝 Anotações & Observações da Cliente:
                    </p>
                    <p className="mt-1 rounded-xl bg-white/80 p-2.5 font-medium text-slate-800 shadow-inner dark:bg-slate-900 dark:text-slate-200">
                      {selectedClient.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Galeria de Fotos e Trabalhos da Cliente */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Camera className="h-4 w-4 text-rose-500" />
                    <span>Galeria de Trabalhos da Cliente ({selectedClient.photos?.length || 0})</span>
                  </h4>

                  <label className="cursor-pointer inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-rose-600 transition">
                    <Upload className="h-3.5 w-3.5" />
                    <span>+ Adicionar Foto da Galeria</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {selectedClient.photos && selectedClient.photos.length > 0 ? (
                    selectedClient.photos.map((photo: any) => (
                      <div key={photo.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-800">
                        <img
                          src={photo.photoUrl}
                          alt="Foto do Trabalho"
                          className="h-36 w-full object-cover"
                        />
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute top-2 right-2 rounded-full bg-rose-600 p-1.5 text-white opacity-90 shadow-md hover:opacity-100 hover:scale-105 transition"
                          title="Apagar Foto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <>
                      <img
                        src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&auto=format&fit=crop&q=80"
                        alt="Exemplo Unhas Gel"
                        className="h-32 w-full rounded-xl object-cover shadow-sm opacity-80"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&auto=format&fit=crop&q=80"
                        alt="Exemplo Nail Art"
                        className="h-32 w-full rounded-xl object-cover shadow-sm opacity-80"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Histórico de Atendimentos */}
              <div>
                <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                  📅 Histórico Completo de Atendimentos
                </h4>
                <div className="mt-2 space-y-2">
                  {selectedClient.appointments && selectedClient.appointments.length > 0 ? (
                    selectedClient.appointments.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{app.date} às {app.startTime}</p>
                          <p className="text-[11px] text-slate-500">Serviços: {app.services?.map((s: any) => s.serviceName).join(", ")}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-serif font-bold text-slate-900 dark:text-white">R$ {(app.total || 0).toFixed(2)}</span>
                          <span className="block text-[10px] font-bold text-emerald-600">{app.status}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">Nenhum atendimento registrado anteriormente.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIÇÃO DE DADOS & ANOTAÇÕES DA CLIENTE */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border-2 border-rose-200/80 dark:bg-[#2D1B24] dark:border-rose-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 border-rose-100 dark:border-rose-900/60">
              <h3 className="font-serif text-lg font-extrabold text-[#6B1615] dark:text-white flex items-center space-x-2">
                <Edit className="h-5 w-5 text-amber-500" />
                <span>✏️ Editar Cliente & Anotações</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#1E121A] dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#1E121A] dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">Perfil / Tag</label>
                  <select
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#1E121A] dark:text-white"
                  >
                    <option value="NOVO" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">NOVO</option>
                    <option value="VIP" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">VIP</option>
                    <option value="FREQUENTE" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">FREQUENTE</option>
                    <option value="INATIVO" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">INATIVO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#1E121A] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#1E121A] dark:text-white"
                  />
                </div>
              </div>

              {/* Ficha Técnica de Unhas */}
              <div className="rounded-2xl bg-[#FAF0EC] p-4 border border-rose-200/80 space-y-3 dark:bg-[#1E121A] dark:border-rose-900/60 shadow-inner">
                <h4 className="font-serif font-extrabold text-[#6B1615] dark:text-amber-300 text-xs flex items-center space-x-1.5">
                  <span>💅 Ficha Técnica de Unhas</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">Formato da Unha</label>
                    <select
                      value={editNailForm}
                      onChange={(e) => setEditNailForm(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#2B1B24] dark:text-white"
                    >
                      <option value="Amendoado" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Amendoado</option>
                      <option value="Stiletto" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Stiletto</option>
                      <option value="Quadrado" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Quadrado</option>
                      <option value="Bailarina" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Bailarina</option>
                      <option value="Coffin" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Coffin</option>
                      <option value="Oval" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Oval</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">Material Utilizado</label>
                    <select
                      value={editNailMaterial}
                      onChange={(e) => setEditNailMaterial(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#2B1B24] dark:text-white"
                    >
                      <option value="Gel Moldado" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Gel Moldado</option>
                      <option value="Fibra de Vidro" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Fibra de Vidro</option>
                      <option value="Banho de Gel" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Banho de Gel</option>
                      <option value="Acrigel" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Acrigel</option>
                      <option value="Esmaltação em Gel" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Esmaltação em Gel</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">Cor Preferida</label>
                    <input
                      type="text"
                      value={editNailColor}
                      onChange={(e) => setEditNailColor(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#2B1B24] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">Tamanho Habitual</label>
                    <input
                      type="text"
                      value={editNailSize}
                      onChange={(e) => setEditNailSize(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#2B1B24] dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Anotações e Observações Técnicas */}
              <div>
                <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">📝 Anotações & Observações da Cliente</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ex: Cliente prefere cuticulagem funda; alérgica a esmalte tradicional; gosta de nail art delicada..."
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#1E121A] dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-2.5 font-bold text-white shadow-md hover:opacity-95"
                >
                  Salvar Alterações &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO CADASTRO */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border-2 border-rose-200/80 dark:bg-[#2D1B24] dark:border-rose-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 border-rose-100 dark:border-rose-900/60">
              <h3 className="font-serif text-lg font-extrabold text-[#6B1615] dark:text-white">
                ✨ Cadastrar Cliente & Ficha de Unhas
              </h3>
              <button onClick={() => setShowNewModal(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria Eduarda Silva..."
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#1E121A] dark:text-white placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(67) 99999-8888"
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#1E121A] dark:text-white placeholder:text-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">Data Nasc.</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#1E121A] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: cliente@email.com"
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#1E121A] dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-900 dark:text-rose-100 mb-1">📝 Anotações & Observações</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Prefere esmaltação em gel nude, cutículas sensíveis..."
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-[#1E121A] dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-2.5 font-bold text-white shadow-md hover:opacity-95"
                >
                  Salvar Cliente &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
