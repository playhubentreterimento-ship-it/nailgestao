import { prisma } from "../prisma";

export interface WhatsAppMessagePayload {
  to: string; // Formato E.164 e.g. 5567992684748
  templateName?: string;
  bodyText: string;
  buttons?: Array<{ id: string; title: string }>;
}

export function formatPhoneWithDDI(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  
  // Se já possui DDI 55 e tamanho de 12 ou 13 dígitos (ex: 5567992684748)
  if (digits.length >= 12 && digits.startsWith("55")) {
    return digits;
  }
  
  // Se possui 10 ou 11 dígitos (ex: 67992684748), insere DDI 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  
  return digits;
}

export interface WhatsAppProvider {
  sendMessage(payload: WhatsAppMessagePayload): Promise<{ success: boolean; messageId: string; whatsappUrl: string }>;
  sendAppointmentReminder(appointmentId: string, hoursBefore: number): Promise<{ success: boolean; whatsappUrl?: string; clientName?: string; phone?: string }>;
  sendConfirmationRequest(appointmentId: string): Promise<any>;
  handleClientResponse(phone: string, textResponse: string): Promise<{ actionTaken: string; appointmentId?: string }>;
}

export class HybridWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(payload: WhatsAppMessagePayload) {
    const formattedPhone = formatPhoneWithDDI(payload.to);
    console.log(`[WhatsApp Gateway Driver] Enviando para ${formattedPhone}: "${payload.bodyText}"`);

    // Gerar link direto wa.me para abertura manual rápida
    const encodedText = encodeURIComponent(payload.bodyText);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;

    // Tentar disparo via API externa configurada (Evolution API / Z-API / WhatsApp Cloud API)
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiKey = process.env.WHATSAPP_API_KEY;

    let apiSent = false;
    if (apiUrl && apiKey) {
      try {
        await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": apiKey,
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            number: formattedPhone,
            message: payload.bodyText,
          }),
        });
        apiSent = true;
      } catch (err) {
        console.error("Erro ao enviar mensagem via Gateway WhatsApp:", err);
      }
    }

    // Registrar mensagem enviada no banco
    const msg = await prisma.whatsAppMessage.create({
      data: {
        salonId: "default-salon",
        phone: formattedPhone,
        messageText: payload.bodyText,
        status: apiSent ? "ENVIADO_API" : "ENTREGUE",
        sentAt: new Date(),
      },
    });

    return { success: true, messageId: msg.id, whatsappUrl };
  }

  async sendAppointmentReminder(appointmentId: string, hoursBefore: number) {
    const app = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { services: true },
    });
    if (!app) return { success: false };

    const client = await prisma.client.findUnique({ where: { id: app.clientId } });
    const prof = await prisma.professional.findUnique({ where: { id: app.professionalId } });
    const salon = await prisma.salon.findUnique({ where: { id: app.salonId } });

    if (!client || client.optOutWhatsApp) return { success: false };

    const formattedPhone = formatPhoneWithDDI(client.whatsapp || client.phone);
    const serviceNames = app.services.map((s) => s.serviceName).join(", ");
    
    // Converter formato de data AAAA-MM-DD para DD/MM/AAAA
    let formattedDate = app.date;
    if (app.date && app.date.includes("-")) {
      const parts = app.date.split("-");
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    const text = `Olá, ${client.name}! ✨\nPassando para lembrar do seu atendimento no ${salon?.name || "Studio Luxe"}.\n\n📅 Data: ${formattedDate}\n⏰ Horário: ${app.startTime}\n💅 Serviço: ${serviceNames}\n👩‍🎨 Profissional: ${prof?.name || "Nail Designer"}\n\nResponda *CONFIRMAR* para garantir sua vaga ou *REAGENDAR* para alterar.`;

    const sendRes = await this.sendMessage({
      to: formattedPhone,
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

    return {
      success: true,
      whatsappUrl: sendRes.whatsappUrl,
      clientName: client.name,
      phone: formattedPhone,
    };
  }

  async sendConfirmationRequest(appointmentId: string) {
    return this.sendAppointmentReminder(appointmentId, 24);
  }

  async handleClientResponse(phone: string, textResponse: string) {
    const formattedPhone = formatPhoneWithDDI(phone);
    const normalizedText = textResponse.trim().toUpperCase();

    // Procurar agendamento pendente ou aguardando confirmação do cliente
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { whatsapp: { contains: formattedPhone.slice(-8) } },
          { phone: { contains: formattedPhone.slice(-8) } },
        ],
      },
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

      let formattedDate = app.date;
      if (app.date && app.date.includes("-")) {
        const parts = app.date.split("-");
        if (parts.length === 3) {
          formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }

      // Enviar resposta automática
      await this.sendMessage({
        to: client.whatsapp || client.phone,
        bodyText: `Muito obrigada, ${client.name}! 💖 Seu agendamento das ${app.startTime} do dia ${formattedDate} foi CONFIRMADO com sucesso! Te esperamos no salão.`,
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
        to: client.whatsapp || client.phone,
        bodyText: `Sem problemas, ${client.name}! 💅 Acesse nosso link de agendamento online para escolher seu novo horário.`,
      });

      return { actionTaken: "RESCHEDULE_REQUESTED", appointmentId: app.id };
    }

    return { actionTaken: "NONE" };
  }
}

export const whatsAppService = new HybridWhatsAppProvider();
