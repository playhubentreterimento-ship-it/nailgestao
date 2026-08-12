import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { salonId: "default-salon" },
      include: { services: true },
      orderBy: { order: "asc" },
    });

    const services = await prisma.service.findMany({
      where: { salonId: "default-salon" },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories, services });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "CATEGORY") {
      const { categoryName, description } = body;
      if (!categoryName) {
        return NextResponse.json({ error: "Nome da categoria é obrigatório." }, { status: 400 });
      }

      const category = await prisma.serviceCategory.create({
        data: {
          salonId: "default-salon",
          name: categoryName,
          description: description || null,
        },
      });

      return NextResponse.json(category);
    }

    const { categoryId, name, description, durationMinutes, price, promoPrice, commissionPercent } = body;

    if (!categoryId || !name || !price || !durationMinutes) {
      return NextResponse.json({ error: "Categoria, nome, preço e duração são obrigatórios." }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        salonId: "default-salon",
        categoryId,
        name,
        description,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        promoPrice: promoPrice ? Number(promoPrice) : null,
        commissionPercent: Number(commissionPercent || 40),
      },
    });

    return NextResponse.json(service);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
