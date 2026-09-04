import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatPhoneWithDDI } from "@/lib/whatsapp/provider";

let memoryBlockedDates: string = "[]";

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
    let salon = await prisma.salon.findFirst().catch(() => null);

    const professionals = await prisma.professional.findMany({
      orderBy: { createdAt: "asc" },
    }).catch(() => []);

    // Buscar usuário Administrador Master
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMINISTRADOR" },
    }).catch(() => null);

    let realPhone = "";

    // 1. Tentar WhatsApp do salão se não for número de teste
    if (salon?.whatsapp && !isDummyPhone(salon.whatsapp)) {
      realPhone = salon.whatsapp;
    }
    // 2. Tentar Telefone comercial do salão se não for número de teste
    else if (salon?.phone && !isDummyPhone(salon.phone)) {
      realPhone = salon.phone;
    }
    // 3. Tentar Telefone das profissionais cadastradas
    else {
      const validProf = (professionals || []).find((p) => p.phone && !isDummyPhone(p.phone));
      if (validProf) {
        realPhone = validProf.phone;
      }
    }

    const activeWhatsApp = realPhone ? formatPhoneWithDDI(realPhone) : "";

    const defaultSalonObj = {
      id: "default-salon",
      name: "Studio Selma Gloor",
      ownerName: "Selma Gloor",
      slogan: "Especialista em Unhas & Nails Art de Alta Performance",
      logoUrl: "/salon-logo-official.png",
      phone: "(67) 99963-5783",
      whatsapp: "5567999635783",
      primaryColor: "#6B1615",
      creditFeePercent: 0,
      debitFeePercent: 0,
      requireDeposit: false,
      defaultDepositAmount: 0,
      blockedDates: memoryBlockedDates,
    };

    return NextResponse.json({
      ...defaultSalonObj,
      ...(salon || {}),
      creditFeePercent: 0,
      debitFeePercent: 0,
      requireDeposit: false,
      defaultDepositAmount: 0,
      blockedDates: salon?.blockedDates || memoryBlockedDates || "[]",
      activeWhatsApp: activeWhatsApp || "5567999635783",
      adminEmail: adminUser?.email || "sfgloorwms078@gmail.com",
    });
  } catch (error: any) {
    return NextResponse.json({
      id: "default-salon",
      name: "Studio Selma Gloor",
      ownerName: "Selma Gloor",
      slogan: "Especialista em Unhas & Nails Art de Alta Performance",
      logoUrl: "/salon-logo-official.png",
      phone: "(67) 99963-5783",
      whatsapp: "5567999635783",
      activeWhatsApp: "5567999635783",
      primaryColor: "#6B1615",
      creditFeePercent: 0,
      debitFeePercent: 0,
      requireDeposit: false,
      defaultDepositAmount: 0,
      blockedDates: memoryBlockedDates || "[]",
      adminEmail: "sfgloorwms078@gmail.com",
    });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    let salon = await prisma.salon.findFirst().catch(() => null);

    const rawPhone = body.whatsapp || body.phone;
    const formattedWhatsApp = rawPhone ? formatPhoneWithDDI(rawPhone) : undefined;

    if (body.blockedDates !== undefined) {
      const bStr = typeof body.blockedDates === "string" ? body.blockedDates : JSON.stringify(body.blockedDates);
      memoryBlockedDates = bStr;
    }

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
      ...(body.blockedDates !== undefined ? { blockedDates: typeof body.blockedDates === "string" ? body.blockedDates : JSON.stringify(body.blockedDates) } : {}),
    };

    if (body.ownerName !== undefined) {
      updateData.ownerName = body.ownerName;
    }

    let updated: any = null;
    const targetId = salon?.id || "default-salon";

    try {
      if (salon) {
        updated = await prisma.salon.update({
          where: { id: salon.id },
          data: updateData,
        });
      } else {
        updated = await prisma.salon.upsert({
          where: { id: targetId },
          update: updateData,
          create: {
            id: targetId,
            name: body.name || "Studio Selma Gloor",
            ownerName: body.ownerName || "Juliana Silva",
            slogan: body.slogan || "Seja Bem-Vinda",
            logoUrl: body.logoUrl || null,
            phone: body.phone || null,
            whatsapp: formattedWhatsApp || "",
            address: body.address || null,
            primaryColor: body.primaryColor || "#E0A96D",
          },
        });
      }
    } catch (err: any) {
      const fallbackData = { ...updateData };
      delete fallbackData.ownerName;
      delete fallbackData.blockedDates;

      try {
        if (salon) {
          updated = await prisma.salon.update({
            where: { id: salon.id },
            data: fallbackData,
          });
        } else {
          updated = await prisma.salon.upsert({
            where: { id: "default-salon" },
            update: fallbackData,
            create: {
              id: "default-salon",
              name: body.name || "Studio Selma Gloor",
              slogan: body.slogan || "Seja Bem-Vinda",
              logoUrl: body.logoUrl || null,
              phone: body.phone || null,
              whatsapp: formattedWhatsApp || "",
              address: body.address || null,
              primaryColor: body.primaryColor || "#E0A96D",
            },
          });
        }
      } catch (err2: any) {
        updated = salon || {
          id: "default-salon",
          name: "Studio Selma Gloor",
          ownerName: "Selma Gloor",
        };
      }
    }

    // Se informou email ou senha para a Administradora Master, atualizar usuário no banco!
    if (body.adminEmail || body.adminPassword) {
      const adminEmailToUse = body.adminEmail ? body.adminEmail.trim().toLowerCase() : "juliana@studioluxe.com.br";
      const existingAdmin = await prisma.user.findFirst({
        where: { role: "ADMINISTRADOR" },
      }).catch(() => null);

      if (existingAdmin) {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: {
            email: adminEmailToUse,
            ...(body.adminPassword && body.adminPassword.trim() !== "" ? { passwordHash: body.adminPassword.trim() } : {}),
            ...(body.ownerName ? { name: body.ownerName } : {}),
          },
        }).catch(() => {});
      } else {
        await prisma.user.create({
          data: {
            id: "usr-admin-master",
            salonId: "default-salon",
            name: body.ownerName || "Juliana Silva (Proprietária)",
            email: adminEmailToUse,
            passwordHash: body.adminPassword && body.adminPassword.trim() !== "" ? body.adminPassword.trim() : "123456",
            role: "ADMINISTRADOR",
            active: true,
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      ...(updated || {}),
      blockedDates: body.blockedDates !== undefined
        ? (typeof body.blockedDates === "string" ? body.blockedDates : JSON.stringify(body.blockedDates))
        : (updated?.blockedDates || memoryBlockedDates || "[]"),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      blockedDates: memoryBlockedDates || "[]",
    });
  }
}
