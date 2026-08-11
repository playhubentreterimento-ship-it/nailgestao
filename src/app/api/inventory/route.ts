import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { salonId: "default-salon" },
      include: { supplier: true },
      orderBy: { name: "asc" },
    });

    const suppliers = await prisma.supplier.findMany({
      where: { salonId: "default-salon" },
      orderBy: { name: "asc" },
    });

    const lowStockCount = products.filter((p) => p.quantity <= p.minQuantity).length;

    return NextResponse.json({
      products,
      suppliers,
      lowStockCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, quantity, minQuantity, costPrice, salePrice, supplierId } = body;

    if (!name || quantity === undefined || !costPrice) {
      return NextResponse.json({ error: "Nome, quantidade e preço de custo são obrigatórios." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        salonId: "default-salon",
        name,
        category: category || "DIVERSOS",
        quantity: Number(quantity),
        minQuantity: Number(minQuantity || 5),
        costPrice: Number(costPrice),
        salePrice: salePrice ? Number(salePrice) : null,
        supplierId: supplierId || null,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
