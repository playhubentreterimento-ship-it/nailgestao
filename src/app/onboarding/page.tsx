"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  Palette,
  ShieldCheck,
  Zap,
  ArrowLeft
} from "lucide-react";

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "pro";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    salonName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    whatsapp: "",
    slogan: "Especialistas em Alongamento & Estética de Unhas",
    primaryColor: "#E0A96D",
    planName: initialPlan.toUpperCase(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleColorSelect = (color: string) => {
    setFormData({ ...formData, primaryColor: color });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar conta.");
      }

      router.push("/dashboard?welcome=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 w-full">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-3">
          <span className={step >= 1 ? "text-rose-400" : ""}>1. Dados da Empresa</span>
          <span className={step >= 2 ? "text-rose-400" : ""}>2. Personalização & Marca</span>
          <span className={step >= 3 ? "text-rose-400" : ""}>3. Confirmação do Plano</span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Step 1: Informações Gerais */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Bem-vinda ao NailGestão PRO 1.1 ✨</h2>
              <p className="text-slate-400 text-sm">
                Informe os dados básicos do seu Salão de Unhas ou Atendimento Solo para iniciarmos o teste grátis de 7 dias.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Nome do Salão / Estúdio *</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    name="salonName"
                    required
                    placeholder="Ex: Studio Luxe Nail Designer"
                    value={formData.salonName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Seu Nome Completo (Proprietária) *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    name="ownerName"
                    required
                    placeholder="Ex: Juliana Silva"
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">E-mail de Login *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="contato@seusalao.com.br"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Senha de Acesso *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Telefone de Contato *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      name="phone"
                      required
                      placeholder="(11) 99999-8888"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">WhatsApp de Atendimento *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      name="whatsapp"
                      required
                      placeholder="5511999998888"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!formData.salonName || !formData.ownerName || !formData.email || !formData.password) {
                    setError("Preencha todos os campos obrigatórios para continuar.");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/25 transition-all"
              >
                <span>Próximo Passo</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Personalização */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Personalize a Marca do seu Salão 🎨</h2>
              <p className="text-slate-400 text-sm">
                Defina o slogan e a cor principal que serão exibidos na sua Página de Agendamento das clientes.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Slogan / Frase de Impacto</label>
                <input
                  type="text"
                  name="slogan"
                  value={formData.slogan}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-3">Cor Principal da Sua Marca</label>
                <div className="flex items-center gap-4">
                  {[
                    { name: "Rose Gold", hex: "#E0A96D" },
                    { name: "Luxe Pink", hex: "#E11D48" },
                    { name: "Deep Violet", hex: "#8B5CF6" },
                    { name: "Golden Amber", hex: "#F59E0B" },
                    { name: "Emerald Green", hex: "#10B981" },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => handleColorSelect(c.hex)}
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-transform ${
                        formData.primaryColor === c.hex ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {formData.primaryColor === c.hex && <CheckCircle2 className="h-5 w-5 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/25 transition-all"
              >
                <span>Revisar Plano & Finalizar</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmação do Plano */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Confirmação de Teste Grátis ✨</h2>
              <p className="text-slate-400 text-sm">
                Seu teste completo de 7 dias começará imediatamente. Nenhum valor será cobrado agora.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Plano Selecionado</span>
                  <h3 className="text-lg font-bold text-rose-400">NailGestão PRO 1.1 ({formData.planName})</h3>
                </div>
                <span className="text-sm font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                  7 Dias Grátis
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Salão:</span>
                  <span className="font-semibold text-white">{formData.salonName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Proprietária:</span>
                  <span className="font-semibold text-white">{formData.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>E-mail:</span>
                  <span className="font-semibold text-white">{formData.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Criando Salão...</span>
                ) : (
                  <>
                    <span>Criar Meu Salão Agora</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[2px]">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-rose-300 to-pink-400 bg-clip-text text-transparent">
              NailGestão <span className="text-xs text-amber-300 font-semibold">PRO 1.1</span>
            </span>
          </Link>

          <Link href="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Já possui uma conta? Entrar
          </Link>
        </div>
      </header>

      {/* Main Wizard Wrapped in Suspense */}
      <Suspense fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
        </div>
      }>
        <OnboardingForm />
      </Suspense>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        NailGestão PRO 1.1 © 2026 • Plataforma Comercial para Nail Designers
      </footer>
    </div>
  );
}
