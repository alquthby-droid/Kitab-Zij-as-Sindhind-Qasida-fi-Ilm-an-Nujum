import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Swords,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  Mountain,
  Wind,
  Droplets,
  Calendar,
  Shield,
  Copy,
  Check,
  RotateCcw,
  BookmarkPlus,
  HelpCircle,
  Clock,
  Award,
} from 'lucide-react';
import {
  calculateCompetitionReport,
  CompetitorInput,
  CompetitionReport,
} from '../lib/compatibilityEngine';
import { DayKey, SAPTA_WARA } from '../lib/hisabJumalEngine';

interface CompetitionGhalibSubViewProps {
  theme: 'night' | 'parchment';
  onAnnotate?: (title: string, content: string) => void;
}

const PRESET_SCENARIOS: {
  id: string;
  title: string;
  day: DayKey;
  competitors: CompetitorInput[];
}[] = [
  {
    id: 'pemilihan_tiga',
    title: 'Kontestasi Tiga Kandidat Pemimpin',
    day: 'ahad',
    competitors: [
      { id: '1', name: 'Ahmad Dahlan', nameArabic: 'أَحْمَد دَحْلَان', roleOrTeam: 'Kandidat 01' },
      { id: '2', name: 'Hasyim Asy\'ari', nameArabic: 'هَاشِم أَشْعَرِي', roleOrTeam: 'Kandidat 02' },
      { id: '3', name: 'Tjokroaminoto', nameArabic: 'تْشُوكْرُو أَمِينُوتُو', roleOrTeam: 'Kandidat 03' },
    ],
  },
  {
    id: 'debat_bisnis',
    title: 'Tender Proyek & Negosiasi Dagang',
    day: 'rabu',
    competitors: [
      { id: '1', name: 'Konsorsium Samudra', nameArabic: 'سَمُودْرَا', roleOrTeam: 'Vendor A' },
      { id: '2', name: 'Mitra Cipta Nusantara', nameArabic: 'نُوسَانْتَارَا', roleOrTeam: 'Vendor B' },
    ],
  },
  {
    id: 'turnamen_atlet',
    title: 'Pertandingan Silat / Olahraga',
    day: 'selasa',
    competitors: [
      { id: '1', name: 'Bambang Pamungkas', nameArabic: 'بَامْبَانْغ', roleOrTeam: 'Tim Merah' },
      { id: '2', name: 'Sudirman Perkasa', nameArabic: 'سُودِيرْمَان', roleOrTeam: 'Tim Biru' },
    ],
  },
];

