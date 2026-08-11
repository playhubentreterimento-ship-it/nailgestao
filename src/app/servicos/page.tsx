"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, Clock, DollarSign, Tag, CheckCircle } from "lucide-react";

export default function ServicosPage() {
  const [data, setData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Form de Serviço
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [price, setPrice] = useState(150);
  const [promoPrice, setPromoPrice] = useState<number | "">("");
  const [commissionPercent, setCommissionPercent] = useState(40);

  const loadServices = () => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        if (res.categories && res.categories.length > 0) {
          setCategoryId(res.categories[0].id);
        }
      });
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setShowModal(false);
      loadServices();
    }
  };

  const { categories, services } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Serviços & Tabela de Preços
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cadastro de procedimentos de Nail Designer, categorias, duração e comissões.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Serviço</span>
        </button>
      </div>

      <div className="space-y-6">
        {categories?.map((cat: any) => (
          <div key={cat.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-3">
              {cat.name} ({cat.services?.length || 0})
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.services?.map((srv: any) => (
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
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL NOVO SERVIÇO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-4">✨ Cadastrar Novo Serviço</h3>
            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold">Categoria *</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800" required>
                  {categories?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold">Nome do Serviço *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Alongamento em Gel..." className="mt-1 w-full rounded-xl border p-2.5 font-medium dark:bg-slate-800" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold">Duração (Minutos) *</label>
                  <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-2.5 font-bold dark:bg-slate-800" required />
                </div>
                <div>
                  <label className="block font-bold">Preço Normal (R$) *</label>
                  <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-2.5 font-bold dark:bg-slate-800" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold">Preço Promocional (R$)</label>
                  <input type="number" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value ? Number(e.target.value) : "")} className="mt-1 w-full rounded-xl border p-2.5 font-bold dark:bg-slate-800" />
                </div>
                <div>
                  <label className="block font-bold">Comissão (%)</label>
                  <input type="number" value={commissionPercent} onChange={(e) => setCommissionPercent(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-2.5 font-bold dark:bg-slate-800" required />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border p-2.5 font-bold">Cancelar</button>
                <button type="submit" className="rounded-xl bg-rose-500 px-6 p-2.5 font-bold text-white">Salvar &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
