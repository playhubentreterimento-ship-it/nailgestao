import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      include: { services: true },
      orderBy: { order: "asc" },
    }).catch(() => []);

    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    }).catch(() => []);

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

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "CATEGORY") {
      const { id, categoryName, description } = body;
      if (!id || !categoryName) {
        return NextResponse.json({ error: "ID e Nome da categoria são obrigatórios." }, { status: 400 });
      }

      const updatedCategory = await prisma.serviceCategory.update({
        where: { id },
        data: {
          name: categoryName,
          description: description || null,
        },
      });

      return NextResponse.json(updatedCategory);
    }

    const { id, categoryId, name, description, durationMinutes, price, promoPrice, commissionPercent } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do serviço é obrigatório para edição." }, { status: 400 });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...(categoryId ? { categoryId } : {}),
        ...(name ? { name } : {}),
        description: description !== undefined ? description : undefined,
        ...(durationMinutes ? { durationMinutes: Number(durationMinutes) } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        promoPrice: promoPrice !== undefined ? (promoPrice ? Number(promoPrice) : null) : undefined,
        ...(commissionPercent !== undefined ? { commissionPercent: Number(commissionPercent) } : {}),
      },
    });

    return NextResponse.json(updatedService);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "service";

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório para exclusão." }, { status: 400 });
    }

    if (type === "category") {
      // Excluir ou limpar vinculo de servicos primeiro se necessário
      await prisma.service.deleteMany({
        where: { categoryId: id },
      });
      await prisma.serviceCategory.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: "Categoria excluída com sucesso." });
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Serviço excluído com sucesso." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
