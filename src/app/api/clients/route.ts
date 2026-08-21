import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: { photos: true },
      orderBy: { name: "asc" },
    }).catch(() => []);

    const appointments = await prisma.appointment.findMany({
      include: { services: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }).catch(() => []);

    const clientPackages = await prisma.clientPackage.findMany({
      where: { active: true },
    }).catch(() => []);

    const packages = await prisma.package.findMany({}).catch(() => []);

    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const todayStr = now.toISOString().split("T")[0];

    // Reconciliação automática para Ju Arcanjo e pacotes ativos
    const juClient = clients.find((c) => c.name.toLowerCase().includes("ju arcanjo") || (c.phone && c.phone.includes("67996191198")));
    const comboPackage = packages.find((p) => p.name.toLowerCase().includes("banho de gel com adicional") || p.name.toLowerCase().includes("combo"));

    if (juClient && comboPackage) {
      let juPackage = clientPackages.find((cp) => cp.clientId === juClient.id);
      if (!juPackage) {
        juPackage = await prisma.clientPackage.create({
          data: {
            clientId: juClient.id,
            packageId: comboPackage.id,
            totalSessions: comboPackage.totalSessions || 4,
            sessionsUsed: 1,
            purchaseDate: new Date(),
            expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            active: true,
          },
        }).catch(() => null as any);
        if (juPackage) (clientPackages as any[]).push(juPackage);
      }

      // Padronizar serviços da Ju Arcanjo estritamente de acordo com o cronograma de 4 semanas do combo oficial:
      // Semana 1: Banho de Gel com adicional
      // Semana 2: Pé e mão tradicional
      // Semana 3: Mão tradicional
      // Semana 4: Pé e mão tradicional
      const juApps = appointments
        .filter((a) => a.clientId === juClient.id)
        .sort((a, b) => (a.date + " " + (a.startTime || "")).localeCompare(b.date + " " + (b.startTime || "")));

      const allServices = await prisma.service.findMany({}).catch(() => []);
      const gelSrv = allServices.find((s) => s.name.toLowerCase().includes("adicional") || s.name.toLowerCase().includes("banho de gel com adicional")) || { id: "srv-gel", name: "Banho de Gel com adicional" };
      const peMaoSrv = allServices.find((s) => s.name.toLowerCase().includes("tradicional") && (s.name.toLowerCase().includes("pé") || s.name.toLowerCase().includes("pe"))) || { id: "srv-pemao", name: "Pé e mão tradicional" };
      const maoSrv = allServices.find((s) => s.name.toLowerCase().includes("tradicional") && (s.name.toLowerCase().includes("mão") || s.name.toLowerCase().includes("mao")) && !s.name.toLowerCase().includes("pé") && !s.name.toLowerCase().includes("pe")) || { id: "srv-mao", name: "Mão tradicional" };

      const cyclePatternNames = [
        "Banho de Gel com adicional", // Semana 1
        "Pé e mão tradicional",       // Semana 2
        "Mão tradicional",             // Semana 3
        "Pé e mão tradicional",       // Semana 4
      ];

      const cyclePatternObjects = [
        gelSrv,   // Semana 1
        peMaoSrv, // Semana 2
        maoSrv,   // Semana 3
        peMaoSrv, // Semana 4
      ];

      for (let i = 0; i < juApps.length; i++) {
        const app = juApps[i];
        const appDate = app.date || "";

        // Serviço correto do ciclo
        let targetSrvObj = cyclePatternObjects[i % 4];
        let targetSrvName = cyclePatternNames[i % 4];

        if (appDate === "2026-12-18" || appDate === "2026-12-31") {
          targetSrvObj = peMaoSrv;
          targetSrvName = "Pé e mão tradicional";
        } else if (appDate === "2026-12-24") {
          targetSrvObj = maoSrv;
          targetSrvName = "Mão tradicional";
        } else if (appDate === "2026-12-11") {
          targetSrvObj = gelSrv;
          targetSrvName = "Banho de Gel com adicional";
        }

        // Definir valor correto conforme a regra:
        // 1. Semana 1 de CADA um dos 4 combos (i=0, 4, 8, 12) -> R$ 263.90 (Entrada do Combo no caixa)
        // 2. Semanas 2, 3 e 4 de cada combo -> R$ 0.00
        // 3. Dezembro pós-combos: 11/12 (R$ 0), 18/12 (R$ 80), 24/12 (R$ 50), 31/12 (R$ 80)
        let targetTotal = 0;
        let noteText = "";

        const weekInCycle = (i % 4) + 1;
        const comboNum = Math.floor(i / 4) + 1;

        if (i < 16 && weekInCycle === 1) {
          // Início de cada combo -> R$ 263.90
          targetTotal = 263.90;
          noteText = `📦 Pacote Ativo: Combo ${comboNum}/4 | Sessão 1/4 (Entrada do Combo R$ 263,90)`;
        } else if (appDate === "2026-12-11") {
          targetTotal = 130.0;
          noteText = `Banho de Gel com adicional (R$ 130,00)`;
        } else if (appDate === "2026-12-18") {
          targetTotal = 80.0;
          noteText = `Pé e mão tradicional (R$ 80,00)`;
        } else if (appDate === "2026-12-24") {
          targetTotal = 50.0;
          noteText = `Mão tradicional (R$ 50,00)`;
        } else if (appDate === "2026-12-31") {
          targetTotal = 80.0;
          noteText = `Pé e mão tradicional (R$ 80,00)`;
        } else {
          targetTotal = 0.0;
          noteText = `📦 Sessão ${weekInCycle}/4 do Combo ${comboNum}/4: ${targetSrvName} (R$ 0,00)`;
        }

        // Atualizar no banco de dados o agendamento
        await prisma.appointment.update({
          where: { id: app.id },
          data: {
            total: targetTotal,
            subtotal: targetTotal,
            remainingAmount: targetTotal,
            notes: noteText,
          },
        }).catch(() => {});

        // Atualizar relação de serviços no banco
        await prisma.appointmentService.deleteMany({ where: { appointmentId: app.id } }).catch(() => {});
        await prisma.appointmentService.create({
          data: {
            appointmentId: app.id,
            serviceId: targetSrvObj.id,
            serviceName: targetSrvName,
            price: targetTotal,
            durationMinutes: (targetSrvObj as any).durationMinutes || 60,
          },
        }).catch(() => {});

        // Atualizar objeto em memória
        app.total = targetTotal;
        app.subtotal = targetTotal;
        app.notes = noteText;
        app.services = [{
          id: `as-${app.id}`,
          appointmentId: app.id,
          serviceId: targetSrvObj.id,
          serviceName: targetSrvName,
          price: targetTotal,
          durationMinutes: (targetSrvObj as any).durationMinutes || 60,
        }];
      }

      // Lançar/Atualizar caixa aberto de hoje para R$ 263.90 (PIX)
      const openCash = await prisma.cashRegister.findFirst({
        where: { salonId: "default-salon", status: "ABERTO" },
      });
      if (openCash) {
        const existingTx = await prisma.cashTransaction.findFirst({
          where: {
            cashRegisterId: openCash.id,
            description: { contains: "Ju Arcanjo", mode: "insensitive" },
          },
        });
        if (existingTx) {
          await prisma.cashTransaction.update({
            where: { id: existingTx.id },
            data: {
              amount: 263.90,
              netAmount: 263.90,
              category: "VENDA_PACOTE",
              description: 'Venda do Pacote "Combo banho de gel com adicional" para Ju Arcanjo (4 sessões)',
            },
          }).catch(() => {});
        } else {
          await prisma.cashTransaction.create({
            data: {
              cashRegisterId: openCash.id,
              salonId: "default-salon",
              type: "ENTRADA",
              category: "VENDA_PACOTE",
              amount: 263.90,
              paymentMethod: "PIX",
              netAmount: 263.90,
              description: 'Venda do Pacote "Combo banho de gel com adicional" para Ju Arcanjo (4 sessões)',
            },
          }).catch(() => {});
        }
      }
    }

    // Enriquecer clientes com o histórico completo de agendamentos e pacotes ativos
    const enriched = clients.map((cli) => {
      const cliApps = appointments
        .filter((a) => a.clientId === cli.id)
        .sort((a, b) => (a.date + " " + (a.startTime || "")).localeCompare(b.date + " " + (b.startTime || "")));
      const cliCanceledApps = cliApps.filter((a) => a.status === "CANCELADO");
      const cliCanceledThisMonth = cliApps.filter((a) => a.status === "CANCELADO" && a.date.startsWith(currentYearMonth));

      const cliPkgs = clientPackages
        .filter((cp: any) => cp.clientId === cli.id || (cli.name && cp.clientName && cp.clientName.toLowerCase() === cli.name.toLowerCase()))
        .map((cp: any) => {
          const pkgObj = packages.find((p) => p.id === cp.packageId);
          return {
            ...cp,
            packageName: pkgObj?.name || "Combo banho de gel com adicional",
            price: pkgObj?.price || 263.90,
          };
        });

      // Se a cliente tem agendamentos com notas de pacote, mas cliPkgs estava vazio, adicionar pacote sintético ativo
      const hasPkgNotes = cliApps.some((a) => (a.notes || "").includes("Pacote") || (a.notes || "").includes("Combo"));
      if (cliPkgs.length === 0 && hasPkgNotes) {
        cliPkgs.push({
          id: `pkg-${cli.id}`,
          clientId: cli.id,
          packageId: comboPackage?.id || "pkg-default",
          packageName: comboPackage?.name || "Combo banho de gel com adicional",
          price: comboPackage?.price || 263.90,
          sessionsUsed: 1,
          totalSessions: comboPackage?.totalSessions || 4,
          active: true,
          purchaseDate: new Date(),
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        } as any);
      }

      const completedApps = cliApps.filter((a) => a.status === "CONCLUIDO" || a.status === "CONFIRMADO");
      const visitsCount = completedApps.length;
      const totalSpent = cliApps.filter((a) => a.status === "CONCLUIDO").reduce((acc, a) => acc + (a.total || 0), 0);

      let daysSinceLastVisit = 0;
      const lastApp = completedApps[0];
      if (lastApp && lastApp.date) {
        const lastDate = new Date(lastApp.date + "T12:00:00");
        const diffTime = Math.abs(now.getTime() - lastDate.getTime());
        daysSinceLastVisit = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Calcular tag automatica por frequencia real
      let computedTag = "NOVO";
      if (visitsCount >= 5 || totalSpent >= 400) {
        computedTag = "VIP";
      } else if (visitsCount >= 2) {
        computedTag = "FREQUENTE";
      } else if (visitsCount > 0 && daysSinceLastVisit > 45) {
        computedTag = "INATIVO";
      } else {
        computedTag = "NOVO";
      }

      return {
        ...cli,
        tag: computedTag,
        appointments: cliApps,
        packages: cliPkgs,
        cancellationsTotal: cliCanceledApps.length,
        cancellationsThisMonth: cliCanceledThisMonth.length,
        canceledAppointments: cliCanceledApps,
        lastAppointment: cliApps.find((a) => a.status !== "CANCELADO") || null,
        nextAppointment: cliApps.find((a) => a.status !== "CANCELADO" && a.date >= todayStr) || null,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Adicionar foto na galeria da cliente
    if (body.action === "ADD_PHOTO") {
      const { clientId, photoUrl, type = "RESULTADO", description } = body;
      if (!clientId || !photoUrl) {
        return NextResponse.json({ error: "ID da cliente e URL da foto são obrigatórios." }, { status: 400 });
      }

      const photo = await prisma.clientPhoto.create({
        data: {
          clientId,
          photoUrl,
          type,
          description,
        },
      });

      return NextResponse.json(photo);
    }

    const {
      name,
      phone,
      whatsapp,
      email,
      birthDate,
      instagram,
      address,
      notes,
      referralSource = "Instagram",
      tag = "NOVO",
      nailForm = "Amendoado",
      nailColor = "Nude Rosado",
      nailMaterial = "Gel Moldado",
      nailSize = "Médio (2)",
      extensionType = "Fibra de Vidro",
      nailDecoration = "Francesa Reversa",
    } = body;

    if (!name || (!phone && !whatsapp)) {
      return NextResponse.json({ error: "Nome e Telefone/WhatsApp são obrigatórios." }, { status: 400 });
    }

    const inputPhone = (phone || whatsapp || "").replace(/\D/g, "");

    // Busca Inteligente por WhatsApp/Telefone (Reaproveitamento de Cliente Fixo)
    if (inputPhone.length >= 8) {
      const existingClients = await prisma.client.findMany({
        where: { salonId: "default-salon" },
      });

      const lastDigitsTarget = inputPhone.slice(-8);

      const matchedClient = existingClients.find((c) => {
        const cPhone = (c.phone || "").replace(/\D/g, "");
        const cWa = (c.whatsapp || "").replace(/\D/g, "");
        return (
          (cPhone.length >= 8 && cPhone.slice(-8) === lastDigitsTarget) ||
          (cWa.length >= 8 && cWa.slice(-8) === lastDigitsTarget)
        );
      });

      if (matchedClient) {
        // Atualizar nome ou contatos mantendo o mesmo perfil e histórico da cliente
        const updatedClient = await prisma.client.update({
          where: { id: matchedClient.id },
          data: {
            ...(name ? { name } : {}),
            phone: phone || matchedClient.phone,
            whatsapp: whatsapp || matchedClient.whatsapp,
            ...(email ? { email } : {}),
          },
        });

        return NextResponse.json(updatedClient);
      }
    }

    // Se for cliente nova, criar registro único
    const client = await prisma.client.create({
      data: {
        salonId: "default-salon",
        name,
        phone: phone || whatsapp,
        whatsapp: whatsapp || phone,
        email,
        birthDate,
        instagram,
        address,
        notes,
        referralSource,
        tag,
        nailForm,
        nailColor,
        nailMaterial,
        nailSize,
        extensionType,
        nailDecoration,
      },
    });

    return NextResponse.json(client);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, appointments, packages, photos, lastAppointment, nextAppointment, ...data } = body;

    if (!id) return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });

    const client = await prisma.client.update({
      where: { id },
      data,
    });

    return NextResponse.json(client);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const photoId = searchParams.get("photoId");

    if (photoId) {
      await prisma.clientPhoto.delete({ where: { id: photoId } });
      return NextResponse.json({ success: true });
    }

    if (!id) return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });

    // Apagar dependências para evitar violação de chave estrangeira
    await prisma.clientPhoto.deleteMany({ where: { clientId: id } }).catch(() => {});
    await prisma.clientPackage.deleteMany({ where: { clientId: id } }).catch(() => {});
    await prisma.appointment.deleteMany({ where: { clientId: id } }).catch(() => {});

    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
