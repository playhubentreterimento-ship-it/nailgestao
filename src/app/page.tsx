"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUTMTracker } from "@/lib/utm-tracker";
import { CanvaVideoEmbed } from "@/components/common/CanvaVideoEmbed";
import {
  Sparkles,
  Calendar,
  MessageCircle,
  TrendingUp,
  Award,
  Users,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Heart,
  ChevronRight,
  ArrowRight,
  Star,
  Layers,
  ShoppingBag,
  Gift,
  Smartphone,
  BarChart3,
  Sliders,
  DollarSign,
  XCircle,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Menu,
  X,
  Play,
  FileText,
  Camera,
  Check,
  ArrowUpRight
} from "lucide-react";

export default function LandingPage() {
  useUTMTracker();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqList = [
    {
      q: "O que é o NailGestão?",
      a: "O NailGestão é um sistema comercial de gestão feito especialmente para Nail Designers e Salões de Unhas. Ele reúne agenda online 24h, lembretes de confirmação via WhatsApp, ficha técnica com fotos antes/depois, controle de caixa e financeiro em uma única plataforma simples e rápida."
    },
    {
      q: "Para quem ele foi criado?",
      a: "Foi criado para Nail Designers autônomas, atendimentos individuais, estúdios em crescimento e salões de unhas com equipe de manicures que querem eliminar o caos das mensagens manuais e profissionalizar seu negócio."
    },
    {
      q: "Posso testar gratuitamente?",
      a: "Sim! Você tem 7 dias de teste totalmente gratuito com acesso completo a todas as funcionalidades do sistema para configurar o seu salão."
    },
    {
      q: "Preciso cadastrar cartão de crédito para testar?",
      a: "Não! O teste de 7 dias é liberado instantaneamente sem necessidade de cadastrar cartão de crédito."
    },
    {
      q: "Preciso instalar algum programa no computador?",
      a: "Não. O NailGestão é 100% online em nuvem. Você pode acessar pelo computador, tablet ou direto pelo navegador do seu celular sem ocupar espaço de memória."
    },
    {
      q: "Funciona bem no celular?",
      a: "Sim! O NailGestão foi desenvolvido com prioridade máxima para celular. Ele funciona como um aplicativo moderno e super rápido na tela do seu telefone."
    },
    {
      q: "Posso cadastrar minhas clientes e histórico de unhas?",
      a: "Sim! Cada cliente possui uma ficha exclusiva onde você registra o formato da unha (Amendoado, Stiletto, etc.), tipo de gel, esmaltação, preferências, observações e galeria de fotos Antes & Depois."
    },
    {
      q: "Como funciona o agendamento online das clientes?",
      a: "Você recebe um link exclusivo do seu estúdio (ex: `/agendar`). Suas clientes acessam pelo Instagram ou WhatsApp, escolhem o serviço, profissional, data e horário disponível sem precisar interromper seu atendimento."
    },
    {
      q: "Como funcionam as confirmações via WhatsApp?",
      a: "O sistema gera e facilita o envio das mensagens de lembrete com todos os dados do agendamento (data, horário, procedimento), permitindo que a cliente confirme ou reagende com um toque."
    },
    {
      q: "Posso controlar meu caixa e financeiro?",
      a: "Sim! O sistema possui controle de abertura e fechamento de caixa diário, lançamento de sangrias, despesas operacionais, taxas de cartão e DRE gerencial do mês."
    },
    {
      q: "Posso mudar de plano ou cancelar quando quiser?",
      a: "Com certeza. Você tem total liberdade para alterar o seu plano ou cancelar a qualquer momento sem fidelidade ou multas."
    },
    {
      q: "Tenho suporte para me ajudar na configuração?",
      a: "Sim! Oferecemos suporte dedicado via WhatsApp durante o período de teste e ao longo de toda a sua assinatura."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F0F12] text-slate-100 font-sans selection:bg-rose-500 selection:text-white pb-16 md:pb-0">
      
      {/* 5. HEADER STICKY */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0F0F12]/90 border-b border-[#1D1D24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" data-cta="header-logo">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-[2px] shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-[#0F0F12] rounded-[14px] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-rose-300 to-pink-400 bg-clip-text text-transparent">
                NailGestão <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold uppercase tracking-wider">PRO 1.1</span>
              </span>
              <p className="text-[9px] text-[#B8B8C2] uppercase tracking-widest font-semibold">SaaS para Nail Designers</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#B8B8C2]">
            <a href="#recursos" className="hover:text-white transition-colors" data-cta="nav-recursos">Recursos</a>
            <a href="#como-funciona" className="hover:text-white transition-colors" data-cta="nav-funciona">Como Funciona</a>
            <a href="#planos" className="hover:text-white transition-colors" data-cta="nav-planos">Planos</a>
            <a href="#faq" className="hover:text-white transition-colors" data-cta="nav-faq">Dúvidas</a>
          </nav>

          {/* Header CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[#B8B8C2] hover:text-white transition-colors"
              data-cta="header-login"
            >
              Entrar
            </Link>
            <Link
              href="/onboarding"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              data-cta="header-start-trial"
            >
              <span>Começar grátis</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-[#17171C] border border-[#1D1D24] text-slate-300"
            aria-label="Abrir menu"
            data-cta="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#17171C] border-b border-[#1D1D24] px-4 py-6 space-y-4 animate-fadeIn">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-[#B8B8C2]">
              <a href="#recursos" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">Recursos</a>
              <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">Como Funciona</a>
              <a href="#planos" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">Planos</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">Dúvidas</a>
            </nav>
            <div className="pt-4 border-t border-[#1D1D24] flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full py-2.5 text-center text-sm font-semibold text-[#B8B8C2] bg-[#0F0F12] border border-[#1D1D24] rounded-xl"
                data-cta="mobile-nav-login"
              >
                Entrar no Sistema
              </Link>
              <Link
                href="/onboarding"
                className="w-full py-3 text-center text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl shadow-lg shadow-rose-500/20"
                data-cta="mobile-nav-start-trial"
              >
                Começar 7 Dias Grátis
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 6. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[500px] bg-gradient-to-tr from-rose-500/10 via-purple-500/10 to-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Esquerda: Copy & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#17171C] border border-[#1D1D24] text-rose-300 text-xs font-bold shadow-inner">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>💅 Feito para Nail Designers & Salões de Unhas</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
                Seu Nail Studio organizado.{" "}
                <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                  Seu negócio sob controle.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[#B8B8C2] leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
                Tenha sua agenda organizada, reduza faltas e saiba exatamente quanto seu negócio está faturando.
              </p>

              <p className="text-sm text-slate-400 font-medium">
                Agenda, clientes, WhatsApp, ficha técnica, financeiro e muito mais em um único lugar.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/onboarding"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-base shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                  data-cta="hero-start-trial"
                >
                  <span>COMEÇAR 7 DIAS GRÁTIS</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#17171C] border border-[#1D1D24] hover:bg-[#1D1D24] text-slate-200 font-semibold text-base transition-colors flex items-center justify-center gap-2"
                  data-cta="hero-view-demo"
                >
                  <span>VER COMO FUNCIONA</span>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </Link>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#B8B8C2] font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>7 dias grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Configuração rápida em 2 min</span>
                </div>
              </div>
            </div>

            {/* Direita: Mockup do Dashboard Real */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/40 via-purple-500/40 to-amber-500/40 rounded-3xl blur-2xl opacity-50" />
              
              <div className="relative bg-[#17171C] border border-[#1D1D24] rounded-3xl p-4 shadow-2xl space-y-4">
                {/* Visual Topbar Mockup */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1D1D24] px-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">nailgestao.com.br/dashboard</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">● Ao Vivo</span>
                </div>

                {/* Dashboard Metrics Mockup */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#1D1D24] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#B8B8C2]">Faturamento Mês</span>
                    <div className="text-xl font-bold text-white">R$ 14.850,00</div>
                    <span className="text-[10px] text-emerald-400 font-semibold">+24.5% vs mês anterior</span>
                  </div>
                  <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#1D1D24] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#B8B8C2]">Clientes Ativas</span>
                    <div className="text-xl font-bold text-rose-400">142 Atendidas</div>
                    <span className="text-[10px] text-rose-300 font-semibold">89% Taxa de Retorno</span>
                  </div>
                </div>

                {/* Floating Notification Badge 1 */}
                <div className="bg-[#0F0F12] p-3.5 rounded-2xl border border-rose-500/30 flex items-center justify-between shadow-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold text-sm">
                      💅
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Novo Agendamento Confirmado</h4>
                      <p className="text-[11px] text-[#B8B8C2]">Maria Fernanda • Fibra de Vidro (R$ 220)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">Hoje 10:00</span>
                </div>

                {/* Floating Notification Badge 2 */}
                <div className="bg-[#0F0F12] p-3.5 rounded-2xl border border-emerald-500/30 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Lembrete Enviado via WhatsApp</h4>
                      <p className="text-[11px] text-[#B8B8C2]">Beatriz Cavalcante • Presença Confirmada</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">Sinal Pago</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. MICROPROVA ABAIXO DO HERO */}
      <section className="py-8 bg-[#17171C] border-y border-[#1D1D24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Feito para quem vive de unhas.
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1D1D24] p-4 rounded-2xl border border-[#272730] flex items-center gap-3">
              <span className="text-2xl">💅</span>
              <div>
                <h4 className="text-xs font-bold text-white">Nail Designer</h4>
                <p className="text-[10px] text-[#B8B8C2]">Atendimento Individual</p>
              </div>
            </div>

            <div className="bg-[#1D1D24] p-4 rounded-2xl border border-[#272730] flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <h4 className="text-xs font-bold text-white">Nail Studio</h4>
                <p className="text-[10px] text-[#B8B8C2]">Estrutura Especializada</p>
              </div>
            </div>

            <div className="bg-[#1D1D24] p-4 rounded-2xl border border-[#272730] flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <h4 className="text-xs font-bold text-white">Profissional Autônoma</h4>
                <p className="text-[10px] text-[#B8B8C2]">Organização Solo</p>
              </div>
            </div>

            <div className="bg-[#1D1D24] p-4 rounded-2xl border border-[#272730] flex items-center gap-3">
              <span className="text-2xl">👩‍🎨</span>
              <div>
                <h4 className="text-xs font-bold text-white">Studio com Equipe</h4>
                <p className="text-[10px] text-[#B8B8C2]">Manicures & Parceiras</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SEÇÃO DE DOR */}
      <section className="py-20 bg-[#0F0F12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              Desafios da Rotina
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Se você ainda controla tudo pelo WhatsApp, provavelmente já passou por isso:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24] hover:border-rose-500/30 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">❌</div>
              <h3 className="text-base font-bold text-white">Cliente esqueceu o horário.</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Você fica com a cadeira vaga, perde tempo e deixa de faturar no horário nobre.</p>
            </div>

            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24] hover:border-rose-500/30 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">❌</div>
              <h3 className="text-base font-bold text-white">Parar o atendimento para responder.</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Interromper a aplicação de gel a todo momento para passar valores e horários no WhatsApp.</p>
            </div>

            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24] hover:border-rose-500/30 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">❌</div>
              <h3 className="text-base font-bold text-white">Agenda espalhada em conversas.</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Anotações em papel, cadernos ou mensagens soltas que geram choques acidentais de horários.</p>
            </div>

            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24] hover:border-rose-500/30 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">❌</div>
              <h3 className="text-base font-bold text-white">Não saber quanto realmente faturou.</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Misturar o dinheiro pessoal com o do salão e não saber o lucro real no fim do mês.</p>
            </div>

            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24] hover:border-rose-500/30 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">❌</div>
              <h3 className="text-base font-bold text-white">Dificuldade em achar o histórico da cliente.</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Não lembrar qual cor, formato ou técnica de gel foi feita no último atendimento.</p>
            </div>

            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24] hover:border-rose-500/30 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">❌</div>
              <h3 className="text-base font-bold text-white">Horários vazios de última hora.</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Desistências em cima da hora que poderiam ser preenchidas por clientes da lista de espera.</p>
            </div>
          </div>

          <div className="mt-12 text-center max-w-2xl mx-auto space-y-6">
            <p className="text-lg font-semibold text-slate-200">
              Seu trabalho é cuidar das suas clientes. Não passar o dia organizando mensagens, anotações e planilhas.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-rose-500/25 transition-all transform hover:-translate-y-0.5"
              data-cta="pain-section-cta"
            >
              QUERO ORGANIZAR MEU STUDIO
            </Link>
          </div>
        </div>
      </section>

      {/* 9. SEÇÃO SOLUÇÃO */}
      <section id="recursos" className="py-20 bg-[#17171C] border-y border-[#1D1D24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Solução Completa
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Tudo o que você precisa para administrar seu Nail Studio em um só lugar.
            </h2>
            <p className="text-base text-[#B8B8C2]">
              Menos ferramentas. Menos confusão. Mais controle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#1D1D24] p-8 rounded-3xl border border-[#272730] hover:border-rose-500/40 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AGENDA</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">
                Organize seus horários e visualize sua rotina de forma simples por dia, semana ou mês.
              </p>
            </div>

            <div className="bg-[#1D1D24] p-8 rounded-3xl border border-[#272730] hover:border-rose-500/40 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">CLIENTES</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">
                Tenha histórico completo, contatos e informações importantes de cada cliente sempre à mão.
              </p>
            </div>

            <div className="bg-[#1D1D24] p-8 rounded-3xl border border-[#272730] hover:border-rose-500/40 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">WHATSAPP</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">
                Facilite confirmações e lembretes de horários conforme sua configuração de atendimento.
              </p>
            </div>

            <div className="bg-[#1D1D24] p-8 rounded-3xl border border-[#272730] hover:border-rose-500/40 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">FICHA TÉCNICA</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">
                Registre detalhes (formato, cor, tipo de gel), observações e galeria de fotos de cada atendimento.
              </p>
            </div>

            <div className="bg-[#1D1D24] p-8 rounded-3xl border border-[#272730] hover:border-rose-500/40 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">FINANCEIRO</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">
                Acompanhe entradas no caixa, despesas, repasse de comissões e saldo líquido do estúdio.
              </p>
            </div>

            <div className="bg-[#1D1D24] p-8 rounded-3xl border border-[#272730] hover:border-rose-500/40 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">RELATÓRIOS</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">
                Entenda seus números, taxa de retorno de clientes e acompanhe a evolução do seu negócio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. VÍDEO DEMONSTRATIVO */}
      <section id="como-funciona" className="py-20 bg-[#0F0F12]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              Demonstração em Vídeo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Veja o NailGestão funcionando na prática.
            </h2>
            <p className="text-base text-[#B8B8C2]">
              Em poucos minutos você ententede como sua rotina pode ficar mais organizada.
            </p>
          </div>

          {/* Player de Vídeo do Canva Integrado */}
          <CanvaVideoEmbed canvaUrl="https://canva.link/zk5w0m3nlu6yvh1" title="Demonstração em Vídeo do NailGestão PRO" />

          <div>
            <Link
              href="/onboarding"
              className="inline-flex px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-rose-500/25 transition-all"
              data-cta="video-section-start-trial"
            >
              COMEÇAR GRÁTIS
            </Link>
          </div>
        </div>
      </section>

      {/* 11. SEÇÃO AGENDA */}
      <section className="py-20 bg-[#17171C] border-y border-[#1D1D24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                Agenda Inteligente
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Sua agenda organizada do jeito que sua rotina precisa.
              </h2>
              <p className="text-base text-[#B8B8C2]">
                Chega de procurar horários em conversas soltas do WhatsApp.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-200">
                <div className="flex items-center gap-2 bg-[#1D1D24] p-3 rounded-xl border border-[#272730]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Horários 06h às 19h</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1D1D24] p-3 rounded-xl border border-[#272730]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Serviços & Duração</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1D1D24] p-3 rounded-xl border border-[#272730]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Clientes & Contatos</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1D1D24] p-3 rounded-xl border border-[#272730]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Sinais de Agendamento</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1D1D24] p-3 rounded-xl border border-[#272730]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Confirmações</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1D1D24] p-3 rounded-xl border border-[#272730]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Reagendamentos</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/onboarding"
                  className="inline-flex px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-rose-500/25 transition-all"
                  data-cta="agenda-section-cta"
                >
                  QUERO ORGANIZAR MINHA AGENDA
                </Link>
              </div>
            </div>

            {/* Mockup da Agenda Real */}
            <div className="lg:col-span-6 bg-[#0F0F12] p-6 rounded-3xl border border-[#1D1D24] shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#1D1D24]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-rose-400" />
                  <h4 className="text-sm font-bold text-white">Agenda Visual — Hoje</h4>
                </div>
                <span className="text-xs text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 font-semibold">4 Atendimentos</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-[#17171C] p-3 rounded-xl border-l-4 border-l-emerald-500 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white">10:00 - 12:30 • Maria Fernanda</span>
                    <p className="text-[11px] text-[#B8B8C2]">Alongamento em Fibra de Vidro (R$ 220)</p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">Confirmado</span>
                </div>

                <div className="bg-[#17171C] p-3 rounded-xl border-l-4 border-l-rose-500 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white">14:00 - 15:30 • Beatriz Cavalcante</span>
                    <p className="text-[11px] text-[#B8B8C2]">Manutenção de Fibra / Gel (R$ 130)</p>
                  </div>
                  <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold">Em Atendimento</span>
                </div>

                <div className="bg-[#17171C] p-3 rounded-xl border-l-4 border-l-amber-500 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white">16:00 - 17:00 • Carla Mendes</span>
                    <p className="text-[11px] text-[#B8B8C2]">SPA dos Pés Completo (R$ 140)</p>
                  </div>
                  <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">Sinal Pago</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 12. SEÇÃO WHATSAPP */}
      <section className="py-20 bg-[#0F0F12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Mockup da Conversa WhatsApp */}
            <div className="lg:col-span-6 bg-[#17171C] p-6 rounded-3xl border border-[#1D1D24] shadow-2xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#1D1D24]">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">WhatsApp Lembrete Automático</h4>
                  <p className="text-[10px] text-emerald-400">● Mensagem Pronta de Confirmação</p>
                </div>
              </div>

              <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#272730] text-xs text-slate-200 space-y-2 leading-relaxed">
                <p>Olá, <strong>Maria Fernanda!</strong> 💅💕</p>
                <p>Seu horário no <strong>Studio Luxe</strong> está agendado para:</p>
                <div className="bg-[#17171C] p-3 rounded-xl border border-[#272730] space-y-1 font-mono text-[11px] text-amber-300">
                  <p>📅 Data: Hoje</p>
                  <p>⏰ Horário: 10:00</p>
                  <p>💅 Procedimento: Fibra de Vidro Premium</p>
                </div>
                <p>Por favor, confirme sua presença clicando no botão abaixo!</p>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Redução de Faltas
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Sua cliente recebe o lembrete. Você não precisa lembrar por ela.
              </h2>
              <p className="text-base text-[#B8B8C2]">
                Facilite sua comunicação e mantenha suas clientes informadas sobre os próximos atendimentos.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-bold text-white">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</div>
                  <span>Menos mensagens manuais.</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-white">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</div>
                  <span>Mais organização na rotina.</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-white">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</div>
                  <span>Mais praticidade no dia a dia.</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/onboarding"
                  className="inline-flex px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all"
                  data-cta="whatsapp-section-cta"
                >
                  TESTAR GRÁTIS
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 13. SEÇÃO CLIENTES */}
      <section className="py-20 bg-[#17171C] border-y border-[#1D1D24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
              Gestão de Clientes & CRM
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Conheça melhor cada cliente que passa pelo seu studio.
            </h2>
            <p className="text-base text-[#B8B8C2]">
              Tenha uma ficha organizada com histórico e informações importantes para oferecer um atendimento cada vez mais personalizado.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-left">
            <div className="bg-[#1D1D24] p-5 rounded-2xl border border-[#272730]">
              <span className="text-xl mb-2 block">📋</span>
              <h4 className="text-sm font-bold text-white mb-1">Histórico</h4>
              <p className="text-[11px] text-[#B8B8C2]">Atendimentos passados e total gasto</p>
            </div>
            <div className="bg-[#1D1D24] p-5 rounded-2xl border border-[#272730]">
              <span className="text-xl mb-2 block">💅</span>
              <h4 className="text-sm font-bold text-white mb-1">Serviços</h4>
              <p className="text-[11px] text-[#B8B8C2]">Procedimentos preferidos da cliente</p>
            </div>
            <div className="bg-[#1D1D24] p-5 rounded-2xl border border-[#272730]">
              <span className="text-xl mb-2 block">📝</span>
              <h4 className="text-sm font-bold text-white mb-1">Observações</h4>
              <p className="text-[11px] text-[#B8B8C2]">Alergias e preferências de cutícula</p>
            </div>
            <div className="bg-[#1D1D24] p-5 rounded-2xl border border-[#272730]">
              <span className="text-xl mb-2 block">📸</span>
              <h4 className="text-sm font-bold text-white mb-1">Fotos</h4>
              <p className="text-[11px] text-[#B8B8C2]">Galeria de Antes & Depois</p>
            </div>
            <div className="bg-[#1D1D24] p-5 rounded-2xl border border-[#272730] col-span-2 md:col-span-1">
              <span className="text-xl mb-2 block">📅</span>
              <h4 className="text-sm font-bold text-white mb-1">Próximo Atendimento</h4>
              <p className="text-[11px] text-[#B8B8C2]">Lembrete de manutenção futura</p>
            </div>
          </div>
        </div>
      </section>

      {/* 14. SEÇÃO FICHA TÉCNICA */}
      <section className="py-20 bg-[#0F0F12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                Especialidade Nail Art
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Cada unha tem uma história. Guarde todos os detalhes.
              </h2>
              <p className="text-base text-[#B8B8C2]">
                Na próxima visita da cliente, você já sabe exatamente o que foi feito no atendimento anterior.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-200">
                <div className="bg-[#17171C] p-3 rounded-xl border border-[#1D1D24]">📐 Formato (Amendoado, Stiletto)</div>
                <div className="bg-[#17171C] p-3 rounded-xl border border-[#1D1D24]">🎨 Cor do Esmalte Gel</div>
                <div className="bg-[#17171C] p-3 rounded-xl border border-[#1D1D24]">🧪 Material (Fibra, Gel Moldado)</div>
                <div className="bg-[#17171C] p-3 rounded-xl border border-[#1D1D24]">📏 Tamanho da Estrutura</div>
                <div className="bg-[#17171C] p-3 rounded-xl border border-[#1D1D24]">✨ Nail Art & Encapsulada</div>
                <div className="bg-[#17171C] p-3 rounded-xl border border-[#1D1D24]">📸 Fotos do Portfólio</div>
              </div>
            </div>

            {/* Mockup Ficha Técnica */}
            <div className="lg:col-span-6 bg-[#17171C] p-6 rounded-3xl border border-[#1D1D24] shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#1D1D24]">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Ficha Técnica • Maria Fernanda Rossi</h4>
                <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-bold">VIP</span>
              </div>
              <div className="space-y-2 text-xs text-[#B8B8C2]">
                <p><strong className="text-white">Formato:</strong> Amendoado Curvatura C</p>
                <p><strong className="text-white">Material:</strong> Fibra de Vidro Silk</p>
                <p><strong className="text-white">Cor:</strong> Esmalte Gel Nude Rendado D&Z</p>
                <p><strong className="text-white">Decoração:</strong> Francesa Reversa com Folha de Ouro</p>
                <p><strong className="text-white">Observação:</strong> Usar apenas removedor sem acetona pura.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 15. SEÇÃO FINANCEIRO */}
      <section className="py-20 bg-[#17171C] border-y border-[#1D1D24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Controle de Dinheiro
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Você sabe quanto seu studio realmente faturou este mês?
            </h2>
            <p className="text-base text-[#B8B8C2]">
              Tenha uma visão clara do dinheiro que entra e sai do seu negócio.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-left">
            <div className="bg-[#1D1D24] p-5 rounded-2xl border border-[#272730]">
              <span className="text-xs text-[#B8B8C2] uppercase font-bold block mb-1">Faturamento</span>
              <div className="text-xl font-bold text-emerald-400">R$ 14.850</div>
            </div>
            <div className="bg-[#1D1D24] p-5 rounded-2xl border border-[#272730]">
              <span className="text-xs text-[#B8B8C2] uppercase font-bold block mb-1">Despesas</span>
              <div className="text-xl font-bold text-rose-400">R$ 3.240</div>
            </div>
            <div className="bg-[#1D1D24] p-5 rounded-2xl border border-[#272730]">
              <span className="text-xs text-[#B8B8C2] uppercase font-bold block mb-1">Saldo Líquido</span>
              <div className="text-xl font-bold text-amber-300">R$ 11.610</div>
            </div>
            <div className="bg-[#1D1D24] p-5 rounded-2xl border border-[#272730]">
              <span className="text-xs text-[#B8B8C2] uppercase font-bold block mb-1">Atendimentos</span>
              <div className="text-xl font-bold text-white">142 Proced.</div>
            </div>
            <div className="bg-[#1D1D24] p-5 rounded-2xl border border-[#272730] col-span-2 md:col-span-1">
              <span className="text-xs text-[#B8B8C2] uppercase font-bold block mb-1">Ticket Médio</span>
              <div className="text-xl font-bold text-purple-400">R$ 104,50</div>
            </div>
          </div>

          <div>
            <Link
              href="/onboarding"
              className="inline-flex px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-rose-500/25 transition-all"
              data-cta="finance-section-cta"
            >
              QUERO TER CONTROLE
            </Link>
          </div>
        </div>
      </section>

      {/* 16. SEÇÃO AGENDAMENTO ONLINE */}
      <section className="py-20 bg-[#0F0F12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              Link de Agendamento 24h
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Sua agenda pode receber pedidos de horário mesmo quando você está atendendo.
            </h2>
            <p className="text-base text-[#B8B8C2]">
              Compartilhe seu link no Instagram, WhatsApp ou onde suas clientes estiverem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24]">
              <div className="h-10 w-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold mx-auto mb-3">1</div>
              <h4 className="text-sm font-bold text-white mb-1">CLIENTE ACESSA O LINK</h4>
              <p className="text-xs text-[#B8B8C2]">Navega pelo seu link `/agendar`</p>
            </div>
            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24]">
              <div className="h-10 w-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold mx-auto mb-3">2</div>
              <h4 className="text-sm font-bold text-white mb-1">ESCOLHE O SERVIÇO</h4>
              <p className="text-xs text-[#B8B8C2]">Fibra de vidro, manutenção, etc.</p>
            </div>
            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24]">
              <div className="h-10 w-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold mx-auto mb-3">3</div>
              <h4 className="text-sm font-bold text-white mb-1">ESCOLHE DATA & HORÁRIO</h4>
              <p className="text-xs text-[#B8B8C2]">Horários livres em tempo real</p>
            </div>
            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24]">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mx-auto mb-3">4</div>
              <h4 className="text-sm font-bold text-white mb-1">SOLICITA AGENDAMENTO</h4>
              <p className="text-xs text-[#B8B8C2]">Recebe o comprovante e confirmação</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/onboarding"
              className="inline-flex px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-rose-500/25 transition-all"
              data-cta="online-booking-section-cta"
            >
              CRIAR MINHA AGENDA
            </Link>
          </div>
        </div>
      </section>

      {/* 17. SEÇÃO BENEFÍCIOS */}
      <section className="py-20 bg-[#17171C] border-y border-[#1D1D24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              O que muda quando você começa a usar o NailGestão?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#1D1D24] p-6 rounded-2xl border border-[#272730] space-y-2">
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider">MAIS TEMPO</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Menos tarefas manuais na sua rotina para você focar no atendimento.</p>
            </div>
            <div className="bg-[#1D1D24] p-6 rounded-2xl border border-[#272730] space-y-2">
              <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider">MAIS ORGANIZAÇÃO</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Todos os seus horários e fichas técnicas centralizados em um só lugar.</p>
            </div>
            <div className="bg-[#1D1D24] p-6 rounded-2xl border border-[#272730] space-y-2">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">MAIS CONTROLE</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Tenha visão clara dos números e entradas do seu negócio.</p>
            </div>
            <div className="bg-[#1D1D24] p-6 rounded-2xl border border-[#272730] space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">MAIS PROFISSIONALISMO</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Ofereça uma experiência sofisticada e organizada às suas clientes.</p>
            </div>
            <div className="bg-[#1D1D24] p-6 rounded-2xl border border-[#272730] space-y-2">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">MAIS INFORMAÇÃO</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Tenha histórico e fotos de cada atendimento sempre disponíveis.</p>
            </div>
            <div className="bg-[#1D1D24] p-6 rounded-2xl border border-[#272730] space-y-2">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">MAIS VISIBILIDADE</h3>
              <p className="text-xs text-[#B8B8C2] leading-relaxed">Entenda melhor o desempenho do seu studio e cresça com segurança.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 18. SEÇÃO "PARA QUEM É" */}
      <section className="py-20 bg-[#0F0F12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Feito para diferentes fases do seu negócio.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24] space-y-3">
              <span className="text-2xl">💅</span>
              <h4 className="text-base font-bold text-white">Nail Designer Autônoma</h4>
              <p className="text-xs text-[#B8B8C2]">Trabalha sozinha e quer organizar agenda, clientes e financeiro.</p>
            </div>
            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24] space-y-3">
              <span className="text-2xl">📅</span>
              <h4 className="text-base font-bold text-white">Nail Studio</h4>
              <p className="text-xs text-[#B8B8C2]">Atende várias clientes e quer profissionalizar sua operação diária.</p>
            </div>
            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24] space-y-3">
              <span className="text-2xl">👩‍🎨</span>
              <h4 className="text-base font-bold text-white">Studio com Equipe</h4>
              <p className="text-xs text-[#B8B8C2]">Precisa acompanhar profissionais, horários e repasse de comissões.</p>
            </div>
            <div className="bg-[#17171C] p-6 rounded-2xl border border-[#1D1D24] space-y-3">
              <span className="text-2xl">🚀</span>
              <h4 className="text-base font-bold text-white">Profissional em Crescimento</h4>
              <p className="text-xs text-[#B8B8C2]">Quer parar de improvisar e começar a administrar como empresa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 19. PROVA SOCIAL (DEPOIMENTOS PREPARADOS) */}
      <section className="py-20 bg-[#17171C] border-y border-[#1D1D24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Experiência de Uso
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Quem usa, entende a diferença.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Card Real de WhatsApp */}
            <div className="bg-[#1D1D24] p-5 rounded-2xl border-2 border-emerald-500/40 space-y-3 flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-block">
                  💬 Prova Social Real no WhatsApp
                </span>
                <div className="rounded-xl overflow-hidden border border-[#272730] max-h-64 flex justify-center bg-black/60 p-1">
                  <img
                    src="/prova-social-whatsapp.png"
                    alt="Comprovante de Agendamento Real no WhatsApp da Cliente Nadia"
                    className="h-full w-auto object-contain rounded-lg hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-xs text-white font-bold leading-relaxed">
                  "Amei esse link kkk Amei amei"
                </p>
              </div>
              <div className="pt-2 border-t border-[#272730]">
                <h4 className="text-xs font-bold text-emerald-400">Cliente Nadia</h4>
                <p className="text-[10px] text-[#B8B8C2]">Agendamento Real • Banho de Gel</p>
              </div>
            </div>

            <div className="bg-[#1D1D24] p-6 rounded-2xl border border-[#272730] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1 text-sm">★★★★★</div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "Minhas clientes adoraram o agendamento pelo link e a facilidade de escolher o horário. Reduzi as faltas a quase zero!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-[#272730]">
                <div className="h-9 w-9 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs">
                  JL
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Juliana Silva</h4>
                  <p className="text-[10px] text-[#B8B8C2]">Nail Master • Studio Luxe</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1D1D24] p-6 rounded-2xl border border-[#272730] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1 text-sm">★★★★★</div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "Ter a ficha técnica com fotos antes/depois me deu muito mais segurança para atender e explicar os cuidados com o gel."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-[#272730]">
                <div className="h-9 w-9 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs">
                  CS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Camila Santos</h4>
                  <p className="text-[10px] text-[#B8B8C2]">Especialista em Fibra • SP</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1D1D24] p-6 rounded-2xl border border-[#272730] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1 text-sm">★★★★★</div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "Consigo ver o faturamento diário e o repasse das manicures da equipe sem complicação no final do dia."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-[#272730]">
                <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  AC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Amanda Costa</h4>
                  <p className="text-[10px] text-[#B8B8C2]">Proprietária de Studio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 20. CASE REAL (ANTES VS DEPOIS) */}
      <section className="py-20 bg-[#0F0F12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Na rotina real de uma Nail Designer.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* ANTES */}
            <div className="bg-[#17171C] p-8 rounded-3xl border border-rose-500/30 space-y-4">
              <div className="inline-flex px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 font-bold text-xs">
                ANTES (Rotina Manual)
              </div>
              <ul className="space-y-3 text-xs text-[#B8B8C2]">
                <li className="flex items-start gap-2">❌ Mensagens acumuladas no WhatsApp</li>
                <li className="flex items-start gap-2">❌ Anotações em cadernos e papel</li>
                <li className="flex items-start gap-2">❌ Esquecimento de horários por clientes</li>
                <li className="flex items-start gap-2">❌ Mistura de contas pessoais e do salão</li>
              </ul>
            </div>

            {/* DEPOIS */}
            <div className="bg-[#17171C] p-8 rounded-3xl border border-emerald-500/30 space-y-4">
              <div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs">
                DEPOIS (Com NailGestão)
              </div>
              <ul className="space-y-3 text-xs text-slate-200 font-medium">
                <li className="flex items-start gap-2">✨ Agenda organizada e online 24h</li>
                <li className="flex items-start gap-2">✨ Histórico e Ficha Técnica por cliente</li>
                <li className="flex items-start gap-2">✨ Lembretes de confirmação sem faltas</li>
                <li className="flex items-start gap-2">✨ Controle financeiro e de caixa transparente</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 21. SEÇÃO PLANOS & PREÇOS */}
      <section id="planos" className="py-24 bg-[#17171C] border-y border-[#1D1D24] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Investimento Transparente
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Escolha o plano ideal para o seu momento
            </h2>
            <p className="text-base text-[#B8B8C2]">
              Todos os planos incluem 7 dias grátis de teste e suporte especializado.
            </p>

            <div className="pt-6 flex items-center justify-center gap-4">
              <span className={`text-sm font-semibold ${billingCycle === "monthly" ? "text-white" : "text-[#B8B8C2]"}`}>
                Pagamento Mensal
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="w-14 h-8 rounded-full bg-[#0F0F12] border border-[#272730] p-1 relative transition-colors focus:outline-none"
                aria-label="Alternar plano mensal/anual"
                data-cta="toggle-billing-cycle"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-rose-500 transition-transform ${
                    billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${billingCycle === "yearly" ? "text-white" : "text-[#B8B8C2]"}`}>
                  Pagamento Anual
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Economize 20%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Solo */}
            <div className="bg-[#1D1D24] rounded-3xl border border-[#272730] p-8 flex flex-col justify-between hover:border-slate-600 transition-all">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">SOLO / INICIANTE</h3>
                <p className="text-xs text-[#B8B8C2] mb-6">Ideal para Nail Designers autônomas e ateliês individuais.</p>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">
                    R$ {billingCycle === "yearly" ? Math.round(49 * 0.8) : 49}
                  </span>
                  <span className="text-xs text-[#B8B8C2]">/ mês</span>
                </div>

                <ul className="space-y-4 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>1 Profissional (Nail Designer Solo)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Agenda Online 24h para Clientes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>CRM de Clientes & Ficha Técnica</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Controle de Caixa Básico</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/onboarding?plan=iniciante"
                className="w-full py-3.5 rounded-xl bg-[#272730] hover:bg-[#32323d] text-white font-semibold text-xs text-center transition-colors block"
                data-cta="pricing-solo"
              >
                COMEÇAR 7 DIAS GRÁTIS
              </Link>
            </div>

            {/* Pro Studio - MAIS ESCOLHIDO */}
            <div className="bg-[#1D1D24] rounded-3xl border-2 border-rose-500 p-8 flex flex-col justify-between shadow-2xl shadow-rose-500/10 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md">
                MAIS ESCOLHIDO 🏆
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">PRO STUDIO</h3>
                <p className="text-xs text-[#B8B8C2] mb-6">Para estúdios em crescimento e atendimento em equipe.</p>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-rose-400">
                    R$ {billingCycle === "yearly" ? Math.round(89 * 0.8) : 89}
                  </span>
                  <span className="text-xs text-[#B8B8C2]">/ mês</span>
                </div>

                <ul className="space-y-4 text-xs text-slate-200 mb-8">
                  <li className="flex items-center gap-3 font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>Tudo do Plano Solo +</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>Até 5 Profissionais na Equipe</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>Lembretes Automáticos WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>Galeria Antes & Depois de Fotos</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>Relatório de Comissões da Equipe</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/onboarding?plan=pro"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-xs text-center shadow-lg shadow-rose-500/25 transition-all block"
                data-cta="pricing-pro"
              >
                TESTAR 7 DIAS SEM COMPROMISSO
              </Link>
            </div>

            {/* Studio Gold */}
            <div className="bg-[#1D1D24] rounded-3xl border border-[#272730] p-8 flex flex-col justify-between hover:border-slate-600 transition-all">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">STUDIO GOLD</h3>
                <p className="text-xs text-[#B8B8C2] mb-6">Para grandes salões e marcas em expansão.</p>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-amber-300">
                    R$ {billingCycle === "yearly" ? Math.round(149 * 0.8) : 149}
                  </span>
                  <span className="text-xs text-[#B8B8C2]">/ mês</span>
                </div>

                <ul className="space-y-4 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-3 font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Tudo do Plano Pro +</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Profissionais Ilimitados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Disparo de Campanhas Promocionais</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Relatórios Gerenciais em PDF</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/onboarding?plan=gold"
                className="w-full py-3.5 rounded-xl bg-[#272730] hover:bg-[#32323d] text-white font-semibold text-xs text-center transition-colors block"
                data-cta="pricing-gold"
              >
                ESCOLHER STUDIO GOLD
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 22. TESTE GRATUITO EM DESTAQUE */}
      <section className="py-16 bg-gradient-to-r from-rose-950/40 via-[#17171C] to-purple-950/40 border-b border-[#1D1D24]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            Experimente Sem Risco
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            7 DIAS GRÁTIS
          </h2>
          <p className="text-sm text-[#B8B8C2] max-w-xl mx-auto">
            Sem cartão de crédito • Configuração em 2 minutos • Comece agora mesmo
          </p>
          <div>
            <Link
              href="/onboarding"
              className="inline-flex px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-sm shadow-xl shadow-rose-500/30 transition-all transform hover:-translate-y-0.5"
              data-cta="highlight-trial-cta"
            >
              COMEÇAR MEU TESTE GRÁTIS
            </Link>
          </div>
        </div>
      </section>

      {/* 23. TABELA COMPARATIVA DE PLANOS */}
      <section className="py-20 bg-[#0F0F12]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Comparativo Completo de Recursos
            </h2>
            <p className="text-xs text-[#B8B8C2]">
              Veja a matriz detalhada de funcionalidades por plano.
            </p>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-[#1D1D24] text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-4 px-4 font-bold">Recurso / Funcionalidade</th>
                  <th className="py-4 px-4 text-center font-bold text-white">Solo</th>
                  <th className="py-4 px-4 text-center font-bold text-rose-400">Pro Studio</th>
                  <th className="py-4 px-4 text-center font-bold text-amber-300">Studio Gold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1D24]">
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Profissionais Cadastrados</td>
                  <td className="py-3 px-4 text-center">1 Solo</td>
                  <td className="py-3 px-4 text-center font-bold text-rose-300">Até 5</td>
                  <td className="py-3 px-4 text-center font-bold text-amber-300">Ilimitados</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Agenda Online 24h (`/agendar`)</td>
                  <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                  <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                  <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">CRM & Ficha Técnica de Unhas</td>
                  <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                  <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                  <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Galeria de Fotos Antes & Depois</td>
                  <td className="py-3 px-4 text-center text-slate-600">-</td>
                  <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                  <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Lembretes de Confirmação WhatsApp</td>
                  <td className="py-3 px-4 text-center text-slate-600">-</td>
                  <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                  <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Cálculo de Comissões de Equipe</td>
                  <td className="py-3 px-4 text-center text-slate-600">-</td>
                  <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                  <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Caixa Diário & DRE Financeiro</td>
                  <td className="py-3 px-4 text-center text-emerald-400">Básico</td>
                  <td className="py-3 px-4 text-center text-emerald-400">Completo</td>
                  <td className="py-3 px-4 text-center text-emerald-400">Avançado</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Disparo de Campanhas Promocionais</td>
                  <td className="py-3 px-4 text-center text-slate-600">-</td>
                  <td className="py-3 px-4 text-center text-slate-600">-</td>
                  <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 24. SEÇÃO FAQ */}
      <section id="faq" className="py-20 bg-[#17171C] border-y border-[#1D1D24]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              Tire Suas Dúvidas
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqList.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#1D1D24] rounded-2xl border border-[#272730] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex justify-between items-center text-sm font-bold text-white hover:text-rose-300 transition-colors"
                  aria-expanded={activeFaq === idx}
                  data-cta={`faq-item-${idx}`}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${
                      activeFaq === idx ? "rotate-180 text-rose-400" : ""
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-[#B8B8C2] leading-relaxed border-t border-[#272730] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 25. SEÇÃO CTA FINAL */}
      <section className="py-24 bg-gradient-to-tr from-[#0F0F12] via-[#17171C] to-rose-950/40 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-8 relative z-10">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Está na hora de profissionalizar seu Nail Studio.
            </h2>
            <p className="text-base text-[#B8B8C2] max-w-2xl mx-auto">
              Organize sua agenda, conheça melhor suas clientes e tenha mais controle sobre seu negócio.
            </p>
          </div>

          <div>
            <Link
              href="/onboarding"
              className="inline-flex px-10 py-5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-lg shadow-2xl shadow-rose-500/40 transition-all transform hover:-translate-y-1"
              data-cta="final-start-trial"
            >
              COMEÇAR 7 DIAS GRÁTIS
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            Sem cartão de crédito • Configuração rápida • Cancele quando quiser conforme as condições do seu plano
          </p>
        </div>
      </section>

      {/* 26. FOOTER */}
      <footer className="bg-[#0F0F12] border-t border-[#1D1D24] py-12 text-[#B8B8C2] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
                  💅
                </div>
                <span className="font-extrabold text-white text-base">NailGestão PRO</span>
              </div>
              <p className="text-xs text-[#B8B8C2] max-w-sm">
                Sistema de gestão comercial completo para Nail Designers e Nail Studios.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Navegação</h4>
              <ul className="space-y-2">
                <li><a href="#recursos" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#planos" className="hover:text-white transition-colors">Planos & Preços</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Perguntas Frequentes</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Acesso Rápido</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-white transition-colors">Login Administradora</Link></li>
                <li><Link href="/onboarding" className="hover:text-white transition-colors">Criar Salão Grátis</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Ver Painel Demo</Link></li>
                <li><Link href="/agendar" className="hover:text-white transition-colors">Agenda Online</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#1D1D24] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
            <p>© 2026 NailGestão. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <span>Termos de Uso</span>
              <span>•</span>
              <span>Política de Privacidade</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 27. CTA FIXO NO MOBILE */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-[#0F0F12]/95 border-t border-[#1D1D24] backdrop-blur-lg pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Link
          href="/onboarding"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-white font-extrabold text-sm text-center shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2"
          data-cta="mobile-fixed-sticky-cta"
        >
          <span>🚀 COMEÇAR 7 DIAS GRÁTIS</span>
        </Link>
      </div>

      {/* Modal de Vídeo */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#17171C] border border-[#1D1D24] rounded-3xl max-w-3xl w-full p-6 space-y-4 relative">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-[#0F0F12]"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white">Demonstração Prática do NailGestão PRO</h3>
            <div className="aspect-video bg-[#0F0F12] rounded-2xl flex items-center justify-center border border-[#1D1D24]">
              <div className="text-center p-6 space-y-2">
                <Sparkles className="h-10 w-10 text-amber-400 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-white">Tour Guiado em Vídeo (Placeholder)</p>
                <p className="text-xs text-[#B8B8C2]">Substitua pela URL oficial do seu vídeo no YouTube, Vimeo ou MP4 em `src/app/page.tsx`</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
