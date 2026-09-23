import React, { useState, useMemo } from 'react';
import { PlanetKey, ThemeMode, HistoricalDateInfo } from '../types';
import {
  calculateSindhindPositions,
  PLANETS_INFO,
  ZODIAC_SIGNS,
} from '../lib/sindhindEngine';
import {
  calculateSynastryReport,
  SynastryAspect,
  SynastryReport,
} from '../lib/synastryEngine';
import {
  getFullHistoricalDate,
} from '../lib/calendarConverter';
import {
  Compass,
  Sparkles,
  Calendar,
  Layers,
  ArrowRightLeft,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  BookmarkPlus,
  HelpCircle,
  Calculator,
  ChevronDown,
  ChevronUp,
  Heart,
  Brain,
  Flame,
  Shield,
  Clock,
} from 'lucide-react';

interface SynastryMatrixViewProps {
  currentDateInfo: HistoricalDateInfo;
  theme: ThemeMode;
  onAnnotateSynastry?: (title: string, summary: string) => void;
}

// Classical historical presets
interface PresetItem {
  id: string;
  name: string;
  desc: string;
  chartA: { year: number; month: number; day: number; hour: number; title: string };
  chartB: { year: number; month: number; day: number; hour: number; title: string };
}

const HISTORICAL_PRESETS: PresetItem[] = [
  {
    id: 'baghdad_vs_sindhind',
    name: 'Madinat as-Salam (Baghdad 145 H) vs Zij as-Sindhind (215 H)',
    desc: 'Perbandingan saat penetapan waktu berdirinya Baghdad oleh tim astrolog Nawbakht & Masha\'allah (762 M) dengan era penulisan kitab astronomi Al-Khwarizmi (830 M).',
    chartA: { year: 762, month: 7, day: 30, hour: 14, title: 'Madinat as-Salam (Baghdad 145 H / 762 M)' },
    chartB: { year: 830, month: 3, day: 15, hour: 10, title: 'Zij as-Sindhind Al-Khwarizmi (215 H / 830 M)' },
  },
  {
    id: 'bayt_al_hikmah_vs_battani',
    name: 'Zaman Emas Al-Ma\'mun (830 M) vs Risalah Al-Battani (880 M)',
    desc: 'Kompatibilitas titik balik penerjemahan karya falak di Baghdad dengan era penyempurnaan katalog bintang ar-Raqqah.',
    chartA: { year: 830, month: 6, day: 21, hour: 12, title: 'Era Al-Ma\'mun (Baghdad 830 M)' },
    chartB: { year: 880, month: 9, day: 23, hour: 12, title: 'Katalog Al-Battani (880 M)' },
  },
  {
    id: 'hilal_vs_badr',
    name: 'Siklus Lentera: Ijtima\' Hilal (Bulan Baru) vs Badr (Purnama)',
    desc: 'Perbandingan energi saat fana\' cahaya (Konjungsi Matahari-Bulan) dengan saat kemuncak cahaya (Purnama sempurna).',
    chartA: { year: 830, month: 1, day: 28, hour: 18, title: 'Ijtima\' Awal Bulan (Hilal Baru)' },
    chartB: { year: 830, month: 2, day: 12, hour: 23, title: 'Istiqbal Badr (Purnama Penuh)' },
  },
];

