import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { whatsAppService } from "@/lib/whatsapp/provider";
import { sendWebPushToAll } from "@/app/api/push-subscribe/route";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const monthParam = searchParams.get("month");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const professionalId = searchParams.get("professionalId");
    const status = searchParams.get("status");

    const search = searchParams.get("search") || searchParams.get("q");

    const whereClause: any = { salonId: "default-salon" };
    
    // Se NAO houver busca por texto, aplicamos as restrições de data
    if (!search || search.trim() === "") {
      if (date && date !== "all") whereClause.date = date;
      if (monthParam) whereClause.date = { startsWith: monthParam };
      if (startDate && endDate) whereClause.date = { gte: startDate, lte: endDate };
    }

    if (professionalId && professionalId !== "all") whereClause.professionalId = professionalId;
    if (status && status !== "all") whereClause.status = status;

    if (search && search.trim() !== "") {
      const q = search.trim().toLowerCase();
      const matchingClients = await prisma.client.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { whatsapp: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });
      const clientIds = matchingClients.map((c) => c.id);

      // Buscar agendamentos do cliente ou notas
      whereClause.OR = [
        { clientId: { in: clientIds } },
        { notes: { contains: q, mode: "insensitive" } },
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        services: true,
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    const clients = await prisma.client.findMany();
    const professionals = await prisma.professional.findMany();
    const allServices = await prisma.service.findMany();

    const populated = appointments.map((app) => {
      const clientObj = clients.find((c) => c.id === app.clientId);
      const profObj = professionals.find((p) => p.id === app.professionalId);
      return {
        ...app,
        clientName: clientObj?.name || "Cliente Desconhecido",
        clientPhone: clientObj?.whatsapp || clientObj?.phone || "",
        professionalName: profObj?.name || "Profissional",
        professionalColor: profObj?.color || "#E0A96D",
        serviceNames: app.services.map((s) => {
          const srvObj = allServices.find((srv) => srv.id === s.serviceId);
          return srvObj?.name || s.serviceName || "Procedimento";
        }),
      };
    });

    return NextResponse.json(populated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Ação Especial: Bloqueio ou Liberação de Almoço (11:30 às 13:00)
    if (
      body.action === "BLOCK_LUNCH" ||
      body.action === "BLOCK_SLOT" ||
      body.action === "UNLOCK_LUNCH" ||
      body.status === "ALMOCO_LIBERADO" ||
      body.notes === "LIBERADO_ALMOCO"
    ) {
      const {
        date,
        professionalId,
        startTime = "11:30",
        endTime = "13:00",
        notes = body.action === "UNLOCK_LUNCH" || body.notes === "LIBERADO_ALMOCO" || body.status === "ALMOCO_LIBERADO"
          ? "LIBERADO_ALMOCO"
          : "🍱 Pausa de Almoço",
      } = body;

      if (!date) return NextResponse.json({ error: "Data é obrigatória." }, { status: 400 });

      let targetProfId = professionalId;
      if (!targetProfId || targetProfId === "all" || targetProfId === "system-lunch" || targetProfId === "prof-default") {
        const firstProf = await prisma.professional.findFirst({ where: { salonId: "default-salon" } });
        targetProfId = firstProf?.id || "prof-default";
      }

      // Buscar ou criar cliente especial de sistema para bloqueio/liberação
      let systemClient = await prisma.client.findFirst({
        where: { name: "🍱 Pausa / Liberação de Almoço" },
      });
      if (!systemClient) {
        systemClient = await prisma.client.create({
          data: {
            salonId: "default-salon",
            name: "🍱 Pausa / Liberação de Almoço",
            phone: "0000000000",
            whatsapp: "0000000000",
            tag: "SISTEMA",
          },
        });
      }

      const [sH, sM] = startTime.split(":").map(Number);
      const [eH, eM] = endTime.split(":").map(Number);
      const durationMins = (eH * 60 + eM) - (sH * 60 + sM);

      const isUnlock =
        body.action === "UNLOCK_LUNCH" || body.notes === "LIBERADO_ALMOCO" || body.status === "ALMOCO_LIBERADO";

      const blockOrUnlockApp = await prisma.appointment.create({
        data: {
          salonId: "default-salon",
          clientId: systemClient.id,
          professionalId: targetProfId,
          date,
          startTime,
          endTime,
          totalDurationMinutes: durationMins > 0 ? durationMins : 90,
          subtotal: 0,
          discount: 0,
          depositPaid: 0,
          remainingAmount: 0,
          total: 0,
          paymentStatus: "ISENTO",
          status: isUnlock ? "ALMOCO_LIBERADO" : "BLOQUEADO",
          notes,
        },
      });

      return NextResponse.json(blockOrUnlockApp);
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

    const isPackageSession = Boolean(body.clientPackageId);
    const totalDuration = services.reduce((acc, s) => acc + s.durationMinutes, 0);
    const subtotal = isPackageSession ? 0 : services.reduce((acc, s) => acc + (s.promoPrice || s.price), 0);
    const total = isPackageSession ? 0 : Math.max(0, subtotal - discount);
    const remainingAmount = isPackageSession ? 0 : Math.max(0, total - depositPaid);

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
        discount: isPackageSession ? 0 : discount,
        depositPaid: isPackageSession ? 0 : depositPaid,
        remainingAmount,
        total,
        paymentStatus: isPackageSession ? "PACOTE" : (depositPaid > 0 ? "SINAL_PAGO" : "PENDENTE"),
        status: "AGUARDANDO_CONFIRMACAO",
        notes: isPackageSession ? `📦 Sessão de Pacote (Pago no Combo) | ${notes || ""}` : notes,
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

    // Se o agendamento for vinculado a um pacote da cliente, abater 1 sessão automaticamente
    if (body.clientPackageId) {
      try {
        const clientPkg = await prisma.clientPackage.findUnique({ where: { id: body.clientPackageId } });
        if (clientPkg && clientPkg.active) {
          const nextUsed = clientPkg.sessionsUsed + 1;
          await prisma.clientPackage.update({
            where: { id: body.clientPackageId },
            data: {
              sessionsUsed: nextUsed,
              active: nextUsed < clientPkg.totalSessions,
            },
          });
        }
      } catch (errPkg) {
        console.error("Erro ao abater sessão do pacote no agendamento:", errPkg);
      }
    }

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
    if (body.cancelReason !== undefined) updateData.cancelReason = body.cancelReason;
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
    const hard = searchParams.get("hard");
    const reason = searchParams.get("reason") || "Cliente desmarcou horário";

    if (!id) return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });

    if (hard === "true") {
      await prisma.appointment.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: "Agendamento excluído permanentemente." });
    }

    // Por padrão, marcar como CANCELADO liberando o horário e mantendo o histórico de cancelamento no cadastro da cliente
    await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELADO",
        cancelReason: reason,
      },
    });

    return NextResponse.json({ success: true, message: "Horário liberado na agenda e cancelamento contabilizado no cadastro da cliente!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
