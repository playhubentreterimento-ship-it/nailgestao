import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { whatsAppService } from "@/lib/whatsapp/provider";
import { sendWebPushToAll } from "@/app/api/push-subscribe/route";

function normalizeDateStr(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.includes("T")) return trimmed.split("T")[0];
  if (trimmed.includes("/")) {
    const parts = trimmed.split("/");
    if (parts.length === 3) {
      const d = parts[0].padStart(2, "0");
      const m = parts[1].padStart(2, "0");
      const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      return `${y}-${m}-${d}`;
    }
  }
  if (trimmed.includes("-")) {
    const parts = trimmed.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
      } else {
        const d = parts[0].padStart(2, "0");
        const m = parts[1].padStart(2, "0");
        const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        return `${y}-${m}-${d}`;
      }
    }
  }
  return trimmed;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawDate = searchParams.get("date");
    const monthParam = searchParams.get("month");
    const rawStartDate = searchParams.get("startDate");
    const rawEndDate = searchParams.get("endDate");
    const professionalId = searchParams.get("professionalId");
    const status = searchParams.get("status");

    const date = normalizeDateStr(rawDate);
    const startDate = normalizeDateStr(rawStartDate);
    const endDate = normalizeDateStr(rawEndDate);

    const salonObj = await prisma.salon.findFirst().catch(() => null);
    const activeSalonId = salonObj?.id || "67998370966";

    const whereClause: any = {
      OR: [
        { salonId: activeSalonId },
        { salonId: "default-salon" },
        { salonId: "67998370966" }
      ]
    };
    if (date && date !== "all") {
      whereClause.OR = [{ date: date }, { date: rawDate }];
    }
    if (monthParam) whereClause.date = { startsWith: monthParam };
    if (startDate && endDate) {
      whereClause.date = { gte: startDate, lte: endDate };
    }
    if (professionalId && professionalId !== "all") whereClause.professionalId = professionalId;
    if (status && status !== "all") whereClause.status = status;

    let appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        services: true,
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }).catch(() => []);

    const salonExists = await prisma.salon.findUnique({ where: { id: "default-salon" } }).catch(() => null);
    if (!salonExists) {
      const { seedDatabase } = await import("@/lib/seed-data");
      await seedDatabase().catch(() => null);
      appointments = await prisma.appointment.findMany({
        where: whereClause,
        include: {
          services: true,
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      }).catch(() => []);
    }

    const clients = await prisma.client.findMany();
    const professionals = await prisma.professional.findMany();

    const populated = appointments.map((app) => ({
      ...app,
      date: normalizeDateStr(app.date) || app.date, // Garantir formato YYYY-MM-DD
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

    // Ação Especial: Bloqueio de Almoço (11:00 às 13:00) ou Bloqueio Personalizado
    if (body.action === "BLOCK_LUNCH" || body.action === "BLOCK_SLOT") {
      const { date, professionalId, startTime = "11:00", endTime = "13:00", notes = "🍱 Pausa de Almoço" } = body;
      if (!date) return NextResponse.json({ error: "Data é obrigatória." }, { status: 400 });

      let targetProfId = professionalId;
      if (!targetProfId || targetProfId === "all") {
        const firstProf = await prisma.professional.findFirst({ where: { salonId: "default-salon" } });
        targetProfId = firstProf?.id || "prof-default";
      }

      // Buscar ou criar cliente especial de bloqueio
      let blockClient = await prisma.client.findFirst({
        where: { name: "🍱 Pausa de Almoço / Bloqueio" },
      });
      if (!blockClient) {
        blockClient = await prisma.client.create({
          data: {
            salonId: "default-salon",
            name: "🍱 Pausa de Almoço / Bloqueio",
            phone: "0000000000",
            whatsapp: "0000000000",
            tag: "SISTEMA",
          },
        });
      }

      const [sH, sM] = startTime.split(":").map(Number);
      const [eH, eM] = endTime.split(":").map(Number);
      const durationMins = (eH * 60 + eM) - (sH * 60 + sM);

      const blockApp = await prisma.appointment.create({
        data: {
          salonId: "default-salon",
          clientId: blockClient.id,
          professionalId: targetProfId,
          date,
          startTime,
          endTime,
          totalDurationMinutes: durationMins > 0 ? durationMins : 120,
          subtotal: 0,
          discount: 0,
          depositPaid: 0,
          remainingAmount: 0,
          total: 0,
          paymentStatus: "ISENTO",
          status: "BLOQUEADO",
          notes,
        },
      });

      return NextResponse.json(blockApp);
    }

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

    // Helper para converter HH:mm em minutos desde meia-noite
    const timeToMins = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    // Trava de Choque de Horários: Verificar agendamentos ativos que sobreponham o intervalo [startMinutes, endMinutesTotal)
    const existingApps = await prisma.appointment.findMany({
      where: {
        salonId: "default-salon",
        professionalId,
        date,
        status: { notIn: ["CANCELADO"] },
      },
    });

    const hasConflict = existingApps.some((app) => {
      const appStartMins = timeToMins(app.startTime);
      const appEndMins = app.endTime ? timeToMins(app.endTime) : appStartMins + (app.totalDurationMinutes || 60);
      return startMinutes < appEndMins && endMinutesTotal > appStartMins;
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: "🛑 Este horário (ou parte dele durante a duração do serviço) já está reservado para esta profissional. Por favor, escolha outro horário livre." },
        { status: 400 }
      );
    }

    const finalDate = normalizeDateStr(date) || date;

    const targetSalon = await prisma.salon.findFirst().catch(() => null);
    const activeSalonId = targetSalon?.id || "67998370966";

    // Criar agendamento no banco
    const appointment = await prisma.appointment.create({
      data: {
        salonId: activeSalonId,
        clientId,
        professionalId,
        date: finalDate,
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

    // Disparar notificação OS Web Push VAPID para os celulares cadastrados (Funciona 24h mesmo com celular bloqueado)
    try {
      const clientObj = await prisma.client.findUnique({ where: { id: clientId } });
      const profObj = await prisma.professional.findUnique({ where: { id: professionalId } });
      const dateFormatted = date ? date.split("-").reverse().join("/") : date;
      const srvName = services[0]?.name || "Procedimento";

      const pushTitle = "💅 NOVO AGENDAMENTO NO SALÃO!";
      const pushMessage = `${clientObj?.name || 'Cliente'} agendou ${srvName} com ${profObj?.name || 'Profissional'} para ${dateFormatted} às ${startTime}h`;

      await sendWebPushToAll(pushTitle, pushMessage, "/agenda");
    } catch (pushErr) {
      console.warn("Aviso ao disparar Web Push no servidor:", pushErr);
    }

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
    const {
      id,
      status,
      notes,
      date,
      startTime,
      professionalId,
      serviceIds,
      discount,
      depositPaid,
    } = body;

    if (!id) return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });

    const existingApp = await prisma.appointment.findUnique({
      where: { id },
      include: { services: true },
    });

    if (!existingApp) {
      return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
    }

    const updateData: any = {};

    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (date) updateData.date = date;
    if (startTime) updateData.startTime = startTime;
    if (professionalId) updateData.professionalId = professionalId;

    if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
      const services = await prisma.service.findMany({
        where: { id: { in: serviceIds } },
      });

      if (services.length > 0) {
        const totalDuration = services.reduce((acc, s) => acc + s.durationMinutes, 0);
        const subtotal = services.reduce((acc, s) => acc + (s.promoPrice || s.price), 0);
        const disc = discount !== undefined ? Number(discount) : existingApp.discount || 0;
        const dep = depositPaid !== undefined ? Number(depositPaid) : existingApp.depositPaid || 0;
        const total = Math.max(0, subtotal - disc);
        const remainingAmount = Math.max(0, total - dep);

        const currentStart = startTime || existingApp.startTime;
        const [hours, minutes] = currentStart.split(":").map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutesTotal = startMinutes + totalDuration;
        const endHours = Math.floor(endMinutesTotal / 60);
        const endMins = endMinutesTotal % 60;
        const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

        updateData.totalDurationMinutes = totalDuration;
        updateData.subtotal = subtotal;
        updateData.discount = disc;
        updateData.depositPaid = dep;
        updateData.total = total;
        updateData.remainingAmount = remainingAmount;
        updateData.endTime = endTime;

        await prisma.appointmentService.deleteMany({
          where: { appointmentId: id },
        });

        updateData.services = {
          create: services.map((s) => ({
            serviceId: s.id,
            serviceName: s.name,
            price: s.promoPrice || s.price,
            durationMinutes: s.durationMinutes,
          })),
        };
      }
    } else {
      if (discount !== undefined) updateData.discount = Number(discount);
      if (depositPaid !== undefined) updateData.depositPaid = Number(depositPaid);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: { services: true },
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
