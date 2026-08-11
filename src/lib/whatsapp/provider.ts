import { prisma } from "../prisma";

export interface WhatsAppMessagePayload {
  to: string; // E.164 phone format e.g. 5511999998888
  templateName?: string;
  bodyText: string;
  buttons?: Array<{ id: string; title: string }>;
}

export interface WhatsAppProvider {
  sendMessage(payload: WhatsAppMessagePayload): Promise<{ success: boolean; messageId: string }>;
  sendAppointmentReminder(appointmentId: string, hoursBefore: number): Promise<boolean>;
  sendConfirmationRequest(appointmentId: string): Promise<boolean>;
  handleClientResponse(phone: string, textResponse: string): Promise<{ actionTaken: string; appointmentId?: string }>;
}

export class MockWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(payload: WhatsAppMessagePayload) {
    console.log(`[WhatsApp Mock Driver] Enviando para ${payload.to}: "${payload.bodyText}"`);
    
    // Registrar mensagem enviada no banco
    const msg = await prisma.whatsAppMessage.create({
      data: {
        salonId: "default-salon",
        phone: payload.to,
        messageText: payload.bodyText,
        status: "ENTREGUE",
        sentAt: new Date(),
      },
    });

    return { success: true, messageId: msg.id };
  }

  async sendAppointmentReminder(appointmentId: string, hoursBefore: number) {
    const app = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { services: true },
    });
    if (!app) return false;

    const client = await prisma.client.findUnique({ where: { id: app.clientId } });
    const prof = await prisma.professional.findUnique({ where: { id: app.professionalId } });
    const salon = await prisma.salon.findUnique({ where: { id: app.salonId } });

    if (!client || client.optOutWhatsApp) return false;

    const serviceNames = app.services.map((s) => s.serviceName).join(", ");
    const text = `Olá, ${client.name}! 💅\nPassando para lembrar do seu atendimento no ${salon?.name || "Studio Luxe"}.\n\n📅 Data: ${app.date}\n⏰ Horário: ${app.startTime}\n💅 Serviço: ${serviceNames}\n👩 Profissional: ${prof?.name || "Nail Designer"}\n\nResponda *CONFIRMAR* para garantir sua vaga ou *REAGENDAR* para alterar.`;

    await this.sendMessage({
      to: client.whatsapp,
      templateName: `LEMBRETE_${hoursBefore}H`,
      bodyText: text,
      buttons: [
        { id: "confirm", title: "CONFIRMAR" },
        { id: "reschedule", title: "REAGENDAR" },
      ],
    });

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { confirmationSentAt: new Date() },
    });

    return true;
  }

  async sendConfirmationRequest(appointmentId: string) {
    return this.sendAppointmentReminder(appointmentId, 24);
  }

  async handleClientResponse(phone: string, textResponse: string) {
    const cleanPhone = phone.replace(/\D/g, "");
    const normalizedText = textResponse.trim().toUpperCase();

    // Procurar agendamento pendente ou aguardando confirmação do cliente
    const client = await prisma.client.findFirst({
      where: { whatsapp: { contains: cleanPhone.slice(-8) } },
    });

    if (!client) {
      return { actionTaken: "CLIENT_NOT_FOUND" };
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const app = await prisma.appointment.findFirst({
      where: {
        clientId: client.id,
        date: { gte: todayStr },
        status: { in: ["AGENDADO", "AGUARDANDO_CONFIRMACAO"] },
      },
      orderBy: { date: "asc" },
    });

    if (!app) {
      return { actionTaken: "NO_PENDING_APPOINTMENT" };
    }

    if (normalizedText.includes("CONFIRM") || normalizedText === "1" || normalizedText.includes("SIM")) {
      await prisma.appointment.update({
        where: { id: app.id },
        data: {
          status: "CONFIRMADO",
          confirmedAt: new Date(),
        },
      });

      // Enviar resposta automática
      await this.sendMessage({
        to: client.whatsapp,
        bodyText: `Muito obrigada, ${client.name}! 💖 Seu agendamento das ${app.startTime} do dia ${app.date} foi CONFIRMADO com sucesso! Te esperamos no Studio Luxe.`,
      });

      // Log de Auditoria
      await prisma.auditLog.create({
        data: {
          salonId: app.salonId,
          action: "CONFIRMACAO_WHATSAPP",
          entity: "Appointment",
          entityId: app.id,
          details: `Cliente ${client.name} confirmou agendamento via WhatsApp.`,
        },
      });

      return { actionTaken: "CONFIRMED", appointmentId: app.id };
    }

    if (normalizedText.includes("REAGENDAR") || normalizedText === "2") {
      await prisma.appointment.update({
        where: { id: app.id },
        data: {
          notes: (app.notes || "") + " | Solicitou reagendamento via WhatsApp.",
        },
      });

      await this.sendMessage({
        to: client.whatsapp,
        bodyText: `Sem problemas, ${client.name}! 💅 Acesse nosso link de agendamento online para escolher seu novo horário: http://localhost:3000/agendar`,
      });

      return { actionTaken: "RESCHEDULE_REQUESTED", appointmentId: app.id };
    }

    return { actionTaken: "NONE" };
  }
}

export const whatsAppService = new MockWhatsAppProvider();
