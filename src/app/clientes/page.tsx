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
} from "lucide-react";

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // Form de cadastro
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tag, setTag] = useState("NOVO");
  const [nailForm, setNailForm] = useState("Amendoado");
  const [nailColor, setNailColor] = useState("Nude Rosado");
  const [nailMaterial, setNailMaterial] = useState("Gel Moldado");
  const [nailSize, setNailSize] = useState("Médio (2)");
  const [extensionType, setExtensionType] = useState("Fibra de Vidro");
  const [nailDecoration, setNailDecoration] = useState("Francesa Reversa");

  const loadClients = () => {
    fetch("/api/clients", { cache: "no-store" })
      .then((res) => res.json())
      .then(setClients)
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
      loadClients();
    } else {
      alert("Erro ao cadastrar cliente.");
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchTag = filterTag === "all" || c.tag === filterTag;
    return matchSearch && matchTag;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controles */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Gestão de Clientes & CRM
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ficha técnica de unhas, histórico de atendimentos, galeria de fotos e métricas por cliente.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-200 hover:opacity-95 dark:shadow-none"
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

        <div className="flex items-center space-x-2">
          {["all", "VIP", "FREQUENTE", "NOVO", "INATIVO"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTag(t)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
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
              </div>

              {/* Métricas do Cliente */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                  <span className="block text-[10px] text-slate-400">TOTAL GASTO</span>
                  <span className="font-serif font-bold text-slate-900 dark:text-white">R$ {client.totalSpent?.toFixed(0)}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                  <span className="block text-[10px] text-slate-400">VISITAS</span>
                  <span className="font-serif font-bold text-slate-900 dark:text-white">{client.attendanceCount}x</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                  <span className="block text-[10px] text-slate-400">TICKET MÉDIO</span>
                  <span className="font-serif font-bold text-slate-900 dark:text-white">
                    R$ {client.attendanceCount > 0 ? (client.totalSpent / client.attendanceCount).toFixed(0) : "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <a
                href={`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                className="flex items-center space-x-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => setSelectedClient(client)}
                className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
              >
                Ver Ficha Completa &rarr;
              </button>
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
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-400 to-amber-300 font-serif text-xl font-bold text-white">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">{selectedClient.name}</h3>
                  <p className="text-xs text-slate-500">{selectedClient.whatsapp} | {selectedClient.email || "Sem e-mail"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Abas de Detalhes */}
            <div className="space-y-6 text-xs">
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
                    <span className="font-bold text-slate-800 dark:text-white">{selectedClient.nailColor || "Nude Rendado"}</span>
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
                    <span className="font-bold text-slate-800 dark:text-white">{selectedClient.nailDecoration || "Encapsulada"}</span>
                  </div>
                </div>
                {selectedClient.notes && (
                  <p className="mt-3 border-t border-rose-200 pt-2 text-[11px] font-semibold text-rose-900 dark:border-slate-700 dark:text-rose-200">
                    ⚠️ Observação Técnica: {selectedClient.notes}
                  </p>
                )}
              </div>

              {/* Galeria de Fotos Antes & Depois */}
              <div>
                <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                  📸 Galeria de Trabalhos (Resultado Final)
                </h4>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <img
                    src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&auto=format&fit=crop&q=80"
                    alt="Manutenção Fibra"
                    className="h-32 w-full rounded-xl object-cover shadow-sm"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&auto=format&fit=crop&q=80"
                    alt="Nail Art Encapsulada"
                    className="h-32 w-full rounded-xl object-cover shadow-sm"
                  />
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
                          <span className="font-serif font-bold text-slate-900 dark:text-white">R$ {app.total?.toFixed(2)}</span>
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

      {/* MODAL NOVO CADASTRO */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                ✨ Cadastrar Cliente & Ficha de Unhas
              </h3>
              <button onClick={() => setShowNewModal(false)} className="rounded-full p-2 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Nome Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-medium outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-medium outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Data Nasc.</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-medium outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Formato da Unha</label>
                  <select
                    value={nailForm}
                    onChange={(e) => setNailForm(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Amendoado">Amendoado</option>
                    <option value="Stiletto">Stiletto</option>
                    <option value="Quadrado">Quadrado</option>
                    <option value="Bailarina">Bailarina</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Material</label>
                  <select
                    value={nailMaterial}
                    onChange={(e) => setNailMaterial(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Fibra de Vidro">Fibra de Vidro</option>
                    <option value="Gel Moldado">Gel Moldado</option>
                    <option value="Banho de Gel">Banho de Gel</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-xl border p-2.5 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-500 px-6 p-2.5 font-bold text-white shadow-md hover:bg-rose-600"
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
