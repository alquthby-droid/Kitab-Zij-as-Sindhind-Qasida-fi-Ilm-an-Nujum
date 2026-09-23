import React, { useState } from 'react';
import {
  AspectRelation,
  AstrologicalHouse,
  CelestialCoordinate,
  PlanetKey,
  PlanetaryPosition,
  ThemeMode,
} from '../types';
import { PLANETS_INFO, ZODIAC_SIGNS } from '../lib/sindhindEngine';
import { Sparkles, Eye, Info, Compass, ShieldAlert, Award } from 'lucide-react';

interface AstrolabeSphereProps {
  positions: Record<PlanetKey, PlanetaryPosition>;
  ascendant: CelestialCoordinate;
  midheaven: CelestialCoordinate;
  houses: AstrologicalHouse[];
  aspects: AspectRelation[];
  theme: ThemeMode;
  onSelectPlanet?: (planetKey: PlanetKey) => void;
}

export const AstrolabeSphere: React.FC<AstrolabeSphereProps> = ({
  positions,
  ascendant,
  midheaven,
  houses,
  aspects,
  theme,
  onSelectPlanet,
}) => {
  const [selectedPlanetKey, setSelectedPlanetKey] = useState<PlanetKey | null>('sun');
  const [showAspects, setShowAspects] = useState<boolean>(true);
  const [showMansions, setShowMansions] = useState<boolean>(true);
  const [showHouses, setShowHouses] = useState<boolean>(true);

  const isNight = theme === 'night';
  const size = 520;
  const center = size / 2;
  const radius = 230;

  // Degrees to radians (with ascendant at 9 o'clock / 180 degrees in traditional astrology)
  const getAngleRad = (deg: number) => {
    // In traditional astrolabe charts: Ascendant is on the left (180°), Midheaven top (270° or 90°)
    // Let's align Ascendant to left (180 deg)
    const shiftedDeg = (deg - ascendant.totalDegrees + 180 + 360) % 360;
    return (shiftedDeg * Math.PI) / 180;
  };

  const getCoordinates = (deg: number, r: number) => {
    const rad = getAngleRad(deg);
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };

  const selectedPlanet = selectedPlanetKey ? positions[selectedPlanetKey] : null;

  return (
    <div
      id="astrolabe-visualization"
      className={`rounded-2xl border p-5 transition-all ${
        isNight
          ? 'bg-[#101420]/90 border-[#2a3449] text-[#e6ded0]'
          : 'bg-[#faf6ee] border-[#dfd6c3] text-[#2c241c] shadow-sm'
      }`}
    >
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b pb-3 border-current/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
              فلك البروج والكواكب
            </span>
            <h2 className="text-lg font-bold font-serif">
              Visualisasi Falak Astrolab Sindhind
            </h2>
          </div>
          <p className="text-xs opacity-75 mt-0.5">
            Proyeksi posisi geosentris 7 kawkab, simpul naga (Jawzahar), dan 12 rumah astrologi klasik.
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <button
            id="toggle-aspects-btn"
            onClick={() => setShowAspects(!showAspects)}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
              showAspects
                ? 'bg-[#c59a43] text-black border-[#c59a43]'
                : isNight
                ? 'bg-[#171f30] text-[#a0aec0] border-[#2a3449]'
                : 'bg-[#ede5d5] text-[#554b3f] border-[#dfd6c3]'
            }`}
          >
            {showAspects ? '✓ Aspek (Munazarat)' : 'Aspek (Munazarat)'}
          </button>
          <button
            id="toggle-houses-btn"
            onClick={() => setShowHouses(!showHouses)}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
              showHouses
                ? 'bg-[#c59a43] text-black border-[#c59a43]'
                : isNight
                ? 'bg-[#171f30] text-[#a0aec0] border-[#2a3449]'
                : 'bg-[#ede5d5] text-[#554b3f] border-[#dfd6c3]'
            }`}
          >
            {showHouses ? '✓ 12 Rumah (Buyut)' : '12 Rumah'}
          </button>
          <button
            id="toggle-mansions-btn"
            onClick={() => setShowMansions(!showMansions)}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
              showMansions
                ? 'bg-[#c59a43] text-black border-[#c59a43]'
                : isNight
                ? 'bg-[#171f30] text-[#a0aec0] border-[#2a3449]'
                : 'bg-[#ede5d5] text-[#554b3f] border-[#dfd6c3]'
            }`}
          >
            {showMansions ? '✓ 28 Manzil' : '28 Manzil'}
          </button>
        </div>
      </div>

      {/* Main SVG Container & Interactive Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Astrolabe SVG Wheel */}
        <div className="lg:col-span-8 flex justify-center relative select-none">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[480px] h-auto drop-shadow-xl"
          >
            <defs>
              <radialGradient id="brassGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={isNight ? '#161e30' : '#f4eee0'} />
                <stop offset="70%" stopColor={isNight ? '#0e1320' : '#ebe2ce'} />
                <stop offset="100%" stopColor={isNight ? '#090c15' : '#decfae'} />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base Astrolabe Plate */}
            <circle
              cx={center}
              cy={center}
              r={radius + 15}
              fill="url(#brassGlow)"
              stroke={isNight ? '#c59a43' : '#a67c2e'}
              strokeWidth="2.5"
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={isNight ? '#384766' : '#c9bc9f'}
              strokeWidth="1.2"
            />
            <circle
              cx={center}
              cy={center}
              r={radius - 28}
              fill="none"
              stroke={isNight ? '#2e3a53' : '#d8cbaf'}
              strokeWidth="1"
            />
            <circle
              cx={center}
              cy={center}
              r={radius - 50}
              fill="none"
              stroke={isNight ? '#242f44' : '#e4d8bf'}
              strokeWidth="1"
            />
            <circle
              cx={center}
              cy={center}
              r={70}
              fill={isNight ? '#0b0f1a' : '#f7f2e7'}
              stroke={isNight ? '#c59a43' : '#a67c2e'}
              strokeWidth="1.5"
            />

            {/* 12 Zodiac Signs Segments */}
            {ZODIAC_SIGNS.map((sign) => {
              const startDeg = sign.index * 30;
              const midDeg = startDeg + 15;
              const pOuter1 = getCoordinates(startDeg, radius);
              const pInner1 = getCoordinates(startDeg, radius - 28);
              const pLabel = getCoordinates(midDeg, radius - 14);

              return (
                <g key={`sign-seg-${sign.index}`}>
                  <line
                    x1={pOuter1.x}
                    y1={pOuter1.y}
                    x2={pInner1.x}
                    y2={pInner1.y}
                    stroke={isNight ? '#4a5b7d' : '#beaf91'}
                    strokeWidth="1.5"
                  />
                  {/* Sign Symbol & Name */}
                  <text
                    x={pLabel.x}
                    y={pLabel.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isNight ? '#f3ede2' : '#2d2419'}
                    fontSize="11"
                    fontWeight="bold"
                    className="font-serif cursor-default"
                  >
                    {sign.symbol}
                  </text>
                </g>
              );
            })}

            {/* 28 Lunar Mansions ring */}
            {showMansions &&
              Array.from({ length: 28 }).map((_, i) => {
                const deg = (i * 360) / 28;
                const p1 = getCoordinates(deg, radius - 28);
                const p2 = getCoordinates(deg, radius - 50);
                const pText = getCoordinates(deg + 360 / 56, radius - 39);

                return (
                  <g key={`mansion-seg-${i}`}>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={isNight ? '#1e293b' : '#ddd1b8'}
                      strokeWidth="0.8"
                    />
                    <text
                      x={pText.x}
                      y={pText.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isNight ? '#94a3b8' : '#7b6d5c'}
                      fontSize="6.5"
                      fontFamily="Amiri, serif"
                    >
                      {i + 1}
                    </text>
                  </g>
                );
              })}

            {/* 12 Astrological Houses (Buyut) Radial Lines */}
            {showHouses &&
              houses.map((house) => {
                const pCenter = getCoordinates(house.cuspDegree, 70);
                const pEdge = getCoordinates(house.cuspDegree, radius - 50);
                const isAxis = house.number === 1 || house.number === 4 || house.number === 7 || house.number === 10;

                return (
                  <g key={`house-line-${house.number}`}>
                    <line
                      x1={pCenter.x}
                      y1={pCenter.y}
                      x2={pEdge.x}
                      y2={pEdge.y}
                      stroke={
                        isAxis
                          ? isNight
                            ? '#c59a43'
                            : '#996515'
                          : isNight
                          ? '#2a374e'
                          : '#e0d3bc'
                      }
                      strokeWidth={isAxis ? '1.8' : '0.8'}
                      strokeDasharray={isAxis ? 'none' : '3,2'}
                    />
                  </g>
                );
              })}

            {/* Aspect Lines across center */}
            {showAspects &&
              aspects.map((asp, idx) => {
                const posA = positions[asp.planetA];
                const posB = positions[asp.planetB];
                if (!posA || !posB) return null;

                const pA = getCoordinates(posA.trueLongitude, 65);
                const pB = getCoordinates(posB.trueLongitude, 65);

                const strokeColor =
                  asp.aspectType === 'tathlith' || asp.aspectType === 'tasdis'
                    ? isNight
                      ? 'rgba(56, 189, 248, 0.45)'
                      : 'rgba(2, 132, 199, 0.5)'
                    : asp.aspectType === 'tarbi' || asp.aspectType === 'muqabalah'
                    ? isNight
                      ? 'rgba(239, 68, 68, 0.45)'
                      : 'rgba(220, 38, 38, 0.5)'
                    : isNight
                    ? 'rgba(234, 179, 8, 0.5)'
                    : 'rgba(202, 138, 4, 0.55)';

                return (
                  <line
                    key={`aspect-line-${idx}`}
                    x1={pA.x}
                    y1={pA.y}
                    x2={pB.x}
                    y2={pB.y}
                    stroke={strokeColor}
                    strokeWidth="1.2"
                    strokeDasharray={asp.aspectType === 'tasdis' ? '2,2' : 'none'}
                  />
                );
              })}

            {/* Center Astrolabe Boss / Earth / Horizon */}
            <circle
              cx={center}
              cy={center}
              r="24"
              fill={isNight ? '#141c2c' : '#efe8d7'}
              stroke={isNight ? '#c59a43' : '#a67c2e'}
              strokeWidth="2"
            />
            {/* Horizon (Mashriq/Maghrib) indicator */}
            <line
              x1={center - radius + 15}
              y1={center}
              x2={center - 30}
              y2={center}
              stroke="#c59a43"
              strokeWidth="2.5"
            />
            <text
              x={center - 40}
              y={center - 6}
              textAnchor="middle"
              fill="#c59a43"
              fontSize="9"
              fontWeight="bold"
              className="font-serif"
            >
              طالع
            </text>

            {/* Midheaven indicator */}
            <line
              x1={center}
              y1={center - radius + 15}
              x2={center}
              y2={center - 30}
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeDasharray="2,2"
            />
            <text
              x={center + 12}
              y={center - 40}
              textAnchor="start"
              fill="#38bdf8"
              fontSize="8"
              fontWeight="bold"
            >
              MC
            </text>

            {/* Planetary Pointers (al-Kawakib) */}
            {(Object.keys(positions) as PlanetKey[]).map((key) => {
              const pos = positions[key];
              const p = getCoordinates(pos.trueLongitude, radius - 80);
              const isSelected = selectedPlanetKey === key;

              return (
                <g
                  key={`planet-ptr-${key}`}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => {
                    setSelectedPlanetKey(key);
                    if (onSelectPlanet) onSelectPlanet(key);
                  }}
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="16"
                      fill="none"
                      stroke="#c59a43"
                      strokeWidth="2"
                      strokeDasharray="3,2"
                      className="animate-spin"
                      style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                    />
                  )}

                  {/* Planet Disc */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="11"
                    fill={pos.planet.color}
                    stroke={isNight ? '#0b0f1a' : '#ffffff'}
                    strokeWidth="1.5"
                    filter="url(#glow)"
                  />

                  {/* Planet Symbol */}
                  <text
                    x={p.x}
                    y={p.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#000000"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {pos.planet.symbol}
                  </text>

                  {/* Retrograde Marker */}
                  {pos.isRetrograde && (
                    <text
                      x={p.x + 9}
                      y={p.y - 7}
                      fill="#ef4444"
                      fontSize="7.5"
                      fontWeight="bold"
                    >
                      ℞
                    </text>
                  )}

                  {/* Combustion Indicator */}
                  {pos.isCombust && (
                    <circle
                      cx={p.x - 7}
                      cy={p.y - 7}
                      r="2.5"
                      fill="#f97316"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Planet Details Panel */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {selectedPlanet ? (
            <div
              className={`rounded-xl p-4 border transition-all ${
                isNight
                  ? 'bg-[#141b2a] border-[#2e3b55]'
                  : 'bg-[#f4efe3] border-[#ded4bf]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-black shadow-sm"
                      style={{ backgroundColor: selectedPlanet.planet.color }}
                    >
                      {selectedPlanet.planet.symbol}
                    </span>
                    <div>
                      <h3 className="font-bold text-base leading-tight font-serif">
                        {selectedPlanet.planet.transliteration}
                      </h3>
                      <p className="text-xs font-serif opacity-80" dir="rtl">
                        {selectedPlanet.planet.arabicName}
                      </p>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] px-2 py-0.5 rounded font-mono font-medium bg-[#c59a43]/15 text-[#c59a43] border border-[#c59a43]/30">
                  Rumah #{selectedPlanet.houseNumber}
                </span>
              </div>

              {/* Coordinates Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-current/10 text-xs">
                <div>
                  <span className="opacity-70 block text-[10px]">Bujur Zodiak:</span>
                  <span className="font-semibold text-sm font-mono">
                    {selectedPlanet.coordinate.signDegree}°{' '}
                    {selectedPlanet.coordinate.signDegreeMinutes}'{' '}
                    {ZODIAC_SIGNS[selectedPlanet.coordinate.signIndex].latinName}
                  </span>
                </div>
                <div>
                  <span className="opacity-70 block text-[10px]">Total Derajat:</span>
                  <span className="font-mono text-sm">
                    {Math.round(selectedPlanet.trueLongitude * 100) / 100}°
                  </span>
                </div>
              </div>

              {/* Status & Dignities */}
              <div className="mt-3 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="opacity-75 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#c59a43]" />
                    Martabat (Dignitas):
                  </span>
                  <span className="font-medium text-right text-[11px] max-w-[170px] truncate">
                    {selectedPlanet.dignity.description}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="opacity-75 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
                    Manzil Rembulan:
                  </span>
                  <span className="font-serif text-[11px]">
                    {selectedPlanet.lunarMansion.transliteration} (#{selectedPlanet.lunarMansion.number})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="opacity-75">Penguasa Term (Hadd):</span>
                  <span className="font-mono text-[11px]">{selectedPlanet.termRuler}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="opacity-75">Penguasa Decan (Wajh):</span>
                  <span className="font-mono text-[11px]">{selectedPlanet.decanRuler}</span>
                </div>

                {selectedPlanet.isCombust && (
                  <div className="mt-1 flex items-center gap-1.5 p-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>احتراق (Combust): Terbakar dalam sinar matahari</span>
                  </div>
                )}

                {selectedPlanet.isRetrograde && (
                  <div className="mt-1 flex items-center gap-1.5 p-1.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[11px]">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>رجوع (Retrograde): Gerak mundur semu dalam falak</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-6 border rounded-xl opacity-60 text-xs">
              Klik salah satu kawkab pada astrolab untuk menginspeksi rincian koordinat dan martabat falak.
            </div>
          )}

          {/* Quick Overview of Ascendant & Midheaven */}
          <div
            className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
              isNight
                ? 'bg-[#101522] border-[#263147]'
                : 'bg-[#f7f2e6] border-[#dfd6c3]'
            }`}
          >
            <div className="flex items-center justify-between font-serif">
              <span className="flex items-center gap-1 text-[#c59a43] font-semibold">
                <Sparkles className="w-3 h-3" />
                الطالع (Ascendant):
              </span>
              <span className="font-mono font-medium">
                {ascendant.signDegree}° {ascendant.signDegreeMinutes}'{' '}
                {ZODIAC_SIGNS[ascendant.signIndex].arabicName} ({ZODIAC_SIGNS[ascendant.signIndex].latinName})
              </span>
            </div>
            <div className="flex items-center justify-between font-serif">
              <span className="text-[#38bdf8] font-semibold">
                وسط السماء (Midheaven):
              </span>
              <span className="font-mono font-medium">
                {midheaven.signDegree}° {midheaven.signDegreeMinutes}'{' '}
                {ZODIAC_SIGNS[midheaven.signIndex].latinName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
