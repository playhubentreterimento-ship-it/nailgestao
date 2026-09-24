import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const RECOVERY_SALON_ID = "67998370966";

async function getSalonId() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("nailgestao_session");

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);

      if (session?.salonId) {
        return session.salonId;
      }
    } catch {}
  }

  return RECOVERY_SALON_ID;
}

export async function GET() {
  try {
    const salonId = await getSalonId();

    const clients = await prisma.client.findMany({
      where: { salonId },
      include: { photos: true },
      orderBy: { name: "asc" },
    });

    const appointments = await prisma.appointment.findMany({
      where: { salonId },
      include: { services: true },
      orderBy: { date: "desc" },
    });

    const clientPackages = await prisma.clientPackage.findMany({
      where: { active: true },
    });

    const packages = await prisma.package.findMany({
      where: { salonId },
    });

    const enriched = clients.map((cli) => {
      const cliApps = appointments.filter(
        (a) => a.clientId === cli.id
      );

      const cliPkgs = clientPackages
        .filter((cp) => cp.clientId === cli.id)
        .map((cp) => {
          const pkgObj = packages.find(
            (p) => p.id === cp.packageId
          );

          return {
            ...cp,
            packageName:
              pkgObj?.name || "Pacote de Sessões",
            price: pkgObj?.price || 0,
          };
        });

      return {
        ...cli,
        appointments: cliApps,
        packages: cliPkgs,
        lastAppointment: cliApps[0] || null,
        nextAppointment:
          cliApps.find(
            (a) => new Date(a.date) >= new Date()
          ) || null,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const salonId = await getSalonId();
    const body = await req.json();

    if (body.action === "ADD_PHOTO") {
      const {
        clientId,
        photoUrl,
        type = "RESULTADO",
        description,
      } = body;

      if (!clientId || !photoUrl) {
        return NextResponse.json(
          {
            error:
              "ID da cliente e URL da foto são obrigatórios.",
          },
          { status: 400 }
        );
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
      return NextResponse.json(
        {
          error:
            "Nome e Telefone/WhatsApp são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const inputPhone = (
      phone ||
      whatsapp ||
      ""
    ).replace(/\D/g, "");

    if (inputPhone.length >= 8) {
      const existingClients =
        await prisma.client.findMany({
          where: { salonId },
        });

      const lastDigitsTarget =
        inputPhone.slice(-8);

      const matchedClient =
        existingClients.find((c) => {
          const cPhone = (c.phone || "").replace(
            /\D/g,
            ""
          );

          const cWa = (c.whatsapp || "").replace(
            /\D/g,
            ""
          );

          return (
            (cPhone.length >= 8 &&
              cPhone.slice(-8) ===
                lastDigitsTarget) ||
            (cWa.length >= 8 &&
              cWa.slice(-8) ===
                lastDigitsTarget)
          );
        });

      if (matchedClient) {
        const updatedClient =
          await prisma.client.update({
            where: { id: matchedClient.id },
            data: {
              ...(name ? { name } : {}),
              phone:
                phone || matchedClient.phone,
              whatsapp:
                whatsapp ||
                matchedClient.whatsapp,
              ...(email ? { email } : {}),
            },
          });

        return NextResponse.json(updatedClient);
      }
    }

    const client = await prisma.client.create({
      data: {
        salonId,
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
      appointments,
      packages,
      photos,
      lastAppointment,
      nextAppointment,
      ...data
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório." },
        { status: 400 }
      );
    }

    const client = await prisma.client.update({
      where: { id },
      data,
    });

    return NextResponse.json(client);
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

    const id = searchParams.get("id");
    const photoId =
      searchParams.get("photoId");

    if (photoId) {
      await prisma.clientPhoto.delete({
        where: { id: photoId },
      });

      return NextResponse.json({
        success: true,
      });
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório." },
        { status: 400 }
      );
    }

    await prisma.client.delete({
      where: { id },
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
