import React, { useState, useMemo } from 'react';
import { ThemeMode, HistoricalDateInfo } from '../types';
import {
  calculate30DayActivityHistory,
  DailyActivityHistoryPoint,
  ActivityHistorySummary,
  ActivityCategoryKey,
  ACTIVITY_CATEGORIES,
} from '../lib/manzilCalculatorEngine';
import {
  TrendingUp,
  Calendar,
  Moon,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  BookmarkPlus,
  BarChart3,
  Flame,
  Sprout,
  Wind,
  Droplets,
  Layers,
  Heart,
  ChevronRight,
  Info,
  CalendarDays,
  Target,
  FileText,
} from 'lucide-react';

interface ManzilActivityHistoryChartProps {
  currentDateInfo: HistoricalDateInfo;
  theme: ThemeMode;
  onAnnotateManzil?: (title: string, content: string) => void;
  onSelectDateStep?: (hoursOffset: number) => void;
  onOpenExportModal?: () => void;
}

export const ManzilActivityHistoryChart: React.FC<ManzilActivityHistoryChartProps> = ({
  currentDateInfo,
  theme,
  onAnnotateManzil,
  onSelectDateStep,
  onOpenExportModal,
}) => {
  const isNight = theme === 'night';

  // Compute 30-day activity history
  const historyData: ActivityHistorySummary = useMemo(() => {
    return calculate30DayActivityHistory(currentDateInfo.jdn);
  }, [currentDateInfo.jdn]);

  // Selected category filter
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategoryKey>('all');

  // Chart display mode: 'chart' or 'grid'
  const [viewMode, setViewMode] = useState<'chart' | 'grid'>('chart');

  // Hovered day for interactive tooltip
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Selected day for detailed inspection (default to today, index 29)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(29);

  const selectedDay: DailyActivityHistoryPoint = useMemo(() => {
    return historyData.days[selectedDayIndex] || historyData.days[historyData.days.length - 1];
  }, [historyData.days, selectedDayIndex]);

  const activeCategoryConfig = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return ACTIVITY_CATEGORIES.find((c) => c.key === selectedCategory) || null;
  }, [selectedCategory]);

  // SVG Chart Geometry
  const chartWidth = 900;
  const chartHeight = 260;
  const padding = { top: 30, right: 30, bottom: 40, left: 45 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Compute points coordinates
  const chartPoints = useMemo(() => {
    const days = historyData.days;
    return days.map((d, idx) => {
      const x = padding.left + (idx / (days.length - 1)) * innerWidth;
      // Score value depends on selected category
      let score = d.dynamicMuhibbahScore;
      if (selectedCategory !== 'all') {
        score = d.categoryScores[selectedCategory] || d.dynamicMuhibbahScore;
      }
      // Y maps 0 -> innerHeight, 100 -> 0
      const y = padding.top + innerHeight - (score / 100) * innerHeight;
      return { x, y, score, day: d, idx };
    });
  }, [historyData.days, innerWidth, innerHeight, padding.left, padding.top, selectedCategory]);

  // Build SVG Path for Area and Line
  const { linePath, areaPath } = useMemo(() => {
    if (chartPoints.length === 0) return { linePath: '', areaPath: '' };

    let lPath = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 1; i < chartPoints.length; i++) {
      // Smooth cubic bezier or straight lines
      const prev = chartPoints[i - 1];
      const cur = chartPoints[i];
      const cx1 = prev.x + (cur.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (cur.x - prev.x) / 2;
      const cy2 = cur.y;
      lPath += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${cur.x} ${cur.y}`;
    }

    const aPath = `${lPath} L ${chartPoints[chartPoints.length - 1].x} ${padding.top + innerHeight} L ${chartPoints[0].x} ${padding.top + innerHeight} Z`;

    return { linePath: lPath, areaPath: aPath };
  }, [chartPoints, innerHeight, padding.top]);

  // Helper for fortune color
  const getFortuneTheme = (fortune: string) => {
    switch (fortune) {
      case 'Sa\'d Mahd':
        return {
          label: 'Sa\'d Maḥḍ (Sangat Beruntung)',
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          dot: '#10b981',
        };
      case 'Sa\'d':
        return {
          label: 'Sa\'d (Beruntung)',
          bg: 'bg-teal-500/15',
          border: 'border-teal-500/40',
          text: 'text-teal-400',
          dot: '#14b8a6',
        };
      case 'Muntasif':
        return {
          label: 'Muntaṣif (Netral / Sedang)',
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          dot: '#f59e0b',
        };
      case 'Nahs':
        return {
          label: 'Naḥs (Perlu Waspada)',
          bg: 'bg-orange-500/15',
          border: 'border-orange-500/40',
          text: 'text-orange-400',
          dot: '#f97316',
        };
      case 'Nahs Mahd':
        return {
          label: 'Naḥs Maḥḍ (Sangat Kritis)',
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/40',
          text: 'text-rose-400',
          dot: '#f43f5e',
        };
      default:
        return {
          label: 'Muntaṣif',
          bg: 'bg-slate-500/15',
          border: 'border-slate-500/40',
          text: 'text-slate-400',
          dot: '#94a3b8',
        };
    }
  };

  // Helper for element icon & color
  const getElementBadge = (element: string) => {
    switch (element) {
      case 'Nar':
        return { icon: Flame, label: 'Api (Nāriyyah)', color: '#f43f5e', textColor: 'text-rose-400' };
      case 'Turab':
        return { icon: Sprout, label: 'Tanah (Turābiyyah)', color: '#f59e0b', textColor: 'text-amber-400' };
      case 'Hawa':
        return { icon: Wind, label: 'Udara (Hawā\'iyyah)', color: '#38bdf8', textColor: 'text-sky-400' };
      case 'Ma':
        return { icon: Droplets, label: 'Air (Mā\'iyyah)', color: '#22d3ee', textColor: 'text-cyan-400' };
      default:
        return { icon: Sparkles, label: element, color: '#c59a43', textColor: 'text-amber-400' };
    }
  };

  // Save 30-Day Synthesis to annotations
  const handleSaveSynthesis = () => {
    if (!onAnnotateManzil) return;
    const title = `Laporan Tren Aktivitas 30 Hari (Manzil & Posisi Bulan)`;
    const topActionsText = historyData.topRecommendedActions
      .slice(0, 5)
      .map((a, i) => `${i + 1}. ${a.action} (Muncul ${a.count} hari)`)
      .join('\n');

    const content = `Sintesis Pola Saran Aktivitas Berdasarkan Posisi Bulan (30 Hari Terakhir):
- Rentang Tanggal: ${historyData.days[0].gregorian.dateFormatted} s.d. ${historyData.days[29].gregorian.dateFormatted} (${historyData.days[29].hijri.formatted})
- Manzil Aktif Saat Ini: #${selectedDay.mansion.number} ${selectedDay.mansion.transliteration} (${selectedDay.mansion.arabicName})
- Hari Puncak Berkah (Sa'd Maḥḍ): ${historyData.peakAuspiciousDays.map((d) => `${d.gregorian.shortDate} (#${d.mansion.number} ${d.mansion.transliteration})`).join(', ')}
- Hari Perlu Waspada (Naḥs): ${historyData.criticalCautionDays.map((d) => `${d.gregorian.shortDate} (#${d.mansion.number} ${d.mansion.transliteration})`).join(', ')}
- Distribusi Unsur Bulan: Api (${historyData.elementDistribution.Nar} hari), Tanah (${historyData.elementDistribution.Turab} hari), Udara (${historyData.elementDistribution.Hawa} hari), Air (${historyData.elementDistribution.Ma} hari)

Aktivitas Paling Sering Disarankan (Top Recommends):
${topActionsText}

Rekomendasi Hari Terpilih (${selectedDay.gregorian.dateFormatted} - Manzil #${selectedDay.mansion.number}):
• Dianjurkan (Al-Mustahabb): ${selectedDay.recommendedActions.join('; ')}
• Dihindari (Al-Makruh): ${selectedDay.avoidedActions.join('; ')}
• Sifat Muhibbah: ${selectedDay.mansion.muhibbahNature} (Skor: ${selectedDay.dynamicMuhibbahScore}/100)
• Bait Syair: "${selectedDay.mansion.classicalVerseArabic}" (${selectedDay.mansion.classicalVerseTranslation})`;

    onAnnotateManzil(title, content);
  };

  // Save single day annotation
  const handleSaveDayAnnotation = (d: DailyActivityHistoryPoint) => {
    if (!onAnnotateManzil) return;
    const title = `Telaah Aktivitas Manzil #${d.mansion.number} (${d.gregorian.dateFormatted})`;
    const content = `Telaah Aktivitas Harian Naskah Zij as-Sindhind & Qasida fi 'Ilm an-Nujum:
- Tanggal Masehi: ${d.gregorian.dateFormatted} (${d.dayOffset === 0 ? 'Hari Ini' : `${Math.abs(d.dayOffset)} hari lalu`})
- Tanggal Hijriah: ${d.hijri.formatted}
- Posisi Bulan: ${d.signNameLatin} (${d.signNameArabic}) ${d.signDegree}° ${d.signMinute}'
- Manzil: #${d.mansion.number} ${d.mansion.transliteration} (${d.mansion.arabicName}) - "${d.mansion.meaningId}"
- Sifat & Keberuntungan: ${d.mansion.fortune} (${d.mansion.elementLabel} • ${d.mansion.temperamentLabel})
- Skor Muhibbah: ${d.dynamicMuhibbahScore}/100

Aktivitas Sangat Dianjurkan (Al-Mustahabb):
${d.recommendedActions.map((a) => `• ${a}`).join('\n')}

Aktivitas yang Harus Dihindari (Al-Makruh):
${d.avoidedActions.map((a) => `• ${a}`).join('\n')}

Bait Syair Klasik:
"${d.mansion.classicalVerseArabic}"
Artinya: ${d.mansion.classicalVerseTranslation}`;

    onAnnotateManzil(title, content);
  };

  // Jump to specific day in application
  const handleJumpToDay = (d: DailyActivityHistoryPoint) => {
    if (!onSelectDateStep || d.dayOffset === 0) return;
    onSelectDateStep(d.dayOffset * 24);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header & Overview Card                                      */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isNight
            ? 'bg-gradient-to-br from-[#101522] via-[#0d121f] to-[#141b2d] border-[#222f46]'
            : 'bg-gradient-to-br from-[#fcf9f2] via-[#f7f2e6] to-[#eee5d3] border-[#ded3be]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-[#c59a43]/20 border border-[#c59a43]/40 text-[#d4af37]">
                HISTORI TREN 30 HARI TERAKHIR
              </span>
              <span className="text-xs font-mono opacity-60">
                {historyData.days[0].gregorian.shortDate} s.d. {historyData.days[29].gregorian.shortDate} ({historyData.totalDays} Hari Periode Bulan)
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#c59a43] flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#c59a43] shrink-0" />
              <span>سِجِلُّ سُنَنِ الأَعْمَالِ وَحَرَكَةِ القَمَرِ</span>
            </h2>
            <p className="text-xs sm:text-sm opacity-80 mt-1 max-w-3xl leading-relaxed">
              Analisis historis 30 hari pola saran aktivitas harian (*Al-Ikhtiyarat*) saat Bulan transit melintasi orbit 28 Manzil. Telusuri tren keberuntungan, harmoni (*Muhibbah*), dan saat-saat mustajab untuk hajat perniagaan, pernikahan, perjalanan, pengobatan, hingga penulisan riset.
            </p>
          </div>

          {/* Quick Summary Action */}
          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 flex-wrap">
            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                className={`px-3.5 py-2 rounded-xl text-xs font-serif font-semibold transition-all flex items-center gap-2 border shadow-sm ${
                  isNight
                    ? 'bg-[#182338] border-[#c59a43]/40 text-[#d4af37] hover:bg-[#202f4a]'
                    : 'bg-[#faf6ee] border-[#c59a43]/50 text-[#8e681b] hover:bg-[#f2e7d3]'
                }`}
                title="Ekspor jadwal 28 Manzil ke format iCalendar (.ics)"
              >
                <Calendar className="w-4 h-4 text-[#c59a43]" />
                <span>Ekspor Kalender (.ics)</span>
              </button>
            )}
            <button
              onClick={handleSaveSynthesis}
              className={`px-3.5 py-2 rounded-xl text-xs font-serif font-semibold transition-all flex items-center gap-2 border shadow-sm ${
                isNight
                  ? 'bg-[#182338] border-[#2d3e5e] text-amber-300 hover:bg-[#202f4a]'
                  : 'bg-white border-[#ded3be] text-amber-800 hover:bg-[#faf6ee]'
              }`}
            >
              <BookmarkPlus className="w-4 h-4 text-[#c59a43]" />
              <span>Simpan Sintesis ke Catatan Riset</span>
            </button>
          </div>
        </div>

        {/* Metric Badges Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-dashed border-[#c59a43]/20">
          <div
            className={`p-3 rounded-xl border ${
              isNight ? 'bg-[#0c101a]/70 border-[#1d273a]' : 'bg-white/70 border-[#e6dbc8]'
            }`}
          >
            <div className="text-[11px] opacity-65 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#c59a43]" />
              <span>Rentang Waktu</span>
            </div>
            <div className="text-base font-serif font-bold mt-1 text-[#c59a43]">
              30 Hari Melingkar
            </div>
            <div className="text-[10px] opacity-60 font-mono mt-0.5">
              1 Putaran Penuh Falak
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              isNight ? 'bg-[#0c101a]/70 border-[#1d273a]' : 'bg-white/70 border-[#e6dbc8]'
            }`}
          >
            <div className="text-[11px] opacity-65 flex items-center gap-1 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hari Puncak Sa'd</span>
            </div>
            <div className="text-base font-serif font-bold mt-1 text-emerald-400">
              {historyData.peakAuspiciousDays.length} Hari Berkah
            </div>
            <div className="text-[10px] opacity-60 font-mono mt-0.5">
              Skor Muhibbah &ge; 75
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              isNight ? 'bg-[#0c101a]/70 border-[#1d273a]' : 'bg-white/70 border-[#e6dbc8]'
            }`}
          >
            <div className="text-[11px] opacity-65 flex items-center gap-1 font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Hari Waspada Naḥs</span>
            </div>
            <div className="text-base font-serif font-bold mt-1 text-rose-400">
              {historyData.criticalCautionDays.length} Hari Waspada
            </div>
            <div className="text-[10px] opacity-60 font-mono mt-0.5">
              Hindari Akad / Ekspedisi
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              isNight ? 'bg-[#0c101a]/70 border-[#1d273a]' : 'bg-white/70 border-[#e6dbc8]'
            }`}
          >
            <div className="text-[11px] opacity-65 flex items-center gap-1 font-mono">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Keseimbangan Unsur</span>
            </div>
            <div className="text-xs font-mono font-bold mt-1 flex items-center gap-1.5 text-slate-300">
              <span className="text-rose-400">🔥{historyData.elementDistribution.Nar}</span>
              <span className="text-amber-400">🌱{historyData.elementDistribution.Turab}</span>
              <span className="text-sky-400">💨{historyData.elementDistribution.Hawa}</span>
              <span className="text-cyan-400">💧{historyData.elementDistribution.Ma}</span>
            </div>
            <div className="text-[10px] opacity-60 font-mono mt-0.5">
              Anasir Alam Tabiat
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Filter Bar & View Toggle                                   */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isNight ? 'bg-[#101522] border-[#222e44]' : 'bg-[#faf6ee] border-[#ded3be]'
        }`}
      >
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-serif font-semibold opacity-60 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#c59a43]" />
            <span>Fokus Hajat:</span>
          </span>

          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#c59a43] text-black shadow-sm'
                : isNight
                ? 'bg-[#182338] text-slate-300 hover:text-white'
                : 'bg-[#ede5d4] text-slate-700 hover:text-slate-900'
            }`}
          >
            Semua Hajat (Umum)
          </button>

          {ACTIVITY_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#c59a43] text-black shadow-sm'
                    : isNight
                    ? 'bg-[#182338] text-slate-300 hover:text-white'
                    : 'bg-[#ede5d4] text-slate-700 hover:text-slate-900'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Line Chart vs Matrix Grid */}
        <div
          className={`flex items-center p-1 rounded-lg border self-end md:self-auto shrink-0 ${
            isNight ? 'bg-[#0c101a] border-[#1d273a]' : 'bg-[#e7dfce] border-[#d4c7b0]'
          }`}
        >
          <button
            onClick={() => setViewMode('chart')}
            className={`px-2.5 py-1 rounded-md text-xs font-serif font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'chart'
                ? 'bg-[#c59a43] text-black shadow-sm'
                : isNight
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Kurva Tren</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 rounded-md text-xs font-serif font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-[#c59a43] text-black shadow-sm'
                : isNight
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Matriks 30 Hari</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Main Chart / Grid Container                                */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'chart' ? (
        <div
          className={`p-6 rounded-2xl border transition-all ${
            isNight ? 'bg-[#101522] border-[#222e44]' : 'bg-[#faf6ee] border-[#ded3be]'
          }`}
        >
          {/* Chart Header & Legend */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-sm font-serif font-bold text-[#c59a43] flex items-center gap-2">
                <span>
                  {activeCategoryConfig
                    ? `Kurva Tren Keserasian: ${activeCategoryConfig.label} (${activeCategoryConfig.arabic})`
                    : 'Kurva Tren Muhibbah & Keberuntungan Bulan (30 Hari)'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  SKOR 0 - 100
                </span>
              </div>
              <p className="text-xs opacity-70 mt-0.5">
                Arahkan kursor atau klik titik tanggal untuk menelaah Manzil dan daftar aktivitas anjuran klasik (*Mustahabb / Makruh*).
              </p>
            </div>

            {/* Legend Indicators */}
            <div className="flex items-center gap-3 text-xs font-mono opacity-80 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>Sa'd (&ge;70)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span>Muntaṣif (45-69)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                <span>Naḥs (&lt;45)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-[#c59a43] bg-transparent inline-block" />
                <span>Hari Ini</span>
              </span>
            </div>
          </div>

          {/* Responsive SVG Chart */}
          <div className="relative w-full overflow-x-auto pb-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full min-w-[720px] h-auto select-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Area Gradient */}
                <linearGradient id="historyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={activeCategoryConfig ? activeCategoryConfig.color : '#c59a43'}
                    stopOpacity={isNight ? '0.35' : '0.25'}
                  />
                  <stop
                    offset="100%"
                    stopColor={activeCategoryConfig ? activeCategoryConfig.color : '#c59a43'}
                    stopOpacity="0.0"
                  />
                </linearGradient>

                {/* Glow Filter for Points */}
                <filter id="glowPoint" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Reference Level Bands */}
              {/* Auspicious Zone (>= 75) */}
              <rect
                x={padding.left}
                y={padding.top}
                width={innerWidth}
                height={innerHeight * 0.25}
                fill={isNight ? '#10b981' : '#10b981'}
                fillOpacity={isNight ? '0.04' : '0.06'}
              />
              {/* Caution Zone (<= 35) */}
              <rect
                x={padding.left}
                y={padding.top + innerHeight * 0.65}
                width={innerWidth}
                height={innerHeight * 0.35}
                fill={isNight ? '#f43f5e' : '#f43f5e'}
                fillOpacity={isNight ? '0.04' : '0.06'}
              />

              {/* Horizontal Grid lines */}
              {[100, 75, 50, 25, 0].map((val) => {
                const y = padding.top + innerHeight - (val / 100) * innerHeight;
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + innerWidth}
                      y2={y}
                      stroke={isNight ? '#222f46' : '#d8cbaf'}
                      strokeDasharray={val === 50 ? '4 3' : '2 3'}
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3.5}
                      fill={isNight ? '#7e8ea6' : '#8c7b64'}
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Reference Zone Labels */}
              <text
                x={padding.left + innerWidth - 6}
                y={padding.top + 14}
                fill="#10b981"
                fillOpacity="0.75"
                fontSize="9"
                fontFamily="sans-serif"
                fontWeight="600"
                textAnchor="end"
              >
                ★ ZONA BERKAH (SA'D)
              </text>
              <text
                x={padding.left + innerWidth - 6}
                y={padding.top + innerHeight - 8}
                fill="#f43f5e"
                fillOpacity="0.75"
                fontSize="9"
                fontFamily="sans-serif"
                fontWeight="600"
                textAnchor="end"
              >
                ⚠ ZONA WASPADA (NAḤS)
              </text>

              {/* Area fill */}
              <path d={areaPath} fill="url(#historyAreaGrad)" />

              {/* Line path */}
              <path
                d={linePath}
                fill="none"
                stroke={activeCategoryConfig ? activeCategoryConfig.color : '#c59a43'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Vertical guideline for hovered point */}
              {hoveredDayIndex !== null && chartPoints[hoveredDayIndex] && (
                <line
                  x1={chartPoints[hoveredDayIndex].x}
                  y1={padding.top}
                  x2={chartPoints[hoveredDayIndex].x}
                  y2={padding.top + innerHeight}
                  stroke="#c59a43"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
              )}

              {/* Vertical guideline for selected point */}
              {chartPoints[selectedDayIndex] && (
                <line
                  x1={chartPoints[selectedDayIndex].x}
                  y1={padding.top}
                  x2={chartPoints[selectedDayIndex].x}
                  y2={padding.top + innerHeight}
                  stroke="#c59a43"
                  strokeWidth="2"
                  opacity="0.9"
                />
              )}

              {/* Interactive Points on the Curve */}
              {chartPoints.map((pt) => {
                const isHovered = hoveredDayIndex === pt.idx;
                const isSelected = selectedDayIndex === pt.idx;
                const fortune = getFortuneTheme(pt.day.mansion.fortune);
                const isToday = pt.day.isToday;

                return (
                  <g
                    key={pt.idx}
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedDayIndex(pt.idx)}
                    onMouseEnter={() => setHoveredDayIndex(pt.idx)}
                    onMouseLeave={() => setHoveredDayIndex(null)}
                  >
                    {/* Invisible larger hit target */}
                    <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" />

                    {/* Today Outer Glow Ring */}
                    {isToday && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={11}
                        fill="none"
                        stroke="#c59a43"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        opacity="0.9"
                      />
                    )}

                    {/* Selected Ring */}
                    {isSelected && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={9}
                        fill="none"
                        stroke="#c59a43"
                        strokeWidth="2"
                        filter="url(#glowPoint)"
                      />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 5.5 : isHovered ? 5 : isToday ? 4.5 : 3.5}
                      fill={fortune.dot}
                      stroke={isNight ? '#0b0f19' : '#ffffff'}
                      strokeWidth={isSelected || isHovered ? 2 : 1.2}
                    />

                    {/* Mansion number small label on hover / select */}
                    {(isSelected || isHovered || isToday) && (
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        fill={isNight ? '#ffffff' : '#000000'}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        #{pt.day.mansion.number}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* X Axis Labels: Date and Moon Sign */}
              {chartPoints.map((pt, i) => {
                // Show date every 3 or 4 points, or first/last/selected/today
                const showDate =
                  i === 0 ||
                  i === chartPoints.length - 1 ||
                  i % 4 === 0 ||
                  i === selectedDayIndex ||
                  pt.day.isToday;

                if (!showDate) return null;

                const isCurrent = pt.day.isToday;

                return (
                  <g key={`x-${i}`}>
                    <line
                      x1={pt.x}
                      y1={padding.top + innerHeight}
                      x2={pt.x}
                      y2={padding.top + innerHeight + 4}
                      stroke={isNight ? '#475569' : '#b0a28b'}
                      strokeWidth="1"
                    />
                    <text
                      x={pt.x}
                      y={padding.top + innerHeight + 16}
                      fill={isCurrent ? '#c59a43' : isNight ? '#94a3b8' : '#786751'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight={isCurrent ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {pt.day.gregorian.shortDate}
                    </text>
                    <text
                      x={pt.x}
                      y={padding.top + innerHeight + 28}
                      fill={isNight ? '#64748b' : '#9c8c74'}
                      fontSize="8"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                    >
                      {isCurrent ? 'HARI INI' : pt.day.signNameLatin.slice(0, 3)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating Tooltip during scrub/hover */}
            {hoveredDayIndex !== null && chartPoints[hoveredDayIndex] && (
              <div
                className={`absolute z-20 pointer-events-none p-2.5 rounded-xl border shadow-xl text-xs font-serif transition-opacity ${
                  isNight
                    ? 'bg-[#0f1422]/95 border-[#2c3d5a] text-slate-100'
                    : 'bg-white/95 border-[#ded3be] text-slate-900'
                }`}
                style={{
                  left: `${Math.min(
                    chartWidth - 220,
                    Math.max(10, chartPoints[hoveredDayIndex].x - 100)
                  )}px`,
                  top: `${Math.max(10, chartPoints[hoveredDayIndex].y - 95)}px`,
                  width: '210px',
                }}
              >
                <div className="flex items-center justify-between gap-1 mb-1 border-b pb-1 border-dashed border-[#c59a43]/30">
                  <span className="font-bold text-[#c59a43]">
                    {chartPoints[hoveredDayIndex].day.gregorian.dateFormatted}
                  </span>
                  <span className="text-[10px] font-mono opacity-70">
                    {chartPoints[hoveredDayIndex].day.dayOffset === 0
                      ? 'Hari Ini'
                      : `${Math.abs(chartPoints[hoveredDayIndex].day.dayOffset)} hari lalu`}
                  </span>
                </div>
                <div className="text-[11px] leading-snug">
                  <div className="font-semibold text-amber-300">
                    Manzil #{chartPoints[hoveredDayIndex].day.mansion.number}: {chartPoints[hoveredDayIndex].day.mansion.transliteration} ({chartPoints[hoveredDayIndex].day.mansion.arabicName})
                  </div>
                  <div className="opacity-75 text-[10px] mt-0.5">
                    Bulan di {chartPoints[hoveredDayIndex].day.signNameLatin} • Skor: {chartPoints[hoveredDayIndex].score}/100 ({chartPoints[hoveredDayIndex].day.mansion.fortune})
                  </div>
                  <div className="mt-1.5 text-[10px] text-emerald-400 line-clamp-1">
                    ✓ {chartPoints[hoveredDayIndex].day.recommendedActions[0]}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lunar Mansions Ribbon Bar (Below Chart) */}
          <div className="mt-4 pt-4 border-t border-[#c59a43]/20">
            <div className="flex items-center justify-between text-xs font-serif font-bold text-[#c59a43] mb-2">
              <span className="flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" />
                <span>Pita Singgahan 28 Manzil Bulan Sepanjang 30 Hari:</span>
              </span>
              <span className="text-[10px] font-mono opacity-60">
                Klik kartu manzil di bawah untuk meninjau detail
              </span>
            </div>

            <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1 overflow-x-auto pb-1">
              {historyData.days.map((d, idx) => {
                const isSelected = idx === selectedDayIndex;
                const elem = getElementBadge(d.mansion.element);
                const fortune = getFortuneTheme(d.mansion.fortune);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDayIndex(idx)}
                    title={`${d.gregorian.shortDate} - Manzil #${d.mansion.number} ${d.mansion.transliteration} (${d.mansion.fortune})`}
                    className={`p-1 rounded-md text-center border transition-all flex flex-col items-center justify-center min-w-[28px] ${
                      isSelected
                        ? 'bg-[#c59a43] border-[#d4af37] text-black shadow-md scale-105 z-10'
                        : isNight
                        ? 'bg-[#0f1422] border-[#1d273a] hover:border-[#c59a43]/50 text-slate-300'
                        : 'bg-white border-[#ded3be] hover:border-[#c59a43]/50 text-slate-700'
                    }`}
                  >
                    <span className="text-[8px] font-mono opacity-60">
                      {d.gregorian.day}
                    </span>
                    <span
                      className="text-[10px] font-bold font-mono"
                      style={{ color: isSelected ? '#000000' : fortune.dot }}
                    >
                      #{d.mansion.number}
                    </span>
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-0.5"
                      style={{ backgroundColor: isSelected ? '#000000' : elem.color }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* 4. Matrix / Calendar Grid View                                */
        /* ------------------------------------------------------------- */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {historyData.days.map((d, idx) => {
              const isSelected = idx === selectedDayIndex;
              const fortune = getFortuneTheme(d.mansion.fortune);
              const elem = getElementBadge(d.mansion.element);
              const ElemIcon = elem.icon;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? isNight
                        ? 'bg-[#1b253b] border-[#c59a43] shadow-lg ring-1 ring-[#c59a43]'
                        : 'bg-[#f7f0e0] border-[#c59a43] shadow-lg ring-1 ring-[#c59a43]'
                      : isNight
                      ? 'bg-[#101522] border-[#222e44] hover:border-[#384a68]'
                      : 'bg-[#faf6ee] border-[#ded3be] hover:border-[#b0a28b]'
                  }`}
                >
                  {/* Today Badge */}
                  {d.isToday && (
                    <span className="absolute -top-2 -right-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#c59a43] text-black shadow">
                      HARI INI
                    </span>
                  )}

                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#c59a43] font-serif">
                      {d.gregorian.shortDate}
                    </span>
                    <span className="text-[10px] font-mono opacity-60">
                      {d.hijri.day} {d.hijri.monthNameLatin.slice(0, 4)}
                    </span>
                  </div>

                  <div className="mt-1">
                    <div className="flex items-center gap-1.5 font-serif font-bold text-sm">
                      <span className="text-xs px-1.5 py-0.2 rounded font-mono bg-[#c59a43]/20 text-[#c59a43]">
                        #{d.mansion.number}
                      </span>
                      <span className="truncate">{d.mansion.transliteration}</span>
                    </div>
                    <div className="text-[11px] opacity-75 font-arabic text-amber-200/80 truncate mt-0.5">
                      {d.mansion.arabicName} - {d.mansion.meaningId}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] mt-2.5 pt-2 border-t border-dashed border-[#c59a43]/20 font-mono">
                    <span className={`px-1.5 py-0.5 rounded border ${fortune.bg} ${fortune.border} ${fortune.text}`}>
                      {d.mansion.fortune}
                    </span>
                    <span className="flex items-center gap-1 opacity-80">
                      <ElemIcon className="w-3 h-3" style={{ color: elem.color }} />
                      <span>{d.dynamicMuhibbahScore}/100</span>
                    </span>
                  </div>

                  {/* Top Action Preview */}
                  <div className="mt-2 text-[10px] opacity-80 line-clamp-1 text-emerald-400">
                    ✓ {d.recommendedActions[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. Detailed Day Inspector Panel (Al-Mustahabb & Al-Makruh)   */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isNight
            ? 'bg-[#101522] border-[#222e44]'
            : 'bg-[#faf6ee] border-[#ded3be]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-[#c59a43]/20">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#c59a43] text-black">
                RINCIAN TANGGAL: {selectedDay.gregorian.dateFormatted}
              </span>
              <span className="text-xs font-mono opacity-70">
                ({selectedDay.hijri.formatted}) •{' '}
                {selectedDay.dayOffset === 0
                  ? 'Hari Ini'
                  : `${Math.abs(selectedDay.dayOffset)} hari yang lalu`}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Bulan di {selectedDay.signNameLatin} ({selectedDay.signNameArabic}) {selectedDay.signDegree}° {selectedDay.signMinute}'
              </span>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#c59a43] mt-2 flex items-center gap-2">
              <span>Manzil #{selectedDay.mansion.number}: {selectedDay.mansion.transliteration} ({selectedDay.mansion.arabicName})</span>
              <span className="text-sm font-sans font-normal opacity-80">
                — "{selectedDay.mansion.meaningId}"
              </span>
            </h3>
          </div>

          {/* Action buttons for inspected day */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {selectedDay.dayOffset !== 0 && onSelectDateStep && (
              <button
                onClick={() => handleJumpToDay(selectedDay)}
                className={`px-3 py-1.5 rounded-xl text-xs font-serif font-semibold transition-all flex items-center gap-1.5 border ${
                  isNight
                    ? 'bg-[#182338] border-[#2d3e5e] text-sky-300 hover:bg-[#202f4a]'
                    : 'bg-white border-[#ded3be] text-sky-800 hover:bg-[#f2efe6]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Lompat ke Tanggal Ini</span>
              </button>
            )}

            <button
              onClick={() => handleSaveDayAnnotation(selectedDay)}
              className={`px-3 py-1.5 rounded-xl text-xs font-serif font-semibold transition-all flex items-center gap-1.5 border ${
                isNight
                  ? 'bg-[#182338] border-[#2d3e5e] text-amber-300 hover:bg-[#202f4a]'
                  : 'bg-white border-[#ded3be] text-amber-800 hover:bg-[#f2efe6]'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-[#c59a43]" />
              <span>Simpan Catatan Hari Ini</span>
            </button>
          </div>
        </div>

        {/* Content Breakdown: 2 Columns (Dianjurkan vs Dihindari) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
          {/* Recommended Actions (Al-Mustahabb) */}
          <div
            className={`p-4 rounded-xl border ${
              isNight
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-emerald-50/80 border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-serif font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Aktivitas Sangat Dianjurkan (Al-Mustahabb)</span>
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {selectedDay.recommendedActions.length} Sunan Klasik
              </span>
            </div>
            <ul className="space-y-2 text-xs">
              {selectedDay.recommendedActions.map((act, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                  <span className="opacity-90">{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Avoided Actions (Al-Makruh) */}
          <div
            className={`p-4 rounded-xl border ${
              isNight
                ? 'bg-rose-950/20 border-rose-500/30'
                : 'bg-rose-50/80 border-rose-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-serif font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Aktivitas yang Harus Dihindari (Al-Makruh)</span>
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {selectedDay.avoidedActions.length} Pantangan
              </span>
            </div>
            <ul className="space-y-2 text-xs">
              {selectedDay.avoidedActions.map((act, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                  <span className="opacity-90">{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mansion Astrological Context & Verse */}
        <div
          className={`p-4 rounded-xl border mt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            isNight ? 'bg-[#0c101a] border-[#1d273a]' : 'bg-[#f4ebd9] border-[#e2d5bd]'
          }`}
        >
          <div className="space-y-1">
            <div className="text-xs font-mono opacity-70 flex items-center gap-2 flex-wrap">
              <span>Gugus Bintang: <strong className="text-[#c59a43]">{selectedDay.mansion.starGroup}</strong></span>
              <span>•</span>
              <span>Anasir: <strong>{selectedDay.mansion.elementLabel}</strong></span>
              <span>•</span>
              <span>Tabi'at: <strong>{selectedDay.mansion.temperamentLabel}</strong></span>
              <span>•</span>
              <span>Derajat Muhibbah: <strong className="text-amber-300">{selectedDay.dynamicMuhibbahScore}/100</strong> ({selectedDay.mansion.muhibbahNature})</span>
            </div>
            <div className="text-xs italic font-serif opacity-85 text-[#c59a43] pt-1">
              "{selectedDay.mansion.classicalVerseTranslation}"
            </div>
          </div>
          <div className="font-arabic text-sm text-[#d4af37] text-right shrink-0">
            {selectedDay.mansion.classicalVerseArabic}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. Top Recommended Actions Frequency & Category Domain Stats   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 7 Most Recurring Actions Across 30 Days */}
        <div
          className={`lg:col-span-7 p-6 rounded-2xl border transition-all ${
            isNight ? 'bg-[#101522] border-[#222e44]' : 'bg-[#faf6ee] border-[#ded3be]'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-serif font-bold text-[#c59a43] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#c59a43]" />
              <span>Aktivitas Paling Sering Disarankan (Frekuensi 30 Hari)</span>
            </h3>
            <span className="text-[11px] font-mono opacity-65">
              Pola Berulang
            </span>
          </div>

          <div className="space-y-3">
            {historyData.topRecommendedActions.slice(0, 7).map((item, i) => {
              const percent = Math.round((item.count / 30) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif font-medium truncate max-w-[340px]">
                      {i + 1}. {item.action}
                    </span>
                    <span className="text-[11px] font-mono text-[#c59a43] shrink-0">
                      {item.count} hari ({percent}%)
                    </span>
                  </div>
                  <div
                    className={`w-full h-2 rounded-full overflow-hidden ${
                      isNight ? 'bg-[#1a2336]' : 'bg-[#e2d5be]'
                    }`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#c59a43] to-amber-300"
                      style={{ width: `${Math.min(100, (item.count / 8) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Domain Auspiciousness Summary (7 Life Aspects) */}
        <div
          className={`lg:col-span-5 p-6 rounded-2xl border transition-all ${
            isNight ? 'bg-[#101522] border-[#222e44]' : 'bg-[#faf6ee] border-[#ded3be]'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-serif font-bold text-[#c59a43] flex items-center gap-2">
              <Target className="w-5 h-5 text-[#c59a43]" />
              <span>Rata-Rata Keserasian per Bidang Hajat</span>
            </h3>
            <span className="text-[11px] font-mono opacity-65">
              Rerata Skor 30 Hari
            </span>
          </div>

          <div className="space-y-2.5">
            {historyData.categoryStats.map((cat) => {
              return (
                <div
                  key={cat.key}
                  onClick={() => {
                    setSelectedCategory(cat.key as any);
                    setViewMode('chart');
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedCategory === cat.key
                      ? 'border-[#c59a43] bg-[#c59a43]/10'
                      : isNight
                      ? 'bg-[#0c101a] border-[#1d273a] hover:border-[#2f4060]'
                      : 'bg-white border-[#ded3be] hover:border-[#b0a28b]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div>
                      <div className="text-xs font-serif font-semibold">
                        {cat.label}
                      </div>
                      <div className="text-[10px] opacity-60 font-arabic">
                        {cat.arabic} • {cat.daysCount} hari afinitas primer
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#c59a43]">
                      {cat.avgScore}/100
                    </span>
                    {cat.peakDay && (
                      <div className="text-[9px] font-mono opacity-60">
                        Puncak: {cat.peakDay.gregorian.shortDate}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
