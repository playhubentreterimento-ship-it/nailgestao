import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("nailgestao_session");

    if (!sessionCookie || !sessionCookie.value) {
      // Se não houver cookie, retornar o usuário padrão admin da demonstração
      const admin = await prisma.user.findFirst({ where: { role: "ADMINISTRADOR" } });
      const salon = await prisma.salon.findFirst();

      if (admin && salon) {
        return NextResponse.json({
          authenticated: true,
          user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            salonId: salon.id,
            salonName: salon.name,
            avatarUrl: admin.avatarUrl,
          },
        });
      }

      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const sessionUser = JSON.parse(sessionCookie.value);
    return NextResponse.json({ authenticated: true, user: sessionUser });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
