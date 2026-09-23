import React, { useState, useMemo } from 'react';
import { ThemeMode } from '../types';
import {
  MANZIL_WEATHER_PROFILES,
  ManzilWeatherProfile,
  getManzilWeatherFromMoonLongitude,
  correlateMoonManzilWithSeason,
} from '../lib/manzilWeatherEngine';
import {
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  Droplets,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Compass,
  Sprout,
  ShieldCheck,
  BookmarkPlus,
  ArrowUpRight,
  Flame,
  Snowflake,
  Filter,
} from 'lucide-react';

interface ManzilWeatherCorrelationChartProps {
  currentMoonLongitude: number;
  currentSunLongitude: number;
  activeSeasonKey: 'spring' | 'summer' | 'autumn' | 'winter';
  seasonalRainfallBase: number;
  theme: ThemeMode;
  onAnnotate?: (title: string, content: string) => void;
}

export const ManzilWeatherCorrelationChart: React.FC<ManzilWeatherCorrelationChartProps> = ({
  currentMoonLongitude,
  currentSunLongitude,
  activeSeasonKey,
  seasonalRainfallBase,
  theme,
  onAnnotate,
}) => {
  const isNight = theme === 'night';

  // 1. Calculate active Moon mansion
  const moonMansionInfo = useMemo(() => {
    return getManzilWeatherFromMoonLongitude(currentMoonLongitude);
  }, [currentMoonLongitude]);

  // Selected mansion for in-depth inspection (default to Moon's active mansion)
  const [inspectedMansion, setInspectedMansion] = useState<ManzilWeatherProfile>(
    moonMansionInfo.manzil
  );

  // Season filter tab
  const [seasonFilter, setSeasonFilter] = useState<'all' | 'spring' | 'summer' | 'autumn' | 'winter'>('all');

  // Metric toggle
  const [metricMode, setMetricMode] = useState<'both' | 'rainfall' | 'temperature' | 'gates'>('both');

  // Hovered mansion for tooltip
  const [hoveredMansion, setHoveredMansion] = useState<ManzilWeatherProfile | null>(null);

  // Correlation analysis between Moon's active mansion and active season
  const correlationInsight = useMemo(() => {
    return correlateMoonManzilWithSeason(
      moonMansionInfo.manzil,
      activeSeasonKey,
      seasonalRainfallBase
    );
  }, [moonMansionInfo.manzil, activeSeasonKey, seasonalRainfallBase]);

  // Filtered mansions for display
  const displayedMansions = useMemo(() => {
    if (seasonFilter === 'all') return MANZIL_WEATHER_PROFILES;
    return MANZIL_WEATHER_PROFILES.filter((m) => m.seasonKey === seasonFilter);
  }, [seasonFilter]);

  // Chart dimensions
  const svgWidth = 840;
  const svgHeight = 240;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 45;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const barWidth = chartWidth / displayedMansions.length;

  // Temperature spline points
  const temperaturePolyline = useMemo(() => {
    return displayedMansions
      .map((m, idx) => {
        const x = paddingLeft + idx * barWidth + barWidth / 2;
        const y = paddingTop + chartHeight - (m.temperatureIndex / 100) * chartHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [displayedMansions, barWidth, chartHeight]);

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-4 ${
        isNight
          ? 'bg-[#0b101c]/90 border-[#22314d] text-slate-200'
          : 'bg-[#faf7f2] border-[#ded5c4] text-slate-800'
      }`}
    >
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-current/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
              <CloudRain className="w-4 h-4" />
            </span>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#c59a43]">
              Korelasi Cuaca & Curah Hujan 28 Manzil Bulan (*Anwā' al-Manāzil*)
            </h3>
          </div>
          <p className="text-xs opacity-75 mt-1 font-serif">
            Pemetaan pola curah hujan historis (*Amṭār*), fluktuasi suhu udara (*Ḥarārah*), dan status pembukaan pintu kelembaban (*Fatḥ al-Bāb*) ketika Bulan melintasi 28 stasiun falak menurut risalah Al-Kindī dan *Zīj as-Sindhind*.
          </p>
        </div>

        {/* Current Moon Mansion Live Badge */}
        <div
          onClick={() => setInspectedMansion(moonMansionInfo.manzil)}
          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex items-center gap-3 ${
            isNight
              ? 'bg-[#152033] border-[#293e63] text-amber-300'
              : 'bg-[#f4ebd9] border-[#d8c7a8] text-amber-900'
          }`}
          title="Klik untuk menelaah Manzil posisi Bulan saat ini"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
            <Droplets className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono opacity-70 uppercase tracking-wider">
              Posisi Bulan Saat Ini:
            </div>
            <div className="font-serif font-bold flex items-center gap-1.5">
              <span>#{moonMansionInfo.manzil.number} {moonMansionInfo.manzil.transliteration}</span>
              <span className="opacity-60 text-[11px]" dir="rtl">({moonMansionInfo.manzil.arabicName})</span>
            </div>
            <div className="text-[10px] opacity-75 font-mono">
              Hujan Historis: <strong>{moonMansionInfo.manzil.rainfallProbability}%</strong> • {moonMansionInfo.manzil.rainfallLabel.split('(')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Metric View Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Seasonal Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-current/5 border border-current/10">
          {[
            { key: 'all', label: 'Semua 28 Manzil' },
            { key: 'spring', label: 'Semi (1-7)' },
            { key: 'summer', label: 'Panas (8-14)' },
            { key: 'autumn', label: 'Gugur (15-21)' },
            { key: 'winter', label: 'Dingin (22-28)' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSeasonFilter(tab.key as any)}
              className={`px-2.5 py-1 rounded-lg font-serif transition-colors text-[11px] ${
                seasonFilter === tab.key
                  ? 'bg-[#c59a43] text-black font-bold shadow-sm'
                  : 'hover:bg-current/10 opacity-75 hover:opacity-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Metric Modes */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] opacity-60 font-mono hidden sm:inline">Tampilan Data:</span>
          {[
            { key: 'both', label: 'Hujan & Suhu' },
            { key: 'rainfall', label: 'Hujan Saja' },
            { key: 'temperature', label: 'Suhu Saja' },
            { key: 'gates', label: 'Pintu Air (Bāb)' },
          ].map((mode) => (
            <button
              key={mode.key}
              onClick={() => setMetricMode(mode.key as any)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-mono transition-colors ${
                metricMode === mode.key
                  ? isNight
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                    : 'bg-sky-100 border-sky-400 text-sky-900 font-bold'
                  : 'border-current/15 opacity-60 hover:opacity-90'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* INTERACTIVE SVG CHART */}
      <div
        className={`relative rounded-xl border p-2 overflow-x-auto ${
          isNight ? 'bg-[#070b14] border-[#1a263d]' : 'bg-[#fcfbf9] border-[#e6dece]'
        }`}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[640px] select-none"
        >
          <defs>
            {/* Rainfall Bar Gradients */}
            <linearGradient id="rainGradientHigh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="rainGradientMid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="rainGradientDry" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.25" />
            </linearGradient>

            <linearGradient id="activeMoonGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#854d0e" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Grid lines (0%, 25%, 50%, 75%, 100%) */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = paddingTop + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke={isNight ? '#223249' : '#e2d9c8'}
                  strokeWidth="0.8"
                  strokeDasharray={val === 50 ? 'none' : '3,3'}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill={isNight ? '#64748b' : '#94a3b8'}
                  fontSize="8.5px"
                  fontFamily="monospace"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Seasonal Background Zones */}
          {seasonFilter === 'all' && (
            <g className="season-zones" opacity="0.12">
              <rect x={paddingLeft} y={paddingTop} width={barWidth * 7} height={chartHeight} fill="#10b981" />
              <rect x={paddingLeft + barWidth * 7} y={paddingTop} width={barWidth * 7} height={chartHeight} fill="#f59e0b" />
              <rect x={paddingLeft + barWidth * 14} y={paddingTop} width={barWidth * 7} height={chartHeight} fill="#ea580c" />
              <rect x={paddingLeft + barWidth * 21} y={paddingTop} width={barWidth * 7} height={chartHeight} fill="#0ea5e9" />
            </g>
          )}

          {/* 1. Rainfall Bars */}
          {(metricMode === 'both' || metricMode === 'rainfall' || metricMode === 'gates') &&
            displayedMansions.map((m, idx) => {
              const x = paddingLeft + idx * barWidth + barWidth * 0.12;
              const w = barWidth * 0.76;
              const h = (m.rainfallProbability / 100) * chartHeight;
              const y = paddingTop + chartHeight - h;
              const isCurrentMoon = m.number === moonMansionInfo.manzil.number;
              const isSelected = m.number === inspectedMansion.number;

              // Color gradient selection based on rainfall volume
              let barFill = 'url(#rainGradientMid)';
              if (m.rainfallProbability >= 70) barFill = 'url(#rainGradientHigh)';
              else if (m.rainfallProbability <= 25) barFill = 'url(#rainGradientDry)';
              if (isCurrentMoon) barFill = 'url(#activeMoonGradient)';

              return (
                <g
                  key={m.number}
                  className="cursor-pointer transition-transform hover:opacity-100"
                  onClick={() => setInspectedMansion(m)}
                  onMouseEnter={() => setHoveredMansion(m)}
                  onMouseLeave={() => setHoveredMansion(null)}
                >
                  {/* Selected / Current Moon Glow Background Column */}
                  {(isSelected || isCurrentMoon) && (
                    <rect
                      x={paddingLeft + idx * barWidth}
                      y={paddingTop}
                      width={barWidth}
                      height={chartHeight}
                      fill={isCurrentMoon ? '#eab308' : '#38bdf8'}
                      fillOpacity={isCurrentMoon ? '0.15' : '0.08'}
                    />
                  )}

                  {/* Rainfall Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx="3"
                    fill={barFill}
                    stroke={isSelected ? '#c59a43' : isCurrentMoon ? '#fde047' : 'none'}
                    strokeWidth={isSelected || isCurrentMoon ? '1.5' : '0'}
                  />

                  {/* Moisture Gate Indicator (Fath al-Bab) */}
                  {m.isMoistureGate && (metricMode === 'both' || metricMode === 'gates') && (
                    <g transform={`translate(${x + w / 2}, ${y - 8})`}>
                      <circle cx="0" cy="0" r="3.5" fill="#38bdf8" />
                      <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                    </g>
                  )}

                  {/* Current Moon Indicator Pin on Bar Top */}
                  {isCurrentMoon && (
                    <g transform={`translate(${x + w / 2}, ${y - 16})`}>
                      <circle cx="0" cy="0" r="5" fill="#eab308" className="animate-ping" opacity="0.6" />
                      <circle cx="0" cy="0" r="4" fill="#fef08a" stroke="#854d0e" strokeWidth="1" />
                    </g>
                  )}

                  {/* Mansion Number & Short Label on X-Axis */}
                  <text
                    x={x + w / 2}
                    y={paddingTop + chartHeight + 14}
                    textAnchor="middle"
                    fill={isCurrentMoon ? '#eab308' : isSelected ? '#38bdf8' : isNight ? '#94a3b8' : '#64748b'}
                    fontSize="9px"
                    fontWeight={isCurrentMoon || isSelected ? 'bold' : 'normal'}
                    fontFamily="monospace"
                  >
                    #{m.number}
                  </text>
                  <text
                    x={x + w / 2}
                    y={paddingTop + chartHeight + 25}
                    textAnchor="middle"
                    fill={isCurrentMoon ? '#fef08a' : isNight ? '#64748b' : '#94a3b8'}
                    fontSize="7.5px"
                    fontFamily="serif"
                  >
                    {m.transliteration.slice(0, 5)}
                  </text>
                </g>
              );
            })}

          {/* 2. Temperature Spline Curve */}
          {(metricMode === 'both' || metricMode === 'temperature') && (
            <g className="temperature-series pointer-events-none">
              <polyline
                fill="none"
                stroke="#f97316"
                strokeWidth="2.2"
                points={temperaturePolyline}
                strokeDasharray="none"
                opacity="0.9"
              />
              {displayedMansions.map((m, idx) => {
                const x = paddingLeft + idx * barWidth + barWidth / 2;
                const y = paddingTop + chartHeight - (m.temperatureIndex / 100) * chartHeight;
                return (
                  <circle
                    key={m.number}
                    cx={x}
                    cy={y}
                    r="2.5"
                    fill="#ffedd5"
                    stroke="#ea580c"
                    strokeWidth="1.2"
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 px-2 text-[10px] opacity-75 font-mono border-t border-current/10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-sky-400 inline-block" />
              Curah Hujan Tinggi (&gt;70%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-blue-500 inline-block" />
              Curah Hujan Sedang (35-70%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-amber-500 inline-block" />
              Gersang / Kering (&lt;25%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-orange-500 inline-block" />
              Kurva Suhu Udara
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
              Pintu Air (*Fatḥ al-Bāb*)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            Posisi Bulan Aktif: #{moonMansionInfo.manzil.number}
          </div>
        </div>
      </div>

      {/* CORRELATION ANALYSIS BANNER (Moon's Active Mansion × Active Season) */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          correlationInsight.correlationType === 'amplified_rain'
            ? isNight
              ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
              : 'bg-sky-50 border-sky-300 text-sky-950'
            : correlationInsight.correlationType === 'suppressed_rain'
            ? isNight
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-950'
            : isNight
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-current/10 border border-current/20">
                Analisis Sinergi Cuaca
              </span>
              <span className="font-serif font-bold text-sm sm:text-base">
                {correlationInsight.correlationTitle}
              </span>
              <span className="text-xs opacity-75 font-serif hidden lg:inline" dir="rtl">
                «{correlationInsight.correlationArabic}»
              </span>
            </div>
            <p className="text-xs leading-relaxed opacity-90 font-serif">
              {correlationInsight.effectDescription}
            </p>
            <div className="text-xs pt-1 flex items-start gap-1.5 opacity-90">
              <Sprout className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                <strong>Tuntunan Agrikultur:</strong> {correlationInsight.recommendation}
              </span>
            </div>
          </div>

          {/* Combined Rainfall Meter Gauge */}
          <div className="shrink-0 flex items-center gap-3 p-3 rounded-xl bg-current/5 border border-current/10">
            <div>
              <div className="text-[10px] font-mono opacity-70">Indeks Presipitasi Paduan:</div>
              <div className="font-mono text-2xl font-bold">
                {correlationInsight.combinedRainfallIndex}%
              </div>
              <div className="text-[10px] opacity-80 font-serif">
                Musim ({seasonalRainfallBase}%) + Manzil ({moonMansionInfo.manzil.rainfallProbability}%)
              </div>
            </div>
            <div className="w-3 h-14 rounded-full bg-current/20 overflow-hidden relative">
              <div
                className="w-full absolute bottom-0 bg-current transition-all duration-500"
                style={{ height: `${correlationInsight.combinedRainfallIndex}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SELECTED MANZIL DEEP INSPECTOR CARD */}
      <div
        className={`p-4 rounded-2xl border transition-all space-y-3 ${
          isNight ? 'bg-[#0f1729] border-[#22334f]' : 'bg-[#ffffff] border-[#ded3be] shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-current/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
                Manzil #{inspectedMansion.number}
              </span>
              <h4 className="font-serif font-bold text-base sm:text-lg text-[#c59a43]">
                {inspectedMansion.transliteration}
              </h4>
              <span className="text-sm font-serif opacity-80" dir="rtl">
                ({inspectedMansion.arabicName})
              </span>
              {inspectedMansion.isMoistureGate && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-sky-500/20 text-sky-400 border border-sky-400/40">
                  Pintu Air (Fatḥ al-Bāb)
                </span>
              )}
            </div>
            <div className="text-[11px] opacity-75 font-mono mt-0.5">
              Gugus Bintang: {inspectedMansion.starGroup} • {inspectedMansion.zodiacSpan}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onAnnotate && (
              <button
                onClick={() =>
                  onAnnotate(
                    `Korelasi Cuaca Manzil #${inspectedMansion.number} ${inspectedMansion.transliteration}`,
                    `Karakter presipitasi: ${inspectedMansion.rainfallLabel} (${inspectedMansion.rainfallProbability}%). Sifat angin: ${inspectedMansion.windDirection} - ${inspectedMansion.windCharacteristics}. Tuntunan agrikultur: ${inspectedMansion.agriculturalIndication}. Bait Anwa': ${inspectedMansion.poeticVerse}`
                  )
                }
                className="px-2.5 py-1 rounded-lg border border-current/20 hover:bg-current/10 text-xs flex items-center gap-1 font-serif opacity-80 hover:opacity-100"
                title="Simpan anotasi ke catatan riset"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-[#c59a43]" />
                <span className="hidden sm:inline">Catat Riset</span>
              </button>
            )}
          </div>
        </div>

        {/* Core Meteorological Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          {/* Rainfall */}
          <div className="p-2.5 rounded-xl bg-current/5 border border-current/10">
            <span className="text-[10px] opacity-60 flex items-center gap-1 font-serif">
              <CloudRain className="w-3 h-3 text-sky-400" />
              Presipitasi Historis:
            </span>
            <div className="text-base font-bold text-sky-400 mt-0.5">
              {inspectedMansion.rainfallProbability}%
            </div>
            <span className="text-[10px] opacity-75 block font-serif">
              {inspectedMansion.rainfallLabel}
            </span>
          </div>

          {/* Temperature */}
          <div className="p-2.5 rounded-xl bg-current/5 border border-current/10">
            <span className="text-[10px] opacity-60 flex items-center gap-1 font-serif">
              <Thermometer className="w-3 h-3 text-orange-400" />
              Indeks Suhu Udara:
            </span>
            <div className="text-base font-bold text-orange-400 mt-0.5">
              {inspectedMansion.temperatureIndex}/100
            </div>
            <span className="text-[10px] opacity-75 block font-serif">
              {inspectedMansion.temperatureLabel}
            </span>
          </div>

          {/* Wind */}
          <div className="p-2.5 rounded-xl bg-current/5 border border-current/10">
            <span className="text-[10px] opacity-60 flex items-center gap-1 font-serif">
              <Wind className="w-3 h-3 text-teal-400" />
              Karakter Angin:
            </span>
            <div className="text-xs font-bold text-teal-400 mt-0.5 truncate">
              {inspectedMansion.windDirection.split('(')[0]}
            </div>
            <span className="text-[10px] opacity-75 block font-serif truncate">
              {inspectedMansion.windDirection.split('(')[1]?.replace(')', '') || ''}
            </span>
          </div>

          {/* Element */}
          <div className="p-2.5 rounded-xl bg-current/5 border border-current/10">
            <span className="text-[10px] opacity-60 flex items-center gap-1 font-serif">
              <Sparkles className="w-3 h-3 text-[#c59a43]" />
              Unsur & Musim:
            </span>
            <div className="text-xs font-bold text-[#c59a43] mt-0.5">
              {inspectedMansion.elementLabel.split('(')[0]}
            </div>
            <span className="text-[10px] opacity-75 block font-serif">
              {inspectedMansion.seasonName.split('(')[0]}
            </span>
          </div>
        </div>

        {/* Agricultural & Nautical Indications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-1">
            <div className="font-serif font-bold text-[#c59a43] flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5" />
              Tuntunan Agrikultur & Musim Tanam (*Filāḥah*):
            </div>
            <p className="leading-relaxed opacity-85 font-serif">
              {inspectedMansion.agriculturalIndication}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-1">
            <div className="font-serif font-bold text-sky-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Kondisi Kelautan & Pelayaran (*Nawtiyyah*):
            </div>
            <p className="leading-relaxed opacity-85 font-serif">
              {inspectedMansion.nauticalIndication}
            </p>
          </div>
        </div>

        {/* Classical Arabic Poetry Inscription */}
        <div className="pt-2 border-t border-current/10 text-center space-y-1">
          <div className="text-sm font-serif italic text-[#c59a43]" dir="rtl">
            «{inspectedMansion.poeticVerse}»
          </div>
          <p className="text-[11px] opacity-75 font-serif italic max-w-xl mx-auto">
            "{inspectedMansion.poeticVerseTranslation}"
          </p>
        </div>
      </div>
    </div>
  );
};
