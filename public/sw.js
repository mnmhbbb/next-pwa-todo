self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing Service Worker...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating Service Worker...");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.", event.data.text());
  const { title, body, icon, badge, link } = event.data.json();
  const options = {
    body,
    icon,
    badge,
    data: { link },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] notificationclick");
  event.notification.close();

  // notification data에서 link 가져오기
  const link = event.notification.data?.link || "/push";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(link);
      }),
  );
});
