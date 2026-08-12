import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Tentar buscar no banco pelo email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanEmail } },
          { email: { equals: email } }
        ]
      },
    });

    // Tentar buscar o salão para comparar adminEmail cadastrado
    const salon = await prisma.salon.findFirst().catch(() => null);
    const configuredAdminEmail = (salon as any)?.adminEmail?.trim().toLowerCase();

    // Se for e-mail master cadastrado ou e-mail padrão e não constar no banco, garantir o acesso Master!
    if (!user && (
      cleanEmail === "juliana@studioluxe.com.br" ||
      cleanEmail === "admin@nailgestao.com" ||
      cleanEmail === "admin" ||
      (configuredAdminEmail && cleanEmail === configuredAdminEmail)
    )) {
      user = {
        id: "usr-admin-default",
        salonId: "default-salon",
        name: salon?.ownerName || "Administradora Master",
        email: cleanEmail,
        passwordHash: "123456",
        role: "ADMINISTRADOR",
        phone: "(11) 98765-4321",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        active: true,
        createdAt: new Date(),
      };
    }

    if (!user || !user.active) {
      return NextResponse.json({ error: "Credenciais inválidas. Verifique seu e-mail cadastrado." }, { status: 401 });
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      salonId: user.salonId,
      salonName: "Studio Luxe",
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

    // Registrar log de auditoria se banco estiver ativo
    try {
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
    } catch (e) {}

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno no login." }, { status: 500 });
  }
}
