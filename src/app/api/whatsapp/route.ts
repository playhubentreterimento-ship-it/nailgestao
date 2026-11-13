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

    const hasDepositTmpl = templates.some((t) => t.type === "LEMBRETE_SINAL_50_PIX");
    const allTemplates = hasDepositTmpl
      ? templates
      : [
          ...templates,
          {
            id: "tmpl-sinal-50-pix",
            name: "Lembrete de Sinal de 50% com Chave Pix",
            type: "LEMBRETE_SINAL_50_PIX",
            content: [
              "Olá, {cliente}! ✨💖",
              "Passando para lembrar do seu atendimento agendado no Selma Gloor Nails Studio.",
              "",
              "📅 *Data:* {data}",
              "⏰ *Horário:* {horario}",
              "💅 *Serviço:* {servicos}",
              "👩 *Profissional:* {profissional}",
              "💰 *Valor Total:* R$ {total}",
              "",
              "💳 *Sinal de 50% para confirmação:* *R$ {sinal}*",
              "",
              "Para garantir e confirmar sua vaga na agenda, solicitamos a transferência do sinal de 50% via Pix:",
              "",
              "🔑 *Chave Pix (Copia e Cola):*",
              "00020126330014BR.GOV.BCB.PIX0111055663959615204000053039865802BR5922SELMA FRANCYELLE GLOOR6009SAO PAULO62290525YzIzZWViMWItODAyNS00MTRkL6304ED4A",
              "",
              "📌 *Importante:* Após realizar o Pix, por favor envie o comprovante de pagamento por aqui para validarmos sua vaga com carinho! ✨ Muito obrigada!",
            ].join("\n"),
          },
        ];

    return NextResponse.json({ templates: allTemplates, messages });
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

    // Disparar lembrete de SINAL DE 50% com chave Pix para 1 agendamento
    if (action === "SEND_DEPOSIT_REMINDER") {
      if (!appointmentId) return NextResponse.json({ error: "ID do agendamento é obrigatório." }, { status: 400 });

      const res = await whatsAppService.sendDepositReminder(appointmentId, 50);
      return NextResponse.json(res);

    }

    // Disparar lembretes para TODOS os agendamentos de amanhã (24h antes)
    if (action === "SEND_TOMORROW_REMINDERS") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const day = String(tomorrow.getDate()).padStart(2, "0");
      const tomorrowStr = `${year}-${month}-${day}`;

      const tomorrowApps = await prisma.appointment.findMany({
        where: {
          salonId: "default-salon",
          date: tomorrowStr,
          status: { in: ["AGENDADO", "AGUARDANDO_CONFIRMACAO", "CONFIRMADO"] },
        },
      });

      const items: any[] = [];
      for (const app of tomorrowApps) {
        const res = await whatsAppService.sendAppointmentReminder(app.id, 24);
        if (res.success) {
          items.push({
            ...res,
            appointmentDate: app.date,
            appointmentTime: app.startTime,
          });
        }
      }

      return NextResponse.json({
        success: true,
        count: items.length,
        total: tomorrowApps.length,
        date: tomorrowStr,
        items,
      });
    }

    // Disparar lembretes para QUALQUER DATA ou MÚLTIPLAS DATAS selecionadas
    if (action === "SEND_DATE_REMINDERS" || action === "SEND_DEPOSIT_REMINDERS") {
      const isDepositReminder = action === "SEND_DEPOSIT_REMINDERS" || body.type === "DEPOSIT_50";
      const rawDates = Array.isArray(body.dates) ? body.dates : body.date ? [body.date] : [];
      if (rawDates.length === 0) {
        return NextResponse.json({ error: "Selecione ao menos uma data válida." }, { status: 400 });
      }

      const targetApps = await prisma.appointment.findMany({
        where: {
          salonId: "default-salon",
          date: { in: rawDates },
          status: { in: ["AGENDADO", "AGUARDANDO_CONFIRMACAO", "CONFIRMADO"] },
        },
      });

      const items: any[] = [];
      for (const app of targetApps) {
        const res = isDepositReminder
          ? await whatsAppService.sendDepositReminder(app.id, 50)
          : await whatsAppService.sendAppointmentReminder(app.id, 24);
        if (res.success) {
          items.push({
            ...res,
            appointmentDate: app.date,
            appointmentTime: app.startTime,
          });
        }
      }

      return NextResponse.json({
        success: true,
        count: items.length,
        total: targetApps.length,
        dates: rawDates,
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
