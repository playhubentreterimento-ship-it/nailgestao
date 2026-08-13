self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

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
    tag: 'nailgestao-push',
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
