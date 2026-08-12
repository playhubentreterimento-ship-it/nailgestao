import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatPhoneWithDDI } from "@/lib/whatsapp/provider";

export async function GET() {
  try {
    let salon = await prisma.salon.findFirst().catch(() => null);
    if (!salon) {
      salon = await prisma.salon.create({
        data: { id: "default-salon", name: "Studio Selma Gloor" },
      }).catch(() => null);
    }

    const firstProf = await prisma.professional.findFirst({
      where: { salonId: "default-salon" },
      orderBy: { createdAt: "asc" },
    });

    let rawPhone = salon?.whatsapp || salon?.phone || firstProf?.phone || "";
    // Se o telefone do salao ainda for o valor inicial de teste, usar o telefone cadastrado da profissional
    if ((!rawPhone || rawPhone.includes("987654321") || rawPhone.includes("999998888")) && firstProf?.phone) {
      rawPhone = firstProf.phone;
    }

    const activeWhatsApp = formatPhoneWithDDI(rawPhone);

    return NextResponse.json({
      ...(salon || { id: "default-salon", name: "Studio Selma Gloor" }),
      activeWhatsApp,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    let salon = await prisma.salon.findFirst().catch(() => null);

    const rawPhone = body.whatsapp || body.phone;
    const formattedWhatsApp = rawPhone ? formatPhoneWithDDI(rawPhone) : undefined;

    const updateData: any = {
      ...(body.name ? { name: body.name } : {}),
      ...(body.slogan !== undefined ? { slogan: body.slogan } : {}),
      ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl } : {}),
      ...(body.phone ? { phone: body.phone } : {}),
      ...(formattedWhatsApp ? { whatsapp: formattedWhatsApp } : {}),
      ...(body.instagram !== undefined ? { instagram: body.instagram } : {}),
      ...(body.address ? { address: body.address } : {}),
      ...(body.primaryColor ? { primaryColor: body.primaryColor } : {}),
      ...(body.secondaryColor ? { secondaryColor: body.secondaryColor } : {}),
      ...(body.buttonColor ? { buttonColor: body.buttonColor } : {}),
      ...(body.themeMode ? { themeMode: body.themeMode } : {}),
      ...(body.creditFeePercent !== undefined ? { creditFeePercent: Number(body.creditFeePercent) } : {}),
      ...(body.debitFeePercent !== undefined ? { debitFeePercent: Number(body.debitFeePercent) } : {}),
      ...(body.defaultDepositAmount !== undefined ? { defaultDepositAmount: Number(body.defaultDepositAmount) } : {}),
    };

    if (body.ownerName !== undefined) {
      updateData.ownerName = body.ownerName;
    }

    let updated;
    try {
      updated = await prisma.salon.upsert({
        where: { id: salon?.id || "default-salon" },
        update: updateData,
        create: {
          id: "default-salon",
          name: body.name || "Meu Salão de Unhas",
          ownerName: body.ownerName || "Juliana Silva",
          slogan: body.slogan || "Seja Bem-Vinda",
          logoUrl: body.logoUrl || null,
          phone: body.phone || null,
          whatsapp: formattedWhatsApp || "5511999998888",
          address: body.address || null,
          primaryColor: body.primaryColor || "#E0A96D",
        },
      });
    } catch (err: any) {
      delete updateData.ownerName;
      updated = await prisma.salon.upsert({
        where: { id: salon?.id || "default-salon" },
        update: updateData,
        create: {
          id: "default-salon",
          name: body.name || "Meu Salão de Unhas",
          slogan: body.slogan || "Seja Bem-Vinda",
          logoUrl: body.logoUrl || null,
          phone: body.phone || null,
          whatsapp: formattedWhatsApp || "5511999998888",
          address: body.address || null,
          primaryColor: body.primaryColor || "#E0A96D",
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
