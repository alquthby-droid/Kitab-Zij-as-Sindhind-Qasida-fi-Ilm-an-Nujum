import React, { useState, useMemo } from 'react';
import { PlanetKey, PlanetaryPosition, ThemeMode } from '../types';
import {
  calculateDetailedAspects,
  DetailedAspect,
  SINDHIND_ORB_OF_LIGHT,
  ASPECT_DEFINITIONS,
} from '../lib/aspectsEngine';
import { PLANETS_INFO, ZODIAC_SIGNS } from '../lib/sindhindEngine';
import {
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
} from 'lucide-react';

interface AspectsTableViewProps {
  positions: Record<PlanetKey, PlanetaryPosition>;
  theme: ThemeMode;
  onAnnotateAspect?: (aspectTitle: string) => void;
}

export const AspectsTableView: React.FC<AspectsTableViewProps> = ({
  positions,
  theme,
  onAnnotateAspect,
}) => {
  const isNight = theme === 'night';

  // Calculate detailed aspects
  const allAspects = useMemo(() => {
    return calculateDetailedAspects(positions);
  }, [positions]);

  // Filters & State
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedNatureFilter, setSelectedNatureFilter] = useState<string>('all');
  const [selectedPlanetFilter, setSelectedPlanetFilter] = useState<string>('all');
  const [onlyPartile, setOnlyPartile] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected aspect for detailed inspection modal/card
  const [selectedAspect, setSelectedAspect] = useState<DetailedAspect | null>(
    allAspects.length > 0 ? allAspects[0] : null
  );

  // Toggle Matrix View vs Table View
  const [viewMode, setViewMode] = useState<'both' | 'table' | 'matrix'>('both');
  const [showTheoryGuide, setShowTheoryGuide] = useState<boolean>(false);

  // Available planets for matrix & filters
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

  // Filtered aspects list
  const filteredAspects = useMemo(() => {
    return allAspects.filter((asp) => {
      if (selectedTypeFilter !== 'all' && asp.aspectType !== selectedTypeFilter) {
        return false;
      }
      if (selectedNatureFilter !== 'all' && asp.nature !== selectedNatureFilter) {
        return false;
      }
      if (
        selectedPlanetFilter !== 'all' &&
        asp.planetA !== selectedPlanetFilter &&
        asp.planetB !== selectedPlanetFilter
      ) {
        return false;
      }
      if (onlyPartile && !asp.isPartile) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pAName = PLANETS_INFO[asp.planetA].transliteration.toLowerCase();
        const pBName = PLANETS_INFO[asp.planetB].transliteration.toLowerCase();
        const aspName = asp.aspectName.toLowerCase();
        const summary = asp.traditionalInterpretation.summary.toLowerCase();
        return (
          pAName.includes(q) ||
          pBName.includes(q) ||
          aspName.includes(q) ||
          summary.includes(q)
        );
      }
      return true;
    });
  }, [
    allAspects,
    selectedTypeFilter,
    selectedNatureFilter,
    selectedPlanetFilter,
    onlyPartile,
    searchQuery,
  ]);

  // Lookup map for Matrix cells: key = `${pA}_${pB}` or `${pB}_${pA}`
  const matrixLookup = useMemo(() => {
    const map = new Map<string, DetailedAspect>();
    allAspects.forEach((asp) => {
      map.set(`${asp.planetA}_${asp.planetB}`, asp);
      map.set(`${asp.planetB}_${asp.planetA}`, asp);
    });
    return map;
  }, [allAspects]);

  return (
    <div
      id="aspects-table-module"
      className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-4 ${
        isNight
          ? 'bg-[#101420]/95 border-[#28364f] text-[#e6ded0]'
          : 'bg-[#faf6ee] border-[#dfd6c3] text-[#2c241c] shadow-sm'
      }`}
    >
      {/* Header Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-current/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
              أشكال الاتصالات والنظر
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-[#c59a43]">
              Tabel Aspek & Matriks Hubungan Antar-Kawkab
            </h2>
          </div>
          <p className="text-xs opacity-75 mt-1 font-serif">
            Kaidah Hisab Aspek Klasik Zij as-Sindhind: Konjungsi (Qiran), Sekstil (Tasdis), Kuadrat (Tarbi'), Trina (Tathlith), dan Oposisi (Muqabalah) dengan toleransi Jurm al-Kawkab.
          </p>
        </div>

        {/* View Mode & Theory Toggle */}
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
              Matriks Segitiga
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg font-serif transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                  : 'hover:bg-current/10 opacity-75'
              }`}
            >
              Daftar Rinci
            </button>
          </div>

          <button
            onClick={() => setShowTheoryGuide(!showTheoryGuide)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-semibold transition-colors ${
              showTheoryGuide
                ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#c59a43]'
                : isNight
                ? 'bg-[#182236] border-[#293954] hover:bg-[#202d46]'
                : 'bg-[#ede5d3] border-[#ded0b6] hover:bg-[#e4dac6]'
            }`}
            title="Buka panduan kaidah hisab jurm cahaya dan aspek klasik"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kaidah Hisab Aspek</span>
            {showTheoryGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Theory & Orb Rules Panel */}
      {showTheoryGuide && (
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
            <div className="space-y-2.5 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-serif font-bold text-sm text-[#c59a43]">
                  Kaidah Hisab Aspek Menurut Zij as-Sindhind & Kitab al-Madkhal (Abu Ma'shar):
                </h4>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-current/10">
                  Parameter: Jurm al-Kawkab (Orb of Light)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px]">
                <div
                  className={`p-2.5 rounded-lg border ${
                    isNight ? 'bg-[#0b101c] border-[#1d2940]' : 'bg-[#ffffff] border-[#e2d8c3]'
                  }`}
                >
                  <span className="font-bold text-[#38bdf8] block mb-1">
                    1. Jarak Busur Ekliptika (θ):
                  </span>
                  Sudut antara dua kawkab dihitung dari selisih bujur absolut terpendek pada lingkaran 360°:
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
                    2. Kaidah Jurm Cahaya (Orb Moiety):
                  </span>
                  Toleransi batas aspek dihitung dari setengah jumlah lingkaran cahaya (*Jurm*) kedua kawkab:
                  <div className="font-mono text-[10px] mt-1 p-1 rounded bg-current/5 text-center">
                    Orb_Max = (Jurm_A + Jurm_B) / 2
                  </div>
                  Matahari (15°), Bulan (12°), Mars/Saturnus (8°-9°), Venus/Merkurius (7°-8°).
                </div>

                <div
                  className={`p-2.5 rounded-lg border ${
                    isNight ? 'bg-[#0b101c] border-[#1d2940]' : 'bg-[#ffffff] border-[#e2d8c3]'
                  }`}
                >
                  <span className="font-bold text-[#10b981] block mb-1">
                    3. Status Ittisal (Applying vs Separating):
                  </span>
                  <strong>Ittisal (Muqbil)</strong>: Kawkab berkecepatan lebih tinggi sedang mendekati derajat eksak.
                  <strong>Infisal (Mudbir)</strong>: Kawkab lebih cepat sedang menjauhi derajat eksak. Aspek partil (*Daqiqi*) berlaku jika selisih ≤ 1.0°.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Synastry Matrix (Matriks Segitiga Aspek) */}
      {(viewMode === 'both' || viewMode === 'matrix') && (
        <div
          className={`p-4 rounded-xl border overflow-x-auto ${
            isNight
              ? 'bg-[#0b101b] border-[#1e2a3f]'
              : 'bg-[#ffffff] border-[#e2d9c4]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#c59a43]">
              Matriks Segitiga Hubungan Antar-Kawkab (Jadwal at-Tarkib):
            </span>
            <span className="text-[11px] opacity-75 font-mono">
              Klik sel untuk menelaah aspek secara mendalam
            </span>
          </div>

          {/* Matrix Table */}
          <div className="min-w-[560px]">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-1.5 w-16 text-left opacity-50 font-mono text-[10px]">
                    Kawkab
                  </th>
                  {standardPlanets.map((p) => {
                    const info = PLANETS_INFO[p];
                    return (
                      <th key={p} className="p-1.5 font-serif text-[11px] font-semibold">
                        <div className="flex flex-col items-center">
                          <span
                            className="w-2.5 h-2.5 rounded-full mb-0.5 inline-block"
                            style={{ backgroundColor: info.color }}
                          />
                          <span className="truncate max-w-[50px] text-[10px]">
                            {info.transliteration}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {standardPlanets.map((pRow, rIdx) => {
                  const rInfo = PLANETS_INFO[pRow];
                  return (
                    <tr key={pRow} className="border-t border-current/10">
                      {/* Row Header */}
                      <td className="p-1.5 text-left font-serif font-semibold text-[11px] flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: rInfo.color }}
                        />
                        <span className="truncate">{rInfo.transliteration}</span>
                      </td>

                      {/* Columns */}
                      {standardPlanets.map((pCol, cIdx) => {
                        if (cIdx <= rIdx) {
                          // Diagonal or redundant lower half
                          if (cIdx === rIdx) {
                            return (
                              <td
                                key={pCol}
                                className="p-1.5 font-mono text-[10px] opacity-30 bg-current/5"
                              >
                                —
                              </td>
                            );
                          }
                          return (
                            <td
                              key={pCol}
                              className="p-1.5 font-mono text-[10px] opacity-15"
                            >
                              ·
                            </td>
                          );
                        }

                        // Upper triangle cell
                        const aspect = matrixLookup.get(`${pRow}_${pCol}`);
                        if (!aspect) {
                          return (
                            <td
                              key={pCol}
                              className="p-1.5 text-center font-mono text-[11px] opacity-20 hover:opacity-50"
                              title="Tidak ada aspek dalam batas Jurm"
                            >
                              -
                            </td>
                          );
                        }

                        const isSelected =
                          selectedAspect &&
                          ((selectedAspect.planetA === pRow && selectedAspect.planetB === pCol) ||
                            (selectedAspect.planetA === pCol && selectedAspect.planetB === pRow));

                        // Styling by aspect nature
                        let cellBg = 'bg-slate-500/10 hover:bg-slate-500/20 text-slate-300';
                        if (aspect.nature === 'Sa\'d') {
                          cellBg = isNight
                            ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30'
                            : 'bg-emerald-600/15 text-emerald-700 hover:bg-emerald-600/25 border-emerald-600/30';
                        } else if (aspect.nature === 'Nahs') {
                          cellBg = isNight
                            ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border-rose-500/30'
                            : 'bg-rose-600/15 text-rose-700 hover:bg-rose-600/25 border-rose-600/30';
                        } else {
                          // Mu'tadil
                          cellBg = isNight
                            ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border-amber-500/30'
                            : 'bg-amber-600/15 text-amber-800 hover:bg-amber-600/25 border-amber-600/30';
                        }

                        return (
                          <td key={pCol} className="p-1">
                            <button
                              onClick={() => setSelectedAspect(aspect)}
                              className={`w-full py-1 px-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${cellBg} ${
                                isSelected ? 'ring-2 ring-[#c59a43] shadow-md scale-105' : ''
                              }`}
                              title={`${aspect.aspectName}: ${rInfo.transliteration} & ${PLANETS_INFO[pCol].transliteration} (Orb: ${aspect.orbDifference.toFixed(1)}°)`}
                            >
                              <span className="text-sm font-bold leading-none">
                                {aspect.symbol}
                              </span>
                              <span className="text-[9px] font-mono mt-0.5 opacity-80">
                                {aspect.orbDifference.toFixed(1)}°
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

          {/* Matrix Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 border-t border-current/10 text-[11px]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="opacity-70">Simbol & Sifat:</span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span>△ Trina (120°) / ⚹ Sekstil (60°)</span>
                <span className="text-[10px] opacity-75">(Sa'd / Harmoni)</span>
              </span>
              <span className="inline-flex items-center gap-1 text-rose-400">
                <span>□ Kuadrat (90°) / ☍ Oposisi (180°)</span>
                <span className="text-[10px] opacity-75">(Nahs / Ujian)</span>
              </span>
              <span className="inline-flex items-center gap-1 text-amber-400">
                <span>☌ Konjungsi (0°)</span>
                <span className="text-[10px] opacity-75">(Mu'tadil / Penyatuan)</span>
              </span>
            </div>

            <div className="text-[10px] opacity-60 font-mono">
              Total {allAspects.length} Aspek Aktif Terhisab
            </div>
          </div>
        </div>
      )}

      {/* Selected Aspect Spotlight Card */}
      {selectedAspect && (
        <div
          className={`p-4 rounded-xl border transition-all ${
            isNight
              ? 'bg-[#131b2c] border-[#293c5d] text-[#e2d9c8]'
              : 'bg-[#f7efe0] border-[#ded1b8] text-[#2e2619]'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-current/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c59a43]/20 border border-[#c59a43]/40 flex items-center justify-center text-xl font-bold text-[#c59a43]">
                {selectedAspect.symbol}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-[#c59a43]">
                    {selectedAspect.aspectName} ({selectedAspect.aspectArabic})
                  </h3>
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
                  <span>
                    {PLANETS_INFO[selectedAspect.planetA].transliteration} (
                    {positions[selectedAspect.planetA]?.coordinate.signDegree}°{' '}
                    {ZODIAC_SIGNS[positions[selectedAspect.planetA]?.coordinate.signIndex || 0].latinName})
                  </span>
                  <span>↔</span>
                  <span>
                    {PLANETS_INFO[selectedAspect.planetB].transliteration} (
                    {positions[selectedAspect.planetB]?.coordinate.signDegree}°{' '}
                    {ZODIAC_SIGNS[positions[selectedAspect.planetB]?.coordinate.signIndex || 0].latinName})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="text-right">
                <span className="opacity-70 block text-[10px]">Deviasi Sudut (Orb):</span>
                <span className="font-bold text-[#38bdf8]">
                  Δ = {selectedAspect.orbDifference.toFixed(2)}°
                </span>
                <span className="opacity-50 text-[10px]"> (Batas: {selectedAspect.maxAllowedOrb}°)</span>
              </div>

              {onAnnotateAspect && (
                <button
                  onClick={() =>
                    onAnnotateAspect(
                      `${selectedAspect.aspectName}: ${PLANETS_INFO[selectedAspect.planetA].transliteration} & ${PLANETS_INFO[selectedAspect.planetB].transliteration}`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#c59a43] text-black hover:bg-[#d6aa52] transition-colors"
                >
                  Catat Anotasi
                </button>
              )}
            </div>
          </div>

          {/* Classical Commentary & Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-xs leading-relaxed">
            <div className="md:col-span-2 space-y-2">
              <div className="font-serif font-bold text-[#c59a43]">
                {selectedAspect.traditionalInterpretation.summary}
              </div>
              <p className="opacity-90 font-serif italic text-[11px]" dir="rtl">
                «{selectedAspect.traditionalInterpretation.arabicPhrase}»
              </p>
              <p className="text-[11px] opacity-80">
                {selectedAspect.traditionalInterpretation.impactDescription}
              </p>
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
                <span className="opacity-75">Kekuatan Aspek:</span>
                <span className="font-bold text-[#10b981]">{selectedAspect.strengthPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Status Gerak:</span>
                <span>
                  {selectedAspect.isApplying ? 'Mendekati (Ittisal)' : 'Menjauhi (Infisal)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Klasifikasi:</span>
                <span>{selectedAspect.isPartile ? 'Partil (Daqiqi)' : 'Platil (Mu\'tadil)'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      {(viewMode === 'both' || viewMode === 'table') && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Aspect Type Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="opacity-75 text-[11px] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#c59a43]" />
                Filter:
              </span>

              {[
                { id: 'all', label: 'Semua Aspek' },
                { id: 'qiran', label: '☌ Qiran (0°)' },
                { id: 'tathlith', label: '△ Trina (120°)' },
                { id: 'tasdis', label: '⚹ Sekstil (60°)' },
                { id: 'tarbi', label: '□ Kuadrat (90°)' },
                { id: 'muqabalah', label: '☍ Oposisi (180°)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedTypeFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedTypeFilter === f.id
                      ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                      : 'bg-current/5 hover:bg-current/10 opacity-75'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Partile Only Checkbox */}
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={onlyPartile}
                onChange={(e) => setOnlyPartile(e.target.checked)}
                className="rounded accent-[#c59a43]"
              />
              <span>Hanya Aspek Partil (≤ 1.0° orb)</span>
            </label>
          </div>

          {/* Search and Secondary Planet/Nature Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kawkab atau hikmah..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none transition-colors ${
                  isNight
                    ? 'bg-[#0c121d] border-[#1e2a3d] focus:border-[#c59a43]'
                    : 'bg-[#ffffff] border-[#ded3bd] focus:border-[#c59a43]'
                }`}
              />
            </div>

            {/* Filter by Planet */}
            <select
              value={selectedPlanetFilter}
              onChange={(e) => setSelectedPlanetFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs outline-none ${
                isNight
                  ? 'bg-[#0c121d] border-[#1e2a3d] focus:border-[#c59a43]'
                  : 'bg-[#ffffff] border-[#ded3bd] focus:border-[#c59a43]'
              }`}
            >
              <option value="all">Semua Kawkab (Bintang)</option>
              {standardPlanets.map((pk) => (
                <option key={pk} value={pk}>
                  {PLANETS_INFO[pk].transliteration} ({PLANETS_INFO[pk].arabicName})
                </option>
              ))}
            </select>

            {/* Filter by Nature */}
            <select
              value={selectedNatureFilter}
              onChange={(e) => setSelectedNatureFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs outline-none ${
                isNight
                  ? 'bg-[#0c121d] border-[#1e2a3d] focus:border-[#c59a43]'
                  : 'bg-[#ffffff] border-[#ded3bd] focus:border-[#c59a43]'
              }`}
            >
              <option value="all">Semua Sifat (Sa'd / Nahs / Mu'tadil)</option>
              <option value="Sa'd">Hanya Sa'd (Harmonis / Berkah)</option>
              <option value="Nahs">Hanya Nahs (Tegangan / Ujian)</option>
              <option value="Mu'tadil">Hanya Mu'tadil (Netral / Sinergi)</option>
            </select>
          </div>

          {/* Detailed Aspect Records Table */}
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
                  <th className="py-2.5 px-3">Pasangan Kawkab</th>
                  <th className="py-2.5 px-3">Bentuk Aspek</th>
                  <th className="py-2.5 px-3">Sudut & Toleransi</th>
                  <th className="py-2.5 px-3">Status Ittisal</th>
                  <th className="py-2.5 px-3">Kekuatan</th>
                  <th className="py-2.5 px-3">Sifat & Makna</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/10 font-sans">
                {filteredAspects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center opacity-60 italic">
                      Tidak ditemukan aspek yang sesuai dengan kriteria filter.
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
                                className="w-3.5 h-3.5 rounded-full border border-black/40 inline-block"
                                style={{ backgroundColor: pAInfo.color }}
                              />
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/40 inline-block"
                                style={{ backgroundColor: pBInfo.color }}
                              />
                            </div>
                            <div>
                              <div className="font-serif font-semibold">
                                {pAInfo.transliteration} — {pBInfo.transliteration}
                              </div>
                              <div className="text-[10px] opacity-70 font-mono">
                                {positions[asp.planetA]?.coordinate.signDegree}°{' '}
                                {ZODIAC_SIGNS[positions[asp.planetA]?.coordinate.signIndex || 0].symbol}
                                {' & '}
                                {positions[asp.planetB]?.coordinate.signDegree}°{' '}
                                {ZODIAC_SIGNS[positions[asp.planetB]?.coordinate.signIndex || 0].symbol}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Aspect Shape */}
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

                        {/* Angles & Orbs */}
                        <td className="py-2.5 px-3 font-mono">
                          <div className="font-semibold text-[#38bdf8]">
                            θ = {asp.actualAngle.toFixed(1)}°
                          </div>
                          <div className="text-[10px] opacity-75">
                            Δ {asp.orbDifference.toFixed(2)}° (Maks {asp.maxAllowedOrb}°)
                          </div>
                        </td>

                        {/* Ittisal Status */}
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold inline-block w-fit ${
                                asp.isApplying
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {asp.isApplying ? 'Ittisal (Applying)' : 'Infisal (Separating)'}
                            </span>
                            {asp.isPartile && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono w-fit font-bold">
                                ★ Partil (Daqiqi)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Strength Progress */}
                        <td className="py-2.5 px-3">
                          <div className="w-20">
                            <div className="flex justify-between text-[10px] font-mono mb-0.5">
                              <span>{asp.strengthPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-current/10 overflow-hidden">
                              <div
                                className="h-full bg-[#c59a43] rounded-full transition-all"
                                style={{ width: `${asp.strengthPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Nature & Classical Interpretation */}
                        <td className="py-2.5 px-3 max-w-[240px]">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              asp.nature === 'Sa\'d'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : asp.nature === 'Nahs'
                                ? 'bg-rose-500/15 text-rose-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {asp.nature === 'Sa\'d' ? 'Sa\'d (Harmonis)' : asp.nature === 'Nahs' ? 'Nahs (Friksi)' : 'Mu\'tadil (Netral)'}
                          </span>
                          <div className="text-[11px] font-serif truncate mt-1 text-[#c59a43]">
                            {asp.traditionalInterpretation.summary}
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
