import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Sparkles,
  Layers,
  Crosshair,
  Gauge,
} from 'lucide-react';
import {
  GeneratedAmuletData,
  SEVEN_TALISMANIC_SIGILS,
  toEasternArabicDigits,
  toAbjadNumerals,
} from '../lib/wafaqEngine';

export type EtchingMaterial = 'parchment' | 'gold' | 'stone';

interface MaterialConfig {
  id: EtchingMaterial;
  label: string;
  arabicLabel: string;
  toolName: string;
  baseBg: string;
  groovePrimary: string;
  grooveSecondary: string;
  grooveHighlight: string;
  glowColor: string;
  particleColors: string[];
  textColor: string;
  accentColor: string;
}

const MATERIAL_CONFIGS: Record<EtchingMaterial, MaterialConfig> = {
  parchment: {
    id: 'parchment',
    label: 'Perkamen Za\'faran',
    arabicLabel: 'قِرْطَاسُ الزَّعْفَرَان',
    toolName: 'Kalam Bambu & Tinta Za\'faran',
    baseBg: '#f3e7cd',
    groovePrimary: '#7c2d12',
    grooveSecondary: '#b45309',
    grooveHighlight: 'rgba(217, 119, 6, 0.32)',
    glowColor: 'rgba(194, 65, 12, 0.65)',
    particleColors: ['#c2410c', '#d97706', '#9a3412', '#f59e0b'],
    textColor: '#2c1810',
    accentColor: '#9a3412',
  },
  gold: {
    id: 'gold',
    label: 'Lempeng Emas',
    arabicLabel: 'لَوْحُ الذَّهَب',
    toolName: 'Jarum Ukir Intaglio (Minqāsh)',
    baseBg: '#c99e32',
    groovePrimary: '#4a3006',
    grooveSecondary: '#78510d',
    grooveHighlight: '#fff6c5',
    glowColor: 'rgba(255, 243, 176, 0.9)',
    particleColors: ['#fffbeb', '#fde047', '#f59e0b', '#ffffff'],
    textColor: '#362103',
    accentColor: '#5c3a08',
  },
  stone: {
    id: 'stone',
    label: 'Batu Alam (Akik Hitam)',
    arabicLabel: 'حَجَرُ العَقِيقِ الأَسْوَد',
    toolName: 'Pahat Baja & Serbuk Intan',
    baseBg: '#1c2026',
    groovePrimary: '#e2e8f0',
    grooveSecondary: '#94a3b8',
    grooveHighlight: 'rgba(255, 255, 255, 0.78)',
    glowColor: 'rgba(226, 232, 240, 0.85)',
    particleColors: ['#f8fafc', '#cbd5e1', '#fbbf24', '#94a3b8'],
    textColor: '#e2e8f0',
    accentColor: '#eab308',
  },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface OrderedCell {
  row: number;
  col: number;
  value: number;
  formatted: string;
  orderIndex: number; // 0 .. N*N - 1
}

export interface RulerPositionSnapshot {
  planetName: string;
  zodiacName: string;
  degreeFormatted: string;
  isRetrograde?: boolean;
  dignity?: string;
}

interface WafaqEtchingVisualizerProps {
  amuletData: GeneratedAmuletData;
  rulerSnapshot?: RulerPositionSnapshot | null;
}

const CANVAS_SIZE = 960;

/**
 * Deterministic pseudo-random helper for repeatable procedural textures
 */
function seededNoise(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Build offscreen cached substrate texture for fast 60fps canvas animation
 */
function buildSubstrateTexture(material: EtchingMaterial, size: number): HTMLCanvasElement {
  const offscreen = document.createElement('canvas');
  offscreen.width = size;
  offscreen.height = size;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return offscreen;

  const rand = seededNoise(material === 'parchment' ? 101 : material === 'gold' ? 202 : 303);

  if (material === 'parchment') {
    // Warm aged vellum gradient
    const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.72);
    grad.addColorStop(0, '#fbf3e0');
    grad.addColorStop(0.65, '#f1e1bf');
    grad.addColorStop(1, '#d8be90');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Subtle organic parchment fibers & tea-stain blotches
    for (let i = 0; i < 45; i++) {
      const bx = rand() * size;
      const by = rand() * size;
      const br = 20 + rand() * 80;
      const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      bGrad.addColorStop(0, 'rgba(138, 98, 37, 0.045)');
      bGrad.addColorStop(1, 'rgba(138, 98, 37, 0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(120, 82, 32, 0.055)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 380; i++) {
      const x1 = rand() * size;
      const y1 = rand() * size;
      const angle = rand() * Math.PI * 2;
      const len = 4 + rand() * 14;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + Math.cos(angle) * len, y1 + Math.sin(angle) * len);
      ctx.stroke();
    }
  } else if (material === 'gold') {
    // Brushed metallic gold foil gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#b5841d');
    grad.addColorStop(0.28, '#e8c45a');
    grad.addColorStop(0.5, '#f7df8d');
    grad.addColorStop(0.72, '#cfa034');
    grad.addColorStop(1, '#9c6e14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Anisotropic fine horizontal metallic brush strokes
    for (let i = 0; i < 650; i++) {
      const y = rand() * size;
      const x = rand() * size * 0.6;
      const w = 60 + rand() * 280;
      ctx.strokeStyle = rand() > 0.5 ? 'rgba(255, 250, 210, 0.09)' : 'rgba(92, 58, 8, 0.07)';
      ctx.lineWidth = 0.7 + rand() * 1.1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();
    }

    // Metallic bevel rim vignette
    const vig = ctx.createRadialGradient(size / 2, size / 2, size * 0.25, size / 2, size / 2, size * 0.75);
    vig.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    vig.addColorStop(1, 'rgba(66, 40, 2, 0.35)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, size, size);
  } else {
    // Dark carved basalt / obsidian onyx stone
    const grad = ctx.createRadialGradient(size * 0.45, size * 0.42, size * 0.08, size / 2, size / 2, size * 0.75);
    grad.addColorStop(0, '#2a303b');
    grad.addColorStop(0.6, '#1b2028');
    grad.addColorStop(1, '#0e1116');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Mineral speckles
    for (let i = 0; i < 1400; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 0.5 + rand() * 1.3;
      ctx.fillStyle = rand() > 0.5 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.16)';
      ctx.fillRect(x, y, r, r);
    }

    // Subtle stone quartz veins
    for (let v = 0; v < 6; v++) {
      ctx.beginPath();
      let vx = rand() * size;
      let vy = rand() * size;
      ctx.moveTo(vx, vy);
      for (let s = 0; s < 14; s++) {
        vx += (rand() - 0.35) * 90;
        vy += (rand() - 0.35) * 90;
        ctx.lineTo(vx, vy);
      }
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.05)';
      ctx.lineWidth = 1 + rand() * 1.5;
      ctx.stroke();
    }
  }

  return offscreen;
}

/**
 * Draw partial rectangle perimeter based on t in [0, 1] and return active tip coordinates
 */
function strokePartialRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number
): { x: number; y: number } | null {
  if (t <= 0) return null;
  const clamped = Math.min(1, t);
  const totalLen = 2 * (w + h);
  let rem = clamped * totalLen;

  ctx.beginPath();
  ctx.moveTo(x, y);

  let tipX = x;
  let tipY = y;

  // Top edge
  const topDraw = Math.min(rem, w);
  tipX = x + topDraw;
  tipY = y;
  ctx.lineTo(tipX, tipY);
  rem -= topDraw;

  // Right edge
  if (rem > 0) {
    const rightDraw = Math.min(rem, h);
    tipX = x + w;
    tipY = y + rightDraw;
    ctx.lineTo(tipX, tipY);
    rem -= rightDraw;
  }

  // Bottom edge
  if (rem > 0) {
    const botDraw = Math.min(rem, w);
    tipX = x + w - botDraw;
    tipY = y + h;
    ctx.lineTo(tipX, tipY);
    rem -= botDraw;
  }

  // Left edge
  if (rem > 0) {
    const leftDraw = Math.min(rem, h);
    tipX = x;
    tipY = y + h - leftDraw;
    ctx.lineTo(tipX, tipY);
  }

  ctx.stroke();
  return clamped < 1 ? { x: tipX, y: tipY } : null;
}

