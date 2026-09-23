"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Calendar,
  CreditCard,
  Crown,
  ArrowUpRight,
  RefreshCw,
  Clock,
  MessageCircle,
  ExternalLink
} from "lucide-react";

export default function SubscriptionPage() {
  const [salon, setSalon] = useState<any>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((res) => res.json()),
      fetch("/api/auth/session").then((res) => res.json())
    ])
      .then(([settingsData, sessionData]) => {
        setSalon(settingsData);
        if (typeof sessionData.trialDaysLeft === "number") {
          setTrialDaysLeft(sessionData.trialDaysLeft);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const planName = salon?.planName || "PRO";
  const planPrices: Record<string, string> = {
    SOLO: "R$ 49,00/mês",
    INICIANTE: "R$ 49,00/mês",
    PRO: "R$ 89,00/mês",
    GOLD: "R$ 149,00/mês",
  };

  const currentPrice = planPrices[planName.toUpperCase()] || "R$ 89,00/mês";
  const subStatus = salon?.subscriptionStatus || "TRIAL";

  const getStatusBadge = () => {
    if (subStatus === "TRIAL" || subStatus === "TRIALING") {
      return (
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
          🎁 Período de Teste Grátis Ativo (trialing)
        </span>
      );
    }
    if (subStatus === "ATIVO" || subStatus === "ACTIVE") {
      return (
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
          ✓ Assinatura Ativa (active)
        </span>
      );
    }
    return (
      <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
        🔒 Período Gratuito Terminou (expired)
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Crown className="h-4 w-4" />
            <span>Configurações &gt; Minha Assinatura</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Minha Assinatura 💅
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Acompanhe os detalhes do seu plano comercial, período de teste e canais de suporte.
          </p>
        </div>

        <Link
          href="/planos"
          data-cta="click_view_plans"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all"
        >
          <span>ALTERAR PLANO</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Active Plan Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex justify-between items-start mb-6">
            <div>
              {getStatusBadge()}
              <h2 className="text-3xl font-extrabold text-white mt-3">
                NailGestão {planName}
              </h2>
              <p className="text-sm font-semibold text-rose-400 mt-1">{currentPrice}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
              <Crown className="h-6 w-6" />
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Sua conta possui acesso à Agenda Online 24h, Lembretes via WhatsApp, Ficha Técnica de Unhas, Controle Financeiro e Relatórios.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/80 pt-6 text-xs">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-slate-400">Data de Início:</span>
                <p className="font-semibold text-slate-200">
                  {salon?.createdAt ? new Date(salon.createdAt).toLocaleDateString("pt-BR") : "Cadastro Recente"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-slate-400">Término do Teste Grátis:</span>
                <p className="font-semibold text-amber-300">
                  {salon?.trialEndsAt
                    ? new Date(salon.trialEndsAt).toLocaleDateString("pt-BR")
                    : trialDaysLeft !== null
                    ? `Restam ${trialDaysLeft} dias`
                    : "7 Dias Grátis Ativo"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-800">
            <Link
              href="/planos"
              data-cta="click_view_plans"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20"
            >
              <span>ALTERAR PLANO</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <a
              href="https://wa.me/5567992684748?text=Ol%C3%A1%21%20Gostaria%20de%20falar%20com%20o%20suporte%20sobre%20minha%20assinatura%20do%20NailGest%C3%A3o."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2 hover:bg-emerald-500/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4 fill-current" />
              <span>FALAR COM SUPORTE</span>
            </a>
          </div>
        </div>

        {/* Benefits & Info Card */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-rose-400" />
              <span>Recursos do Seu Plano</span>
            </h3>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Agenda Online 24h (`/agendar`)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Confirmações via WhatsApp</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Ficha Técnica com Fotos Antes/Depois</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Caixa do Dia & DRE Financeiro</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-6 text-center space-y-2">
            <p className="text-[11px] text-slate-400">
              Precisa renovar ou alterar dados da fatura?
            </p>
            <Link
              href="/planos"
              data-cta="click_view_plans"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-colors block"
            >
              Ver Todos os Planos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
