import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { formatPhoneWithDDI } from "@/lib/whatsapp/provider";

function isDummyPhone(phone?: string | null): boolean {
  if (!phone) return true;
  const digits = phone.replace(/\D/g, "");
  if (!digits || digits.length < 10) return true;
  if (
    digits.includes("999998888") ||
    digits.includes("987654321") ||
    digits.includes("0000000000") ||
    digits.includes("123456789")
  ) {
    return true;
  }
  return false;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("nailgestao_session");
    let sessionUser: any = null;
    if (sessionCookie?.value) {
      try {
        sessionUser = JSON.parse(sessionCookie.value);
      } catch (e) {}
    }

    let salon = await prisma.salon.findFirst().catch(() => null);

    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMINISTRADOR" },
    }).catch(() => null);

    const effectiveSalonName = salon?.name || sessionUser?.salonName || "Selma Gloor Nails Studio";
    const effectiveOwnerName = salon?.ownerName || sessionUser?.ownerName || sessionUser?.name || "Selma Gloor";
    const effectiveEmail = adminUser?.email || salon?.email || sessionUser?.email || "selma@studioluxe.com.br";

    const professionals = await prisma.professional.findMany({
      where: { salonId: salon?.id || "default-salon" },
      orderBy: { createdAt: "asc" },
    }).catch(() => []);

    let realPhone = salon?.whatsapp || salon?.phone || sessionUser?.whatsapp || sessionUser?.phone || "5567998370966";
    const activeWhatsApp = realPhone ? formatPhoneWithDDI(realPhone) : "5567998370966";

    return NextResponse.json({
      ...(salon || {}),
      id: salon?.id || "default-salon",
      name: effectiveSalonName,
      ownerName: effectiveOwnerName,
      slogan: salon?.slogan || "Especialistas em Alongamento & Estética de Unhas",
      primaryColor: salon?.primaryColor || "#E0A96D",
      logoUrl: salon?.logoUrl || "/salon-logo-official.png",
      phone: salon?.phone || "(67) 99837-0966",
      whatsapp: salon?.whatsapp || "5567998370966",
      address: salon?.address || "Atendimento em Studio & Domiciliar",
      activeWhatsApp,
      adminEmail: effectiveEmail,
    });
  } catch (error: any) {
    return NextResponse.json({
      id: "default-salon",
      name: "Selma Gloor Nails Studio",
      ownerName: "Selma Gloor",
      slogan: "Especialistas em Alongamento & Estética de Unhas",
      primaryColor: "#E0A96D",
      logoUrl: "/salon-logo-official.png",
      phone: "(67) 99837-0966",
      whatsapp: "5567998370966",
      activeWhatsApp: "5567998370966",
      adminEmail: "selma@studioluxe.com.br",
    });
  }
}

import { isDemoVisitor } from "@/lib/demo-check";

export async function PUT(req: Request) {
  try {
    if (await isDemoVisitor()) {
      return NextResponse.json(
        { error: "🔒 Modo Demonstração (Apenas Visualização): Faça login como Administradora para alterar dados!" },
        { status: 403 }
      );
    }

    const body = await req.json();
    let salon = await prisma.salon.findFirst().catch(() => null);

    const rawPhone = body.whatsapp || body.phone;
    const formattedWhatsApp = rawPhone ? formatPhoneWithDDI(rawPhone) : undefined;

    const updateData: any = {
      ...(body.name ? { name: body.name } : {}),
      ...(body.ownerName ? { ownerName: body.ownerName } : {}),
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

    let updated;
    try {
      updated = await prisma.salon.upsert({
        where: { id: salon?.id || "default-salon" },
        update: updateData,
        create: {
          id: "default-salon",
          name: body.name || "Meu Salão de Unhas",
          ownerName: body.ownerName || "Administradora",
          slogan: body.slogan || "Seja Bem-Vinda",
          logoUrl: body.logoUrl || null,
          phone: body.phone || null,
          whatsapp: formattedWhatsApp || "",
          address: body.address || null,
          primaryColor: body.primaryColor || "#E0A96D",
        },
      });
    } catch (err: any) {
      updated = await prisma.salon.upsert({
        where: { id: salon?.id || "default-salon" },
        update: updateData,
        create: {
          id: "default-salon",
          name: body.name || "Meu Salão de Unhas",
          ownerName: body.ownerName || "Administradora",
          slogan: body.slogan || "Seja Bem-Vinda",
          logoUrl: body.logoUrl || null,
          phone: body.phone || null,
          whatsapp: formattedWhatsApp || "",
          address: body.address || null,
          primaryColor: body.primaryColor || "#E0A96D",
        },
      });
    }

    // Se informou email ou senha para a Administradora Master, atualizar usuário no banco!
    if (body.adminEmail || body.adminPassword || body.ownerName) {
      const adminEmailToUse = body.adminEmail ? body.adminEmail.trim().toLowerCase() : undefined;
      const existingAdmin = await prisma.user.findFirst({
        where: { role: "ADMINISTRADOR" },
      }).catch(() => null);

      if (existingAdmin) {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: {
            ...(adminEmailToUse ? { email: adminEmailToUse } : {}),
            ...(body.adminPassword && body.adminPassword.trim() !== "" ? { passwordHash: body.adminPassword.trim() } : {}),
            ...(body.ownerName ? { name: body.ownerName } : {}),
          },
        }).catch(() => {});
      }
    }

    // Atualizar também o cookie de sessão para refletir as alterações feitas no formulário
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("nailgestao_session");
    if (sessionCookie?.value) {
      try {
        const sUser = JSON.parse(sessionCookie.value);
        if (body.name) sUser.salonName = body.name;
        if (body.ownerName) {
          sUser.ownerName = body.ownerName;
          sUser.name = body.ownerName;
        }
        if (body.adminEmail) sUser.email = body.adminEmail;
        if (body.slogan) sUser.slogan = body.slogan;
        if (body.primaryColor) sUser.primaryColor = body.primaryColor;

        const res = NextResponse.json(updated);
        res.cookies.set({
          name: "nailgestao_session",
          value: JSON.stringify(sUser),
          httpOnly: true,
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
        return res;
      } catch (e) {}
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
