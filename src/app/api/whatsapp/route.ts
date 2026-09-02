import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { whatsAppService } from "@/lib/whatsapp/provider";

export async function GET() {
  try {
    const templates = await prisma.whatsAppTemplate.findMany({
      where: { salonId: "default-salon" },
    });

    const messages = await prisma.whatsAppMessage.findMany({
      where: { salonId: "default-salon" },
      orderBy: { sentAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ templates, messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, phone, messageText, appointmentId, hoursBefore, replyText } = body;

    // Disparar mensagem avulsa / teste
    if (action === "SEND_DIRECT") {
      if (!phone || !messageText) {
        return NextResponse.json({ error: "Telefone e mensagem são obrigatórios." }, { status: 400 });
      }

      const res = await whatsAppService.sendMessage({
        to: phone,
        bodyText: messageText,
      });

      return NextResponse.json(res);
    }

    // Disparar lembrete de agendamento
    if (action === "SEND_REMINDER") {
      if (!appointmentId) return NextResponse.json({ error: "ID do agendamento é obrigatório." }, { status: 400 });

      const ok = await whatsAppService.sendAppointmentReminder(appointmentId, hoursBefore || 24);
      return NextResponse.json({ success: ok });
    }

    // Disparar lembretes para TODOS os agendamentos de amanhã (ou data selecionada)
    if (action === "SEND_TOMORROW_REMINDERS") {
      let targetDate = body.date;
      if (!targetDate) {
        // Calcular amanhã no fuso horário de Brasília / São Paulo
        const now = new Date();
        const brasilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        brasilTime.setDate(brasilTime.getDate() + 1);
        const y = brasilTime.getFullYear();
        const m = String(brasilTime.getMonth() + 1).padStart(2, "0");
        const d = String(brasilTime.getDate()).padStart(2, "0");
        targetDate = `${y}-${m}-${d}`;
      }

      // Buscar TODOS os agendamentos ativos nesta data
      const tomorrowApps = await prisma.appointment.findMany({
        where: {
          salonId: "default-salon",
          date: targetDate,
          status: { notIn: ["CANCELADO", "CONCLUIDO"] },
        },
      });

      const items: any[] = [];
      for (const app of tomorrowApps) {
        const res = await whatsAppService.sendAppointmentReminder(app.id, 24);
        if (res.success) {
          items.push(res);
        }
      }

      const formattedDate = targetDate.split("-").reverse().join("/");

      return NextResponse.json({
        success: true,
        count: items.length,
        total: tomorrowApps.length,
        date: formattedDate,
        targetDate: targetDate,
        items,
      });
    }

    // SIMULAÇÃO DE RESPOSTA DO CLIENTE VIA WEBHOOK
    if (action === "WEBHOOK_REPLY") {
      if (!phone || !replyText) {
        return NextResponse.json({ error: "Telefone e texto da resposta são obrigatórios." }, { status: 400 });
      }

      const result = await whatsAppService.handleClientResponse(phone, replyText);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
