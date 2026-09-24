import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { whatsAppService } from "@/lib/whatsapp/provider";
import { sendWebPushToAll } from "@/app/api/push-subscribe/route";

const RECOVERY_SALON_ID = "67998370966";

function normalizeDateStr(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();

  if (trimmed.includes("T")) {
    return trimmed.split("T")[0];
  }

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
      }

      const d = parts[0].padStart(2, "0");
      const m = parts[1].padStart(2, "0");
      const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];

      return `${y}-${m}-${d}`;
    }
  }

  return trimmed;
}

function getSalonId(req: Request): string {
  try {
    const cookieHeader = req.headers.get("cookie") || "";

    const sessionCookie = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("nailgestao_session="));

    if (sessionCookie) {
      const encodedValue = sessionCookie.substring(
        "nailgestao_session=".length
      );

      try {
        const decodedValue = decodeURIComponent(encodedValue);
        const session = JSON.parse(decodedValue);

        if (session?.salonId) {
          return session.salonId;
        }
      } catch {
        try {
          const session = JSON.parse(encodedValue);

          if (session?.salonId) {
            return session.salonId;
          }
        } catch {
          // Continua usando o salão de recuperação.
        }
      }
    }
  } catch {
    // Continua usando o salão de recuperação.
  }

  return RECOVERY_SALON_ID;
}

