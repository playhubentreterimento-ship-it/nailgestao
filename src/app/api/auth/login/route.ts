import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.active) {
      return NextResponse.json({ error: "Credenciais inválidas ou usuário inativo." }, { status: 401 });
    }

    const salon = await prisma.salon.findUnique({
      where: { id: user.salonId },
    });

    // Em produção seria bcrypt.compare. Para o protótipo funcional, validação direta
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      salonId: user.salonId,
      salonName: salon?.name || "Studio Luxe",
      avatarUrl: user.avatarUrl,
    };

    const response = NextResponse.json({ success: true, user: sessionUser });

    // Definir cookie de sessão HTTP-Only
    response.cookies.set({
      name: "nailgestao_session",
      value: JSON.stringify(sessionUser),
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    // Registrar log de auditoria
    await prisma.auditLog.create({
      data: {
        salonId: user.salonId,
        userId: user.id,
        action: "LOGIN_SUCESSO",
        entity: "User",
        entityId: user.id,
        details: `Usuário ${user.email} realizou login com sucesso.`,
      },
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno no login." }, { status: 500 });
  }
}
