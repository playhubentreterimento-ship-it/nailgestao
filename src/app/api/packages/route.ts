import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let packages = await prisma.package.findMany({
      where: { salonId: "default-salon", active: true },
      orderBy: { name: "asc" },
    });

    // Se não houver pacotes cadastrados, criar os pacotes iniciais do salão com detalhamento de serviços
    if (packages.length === 0) {
      await prisma.package.createMany({
        data: [
          {
            salonId: "default-salon",
            name: "Combo Club 3 Manutenções em Fibra",
            price: 330.0,
            originalPrice: 390.0,
            discountType: "VALUE",
            discountValue: 60.0,
            totalSessions: 3,
            validityDays: 90,
            description: "Sessão quinzenal com valor promocional e prioridade de horário.",
            servicesJson: JSON.stringify([
              { sessionNumber: 1, serviceName: "Manutenção Fibra de Vidro", price: 130 },
              { sessionNumber: 2, serviceName: "Manutenção Fibra de Vidro", price: 130 },
              { sessionNumber: 3, serviceName: "Manutenção Fibra de Vidro", price: 130 },
            ]),
          },
          {
            salonId: "default-salon",
            name: "Plano Trimestral Banho de Gel",
            price: 270.0,
            originalPrice: 300.0,
            discountType: "PERCENT",
            discountValue: 10.0,
            totalSessions: 3,
            validityDays: 90,
            description: "Blindagem e nivelamento contínuo com cutilagem russa inclusa.",
            servicesJson: JSON.stringify([
              { sessionNumber: 1, serviceName: "Aplicação Banho de Gel", price: 100 },
              { sessionNumber: 2, serviceName: "Manutenção Banho de Gel", price: 100 },
              { sessionNumber: 3, serviceName: "Manutenção Banho de Gel", price: 100 },
            ]),
          },
          {
            salonId: "default-salon",
            name: "Pacote 4 Sessões Manicure & Pedicure",
            price: 180.0,
            originalPrice: 200.0,
            discountType: "VALUE",
            discountValue: 20.0,
            totalSessions: 4,
            validityDays: 60,
            description: "Manutenção completa de mãos e pés para o mês.",
            servicesJson: JSON.stringify([
              { sessionNumber: 1, serviceName: "Pé e Mão Completo", price: 50 },
              { sessionNumber: 2, serviceName: "Mão Tradicional", price: 50 },
              { sessionNumber: 3, serviceName: "Pé e Mão Completo", price: 50 },
              { sessionNumber: 4, serviceName: "Mão Tradicional", price: 50 },
            ]),
          },
        ],
      });

      packages = await prisma.package.findMany({
        where: { salonId: "default-salon", active: true },
        orderBy: { name: "asc" },
      });
    }

    const clientPackages = await prisma.clientPackage.findMany({
      where: { active: true },
      orderBy: { purchaseDate: "desc" },
    });

    const clients = await prisma.client.findMany({
      where: { salonId: "default-salon" },
      select: { id: true, name: true, phone: true, whatsapp: true, tag: true },
      orderBy: { name: "asc" },
    });

    const services = await prisma.service.findMany({
      where: { salonId: "default-salon", active: true },
      select: { id: true, name: true, price: true, promoPrice: true, durationMinutes: true },
      orderBy: { name: "asc" },
    });

    const professionals = await prisma.professional.findMany({
      where: { salonId: "default-salon", active: true },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ packages, clientPackages, clients, services, professionals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. VÍNCULO DE PACOTE COM CLIENTE & AGENDAMENTO DAS SESSÕES
    if (body.action === "ASSIGN_TO_CLIENT") {
      const {
        clientId,
        packageId,
        firstSessionDate,
        firstSessionTime = "10:00",
        firstSessionProfId,
        sessionsSchedule = [] // Array de { sessionNumber, date, time, profId }
      } = body;

      if (!clientId || !packageId) {
        return NextResponse.json({ error: "Cliente e Pacote são obrigatórios." }, { status: 400 });
      }

      const targetPackage = await prisma.package.findUnique({ where: { id: packageId } });
      if (!targetPackage) {
        return NextResponse.json({ error: "Pacote não encontrado." }, { status: 404 });
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (targetPackage.validityDays || 90));

      // 1. Criar ClientPackage
      const clientPackage = await prisma.clientPackage.create({
        data: {
          clientId,
          packageId,
          packageName: targetPackage.name,
          price: targetPackage.price,
          totalSessions: targetPackage.totalSessions,
          sessionsUsed: 0,
          servicesJson: targetPackage.servicesJson,
          purchaseDate: new Date(),
          expiryDate,
          active: true,
        },
      });

      // 2. Atualizar Tag da Cliente para "PACOTES" automaticamente
      await prisma.client.update({
        where: { id: clientId },
        data: { tag: "PACOTES" },
      });

      // Parse dos serviços do pacote por sessão
      let servicesList: any[] = [];
      try {
        if (targetPackage.servicesJson) {
          servicesList = JSON.parse(targetPackage.servicesJson);
        }
      } catch (e) {}

      // Determinar profissional padrão caso não informado
      let profId = firstSessionProfId;
      if (!profId) {
        const firstProf = await prisma.professional.findFirst({ where: { salonId: "default-salon" } });
        profId = firstProf?.id || "prof-default";
      }

      // 3. Se foi informada data para a 1ª sessão, criar agendamento futuro para a 1ª sessão
      let createdApps: any[] = [];
      if (firstSessionDate) {
        const srv1 = servicesList.find((s: any) => s.sessionNumber === 1) || servicesList[0];
        const srvName1 = srv1?.serviceName || "Sessão de Pacote";
        const pkgPrice = targetPackage.price;

        const firstApp = await prisma.appointment.create({
          data: {
            salonId: "default-salon",
            clientId,
            professionalId: profId,
            date: firstSessionDate,
            startTime: firstSessionTime,
            endTime: "11:00",
            totalDurationMinutes: 60,
            subtotal: pkgPrice,
            discount: 0,
            depositPaid: 0,
            remainingAmount: pkgPrice,
            total: pkgPrice, // 100% do valor do pacote na 1ª sessão
            paymentStatus: "PENDENTE",
            status: "AGENDADO",
            notes: `📦 Pacote ${targetPackage.name} (Sessão 1/${targetPackage.totalSessions}: ${srvName1} - Valor Integral)`,
            services: {
              create: [
                {
                  serviceId: srv1?.serviceId || "srv-combo",
                  serviceName: `📦 ${targetPackage.name} - 1ª Sessão: ${srvName1}`,
                  price: pkgPrice,
                  durationMinutes: 60,
                },
              ],
            },
          },
        });

        // Guardar o ID da 1ª sessão no ClientPackage
        await prisma.clientPackage.update({
          where: { id: clientPackage.id },
          data: { firstSessionAppointmentId: firstApp.id },
        });

        createdApps.push(firstApp);

        // 4. Criar as demais sessões agendadas com valor R$ 0,00 (se fornecidas no agendamento antecipado)
        if (Array.isArray(sessionsSchedule) && sessionsSchedule.length > 0) {
          for (const item of sessionsSchedule) {
            if (item.sessionNumber > 1 && item.date) {
              const srvN = servicesList.find((s: any) => s.sessionNumber === item.sessionNumber) || {};
              const srvNameN = srvN.serviceName || `Sessão ${item.sessionNumber}`;
              const itemProfId = item.profId || profId;

              const appN = await prisma.appointment.create({
                data: {
                  salonId: "default-salon",
                  clientId,
                  professionalId: itemProfId,
                  date: item.date,
                  startTime: item.time || "10:00",
                  endTime: "11:00",
                  totalDurationMinutes: 60,
                  subtotal: 0,
                  discount: 0,
                  depositPaid: 0,
                  remainingAmount: 0,
                  total: 0, // Sessões 2..N são R$ 0.00
                  paymentStatus: "PACOTE",
                  status: "AGENDADO",
                  notes: `📦 Pacote ${targetPackage.name} (Sessão ${item.sessionNumber}/${targetPackage.totalSessions}: ${srvNameN} - R$ 0.00 | Combo Pago)`,
                  services: {
                    create: [
                      {
                        serviceId: srvN.serviceId || "srv-combo",
                        serviceName: `📦 ${targetPackage.name} - Sessão ${item.sessionNumber}: ${srvNameN}`,
                        price: 0,
                        durationMinutes: 60,
                      },
                    ],
                  },
                },
              });

              createdApps.push(appN);
            }
          }
        }
      }

      return NextResponse.json({ clientPackage, appointments: createdApps });
    }

    // 2. ABATER 1 SESSÃO DO PACOTE DO CLIENTE
    if (body.action === "USE_SESSION") {
      const { clientPackageId } = body;
      if (!clientPackageId) {
        return NextResponse.json({ error: "ID do Pacote da Cliente é obrigatório." }, { status: 400 });
      }

      const clientPkg = await prisma.clientPackage.findUnique({ where: { id: clientPackageId } });
      if (!clientPkg) {
        return NextResponse.json({ error: "Pacote da cliente não encontrado." }, { status: 404 });
      }

      const newSessionsUsed = clientPkg.sessionsUsed + 1;
      const updated = await prisma.clientPackage.update({
        where: { id: clientPackageId },
        data: {
          sessionsUsed: newSessionsUsed,
          active: newSessionsUsed < clientPkg.totalSessions,
        },
      });

      return NextResponse.json(updated);
    }

    // 3. CRIAR NOVO PACOTE
    const {
      name,
      price,
      originalPrice,
      discountType = "VALUE",
      discountValue = 0,
      totalSessions = 4,
      validityDays = 90,
      description,
      servicesJson,
    } = body;

    if (!name || price === undefined || !totalSessions) {
      return NextResponse.json({ error: "Nome, preço e total de sessões são obrigatórios." }, { status: 400 });
    }

    const newPackage = await prisma.package.create({
      data: {
        salonId: "default-salon",
        name,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : Number(price),
        discountType,
        discountValue: Number(discountValue || 0),
        totalSessions: Math.min(6, Math.max(1, Number(totalSessions))),
        validityDays: Number(validityDays || 90),
        description: description || null,
        servicesJson: servicesJson ? (typeof servicesJson === "string" ? servicesJson : JSON.stringify(servicesJson)) : null,
        active: true,
      },
    });

    return NextResponse.json(newPackage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      price,
      originalPrice,
      discountType,
      discountValue,
      totalSessions,
      validityDays,
      description,
      servicesJson,
    } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "ID e nome do pacote são obrigatórios." }, { status: 400 });
    }

    const updated = await prisma.package.update({
      where: { id },
      data: {
        name,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : Number(price),
        discountType: discountType || "VALUE",
        discountValue: Number(discountValue || 0),
        totalSessions: Math.min(6, Math.max(1, Number(totalSessions))),
        validityDays: Number(validityDays || 90),
        description: description || null,
        servicesJson: servicesJson ? (typeof servicesJson === "string" ? servicesJson : JSON.stringify(servicesJson)) : null,
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

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório para exclusão." }, { status: 400 });
    }

    await prisma.package.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Pacote excluído." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
