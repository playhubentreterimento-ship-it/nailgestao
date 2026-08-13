"use client";

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
    await sendLocalPushNotification(
      "🔔 Pop-ups Ativados!",
      "Você receberá alertas instantâneos de novos agendamentos neste celular.",
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

      // Método 1: Chamada direta via Service Worker Registration (compatível com Android e iOS PWA)
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

      // Método 2: Envio de mensagem para o controller do Service Worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          title,
          body,
          url,
        });
        return;
      }

      // Método 3: Fallback para Desktop (não usado em mobile pois new Notification lança erro no Android/iOS)
      if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        new Notification(title, {
          body,
          icon: "/icon.png",
          data: { url },
        });
      }
    } catch (e) {
      console.error("Erro ao disparar notificação local:", e);
    }
  }
}
