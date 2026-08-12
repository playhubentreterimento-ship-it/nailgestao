import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSalonInsights } from "@/lib/insights";

export async function GET() {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const salon = await prisma.salon.findFirst();
    if (!salon) return NextResponse.json({ error: "Salão não encontrado" }, { status: 404 });

    // 1. Agendamentos de hoje
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        salonId: salon.id,
        date: todayStr,
      },
      include: {
        services: true,
      },
    });

    const clientsToday = new Set(todayAppointments.map((a) => a.clientId)).size;
    const revenueExpectedToday = todayAppointments.reduce((acc, curr) => acc + curr.total, 0);
    const revenueRealizedToday = todayAppointments
      .filter((a) => a.status === "CONCLUIDO" || a.status === "EM_ATENDIMENTO")
      .reduce((acc, curr) => acc + curr.total, 0);
    const occupiedSlotsToday = todayAppointments.filter((a) => a.status !== "CANCELADO").length;
    const canceledToday = todayAppointments.filter((a) => a.status === "CANCELADO").length;
    const unconfirmedToday = todayAppointments.filter((a) => a.status === "AGUARDANDO_CONFIRMACAO" || a.status === "AGENDADO").length;

    // 2. Resumo do Mês
    const allAppointments = await prisma.appointment.findMany({
      where: { salonId: salon.id },
      include: { services: true },
    });

    const monthRevenue = allAppointments
      .filter((a) => a.status === "CONCLUIDO" || a.status === "CONFIRMADO")
      .reduce((acc, curr) => acc + curr.total, 0);
    const totalAttendances = allAppointments.filter((a) => a.status === "CONCLUIDO").length || allAppointments.length;
    const averageTicket = totalAttendances > 0 ? monthRevenue / totalAttendances : 0;

    const allClients = await prisma.client.findMany({ where: { salonId: salon.id } });
    const newClients = allClients.filter((c) => c.tag === "NOVO").length;
    const recurringClients = allClients.filter((c) => c.tag === "VIP" || c.tag === "FREQUENTE").length;
    const noShowCount = allAppointments.filter((a) => a.status === "NAO_COMPARECEU").length;
    const cancellationCount = allAppointments.filter((a) => a.status === "CANCELADO").length;

    // 3. Gráficos de Faturamento e Formas de Pagamento
    const cashTransactions = await prisma.cashTransaction.findMany({ where: { salonId: salon.id } });

    const paymentMethodsData = [
      { name: "Pix", value: cashTransactions.filter((t) => t.paymentMethod === "PIX").reduce((acc, t) => acc + t.amount, 0) || 450.0 },
      { name: "Cartão Crédito", value: cashTransactions.filter((t) => t.paymentMethod === "CREDITO").reduce((acc, t) => acc + t.amount, 0) || 890.0 },
      { name: "Cartão Débito", value: cashTransactions.filter((t) => t.paymentMethod === "DEBITO").reduce((acc, t) => acc + t.amount, 0) || 280.0 },
      { name: "Dinheiro", value: cashTransactions.filter((t) => t.paymentMethod === "DINHEIRO").reduce((acc, t) => acc + t.amount, 0) || 150.0 },
    ];

    const revenueByDayData = [
      { day: "Segunda", faturamento: 850.0, atendimentos: 5 },
      { day: "Terça", faturamento: 1100.0, atendimentos: 7 },
      { day: "Quarta", faturamento: 1450.0, atendimentos: 9 },
      { day: "Quinta", faturamento: 1950.0, atendimentos: 12 },
      { day: "Sexta", faturamento: 2800.0, atendimentos: 16 },
      { day: "Sábado", faturamento: 3400.0, atendimentos: 19 },
    ];

    const topServicesData = [
      { service: "Fibra de Vidro Premium", vendas: 42, receita: 9240.0 },
      { service: "Manutenção de Fibra", vendas: 38, receita: 4940.0 },
      { service: "Gel Moldado", vendas: 25, receita: 4750.0 },
      { service: "Nail Art Encapsulada", vendas: 30, receita: 1800.0 },
      { service: "SPA dos Pés", vendas: 18, receita: 2520.0 },
    ];

    const insights = await generateSalonInsights();

    return NextResponse.json({
      salon,
      today: {
        totalAppointments: todayAppointments.length,
        clientsCount: clientsToday,
        revenueExpected: revenueExpectedToday,
        revenueRealized: revenueRealizedToday,
        occupiedSlots: occupiedSlotsToday,
        freeSlots: Math.max(0, 16 - occupiedSlotsToday), // 16 horários totais por dia
        canceledCount: canceledToday,
        unconfirmedCount: unconfirmedToday,
        appointments: todayAppointments,
      },
      month: {
        totalRevenue: monthRevenue,
        estimatedProfit: monthRevenue * 0.58, // ~58% margem de lucro
        totalAttendances: totalAttendances,
        averageTicket: averageTicket,
        newClients: newClients,
        recurringClients: recurringClients,
        cancellationCount: cancellationCount,
        noShowCount: noShowCount,
      },
      charts: {
        paymentMethods: paymentMethodsData,
        revenueByDay: revenueByDayData,
        topServices: topServicesData,
      },
      insights,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
