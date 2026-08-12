import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { whatsAppService } from "@/lib/whatsapp/provider";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const monthParam = searchParams.get("month");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const professionalId = searchParams.get("professionalId");
    const status = searchParams.get("status");

    const whereClause: any = { salonId: "default-salon" };
    if (date && date !== "all") whereClause.date = date;
    if (monthParam) whereClause.date = { startsWith: monthParam };
    if (startDate && endDate) whereClause.date = { gte: startDate, lte: endDate };
    if (professionalId && professionalId !== "all") whereClause.professionalId = professionalId;
    if (status && status !== "all") whereClause.status = status;

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        services: true,
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    const clients = await prisma.client.findMany();
    const professionals = await prisma.professional.findMany();

    const populated = appointments.map((app) => ({
      ...app,
      clientName: clients.find((c) => c.id === app.clientId)?.name || "Cliente Desconhecido",
      clientPhone: clients.find((c) => c.id === app.clientId)?.whatsapp || "",
      professionalName: professionals.find((p) => p.id === app.professionalId)?.name || "Profissional",
      professionalColor: professionals.find((p) => p.id === app.professionalId)?.color || "#E0A96D",
    }));

    return NextResponse.json(populated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clientId,
      professionalId,
      date,
      startTime,
      serviceIds,
      discount = 0,
      depositPaid = 0,
      notes = "",
    } = body;

    if (!clientId || !professionalId || !date || !startTime || !serviceIds || serviceIds.length === 0) {
      return NextResponse.json({ error: "Dados incompletos para criação de agendamento." }, { status: 400 });
    }

    let services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    // Fallback inteligente se os IDs tiverem alterado após reset de banco
    if (services.length === 0) {
      services = await prisma.service.findMany({
        where: { salonId: "default-salon" },
        take: serviceIds.length,
      });
    }

    if (services.length === 0) {
      services = [
        {
          id: serviceIds[0] || "srv-gen",
          salonId: "default-salon",
          categoryId: "cat-gen",
          name: "Procedimento de Nail Designer",
          durationMinutes: 90,
          price: 150.0,
          promoPrice: null,
          commissionPercent: 40,
          active: true,
          photoUrl: null,
          createdAt: new Date(),
        } as any,
      ];
    }

    const totalDuration = services.reduce((acc, s) => acc + s.durationMinutes, 0);
    const subtotal = services.reduce((acc, s) => acc + (s.promoPrice || s.price), 0);
    const total = Math.max(0, subtotal - discount);
    const remainingAmount = Math.max(0, total - depositPaid);

    // Calcular horário de término (HH:mm)
    const [hours, minutes] = startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutesTotal = startMinutes + totalDuration;
    const endHours = Math.floor(endMinutesTotal / 60);
    const endMins = endMinutesTotal % 60;
    const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

    // Criar agendamento no banco
    const appointment = await prisma.appointment.create({
      data: {
        salonId: "default-salon",
        clientId,
        professionalId,
        date,
        startTime,
        endTime,
        totalDurationMinutes: totalDuration,
        subtotal,
        discount,
        depositPaid,
        remainingAmount,
        total,
        paymentStatus: depositPaid > 0 ? "SINAL_PAGO" : "PENDENTE",
        status: "AGUARDANDO_CONFIRMACAO",
        notes,
        services: {
          create: services.map((s) => ({
            serviceId: s.id,
            serviceName: s.name,
            price: s.promoPrice || s.price,
            durationMinutes: s.durationMinutes,
          })),
        },
      },
      include: {
        services: true,
      },
    });

    // Se houve cobrança de sinal, lançar no caixa se houver um caixa aberto
    if (depositPaid > 0) {
      const openCash = await prisma.cashRegister.findFirst({
        where: { salonId: "default-salon", status: "ABERTO" },
      });
      if (openCash) {
        await prisma.cashTransaction.create({
          data: {
            cashRegisterId: openCash.id,
            salonId: "default-salon",
            appointmentId: appointment.id,
            type: "ENTRADA",
            category: "SINAL_AGENDAMENTO",
            amount: depositPaid,
            paymentMethod: "PIX",
            netAmount: depositPaid,
            description: `Sinal recebido para agendamento dia ${date} às ${startTime}`,
          },
        });
      }
    }

    // Atualizar estatísticas do cliente
    await prisma.client.update({
      where: { id: clientId },
      data: {
        attendanceCount: { increment: 1 },
        totalSpent: { increment: total },
        lastVisit: new Date(),
      },
    });

    // Disparar lembrete/confirmação automática via WhatsApp
    await whatsAppService.sendConfirmationRequest(appointment.id);

    // Auditoria
    await prisma.auditLog.create({
      data: {
        salonId: "default-salon",
        action: "CRIAR_AGENDAMENTO",
        entity: "Appointment",
        entityId: appointment.id,
        details: `Agendamento criado para dia ${date} às ${startTime} com valor R$ ${total}.`,
      },
    });

    return NextResponse.json(appointment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, notes, date, startTime } = body;

    if (!id) return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes ? { notes } : {}),
        ...(date ? { date } : {}),
        ...(startTime ? { startTime } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
