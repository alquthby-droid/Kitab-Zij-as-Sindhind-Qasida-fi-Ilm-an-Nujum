import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ThemeMode, HistoricalDateInfo } from '../types';
import {
  generateAnnualManzilPowerData,
  ManzilPowerTrendPoint,
  ActivityPowerCategory,
} from '../lib/manzilPowerEngine';
import {
  TrendingUp,
  CloudRain,
  Sun,
  Wind,
  Sprout,
  DollarSign,
  Compass,
  HeartPulse,
  FileCheck2,
  Calendar,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  Filter,
  Layers,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';

interface AstrolabeManzilPowerChartProps {
  currentDateInfo: HistoricalDateInfo;
  theme: ThemeMode;
  onSelectDateStep?: (hoursOffset: number) => void;
  onAnnotateTrend?: (title: string, content: string) => void;
}

export const AstrolabeManzilPowerChart: React.FC<AstrolabeManzilPowerChartProps> = ({
  currentDateInfo,
  theme,
  onSelectDateStep,
  onAnnotateTrend,
}) => {
  const isNight = theme === 'night';
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Selected metric category to visualize
  const [activeCategory, setActiveCategory] = useState<ActivityPowerCategory>('composite');
  // Hovered data point for tooltip
  const [hoveredPoint, setHoveredPoint] = useState<ManzilPowerTrendPoint | null>(null);
  // Selected point for detailed inspection
  const [selectedPoint, setSelectedPoint] = useState<ManzilPowerTrendPoint | null>(null);
  // Show seasonal climate zone background bands
  const [showSeasonBands, setShowSeasonBands] = useState<boolean>(true);
  // Chart dimensions container measurement
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 860,
    height: 320,
  });

  // Generate 1-year annual trend dataset
  const trendData = useMemo(() => {
    return generateAnnualManzilPowerData(currentDateInfo.jdn, 140);
  }, [currentDateInfo.jdn]);

  // Set default selected point to current active date (last point in trend)
  useEffect(() => {
    if (trendData.points.length > 0 && !selectedPoint) {
      setSelectedPoint(trendData.points[trendData.points.length - 1]);
    }
  }, [trendData, selectedPoint]);

  // Resize observer to handle fluid responsiveness
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) {
          setDimensions({
            width: Math.max(320, w),
            height: Math.min(360, Math.max(260, Math.round(w * 0.38))),
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Category Configuration
  const categoryConfigs: Record<
    ActivityPowerCategory,
    {
      label: string;
      arabic: string;
      desc: string;
      color: string;
      colorHex: string;
      gradientId: string;
      icon: React.ComponentType<{ className?: string }>;
    }
  > = {
    composite: {
      label: 'Manzil Power Komposit',
      arabic: 'قُوَّةُ المَنَازِل الكُلِّيَّة',
      desc: 'Sinergi kekuatan kosmis posisi Bulan, martabat Manzil, fase, dan keselarasan musim',
      color: 'text-[#c59a43]',
      colorHex: '#c59a43',
      gradientId: 'grad-composite',
      icon: Sparkles,
    },
    climate: {
      label: 'Iklim Musiman & Anwa\'',
      arabic: 'أَنْوَاءُ الفُصُولِ وَالأَمْطَار',
      desc: 'Potensi pembentukan awan, curah hujan (*Amṭār*), kelembapan dan fluktuasi suhu',
      color: 'text-[#38bdf8]',
      colorHex: '#38bdf8',
      gradientId: 'grad-climate',
      icon: CloudRain,
    },
    ziraah: {
      label: 'Pertanian & Irigasi',
      arabic: 'الزِّرَاعَةُ وَالسَّقْي',
      desc: 'Kesuburan tanah (*Turāb*), penyemaian benih, pemangkasan dahan dan irigasi',
      color: 'text-emerald-400',
      colorHex: '#10b981',
      gradientId: 'grad-ziraah',
      icon: Sprout,
    },
    tijarah: {
      label: 'Perniagaan & Pasar',
      arabic: 'التِّجَارَةُ وَالأَسْوَاق',
      desc: 'Kelancaran transaksi pasar, perputaran mata uang, kafilah dagang dan akad jual-beli',
      color: 'text-amber-400',
      colorHex: '#f59e0b',
      gradientId: 'grad-tijarah',
      icon: DollarSign,
    },
    safar: {
      label: 'Pelayaran & Perjalanan',
      arabic: 'السَّفَرُ وَالمِلَاحَة',
      desc: 'Ketenangan arus laut, keselamatan rute darat, kestabilan hembusan angin pelayaran',
      color: 'text-cyan-400',
      colorHex: '#06b6d4',
      gradientId: 'grad-safar',
      icon: Compass,
    },
    tibb: {
      label: 'Kesehatan & Terapi',
      arabic: 'الطِّبُّ وَالفِصَادَة',
      desc: 'Kebugaran fisik, terapi herbal sesuai tabiat empat unsur, dan perawatan alami',
      color: 'text-rose-400',
      colorHex: '#f43f5e',
      gradientId: 'grad-tibb',
      icon: HeartPulse,
    },
    uqud: {
      label: 'Perjanjian & Ikatan',
      arabic: 'العُقُودُ وَالمُعَاهَدَات',
      desc: 'Penandatanganan pakta, diplomasi, ikatan pernikahan dan aliansi kehormatan',
      color: 'text-indigo-400',
      colorHex: '#818cf8',
      gradientId: 'grad-uqud',
      icon: FileCheck2,
    },
  };

  const activeConf = categoryConfigs[activeCategory];

  // Helper value extractor for points based on active category
  const getScore = (p: ManzilPowerTrendPoint) => {
    switch (activeCategory) {
      case 'composite':
        return p.compositePowerScore;
      case 'climate':
        return p.climateIndex;
      case 'ziraah':
        return p.activityScores.ziraah;
      case 'tijarah':
        return p.activityScores.tijarah;
      case 'safar':
        return p.activityScores.safar;
      case 'tibb':
        return p.activityScores.tibb;
      case 'uqud':
        return p.activityScores.uqud;
    }
  };

  // D3 Chart Rendering via useEffect
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const margin = { top: 28, right: 32, bottom: 42, left: 48 };
    const innerWidth = Math.max(10, dimensions.width - margin.left - margin.right);
    const innerHeight = Math.max(10, dimensions.height - margin.top - margin.bottom);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const points = trendData.points;
    if (points.length === 0) return;

    // X Scale: Time
    const xScale = d3
      .scaleTime()
      .domain([points[0].date, points[points.length - 1].date])
      .range([0, innerWidth]);

    // Y Scale: 0 to 100 Power Score
    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Defs for gradients & glow filters
    const defs = svg.append('defs');

    // Gradient for the active category
    const mainGrad = defs
      .append('linearGradient')
      .attr('id', 'area-gradient-active')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    mainGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', activeConf.colorHex)
      .attr('stop-opacity', isNight ? 0.45 : 0.35);

    mainGrad
      .append('stop')
      .attr('offset', '70%')
      .attr('stop-color', activeConf.colorHex)
      .attr('stop-opacity', isNight ? 0.12 : 0.08);

    mainGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', activeConf.colorHex)
      .attr('stop-opacity', 0);

    // Filter for neon glow
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // 1. Seasonal Background Bands (Spring, Summer, Autumn, Winter)
    if (showSeasonBands) {
      // Find boundary points where season changes
      const seasonBands: { name: string; arabic: string; start: Date; end: Date; color: string }[] = [];
      let curSeason = points[0].seasonKey;
      let bandStart = points[0].date;
      let bandName = points[0].seasonName;
      let bandArabic = points[0].seasonArabic;

      const seasonColors: Record<string, string> = {
        spring: isNight ? 'rgba(16, 185, 129, 0.06)' : 'rgba(16, 185, 129, 0.08)',
        summer: isNight ? 'rgba(245, 158, 11, 0.06)' : 'rgba(245, 158, 11, 0.08)',
        autumn: isNight ? 'rgba(249, 115, 22, 0.06)' : 'rgba(249, 115, 22, 0.08)',
        winter: isNight ? 'rgba(56, 189, 248, 0.06)' : 'rgba(56, 189, 248, 0.08)',
      };

      for (let i = 1; i < points.length; i++) {
        if (points[i].seasonKey !== curSeason) {
          seasonBands.push({
            name: bandName,
            arabic: bandArabic,
            start: bandStart,
            end: points[i].date,
            color: seasonColors[curSeason] || 'transparent',
          });
          curSeason = points[i].seasonKey;
          bandStart = points[i].date;
          bandName = points[i].seasonName;
          bandArabic = points[i].seasonArabic;
        }
      }
      seasonBands.push({
        name: bandName,
        arabic: bandArabic,
        start: bandStart,
        end: points[points.length - 1].date,
        color: seasonColors[curSeason] || 'transparent',
      });

      seasonBands.forEach((band) => {
        const x1 = xScale(band.start);
        const x2 = xScale(band.end);
        g.append('rect')
          .attr('x', x1)
          .attr('y', 0)
          .attr('width', Math.max(0, x2 - x1))
          .attr('height', innerHeight)
          .attr('fill', band.color);

        // Watermark label for season
        g.append('text')
          .attr('x', (x1 + x2) / 2)
          .attr('y', 14)
          .attr('text-anchor', 'middle')
          .attr('fill', isNight ? '#94a3b8' : '#64748b')
          .attr('opacity', 0.5)
          .attr('font-size', '9px')
          .attr('font-family', 'serif')
          .text(`${band.name} • ${band.arabic}`);
      });
    }

    // 2. Horizontal Grid Lines
    const yTicks = [20, 40, 60, 80, 100];
    yTicks.forEach((tickVal) => {
      const y = yScale(tickVal);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', isNight ? '#1e293b' : '#e2d9c8')
        .attr('stroke-dasharray', tickVal === 60 ? '4 4' : '2 4')
        .attr('stroke-width', tickVal === 60 ? 1.0 : 0.6);

      // Y-axis label
      g.append('text')
        .attr('x', -8)
        .attr('y', y + 3.5)
        .attr('text-anchor', 'end')
        .attr('fill', isNight ? '#64748b' : '#94a3b8')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .text(`${tickVal}%`);
    });

    // 3. X-Axis Month Markers
    const xTicks = xScale.ticks(d3.timeMonth.every(1)!);
    xTicks.forEach((t) => {
      const x = xScale(t);
      if (x < 0 || x > innerWidth) return;

      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', isNight ? '#1e293b' : '#ede5d4')
        .attr('stroke-width', 0.5);

      const monthLabel = d3.timeFormat('%b %y')(t);
      g.append('text')
        .attr('x', x)
        .attr('y', innerHeight + 16)
        .attr('text-anchor', 'middle')
        .attr('fill', isNight ? '#94a3b8' : '#716353')
        .attr('font-size', '9px')
        .attr('font-family', 'sans-serif')
        .text(monthLabel);
    });

    // 4. D3 Area Path Generator
    const areaGenerator = d3
      .area<ManzilPowerTrendPoint>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(getScore(d)))
      .curve(d3.curveMonotoneX);

    // 5. D3 Line Path Generator
    const lineGenerator = d3
      .line<ManzilPowerTrendPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(getScore(d)))
      .curve(d3.curveMonotoneX);

    // Draw the Gradient Area
    g.append('path')
      .datum(points)
      .attr('fill', 'url(#area-gradient-active)')
      .attr('d', areaGenerator);

    // Draw the Glowing Line
    g.append('path')
      .datum(points)
      .attr('fill', 'none')
      .attr('stroke', activeConf.colorHex)
      .attr('stroke-width', 2.2)
      .attr('filter', 'url(#glow)')
      .attr('d', lineGenerator);

    // 6. Highlight Peak & Lowest Power Days with Pins
    const peak = trendData.peakPowerDay;
    const lowest = trendData.lowestPowerDay;

    // Peak Dot
    const peakX = xScale(peak.date);
    const peakY = yScale(getScore(peak));
    g.append('circle')
      .attr('cx', peakX)
      .attr('cy', peakY)
      .attr('r', 4.5)
      .attr('fill', '#10b981')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#glow)');

    // Lowest Dot
    const lowX = xScale(lowest.date);
    const lowY = yScale(getScore(lowest));
    g.append('circle')
      .attr('cx', lowX)
      .attr('cy', lowY)
      .attr('r', 3.5)
      .attr('fill', '#f43f5e')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.2);

    // 7. Interactive Crosshair and Hover Layer
    const crosshair = g.append('g').style('display', 'none');

    // Vertical line
    const vLine = crosshair
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', isNight ? '#f1f5f9' : '#0f172a')
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', '3 3')
      .attr('opacity', 0.7);

    // Active circle marker
    const marker = crosshair
      .append('circle')
      .attr('r', 6)
      .attr('fill', activeConf.colorHex)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)');

    // Overlay rect for capturing mouse events seamlessly
    const bisectDate = d3.bisector<ManzilPowerTrendPoint, Date>((d) => d.date).center;

    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mouseenter', () => crosshair.style('display', null))
      .on('mouseleave', () => {
        crosshair.style('display', 'none');
        setHoveredPoint(null);
      })
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const xDate = xScale.invert(mx);
        const idx = bisectDate(points, xDate);
        const p = points[Math.min(points.length - 1, Math.max(0, idx))];

        if (p) {
          const cx = xScale(p.date);
          const cy = yScale(getScore(p));
          vLine.attr('x1', cx).attr('x2', cx);
          marker.attr('cx', cx).attr('cy', cy);
          setHoveredPoint(p);
        }
      })
      .on('click', (event) => {
        const [mx] = d3.pointer(event);
        const xDate = xScale.invert(mx);
        const idx = bisectDate(points, xDate);
        const p = points[Math.min(points.length - 1, Math.max(0, idx))];
        if (p) {
          setSelectedPoint(p);
        }
      });
  }, [trendData, activeCategory, dimensions, isNight, showSeasonBands, activeConf.colorHex]);

  // Current active inspector point (hovered or selected)
  const inspectedPoint = hoveredPoint || selectedPoint || trendData.points[trendData.points.length - 1];

  // Sync date step handler
  const handleSyncDateToAstrolabe = (targetJdn: number) => {
    if (!onSelectDateStep) return;
    const diffDays = targetJdn - currentDateInfo.jdn;
    const diffHours = Math.round(diffDays * 24);
    onSelectDateStep(diffHours);
  };

  return (
    <div
      id="astrolabe-manzil-power-module"
      className={`rounded-2xl border p-4 sm:p-6 transition-all space-y-5 ${
        isNight
          ? 'bg-[#101522]/95 border-[#28354c] text-[#e6ded0]'
          : 'bg-[#faf6ee] border-[#ded5c2] text-[#2c241c] shadow-sm'
      }`}
    >
      {/* Header Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-current/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
              مُخَطَّطُ قُوَّةِ المَنَازِل السَّنَوِيّ
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              D3 Area Chart (1 Tahun)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-[#c59a43] mt-1 flex items-center gap-2">
            Tren Fluktuasi 'Manzil Power' & Iklim Musiman (Anwa')
          </h2>
          <p className="text-xs opacity-80 mt-0.5 font-serif max-w-3xl">
            Visualisasi siklus astronomis 28 Manzil al-Qamar selama 365 hari penuh berdasarkan kaidah *Zij as-Sindhind* dan risalah *Al-Anwa'* Al-Kindi. Memetakan fluktuasi pengaruh posisi Bulan terhadap iklim empat musim dan rekomendasi aktivitas harian.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
              isNight ? 'bg-[#0d121c] border-[#223048]' : 'bg-[#f4efe4] border-[#d8cca9]'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[11px] opacity-75">Rerata Tahunan:</span>
            <span className="font-mono font-bold text-[#c59a43]">
              {trendData.averagePowerScore}%
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowSeasonBands(!showSeasonBands)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
              showSeasonBands
                ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#c59a43]'
                : isNight
                ? 'bg-[#0d121c] border-[#223048] opacity-75'
                : 'bg-white border-[#d8cca9] opacity-75'
            }`}
            title="Tampilkan / Sembunyikan Kuadran 4 Musim di Latar Belakang"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Zona 4 Musim</span>
          </button>
        </div>
      </div>

      {/* Metric Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(categoryConfigs) as ActivityPowerCategory[]).map((catKey) => {
          const cfg = categoryConfigs[catKey];
          const Icon = cfg.icon;
          const isActive = activeCategory === catKey;

          return (
            <button
              key={catKey}
              type="button"
              onClick={() => setActiveCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-[#c59a43] text-black border-[#c59a43] font-semibold shadow-sm scale-102'
                  : isNight
                  ? 'bg-[#0e1422] border-[#233148] text-[#a0aec0] hover:border-[#3b4c6d]'
                  : 'bg-white border-[#dcd1ba] text-[#554a3e] hover:border-[#baa78d]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Description Banner for Selected Category */}
      <div
        className={`px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs gap-3 ${
          isNight ? 'bg-[#0b101a] border-[#1e2a3f]' : 'bg-[#f6f0e4] border-[#d8ceba]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <activeConf.icon className={`w-4 h-4 shrink-0 ${activeConf.color}`} />
          <div>
            <span className="font-semibold mr-2">{activeConf.label} ({activeConf.arabic}):</span>
            <span className="opacity-75">{activeConf.desc}</span>
          </div>
        </div>
        <span className="font-mono text-[11px] opacity-65 shrink-0 hidden sm:inline">
          Skala: 0 - 100%
        </span>
      </div>

      {/* Main D3 Area Chart Container */}
      <div
        ref={containerRef}
        className={`w-full rounded-2xl border p-2 sm:p-4 relative transition-all ${
          isNight ? 'bg-[#090d14] border-[#1f2b3e]' : 'bg-[#fefdfb] border-[#ded4bf]'
        }`}
      >
        {/* Floating Tooltip Pill */}
        {inspectedPoint && (
          <div
            className={`absolute top-4 right-4 z-10 px-3 py-2 rounded-xl border text-xs shadow-lg backdrop-blur-md max-w-xs transition-all pointer-events-none ${
              isNight
                ? 'bg-[#121927]/90 border-[#2d3e5e] text-[#f1f5f9]'
                : 'bg-white/95 border-[#d5c7a8] text-[#1e293b]'
            }`}
          >
            <div className="flex items-center justify-between gap-3 border-b border-current/10 pb-1.5 mb-1.5">
              <div className="font-bold flex items-center gap-1.5 text-[#c59a43]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{inspectedPoint.dateFormatted}</span>
              </div>
              <span className="text-[10px] font-mono opacity-70">
                {inspectedPoint.hijriFormatted}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="opacity-75">Manzil Aktif:</span>
                <span className="font-semibold text-[#c59a43]">
                  {inspectedPoint.manzil.transliteration} (#{inspectedPoint.manzilNumber})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="opacity-75">Musim & Anwa':</span>
                <span className="font-medium text-emerald-400">
                  {inspectedPoint.seasonName.split(' ')[0]} ({inspectedPoint.anwaStarName})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="opacity-75">Skor {activeConf.label}:</span>
                <span className="font-mono font-bold text-base text-[#c59a43]">
                  {getScore(inspectedPoint)}%
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] opacity-70 pt-0.5 border-t border-current/10">
                <span>Fase: {inspectedPoint.moonPhaseName}</span>
                <span>Unsur: {inspectedPoint.element}</span>
              </div>
            </div>
          </div>
        )}

        {/* SVG Element for D3 */}
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto overflow-visible select-none"
        />

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-[11px] opacity-75 pt-2 px-2 border-t border-current/5 gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#10b981] border border-white" />
              <span>Puncak Kuat (Peak: {trendData.peakPowerDay.dateFormatted})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] border border-white" />
              <span>Titik Lemah / Rentan</span>
            </div>
          </div>

          <div className="text-[10px] opacity-65">
            *Arahkan kursor atau sentuh grafik untuk memeriksa titik waktu secara presisi
          </div>
        </div>
      </div>

      {/* Selected Day Deep Dive Panel */}
      {inspectedPoint && (
        <div
          className={`rounded-2xl border p-4 sm:p-5 transition-all ${
            isNight ? 'bg-[#0d121c] border-[#223048]' : 'bg-[#f4efe4] border-[#d8cca9]'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-current/10 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/30 font-semibold">
                  {inspectedPoint.dateFormatted} ({inspectedPoint.hijriFormatted})
                </span>
                <span className="text-xs opacity-75">• JDN {inspectedPoint.jdn}</span>
              </div>
              <h3 className="font-serif font-bold text-base mt-1">
                Kajian Manzil #{inspectedPoint.manzilNumber}: {inspectedPoint.manzil.transliteration} ({inspectedPoint.manzil.arabicName})
              </h3>
            </div>

            {/* Sync Date to Astrolabe button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSyncDateToAstrolabe(inspectedPoint.jdn)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#c59a43] text-black hover:bg-[#d6aa52] transition-colors shadow-sm active:scale-95"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Sinkronkan Astrolabe ke Tanggal Ini</span>
              </button>

              {onAnnotateTrend && (
                <button
                  type="button"
                  onClick={() =>
                    onAnnotateTrend(
                      `Tren Manzil Power ${inspectedPoint.manzil.transliteration} (${inspectedPoint.dateFormatted})`,
                      `Kajian siklus tahunan Manzil #${inspectedPoint.manzilNumber} (${inspectedPoint.manzil.transliteration}) pada ${inspectedPoint.dateFormatted}.\n\nSkor Komposit: ${inspectedPoint.compositePowerScore}%\nIklim: ${inspectedPoint.climateLabel}\nCatatan: ${inspectedPoint.weatherAnomalyNote}`
                    )
                  }
                  className="p-2 rounded-xl border opacity-75 hover:opacity-100 hover:bg-current/10 transition-colors"
                  title="Simpan Anotasi Riset"
                >
                  <ArrowUpRight className="w-4 h-4 text-[#c59a43]" />
                </button>
              )}
            </div>
          </div>

          {/* 3 Grid Pillars: Iklim Musiman, Aktivitas Harian, dan Manzil Astronomy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Pillar 1: Iklim Musiman (Anwa') */}
            <div
              className={`p-3.5 rounded-xl border ${
                isNight ? 'bg-[#111726] border-[#202d42]' : 'bg-white border-[#ded4be]'
              }`}
            >
              <div className="flex items-center gap-2 text-[#38bdf8] font-bold mb-2">
                <CloudRain className="w-4 h-4" />
                <span>Pengaruh Iklim Musiman (Anwa'):</span>
              </div>
              <p className="font-semibold text-sm mb-1">{inspectedPoint.climateLabel}</p>
              <p className="opacity-75 text-[11px] mb-2">{inspectedPoint.weatherAnomalyNote}</p>
              <div className="pt-2 border-t border-current/10 flex justify-between items-center text-[11px]">
                <span className="opacity-70">Musim Aktif:</span>
                <span className="font-semibold">{inspectedPoint.seasonName}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] mt-1">
                <span className="opacity-70">Indeks Presipitasi:</span>
                <span className="font-mono font-bold text-[#38bdf8]">
                  {inspectedPoint.climateIndex}%
                </span>
              </div>
            </div>

            {/* Pillar 2: Aktivitas Harian (Ikhtiyarat) */}
            <div
              className={`p-3.5 rounded-xl border ${
                isNight ? 'bg-[#111726] border-[#202d42]' : 'bg-white border-[#ded4be]'
              }`}
            >
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Skor Potensi Aktivitas Harian:</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="opacity-75">Pertanian (*Zirā'ah*):</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {inspectedPoint.activityScores.ziraah}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-75">Perniagaan (*Tijārah*):</span>
                  <span className="font-mono font-bold text-amber-400">
                    {inspectedPoint.activityScores.tijarah}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-75">Pelayaran (*Safar*):</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {inspectedPoint.activityScores.safar}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-75">Kesehatan (*Tibb*):</span>
                  <span className="font-mono font-bold text-rose-400">
                    {inspectedPoint.activityScores.tibb}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-75">Perjanjian (*'Uqūd*):</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {inspectedPoint.activityScores.uqud}%
                  </span>
                </div>
              </div>
            </div>

            {/* Pillar 3: Sifat Falak Manzil */}
            <div
              className={`p-3.5 rounded-xl border ${
                isNight ? 'bg-[#111726] border-[#202d42]' : 'bg-white border-[#ded4be]'
              }`}
            >
              <div className="flex items-center gap-2 text-[#c59a43] font-bold mb-2">
                <Compass className="w-4 h-4" />
                <span>Data Falak Manzil al-Qamar:</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="opacity-75">Bintang Utama:</span>
                  <span className="font-semibold">{inspectedPoint.anwaStarName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Watak Keberuntungan:</span>
                  <span
                    className={`font-semibold ${
                      inspectedPoint.fortuneLevel.includes('Sa\'d')
                        ? 'text-emerald-400'
                        : inspectedPoint.fortuneLevel.includes('Nahs')
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {inspectedPoint.fortuneLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Unsur Tabiat:</span>
                  <span className="font-semibold">{inspectedPoint.element} (Mizaj)</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Fase Bulan:</span>
                  <span className="font-semibold">{inspectedPoint.moonPhaseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Bujur Ekliptika Bulan:</span>
                  <span className="font-mono">{Math.round(inspectedPoint.moonLongitude)}°</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Seasonal Summary Cards (Ringkasan 4 Musim Setahun) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {trendData.seasonSummaries.map((s) => (
          <div
            key={s.seasonKey}
            className={`p-3.5 rounded-xl border transition-all ${
              isNight ? 'bg-[#0d121c] border-[#223048]' : 'bg-white border-[#dcd1ba]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-serif font-bold text-sm text-[#c59a43]">
                {s.seasonName}
              </span>
              <span className="text-[10px] opacity-65 font-serif">{s.seasonArabic}</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-mono text-base font-bold text-[#c59a43]">{s.avgPower}%</span>
              <span className="text-[10px] opacity-70">Rata-rata Potensi</span>
            </div>
            <div className="text-[11px] opacity-75 mt-1 border-t border-current/10 pt-1.5">
              <span className="font-medium text-emerald-400 block mb-0.5">Rekomendasi Utama:</span>
              <span>{s.recommendedActivity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
