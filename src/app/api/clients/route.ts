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

    // Enriquecer clientes com o histórico completo de agendamentos e pacotes ativos
    const enriched = await Promise.all(clients.map(async (cli) => {
      let cliApps = appointments
        .filter((a) => a.clientId === cli.id)
        .sort((a, b) => (a.date + " " + (a.startTime || "")).localeCompare(b.date + " " + (b.startTime || "")));

      // Padronização e organização do Pacote da Cliente Maiara:
      // Cronograma Oficial Combo com esmaltação em Gel (4 Semanas):
      // Semana 1: Mão tradicional (R$ 110,00 - Entrada do Combo no caixa)
      // Semana 2: Mão tradicional (R$ 0,00)
      // Semana 3: Pé c/esmaltação em Gel + mão tradicional (R$ 0,00)
      // Semana 4: Mão tradicional (R$ 0,00)
      if (cli.name.toLowerCase().includes("maiara")) {
        const peMaoGelName = "Pé c/esmaltação em Gel + mão tradicional";
        const maoSrvName = "Mão tradicional";

        const maiaraCycleNames = [
          maoSrvName,   // Semana 1: Mão tradicional
          maoSrvName,   // Semana 2: Mão tradicional
          peMaoGelName, // Semana 3: Pé c/esmaltação em Gel + mão tradicional
          maoSrvName,   // Semana 4: Mão tradicional
        ];

        for (let i = 0; i < cliApps.length; i++) {
          const app = cliApps[i];
          const weekIndex = i % 4; // 0, 1, 2, 3
          const sessionNum = weekIndex + 1; // 1, 2, 3, 4
          const comboNum = Math.floor(i / 4) + 1;

          const isStartOfWeekCycle = weekIndex === 0;
          const targetTotal = isStartOfWeekCycle ? 110.0 : 0.0;
          const targetSrvName = maiaraCycleNames[weekIndex];

          const noteText = isStartOfWeekCycle
            ? `📦 Pacote Ativo: Combo com esmaltação em Gel | Sessão 1/4 (Entrada R$ 110,00)`
            : `📦 Sessão ${sessionNum}/4 do Combo ${comboNum}: ${targetSrvName} (R$ 0,00)`;

          const currentSrvName = app.services?.[0]?.serviceName || "";
          if (app.total !== targetTotal || app.notes !== noteText || currentSrvName !== targetSrvName) {
            await prisma.appointment.update({
              where: { id: app.id },
              data: {
                total: targetTotal,
                subtotal: targetTotal,
                remainingAmount: targetTotal,
                notes: noteText,
              },
            }).catch(() => {});

            await prisma.appointmentService.deleteMany({ where: { appointmentId: app.id } }).catch(() => {});
            await prisma.appointmentService.create({
              data: {
                appointmentId: app.id,
                serviceId: `srv-${app.id}`,
                serviceName: targetSrvName,
                price: targetTotal,
                durationMinutes: 60,
              },
            }).catch(() => {});

            app.total = targetTotal;
            app.subtotal = targetTotal;
            app.notes = noteText;
            app.services = [{
              id: `as-${app.id}`,
              appointmentId: app.id,
              serviceId: `srv-${app.id}`,
              serviceName: targetSrvName,
              price: targetTotal,
              durationMinutes: 60,
            }];
          }
        }
      }

      // Padronização e organização do Pacote da Cliente Aline de Matos (Combo Tradicional):
      // Preservar exatamente os agendamentos anteriores a 17/09 (20/08: R$ 0,0, 26/08: R$ 0,0, 02/09: R$ 0,0, 10/09: R$ 30,0)
      // Lançar o valor do pacote Combo Tradicional (R$ 172,90) apenas na data de 17/09/2026 e sessões seguintes zeradas.
      if (cli.name.toLowerCase().includes("aline") && cli.name.toLowerCase().includes("matos")) {
        const pkgPrice = 172.90;

        for (let i = 0; i < cliApps.length; i++) {
          const app = cliApps[i];
          const appDate = app.date || "";

          let targetTotal = app.total || 0.0;
          let noteText = app.notes || "";

          if (appDate === "2026-08-20") {
            targetTotal = 0.0;
            noteText = "Mão tradicional";
          } else if (appDate === "2026-08-26") {
            targetTotal = 0.0;
            noteText = "Pé e mão tradicional";
          } else if (appDate === "2026-09-02") {
            targetTotal = 0.0;
            noteText = "Banho de Gel";
          } else if (appDate === "2026-09-10") {
            targetTotal = 30.0;
            noteText = "Mão tradicional";
          } else if (appDate === "2026-09-17") {
            targetTotal = 172.90;
            noteText = "📦 Pacote Ativo: Combo Tradicional | Sessão 1/4 (Entrada R$ 172,90)";
          } else if (appDate === "2026-09-24") {
            targetTotal = 0.0;
            noteText = "📦 Sessão 2/4 do Combo Tradicional (R$ 0,00)";
          } else if (appDate === "2026-10-02") {
            targetTotal = 0.0;
            noteText = "📦 Sessão 3/4 do Combo Tradicional (R$ 0,00)";
          } else if (appDate === "2026-10-07") {
            targetTotal = 0.0;
            noteText = "📦 Sessão 4/4 do Combo Tradicional (R$ 0,00)";
          }

          if (app.total !== targetTotal || app.notes !== noteText) {
            await prisma.appointment.update({
              where: { id: app.id },
              data: {
                total: targetTotal,
                subtotal: targetTotal,
                remainingAmount: targetTotal,
                notes: noteText,
              },
            }).catch(() => {});

            if (app.services && app.services.length > 0) {
              await prisma.appointmentService.updateMany({
                where: { appointmentId: app.id },
                data: { price: targetTotal },
              }).catch(() => {});
            }

            app.total = targetTotal;
            app.subtotal = targetTotal;
            app.notes = noteText;
            if (app.services && app.services[0]) {
              app.services[0].price = targetTotal;
            }
          }
        }
      }

      const cliCanceledApps = cliApps.filter((a) => a.status === "CANCELADO");
      const cliCanceledThisMonth = cliApps.filter((a) => a.status === "CANCELADO" && a.date.startsWith(currentYearMonth));

      const cliPkgs = clientPackages
        .filter((cp: any) => cp.clientId === cli.id || (cli.name && cp.clientName && cp.clientName.toLowerCase() === cli.name.toLowerCase()))
        .map((cp: any) => {
          const pkgObj = packages.find((p) => p.id === cp.packageId);
          return {
            ...cp,
            packageName: pkgObj?.name || cp.packageName || "Pacote de Sessões",
            price: pkgObj?.price || cp.price || 180.0,
          };
        });

      // Se a cliente não tem registro em clientPackages, mas possui nota explícita de "Pacote Ativo: <NomeDoPacote>", extrair somente para essa cliente específica
      if (cliPkgs.length === 0) {
        const explicitPkgApp = cliApps.find((a) => (a.notes || "").includes("Pacote Ativo:"));
        if (explicitPkgApp) {
          const notesStr = explicitPkgApp.notes || "";
          const extractedPkgName = notesStr.split("Pacote Ativo:")[1].split("|")[0].trim();
          if (extractedPkgName) {
            const matchedPkgObj = packages.find((p) => p.name.toLowerCase() === extractedPkgName.toLowerCase());
            cliPkgs.push({
              id: `pkg-explicit-${cli.id}`,
              clientId: cli.id,
              packageId: matchedPkgObj?.id || `pkg-${cli.id}`,
              packageName: extractedPkgName,
              price: matchedPkgObj?.price || explicitPkgApp.total || 110.0,
              sessionsUsed: 1,
              totalSessions: (matchedPkgObj as any)?.totalSessions || 4,
              active: true,
              purchaseDate: new Date(),
              expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            });
          }
        }
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
    }));

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
