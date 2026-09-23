"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MessageCircle, ShieldAlert, Sparkles, Lock, ArrowRight, LogOut, ExternalLink, AlertTriangle } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [salonName, setSalonName] = useState<string>("Seu Salão");

  const isPublicPage =
    pathname === "/" ||
    pathname === "/landing" ||
    pathname === "/onboarding" ||
    pathname === "/agendar" ||
    pathname?.startsWith("/agendar") ||
    pathname === "/planos" ||
    pathname === "/login";

  useEffect(() => {
    if (isPublicPage) {
      setCheckingAuth(false);
      return;
    }

    // Suporte para testar simulação de dias restantes na URL (ex: ?simulateDaysLeft=3 ou ?simulateDaysLeft=0)
    let simParam: string | null = null;
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      simParam = urlParams.get("simulateDaysLeft");
    }

    const fetchUrl = simParam !== null ? `/api/auth/session?simulateDaysLeft=${simParam}` : "/api/auth/session";

    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          setUserRole("DEMO");
          setCheckingAuth(false);
          return;
        }

        const role = data.user.role || "PROFISSIONAL";
        setUserRole(role);

        if (data.salon?.name) {
          setSalonName(data.salon.name);
        }

        if (data.isTrialExpired) {
          setIsTrialExpired(true);
          setTrialDaysLeft(0);
        } else if (typeof data.trialDaysLeft === "number") {
          setTrialDaysLeft(data.trialDaysLeft);
          if (data.trialDaysLeft <= 0) {
            setIsTrialExpired(true);
          }
        }

        // Se for colaboradora / profissional, restringir rotas exclusivamente para /agenda e /caixa
        if (role === "PROFISSIONAL" || role === "COLABORADORA" || role === "ATENDENTE") {
          if (pathname !== "/agenda" && pathname !== "/caixa") {
            router.push("/agenda");
          }
        }
        setCheckingAuth(false);
      })
      .catch(() => {
        setUserRole("DEMO");
        setCheckingAuth(false);
      });
  }, [pathname, isPublicPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      router.push("/login");
    }
  };

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF3F0] via-[#F6EBE5] to-[#EFE0D5] font-sans text-slate-800 antialiased dark:from-[#0F172A] dark:to-[#020617] dark:text-slate-100">
        {children}
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FAF3F0] via-[#F6EBE5] to-[#EFE0D5] dark:from-[#0F172A] dark:to-[#020617]">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 text-white text-2xl font-bold animate-pulse">
            💅
          </div>
          <p className="text-xs font-bold text-rose-900 dark:text-rose-200">Carregando painel do salão...</p>
        </div>
      </div>
    );
  }

  // TELA DE BLOQUEIO DO SISTEMA QUANDO O TESTE EXPIRA (LOCKED TRIAL OVERLAY)
  if (isTrialExpired) {
    const whatsappUrl = `https://wa.me/5567992684748?text=Ol%C3%A1%21%20Meu%20per%C3%ADodo%20de%20teste%20gr%C3%A1tis%20do%20NailGest%C3%A3o%20PRO%20expirou%20no%20sal%C3%A3o%20${encodeURIComponent(
      salonName
    )}%20e%20gostaria%20de%20ativar%20minha%20assinatura.`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F0F12]/95 backdrop-blur-xl p-4 text-slate-100">
        <div className="max-w-lg w-full bg-[#17171C] border-2 border-rose-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-rose-500 via-amber-400 to-purple-600 animate-pulse" />
          
          <div className="mx-auto h-20 w-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-500/30 animate-bounce">
            <Lock className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3.5 py-1.5 rounded-full border border-rose-500/30 inline-block">
              🔒 Período Gratuito Terminou
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Seu período de teste terminou.
            </h2>
            <p className="text-xs sm:text-sm text-[#B8B8C2] leading-relaxed">
              Escolha um plano para liberar o acesso ao NailGestão. Todos os seus agendamentos, clientes e histórico continuam <strong className="text-emerald-400">100% salvos e preservados!</strong>
            </p>
          </div>

          <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#272730] space-y-2 text-left text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Nenhum dado ou cliente foi excluído do seu salão</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Planos flexíveis: Solo (R$49), Pro (R$89) e Gold (R$149)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Liberação rápida com suporte via WhatsApp</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/planos#planos"
              data-cta="click_view_plans"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-sm shadow-xl shadow-rose-500/40 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>ESCOLHER MEU PLANO</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors shadow-lg"
            >
              <MessageCircle className="h-4 w-4 fill-current text-emerald-400" />
              <span>FALAR COM SUPORTE (67) 99268-4748</span>
            </a>

            <button
              onClick={handleLogout}
              className="w-full py-2 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors pt-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair ou Acessar outra conta</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estilização dinâmica dos Banners Informativos de Teste
  let bannerBgClass = "bg-gradient-to-r from-emerald-600 via-teal-600 to-rose-600";
  let bannerText = "";
  let isAlert = false;

  if (typeof trialDaysLeft === "number" && trialDaysLeft >= 0) {
    if (trialDaysLeft === 3) {
      bannerBgClass = "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600";
      bannerText = "⚠️ Seu teste gratuito expira em 3 dias! Escolha seu plano para evitar o bloqueio da sua agenda.";
      isAlert = true;
    } else if (trialDaysLeft === 2) {
      bannerBgClass = "bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600";
      bannerText = "⚠️ Atenção: Restam apenas 2 dias do seu teste gratuito! Escolha o plano ideal.";
      isAlert = true;
    } else if (trialDaysLeft === 1) {
      bannerBgClass = "bg-gradient-to-r from-rose-600 via-pink-600 to-purple-700 animate-pulse";
      bannerText = "⚠️ ÚLTIMO DIA DE TESTE! Seu acesso gratuito expira amanhã. Garanta seu plano agora.";
      isAlert = true;
    } else {
      bannerText = `🎁 Seu teste gratuito está ativo — Você tem ${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}.`;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#FAF3F0] via-[#F6EBE5] to-[#EFE0D5] dark:from-[#0F172A] dark:to-[#020617] text-slate-900 dark:text-slate-100">
      {userRole === "DEMO" && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 px-4 py-2 text-center text-xs font-bold text-white shadow-md flex flex-wrap items-center justify-between gap-2 z-40">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span>✨ <strong>Modo Demonstração (Apenas Visualização)</strong> — Explore todas as telas do sistema livremente!</span>
          </div>
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <a href="/login" className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition">
              🔑 Entrar como Administradora
            </a>
            <a href="/onboarding" className="px-3 py-1 bg-slate-950 hover:bg-slate-900 rounded-lg text-amber-300 font-semibold transition">
              🚀 Testar Grátis 7 Dias
            </a>
          </div>
        </div>
      )}

      {/* BANNER INFORMATIVO DE DIAS RESTANTES DO TESTE */}
      {typeof trialDaysLeft === "number" && trialDaysLeft > 0 && userRole !== "DEMO" && (
        <div className={`${bannerBgClass} px-4 py-2 text-center text-xs font-bold text-white shadow-md flex flex-wrap items-center justify-between gap-2 z-40`}>
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            {isAlert && <AlertTriangle className="h-4 w-4 text-amber-200 animate-bounce" />}
            <span>{bannerText}</span>
          </div>
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <Link
              href="/planos#planos"
              data-cta="click_view_plans"
              className="px-3.5 py-1 bg-white text-slate-950 hover:bg-slate-100 rounded-lg font-extrabold transition flex items-center gap-1 shadow"
            >
              <span>ESCOLHER MEU PLANO</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      <Header userRole={userRole} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar userRole={userRole} />
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav userRole={userRole} />
    </div>
  );
}
