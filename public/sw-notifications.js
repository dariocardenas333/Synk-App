/* AlaMano Service Worker notification & push handler */

self.addEventListener('push', (event) => {
  let payload = {
    title: 'AlaMano',
    body: 'Tenés un nuevo mensaje o novedad en tus chats.',
    conversationId: '',
    tag: 'alamano-push',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = {
        title: parsed.title || payload.title,
        body: parsed.body || payload.body,
        conversationId: parsed.conversationId || '',
        tag: parsed.tag || payload.tag,
      };
    } catch {
      const text = event.data.text();
      if (text) payload.body = text;
    }
  }

  const targetUrl = payload.conversationId
    ? `/?conversationId=${encodeURIComponent(payload.conversationId)}`
    : '/';

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      tag: payload.tag,
      renotify: true,
      silent: false,
      data: {
        conversationId: payload.conversationId,
        url: targetUrl,
      },
    })
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'SHOW_NOTIFICATION') return;

  const conversationId = data.conversationId || '';
  const targetUrl = conversationId
    ? `/?conversationId=${encodeURIComponent(conversationId)}`
    : '/';

  event.waitUntil(
    self.registration.showNotification(data.title || 'AlaMano', {
      body: data.body || 'Nuevo mensaje recibido',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'alamano-chat',
      renotify: true,
      silent: false,
      data: {
        conversationId,
        url: targetUrl,
      },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const conversationId = data.conversationId || '';
  const targetUrl = data.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus().then((focused) => {
              if (focused && conversationId) {
                focused.postMessage({
                  type: 'OPEN_CONVERSATION',
                  conversationId,
                });
              }
              return focused;
            });
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return undefined;
      })
  );
});
