/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// Listen to Push events for Streak Reminder
self.addEventListener("push", (event) => {
  let data: any = {};
  try {
    data = event.data?.json() ?? {};
  } catch (e) {
    data = { body: event.data?.text() };
  }

  const title = data.title || "🐾 Silo Reminder";
  const options = {
    body: data.body || "Jangan lupa selesaikan task kamu hari ini biar streak kamu nggak putus meow! 🔥",
    icon: "/assets/mascots/neko_greeting_login_1781150904124.png",
    badge: "/assets/mascots/neko_greeting_login_1781150904124.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle Notification Clicks (e.g. open the app)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window client is available, focus it.
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window client is open, open a new one.
      if (self.clients.openWindow) {
        return self.clients.openWindow('/dashboard');
      }
    })
  );
});
