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
    const enriched = clients.map((cli) => {
      const cliApps = appointments
        .filter((a) => a.clientId === cli.id)
        .sort((a, b) => (a.date + " " + (a.startTime || "")).localeCompare(b.date + " " + (b.startTime || "")));
      const cliCanceledApps = cliApps.filter((a) => a.status === "CANCELADO");
      const cliCanceledThisMonth = cliApps.filter((a) => a.status === "CANCELADO" && a.date.startsWith(currentYearMonth));

      const cliPkgs = clientPackages
        .filter((cp) => cp.clientId === cli.id)
        .map((cp) => {
          const pkgObj = packages.find((p) => p.id === cp.packageId);
          return {
            ...cp,
            packageName: pkgObj?.name || "Pacote de Sessões",
            price: pkgObj?.price || 0,
          };
        });

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
