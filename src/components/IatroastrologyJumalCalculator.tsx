import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BookmarkPlus,
  Calculator,
  CheckCircle2,
  Droplets,
  Hash,
  HeartPulse,
  Info,
  RotateCcw,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { HistoricalDateInfo, PlanetKey, ThemeMode } from '../types';
import { transliterateLatinToArabic } from '../lib/hisabJumalEngine';
import {
  COMMON_SYMPTOM_PRESETS,
  FOUR_HUMORS,
  IatroastrologyReport,
} from '../lib/iatroastrologyEngine';
import {
  MedicalJumalResult,
  calculateMedicalJumal,
} from '../lib/iatroastrologyJumalEngine';

interface IatroastrologyJumalCalculatorProps {
  report: IatroastrologyReport;
  currentDateInfo: HistoricalDateInfo;
  theme: ThemeMode;
  onLogFromJumal: (payload: {
    symptomTitle: string;
    planetKey: PlanetKey;
    organTarget: string;
    notes: string;
  }) => void;
  onInspectPlanet: (planetKey: PlanetKey) => void;
  onAnnotate?: (title: string, content: string) => void;
}

export const IatroastrologyJumalCalculator: React.FC<IatroastrologyJumalCalculatorProps> = ({
  report,
  currentDateInfo,
  theme,
  onLogFromJumal,
  onInspectPlanet,
  onAnnotate,
}) => {
  const isNight = theme === 'night';

  const [patientNameLatin, setPatientNameLatin] = useState<string>('');
  const [patientNameArabicOverride, setPatientNameArabicOverride] = useState<string>('');
  const [motherNameLatin, setMotherNameLatin] = useState<string>('');
  const [motherNameArabicOverride, setMotherNameArabicOverride] = useState<string>('');
  const [complaintNote, setComplaintNote] = useState<string>('');

  const autoPatientArabic = useMemo(
    () => transliterateLatinToArabic(patientNameLatin),
    [patientNameLatin]
  );

  const autoMotherArabic = useMemo(
    () => transliterateLatinToArabic(motherNameLatin),
    [motherNameLatin]
  );

  const result: MedicalJumalResult | null = useMemo(() => {
    return calculateMedicalJumal(
      {
        patientNameLatin,
        patientNameArabicOverride,
        motherNameLatin,
        motherNameArabicOverride,
        complaintNote,
      },
      report
    );
  }, [
    patientNameLatin,
    patientNameArabicOverride,
    motherNameLatin,
    motherNameArabicOverride,
    complaintNote,
    report,
  ]);

  const cardBg = isNight
    ? 'bg-[#101624] border-[#24324c] text-[#e5dccb]'
    : 'bg-[#faf6ed] border-[#dacdb2] text-[#2c2419]';
  const subSurface = isNight
    ? 'bg-[#0b101b] border-[#1f2b42]'
    : 'bg-white border-[#e2d6bd]';

  const handleReset = () => {
    setPatientNameLatin('');
    setPatientNameArabicOverride('');
    setMotherNameLatin('');
    setMotherNameArabicOverride('');
    setComplaintNote('');
  };

  const handleLoadExample = () => {
    setPatientNameLatin('Ahmad Syarif');
    setPatientNameArabicOverride('');
    setMotherNameLatin('Fatimah');
    setMotherNameArabicOverride('');
    setComplaintNote('Kepala pusing & badan terasa panas');
  };

  const handleSendToLogger = () => {
    if (!result) return;
    const labelBase = result.complaintNote
      ? `${result.complaintNote} (${result.patientNameLatin})`
      : `Keluhan ${result.patientNameLatin} — ${result.rulingAnatomy.organsList[0]}`;
    const summaryNotes = [
      `Hisab Jumal Medis: ${result.patientNameLatin} (${result.patientNameArabic})${
        result.motherNameArabic
          ? ` bin/binti ${result.motherNameLatin} (${result.motherNameArabic})`
          : ''
      }`,
      `Total Jumal Kabir: ${result.totalJumalKabir} (Shaghir: ${result.jumalSaghir})`,
      `Sisa ÷7 = ${result.mod7Remainder} → Kawkab ${result.rulingAnatomy.transliteration} (${result.rulingAnatomy.primaryOrgansId})`,
      `Sisa ÷12 = ${result.mod12Remainder} → Burj ${result.rulingBurj.latin} (${result.rulingBurj.bodyPartId})`,
      `Sisa ÷3 = ${result.prognosisMod3.remainder} (${result.prognosisMod3.latinTitle})`,
      `Sisa ÷4 = ${result.rootMod4.remainder} → ${FOUR_HUMORS[result.rootMod4.humor].latin}`,
    ].join('\n');

    onLogFromJumal({
      symptomTitle: labelBase,
      planetKey: result.rulingPlanetKey,
      organTarget: result.rulingAnatomy.organsList[0],
      notes: summaryNotes,
    });
  };

  const handleSaveAnnotation = () => {
    if (!result || !onAnnotate) return;
    const dateStr = `${currentDateInfo.gregorian.day}/${currentDateInfo.gregorian.month}/${currentDateInfo.gregorian.year} M (${currentDateInfo.hijri.day} ${currentDateInfo.hijri.monthNameLatin} ${currentDateInfo.hijri.year} H)`;
    const content = [
      `Tanggal Analisis: ${dateStr}`,
      `Nama Penderita: ${result.patientNameLatin} (${result.patientNameArabic}) · Jumal: ${result.patientJumal}`,
      result.motherNameArabic
        ? `Nama Ibu Kandung: ${result.motherNameLatin} (${result.motherNameArabic}) · Jumal: ${result.motherJumal}`
        : 'Nama Ibu Kandung: (tidak disertakan)',
      `Total Jumal Kabir: ${result.totalJumalKabir} | Jumal Shaghir: ${result.jumalSaghir}`,
      `Kawkab Penguasa (÷7 = ${result.mod7Remainder}): ${result.rulingAnatomy.transliteration} — ${result.rulingAnatomy.primaryOrgansId}`,
      `Burj Anatomi (÷12 = ${result.mod12Remainder}): ${result.rulingBurj.latin} — ${result.rulingBurj.bodyPartId}`,
      `Klasifikasi Keluhan (÷3 = ${result.prognosisMod3.remainder}): ${result.prognosisMod3.latinTitle}`,
      `Akar Unsur (÷4 = ${result.rootMod4.remainder}): ${FOUR_HUMORS[result.rootMod4.humor].latin} — ${result.rootMod4.counterBalancingId}`,
      `Korelasi Langit: ${result.celestialAlignmentNote}`,
    ].join('\n');

    onAnnotate(`Hisab Jumal Medis: ${result.patientNameLatin}`, content);
  };

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* FORM INPUT HISAB JUMAL NAMA PENDERITA                             */}
      {/* ================================================================= */}
      <section className={`rounded-2xl border p-4 sm:p-6 space-y-5 ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-current/10 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#c59a43] font-semibold">
              <span className="font-arabic text-base">حِسَابُ الجُمَّلِ لِلمَرِيضِ وَطَبِيعَةِ العِلَّةِ</span>
              <span aria-hidden="true">·</span>
              <span>Hisab al-Marīḍ (Abū Ma‘syar &amp; at-Ṭibb an-Nujūmī)</span>
            </div>
            <h2 className="font-serif font-bold text-lg sm:text-xl">
              Kalkulator Hisab Jumal Keluhan Penyakit Berdasarkan Nama
            </h2>
            <p className="text-xs sm:text-sm opacity-80 leading-relaxed max-w-3xl">
              Masukkan nama penderita (dan opsional nama ibu kandung sesuai kaidah kitab klasik) untuk menghitung nilai Abjad Kabīr, kawkab penguasa organ (÷7), buruj anatomi (÷12), klasifikasi keluhan (÷3), serta akar unsur <em>akhlāṭ</em> (÷4) yang disinkronkan dengan peta langit saat ini.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadExample}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer whitespace-nowrap ${subSurface} hover:border-[#c59a43]`}
            >
              Isi Contoh
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${subSurface} hover:border-rose-400`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Inputs Grid: Patient Name + Mother Name (with automatic Arab-Melayu transliteration) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Patient Name Card */}
          <div className={`p-4 rounded-xl border space-y-3 ${subSurface}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-serif font-bold text-[#c59a43] flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                <span>1. Nama Lengkap Penderita (Wajib)</span>
              </span>
              {result && (
                <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                  Jumal: {result.patientJumal}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="jumal-patient-latin" className="text-[11px] font-semibold opacity-80 block">
                Nama Lengkap (Latin / Arab):
              </label>
              <input
                id="jumal-patient-latin"
                type="text"
                value={patientNameLatin}
                onChange={(e) => setPatientNameLatin(e.target.value)}
                placeholder="Contoh: Muhammad Husni / Siti Aminah"
                className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-sm ${cardBg}`}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="jumal-patient-arabic" className="text-[11px] font-semibold opacity-80">
                  Lafaz Arab / Arab-Melayu (Otomatis, dapat disunting):
                </label>
                {patientNameArabicOverride && (
                  <button
                    type="button"
                    onClick={() => setPatientNameArabicOverride('')}
                    className="text-[10px] text-[#c59a43] hover:underline cursor-pointer"
                  >
                    Gunakan Otomatis
                  </button>
                )}
              </div>
              <input
                id="jumal-patient-arabic"
                type="text"
                dir="rtl"
                value={patientNameArabicOverride || autoPatientArabic}
                onChange={(e) => setPatientNameArabicOverride(e.target.value)}
                placeholder="الاسم بالعربية"
                className={`w-full min-h-[44px] px-3 py-2 rounded-xl border font-arabic text-lg text-[#c59a43] ${cardBg}`}
              />
            </div>
          </div>

          {/* Mother Name Card (Optional Classical Bin/Binti) */}
          <div className={`p-4 rounded-xl border space-y-3 ${subSurface}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-serif font-bold text-sky-400 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                <span>2. Nama Ibu Kandung (Opsional — Kaidah Klasik)</span>
              </span>
              {result && result.motherJumal > 0 && (
                <span className="text-xs font-mono font-bold text-sky-400 tabular-nums">
                  Jumal Ibu: +{result.motherJumal}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="jumal-mother-latin" className="text-[11px] font-semibold opacity-80 block">
                Nama Ibu (Latin / Arab — kosongkan jika hitung nama sendiri):
              </label>
              <input
                id="jumal-mother-latin"
                type="text"
                value={motherNameLatin}
                onChange={(e) => setMotherNameLatin(e.target.value)}
                placeholder="Contoh: Fatimah / Khadijah (opsional)"
                className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-sm ${cardBg}`}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="jumal-mother-arabic" className="text-[11px] font-semibold opacity-80">
                  Lafaz Arab Ibu (Otomatis, dapat disunting):
                </label>
                {motherNameArabicOverride && (
                  <button
                    type="button"
                    onClick={() => setMotherNameArabicOverride('')}
                    className="text-[10px] text-sky-400 hover:underline cursor-pointer"
                  >
                    Gunakan Otomatis
                  </button>
                )}
              </div>
              <input
                id="jumal-mother-arabic"
                type="text"
                dir="rtl"
                value={motherNameArabicOverride || autoMotherArabic}
                onChange={(e) => setMotherNameArabicOverride(e.target.value)}
                placeholder="اسم الأم (اختياري)"
                className={`w-full min-h-[44px] px-3 py-2 rounded-xl border font-arabic text-lg text-sky-400 ${cardBg}`}
              />
            </div>
          </div>
        </div>

        {/* Optional Current Complaint Input + Quick Presets */}
        <div className="space-y-2">
          <label htmlFor="jumal-complaint-note" className="text-xs font-semibold block">
            Keluhan Fisik yang Sedang Dirasakan (Opsional — untuk dikaitkan dengan hasil hisab):
          </label>
          <input
            id="jumal-complaint-note"
            type="text"
            value={complaintNote}
            onChange={(e) => setComplaintNote(e.target.value)}
            placeholder="Mis. Demam naik turun, pusing, lambung perih, atau pegal sendi..."
            className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-sm ${subSurface}`}
          />
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {COMMON_SYMPTOM_PRESETS.slice(0, 6).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setComplaintNote(preset.label)}
                className={`min-h-[34px] px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                  complaintNote === preset.label
                    ? 'border-[#c59a43] bg-[#c59a43]/20 text-[#c59a43] font-bold'
                    : `${subSurface} hover:border-[#c59a43]/50`
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* EMPTY STATE OR LIVE DIAGNOSTIC RESULTS                            */}
      {/* ================================================================= */}
      {!result ? (
        <section className={`rounded-2xl border p-8 text-center space-y-2 ${cardBg}`}>
          <Calculator className="w-9 h-9 text-[#c59a43] mx-auto opacity-80" />
          <h3 className="font-serif font-bold text-base">
            Ketik Nama Penderita untuk Memulai Hisab Jumal Medis
          </h3>
          <p className="text-xs opacity-75 max-w-lg mx-auto leading-relaxed">
            Sistem akan otomatis mengonversi nama Latin ke ejaan Arab-Melayu, menjumlahkan bobot Abjad Kabīr tiap huruf, lalu memetakan Kawkab organ (÷7), Burj anatomi (÷12), intensitas keluhan (÷3), dan akar unsur <em>akhlāṭ</em> (÷4).
          </p>
        </section>
      ) : (
        <div className="space-y-6">
          {/* 4 Key Computed Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className={`p-4 rounded-2xl border space-y-1 ${cardBg}`}>
              <div className="text-[10px] font-mono uppercase opacity-70">
                Total Hisab Jumal Kabīr
              </div>
              <div className="text-2xl font-mono font-bold text-[#c59a43] tabular-nums">
                {result.totalJumalKabir}
              </div>
              <div className="text-[11px] opacity-80 font-mono tabular-nums">
                Shaghīr (÷9): <strong>{result.jumalSaghir}</strong> ·{' '}
                {result.patientLetters.length + result.motherLetters.length} huruf
              </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1 ${cardBg}`}>
              <div className="text-[10px] font-mono uppercase opacity-70">
                Kawkab Organ (Sisa ÷7 = {result.mod7Remainder})
              </div>
              <div
                className="text-lg font-serif font-bold flex items-center gap-1.5"
                style={{ color: result.rulingAnatomy.color }}
              >
                <span>{result.rulingAnatomy.symbol}</span>
                <span>{result.rulingAnatomy.transliteration}</span>
                <span className="font-arabic font-normal text-base">
                  {result.rulingAnatomy.arabicName}
                </span>
              </div>
              <div className="text-[11px] opacity-80 truncate">
                Vitalitas langit: <strong>{report.evaluations[result.rulingPlanetKey].vitalityScore}/100</strong> ({report.evaluations[result.rulingPlanetKey].statusLabel})
              </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1 ${cardBg}`}>
              <div className="text-[10px] font-mono uppercase opacity-70">
                Burj Anatomi (Sisa ÷12 = {result.mod12Remainder})
              </div>
              <div className="text-lg font-serif font-bold text-sky-400 flex items-center gap-1.5">
                <span>{result.rulingBurj.symbol}</span>
                <span>{result.rulingBurj.latin}</span>
                <span className="font-arabic font-normal text-base">
                  {result.rulingBurj.arabic}
                </span>
              </div>
              <div className="text-[11px] opacity-80 truncate">
                Titik peka: <strong>{result.rulingBurj.bodyPartId}</strong>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1 ${cardBg}`}>
              <div className="text-[10px] font-mono uppercase opacity-70">
                Akar Unsur (Sisa ÷4 = {result.rootMod4.remainder})
              </div>
              <div
                className="text-lg font-serif font-bold flex items-center gap-1.5"
                style={{ color: FOUR_HUMORS[result.rootMod4.humor].color }}
              >
                <Droplets className="w-4 h-4 shrink-0" />
                <span>{FOUR_HUMORS[result.rootMod4.humor].latin}</span>
              </div>
              <div className="text-[11px] opacity-80 truncate">
                {FOUR_HUMORS[result.rootMod4.humor].temperament}
              </div>
            </div>
          </div>

          {/* Celestial Alignment Alert */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
              result.isCelestialExcessWarning
                ? 'border-amber-500/45 bg-amber-500/10'
                : 'border-emerald-500/40 bg-emerald-500/10'
            }`}
          >
            {result.isCelestialExcessWarning ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-serif font-bold text-sm">
                Korelasi Hisab Nama dengan Peta Langit Zij as-Sindhind Saat Ini
              </div>
              <p className="opacity-90 leading-relaxed">{result.celestialAlignmentNote}</p>
            </div>
          </div>

          {/* Main 2-Column Analysis Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (7 cols): Letter Breakdown + Mod 3 & Mod 4 Classical Interpretation */}
            <div className="lg:col-span-7 space-y-5">
              {/* Letter-by-Letter Abjad Breakdown */}
              <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardBg}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif font-bold text-sm text-[#c59a43]">
                    Uraian Huruf Abjad &amp; Unsur Nama
                  </h3>
                  <span className="font-arabic text-lg text-[#c59a43]" dir="rtl">
                    {result.patientNameArabic}
                    {result.motherNameArabic ? ` ✦ ${result.motherNameArabic}` : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-semibold opacity-75 mb-1.5">
                      Huruf Nama Penderita ({result.patientJumal}):
                    </div>
                    <div className="flex flex-wrap gap-1.5" dir="rtl">
                      {result.patientLetters.map((l, idx) => (
                        <div
                          key={`p-${idx}`}
                          className={`px-2.5 py-1.5 rounded-xl border text-center min-w-[50px] ${subSurface}`}
                          title={`${l.name} · ${l.element} (${l.nature})`}
                        >
                          <div className="font-arabic text-lg leading-none text-[#c59a43]">
                            {l.char}
                          </div>
                          <div className="font-mono text-[11px] font-bold tabular-nums mt-1">
                            {l.value}
                          </div>
                          <div className="text-[9px] opacity-65">{l.element}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.motherLetters.length > 0 && (
                    <div className="pt-2 border-t border-current/10">
                      <div className="text-[11px] font-semibold opacity-75 mb-1.5">
                        Huruf Nama Ibu Kandung ({result.motherJumal}):
                      </div>
                      <div className="flex flex-wrap gap-1.5" dir="rtl">
                        {result.motherLetters.map((l, idx) => (
                          <div
                            key={`m-${idx}`}
                            className={`px-2.5 py-1.5 rounded-xl border text-center min-w-[50px] ${subSurface}`}
                            title={`${l.name} · ${l.element} (${l.nature})`}
                          >
                            <div className="font-arabic text-lg leading-none text-sky-400">
                              {l.char}
                            </div>
                            <div className="font-mono text-[11px] font-bold tabular-nums mt-1">
                              {l.value}
                            </div>
                            <div className="text-[9px] opacity-65">{l.element}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mod 3 Prognosis & Mod 4 Root Cause */}
              <div className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardBg}`}>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-serif font-bold text-sm text-[#c59a43] flex items-center gap-1.5">
                      <Activity className="w-4 h-4 shrink-0" />
                      <span>Klasifikasi Perjalanan Keluhan (Sisa Bagi 3)</span>
                    </h3>
                    <span className="font-arabic text-base opacity-85">
                      {result.prognosisMod3.arabicTitle}
                    </span>
                  </div>
                  <div className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${subSurface}`}>
                    <div
                      className={`font-bold ${
                        result.prognosisMod3.severityTone === 'good'
                          ? 'text-emerald-400'
                          : result.prognosisMod3.severityTone === 'caution'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {result.prognosisMod3.latinTitle}
                    </div>
                    <p className="opacity-85 leading-relaxed">{result.prognosisMod3.summaryId}</p>
                    <p className="opacity-90 leading-relaxed">
                      <strong className="text-emerald-400">Langkah Tadbīr: </strong>
                      {result.prognosisMod3.guidanceId}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-current/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-serif font-bold text-sm text-[#c59a43] flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 shrink-0" />
                      <span>Akar Unsur Gangguan &amp; Penyeimbangan (Sisa Bagi 4)</span>
                    </h3>
                    <span className="font-arabic text-base opacity-85">
                      {result.rootMod4.arabicTitle}
                    </span>
                  </div>
                  <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${subSurface}`}>
                    <p className="opacity-90 leading-relaxed">{result.rootMod4.causeProfileId}</p>
                    <p className="opacity-90 leading-relaxed pt-1.5 border-t border-current/10">
                      <strong className="text-emerald-400">Penyeimbang Lawan Unsur: </strong>
                      {result.rootMod4.counterBalancingId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): 4 Humors Meter + Organ Vulnerabilities + Healing Ikhtiar */}
            <div className="lg:col-span-5 space-y-5">
              {/* 4 Humors Composition of the Name */}
              <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardBg}`}>
                <h3 className="font-serif font-bold text-sm text-[#c59a43]">
                  Komposisi Empat Akhlāṭ dari Huruf Nama
                </h3>
                <div className="space-y-2.5">
                  {result.humorBreakdown.map((item) => {
                    const meta = FOUR_HUMORS[item.humor];
                    return (
                      <div key={item.humor} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">
                            {meta.indonesian} ({item.element}){' '}
                            <span className="font-arabic opacity-75 ml-1">{meta.arabic}</span>
                          </span>
                          <span className="font-mono font-bold tabular-nums">
                            {item.percentage}% ({item.count} huruf)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-current/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${item.percentage}%`, backgroundColor: meta.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Organs & Hijamah Precaution */}
              <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 text-xs ${cardBg}`}>
                <h3 className="font-serif font-bold text-sm text-[#c59a43] flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 shrink-0" />
                  <span>Organ Rentan &amp; Kaidah Hijāmah</span>
                </h3>
                <div className={`p-3 rounded-xl border space-y-1.5 ${subSurface}`}>
                  <div className="font-semibold">
                    Organ Kawkab {result.rulingAnatomy.transliteration}:
                  </div>
                  <div className="opacity-85">{result.rulingAnatomy.primaryOrgansId}</div>
                  <ul className="list-disc pl-4 space-y-0.5 opacity-80 pt-1">
                    {result.suggestedSymptoms.map((sym, i) => (
                      <li key={i}>{sym}</li>
                    ))}
                  </ul>
                </div>

                <div className={`p-3 rounded-xl border space-y-1 ${subSurface}`}>
                  <div className="font-semibold text-sky-400">
                    Kaidah Burj {result.rulingBurj.latin} ({result.rulingBurj.bodyPartId}):
                  </div>
                  <p className="opacity-85 leading-relaxed">
                    {result.rulingBurj.hijamahPrecaution}
                  </p>
                </div>
              </div>

              {/* Auspicious Therapy Day & Asma Syifa */}
              <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 text-xs ${cardBg}`}>
                <h3 className="font-serif font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Waktu Ikhtiar &amp; Doa Penenang (Syifā’)</span>
                </h3>
                <div className={`p-3 rounded-xl border space-y-2 ${subSurface}`}>
                  <div>
                    <span className="opacity-70 block text-[11px]">Hari &amp; Waktu Utama Ikhtiar:</span>
                    <span className="font-semibold">{result.auspiciousTherapyDay}</span>
                  </div>
                  <div className="pt-2 border-t border-current/10 space-y-1">
                    <div className="font-arabic text-lg text-[#c59a43]" dir="rtl">
                      {result.recommendedAsma.arabic}
                    </div>
                    <div className="font-serif font-bold">{result.recommendedAsma.latin}</div>
                    <p className="opacity-80 leading-relaxed">{result.recommendedAsma.meaning}</p>
                    <div className="text-[11px] font-mono opacity-75 tabular-nums">
                      Anjuran wirid penenang: {result.recommendedAsma.recommendedCount}× usai shalat
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSendToLogger}
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#c59a43] hover:bg-[#d4a84e] text-black font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <HeartPulse className="w-4 h-4" />
                    <span>Catat ke Log Keluhan Iatroastrology</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onInspectPlanet(result.rulingPlanetKey)}
                      className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${subSurface} hover:border-[#c59a43]`}
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-[#c59a43]" />
                      <span>Peta Kawkab</span>
                    </button>
                    {onAnnotate && (
                      <button
                        type="button"
                        onClick={handleSaveAnnotation}
                        className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${subSurface} hover:border-emerald-500`}
                      >
                        <BookmarkPlus className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Simpan Anotasi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Classical Research / Medical Disclaimer */}
          <div className={`p-3.5 rounded-xl border text-[11px] opacity-80 flex items-start gap-2 leading-relaxed ${subSurface}`}>
            <Info className="w-4 h-4 shrink-0 text-[#c59a43] mt-0.5" />
            <span>{result.disclaimerId}</span>
          </div>
        </div>
      )}
    </div>
  );
};
