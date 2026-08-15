import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function ensurePackageTableColumns() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "weeklyServices" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "discountType" TEXT DEFAULT 'FIXED';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "discountValue" DOUBLE PRECISION DEFAULT 0;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "originalPrice" DOUBLE PRECISION DEFAULT 0;`);
  } catch (e) {
    console.error("Auto migration column error:", e);
  }
}

export async function GET() {
  try {
    await ensurePackageTableColumns();

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

    let services = await prisma.service.findMany({
      where: { salonId: "default-salon" },
      select: { id: true, name: true, price: true, promoPrice: true, durationMinutes: true },
      orderBy: { name: "asc" },
    });

    if (services.length === 0) {
      services = await prisma.service.findMany({
        select: { id: true, name: true, price: true, promoPrice: true, durationMinutes: true },
        orderBy: { name: "asc" },
      });
    }

    if (services.length === 0) {
      let defaultCat = await prisma.serviceCategory.findFirst({ where: { salonId: "default-salon" } });
      if (!defaultCat) {
        defaultCat = await prisma.serviceCategory.create({
          data: { salonId: "default-salon", name: "Alongamento & Estética de Unhas" },
        });
      }
      await prisma.service.createMany({
        data: [
          { salonId: "default-salon", categoryId: defaultCat.id, name: "Aplicação Fibra de Vidro Premium", price: 180.0, durationMinutes: 120 },
          { salonId: "default-salon", categoryId: defaultCat.id, name: "Manutenção de Fibra de Vidro", price: 110.0, durationMinutes: 90 },
          { salonId: "default-salon", categoryId: defaultCat.id, name: "Banho de Gel / Gel Moldado", price: 130.0, durationMinutes: 90 },
          { salonId: "default-salon", categoryId: defaultCat.id, name: "Esmaltação em Gel & Cutilagem", price: 70.0, durationMinutes: 60 },
          { salonId: "default-salon", categoryId: defaultCat.id, name: "Spa das Mãos & Nivelamento", price: 60.0, durationMinutes: 45 },
          { salonId: "default-salon", categoryId: defaultCat.id, name: "Remoção & Blindagem de Unhas", price: 80.0, durationMinutes: 60 },
        ],
      });
      services = await prisma.service.findMany({
        where: { salonId: "default-salon" },
        select: { id: true, name: true, price: true, promoPrice: true, durationMinutes: true },
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json({ packages, clientPackages, clients, services });
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
    const {
      name,
      price,
      totalSessions,
      validityDays,
      description,
      weeklyServices,
      discountType,
      discountValue,
      originalPrice,
    } = body;

    if (!name || price === undefined || price === null || !totalSessions) {
      return NextResponse.json({ error: "Nome, preço e total de sessões são obrigatórios." }, { status: 400 });
    }

    await ensurePackageTableColumns();

    let newPackage;
    try {
      newPackage = await prisma.package.create({
        data: {
          salonId: "default-salon",
          name,
          price: Number(price),
          totalSessions: Math.min(6, Math.max(1, Number(totalSessions))),
          validityDays: Number(validityDays || 90),
          description: description || null,
          weeklyServices: typeof weeklyServices === "string" ? weeklyServices : JSON.stringify(weeklyServices || []),
          discountType: discountType || "FIXED",
          discountValue: Number(discountValue || 0),
          originalPrice: Number(originalPrice || price),
          active: true,
        },
      });
    } catch (createErr: any) {
      console.error("Erro no save completo, tentando fallback:", createErr);
      newPackage = await prisma.package.create({
        data: {
          salonId: "default-salon",
          name,
          price: Number(price),
          totalSessions: Math.min(6, Math.max(1, Number(totalSessions))),
          validityDays: Number(validityDays || 90),
          description: description || null,
          active: true,
        },
      });
    }

    return NextResponse.json(newPackage);
  } catch (error: any) {
    console.error("Erro fatal POST /api/packages:", error);
    return NextResponse.json({ error: error.message || "Erro ao salvar pacote" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      price,
      totalSessions,
      validityDays,
      description,
      weeklyServices,
      discountType,
      discountValue,
      originalPrice,
    } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "ID e nome do pacote são obrigatórios." }, { status: 400 });
    }

    await ensurePackageTableColumns();

    let updated;
    try {
      updated = await prisma.package.update({
        where: { id },
        data: {
          name,
          price: Number(price),
          totalSessions: Math.min(6, Math.max(1, Number(totalSessions))),
          validityDays: Number(validityDays || 90),
          description: description || null,
          weeklyServices: typeof weeklyServices === "string" ? weeklyServices : JSON.stringify(weeklyServices || []),
          discountType: discountType || "FIXED",
          discountValue: Number(discountValue || 0),
          originalPrice: Number(originalPrice || price),
        },
      });
    } catch (updateErr: any) {
      console.error("Erro no update completo, tentando fallback:", updateErr);
      updated = await prisma.package.update({
        where: { id },
        data: {
          name,
          price: Number(price),
          totalSessions: Math.min(6, Math.max(1, Number(totalSessions))),
          validityDays: Number(validityDays || 90),
          description: description || null,
        },
      });
    }

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