export async function GET(req: Request) {
  try {
    const salonId = getSalonId(req);

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

    const whereClause: any = {
      salonId,
    };

    if (date && date !== "all") {
      whereClause.OR = [
        { date },
        { date: rawDate },
      ];
    }

    if (monthParam) {
      whereClause.date = {
        startsWith: monthParam,
      };
    }

    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (professionalId && professionalId !== "all") {
      whereClause.professionalId = professionalId;
    }

    if (status && status !== "all") {
      whereClause.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        services: true,
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
    });

    const clients = await prisma.client.findMany({
      where: {
        salonId,
      },
    });

    const professionals = await prisma.professional.findMany({
      where: {
        salonId,
      },
    });

    const populated = appointments.map((app) => {
      const client = clients.find((c) => c.id === app.clientId);
      const professional = professionals.find(
        (p) => p.id === app.professionalId
      );

      return {
        ...app,
        date: normalizeDateStr(app.date) || app.date,
        clientName: client?.name || "Cliente Desconhecido",
        clientPhone: client?.whatsapp || "",
        professionalName: professional?.name || "Profissional",
        professionalColor: professional?.color || "#E0A96D",
      };
    });

    return NextResponse.json(populated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const salonId = getSalonId(req);
    const body = await req.json();

    if (
      body.action === "BLOCK_LUNCH" ||
      body.action === "BLOCK_SLOT"
    ) {
      const {
        date,
        professionalId,
        startTime = "11:00",
        endTime = "13:00",
        notes = "🍱 Pausa de Almoço",
      } = body;

      if (!date) {
        return NextResponse.json(
          { error: "Data é obrigatória." },
          { status: 400 }
        );
      }

      let targetProfId = professionalId;

      if (!targetProfId || targetProfId === "all") {
        const firstProf = await prisma.professional.findFirst({
          where: {
            salonId,
          },
        });

        targetProfId = firstProf?.id || "prof-default";
      }

      let blockClient = await prisma.client.findFirst({
        where: {
          salonId,
          name: "🍱 Pausa de Almoço / Bloqueio",
        },
      });

      if (!blockClient) {
        blockClient = await prisma.client.create({
          data: {
            salonId,
            name: "🍱 Pausa de Almoço / Bloqueio",
            phone: "0000000000",
            whatsapp: "0000000000",
            tag: "SISTEMA",
          },
        });
      }

      const [sH, sM] = startTime.split(":").map(Number);
      const [eH, eM] = endTime.split(":").map(Number);

      const durationMins =
        eH * 60 +
        eM -
        (sH * 60 + sM);

      const blockApp = await prisma.appointment.create({
        data: {
          salonId,
          clientId: blockClient.id,
          professionalId: targetProfId,
          date,
          startTime,
          endTime,
          totalDurationMinutes:
            durationMins > 0 ? durationMins : 120,
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

    if (
      !clientId ||
      !professionalId ||
      !date ||
      !startTime ||
      !serviceIds ||
      serviceIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Dados incompletos para criação de agendamento.",
        },
        { status: 400 }
      );
    }

    let services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
        salonId,
      },
    });

    if (services.length === 0) {
      services = await prisma.service.findMany({
        where: {
          salonId,
        },
        take: serviceIds.length,
      });
    }

    if (services.length === 0) {
      return NextResponse.json(
        {
          error:
            "Nenhum serviço encontrado para este salão.",
        },
        { status: 400 }
      );
    }

    const totalDuration = services.reduce(
      (acc, service) =>
        acc + service.durationMinutes,
      0
    );

    const subtotal = services.reduce(
      (acc, service) =>
        acc +
        (service.promoPrice || service.price),
      0
    );

    const total = Math.max(
      0,
      subtotal - discount
    );

    const remainingAmount = Math.max(
      0,
      total - depositPaid
    );

    const [hours, minutes] = startTime
      .split(":")
      .map(Number);

    const startMinutes =
      hours * 60 + minutes;

    const endMinutesTotal =
      startMinutes + totalDuration;

    const endHours = Math.floor(
      endMinutesTotal / 60
    );

    const endMins =
      endMinutesTotal % 60;

    const endTime = `${String(
      endHours
    ).padStart(2, "0")}:${String(
      endMins
    ).padStart(2, "0")}`;

    const timeToMins = (time: string) => {
      const [h, m] = time
        .split(":")
        .map(Number);

      return h * 60 + m;
    };

    const existingApps =
      await prisma.appointment.findMany({
        where: {
          salonId,
          professionalId,
          date,
          status: {
            notIn: ["CANCELADO"],
          },
        },
      });

    const hasConflict = existingApps.some(
      (app) => {
        const appStartMins =
          timeToMins(app.startTime);

        const appEndMins = app.endTime
          ? timeToMins(app.endTime)
          : appStartMins +
            (app.totalDurationMinutes || 60);

        return (
          startMinutes < appEndMins &&
          endMinutesTotal > appStartMins
        );
      }
    );

    if (hasConflict) {
      return NextResponse.json(
        {
          error:
            "🛑 Este horário (ou parte dele durante a duração do serviço) já está reservado para esta profissional. Por favor, escolha outro horário livre.",
        },
        { status: 400 }
      );
    }

    const finalDate =
      normalizeDateStr(date) || date;

    const appointment =
      await prisma.appointment.create({
        data: {
          salonId,
          clientId,
          professionalId,
          date: finalDate,
          startTime,
          endTime,
          totalDurationMinutes:
            totalDuration,
          subtotal,
          discount,
          depositPaid,
          remainingAmount,
          total,
          paymentStatus:
            depositPaid > 0
              ? "SINAL_PAGO"
              : "PENDENTE",
          status:
            "AGUARDANDO_CONFIRMACAO",
          notes,
          services: {
            create: services.map(
              (service) => ({
                serviceId: service.id,
                serviceName: service.name,
                price:
                  service.promoPrice ||
                  service.price,
                durationMinutes:
                  service.durationMinutes,
              })
            ),
          },
        },
        include: {
          services: true,
        },
      });

    if (depositPaid > 0) {
      const openCash =
        await prisma.cashRegister.findFirst({
          where: {
            salonId,
            status: "ABERTO",
          },
        });

      if (openCash) {
        await prisma.cashTransaction.create({
          data: {
            cashRegisterId:
              openCash.id,
            salonId,
            appointmentId:
              appointment.id,
            type: "ENTRADA",
            category:
              "SINAL_AGENDAMENTO",
            amount: depositPaid,
            paymentMethod: "PIX",
            netAmount: depositPaid,
            description: `Sinal recebido para agendamento dia ${date} às ${startTime}`,
          },
        });
      }
    }

    await prisma.client.update({
      where: {
        id: clientId,
      },
      data: {
        attendanceCount: {
          increment: 1,
        },
        totalSpent: {
          increment: total,
        },
        lastVisit: new Date(),
      },
    });

    await whatsAppService.sendConfirmationRequest(
      appointment.id
    );

    try {
      const clientObj =
        await prisma.client.findUnique({
          where: {
            id: clientId,
          },
        });

      const profObj =
        await prisma.professional.findUnique({
          where: {
            id: professionalId,
          },
        });

      const dateFormatted = date
        ? date.split("-").reverse().join("/")
        : date;

      const srvName =
        services[0]?.name ||
        "Procedimento";

      const pushTitle =
        "💅 NOVO AGENDAMENTO NO SALÃO!";

      const pushMessage = `${
        clientObj?.name || "Cliente"
      } agendou ${srvName} com ${
        profObj?.name || "Profissional"
      } para ${dateFormatted} às ${startTime}h`;

      await sendWebPushToAll(
        pushTitle,
        pushMessage,
        "/agenda"
      );
    } catch (pushErr) {
      console.warn(
        "Aviso ao disparar Web Push no servidor:",
        pushErr
      );
    }

    await prisma.auditLog.create({
      data: {
        salonId,
        action: "CRIAR_AGENDAMENTO",
        entity: "Appointment",
        entityId: appointment.id,
        details: `Agendamento criado para dia ${date} às ${startTime} com valor R$ ${total}.`,
      },
    });

    return NextResponse.json(
      appointment
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
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

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório." },
        { status: 400 }
      );
    }

    const existingApp =
      await prisma.appointment.findUnique({
        where: {
          id,
        },
        include: {
          services: true,
        },
      });

    if (!existingApp) {
      return NextResponse.json(
        {
          error:
            "Agendamento não encontrado.",
        },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (status)
      updateData.status = status;

    if (notes !== undefined)
      updateData.notes = notes;

    if (date)
      updateData.date = date;

    if (startTime)
      updateData.startTime = startTime;

    if (professionalId)
      updateData.professionalId =
        professionalId;

    if (
      serviceIds &&
      Array.isArray(serviceIds) &&
      serviceIds.length > 0
    ) {
      const services =
        await prisma.service.findMany({
          where: {
            id: {
              in: serviceIds,
            },
            salonId:
              existingApp.salonId,
          },
        });

      if (services.length > 0) {
        const totalDuration =
          services.reduce(
            (acc, service) =>
              acc +
              service.durationMinutes,
            0
          );

        const subtotal =
          services.reduce(
            (acc, service) =>
              acc +
              (service.promoPrice ||
                service.price),
            0
          );

        const disc =
          discount !== undefined
            ? Number(discount)
            : existingApp.discount || 0;

        const dep =
          depositPaid !== undefined
            ? Number(depositPaid)
            : existingApp.depositPaid || 0;

        const total = Math.max(
          0,
          subtotal - disc
        );

        const remainingAmount =
          Math.max(0, total - dep);

        const currentStart =
          startTime ||
          existingApp.startTime;

        const [hours, minutes] =
          currentStart
            .split(":")
            .map(Number);

        const startMinutes =
          hours * 60 + minutes;

        const endMinutesTotal =
          startMinutes +
          totalDuration;

        const endHours = Math.floor(
          endMinutesTotal / 60
        );

        const endMins =
          endMinutesTotal % 60;

        const endTime = `${String(
          endHours
        ).padStart(2, "0")}:${String(
          endMins
        ).padStart(2, "0")}`;

        updateData.totalDurationMinutes =
          totalDuration;

        updateData.subtotal =
          subtotal;

        updateData.discount =
          disc;

        updateData.depositPaid =
          dep;

        updateData.total =
          total;

        updateData.remainingAmount =
          remainingAmount;

        updateData.endTime =
          endTime;

        await prisma.appointmentService.deleteMany(
          {
            where: {
              appointmentId: id,
            },
          }
        );

        updateData.services = {
          create: services.map(
            (service) => ({
              serviceId: service.id,
              serviceName:
                service.name,
              price:
                service.promoPrice ||
                service.price,
              durationMinutes:
                service.durationMinutes,
            })
          ),
        };
      }
    } else {
      if (discount !== undefined) {
        updateData.discount =
          Number(discount);
      }

      if (depositPaid !== undefined) {
        updateData.depositPaid =
          Number(depositPaid);
      }
    }

    const updated =
      await prisma.appointment.update({
        where: {
          id,
        },
        data: updateData,
        include: {
          services: true,
        },
      });

    return NextResponse.json(
      updated
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } =
      new URL(req.url);

    const id =
      searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório." },
        { status: 400 }
      );
    }

    await prisma.appointment.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
