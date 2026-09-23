import React, { useState, useMemo } from 'react';
import { ThemeMode, HistoricalDateInfo, PlanetaryPosition, AspectRelation, PlanetKey } from '../types';
import {
  calculateActiveManzil,
  filterMansionsByAffinity,
  AUSPICIOUS_INTENTS,
  ActiveManzilAnalysis,
} from '../lib/manzilCalculatorEngine';
import { DetailedManzil, MANZIL_DETAILED_DATA } from '../data/manzilDetailedData';
import { ManzilZodiacCircle } from './ManzilZodiacCircle';
import { ManzilActivityHistoryChart } from './ManzilActivityHistoryChart';
import { ManzilCalendarExportModal } from './ManzilCalendarExportModal';
import { ManzilGlobe3DView } from './ManzilGlobe3DView';
import { ManzilInfluencerScoreCard } from './ManzilInfluencerScoreCard';
import {
  calculateManzilInfluencerReport,
  ManzilInfluencerReport,
} from '../lib/manzilInfluencerEngine';
import {
  Moon,
  Sparkles,
  Flame,
  Droplets,
  Wind,
  Sprout,
  Compass,
  BookmarkPlus,
  HelpCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Heart,
  Scale,
  Shield,
  BookOpen,
  Filter,
  Check,
  ChevronRight,
  ExternalLink,
  Layers,
  Calendar,
  TrendingUp,
  BarChart3,
  Download,
  Globe,
  Award,
  Smartphone,
  Share2,
  CalendarDays,
} from 'lucide-react';
import {
  generateGoogleCalendarUrl,
  downloadSingleDayIcs,
  generateSingleDayIcsString,
  generateManzilEventsData,
  ManzilCalendarDayEvent,
  shareOrDownloadIcs,
} from '../lib/icalExport';

interface ManzilCalculatorViewProps {
  currentDateInfo: HistoricalDateInfo;
  moonPosition: PlanetaryPosition;
  allPositions?: Record<string, PlanetaryPosition>;
  aspects?: AspectRelation[];
  theme: ThemeMode;
  onAnnotateManzil?: (title: string, content: string) => void;
  onSelectDateStep?: (hoursOffset: number) => void;
  onNavigateToWafaq?: (manzilNumber?: number) => void;
}

const GREGORIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const ManzilCalculatorView: React.FC<ManzilCalculatorViewProps> = ({
  currentDateInfo,
  moonPosition,
  allPositions,
  aspects,
  theme,
  onAnnotateManzil,
  onSelectDateStep,
  onNavigateToWafaq,
}) => {
  const isNight = theme === 'night';

  // Active view tab within the Manzil Calculator
  type SubView = 'active_moon' | 'zodiac_circle' | 'globe_3d' | 'influencer_score' | 'history' | 'catalog' | 'ikhtiyarat';
  const [subView, setSubView] = useState<SubView>('active_moon');

  // Calculate real-time Manzil Influencer Score across all planetary positions
  const influencerReport: ManzilInfluencerReport = useMemo(() => {
    return calculateManzilInfluencerReport(allPositions, moonPosition);
  }, [allPositions, moonPosition]);

  // Search and filter state for catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAffinity, setSelectedAffinity] = useState<
    'all' | 'nikah' | 'tijarah' | 'safar' | 'ziraah' | 'tibb' | 'bina' | 'hikmah'
  >('all');
  const [inspectedMansion, setInspectedMansion] = useState<DetailedManzil | null>(null);

  // Selected intent for Ikhtiyarat finder
  const [selectedIntentId, setSelectedIntentId] = useState<string>(AUSPICIOUS_INTENTS[0].id);

  // iCal export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Calculate real-time active manzil
  const analysis: ActiveManzilAnalysis = useMemo(() => {
    return calculateActiveManzil(moonPosition, allPositions, aspects);
  }, [moonPosition, allPositions, aspects]);

  // Calendar sync feedback notification
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Active day event computed dynamically for instant 1-Click calendar sync
  const activeDayEvent: ManzilCalendarDayEvent = useMemo(() => {
    const events = generateManzilEventsData({
      startJdn: currentDateInfo.jdn,
      daysCount: 7,
      direction: 'forward',
      categoryFilter: 'all',
      includeAlarm: true,
      includeVerses: true,
      includeHijri: true,
    });
    return events[0];
  }, [currentDateInfo.jdn]);

  // Handle single day .ics download
  const handleDownloadTodayIcs = () => {
    if (!activeDayEvent) return;
    downloadSingleDayIcs(activeDayEvent);
    setSyncFeedback(`Berkas .ICS Manzil #${activeDayEvent.mansion.number} (${activeDayEvent.mansion.transliteration}) berhasil diunduh!`);
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  // Handle share or open in device calendar app
  const handleShareTodayIcs = async () => {
    if (!activeDayEvent) return;
    const content = generateSingleDayIcsString(activeDayEvent);
    const res = await shareOrDownloadIcs(
      `manzil-${activeDayEvent.mansion.number}-${activeDayEvent.startDateStr}.ics`,
      content,
      `Manzil #${activeDayEvent.mansion.number} ${activeDayEvent.mansion.transliteration}`
    );
    if (res === 'shared') {
      setSyncFeedback('Membuka aplikasi kalender perangkat...');
    } else {
      setSyncFeedback('Berkas .ICS berhasil diunduh ke perangkat Anda!');
    }
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  // Mansions list for catalog view
  const filteredMansions = useMemo(() => {
    let list = filterMansionsByAffinity(selectedAffinity);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.arabicName.includes(q) ||
          m.transliteration.toLowerCase().includes(q) ||
          m.meaningId.toLowerCase().includes(q) ||
          m.starGroup.toLowerCase().includes(q) ||
          m.constellation.toLowerCase().includes(q) ||
          m.number.toString() === q
      );
    }
    return list;
  }, [selectedAffinity, searchQuery]);

  // Handler for adding research annotation
  const handleSaveAnnotation = (m: DetailedManzil) => {
    if (!onAnnotateManzil) return;
    const title = `Telaah Manzil #${m.number} ${m.transliteration} (${m.arabicName})`;
    const content = `Analisis Manāzil al-Qamar berdasarkan naskah Zij as-Sindhind & Qasida fi 'Ilm an-Nujum:
- Nomor & Nama: #${m.number} ${m.transliteration} (${m.arabicName}) - ${m.meaningId}
- Rentang Ekliptika: ${m.zodiacSpan} (${m.zodiacSpanArabic})
- Gugus Bintang: ${m.starGroup} (${m.constellation})
- Unsur & Tabi'at: ${m.elementLabel} • ${m.temperamentLabel}
- Karakter Muhibbah: ${m.muhibbahNature} (Skor: ${m.muhibbahScore}/100)
- Uraian Muhibbah: ${m.muhibbahDescription}
- Penguasa Spiritual & Malaikat: ${m.spiritualRuler} • Khadim ${m.angelicForce} • Huruf ${m.abjadLetter}
- Aktivitas Dianjurkan (Al-Mustahabb):
  ${m.recommendedActions.map((a) => `• ${a}`).join('\n  ')}
- Aktivitas Dihindari (Al-Makruh):
  ${m.avoidedActions.map((a) => `• ${a}`).join('\n  ')}
- Bait Syair Klasik: "${m.classicalVerseArabic}" (${m.classicalVerseTranslation})
- Catatan Historis: ${m.classicalCommentary}
- Tanggal Analisis: ${currentDateInfo.gregorian.day} ${GREGORIAN_MONTHS[currentDateInfo.gregorian.month - 1] || currentDateInfo.gregorian.month} ${currentDateInfo.gregorian.year} M / ${currentDateInfo.hijri.day} ${currentDateInfo.hijri.monthNameLatin} ${currentDateInfo.hijri.year} H.`;

    onAnnotateManzil(title, content);
  };

  // Helper for element icon
  const getElementBadge = (element: DetailedManzil['element']) => {
    switch (element) {
      case 'Nar':
        return {
          icon: Flame,
          label: 'Api (Nāriyyah)',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        };
      case 'Turab':
        return {
          icon: Sprout,
          label: 'Tanah (Turābiyyah)',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        };
      case 'Hawa':
        return {
          icon: Wind,
          label: 'Udara (Hawā\'iyyah)',
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
        };
      case 'Ma':
        return {
          icon: Droplets,
          label: 'Air (Mā\'iyyah)',
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        };
    }
  };

  // Helper for fortune styling
  const getFortuneBadge = (fortune: DetailedManzil['fortune']) => {
    switch (fortune) {
      case 'Sa\'d Mahd':
        return {
          label: 'Sangat Beruntung (Sa\'d Maḥḍ)',
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
        };
      case 'Sa\'d':
        return {
          label: 'Beruntung (Sa\'d)',
          bg: 'bg-teal-500/15 border-teal-500/40 text-teal-300',
        };
      case 'Muntasif':
        return {
          label: 'Netral / Sedang (Muntaṣif)',
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
        };
      case 'Nahs':
        return {
          label: 'Kurang Beruntung (Naḥs)',
          bg: 'bg-orange-500/15 border-orange-500/40 text-orange-300',
        };
      case 'Nahs Mahd':
        return {
          label: 'Sangat Kritis (Naḥs Maḥḍ)',
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
        };
    }
  };

  const currentMansion = analysis.mansion;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isNight
            ? 'bg-gradient-to-br from-[#101626] via-[#0d121f] to-[#141b2d] border-[#222f46]'
            : 'bg-gradient-to-br from-[#fcf9f2] via-[#f7f2e6] to-[#eee5d3] border-[#ded3be]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-[#c59a43]/20 border border-[#c59a43]/40 text-[#d4af37]">
                MANĀZIL AL-QAMAR CALCULATOR
              </span>
              <span className="text-xs opacity-60 font-mono">
                {currentDateInfo.gregorian.day} {GREGORIAN_MONTHS[currentDateInfo.gregorian.month - 1] || currentDateInfo.gregorian.month} {currentDateInfo.gregorian.year} •{' '}
                {currentDateInfo.hijri.day} {currentDateInfo.hijri.monthNameLatin} {currentDateInfo.hijri.year} H
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#c59a43] flex items-center gap-2">
              <Moon className="w-7 h-7 text-[#c59a43] shrink-0" />
              <span>حَاسِبَةُ مَنَازِلِ القَمَرِ وَسُنَنُهَا</span>
            </h1>
            <p className="text-sm opacity-80 mt-1 max-w-3xl">
              Kalkulator presisi 28 Manzil Bulan berdasarkan <span className="font-semibold italic">Zij as-Sindhind</span> &amp; <span className="font-semibold italic">Qasida fi 'Ilm an-Nujum</span>. Menghitung sifat bawaan (*Tabi'at*), daya tarik keserasian (*Muhibbah*), dan tuntunan aktivitas harian (*Al-Ikhtiyarat*).
            </p>
          </div>

          {/* Sub Navigation Tabs & Export Button */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isNight ? 'bg-[#0b0f19] border-[#1d273a]' : 'bg-[#e7dfce] border-[#d4c7b0]'
              }`}
            >
              <button
                onClick={() => setSubView('active_moon')}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all flex items-center gap-1.5 ${
                  subView === 'active_moon'
                    ? 'bg-[#c59a43] text-black shadow'
                    : isNight
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Bulan Saat Ini</span>
              </button>
              <button
                id="subview-zodiac-circle-tab"
                onClick={() => setSubView('zodiac_circle')}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all flex items-center gap-1.5 ${
                  subView === 'zodiac_circle'
                    ? 'bg-[#c59a43] text-black shadow'
                    : isNight
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Lingkaran Zodiak 360°</span>
              </button>
              <button
                id="subview-globe-3d-tab"
                onClick={() => setSubView('globe_3d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all flex items-center gap-1.5 ${
                  subView === 'globe_3d'
                    ? 'bg-[#c59a43] text-black shadow'
                    : isNight
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Bola Langit 3D</span>
              </button>
              <button
                id="subview-influencer-score-tab"
                onClick={() => setSubView('influencer_score')}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all flex items-center gap-1.5 ${
                  subView === 'influencer_score'
                    ? 'bg-[#c59a43] text-black shadow'
                    : isNight
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Influencer Score</span>
              </button>
              <button
                id="subview-history-tab"
                onClick={() => setSubView('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all flex items-center gap-1.5 ${
                  subView === 'history'
                    ? 'bg-[#c59a43] text-black shadow'
                    : isNight
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Histori Tren 30 Hari</span>
              </button>
              <button
                onClick={() => setSubView('catalog')}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all flex items-center gap-1.5 ${
                  subView === 'catalog'
                    ? 'bg-[#c59a43] text-black shadow'
                    : isNight
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Katalog 28 Manzil</span>
              </button>
              <button
                onClick={() => setSubView('ikhtiyarat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all flex items-center gap-1.5 ${
                  subView === 'ikhtiyarat'
                    ? 'bg-[#c59a43] text-black shadow'
                    : isNight
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pencari Hari Baik</span>
              </button>
            </div>

            {/* iCal Calendar Export Trigger Button */}
            <button
              id="btn-export-manzil-ical"
              onClick={() => setIsExportModalOpen(true)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-serif font-bold transition-all flex items-center gap-2 shrink-0 shadow-sm ${
                isNight
                  ? 'bg-gradient-to-r from-[#182338] to-[#1d2b45] hover:from-[#202f4a] hover:to-[#25395c] border-[#c59a43]/40 text-[#d4af37]'
                  : 'bg-gradient-to-r from-[#fdfaf3] to-[#f5ebdb] hover:from-[#f7f0e1] hover:to-[#ede0cb] border-[#c59a43]/50 text-[#8e681b]'
              }`}
              title="Sinkronisasi jadwal transit 28 Manzil ke Google Calendar & aplikasi kalender (.ics)"
            >
              <Calendar className="w-4 h-4 text-[#c59a43]" />
              <span>Sinkron Kalender (.ics)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HERO SECTION: Current Moon's Mansion Calculation Card                     */}
      {/* ========================================================================= */}
      <div
        className={`p-6 rounded-2xl border relative overflow-hidden transition-all shadow-md ${
          isNight
            ? 'bg-[#101522] border-[#222e44]'
            : 'bg-[#faf6ee] border-[#ded3be]'
        }`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c59a43]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Big Mansion Badge & Identity */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#c59a43] text-black shadow-sm">
                MANZIL #{currentMansion.number}
              </span>
              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono border ${
                  getFortuneBadge(currentMansion.fortune).bg
                }`}
              >
                {getFortuneBadge(currentMansion.fortune).label}
              </span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#c59a43] tracking-wide">
                {currentMansion.arabicName}
              </h2>
              <p className="text-lg font-serif font-semibold mt-0.5 text-current">
                {currentMansion.transliteration}{' '}
                <span className="text-xs font-sans opacity-70 font-normal">({currentMansion.meaningId})</span>
              </p>
              <p className="text-xs font-mono opacity-80 mt-1">
                Gugus: <span className="font-semibold">{currentMansion.starGroup}</span> • {currentMansion.constellation}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {/* Element badge */}
              {(() => {
                const elem = getElementBadge(currentMansion.element);
                const Icon = elem.icon;
                return (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono ${elem.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{elem.label}</span>
                  </span>
                );
              })()}

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono ${
                  isNight ? 'bg-[#151c2e] border-[#25344f]' : 'bg-[#ede5d5] border-[#dacdb2]'
                }`}
              >
                <span>{currentMansion.temperamentLabel}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono ${
                  isNight ? 'bg-[#151c2e] border-[#25344f] text-purple-300' : 'bg-[#ede5d5] border-[#dacdb2] text-purple-800'
                }`}
              >
                <span>Khadim: {currentMansion.angelicForce} ({currentMansion.abjadLetter})</span>
              </span>
            </div>
          </div>

          {/* Center Column: Progress in Mansion & Coordinates */}
          <div className="lg:col-span-5 space-y-4 lg:border-x lg:px-6 border-current/10">
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="opacity-75 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-[#c59a43]" />
                  <span>Progres Bulan di Manzil Ini:</span>
                </span>
                <span className="font-bold text-[#c59a43]">
                  {analysis.degreeInMansionFormatted} / {analysis.totalSpanFormatted} ({analysis.progressPercent}%)
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full h-3 rounded-full bg-black/20 overflow-hidden border border-current/10 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c59a43] to-[#e6be67] transition-all duration-500 shadow-sm"
                  style={{ width: `${analysis.progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono opacity-70 mt-1">
                <span>Mulai: {currentMansion.startDegree.toFixed(2)}°</span>
                <span>Akhir: {currentMansion.endDegree.toFixed(2)}°</span>
              </div>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div
                className={`p-2.5 rounded-xl border ${
                  isNight ? 'bg-[#151d2e] border-[#222e46]' : 'bg-[#f4efe4] border-[#dfd5be]'
                }`}
              >
                <span className="text-[10px] font-mono opacity-70 block mb-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>Sisa Waktu Singgah:</span>
                </span>
                <p className="text-sm font-bold font-mono text-sky-400">
                  ± {analysis.estimatedHoursRemaining} Jam
                </p>
                <p className="text-[10px] opacity-60">Sisa busur: {analysis.remainingDegreeFormatted}</p>
              </div>

              <div
                className={`p-2.5 rounded-xl border ${
                  isNight ? 'bg-[#151d2e] border-[#222e46]' : 'bg-[#f4efe4] border-[#dfd5be]'
                }`}
              >
                <span className="text-[10px] font-mono opacity-70 block mb-0.5 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-emerald-400" />
                  <span>Manzil Berikutnya:</span>
                </span>
                <p className="text-sm font-bold font-serif text-[#c59a43] truncate">
                  #{analysis.nextMansion.number} {analysis.nextMansion.transliteration}
                </p>
                <p className="text-[10px] opacity-60 font-serif">{analysis.nextMansion.arabicName}</p>
              </div>
            </div>

            {/* Time step controls if supported */}
            {onSelectDateStep && (
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-[11px] opacity-60">Simulasi Waktu:</span>
                <button
                  onClick={() => onSelectDateStep(-12)}
                  className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
                    isNight ? 'hover:bg-[#1a2438] border-[#2b3a55]' : 'hover:bg-[#e8ded0] border-[#cfc0a8]'
                  }`}
                  title="Mundur 12 Jam"
                >
                  -12 Jam
                </button>
                <button
                  onClick={() => onSelectDateStep(12)}
                  className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
                    isNight ? 'hover:bg-[#1a2438] border-[#2b3a55]' : 'hover:bg-[#e8ded0] border-[#cfc0a8]'
                  }`}
                  title="Maju 12 Jam"
                >
                  +12 Jam
                </button>
                <button
                  onClick={() => onSelectDateStep(24)}
                  className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
                    isNight ? 'hover:bg-[#1a2438] border-[#2b3a55]' : 'hover:bg-[#e8ded0] border-[#cfc0a8]'
                  }`}
                  title="Maju 1 Hari (Manzil berikutnya)"
                >
                  +24 Jam (Hari Esok)
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Muhibbah Score (Affinity Gauge) */}
          <div className="lg:col-span-3 space-y-3 text-center lg:text-left">
            <div
              className={`p-4 rounded-xl border text-center transition-all ${
                analysis.dynamicMuhibbahScore >= 80
                  ? isNight
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-emerald-50 border-emerald-300'
                  : analysis.dynamicMuhibbahScore >= 50
                  ? isNight
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-amber-50 border-amber-300'
                  : isNight
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-rose-50 border-rose-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-semibold mb-1 opacity-75">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>DARAṠAT AL-MUHIBBAH</span>
              </div>

              <div className="flex items-baseline justify-center gap-1 my-1">
                <span className="text-4xl font-mono font-extrabold tracking-tight text-[#c59a43]">
                  {analysis.dynamicMuhibbahScore}
                </span>
                <span className="text-xs opacity-60 font-mono">/ 100</span>
              </div>

              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold font-serif ${
                  analysis.dynamicMuhibbahScore >= 80
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : analysis.dynamicMuhibbahScore >= 50
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {analysis.muhibbahQuality}
              </span>

              <p className="text-[11px] opacity-75 mt-2 line-clamp-2">
                {currentMansion.muhibbahNature}
              </p>
            </div>

            <button
              onClick={() => handleSaveAnnotation(currentMansion)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold bg-[#c59a43] text-black hover:bg-[#d4a84e] transition-colors shadow-sm"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Catat ke Anotasi Riset</span>
            </button>

            {onNavigateToWafaq && (
              <button
                onClick={() => onNavigateToWafaq(currentMansion.number)}
                className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold border transition-colors shadow-sm mt-2 ${
                  isNight
                    ? 'bg-[#1a233a] border-[#25344f] text-amber-300 hover:bg-[#222e4d]'
                    : 'bg-[#ede5d5] border-[#dacdb2] text-stone-800 hover:bg-[#e4dac6]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Rancang Jimat &amp; Wafaq Manzil Ini</span>
              </button>
            )}

            {/* Quick 1-Click Calendar Sync Section */}
            {activeDayEvent && (
              <div className="pt-2.5 mt-2 border-t border-current/10 space-y-2 text-left">
                <div className="flex items-center justify-between text-[11px] font-mono opacity-80">
                  <span className="flex items-center gap-1 text-[#c59a43] font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Sinkron Kalender Harian:</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono">
                    .ICS / Google
                  </span>
                </div>

                <a
                  href={generateGoogleCalendarUrl(activeDayEvent)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-transform active:scale-95"
                  title="Simpan posisi Manzil hari ini langsung ke Google Calendar Anda"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Google Calendar (Hari Ini)</span>
                  <ExternalLink className="w-3 h-3 opacity-75" />
                </a>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={handleDownloadTodayIcs}
                    className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-serif font-semibold border transition-colors ${
                      isNight
                        ? 'bg-[#151d2f] border-[#253652] text-amber-300 hover:bg-[#1d2940]'
                        : 'bg-[#faf6ee] border-[#ded3be] text-stone-800 hover:bg-[#ede5d5]'
                    }`}
                    title="Unduh berkas .ICS untuk hari ini"
                  >
                    <Download className="w-3 h-3 text-[#c59a43]" />
                    <span>Unduh .ICS</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareTodayIcs}
                    className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-serif font-semibold border transition-colors ${
                      isNight
                        ? 'bg-[#151d2f] border-[#253652] text-sky-300 hover:bg-[#1d2940]'
                        : 'bg-[#faf6ee] border-[#ded3be] text-sky-800 hover:bg-[#ede5d5]'
                    }`}
                    title="Sinkronkan atau kirim ke aplikasi kalender di perangkat Anda (iOS/Android/Mac)"
                  >
                    <Smartphone className="w-3 h-3 text-sky-400" />
                    <span>Perangkat</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Sync Feedback Toast */}
      {syncFeedback && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-3 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-200 text-xs shadow-xl flex items-center gap-2.5 font-serif backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBVIEW 1: Detailed Breakdown of the Active Moon Mansion                  */}
      {/* ========================================================================= */}
      {subView === 'active_moon' && (
        <div className="space-y-6">
          {/* Calendar Sync Dynamic Hub */}
          {activeDayEvent && (
            <div
              className={`p-5 sm:p-6 rounded-2xl border relative overflow-hidden transition-all shadow-md ${
                isNight
                  ? 'bg-gradient-to-br from-[#0e1424] via-[#101728] to-[#161f36] border-[#22314a]'
                  : 'bg-gradient-to-br from-[#fbf8f0] via-[#f7f1e3] to-[#efe5d3] border-[#ded2bd]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Left: Info & Context */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#c59a43]/20 border border-[#c59a43]/40 text-[#d4af37] flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      <span>SINKRONISASI OTOMATIS POSISI MANZIL (.ICS & GOOGLE)</span>
                    </span>
                    <span className="text-[11px] font-mono opacity-70">
                      Kompatibel: Google Calendar • Apple Calendar • Outlook • Android
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#c59a43] flex items-center gap-2">
                    <span>Integrasikan Posisi Manzil Hari Ini ke Kalender Pribadi Anda</span>
                  </h3>

                  <p className="text-xs opacity-85 leading-relaxed">
                    Setiap jadwal transit disematkan sebagai <strong className="text-current">All-Day Event Transparan</strong> (tidak membatasi status kesibukan kerja) lengkap dengan <em>Derajat Keberuntungan ({activeDayEvent.mansion.fortune})</em>, daftar ikhtiyarat <em>Al-Mustahabb</em>, pantangan <em>Al-Makruh</em>, bait syair klasik, dan pengingat pagi hari otomatis pukul 07:00.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono opacity-80">
                    <span className="px-2 py-0.5 rounded bg-black/15 border border-current/10">
                      📅 {activeDayEvent.gregorianFormatted} M ({activeDayEvent.hijriFormatted})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/15 border border-current/10">
                      🌙 Manzil #{activeDayEvent.mansion.number} {activeDayEvent.mansion.transliteration} ({activeDayEvent.mansion.arabicName})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      ✨ {activeDayEvent.fortuneLabel}
                    </span>
                  </div>
                </div>

                {/* Right: Action Buttons Group */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 min-w-[260px]">
                  {/* Google Calendar Direct 1-Click Link */}
                  <a
                    href={generateGoogleCalendarUrl(activeDayEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-serif font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform active:scale-95"
                    title="Buka langsung di Google Calendar pada peramban atau aplikasi"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Sinkron ke Google Calendar (1-Klik)</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  {/* Download single day .ics */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadTodayIcs}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold border transition-all ${
                        isNight
                          ? 'bg-[#151e33] border-[#293a57] text-[#d4af37] hover:bg-[#1c2944]'
                          : 'bg-[#faf6ee] border-[#d8cca8] text-stone-800 hover:bg-[#eee2ca]'
                      }`}
                      title="Unduh berkas .ICS untuk posisi Manzil hari ini saja"
                    >
                      <Download className="w-3.5 h-3.5 text-[#c59a43]" />
                      <span>Unduh .ICS Hari Ini</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareTodayIcs}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold border transition-all ${
                        isNight
                          ? 'bg-[#151e33] border-[#293a57] text-sky-300 hover:bg-[#1c2944]'
                          : 'bg-[#faf6ee] border-[#d8cca8] text-sky-800 hover:bg-[#eee2ca]'
                      }`}
                      title="Kirim atau buka langsung di aplikasi kalender perangkat Anda (iOS / Android / Mac)"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                      <span>Ke Kalender HP</span>
                    </button>
                  </div>

                  {/* Comprehensive 14 / 28 / 60 Day Cycle Export Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-serif font-bold text-xs bg-[#c59a43] hover:bg-[#d4af37] text-black shadow-md transition-all active:scale-95"
                    title="Buka pengaturan ekspor 14, 28, 30, atau 60 hari siklus Manzil ke berkas .ICS"
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>Sinkronisasi Siklus Penuh (28 Hari / 1 Siklus)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Classical Actions: Recommended vs Avoided */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recommended Actions (Al-Mustahabb) */}
            <div
              className={`p-6 rounded-2xl border transition-all ${
                isNight ? 'bg-[#101522] border-[#20312a]' : 'bg-[#f4faf6] border-[#c2e5d3]'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-emerald-400">
                    الأَعْمَالُ المَحْمُودَة (Aktivitas Sangat Dianjurkan)
                  </h3>
                  <p className="text-xs opacity-75">
                    Hajat yang mendapat taufik &amp; kelancaran menurut naskah falak klasik
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm">
                {currentMansion.recommendedActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Avoided Actions (Al-Makruh) */}
            <div
              className={`p-6 rounded-2xl border transition-all ${
                isNight ? 'bg-[#101522] border-[#362222]' : 'bg-[#fff5f5] border-[#f3c8c8]'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-rose-400">
                    الأَعْمَالُ المَكْرُوهَة (Aktivitas yang Harus Dihindari)
                  </h3>
                  <p className="text-xs opacity-75">
                    Perkara yang rentan kendala atau perselisihan di bawah naungan manzil ini
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm">
                {currentMansion.avoidedActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      ✕
                    </span>
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sifat Khusus Muhibbah & Tabi'at Deep Dive */}
          <div
            className={`p-6 rounded-2xl border ${
              isNight ? 'bg-[#101522] border-[#222e44]' : 'bg-[#faf6ee] border-[#ded3be]'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-rose-400" />
              <h3 className="text-lg font-serif font-bold text-[#c59a43]">
                خَصَائِصُ المَوَدَّةِ وَطَبِيعَةُ المَنْزِلَة (Sifat Khusus Muhibbah &amp; Tabi'at Manzil)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div
                className={`p-4 rounded-xl border ${
                  isNight ? 'bg-[#151c2e] border-[#24334c]' : 'bg-[#f4efe4] border-[#d8ccb3]'
                }`}
              >
                <span className="text-xs font-mono opacity-70 block mb-1">
                  Karakter Relasi &amp; Kasih Sayang:
                </span>
                <p className="text-sm font-semibold font-serif text-[#c59a43]">
                  {currentMansion.muhibbahNature}
                </p>
                <p className="text-xs opacity-80 mt-1 leading-relaxed">
                  {currentMansion.muhibbahDescription}
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border ${
                  isNight ? 'bg-[#151c2e] border-[#24334c]' : 'bg-[#f4efe4] border-[#d8ccb3]'
                }`}
              >
                <span className="text-xs font-mono opacity-70 block mb-1">
                  Kekuatan Spiritual &amp; Kosmik:
                </span>
                <p className="text-sm font-semibold font-serif">
                  Penguasa: <span className="text-[#c59a43]">{currentMansion.spiritualRuler}</span>
                </p>
                <p className="text-xs opacity-80 mt-1">
                  Khadim al-Falak: <span className="font-semibold">{currentMansion.angelicForce}</span>
                </p>
                <p className="text-xs opacity-80">
                  Huruf Hijaiyyah: <span className="font-bold text-[#c59a43]">{currentMansion.abjadLetter}</span>
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border ${
                  isNight ? 'bg-[#151c2e] border-[#24334c]' : 'bg-[#f4efe4] border-[#d8ccb3]'
                }`}
              >
                <span className="text-xs font-mono opacity-70 block mb-1">
                  Afinitas Bidang Kehidupan:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {currentMansion.primaryAffinities.map((aff) => (
                    <span
                      key={aff}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#c59a43]/15 text-[#d4af37] border border-[#c59a43]/30"
                    >
                      {aff === 'nikah'
                        ? '💍 Nikah & Muhibbah'
                        : aff === 'tijarah'
                        ? '⚖️ Tijarah / Bisnis'
                        : aff === 'safar'
                        ? '🧭 Safar / Perjalanan'
                        : aff === 'ziraah'
                        ? '🌾 Zira\'ah / Tani'
                        : aff === 'tibb'
                        ? '🌿 Tibb / Medis'
                        : aff === 'bina'
                        ? '🏛️ Bina\' / Properti'
                        : '📜 Hikmah / Riset'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Classical Poetry Verse Card (Qasida fi 'Ilm an-Nujum) */}
            <div
              className={`p-5 rounded-xl border relative overflow-hidden ${
                isNight ? 'bg-[#131929] border-[#2b3a55]' : 'bg-[#eee6d5] border-[#d0c2a7]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 text-xs font-mono text-[#c59a43]">
                <BookOpen className="w-4 h-4" />
                <span>قَصِيدَةٌ فِي عِلْمِ النُّجُومِ وَالأَنْوَاءِ (Bait Syair Manzil Klasik)</span>
              </div>

              <p className="text-lg sm:text-xl font-serif font-bold text-center text-[#c59a43] my-2 leading-relaxed" dir="rtl">
                {currentMansion.classicalVerseArabic}
              </p>
              <p className="text-xs font-serif italic text-center opacity-80 my-1">
                "{currentMansion.classicalVerseLatin}"
              </p>
              <p className="text-xs sm:text-sm text-center max-w-2xl mx-auto opacity-90 font-medium">
                Artinya: "{currentMansion.classicalVerseTranslation}"
              </p>

              <div className="mt-3 pt-3 border-t border-current/10 text-xs opacity-75 text-center">
                <span className="font-semibold text-[#c59a43]">Syarah Falak: </span>
                {currentMansion.classicalCommentary}
              </div>
            </div>

            {/* Dynamic Influencing Aspects on the Moon */}
            {analysis.influencingAspects.length > 0 && (
              <div className="mt-5 pt-4 border-t border-current/10">
                <span className="text-xs font-mono font-semibold block mb-2 opacity-80 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#c59a43]" />
                  <span>Pengaruh Aspek Planet Terhadap Bulan Saat Ini:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysis.influencingAspects.map((asp, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs ${
                        asp.isBenefic
                          ? isNight
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-emerald-50 border-emerald-300'
                          : isNight
                          ? 'bg-rose-950/20 border-rose-500/30'
                          : 'bg-rose-50 border-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-serif font-semibold mb-1">
                        <span className={asp.isBenefic ? 'text-emerald-400' : 'text-rose-400'}>
                          {asp.aspectType} dengan {asp.planetName}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            asp.isBenefic ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                          }`}
                        >
                          {asp.isBenefic ? '+Sa\'d' : '-Nahs'}
                        </span>
                      </div>
                      <p className="opacity-80">{asp.effectNote}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Banner Link to Zodiac Circle 360° */}
            <div
              id="open-zodiac-wheel-banner"
              onClick={() => setSubView('zodiac_circle')}
              className={`p-4 rounded-xl border cursor-pointer group transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 ${
                isNight
                  ? 'bg-gradient-to-r from-[#141b2e] to-[#1c253d] border-[#c59a43]/30 hover:border-[#c59a43] shadow-md'
                  : 'bg-gradient-to-r from-[#fefbf6] to-[#f7f2e7] border-[#c59a43]/40 hover:border-[#c59a43] shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-[#c59a43]/20 border border-[#c59a43]/40 text-[#c59a43] group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-serif font-bold text-[#c59a43]">
                      Visualisasi Grafis: Lingkaran Zodiak 28 Manzil &amp; Bintang Tetap (Falak 360°)
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      INTERAKTIF
                    </span>
                  </div>
                  <p className="text-xs opacity-75 mt-0.5">
                    Proyeksi diagram lingkaran 360° (*Falak ad-Dawa'ir*), sorotan posisi Bulan saat ini, dan konstelasi bintang tetap relevan.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#c59a43] group-hover:translate-x-1 transition-transform shrink-0">
                <span>Buka Lingkaran Zodiak</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Quick Banner Link to Manzil Influencer Score */}
            <div
              id="open-influencer-score-banner"
              onClick={() => setSubView('influencer_score')}
              className={`p-4 rounded-xl border cursor-pointer group transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 ${
                isNight
                  ? 'bg-gradient-to-r from-[#141b2e] to-[#1c253d] border-[#c59a43]/40 hover:border-[#c59a43] shadow-md'
                  : 'bg-gradient-to-r from-[#fefbf6] to-[#fbf7ee] border-[#c59a43]/40 hover:border-[#c59a43] shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-500 group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-serif font-bold text-[#c59a43]">
                      Manzil Influencer Score: Bobot Pengaruh Planet Menurut Qasida
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#c59a43]/20 text-[#d4af37] border border-[#c59a43]/30">
                      SKOR {influencerReport.compositeScore}%
                    </span>
                  </div>
                  <p className="text-xs opacity-75 mt-0.5">
                    Hitung martabat planet (Sa'd &amp; Nahs) di 28 Manzil, telaah planet paling membawa berkah ({influencerReport.leadingBenefic.planetNameLatin}) dan panduan syair Qasida fi 'Ilm an-Nujum.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#c59a43] group-hover:translate-x-1 transition-transform shrink-0">
                <span>Buka Influencer Score</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Quick Banner Link to 3D Globe */}
            <div
              id="open-3d-globe-banner"
              onClick={() => setSubView('globe_3d')}
              className={`p-4 rounded-xl border cursor-pointer group transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 ${
                isNight
                  ? 'bg-gradient-to-r from-[#141b2e] to-[#1c253d] border-[#38bdf8]/30 hover:border-[#38bdf8] shadow-md'
                  : 'bg-gradient-to-r from-[#fefbf6] to-[#f0f8ff] border-[#38bdf8]/40 hover:border-[#38bdf8] shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8]/40 text-[#38bdf8] group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-serif font-bold text-[#38bdf8]">
                      Eksplorasi 3D: Bola Langit Manzil 3D (Celestial Globe D3.js)
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30">
                      PROYEKSI D3 3D
                    </span>
                  </div>
                  <p className="text-xs opacity-75 mt-0.5">
                    Putar bola langit tiga dimensi 360°, amati posisi konstelasi dan 28 Manzil secara presisi dari perspektif koordinat lokal (Alt-Azimuth) maupun ekuatorial langit.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#38bdf8] group-hover:translate-x-1 transition-transform shrink-0">
                <span>Buka Bola 3D</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Quick Banner Link to 30-Day Activity History Graph */}
            <div
              id="open-activity-history-banner"
              onClick={() => setSubView('history')}
              className={`p-4 rounded-xl border cursor-pointer group transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 ${
                isNight
                  ? 'bg-gradient-to-r from-[#141b2e] to-[#1c253d] border-[#10b981]/30 hover:border-[#10b981] shadow-md'
                  : 'bg-gradient-to-r from-[#fefbf6] to-[#f2f8f5] border-[#10b981]/40 hover:border-[#10b981] shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-serif font-bold text-emerald-400">
                      Grafik Histori: Tren Saran Aktivitas Harian (30 Hari Terakhir)
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      HISTORI 30 HARI
                    </span>
                  </div>
                  <p className="text-xs opacity-75 mt-0.5">
                    Telaah fluktuasi saran ikhtiyarat, skor harmoni muhibbah, dan frekuensi rekomendasi perniagaan, perjalanan, maupun pernikahan selama siklus 30 hari.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0">
                <span>Buka Grafik Histori</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Quick Banner Link to Calendar (.ICS) Export */}
            <div
              id="open-calendar-export-banner"
              onClick={() => setIsExportModalOpen(true)}
              className={`p-4 rounded-xl border cursor-pointer group transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 ${
                isNight
                  ? 'bg-gradient-to-r from-[#141b2e] to-[#1c253d] border-[#c59a43]/30 hover:border-[#c59a43] shadow-md'
                  : 'bg-gradient-to-r from-[#fefbf6] to-[#fbf7ee] border-[#c59a43]/40 hover:border-[#c59a43] shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-[#c59a43]/20 border border-[#c59a43]/40 text-[#d4af37] group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-serif font-bold text-[#c59a43]">
                      Integrasikan Siklus 28 Manzil ke Kalender Pribadi (.ics)
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#c59a43]/20 text-[#d4af37] border border-[#c59a43]/30">
                      GOOGLE / APPLE / OUTLOOK
                    </span>
                  </div>
                  <p className="text-xs opacity-75 mt-0.5">
                    Ekspor seluruh anjuran aktivitas harian (Al-Mustahabb &amp; Al-Makruh), derajat keberuntungan, dan bait syair klasik ke kalender ponsel atau komputer Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#c59a43] group-hover:translate-x-1 transition-transform shrink-0">
                <span>Buka Ekspor Kalender</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBVIEW: Visualisasi Grafis Lingkaran Zodiak 28 Manzil (Falak 360°)       */}
      {/* ========================================================================= */}
      {subView === 'zodiac_circle' && (
        <div className="space-y-6">
          <ManzilZodiacCircle
            moonPosition={moonPosition}
            allPositions={allPositions as any}
            aspects={aspects}
            currentDateInfo={currentDateInfo}
            activeManzilNumber={analysis.mansion.number}
            theme={theme}
            onSelectManzil={(m) => setInspectedMansion(m)}
            onAnnotateManzil={onAnnotateManzil}
            onSelectDateStep={onSelectDateStep}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBVIEW: Manzil 3D Globe Celestial Sphere (D3.js Orthographic)            */}
      {/* ========================================================================= */}
      {subView === 'globe_3d' && (
        <div className="space-y-6">
          <ManzilGlobe3DView
            currentDateInfo={currentDateInfo}
            moonPosition={moonPosition}
            allPositions={(allPositions || {}) as Record<PlanetKey, PlanetaryPosition>}
            theme={theme}
            onAnnotateManzil={(manzilNum, title, content) => {
              if (onAnnotateManzil) {
                onAnnotateManzil(title, content);
              }
            }}
            onSelectDateStep={onSelectDateStep}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBVIEW: Manzil Influencer Score (Qasida fi 'Ilm an-Nujum)                */}
      {/* ========================================================================= */}
      {subView === 'influencer_score' && (
        <div className="space-y-6">
          <ManzilInfluencerScoreCard
            report={influencerReport}
            theme={theme}
            onAnnotate={onAnnotateManzil}
            onNavigateToWafaq={onNavigateToWafaq}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBVIEW: Grafik Histori Tren Aktivitas Harian (30 Hari Terakhir)          */}
      {/* ========================================================================= */}
      {subView === 'history' && (
        <div className="space-y-6">
          <ManzilActivityHistoryChart
            currentDateInfo={currentDateInfo}
            theme={theme}
            onAnnotateManzil={onAnnotateManzil}
            onSelectDateStep={onSelectDateStep}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBVIEW 2: Interactive 28 Mansions Directory & Lookup                     */}
      {/* ========================================================================= */}
      {subView === 'catalog' && (
        <div className="space-y-6">
          {/* Filter Bar & Search */}
          <div
            className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center justify-between ${
              isNight ? 'bg-[#101522] border-[#222e44]' : 'bg-[#faf6ee] border-[#ded3be]'
            }`}
          >
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama Arab, Latin, bintang..."
                className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs border outline-none font-serif transition-colors ${
                  isNight
                    ? 'bg-[#151c2e] border-[#273650] text-[#e6ded0] focus:border-[#c59a43]'
                    : 'bg-white border-[#d8cca8] text-[#2b241c] focus:border-[#c59a43]'
                }`}
              />
            </div>

            {/* Affinity Quick Filters */}
            <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0 text-xs">
              {[
                { id: 'all', label: 'Semua (28)' },
                { id: 'nikah', label: '💍 Nikah & Cinta' },
                { id: 'tijarah', label: '⚖️ Tijarah / Bisnis' },
                { id: 'safar', label: '🧭 Safar' },
                { id: 'ziraah', label: '🌾 Pertanian' },
                { id: 'tibb', label: '🌿 Kesehatan' },
                { id: 'bina', label: '🏛️ Properti' },
                { id: 'hikmah', label: '📜 Hikmah' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedAffinity(filter.id as any)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-serif transition-colors ${
                    selectedAffinity === filter.id
                      ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                      : isNight
                      ? 'bg-[#151c2e] hover:bg-[#1f2a44] text-[#cbd5e1]'
                      : 'bg-[#ede5d5] hover:bg-[#e2d6c1] text-[#4a3f31]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* 28 Mansions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredMansions.map((m) => {
              const isCurrent = m.number === currentMansion.number;
              const fortune = getFortuneBadge(m.fortune);
              const elem = getElementBadge(m.element);
              const ElemIcon = elem.icon;

              return (
                <div
                  key={m.number}
                  onClick={() => setInspectedMansion(m)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] relative ${
                    isCurrent
                      ? 'ring-2 ring-[#c59a43] shadow-md shadow-[#c59a43]/10'
                      : ''
                  } ${
                    isNight
                      ? 'bg-[#101522] hover:bg-[#151c2e] border-[#222e44]'
                      : 'bg-[#faf6ee] hover:bg-[#f3ebd9] border-[#ded3be]'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#c59a43] text-black shadow">
                      BULAN SAAT INI
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-[#c59a43]">
                      #{m.number}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border font-mono ${fortune.bg}`}>
                      {fortune.label.split(' ')[0]}
                    </span>
                  </div>

                  <div className="mb-2">
                    <h4 className="text-xl font-serif font-bold text-[#c59a43]">{m.arabicName}</h4>
                    <p className="text-xs font-serif font-semibold">{m.transliteration}</p>
                    <p className="text-[11px] opacity-70 line-clamp-1">{m.meaningId}</p>
                  </div>

                  <div className="text-[11px] font-mono opacity-70 space-y-0.5 border-t border-current/10 pt-2 mb-2">
                    <p className="truncate">{m.zodiacSpan}</p>
                    <p className="truncate flex items-center gap-1">
                      <ElemIcon className="w-3 h-3 text-[#c59a43]" />
                      <span>{m.elementLabel}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                    <span className="text-rose-400 flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{m.muhibbahScore}/100</span>
                    </span>
                    <span className="text-sky-400 flex items-center gap-0.5 hover:underline">
                      <span>Telaah</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMansions.length === 0 && (
            <div className="text-center py-12 opacity-60 font-serif">
              Tidak ada Manzil yang sesuai dengan kriteria pencarian.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBVIEW 3: Auspicious Intent Finder (Al-Ikhtiyarat al-Falakiyyah)          */}
      {/* ========================================================================= */}
      {subView === 'ikhtiyarat' && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-2xl border ${
              isNight ? 'bg-[#101522] border-[#222e44]' : 'bg-[#faf6ee] border-[#ded3be]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#c59a43]" />
              <h3 className="text-lg font-serif font-bold text-[#c59a43]">
                اخْتِيَارَاتُ السَّاعَاتِ وَالأَيَّامِ (Pencari Hari &amp; Manzil Terbaik)
              </h3>
            </div>
            <p className="text-xs sm:text-sm opacity-80 mb-5 max-w-2xl">
              Pilih niat atau hajat aktivitas yang hendak Anda mulai untuk melihat rekomendasi Manzil utama yang dipuji oleh para filsuf astronomi Islam kuno.
            </p>

            {/* Intent Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {AUSPICIOUS_INTENTS.map((intent) => {
                const isSelected = intent.id === selectedIntentId;
                return (
                  <button
                    key={intent.id}
                    onClick={() => setSelectedIntentId(intent.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#c59a43] text-black border-[#c59a43] font-bold shadow-md'
                        : isNight
                        ? 'bg-[#151c2e] hover:bg-[#1a2438] border-[#24334c]'
                        : 'bg-[#f4efe4] hover:bg-[#eae3d5] border-[#d8ccb3]'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-mono block opacity-75">
                      {intent.category}
                    </span>
                    <span className="text-xs sm:text-sm font-serif block mt-0.5 leading-snug">
                      {intent.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Intent Details & Matched Mansions */}
            {(() => {
              const activeIntent = AUSPICIOUS_INTENTS.find((i) => i.id === selectedIntentId);
              if (!activeIntent) return null;

              const matchedMansions = MANZIL_DETAILED_DATA.filter((m) =>
                activeIntent.bestMansionNumbers.includes(m.number)
              );

              return (
                <div
                  className={`p-5 rounded-xl border ${
                    isNight ? 'bg-[#151c2e] border-[#25344f]' : 'bg-[#eee6d5] border-[#d0c2a7]'
                  }`}
                >
                  <h4 className="text-base font-serif font-bold text-[#c59a43] mb-1">
                    Petunjuk Naskah Klasik: {activeIntent.title}
                  </h4>
                  <p className="text-xs sm:text-sm opacity-90 leading-relaxed mb-4">
                    {activeIntent.practicalAdvice}
                  </p>

                  <span className="text-xs font-mono font-semibold block mb-2 text-[#c59a43]">
                    Manzil Paling Dianjurkan ({matchedMansions.length} Manzil Terpilih):
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {matchedMansions.map((m) => {
                      const isCurrent = m.number === currentMansion.number;
                      return (
                        <div
                          key={m.number}
                          onClick={() => setInspectedMansion(m)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                            isCurrent ? 'ring-2 ring-[#c59a43]' : ''
                          } ${
                            isNight
                              ? 'bg-[#101522] border-[#2a3952]'
                              : 'bg-[#faf6ee] border-[#ded3be]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-mono text-[#c59a43] mb-1">
                            <span>#{m.number}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#c59a43] text-black font-bold">
                                HARI INI
                              </span>
                            )}
                          </div>
                          <p className="text-base font-serif font-bold text-[#c59a43]">
                            {m.arabicName}
                          </p>
                          <p className="text-xs font-serif font-semibold">{m.transliteration}</p>
                          <p className="text-[11px] opacity-70 mt-1 truncate">{m.zodiacSpan}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Quick Export to iCal for Auspicious Intents */}
            <div
              className={`mt-5 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isNight
                  ? 'bg-gradient-to-r from-[#141b2e] to-[#1c253d] border-[#c59a43]/30'
                  : 'bg-gradient-to-r from-[#faf6ee] to-[#f5ecd8] border-[#c59a43]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#c59a43]/20 border border-[#c59a43]/40 text-[#d4af37] shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#c59a43]">
                    Ekspor Jadwal Hari Baik ke Aplikasi Kalender (.ics)
                  </h4>
                  <p className="text-[11px] opacity-75 mt-0.5">
                    Integrasikan hari-hari pilihan dan tuntunan aktivitas ke Google Calendar, Apple Calendar, atau Microsoft Outlook dengan pengingat harian otomatis.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-serif font-bold bg-[#c59a43] hover:bg-[#d4a84e] text-black transition-all shrink-0 flex items-center justify-center gap-2 shadow"
              >
                <Download className="w-4 h-4" />
                <span>Buka Ekspor Kalender (.ics)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL / INSPECTOR FOR ANY CLICKED MANZIL                                   */}
      {/* ========================================================================= */}
      {inspectedMansion && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl relative space-y-4 ${
              isNight ? 'bg-[#101522] border-[#2b3a55] text-[#e6ded0]' : 'bg-[#faf6ee] border-[#cbbca3] text-[#2c241b]'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => setInspectedMansion(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-current/20 hover:bg-current/10 transition-colors"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#c59a43] text-black">
                  MANZIL #{inspectedMansion.number}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-mono border ${getFortuneBadge(inspectedMansion.fortune).bg}`}>
                  {getFortuneBadge(inspectedMansion.fortune).label}
                </span>
              </div>
              <h3 className="text-3xl font-serif font-bold text-[#c59a43]">
                {inspectedMansion.arabicName}
              </h3>
              <p className="text-base font-serif font-semibold">
                {inspectedMansion.transliteration} ({inspectedMansion.meaningId})
              </p>
              <p className="text-xs font-mono opacity-70 mt-0.5">
                Bujur: {inspectedMansion.zodiacSpan} • Gugus: {inspectedMansion.starGroup}
              </p>
            </div>

            {/* Muhibbah & Sifat */}
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed ${
                isNight ? 'bg-[#151c2e] border-[#25344f]' : 'bg-[#eee5d5] border-[#d0c2a7]'
              }`}
            >
              <span className="font-bold text-[#c59a43] block mb-1">
                Sifat Khusus Muhibbah (Kasih &amp; Kerukunan):
              </span>
              <p className="font-semibold text-rose-400 mb-1">{inspectedMansion.muhibbahNature}</p>
              <p className="opacity-90">{inspectedMansion.muhibbahDescription}</p>
            </div>

            {/* Classical Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                className={`p-3.5 rounded-xl border ${
                  isNight ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-300'
                }`}
              >
                <span className="font-bold text-emerald-400 block mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Dianjurkan (Al-Mustahabb):</span>
                </span>
                <ul className="space-y-1 opacity-90">
                  {inspectedMansion.recommendedActions.map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isNight ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-300'
                }`}
              >
                <span className="font-bold text-rose-400 block mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Dihindari (Al-Makruh):</span>
                </span>
                <ul className="space-y-1 opacity-90">
                  {inspectedMansion.avoidedActions.map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Verse */}
            <div
              className={`p-3.5 rounded-xl border text-center text-xs ${
                isNight ? 'bg-[#151c2e] border-[#25344f]' : 'bg-[#eee5d5] border-[#d0c2a7]'
              }`}
            >
              <p className="font-serif font-bold text-[#c59a43] text-base leading-relaxed" dir="rtl">
                {inspectedMansion.classicalVerseArabic}
              </p>
              <p className="italic opacity-80 mt-1">"{inspectedMansion.classicalVerseTranslation}"</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  handleSaveAnnotation(inspectedMansion);
                  setInspectedMansion(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-serif font-semibold bg-[#c59a43] text-black hover:bg-[#d4a84e] transition-colors"
              >
                Catat Manzil Ini ke Riset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ICALENDAR (.ICS) EXPORT MODAL                                             */}
      {/* ========================================================================= */}
      <ManzilCalendarExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentDateInfo={currentDateInfo}
        theme={theme}
      />
    </div>
  );
};
