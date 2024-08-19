self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  // 서비스 워커가 설치되자마자 skipWaiting 호출
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.", event.data.text());
  const { title, body, icon, badge } = event.data.json();
  const options = {
    body,
    icon,
    badge,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] notificationclick");
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/");
      }),
  );
});
