import { NextResponse } from "next/server";
import { PUBLIC_VAPID_KEY, webpush, getStoredSubscriptions, saveSubscriptions } from "@/lib/webpush";

export async function GET() {
  return NextResponse.json({ publicKey: PUBLIC_VAPID_KEY });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Push Subscription é obrigatório." }, { status: 400 });
    }

    const currentSubs = getStoredSubscriptions();
    const exists = currentSubs.some((s) => s.endpoint === subscription.endpoint);

    if (!exists) {
      currentSubs.push(subscription);
      saveSubscriptions(currentSubs);
    }

    // Disparar notificacao de boas-vindas para validar envio OS no celular
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "🔔 Pop-ups 24h Ativados!",
          message: "Você receberá notificações instantâneas de agendamentos no celular, mesmo com a tela bloqueada.",
          url: "/agenda",
        })
      );
    } catch (err: any) {
      console.warn("Aviso ao enviar push teste inicial:", err?.message || err);
    }

    return NextResponse.json({ success: true, count: currentSubs.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
