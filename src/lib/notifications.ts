"use client";

export async function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registrado:", registration.scope);
      return registration;
    } catch (error) {
      console.error("Falha ao registrar Service Worker:", error);
    }
  }
  return null;
}

export async function requestNotificationPermission(): Promise<"granted" | "denied" | "default" | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await sendLocalPushNotification(
        "🔔 Pop-ups Ativados!",
        "Você receberá alertas instantâneos de novos agendamentos neste celular.",
        "/agenda"
      );
    }
    return permission;
  } catch (e) {
    console.error("Erro ao solicitar permissão de notificação:", e);
    return "denied";
  }
}

export async function sendLocalPushNotification(title: string, body: string, url: string = "/agenda") {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body,
            icon: "/icon.png",
            badge: "/icon.png",
            vibrate: [200, 100, 200],
            data: { url },
          } as any);
          return;
        }
      }
      new Notification(title, {
        body,
        icon: "/icon.png",
        data: { url },
      });
    } catch (e) {
      console.error("Erro ao disparar notificação local:", e);
    }
  }
}