export const WafaqEtchingVisualizer: React.FC<WafaqEtchingVisualizerProps> = ({
  amuletData,
  rulerSnapshot,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const progressRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const lastSparkStepRef = useRef<number>(-1);

  const [material, setMaterial] = useState<EtchingMaterial>('gold');
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return true;
  });
  const [speed, setSpeed] = useState<number>(1);
  const [progress, setProgress] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 1;
    }
    return 0;
  });
  const [hoveredCell, setHoveredCell] = useState<OrderedCell | null>(null);

  const activeGrid = amuletData.gridType === '3x3' ? amuletData.grid3x3 : amuletData.grid4x4;
  const N = activeGrid.grid.length;
  const { inkColor, inkColorId, calligraphyStyle } = amuletData;

  const activeMatCfg = useMemo<MaterialConfig>(() => {
    const base = MATERIAL_CONFIGS[material];
    if (inkColorId === 'theme_default') {
      return base;
    }
    return {
      ...base,
      groovePrimary: inkColor.primaryHex,
      grooveSecondary: inkColor.secondaryHex,
      glowColor: inkColor.glowRgba,
      particleColors: inkColor.particleColors,
      textColor: inkColor.primaryHex,
      accentColor: inkColor.secondaryHex,
    };
  }, [material, inkColorId, inkColor]);

  const makeArabicFont = useCallback(
    (basePx: number) => {
      const scaled = Math.round(basePx * calligraphyStyle.scaleFactor);
      const stylePrefix = calligraphyStyle.fontStyle === 'italic' ? 'italic ' : '';
      return `${stylePrefix}${calligraphyStyle.fontWeight} ${scaled}px ${calligraphyStyle.fontFamily}`;
    },
    [calligraphyStyle]
  );

  const formatCellVal = useCallback(
    (val: number) => {
      if (amuletData.numeralStyle === 'arabic') return toEasternArabicDigits(val);
      if (amuletData.numeralStyle === 'abjad') return toAbjadNumerals(val);
      return val.toString();
    },
    [amuletData.numeralStyle]
  );

  // Classical ascending insertion sequence (lowest numeric value -> highest)
  const orderedCells = useMemo<OrderedCell[]>(() => {
    const cells: Omit<OrderedCell, 'orderIndex'>[] = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const val = activeGrid.grid[r][c];
        cells.push({
          row: r,
          col: c,
          value: val,
          formatted: formatCellVal(val),
        });
      }
    }
    cells.sort((a, b) => a.value - b.value);
    return cells.map((cell, idx) => ({ ...cell, orderIndex: idx }));
  }, [activeGrid.grid, N, formatCellVal]);

  // Offscreen cached substrate textures
  const substrateTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    return buildSubstrateTexture(material, CANVAS_SIZE);
  }, [material]);

  // Reset animation cleanly when Wafaq configuration changes
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startVal = prefersReduced ? 1 : 0;
    progressRef.current = startVal;
    setProgress(startVal);
    particlesRef.current = [];
    lastSparkStepRef.current = -1;
    if (!prefersReduced) {
      setIsPlaying(true);
    }
  }, [
    amuletData.manzil.number,
    amuletData.gridType,
    amuletData.totalTargetJumal,
    amuletData.numeralStyle,
    amuletData.hajat.id,
    inkColorId,
    inkColor.primaryHex,
    calligraphyStyle.id,
  ]);

  // Spawn sparks at (x, y)
  const spawnSparks = useCallback(
    (x: number, y: number, count: number, mat: EtchingMaterial) => {
      const cfg = activeMatCfg;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const vel = mat === 'parchment' ? 0.4 + Math.random() * 1.4 : 1.1 + Math.random() * 3.4;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * vel,
          vy: Math.sin(angle) * vel - (mat === 'parchment' ? 0.2 : 0.8),
          life: 0,
          maxLife: 18 + Math.random() * 22,
          size: mat === 'parchment' ? 1.8 + Math.random() * 2.2 : 1.3 + Math.random() * 2.4,
          color: cfg.particleColors[Math.floor(Math.random() * cfg.particleColors.length)],
        });
      }
      if (particlesRef.current.length > 180) {
        particlesRef.current.splice(0, particlesRef.current.length - 180);
      }
    },
    [activeMatCfg]
  );

  // Geometry constants
  const cx = CANVAS_SIZE / 2;
  const pad = 42;
  const gridSize = 354;
  const gridX = cx - gridSize / 2;
  const gridY = 278;
  const cellSize = gridSize / N;

  // Draw frame at current progressRef
  const drawFrame = useCallback(
    (p: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const matCfg = activeMatCfg;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // 1. Substrate Texture
      if (substrateTexture) {
        ctx.drawImage(substrateTexture, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      } else {
        ctx.fillStyle = matCfg.baseBg;
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }

      // Helper to apply carved groove/ink style
      const setEtchStyle = (lineWidth: number, isSecondary = false) => {
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = isSecondary ? matCfg.grooveSecondary : matCfg.groovePrimary;
        if (material === 'gold' || material === 'stone') {
          ctx.shadowColor = matCfg.grooveHighlight;
          ctx.shadowBlur = 1.5;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 1.5;
        } else {
          ctx.shadowColor = 'rgba(154, 52, 18, 0.14)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
      };

      let activeTip: { x: number; y: number } | null = null;

      // STAGE 1: Outer Frame & Celestial Ring (0.00 -> 0.22)
      const frameOuterT = Math.min(1, Math.max(0, p / 0.10));
      if (frameOuterT > 0) {
        ctx.save();
        setEtchStyle(4.5);
        const tip = strokePartialRect(ctx, pad, pad, CANVAS_SIZE - pad * 2, CANVAS_SIZE - pad * 2, frameOuterT);
        if (tip) activeTip = tip;
        ctx.restore();
      }

      const frameInnerT = Math.min(1, Math.max(0, (p - 0.06) / 0.08));
      if (frameInnerT > 0) {
        ctx.save();
        setEtchStyle(2, true);
        const tip = strokePartialRect(
          ctx,
          pad + 14,
          pad + 14,
          CANVAS_SIZE - (pad + 14) * 2,
          CANVAS_SIZE - (pad + 14) * 2,
          frameInnerT
        );
        if (tip && !activeTip) activeTip = tip;
        ctx.restore();
      }

      const ringT = Math.min(1, Math.max(0, (p - 0.11) / 0.11));
      if (ringT > 0) {
        const ringCy = gridY + gridSize / 2;
        const ringR = 315;
        const startAng = -Math.PI / 2;
        const endAng = startAng + ringT * Math.PI * 2;
        ctx.save();
        setEtchStyle(2.2, true);
        ctx.beginPath();
        ctx.arc(cx, ringCy, ringR, startAng, endAng);
        ctx.stroke();
        if (ringT < 1) {
          activeTip = {
            x: cx + Math.cos(endAng) * ringR,
            y: ringCy + Math.sin(endAng) * ringR,
          };
        }
        ctx.restore();
      }

      // STAGE 2: Wafaq Grid Frame & Internal Divisions (0.22 -> 0.38)
      const gridBoxT = Math.min(1, Math.max(0, (p - 0.22) / 0.06));
      if (gridBoxT > 0) {
        ctx.save();
        setEtchStyle(4);
        const tip = strokePartialRect(ctx, gridX, gridY, gridSize, gridSize, gridBoxT);
        if (tip) activeTip = tip;
        ctx.restore();
      }

      const totalInternalLines = (N - 1) * 2;
      const linesStageT = Math.min(1, Math.max(0, (p - 0.28) / 0.10));
      if (linesStageT > 0) {
        ctx.save();
        setEtchStyle(2.4);
        for (let i = 0; i < totalInternalLines; i++) {
          const lineStart = i / totalInternalLines;
          const lineSpan = 1 / totalInternalLines;
          const lt = Math.min(1, Math.max(0, (linesStageT - lineStart) / lineSpan));
          if (lt <= 0) continue;

          if (i < N - 1) {
            // Vertical line
            const lx = gridX + (i + 1) * cellSize;
            const ly1 = gridY;
            const ly2 = gridY + gridSize * lt;
            ctx.beginPath();
            ctx.moveTo(lx, ly1);
            ctx.lineTo(lx, ly2);
            ctx.stroke();
            if (lt < 1) activeTip = { x: lx, y: ly2 };
          } else {
            // Horizontal line
            const rowIdx = i - (N - 1);
            const ly = gridY + (rowIdx + 1) * cellSize;
            const lx1 = gridX;
            const lx2 = gridX + gridSize * lt;
            ctx.beginPath();
            ctx.moveTo(lx1, ly);
            ctx.lineTo(lx2, ly);
            ctx.stroke();
            if (lt < 1) activeTip = { x: lx2, y: ly };
          }
        }
        ctx.restore();
      }

      // STAGE 3: 7 Talismanic Sigils & 4 Corner Baduh Keys (0.38 -> 0.50)
      const sigilStageT = Math.min(1, Math.max(0, (p - 0.38) / 0.08));
      if (sigilStageT > 0) {
        const sigilY = gridY - 34;
        const sigilSpacing = 50;
        const startX = cx - ((SEVEN_TALISMANIC_SIGILS.length - 1) * sigilSpacing) / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = makeArabicFont(26);

        SEVEN_TALISMANIC_SIGILS.forEach((sig, idx) => {
          const st = Math.min(1, Math.max(0, (sigilStageT * SEVEN_TALISMANIC_SIGILS.length) - idx));
          if (st <= 0) return;
          const sx = startX + idx * sigilSpacing;
          ctx.globalAlpha = st;
          if (material === 'gold' || material === 'stone') {
            ctx.shadowColor = matCfg.grooveHighlight;
            ctx.shadowOffsetY = 1.5;
          }
          ctx.fillStyle = matCfg.groovePrimary;
          ctx.fillText(sig.symbolChar, sx, sigilY);
          if (st > 0 && st < 1) {
            activeTip = { x: sx, y: sigilY };
          }
        });
        ctx.restore();
      }

      const baduhStageT = Math.min(1, Math.max(0, (p - 0.46) / 0.04));
      if (baduhStageT > 0) {
        const corners = [
          { ch: 'ب', x: gridX - 18, y: gridY - 10 },
          { ch: 'د', x: gridX + gridSize + 18, y: gridY - 10 },
          { ch: 'و', x: gridX - 18, y: gridY + gridSize + 12 },
          { ch: 'ح', x: gridX + gridSize + 18, y: gridY + gridSize + 12 },
        ];
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = makeArabicFont(20);
        corners.forEach((corner, idx) => {
          const ct = Math.min(1, Math.max(0, baduhStageT * 4 - idx));
          if (ct <= 0) return;
          ctx.globalAlpha = ct;
          ctx.fillStyle = matCfg.accentColor;
          ctx.fillText(corner.ch, corner.x, corner.y);
          if (ct < 1) activeTip = { x: corner.x, y: corner.y };
        });
        ctx.restore();
      }

      // STAGE 4: Classical Ascending Cell Etching (0.50 -> 0.86)
      const cellsStageT = Math.min(1, Math.max(0, (p - 0.50) / 0.36));
      const totalCells = orderedCells.length;
      if (cellsStageT > 0) {
        orderedCells.forEach((cell) => {
          const cLeft = gridX + cell.col * cellSize;
          const cTop = gridY + cell.row * cellSize;
          const cellCenterX = cLeft + cellSize / 2;
          const cellCenterY = cTop + cellSize / 2;

          const cStart = cell.orderIndex / totalCells;
          const cSpan = 1 / totalCells;
          const ct = Math.min(1, Math.max(0, (cellsStageT - cStart) / cSpan));
          const isHovered = hoveredCell && hoveredCell.row === cell.row && hoveredCell.col === cell.col;

          // Subtle active highlight or hovered probe
          if ((ct > 0 && ct < 1) || isHovered) {
            ctx.save();
            ctx.fillStyle = isHovered ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.14)';
            ctx.fillRect(cLeft + 3, cTop + 3, cellSize - 6, cellSize - 6);
            ctx.restore();
          }

          if (ct <= 0) return;

          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const fontSize = N === 3 ? 44 : 32;
          ctx.font = amuletData.numeralStyle === 'latin'
            ? `bold ${fontSize}px "Cinzel", "Plus Jakarta Sans", serif`
            : makeArabicFont(fontSize);

          const scale = 0.82 + 0.18 * ct;
          ctx.translate(cellCenterX, cellCenterY);
          ctx.scale(scale, scale);
          ctx.globalAlpha = Math.min(1, ct * 1.15);

          if (material === 'gold' || material === 'stone') {
            ctx.shadowColor = matCfg.grooveHighlight;
            ctx.shadowBlur = 1.5;
            ctx.shadowOffsetY = 1.6;
          }
          ctx.fillStyle = matCfg.groovePrimary;
          ctx.fillText(cell.formatted, 0, -2);

          // Tiny order badge in corner when hovered or etching
          if (isHovered || (ct > 0 && ct < 1)) {
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            ctx.font = 'bold 11px "JetBrains Mono", monospace';
            ctx.fillStyle = matCfg.accentColor;
            ctx.fillText(`#${cell.orderIndex + 1}`, -cellSize / 2 + 16, -cellSize / 2 + 14);
          }

          ctx.restore();

          if (ct > 0 && ct < 1) {
            activeTip = { x: cellCenterX, y: cellCenterY };
            if (lastSparkStepRef.current !== cell.orderIndex && isPlaying) {
              lastSparkStepRef.current = cell.orderIndex;
              spawnSparks(cellCenterX, cellCenterY, 10, material);
            }
          }
        });
      }

      // STAGE 5: Sacred Inscriptions, Manzil & Planetary Ruler Seal (0.86 -> 1.00)
      const textStageT = Math.min(1, Math.max(0, (p - 0.86) / 0.14));
      if (textStageT > 0) {
        ctx.save();
        ctx.globalAlpha = textStageT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (material === 'gold' || material === 'stone') {
          ctx.shadowColor = matCfg.grooveHighlight;
          ctx.shadowOffsetY = 1.2;
        }

        // Top Bismillah & Manzil
        ctx.fillStyle = matCfg.textColor;
        ctx.font = makeArabicFont(32);
        ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', cx, 108);

        ctx.fillStyle = matCfg.accentColor;
        ctx.font = makeArabicFont(21);
        ctx.fillText(
          `طِلَسْمُ مَنْزِلِ ${amuletData.manzil.arabicName} • ${amuletData.manzil.transliteration}`,
          cx,
          156
        );

        ctx.fillStyle = matCfg.textColor;
        ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
        const rulerLabel = rulerSnapshot
          ? `Penguasa: ${amuletData.manzil.spiritualRuler} (${rulerSnapshot.zodiacName} ${rulerSnapshot.degreeFormatted}${rulerSnapshot.isRetrograde ? ' ℞' : ''})`
          : `Penguasa Planet: ${amuletData.manzil.spiritualRuler}`;
        ctx.fillText(rulerLabel, cx, 192);

        // Bottom Mizan, Ayah & Asma
        const botY = gridY + gridSize + 44;
        ctx.fillStyle = matCfg.accentColor;
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText(
          `MĪZĀN AL-WAFAQ: ${activeGrid.targetSum}  •  ${amuletData.manzil.elementLabel.toUpperCase()}`,
          cx,
          botY
        );

        ctx.fillStyle = matCfg.textColor;
        ctx.font = makeArabicFont(20);
        ctx.fillText(`«${amuletData.quranicInscription}»`, cx, botY + 46);

        ctx.fillStyle = matCfg.accentColor;
        ctx.font = makeArabicFont(19);
        ctx.fillText(amuletData.sacredAsmaText, cx, botY + 86);

        ctx.fillStyle = matCfg.textColor;
        ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(
          `Khādim: ${amuletData.angelicForceArabic} (${amuletData.manzil.angelicForce})`,
          cx,
          botY + 124
        );

        ctx.restore();
      }

      // Draw active stylus / chisel glow & sparks
      if (activeTip && p < 0.99) {
        if (isPlaying && Math.random() < 0.45) {
          spawnSparks(activeTip.x, activeTip.y, 2, material);
        }

        // Glow aura at chisel/nib point
        ctx.save();
        const tipGrad = ctx.createRadialGradient(activeTip.x, activeTip.y, 0, activeTip.x, activeTip.y, 24);
        tipGrad.addColorStop(0, matCfg.glowColor);
        tipGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = tipGrad;
        ctx.beginPath();
        ctx.arc(activeTip.x, activeTip.y, 24, 0, Math.PI * 2);
        ctx.fill();

        // Stylized tool nib / chisel tip indicator
        ctx.translate(activeTip.x, activeTip.y);
        ctx.rotate(-Math.PI / 5);
        ctx.fillStyle = inkColorId !== 'theme_default' ? inkColor.primaryHex : (material === 'parchment' ? '#7c2d12' : '#f8fafc');
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(7, -18);
        ctx.lineTo(-4, -15);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Update & draw particles
      if (particlesRef.current.length > 0) {
        const nextParticles: Particle[] = [];
        ctx.save();
        for (const pt of particlesRef.current) {
          pt.x += pt.vx;
          pt.y += pt.vy;
          if (material !== 'parchment') {
            pt.vy += 0.12; // gravity on stone chips & gold sparks
          }
          pt.life += 1;
          if (pt.life < pt.maxLife) {
            const alpha = 1 - pt.life / pt.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size * alpha + 0.4, 0, Math.PI * 2);
            ctx.fill();
            nextParticles.push(pt);
          }
        }
        ctx.restore();
        particlesRef.current = nextParticles;
      }
    },
    [
      material,
      activeMatCfg,
      inkColorId,
      inkColor.primaryHex,
      makeArabicFont,
      substrateTexture,
      N,
      cellSize,
      gridX,
      gridY,
      gridSize,
      cx,
      orderedCells,
      hoveredCell,
      amuletData,
      activeGrid.targetSum,
      rulerSnapshot,
      isPlaying,
      spawnSparks,
    ]
  );

  // Animation loop
  useEffect(() => {
    let rafId = 0;

    const tick = (timestamp: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp;
      }
      const dt = Math.min(0.05, (timestamp - lastFrameTimeRef.current) / 1000);
      lastFrameTimeRef.current = timestamp;

      if (isPlaying && progressRef.current < 1) {
        // Complete full engraving in ~11 seconds at 1x speed
        const increment = (dt * speed) / 11;
        const nextP = Math.min(1, progressRef.current + increment);
        progressRef.current = nextP;
        setProgress(nextP);
        if (nextP >= 1) {
          setIsPlaying(false);
        }
      }

      drawFrame(progressRef.current);

      if (isPlaying || particlesRef.current.length > 0) {
        rafId = requestAnimationFrame(tick);
      }
    };

    drawFrame(progressRef.current);
    if (isPlaying || particlesRef.current.length > 0) {
      lastFrameTimeRef.current = null;
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isPlaying, speed, drawFrame, hoveredCell]);

  // Ensure static frame redraws when scrubbing or changing material while paused
  useEffect(() => {
    if (!isPlaying) {
      drawFrame(progressRef.current);
    }
  }, [progress, material, drawFrame, isPlaying]);

  const handleReplay = () => {
    progressRef.current = 0;
    lastSparkStepRef.current = -1;
    particlesRef.current = [];
    setProgress(0);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    if (progressRef.current >= 1) {
      handleReplay();
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleScrub = (val: number) => {
    const p = Math.min(1, Math.max(0, val / 1000));
    progressRef.current = p;
    setProgress(p);
    setIsPlaying(false);
  };

  // Interactive Canvas Probe & Click Spark
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    if (!pt) return;
    if (pt.x >= gridX && pt.x <= gridX + gridSize && pt.y >= gridY && pt.y <= gridY + gridSize) {
      const col = Math.min(N - 1, Math.max(0, Math.floor((pt.x - gridX) / cellSize)));
      const row = Math.min(N - 1, Math.max(0, Math.floor((pt.y - gridY) / cellSize)));
      const found = orderedCells.find((c) => c.row === row && c.col === col) || null;
      setHoveredCell(found);
    } else {
      if (hoveredCell) setHoveredCell(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    if (!pt) return;
    spawnSparks(pt.x, pt.y, 16, material);
    drawFrame(progressRef.current);
  };

  const handleDownloadEtched = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png', 0.95);
    const link = document.createElement('a');
    link.download = `Wafaq-Etched-${material}-Manzil-${amuletData.manzil.number}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Active stage description
  const activeStageLabel = useMemo(() => {
    if (progress < 0.22) return 'Tahap 1/5: Mengukir Bingkai Pelindung & Lingkaran Falak';
    if (progress < 0.38) return 'Tahap 2/5: Membagi Kisi-Kisi Bujur Sangkar Wafaq';
    if (progress < 0.50) return 'Tahap 3/5: Memahatkan 7 Segel Sulaymani & Kunci Badūḥ';
    if (progress < 0.86) return 'Tahap 4/5: Pengisian Angka Mīzān (Urutan Nilai Terkecil → Terbesar)';
    if (progress < 1.0) return 'Tahap 5/5: Menatah Prasasti Ayat, Asma & Penguasa Planet';
    return 'Selesai: Pengukiran Wafaq Tām Mawzūn Sempurna';
  }, [progress]);

  return (
    <div className="w-full space-y-3">
      {/* Top Material & Telemetry Bar */}
      <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-3.5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-serif font-bold text-stone-800 dark:text-stone-100">
              Media Substrat Pengukiran:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(MATERIAL_CONFIGS) as EtchingMaterial[]).map((matKey) => {
              const cfg = MATERIAL_CONFIGS[matKey];
              const active = material === matKey;
              return (
                <button
                  key={matKey}
                  type="button"
                  onClick={() => setMaterial(matKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer border whitespace-nowrap ${
                    active
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                      : 'bg-stone-100 dark:bg-[#0c1222] text-stone-700 dark:text-stone-300 border-[#dacdb2] dark:border-[#25344f] hover:border-amber-500/60'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: cfg.baseBg }}
                  />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Playback & Speed Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#dacdb2]/60 dark:border-[#25344f]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Jeda' : progress >= 1 ? 'Putar Ulang' : 'Lanjutkan'}</span>
            </button>

            <button
              type="button"
              onClick={handleReplay}
              className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Mulai pengukiran dari awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadEtched}
              className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Unduh hasil ukiran material saat ini sebagai PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Simpan PNG</span>
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <Gauge className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-stone-500 dark:text-stone-400">Kecepatan:</span>
            {[0.5, 1, 2, 4].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setSpeed(spd)}
                className={`px-2 py-1 rounded-lg font-mono tabular-nums text-[11px] font-semibold transition-colors cursor-pointer ${
                  speed === spd
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                    : 'bg-stone-100 dark:bg-[#0c1222] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {spd}×
              </button>
            ))}
          </div>
        </div>

        {/* Scrubber & Stage Status */}
        <div className="space-y-1.5">
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(progress * 1000)}
            onChange={(e) => handleScrub(parseInt(e.target.value, 10))}
            aria-label="Progres Animasi Pengukiran Wafaq"
            className="w-full accent-amber-600 cursor-pointer h-1.5 rounded-lg"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{activeStageLabel}</span>
            </span>
            <span className="font-mono tabular-nums font-semibold text-amber-700 dark:text-amber-300">
              {Math.round(progress * 100)}% · {calligraphyStyle.name} · {inkColor.name}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Canvas Viewport */}
      <div className="relative w-full max-w-[580px] mx-auto rounded-2xl overflow-hidden border-2 border-[#dacdb2] dark:border-[#25344f] shadow-2xl bg-black/10">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onMouseMove={handleCanvasMove}
          onMouseLeave={() => setHoveredCell(null)}
          onClick={handleCanvasClick}
          className="w-full h-auto block cursor-crosshair select-none touch-manipulation"
        />

        {/* Interactive Cell Probe HUD */}
        <div className="px-3.5 py-2 bg-stone-950/85 text-stone-200 text-[11px] flex flex-wrap items-center justify-between gap-2 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {hoveredCell ? (
              <span className="font-mono tabular-nums">
                Sel ({hoveredCell.row + 1},{hoveredCell.col + 1}) · Urutan Pengisian #{hoveredCell.orderIndex + 1}/{N * N} · Nilai: <strong className="text-amber-300">{hoveredCell.value}</strong> ({hoveredCell.formatted})
              </span>
            ) : (
              <span className="text-stone-400">
                Ketuk/sentuh kanvas untuk percikan pahat · Arahkan ke kisi untuk inspeksi urutan
              </span>
            )}
          </div>
          <span className="font-arabic text-amber-300 font-bold" style={{ fontFamily: calligraphyStyle.fontFamily }}>
            {calligraphyStyle.nameArabic} · {MATERIAL_CONFIGS[material].arabicLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
