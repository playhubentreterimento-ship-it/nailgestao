import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const RECOVERY_SALON_ID = "67998370966";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("nailgestao_session");

    let sessionUser: any = null;
    if (sessionCookie?.value) {
      try {
        sessionUser = JSON.parse(sessionCookie.value);
      } catch (e) {
        sessionUser = null;
      }
    }

    // 1. Obter salão real
    let salon: any = await prisma.salon
      .findUnique({ where: { id: sessionUser?.salonId || RECOVERY_SALON_ID } })
      .catch(() => null);

    if (!salon) {
      salon = await prisma.salon.findFirst().catch(() => null);
    }

    const effectiveSalonId = salon?.id || RECOVERY_SALON_ID;
    const effectiveSalonName = salon?.name || "Estúdio de Unhas Selma Gloor";
    const effectiveOwnerName = salon?.ownerName || "Selma Francyelle Gloor";

    // Se não houver sessão ativa, retornar authenticated: false
    if (!sessionUser) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        salon: {
          id: effectiveSalonId,
          name: effectiveSalonName,
          ownerName: effectiveOwnerName,
          phone: salon?.phone || "(67) 99837-0966",
          whatsapp: salon?.whatsapp || "5567998370966",
          subscriptionStatus: "ATIVO",
        },
        trialDaysLeft: null,
        isTrialExpired: false,
        whatsappSupport: "5567998370966",
      });
    }

    return NextResponse.json({
      authenticated: true,
      isDemo: false,
      user: {
        id: sessionUser.id || "usr-admin-master",
        name: sessionUser.name || effectiveOwnerName,
        email: sessionUser.email || "sfgloorwms078@gmail.com",
        role: sessionUser.role || "ADMINISTRADOR",
        salonId: effectiveSalonId,
        salonName: effectiveSalonName,
        avatarUrl: sessionUser.avatarUrl || null,
      },
      salon: {
        ...(salon || {}),
        id: effectiveSalonId,
        name: effectiveSalonName,
        ownerName: effectiveOwnerName,
        phone: salon?.phone || "(67) 99837-0966",
        whatsapp: salon?.whatsapp || "5567998370966",
        subscriptionStatus: "ATIVO",
      },
      trialDaysLeft: null,
      isTrialExpired: false,
      whatsappSupport: "5567998370966",
    });
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      salon: null,
    });
  }
}
