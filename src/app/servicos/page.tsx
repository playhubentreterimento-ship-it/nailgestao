"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, Clock, DollarSign, Tag, CheckCircle, FolderPlus, X, Edit2, Trash2 } from "lucide-react";

export default function ServicosPage() {
  const [data, setData] = useState<any>(null);
  
  // Modais de Criação
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);

  // Modais de Edição
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [showEditCatModal, setShowEditCatModal] = useState(false);

  // Form de Novo Serviço
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [price, setPrice] = useState(150);
  const [promoPrice, setPromoPrice] = useState<number | "">("");
  const [commissionPercent, setCommissionPercent] = useState(40);
  const [description, setDescription] = useState("");

  // Form de Nova Categoria
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  // Estado de Edição de Serviço
  const [editSrvId, setEditSrvId] = useState("");
  const [editSrvName, setEditSrvName] = useState("");
  const [editSrvCatId, setEditSrvCatId] = useState("");
  const [editSrvDuration, setEditSrvDuration] = useState(90);
  const [editSrvPrice, setEditSrvPrice] = useState(150);
  const [editSrvPromoPrice, setEditSrvPromoPrice] = useState<number | "">("");
  const [editSrvCommission, setEditSrvCommission] = useState(40);
  const [editSrvDesc, setEditSrvDesc] = useState("");

  // Estado de Edição de Categoria
  const [editCatId, setEditCatId] = useState("");
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");

  const loadServices = () => {
    fetch("/api/services", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        if (res.categories && res.categories.length > 0 && !categoryId) {
          setCategoryId(res.categories[0].id);
        }
      });
  };

  useEffect(() => {
    loadServices();
    window.addEventListener("focus", loadServices);
    return () => window.removeEventListener("focus", loadServices);
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      alert("Por favor, selecione ou crie uma categoria primeiro.");
      return;
    }

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        name,
        description,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        promoPrice: promoPrice !== "" ? Number(promoPrice) : null,
        commissionPercent: Number(commissionPercent),
      }),
    });

    if (res.ok) {
      alert("✨ Serviço cadastrado com sucesso!");
      setShowModal(false);
      setName("");
      setDescription("");
      loadServices();
    } else {
      alert("Erro ao cadastrar serviço.");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) {
      alert("Digite o nome da categoria.");
      return;
    }

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CATEGORY",
        categoryName: newCatName,
        description: newCatDesc,
      }),
    });

    if (res.ok) {
      const created = await res.json();
      alert("✨ Categoria criada com sucesso!");
      setShowCatModal(false);
      setNewCatName("");
      setNewCatDesc("");
      if (created?.id) setCategoryId(created.id);
      loadServices();
    } else {
      alert("Erro ao criar categoria.");
    }
  };

  // Abrir modal de edição de serviço
  const handleOpenEditService = (srv: any) => {
    setEditSrvId(srv.id);
    setEditSrvName(srv.name);
    setEditSrvCatId(srv.categoryId);
    setEditSrvDuration(srv.durationMinutes);
    setEditSrvPrice(srv.price);
    setEditSrvPromoPrice(srv.promoPrice ?? "");
    setEditSrvCommission(srv.commissionPercent);
    setEditSrvDesc(srv.description || "");
    setShowEditServiceModal(true);
  };

  // Salvar alteração de serviço
  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSrvId || !editSrvName) return;

    const res = await fetch("/api/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editSrvId,
        categoryId: editSrvCatId,
        name: editSrvName,
        description: editSrvDesc,
        durationMinutes: Number(editSrvDuration),
        price: Number(editSrvPrice),
        promoPrice: editSrvPromoPrice !== "" ? Number(editSrvPromoPrice) : null,
        commissionPercent: Number(editSrvCommission),
      }),
    });

    if (res.ok) {
      alert("✨ Serviço atualizado com sucesso!");
      setShowEditServiceModal(false);
      loadServices();
    } else {
      alert("Erro ao atualizar serviço.");
    }
  };

  // Excluir serviço
  const handleDeleteService = async (id: string, srvName: string) => {
    if (!confirm(`Deseja realmente excluir o serviço "${srvName}" da tabela?`)) return;

    const res = await fetch(`/api/services?id=${id}&type=service`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("🗑️ Serviço removido da tabela.");
      loadServices();
    } else {
      alert("Erro ao excluir serviço.");
    }
  };

  // Abrir modal de edição de categoria
  const handleOpenEditCategory = (cat: any) => {
    setEditCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || "");
    setShowEditCatModal(true);
  };

  // Salvar alteração de categoria
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCatId || !editCatName) return;

    const res = await fetch("/api/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CATEGORY",
        id: editCatId,
        categoryName: editCatName,
        description: editCatDesc,
      }),
    });

    if (res.ok) {
      alert("✨ Categoria atualizada com sucesso!");
      setShowEditCatModal(false);
      loadServices();
    } else {
      alert("Erro ao atualizar categoria.");
    }
  };

  // Excluir categoria
  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!confirm(`⚠️ ATENÇÃO: Excluir a categoria "${catName}" também removerá todos os serviços associados a ela! Deseja continuar?`)) return;

    const res = await fetch(`/api/services?id=${id}&type=category`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("🗑️ Categoria removida.");
      loadServices();
    } else {
      alert("Erro ao excluir categoria.");
    }
  };

  const { categories } = data || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header da Página */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-[#6B1615] dark:text-amber-200 sm:text-3xl">
            Serviços & Tabela de Preços
          </h2>
          <p className="text-xs text-slate-700 dark:text-rose-200 font-semibold">
            Cadastro e edição de procedimentos de Nail Designer, valores, duração e comissões.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCatModal(true)}
            className="flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-white/90 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-md hover:bg-white transition"
          >
            <FolderPlus className="h-4 w-4 text-rose-600" />
            <span>+ Nova Categoria</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Serviço</span>
          </button>
        </div>
      </div>

      {/* Lista de Categorias e Serviços */}
      <div className="space-y-6">
        {categories && categories.length > 0 ? (
          categories.map((cat: any) => (
            <div key={cat.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 dark:border-slate-800 gap-2">
                <div>
                  <h3 className="font-serif text-lg font-extrabold text-[#6B1615] dark:text-amber-200">
                    {cat.name} ({cat.services?.length || 0})
                  </h3>
                  {cat.description && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{cat.description}</p>}
                </div>
                <div className="flex items-center space-x-2 text-xs font-extrabold shrink-0">
                  <button
                    onClick={() => handleOpenEditCategory(cat)}
                    className="flex items-center space-x-1 rounded-lg bg-amber-50 px-2.5 py-1 text-amber-800 hover:bg-amber-100 dark:bg-slate-800 dark:text-amber-300 transition"
                    title="Editar nome ou descrição desta categoria"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Editar Categoria</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="flex items-center space-x-1 rounded-lg bg-rose-50 px-2.5 py-1 text-rose-700 hover:bg-rose-100 dark:bg-slate-800 dark:text-rose-400 transition"
                    title="Excluir categoria e seus serviços"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cat.services && cat.services.length > 0 ? (
                  cat.services.map((srv: any) => (
                    <div key={srv.id} className="rounded-2xl border border-rose-100 bg-[#FAF3F0]/60 p-4 dark:border-slate-800 dark:bg-slate-800/60 flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="flex justify-between items-start border-b pb-2 border-rose-200/50 dark:border-slate-700">
                          <h4 className="font-serif text-sm font-extrabold text-slate-900 dark:text-white">{srv.name}</h4>
                          <div className="text-right">
                            <span className="font-serif text-base font-extrabold text-rose-600 dark:text-rose-400">
                              R$ {(srv.promoPrice || srv.price).toFixed(2)}
                            </span>
                            {srv.promoPrice && (
                              <p className="text-[10px] text-slate-400 line-through">R$ {srv.price.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                        {srv.description && <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-300">{srv.description}</p>}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-rose-200/60 pt-2 text-[11px] text-slate-700 dark:text-slate-300">
                        <div className="flex items-center space-x-2 font-bold">
                          <span>⏱️ {srv.durationMinutes} min</span>
                          <span className="text-amber-800 dark:text-amber-300">&bull; Com: {srv.commissionPercent}%</span>
                        </div>

                        <div className="flex items-center space-x-2 font-extrabold">
                          <button
                            onClick={() => handleOpenEditService(srv)}
                            className="text-amber-700 hover:text-amber-900 dark:text-amber-300 underline"
                            title="Editar preço, duração ou comissão"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDeleteService(srv.id, srv.name)}
                            className="text-rose-600 hover:text-rose-800 dark:text-rose-400 underline"
                            title="Excluir serviço"
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                    Nenhum serviço nesta categoria. Clique em "+ Novo Serviço" para adicionar.
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-700">Nenhuma categoria cadastrada ainda.</p>
            <p className="text-xs text-slate-500 mt-1">Clique no botão abaixo para criar a primeira categoria de serviços!</p>
            <button
              onClick={() => setShowCatModal(true)}
              className="mt-4 inline-flex items-center space-x-2 rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-600"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Criar Primeira Categoria</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL NOVO SERVIÇO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">✨ Cadastrar Novo Serviço</h3>
              <button onClick={() => setShowModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Categoria *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                >
                  {categories?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Nome do Serviço *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Alongamento de Gel com Nail Art..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Descrição (Opcional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Inclui cutilagem russa e esmaltação..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Duração (Minutos) *</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Comissão da Prof. (%)</label>
                  <input
                    type="number"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Preço Normal (R$) *</label>
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
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Preço Promocional (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Opcional"
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
              >
                CADASTRAR SERVIÇO ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR SERVIÇO */}
      {showEditServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">✏️ Editar Serviço</h3>
              <button onClick={() => setShowEditServiceModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateService} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Categoria *</label>
                <select
                  value={editSrvCatId}
                  onChange={(e) => setEditSrvCatId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                >
                  {categories?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Nome do Serviço *</label>
                <input
                  type="text"
                  value={editSrvName}
                  onChange={(e) => setEditSrvName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Descrição (Opcional)</label>
                <input
                  type="text"
                  value={editSrvDesc}
                  onChange={(e) => setEditSrvDesc(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Duração (Minutos) *</label>
                  <input
                    type="number"
                    value={editSrvDuration}
                    onChange={(e) => setEditSrvDuration(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Comissão da Prof. (%)</label>
                  <input
                    type="number"
                    value={editSrvCommission}
                    onChange={(e) => setEditSrvCommission(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Preço Normal (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editSrvPrice}
                    onChange={(e) => setEditSrvPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Preço Promocional (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editSrvPromoPrice}
                    onChange={(e) => setEditSrvPromoPrice(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Opcional"
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
              >
                SALVAR ALTERAÇÕES DO SERVIÇO ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA CATEGORIA */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">📁 Nova Categoria</h3>
              <button onClick={() => setShowCatModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Nome da Categoria *</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Alongamento de Gel, Esmaltação em Gel..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Descrição (Opcional)</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Ex: Procedimentos completos de gel com alta durabilidade..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-rose-600 py-3 text-xs font-bold text-white shadow-lg hover:bg-rose-700"
              >
                CRIAR CATEGORIA ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR CATEGORIA */}
      {showEditCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">✏️ Editar Categoria</h3>
              <button onClick={() => setShowEditCatModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Nome da Categoria *</label>
                <input
                  type="text"
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Descrição (Opcional)</label>
                <input
                  type="text"
                  value={editCatDesc}
                  onChange={(e) => setEditCatDesc(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-amber-600 py-3 text-xs font-bold text-white shadow-lg hover:bg-amber-700"
              >
                SALVAR CATEGORIA ✨
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
