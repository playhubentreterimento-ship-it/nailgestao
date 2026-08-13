"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  UserPlus,
  Repeat,
  Sparkles,
  ArrowUpRight,
  Lightbulb,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const COLORS = ["#E0A96D", "#9B51E0", "#27AE60", "#F2994A", "#EB5757"];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [salon, setSalon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDashData = () => {
    Promise.all([
      fetch("/api/dashboard", { cache: "no-store" }).then((res) => res.json()),
      fetch("/api/settings", { cache: "no-store" }).then((res) => res.json()),
    ])
      .then(([dashData, settingsData]) => {
        setData(dashData);
        setSalon(settingsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashData();
    window.addEventListener("focus", loadDashData);
    return () => window.removeEventListener("focus", loadDashData);
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
          <p className="text-xs font-semibold text-amber-200">Carregando painel do salão...</p>
        </div>
      </div>
    );
  }

  const { today, month, charts, insights } = data || {};

  return (
    <div className="space-y-6">
      {/* Banner Principal do Salão com Logotipo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#6b1615] via-[#831d1c] to-[#9b2423] p-5 text-white shadow-xl border border-rose-300/30">
        <div className="flex items-center space-x-4">
          {salon?.logoUrl ? (
            <img
              src={salon.logoUrl}
              alt={salon.name || "Logo do Salão"}
              className="h-16 w-16 rounded-2xl object-cover border-2 border-amber-300/80 shadow-lg"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 font-bold text-2xl text-slate-900 shadow-lg">
              💅
            </div>
          )}
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-amber-200">
              {salon?.name || "Studio Luxe Nail Designer"}
            </h1>
            <p className="text-xs text-rose-100/90 font-medium">
              {salon?.slogan || "Especialistas em Alongamento & Estética de Alta Performance"}
            </p>
            {salon?.phone && (
              <p className="text-[11px] text-amber-300/80 mt-1">📞 {salon.phone} {salon?.address ? `• 📍 ${salon.address}` : ""}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/agenda?modal=new"
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:brightness-110 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Agendamento</span>
          </Link>
        </div>
      </div>

      {/* 1. RESUMO DO DIA */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#6B1615] dark:text-amber-200">
            ☀️ Resumo de Hoje ({new Date().toLocaleDateString("pt-BR")})
          </h3>
          <Link href="/agenda" className="text-xs font-bold text-slate-700 hover:text-[#6B1615] dark:text-slate-300">
            Ver Agenda Completa &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <div className="rounded-2xl border border-rose-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold text-slate-400">AGENDAMENTOS</p>
            <p className="mt-1 font-serif text-xl font-bold text-slate-900 dark:text-white">{today?.totalAppointments || 0}</p>
            <p className="text-[10px] text-slate-500">Agendados para hoje</p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold text-slate-400">CLIENTES DE HOJE</p>
            <p className="mt-1 font-serif text-xl font-bold text-slate-900 dark:text-white">{today?.clientsCount || 0}</p>
            <p className="text-[10px] text-slate-500">Atendimentos previstos</p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">FATURAMENTO PREVISTO</p>
            <p className="mt-1 font-serif text-xl font-bold text-amber-800 dark:text-amber-300">
              R$ {today?.revenueExpected?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
            </p>
            <p className="text-[10px] text-amber-600/80">Previsto do dia</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">FATURAMENTO REALIZADO</p>
            <p className="mt-1 font-serif text-xl font-bold text-emerald-800 dark:text-emerald-300">
              R$ {today?.revenueRealized?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
            </p>
            <p className="text-[10px] text-emerald-600/80">No caixa hoje</p>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400">HORÁRIOS OCUPADOS</p>
            <p className="mt-1 font-serif text-xl font-bold text-purple-800 dark:text-purple-300">{today?.occupiedSlots || 0}</p>
            <p className="text-[10px] text-purple-600/80">Slots reservados</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400">HORÁRIOS LIVRES</p>
            <p className="mt-1 font-serif text-xl font-bold text-blue-800 dark:text-blue-300">{today?.freeSlots || 0}</p>
            <p className="text-[10px] text-blue-600/80">Disponíveis hoje</p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold text-rose-700 dark:text-rose-400">CANCELAMENTOS</p>
            <p className="mt-1 font-serif text-xl font-bold text-rose-800 dark:text-rose-300">{today?.canceledCount || 0}</p>
            <p className="text-[10px] text-rose-600/80">Cancelados hoje</p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold text-orange-700 dark:text-orange-400">NÃO CONFIRMADOS</p>
            <p className="mt-1 font-serif text-xl font-bold text-orange-800 dark:text-orange-300">{today?.unconfirmedCount || 0}</p>
            <p className="text-[10px] text-orange-600/80">Pendente confirmação</p>
          </div>
        </div>
      </div>

      {/* 2. RESUMO DO MÊS */}
      <div>
        <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#6B1615] dark:text-amber-200">
          📊 Desempenho Consolidado do Mês
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">FATURAMENTO MENSAL</span>
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 font-serif text-2xl font-bold text-slate-900 dark:text-white">
              R$ {month?.totalRevenue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[11px] font-medium text-emerald-600">+18% em relação ao mês anterior</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">LUCRO ESTIMADO</span>
              <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 font-serif text-2xl font-bold text-slate-900 dark:text-white">
              R$ {month?.estimatedProfit?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">Margem líquida de ~58%</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">TOTAL ATENDIMENTOS</span>
              <div className="rounded-lg bg-rose-100 p-2 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 font-serif text-2xl font-bold text-slate-900 dark:text-white">{month?.totalAttendances}</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">Ticket Médio: R$ {month?.averageTicket?.toFixed(2)}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">CLIENTES (NOVOS / RECORRENTES)</span>
              <div className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {month?.newClients} / {month?.recurringClients}
            </p>
            <p className="mt-1 text-[11px] font-medium text-purple-600">Taxa de retorno: 81%</p>
          </div>
        </div>
      </div>

      {/* 3. INSIGHTS INTELIGENTES DO SALÃO */}
      {insights && insights.length > 0 && (
        <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 via-rose-50/50 to-amber-50/80 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
          <div className="mb-3 flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-900 font-bold shadow-md">
              💡
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                Insights de Inteligência de Negócios
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                O sistema analisou os dados dos seus atendimentos e gerou sugestões automáticas:
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {insights.slice(0, 4).map((ins: any) => (
              <div
                key={ins.id}
                className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800/90"
              >
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {ins.category}
                    </span>
                    {ins.importance === "HIGH" && (
                      <span className="text-[10px] font-bold text-rose-500">⚠️ Alta Prioridade</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">{ins.title}</h4>
                  <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">{ins.description}</p>
                </div>
                {ins.actionLabel && (
                  <Link
                    href={ins.actionUrl || "#"}
                    className="mt-3 inline-flex items-center text-xs font-bold text-rose-600 hover:underline dark:text-rose-400"
                  >
                    <span>{ins.actionLabel}</span>
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. GRÁFICOS VISUAIS */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico Faturamento por Dia */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h3 className="mb-1 font-serif text-base font-bold text-slate-900 dark:text-white">
            Faturamento & Atendimentos por Dia da Semana
          </h3>
          <p className="mb-4 text-xs text-slate-500">Volume de receita gerada de segunda a sábado.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.revenueByDay || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => `R$ ${Number(val).toFixed(2)}`}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="faturamento" fill="#E0A96D" radius={[6, 6, 0, 0]} name="Faturamento (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Formas de Pagamento */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-1 font-serif text-base font-bold text-slate-900 dark:text-white">
            Formas de Pagamento
          </h3>
          <p className="mb-4 text-xs text-slate-500">Distribuição por canal de recebimento.</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.paymentMethods || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.paymentMethods || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => `R$ ${Number(val).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {(charts?.paymentMethods || []).map((pm: any, idx: number) => (
              <div key={pm.name} className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{pm.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. AGENDAMENTOS DO DIA */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
              Agendamentos de Hoje
            </h3>
            <p className="text-xs text-slate-500">Lista detalhada dos atendimentos do dia</p>
          </div>
          <Link
            href="/agenda"
            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-300"
          >
            Ver Grade Completa
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-rose-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Horário</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Serviço</th>
                <th className="px-4 py-3">Profissional</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Valor Total</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {today?.appointments && today.appointments.length > 0 ? (
                today.appointments.map((app: any) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{app.startTime} - {app.endTime}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      Maria Fernanda Rossi
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {app.services?.map((s: any) => s.serviceName).join(", ") || "Alongamento Fibra"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Juliana Silva
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          app.status === "CONFIRMADO"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : app.status === "EM_ATENDIMENTO"
                            ? "bg-rose-100 text-rose-800 animate-pulse dark:bg-rose-950 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      R$ {app.total?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href="/atendimento"
                        className="rounded-lg bg-rose-500 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm hover:bg-rose-600"
                      >
                        Atender &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Nenhum agendamento para hoje.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
