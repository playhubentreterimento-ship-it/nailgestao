import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let salon = await prisma.salon.findFirst();
    if (!salon) {
      salon = await prisma.salon.create({
        data: { id: "default-salon", name: "Studio Luxe Nail Designer" },
      });
    }

    return NextResponse.json(salon);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    let salon = await prisma.salon.findFirst();

    const updated = await prisma.salon.upsert({
      where: { id: salon?.id || "default-salon" },
      update: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.slogan !== undefined ? { slogan: body.slogan } : {}),
        ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl } : {}),
        ...(body.phone ? { phone: body.phone } : {}),
        ...(body.whatsapp ? { whatsapp: body.whatsapp } : {}),
        ...(body.instagram !== undefined ? { instagram: body.instagram } : {}),
        ...(body.address ? { address: body.address } : {}),
        ...(body.primaryColor ? { primaryColor: body.primaryColor } : {}),
        ...(body.secondaryColor ? { secondaryColor: body.secondaryColor } : {}),
        ...(body.buttonColor ? { buttonColor: body.buttonColor } : {}),
        ...(body.themeMode ? { themeMode: body.themeMode } : {}),
        ...(body.creditFeePercent !== undefined ? { creditFeePercent: Number(body.creditFeePercent) } : {}),
        ...(body.debitFeePercent !== undefined ? { debitFeePercent: Number(body.debitFeePercent) } : {}),
        ...(body.defaultDepositAmount !== undefined ? { defaultDepositAmount: Number(body.defaultDepositAmount) } : {}),
      },
      create: {
        id: "default-salon",
        name: body.name || "Meu Salão de Unhas",
        slogan: body.slogan || "Seja Bem-Vinda",
        logoUrl: body.logoUrl || null,
        phone: body.phone || null,
        address: body.address || null,
        primaryColor: body.primaryColor || "#E0A96D",
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
