import React, { useState, useMemo } from 'react';
import { HistoricalDateInfo, ThemeMode } from '../types';
import {
  calculateAhkamMawlayinReport,
  HISTORICAL_MUNDANE_PRESETS,
  SuperiorPlanetKey,
  SuperiorAspectInteraction,
  HistoricalMundanePreset,
} from '../lib/mawlayinEngine';
import { PLANETS_INFO, ZODIAC_SIGNS } from '../lib/sindhindEngine';
import { dateToJdn, getFullHistoricalDate } from '../lib/calendarConverter';
import {
  Landmark,
  Scale,
  Shield,
  Crown,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  BookmarkPlus,
  Flame,
  Award,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Feather,
} from 'lucide-react';

interface AhkamMawlayinViewProps {
  currentDateInfo: HistoricalDateInfo;
  theme: ThemeMode;
  onAnnotateMundane?: (title: string, content: string) => void;
}

export const AhkamMawlayinView: React.FC<AhkamMawlayinViewProps> = ({
  currentDateInfo,
  theme,
  onAnnotateMundane,
}) => {
  const isNight = theme === 'night';

  // Selected Preset or Live Date
  const [selectedPresetId, setSelectedPresetId] = useState<string>('live');

  // Custom observation date state (initialized to current app date)
  const [customDate, setCustomDate] = useState<{
    year: number;
    month: number;
    day: number;
  }>({
    year: currentDateInfo.julian.year,
    month: currentDateInfo.julian.month,
    day: currentDateInfo.julian.day,
  });

  // Calculate JDN based on selection
  const activeJdn = useMemo(() => {
    if (selectedPresetId === 'live') {
      return dateToJdn(customDate.year, customDate.month, customDate.day, 12, 0);
    }
    const preset = HISTORICAL_MUNDANE_PRESETS.find((p) => p.id === selectedPresetId);
    if (preset) {
      return dateToJdn(preset.year, preset.month, preset.day, 12, 0);
    }
    return dateToJdn(customDate.year, customDate.month, customDate.day, 12, 0);
  }, [selectedPresetId, customDate]);

  // Generate Report
  const report = useMemo(() => {
    return calculateAhkamMawlayinReport(activeJdn);
  }, [activeJdn]);

  // Selected aspect for detailed breakdown
  const [selectedAspect, setSelectedAspect] = useState<SuperiorAspectInteraction | null>(
    report.aspectInteractions[0] || null
  );

  // Sector tabs: 'all' | 'gov' | 'welfare' | 'security'
  const [activeSectorTab, setActiveSectorTab] = useState<'all' | 'gov' | 'welfare' | 'security'>('all');
  const [showTheory, setShowTheory] = useState<boolean>(false);

  // Sync to app's real date
  const handleResetToCurrent = () => {
    setSelectedPresetId('live');
    setCustomDate({
      year: currentDateInfo.julian.year,
      month: currentDateInfo.julian.month,
      day: currentDateInfo.julian.day,
    });
  };

  const superiors: SuperiorPlanetKey[] = ['saturn', 'jupiter', 'mars'];

  return (
    <div
      id="ahkam-mawlayin-module"
      className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-5 ${
        isNight
          ? 'bg-[#0e1320]/95 border-[#263550] text-[#e2ded6]'
          : 'bg-[#faf6ee] border-[#ded4bf] text-[#2d241a] shadow-sm'
      }`}
    >
      {/* Module Title Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-current/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
              أَحْكَامُ المَوْلَيَيْنِ وَالكَاكِبِ العُلْوِيَّة
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-[#c59a43]">
              Aḥkām al-Mawlayayn: Ramalan Pemerintahan & Iklim Sosial
            </h2>
          </div>
          <p className="text-xs opacity-80 mt-1 font-serif">
            Hisab astrologi kenegaraan (*Aḥkām ad-Duwal wal-Mulūk*) berbasis naskah <em>Zīj as-Sindhind</em> dan risalah Abū Ma‘shar al-Balkhī (*Kitāb al-Milal wa-d-Duwal*) melalui konfigurasi 3 planet Superior (*Zuhal, Musytarī, Mirrīkh*).
          </p>
        </div>

        {/* Preset Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto text-xs">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-current/5 border border-current/10">
            <Landmark className="w-3.5 h-3.5 text-[#c59a43] ml-1" />
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className={`p-1 rounded font-serif text-xs font-semibold outline-none cursor-pointer ${
                isNight ? 'bg-[#080d17] text-[#e3ded5]' : 'bg-[#ffffff] text-[#2c2419]'
              }`}
            >
              <option value="live">📍 Waktu Observasi Terkini</option>
              <optgroup label="Simulasi Era Sejarah Klasik:">
                {HISTORICAL_MUNDANE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.year} M)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Reset to Now */}
          {selectedPresetId !== 'live' && (
            <button
              onClick={handleResetToCurrent}
              className="px-2.5 py-1.5 rounded-xl border border-[#c59a43]/40 bg-[#c59a43]/15 hover:bg-[#c59a43]/25 text-[#c59a43] font-mono text-xs flex items-center gap-1 transition-colors"
              title="Kembalikan ke observasi waktu sekarang"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hari Ini</span>
            </button>
          )}

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
            <span className="hidden sm:inline">Kaidah Falak Muluk</span>
            {showTheory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Classical Mundane Astrological Theory Deck */}
      {showTheory && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
            isNight
              ? 'bg-[#111827] border-[#253552] text-[#d6e0ef]'
              : 'bg-[#f5ede0] border-[#ded0b6] text-[#332b1f]'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <span className="p-1.5 rounded bg-[#c59a43]/20 text-[#c59a43] shrink-0 mt-0.5">
              <Crown className="w-4 h-4" />
            </span>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-serif font-bold text-sm text-[#c59a43]">
                  Kaidah Falak Kenegaraan (*Aḥkām al-Mulk wal-Kawākib al-‘Ulwiyyah*):
                </h4>
                <span className="text-[11px] font-serif opacity-75 italic" dir="rtl">
                  «مَعْرِفَةُ سِيَاسَةِ الدُّوَلِ وَأَحْوَالِ المُلُوكِ بِالقِرَانَاتِ العُلْوِيَّة»
                </span>
              </div>
              <p>
                Dalam kosmologi <em>Zīj as-Sindhind</em> dan risalah kenegaraan Al-Kindī serta Abū Ma‘shar, orbit planet Superior (*Al-Kawākib al-‘Ulwiyyah*) berada di atas orbit Matahari sehingga memiliki putaran terpanjang dan menguasai siklus makro peradaban manusia:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-mono text-[11px]">
                <div className="p-2.5 rounded bg-current/5 border border-current/10">
                  <span className="text-[#c59a43] font-bold block mb-1 font-serif flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5" /> 1. Saturnus (*Zuhal - Al-Mawlā al-Awwal*)
                  </span>
                  Menguasai institusi hukum, bangunan birokrasi permanen, kedaulatan tanah, regulasi pajak, masa kesabaran, serta ketahanan kepemimpinan senior.
                </div>
                <div className="p-2.5 rounded bg-current/5 border border-current/10">
                  <span className="text-[#c59a43] font-bold block mb-1 font-serif flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" /> 2. Yupiter (*Al-Mushtarī - Al-Mawlā ath-Thānī*)
                  </span>
                  Menguasai keadilan (*Al-‘Adl*), perbendaharaan kas negara (*Al-Khazīnah*), kemakmuran pasar, kedermawanan sosial, serta etika kaum cendekiawan.
                </div>
                <div className="p-2.5 rounded bg-current/5 border border-current/10">
                  <span className="text-[#c59a43] font-bold block mb-1 font-serif flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> 3. Mars (*Al-Mirrīkh - Ṣāḥib as-Sayf*)
                  </span>
                  Menguasai angkatan bersenjata (*Al-Jund*), kesiapsiagaan pertahanan, penegakan keamanan, dinamika tenaga kerja, serta mitigasi potensi friksi sipil.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preset Context Banner (If historical preset selected) */}
      {selectedPresetId !== 'live' && (
        <div
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isNight ? 'bg-[#141b2c] border-[#253550]' : 'bg-[#f4ebe0] border-[#ded0b6]'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43]">
                Konteks Sejarah
              </span>
              <span className="font-serif font-bold text-sm text-[#c59a43]">
                {HISTORICAL_MUNDANE_PRESETS.find((p) => p.id === selectedPresetId)?.name}
              </span>
            </div>
            <p className="font-serif opacity-85 text-[11px] leading-relaxed">
              {HISTORICAL_MUNDANE_PRESETS.find((p) => p.id === selectedPresetId)?.historicalContext}
            </p>
          </div>
          <div className="shrink-0 text-right sm:border-l sm:border-current/10 sm:pl-3">
            <span className="text-[10px] font-mono opacity-70 block">Hasil Realitas Sejarah:</span>
            <span className="font-serif text-[11px] text-emerald-400 font-medium">
              {HISTORICAL_MUNDANE_PRESETS.find((p) => p.id === selectedPresetId)?.historicalOutcome}
            </span>
          </div>
        </div>
      )}

      {/* OVERALL MUNDANE CLIMATE & TRI-GAUGE METRICS */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          report.metrics.socialWelfareIndex >= 65 && report.metrics.governanceStabilityIndex >= 60
            ? isNight
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : report.metrics.publicSecurityIndex < 45 || report.metrics.governanceStabilityIndex < 45
            ? isNight
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-950'
            : isNight
            ? 'bg-[#11192b] border-[#243553] text-[#d6e0ef]'
            : 'bg-[#ffffff] border-[#ded0b6] shadow-sm text-[#2b2216]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Main Atmosphere Summary */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-current/10 border border-current/20">
                Iklim Kenegaraan & Sosial
              </span>
              <span className="font-serif font-bold text-base sm:text-lg">
                {report.metrics.overallMundaneTone}
              </span>
              <span className="text-xs opacity-75 font-serif hidden md:inline" dir="rtl">
                «{report.metrics.toneArabic}»
              </span>
            </div>
            <p className="text-xs leading-relaxed opacity-90 font-serif max-w-2xl">
              {report.metrics.toneSummary}
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-mono">
              <span className="opacity-70">Dominansi Penguasa Langit:</span>
              <span className="font-bold text-[#c59a43] px-2 py-0.5 rounded bg-[#c59a43]/15 border border-[#c59a43]/30">
                {report.metrics.dominantRuler}
              </span>
            </div>
          </div>

          {/* Tri-Gauge Progress Meters */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center font-mono shrink-0">
            {/* 1. Governance */}
            <div className="p-3 rounded-xl bg-current/5 border border-current/10 flex flex-col items-center justify-between min-w-[90px]">
              <Landmark className="w-4 h-4 text-sky-400 mb-1" />
              <div className="text-[10px] opacity-70 leading-tight">Stabilitas Negara</div>
              <div className="text-xl font-bold my-1 text-sky-400">
                {report.metrics.governanceStabilityIndex}%
              </div>
              <div className="w-full bg-current/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${report.metrics.governanceStabilityIndex}%` }}
                />
              </div>
            </div>

            {/* 2. Social Welfare */}
            <div className="p-3 rounded-xl bg-current/5 border border-current/10 flex flex-col items-center justify-between min-w-[90px]">
              <Scale className="w-4 h-4 text-emerald-400 mb-1" />
              <div className="text-[10px] opacity-70 leading-tight">Kesejahteraan</div>
              <div className="text-xl font-bold my-1 text-emerald-400">
                {report.metrics.socialWelfareIndex}%
              </div>
              <div className="w-full bg-current/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${report.metrics.socialWelfareIndex}%` }}
                />
              </div>
            </div>

            {/* 3. Security */}
            <div className="p-3 rounded-xl bg-current/5 border border-current/10 flex flex-col items-center justify-between min-w-[90px]">
              <Shield className="w-4 h-4 text-amber-400 mb-1" />
              <div className="text-[10px] opacity-70 leading-tight">Ketahanan Aman</div>
              <div className="text-xl font-bold my-1 text-amber-400">
                {report.metrics.publicSecurityIndex}%
              </div>
              <div className="w-full bg-current/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${report.metrics.publicSecurityIndex}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THE THREE SUPERIORS DIGNITY CARDS (Al-Kawakib al-Ulwiyyah) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#c59a43]" />
            <h3 className="font-serif font-bold text-sm text-[#c59a43]">
              Kedudukan & Martabat 3 Planet Superior (*Al-Kawākib al-‘Ulwiyyah*):
            </h3>
          </div>
          <span className="text-[10px] font-mono opacity-70">
            Dihitung dari Zīj as-Sindhind
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {superiors.map((pKey) => {
            const dig = report.planetsDignity[pKey];
            const info = PLANETS_INFO[pKey];

            return (
              <div
                key={pKey}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isNight ? 'bg-[#0a0f1d] border-[#1f2d47]' : 'bg-[#ffffff] border-[#ded4be] shadow-sm'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-current/10">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-base shrink-0 border border-current/20"
                        style={{ color: info.color }}
                      >
                        {info.symbol}
                      </span>
                      <div>
                        <div className="font-serif font-bold text-sm">
                          {info.transliteration} ({info.arabicName})
                        </div>
                        <div className="text-[10px] opacity-70 font-mono">
                          {dig.mundaneRole}
                        </div>
                      </div>
                    </div>

                    {/* Dignity Badge */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-serif font-semibold border ${
                        dig.dignity === 'Bayt' || dig.dignity === 'Sharaf'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40'
                          : dig.dignity === 'Wabal' || dig.dignity === 'Hubut'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-400/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-400/40'
                      }`}
                    >
                      {dig.dignityArabic}
                    </span>
                  </div>

                  {/* Position Coordinates & Sign */}
                  <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#c59a43]">{dig.signName}</span>
                      <span className="opacity-60 text-[10px]">({dig.signArabic})</span>
                    </div>
                    <div className="text-right">
                      <span>
                        {dig.position.coordinate.signDegree}°
                        {dig.position.coordinate.signDegreeMinutes}'
                      </span>
                      {dig.isRetrograde && (
                        <span className="ml-1.5 px-1 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                          Raji' ℞
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sign Element & Modality */}
                  <div className="flex items-center gap-2 text-[10px] font-serif opacity-75 mt-1">
                    <span>Unsur: {dig.signElement} ({dig.signElementArabic})</span>
                    <span>•</span>
                    <span>Sifat: {dig.signModality}</span>
                  </div>

                  {/* Astrological Analysis Narrative */}
                  <p className="mt-2 text-[11px] leading-relaxed opacity-85 font-serif">
                    {dig.dignityDescription}
                  </p>
                </div>

                {/* Score Footnote */}
                <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-[10px] font-mono opacity-70">
                  <span>Skor Martabat: {dig.dignityScore > 0 ? `+${dig.dignityScore}` : dig.dignityScore}</span>
                  <span className="font-serif italic">{dig.mundaneRoleArabic}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRAND CONJUNCTION (QIRAN AL-MAWLAYAYN) CYCLE BANNER */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          isNight ? 'bg-[#0f172a] border-[#22334f]' : 'bg-[#f4ede1] border-[#d8caba]'
        }`}
      >
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/30">
              Siklus Konjungsi Agung (*Al-Qirān al-A‘ẓam*)
            </span>
            <span className="font-serif font-bold text-sm text-[#c59a43]">
              Jarak Sudut Saturnus ☌ Yupiter: {report.grandConjunction.angularSeparation}°
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-current/10 border border-current/20">
              {report.grandConjunction.phase}
            </span>
          </div>
          <p className="text-xs font-serif opacity-90 leading-relaxed">
            <strong>Triplisitas Aktif:</strong> {report.grandConjunction.activeTriplicity} ({report.grandConjunction.activeTriplicityArabic}). {report.grandConjunction.epochSignificance}
          </p>
        </div>

        <div className="shrink-0 font-mono text-center md:text-right border-t md:border-t-0 md:border-l border-current/10 pt-2 md:pt-0 md:pl-4">
          <div className="text-[10px] opacity-70">Siklus 20 Tahunan</div>
          <div className="text-sm font-bold text-[#c59a43]">
            {report.grandConjunction.approxYearsToNextExact <= 1
              ? 'Mendekati Titik Nol'
              : `± ${report.grandConjunction.approxYearsToNextExact} Tahun`}
          </div>
          <div className="text-[9px] opacity-60">Estimasi Ke Konjungsi Berikutnya</div>
        </div>
      </div>

      {/* MUTUAL ASPECTS BETWEEN SUPERIOR PLANETS TABLE */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#c59a43]" />
            <h3 className="font-serif font-bold text-sm text-[#c59a43]">
              Tabel Aspek & Interaksi Antar Planet Superior:
            </h3>
          </div>
          <span className="text-[10px] font-mono opacity-70">
            Klik baris untuk menelaah dampak kenegaraan
          </span>
        </div>

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
                  <th className="py-2.5 px-3">Pasangan Hubungan</th>
                  <th className="py-2.5 px-3">Bentuk Aspek</th>
                  <th className="py-2.5 px-3">Sudut & Orb</th>
                  <th className="py-2.5 px-3">Sifat Pengaruh</th>
                  <th className="py-2.5 px-3">Kekuatan</th>
                  <th className="py-2.5 px-3">Tema Kenegaraan (*Al-Mulk*)</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/10">
                {report.aspectInteractions.map((asp) => {
                  const pAInfo = PLANETS_INFO[asp.planetA];
                  const pBInfo = PLANETS_INFO[asp.planetB];
                  const isSelected = selectedAspect?.id === asp.id;

                  return (
                    <tr
                      key={asp.id}
                      onClick={() => setSelectedAspect(asp)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? isNight
                            ? 'bg-[#c59a43]/15 text-amber-200'
                            : 'bg-amber-100/70 text-amber-950 font-medium'
                          : 'hover:bg-current/5'
                      }`}
                    >
                      {/* 1. Pair */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 font-serif font-bold text-xs">
                          <span style={{ color: pAInfo.color }}>{pAInfo.symbol}</span>
                          <span>{pAInfo.transliteration}</span>
                          <span className="opacity-50 font-mono text-[10px]">⟷</span>
                          <span style={{ color: pBInfo.color }}>{pBInfo.symbol}</span>
                          <span>{pBInfo.transliteration}</span>
                        </div>
                      </td>

                      {/* 2. Aspect Type */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-sm font-bold ${
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
                            <span className="font-serif block leading-tight">
                              {asp.aspectName}
                            </span>
                            <span className="font-serif text-[10px] opacity-65" dir="rtl">
                              {asp.aspectArabic}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Angle & Orb */}
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <span>{asp.actualAngle}°</span>
                        {asp.aspectType !== 'none' && (
                          <span className="opacity-70 ml-1 text-[10px]">
                            (orb {asp.orbDifference}°)
                          </span>
                        )}
                      </td>

                      {/* 4. Nature */}
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
                          {asp.nature === 'Sa\'d'
                            ? '✨ Sa‘d (Harmoni)'
                            : asp.nature === 'Nahs'
                            ? '⚔️ Naḥs (Friksi)'
                            : '⚖️ Mu‘tadil'}
                        </span>
                      </td>

                      {/* 5. Power */}
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-current/10 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#c59a43] h-full rounded-full"
                              style={{ width: `${asp.influencePower}%` }}
                            />
                          </div>
                          <span>{asp.influencePower}%</span>
                        </div>
                      </td>

                      {/* 6. Theme */}
                      <td className="py-2.5 px-3 font-serif text-[11px]">
                        <span className="text-[#c59a43] font-semibold block">
                          {asp.mundaneTheme}
                        </span>
                        <span className="opacity-70 line-clamp-1 text-[10px]">
                          {asp.societalImpact}
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SELECTED ASPECT DEEP INSPECTION CARD */}
      {selectedAspect && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
            isNight ? 'bg-[#0b101c] border-[#22334e]' : 'bg-[#ffffff] border-[#ded3be] shadow-sm'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-current/10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
                  Telaah Interaksi Kenegaraan
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
                  {selectedAspect.nature === 'Sa\'d'
                    ? '✨ Sinergi Sa‘d (Memakmurkan)'
                    : selectedAspect.nature === 'Nahs'
                    ? '⚔️ Tegangan Naḥs (Ujian Disiplin)'
                    : '⚖️ Resonansi Mu‘tadil'}
                </span>
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#c59a43] mt-1.5">
                {selectedAspect.mundaneTheme} ({PLANETS_INFO[selectedAspect.planetA].transliteration} ⟷ {PLANETS_INFO[selectedAspect.planetB].transliteration})
              </h3>
            </div>

            {/* Annotate Button */}
            {onAnnotateMundane && (
              <button
                onClick={() =>
                  onAnnotateMundane(
                    `Ahkam al-Mawlayin: ${selectedAspect.mundaneTheme}`,
                    `Interaksi ${PLANETS_INFO[selectedAspect.planetA].transliteration} & ${PLANETS_INFO[selectedAspect.planetB].transliteration} (${selectedAspect.aspectName}, orb ${selectedAspect.orbDifference}°). Sifat: ${selectedAspect.nature}. Dampak Sosial: ${selectedAspect.societalImpact}. Preseden Sejarah: ${selectedAspect.historicalPrecedent}`
                  )
                }
                className="px-3 py-1.5 rounded-xl border border-current/20 hover:bg-current/10 text-xs font-serif font-semibold flex items-center gap-1.5 transition-colors"
                title="Simpan analisis ini ke Jurnal Riset Falak"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-[#c59a43]" />
                <span>Catat ke Jurnal</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Impact Narrative */}
            <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-1.5">
              <span className="font-serif font-bold text-xs text-[#c59a43] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Dampak Pada Iklim Sosial & Kebijakan Negara:
              </span>
              <p className="font-serif leading-relaxed opacity-90">
                {selectedAspect.societalImpact}
              </p>
            </div>

            {/* Historical Precedent */}
            <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-1.5">
              <span className="font-serif font-bold text-xs text-[#c59a43] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Preseden Naskah Sejarah Klasik (*Kitāb al-Milal*):
              </span>
              <p className="font-serif leading-relaxed opacity-90 italic">
                "{selectedAspect.historicalPrecedent}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTORAL MUNDANE FORECAST PANELS (3 Sektor Utama) */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-[#c59a43]" />
            <h3 className="font-serif font-bold text-sm text-[#c59a43]">
              Ramalan Sektoral Kenegaraan (*Taqdīr al-Aḥwāl al-Madaniyyah*):
            </h3>
          </div>

          {/* Tab Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-current/5 border border-current/10 text-xs">
            <button
              onClick={() => setActiveSectorTab('all')}
              className={`px-2.5 py-1 rounded-lg font-serif transition-colors ${
                activeSectorTab === 'all'
                  ? 'bg-[#c59a43] text-black font-bold shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Semua Sektor
            </button>
            <button
              onClick={() => setActiveSectorTab('gov')}
              className={`px-2.5 py-1 rounded-lg font-serif transition-colors ${
                activeSectorTab === 'gov'
                  ? 'bg-[#c59a43] text-black font-bold shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Pemerintahan
            </button>
            <button
              onClick={() => setActiveSectorTab('welfare')}
              className={`px-2.5 py-1 rounded-lg font-serif transition-colors ${
                activeSectorTab === 'welfare'
                  ? 'bg-[#c59a43] text-black font-bold shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Ekonomi Rakyat
            </button>
            <button
              onClick={() => setActiveSectorTab('security')}
              className={`px-2.5 py-1 rounded-lg font-serif transition-colors ${
                activeSectorTab === 'security'
                  ? 'bg-[#c59a43] text-black font-bold shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Pertahanan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Sector 1: Governance */}
          {(activeSectorTab === 'all' || activeSectorTab === 'gov') && (
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                isNight ? 'bg-[#0d1424] border-[#22334f]' : 'bg-[#ffffff] border-[#ded4be] shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-current/10">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-sky-400" />
                    <span className="font-serif font-bold text-xs text-sky-400">
                      Tata Kelola Negara
                    </span>
                  </div>
                  <span className="text-[10px] font-serif opacity-70" dir="rtl">
                    سِيَاسَةُ المُلْك
                  </span>
                </div>
                <div className="font-serif font-bold text-sm text-[#c59a43]">
                  {report.sectorForecasts.governanceAndState.verdict}
                </div>
                <p className="text-xs leading-relaxed opacity-85 font-serif">
                  {report.sectorForecasts.governanceAndState.detailedAnalysis}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-current/5 border border-current/10 text-[11px] font-serif">
                <span className="text-[#c59a43] font-bold block mb-1">
                  Petuah Tata Negara (*Adab as-Sulṭān*):
                </span>
                <p className="opacity-90 italic">
                  "{report.sectorForecasts.governanceAndState.policyAdvice}"
                </p>
              </div>
            </div>
          )}

          {/* Sector 2: Social Welfare */}
          {(activeSectorTab === 'all' || activeSectorTab === 'welfare') && (
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                isNight ? 'bg-[#0d1424] border-[#22334f]' : 'bg-[#ffffff] border-[#ded4be] shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-current/10">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <span className="font-serif font-bold text-xs text-emerald-400">
                      Kesejahteraan Rakyat
                    </span>
                  </div>
                  <span className="text-[10px] font-serif opacity-70" dir="rtl">
                    أَحْوَالُ الرَّعِيَّة
                  </span>
                </div>
                <div className="font-serif font-bold text-sm text-[#c59a43]">
                  {report.sectorForecasts.publicWelfareAndEconomy.verdict}
                </div>
                <p className="text-xs leading-relaxed opacity-85 font-serif">
                  {report.sectorForecasts.publicWelfareAndEconomy.detailedAnalysis}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-current/5 border border-current/10 text-[11px] font-serif">
                <span className="text-[#c59a43] font-bold block mb-1">
                  Tuntunan Masyarakat (*Tadbīr al-Ma‘āsh*):
                </span>
                <p className="opacity-90 italic">
                  "{report.sectorForecasts.publicWelfareAndEconomy.societalAdvice}"
                </p>
              </div>
            </div>
          )}

          {/* Sector 3: Security & Defense */}
          {(activeSectorTab === 'all' || activeSectorTab === 'security') && (
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                isNight ? 'bg-[#0d1424] border-[#22334f]' : 'bg-[#ffffff] border-[#ded4be] shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-current/10">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span className="font-serif font-bold text-xs text-amber-400">
                      Pertahanan & Keamanan
                    </span>
                  </div>
                  <span className="text-[10px] font-serif opacity-70" dir="rtl">
                    الأَمْنُ وَالجُنْد
                  </span>
                </div>
                <div className="font-serif font-bold text-sm text-[#c59a43]">
                  {report.sectorForecasts.securityAndDefense.verdict}
                </div>
                <p className="text-xs leading-relaxed opacity-85 font-serif">
                  {report.sectorForecasts.securityAndDefense.detailedAnalysis}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-current/5 border border-current/10 text-[11px] font-serif">
                <span className="text-[#c59a43] font-bold block mb-1">
                  Nasihat Pertahanan (*Siyāsat al-Amn*):
                </span>
                <p className="opacity-90 italic">
                  "{report.sectorForecasts.securityAndDefense.securityAdvice}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CLASSICAL STATESMAN WISDOM (Siyasatnama / Nizam al-Mulk) */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-3.5 transition-all ${
          isNight ? 'bg-[#080d17] border-[#1d2b42]' : 'bg-[#f7f2e6] border-[#ded2bc]'
        }`}
      >
        <span className="w-10 h-10 rounded-full bg-[#c59a43]/20 border border-[#c59a43]/40 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-[#c59a43]" />
        </span>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="text-xs font-serif font-bold text-[#c59a43]" dir="rtl">
            «{report.classicalQuote.textArabic}»
          </div>
          <p className="text-xs font-serif opacity-90 italic">
            "{report.classicalQuote.textIndonesian}"
          </p>
          <div className="text-[10px] font-mono opacity-60">
            Sumber: {report.classicalQuote.source} • {report.classicalQuote.author}
          </div>
        </div>
      </div>
    </div>
  );
};
