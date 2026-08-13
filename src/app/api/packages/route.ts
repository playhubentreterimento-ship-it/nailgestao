import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let packages = await prisma.package.findMany({
      where: { salonId: "default-salon", active: true },
      orderBy: { name: "asc" },
    });

    // Se nao houver pacotes cadastrados, criar os pacotes iniciais do salao
    if (packages.length === 0) {
      await prisma.package.createMany({
        data: [
          {
            salonId: "default-salon",
            name: "Combo Club 3 Manutenções em Fibra",
            price: 330.0,
            totalSessions: 3,
            validityDays: 90,
            description: "Sessão quinzenal com valor promocional e prioridade de horário.",
          },
          {
            salonId: "default-salon",
            name: "Plano Trimestral Banho de Gel",
            price: 270.0,
            totalSessions: 3,
            validityDays: 90,
            description: "Blindagem e nivelamento contínuo com cutilagem russa inclusa.",
          },
          {
            salonId: "default-salon",
            name: "Pacote 4 Sessões Manicure & Pedicure",
            price: 180.0,
            totalSessions: 4,
            validityDays: 60,
            description: "Manutenção completa de mãos e pés para o mês.",
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
      select: { id: true, name: true, phone: true, whatsapp: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ packages, clientPackages, clients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Vinculo de Pacote com Cliente
    if (body.action === "ASSIGN_TO_CLIENT") {
      const { clientId, packageId } = body;
      if (!clientId || !packageId) {
        return NextResponse.json({ error: "Cliente e Pacote são obrigatórios." }, { status: 400 });
      }

      const targetPackage = await prisma.package.findUnique({ where: { id: packageId } });
      if (!targetPackage) {
        return NextResponse.json({ error: "Pacote não encontrado." }, { status: 404 });
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (targetPackage.validityDays || 90));

      const clientPackage = await prisma.clientPackage.create({
        data: {
          clientId,
          packageId,
          totalSessions: targetPackage.totalSessions,
          sessionsUsed: 0,
          purchaseDate: new Date(),
          expiryDate,
          active: true,
        },
      });

      return NextResponse.json(clientPackage);
    }

    // Abater 1 Sessao de Pacote do Cliente
    if (body.action === "USE_SESSION") {
      const { clientPackageId } = body;
      if (!clientPackageId) {
        return NextResponse.json({ error: "ID do Pacote da Cliente é obrigatório." }, { status: 400 });
      }

      const clientPkg = await prisma.clientPackage.findUnique({ where: { id: clientPackageId } });
      if (!clientPkg) {
        return NextResponse.json({ error: "Pacote da cliente não encontrado." }, { status: 404 });
      }

      const updated = await prisma.clientPackage.update({
        where: { id: clientPackageId },
        data: {
          sessionsUsed: clientPkg.sessionsUsed + 1,
          active: clientPkg.sessionsUsed + 1 < clientPkg.totalSessions,
        },
      });

      return NextResponse.json(updated);
    }

    // Criar Novo Pacote
    const { name, price, totalSessions, validityDays, description } = body;

    if (!name || !price || !totalSessions) {
      return NextResponse.json({ error: "Nome, preço e total de sessões são obrigatórios." }, { status: 400 });
    }

    const newPackage = await prisma.package.create({
      data: {
        salonId: "default-salon",
        name,
        price: Number(price),
        totalSessions: Number(totalSessions),
        validityDays: Number(validityDays || 90),
        description: description || null,
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
    const { id, name, price, totalSessions, validityDays, description } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "ID e nome do pacote são obrigatórios." }, { status: 400 });
    }

    const updated = await prisma.package.update({
      where: { id },
      data: {
        name,
        price: Number(price),
        totalSessions: Number(totalSessions),
        validityDays: Number(validityDays || 90),
        description: description || null,
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
