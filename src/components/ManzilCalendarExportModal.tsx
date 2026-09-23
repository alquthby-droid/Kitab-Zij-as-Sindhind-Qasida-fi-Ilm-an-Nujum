import React, { useState, useMemo } from 'react';
import { ThemeMode, HistoricalDateInfo } from '../types';
import {
  ManzilIcsExportOptions,
  IcsRangeSpan,
  IcsDirection,
  generateManzilEventsData,
  generateManzilIcsString,
  downloadIcsFile,
  copyIcsToClipboard,
  ManzilCalendarDayEvent,
  generateGoogleCalendarUrl,
  downloadSingleDayIcs,
  shareOrDownloadIcs,
} from '../lib/icalExport';
import {
  ActivityCategoryKey,
  ACTIVITY_CATEGORIES,
} from '../lib/manzilCalculatorEngine';
import {
  Calendar,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Bell,
  Clock,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Share2,
  CalendarDays,
  Smartphone,
  Laptop,
  ExternalLink,
} from 'lucide-react';

interface ManzilCalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDateInfo: HistoricalDateInfo;
  theme: ThemeMode;
}

export const ManzilCalendarExportModal: React.FC<ManzilCalendarExportModalProps> = ({
  isOpen,
  onClose,
  currentDateInfo,
  theme,
}) => {
  const isNight = theme === 'night';

  // Export configuration options
  const [daysCount, setDaysCount] = useState<IcsRangeSpan>(28);
  const [direction, setDirection] = useState<IcsDirection>('forward');
  const [categoryFilter, setCategoryFilter] = useState<ActivityCategoryKey>('all');
  const [includeAlarm, setIncludeAlarm] = useState<boolean>(true);
  const [includeVerses, setIncludeVerses] = useState<boolean>(true);
  const [includeHijri, setIncludeHijri] = useState<boolean>(true);

  // Copy state feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Guide accordion open state
  const [activeGuideTab, setActiveGuideTab] = useState<'google' | 'apple' | 'outlook'>('google');
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Preview event index
  const [previewExpandedIndex, setPreviewExpandedIndex] = useState<number | null>(0);

  // Options object
  const exportOptions: ManzilIcsExportOptions = useMemo(() => {
    return {
      startJdn: currentDateInfo.jdn,
      daysCount,
      direction,
      categoryFilter,
      includeAlarm,
      includeVerses,
      includeHijri,
      calendarName: `Jadwal 28 Manzil (${daysCount} Hari) - Zij as-Sindhind`,
    };
  }, [
    currentDateInfo.jdn,
    daysCount,
    direction,
    categoryFilter,
    includeAlarm,
    includeVerses,
    includeHijri,
  ]);

  // Generate preview events
  const previewEvents: ManzilCalendarDayEvent[] = useMemo(() => {
    return generateManzilEventsData(exportOptions);
  }, [exportOptions]);

  if (!isOpen) return null;

  // Handle download
  const handleDownload = () => {
    const icsContent = generateManzilIcsString(exportOptions);
    const startDateFormatted = previewEvents[0]?.startDateStr || 'schedule';
    const filename = `kalender-28-manzil-${startDateFormatted}-${daysCount}hari.ics`;
    downloadIcsFile(filename, icsContent);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    const icsContent = generateManzilIcsString(exportOptions);
    const ok = await copyIcsToClipboard(icsContent);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Handle direct share to device calendar app (or fallback to download)
  const handleShareToDevice = async () => {
    const icsContent = generateManzilIcsString(exportOptions);
    const startDateFormatted = previewEvents[0]?.startDateStr || 'schedule';
    const filename = `kalender-28-manzil-${startDateFormatted}-${daysCount}hari.ics`;
    const res = await shareOrDownloadIcs(filename, icsContent, 'Kalender 28 Manzil');
    if (res === 'shared') {
      setShareFeedback('Membuka aplikasi kalender perangkat...');
    } else {
      setShareFeedback('Berkas .ICS telah diunduh!');
    }
    setTimeout(() => setShareFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border shadow-2xl transition-all ${
          isNight
            ? 'bg-[#0f1422] border-[#222e44] text-slate-100'
            : 'bg-[#faf6ee] border-[#ded3be] text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-20 px-6 py-4 border-b flex items-center justify-between gap-3 ${
            isNight
              ? 'bg-[#0f1422]/95 border-[#222e44] backdrop-blur-md'
              : 'bg-[#faf6ee]/95 border-[#ded3be] backdrop-blur-md'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#c59a43]/15 border border-[#c59a43]/30 text-[#d4af37]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-[#c59a43]">
                  Ekspor Jadwal 28 Manzil ke Kalender (.ics)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#c59a43]/20 text-[#d4af37] border border-[#c59a43]/40">
                  iCalendar RFC 5545
                </span>
              </div>
              <p className="text-xs opacity-70 font-arabic text-amber-200/80">
                تصدير تقويم منازل القمر وسنن الأعمال بصيغة الآيكال
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all ${
              isNight
                ? 'bg-[#182338] border-[#2a3a55] text-slate-400 hover:text-white hover:bg-[#202f48]'
                : 'bg-white border-[#ded3be] text-slate-500 hover:text-slate-900 hover:bg-[#eee5d3]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Explanation Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isNight
                ? 'bg-[#12192c] border-[#1d273a]'
                : 'bg-[#f4eedf] border-[#dfd2bc]'
            }`}
          >
            <Info className="w-5 h-5 text-[#c59a43] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-serif font-bold text-[#c59a43]">
                Integrasikan Tuntunan Klasik Falak ke Aplikasi Kalender Pribadi
              </div>
              <p className="opacity-80 leading-relaxed">
                File format <strong>.ics</strong> ini kompatibel dengan <strong>Google Calendar, Apple Calendar (iPhone/Mac), dan Microsoft Outlook</strong>. Setiap hari disematkan sebagai acara sepanjang hari (*All-Day Event*) berstatus <em>Transparan</em> (tidak mengganggu jadwal sibuk kerja), lengkap dengan anjuran <em>Al-Mustahabb</em>, pantangan <em>Al-Makruh</em>, derajat keberuntungan, dan bait syair klasik.
              </p>
            </div>
          </div>

          {/* Form Options Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-serif font-bold text-[#c59a43] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pengaturan Jadwal Ekspor</span>
            </h4>

            {/* Duration Range Selector */}
            <div>
              <label className="block text-xs font-serif font-semibold mb-1.5 opacity-80">
                1. Rentang Durasi Hari:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { count: 14 as IcsRangeSpan, label: '14 Hari', desc: 'Fase Sabit & Purnama' },
                  { count: 28 as IcsRangeSpan, label: '28 Hari', desc: '1 Siklus Lengkap Manzil', recommended: true },
                  { count: 30 as IcsRangeSpan, label: '30 Hari', desc: '1 Bulan Kalender' },
                  { count: 60 as IcsRangeSpan, label: '60 Hari', desc: '2 Siklus Penuh Falak' },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setDaysCount(item.count)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      daysCount === item.count
                        ? 'bg-[#c59a43] border-[#d4af37] text-black shadow-md'
                        : isNight
                        ? 'bg-[#12192c] border-[#1f2c42] text-slate-300 hover:border-[#c59a43]/50'
                        : 'bg-white border-[#ded3be] text-slate-700 hover:border-[#c59a43]/50'
                    }`}
                  >
                    {item.recommended && (
                      <span
                        className={`absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase ${
                          daysCount === item.count
                            ? 'bg-black text-[#c59a43]'
                            : 'bg-[#c59a43] text-black'
                        }`}
                      >
                        Sangat Disarankan
                      </span>
                    )}
                    <div className="font-serif font-bold text-sm">{item.label}</div>
                    <div
                      className={`text-[10px] ${
                        daysCount === item.count ? 'text-black/80' : 'opacity-65'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Direction Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-serif font-semibold mb-1.5 opacity-80">
                  2. Arah Waktu Perjalanan Bulan:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDirection('forward')}
                    className={`p-2 rounded-lg border text-xs font-serif font-semibold text-center transition-all ${
                      direction === 'forward'
                        ? 'bg-[#c59a43] border-[#d4af37] text-black shadow'
                        : isNight
                        ? 'bg-[#12192c] border-[#1f2c42] text-slate-300 hover:text-white'
                        : 'bg-white border-[#ded3be] text-slate-700 hover:text-black'
                    }`}
                  >
                    Hari Ini ke Depan (Mendatang)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('backward')}
                    className={`p-2 rounded-lg border text-xs font-serif font-semibold text-center transition-all ${
                      direction === 'backward'
                        ? 'bg-[#c59a43] border-[#d4af37] text-black shadow'
                        : isNight
                        ? 'bg-[#12192c] border-[#1f2c42] text-slate-300 hover:text-white'
                        : 'bg-white border-[#ded3be] text-slate-700 hover:text-black'
                    }`}
                  >
                    Masa Lalu (Histori Arsip)
                  </button>
                </div>
              </div>

              {/* Focus Hajat Category Filter */}
              <div>
                <label className="block text-xs font-serif font-semibold mb-1.5 opacity-80">
                  3. Sorotan Khusus Bidang Hajat:
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as ActivityCategoryKey)}
                  className={`w-full p-2 rounded-lg border text-xs font-serif font-medium transition-all focus:outline-none ${
                    isNight
                      ? 'bg-[#12192c] border-[#1f2c42] text-slate-200 focus:border-[#c59a43]'
                      : 'bg-white border-[#ded3be] text-slate-800 focus:border-[#c59a43]'
                  }`}
                >
                  <option value="all">Semua Hajat (Komprehensif / Lengkap)</option>
                  {ACTIVITY_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label} ({cat.arabic})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Toggle Switches for Content Detail */}
            <div
              className={`p-3.5 rounded-xl border grid grid-cols-1 sm:grid-cols-3 gap-3 ${
                isNight ? 'bg-[#0b0f19] border-[#1a2538]' : 'bg-[#f4ebd9] border-[#e2d5bd]'
              }`}
            >
              <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={includeAlarm}
                  onChange={(e) => setIncludeAlarm(e.target.checked)}
                  className="rounded text-[#c59a43] focus:ring-[#c59a43] w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-1 font-serif">
                  <Bell className="w-3.5 h-3.5 text-[#c59a43]" />
                  <span>Pengingat Pagi Hari</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={includeVerses}
                  onChange={(e) => setIncludeVerses(e.target.checked)}
                  className="rounded text-[#c59a43] focus:ring-[#c59a43] w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-1 font-serif">
                  <BookOpen className="w-3.5 h-3.5 text-[#c59a43]" />
                  <span>Bait Syair Manuskrip</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={includeHijri}
                  onChange={(e) => setIncludeHijri(e.target.checked)}
                  className="rounded text-[#c59a43] focus:ring-[#c59a43] w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-1 font-serif">
                  <CalendarDays className="w-3.5 h-3.5 text-[#c59a43]" />
                  <span>Penanggalan Hijriah</span>
                </span>
              </label>
            </div>
          </div>

          {/* Preview of Upcoming Calendar Events */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-serif font-bold text-[#c59a43] uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Pratinjau Jadwal yang Akan Diekspor ({previewEvents.length} Hari)</span>
              </h4>
              <span className="text-[11px] font-mono opacity-70">
                {previewEvents[0]?.gregorianFormatted} s.d. {previewEvents[previewEvents.length - 1]?.gregorianFormatted}
              </span>
            </div>

            <div
              className={`rounded-xl border divide-y max-h-56 overflow-y-auto ${
                isNight
                  ? 'bg-[#0c101a] border-[#1d273a] divide-[#1d273a]'
                  : 'bg-white border-[#ded3be] divide-[#ded3be]'
              }`}
            >
              {previewEvents.slice(0, 7).map((ev, idx) => {
                const isExpanded = previewExpandedIndex === idx;
                const isFortuneGood = ev.mansion.fortune.includes("Sa'd");
                const isFortuneBad = ev.mansion.fortune.includes('Nahs');

                return (
                  <div key={idx} className="p-3 transition-colors text-xs">
                    <div
                      className="flex items-center justify-between gap-2 cursor-pointer"
                      onClick={() => setPreviewExpandedIndex(isExpanded ? null : idx)}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono font-bold text-[#c59a43] shrink-0">
                          {ev.gregorianFormatted.split(' ').slice(0, 2).join(' ')}
                        </span>
                        <span className="opacity-40">|</span>
                        <span className="font-serif font-semibold truncate">
                          #{ev.mansion.number} {ev.mansion.transliteration} ({ev.mansion.arabicName})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            isFortuneGood
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : isFortuneBad
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          }`}
                        >
                          {ev.mansion.fortune}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 opacity-60" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail Box */}
                    {isExpanded && (
                      <div
                        className={`mt-2.5 p-3 rounded-lg border text-[11px] space-y-1.5 animate-in fade-in duration-150 ${
                          isNight
                            ? 'bg-[#101626] border-[#223049]'
                            : 'bg-[#faf6ee] border-[#e2d5bd]'
                        }`}
                      >
                        <div className="font-serif text-[#c59a43] font-semibold">
                          {ev.summary}
                        </div>
                        <div className="text-emerald-400 leading-relaxed">
                          <strong>✓ Dianjurkan:</strong> {ev.recommendedActions.slice(0, 2).join('; ')}
                        </div>
                        <div className="text-rose-400 leading-relaxed">
                          <strong>⚠ Dihindari:</strong> {ev.avoidedActions.slice(0, 2).join('; ')}
                        </div>
                        {includeVerses && (
                          <div className="italic opacity-75 font-arabic pt-0.5">
                            "{ev.mansion.classicalVerseArabic}"
                          </div>
                        )}

                        {/* Quick 1-Click Sync Buttons for Single Day */}
                        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-current/10">
                          <a
                            href={generateGoogleCalendarUrl(ev)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                            title="Tambahkan acara Manzil hari ini langsung ke akun Google Calendar"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Buka di Google Calendar (1-Klik)</span>
                            <ExternalLink className="w-3 h-3 opacity-75" />
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSingleDayIcs(ev);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isNight
                                ? 'bg-[#182338] border-[#2c3d59] text-amber-300 hover:bg-[#202e47]'
                                : 'bg-[#f4efe4] border-[#d4c7b0] text-stone-800 hover:bg-[#eae1cf]'
                            }`}
                            title="Unduh berkas .ICS untuk hari ini saja"
                          >
                            <Download className="w-3.5 h-3.5 text-[#c59a43]" />
                            <span>Unduh .ICS Hari Ini</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {previewEvents.length > 7 && (
                <div className="p-2 text-center text-[10px] font-mono opacity-60 italic">
                  + {previewEvents.length - 7} hari berikutnya tercakup dalam berkas kalender...
                </div>
              )}
            </div>
          </div>

          {/* Quick Guide Accordion */}
          <div
            className={`rounded-xl border ${
              isNight ? 'bg-[#0c101a] border-[#1d273a]' : 'bg-[#f7f2e6] border-[#ded3be]'
            }`}
          >
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full p-3.5 flex items-center justify-between text-xs font-serif font-bold text-[#c59a43]"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#c59a43]" />
                <span>Petunjuk Cara Impor Berkas .ICS ke Kalender Anda</span>
              </span>
              {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showGuide && (
              <div className="p-4 border-t border-dashed border-[#c59a43]/20 space-y-3 text-xs">
                {/* Guide Tabs */}
                <div className="flex items-center gap-2 border-b pb-2 border-[#c59a43]/20">
                  {[
                    { id: 'google' as const, label: 'Google Calendar' },
                    { id: 'apple' as const, label: 'Apple Calendar (iPhone/Mac)' },
                    { id: 'outlook' as const, label: 'Microsoft Outlook' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveGuideTab(tab.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-serif font-semibold transition-all ${
                        activeGuideTab === tab.id
                          ? 'bg-[#c59a43] text-black'
                          : isNight
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600 hover:text-black'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeGuideTab === 'google' && (
                  <div className="space-y-1.5 opacity-85 leading-relaxed">
                    <p>1. Buka <strong>Google Calendar</strong> di peramban (calendar.google.com).</p>
                    <p>2. Klik ikon <strong>Roda Gigi (Pengaturan)</strong> di kanan atas &rarr; pilih <strong>Setelan (Settings)</strong>.</p>
                    <p>3. Di menu kiri, pilih <strong>Impor &amp; ekspor (Import &amp; export)</strong>.</p>
                    <p>4. Unggah berkas <code>.ics</code> yang baru Anda unduh, lalu pilih kalender tujuan (disarankan buat kalender terpisah misal: <em>Falak &amp; Manzil</em>).</p>
                    <p>5. Klik <strong>Impor</strong>. Seluruh tuntunan harian akan otomatis muncul di kalender Anda dan tersinkron ke ponsel Android/iPhone!</p>
                  </div>
                )}

                {activeGuideTab === 'apple' && (
                  <div className="space-y-1.5 opacity-85 leading-relaxed">
                    <p>1. Di <strong>iPhone / iPad</strong>: Ketuk berkas <code>.ics</code> yang diunduh, sistem iOS akan otomatis menawarkan <em>"Tambahkan Semua Acara" (Add All)</em> ke Kalender.</p>
                    <p>2. Di <strong>Mac (macOS Calendar)</strong>: Klik dua kali berkas <code>.ics</code>, pilih kalender tujuan (atau buat Kalender Baru bernama <em>Manzil Bulan</em>).</p>
                    <p>3. Kalender akan langsung terintegrasi dengan notifikasi pagi hari.</p>
                  </div>
                )}

                {activeGuideTab === 'outlook' && (
                  <div className="space-y-1.5 opacity-85 leading-relaxed">
                    <p>1. Buka <strong>Outlook</strong> (aplikasi desktop atau web di outlook.live.com).</p>
                    <p>2. Pilih menu <strong>File</strong> &rarr; <strong>Open &amp; Export</strong> &rarr; <strong>Import/Export</strong>.</p>
                    <p>3. Pilih <strong>Import an iCalendar (.ics) or vCalendar file (.vcs)</strong> lalu klik Next.</p>
                    <p>4. Pilih berkas yang telah diunduh, lalu tentukan apakah ingin membuka sebagai kalender terpisah atau mengimpor langsung.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer / Action Bar */}
        <div
          className={`sticky bottom-0 z-20 px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isNight
              ? 'bg-[#0f1422]/95 border-[#222e44] backdrop-blur-md'
              : 'bg-[#faf6ee]/95 border-[#ded3be] backdrop-blur-md'
          }`}
        >
          <div className="text-xs opacity-75 font-mono flex items-center gap-2">
            <span>Total {previewEvents.length} Acara ({daysCount} Hari)</span>
            {shareFeedback && (
              <span className="text-emerald-400 font-sans font-semibold animate-pulse">
                • {shareFeedback}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Quick 1-click Google Calendar for first event */}
            {previewEvents[0] && (
              <a
                href={generateGoogleCalendarUrl(previewEvents[0])}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-serif font-bold shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                title="Buka acara Manzil pertama langsung di Google Calendar"
              >
                <Calendar className="w-4 h-4" />
                <span>Google Calendar (Hari 1)</span>
                <ExternalLink className="w-3 h-3 opacity-75" />
              </a>
            )}

            {/* Share to Device Calendar button */}
            <button
              type="button"
              onClick={handleShareToDevice}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-serif font-semibold transition-all flex items-center justify-center gap-1.5 ${
                isNight
                  ? 'bg-[#182338] border-[#2a3a55] text-sky-300 hover:bg-[#202f48]'
                  : 'bg-white border-[#ded3be] text-sky-800 hover:bg-[#eee5d3]'
              }`}
              title="Buka atau kirim langsung ke aplikasi kalender di perangkat Anda (iOS / Android / Mac)"
            >
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>Sinkron Perangkat</span>
            </button>

            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-serif font-semibold transition-all flex items-center justify-center gap-1.5 ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : isNight
                  ? 'bg-[#182338] border-[#2a3a55] text-slate-300 hover:text-white hover:bg-[#202f48]'
                  : 'bg-white border-[#ded3be] text-slate-700 hover:text-black hover:bg-[#eee5d3]'
              }`}
              title="Salin isi berkas format iCalendar RFC 5545 ke clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin iCal'}</span>
            </button>

            {/* Download button */}
            <button
              type="button"
              onClick={handleDownload}
              className={`px-4 py-2.5 rounded-xl border text-xs font-serif font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                downloadSuccess
                  ? 'bg-emerald-500 border-emerald-400 text-black'
                  : 'bg-[#c59a43] hover:bg-[#d4af37] border-[#d4af37] text-black active:scale-95'
              }`}
              title="Unduh berkas .ICS untuk diimpor ke Google Calendar, Outlook, atau Apple Calendar"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Diunduh!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh .ICS ({daysCount} Hari)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
