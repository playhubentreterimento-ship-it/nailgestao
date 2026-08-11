import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const professionals = await prisma.professional.findMany({
      where: { salonId: "default-salon" },
      orderBy: { name: "asc" },
    });

    const users = await prisma.user.findMany({
      where: { salonId: "default-salon" },
    });

    const enriched = professionals.map((p) => {
      const u = users.find((usr) => usr.id === p.userId || usr.email === p.email);
      return {
        ...p,
        userEmail: u?.email || p.email,
        userRole: u?.role || "PROFISSIONAL",
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, password, role = "PROFISSIONAL", color = "#E0A96D", commissionRatePercent = 40, bio } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Nome e Telefone da atendente são obrigatórios." }, { status: 400 });
    }

    let createdUser = null;
    if (email && password) {
      // Verificar se email já existe
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        createdUser = existingUser;
      } else {
        createdUser = await prisma.user.create({
          data: {
            salonId: "default-salon",
            name,
            email,
            passwordHash: password, // em prod seria hash bcrypt
            role,
            phone,
          },
        });
      }
    }

    const professional = await prisma.professional.create({
      data: {
        salonId: "default-salon",
        userId: createdUser?.id || null,
        name,
        phone,
        email: email || null,
        color,
        commissionRatePercent: Number(commissionRatePercent),
        bio: bio || "Nail Designer do salão",
      },
    });

    return NextResponse.json({ success: true, professional, user: createdUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, phone, email, password, color, commissionRatePercent, active } = body;

    if (!id) return NextResponse.json({ error: "ID da atendente é obrigatório." }, { status: 400 });

    const prof = await prisma.professional.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
        ...(color ? { color } : {}),
        ...(commissionRatePercent !== undefined ? { commissionRatePercent: Number(commissionRatePercent) } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {}),
      },
    });

    // Se forneceu nova senha/email, atualizar no User correspondente
    if (prof.userId && (email || password)) {
      await prisma.user.update({
        where: { id: prof.userId },
        data: {
          ...(name ? { name } : {}),
          ...(email ? { email } : {}),
          ...(password ? { passwordHash: password } : {}),
        },
      });
    }

    return NextResponse.json(prof);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