export const SynastryMatrixView: React.FC<SynastryMatrixViewProps> = ({
  currentDateInfo,
  theme,
  onAnnotateSynastry,
}) => {
  const isNight = theme === 'night';

  // Selected Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('baghdad_vs_sindhind');

  // Chart A Date state
  const [dateA, setDateA] = useState({
    year: 762,
    month: 7,
    day: 30,
    hour: 14,
    title: 'Madinat as-Salam (Baghdad 145 H / 762 M)',
  });

  // Chart B Date state
  const [dateB, setDateB] = useState({
    year: 830,
    month: 3,
    day: 15,
    hour: 10,
    title: 'Zij as-Sindhind Al-Khwarizmi (215 H / 830 M)',
  });

  // Calculate full date info for A and B
  const dateInfoA = useMemo(() => {
    return getFullHistoricalDate(dateA.year, dateA.month, dateA.day, dateA.hour, 0);
  }, [dateA]);

  const dateInfoB = useMemo(() => {
    return getFullHistoricalDate(dateB.year, dateB.month, dateB.day, dateB.hour, 0);
  }, [dateB]);

  // Calculate planetary positions for both charts (using Baghdad latitude 33.33° and longitude 44.42°)
  const chartDataA = useMemo(() => {
    return calculateSindhindPositions(dateInfoA.jdn, 33.33, 44.42);
  }, [dateInfoA.jdn]);

  const chartDataB = useMemo(() => {
    return calculateSindhindPositions(dateInfoB.jdn, 33.33, 44.42);
  }, [dateInfoB.jdn]);

  // Generate full Synastry Report
  const synastryReport: SynastryReport = useMemo(() => {
    return calculateSynastryReport(
      chartDataA.positions,
      chartDataB.positions,
      {
        title: dateA.title,
        date: dateInfoA,
        ascendantDeg: chartDataA.ascendant.signDegree,
        ascendantSignIndex: chartDataA.ascendant.signIndex,
      },
      {
        title: dateB.title,
        date: dateInfoB,
        ascendantDeg: chartDataB.ascendant.signDegree,
        ascendantSignIndex: chartDataB.ascendant.signIndex,
      }
    );
  }, [chartDataA, chartDataB, dateA.title, dateB.title, dateInfoA, dateInfoB]);

  // Filters & State
  const [selectedAspectFilter, setSelectedAspectFilter] = useState<string>('all');
  const [selectedNatureFilter, setSelectedNatureFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected aspect for detailed inspector
  const [selectedAspect, setSelectedAspect] = useState<SynastryAspect | null>(
    synastryReport.aspects.length > 0 ? synastryReport.aspects[0] : null
  );

  // View modes: 'both' | 'matrix' | 'table'
  const [viewMode, setViewMode] = useState<'both' | 'matrix' | 'table'>('both');
  const [showTheory, setShowTheory] = useState<boolean>(false);

  // Standard classical planets for 9x9 matrix
  const standardPlanets: PlanetKey[] = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'rahu',
    'ketu',
  ];

  // Lookup map for Matrix cell (Row = Planet A, Col = Planet B)
  const matrixLookup = useMemo(() => {
    const map = new Map<string, SynastryAspect>();
    synastryReport.aspects.forEach((asp) => {
      map.set(`${asp.planetA}_${asp.planetB}`, asp);
    });
    return map;
  }, [synastryReport.aspects]);

  // Filtered aspects list
  const filteredAspects = useMemo(() => {
    return synastryReport.aspects.filter((asp) => {
      if (selectedAspectFilter !== 'all' && asp.aspectType !== selectedAspectFilter) {
        return false;
      }
      if (selectedNatureFilter !== 'all' && asp.nature !== selectedNatureFilter) {
        return false;
      }
      if (selectedCategoryFilter !== 'all' && asp.category !== selectedCategoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pAName = PLANETS_INFO[asp.planetA].transliteration.toLowerCase();
        const pBName = PLANETS_INFO[asp.planetB].transliteration.toLowerCase();
        const aspName = asp.aspectName.toLowerCase();
        const title = asp.classicalInterpretation.title.toLowerCase();
        return (
          pAName.includes(q) ||
          pBName.includes(q) ||
          aspName.includes(q) ||
          title.includes(q)
        );
      }
      return true;
    });
  }, [
    synastryReport.aspects,
    selectedAspectFilter,
    selectedNatureFilter,
    selectedCategoryFilter,
    searchQuery,
  ]);

  // Apply a preset
  const handleApplyPreset = (preset: PresetItem) => {
    setSelectedPresetId(preset.id);
    setDateA(preset.chartA);
    setDateB(preset.chartB);
    if (synastryReport.aspects.length > 0) {
      setSelectedAspect(synastryReport.aspects[0]);
    }
  };

  // Swap Chart A and Chart B
  const handleSwapCharts = () => {
    const tempA = { ...dateA };
    setDateA({ ...dateB });
    setDateB(tempA);
  };

  // Set Date A from current app date
  const handleSetAFromApp = () => {
    setDateA({
      year: currentDateInfo.julian.year,
      month: currentDateInfo.julian.month,
      day: currentDateInfo.julian.day,
      hour: 12,
      title: `Tarikh Berjalan (${currentDateInfo.hijri.year} H / ${currentDateInfo.julian.year} M)`,
    });
  };

  // Set Date B from current app date
  const handleSetBFromApp = () => {
    setDateB({
      year: currentDateInfo.julian.year,
      month: currentDateInfo.julian.month,
      day: currentDateInfo.julian.day,
      hour: 12,
      title: `Tarikh Berjalan (${currentDateInfo.hijri.year} H / ${currentDateInfo.julian.year} M)`,
    });
  };

  return (
    <div
      id="synastry-matrix-module"
      className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-5 ${
        isNight
          ? 'bg-[#101420]/95 border-[#28364f] text-[#e6ded0]'
          : 'bg-[#faf6ee] border-[#dfd6c3] text-[#2c241c] shadow-sm'
      }`}
    >
      {/* Module Title Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-current/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
              مقارنة التواليق وتوافق الكواكب
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-[#c59a43]">
              Synastry Matrix: Kompatibilitas Dua Data Tarikh
            </h2>
          </div>
          <p className="text-xs opacity-80 mt-1 font-serif">
            Membandingkan interaksi kawkab antara dua posisi waktu berbeda (*Muqāranat at-Tawāliq*) untuk menimbang keselarasan (*Mīzān at-Tawāfuq*) berdasarkan kaidah lingkaran cahaya (*Jurm al-Kawkab*) Zīj as-Sindhind.
          </p>
        </div>

        {/* View Mode & Guidance Toggle */}
        <div className="flex items-center gap-2 self-start lg:self-auto text-xs">
          <div className="flex items-center rounded-xl p-1 bg-current/5 border border-current/10">
            <button
              onClick={() => setViewMode('both')}
              className={`px-3 py-1 rounded-lg font-serif transition-colors ${
                viewMode === 'both'
                  ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                  : 'hover:bg-current/10 opacity-75'
              }`}
            >
              Semua Tampilan
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1 rounded-lg font-serif transition-colors ${
                viewMode === 'matrix'
                  ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                  : 'hover:bg-current/10 opacity-75'
              }`}
            >
              Matriks Silang
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg font-serif transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                  : 'hover:bg-current/10 opacity-75'
              }`}
            >
              Tabel Kompatibilitas
            </button>
          </div>

          <button
            onClick={() => setShowTheory(!showTheory)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-semibold transition-colors ${
              showTheory
                ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#c59a43]'
                : isNight
                ? 'bg-[#182236] border-[#293954] hover:bg-[#202d46]'
                : 'bg-[#ede5d3] border-[#ded0b6] hover:bg-[#e4dac6]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kaidah Synastry</span>
            {showTheory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Classical Synastry Theory Collapsible */}
      {showTheory && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
            isNight
              ? 'bg-[#121929] border-[#253552] text-[#d6e0ef]'
              : 'bg-[#f5ede0] border-[#ded0b6] text-[#332b1f]'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <span className="p-1 rounded bg-[#c59a43]/20 text-[#c59a43] shrink-0 mt-0.5">
              <Calculator className="w-4 h-4" />
            </span>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-serif font-bold text-sm text-[#c59a43]">
                  Kaidah Hisab Komparasi Aspek (*Muqāranat al-Kawkabayn*) Menurut Sindhind:
                </h4>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-current/10">
                  Rujukan: Kitāb al-Madkhal (Abū Ma'shar) & Zīj as-Sindhind
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px]">
                <div
                  className={`p-2.5 rounded-lg border ${
                    isNight ? 'bg-[#0b101c] border-[#1d2940]' : 'bg-[#ffffff] border-[#e2d8c3]'
                  }`}
                >
                  <span className="font-bold text-[#38bdf8] block mb-1">
                    1. Jarak Silang Ekliptika:
                  </span>
                  Setiap kawkab pada Tanggal A dibandingkan dengan kawkab pada Tanggal B. Sudut diukur dari selisih bujur terpendek pada busur 360°:
                  <div className="font-mono text-[10px] mt-1 p-1 rounded bg-current/5 text-center">
                    θ = min(|λ_A - λ_B|, 360° - |λ_A - λ_B|)
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border ${
                    isNight ? 'bg-[#0b101c] border-[#1d2940]' : 'bg-[#ffffff] border-[#e2d8c3]'
                  }`}
                >
                  <span className="font-bold text-[#eab308] block mb-1">
                    2. Toleransi Jurm al-Kawkab:
                  </span>
                  Aspek diakui jika selisih sudut dari bentuk baku (0°, 60°, 90°, 120°, 180°) tidak melampaui separuh lingkaran cahaya kedua bintang:
                  <div className="font-mono text-[10px] mt-1 p-1 rounded bg-current/5 text-center">
                    Orb_Maks = (Jurm_A + Jurm_B) / 2
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border ${
                    isNight ? 'bg-[#0b101c] border-[#1d2940]' : 'bg-[#ffffff] border-[#e2d8c3]'
                  }`}
                >
                  <span className="font-bold text-[#10b981] block mb-1">
                    3. Mīzān at-Tawāfuq (Skor Harmoni):
                  </span>
                  Aspek Sa'd (Trina +4, Sekstil +2.5) menambah poin keharmonisan. Aspek Nahs (Kuadrat -3, Oposisi -3.5) menunjukkan dinamika gesekan. Aspek presisi (Partil ≤1°) dilipatgandakan intensitasnya.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Preset Bar */}
      <div className="space-y-1.5">
        <span className="text-xs font-serif font-semibold opacity-75 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#c59a43]" />
          Pilihan Preset Data Historis Komparatif:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          {HISTORICAL_PRESETS.map((p) => {
            const isSelected = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#c59a43] bg-[#c59a43]/15 shadow-sm ring-1 ring-[#c59a43]'
                    : isNight
                    ? 'border-[#223147] bg-[#121826] hover:bg-[#182133]'
                    : 'border-[#ded1b9] bg-[#ffffff] hover:bg-[#f6efe2]'
                }`}
              >
                <div>
                  <div className="font-serif font-bold text-[#c59a43] mb-0.5 line-clamp-1">
                    {p.name}
                  </div>
                  <p className="text-[11px] opacity-75 line-clamp-2 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-mono opacity-60 flex items-center gap-1">
                  <span>A: {p.chartA.year} M</span>
                  <span>↔</span>
                  <span>B: {p.chartB.year} M</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Configuration Panels (Chart A & Chart B) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-center">
        {/* Chart A Input Card */}
        <div
          className={`lg:col-span-5 p-3.5 rounded-xl border ${
            isNight ? 'bg-[#0e1422] border-[#22324b]' : 'bg-[#ffffff] border-[#ded4bf]'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/10">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#38bdf8]/20 text-[#38bdf8] flex items-center justify-center font-bold text-xs">
                A
              </span>
              <div>
                <span className="font-serif font-bold text-xs text-[#38bdf8]">
                  Data Tanggal A (Tārīkh Awwal)
                </span>
                <span className="text-[10px] opacity-60 block truncate max-w-[190px]">
                  {dateA.title}
                </span>
              </div>
            </div>

            <button
              onClick={handleSetAFromApp}
              className="text-[10px] px-2 py-0.5 rounded font-mono bg-current/10 hover:bg-current/20 opacity-80"
              title="Gunakan tanggal aktif aplikasi saat ini"
            >
              Gunakan Waktu Aktif
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-xs font-mono mb-2">
            <div>
              <span className="text-[10px] opacity-60 block">Tahun (M)</span>
              <input
                type="number"
                value={dateA.year}
                onChange={(e) =>
                  setDateA({ ...dateA, year: parseInt(e.target.value) || 0, title: 'Kustomisasi Tanggal A' })
                }
                className={`w-full p-1 rounded border text-center ${
                  isNight ? 'bg-[#080d17] border-[#1d2a40]' : 'bg-[#fcf8f0] border-[#d8ccb4]'
                }`}
              />
            </div>
            <div>
              <span className="text-[10px] opacity-60 block">Bulan (1-12)</span>
              <input
                type="number"
                min={1}
                max={12}
                value={dateA.month}
                onChange={(e) =>
                  setDateA({ ...dateA, month: parseInt(e.target.value) || 1, title: 'Kustomisasi Tanggal A' })
                }
                className={`w-full p-1 rounded border text-center ${
                  isNight ? 'bg-[#080d17] border-[#1d2a40]' : 'bg-[#fcf8f0] border-[#d8ccb4]'
                }`}
              />
            </div>
            <div>
              <span className="text-[10px] opacity-60 block">Hari (1-31)</span>
              <input
                type="number"
                min={1}
                max={31}
                value={dateA.day}
                onChange={(e) =>
                  setDateA({ ...dateA, day: parseInt(e.target.value) || 1, title: 'Kustomisasi Tanggal A' })
                }
                className={`w-full p-1 rounded border text-center ${
                  isNight ? 'bg-[#080d17] border-[#1d2a40]' : 'bg-[#fcf8f0] border-[#d8ccb4]'
                }`}
              />
            </div>
            <div>
              <span className="text-[10px] opacity-60 block">Jam (0-23)</span>
              <input
                type="number"
                min={0}
                max={23}
                value={dateA.hour}
                onChange={(e) =>
                  setDateA({ ...dateA, hour: parseInt(e.target.value) || 0, title: 'Kustomisasi Tanggal A' })
                }
                className={`w-full p-1 rounded border text-center ${
                  isNight ? 'bg-[#080d17] border-[#1d2a40]' : 'bg-[#fcf8f0] border-[#d8ccb4]'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-serif pt-1 border-t border-current/10">
            <span className="text-[#c59a43]">
              {dateInfoA.hijri.day} {dateInfoA.hijri.monthNameArabic} {dateInfoA.hijri.year} H
            </span>
            <span className="font-mono text-[10px] opacity-75">
              Ṭāli‘: {chartDataA.ascendant.signDegree}° {ZODIAC_SIGNS[chartDataA.ascendant.signIndex].latinName}
            </span>
          </div>
        </div>

        {/* Swap Button */}
        <div className="lg:col-span-2 flex justify-center">
          <button
            onClick={handleSwapCharts}
            className={`p-2.5 rounded-full border transition-all hover:scale-105 ${
              isNight
                ? 'bg-[#182338] border-[#2c3d59] text-[#c59a43] hover:bg-[#202f4a]'
                : 'bg-[#ede3cf] border-[#d4c5a9] text-[#8c6019] hover:bg-[#e4d8c0]'
            }`}
            title="Tukar posisi Data A dan Data B (A ⇄ B)"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Chart B Input Card */}
        <div
          className={`lg:col-span-5 p-3.5 rounded-xl border ${
            isNight ? 'bg-[#0e1422] border-[#22324b]' : 'bg-[#ffffff] border-[#ded4bf]'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/10">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#eab308]/20 text-[#eab308] flex items-center justify-center font-bold text-xs">
                B
              </span>
              <div>
                <span className="font-serif font-bold text-xs text-[#eab308]">
                  Data Tanggal B (Tārīkh Thānī)
                </span>
                <span className="text-[10px] opacity-60 block truncate max-w-[190px]">
                  {dateB.title}
                </span>
              </div>
            </div>

            <button
              onClick={handleSetBFromApp}
              className="text-[10px] px-2 py-0.5 rounded font-mono bg-current/10 hover:bg-current/20 opacity-80"
              title="Gunakan tanggal aktif aplikasi saat ini"
            >
              Gunakan Waktu Aktif
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-xs font-mono mb-2">
            <div>
              <span className="text-[10px] opacity-60 block">Tahun (M)</span>
              <input
                type="number"
                value={dateB.year}
                onChange={(e) =>
                  setDateB({ ...dateB, year: parseInt(e.target.value) || 0, title: 'Kustomisasi Tanggal B' })
                }
                className={`w-full p-1 rounded border text-center ${
                  isNight ? 'bg-[#080d17] border-[#1d2a40]' : 'bg-[#fcf8f0] border-[#d8ccb4]'
                }`}
              />
            </div>
            <div>
              <span className="text-[10px] opacity-60 block">Bulan (1-12)</span>
              <input
                type="number"
                min={1}
                max={12}
                value={dateB.month}
                onChange={(e) =>
                  setDateB({ ...dateB, month: parseInt(e.target.value) || 1, title: 'Kustomisasi Tanggal B' })
                }
                className={`w-full p-1 rounded border text-center ${
                  isNight ? 'bg-[#080d17] border-[#1d2a40]' : 'bg-[#fcf8f0] border-[#d8ccb4]'
                }`}
              />
            </div>
            <div>
              <span className="text-[10px] opacity-60 block">Hari (1-31)</span>
              <input
                type="number"
                min={1}
                max={31}
                value={dateB.day}
                onChange={(e) =>
                  setDateB({ ...dateB, day: parseInt(e.target.value) || 1, title: 'Kustomisasi Tanggal B' })
                }
                className={`w-full p-1 rounded border text-center ${
                  isNight ? 'bg-[#080d17] border-[#1d2a40]' : 'bg-[#fcf8f0] border-[#d8ccb4]'
                }`}
              />
            </div>
            <div>
              <span className="text-[10px] opacity-60 block">Jam (0-23)</span>
              <input
                type="number"
                min={0}
                max={23}
                value={dateB.hour}
                onChange={(e) =>
                  setDateB({ ...dateB, hour: parseInt(e.target.value) || 0, title: 'Kustomisasi Tanggal B' })
                }
                className={`w-full p-1 rounded border text-center ${
                  isNight ? 'bg-[#080d17] border-[#1d2a40]' : 'bg-[#fcf8f0] border-[#d8ccb4]'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-serif pt-1 border-t border-current/10">
            <span className="text-[#c59a43]">
              {dateInfoB.hijri.day} {dateInfoB.hijri.monthNameArabic} {dateInfoB.hijri.year} H
            </span>
            <span className="font-mono text-[10px] opacity-75">
              Ṭāli‘: {chartDataB.ascendant.signDegree}° {ZODIAC_SIGNS[chartDataB.ascendant.signIndex].latinName}
            </span>
          </div>
        </div>
      </div>

      {/* Mīzān at-Tawāfuq (Overall Compatibility Summary Score Dashboard) */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isNight
            ? 'bg-[#131b2e] border-[#293d61] text-[#e8ded0]'
            : 'bg-[#f8f0e1] border-[#d8cbaf] text-[#2c241c] shadow-sm'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Circular/Big Compatibility Percentage Indicator */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-current/5 border border-current/10 text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">
              MĪZĀN AT-TAWĀFUQ (ميزان التوافق)
            </span>
            <div className="my-2 flex items-baseline justify-center gap-1">
              <span className="text-4xl sm:text-5xl font-extrabold font-serif text-[#c59a43]">
                {synastryReport.compatibilityIndex}%
              </span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-serif font-bold ${
                synastryReport.compatibilityIndex >= 68
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : synastryReport.compatibilityIndex >= 48
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {synastryReport.overallVerdict.latin}
            </div>
            <div className="font-serif text-[11px] opacity-80 mt-1" dir="rtl">
              {synastryReport.overallVerdict.arabic}
            </div>
          </div>

          {/* Verdict Description and Stats */}
          <div className="lg:col-span-8 space-y-3">
            <div>
              <h3 className="font-serif font-bold text-sm text-[#c59a43] flex items-center justify-between">
                <span>Keputusan Falak Komparatif (Hukm al-Muqāranah):</span>
                {onAnnotateSynastry && (
                  <button
                    onClick={() =>
                      onAnnotateSynastry(
                        `Synastry: ${dateA.title} ↔ ${dateB.title}`,
                        synastryReport.overallVerdict.summary
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-[#c59a43] text-black hover:bg-[#d6aa52] transition-colors"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    Catat Anotasi Riset
                  </button>
                )}
              </h3>
              <p className="text-xs opacity-85 mt-1 leading-relaxed">
                {synastryReport.overallVerdict.summary}
              </p>
            </div>

            {/* Metric Tallies */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-current/10 text-xs font-mono">
              <div
                className={`p-2 rounded-lg border text-center ${
                  isNight ? 'bg-[#0a121d] border-[#1d2b40]' : 'bg-[#ffffff] border-[#ded0b8]'
                }`}
              >
                <span className="text-[10px] text-emerald-400 block font-bold">
                  Aspek Sa'd (Harmoni)
                </span>
                <span className="text-base font-bold text-emerald-400">
                  {synastryReport.totalBeneficCount}
                </span>
                <span className="text-[9px] opacity-60 block">Trina & Sekstil</span>
              </div>

              <div
                className={`p-2 rounded-lg border text-center ${
                  isNight ? 'bg-[#0a121d] border-[#1d2b40]' : 'bg-[#ffffff] border-[#ded0b8]'
                }`}
              >
                <span className="text-[10px] text-rose-400 block font-bold">
                  Aspek Nahs (Friksi)
                </span>
                <span className="text-base font-bold text-rose-400">
                  {synastryReport.totalMaleficCount}
                </span>
                <span className="text-[9px] opacity-60 block">Kuadrat & Oposisi</span>
              </div>

              <div
                className={`p-2 rounded-lg border text-center ${
                  isNight ? 'bg-[#0a121d] border-[#1d2b40]' : 'bg-[#ffffff] border-[#ded0b8]'
                }`}
              >
                <span className="text-[10px] text-amber-400 block font-bold">
                  Mu'tadil / Qiran
                </span>
                <span className="text-base font-bold text-amber-400">
                  {synastryReport.totalNeutralCount}
                </span>
                <span className="text-[9px] opacity-60 block">Penyatuan Sinergis</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Classical Compatibility (Arkān at-Tawāfuq) */}
        <div className="mt-4 pt-3 border-t border-current/10">
          <span className="text-xs font-serif font-bold text-[#c59a43] block mb-2">
            Empat Rukun Kompatibilitas Falak Klasik (Arkān at-Tawāfuq al-Arba'ah):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {/* 1. Affection */}
            <div
              className={`p-2.5 rounded-xl border ${
                isNight ? 'bg-[#0b101d] border-[#1e2a40]' : 'bg-[#ffffff] border-[#ded5c2]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif font-bold text-pink-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  Mawaddah & Rasa
                </span>
                <span className="font-mono font-bold text-[11px]">
                  {synastryReport.categoryScores.affection.percent}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-current/10 mb-1 overflow-hidden">
                <div
                  className="h-full bg-pink-400 rounded-full"
                  style={{ width: `${synastryReport.categoryScores.affection.percent}%` }}
                />
              </div>
              <p className="text-[10px] opacity-70 leading-tight">
                {synastryReport.categoryScores.affection.desc}
              </p>
            </div>

            {/* 2. Intellect */}
            <div
              className={`p-2.5 rounded-xl border ${
                isNight ? 'bg-[#0b101d] border-[#1e2a40]' : 'bg-[#ffffff] border-[#ded5c2]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif font-bold text-sky-400 flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5" />
                  Akal & Musyawarah
                </span>
                <span className="font-mono font-bold text-[11px]">
                  {synastryReport.categoryScores.intellect.percent}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-current/10 mb-1 overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full"
                  style={{ width: `${synastryReport.categoryScores.intellect.percent}%` }}
                />
              </div>
              <p className="text-[10px] opacity-70 leading-tight">
                {synastryReport.categoryScores.intellect.desc}
              </p>
            </div>

            {/* 3. Vitality */}
            <div
              className={`p-2.5 rounded-xl border ${
                isNight ? 'bg-[#0b101d] border-[#1e2a40]' : 'bg-[#ffffff] border-[#ded5c2]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  Himmah & Inisiatif
                </span>
                <span className="font-mono font-bold text-[11px]">
                  {synastryReport.categoryScores.vitality.percent}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-current/10 mb-1 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${synastryReport.categoryScores.vitality.percent}%` }}
                />
              </div>
              <p className="text-[10px] opacity-70 leading-tight">
                {synastryReport.categoryScores.vitality.desc}
              </p>
            </div>

            {/* 4. Stability */}
            <div
              className={`p-2.5 rounded-xl border ${
                isNight ? 'bg-[#0b101d] border-[#1e2a40]' : 'bg-[#ffffff] border-[#ded5c2]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif font-bold text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Thabat & Komitmen
                </span>
                <span className="font-mono font-bold text-[11px]">
                  {synastryReport.categoryScores.stability.percent}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-current/10 mb-1 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${synastryReport.categoryScores.stability.percent}%` }}
                />
              </div>
              <p className="text-[10px] opacity-70 leading-tight">
                {synastryReport.categoryScores.stability.desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Chart Synastry Matrix (Planet A vs Planet B Grid) */}
      {(viewMode === 'both' || viewMode === 'matrix') && (
        <div
          className={`p-4 rounded-xl border overflow-x-auto ${
            isNight
              ? 'bg-[#0c111c] border-[#1e2a3f]'
              : 'bg-[#ffffff] border-[#e2d9c4]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#c59a43]">
                Matriks Silang Aspek Komparatif (Baris = Tanggal A, Kolom = Tanggal B):
              </span>
              <span className="text-[11px] opacity-75 font-mono block">
                Klik sel matriks untuk meneliti perincian aspek dan nasihat klasik
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span>△ Trina (120°) / ⚹ Sekstil (60°)</span>
              </span>
              <span className="inline-flex items-center gap-1 text-rose-400">
                <span>□ Kuadrat (90°) / ☍ Oposisi (180°)</span>
              </span>
              <span className="inline-flex items-center gap-1 text-amber-400">
                <span>☌ Konjungsi (0°)</span>
              </span>
            </div>
          </div>

          {/* 9x9 Cross-Grid Table */}
          <div className="min-w-[620px]">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 w-24 text-left font-serif text-[11px] text-[#38bdf8] bg-current/5">
                    Kawkab A ↓ \ B →
                  </th>
                  {standardPlanets.map((pB) => {
                    const infoB = PLANETS_INFO[pB];
                    return (
                      <th key={`head_B_${pB}`} className="p-1.5 font-serif text-[11px] font-semibold">
                        <div className="flex flex-col items-center">
                          <span
                            className="w-2.5 h-2.5 rounded-full mb-0.5 inline-block"
                            style={{ backgroundColor: infoB.color }}
                          />
                          <span className="truncate max-w-[50px] text-[10px]">
                            {infoB.transliteration}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {standardPlanets.map((pA) => {
                  const infoA = PLANETS_INFO[pA];
                  return (
                    <tr key={`row_A_${pA}`} className="border-t border-current/10">
                      {/* Row Header (Planet A) */}
                      <td className="p-1.5 text-left font-serif font-semibold text-[11px] flex items-center gap-1.5 bg-current/5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: infoA.color }}
                        />
                        <span className="truncate">{infoA.transliteration}</span>
                      </td>

                      {/* Planet B Columns */}
                      {standardPlanets.map((pB) => {
                        const asp = matrixLookup.get(`${pA}_${pB}`);

                        if (!asp) {
                          return (
                            <td
                              key={`cell_${pA}_${pB}`}
                              className="p-1 text-center font-mono text-[11px] opacity-15 hover:opacity-50"
                              title={`Tidak ada aspek antara ${infoA.transliteration} (A) dan ${PLANETS_INFO[pB].transliteration} (B)`}
                            >
                              -
                            </td>
                          );
                        }

                        const isSelected =
                          selectedAspect &&
                          selectedAspect.planetA === pA &&
                          selectedAspect.planetB === pB;

                        let cellBg = 'bg-slate-500/10 text-slate-300';
                        if (asp.nature === 'Sa\'d') {
                          cellBg = isNight
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/40'
                            : 'bg-emerald-600/15 text-emerald-800 hover:bg-emerald-600/25 border-emerald-600/30';
                        } else if (asp.nature === 'Nahs') {
                          cellBg = isNight
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border-rose-500/40'
                            : 'bg-rose-600/15 text-rose-800 hover:bg-rose-600/25 border-rose-600/30';
                        } else {
                          cellBg = isNight
                            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/40'
                            : 'bg-amber-600/15 text-amber-800 hover:bg-amber-600/25 border-amber-600/30';
                        }

                        return (
                          <td key={`cell_${pA}_${pB}`} className="p-1">
                            <button
                              onClick={() => setSelectedAspect(asp)}
                              className={`w-full py-1 px-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${cellBg} ${
                                isSelected ? 'ring-2 ring-[#c59a43] shadow-md scale-105 font-bold' : ''
                              }`}
                              title={`${asp.aspectName}: ${infoA.transliteration} (A) & ${PLANETS_INFO[pB].transliteration} (B) (Δ = ${asp.orbDifference.toFixed(1)}°)`}
                            >
                              <span className="text-sm font-bold leading-none">
                                {asp.symbol}
                              </span>
                              <span className="text-[9px] font-mono mt-0.5 opacity-85">
                                {asp.orbDifference.toFixed(1)}°
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Synastry Aspect Spotlight Card */}
      {selectedAspect && (
        <div
          className={`p-4 rounded-xl border transition-all ${
            isNight
              ? 'bg-[#141d30] border-[#293d61] text-[#e8ded0]'
              : 'bg-[#f7efe2] border-[#ded0b6] text-[#2c241c]'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-current/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c59a43]/20 border border-[#c59a43]/40 flex items-center justify-center text-xl font-bold text-[#c59a43]">
                {selectedAspect.symbol}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-base text-[#c59a43]">
                    {selectedAspect.classicalInterpretation.title}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      selectedAspect.nature === 'Sa\'d'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : selectedAspect.nature === 'Nahs'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {selectedAspect.natureArabic}
                  </span>
                </div>
                <div className="text-xs font-serif opacity-80 flex items-center gap-2 mt-0.5">
                  <span className="text-[#38bdf8]">
                    {PLANETS_INFO[selectedAspect.planetA].transliteration} (A) [
                    {chartDataA.positions[selectedAspect.planetA]?.coordinate.signDegree}°{' '}
                    {ZODIAC_SIGNS[chartDataA.positions[selectedAspect.planetA]?.coordinate.signIndex || 0].latinName}]
                  </span>
                  <span>↔</span>
                  <span className="text-[#eab308]">
                    {PLANETS_INFO[selectedAspect.planetB].transliteration} (B) [
                    {chartDataB.positions[selectedAspect.planetB]?.coordinate.signDegree}°{' '}
                    {ZODIAC_SIGNS[chartDataB.positions[selectedAspect.planetB]?.coordinate.signIndex || 0].latinName}]
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="text-right">
                <span className="opacity-70 block text-[10px]">Pilar Kategori:</span>
                <span className="font-bold text-[#38bdf8]">
                  {selectedAspect.categoryArabic}
                </span>
                <span className="opacity-50 text-[10px]"> (Skor: {selectedAspect.score > 0 ? `+${selectedAspect.score}` : selectedAspect.score})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-xs leading-relaxed">
            <div className="md:col-span-2 space-y-2">
              <p className="opacity-90 font-serif italic text-[11px]" dir="rtl">
                «{selectedAspect.classicalInterpretation.arabicPhrase}»
              </p>
              <div className="space-y-1">
                <p className="text-[11px] opacity-85">
                  <strong className="text-[#c59a43]">Dinamika Komparasi:</strong>{' '}
                  {selectedAspect.classicalInterpretation.synastryDynamic}
                </p>
                <p className="text-[11px] opacity-85">
                  <strong className="text-[#c59a43]">Nasihat Falak:</strong>{' '}
                  {selectedAspect.classicalInterpretation.advice}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-current/5 border border-current/10 space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="opacity-75">Sudut Aktual:</span>
                <span className="font-bold">{selectedAspect.actualAngle.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Sudut Eksak:</span>
                <span>{selectedAspect.exactAngle}°</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Deviasi (Orb):</span>
                <span className="font-bold text-[#38bdf8]">Δ {selectedAspect.orbDifference.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Batas Jurm:</span>
                <span>{selectedAspect.maxAllowedOrb}°</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Klasifikasi:</span>
                <span>{selectedAspect.isPartile ? '★ Partil (Daqīqī)' : 'Platil (Mu\'tadil)'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Detailed Synastry Aspects Table */}
      {(viewMode === 'both' || viewMode === 'table') && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Filter buttons by aspect */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="opacity-75 text-[11px] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#c59a43]" />
                Filter Aspek:
              </span>

              {[
                { id: 'all', label: 'Semua Aspek' },
                { id: 'tathlith', label: '△ Trina (120°)' },
                { id: 'tasdis', label: '⚹ Sekstil (60°)' },
                { id: 'qiran', label: '☌ Konjungsi (0°)' },
                { id: 'tarbi', label: '□ Kuadrat (90°)' },
                { id: 'muqabalah', label: '☍ Oposisi (180°)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedAspectFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedAspectFilter === f.id
                      ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                      : 'bg-current/5 hover:bg-current/10 opacity-75'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Total aspect count badge */}
            <span className="text-[11px] font-mono opacity-70">
              Total {synastryReport.aspects.length} Aspek Terhisab
            </span>
          </div>

          {/* Search and Secondary Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kawkab atau hikmah..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none ${
                  isNight
                    ? 'bg-[#0c121d] border-[#1e2a3d] focus:border-[#c59a43]'
                    : 'bg-[#ffffff] border-[#ded3bd] focus:border-[#c59a43]'
                }`}
              />
            </div>

            <select
              value={selectedNatureFilter}
              onChange={(e) => setSelectedNatureFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs outline-none ${
                isNight
                  ? 'bg-[#0c121d] border-[#1e2a3d] focus:border-[#c59a43]'
                  : 'bg-[#ffffff] border-[#ded3bd] focus:border-[#c59a43]'
              }`}
            >
              <option value="all">Semua Sifat Aspek</option>
              <option value="Sa'd">Hanya Sa'd (Harmonis / Berkah)</option>
              <option value="Nahs">Hanya Nahs (Tegangan / Friksi)</option>
              <option value="Mu'tadil">Hanya Mu'tadil (Netral / Sinergi)</option>
            </select>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs outline-none ${
                isNight
                  ? 'bg-[#0c121d] border-[#1e2a3d] focus:border-[#c59a43]'
                  : 'bg-[#ffffff] border-[#ded3bd] focus:border-[#c59a43]'
              }`}
            >
              <option value="all">Semua Pilar Kompatibilitas</option>
              <option value="affection">Mawaddah & Rasa (Bulan/Venus)</option>
              <option value="intellect">Akal & Musyawarah (Merkurius/Yupiter)</option>
              <option value="vitality">Himmah & Inisiatif (Mars/Matahari)</option>
              <option value="stability">Thabat & Komitmen (Saturnus/Bulan)</option>
            </select>
          </div>

          {/* Interactive Detailed Table */}
          <div className="overflow-x-auto rounded-xl border border-current/10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className={`border-b font-serif text-[11px] uppercase tracking-wider ${
                    isNight
                      ? 'border-[#2d3a52] bg-[#141b2b] text-[#c59a43]'
                      : 'border-[#dfd6c3] bg-[#f2ebd9] text-[#855914]'
                  }`}
                >
                  <th className="py-2.5 px-3">Pasangan Kawkab (A ↔ B)</th>
                  <th className="py-2.5 px-3">Bentuk Aspek</th>
                  <th className="py-2.5 px-3">Sudut & Orb</th>
                  <th className="py-2.5 px-3">Pilar & Sifat</th>
                  <th className="py-2.5 px-3">Skor</th>
                  <th className="py-2.5 px-3">Dinamika Komparasi</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/10 font-sans">
                {filteredAspects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center opacity-60 italic">
                      Tidak ditemukan aspek yang cocok dengan kriteria saringan.
                    </td>
                  </tr>
                ) : (
                  filteredAspects.map((asp) => {
                    const isSelected = selectedAspect?.id === asp.id;
                    const pAInfo = PLANETS_INFO[asp.planetA];
                    const pBInfo = PLANETS_INFO[asp.planetB];

                    return (
                      <tr
                        key={asp.id}
                        onClick={() => setSelectedAspect(asp)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? isNight
                              ? 'bg-[#c59a43]/15 font-medium'
                              : 'bg-[#c59a43]/20 font-medium'
                            : isNight
                            ? 'hover:bg-[#151c2e]'
                            : 'hover:bg-[#f5ede0]'
                        }`}
                      >
                        {/* Planets */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5 items-center">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/40 inline-block shadow-sm"
                                style={{ backgroundColor: pAInfo.color }}
                              />
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/40 inline-block shadow-sm"
                                style={{ backgroundColor: pBInfo.color }}
                              />
                            </div>
                            <div>
                              <div className="font-serif font-semibold">
                                <span className="text-[#38bdf8]">{pAInfo.transliteration} (A)</span>
                                {' ↔ '}
                                <span className="text-[#eab308]">{pBInfo.transliteration} (B)</span>
                              </div>
                              <div className="text-[10px] opacity-70 font-mono">
                                {chartDataA.positions[asp.planetA]?.coordinate.signDegree}° {ZODIAC_SIGNS[chartDataA.positions[asp.planetA]?.coordinate.signIndex || 0].symbol}
                                {' vs '}
                                {chartDataB.positions[asp.planetB]?.coordinate.signDegree}° {ZODIAC_SIGNS[chartDataB.positions[asp.planetB]?.coordinate.signIndex || 0].symbol}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Aspect */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-bold text-[#c59a43]">
                              {asp.symbol}
                            </span>
                            <div>
                              <div className="font-serif font-semibold">{asp.aspectName}</div>
                              <div className="text-[10px] opacity-70 font-serif" dir="rtl">
                                {asp.aspectArabic}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Angle & Orb */}
                        <td className="py-2.5 px-3 font-mono">
                          <div className="font-semibold text-[#38bdf8]">
                            θ = {asp.actualAngle.toFixed(1)}°
                          </div>
                          <div className="text-[10px] opacity-75">
                            Δ {asp.orbDifference.toFixed(2)}° (Maks {asp.maxAllowedOrb}°)
                          </div>
                        </td>

                        {/* Pillar & Nature */}
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold block w-fit mb-0.5 ${
                              asp.nature === 'Sa\'d'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : asp.nature === 'Nahs'
                                ? 'bg-rose-500/15 text-rose-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {asp.nature === 'Sa\'d' ? 'Sa\'d (Harmoni)' : asp.nature === 'Nahs' ? 'Nahs (Friksi)' : 'Mu\'tadil (Netral)'}
                          </span>
                          <span className="text-[10px] font-serif opacity-75">
                            {asp.categoryArabic}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="py-2.5 px-3 font-mono font-bold">
                          <span
                            className={
                              asp.score > 0
                                ? 'text-emerald-400'
                                : asp.score < 0
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }
                          >
                            {asp.score > 0 ? `+${asp.score}` : asp.score}
                          </span>
                          {asp.isPartile && (
                            <span className="text-[9px] block text-amber-300">
                              ★ Partil
                            </span>
                          )}
                        </td>

                        {/* Interpretation Summary */}
                        <td className="py-2.5 px-3 max-w-[220px]">
                          <div className="text-[11px] font-serif text-[#c59a43] truncate font-medium">
                            {asp.classicalInterpretation.title}
                          </div>
                          <div className="text-[10px] opacity-75 line-clamp-1 mt-0.5">
                            {asp.classicalInterpretation.synastryDynamic}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAspect(asp);
                            }}
                            className="px-2 py-1 rounded text-[11px] font-semibold bg-[#c59a43]/20 hover:bg-[#c59a43]/30 text-[#c59a43] transition-colors"
                          >
                            Telaah
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