export const CompetitionGhalibSubView: React.FC<CompetitionGhalibSubViewProps> = ({
  theme,
  onAnnotate,
}) => {
  const isNight = theme === 'night';

  const [competitionDay, setCompetitionDay] = useState<DayKey>('ahad');
  const [competitors, setCompetitors] = useState<CompetitorInput[]>([
    { id: '1', name: 'Ahmad Dahlan', nameArabic: 'أَحْمَد دَحْلَان', roleOrTeam: 'Kandidat A' },
    { id: '2', name: 'Hasyim Asy\'ari', nameArabic: 'هَاشِم أَشْعَرِي', roleOrTeam: 'Kandidat B' },
    { id: '3', name: 'Tjokroaminoto', nameArabic: 'تْشُوكْرُو أَمِينُوتُو', roleOrTeam: 'Kandidat C' },
  ]);

  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Compute Competition Report
  const report: CompetitionReport = useMemo(() => {
    return calculateCompetitionReport(competitors, competitionDay);
  }, [competitors, competitionDay]);

  // Handle Update Competitor
  const handleUpdateCompetitor = (id: string, field: keyof CompetitorInput, val: string) => {
    setCompetitors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  // Add Competitor
  const handleAddCompetitor = () => {
    if (competitors.length >= 6) return;
    const newId = (Date.now() % 10000).toString();
    setCompetitors((prev) => [
      ...prev,
      {
        id: newId,
        name: `Peserta ${prev.length + 1}`,
        nameArabic: '',
        roleOrTeam: `Regu ${String.fromCharCode(65 + prev.length)}`,
      },
    ]);
  };

  // Remove Competitor
  const handleRemoveCompetitor = (id: string) => {
    if (competitors.length <= 2) return;
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  // Apply Preset
  const handleApplyPreset = (presetId: string) => {
    const found = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (!found) return;
    setCompetitionDay(found.day);
    setCompetitors(found.competitors);
  };

  // Copy Summary
  const handleCopySummary = () => {
    const text = `=== HASIL HISAB AL-GHALIB WA AL-MAGHLUB ===
Hari Pertandingan: ${competitionDay.toUpperCase()} (Dinaungi ${report.dayRulerPlanet})
PEMENANG UTAMA TERPROYEKSI: ${report.projectedWinner.name} (Peluang: ${report.projectedWinner.winProbabilityScore}%)

PAPAN PERINGKAT:
${report.competitors
  .map(
    (c) =>
      `#${c.rank} ${c.name} (${c.arabicName}) - Jumal: ${c.totalJumal} | Akar: ${c.rootMod9} | Probabilitas: ${c.winProbabilityScore}% | Status: ${c.status}`
  )
  .join('\n')}

DINAMIKA KOMPETISI:
${report.competitionDynamics}

NASIHAT TAKTIS:
${report.strategicAdvice.join('\n')}
==========================================`;
    navigator.clipboard.writeText(text);
    setCopiedNotification('Hasil analisis persaingan disalin!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Element badge helper
  const renderElementBadge = (el: string) => {
    switch (el) {
      case 'Nar':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <Flame className="w-3 h-3" /> Api
          </span>
        );
      case 'Turab':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Mountain className="w-3 h-3" /> Tanah
          </span>
        );
      case 'Hawa':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <Wind className="w-3 h-3" /> Udara
          </span>
        );
      case 'Ma':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <Droplets className="w-3 h-3" /> Air
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

      {/* Preset Scenarios */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-serif font-bold text-stone-600 dark:text-stone-400">
            Skenario Simulasi:
          </span>
          {PRESET_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleApplyPreset(sc.id)}
              className="text-xs px-2.5 py-1 rounded-lg border border-[#dacdb2] dark:border-[#25344f] bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-500 hover:text-amber-600 transition-colors"
            >
              {sc.title}
            </button>
          ))}
        </div>

        {/* Day of Competition */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-serif font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Hari Laga:</span>
          </span>
          <select
            value={competitionDay}
            onChange={(e) => setCompetitionDay(e.target.value as DayKey)}
            className="text-xs font-medium px-3 py-1.5 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] text-stone-900 dark:text-stone-100"
          >
            {(Object.keys(SAPTA_WARA) as DayKey[]).map((d) => (
              <option key={d} value={d}>
                {d.toUpperCase()} (Kawkab: {SAPTA_WARA[d].arabicName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CONTENDERS LIST INPUT (2 to 6 Contenders) */}
      <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#dacdb2] dark:border-[#25344f] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Swords className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                Daftar Kontestan &amp; Calon Bersaing ({competitors.length} Peserta)
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Masukkan nama para pihak yang bersaing dalam pemilihan, tender, debat, atau kompetisi olahraga.
              </p>
            </div>
          </div>

          <button
            onClick={handleAddCompetitor}
            disabled={competitors.length >= 6}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              competitors.length >= 6
                ? 'bg-stone-300 dark:bg-stone-800 text-stone-500 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm cursor-pointer'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kontestan</span>
          </button>
        </div>

        {/* Input Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {competitors.map((c, idx) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white dark:bg-[#0c1222] space-y-2.5 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono">
                  Peserta #{idx + 1}
                </span>

                {competitors.length > 2 && (
                  <button
                    onClick={() => handleRemoveCompetitor(c.id)}
                    className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                    title="Hapus peserta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-0.5">
                  Nama Lengkap (Latin):
                </label>
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => handleUpdateCompetitor(c.id, 'name', e.target.value)}
                  className="w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-[#dacdb2] dark:border-[#25344f] bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  placeholder="Nama Peserta"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-0.5">
                  Lafaz Arab (Opsional):
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={c.nameArabic || ''}
                  onChange={(e) => handleUpdateCompetitor(c.id, 'nameArabic', e.target.value)}
                  className="w-full text-xs font-arabic px-2.5 py-1.5 rounded-lg border border-[#dacdb2] dark:border-[#25344f] bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  placeholder="الاسم بالعربية"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-0.5">
                  Peran / No. Urut:
                </label>
                <input
                  type="text"
                  value={c.roleOrTeam || ''}
                  onChange={(e) => handleUpdateCompetitor(c.id, 'roleOrTeam', e.target.value)}
                  className="w-full text-[11px] px-2.5 py-1 rounded-lg border border-[#dacdb2] dark:border-[#25344f] bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300"
                  placeholder="cth: Kandidat 01"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPETITION RESULTS: THE WINNER (AL-GHALIB) & LEADERBOARD */}
      <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border-2 border-amber-500/40 dark:border-amber-400/30 rounded-2xl p-6 shadow-lg space-y-6">
        {/* Header & Winner Spotlight */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#dacdb2] dark:border-[#25344f] pb-5">
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400 font-sans">
              Hisab Al-Ghālib wa Al-Maghlūb (Naskah Al-Biruni)
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              <span>Pemenang Terproyeksi: {report.projectedWinner.name}</span>
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-serif">
              {report.competitionDynamics}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Win Probability Badge */}
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3">
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">
                  Peluang Keunggulan
                </div>
                <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
                  {report.projectedWinner.winProbabilityScore}%
                </div>
              </div>
              <Award className="w-8 h-8 text-amber-500" />
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
                      `Hisab Kompetisi: ${report.projectedWinner.name} (Al-Ghalib)`,
                      `Hari: ${competitionDay.toUpperCase()}\nPemenang: ${report.projectedWinner.name} (${report.projectedWinner.winProbabilityScore}%)\n${report.competitionDynamics}`
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

        {/* COMPARATIVE LEADERBOARD TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#dacdb2] dark:border-[#25344f] text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Peringkat</th>
                <th className="py-2.5 px-3">Nama Kontestan</th>
                <th className="py-2.5 px-3">Jumal Kabīr</th>
                <th className="py-2.5 px-3">Akar Mod 9</th>
                <th className="py-2.5 px-3">Unsur</th>
                <th className="py-2.5 px-3">Peluang Menang</th>
                <th className="py-2.5 px-3">Status Falak</th>
                <th className="py-2.5 px-3">Jam Mustajab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dacdb2]/40 dark:divide-[#25344f]/40 font-serif">
              {report.competitors.map((c) => (
                <tr
                  key={c.id}
                  className={`transition-colors ${
                    c.rank === 1
                      ? 'bg-amber-500/10 dark:bg-amber-400/10 font-bold'
                      : 'hover:bg-stone-500/5'
                  }`}
                >
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold ${
                        c.rank === 1
                          ? 'bg-amber-500 text-black'
                          : c.rank === 2
                          ? 'bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-200'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      #{c.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div>
                      <span className="font-sans font-bold text-stone-900 dark:text-stone-100">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-stone-500 block font-arabic">
                        {c.arabicName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-stone-800 dark:text-stone-200">
                    {c.totalJumal}
                  </td>
                  <td className="py-3 px-3 font-mono text-amber-700 dark:text-amber-400">
                    {c.rootMod9}
                  </td>
                  <td className="py-3 px-3">{renderElementBadge(c.dominantElement)}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            c.rank === 1 ? 'bg-amber-500' : 'bg-stone-400'
                          }`}
                          style={{ width: `${c.winProbabilityScore}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold">{c.winProbabilityScore}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                        c.rank === 1
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : c.status.includes('Maghlub')
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {c.status.split('(')[0]}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-stone-600 dark:text-stone-400 font-sans">
                    {c.optimalPlanetaryHour}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TACTICAL PROFILE PER CONTENDER */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {report.competitors.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white/60 dark:bg-[#0c1222]/60 space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-[#dacdb2]/40 dark:border-[#25344f]/40 pb-2">
                <span className="font-bold text-xs font-sans text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span className="text-amber-500">#{c.rank}</span>
                  <span>{c.name}</span>
                </span>
                <span className="text-[10px] font-mono text-stone-500">
                  Prob: {c.winProbabilityScore}%
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  Keunggulan Strategis:
                </span>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed font-serif">
                  {c.tacticalAdvantage}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-0.5">
                  Titik Rawan / Kelemahan:
                </span>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed font-serif">
                  {c.tacticalVulnerability}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* STRATEGIC WISDOM & ADVICE (AL-BIRUNI) */}
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 font-sans">
              Nasihat Strategis Naskah Kitāb at-Tafhīm (Al-Bīrūnī)
            </h4>
          </div>
          <ul className="text-xs text-stone-700 dark:text-stone-300 space-y-1.5 list-disc list-inside font-serif leading-relaxed">
            {report.strategicAdvice.map((adv, i) => (
              <li key={i}>{adv}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
