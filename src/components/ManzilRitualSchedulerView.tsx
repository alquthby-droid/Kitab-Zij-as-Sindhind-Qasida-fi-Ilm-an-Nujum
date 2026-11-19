import React, { useState, useMemo, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  Calendar,
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Sparkles,
  Plus,
  Trash2,
  Download,
  Check,
  MapPin,
  BookmarkPlus,
  Volume2,
  ArrowUpDown,
  Moon,
  Radio,
  Copy,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  RITUAL_CATEGORIES,
  RitualCategoryId,
  ManzilRisingSchedule,
  ScheduledRitual,
  calculateDailyManzilRitualSchedules,
  loadScheduledRituals,
  saveScheduledRituals,
  getRitualReminderTargetMs,
  playRitualChime,
  exportRitualsToIcs,
  transliterateToArabic,
} from '../lib/manzilRitualEngine';
import {
  PushCapabilityReport,
  getPushCapabilityReport,
  subscribeToManzilPush,
  unsubscribeFromManzilPush,
  syncRitualsToServiceWorker,
  triggerServiceWorkerNotification,
} from '../lib/pushNotificationManager';
import { HistoricalDateInfo } from '../types';

interface ManzilRitualSchedulerViewProps {
  currentDateInfo: HistoricalDateInfo;
  observerLocation: {
    latitude: number;
    longitude: number;
    name: string;
  };
  theme: 'night' | 'parchment';
  onAnnotate?: (title: string, content: string) => void;
  onSchedulesChanged?: () => void;
}

const TIMEZONE_PRESETS = [
  { label: 'Otomatis Perangkat', value: 'device' },
  { label: 'WIB (UTC+7)', value: '7' },
  { label: 'WITA (UTC+8)', value: '8' },
  { label: 'WIT (UTC+9)', value: '9' },
  { label: 'Makkah / Baghdad (UTC+3)', value: '3' },
  { label: 'UTC (UTC+0)', value: '0' },
];

