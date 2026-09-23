/**
 * High-fidelity Canvas & SVG Visual Renderer for Classical Islamic Amulets & Wafaq
 * Supports rendering to HTML5 Canvas for crisp download and print,
 * as well as responsive vector display.
 */

import React, { useEffect, useRef } from 'react';
import {
  GeneratedAmuletData,
  SEVEN_TALISMANIC_SIGILS,
  toEasternArabicDigits,
  toAbjadNumerals,
  APP_DEVELOPER_INFO,
} from '../lib/wafaqEngine';

interface AmuletCanvasRendererProps {
  amuletData: GeneratedAmuletData;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width?: number;
  height?: number;
}

export const AmuletCanvasRenderer: React.FC<AmuletCanvasRendererProps> = ({
  amuletData,
  canvasRef,
  width = 1200,
  height = 1250,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      renderAmuletOnCanvas(ctx, amuletData, width, height);
    };

    render();

    // Re-render when web fonts have finished loading to ensure pristine typography
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        render();
      });
    }
  }, [amuletData, canvasRef, width, height]);

  const { theme, manzil, hajat, gridType, numeralStyle, cardinalArchangels, angelicForceArabic } = amuletData;
  const activeGrid = gridType === '3x3' ? amuletData.grid3x3 : amuletData.grid4x4;

  const formatCellValue = (val: number) => {
    if (numeralStyle === 'arabic') return toEasternArabicDigits(val);
    if (numeralStyle === 'abjad') return toAbjadNumerals(val);
    return val.toString();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[580px] mx-auto rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 border-2 select-none"
      style={{
        backgroundColor: theme.bgColor,
        borderColor: theme.primaryBorder,
        boxShadow: `0 24px 50px -10px ${theme.shadowColor}, inset 0 0 60px rgba(0,0,0,0.18)`,
      }}
    >
      {/* Hidden high-res canvas for image exports */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="hidden"
        aria-hidden="true"
      />

      {/* SVG Decorative Layer */}
      <svg
        viewBox="0 0 1000 1100"
        preserveAspectRatio="none"
        className="w-full h-full absolute inset-0 pointer-events-none"
      >
        <defs>
          {/* Radial gold gradient */}
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.goldAccent} stopOpacity="0.22" />
            <stop offset="80%" stopColor={theme.goldAccent} stopOpacity="0.04" />
            <stop offset="100%" stopColor={theme.goldAccent} stopOpacity="0" />
          </radialGradient>

          {/* Border Pattern */}
          <pattern id="islamicGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 40 20 L 20 40 L 0 20 Z"
              fill="none"
              stroke={theme.primaryBorder}
              strokeWidth="0.5"
              strokeOpacity="0.15"
            />
          </pattern>
        </defs>

        {/* Ambient Glow */}
        <circle cx="500" cy="550" r="500" fill="url(#goldGlow)" />
        <rect x="0" y="0" width="1000" height="1100" fill="url(#islamicGrid)" />

        {/* Outer Classical Frame Lines */}
        <rect
          x="18"
          y="18"
          width="964"
          height="1064"
          rx="12"
          fill="none"
          stroke={theme.primaryBorder}
          strokeWidth="3.5"
        />
        <rect
          x="30"
          y="30"
          width="940"
          height="1040"
          rx="8"
          fill="none"
          stroke={theme.secondaryBorder}
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
        <rect
          x="42"
          y="42"
          width="916"
          height="1016"
          rx="6"
          fill="none"
          stroke={theme.primaryBorder}
          strokeWidth="1.2"
        />

        {/* Corner Arabesque Geometric Knots */}
        {[
          [42, 42, 0],
          [958, 42, 90],
          [958, 1058, 180],
          [42, 1058, 270],
        ].map(([cx, cy, rot], i) => (
          <g key={i} transform={`translate(${cx}, ${cy}) rotate(${rot})`}>
            <path
              d="M 0 0 L 45 0 C 35 18 18 35 0 45 Z"
              fill={theme.goldAccent}
              fillOpacity="0.35"
              stroke={theme.primaryBorder}
              strokeWidth="1.5"
            />
            <circle cx="16" cy="16" r="3.5" fill={theme.accentText} />
          </g>
        ))}

        {/* Outer Circular Astrological Celestial Ring */}
        <circle
          cx="500"
          cy="520"
          r="400"
          fill="none"
          stroke={theme.secondaryBorder}
          strokeWidth="1.6"
          strokeDasharray="8 4"
        />
        <circle
          cx="500"
          cy="520"
          r="390"
          fill="none"
          stroke={theme.primaryBorder}
          strokeWidth="1"
        />

        {/* 8-Pointed Star (Khatam Sulaymani) background geometry */}
        <g stroke={theme.goldAccent} strokeWidth="0.8" strokeOpacity="0.2" fill="none">
          <polygon points="500,160 754,265 860,520 754,775 500,880 246,775 140,520 246,265" />
          <polygon points="500,185 738,282 835,520 738,758 500,855 262,758 165,520 262,282" />
        </g>
      </svg>

      {/* Main Interactive HTML Layout */}
      <div className="relative z-10 w-full p-4 sm:p-5 pt-4 sm:pt-5 pb-3 flex flex-col items-center text-center space-y-2">
        {/* TOP: Cardinal Archangel North & Bismillah */}
        <div className="w-full flex flex-col items-center">
          {/* North Archangel */}
          <div
            className="px-3 py-0.5 mb-1 rounded-full text-[10px] sm:text-xs font-serif tracking-wider font-bold shadow-xs border"
            style={{
              backgroundColor: `${theme.primaryBorder}25`,
              color: theme.accentText,
              borderColor: theme.secondaryBorder,
            }}
          >
            شَمَالاً: {cardinalArchangels.north}
          </div>

          {/* Bismillah Header */}
          <h2
            className="font-arabic text-lg sm:text-2xl font-bold tracking-normal leading-tight my-0.5"
            style={{ color: theme.primaryText }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </h2>

          {/* Lunar Mansion & Hajat Ribbon */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap justify-center">
            <span
              className="text-[12px] sm:text-sm font-arabic font-bold"
              style={{ color: theme.accentText }}
            >
              طِلَسْمُ مَنْزِلِ {manzil.arabicName} الفَلَكِيِّ (مَنْزِلٌ #{manzil.number})
            </span>
            <span style={{ color: theme.goldAccent }} className="text-xs">✦</span>
            <span
              className="text-[10px] sm:text-xs font-serif font-semibold tracking-wide"
              style={{ color: theme.primaryText, opacity: 0.9 }}
            >
              {manzil.transliteration} • {manzil.meaningId}
            </span>
          </div>
        </div>

        {/* MID-SECTION: Central Wafaq Magic Square flanked by Archangels East & West */}
        <div className="w-full flex items-center justify-between px-1 my-1">
          {/* East Archangel Cartouche */}
          <div
            className="writing-vertical text-[10px] sm:text-xs font-arabic font-bold py-2 px-1 rounded-md shadow-xs shrink-0 border"
            style={{
              backgroundColor: `${theme.bgColor}`,
              color: theme.accentText,
              borderColor: theme.secondaryBorder,
            }}
          >
            مَشْرِقاً: {cardinalArchangels.east}
          </div>

          {/* Central Magic Square / Wafaq Box */}
          <div className="flex-1 max-w-[290px] sm:max-w-[340px] mx-1 sm:mx-2 flex flex-col items-center">
            {/* The 7 Mystical Talismanic Sigils (Shams al-Ma'arif) */}
            <div
              className="w-full flex justify-center items-center gap-2 sm:gap-3.5 py-1 px-2 mb-1.5 rounded-lg border shadow-inner"
              style={{
                borderColor: `${theme.primaryBorder}40`,
                backgroundColor: `${theme.primaryBorder}18`,
              }}
            >
              {SEVEN_TALISMANIC_SIGILS.map((sig, idx) => (
                <span
                  key={idx}
                  title={`${sig.nameLatin}: ${sig.mysteryMeaning}`}
                  className="font-arabic font-black text-sm sm:text-base cursor-help transition-transform hover:scale-125"
                  style={{ color: theme.sigilColor }}
                >
                  {sig.symbolChar}
                </span>
              ))}
            </div>

            {/* WAFAQ GRID */}
            <div
              className="w-full aspect-square p-2 rounded-xl border-2 relative shadow-lg"
              style={{
                borderColor: theme.primaryBorder,
                backgroundColor: `${theme.bgColor}`,
                boxShadow: `inset 0 0 18px ${theme.shadowColor}`,
              }}
            >
              {/* Corner Ornamental Marks (Baduh: B - D - W - H) */}
              <div
                className="absolute top-1 left-1.5 text-[10px] font-arabic font-bold"
                style={{ color: theme.accentText }}
              >
                ب
              </div>
              <div
                className="absolute top-1 right-1.5 text-[10px] font-arabic font-bold"
                style={{ color: theme.accentText }}
              >
                د
              </div>
              <div
                className="absolute bottom-1 left-1.5 text-[10px] font-arabic font-bold"
                style={{ color: theme.accentText }}
              >
                و
              </div>
              <div
                className="absolute bottom-1 right-1.5 text-[10px] font-arabic font-bold"
                style={{ color: theme.accentText }}
              >
                ح
              </div>

              {/* Grid Cells */}
              <div
                className="w-full h-full grid"
                style={{
                  gridTemplateColumns: `repeat(${activeGrid.grid.length}, minmax(0, 1fr))`,
                  gap: '2px',
                }}
              >
                {activeGrid.grid.map((row, rIdx) =>
                  row.map((cellVal, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className="flex flex-col items-center justify-center rounded border transition-all duration-200 hover:brightness-110 relative p-0.5"
                      style={{
                        borderColor: theme.gridLineColor,
                        backgroundColor:
                          (rIdx + cIdx) % 2 === 0
                            ? `${theme.goldAccent}15`
                            : `${theme.primaryBorder}08`,
                      }}
                    >
                      <span
                        className={`font-arabic font-bold select-none leading-none ${
                          activeGrid.grid.length === 3
                            ? 'text-base sm:text-xl md:text-2xl'
                            : 'text-xs sm:text-base md:text-lg'
                        }`}
                        style={{ color: theme.primaryText }}
                      >
                        {formatCellValue(cellVal)}
                      </span>
                      {/* Secondary tooltip / subtle latin value */}
                      {numeralStyle !== 'latin' && (
                        <span
                          className="text-[8px] font-mono opacity-40 mt-0.5"
                          style={{ color: theme.primaryText }}
                        >
                          {cellVal}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Wafaq Mathematical Balance Badge */}
            <div className="flex items-center justify-between w-full mt-1.5 px-0.5 text-[10px] sm:text-xs">
              <span
                className="font-serif font-semibold"
                style={{ color: theme.primaryText, opacity: 0.9 }}
              >
                Mizan:{' '}
                <strong className="font-mono text-xs font-bold" style={{ color: theme.accentText }}>
                  {activeGrid.targetSum}
                </strong>
              </span>
              <span
                className="font-arabic font-bold px-2 py-0.5 rounded text-[10px]"
                style={{
                  backgroundColor: `${theme.primaryBorder}25`,
                  color: theme.primaryText,
                }}
              >
                {activeGrid.isPerfect ? 'وَفْقٌ تَامٌّ مَوْزُون ✓' : 'وَفْقٌ مُعَدَّل'}
              </span>
            </div>
          </div>

          {/* West Archangel Cartouche */}
          <div
            className="writing-vertical text-[10px] sm:text-xs font-arabic font-bold py-2 px-1 rounded-md shadow-xs shrink-0 border"
            style={{
              backgroundColor: `${theme.bgColor}`,
              color: theme.accentText,
              borderColor: theme.secondaryBorder,
            }}
          >
            مَغْرِباً: {cardinalArchangels.west}
          </div>
        </div>

        {/* BOTTOM: Quranic Ayah, Sacred Asma, & South Archangel */}
        <div className="w-full flex flex-col items-center pt-0.5 space-y-1">
          {/* Quranic Verse */}
          <p
            className="font-arabic text-xs sm:text-sm font-bold max-w-[460px] leading-relaxed my-0.5"
            style={{ color: theme.primaryText }}
          >
            «{amuletData.quranicInscription}»
          </p>

          {/* Asmaul Husna Inscription */}
          <p
            className="font-arabic text-xs sm:text-[13px] font-bold tracking-wide"
            style={{ color: theme.accentText }}
          >
            {amuletData.sacredAsmaText}
          </p>

          {/* South Archangel & Lunar Mansion Khadim */}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap justify-center text-[10px] sm:text-xs">
            <span
              className="font-serif"
              style={{ color: theme.primaryText, opacity: 0.85 }}
            >
              Rūḥānī: <strong>{angelicForceArabic}</strong> ({manzil.angelicForce}) • Huruf:{' '}
              <strong className="font-arabic text-xs font-bold">{manzil.abjadLetter}</strong>
            </span>
            <span style={{ color: theme.goldAccent }}>•</span>
            <div
              className="px-2.5 py-0.5 rounded-full font-serif font-bold shadow-xs border"
              style={{
                backgroundColor: `${theme.primaryBorder}25`,
                color: theme.accentText,
                borderColor: theme.secondaryBorder,
              }}
            >
              جَنُوباً: {cardinalArchangels.south}
            </div>
          </div>

          {/* Classical Colophon / Developer Attribution Footnote */}
          <div
            className="w-full pt-2 mt-2 border-t flex flex-col items-center text-[9px] sm:text-[10px] leading-tight"
            style={{
              borderColor: `${theme.primaryBorder}40`,
              color: theme.primaryText,
              opacity: 0.85,
            }}
          >
            <span className="font-arabic font-semibold">
              مُطَوِّرُ التَّطْبِيقِ: {APP_DEVELOPER_INFO.nameArabic} — {APP_DEVELOPER_INFO.addressArabic}
            </span>
            <span className="font-serif mt-0.5">
              Pengembang: <strong>{APP_DEVELOPER_INFO.name}</strong> • {APP_DEVELOPER_INFO.address} • WA: {APP_DEVELOPER_INFO.phone1} &amp; {APP_DEVELOPER_INFO.phone2}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Render complete high-resolution amulet design to Canvas (1200 x 1250)
 * Ensures high DPI rasterization for crisp printing and image saving.
 */
function renderAmuletOnCanvas(
  ctx: CanvasRenderingContext2D,
  data: GeneratedAmuletData,
  width: number,
  height: number
) {
  const { theme, manzil, hajat, gridType, numeralStyle, cardinalArchangels, angelicForceArabic } = data;
  const activeGrid = gridType === '3x3' ? data.grid3x3 : data.grid4x4;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // 1. Background
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(0, 0, width, height);

  // Subtle Parchment / Aged Vignette
  const radGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.15,
    width / 2,
    height / 2,
    width * 0.72
  );
  radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
  radGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.05)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Borders & Geometric Frames
  const pad = width * 0.04;
  ctx.strokeStyle = theme.primaryBorder;
  ctx.lineWidth = width * 0.005;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  ctx.strokeStyle = theme.secondaryBorder;
  ctx.lineWidth = width * 0.002;
  ctx.strokeRect(pad + 14, pad + 14, width - (pad + 14) * 2, height - (pad + 14) * 2);

  ctx.strokeStyle = theme.primaryBorder;
  ctx.lineWidth = width * 0.0015;
  ctx.strokeRect(pad + 28, pad + 28, width - (pad + 28) * 2, height - (pad + 28) * 2);

  // Concentric Celestial Circles
  const cx = width / 2;
  const cy = height * 0.47;
  ctx.beginPath();
  ctx.arc(cx, cy, width * 0.40, 0, Math.PI * 2);
  ctx.strokeStyle = theme.secondaryBorder;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, width * 0.39, 0, Math.PI * 2);
  ctx.strokeStyle = theme.primaryBorder;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 3. Top Header: Archangel North & Bismillah
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // North Angel Pill
  const northY = pad + 55;
  ctx.font = `bold ${Math.round(width * 0.02)}px "Amiri", "Scheherazade New", "Noto Naskh Arabic", serif`;
  ctx.fillStyle = theme.accentText;
  ctx.fillText(`شَمَالاً: ${cardinalArchangels.north}`, cx, northY);

  // Bismillah
  ctx.font = `bold ${Math.round(width * 0.044)}px "Amiri", "Scheherazade New", "Noto Naskh Arabic", serif`;
  ctx.fillStyle = theme.primaryText;
  ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', cx, northY + 62);

  // Manzil Title & Number (FIXED: clean Arabic interpolation, no #{manzil.number} bug)
  ctx.font = `bold ${Math.round(width * 0.026)}px "Amiri", "Scheherazade New", "Noto Naskh Arabic", serif`;
  ctx.fillStyle = theme.accentText;
  const easternManzilNum = toEasternArabicDigits(manzil.number);
  ctx.fillText(`طِلَسْمُ مَنْزِلِ ${manzil.arabicName} الفَلَكِيِّ (مَنْزِلٌ رَقْم ${easternManzilNum})`, cx, northY + 118);

  ctx.font = `bold ${Math.round(width * 0.016)}px "Cinzel", "Playfair Display", "Georgia", serif`;
  ctx.fillStyle = theme.primaryText;
  ctx.fillText(`${manzil.transliteration.toUpperCase()} (${manzil.meaningId.toUpperCase()}) • ${hajat.titleLatin.toUpperCase()}`, cx, northY + 156);

  // 4. Seven Mystical Symbols
  const sigilY = northY + 205;
  ctx.font = `bold ${Math.round(width * 0.027)}px "Amiri", "Scheherazade New", serif`;
  ctx.fillStyle = theme.sigilColor;
  const sigilSpacing = width * 0.062;
  const sigilStartX = cx - (SEVEN_TALISMANIC_SIGILS.length - 1) * (sigilSpacing / 2);
  SEVEN_TALISMANIC_SIGILS.forEach((sig, idx) => {
    ctx.fillText(sig.symbolChar, sigilStartX + idx * sigilSpacing, sigilY);
  });

  // 5. Central Magic Square Grid
  const gridSize = width * 0.35;
  const gridX = cx - gridSize / 2;
  const gridY = sigilY + 36;
  const N = activeGrid.grid.length;
  const cellSize = gridSize / N;

  // Grid outer frame
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(gridX, gridY, gridSize, gridSize);
  ctx.strokeStyle = theme.primaryBorder;
  ctx.lineWidth = width * 0.0035;
  ctx.strokeRect(gridX, gridY, gridSize, gridSize);

  // Inner lines & cell values
  ctx.lineWidth = width * 0.0018;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const cellLeft = gridX + c * cellSize;
      const cellTop = gridY + r * cellSize;

      // Soft checkerboard fill
      if ((r + c) % 2 === 0) {
        ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
        ctx.fillRect(cellLeft, cellTop, cellSize, cellSize);
      }

      ctx.strokeStyle = theme.gridLineColor;
      ctx.strokeRect(cellLeft, cellTop, cellSize, cellSize);

      // Value
      const cellVal = activeGrid.grid[r][c];
      let strVal = cellVal.toString();
      if (numeralStyle === 'arabic') strVal = toEasternArabicDigits(cellVal);
      if (numeralStyle === 'abjad') strVal = toAbjadNumerals(cellVal);

      ctx.font = `bold ${Math.round(cellSize * 0.42)}px "Amiri", "Scheherazade New", "Noto Naskh Arabic", serif`;
      ctx.fillStyle = theme.primaryText;
      ctx.fillText(strVal, cellLeft + cellSize / 2, cellTop + cellSize / 2);
    }
  }

  // 4 Corner Baduh letters around the Wafaq (ب د و ح)
  ctx.font = `bold ${Math.round(width * 0.016)}px "Amiri", serif`;
  ctx.fillStyle = theme.accentText;
  ctx.fillText('ب', gridX - 16, gridY - 8);
  ctx.fillText('د', gridX + gridSize + 16, gridY - 8);
  ctx.fillText('و', gridX - 16, gridY + gridSize + 8);
  ctx.fillText('ح', gridX + gridSize + 16, gridY + gridSize + 8);

  // 6. Cardinal Archangels East and West (Positioned safely with cartouches)
  const archangelSideY = gridY + gridSize / 2;

  // East Angel (Right)
  ctx.save();
  ctx.translate(width - pad - 42, archangelSideY);
  ctx.rotate(Math.PI / 2);
  ctx.font = `bold ${Math.round(width * 0.02)}px "Amiri", "Scheherazade New", serif`;
  ctx.fillStyle = theme.accentText;
  ctx.fillText(`مَشْرِقاً: ${cardinalArchangels.east}`, 0, 0);
  ctx.restore();

  // West Angel (Left)
  ctx.save();
  ctx.translate(pad + 42, archangelSideY);
  ctx.rotate(-Math.PI / 2);
  ctx.font = `bold ${Math.round(width * 0.02)}px "Amiri", "Scheherazade New", serif`;
  ctx.fillStyle = theme.accentText;
  ctx.fillText(`مَغْرِباً: ${cardinalArchangels.west}`, 0, 0);
  ctx.restore();

  // 7. Bottom Section: Mizan, Quranic Ayah, Asmaul Husna, South Angel
  const bottomY = gridY + gridSize + 32;

  // Mizan Balance
  ctx.font = `bold ${Math.round(width * 0.019)}px "Cinzel", "Playfair Display", serif`;
  ctx.fillStyle = theme.primaryText;
  ctx.fillText(`Mīzān al-Wafaq (Jumlah Baris & Kolom): ${activeGrid.targetSum}  •  وَفْقٌ تَامٌّ مَوْزُون`, cx, bottomY);

  // Quranic Ayah
  ctx.font = `bold ${Math.round(width * 0.024)}px "Amiri", "Scheherazade New", "Noto Naskh Arabic", serif`;
  ctx.fillStyle = theme.primaryText;
  ctx.fillText(`«${data.quranicInscription}»`, cx, bottomY + 44);

  // Asmaul Husna
  ctx.font = `bold ${Math.round(width * 0.024)}px "Amiri", "Scheherazade New", serif`;
  ctx.fillStyle = theme.accentText;
  ctx.fillText(data.sacredAsmaText, cx, bottomY + 86);

  // South Angel & Spiritual Khadim
  ctx.font = `bold ${Math.round(width * 0.02)}px "Amiri", "Scheherazade New", serif`;
  ctx.fillStyle = theme.accentText;
  ctx.fillText(
    `جَنُوباً: ${cardinalArchangels.south}  •  خَادِمُ الفَلَكِ: ${angelicForceArabic} (${manzil.angelicForce})`,
    cx,
    bottomY + 126
  );

  // 8. NEW: Professional Developer & Origin Colophon (Footnote Seal)
  const colophonDividerY = height - pad - 62;
  ctx.strokeStyle = theme.primaryBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad + 60, colophonDividerY);
  ctx.lineTo(width - pad - 60, colophonDividerY);
  ctx.stroke();

  // Arabic Colophon Line
  ctx.font = `bold ${Math.round(width * 0.016)}px "Amiri", "Scheherazade New", serif`;
  ctx.fillStyle = theme.primaryText;
  ctx.fillText(
    `مُطَوِّرُ التَّطْبِيقِ: ${APP_DEVELOPER_INFO.nameArabic} — ${APP_DEVELOPER_INFO.addressArabic}`,
    cx,
    colophonDividerY + 24
  );

  // Latin Colophon & Contact Line
  ctx.font = `${Math.round(width * 0.014)}px "Plus Jakarta Sans", "Cinzel", sans-serif`;
  ctx.fillStyle = theme.primaryText;
  ctx.fillText(
    `Pengembang: ${APP_DEVELOPER_INFO.name} • ${APP_DEVELOPER_INFO.address} • Telp/WA: ${APP_DEVELOPER_INFO.phone1} & ${APP_DEVELOPER_INFO.phone2}`,
    cx,
    colophonDividerY + 44
  );

  ctx.restore();
}
