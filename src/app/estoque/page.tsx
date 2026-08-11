"use client";

import { useState, useEffect } from "react";
import { Boxes, AlertTriangle, Plus, Search, Truck, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function EstoquePage() {
  const [data, setData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Form de Produto
  const [name, setName] = useState("");
  const [category, setCategory] = useState("GEL");
  const [quantity, setQuantity] = useState(10);
  const [minQuantity, setMinQuantity] = useState(5);
  const [costPrice, setCostPrice] = useState(50);

  const loadStock = () => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then(setData);
  };

  useEffect(() => {
    loadStock();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        quantity,
        minQuantity,
        costPrice,
      }),
    });
    if (res.ok) {
      setShowModal(false);
      loadStock();
    }
  };

  const { products, suppliers, lowStockCount } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Estoque & Insumos do Salão
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controle de géis, fibras, lixas, esmaltes e alertas automáticos de estoque crítico.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Produto</span>
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-800 dark:border-slate-800 dark:bg-slate-900 dark:text-amber-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <span>⚠️ ALERTA: Existem {lowStockCount} produtos com quantidade abaixo do limite mínimo recomendado!</span>
        </div>
      )}

      {/* Tabela de Produtos */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-4">
          Produtos em Estoque
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Qtd Atual</th>
                <th className="px-4 py-3">Qtd Mínima</th>
                <th className="px-4 py-3">Preço Custo</th>
                <th className="px-4 py-3">Fornecedor</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products?.map((p: any) => {
                const isLow = p.quantity <= p.minQuantity;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3 font-bold text-base">{p.quantity} un</td>
                    <td className="px-4 py-3 text-slate-400">{p.minQuantity} un</td>
                    <td className="px-4 py-3 font-semibold">R$ {p.costPrice?.toFixed(2)}</td>
                    <td className="px-4 py-3">{p.supplier?.name || "Mega Nails Distribuidora"}</td>
                    <td className="px-4 py-3">
                      {isLow ? (
                        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-800 animate-pulse">
                          ⚠️ ESTOQUE BAIXO
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NOVO PRODUTO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-4">📦 Cadastrar Produto em Estoque</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold">Nome do Produto *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Gel LED/UV D&Z..." className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold">Categoria</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800">
                    <option value="GEL">Gel Construtor</option>
                    <option value="FIBRA">Fibra de Vidro</option>
                    <option value="ESMALTE">Esmalte em Gel</option>
                    <option value="LIXA">Lixas & Brocas</option>
                    <option value="REMOVEDOR">Prep & Removedor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold">Quantidade *</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-2.5 font-bold dark:bg-slate-800" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold">Estoque Mínimo</label>
                  <input type="number" value={minQuantity} onChange={(e) => setMinQuantity(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-2.5 font-bold dark:bg-slate-800" required />
                </div>
                <div>
                  <label className="block font-bold">Custo Unitário (R$)</label>
                  <input type="number" value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-2.5 font-bold dark:bg-slate-800" required />
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
