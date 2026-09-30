import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RECOVERY_SALON_ID = "67998370966";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios para acessar o sistema." }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // 1. Buscar usuário no banco de dados cadastrado pela Administradora
    let user: any = await prisma.user
      .findFirst({
        where: {
          OR: [
            { email: { equals: cleanEmail, mode: "insensitive" } },
            { email: { equals: email } }
          ]
        },
      })
      .catch(() => null);

    let salon: any = null;
    if (user?.salonId) {
      salon = await prisma.salon.findUnique({ where: { id: user.salonId } }).catch(() => null);
    }
    if (!salon) {
      salon = await prisma.salon.findFirst().catch(() => null);
    }

    const effectiveSalonId = salon?.id || user?.salonId || RECOVERY_SALON_ID;
    const effectiveSalonName = salon?.name || "Estúdio de Unhas Selma Gloor";

    if (user) {
      if (user.active === false) {
        return NextResponse.json(
          { error: "Este usuário encontra-se inativo no sistema. Entre em contato com a Administradora." },
          { status: 403 }
        );
      }

      // Validar a senha cadastrada pela administradora
      const storedPassword = (user.passwordHash || "").trim();
      if (storedPassword !== cleanPassword) {
        return NextResponse.json(
          { error: "Senha incorreta. Verifique a senha criada pela Administradora para o seu e-mail." },
          { status: 401 }
        );
      }

      const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "ADMINISTRADOR",
        salonId: effectiveSalonId,
        salonName: effectiveSalonName,
        avatarUrl: user.avatarUrl,
        subscriptionStatus: "ATIVO",
      };

      const response = NextResponse.json({ success: true, user: sessionUser });

      response.cookies.set({
        name: "nailgestao_session",
        value: JSON.stringify(sessionUser),
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // 2. Acesso Administradora Master Selma Gloor
    if (cleanEmail === "sfgloorwms078@gmail.com" || cleanEmail === "selma@studioluxe.com.br") {
      if (cleanPassword !== "0414" && cleanPassword !== "123456") {
        return NextResponse.json(
          { error: "Senha incorreta para a conta da Administradora." },
          { status: 401 }
        );
      }

      const sessionUser = {
        id: "usr-admin-master",
        name: "Selma Francyelle Gloor",
        email: cleanEmail,
        role: "ADMINISTRADOR",
        salonId: effectiveSalonId,
        salonName: effectiveSalonName,
        subscriptionStatus: "ATIVO",
      };

      const response = NextResponse.json({ success: true, user: sessionUser });

      response.cookies.set({
        name: "nailgestao_session",
        value: JSON.stringify(sessionUser),
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // Se o e-mail não estiver cadastrado pela administradora -> BLOQUEAR ACESSO!
    return NextResponse.json(
      { error: "Acesso negado: Este e-mail não está cadastrado no sistema. Somente e-mails e senhas cadastrados pela Administradora têm permissão de acesso." },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno no login." }, { status: 500 });
  }
}
