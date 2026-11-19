import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BookmarkPlus,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Droplets,
  HeartPulse,
  Moon,
  Plus,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import { IatroastrologyJumalCalculator } from './IatroastrologyJumalCalculator';
import {
  AspectRelation,
  HistoricalDateInfo,
  PlanetKey,
  PlanetaryPosition,
  ThemeMode,
} from '../types';
import { ZODIAC_SIGNS } from '../lib/sindhindEngine';
import {
  COMMON_SYMPTOM_PRESETS,
  FOUR_HUMORS,
  HumorType,
  KAWKAB_ANATOMY,
  MedicalSymptomLog,
  ZODIAC_MELOTHESIA,
  buildAspectSnapshotsForPlanet,
  createSymptomLogEntry,
  evaluateIatroastrologyState,
  loadSymptomLogs,
  saveSymptomLogs,
} from '../lib/iatroastrologyEngine';

interface IatroastrologyViewProps {
  positions: Record<PlanetKey, PlanetaryPosition>;
  aspects: AspectRelation[];
  currentDateInfo: HistoricalDateInfo;
  theme: ThemeMode;
  onAnnotate?: (title: string, content: string) => void;
}

const SEVERITY_LABELS: Record<1 | 2 | 3 | 4 | 5, { label: string; colorClass: string }> = {
  1: { label: '1 · Sangat Ringan', colorClass: 'bg-sky-500/15 text-sky-400 border-sky-500/35' },
  2: { label: '2 · Ringan', colorClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35' },
  3: { label: '3 · Sedang', colorClass: 'bg-amber-500/15 text-amber-400 border-amber-500/35' },
  4: { label: '4 · Cukup Berat', colorClass: 'bg-orange-500/15 text-orange-400 border-orange-500/35' },
  5: { label: '5 · Berat / Akut', colorClass: 'bg-rose-500/15 text-rose-400 border-rose-500/35' },
};

export const IatroastrologyView: React.FC<IatroastrologyViewProps> = ({
  positions,
  aspects,
  currentDateInfo,
  theme,
  onAnnotate,
}) => {
  const isNight = theme === 'night';

  // Evaluation report computed dynamically from chartData
  const report = useMemo(
    () => evaluateIatroastrologyState(positions, aspects),
    [positions, aspects]
  );

  // Currently selected Kawkab in anatomical map / inspector
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetKey>('sun');
  const [activeSubSection, setActiveSubSection] = useState<
    'diagnosis' | 'jumal_medis' | 'buruj' | 'logger'
  >('diagnosis');

  // Clinical Physical Symptom Logger states
  const [logs, setLogs] = useState<MedicalSymptomLog[]>(() => loadSymptomLogs());
  const [symptomTitle, setSymptomTitle] = useState<string>('');
  const [logPlanetKey, setLogPlanetKey] = useState<PlanetKey>('sun');
  const [organTarget, setOrganTarget] = useState<string>(KAWKAB_ANATOMY.sun.organsList[0]);
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [notes, setNotes] = useState<string>('');
  const [filterLogPlanet, setFilterLogPlanet] = useState<PlanetKey | 'all'>('all');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const selectedEval = report.evaluations[selectedPlanet];
  const selectedSign = ZODIAC_SIGNS[selectedEval.position.coordinate.signIndex];

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    window.setTimeout(() => setFeedbackToast(null), 3200);
  };

  const handleSelectPlanetFromChart = (key: PlanetKey) => {
    setSelectedPlanet(key);
    setLogPlanetKey(key);
    setOrganTarget(KAWKAB_ANATOMY[key].organsList[0]);
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = COMMON_SYMPTOM_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSymptomTitle(preset.label);
    setLogPlanetKey(preset.defaultPlanet);
    setOrganTarget(preset.defaultOrgan);
    setSelectedPlanet(preset.defaultPlanet);
  };

  const previewLogAspects = useMemo(
    () => buildAspectSnapshotsForPlanet(logPlanetKey, aspects),
    [logPlanetKey, aspects]
  );

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedTitle = symptomTitle.trim();
    if (!cleanedTitle) {
      triggerToast('Tuliskan atau pilih keluhan fisik terlebih dahulu.');
      return;
    }

    const entry = createSymptomLogEntry({
      symptomTitle: cleanedTitle,
      planetKey: logPlanetKey,
      organTarget: organTarget.trim() || KAWKAB_ANATOMY[logPlanetKey].organsList[0],
      severity,
      notes,
      currentDateInfo,
      positions,
      aspects,
      dominantHumor: report.dominantHumor,
    });

    const nextLogs = [entry, ...logs];
    setLogs(nextLogs);
    saveSymptomLogs(nextLogs);

    setSymptomTitle('');
    setNotes('');
    setSeverity(2);
    triggerToast('Keluhan fisik & snapshot aspek planet berhasil dicatat.');
  };

  const handleDeleteLog = (id: string) => {
    const nextLogs = logs.filter((item) => item.id !== id);
    setLogs(nextLogs);
    saveSymptomLogs(nextLogs);
    triggerToast('Catatan keluhan dihapus.');
  };

  const filteredLogs = useMemo(() => {
    if (filterLogPlanet === 'all') return logs;
    return logs.filter((l) => l.planetKey === filterLogPlanet);
  }, [logs, filterLogPlanet]);

  const cardBg = isNight
    ? 'bg-[#101624] border-[#24324c] text-[#e5dccb]'
    : 'bg-[#faf6ed] border-[#dacdb2] text-[#2c2419]';
  const subSurface = isNight
    ? 'bg-[#0b101b] border-[#1f2b42]'
    : 'bg-white border-[#e2d6bd]';

  const dayRulerAnatomy = KAWKAB_ANATOMY[currentDateInfo.dayRuler];
  const hourRulerAnatomy = KAWKAB_ANATOMY[currentDateInfo.hourRuler];

  return (
    <div className="space-y-6 pb-8">
      {/* Feedback Toast */}
      {feedbackToast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-emerald-700 text-white font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm max-w-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. MODULE HEADER & TOP MEDICAL ASTRONOMY TELEMETRY RIBBON           */}
      {/* =================================================================== */}
      <section className={`rounded-2xl border p-4 sm:p-6 shadow-sm space-y-4 ${cardBg}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#c59a43] font-semibold">
              <span className="font-arabic text-base sm:text-lg">
                عِلْمُ الطِّبِّ النُّجُومِيِّ وَتَقْسِيمُ الأَعْضَاءِ عَلَى الكَوَاكِبِ
              </span>
              <span aria-hidden="true">·</span>
              <span>Iatroastrology (Zij as-Sindhind)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold">
              Ilmu Bintang Kedokteran, Organ Tubuh &amp; Catatan Aspek Fisik
            </h1>
            <p className="text-xs sm:text-sm opacity-80 max-w-3xl leading-relaxed">
              Analisis hubungan tujuh <em>kawkab</em> dan dua belas <em>buruj</em> dengan organ tubuh serta empat <em>akhlāṭ</em> (darah, empedu kuning, flegma, empedu hitam) menurut tradisi <em>Zij as-Sindhind</em> dan <em>at-Ṭibb an-Nujūmī</em>.
            </p>
          </div>

          {/* Sub-section switcher */}
          <div
            className={`flex items-center p-1 rounded-xl border overflow-x-auto no-scrollbar max-w-full shrink-0 ${
              isNight ? 'bg-[#0b101b] border-[#1f2b42]' : 'bg-[#ede5d5] border-[#d6c8ad]'
            }`}
          >
            {[
              { id: 'diagnosis' as const, label: 'Peta Organ & Kawkab', icon: Stethoscope },
              { id: 'jumal_medis' as const, label: 'Hisab Jumal Nama', icon: Calculator },
              { id: 'buruj' as const, label: '12 Buruj & Hijamah', icon: Moon },
              { id: 'logger' as const, label: `Catat Keluhan (${logs.length})`, icon: ClipboardList },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeSubSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubSection(tab.id)}
                  className={`min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#c59a43] text-black shadow-sm'
                      : isNight
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-700 hover:text-black'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Unboxed Clinical Astronomical Telemetry Summary Strip */}
        <div className="pt-3 border-t border-current/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className={`p-3 rounded-xl border ${subSurface}`}>
            <div className="text-[10px] font-mono uppercase opacity-70">
              Mizāj Dominan Saat Ini
            </div>
            <div
              className="font-serif font-bold text-sm mt-0.5 flex items-center gap-1.5"
              style={{ color: FOUR_HUMORS[report.dominantHumor].color }}
            >
              <Droplets className="w-4 h-4 shrink-0" />
              <span>{FOUR_HUMORS[report.dominantHumor].latin}</span>
            </div>
            <div className="text-[11px] opacity-75 mt-0.5 font-mono tabular-nums">
              {FOUR_HUMORS[report.dominantHumor].temperament} ({report.humors[report.dominantHumor]}%)
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${subSurface}`}>
            <div className="text-[10px] font-mono uppercase opacity-70">
              Transit Qamar (Peringatan Organ)
            </div>
            <div className="font-serif font-bold text-sm text-sky-400 mt-0.5 flex items-center gap-1.5">
              <span>{report.moonSignMelothesia.symbol}</span>
              <span>
                {report.moonSignMelothesia.latin} ({report.moonSignMelothesia.arabic})
              </span>
            </div>
            <div className="text-[11px] opacity-80 mt-0.5 truncate">
              Organ peka: <strong>{report.moonSignMelothesia.bodyPartId}</strong>
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${subSurface}`}>
            <div className="text-[10px] font-mono uppercase opacity-70">
              Penguasa Hari &amp; Jam Falak
            </div>
            <div className="font-serif font-bold text-sm text-[#c59a43] mt-0.5">
              {dayRulerAnatomy.symbol} {dayRulerAnatomy.transliteration} / {hourRulerAnatomy.symbol}{' '}
              {hourRulerAnatomy.transliteration}
            </div>
            <div className="text-[11px] opacity-75 mt-0.5 truncate">
              Fokus organ jam ini: {hourRulerAnatomy.organsList[0]}
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${subSurface}`}>
            <div className="text-[10px] font-mono uppercase opacity-70">
              Aspek Tegangan Organ (Tarbi‘/Muqābalah)
            </div>
            <div
              className={`font-serif font-bold text-sm mt-0.5 font-mono tabular-nums ${
                report.strainedAspects.length > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {report.strainedAspects.length} Aspek Aktif
            </div>
            <div className="text-[11px] opacity-75 mt-0.5 truncate">
              {report.strainedAspects.length > 0
                ? report.strainedAspects[0].affectedOrgans
                : 'Langit relatif harmonis bagi organ'}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* TAB 1: ANATOMICAL MELOTHESIA SVG + KAWKAB DIAGNOSTIC INSPECTOR      */}
      {/* =================================================================== */}
      {activeSubSection === 'diagnosis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left (5 cols): Interactive SVG Human Anatomical Melothesia Figure */}
            <div className={`lg:col-span-5 rounded-2xl border p-4 sm:p-5 space-y-4 ${cardBg}`}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif font-bold text-sm sm:text-base text-[#c59a43]">
                    Peta Anatomi Kawkab (Melothesia)
                  </h2>
                  <p className="text-[11px] opacity-75">
                    Ketuk simpul organ pada tubuh untuk memeriksa kawkab &amp; aspeknya
                  </p>
                </div>
                <span className="font-arabic text-base text-[#c59a43]">تشريح الكواكب</span>
              </div>

              <div
                className={`rounded-xl border p-3 flex flex-col items-center ${subSurface}`}
              >
                <svg
                  viewBox="0 0 200 265"
                  className="w-full max-w-[260px] h-auto select-none"
                  aria-label="Diagram Anatomi Melothesia 7 Kawkab"
                >
                  {/* Anatomical Silhouette Schematic */}
                  <g
                    fill={isNight ? '#152036' : '#f1e8d6'}
                    stroke={isNight ? '#364b72' : '#bfa982'}
                    strokeWidth="1.5"
                  >
                    {/* Head */}
                    <circle cx="100" cy="36" r="20" />
                    {/* Neck */}
                    <rect x="92" y="55" width="16" height="14" rx="4" />
                    {/* Torso */}
                    <path d="M 65 72 C 65 68, 135 68, 135 72 L 146 116 L 132 182 L 68 182 L 54 116 Z" />
                    {/* Arms */}
                    <path d="M 64 73 L 38 134 L 48 139 L 66 92" />
                    <path d="M 136 73 L 162 134 L 152 139 L 134 92" />
                    {/* Legs */}
                    <path d="M 72 182 L 66 250 L 84 250 L 94 190 Z" />
                    <path d="M 128 182 L 134 250 L 116 250 L 106 190 Z" />
                  </g>

                  {/* Subtle anatomical organ outlines */}
                  <g
                    fill="none"
                    stroke={isNight ? '#283959' : '#d5c4a1'}
                    strokeDasharray="2 2"
                    strokeWidth="1"
                  >
                    <ellipse cx="100" cy="116" rx="22" ry="16" />
                    <line x1="100" y1="68" x2="100" y2="180" />
                    <ellipse cx="100" cy="150" rx="24" ry="14" />
                  </g>

                  {/* Clickable Kawkab Nodes */}
                  {report.orderedPlanets.map((ev) => {
                    const { x, y } = ev.anatomy.svgAnchor;
                    const isSelected = selectedPlanet === ev.planetKey;
                    const statusStroke =
                      ev.statusTone === 'strained'
                        ? '#f43f5e'
                        : ev.statusTone === 'caution'
                        ? '#f59e0b'
                        : '#10b981';

                    return (
                      <g
                        key={ev.planetKey}
                        onClick={() => handleSelectPlanetFromChart(ev.planetKey)}
                        className="cursor-pointer group"
                      >
                        {isSelected && (
                          <circle
                            cx={x}
                            cy={y}
                            r="15"
                            fill="none"
                            stroke="#c59a43"
                            strokeWidth="1.5"
                            strokeDasharray="3 2"
                          />
                        )}
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? '11' : '9.5'}
                          fill={isNight ? '#0c1322' : '#ffffff'}
                          stroke={statusStroke}
                          strokeWidth={isSelected ? '2.5' : '1.75'}
                        />
                        <text
                          x={x}
                          y={y + 4}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill={ev.anatomy.color}
                        >
                          {ev.anatomy.symbol}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="mt-2 pt-2 border-t border-current/10 w-full flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] font-mono">
                  <span className="text-emerald-400">● Kuat (&ge;68)</span>
                  <span className="text-amber-400">▲ Sensitif (48–67)</span>
                  <span className="text-rose-400">✖ Tertekan (&lt;48)</span>
                </div>
              </div>

              {/* 4 Humors Dynamic Meter */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#c59a43]">
                    Keseimbangan Empat Akhlāṭ (Humors)
                  </span>
                  <span className="text-[10px] font-mono opacity-75">Total 100%</span>
                </div>
                <div className="space-y-2">
                  {(Object.keys(FOUR_HUMORS) as HumorType[]).map((hKey) => {
                    const h = FOUR_HUMORS[hKey];
                    const pct = report.humors[hKey];
                    return (
                      <div key={hKey} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium">
                            {h.indonesian}{' '}
                            <span className="font-arabic opacity-75 ml-1">{h.arabic}</span>
                          </span>
                          <span className="font-mono font-bold tabular-nums">{pct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-current/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%`, backgroundColor: h.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right (7 cols): Selected Kawkab Anatomical Profile & 7-Planet Table */}
            <div className="lg:col-span-7 space-y-5 min-w-0">
              {/* Selected Kawkab Clinical Card */}
              <div className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-current/10 pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl border flex items-center justify-center text-xl font-bold shrink-0"
                      style={{
                        borderColor: `${selectedEval.anatomy.color}55`,
                        backgroundColor: `${selectedEval.anatomy.color}18`,
                        color: selectedEval.anatomy.color,
                      }}
                    >
                      {selectedEval.anatomy.symbol}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif font-bold text-base sm:text-lg text-[#c59a43]">
                          {selectedEval.anatomy.transliteration}
                        </h3>
                        <span className="font-arabic text-lg text-[#c59a43]">
                          {selectedEval.anatomy.arabicName}
                        </span>
                      </div>
                      <p className="text-xs opacity-75 font-mono tabular-nums truncate">
                        Burj {selectedSign?.latinName} ({selectedEval.position.coordinate.signDegree}°{' '}
                        {selectedEval.position.coordinate.signDegreeMinutes}’) · Mizāj:{' '}
                        {selectedEval.anatomy.temperamentIndo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase opacity-70">Skor Vitalitas</div>
                      <div className="text-xl font-mono font-bold tabular-nums">
                        {selectedEval.vitalityScore}
                        <span className="text-xs opacity-60 font-normal"> / 100</span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                        selectedEval.statusTone === 'good'
                          ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                          : selectedEval.statusTone === 'caution'
                          ? 'bg-amber-500/15 border-amber-500/35 text-amber-400'
                          : 'bg-rose-500/15 border-rose-500/35 text-rose-400'
                      }`}
                    >
                      {selectedEval.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Organs Governed */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-serif font-bold text-[#c59a43]">
                      Organ &amp; Fungsi Tubuh yang Dikuasai:
                    </span>
                    <span className="font-arabic text-sm opacity-85">
                      {selectedEval.anatomy.organsArabic}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {selectedEval.anatomy.organsList.map((org) => (
                      <button
                        key={org}
                        type="button"
                        onClick={() => {
                          setLogPlanetKey(selectedPlanet);
                          setOrganTarget(org);
                          setActiveSubSection('logger');
                        }}
                        className={`min-h-[36px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${subSurface} hover:border-[#c59a43]`}
                        title="Klik untuk mencatat keluhan pada organ ini"
                      >
                        {org}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Factors & Aspects affecting this planet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border space-y-1.5 ${subSurface}`}>
                    <div className="font-serif font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Faktor Tekanan / Nahs Saat Ini</span>
                    </div>
                    {selectedEval.afflictionFactors.length > 0 ? (
                      <ul className="space-y-1 opacity-90 list-disc pl-4">
                        {selectedEval.afflictionFactors.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="opacity-70 italic">
                        Tidak ada aspek tegang, Rujū‘, atau Iḥtirāq yang menekan kawkab ini.
                      </p>
                    )}
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1.5 ${subSurface}`}>
                    <div className="font-serif font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Dukungan &amp; Kemuliaan Falak</span>
                    </div>
                    {selectedEval.harmoniousFactors.length > 0 ? (
                      <ul className="space-y-1 opacity-90 list-disc pl-4">
                        {selectedEval.harmoniousFactors.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="opacity-70 italic">
                        Kawkab berada dalam keadaan netral tanpa dukungan Tathlīth/Tasdis dominan.
                      </p>
                    )}
                  </div>
                </div>

                {/* Classical Symptoms & Balancing */}
                <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${subSurface}`}>
                  <div>
                    <span className="font-serif font-bold text-[#c59a43] block mb-1">
                      Gejala Klasik Bila Kawkab Tertekan &amp; Tadbīr Penyeimbang:
                    </span>
                    <ul className="space-y-0.5 opacity-85 list-disc pl-4">
                      {selectedEval.anatomy.symptomsOnAffliction.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-current/10">
                    <span className="font-semibold text-emerald-400">Anjuran Penyeimbangan: </span>
                    <span className="opacity-90">{selectedEval.anatomy.balancingGuidance}</span>
                  </div>
                  <div className="text-[11px] opacity-65 font-mono">
                    Rujukan: {selectedEval.anatomy.manuscriptReference}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLogPlanetKey(selectedPlanet);
                      setOrganTarget(selectedEval.anatomy.organsList[0]);
                      setActiveSubSection('logger');
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#c59a43] hover:bg-[#d4a84e] text-black font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Catat Keluhan Terkait {selectedEval.anatomy.transliteration}</span>
                  </button>

                  {onAnnotate && (
                    <button
                      type="button"
                      onClick={() =>
                        onAnnotate(
                          `Iatroastrology ${selectedEval.anatomy.transliteration}`,
                          `Skor Vitalitas: ${selectedEval.vitalityScore}/100 (${selectedEval.statusLabel}). Organ: ${selectedEval.anatomy.primaryOrgansId}. Faktor: ${
                            selectedEval.afflictionFactors.join('; ') || 'Seimbang'
                          }`
                        )
                      }
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:border-[#c59a43] ${subSurface}`}
                    >
                      <BookmarkPlus className="w-4 h-4 text-[#c59a43]" />
                      <span>Simpan ke Anotasi</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 7-Planet Anatomical Matrix List */}
              <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardBg}`}>
                <h3 className="font-serif font-bold text-sm text-[#c59a43]">
                  Ringkasan Kondisi 7 Kawkab terhadap Kesehatan Organ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {report.orderedPlanets.map((ev) => {
                    const isSelected = ev.planetKey === selectedPlanet;
                    const pSign = ZODIAC_SIGNS[ev.position.coordinate.signIndex];
                    return (
                      <button
                        key={ev.planetKey}
                        type="button"
                        onClick={() => handleSelectPlanetFromChart(ev.planetKey)}
                        className={`min-h-[68px] p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-[#c59a43] bg-[#c59a43]/15'
                            : `${subSurface} hover:border-[#c59a43]/50`
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-9 h-9 rounded-lg border border-current/15 flex items-center justify-center text-base font-bold shrink-0"
                            style={{ color: ev.anatomy.color }}
                          >
                            {ev.anatomy.symbol}
                          </span>
                          <div className="min-w-0">
                            <div className="font-serif font-bold text-xs flex items-center gap-1.5">
                              <span>{ev.anatomy.transliteration}</span>
                              <span className="font-arabic opacity-80">{ev.anatomy.arabicName}</span>
                            </div>
                            <div className="text-[11px] opacity-80 truncate">
                              {ev.anatomy.organsList[0]} · {pSign?.latinName}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-sm tabular-nums">
                            {ev.vitalityScore}
                          </div>
                          <div
                            className={`text-[10px] font-semibold ${
                              ev.statusTone === 'good'
                                ? 'text-emerald-400'
                                : ev.statusTone === 'caution'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {ev.statusTone === 'good'
                              ? 'Seimbang'
                              : ev.statusTone === 'caution'
                              ? 'Sensitif'
                              : 'Tertekan'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Active Strained Planetary Aspects Affecting Organs */}
          <section className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardBg}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#c59a43]" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#c59a43]">
                  Korelasi Aspek Planet Aktif terhadap Ketegangan Organ
                </h3>
              </div>
              <span className="text-xs font-mono opacity-75 tabular-nums">
                {report.strainedAspects.length} Aspek Tegangan
              </span>
            </div>

            {report.strainedAspects.length === 0 ? (
              <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${subSurface}`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Saat ini tidak terdeteksi aspek tegang (<em>Tarbī‘</em> 90°, <em>Muqābalah</em> 180°, atau konjungsi berat <em>Zuḥal/Mirrīkh</em>) pada peta langit.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.strainedAspects.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border space-y-2 text-xs ${subSurface}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif font-bold text-amber-400">
                        {KAWKAB_ANATOMY[item.aspect.planetA].symbol}{' '}
                        {KAWKAB_ANATOMY[item.aspect.planetA].transliteration}{' '}
                        {item.aspect.aspectName} ({item.aspect.exactAngle}°){' '}
                        {KAWKAB_ANATOMY[item.aspect.planetB].symbol}{' '}
                        {KAWKAB_ANATOMY[item.aspect.planetB].transliteration}
                      </span>
                      <span className="font-mono tabular-nums text-[11px] opacity-80">
                        Orb {item.aspect.orbDifference.toFixed(1)}°
                      </span>
                    </div>
                    <div className="font-semibold text-rose-400">{item.affectedOrgans}</div>
                    <p className="opacity-85 leading-relaxed">{item.clinicalNote}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setLogPlanetKey(item.aspect.planetA);
                        setOrganTarget(KAWKAB_ANATOMY[item.aspect.planetA].organsList[0]);
                        setSymptomTitle(
                          `Ketegangan ${KAWKAB_ANATOMY[item.aspect.planetA].organsList[0]} (${item.aspect.aspectName})`
                        );
                        setActiveSubSection('logger');
                      }}
                      className="min-h-[38px] px-3 py-1.5 rounded-lg border border-[#c59a43]/40 text-[#c59a43] hover:bg-[#c59a43]/15 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Catat Keluhan Terkait Aspek Ini</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: KALKULATOR HISAB JUMAL KELUHAN PENYAKIT BERDASARKAN NAMA     */}
      {/* =================================================================== */}
      {activeSubSection === 'jumal_medis' && (
        <IatroastrologyJumalCalculator
          report={report}
          currentDateInfo={currentDateInfo}
          theme={theme}
          onLogFromJumal={({ symptomTitle: title, planetKey, organTarget: organ, notes: noteText }) => {
            setSymptomTitle(title);
            setLogPlanetKey(planetKey);
            setSelectedPlanet(planetKey);
            setOrganTarget(organ);
            setNotes(noteText);
            setActiveSubSection('logger');
            triggerToast('Hasil Hisab Jumal diisi ke formulir Catat Keluhan.');
          }}
          onInspectPlanet={(planetKey) => {
            handleSelectPlanetFromChart(planetKey);
            setActiveSubSection('diagnosis');
          }}
          onAnnotate={onAnnotate}
        />
      )}

      {/* =================================================================== */}
      {/* TAB 3: 12 BURUJ MELOTHESIA & AL-FASD WA AL-HIJAMAH PRECAUTIONS      */}
      {/* =================================================================== */}
      {activeSubSection === 'buruj' && (
        <section className={`rounded-2xl border p-4 sm:p-6 space-y-5 ${cardBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-current/10 pb-3">
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#c59a43]">
                Pembagian Anggota Tubuh pada 12 Burūj &amp; Kaidah Hijāmah / Bedah
              </h2>
              <p className="text-xs opacity-80">
                Dalam <em>al-Qānūn fī aṭ-Ṭibb</em> &amp; <em>Zij as-Sindhind</em>, posisi Bulan (<em>al-Qamar</em>) menandai organ yang lebih peka terhadap sayatan atau bekam berat.
              </p>
            </div>
            <div className={`px-3 py-2 rounded-xl border text-xs shrink-0 ${subSurface}`}>
              <span className="opacity-70">Bulan saat ini di: </span>
              <strong className="text-sky-400">
                {report.moonSignMelothesia.symbol} {report.moonSignMelothesia.latin}
              </strong>
            </div>
          </div>

          {/* Active Moon Precaution Banner */}
          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-3 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-serif font-bold text-sm text-amber-400">
                Peringatan Transit Bulan Saat Ini: {report.moonSignMelothesia.latin} (
                <span className="font-arabic">{report.moonSignMelothesia.arabic}</span>)
              </div>
              <p className="opacity-90 leading-relaxed">
                Organ terpengaruh: <strong>{report.moonSignMelothesia.bodyPartId}</strong>.{' '}
                {report.moonSignMelothesia.hijamahPrecaution}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ZODIAC_MELOTHESIA.map((z) => {
              const isMoonHere = z.signIndex === report.moonSignMelothesia.signIndex;
              return (
                <div
                  key={z.signIndex}
                  className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${
                    isMoonHere
                      ? 'border-sky-400 bg-sky-500/10'
                      : subSurface
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif font-bold text-sm text-[#c59a43]">
                      {z.symbol} {z.latin}{' '}
                      <span className="font-arabic font-normal opacity-85 ml-1">{z.arabic}</span>
                    </span>
                    {isMoonHere && (
                      <span className="text-[10px] font-mono font-bold text-sky-400">
                        ☽ Bulan Aktif
                      </span>
                    )}
                  </div>
                  <div className="font-semibold">
                    {z.bodyPartId}{' '}
                    <span className="font-arabic opacity-75 text-[13px] ml-1">
                      ({z.bodyPartArabic})
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 leading-relaxed">{z.hijamahPrecaution}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* TAB 3: PHYSICAL SYMPTOM LOGGER & PLANETARY ASPECT SNAPSHOT          */}
      {/* =================================================================== */}
      {activeSubSection === 'logger' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Form Column (5 cols) */}
          <form
            onSubmit={handleSaveLog}
            className={`lg:col-span-5 rounded-2xl border p-4 sm:p-5 space-y-4 ${cardBg}`}
          >
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-base text-[#c59a43] flex items-center gap-2">
                <HeartPulse className="w-4 h-4 shrink-0" />
                <span>Catat Keluhan Fisik &amp; Aspek Planet</span>
              </h2>
              <p className="text-xs opacity-75">
                Setiap catatan otomatis merekam aspek planet aktif, posisi Bulan, dan Mizāj saat ini.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold opacity-80 block">
                Pilihan Cepat Keluhan Umum:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SYMPTOM_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`min-h-[36px] px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                      symptomTitle === preset.label
                        ? 'border-[#c59a43] bg-[#c59a43]/20 text-[#c59a43] font-bold'
                        : `${subSurface} hover:border-[#c59a43]/50`
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="iatro-symptom-title" className="text-xs font-semibold block">
                Keluhan Fisik / Gejala yang Dirasakan
              </label>
              <input
                id="iatro-symptom-title"
                type="text"
                value={symptomTitle}
                onChange={(e) => setSymptomTitle(e.target.value)}
                placeholder="Mis. Kepala pusing sebelah kanan, leher kaku..."
                className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-sm ${subSurface}`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="iatro-planet-select" className="text-xs font-semibold block">
                  Kawkab Penguasa
                </label>
                <select
                  id="iatro-planet-select"
                  value={logPlanetKey}
                  onChange={(e) => {
                    const nextKey = e.target.value as PlanetKey;
                    setLogPlanetKey(nextKey);
                    setOrganTarget(KAWKAB_ANATOMY[nextKey].organsList[0]);
                  }}
                  className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-sm ${subSurface}`}
                >
                  {(Object.keys(KAWKAB_ANATOMY) as PlanetKey[]).map((k) => (
                    <option key={k} value={k}>
                      {KAWKAB_ANATOMY[k].symbol} {KAWKAB_ANATOMY[k].transliteration} —{' '}
                      {KAWKAB_ANATOMY[k].organsList[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="iatro-organ-input" className="text-xs font-semibold block">
                  Organ / Bagian Tubuh
                </label>
                <input
                  id="iatro-organ-input"
                  type="text"
                  value={organTarget}
                  onChange={(e) => setOrganTarget(e.target.value)}
                  placeholder="Mis. Lambung, Jantung, Sendi"
                  className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-sm ${subSurface}`}
                />
              </div>
            </div>

            {/* Severity Scale 1-5 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold block">Tingkat Intensitas Keluhan (1–5)</label>
              <div className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`min-h-[44px] rounded-xl border font-mono font-bold text-xs transition-all cursor-pointer ${
                      severity === lvl
                        ? 'bg-[#c59a43] text-black border-[#c59a43] shadow-sm'
                        : `${subSurface} opacity-80 hover:opacity-100`
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <div className="text-[11px] opacity-80 font-mono">
                {SEVERITY_LABELS[severity].label}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="iatro-notes" className="text-xs font-semibold block">
                Catatan Tambahan (Makanan, Istirahat, Jam Kejadian)
              </label>
              <textarea
                id="iatro-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mis. Muncul setelah kurang tidur atau saat cuaca dingin..."
                className={`w-full px-3 py-2 rounded-xl border text-sm ${subSurface}`}
              />
            </div>

            {/* Automatic Planetary Aspect Snapshot Preview */}
            <div className={`p-3 rounded-xl border space-y-1.5 text-xs ${subSurface}`}>
              <div className="font-serif font-bold text-[#c59a43]">
                Aspek Planet yang Akan Direkam Otomatis ({previewLogAspects.length}):
              </div>
              {previewLogAspects.length > 0 ? (
                <ul className="space-y-1 font-mono text-[11px] opacity-90">
                  {previewLogAspects.map((asp, i) => (
                    <li key={i} className="flex items-center justify-between gap-2">
                      <span>
                        {asp.planetA} {asp.aspectName} ({asp.exactAngle}°) {asp.planetB}
                      </span>
                      <span className="tabular-nums opacity-75">
                        orb {asp.orbDifference.toFixed(1)}°
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] opacity-70 italic">
                  Tidak ada aspek langsung terhadap {KAWKAB_ANATOMY[logPlanetKey].transliteration} pada jam ini; posisi Bulan &amp; Mizāj tetap dicatat.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-xl bg-[#c59a43] hover:bg-[#d4a84e] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Catatan Keluhan &amp; Aspek</span>
            </button>

            <p className="text-[11px] opacity-70 leading-relaxed pt-1 border-t border-current/10">
              Catatan kajian falak historis (<em>at-Ṭibb an-Nujūmī</em>): modul ini ditujukan untuk dokumentasi reflektif dan studi manuskrip klasik, bukan pengganti diagnosis atau penanganan dokter medis.
            </p>
          </form>

          {/* Saved History Column (7 cols) */}
          <div className={`lg:col-span-7 rounded-2xl border p-4 sm:p-5 space-y-4 ${cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-current/10 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-[#c59a43]">
                  Riwayat Catatan Keluhan &amp; Korelasi Langit ({filteredLogs.length})
                </h3>
                <p className="text-xs opacity-75">
                  Tersimpan lokal di perangkat untuk melacak pola keluhan terhadap aspek planet
                </p>
              </div>

              <select
                value={filterLogPlanet}
                onChange={(e) => setFilterLogPlanet(e.target.value as PlanetKey | 'all')}
                aria-label="Filter riwayat berdasarkan kawkab"
                className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-medium ${subSurface}`}
              >
                <option value="all">Semua Kawkab ({logs.length})</option>
                {(Object.keys(KAWKAB_ANATOMY) as PlanetKey[]).map((k) => (
                  <option key={k} value={k}>
                    {KAWKAB_ANATOMY[k].symbol} {KAWKAB_ANATOMY[k].transliteration}
                  </option>
                ))}
              </select>
            </div>

            {filteredLogs.length === 0 ? (
              <div className={`p-8 rounded-xl border text-center space-y-2 ${subSurface}`}>
                <Stethoscope className="w-8 h-8 text-[#c59a43] mx-auto opacity-75" />
                <div className="font-serif font-bold text-sm">Belum ada catatan keluhan fisik</div>
                <p className="text-xs opacity-75 max-w-md mx-auto">
                  Gunakan formulir di samping untuk mencatat keluhan yang dirasakan beserta rekaman aspek planet pada waktunya.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
                {filteredLogs.map((item) => {
                  const pInfo = KAWKAB_ANATOMY[item.planetKey];
                  const sev = SEVERITY_LABELS[item.severity];
                  return (
                    <article
                      key={item.id}
                      className={`p-4 rounded-xl border space-y-2.5 ${subSurface}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono opacity-75">
                            <span className="tabular-nums">{item.dateLabel}</span>
                            <span aria-hidden="true">·</span>
                            <span>{item.hijriDateLabel}</span>
                            <span aria-hidden="true">·</span>
                            <span>Bulan di {item.moonSignLabel}</span>
                          </div>
                          <h4 className="font-serif font-bold text-sm sm:text-base">
                            {item.symptomTitle}
                          </h4>
                          <div className="text-xs opacity-85">
                            <span style={{ color: pInfo.color }} className="font-bold">
                              {pInfo.symbol} {pInfo.transliteration}
                            </span>
                            <span aria-hidden="true"> · </span>
                            <span>Organ: {item.organTarget}</span>
                            <span aria-hidden="true"> · </span>
                            <span className="opacity-75">Mizāj: {item.dominantHumorLabel}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold shrink-0 self-start ${sev.colorClass}`}
                        >
                          {sev.label}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-xs opacity-85 leading-relaxed border-t border-current/10 pt-2">
                          {item.notes}
                        </p>
                      )}

                      {item.capturedAspects.length > 0 && (
                        <div className="pt-2 border-t border-current/10 space-y-1">
                          <div className="text-[11px] font-semibold text-[#c59a43]">
                            Aspek Planet yang Terekam:
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-mono">
                            {item.capturedAspects.map((asp, idx) => (
                              <span
                                key={idx}
                                className={
                                  asp.nature === 'Nahs'
                                    ? 'text-rose-400'
                                    : asp.nature === 'Sa\'d'
                                    ? 'text-emerald-400'
                                    : 'text-amber-400'
                                }
                              >
                                {asp.planetA} {asp.aspectName} ({asp.exactAngle}°) {asp.planetB} [
                                {asp.orbDifference.toFixed(1)}°]
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        {onAnnotate && (
                          <button
                            type="button"
                            onClick={() =>
                              onAnnotate(
                                `Keluhan: ${item.symptomTitle}`,
                                `${item.dateLabel} (${item.hijriDateLabel}) · ${pInfo.transliteration} (${item.organTarget}) · Tingkat ${item.severity}/5 · Aspek: ${
                                  item.capturedAspects
                                    .map((a) => `${a.planetA} ${a.aspectName} ${a.planetB}`)
                                    .join(', ') || 'Tanpa aspek utama'
                                }${item.notes ? ` · Catatan: ${item.notes}` : ''}`
                              )
                            }
                            className="min-h-[38px] px-2.5 py-1 rounded-lg border border-current/15 hover:border-[#c59a43] text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <BookmarkPlus className="w-3.5 h-3.5 text-[#c59a43]" />
                            <span>Kirim ke Anotasi</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(item.id)}
                          className="min-h-[38px] px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/15 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                          aria-label={`Hapus catatan ${item.symptomTitle}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
