"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Crown,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  ArrowLeft,
  Zap,
  ShieldCheck,
  Award,
  Calendar,
  Users,
  Scissors,
  DollarSign,
  BarChart3,
  Package,
  ChevronDown,
  ChevronUp,
  Lock,
  Check,
  X,
  HelpCircle,
  Star,
  Play
} from "lucide-react";
import { useUTMTracker } from "@/lib/utm-tracker";
import { CanvaVideoEmbed } from "@/components/common/CanvaVideoEmbed";

export default function PlanosPage() {
  useUTMTracker();
  const [salon, setSalon] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSalon(data))
      .catch((err) => console.error(err));

    // Rolagem automática e direta para os planos e valores se a URL tiver #planos ou hash
    if (typeof window !== "undefined" && (window.location.hash === "#planos" || window.location.hash === "#tabela-planos")) {
      setTimeout(() => {
        const element = document.getElementById("planos");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToPlanos = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("planos");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const plans = [
    {
      id: "solo",
      name: "NailGestão Solo",
      badge: null,
      target: "Para profissionais que trabalham sozinhas.",
      price: "R$ 49",
      period: "/mês",
      description: "Para Nail Designers que trabalham sozinhas e querem organizar sua rotina.",
      mpLink: "https://mpago.la/11PKsPX",
      cta: "COMEÇAR AGORA",
      dataCta: "click_plan_solo",
      highlight: false,
      features: [
        "1 Profissional (Atendimento Solo)",
        "Agenda Online 24h para Clientes",
        "Cadastro de Clientes & CRM",
        "Ficha Técnica de Unhas",
        "Gestão de Serviços & Valores",
        "Controle de Caixa do Dia",
        "Controle Financeiro & Histórico",
        "Relatórios de Desempenho",
        "Suporte por E-mail & WhatsApp",
      ],
    },
    {
      id: "pro",
      name: "NailGestão Pro",
      badge: "⭐ MAIS ESCOLHIDO",
      tagline: "⭐ MELHOR CUSTO-BENEFÍCIO",
      target: "Para profissionais que querem mais controle do negócio.",
      price: "R$ 89",
      period: "/mês",
      description: "Para profissionais que querem mais organização e controle do negócio.",
      mpLink: "https://mpago.la/2yvh2oP",
      cta: "COMEÇAR AGORA",
      dataCta: "click_plan_pro",
      highlight: true,
      features: [
        "Tudo do Plano Solo +",
        "Até 5 Profissionais na Equipe",
        "Agendamento & Envio de Mensagem via WhatsApp",
        "Fotos Antes & Depois nas Fichas Técnicas",
        "Relatório de Comissões por Atendente",
        "Programa de Fidelidade & Vales-Presente",
        "Suporte Prioritário VIP",
      ],
    },
    {
      id: "gold",
      name: "NailGestão Gold",
      badge: null,
      target: "Para studios que precisam de uma gestão mais completa.",
      price: "R$ 149",
      period: "/mês",
      description: "Para studios que precisam de uma gestão mais completa.",
      mpLink: "https://mpago.la/2MEYpiy",
      cta: "COMEÇAR AGORA",
      dataCta: "click_plan_gold",
      highlight: false,
      features: [
        "Tudo do Plano Pro +",
        "Gestão para Equipe Ampliada de Profissionais",
        "Insights Inteligentes de IA para o Studio",
        "Logs de Auditoria & Segurança de Acesso",
        "Gestão de Pacotes & Sessões de Procedimentos",
        "Relatórios Executivos Consolidados",
        "Suporte Especializado Prioritário",
      ],
    },
  ];

  const benefits = [
    {
      icon: Calendar,
      title: "AGENDA",
      text: "Organize seus horários e visualize seus atendimentos de forma simples.",
    },
    {
      icon: Users,
      title: "CLIENTES",
      text: "Tenha suas clientes organizadas e encontre rapidamente as informações importantes.",
    },
    {
      icon: Scissors,
      title: "SERVIÇOS",
      text: "Cadastre seus procedimentos, valores e informações dos serviços.",
    },
    {
      icon: DollarSign,
      title: "FINANCEIRO",
      text: "Acompanhe entradas, saídas e o movimento financeiro do seu negócio.",
    },
    {
      icon: BarChart3,
      title: "MÉTRICAS",
      text: "Tenha uma visão melhor do desempenho do seu studio.",
    },
    {
      icon: Package,
      title: "ESTOQUE",
      text: "Controle seus produtos e materiais utilizados no dia a dia.",
    },
  ];

  const comparisonRows = [
    { feature: "Agenda Online 24h", solo: true, pro: true, gold: true },
    { feature: "Cadastro de Clientes & CRM", solo: true, pro: true, gold: true },
    { feature: "Ficha Técnica de Unhas", solo: true, pro: true, gold: true },
    { feature: "Controle de Caixa & Financeiro", solo: true, pro: true, gold: true },
    { feature: "Equipe de Atendentes", solo: "1 Atendente", pro: "Até 5", gold: "Equipe Ampliada" },
    { feature: "Fotos Antes/Depois na Ficha", solo: false, pro: true, gold: true },
    { feature: "Relatório de Comissões", solo: false, pro: true, gold: true },
    { feature: "Fidelidade & Vales-Presente", solo: false, pro: true, gold: true },
    { feature: "Pacotes & Sessões", solo: false, pro: false, gold: true },
    { feature: "Insights de IA & Auditoria", solo: false, pro: false, gold: true },
  ];

  const faqs = [
    {
      q: "Posso testar antes de pagar?",
      a: "Sim. O NailGestão oferece 7 dias grátis para você conhecer a plataforma.",
    },
    {
      q: "Preciso instalar algum programa?",
      a: "O NailGestão funciona online e pode ser acessado pelos dispositivos compatíveis com a plataforma.",
    },
    {
      q: "Meus dados são apagados quando o teste termina?",
      a: "Não. Seus dados permanecem armazenados. Para continuar utilizando o sistema, basta escolher um plano.",
    },
    {
      q: "Posso cancelar minha assinatura?",
      a: "Sim. A assinatura pode ser cancelada conforme as condições apresentadas no momento da contratação.",
    },
    {
      q: "Como funciona o pagamento?",
      a: "Os pagamentos são realizados através do Mercado Pago.",
    },
    {
      q: "O WhatsApp envia mensagens automaticamente?",
      a: "Atualmente, o NailGestão permite organizar as informações e o atendimento relacionado às clientes, mas o envio automático de mensagens pelo WhatsApp ainda não está disponível. Essa funcionalidade está prevista para uma futura evolução da plataforma.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F12] text-slate-100 font-sans selection:bg-rose-500 selection:text-white pb-20">
      
      {/* Header Sticky */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0F0F12]/90 border-b border-[#1D1D24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group" data-cta="click_view_plans">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-[2px] shadow-lg shadow-rose-500/20">
              <div className="h-full w-full bg-[#0F0F12] rounded-[14px] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-rose-300 to-pink-400 bg-clip-text text-transparent">
                NailGestão <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold uppercase tracking-wider">PRO</span>
              </span>
              <p className="text-[9px] text-[#B8B8C2] uppercase tracking-widest font-semibold">Planos & Assinaturas</p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-[#17171C] border border-[#1D1D24] hover:bg-[#1D1D24] text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Painel</span>
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-[#1D1D24]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider shadow-inner">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>💅 GESTÃO PROFISSIONAL PARA NAIL DESIGNERS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Tenha seu Nail Studio organizado em um só lugar.
          </h1>

          <p className="text-base sm:text-xl text-[#B8B8C2] max-w-3xl mx-auto leading-relaxed">
            Agenda, clientes, serviços e financeiro em uma única plataforma criada para facilitar a rotina de quem trabalha com unhas.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              data-cta="click_start_trial"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-sm shadow-xl shadow-rose-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>COMEÇAR MEU TESTE GRÁTIS</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#planos"
              onClick={scrollToPlanos}
              data-cta="click_view_plans"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#17171C] border border-[#272730] hover:bg-[#272730] text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>VER PLANOS</span>
            </a>
          </div>

          <div className="pt-4 space-y-1">
            <p className="text-xs font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
              <span>🎁 7 DIAS GRÁTIS PARA TESTAR</span>
            </p>
            <p className="text-xs text-[#B8B8C2]">
              Comece agora e descubra como é ter sua rotina organizada de forma profissional.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 pt-16">
        
        {/* 3. BENEFÍCIOS PRINCIPAIS */}
        <section className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Chega de perder tempo organizando tudo manualmente.
            </h2>
            <p className="text-sm sm:text-base text-[#B8B8C2]">
              Concentre sua gestão em um único lugar e tenha mais controle sobre o seu negócio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-[#17171C] border border-[#1D1D24] p-6 space-y-3 hover:border-rose-500/40 transition-colors"
                >
                  <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-extrabold tracking-wider text-white uppercase">{b.title}</h3>
                  <p className="text-xs text-[#B8B8C2] leading-relaxed">{b.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. SEÇÃO DE VALOR */}
        <section className="rounded-3xl bg-gradient-to-r from-[#17171C] via-[#1D1D24] to-[#17171C] border border-[#272730] p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Mais organização. Menos preocupação.
          </h2>
          <p className="text-sm sm:text-base text-[#B8B8C2] leading-relaxed max-w-2xl mx-auto">
            O NailGestão foi criado para que você passe menos tempo organizando sua empresa e mais tempo cuidando das suas clientes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left text-xs font-semibold text-slate-200">
            <div className="bg-[#0F0F12]/80 p-4 rounded-2xl border border-[#272730] flex items-center gap-3">
              <span className="text-emerald-400 font-bold text-base shrink-0">✓</span>
              <span>Tudo organizado em um só lugar</span>
            </div>
            <div className="bg-[#0F0F12]/80 p-4 rounded-2xl border border-[#272730] flex items-center gap-3">
              <span className="text-emerald-400 font-bold text-base shrink-0">✓</span>
              <span>Acesso rápido às informações do seu negócio</span>
            </div>
            <div className="bg-[#0F0F12]/80 p-4 rounded-2xl border border-[#272730] flex items-center gap-3">
              <span className="text-emerald-400 font-bold text-base shrink-0">✓</span>
              <span>Gestão simples mesmo para quem não entende de sistemas</span>
            </div>
          </div>
        </section>

        {/* 5. COMO FUNCIONA (3 PASSOS) */}
        <section className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Começar é simples.
            </h2>
            <p className="text-sm sm:text-base text-[#B8B8C2]">
              Em poucos minutos seu studio estará pronto para funcionar de forma organizada.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-[#17171C] border border-[#1D1D24] rounded-3xl p-8 space-y-4 relative">
              <span className="text-4xl font-black text-rose-500/30">01</span>
              <h3 className="text-lg font-bold text-white">Crie sua conta</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Cadastre-se gratuitamente em poucos minutos.</p>
            </div>

            <div className="bg-[#17171C] border border-[#1D1D24] rounded-3xl p-8 space-y-4 relative">
              <span className="text-4xl font-black text-rose-500/30">02</span>
              <h3 className="text-lg font-bold text-white">Configure seu studio</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Adicione seus serviços, horários e clientes.</p>
            </div>

            <div className="bg-[#17171C] border border-[#1D1D24] rounded-3xl p-8 space-y-4 relative">
              <span className="text-4xl font-black text-rose-500/30">03</span>
              <h3 className="text-lg font-bold text-white">Comece a organizar</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Use o NailGestão no dia a dia e tenha mais controle sobre seu negócio.</p>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              🎁 Você tem 7 dias grátis para experimentar.
            </p>
          </div>
        </section>

        {/* 6. PLANOS */}
        <section id="planos" className="scroll-mt-24 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <Crown className="h-4 w-4 text-amber-400" />
              <span>Planos de Assinatura</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Escolha o plano ideal para o seu negócio
            </h2>

            <p className="text-base sm:text-lg text-[#B8B8C2]">
              Comece gratuitamente e escolha o plano que melhor combina com a sua rotina.
            </p>
          </div>

          {/* Plan Cards Grid (Stacked on Mobile: Solo, Pro, Gold) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.highlight
                    ? "bg-[#1D1D24] border-2 border-rose-500 shadow-2xl shadow-rose-500/20 scale-100 lg:-translate-y-2"
                    : "bg-[#17171C] border border-[#1D1D24] hover:border-slate-700"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  </div>

                  {plan.tagline && (
                    <span className="inline-block text-[10px] font-extrabold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 mb-3">
                      {plan.tagline}
                    </span>
                  )}

                  <p className="text-xs text-[#B8B8C2] min-h-[36px] mb-6 leading-relaxed">
                    {plan.target}
                  </p>

                  <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-[#272730]">
                    <span className={`text-4xl font-extrabold ${plan.highlight ? "text-rose-400" : "text-white"}`}>
                      {plan.price}
                    </span>
                    <span className="text-xs text-[#B8B8C2]">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300 mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.highlight ? "text-rose-400" : "text-emerald-400"}`} />
                        <span className={idx === 0 && plan.highlight ? "font-bold text-white" : ""}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <a
                    href={plan.mpLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cta={plan.dataCta}
                    className={`w-full py-4 rounded-2xl font-extrabold text-xs text-center flex items-center justify-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-rose-500/25"
                        : "bg-[#272730] hover:bg-[#32323d] text-white border border-[#373745]"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <p className="text-[10px] text-center text-slate-500 mt-2 font-medium">
                    🔒 Pagamento seguro via Mercado Pago
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 10. SEGURANÇA / PAGAMENTO */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-sm font-bold text-rose-300">
              Sem fidelidade. Cancele quando quiser.
            </p>
            <p className="text-xs text-[#B8B8C2] flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Pagamento seguro. Os pagamentos das assinaturas são processados pelo Mercado Pago.</span>
            </p>
          </div>
        </section>

        {/* 7. COMPARATIVO DE PLANOS */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Compare os planos
            </h2>
            <p className="text-sm text-[#B8B8C2]">
              Veja em detalhes a comparação de recursos entre cada plano.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl bg-[#17171C] border border-[#1D1D24] p-4 sm:p-6 shadow-xl">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-[#272730] text-slate-100 font-extrabold text-sm">
                  <th className="py-4 px-4">Recurso</th>
                  <th className="py-4 px-4 text-center">Solo</th>
                  <th className="py-4 px-4 text-center text-rose-400">Pro (Mais Escolhido)</th>
                  <th className="py-4 px-4 text-center">Gold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272730]/60">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1D1D24]/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{row.feature}</td>
                    <td className="py-3.5 px-4 text-center">
                      {typeof row.solo === "boolean" ? (
                        row.solo ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <X className="h-4 w-4 text-slate-600 mx-auto" />
                      ) : (
                        <span className="font-bold text-slate-300">{row.solo}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-rose-300 bg-rose-500/5">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? <Check className="h-4 w-4 text-rose-400 mx-auto" /> : <X className="h-4 w-4 text-slate-600 mx-auto" />
                      ) : (
                        <span>{row.pro}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {typeof row.gold === "boolean" ? (
                        row.gold ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <X className="h-4 w-4 text-slate-600 mx-auto" />
                      ) : (
                        <span className="font-bold text-slate-300">{row.gold}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 9. DESTAQUE DO TESTE GRATUITO */}
        <section className="rounded-3xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border-2 border-rose-500/40 p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Sem Compromisso</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Experimente antes de decidir.
          </h2>

          <p className="text-sm sm:text-base text-[#B8B8C2]">
            Você pode testar o NailGestão gratuitamente durante 7 dias.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs font-semibold text-slate-200 max-w-2xl mx-auto pt-2">
            <div className="flex items-center gap-3 bg-[#0F0F12]/90 p-3.5 rounded-2xl border border-[#272730]">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Sem cartão de crédito para começar</span>
            </div>
            <div className="flex items-center gap-3 bg-[#0F0F12]/90 p-3.5 rounded-2xl border border-[#272730]">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Acesso ao sistema durante o período de teste</span>
            </div>
            <div className="flex items-center gap-3 bg-[#0F0F12]/90 p-3.5 rounded-2xl border border-[#272730]">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Seus dados permanecem salvos</span>
            </div>
            <div className="flex items-center gap-3 bg-[#0F0F12]/90 p-3.5 rounded-2xl border border-[#272730]">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Escolha seu plano quando quiser continuar</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/onboarding"
              data-cta="click_start_trial"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-sm shadow-xl shadow-rose-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>COMEÇAR MEU TESTE GRÁTIS</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* 12. PROVA SOCIAL REAL & VÍDEO DE DEMONSTRAÇÃO */}
        <section className="bg-[#17171C] border border-[#1D1D24] rounded-3xl p-8 sm:p-12 space-y-10 max-w-5xl mx-auto">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Award className="h-4 w-4" />
              <span>Prova Social Real & Experiência de Uso</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Quem usa e experimenta, recomenda.
            </h2>
            <p className="text-xs sm:text-sm text-[#B8B8C2] max-w-2xl mx-auto">
              Veja o resultado real de clientes agendando pelo link do NailGestão e assista à demonstração em vídeo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Card 1: Print Real do WhatsApp */}
            <div className="bg-[#0F0F12] border border-[#272730] rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 fill-current" />
                    <span>Resultado Real no WhatsApp</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Agendamento Real</span>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-[#272730] flex justify-center bg-black/60 p-2">
                  <img
                    src="/prova-social-whatsapp.png"
                    alt="Comprovante de Agendamento Real da Cliente Nadia pelo NailGestão"
                    className="max-h-80 w-auto object-contain rounded-lg shadow-2xl hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-extrabold text-white">💬 "Amei esse link kkk Amei amei"</p>
                  <p className="text-[#B8B8C2] text-[11px] leading-relaxed">
                    Cliente Nadia realizando seu agendamento de Banho de Gel pelo site e comemorando a facilidade e rapidez do link!
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Vídeo de Demonstração no YouTube */}
            <div className="bg-[#0F0F12] border border-[#272730] rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Vídeo Oficial no YouTube</span>
                  </span>
                  <span className="text-[10px] text-[#B8B8C2] font-semibold">▶ Reprodução Automática</span>
                </div>

                <h3 className="text-lg font-bold text-white">
                  Assista à Demonstração Completa em Vídeo
                </h3>

                <p className="text-xs text-[#B8B8C2] leading-relaxed">
                  Veja como a plataforma funciona na prática, como é simples receber agendamentos e organizar os horários do seu studio.
                </p>

                <CanvaVideoEmbed />
              </div>
            </div>
          </div>
        </section>

        {/* 11. FAQ (PERGUNTAS FREQUENTES ACCORDION) */}
        <section className="space-y-8 max-w-3xl mx-auto">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-300 text-xs font-bold">
              <HelpCircle className="h-4 w-4" />
              <span>Tire Suas Dúvidas</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#17171C] border border-[#1D1D24] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-white hover:text-rose-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-5 w-5 text-rose-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#B8B8C2] leading-relaxed border-t border-[#272730]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 13. CTA FINAL */}
        <section className="rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 p-8 sm:p-12 text-center space-y-6 shadow-2xl shadow-rose-600/20">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Pronta para organizar seu Nail Studio?
          </h2>
          <p className="text-sm sm:text-base text-rose-100 max-w-2xl mx-auto font-medium">
            Comece gratuitamente e descubra uma forma mais simples de cuidar da gestão do seu negócio.
          </p>

          <div className="pt-2">
            <Link
              href="/onboarding"
              data-cta="click_start_trial"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-extrabold text-sm shadow-2xl transition-all transform hover:-translate-y-0.5"
            >
              <span>COMEÇAR MEU TESTE GRÁTIS</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="text-xs text-rose-200 font-semibold">
            7 dias grátis • Sem cartão para começar
          </p>
        </section>
      </main>

      {/* 14. RODAPÉ */}
      <footer className="mt-24 border-t border-[#1D1D24] pt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-lg font-extrabold bg-gradient-to-r from-amber-200 via-rose-300 to-pink-400 bg-clip-text text-transparent">
              NailGestão
            </span>
            <p className="text-xs text-[#B8B8C2]">Gestão profissional para Nail Designers.</p>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#B8B8C2] font-semibold">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <Link href="/planos" className="hover:text-white transition-colors">Planos</Link>
            <a
              href="https://wa.me/5567992684748?text=Ol%C3%A1%21%20Preciso%20de%20suporte%20sobre%20o%20NailGest%C3%A3o."
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Suporte
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[#17171C] text-center text-[10px] text-slate-500">
          © {new Date().getFullYear()} NailGestão PRO. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
