import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const simulateDaysLeftParam = searchParams.get("simulateDaysLeft");

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("nailgestao_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false, isDemo: true }, { status: 200 });
    }

    let sessionUser = JSON.parse(sessionCookie.value);

    // Buscar salão no banco
    let salon: any = await prisma.salon
      .findFirst()
      .catch(() => null);

    const now = new Date();
    let trialEndsAt: Date | null = null;

    // 1. Verificar se a data de expiração do teste já foi gravada na sessão ou no salão
    if (sessionUser.trialEndsAt) {
      const parsed = new Date(sessionUser.trialEndsAt);
      if (!isNaN(parsed.getTime())) trialEndsAt = parsed;
    }

    if (!trialEndsAt && salon?.trialEndsAt) {
      const parsed = new Date(salon.trialEndsAt);
      if (!isNaN(parsed.getTime())) trialEndsAt = parsed;
    }

    // 2. Se o salão tiver createdAt no banco, a data final do teste é obrigatoriamente createdAt + 7 dias
    if (!trialEndsAt && salon?.createdAt) {
      const createdDate = new Date(salon.createdAt);
      if (!isNaN(createdDate.getTime())) {
        trialEndsAt = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
    }

    // 3. Se ainda assim não houver data salva, definir 7 dias a partir de agora E PERSISTIR para não recalcular
    if (!trialEndsAt) {
      trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // Persistir na sessão para não ficar resetando para 7 dias em cada chamada
      sessionUser.trialEndsAt = trialEndsAt.toISOString();
      if (salon?.id) {
        prisma.salon.update({
          where: { id: salon.id },
          data: { trialEndsAt },
        }).catch(() => {});
      }
    }

    let isTrialExpired = false;
    let daysLeft = 7;

    // Se houver parâmetro de simulação para testes (ex: ?simulateDaysLeft=3 ou ?simulateDaysLeft=0)
    if (simulateDaysLeftParam !== null && !isNaN(Number(simulateDaysLeftParam))) {
      const simDays = Number(simulateDaysLeftParam);
      if (simDays <= 0) {
        isTrialExpired = true;
        daysLeft = 0;
      } else {
        isTrialExpired = false;
        daysLeft = Math.min(7, simDays);
      }
    } else {
      if (now.getTime() >= trialEndsAt.getTime()) {
        isTrialExpired = true;
        daysLeft = 0;
      } else {
        const diffTime = trialEndsAt.getTime() - now.getTime();
        daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }
    }

    const effectiveSalonName =
      (salon?.name && !salon.name.includes("Selma") && !salon.name.includes("Gloor") && salon.name !== "Studio Luxe Nail Designer")
        ? salon.name
        : sessionUser.salonName || salon?.name || "Meu Salão de Unhas";

    const effectiveOwnerName =
      (salon?.ownerName && salon.ownerName !== "Juliana Silva")
        ? salon.ownerName
        : sessionUser.ownerName || sessionUser.name || salon?.ownerName || "Administradora";

    return NextResponse.json({
      authenticated: true,
      user: {
        ...sessionUser,
        name: effectiveOwnerName,
        trialEndsAt: trialEndsAt.toISOString(),
      },
      salon: {
        ...(salon || {}),
        name: effectiveSalonName,
        ownerName: effectiveOwnerName,
        trialEndsAt: trialEndsAt.toISOString(),
      },
      isTrialExpired: isTrialExpired,
      trialDaysLeft: daysLeft,
      whatsappSupport: "5567992684748",
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, isDemo: true }, { status: 200 });
  }
}
