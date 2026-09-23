import React, { useState, useMemo } from 'react';
import {
  Heart,
  Sparkles,
  Flame,
  Mountain,
  Wind,
  Droplets,
  Calendar,
  User,
  Shield,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  BookmarkPlus,
  HelpCircle,
  AlertTriangle,
  Smile,
} from 'lucide-react';
import {
  calculateCompatibilityReport,
  PartnerInput,
  CompatibilityReport,
} from '../lib/compatibilityEngine';
import { DayKey, PasaranKey, SAPTA_WARA, PANCA_WARA } from '../lib/hisabJumalEngine';

interface PartnerCompatibilitySubViewProps {
  theme: 'night' | 'parchment';
  onAnnotate?: (title: string, content: string) => void;
}

const PRESET_COUPLES: {
  id: string;
  title: string;
  p1: PartnerInput;
  p2: PartnerInput;
}[] = [
  {
    id: 'ali_fatimah',
    title: 'Ali bin Abi Thalib & Fatimah az-Zahra',
    p1: { name: 'Ali bin Abi Thalib', nameArabic: 'عَلِيّ بْن أَبِي طَالِب', day: 'jumat', pasaran: 'legi' },
    p2: { name: 'Fatimah az-Zahra', nameArabic: 'فَاطِمَة الزَّهْرَاء', day: 'ahad', pasaran: 'pon' },
  },
  {
    id: 'qais_laila',
    title: 'Qais (Majnun) & Laila al-Amiriyyah',
    p1: { name: 'Qais bin al-Mulawwah', nameArabic: 'قَيْس بْن المُلَوَّح', day: 'selasa', pasaran: 'kliwon' },
    p2: { name: 'Laila al-Amiriyyah', nameArabic: 'لَيْلَى العَامِرِيَّة', day: 'kamis', pasaran: 'pahing' },
  },
  {
    id: 'rama_shinta',
    title: 'Rama Wijaya & Dewi Shinta',
    p1: { name: 'Raden Rama Wijaya', nameArabic: 'رَامَا وِيجَايَا', day: 'senin', pasaran: 'wage' },
    p2: { name: 'Dewi Shinta', nameArabic: 'دِيوِي شِينْتَا', day: 'rabu', pasaran: 'legi' },
  },
];