export const ManzilRitualSchedulerView: React.FC<ManzilRitualSchedulerViewProps> = ({
  currentDateInfo,
  observerLocation,
  theme,
  onAnnotate,
  onSchedulesChanged,
}) => {
  const isNight = theme === 'night';

  // Target date (defaults to active app date)
  const [dateISO, setDateISO] = useState<string>(() => {
    const g = currentDateInfo.gregorian;
    return `${String(g.year).padStart(4, '0')}-${String(g.month).padStart(2, '0')}-${String(g.day).padStart(2, '0')}`;
  });

  const [tzMode, setTzMode] = useState<string>('device');
  const timezoneOffsetHours = useMemo(() => {
    if (tzMode === 'device') {
      return -new Date().getTimezoneOffset() / 60;
    }
    return parseFloat(tzMode) || 7;
  }, [tzMode]);

  const [selectedCategory, setSelectedCategory] = useState<RitualCategoryId>('all');
  const [sortBy, setSortBy] = useState<'score' | 'time'>('score');

  // Scheduled rituals persisted in localStorage
  const [rituals, setRituals] = useState<ScheduledRitual[]>(() => loadScheduledRituals());

  // Scheduling form state
  const [draftTarget, setDraftTarget] = useState<ManzilRisingSchedule | null>(null);
  const [draftTitle, setDraftTitle] = useState<string>('');
  const [draftReminderMin, setDraftReminderMin] = useState<number>(10);
  const [draftNotes, setDraftNotes] = useState<string>('');

  // Notification permission, PushManager status & live clock for countdowns
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  const [pushReport, setPushReport] = useState<PushCapabilityReport | null>(null);
  const [isPushPanelOpen, setIsPushPanelOpen] = useState<boolean>(false);
  const [customVapidKey, setCustomVapidKey] = useState<string>('');
  const [isPushBusy, setIsPushBusy] = useState<boolean>(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let active = true;
    getPushCapabilityReport().then((report) => {
      if (!active) return;
      setPushReport(report);
      setNotifPermission(report.permission);
    });
    syncRitualsToServiceWorker(rituals);
    return () => {
      active = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Parse selected dateISO
  const parsedDate = useMemo(() => {
    const [y, m, d] = dateISO.split('-').map((n) => parseInt(n, 10));
    return {
      year: y || currentDateInfo.gregorian.year,
      month: m || currentDateInfo.gregorian.month,
      day: d || currentDateInfo.gregorian.day,
    };
  }, [dateISO, currentDateInfo.gregorian]);

  // Compute daily rising schedules for all 28 Manzils
  const { schedules, moonManzilNumber, hijriFormatted } = useMemo(() => {
    return calculateDailyManzilRitualSchedules({
      year: parsedDate.year,
      month: parsedDate.month,
      day: parsedDate.day,
      latitude: observerLocation.latitude,
      longitude: observerLocation.longitude,
      timezoneOffsetHours,
      category: selectedCategory,
    });
  }, [parsedDate, observerLocation.latitude, observerLocation.longitude, timezoneOffsetHours, selectedCategory]);

  const sortedSchedules = useMemo(() => {
    const copy = [...schedules];
    if (sortBy === 'score') {
      copy.sort((a, b) => b.suitabilityScore - a.suitabilityScore || a.risingMinutesLocal - b.risingMinutesLocal);
    } else {
      copy.sort((a, b) => a.risingMinutesLocal - b.risingMinutesLocal);
    }
    return copy;
  }, [schedules, sortBy]);

  const persistRituals = (next: ScheduledRitual[]) => {
    setRituals(next);
    saveScheduledRituals(next);
    syncRitualsToServiceWorker(next);
    if (onSchedulesChanged) onSchedulesChanged();
  };

  // Request Browser Notification permission & subscribe via PushManager
  const handleRequestNotifications = async () => {
    setIsPushBusy(true);
    try {
      const res = await subscribeToManzilPush(customVapidKey || undefined);
      setPushReport(res.report);
      setNotifPermission(res.report.permission);
      if (res.ok) {
        playRitualChime();
        await syncRitualsToServiceWorker(rituals);
        await triggerServiceWorkerNotification({
          title: 'Pengingat Push Manzil Aktif',
          body: 'Zij as-Sindhind siap mengirim notifikasi terbit Manzil ke perangkat Anda meski berjalan di latar belakang.',
          manzilNumber: moonManzilNumber,
          manzilTransliteration: schedules.find((s) => s.manzil.number === moonManzilNumber)?.manzil.transliteration,
          tag: 'manzil-push-activated',
        });
      }
      showToast(res.message);
    } catch {
      showToast('Gagal mengaktifkan izin notifikasi & PushManager.');
    } finally {
      setIsPushBusy(false);
    }
  };

  const handleUnsubscribePush = async () => {
    setIsPushBusy(true);
    try {
      const report = await unsubscribeFromManzilPush();
      setPushReport(report);
      showToast('Langganan PushManager latar belakang dinonaktifkan.');
    } finally {
      setIsPushBusy(false);
    }
  };

  const handleCopySubscriptionJson = async () => {
    if (!pushReport?.subscriptionJson) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(pushReport.subscriptionJson, null, 2));
      showToast('Payload PushSubscription JSON berhasil disalin.');
    } catch {
      showToast('Tidak dapat menyalin ke clipboard.');
    }
  };

  const handleTestReminder = async () => {
    playRitualChime();
    const moonSchedule = schedules.find((s) => s.manzil.number === moonManzilNumber) || schedules[0];
    const arabMelayu = moonSchedule
      ? transliterateToArabic(moonSchedule.manzil.transliteration, moonSchedule.manzil.number)
      : '';
    const sent = await triggerServiceWorkerNotification({
      title: 'Uji Push Terbit Manzil — Zij as-Sindhind',
      body: `Simulasi pengingat di ${observerLocation.name}: ${moonSchedule?.manzil.transliteration || 'Manzil'} (${arabMelayu}) · Terbit ${moonSchedule?.risingTimeFormatted || ''}`,
      manzilNumber: moonSchedule?.manzil.number,
      manzilTransliteration: moonSchedule?.manzil.transliteration,
      manzilArabMelayu: arabMelayu,
      risingTime: moonSchedule ? `${moonSchedule.risingTimeFormatted}–${moonSchedule.windowEndFormatted}` : undefined,
      planetaryHour: moonSchedule?.planetaryHourAtRising,
      tag: 'manzil-push-test',
    });
    showToast(
      sent
        ? 'Uji nada & notifikasi Push Service Worker dijalankan.'
        : 'Nada pengingat diputar (aktifkan izin notifikasi untuk banner OS).'
    );
  };

  // Open draft scheduler for a specific Manzil
  const handleOpenScheduleDraft = (item: ManzilRisingSchedule) => {
    const catMeta = RITUAL_CATEGORIES.find((c) => c.id === selectedCategory);
    const defaultTitle =
      selectedCategory === 'all'
        ? `Amalan Terbit Manzil ${item.manzil.transliteration}`
        : `${catMeta?.label || 'Amalan'} (${item.manzil.transliteration})`;

    setDraftTarget(item);
    setDraftTitle(defaultTitle);
    setDraftReminderMin(10);
    setDraftNotes(item.recommendedRitualNote);
  };

  const handleSaveScheduledRitual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTarget) return;

    const finalTitle = draftTitle.trim() || `Amalan Terbit ${draftTarget.manzil.transliteration}`;
    const manzilArabMelayu = transliterateToArabic(
      draftTarget.manzil.transliteration,
      draftTarget.manzil.number
    );
    const titleArabic = transliterateToArabic(finalTitle);

    const newItem: ScheduledRitual = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: finalTitle,
      titleArabic,
      category: selectedCategory,
      manzilNumber: draftTarget.manzil.number,
      manzilArabic: draftTarget.manzil.arabicName,
      manzilArabMelayu,
      manzilTransliteration: draftTarget.manzil.transliteration,
      dateISO,
      risingTime: draftTarget.risingTimeFormatted,
      windowEnd: draftTarget.windowEndFormatted,
      planetaryHour: draftTarget.planetaryHourAtRising,
      locationName: observerLocation.name,
      reminderMinutesBefore: draftReminderMin,
      notes: draftNotes.trim(),
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    const next = [newItem, ...rituals];
    persistRituals(next);
    setDraftTarget(null);
    showToast(`Jadwal & pengingat "${newItem.title}" (${manzilArabMelayu}) tersimpan.`);
  };

  const handleToggleRitual = (id: string) => {
    const next = rituals.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    persistRituals(next);
  };

  const handleDeleteRitual = (id: string) => {
    const next = rituals.filter((r) => r.id !== id);
    persistRituals(next);
    showToast('Jadwal ritual dihapus.');
  };

  const handleExportIcs = (itemsToExport: ScheduledRitual[]) => {
    if (itemsToExport.length === 0) {
      showToast('Belum ada jadwal ritual untuk diekspor.');
      return;
    }
    const icsContent = exportRitualsToIcs(itemsToExport);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Jadwal-Ritual-Manzil-${dateISO}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('File kalender .ics berhasil diunduh (siap diimpor ke Android/iOS Calendar).');
  };

  const formatCountdown = (ritual: ScheduledRitual) => {
    const targetMs = getRitualReminderTargetMs(ritual);
    if (!targetMs) return '—';
    const diffMin = Math.round((targetMs - nowMs) / 60000);
    if (diffMin < -35) return 'Sudah lewat';
    if (diffMin <= 0) return 'Waktunya sekarang!';
    const hrs = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return hrs > 0 ? `Dalam ${hrs}j ${mins}m` : `Dalam ${mins} menit`;
  };

  const cardSurface = isNight
    ? 'bg-[#101624] border-[#24324c] text-[#e5dccb]'
    : 'bg-[#faf6ed] border-[#dacdb2] text-[#2c2419]';

  const subSurface = isNight
    ? 'bg-[#0b101b] border-[#1f2b42]'
    : 'bg-white border-[#e2d6bd]';

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-amber-600 text-white font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm max-w-sm">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER & NOTIFICATION BAR */}
      <div className={`rounded-2xl border p-4 sm:p-6 shadow-sm space-y-4 ${cardSurface}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <span className="font-arabic text-base">جَدْوَلَةُ الأَوْرَادِ وَالأَعْمَالِ بِطُلُوعِ المَنَازِل</span>
              <span aria-hidden="true">·</span>
              <span>Manzil Ritual Scheduler</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold">
              Penjadwal Amalan &amp; Pengingat Terbit Manzil (Rising Time)
            </h1>
            <p className="text-xs sm:text-sm opacity-80 max-w-3xl leading-relaxed">
              Rencanakan waktu terbaik untuk dzikir, doa, penulisan wafaq, safar, atau ikhtiar berdasarkan waktu terbitnya (*Shurūq / Ascendant Rising*) masing-masing dari 28 Manzil Bulan di koordinat pengamat Anda.
            </p>
          </div>

          {/* Notification, PushManager & Calendar Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isPushBusy}
              onClick={handleRequestNotifications}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 ${
                pushReport?.isSubscribed
                  ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                  : notifPermission === 'granted'
                  ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
              }`}
            >
              {pushReport?.isSubscribed || notifPermission === 'granted' ? (
                <BellRing className="w-4 h-4" />
              ) : notifPermission === 'denied' ? (
                <BellOff className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              <span>
                {pushReport?.isSubscribed
                  ? 'Push Native Aktif'
                  : notifPermission === 'granted'
                  ? 'Aktifkan PushManager'
                  : notifPermission === 'denied'
                  ? 'Izin Diblokir Browser'
                  : 'Aktifkan Push Latar'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsPushPanelOpen((prev) => !prev)}
              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${subSurface} hover:border-amber-500`}
              title="Konfigurasi PushManager & ServiceWorker Android/iOS"
            >
              <Radio className={`w-4 h-4 ${pushReport?.isSubscribed ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span>Push SW</span>
              {isPushPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleTestReminder}
              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${subSurface} hover:border-amber-500`}
              title="Uji nada & notifikasi Push ServiceWorker"
            >
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span>Uji Push</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportIcs(rituals.filter((r) => r.enabled))}
              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${subSurface} hover:border-amber-500`}
              title="Ekspor jadwal ritual aktif ke Kalender Android / iOS (.ics)"
            >
              <Download className="w-4 h-4 text-amber-500" />
              <span>Ekspor .ICS</span>
            </button>
          </div>
        </div>

        {/* Collapsible PushManager & ServiceWorker Status Panel (Android & iOS) */}
        {isPushPanelOpen && (
          <div className={`rounded-xl border p-3.5 sm:p-4 space-y-3 text-xs ${subSurface}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/10 pb-2">
              <div className="flex items-center gap-2 font-semibold">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span>Service Worker PushManager (Notifikasi Latar Belakang Android &amp; iOS)</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  pushReport?.isSubscribed
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                }`}
              >
                {pushReport?.isSubscribed ? 'PushSubscription Terhubung' : 'Siap Didaftarkan'}
              </span>
            </div>

            {pushReport?.needsIOSHomeScreen && (
              <div className="p-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-[11px] leading-relaxed">
                <strong>Catatan iOS Safari:</strong> Untuk mengaktifkan PushManager dan notifikasi native latar belakang di iPhone/iPad (iOS 16.4+), ketuk ikon <strong>Bagikan (Share) → Tambah ke Layar Utama (Add to Home Screen)</strong>, lalu buka aplikasi dari Layar Utama.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold opacity-80 block">
                  Kunci Publik VAPID P-256 (Opsional — Otomatis dibuat jika kosong)
                </label>
                <input
                  type="text"
                  value={customVapidKey}
                  onChange={(e) => setCustomVapidKey(e.target.value)}
                  placeholder={pushReport?.vapidPublicKey || 'BP...'}
                  className={`w-full min-h-[42px] px-3 py-1.5 rounded-lg border text-xs font-mono ${cardSurface}`}
                />
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isPushBusy}
                    onClick={handleRequestNotifications}
                    className="min-h-[42px] px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs cursor-pointer disabled:opacity-60"
                  >
                    {pushReport?.isSubscribed ? 'Perbarui Langganan Push' : 'Daftarkan PushManager'}
                  </button>

                  {pushReport?.subscriptionJson && (
                    <button
                      type="button"
                      onClick={handleCopySubscriptionJson}
                      className="min-h-[42px] px-3 py-1.5 rounded-lg border border-current/20 hover:border-amber-500 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Endpoint JSON</span>
                    </button>
                  )}

                  {pushReport?.isSubscribed && (
                    <button
                      type="button"
                      disabled={isPushBusy}
                      onClick={handleUnsubscribePush}
                      className="min-h-[42px] px-3 py-1.5 rounded-lg border border-rose-500/35 text-rose-500 hover:bg-rose-500/10 text-xs font-medium cursor-pointer"
                    >
                      Putuskan Push
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] opacity-80 font-mono">
              <span>SW: {pushReport?.hasServiceWorkerReady ? 'Aktif' : 'Menunggu'}</span>
              <span>PushManager: {pushReport?.pushManagerSupported ? 'Didukung' : 'Terbatas'}</span>
              <span>
                Trigger OS Latar:{' '}
                {pushReport?.timestampTriggerSupported ? 'TimestampTrigger Native' : 'Background Sync + Push'}
              </span>
              {pushReport?.endpoint && (
                <span className="truncate max-w-xs sm:max-w-md">
                  Endpoint: {pushReport.endpoint}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Date, Timezone & Location Controls */}
        <div className="pt-3 border-t border-current/10 flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold opacity-75 block">Tanggal Target</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={dateISO}
                  onChange={(e) => e.target.value && setDateISO(e.target.value)}
                  className={`min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-mono tabular-nums ${subSurface}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setDateISO(
                      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
                    );
                  }}
                  className={`min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer hover:border-amber-500 whitespace-nowrap ${subSurface}`}
                >
                  Hari Ini
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold opacity-75 block">Zona Waktu</label>
              <select
                value={tzMode}
                onChange={(e) => setTzMode(e.target.value)}
                className={`min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-medium ${subSurface}`}
              >
                {TIMEZONE_PRESETS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unboxed Astronomical Metadata */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs opacity-85">
            <span className="inline-flex items-center gap-1 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              {observerLocation.name}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {observerLocation.latitude.toFixed(2)}°, {observerLocation.longitude.toFixed(2)}°
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{hijriFormatted}</span>
            <span aria-hidden="true">·</span>
            <span>Manzil Bulan Aktif: #{moonManzilNumber}</span>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="pt-2 border-t border-current/10 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">
              Pilih Niat &amp; Tujuan Amalan
            </span>
            <button
              type="button"
              onClick={() => setSortBy((prev) => (prev === 'score' ? 'time' : 'score'))}
              className={`min-h-[36px] px-3 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${subSurface} hover:border-amber-500`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
              <span>Urutkan: {sortBy === 'score' ? 'Skor Terbaik' : 'Jam Terbit (00:00)'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {RITUAL_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border whitespace-nowrap ${
                    active
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm font-semibold'
                      : `${subSurface} hover:border-amber-500/60 opacity-85 hover:opacity-100`
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DRAFT SCHEDULING DRAWER / INLINE FORM */}
      {draftTarget && (
        <form
          onSubmit={handleSaveScheduledRitual}
          className={`rounded-2xl border-2 border-amber-500 p-4 sm:p-5 shadow-lg space-y-4 ${cardSurface}`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-current/10 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Buat Pengingat Terbit Manzil #{draftTarget.manzil.number}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold">
                {draftTarget.manzil.transliteration} ({draftTarget.manzil.arabicName}) · Terbit {draftTarget.risingTimeFormatted}
              </h3>
              <div className="text-sm font-arabic text-amber-600 dark:text-amber-300 mt-0.5" dir="rtl">
                {transliterateToArabic(draftTarget.manzil.transliteration, draftTarget.manzil.number)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDraftTarget(null)}
              className="px-3 py-1.5 rounded-lg text-xs border border-current/20 hover:bg-current/10 cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-semibold block">Nama Amalan / Ritual</label>
              <input
                type="text"
                required
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-xs sm:text-sm ${subSurface}`}
                placeholder="Cth: Wirid Ya Fattah & Penulisan Wafaq"
              />
              {draftTitle.trim() && (
                <div className="text-xs font-arabic text-amber-600 dark:text-amber-300 pt-0.5 flex items-center justify-between gap-2">
                  <span className="font-sans text-[10px] opacity-70">Ejaan Arab-Melayu:</span>
                  <span dir="rtl" className="text-sm">{transliterateToArabic(draftTitle)}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold block">Waktu Pengingat</label>
              <select
                value={draftReminderMin}
                onChange={(e) => setDraftReminderMin(parseInt(e.target.value, 10))}
                className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-xs sm:text-sm ${subSurface}`}
              >
                <option value={0}>Tepat saat Manzil terbit ({draftTarget.risingTimeFormatted})</option>
                <option value={5}>5 menit sebelum terbit</option>
                <option value={10}>10 menit sebelum terbit</option>
                <option value={15}>15 menit sebelum terbit</option>
                <option value={30}>30 menit sebelum terbit</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold block">Jendela Optimal &amp; Planet Jam</label>
              <div className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs flex items-center justify-between font-mono tabular-nums ${subSurface}`}>
                <span>{draftTarget.risingTimeFormatted} – {draftTarget.windowEndFormatted}</span>
                <span className="font-sans font-semibold text-amber-600 dark:text-amber-400">
                  {draftTarget.planetaryHourAtRising}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold block">Catatan Wirid / Doa / Persiapan</label>
            <textarea
              rows={2}
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-xs ${subSurface}`}
              placeholder="Catatan amalan atau bacaan yang disiapkan..."
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDraftTarget(null)}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-current/20 text-xs font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Simpan &amp; Aktifkan Pengingat</span>
            </button>
          </div>
        </form>
      )}

      {/* TWO-COLUMN MAIN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 28 Manzils Rising Schedule (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm sm:text-base font-serif font-bold flex items-center gap-2">
              <Sunrise className="w-4 h-4 text-amber-500" />
              <span>Waktu Terbit 28 Manzil ({dateISO})</span>
            </h2>
            <span className="text-xs opacity-70 font-mono tabular-nums">28 Manzil</span>
          </div>

          <div className="space-y-2.5">
            {sortedSchedules.map((item) => {
              const m = item.manzil;
              return (
                <div
                  key={m.number}
                  className={`rounded-2xl border p-4 transition-all ${
                    item.isMoonOccupied
                      ? 'border-amber-500/70 bg-amber-500/10'
                      : cardSurface
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Manzil Identity & Rising Metrics */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          #{m.number}
                        </span>
                        <span className="font-arabic font-bold text-base">
                          {m.arabicName}
                        </span>
                        <span className="font-serif font-bold text-sm sm:text-base">
                          {m.transliteration}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="opacity-75">{m.meaningId}</span>
                        {item.isMoonOccupied && (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-300 font-semibold">
                            <Moon className="w-3.5 h-3.5" />
                            <span>Posisi Bulan Hari Ini</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-arabic text-amber-600/90 dark:text-amber-300/90" dir="rtl">
                        {transliterateToArabic(m.transliteration, m.number)}
                      </div>

                      {/* Rising / Transit / Setting Times */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono tabular-nums">
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Sunrise className="w-3.5 h-3.5 shrink-0" />
                          Terbit {item.risingTimeFormatted} (s/d {item.windowEndFormatted})
                        </span>
                        <span className="inline-flex items-center gap-1 opacity-75">
                          <Sun className="w-3.5 h-3.5 shrink-0" />
                          Kulminasi {item.transitTimeFormatted}
                        </span>
                        <span className="inline-flex items-center gap-1 opacity-75">
                          <Sunset className="w-3.5 h-3.5 shrink-0" />
                          Terbenam {item.settingTimeFormatted}
                        </span>
                      </div>

                      <div className="text-[11px] opacity-80 leading-relaxed">
                        <span>Penguasa Jam Terbit: <strong>{item.planetaryHourAtRising}</strong></span>
                        <span aria-hidden="true"> · </span>
                        <span
                          className={`font-semibold ${
                            item.suitabilityScore >= 80
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : item.suitabilityScore >= 62
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'opacity-75'
                          }`}
                        >
                          Skor {item.suitabilityScore}/100 ({item.suitabilityLabel})
                        </span>
                      </div>
                      <p className="text-[11px] opacity-75">{item.recommendedRitualNote}</p>
                    </div>

                    {/* Schedule Action Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenScheduleDraft(item)}
                        className="min-h-[44px] w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Jadwalkan</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Scheduled Rituals & Live Reminders (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-3 lg:sticky lg:top-24">
          <div className={`rounded-2xl border p-4 sm:p-5 shadow-sm space-y-4 ${cardSurface}`}>
            <div className="flex items-center justify-between border-b border-current/10 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-serif font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Jadwal Ritual &amp; Pengingat ({rituals.length})</span>
                </h2>
                <p className="text-[11px] opacity-75 mt-0.5">
                  Tersimpan otomatis di perangkat Anda · aktif memantau lintas tab
                </p>
              </div>
              {rituals.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleExportIcs(rituals)}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Unduh .ICS</span>
                </button>
              )}
            </div>

            {rituals.length === 0 ? (
              <div className={`p-6 rounded-xl border text-center space-y-2 ${subSurface}`}>
                <Sparkles className="w-6 h-6 text-amber-500 mx-auto opacity-80" />
                <p className="text-xs font-semibold">Belum ada jadwal amalan tersimpan</p>
                <p className="text-[11px] opacity-75 leading-relaxed">
                  Pilih salah satu Manzil di daftar sebelah kiri dan tekan <strong>Jadwalkan</strong> untuk membuat pengingat otomatis saat Manzil mulai terbit.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {rituals.map((r) => (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-xl border space-y-2 transition-opacity ${subSurface} ${
                      r.enabled ? 'opacity-100' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-serif font-bold truncate">
                          {r.title}
                        </div>
                        <div className="text-xs font-arabic text-amber-600 dark:text-amber-300 mt-0.5 truncate" dir="rtl">
                          {r.titleArabic || transliterateToArabic(r.title)}
                        </div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          Manzil #{r.manzilNumber} {r.manzilTransliteration} ({r.manzilArabMelayu || transliterateToArabic(r.manzilTransliteration, r.manzilNumber)})
                        </div>
                      </div>
                      <span className="text-[11px] font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400 shrink-0">
                        {formatCountdown(r)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono tabular-nums opacity-85">
                      <span>{r.dateISO}</span>
                      <span aria-hidden="true">·</span>
                      <span>Terbit {r.risingTime}–{r.windowEnd}</span>
                      <span aria-hidden="true">·</span>
                      <span>Pengingat -{r.reminderMinutesBefore}m</span>
                    </div>

                    {r.notes && (
                      <p className="text-[11px] opacity-75 leading-relaxed">{r.notes}</p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-current/10">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleRitual(r.id)}
                          className={`min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors ${
                            r.enabled
                              ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                              : 'border-current/20 opacity-75'
                          }`}
                        >
                          {r.enabled ? 'Pengingat Aktif' : 'Nonaktif'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportIcs([r])}
                          className="min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] border border-current/15 hover:border-amber-500 cursor-pointer"
                          title="Simpan ke kalender perangkat"
                        >
                          .ICS
                        </button>

                        {onAnnotate && (
                          <button
                            type="button"
                            onClick={() =>
                              onAnnotate(
                                `Jadwal Ritual: ${r.title}`,
                                `Tanggal: ${r.dateISO} | Manzil #${r.manzilNumber} ${r.manzilTransliteration} | Terbit: ${r.risingTime} (${r.planetaryHour}) | Lokasi: ${r.locationName}\nCatatan: ${r.notes}`
                              )
                            }
                            className="min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] border border-current/15 hover:border-amber-500 cursor-pointer inline-flex items-center gap-1"
                            title="Catat ke Jurnal Anotasi"
                          >
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            <span>Catat</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteRitual(r.id)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        title="Hapus jadwal ritual"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
