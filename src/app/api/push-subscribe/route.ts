import { NextResponse } from "next/server";
import { PUBLIC_VAPID_KEY, webpush } from "@/lib/webpush";
import fs from "fs";
import path from "path";

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), "scratch", "push_subscriptions.json");

function getStoredSubscriptions(): any[] {
  try {
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) return [];
    const content = fs.readFileSync(SUBSCRIPTIONS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

function saveSubscriptions(subs: any[]) {
  try {
    const dir = path.dirname(SUBSCRIPTIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2));
  } catch (e) {
    console.error("Erro ao salvar push_subscriptions.json:", e);
  }
}

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

export async function sendWebPushToAll(title: string, message: string, url: string = "/agenda") {
  const currentSubs = getStoredSubscriptions();
  if (currentSubs.length === 0) return;

  const payload = JSON.stringify({ title, message, url });
  const validSubs: any[] = [];

  for (const sub of currentSubs) {
    try {
      await webpush.sendNotification(sub, payload);
      validSubs.push(sub);
    } catch (err: any) {
      // Remover inscricoes expiradas ou revogadas (HTTP 404 / 410)
      if (err.statusCode !== 404 && err.statusCode !== 410) {
        validSubs.push(sub);
      }
    }
  }

  if (validSubs.length !== currentSubs.length) {
    saveSubscriptions(validSubs);
  }
}
