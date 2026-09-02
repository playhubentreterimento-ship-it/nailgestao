import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSalonInsights } from "@/lib/insights";

export async function GET() {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    let salon = await prisma.salon.findFirst().catch(() => null);

    const salonId = salon?.id || "default-salon";
    const salonObj = salon || {
      id: "default-salon",
      name: "Studio Selma Gloor",
      ownerName: "Selma Gloor",
      slogan: "Especialista em Unhas & Nails Art de Alta Performance",
    };

    // 1. Agendamentos de hoje
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { salonId: salonId },
          { salonId: "default-salon" },
        ],
        date: todayStr,
      },
      orderBy: [
        { startTime: "asc" },
      ],
      include: {
        services: true,
      },
    }).catch(() => []);

    const clientsToday = new Set(todayAppointments.filter((a) => a.status !== "CANCELADO").map((a) => a.clientId)).size;
    const revenueExpectedToday = todayAppointments
      .filter((a) => a.status !== "CANCELADO")
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
    const revenueRealizedToday = todayAppointments
      .filter((a) => a.status === "CONCLUIDO" || a.status === "EM_ATENDIMENTO")
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
    const occupiedSlotsToday = todayAppointments.filter((a) => a.status !== "CANCELADO").length;
    const canceledToday = todayAppointments.filter((a) => a.status === "CANCELADO").length;
    const unconfirmedToday = todayAppointments.filter((a) => a.status === "AGUARDANDO_CONFIRMACAO" || a.status === "AGENDADO").length;

    // 2. Resumo do Mês Real do Banco de Dados
    const allAppointments = await prisma.appointment.findMany({
      include: { services: true },
    }).catch(() => []);

    const completedApps = allAppointments.filter((a) => a.status === "CONCLUIDO" || a.status === "CONFIRMADO" || a.status === "EM_ATENDIMENTO");
    const monthRevenue = completedApps.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const totalAttendances = completedApps.length;
    const averageTicket = totalAttendances > 0 ? monthRevenue / totalAttendances : 0;

    const allClients = await prisma.client.findMany().catch(() => []);
    const newClients = allClients.filter((c) => c.tag === "NOVO").length;
    const recurringClients = allClients.filter((c) => c.tag === "VIP" || c.tag === "FREQUENTE" || c.tag === "RECORRENTE").length || Math.max(0, allClients.length - newClients);
    const noShowCount = allAppointments.filter((a) => a.status === "NAO_COMPARECEU").length;
    const cancellationCount = allAppointments.filter((a) => a.status === "CANCELADO").length;

    // 3. Gráficos de Formas de Pagamento Reais
    const cashTransactions = await prisma.cashTransaction.findMany().catch(() => []);

    const pixVal = cashTransactions.filter((t) => t.paymentMethod === "PIX").reduce((acc, t) => acc + (t.amount || 0), 0);
    const credVal = cashTransactions.filter((t) => t.paymentMethod === "CREDITO").reduce((acc, t) => acc + (t.amount || 0), 0);
    const debVal = cashTransactions.filter((t) => t.paymentMethod === "DEBITO").reduce((acc, t) => acc + (t.amount || 0), 0);
    const dinVal = cashTransactions.filter((t) => t.paymentMethod === "DINHEIRO").reduce((acc, t) => acc + (t.amount || 0), 0);

    const paymentMethodsData = [
      { name: "Pix", value: pixVal },
      { name: "Cartão Crédito", value: credVal },
      { name: "Cartão Débito", value: debVal },
      { name: "Dinheiro", value: dinVal },
    ];

    // 4. Faturamento por Dia Real da Semana
    const daysMap: Record<string, { faturamento: number; atendimentos: number }> = {
      "Segunda": { faturamento: 0, atendimentos: 0 },
      "Terça": { faturamento: 0, atendimentos: 0 },
      "Quarta": { faturamento: 0, atendimentos: 0 },
      "Quinta": { faturamento: 0, atendimentos: 0 },
      "Sexta": { faturamento: 0, atendimentos: 0 },
      "Sábado": { faturamento: 0, atendimentos: 0 },
      "Domingo": { faturamento: 0, atendimentos: 0 },
    };

    const daysNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    completedApps.forEach((app) => {
      if (!app.date) return;
      const appDate = new Date(app.date + "T12:00:00");
      const dayName = daysNames[appDate.getDay()];
      if (daysMap[dayName]) {
        daysMap[dayName].faturamento += app.total || 0;
        daysMap[dayName].atendimentos += 1;
      }
    });

    const revenueByDayData = Object.entries(daysMap).map(([day, val]) => ({
      day,
      faturamento: val.faturamento,
      atendimentos: val.atendimentos,
    }));

    // 5. Serviços Mais Lucrativos Reais do Banco de Dados
    const appointmentServices = await prisma.appointmentService.findMany({
      where: {
        appointment: {
          status: { in: ["CONCLUIDO", "CONFIRMADO", "EM_ATENDIMENTO"] },
        },
      },
    }).catch(() => []);

    const serviceMap = new Map<string, { service: string; vendas: number; receita: number }>();

    appointmentServices.forEach((as) => {
      const name = as.serviceName || "Serviço";
      const existing = serviceMap.get(name) || { service: name, vendas: 0, receita: 0 };
      existing.vendas += 1;
      existing.receita += as.price || 0;
      serviceMap.set(name, existing);
    });

    const topServicesData = Array.from(serviceMap.values())
      .sort((a, b) => b.receita - a.receita);

    let insights: any[] = [];
    try {
      insights = await generateSalonInsights();
    } catch (e) {}

    const clients = await prisma.client.findMany().catch(() => []);
    const professionals = await prisma.professional.findMany().catch(() => []);

    const populatedTodayAppointments = todayAppointments.map((app) => ({
      ...app,
      clientName: clients.find((c) => c.id === app.clientId)?.name || "Cliente",
      professionalName: professionals.find((p) => p.id === app.professionalId)?.name || "Profissional",
    }));

    return NextResponse.json({
      salon: salonObj,
      today: {
        totalAppointments: todayAppointments.length,
        clientsCount: clientsToday,
        revenueExpected: revenueExpectedToday,
        revenueRealized: revenueRealizedToday,
        occupiedSlots: occupiedSlotsToday,
        freeSlots: Math.max(0, 16 - occupiedSlotsToday),
        canceledCount: canceledToday,
        unconfirmedCount: unconfirmedToday,
        appointments: populatedTodayAppointments,
      },
      month: {
        totalRevenue: monthRevenue,
        estimatedProfit: monthRevenue * 0.58,
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
    return NextResponse.json({
      salon: {
        id: "default-salon",
        name: "Studio Selma Gloor",
        ownerName: "Selma Gloor",
        slogan: "Especialista em Unhas & Nails Art de Alta Performance",
      },
      today: {
        totalAppointments: 0,
        clientsCount: 0,
        revenueExpected: 0,
        revenueRealized: 0,
        occupiedSlots: 0,
        freeSlots: 16,
        canceledCount: 0,
        unconfirmedCount: 0,
        appointments: [],
      },
      month: {
        totalRevenue: 0,
        estimatedProfit: 0,
        totalAttendances: 0,
        averageTicket: 0,
        newClients: 0,
        recurringClients: 0,
        cancellationCount: 0,
        noShowCount: 0,
      },
      charts: {
        paymentMethods: [
          { name: "Pix", value: 0 },
          { name: "Cartão Crédito", value: 0 },
          { name: "Cartão Débito", value: 0 },
          { name: "Dinheiro", value: 0 },
        ],
        revenueByDay: [
          { day: "Segunda", faturamento: 0, atendimentos: 0 },
          { day: "Terça", faturamento: 0, atendimentos: 0 },
          { day: "Quarta", faturamento: 0, atendimentos: 0 },
          { day: "Quinta", faturamento: 0, atendimentos: 0 },
          { day: "Sexta", faturamento: 0, atendimentos: 0 },
          { day: "Sábado", faturamento: 0, atendimentos: 0 },
          { day: "Domingo", faturamento: 0, atendimentos: 0 },
        ],
        topServices: [],
      },
      insights: [],
    });
  }
}
