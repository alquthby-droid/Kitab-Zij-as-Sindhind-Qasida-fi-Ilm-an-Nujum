import React, { useState, useMemo, useEffect } from 'react';
import { PlanetKey, PlanetaryPosition, HistoricalDateInfo, ThemeMode } from '../types';
import {
  calculateTransitReport,
  NatalChartProfile,
  HISTORICAL_NATAL_PRESETS,
  TransitAspect,
} from '../lib/transitEngine';
import { PLANETS_INFO, ZODIAC_SIGNS } from '../lib/sindhindEngine';
import { dateToJdn, getFullHistoricalDate, jdnToGregorian } from '../lib/calendarConverter';
import {
  TrendingUp,
  Calendar,
  Sparkles,
  Info,
  Filter,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  ArrowRight,
  Shield,
  HelpCircle,
  Calculator,
  Flame,
  Award,
  BookOpen,
  BookmarkPlus,
  Clock,
  MapPin,
  User,
  RotateCcw,
  Layers,
  Table as TableIcon,
  Grid,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ShieldAlert,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';

interface TransitCalculatorViewProps {
  currentDateInfo: HistoricalDateInfo;
  theme: ThemeMode;
  onAnnotateTransit?: (title: string, content: string) => void;
}

export const TransitCalculatorView: React.FC<TransitCalculatorViewProps> = ({
  currentDateInfo,
  theme,
  onAnnotateTransit,
}) => {
  const isNight = theme === 'night';

  // 1. Natal Profile State (with LocalStorage persistence for custom user birth data)
  const [selectedPresetId, setSelectedPresetId] = useState<string>('custom');

  const [customNatalProfile, setCustomNatalProfile] = useState<NatalChartProfile>(() => {
    const saved = localStorage.getItem('sindhind_user_natal_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback to default
      }
    }
    return {
      id: 'custom',
      name: 'Naskah Kelahiran Saya',
      arabicName: 'طَالِعُ مَوْلِدِي الشَّخْصِيّ',
      year: 1995,
      month: 6,
      day: 21,
      hour: 9,
      minute: 30,
      latitude: -6.2088,
      longitude: 106.8456,
      locationName: 'Jakarta, Nusantara',
      description: 'Data natal pribadi pengguna untuk hisab transit falak.',
    };
  });

  // Save custom profile changes
  const updateCustomNatal = (fields: Partial<NatalChartProfile>) => {
    const updated = { ...customNatalProfile, ...fields };
    setCustomNatalProfile(updated);
    localStorage.setItem('sindhind_user_natal_profile', JSON.stringify(updated));
  };

  // Active Natal Profile based on preset selector
  const activeNatalProfile: NatalChartProfile = useMemo(() => {
    if (selectedPresetId === 'custom') return customNatalProfile;
    const preset = HISTORICAL_NATAL_PRESETS.find((p) => p.id === selectedPresetId);
    return preset || customNatalProfile;
  }, [selectedPresetId, customNatalProfile]);

  // 2. Transit Observation Date State (defaults to current date of app)
  const [transitDateState, setTransitDateState] = useState<{
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  }>({
    year: currentDateInfo.julian.year,
    month: currentDateInfo.julian.month,
    day: currentDateInfo.julian.day,
    hour: 12,
    minute: 0,
  });

  // Quick sync button to current real app time
  const syncToNow = () => {
    const now = new Date();
    setTransitDateState({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
    });
  };

  // Transit time shifts
  const shiftTransitDays = (days: number) => {
    const jdn = dateToJdn(
      transitDateState.year,
      transitDateState.month,
      transitDateState.day,
      transitDateState.hour,
      transitDateState.minute
    );
    const shifted = jdnToGregorian(jdn + days);
    setTransitDateState((prev) => ({
      ...prev,
      year: shifted.year,
      month: shifted.month,
      day: shifted.day,
    }));
  };

  const shiftTransitMonths = (months: number) => {
    let newMonth = transitDateState.month + months;
    let newYear = transitDateState.year;
    while (newMonth > 12) {
      newMonth -= 12;
      newYear += 1;
    }
    while (newMonth < 1) {
      newMonth += 12;
      newYear -= 1;
    }
    setTransitDateState((prev) => ({
      ...prev,
      year: newYear,
      month: newMonth,
    }));
  };

  // 3. Compute Transit Report
  const transitReport = useMemo(() => {
    const transitJdn = dateToJdn(
      transitDateState.year,
      transitDateState.month,
      transitDateState.day,
      transitDateState.hour,
      transitDateState.minute
    );
    return calculateTransitReport(activeNatalProfile, transitJdn);
  }, [activeNatalProfile, transitDateState]);

  // 4. Filters & Controls
  const [aspectTypeFilter, setAspectTypeFilter] = useState<string>('all');
  const [natureFilter, setNatureFilter] = useState<string>('all');
  const [transitPlanetFilter, setTransitPlanetFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [onlyPartile, setOnlyPartile] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected aspect for deep inspection
  const [selectedAspect, setSelectedAspect] = useState<TransitAspect | null>(
    transitReport.aspects.length > 0 ? transitReport.aspects[0] : null
  );

  // Update selected aspect if aspects change
  useEffect(() => {
    if (transitReport.aspects.length > 0) {
      if (!selectedAspect || !transitReport.aspects.some((a) => a.id === selectedAspect.id)) {
        setSelectedAspect(transitReport.aspects[0]);
      }
    } else {
      setSelectedAspect(null);
    }
  }, [transitReport]);

  // View modes: 'table' | 'matrix' | 'both'
  const [viewMode, setViewMode] = useState<'both' | 'table' | 'matrix'>('table');
  const [showTheory, setShowTheory] = useState<boolean>(false);
  const [showNatalEditor, setShowNatalEditor] = useState<boolean>(false);

  // Filtered aspects list
  const filteredAspects = useMemo(() => {
    return transitReport.aspects.filter((asp) => {
      if (aspectTypeFilter !== 'all' && asp.aspectType !== aspectTypeFilter) return false;
      if (natureFilter !== 'all' && asp.nature !== natureFilter) return false;
      if (transitPlanetFilter !== 'all' && asp.transitPlanet !== transitPlanetFilter) return false;
      if (durationFilter !== 'all' && asp.cycleDuration !== durationFilter) return false;
      if (onlyPartile && !asp.isPartile) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const tName = PLANETS_INFO[asp.transitPlanet].transliteration.toLowerCase();
        const nName = PLANETS_INFO[asp.natalPlanet].transliteration.toLowerCase();
        const aName = asp.aspectName.toLowerCase();
        const title = asp.classicalInterpretation.title.toLowerCase();
        return (
          tName.includes(q) ||
          nName.includes(q) ||
          aName.includes(q) ||
          title.includes(q)
        );
      }

      return true;
    });
  }, [
    transitReport.aspects,
    aspectTypeFilter,
    natureFilter,
    transitPlanetFilter,
    durationFilter,
    onlyPartile,
    searchQuery,
  ]);

  const planetsList: PlanetKey[] = [
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

  return (
    <div
      id="transit-calculator-module"
      className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-5 ${
        isNight
          ? 'bg-[#0f1422]/95 border-[#283854] text-[#e3ded5]'
          : 'bg-[#faf6ee] border-[#ded5c2] text-[#2c2419] shadow-sm'
      }`}
    >
      {/* Module Title Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-current/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
              حَاسِبَةُ العُبُورِ وَالتَّحَاوِيلِ
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-[#c59a43]">
              Kalkulator Transit: Pergerakan Planet vs Naskah Kelahiran
            </h2>
          </div>
          <p className="text-xs opacity-80 mt-1 font-serif">
            Menghitung aspek dan interaksi dinamis antara pergerakan planet di langit saat ini (*Al-Kawākib al-‘Ābirah*) terhadap kedudukan planet pada naskah kelahiran (*Aṣl al-Mawlid*) berdasarkan risalah Abū Ma‘shar (*Taḥāwīl Sinī al-Mawālīd*) dan *Zīj as-Sindhind*.
          </p>
        </div>

        {/* Preset Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto text-xs">
          {/* Preset Dropdown */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-current/5 border border-current/10">
            <User className="w-3.5 h-3.5 text-[#c59a43] ml-1" />
            <select
              value={selectedPresetId}
              onChange={(e) => {
                setSelectedPresetId(e.target.value);
                if (e.target.value === 'custom') setShowNatalEditor(true);
              }}
              className={`p-1 rounded font-serif text-xs font-semibold outline-none cursor-pointer ${
                isNight ? 'bg-[#080d17] text-[#e3ded5]' : 'bg-[#ffffff] text-[#2c2419]'
              }`}
            >
              <option value="custom">👤 Kelahiran Saya (Kustom)</option>
              <optgroup label="Tokoh Historis Klasik:">
                {HISTORICAL_NATAL_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.year} M)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Toggle Natal Editor */}
          <button
            onClick={() => setShowNatalEditor(!showNatalEditor)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-semibold transition-colors ${
              showNatalEditor
                ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#c59a43]'
                : isNight
                ? 'bg-[#182338] border-[#293954] hover:bg-[#202e48]'
                : 'bg-[#ede5d3] border-[#ded0b6] hover:bg-[#e4dac6]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ubah Data Natal</span>
            {showNatalEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Theory Accordion Button */}
          <button
            onClick={() => setShowTheory(!showTheory)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-semibold transition-colors ${
              showTheory
                ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#c59a43]'
                : isNight
                ? 'bg-[#182338] border-[#293954] hover:bg-[#202e48]'
                : 'bg-[#ede5d3] border-[#ded0b6] hover:bg-[#e4dac6]'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kaidah Transit</span>
            {showTheory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Classical Astrological Theory Collapsible */}
      {showTheory && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
            isNight
              ? 'bg-[#121929] border-[#253552] text-[#d6e0ef]'
              : 'bg-[#f5ede0] border-[#ded0b6] text-[#332b1f]'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <span className="p-1.5 rounded bg-[#c59a43]/20 text-[#c59a43] shrink-0 mt-0.5">
              <TrendingUp className="w-4 h-4" />
            </span>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-serif font-bold text-sm text-[#c59a43]">
                  Kaidah Falak Klasik: Hisab Transit (*Al-‘Ubūr wa at-Taḥāwīl*):
                </h4>
                <span className="text-[11px] font-serif opacity-75 italic" dir="rtl">
                  «تَحْوِيلُ سِنِي المَوَالِيدِ وَعُبُورُ الكَوَاكِبِ السَّيَّارَة»
                </span>
              </div>
              <p>
                Dalam tradisi astrologi Islam (*'Ilm Aḥkām an-Nujūm*), transit planet (*Al-‘Ubūr*) mengamati bagaimana planet yang terus berputar saat ini mengaktivasi energi laten yang terukir pada peta kelahiran (*Aṣl al-Mawlid*). Planet transit bertindak sebagai <em>pemicu waktu (muwaqqit)</em> yang merealisasikan janji natal.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-mono text-[11px]">
                <div className="p-2 rounded bg-current/5 border border-current/10">
                  <span className="text-[#c59a43] font-bold block mb-0.5 font-serif">
                    1. Transit Cepat (Bulan & Surya)
                  </span>
                  Mempengaruhi fluktuasi emosi harian, kejernihan pikiran, dan pertemuan sosial sesaat (2-14 hari).
                </div>
                <div className="p-2 rounded bg-current/5 border border-current/10">
                  <span className="text-[#c59a43] font-bold block mb-0.5 font-serif">
                    2. Transit Sedang (Mars)
                  </span>
                  Memicu dinamika perjuangan, inisiatif tindakan, stamina fisik, atau friksi keberanian (1-2 bulan).
                </div>
                <div className="p-2 rounded bg-current/5 border border-current/10">
                  <span className="text-[#c59a43] font-bold block mb-0.5 font-serif">
                    3. Transit Epik (Zuhal & Musytari)
                  </span>
                  Membawa transformasi nasib besar, ujian kematangan struktural (*Saturnus*), dan ekspansi rezeki (*Yupiter*) berdurasi 1-3 tahun.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NATAL CHART PROFILE EDITOR (Collapsible) */}
      {showNatalEditor && (
        <div
          className={`p-4 rounded-xl border transition-all space-y-3 ${
            isNight ? 'bg-[#090e18] border-[#22334e]' : 'bg-[#ffffff] border-[#ded0b6] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-current/10">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#c59a43]" />
              <h4 className="font-serif font-bold text-sm text-[#c59a43]">
                Konfigurasi Naskah Kelahiran Natal (*Aṣl al-Mawlid*):
              </h4>
            </div>
            <span className="text-[10px] font-mono opacity-70">
              Tersimpan otomatis di memori lokal peramban
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Name */}
            <div>
              <label className="block text-[11px] opacity-75 font-serif mb-1">
                Nama Pemilik Naskah:
              </label>
              <input
                type="text"
                disabled={selectedPresetId !== 'custom'}
                value={activeNatalProfile.name}
                onChange={(e) => updateCustomNatal({ name: e.target.value })}
                className={`w-full p-2 rounded-lg border font-serif outline-none ${
                  selectedPresetId !== 'custom'
                    ? 'opacity-60 bg-current/5'
                    : isNight
                    ? 'bg-[#121927] border-[#22344f]'
                    : 'bg-[#faf6ee] border-[#ded3be]'
                }`}
              />
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-[11px] opacity-75 font-serif mb-1">
                Tanggal Kelahiran:
              </label>
              <div className="grid grid-cols-3 gap-1">
                <input
                  type="number"
                  placeholder="Hari"
                  disabled={selectedPresetId !== 'custom'}
                  value={activeNatalProfile.day}
                  onChange={(e) =>
                    updateCustomNatal({ day: parseInt(e.target.value) || 1 })
                  }
                  className={`p-2 rounded-lg border text-center font-mono outline-none ${
                    selectedPresetId !== 'custom'
                      ? 'opacity-60 bg-current/5'
                      : isNight
                      ? 'bg-[#121927] border-[#22344f]'
                      : 'bg-[#faf6ee] border-[#ded3be]'
                  }`}
                />
                <input
                  type="number"
                  placeholder="Bulan"
                  disabled={selectedPresetId !== 'custom'}
                  value={activeNatalProfile.month}
                  onChange={(e) =>
                    updateCustomNatal({ month: parseInt(e.target.value) || 1 })
                  }
                  className={`p-2 rounded-lg border text-center font-mono outline-none ${
                    selectedPresetId !== 'custom'
                      ? 'opacity-60 bg-current/5'
                      : isNight
                      ? 'bg-[#121927] border-[#22344f]'
                      : 'bg-[#faf6ee] border-[#ded3be]'
                  }`}
                />
                <input
                  type="number"
                  placeholder="Tahun"
                  disabled={selectedPresetId !== 'custom'}
                  value={activeNatalProfile.year}
                  onChange={(e) =>
                    updateCustomNatal({ year: parseInt(e.target.value) || 1995 })
                  }
                  className={`p-2 rounded-lg border text-center font-mono outline-none ${
                    selectedPresetId !== 'custom'
                      ? 'opacity-60 bg-current/5'
                      : isNight
                      ? 'bg-[#121927] border-[#22344f]'
                      : 'bg-[#faf6ee] border-[#ded3be]'
                  }`}
                />
              </div>
            </div>

            {/* Birth Time */}
            <div>
              <label className="block text-[11px] opacity-75 font-serif mb-1">
                Waktu Jam Kelahiran:
              </label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="number"
                  placeholder="Jam"
                  disabled={selectedPresetId !== 'custom'}
                  value={activeNatalProfile.hour}
                  onChange={(e) =>
                    updateCustomNatal({ hour: parseInt(e.target.value) || 0 })
                  }
                  className={`p-2 rounded-lg border text-center font-mono outline-none ${
                    selectedPresetId !== 'custom'
                      ? 'opacity-60 bg-current/5'
                      : isNight
                      ? 'bg-[#121927] border-[#22344f]'
                      : 'bg-[#faf6ee] border-[#ded3be]'
                  }`}
                />
                <input
                  type="number"
                  placeholder="Menit"
                  disabled={selectedPresetId !== 'custom'}
                  value={activeNatalProfile.minute}
                  onChange={(e) =>
                    updateCustomNatal({ minute: parseInt(e.target.value) || 0 })
                  }
                  className={`p-2 rounded-lg border text-center font-mono outline-none ${
                    selectedPresetId !== 'custom'
                      ? 'opacity-60 bg-current/5'
                      : isNight
                      ? 'bg-[#121927] border-[#22344f]'
                      : 'bg-[#faf6ee] border-[#ded3be]'
                  }`}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] opacity-75 font-serif mb-1">
                Kota / Lokasi Kelahiran:
              </label>
              <input
                type="text"
                disabled={selectedPresetId !== 'custom'}
                value={activeNatalProfile.locationName}
                onChange={(e) => updateCustomNatal({ locationName: e.target.value })}
                className={`w-full p-2 rounded-lg border font-serif outline-none ${
                  selectedPresetId !== 'custom'
                    ? 'opacity-60 bg-current/5'
                    : isNight
                    ? 'bg-[#121927] border-[#22344f]'
                    : 'bg-[#faf6ee] border-[#ded3be]'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* DUAL TIME STATUS & QUICK CHRONOLOGY CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Natal Card Summary */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
            isNight ? 'bg-[#0b101c] border-[#1d2b42]' : 'bg-[#f7f2e7] border-[#ded2bd]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c59a43]/20 border border-[#c59a43]/40 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5 text-[#c59a43]" />
            </div>
            <div>
              <span className="text-[10px] font-mono opacity-70 uppercase tracking-wider block">
                Naskah Kelahiran (Radix / Asl al-Mawlid):
              </span>
              <div className="font-serif font-bold text-sm text-[#c59a43]">
                {activeNatalProfile.name}
              </div>
              <div className="text-[11px] opacity-80 font-mono">
                {activeNatalProfile.day}/{activeNatalProfile.month}/{activeNatalProfile.year} M •{' '}
                {String(activeNatalProfile.hour).padStart(2, '0')}:
                {String(activeNatalProfile.minute).padStart(2, '0')} • {activeNatalProfile.locationName}
              </div>
            </div>
          </div>
        </div>

        {/* Transit Time Controller Card */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 ${
            isNight ? 'bg-[#0b101c] border-[#1d2b42]' : 'bg-[#f7f2e7] border-[#ded2bd]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-[10px] font-mono opacity-70 uppercase tracking-wider block">
                  Waktu Transit Langit (Al-‘Ubūr al-Hālī):
                </span>
                <span className="font-mono font-bold text-sm text-sky-400">
                  {transitDateState.day}/{transitDateState.month}/{transitDateState.year} M
                </span>
                <span className="opacity-60 ml-2 font-serif text-[11px]">
                  ({transitReport.transitDateInfo.hijri.day}{' '}
                  {transitReport.transitDateInfo.hijri.monthNameLatin}{' '}
                  {transitReport.transitDateInfo.hijri.year} H)
                </span>
              </div>
            </div>

            {/* Sync Now Button */}
            <button
              onClick={syncToNow}
              className="px-2.5 py-1 rounded-lg border border-sky-400/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-mono text-[10px] flex items-center gap-1 transition-colors"
              title="Kembalikan waktu transit ke hari ini"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Hari Ini</span>
            </button>
          </div>

          {/* Quick Shift Step Buttons */}
          <div className="flex items-center gap-1.5 font-mono text-[10px] opacity-90 overflow-x-auto no-scrollbar">
            <span className="opacity-50">Lompat:</span>
            <button
              onClick={() => shiftTransitDays(-1)}
              className="px-2 py-0.5 rounded border border-current/20 hover:bg-current/10"
            >
              -1 Hr
            </button>
            <button
              onClick={() => shiftTransitDays(1)}
              className="px-2 py-0.5 rounded border border-current/20 hover:bg-current/10"
            >
              +1 Hr
            </button>
            <button
              onClick={() => shiftTransitMonths(-1)}
              className="px-2 py-0.5 rounded border border-current/20 hover:bg-current/10"
            >
              -1 Bln
            </button>
            <button
              onClick={() => shiftTransitMonths(1)}
              className="px-2 py-0.5 rounded border border-current/20 hover:bg-current/10"
            >
              +1 Bln
            </button>
            <button
              onClick={() => shiftTransitMonths(12)}
              className="px-2 py-0.5 rounded border border-current/20 hover:bg-current/10"
            >
              +1 Thn
            </button>
          </div>
        </div>
      </div>

      {/* OVERALL TRANSIT CLIMATE BANNER */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          transitReport.statistics.overallAtmosphere === 'Sangat Harmonis (Sa\'d Ghalib)'
            ? isNight
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : transitReport.statistics.overallAtmosphere === 'Waspada Ujian (Nahs Ghalib)'
            ? isNight
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-950'
            : isNight
            ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
            : 'bg-sky-50 border-sky-300 text-sky-950'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-current/10 border border-current/20">
                Iklim Transit Saat Ini
              </span>
              <span className="font-serif font-bold text-sm sm:text-base">
                {transitReport.statistics.overallAtmosphere}
              </span>
              <span className="text-xs opacity-75 font-serif hidden lg:inline" dir="rtl">
                «{transitReport.statistics.atmosphereArabic}»
              </span>
            </div>
            <p className="text-xs leading-relaxed opacity-90 font-serif">
              {transitReport.statistics.atmosphereDescription}
            </p>
          </div>

          {/* Key Metrics Counters */}
          <div className="shrink-0 flex items-center gap-2 sm:gap-3 text-center font-mono">
            <div className="p-2 rounded-xl bg-current/5 border border-current/10 min-w-[65px]">
              <div className="text-[10px] opacity-70">Total Aspek</div>
              <div className="text-lg font-bold">{transitReport.statistics.totalAspectsCount}</div>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 min-w-[65px]">
              <div className="text-[10px] opacity-75">Sa'd (Berkah)</div>
              <div className="text-lg font-bold">{transitReport.statistics.beneficCount}</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 min-w-[65px]">
              <div className="text-[10px] opacity-75">Nahs (Ujian)</div>
              <div className="text-lg font-bold">{transitReport.statistics.maleficCount}</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 min-w-[65px]">
              <div className="text-[10px] opacity-75">Partile (Presisi)</div>
              <div className="text-lg font-bold">{transitReport.statistics.partileCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR & VIEW MODE SWITCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Aspect Type Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-current/5 border border-current/10">
            <span className="opacity-60 text-[11px] pl-1 font-mono">Aspek:</span>
            <select
              value={aspectTypeFilter}
              onChange={(e) => setAspectTypeFilter(e.target.value)}
              className={`p-1 rounded font-serif text-[11px] outline-none ${
                isNight ? 'bg-[#080d17] text-[#e3ded5]' : 'bg-[#ffffff] text-[#2c2419]'
              }`}
            >
              <option value="all">Semua Aspek (5 Jenis)</option>
              <option value="qiran">☌ Konjungsi (0°)</option>
              <option value="tathlith">△ Trina (120°)</option>
              <option value="tasdis">⚹ Sekstil (60°)</option>
              <option value="tarbi">□ Kuadrat (90°)</option>
              <option value="muqabalah">☍ Oposisi (180°)</option>
            </select>
          </div>

          {/* Nature Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-current/5 border border-current/10">
            <span className="opacity-60 text-[11px] pl-1 font-mono">Sifat:</span>
            <select
              value={natureFilter}
              onChange={(e) => setNatureFilter(e.target.value)}
              className={`p-1 rounded font-serif text-[11px] outline-none ${
                isNight ? 'bg-[#080d17] text-[#e3ded5]' : 'bg-[#ffffff] text-[#2c2419]'
              }`}
            >
              <option value="all">Semua Sifat</option>
              <option value="Sa'd">Sa'd (Harmonis / Berkah)</option>
              <option value="Nahs">Nahs (Friksi / Ujian)</option>
              <option value="Mu'tadil">Mu'tadil (Netral)</option>
            </select>
          </div>

          {/* Transit Planet Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-current/5 border border-current/10">
            <span className="opacity-60 text-[11px] pl-1 font-mono">Planet:</span>
            <select
              value={transitPlanetFilter}
              onChange={(e) => setTransitPlanetFilter(e.target.value)}
              className={`p-1 rounded font-serif text-[11px] outline-none ${
                isNight ? 'bg-[#080d17] text-[#e3ded5]' : 'bg-[#ffffff] text-[#2c2419]'
              }`}
            >
              <option value="all">Semua Planet Transit</option>
              {planetsList.map((p) => (
                <option key={p} value={p}>
                  {PLANETS_INFO[p].symbol} {PLANETS_INFO[p].transliteration}
                </option>
              ))}
            </select>
          </div>

          {/* Partile Only Checkbox */}
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-current/15 cursor-pointer font-serif text-[11px] hover:bg-current/5">
            <input
              type="checkbox"
              checked={onlyPartile}
              onChange={(e) => setOnlyPartile(e.target.checked)}
              className="rounded text-[#c59a43] focus:ring-0"
            />
            <span>Hanya Presisi (*Daqīqī* ≤ 1°)</span>
          </label>
        </div>

        {/* View Mode Switch (Table vs Matrix) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-current/5 border border-current/10 self-start md:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-lg text-xs font-serif flex items-center gap-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-[#c59a43] text-black font-bold shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabel Aspek</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1 rounded-lg text-xs font-serif flex items-center gap-1.5 transition-colors ${
              viewMode === 'matrix'
                ? 'bg-[#c59a43] text-black font-bold shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Matriks Transit</span>
          </button>
        </div>
      </div>

      {/* VIEW CONTENT: TABLE OR MATRIX */}
      {viewMode === 'table' ? (
        /* TABLE OF RELEVANT TRANSIT ASPECTS */
        <div
          className={`rounded-xl border overflow-hidden transition-all ${
            isNight ? 'bg-[#080d18] border-[#1d2c44]' : 'bg-[#ffffff] border-[#ded4be]'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr
                  className={`border-b font-serif text-[11px] uppercase tracking-wider ${
                    isNight
                      ? 'bg-[#0e1726] border-[#22334e] text-[#c59a43]'
                      : 'bg-[#f5ede0] border-[#e2d5bd] text-[#865d1d]'
                  }`}
                >
                  <th className="py-2.5 px-3">Planet Transit (Langit)</th>
                  <th className="py-2.5 px-3">Bentuk Aspek</th>
                  <th className="py-2.5 px-3">Planet Natal (Akar)</th>
                  <th className="py-2.5 px-3">Sudut & Orb</th>
                  <th className="py-2.5 px-3">Karakter Siklus</th>
                  <th className="py-2.5 px-3">Sifat Pengaruh</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/10">
                {filteredAspects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center opacity-60 font-serif">
                      Tidak ditemukan aspek transit yang memenuhi kriteria saringan aktif.
                    </td>
                  </tr>
                ) : (
                  filteredAspects.map((asp) => {
                    const tInfo = PLANETS_INFO[asp.transitPlanet];
                    const nInfo = PLANETS_INFO[asp.natalPlanet];
                    const tPos = transitReport.transitPositions[asp.transitPlanet];
                    const nPos = transitReport.natalPositions[asp.natalPlanet];
                    const isSelected = selectedAspect?.id === asp.id;

                    return (
                      <tr
                        key={asp.id}
                        onClick={() => setSelectedAspect(asp)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? isNight
                              ? 'bg-amber-500/15 text-amber-200'
                              : 'bg-amber-100/70 text-amber-950 font-medium'
                            : 'hover:bg-current/5'
                        }`}
                      >
                        {/* 1. Transit Planet */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-current/20"
                              style={{ color: tInfo.color }}
                            >
                              {tInfo.symbol}
                            </span>
                            <div>
                              <div className="font-serif font-bold text-xs">
                                {tInfo.transliteration}
                              </div>
                              <div className="font-mono text-[10px] opacity-70">
                                {tPos.coordinate.signDegree}°{tPos.coordinate.signDegreeMinutes}'{' '}
                                {ZODIAC_SIGNS[tPos.coordinate.signIndex].latinName}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Aspect Type */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-base font-bold ${
                                asp.nature === 'Sa\'d'
                                  ? 'text-emerald-400'
                                  : asp.nature === 'Nahs'
                                  ? 'text-rose-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {asp.symbol}
                            </span>
                            <div>
                              <span className="font-serif font-semibold block leading-tight">
                                {asp.aspectName.split('(')[0]}
                              </span>
                              <span className="font-serif text-[10px] opacity-65" dir="rtl">
                                {asp.aspectArabic}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Natal Planet */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-current/20"
                              style={{ color: nInfo.color }}
                            >
                              {nInfo.symbol}
                            </span>
                            <div>
                              <div className="font-serif font-bold text-xs">
                                {nInfo.transliteration} (Natal)
                              </div>
                              <div className="font-mono text-[10px] opacity-70">
                                {nPos.coordinate.signDegree}°{nPos.coordinate.signDegreeMinutes}'{' '}
                                {ZODIAC_SIGNS[nPos.coordinate.signIndex].latinName}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 4. Angle & Orb */}
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span>{asp.actualAngle}°</span>
                            <span className="opacity-50">/</span>
                            <span className="opacity-80">orb {asp.orbDifference}°</span>
                          </div>
                          {asp.isPartile && (
                            <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                              Daqīqī (≤1°)
                            </span>
                          )}
                        </td>

                        {/* 5. Cycle Duration */}
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              asp.cycleDuration === 'slow'
                                ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                                : asp.cycleDuration === 'medium'
                                ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                                : 'bg-slate-500/15 border-slate-500/30 text-slate-400'
                            }`}
                          >
                            {asp.cycleLabel.split('(')[0]}
                          </span>
                        </td>

                        {/* 6. Nature (Sa'd / Nahs) */}
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-serif border ${
                              asp.nature === 'Sa\'d'
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                : asp.nature === 'Nahs'
                                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                            }`}
                          >
                            {asp.nature === 'Sa\'d' ? '✨ Sa‘d (Harmoni)' : asp.nature === 'Nahs' ? '⚔️ Naḥs (Ujian)' : '⚖️ Mu‘tadil'}
                          </span>
                        </td>

                        {/* 7. Action */}
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAspect(asp);
                            }}
                            className="px-2 py-1 rounded border border-current/20 hover:bg-current/10 font-serif text-[11px]"
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
      ) : (
        /* TRANSIT × NATAL MATRIX GRID */
        <div
          className={`rounded-xl border p-3 overflow-x-auto transition-all ${
            isNight ? 'bg-[#080d18] border-[#1d2c44]' : 'bg-[#ffffff] border-[#ded4be]'
          }`}
        >
          <div className="text-xs font-serif opacity-75 mb-2">
            Matriks Persilangan: <strong>Baris = Planet Transit Saat Ini</strong> • <strong>Kolom = Kedudukan Planet Natal Asli</strong>
          </div>
          <table className="w-full text-center border-collapse text-xs select-none">
            <thead>
              <tr className="border-b border-current/20 font-serif text-[11px]">
                <th className="p-2 text-left opacity-60">Transit \ Natal</th>
                {planetsList.map((nKey) => (
                  <th key={nKey} className="p-2 font-mono">
                    <span style={{ color: PLANETS_INFO[nKey].color }}>
                      {PLANETS_INFO[nKey].symbol}
                    </span>
                    <span className="block text-[9px] opacity-75 font-serif">
                      {PLANETS_INFO[nKey].transliteration.slice(0, 3)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-current/10">
              {planetsList.map((tKey) => (
                <tr key={tKey} className="hover:bg-current/5">
                  <td className="p-2 text-left font-serif font-bold text-[11px] whitespace-nowrap">
                    <span className="inline-block mr-1.5 font-mono" style={{ color: PLANETS_INFO[tKey].color }}>
                      {PLANETS_INFO[tKey].symbol}
                    </span>
                    {PLANETS_INFO[tKey].transliteration}
                  </td>
                  {planetsList.map((nKey) => {
                    const matchAspect = transitReport.aspects.find(
                      (a) => a.transitPlanet === tKey && a.natalPlanet === nKey
                    );

                    if (!matchAspect) {
                      return (
                        <td key={nKey} className="p-2 opacity-20 font-mono text-[10px]">
                          •
                        </td>
                      );
                    }

                    const isSelected = selectedAspect?.id === matchAspect.id;

                    return (
                      <td
                        key={nKey}
                        onClick={() => setSelectedAspect(matchAspect)}
                        className={`p-2 cursor-pointer transition-transform hover:scale-110 ${
                          isSelected ? 'ring-2 ring-[#c59a43] rounded-lg' : ''
                        }`}
                        title={`Transit ${PLANETS_INFO[tKey].transliteration} ${matchAspect.aspectName} ${PLANETS_INFO[nKey].transliteration} Natal (Orb ${matchAspect.orbDifference}°)`}
                      >
                        <span
                          className={`font-bold text-sm block ${
                            matchAspect.nature === 'Sa\'d'
                              ? 'text-emerald-400'
                              : matchAspect.nature === 'Nahs'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {matchAspect.symbol}
                        </span>
                        <span className="text-[8px] font-mono opacity-70 block">
                          {matchAspect.orbDifference}°
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SELECTED TRANSIT ASPECT DEEP INSPECTOR CARD */}
      {selectedAspect && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-4 ${
            isNight ? 'bg-[#0f1729] border-[#22334f]' : 'bg-[#ffffff] border-[#ded3be] shadow-sm'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-current/10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
                  {selectedAspect.classicalInterpretation.theme}
                </span>
                <span
                  className={`font-serif text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    selectedAspect.nature === 'Sa\'d'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40'
                      : selectedAspect.nature === 'Nahs'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-400/40'
                      : 'bg-amber-500/20 text-amber-400 border-amber-400/40'
                  }`}
                >
                  {selectedAspect.nature === 'Sa\'d' ? '✨ Aspek Sa‘d (Harmonis)' : selectedAspect.nature === 'Nahs' ? '⚔️ Aspek Naḥs (Ujian)' : '⚖️ Aspek Mu‘tadil'}
                </span>
                {selectedAspect.isPartile && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    Daqīqī (Presisi Eksak)
                  </span>
                )}
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#c59a43] mt-1.5">
                {selectedAspect.classicalInterpretation.title}
              </h3>
              <div className="text-xs font-serif opacity-80 mt-0.5" dir="rtl">
                «{selectedAspect.classicalInterpretation.arabicPhrase}»
              </div>
            </div>

            {/* Annotate Button */}
            {onAnnotateTransit && (
              <button
                onClick={() =>
                  onAnnotateTransit(
                    `Transit Falak: ${selectedAspect.classicalInterpretation.title}`,
                    `Sudut ${selectedAspect.aspectName} (orb ${selectedAspect.orbDifference}°). Sifat: ${selectedAspect.nature}. Dampak: ${selectedAspect.classicalInterpretation.impactDescription}. Nasihat: ${selectedAspect.classicalInterpretation.traditionalAdvice}`
                  )
                }
                className="px-3 py-1.5 rounded-xl border border-current/20 hover:bg-current/10 text-xs flex items-center gap-1.5 font-serif self-start opacity-80 hover:opacity-100 transition-colors"
                title="Simpan anotasi transit ke catatan riset"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-[#c59a43]" />
                <span>Catat ke Jurnal Riset</span>
              </button>
            )}
          </div>

          {/* Coordinate Comparison Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {/* Transit Planet Detail */}
            <div className="p-3 rounded-xl bg-current/5 border border-current/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] opacity-60 font-serif block">Planet Transit di Langit Saat Ini:</span>
                <span className="font-bold font-serif text-sm" style={{ color: PLANETS_INFO[selectedAspect.transitPlanet].color }}>
                  {PLANETS_INFO[selectedAspect.transitPlanet].symbol} {PLANETS_INFO[selectedAspect.transitPlanet].transliteration}
                </span>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {transitReport.transitPositions[selectedAspect.transitPlanet].coordinate.signDegree}°
                  {transitReport.transitPositions[selectedAspect.transitPlanet].coordinate.signDegreeMinutes}'{' '}
                  {ZODIAC_SIGNS[transitReport.transitPositions[selectedAspect.transitPlanet].coordinate.signIndex].latinName}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] opacity-60 font-serif block">Durasi Siklus:</span>
                <span className="font-bold text-xs">{selectedAspect.cycleLabel}</span>
              </div>
            </div>

            {/* Natal Planet Detail */}
            <div className="p-3 rounded-xl bg-current/5 border border-current/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] opacity-60 font-serif block">Kedudukan Planet Natal Pengguna:</span>
                <span className="font-bold font-serif text-sm" style={{ color: PLANETS_INFO[selectedAspect.natalPlanet].color }}>
                  {PLANETS_INFO[selectedAspect.natalPlanet].symbol} {PLANETS_INFO[selectedAspect.natalPlanet].transliteration}
                </span>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {transitReport.natalPositions[selectedAspect.natalPlanet].coordinate.signDegree}°
                  {transitReport.natalPositions[selectedAspect.natalPlanet].coordinate.signDegreeMinutes}'{' '}
                  {ZODIAC_SIGNS[transitReport.natalPositions[selectedAspect.natalPlanet].coordinate.signIndex].latinName}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] opacity-60 font-serif block">Kekuatan Aspek:</span>
                <span className="font-bold text-xs text-[#c59a43]">{selectedAspect.strengthPercent}%</span>
              </div>
            </div>
          </div>

          {/* Detailed Interpretation Text */}
          <div className="space-y-2 text-xs leading-relaxed font-serif">
            <div className="p-3.5 rounded-xl bg-current/5 border border-current/10 space-y-1">
              <span className="font-bold text-[#c59a43] block">
                Uraian Dampak Astrologi Klasik (*Aḥkām at-Taḥwīl*):
              </span>
              <p className="opacity-90">{selectedAspect.classicalInterpretation.impactDescription}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-current/5 border border-current/10 space-y-1">
              <span className="font-bold text-emerald-400 block flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Nasihat Falakiyah & Ikhtiar Terpuji (*Al-Waṣiyyah al-Falakiyyah*):
              </span>
              <p className="opacity-90">{selectedAspect.classicalInterpretation.traditionalAdvice}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
