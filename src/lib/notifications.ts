"use client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      console.log("Service Worker registrado com sucesso:", registration.scope);
      return registration;
    } catch (error) {
      console.error("Falha ao registrar Service Worker:", error);
    }
  }
  return null;
}

export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export function isPWA(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
}

export async function subscribeUserToPush() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const res = await fetch("/api/push-subscribe");
    const { publicKey } = await res.json();

    if (!publicKey) return null;

    const convertedKey = urlBase64ToUint8Array(publicKey);

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    await fetch("/api/push-subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub }),
    });

    console.log("Push Subscription VAPID registrada com sucesso!");
    return sub;
  } catch (e) {
    console.error("Erro ao registrar Push Subscription VAPID:", e);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<"granted" | "denied" | "default" | "unsupported"> {
  if (typeof window === "undefined") {
    return "unsupported";
  }

  // No iOS Safari, notificações Web Push só são permitidas se o app estiver adicionado à Tela de Início (PWA)
  if (isIOS() && !isPWA()) {
    alert(
      "📲 Para ativar Notificações Pop-up no iPhone (iOS):\n\n" +
      "1. Toque no botão de Compartilhar (ícone com quadrado e seta) no Safari.\n" +
      "2. Selecione 'Adicionar à Tela de Início'.\n" +
      "3. Abra o aplicativo diretamente da tela inicial do iPhone e clique em 'Ativar Pop-up'."
    );
  }

  if (!("Notification" in window)) {
    return "unsupported";
  }

  await registerServiceWorker();

  let permission: NotificationPermission = Notification.permission;
  if (permission !== "granted") {
    try {
      permission = await Notification.requestPermission();
    } catch (e) {
      console.error("Erro ao solicitar permissão de notificação:", e);
      return "denied";
    }
  }

  if (permission === "granted") {
    await subscribeUserToPush();
    await sendLocalPushNotification(
      "🔔 Pop-ups VAPID 24h Ativados!",
      "Seu celular agora receberá alertas instantâneos de novos agendamentos a qualquer momento.",
      "/agenda"
    );
  }

  return permission;
}

export async function sendLocalPushNotification(title: string, body: string, url: string = "/agenda") {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    try {
      let reg: ServiceWorkerRegistration | undefined = undefined;

      if ("serviceWorker" in navigator) {
        reg = await navigator.serviceWorker.getRegistration("/sw.js");
        if (!reg) {
          reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        }
      }

      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: "/icon.png",
          badge: "/icon.png",
          tag: "nailgestao-pop-" + Date.now(),
          renotify: true,
          vibrate: [200, 100, 200],
          data: { url },
        } as any);
        return;
      }
    } catch (e) {
      console.error("Erro ao disparar notificação local:", e);
    }
  }
}
