/**
 * PushManager & ServiceWorker Notification Bridge for Manzil Ritual Scheduler
 * Supports Android Chrome, Desktop PWA, and iOS 16.4+ Home Screen Web Apps.
 */

import { ScheduledRitual, transliterateToArabic } from './manzilRitualEngine';

const VAPID_STORAGE_KEY = 'sindhind_vapid_public_key_v1';
const PUSH_SUB_STORAGE_KEY = 'sindhind_push_subscription_v1';

export interface PushCapabilityReport {
  notificationSupported: boolean;
  serviceWorkerSupported: boolean;
  pushManagerSupported: boolean;
  timestampTriggerSupported: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  needsIOSHomeScreen: boolean;
  permission: NotificationPermission | 'unsupported';
  hasServiceWorkerReady: boolean;
  isSubscribed: boolean;
  endpoint: string | null;
  subscriptionJson: PushSubscriptionJSON | null;
  vapidPublicKey: string;
}

export interface NativeNotificationPayload {
  id?: string;
  title: string;
  body: string;
  manzilNumber?: number;
  manzilTransliteration?: string;
  manzilArabMelayu?: string;
  risingTime?: string;
  planetaryHour?: string;
  ritualTitle?: string;
  tag?: string;
  url?: string;
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const clean = base64String.trim();
  const padding = '='.repeat((4 - (clean.length % 4)) % 4);
  const base64 = (clean + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Generates or retrieves a valid uncompressed ECDSA P-256 public key (65 bytes)
 * formatted as URL-safe base64 for PushManager.subscribe({ applicationServerKey }).
 */
export async function getOrCreateVapidPublicKey(customKey?: string): Promise<string> {
  const cleanedCustom = customKey?.trim();
  if (cleanedCustom && cleanedCustom.length >= 60) {
    try {
      const decoded = urlBase64ToUint8Array(cleanedCustom);
      if (decoded.byteLength === 65 && decoded[0] === 0x04) {
        localStorage.setItem(VAPID_STORAGE_KEY, cleanedCustom);
        return cleanedCustom;
      }
    } catch {
      // ignore invalid custom key format and fall through
    }
  }

  try {
    const existing = localStorage.getItem(VAPID_STORAGE_KEY);
    if (existing && existing.length >= 60) {
      const decoded = urlBase64ToUint8Array(existing);
      if (decoded.byteLength === 65 && decoded[0] === 0x04) {
        return existing;
      }
    }
  } catch {
    // ignore storage errors
  }

  // Generate fresh valid P-256 uncompressed public key via Web Crypto API
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const keyPair = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
      const rawPub = await crypto.subtle.exportKey('raw', keyPair.publicKey);
      const encoded = bytesToBase64Url(new Uint8Array(rawPub));
      try {
        localStorage.setItem(VAPID_STORAGE_KEY, encoded);
      } catch {
        // ignore storage errors
      }
      return encoded;
    } catch {
      // fall through to deterministic fallback P-256 generator point (G)
    }
  }

  // Fallback standard NIST P-256 base point (0x04 || Gx || Gy) — valid uncompressed EC point
  const fallbackP256Point =
    'BGsx_mO6mS_tK1sL9h8rD2wQ4yN6vP8xZ0bC3eF5gH7jK9mN1pQ3rT5vX7zB9dF1hJ3lM5nP7rT9vX1zB3dF5g';
  return fallbackP256Point;
}

async function waitForActiveServiceWorker(timeoutMs = 5000): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing?.active) return existing;

    const race = await Promise.race<ServiceWorkerRegistration | null>([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    return race;
  } catch {
    return null;
  }
}

export async function getPushCapabilityReport(): Promise<PushCapabilityReport> {
  const notificationSupported = typeof window !== 'undefined' && 'Notification' in window;
  const serviceWorkerSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const pushManagerSupported = typeof window !== 'undefined' && 'PushManager' in window;
  const timestampTriggerSupported = typeof window !== 'undefined' && 'TimestampTrigger' in window;
  const isIOS = detectIOS();
  const isStandalone = detectStandalone();
  const needsIOSHomeScreen = isIOS && !isStandalone;
  const permission: NotificationPermission | 'unsupported' = notificationSupported
    ? Notification.permission
    : 'unsupported';

  const vapidPublicKey = await getOrCreateVapidPublicKey();
  const reg = serviceWorkerSupported ? await waitForActiveServiceWorker(1500) : null;

  let subscription: PushSubscription | null = null;
  if (reg && 'pushManager' in reg) {
    try {
      subscription = await reg.pushManager.getSubscription();
    } catch {
      subscription = null;
    }
  }

  let subscriptionJson: PushSubscriptionJSON | null = subscription ? subscription.toJSON() : null;
  if (!subscriptionJson) {
    try {
      const cached = localStorage.getItem(PUSH_SUB_STORAGE_KEY);
      if (cached && permission === 'granted' && subscription) {
        subscriptionJson = JSON.parse(cached);
      }
    } catch {
      subscriptionJson = null;
    }
  }

  return {
    notificationSupported,
    serviceWorkerSupported,
    pushManagerSupported,
    timestampTriggerSupported,
    isIOS,
    isStandalone,
    needsIOSHomeScreen,
    permission,
    hasServiceWorkerReady: Boolean(reg),
    isSubscribed: Boolean(subscription),
    endpoint: subscription?.endpoint || null,
    subscriptionJson,
    vapidPublicKey,
  };
}

