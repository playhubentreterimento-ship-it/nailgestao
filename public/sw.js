self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Monitoramento em segundo plano no Service Worker (Roda continuamente mesmo com app minimizado no celular)
let swKnownIds = new Set();
let swInitial = true;

async function checkBackgroundAppointments() {
  try {
    const res = await fetch('/api/appointments');
    if (!res.ok) return;
    const apps = await res.json();
    if (!Array.isArray(apps)) return;

    const currentIds = new Set(apps.map((a) => a.id));

    if (!swInitial) {
      const newApps = apps.filter(
        (a) => !swKnownIds.has(a.id) && a.status !== 'CANCELADO' && a.status !== 'BLOQUEADO'
      );

      for (const app of newApps) {
        const title = '💅 NOVO AGENDAMENTO NO SALÃO!';
        const clientName = app.clientName || 'Cliente';
        const serviceName = app.services?.[0]?.serviceName || 'Procedimento';
        const body = `${clientName} agendou ${serviceName} para ${app.date ? app.date.split('-').reverse().join('/') : ''} às ${app.startTime}h`;

        self.registration.showNotification(title, {
          body,
          icon: '/icon.png',
          badge: '/icon.png',
          vibrate: [200, 100, 200],
          tag: 'nail-app-' + app.id,
          renotify: true,
          data: { url: '/agenda' },
        });
      }
    } else {
      swInitial = false;
    }

    swKnownIds = currentIds;
  } catch (e) {
    // Ignorar falhas temporarias de rede
  }
}

// Executar checagem contínua a cada 6 segundos no Service Worker
setInterval(checkBackgroundAppointments, 6000);

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: '💅 NAILGESTÃO - Notificação', message: event.data ? event.data.text() : '' };
  }

  const title = data.title || '💅 NAILGESTÃO - Novo Agendamento!';
  const options = {
    body: data.message || 'Um novo agendamento foi registrado no salão.',
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    tag: 'nailgestao-push-' + Date.now(),
    renotify: true,
    data: { url: data.url || '/agenda' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const title = event.data.title || '💅 NAILGESTÃO - Alerta';
    const options = {
      body: event.data.body || '',
      icon: '/icon.png',
      badge: '/icon.png',
      vibrate: [200, 100, 200],
      tag: 'nailgestao-msg-' + Date.now(),
      renotify: true,
      data: { url: event.data.url || '/agenda' },
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/agenda';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
