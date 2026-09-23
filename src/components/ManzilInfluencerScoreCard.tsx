import React from 'react';
import {
  Sparkles,
  Flame,
  Mountain,
  Wind,
  Droplets,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BookmarkPlus,
  BookOpen,
  Compass,
  Star,
  Shield,
  Heart,
  Briefcase,
  Activity,
  Smile,
} from 'lucide-react';
import { ManzilInfluencerReport, PlanetManzilInfluence } from '../lib/manzilInfluencerEngine';
import { ThemeMode } from '../types';

interface ManzilInfluencerScoreCardProps {
  report: ManzilInfluencerReport;
  theme: ThemeMode;
  onAnnotate?: (title: string, content: string) => void;
  onNavigateToWafaq?: (manzilNumber?: number) => void;
}

export const ManzilInfluencerScoreCard: React.FC<ManzilInfluencerScoreCardProps> = ({
  report,
  theme,
  onAnnotate,
  onNavigateToWafaq,
}) => {
  const isNight = theme === 'night';

  const getDignityBadge = (status: PlanetManzilInfluence['dignityStatus']) => {
    switch (status) {
      case 'Sa\'d Mahd':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            سَعْدٌ مَحْض (Sangat Beruntung)
          </span>
        );
      case 'Sa\'d':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
            سَعْد (Beruntung)
          </span>
        );
      case 'Muntasif':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            مُنْتَصِف (Netral/Sedang)
          </span>
        );
      case 'Nahs':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            نَحْس (Waswas / Ujian)
          </span>
        );
      case 'Nahs Mahd':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-700/20 text-red-600 dark:text-red-400 border border-red-700/40">
            نَحْسٌ مَحْض (Kritis)
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-500';
    if (score >= 55) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Composite Score & Qasida Synthesis */}
      <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border-2 border-amber-500/40 dark:border-amber-400/30 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400">
                  مُؤَشِّرُ تَأْثِيرِ الكَوَاكِبِ فِي المَنَازِلِ
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  Manzil Influencer Score
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-serif leading-relaxed">
              Analisis martabat planet (*Dignity &amp; Debility*) saat transit melintasi 28 Manzil Bulan berdasarkan kaidah sastra falak klasik <span className="italic font-serif">Qaṣīdah fī 'Ilm an-Nujūm</span> &amp; <span className="italic font-serif">Zīj as-Sindhind</span>.
            </p>

            <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-xs font-serif text-amber-900 dark:text-amber-200">
              <strong>Ikhtisar Langit Saat Ini:</strong> {report.qasidaSynthesis}
            </div>
          </div>

          {/* Radial Score Gauge */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-28 h-28 rounded-full border-4 border-amber-500/40 dark:border-amber-400/30 flex flex-col items-center justify-center p-2 text-center bg-white/50 dark:bg-black/20 shadow-inner">
              <span className={`text-3xl font-mono font-bold ${getScoreColor(report.compositeScore)}`}>
                {report.compositeScore}%
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-500">
                Skor Keberuntungan
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                {report.overallQuality}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-sans flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ● {report.beneficPlanetsCount} Sa'd
                </span>
                <span>•</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  ● {report.neutralPlanetsCount} Sedang
                </span>
                <span>•</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  ● {report.maleficPlanetsCount} Nahs
                </span>
              </div>

              {onAnnotate && (
                <button
                  onClick={() =>
                    onAnnotate(
                      `Manzil Influencer Score: ${report.compositeScore}% (${report.overallQuality})`,
                      `Kondisi Langit: ${report.qasidaSynthesis}\nPlanet Utama Berkah: ${report.leadingBenefic.planetNameLatin} di Manzil #${report.leadingBenefic.mansionNumber} ${report.leadingBenefic.mansion.arabicName}.\nPlanet Waswas: ${report.mostAfflicted.planetNameLatin} di Manzil #${report.mostAfflicted.mansionNumber}.`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer mt-1"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Catat ke Jurnal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2 SPOTLIGHTS: Leading Benefic & Most Afflicted */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leading Benefic Planet */}
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Planet Paling Membawa Berkah (Sa'd Akbar)</span>
            </span>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              +{report.leadingBenefic.dignityScore} Pts
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <div>
              <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span className="font-mono text-lg">{report.leadingBenefic.planetSymbol}</span>
                <span>{report.leadingBenefic.planetNameLatin} ({report.leadingBenefic.planetNameArabic})</span>
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-serif">
                Transit di Manzil #{report.leadingBenefic.mansionNumber}: <strong>{report.leadingBenefic.mansion.arabicName}</strong> ({report.leadingBenefic.mansion.transliteration})
              </p>
            </div>
            {getDignityBadge(report.leadingBenefic.dignityStatus)}
          </div>

          <div className="text-xs text-stone-700 dark:text-stone-300 space-y-1 font-serif">
            <div className="italic text-emerald-800 dark:text-emerald-300">
              "{report.leadingBenefic.qasidaVerseTranslation}"
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 pt-0.5">
              {report.leadingBenefic.practicalInfluence}
            </p>
          </div>

          {onNavigateToWafaq && (
            <button
              onClick={() => onNavigateToWafaq(report.leadingBenefic.mansionNumber)}
              className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 pt-1"
            >
              <span>Buat Wafaq untuk Manzil ini</span>
              <span>→</span>
            </button>
          )}
        </div>

        {/* Most Afflicted Planet */}
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Planet Dalam Ujian / Perlu Kehati-hatian</span>
            </span>
            <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
              {report.mostAfflicted.dignityScore} Pts
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
            <div>
              <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span className="font-mono text-lg">{report.mostAfflicted.planetSymbol}</span>
                <span>{report.mostAfflicted.planetNameLatin} ({report.mostAfflicted.planetNameArabic})</span>
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-serif">
                Transit di Manzil #{report.mostAfflicted.mansionNumber}: <strong>{report.mostAfflicted.mansion.arabicName}</strong> ({report.mostAfflicted.mansion.transliteration})
              </p>
            </div>
            {getDignityBadge(report.mostAfflicted.dignityStatus)}
          </div>

          <div className="text-xs text-stone-700 dark:text-stone-300 space-y-1 font-serif">
            <div className="italic text-rose-800 dark:text-rose-300">
              "{report.mostAfflicted.qasidaVerseTranslation}"
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 pt-0.5">
              {report.mostAfflicted.advisedAction}
            </p>
          </div>
        </div>
      </div>

      {/* SECTORAL PRACTICAL ADVICE (TRADING, MARRIAGE, GOVERNANCE, HEALTH) */}
      <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-500" />
          <span>Panduan Muamalah Berdasarkan Skor Pengaruh Manzil</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Trading */}
          <div className="p-3.5 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white/70 dark:bg-[#0c1222]/70 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-amber-700 dark:text-amber-400">
              <Briefcase className="w-4 h-4" />
              <span>Perniagaan &amp; Investasi</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-serif">
              {report.globalAdvice.trading}
            </p>
          </div>

          {/* Marriage */}
          <div className="p-3.5 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white/70 dark:bg-[#0c1222]/70 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-rose-600 dark:text-rose-400">
              <Heart className="w-4 h-4" />
              <span>Pernikahan &amp; Cinta</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-serif">
              {report.globalAdvice.marriage}
            </p>
          </div>

          {/* Governance */}
          <div className="p-3.5 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white/70 dark:bg-[#0c1222]/70 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-blue-600 dark:text-blue-400">
              <Shield className="w-4 h-4" />
              <span>Kepemimpinan &amp; Diplomasi</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-serif">
              {report.globalAdvice.governance}
            </p>
          </div>

          {/* Health */}
          <div className="p-3.5 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white/70 dark:bg-[#0c1222]/70 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4" />
              <span>Kesehatan &amp; Terapi Batin</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-serif">
              {report.globalAdvice.health}
            </p>
          </div>
        </div>
      </div>

      {/* FULL PLANETARY INFLUENCES TABLE ACROSS 28 MANSIONS */}
      <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Daftar Kedudukan 7 Planet Klasik dalam 28 Manzil &amp; Bait Syair Qasida</span>
          </h3>
          <span className="text-[11px] font-serif text-stone-500">
            Qasida fi 'Ilm an-Nujum
          </span>
        </div>

        <div className="space-y-3">
          {report.planetaryInfluences.map((inf) => (
            <div
              key={inf.planetKey}
              className="p-4 rounded-xl border border-[#dacdb2] dark:border-[#25344f] bg-white/80 dark:bg-[#0c1222]/80 space-y-2.5 transition-all hover:border-amber-500/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dacdb2]/40 dark:border-[#25344f]/40 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl font-mono">{inf.planetSymbol}</span>
                  <div>
                    <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span>{inf.planetNameLatin} ({inf.planetNameArabic})</span>
                      <span className="text-xs font-mono font-normal text-stone-500">
                        {inf.currentLongitude.toFixed(1)}°
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 font-serif">
                      Manzil #{inf.mansionNumber}: <strong>{inf.mansion.arabicName}</strong> ({inf.mansion.transliteration} - {inf.mansion.meaningId})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      inf.dignityScore > 0
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : inf.dignityScore < 0
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {inf.dignityScore > 0 ? `+${inf.dignityScore}` : inf.dignityScore} Pts
                  </span>
                  {getDignityBadge(inf.dignityStatus)}
                </div>
              </div>

              {/* Qasida classical verse */}
              <div className="space-y-1 bg-amber-500/5 dark:bg-amber-400/5 p-2.5 rounded-lg border border-amber-500/15">
                <div className="font-arabic text-sm text-amber-900 dark:text-amber-200 text-right leading-relaxed font-bold">
                  «{inf.qasidaVerseArabic}»
                </div>
                <div className="text-xs font-serif italic text-stone-700 dark:text-stone-300">
                  "{inf.qasidaVerseTranslation}"
                </div>
              </div>

              {/* Practical guidance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-serif pt-1">
                <div>
                  <span className="font-bold text-stone-700 dark:text-stone-300 block text-[11px]">
                    Pengaruh Aktual:
                  </span>
                  <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                    {inf.practicalInfluence}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-stone-700 dark:text-stone-300 block text-[11px]">
                    Nasihat Ikhtiar:
                  </span>
                  <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                    {inf.advisedAction}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
