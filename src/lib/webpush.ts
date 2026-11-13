import webpush from "web-push";
import fs from "fs";
import path from "path";

export const PUBLIC_VAPID_KEY =
  "BEk2Dbi-FF1J64luOs4nM8XwTqAI2IV4rsSh2se6V0ETWtYAHuhNsd6UJjUNMyADVQxUigxkhfKrWF-LbW5Ygwk";

export const PRIVATE_VAPID_KEY = "RrhTneSTKbuVztermqlWZUgFqOqzBhPdUtg8Kz3GogI";

webpush.setVapidDetails(
  "mailto:atendimento@nailgestao.com.br",
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

export const SUBSCRIPTIONS_FILE = path.join(process.cwd(), "scratch", "push_subscriptions.json");

export function getStoredSubscriptions(): any[] {
  try {
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) return [];
    const content = fs.readFileSync(SUBSCRIPTIONS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

export function saveSubscriptions(subs: any[]) {
  try {
    const dir = path.dirname(SUBSCRIPTIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2));
  } catch (e) {
    console.error("Erro ao salvar push_subscriptions.json:", e);
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
      if (err.statusCode !== 404 && err.statusCode !== 410) {
        validSubs.push(sub);
      }
    }
  }

  if (validSubs.length !== currentSubs.length) {
    saveSubscriptions(validSubs);
  }
}

export { webpush };