export const PartnerCompatibilitySubView: React.FC<PartnerCompatibilitySubViewProps> = ({
  theme,
  onAnnotate,
}) => {
  const isNight = theme === 'night';

  // Partner 1 State (Pria / Calon Pertama)
  const [p1Name, setP1Name] = useState<string>('Muhammad Ali');
  const [p1Arabic, setP1Arabic] = useState<string>('مُحَمَّد عَلِيّ');
  const [p1Mother, setP1Mother] = useState<string>('Aminah');
  const [p1MotherArabic, setP1MotherArabic] = useState<string>('آمِنَة');
  const [p1Day, setP1Day] = useState<DayKey>('jumat');
  const [p1Pasaran, setP1Pasaran] = useState<PasaranKey>('legi');

  // Partner 2 State (Wanita / Calon Kedua)
  const [p2Name, setP2Name] = useState<string>('Siti Fatimah');
  const [p2Arabic, setP2Arabic] = useState<string>('سِتِّي فَاطِمَة');
  const [p2Mother, setP2Mother] = useState<string>('Khadijah');
  const [p2MotherArabic, setP2MotherArabic] = useState<string>('خَدِيجَة');
  const [p2Day, setP2Day] = useState<DayKey>('ahad');
  const [p2Pasaran, setP2Pasaran] = useState<PasaranKey>('pon');

  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Compute Compatibility
  const report: CompatibilityReport = useMemo(() => {
    return calculateCompatibilityReport(
      {
        name: p1Name,
        nameArabic: p1Arabic,
        motherName: p1Mother,
        motherNameArabic: p1MotherArabic,
        day: p1Day,
        pasaran: p1Pasaran,
      },
      {
        name: p2Name,
        nameArabic: p2Arabic,
        motherName: p2Mother,
        motherNameArabic: p2MotherArabic,
        day: p2Day,
        pasaran: p2Pasaran,
      }
    );
  }, [p1Name, p1Arabic, p1Mother, p1MotherArabic, p1Day, p1Pasaran, p2Name, p2Arabic, p2Mother, p2MotherArabic, p2Day, p2Pasaran]);

  // Apply preset
  const handleApplyPreset = (presetId: string) => {
    const found = PRESET_COUPLES.find((c) => c.id === presetId);
    if (!found) return;
    setP1Name(found.p1.name);
    setP1Arabic(found.p1.nameArabic || found.p1.name);
    setP1Day(found.p1.day);
    setP1Pasaran(found.p1.pasaran);

    setP2Name(found.p2.name);
    setP2Arabic(found.p2.nameArabic || found.p2.name);
    setP2Day(found.p2.day);
    setP2Pasaran(found.p2.pasaran);
  };

  // Copy Summary
  const handleCopySummary = () => {
    const text = `=== HASIL HISAB KESERASIAN JODOH PASANGAN ===
Calon 1: ${report.partner1.name} (${report.partner1.arabicName})
- Hisab Jumal: ${report.partner1.totalJumal} | Neptu: ${report.partner1.totalNeptu} (${p1Day} ${p1Pasaran}) | Unsur: ${report.partner1.dominantElement}
Calon 2: ${report.partner2.name} (${report.partner2.arabicName})
- Hisab Jumal: ${report.partner2.totalJumal} | Neptu: ${report.partner2.totalNeptu} (${p2Day} ${p2Pasaran}) | Unsur: ${report.partner2.dominantElement}

SKOR KESERASIAN: ${report.harmonyScore}% (${report.qualityTier})
1. Kaidah Akar Jumal Modulo 9: ${report.rootCategoryLatin} (${report.rootCategoryArabic})
   ${report.rootDescription}
2. Hubungan 4 Unsur: ${report.elementalRelationLabel}
   ${report.elementalDescription}
3. Petung Weton Jawa: Kategori ${report.petungJodohSiklus8.category} (Total Neptu: ${report.combinedNeptu})
   ${report.petungJodohSiklus8.description}
4. Nasihat Sakinah: ${report.reconciliationAdvice}
=============================================`;
    navigator.clipboard.writeText(text);
    setCopiedNotification('Laporan keserasian jodoh berhasil disalin!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Element icon helper
  const renderElementBadge = (el: string) => {
    switch (el) {
      case 'Nar':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <Flame className="w-3 h-3" /> Api (Nāriyyah)
          </span>
        );
      case 'Turab':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Mountain className="w-3 h-3" /> Tanah (Turābiyyah)
          </span>
        );
      case 'Hawa':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <Wind className="w-3 h-3" /> Udara (Hawā’iyyah)
          </span>
        );
      case 'Ma':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <Droplets className="w-3 h-3" /> Air (Mā’iyyah)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm">
          <Check className="w-4 h-4" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Preset Couples */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-serif font-bold text-stone-600 dark:text-stone-400">
          Preset Inspirasi:
        </span>
        {PRESET_COUPLES.map((pr) => (
          <button
            key={pr.id}
            onClick={() => handleApplyPreset(pr.id)}
            className="text-xs px-2.5 py-1 rounded-lg border border-[#dacdb2] dark:border-[#25344f] bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-rose-400 hover:text-rose-600 transition-colors"
          >
            {pr.title}
          </button>
        ))}
      </div>

      {/* INPUT FORM: 2 PARTNERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PARTNER 1 */}
        <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#dacdb2] dark:border-[#25344f] pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <User className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                  Calon Pertama (Pria / Suami)
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Data diri &amp; silsilah calon mempelai pertama
                </p>
              </div>
            </div>
            {renderElementBadge(report.partner1.dominantElement)}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Nama Lengkap (Latin):
              </label>
              <input
                type="text"
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder="cth: Muhammad Ali"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Lafaz Arab / Pegon:
              </label>
              <input
                type="text"
                dir="rtl"
                value={p1Arabic}
                onChange={(e) => setP1Arabic(e.target.value)}
                className="w-full text-sm font-arabic font-bold px-3 py-1.5 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder="مُحَمَّد عَلِيّ"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Nama Ibu (Opsional):
                </label>
                <input
                  type="text"
                  value={p1Mother}
                  onChange={(e) => setP1Mother(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] text-stone-900 dark:text-stone-100"
                  placeholder="Nama Ibu Kandung"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Arab Nama Ibu:
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={p1MotherArabic}
                  onChange={(e) => setP1MotherArabic(e.target.value)}
                  className="w-full text-xs font-arabic px-2.5 py-1.5 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] text-stone-900 dark:text-stone-100"
                  placeholder="آمِنَة"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Hari Lahir (Sapta Wara):
                </label>
                <select
                  value={p1Day}
                  onChange={(e) => setP1Day(e.target.value as DayKey)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] text-stone-900 dark:text-stone-100"
                >
                  {(Object.keys(SAPTA_WARA) as DayKey[]).map((d) => (
                    <option key={d} value={d}>
                      {d.toUpperCase()} ({SAPTA_WARA[d].neptu})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Pasaran (Panca Wara):
                </label>
                <select
                  value={p1Pasaran}
                  onChange={(e) => setP1Pasaran(e.target.value as PasaranKey)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] text-stone-900 dark:text-stone-100"
                >
                  {(Object.keys(PANCA_WARA) as PasaranKey[]).map((p) => (
                    <option key={p} value={p}>
                      {p.toUpperCase()} ({PANCA_WARA[p].neptu})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-stone-200/50 dark:bg-stone-800/50 p-2.5 rounded-xl flex items-center justify-between text-xs font-serif">
              <span>
                Jumal Kabīr:{' '}
                <strong className="font-mono text-blue-600 dark:text-blue-400">
                  {report.partner1.totalJumal}
                </strong>
              </span>
              <span>
                Neptu Weton:{' '}
                <strong className="font-mono text-stone-800 dark:text-stone-200">
                  {report.partner1.totalNeptu}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* PARTNER 2 */}
        <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#dacdb2] dark:border-[#25344f] pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <Heart className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                  Calon Kedua (Wanita / Istri)
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Data diri &amp; silsilah calon mempelai kedua
                </p>
              </div>
            </div>
            {renderElementBadge(report.partner2.dominantElement)}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Nama Lengkap (Latin):
              </label>
              <input
                type="text"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder="cth: Siti Fatimah"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Lafaz Arab / Pegon:
              </label>
              <input
                type="text"
                dir="rtl"
                value={p2Arabic}
                onChange={(e) => setP2Arabic(e.target.value)}
                className="w-full text-sm font-arabic font-bold px-3 py-1.5 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder="سِتِّي فَاطِمَة"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Nama Ibu (Opsional):
                </label>
                <input
                  type="text"
                  value={p2Mother}
                  onChange={(e) => setP2Mother(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] text-stone-900 dark:text-stone-100"
                  placeholder="Nama Ibu Kandung"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Arab Nama Ibu:
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={p2MotherArabic}
                  onChange={(e) => setP2MotherArabic(e.target.value)}
                  className="w-full text-xs font-arabic px-2.5 py-1.5 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] text-stone-900 dark:text-stone-100"
                  placeholder="خَدِيجَة"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Hari Lahir (Sapta Wara):
                </label>
                <select
                  value={p2Day}
                  onChange={(e) => setP2Day(e.target.value as DayKey)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] text-stone-900 dark:text-stone-100"
                >
                  {(Object.keys(SAPTA_WARA) as DayKey[]).map((d) => (
                    <option key={d} value={d}>
                      {d.toUpperCase()} ({SAPTA_WARA[d].neptu})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Pasaran (Panca Wara):
                </label>
                <select
                  value={p2Pasaran}
                  onChange={(e) => setP2Pasaran(e.target.value as PasaranKey)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] text-stone-900 dark:text-stone-100"
                >
                  {(Object.keys(PANCA_WARA) as PasaranKey[]).map((p) => (
                    <option key={p} value={p}>
                      {p.toUpperCase()} ({PANCA_WARA[p].neptu})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-stone-200/50 dark:bg-stone-800/50 p-2.5 rounded-xl flex items-center justify-between text-xs font-serif">
              <span>
                Jumal Kabīr:{' '}
                <strong className="font-mono text-rose-600 dark:text-rose-400">
                  {report.partner2.totalJumal}
                </strong>
              </span>
              <span>
                Neptu Weton:{' '}
                <strong className="font-mono text-stone-800 dark:text-stone-200">
                  {report.partner2.totalNeptu}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE COMPATIBILITY REPORT CARD */}
      <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border-2 border-amber-500/40 dark:border-amber-400/30 rounded-2xl p-6 shadow-lg space-y-6">
        {/* Top Header: Score & Tier */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dacdb2] dark:border-[#25344f] pb-5">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400 font-sans">
              Hasil Telaah Tawāfuq az-Zawjayn
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>{report.qualityTier}</span>
              <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
                Skor {report.harmonyScore}%
              </span>
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-serif">
              Berdasarkan hisab Jumal nama gabungan, interaksi 4 unsur, dan siklus Neptu weton Salokantara.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Visual Gauge Meter */}
            <div className="w-24 h-24 rounded-full border-4 border-amber-500/30 flex flex-col items-center justify-center p-2 text-center bg-white/40 dark:bg-black/20">
              <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-300">
                {report.harmonyScore}%
              </span>
              <span className="text-[9px] uppercase font-bold text-stone-500">Mizan Jodoh</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleCopySummary}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Hasil</span>
              </button>
              {onAnnotate && (
                <button
                  onClick={() =>
                    onAnnotate(
                      `Hisab Jodoh: ${p1Name} & ${p2Name}`,
                      `Skor Keserasian: ${report.harmonyScore}% (${report.qualityTier})\nAkar Modulo 9: ${report.rootCategoryLatin}\nPetung Jawa: ${report.petungJodohSiklus8.category}`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Catat Riset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3 CORE PILLARS OF COMPATIBILITY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1: Modulo 9 Root Harmony */}
          <div className="p-4 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white/60 dark:bg-[#0c1222]/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                1. Kaidah Jumal Modulo 9
              </span>
              <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                Sisa: {report.rootModulo9}
              </span>
            </div>
            <div className="font-arabic text-base font-bold text-amber-700 dark:text-amber-300">
              {report.rootCategoryArabic}
            </div>
            <div className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100">
              {report.rootCategoryLatin}
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              {report.rootDescription}
            </p>
          </div>

          {/* Pillar 2: Elemental Chemistry */}
          <div className="p-4 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white/60 dark:bg-[#0c1222]/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                2. Kimiawi 4 Unsur Alam
              </span>
              <div className="flex items-center gap-1">
                {renderElementBadge(report.partner1.dominantElement)}
                <span className="text-xs text-stone-400">×</span>
                {renderElementBadge(report.partner2.dominantElement)}
              </div>
            </div>
            <div className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100">
              {report.elementalRelationLabel}
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              {report.elementalDescription}
            </p>
          </div>

          {/* Pillar 3: Javanese Petung Weton */}
          <div className="p-4 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white/60 dark:bg-[#0c1222]/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                3. Petung Weton Salokantara
              </span>
              <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                Neptu {report.combinedNeptu}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                Kategori {report.petungJodohSiklus8.category}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {report.petungJodohSiklus8.fortuneTier}
              </span>
            </div>
            <div className="text-[11px] font-serif italic text-amber-700 dark:text-amber-400">
              "{report.petungJodohSiklus8.javaneseMotto}"
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              {report.petungJodohSiklus8.description}
            </p>
          </div>
        </div>

        {/* DETAILED MARITAL DYNAMICS & RECONCILIATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Virtues & Strengths */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Smile className="w-4 h-4" />
              <span>Kekuatan &amp; Potensi Keberkahan</span>
            </h4>
            <ul className="text-xs text-stone-700 dark:text-stone-300 space-y-1.5 list-disc list-inside">
              {report.maritalVirtues.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </div>

          {/* Vulnerabilities & Caution */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Titik Rawan &amp; Ujian Komitmen</span>
            </h4>
            <ul className="text-xs text-stone-700 dark:text-stone-300 space-y-1.5 list-disc list-inside">
              {report.vulnerabilities.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* SPIRITUAL WIRID & ADVICE FOR SAKINAH */}
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Nasihat Kerukunan &amp; Wirid Asmaul Husna Penaut Kasih
              </h4>
            </div>
            <span className="text-[11px] font-serif text-stone-500">
              Syams al-Ma'arif al-Kubra
            </span>
          </div>

          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-serif">
            {report.reconciliationAdvice}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {report.recommendedAsmaulHusna.map((asma, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg border border-[#dacdb2] dark:border-[#25344f] bg-white/70 dark:bg-stone-900/60 text-center space-y-1"
              >
                <div className="font-arabic font-bold text-sm text-stone-900 dark:text-stone-100">
                  {asma.arabic}
                </div>
                <div className="text-[11px] font-serif font-bold text-rose-600 dark:text-rose-400">
                  {asma.transliteration}
                </div>
                <div className="text-[9px] text-stone-500 line-clamp-2">
                  {asma.meaning}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
