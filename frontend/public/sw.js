// N'autorise que des chemins relatifs internes (évite l'ouverture d'une URL externe arbitraire)
function safeUrl(url) {
  if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) return url;
  return '/dashboard/commandes';
}

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Maadtime', {
      body: data.body || '',
      icon: '/logo.png',
      badge: '/logo.png',
      data: { url: safeUrl(data.url) },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = safeUrl(event.notification.data?.url);
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