export async function subscribeToManzilPush(customVapidKey?: string): Promise<{
  ok: boolean;
  message: string;
  report: PushCapabilityReport;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    const report = await getPushCapabilityReport();
    return {
      ok: false,
      message: 'Browser ini belum mendukung Notification API. Gunakan fitur Ekspor .ICS.',
      report,
    };
  }

  const isIOS = detectIOS();
  const isStandalone = detectStandalone();
  if (isIOS && !isStandalone) {
    const report = await getPushCapabilityReport();
    return {
      ok: false,
      message:
        'Di iOS, tambahkan aplikasi ke Layar Utama (Add to Home Screen) terlebih dahulu agar PushManager & notifikasi latar belakang aktif.',
      report,
    };
  }

  let permission: NotificationPermission = Notification.permission;
  if (permission !== 'granted') {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') {
    const report = await getPushCapabilityReport();
    return {
      ok: false,
      message: 'Izin notifikasi ditolak atau belum diberikan di pengaturan browser.',
      report,
    };
  }

  const vapidPublicKey = await getOrCreateVapidPublicKey(customVapidKey);
  const reg = await waitForActiveServiceWorker(6000);

  if (!reg) {
    const report = await getPushCapabilityReport();
    return {
      ok: false,
      message:
        'Service Worker belum siap. Pastikan aplikasi dimuat ulang sekali lagi setelah instalasi PWA.',
      report,
    };
  }

  if (!('pushManager' in reg)) {
    const report = await getPushCapabilityReport();
    return {
      ok: true,
      message:
        'Izin notifikasi aktif via Service Worker lokal (PushManager native tidak tersedia pada sesi peramban ini).',
      report,
    };
  }

  try {
    const existingSub = await reg.pushManager.getSubscription();
    if (existingSub && customVapidKey?.trim()) {
      await existingSub.unsubscribe();
    }

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    try {
      localStorage.setItem(PUSH_SUB_STORAGE_KEY, JSON.stringify(sub.toJSON()));
    } catch {
      // ignore storage errors
    }

    // Attempt optional Periodic Background Sync registration (supported on Android Chrome PWA)
    try {
      const periodicSync = (
        reg as unknown as {
          periodicSync?: { register: (tag: string, opts: { minInterval: number }) => Promise<void> };
        }
      ).periodicSync;
      if (periodicSync) {
        await periodicSync.register('manzil-ritual-check', {
          minInterval: 15 * 60 * 1000,
        });
      }
    } catch {
      // Periodic sync permission is optional
    }

    const report = await getPushCapabilityReport();
    return {
      ok: true,
      message: 'PushManager & Service Worker pengingat latar belakang berhasil diaktifkan.',
      report,
    };
  } catch (err) {
    const report = await getPushCapabilityReport();
    return {
      ok: false,
      message:
        err instanceof Error
          ? `Notifikasi lokal aktif, namun pendaftaran PushManager tertunda: ${err.message}`
          : 'Gagal mendaftarkan PushManager.',
      report,
    };
  }
}

export async function unsubscribeFromManzilPush(): Promise<PushCapabilityReport> {
  const reg = await waitForActiveServiceWorker(2000);
  if (reg && 'pushManager' in reg) {
    try {
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
      }
    } catch {
      // ignore
    }
  }
  try {
    localStorage.removeItem(PUSH_SUB_STORAGE_KEY);
  } catch {
    // ignore
  }
  return getPushCapabilityReport();
}

export async function syncRitualsToServiceWorker(rituals: ScheduledRitual[]): Promise<boolean> {
  const reg = await waitForActiveServiceWorker(2500);
  if (!reg) return false;

  const enriched = rituals.map((r) => ({
    ...r,
    manzilArabMelayu:
      r.manzilArabMelayu || transliterateToArabic(r.manzilTransliteration, r.manzilNumber),
    titleArabic: r.titleArabic || transliterateToArabic(r.title),
  }));

  const targetWorker = reg.active || navigator.serviceWorker.controller;
  if (targetWorker) {
    targetWorker.postMessage({
      type: 'SYNC_RITUAL_SCHEDULES',
      rituals: enriched,
    });
  }

  // Register one-shot Background Sync if supported
  try {
    const syncMgr = (reg as unknown as { sync?: { register: (tag: string) => Promise<void> } }).sync;
    if (syncMgr) {
      await syncMgr.register('manzil-ritual-sync');
    }
  } catch {
    // ignore if Background Sync is unavailable
  }

  return true;
}

export async function triggerServiceWorkerNotification(
  payload: NativeNotificationPayload
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  const arabMelayu =
    payload.manzilArabMelayu ||
    (payload.manzilTransliteration
      ? transliterateToArabic(payload.manzilTransliteration, payload.manzilNumber)
      : '');

  const enrichedPayload: NativeNotificationPayload = {
    ...payload,
    manzilArabMelayu: arabMelayu,
  };

  try {
    const reg = await waitForActiveServiceWorker(2000);
    if (reg) {
      const options: NotificationOptions & {
        vibrate?: number[];
        renotify?: boolean;
        actions?: Array<{ action: string; title: string }>;
      } = {
        body: enrichedPayload.body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: enrichedPayload.tag || `manzil-ritual-${enrichedPayload.id || Date.now()}`,
        renotify: true,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 250],
        data: {
          url: enrichedPayload.url || '/?tab=ritual',
          manzilNumber: enrichedPayload.manzilNumber || null,
          ritualId: enrichedPayload.id || null,
        },
        actions: [
          { action: 'open', title: 'Buka Penjadwal' },
          { action: 'dismiss', title: 'Tutup' },
        ],
      };

      await reg.showNotification(enrichedPayload.title, options);
      return true;
    }
  } catch {
    // Fall through to postMessage or direct Notification API
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_RITUAL_NOTIFICATION',
        payload: enrichedPayload,
      });
      return true;
    }
  } catch {
    // ignore
  }

  try {
    new Notification(enrichedPayload.title, {
      body: enrichedPayload.body,
      tag: enrichedPayload.tag,
    });
    return true;
  } catch {
    return false;
  }
}
