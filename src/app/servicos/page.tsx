"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, Clock, DollarSign, Tag, CheckCircle, FolderPlus, X } from "lucide-react";

export default function ServicosPage() {
  const [data, setData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);

  // Form de Serviço
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [price, setPrice] = useState(150);
  const [promoPrice, setPromoPrice] = useState<number | "">("");
  const [commissionPercent, setCommissionPercent] = useState(40);

  // Form de Categoria
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

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
        durationMinutes,
        price,
        promoPrice: promoPrice !== "" ? promoPrice : null,
        commissionPercent,
      }),
    });
    if (res.ok) {
      alert("✨ Serviço cadastrado com sucesso!");
      setShowModal(false);
      setName("");
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
            Cadastro de procedimentos de Nail Designer, categorias, duração e comissões.
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
            <div key={cat.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                <span>{cat.name} ({cat.services?.length || 0})</span>
                {cat.description && <span className="text-xs font-normal text-slate-500">{cat.description}</span>}
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cat.services && cat.services.length > 0 ? (
                  cat.services.map((srv: any) => (
                    <div key={srv.id} className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white">{srv.name}</h4>
                          <span className="font-serif text-base font-bold text-rose-600">
                            R$ {(srv.promoPrice || srv.price).toFixed(2)}
                          </span>
                        </div>
                        {srv.description && <p className="mt-1 text-[11px] text-slate-500">{srv.description}</p>}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-rose-200/60 pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                        <span>⏱️ {srv.durationMinutes} min</span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">Comissão: {srv.commissionPercent}%</span>
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
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Categoria *</label>
                  <button
                    type="button"
                    onClick={() => setShowCatModal(true)}
                    className="text-[11px] font-bold text-rose-600 hover:underline"
                  >
                    + Criar Categoria
                  </button>
                </div>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                >
                  <option value="">Selecione a categoria...</option>
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
                  placeholder="Ex: Alongamento em Gel Moldado..."
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Duração (Minutos) *</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Preço Normal (R$) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Preço Promocional (R$)</label>
                  <input
                    type="number"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Opcional..."
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200">Comissão (%)</label>
                  <input
                    type="number"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-2 font-bold text-white shadow-md hover:opacity-95"
                >
                  Salvar Serviço &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA CATEGORIA */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">📁 Cadastrar Nova Categoria</h3>
              <button onClick={() => setShowCatModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Nome da Categoria *</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Cutilagem & Esmaltação em Gel..."
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200">Descrição (Opcional)</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Ex: Procedimentos rápidos de manutenção de unhas..."
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-2 font-bold text-white shadow-md hover:opacity-95"
                >
                  Salvar Categoria &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
