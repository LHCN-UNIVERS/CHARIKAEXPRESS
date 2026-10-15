// Service worker of the team space: shows a notification when the server sends a push (new request).
// Pushes carry no data: we ask the server what arrived (the team session cookie goes with the request).
// No offline cache on purpose: the team space must always show fresh data.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  e.waitUntil((async () => {
    let n = { title: 'Charika Express', body: 'Nouvelle demande reçue', url: '/admin.html' };
    try {
      const r = await fetch('/api/admin/push-latest', { credentials: 'include', cache: 'no-store' });
      if (r.ok) n = { ...n, ...(await r.json()) };
    } catch (err) {}
    await self.registration.showNotification(n.title, { body: n.body, icon: '/icon-192.png', badge: '/icon-192.png', tag: 'ce-new', renotify: true, data: { url: n.url } });
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || '/admin.html', self.location.origin).href;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const w = wins.find(c => new URL(c.url).pathname.startsWith('/admin'));
    if (w) { await w.focus(); return w.navigate(url); }
    return self.clients.openWindow(url);
  })());
});
