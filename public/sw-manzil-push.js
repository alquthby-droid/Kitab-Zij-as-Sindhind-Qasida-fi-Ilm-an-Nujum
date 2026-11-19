/* eslint-disable no-restricted-globals */
/**
 * Zij as-Sindhind - Background Service Worker Extension for PushManager & Manzil Ritual Alerts
 * Imported by Workbox Service Worker via workbox.importScripts
 */

const RITUAL_DB_NAME = 'zij_sindhind_push_db';
const RITUAL_STORE_NAME = 'scheduled_rituals';
const DEFAULT_ICON = '/pwa-192x192.png';

function openRitualDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(RITUAL_DB_NAME, 1);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(RITUAL_STORE_NAME)) {
        db.createObjectStore(RITUAL_STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveRitualsInIDB(rituals) {
  try {
    const db = await openRitualDB();
    const tx = db.transaction(RITUAL_STORE_NAME, 'readwrite');
    const store = tx.objectStore(RITUAL_STORE_NAME);
    store.clear();
    for (const item of rituals || []) {
      store.put(item);
    }
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

async function getRitualsFromIDB() {
  try {
    const db = await openRitualDB();
    const tx = db.transaction(RITUAL_STORE_NAME, 'readonly');
    const store = tx.objectStore(RITUAL_STORE_NAME);
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

function computeReminderMs(ritual) {
  if (!ritual || !ritual.dateISO || !ritual.risingTime) return null;
  const parts = String(ritual.dateISO).split('-').map((n) => parseInt(n, 10));
  const timeParts = String(ritual.risingTime).split(':').map((n) => parseInt(n, 10));
  if (parts.length !== 3 || timeParts.length !== 2) return null;
  const [y, m, d] = parts;
  const [hh, mm] = timeParts;
  if ([y, m, d, hh, mm].some((n) => Number.isNaN(n))) return null;
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  const offsetMin = Number(ritual.reminderMinutesBefore) || 0;
  return dt.getTime() - offsetMin * 60 * 1000;
}

async function showNativeManzilNotification(payload) {
  const title =
    payload.title ||
    `Terbit Manzil #${payload.manzilNumber || ''} (${payload.manzilTransliteration || 'Manzil'})`;
  const arabMelayu = payload.manzilArabMelayu ? ` · ${payload.manzilArabMelayu}` : '';
  const body =
    payload.body ||
    `${payload.ritualTitle || 'Waktu Amalan Manzil'}${arabMelayu} · Terbit ${
      payload.risingTime || ''
    }${payload.planetaryHour ? ` · ${payload.planetaryHour}` : ''}`;

  const options = {
    body,
    icon: payload.icon || DEFAULT_ICON,
    badge: payload.badge || DEFAULT_ICON,
    tag: payload.tag || `manzil-ritual-${payload.id || Date.now()}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 250],
    data: {
      url: payload.url || '/?tab=ritual',
      manzilNumber: payload.manzilNumber || null,
      ritualId: payload.id || null,
    },
    actions: [
      { action: 'open', title: 'Buka Penjadwal' },
      { action: 'dismiss', title: 'Tutup' },
    ],
  };

  // Support Android OS Notification Triggers API if available in browser
  if (payload.triggerTimestamp && typeof self.TimestampTrigger === 'function') {
    options.showTrigger = new self.TimestampTrigger(payload.triggerTimestamp);
  }

  return self.registration.showNotification(title, options);
}

async function checkAndTriggerDueRituals() {
  const rituals = await getRitualsFromIDB();
  const now = Date.now();
  for (const r of rituals) {
    if (!r.enabled) continue;
    const targetMs = computeReminderMs(r);
    if (!targetMs) continue;
    const risingMs = targetMs + (Number(r.reminderMinutesBefore) || 0) * 60 * 1000;
    if (now >= targetMs && now <= risingMs + 35 * 60 * 1000) {
      await showNativeManzilNotification({
        id: r.id,
        title: `Pengingat Manzil #${r.manzilNumber}: ${r.manzilTransliteration}`,
        ritualTitle: r.title,
        manzilNumber: r.manzilNumber,
        manzilArabMelayu: r.manzilArabMelayu || r.manzilArabic,
        manzilTransliteration: r.manzilTransliteration,
        risingTime: `${r.risingTime}–${r.windowEnd}`,
        planetaryHour: r.planetaryHour,
        tag: `manzil-${r.id}-${r.dateISO}-${r.risingTime}`,
      });
    }
  }
}

// Handle incoming Web Push events from PushManager
self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }

  event.waitUntil(
    showNativeManzilNotification({
      title: payload.title || 'Pengingat Terbit Manzil — Zij as-Sindhind',
      body: payload.body,
      manzilNumber: payload.manzilNumber,
      manzilTransliteration: payload.manzilTransliteration,
      manzilArabMelayu: payload.manzilArabMelayu,
      risingTime: payload.risingTime,
      planetaryHour: payload.planetaryHour,
      tag: payload.tag || 'manzil-push-alert',
      url: payload.url || '/?tab=ritual',
    })
  );
});

// Handle notification click: focus existing window or open app directly to Ritual Scheduler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || '/?tab=ritual';
  const manzilNumber = event.notification.data && event.notification.data.manzilNumber;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_RITUAL',
            manzilNumber: manzilNumber || null,
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});

// Background Sync & Periodic Background Sync support
self.addEventListener('sync', (event) => {
  if (event.tag === 'manzil-ritual-sync') {
    event.waitUntil(checkAndTriggerDueRituals());
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'manzil-ritual-check') {
    event.waitUntil(checkAndTriggerDueRituals());
  }
});

// Handle PushManager subscription rotation automatically
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' });
      }
    })
  );
});

// Receive ritual schedules & instant/triggered notification commands from app
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SYNC_RITUAL_SCHEDULES') {
    const rituals = Array.isArray(data.rituals) ? data.rituals : [];
    event.waitUntil(
      (async () => {
        await saveRitualsInIDB(rituals);
        // If TimestampTrigger is supported, pre-schedule upcoming rituals natively at OS level
        if (typeof self.TimestampTrigger === 'function') {
          const now = Date.now();
          for (const r of rituals) {
            if (!r.enabled) continue;
            const targetMs = computeReminderMs(r);
            if (targetMs && targetMs > now && targetMs - now <= 7 * 24 * 60 * 60 * 1000) {
              await showNativeManzilNotification({
                id: r.id,
                title: `Terbit Manzil #${r.manzilNumber}: ${r.manzilTransliteration}`,
                ritualTitle: r.title,
                manzilNumber: r.manzilNumber,
                manzilArabMelayu: r.manzilArabMelayu || r.manzilArabic,
                manzilTransliteration: r.manzilTransliteration,
                risingTime: `${r.risingTime}–${r.windowEnd}`,
                planetaryHour: r.planetaryHour,
                tag: `manzil-trigger-${r.id}-${r.dateISO}-${r.risingTime}`,
                triggerTimestamp: targetMs,
              });
            }
          }
        }
      })()
    );
  } else if (data.type === 'SHOW_RITUAL_NOTIFICATION' || data.type === 'TEST_PUSH_NOTIFICATION') {
    event.waitUntil(showNativeManzilNotification(data.payload || {}));
  }
});
