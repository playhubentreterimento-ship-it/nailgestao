"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Trash2, RefreshCw, Palette, Store, CreditCard, ShieldAlert, Users, Plus, Key, Edit, Check } from "lucide-react";

export default function ConfiguracoesPage() {
  const [salon, setSalon] = useState<any>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#E0A96D");
  const [creditFee, setCreditFee] = useState(2.99);
  const [debitFee, setDebitFee] = useState(1.49);
  const [saved, setSaved] = useState(false);

  // Form de Nova Atendente / Profissional
  const [showProfModal, setShowProfModal] = useState(false);
  const [profName, setProfName] = useState("");
  const [profPhone, setProfPhone] = useState("");
  const [profEmail, setProfEmail] = useState("");
  const [profPassword, setProfPassword] = useState("");
  const [profCommission, setProfCommission] = useState(40);
  const [profRole, setProfRole] = useState("PROFISSIONAL");
  const [editingProfId, setEditingProfId] = useState<string | null>(null);

  const loadData = () => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSalon(data);
        setName(data.name || "");
        setSlogan(data.slogan || "");
        setLogoUrl(data.logoUrl || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setPrimaryColor(data.primaryColor || "#E0A96D");
        setCreditFee(data.creditFeePercent || 2.99);
        setDebitFee(data.debitFeePercent || 1.49);
      });

    fetch("/api/professionals")
      .then((r) => r.json())
      .then(setProfessionals);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slogan,
        logoUrl,
        phone,
        address,
        primaryColor,
        creditFeePercent: creditFee,
        debitFeePercent: debitFee,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveProf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName || !profPhone) {
      alert("Nome e Telefone são obrigatórios.");
      return;
    }

    const method = editingProfId ? "PUT" : "POST";
    const payload = editingProfId
      ? { id: editingProfId, name: profName, phone: profPhone, email: profEmail, password: profPassword, commissionRatePercent: profCommission }
      : { name: profName, phone: profPhone, email: profEmail, password: profPassword, role: profRole, commissionRatePercent: profCommission };

    const res = await fetch("/api/professionals", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert(editingProfId ? "✨ Dados da atendente atualizados!" : "✨ Nova atendente e login criados com sucesso!");
      setShowProfModal(false);
      setEditingProfId(null);
      setProfName("");
      setProfPhone("");
      setProfEmail("");
      setProfPassword("");
      loadData();
    } else {
      const err = await res.json();
      alert("Erro ao salvar atendente: " + err.error);
    }
  };

  const handleEditProfClick = (p: any) => {
    setEditingProfId(p.id);
    setProfName(p.name);
    setProfPhone(p.phone);
    setProfEmail(p.email || p.userEmail || "");
    setProfCommission(p.commissionRatePercent || 40);
    setProfPassword("");
    setShowProfModal(true);
  };

  const handleResetDemo = async (action: "RESEED" | "CLEAR_ALL") => {
    const confirmMsg =
      action === "CLEAR_ALL"
        ? "⚠️ Tem certeza que deseja apagar TODOS os dados fictícios para iniciar em Produção?"
        : "Restaurar os dados de demonstração iniciais?";

    if (confirm(confirmMsg)) {
      await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      alert("Ação concluída com sucesso! Recarregando página...");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          ⚙️ Configurações, Equipe & Logins
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Altere dados do salão, cadastre atendentes, defina emails/senhas e altere comissões.
        </p>
      </div>

      {saved && (
        <div className="rounded-2xl bg-emerald-100 p-4 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          ✨ Configurações salvas com sucesso!
        </div>
      )}

      {/* GERENCIAMENTO DE ATENDENTES E LOGINS */}
      <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Users className="h-5 w-5 text-rose-500" />
            <span>Atendentes / Equipe & Logins de Acesso</span>
          </h3>
          <button
            onClick={() => {
              setEditingProfId(null);
              setProfName("");
              setProfPhone("");
              setProfEmail("");
              setProfPassword("");
              setShowProfModal(true);
            }}
            className="flex items-center space-x-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-600"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Nova Atendente</span>
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {professionals.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color || "#E0A96D" }}></span>
                  <h4 className="font-serif font-bold text-slate-900 dark:text-white text-sm">{p.name}</h4>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">📞 {p.phone}</p>
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  ✉️ Login: {p.userEmail || "Sem email cadastrado"}
                </p>
                <span className="inline-block mt-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Comissão: {p.commissionRatePercent}%
                </span>
              </div>

              <button
                onClick={() => handleEditProfClick(p)}
                className="flex items-center space-x-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Editar / Senha</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FORMULÁRIO DE CONFIGURAÇÃO DO SALÃO */}
      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Store className="h-5 w-5 text-amber-500" />
            <span>Dados Principais do Salão</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold">Nome do Salão *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-medium dark:bg-slate-800" required />
            </div>
            <div>
              <label className="block font-bold">Slogan / Descrição</label>
              <input type="text" value={slogan} onChange={(e) => setSlogan(e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-medium dark:bg-slate-800" />
            </div>
          </div>

          <div>
            <label className="block font-bold">Foto / Logotipo do Salão (Link da Imagem)</label>
            <div className="flex items-center space-x-3 mt-1">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-12 w-12 rounded-xl object-cover border" />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-slate-800 flex items-center justify-center font-bold text-rose-600 text-xs">💅 Logo</div>
              )}
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://exemplo.com/foto-do-salao.jpg"
                className="w-full rounded-xl border p-3 font-medium dark:bg-slate-800"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Insira o link da foto da fachada ou logotipo do salão (ex: Imgur, ImgBB, Instagram ou Google).</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold">Telefone / WhatsApp Comercial</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-medium dark:bg-slate-800" />
            </div>
            <div>
              <label className="block font-bold">Cor Primária de Destaque</label>
              <div className="flex items-center space-x-2 mt-1">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border p-1" />
                <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full rounded-xl border p-2.5 font-mono dark:bg-slate-800" />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold">Endereço Completo</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-medium dark:bg-slate-800" />
          </div>
        </div>

        <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95">
          SALVAR ALTERAÇÕES DO SALÃO &rarr;
        </button>
      </form>

      {/* GERENCIAMENTO DE DADOS (DEMO VS PRODUÇÃO) */}
      <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-serif text-base font-bold text-rose-800 dark:text-rose-300 flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-rose-600" />
          <span>Modo de Demonstração vs Produção</span>
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleResetDemo("RESEED")}
            className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200"
          >
            <RefreshCw className="h-4 w-4 text-amber-500" />
            <span>Restaurar Dados de Demonstração</span>
          </button>

          <button
            type="button"
            onClick={() => handleResetDemo("CLEAR_ALL")}
            className="flex items-center space-x-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
          >
            <Trash2 className="h-4 w-4" />
            <span>Limpar Banco de Dados (Modo Produção Zerado)</span>
          </button>
        </div>
      </div>

      {/* MODAL CADASTRO / EDIÇÃO DE ATENDENTE & SENHA */}
      {showProfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingProfId ? "✏️ Editar Atendente & Alterar Senha" : "✨ Nova Atendente & Login de Acesso"}
            </h3>
            <form onSubmit={handleSaveProf} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold">Nome da Atendente / Profissional *</label>
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  placeholder="Ex: Camila Santos"
                  className="mt-1 w-full rounded-xl border p-2.5 font-medium dark:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    value={profPhone}
                    onChange={(e) => setProfPhone(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="mt-1 w-full rounded-xl border p-2.5 font-medium dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold">Comissão (%)</label>
                  <input
                    type="number"
                    value={profCommission}
                    onChange={(e) => setProfCommission(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border p-2.5 font-bold dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <p className="font-bold text-rose-600 dark:text-rose-400">🔑 Credenciais de Login no Sistema:</p>

                <div>
                  <label className="block font-bold">E-mail para Login</label>
                  <input
                    type="email"
                    value={profEmail}
                    onChange={(e) => setProfEmail(e.target.value)}
                    placeholder="camila@studioluxe.com.br"
                    className="mt-1 w-full rounded-xl border p-2.5 font-medium dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold">Senha de Acesso {editingProfId ? "(Deixe em branco se não quiser alterar)" : "*"}</label>
                  <input
                    type="password"
                    value={profPassword}
                    onChange={(e) => setProfPassword(e.target.value)}
                    placeholder="Digite a senha..."
                    className="mt-1 w-full rounded-xl border p-2.5 font-medium dark:bg-slate-800"
                  />
                </div>

                {!editingProfId && (
                  <div>
                    <label className="block font-bold">Nível de Permissão (Role)</label>
                    <select
                      value={profRole}
                      onChange={(e) => setProfRole(e.target.value)}
                      className="mt-1 w-full rounded-xl border p-2.5 font-bold dark:bg-slate-800"
                    >
                      <option value="PROFISSIONAL">PROFISSIONAL (Visualiza sua agenda)</option>
                      <option value="RECEPÇÃO">RECEPÇÃO (Agenda e Caixa)</option>
                      <option value="GERENTE">GERENTE (Gestão total exceto financeiro avançado)</option>
                      <option value="ADMINISTRADOR">ADMINISTRADOR (Acesso total)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setShowProfModal(false)} className="rounded-xl border p-2.5 font-bold">Cancelar</button>
                <button type="submit" className="rounded-xl bg-rose-500 px-6 p-2.5 font-bold text-white shadow-md hover:bg-rose-600">
                  Salvar Atendente &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
