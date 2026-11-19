import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {
  LineChart,
  Download,
  BookmarkPlus,
  RotateCcw,
  Calendar,
  Compass,
  Layers,
  Crosshair,
  SlidersHorizontal,
  ArrowUpRight,
  Search,
  Grid3X3,
} from 'lucide-react';
import { HistoricalDateInfo, ThemeMode } from '../types';
import { ZODIAC_SIGNS } from '../lib/sindhindEngine';
import {
  ClassicalKawkabKey,
  SEVEN_KAWKAB_KEYS,
  KAWKAB_META,
  SamplingCadence,
  HistoricalEpochPoint,
  generateCenturyPlanetaryAnalysis,
  shortestAngularSeparation,
  exportCenturyDatasetToCsv,
} from '../lib/planetaryAnalysisEngine';

interface PlanetaryHistoricalAnalysisViewProps {
  currentDateInfo: HistoricalDateInfo;
  observerLocation: {
    latitude: number;
    longitude: number;
    name: string;
  };
  theme: ThemeMode;
  onApplyDate?: (year: number, month: number, day: number, hour: number, minute: number) => void;
  onAnnotate?: (title: string, content: string) => void;
}

type AnalysisChartMode = 'longitude' | 'dignity' | 'separation';

export const PlanetaryHistoricalAnalysisView: React.FC<PlanetaryHistoricalAnalysisViewProps> = ({
  currentDateInfo,
  observerLocation,
  theme,
  onApplyDate,
  onAnnotate,
}) => {
  const isNight = theme === 'night';

  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const mainSvgRef = useRef<SVGSVGElement>(null);
  const brushSvgRef = useRef<SVGSVGElement>(null);
  const heatmapWrapperRef = useRef<HTMLDivElement>(null);
  const heatmapSvgRef = useRef<SVGSVGElement>(null);

  const [chartWidth, setChartWidth] = useState<number>(880);
  const [heatmapWidth, setHeatmapWidth] = useState<number>(880);
  const [chartMode, setChartMode] = useState<AnalysisChartMode>('longitude');
  const [cadence, setCadence] = useState<SamplingCadence>('quarterly');
  const [referencePlanet, setReferencePlanet] = useState<ClassicalKawkabKey>('saturn');
  const [showConjunctionMarkers, setShowConjunctionMarkers] = useState<boolean>(true);
  const [showZodiacBands, setShowZodiacBands] = useState<boolean>(true);
  const [jumpYearInput, setJumpYearInput] = useState<string>('');
  const [hoveredHeatmapCell, setHoveredHeatmapCell] = useState<{
    planet: ClassicalKawkabKey;
    signIndex: number;
    pct: number;
  } | null>(null);

  // Active planet visibility (defaults to all 7 Kawkab visible)
  const [visiblePlanets, setVisiblePlanets] = useState<Record<ClassicalKawkabKey, boolean>>({
    saturn: true,
    jupiter: true,
    mars: true,
    sun: true,
    venus: true,
    mercury: true,
    moon: true,
  });

  // Compute full 100-year historical dataset ending on active date
  const dataset = useMemo(() => {
    return generateCenturyPlanetaryAnalysis({
      endYear: currentDateInfo.gregorian.year,
      endMonth: currentDateInfo.gregorian.month,
      endDay: currentDateInfo.gregorian.day,
      latitude: observerLocation.latitude,
      longitude: observerLocation.longitude,
      cadence,
      yearsBack: 100,
    });
  }, [
    currentDateInfo.gregorian.year,
    currentDateInfo.gregorian.month,
    currentDateInfo.gregorian.day,
    observerLocation.latitude,
    observerLocation.longitude,
    cadence,
  ]);

  // Zoomed domain [minDecimalYear, maxDecimalYear] controlled by quick presets or D3 brush
  const [yearDomain, setYearDomain] = useState<[number, number]>([
    dataset.startYear,
    dataset.endYear,
  ]);

  // Keep domain synchronized when the app's base year changes
  useEffect(() => {
    setYearDomain([dataset.startYear, dataset.endYear]);
  }, [dataset.startYear, dataset.endYear]);

  // Crosshair hovered epoch & pinned selected epoch
  const [hoveredEpoch, setHoveredEpoch] = useState<HistoricalEpochPoint | null>(null);
  const [pinnedEpoch, setPinnedEpoch] = useState<HistoricalEpochPoint | null>(null);

  useEffect(() => {
    if (dataset.points.length > 0) {
      setPinnedEpoch(dataset.points[dataset.points.length - 1]);
    }
  }, [dataset]);

  // Fluid responsive ResizeObserver for SVG canvases
  useEffect(() => {
    const targets: Array<{ el: HTMLDivElement | null; setter: (w: number) => void }> = [
      { el: chartWrapperRef.current, setter: setChartWidth },
      { el: heatmapWrapperRef.current, setter: setHeatmapWidth },
    ];
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w <= 0) continue;
        const clamped = Math.max(300, Math.floor(w));
        if (entry.target === chartWrapperRef.current) {
          setChartWidth(clamped);
        } else if (entry.target === heatmapWrapperRef.current) {
          setHeatmapWidth(clamped);
        }
      }
    });
    for (const t of targets) {
      if (t.el) observer.observe(t.el);
    }
    return () => observer.disconnect();
  }, []);

  const activePlanetKeys = useMemo(
    () => SEVEN_KAWKAB_KEYS.filter((k) => visiblePlanets[k]),
    [visiblePlanets]
  );

  const visiblePoints = useMemo(() => {
    const [minY, maxY] = yearDomain;
    return dataset.points.filter((p) => p.decimalYear >= minY - 0.3 && p.decimalYear <= maxY + 0.3);
  }, [dataset.points, yearDomain]);

  const inspectedEpoch = hoveredEpoch || pinnedEpoch || dataset.points[dataset.points.length - 1];

  const getPlanetColor = (key: ClassicalKawkabKey) =>
    isNight ? KAWKAB_META[key].colorNight : KAWKAB_META[key].colorParchment;

  const togglePlanet = (key: ClassicalKawkabKey) => {
    setVisiblePlanets((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Ensure at least one planet stays visible
      if (!Object.values(next).some(Boolean)) {
        return prev;
      }
      return next;
    });
  };

  const applyPlanetPreset = (preset: 'all' | 'upper' | 'inner') => {
    if (preset === 'all') {
      setVisiblePlanets({
        saturn: true,
        jupiter: true,
        mars: true,
        sun: true,
        venus: true,
        mercury: true,
        moon: true,
      });
    } else if (preset === 'upper') {
      setVisiblePlanets({
        saturn: true,
        jupiter: true,
        mars: true,
        sun: false,
        venus: false,
        mercury: false,
        moon: false,
      });
    } else {
      setVisiblePlanets({
        saturn: false,
        jupiter: false,
        mars: false,
        sun: true,
        venus: true,
        mercury: true,
        moon: true,
      });
    }
  };

  const applyYearSpanPreset = (spanYears: number) => {
    const minY = Math.max(dataset.startYear, dataset.endYear - spanYears);
    setYearDomain([minY, dataset.endYear]);
  };

  const handleJumpToYear = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(jumpYearInput.trim(), 10);
    if (Number.isNaN(parsed)) return;
    const clampedYear = Math.max(dataset.startYear, Math.min(dataset.endYear, parsed));
    const minY = Math.max(dataset.startYear, clampedYear - 6);
    const maxY = Math.min(dataset.endYear, clampedYear + 6);
    setYearDomain([minY, maxY]);
    const closest = dataset.points.reduce((best, curr) =>
      Math.abs(curr.decimalYear - clampedYear) < Math.abs(best.decimalYear - clampedYear)
        ? curr
        : best
    );
    setPinnedEpoch(closest);
    setJumpYearInput(String(clampedYear));
  };

  const handleExportCsv = () => {
    const csv = exportCenturyDatasetToCsv(dataset);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Zij-Sindhind-Analisis-7-Kawkab-${dataset.startYear}-${dataset.endYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Main D3 Chart Render Effect
  useEffect(() => {
    if (!mainSvgRef.current || visiblePoints.length === 0) return;

    const svg = d3.select(mainSvgRef.current);
    svg.selectAll('*').remove();

    const isCompact = chartWidth < 600;
    const chartHeight = isCompact ? 320 : 410;
    const margin = {
      top: 22,
      right: isCompact ? 14 : 26,
      bottom: 38,
      left: isCompact ? 46 : 74,
    };

    const innerW = Math.max(40, chartWidth - margin.left - margin.right);
    const innerH = Math.max(80, chartHeight - margin.top - margin.bottom);

    svg.attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`).attr('height', chartHeight);

    const defs = svg.append('defs');
    defs
      .append('clipPath')
      .attr('id', 'century-chart-clip')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerW)
      .attr('height', innerH);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain(yearDomain).range([0, innerW]);

    const yDomain: [number, number] =
      chartMode === 'longitude'
        ? [0, 360]
        : chartMode === 'dignity'
        ? [-10, 12]
        : [0, 180];

    const yScale = d3.scaleLinear().domain(yDomain).range([innerH, 0]);

    const gridColor = isNight ? 'rgba(148, 163, 184, 0.14)' : 'rgba(74, 63, 49, 0.13)';
    const axisTextColor = isNight ? '#94a3b8' : '#574a3a';
    const hairlineColor = isNight ? 'rgba(148, 163, 184, 0.25)' : 'rgba(74, 63, 49, 0.25)';

    // Background zodiac sign bands (longitude mode)
    if (chartMode === 'longitude' && showZodiacBands) {
      const bandGroup = g.append('g').attr('clip-path', 'url(#century-chart-clip)');
      ZODIAC_SIGNS.forEach((sign, idx) => {
        const yTop = yScale((idx + 1) * 30);
        const yBot = yScale(idx * 30);
        bandGroup
          .append('rect')
          .attr('x', 0)
          .attr('y', yTop)
          .attr('width', innerW)
          .attr('height', Math.max(0, yBot - yTop))
          .attr(
            'fill',
            idx % 2 === 0
              ? isNight
                ? 'rgba(197, 154, 67, 0.035)'
                : 'rgba(197, 154, 67, 0.065)'
              : 'transparent'
          );

        if (!isCompact) {
          bandGroup
            .append('text')
            .attr('x', innerW - 6)
            .attr('y', (yTop + yBot) / 2 + 3)
            .attr('text-anchor', 'end')
            .attr('fill', isNight ? 'rgba(226, 216, 195, 0.34)' : 'rgba(44, 36, 25, 0.38)')
            .attr('font-size', '10px')
            .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
            .text(`${sign.symbol} ${sign.latinName}`);
        }
      });
    }

    // Horizontal grid lines
    const yTicks =
      chartMode === 'longitude'
        ? [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360]
        : chartMode === 'dignity'
        ? [-9, -5, 0, 5, 9, 12]
        : [0, 30, 60, 90, 120, 150, 180];

    g.append('g')
      .selectAll('line')
      .data(yTicks)
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', (d) =>
        chartMode === 'dignity' && d === 0
          ? isNight
            ? 'rgba(197, 154, 67, 0.45)'
            : 'rgba(130, 92, 29, 0.45)'
          : gridColor
      )
      .attr('stroke-dasharray', (d) =>
        chartMode === 'dignity' && d === 0 ? '4,3' : '2,3'
      );

    // Vertical Great Conjunction markers (Saturn-Jupiter Qiran)
    if (showConjunctionMarkers) {
      const markerGroup = g.append('g').attr('clip-path', 'url(#century-chart-clip)');
      const inRangeConjunctions = dataset.greatConjunctions.filter(
        (ev) => ev.decimalYear >= yearDomain[0] && ev.decimalYear <= yearDomain[1]
      );
      inRangeConjunctions.forEach((ev) => {
        const cx = xScale(ev.decimalYear);
        markerGroup
          .append('line')
          .attr('x1', cx)
          .attr('x2', cx)
          .attr('y1', 0)
          .attr('y2', innerH)
          .attr('stroke', isNight ? 'rgba(245, 158, 11, 0.45)' : 'rgba(180, 83, 9, 0.45)')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3');

        markerGroup
          .append('text')
          .attr('x', cx + 4)
          .attr('y', 12)
          .attr('fill', isNight ? '#fbbf24' : '#92400e')
          .attr('font-size', '9.5px')
          .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
          .text(`Qirān ${ev.year}`);
      });
    }

    // Plot planetary curves inside clip path
    const seriesGroup = g.append('g').attr('clip-path', 'url(#century-chart-clip)');

    const keysToDraw =
      chartMode === 'separation'
        ? activePlanetKeys.filter((k) => k !== referencePlanet)
        : activePlanetKeys;

    keysToDraw.forEach((planetKey) => {
      const color = getPlanetColor(planetKey);
      const isSlowPlanet =
        planetKey === 'saturn' || planetKey === 'jupiter' || planetKey === 'mars';

      if (chartMode === 'longitude') {
        // Split path into continuous segments whenever longitude wraps across 360° -> 0°
        const segments: HistoricalEpochPoint[][] = [];
        let currentSegment: HistoricalEpochPoint[] = [];

        for (let i = 0; i < visiblePoints.length; i++) {
          const pt = visiblePoints[i];
          if (currentSegment.length > 0) {
            const prevPt = currentSegment[currentSegment.length - 1];
            const prevLon = prevPt.planets[planetKey].longitude;
            const currLon = pt.planets[planetKey].longitude;
            // Break segment on zodiacal wrap-around (> 180° discontinuity)
            if (Math.abs(currLon - prevLon) > 170) {
              segments.push(currentSegment);
              currentSegment = [pt];
              continue;
            }
          }
          currentSegment.push(pt);
        }
        if (currentSegment.length > 0) {
          segments.push(currentSegment);
        }

        const lineGen = d3
          .line<HistoricalEpochPoint>()
          .x((d) => xScale(d.decimalYear))
          .y((d) => yScale(d.planets[planetKey].longitude))
          .curve(d3.curveMonotoneX);

        segments.forEach((seg) => {
          if (seg.length === 1) {
            seriesGroup
              .append('circle')
              .attr('cx', xScale(seg[0].decimalYear))
              .attr('cy', yScale(seg[0].planets[planetKey].longitude))
              .attr('r', 2)
              .attr('fill', color)
              .attr('opacity', isSlowPlanet ? 0.95 : 0.72);
            return;
          }
          seriesGroup
            .append('path')
            .datum(seg)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', isSlowPlanet ? 2.1 : 1.35)
            .attr('stroke-opacity', 0)
            .attr('d', lineGen)
            .transition()
            .duration(260)
            .attr('stroke-opacity', isSlowPlanet ? 0.95 : 0.68);
        });
      } else {
        const lineGen = d3
          .line<HistoricalEpochPoint>()
          .x((d) => xScale(d.decimalYear))
          .y((d) => {
            if (chartMode === 'dignity') {
              return yScale(d.planets[planetKey].dignityScore);
            }
            return yScale(
              shortestAngularSeparation(
                d.planets[referencePlanet].longitude,
                d.planets[planetKey].longitude
              )
            );
          })
          .curve(chartMode === 'dignity' ? d3.curveStepAfter : d3.curveMonotoneX);

        seriesGroup
          .append('path')
          .datum(visiblePoints)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', isSlowPlanet ? 2.1 : 1.45)
          .attr('stroke-opacity', 0)
          .attr('d', lineGen)
          .transition()
          .duration(260)
          .attr('stroke-opacity', isSlowPlanet ? 0.92 : 0.7);
      }
    });

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(isCompact ? 5 : 10)
      .tickFormat((d) => `${Math.round(Number(d))}`);

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(xAxis);

    xAxisGroup.selectAll('path, line').attr('stroke', hairlineColor);
    xAxisGroup
      .selectAll('text')
      .attr('fill', axisTextColor)
      .attr('font-size', '11px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, monospace');

    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(yTicks)
      .tickFormat((d) => {
        const val = Number(d);
        if (chartMode === 'longitude') {
          if (val === 360) return '360°';
          const s = ZODIAC_SIGNS[Math.floor(val / 30)];
          return isCompact ? `${val}°` : `${s?.symbol || ''} ${val}°`;
        }
        if (chartMode === 'dignity') {
          return val > 0 ? `+${val}` : `${val}`;
        }
        return `${val}°`;
      });

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.selectAll('path, line').attr('stroke', hairlineColor);
    yAxisGroup
      .selectAll('text')
      .attr('fill', axisTextColor)
      .attr('font-size', '10.5px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, monospace');

    // Interactive Crosshair Overlay
    const crosshairLine = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('stroke', isNight ? '#c59a43' : '#92400e')
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0);

    const probeDotsGroup = g.append('g').style('pointer-events', 'none');

    const renderCrosshairAt = (pt: HistoricalEpochPoint | null) => {
      if (!pt) {
        crosshairLine.style('opacity', 0);
        probeDotsGroup.selectAll('*').remove();
        return;
      }
      const cx = xScale(pt.decimalYear);
      if (cx < 0 || cx > innerW) {
        crosshairLine.style('opacity', 0);
        probeDotsGroup.selectAll('*').remove();
        return;
      }
      crosshairLine.attr('x1', cx).attr('x2', cx).style('opacity', 0.9);
      probeDotsGroup.selectAll('*').remove();

      keysToDraw.forEach((k) => {
        const val =
          chartMode === 'longitude'
            ? pt.planets[k].longitude
            : chartMode === 'dignity'
            ? pt.planets[k].dignityScore
            : shortestAngularSeparation(
                pt.planets[referencePlanet].longitude,
                pt.planets[k].longitude
              );
        probeDotsGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', yScale(val))
          .attr('r', 4)
          .attr('fill', getPlanetColor(k))
          .attr('stroke', isNight ? '#0a0d14' : '#ffffff')
          .attr('stroke-width', 1.5);
      });
    };

    // Draw initial pinned marker
    if (inspectedEpoch) {
      renderCrosshairAt(inspectedEpoch);
    }

    const bisectYear = d3.bisector<HistoricalEpochPoint, number>((d) => d.decimalYear).left;

    const findNearestPoint = (mouseX: number): HistoricalEpochPoint | null => {
      if (visiblePoints.length === 0) return null;
      const targetYear = xScale.invert(mouseX);
      const idx = bisectYear(visiblePoints, targetYear, 1);
      const p0 = visiblePoints[idx - 1];
      const p1 = visiblePoints[idx];
      if (!p0) return p1 || null;
      if (!p1) return p0;
      return targetYear - p0.decimalYear > p1.decimalYear - targetYear ? p1 : p0;
    };

    g.append('rect')
      .attr('width', innerW)
      .attr('height', innerH)
      .attr('fill', 'transparent')
      .attr('class', 'cursor-crosshair')
      .on('mousemove touchmove', function (event) {
        const [mx] = d3.pointer(event, this);
        const nearest = findNearestPoint(mx);
        if (nearest) {
          setHoveredEpoch(nearest);
          renderCrosshairAt(nearest);
        }
      })
      .on('mouseleave', () => {
        setHoveredEpoch(null);
        renderCrosshairAt(pinnedEpoch);
      })
      .on('click', function (event) {
        const [mx] = d3.pointer(event, this);
        const nearest = findNearestPoint(mx);
        if (nearest) {
          setPinnedEpoch(nearest);
          renderCrosshairAt(nearest);
        }
      });
  }, [
    visiblePoints,
    chartWidth,
    chartMode,
    yearDomain,
    activePlanetKeys,
    referencePlanet,
    showConjunctionMarkers,
    showZodiacBands,
    isNight,
    dataset.greatConjunctions,
    pinnedEpoch,
  ]);

  // Mini 100-Year D3 Brush Scrubber underneath main chart
  useEffect(() => {
    if (!brushSvgRef.current || dataset.points.length === 0) return;

    const svg = d3.select(brushSvgRef.current);
    svg.selectAll('*').remove();

    const isCompact = chartWidth < 600;
    const brushHeight = 64;
    const margin = {
      top: 8,
      right: isCompact ? 14 : 26,
      bottom: 22,
      left: isCompact ? 46 : 74,
    };

    const innerW = Math.max(40, chartWidth - margin.left - margin.right);
    const innerH = Math.max(20, brushHeight - margin.top - margin.bottom);

    svg.attr('viewBox', `0 0 ${chartWidth} ${brushHeight}`).attr('height', brushHeight);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const xFull = d3.scaleLinear().domain([dataset.startYear, dataset.endYear]).range([0, innerW]);
    const yMini = d3.scaleLinear().domain([0, 180]).range([innerH, 0]);

    // Plot subtle Saturn-Jupiter separation wave as century landmark guide
    const miniArea = d3
      .area<HistoricalEpochPoint>()
      .x((d) => xFull(d.decimalYear))
      .y0(innerH)
      .y1((d) => yMini(d.saturnJupiterSeparation))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(dataset.points)
      .attr('fill', isNight ? 'rgba(197, 154, 67, 0.16)' : 'rgba(180, 83, 9, 0.14)')
      .attr('stroke', isNight ? 'rgba(197, 154, 67, 0.55)' : 'rgba(180, 83, 9, 0.55)')
      .attr('stroke-width', 1)
      .attr('d', miniArea);

    const xAxisMini = d3
      .axisBottom(xFull)
      .ticks(isCompact ? 5 : 10)
      .tickFormat((d) => `${Math.round(Number(d))}`);

    const axisG = g.append('g').attr('transform', `translate(0,${innerH})`).call(xAxisMini);
    axisG
      .selectAll('path, line')
      .attr('stroke', isNight ? 'rgba(148,163,184,0.22)' : 'rgba(74,63,49,0.22)');
    axisG
      .selectAll('text')
      .attr('fill', isNight ? '#94a3b8' : '#574a3a')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, monospace');

    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [innerW, innerH],
      ])
      .on('end', (event) => {
        if (!event.sourceEvent) return;
        if (!event.selection) {
          setYearDomain([dataset.startYear, dataset.endYear]);
          return;
        }
        const [x0, x1] = event.selection as [number, number];
        const y0 = Number(xFull.invert(x0).toFixed(2));
        const y1 = Number(xFull.invert(x1).toFixed(2));
        if (y1 - y0 >= 2) {
          setYearDomain([y0, y1]);
        }
      });

    const brushG = g.append('g').call(brush);
    brushG.call(brush.move, [xFull(yearDomain[0]), xFull(yearDomain[1])]);

    brushG
      .selectAll('.selection')
      .attr('fill', isNight ? 'rgba(197, 154, 67, 0.22)' : 'rgba(180, 83, 9, 0.18)')
      .attr('stroke', isNight ? '#c59a43' : '#b45309')
      .attr('stroke-width', 1.2);
  }, [dataset, chartWidth, yearDomain, isNight]);

  // D3.js 100-Year 7-Kawkab × 12-Buruj Occupancy Heatmap
  useEffect(() => {
    if (!heatmapSvgRef.current || dataset.summaries.length === 0) return;

    const svg = d3.select(heatmapSvgRef.current);
    svg.selectAll('*').remove();

    const isCompact = heatmapWidth < 600;
    const rowHeight = isCompact ? 30 : 34;
    const margin = {
      top: 34,
      right: 12,
      bottom: 12,
      left: isCompact ? 76 : 112,
    };
    const innerW = Math.max(180, heatmapWidth - margin.left - margin.right);
    const innerH = SEVEN_KAWKAB_KEYS.length * rowHeight;
    const totalH = innerH + margin.top + margin.bottom;

    svg.attr('viewBox', `0 0 ${heatmapWidth} ${totalH}`).attr('height', totalH);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xBand = d3
      .scaleBand<number>()
      .domain(ZODIAC_SIGNS.map((s) => s.index))
      .range([0, innerW])
      .padding(0.08);

    const yBand = d3
      .scaleBand<ClassicalKawkabKey>()
      .domain(SEVEN_KAWKAB_KEYS)
      .range([0, innerH])
      .padding(0.14);

    const maxPct = Math.max(
      14,
      d3.max(dataset.summaries, (row) => d3.max(row.signDistributionPct) || 0) || 18
    );

    const colorScale = d3
      .scaleSequential(
        isNight
          ? d3.interpolateRgb('#11192c', '#d9a441')
          : d3.interpolateRgb('#f5efe2', '#b45309')
      )
      .domain([0, maxPct]);

    // Top 12-Buruj column headers
    const headerG = g.append('g');
    ZODIAC_SIGNS.forEach((sign) => {
      const cx = (xBand(sign.index) ?? 0) + xBand.bandwidth() / 2;
      headerG
        .append('text')
        .attr('x', cx)
        .attr('y', -14)
        .attr('text-anchor', 'middle')
        .attr('fill', isNight ? '#cbd5e1' : '#4a3f31')
        .attr('font-size', isCompact ? '11px' : '12px')
        .text(sign.symbol);

      if (!isCompact) {
        headerG
          .append('text')
          .attr('x', cx)
          .attr('y', -3)
          .attr('text-anchor', 'middle')
          .attr('fill', isNight ? '#94a3b8' : '#6b5c48')
          .attr('font-size', '9px')
          .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
          .text(sign.latinName.slice(0, 3));
      }
    });

    // Left Kawkab row labels
    dataset.summaries.forEach((row) => {
      const meta = KAWKAB_META[row.key];
      const cy = (yBand(row.key) ?? 0) + yBand.bandwidth() / 2;
      g.append('text')
        .attr('x', -10)
        .attr('y', cy + 4)
        .attr('text-anchor', 'end')
        .attr('fill', getPlanetColor(row.key))
        .attr('font-size', isCompact ? '10.5px' : '11.5px')
        .attr('font-weight', '700')
        .text(isCompact ? `${meta.symbol} ${meta.transliteration.slice(0, 6)}` : `${meta.symbol} ${meta.transliteration}`);

      // 12 sign occupancy cells
      row.signDistributionPct.forEach((pct, signIndex) => {
        const cellX = xBand(signIndex) ?? 0;
        const cellY = yBand(row.key) ?? 0;
        const cellW = xBand.bandwidth();
        const cellH = yBand.bandwidth();

        const rect = g
          .append('rect')
          .attr('x', cellX)
          .attr('y', cellY)
          .attr('width', cellW)
          .attr('height', cellH)
          .attr('rx', 5)
          .attr('fill', colorScale(pct))
          .attr('stroke', isNight ? 'rgba(255,255,255,0.06)' : 'rgba(44,36,25,0.1)')
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          .on('mouseenter', function () {
            d3.select(this).attr('stroke', '#f59e0b').attr('stroke-width', 1.8);
            setHoveredHeatmapCell({ planet: row.key, signIndex, pct });
          })
          .on('mouseleave', function () {
            d3.select(this)
              .attr('stroke', isNight ? 'rgba(255,255,255,0.06)' : 'rgba(44,36,25,0.1)')
              .attr('stroke-width', 1);
            setHoveredHeatmapCell(null);
          })
          .on('click', () => {
            setVisiblePlanets({
              saturn: row.key === 'saturn',
              jupiter: row.key === 'jupiter',
              mars: row.key === 'mars',
              sun: row.key === 'sun',
              venus: row.key === 'venus',
              mercury: row.key === 'mercury',
              moon: row.key === 'moon',
            });
          });

        rect.append('title').text(
          `${meta.transliteration} di ${ZODIAC_SIGNS[signIndex].latinName}: ${pct}% dari 100 tahun`
        );

        if (!isCompact || cellW >= 26) {
          const isHighIntensity = pct >= maxPct * 0.58;
          g.append('text')
            .attr('x', cellX + cellW / 2)
            .attr('y', cellY + cellH / 2 + 3.5)
            .attr('text-anchor', 'middle')
            .attr('pointer-events', 'none')
            .attr(
              'fill',
              isHighIntensity
                ? isNight
                  ? '#090d16'
                  : '#ffffff'
                : isNight
                ? 'rgba(226, 232, 240, 0.85)'
                : 'rgba(44, 36, 25, 0.85)'
            )
            .attr('font-size', isCompact ? '8.5px' : '9.5px')
            .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
            .attr('font-weight', isHighIntensity ? '700' : '500')
            .text(`${pct.toFixed(0)}%`);
        }
      });
    });
  }, [dataset.summaries, heatmapWidth, isNight]);

  const cardSurface = isNight
    ? 'bg-[#101624] border-[#212e46] text-[#e5dccb]'
    : 'bg-[#faf6ee] border-[#dacdb2] text-[#2c2419]';

  const subSurface = isNight
    ? 'bg-[#0b101b] border-[#1d283e]'
    : 'bg-white border-[#e2d6bd]';

  const spanYearsDisplayed = Math.round(yearDomain[1] - yearDomain[0]);

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER & ANALYSIS CONTROLS */}
      <div className={`rounded-2xl border p-4 sm:p-6 space-y-4 ${cardSurface}`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <span className="font-arabic text-base">تَحْلِيلُ حَرَكَةِ الكَوَاكِبِ السَّبْعَةِ التَّارِيخِيَّة</span>
              <span aria-hidden="true">·</span>
              <span>Data Analisis Planet (100 Tahun)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
              Tren Historis Posisi 7 Kawkab ({dataset.startYear} – {dataset.endYear} M)
            </h1>
            <p className="text-xs sm:text-sm opacity-80 max-w-3xl leading-relaxed">
              Visualisasi interaktif D3.js atas pergerakan bujur ekliptika, skor martabat (<em>Qūwah al-Kawkab</em>), peta distribusi 12 Buruj, dan siklus Konjungsi Agung (<em>Qirān</em>) ketujuh planet klasik selama 100 tahun ke belakang berdasarkan ephemeris <em>Zij as-Sindhind</em>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${subSurface} hover:border-amber-500`}
            >
              <Download className="w-4 h-4 text-amber-500" />
              <span>Unduh CSV (100 Th)</span>
            </button>

            {onAnnotate && inspectedEpoch && (
              <button
                type="button"
                onClick={() => {
                  const lines = SEVEN_KAWKAB_KEYS.map((k) => {
                    const p = inspectedEpoch.planets[k];
                    const sign = ZODIAC_SIGNS[p.signIndex];
                    return `- ${KAWKAB_META[k].transliteration} (${KAWKAB_META[k].arabicName}): ${p.longitude.toFixed(2)}° (${p.signDegree}° ${sign.latinName}) · Martabat ${p.dignityScore >= 0 ? `+${p.dignityScore}` : p.dignityScore}`;
                  }).join('\n');
                  onAnnotate(
                    `Analisis Historis 7 Kawkab (${inspectedEpoch.gregorianLabel})`,
                    `Rentang Riset: ${dataset.startYear}–${dataset.endYear} M | Titik Inspeksi: ${inspectedEpoch.gregorianLabel} (${inspectedEpoch.hijriLabel})\nSeparasi Zuhal–Mushtari: ${inspectedEpoch.saturnJupiterSeparation}°\n\n${lines}`
                  );
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#c59a43] hover:bg-[#d4a84e] text-black text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>Catat Temuan</span>
              </button>
            )}
          </div>
        </div>

        {/* Unboxed Scientific Metadata Strip */}
        <div className="pt-3 border-t border-current/10 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs opacity-85 font-mono tabular-nums">
          <span>Rentang: {dataset.startYear}–{dataset.endYear} M ({spanYearsDisplayed} th ditampilkan)</span>
          <span aria-hidden="true">·</span>
          <span>Sampel: {dataset.points.length} epok</span>
          <span aria-hidden="true">·</span>
          <span>Konjungsi Agung Zuhal–Mushtari: {dataset.greatConjunctions.length} siklus</span>
          <span aria-hidden="true">·</span>
          <span className="font-sans">Koordinat: {observerLocation.name}</span>
        </div>

        {/* Mode Selector, Sampling Cadence & Span Controls */}
        <div className="pt-3 border-t border-current/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Chart Metric Segmented Control */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'longitude', label: 'Bujur Ekliptika (0°–360°)' },
                { id: 'dignity', label: 'Skor Martabat (Qūwah)' },
                { id: 'separation', label: 'Jarak Sudut Konjungsi (Qirān)' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setChartMode(m.id)}
                className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  chartMode === m.id
                    ? 'bg-[#c59a43] text-black border-[#c59a43] font-bold'
                    : `${subSurface} hover:border-amber-500/60 opacity-85 hover:opacity-100`
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Time Span & Cadence Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {chartMode === 'separation' && (
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-semibold opacity-75">Acuan:</label>
                <select
                  value={referencePlanet}
                  onChange={(e) => setReferencePlanet(e.target.value as ClassicalKawkabKey)}
                  className={`min-h-[40px] px-2.5 py-1 rounded-xl border text-xs font-medium ${subSurface}`}
                >
                  {SEVEN_KAWKAB_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {KAWKAB_META[k].symbol} {KAWKAB_META[k].transliteration}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-semibold opacity-75">Resolusi:</label>
              <select
                value={cadence}
                onChange={(e) => setCadence(e.target.value as SamplingCadence)}
                className={`min-h-[40px] px-2.5 py-1 rounded-xl border text-xs font-medium ${subSurface}`}
              >
                <option value="quarterly">Kuartalan (401 titik)</option>
                <option value="semiannual">Semesteran (201 titik)</option>
                <option value="annual">Tahunan (101 titik)</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              {[100, 50, 25, 10].map((span) => (
                <button
                  key={span}
                  type="button"
                  onClick={() => applyYearSpanPreset(span)}
                  className={`min-h-[40px] px-2.5 py-1 rounded-xl border text-xs font-mono tabular-nums cursor-pointer transition-colors ${
                    Math.abs(spanYearsDisplayed - span) <= 1
                      ? 'border-amber-500 text-amber-600 dark:text-amber-300 font-bold bg-amber-500/10'
                      : `${subSurface} hover:border-amber-500/60`
                  }`}
                >
                  {span}Th
                </button>
              ))}
            </div>

            <form onSubmit={handleJumpToYear} className="flex items-center gap-1">
              <input
                type="number"
                min={dataset.startYear}
                max={dataset.endYear}
                value={jumpYearInput}
                onChange={(e) => setJumpYearInput(e.target.value)}
                placeholder={`${dataset.startYear}–${dataset.endYear}`}
                aria-label="Lompat ke tahun historis"
                className={`w-28 min-h-[40px] px-2.5 py-1 rounded-xl border text-xs font-mono tabular-nums ${subSurface}`}
              />
              <button
                type="submit"
                className={`min-h-[40px] px-2.5 py-1 rounded-xl border text-xs font-semibold inline-flex items-center gap-1 cursor-pointer ${subSurface} hover:border-amber-500`}
                title="Zoom ke tahun historis tertentu"
              >
                <Search className="w-3.5 h-3.5 text-amber-500" />
                <span>Cari</span>
              </button>
            </form>
          </div>
        </div>

        {/* 7 Kawkab Visibility Toggles & Presets */}
        <div className="pt-3 border-t border-current/10 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold opacity-80 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span>Filter 7 Kawkab Klasik</span>
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => applyPlanetPreset('all')}
                className="text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
              >
                Semua 7 Kawkab
              </button>
              <span aria-hidden="true" className="opacity-40">·</span>
              <button
                type="button"
                onClick={() => applyPlanetPreset('upper')}
                className="text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
              >
                Planet Luar (Zuhal–Marrikh)
              </button>
              <span aria-hidden="true" className="opacity-40">·</span>
              <button
                type="button"
                onClick={() => applyPlanetPreset('inner')}
                className="text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
              >
                Luminaria &amp; Dalam
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SEVEN_KAWKAB_KEYS.map((key) => {
              const meta = KAWKAB_META[key];
              const isOn = visiblePlanets[key];
              const color = getPlanetColor(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePlanet(key)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isOn ? subSurface : 'border-current/10 opacity-45 hover:opacity-75'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-mono">{meta.symbol}</span>
                  <span className="font-semibold">{meta.transliteration}</span>
                  <span className="font-arabic text-sm opacity-80">{meta.arabicName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN D3 VISUALIZATION STAGE + LIVE CROSSHAIR INSPECTOR */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* D3 Multi-Line Chart & Brush Timeline (8 cols on XL) */}
        <div className={`xl:col-span-8 rounded-2xl border p-4 sm:p-5 space-y-3 ${cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold flex items-center gap-2">
                <LineChart className="w-4 h-4 text-amber-500" />
                <span>
                  {chartMode === 'longitude'
                    ? 'Grafik Bujur Ekliptika 12 Buruj (0°–360°)'
                    : chartMode === 'dignity'
                    ? 'Grafik Kekuatan Martabat Esensial (-9 s/d +12)'
                    : `Separasi Sudut terhadap ${KAWKAB_META[referencePlanet].transliteration} (0°–180°)`}
                </span>
              </h2>
              <p className="text-[11px] opacity-75">
                Arahkan kursor atau ketuk grafik untuk inspeksi presisi; seret rentang di bilah bawah untuk zoom dekade tertentu.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {chartMode === 'longitude' && (
                <button
                  type="button"
                  onClick={() => setShowZodiacBands((prev) => !prev)}
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg border text-[11px] font-medium cursor-pointer flex items-center gap-1 ${
                    showZodiacBands
                      ? 'border-amber-500/50 text-amber-600 dark:text-amber-300 bg-amber-500/10'
                      : subSurface
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Pita Buruj</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowConjunctionMarkers((prev) => !prev)}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg border text-[11px] font-medium cursor-pointer ${
                  showConjunctionMarkers
                    ? 'border-amber-500/50 text-amber-600 dark:text-amber-300 bg-amber-500/10'
                    : subSurface
                }`}
              >
                Tanda Qirān
              </button>

              {spanYearsDisplayed < 99 && (
                <button
                  type="button"
                  onClick={() => setYearDomain([dataset.startYear, dataset.endYear])}
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg border text-[11px] font-medium cursor-pointer flex items-center gap-1 ${subSurface} hover:border-amber-500`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset 100 Th</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary D3 SVG Canvas */}
          <div ref={chartWrapperRef} className={`w-full rounded-xl border p-2 overflow-hidden ${subSurface}`}>
            <svg ref={mainSvgRef} className="w-full block select-none" />
          </div>

          {/* Mini 100-Year Overview Brush Timeline */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] opacity-75 px-1">
              <span>Bilah Navigasi 100 Tahun (Gelombang Separasi Zuhal–Mushtari)</span>
              <span className="font-mono tabular-nums">
                {Math.round(yearDomain[0])} – {Math.round(yearDomain[1])} M
              </span>
            </div>
            <div className={`w-full rounded-xl border px-2 py-1 overflow-hidden ${subSurface}`}>
              <svg ref={brushSvgRef} className="w-full block select-none" />
            </div>
          </div>
        </div>

        {/* Right Side: Crosshair Historical Epoch Inspector (4 cols on XL) */}
        <div className={`xl:col-span-4 rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
          <div className="flex items-start justify-between gap-2 border-b border-current/10 pb-3">
            <div>
              <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5" />
                <span>{hoveredEpoch ? 'Pratinjau Kursor' : 'Epok Terpilih'}</span>
              </div>
              {inspectedEpoch && (
                <>
                  <h3 className="text-base sm:text-lg font-serif font-bold font-mono tabular-nums mt-0.5">
                    {inspectedEpoch.gregorianLabel}
                  </h3>
                  <div className="text-xs opacity-80">
                    {inspectedEpoch.hijriLabel} · JDN {inspectedEpoch.jdn.toFixed(1)}
                  </div>
                </>
              )}
            </div>

            {onApplyDate && inspectedEpoch && (
              <button
                type="button"
                onClick={() =>
                  onApplyDate(
                    inspectedEpoch.year,
                    inspectedEpoch.month,
                    inspectedEpoch.day,
                    12,
                    0
                  )
                }
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#c59a43] hover:bg-[#d4a84e] text-black text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
                title="Terapkan tanggal epok historis ini ke seluruh aplikasi Astrolab"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Buka Epok</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {inspectedEpoch && (
            <>
              <div className="space-y-2">
                {SEVEN_KAWKAB_KEYS.map((key) => {
                  const meta = KAWKAB_META[key];
                  const sample = inspectedEpoch.planets[key];
                  const sign = ZODIAC_SIGNS[sample.signIndex];
                  const color = getPlanetColor(key);
                  const isVisible = visiblePlanets[key];

                  return (
                    <div
                      key={key}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-opacity ${subSurface} ${
                        isVisible ? 'opacity-100' : 'opacity-45'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span
                            className="w-2 h-2 rounded-xs shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-mono">{meta.symbol}</span>
                          <span className="font-bold truncate">{meta.transliteration}</span>
                          <span className="font-arabic text-sm opacity-75">{meta.arabicName}</span>
                        </div>
                        <div className="text-[11px] opacity-75 mt-0.5 truncate">
                          Manzil #{sample.manzilNumber} {sample.manzilName}
                          {sample.isCombust ? ' · Iḥtirāq (Terbakar)' : ''}
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono tabular-nums">
                        <div className="text-xs font-bold">
                          {sign.symbol} {String(sample.signDegree).padStart(2, '0')}°
                          {String(sample.signMinutes).padStart(2, '0')}' {sign.latinName}
                        </div>
                        <div className="text-[11px] opacity-80">
                          {sample.longitude.toFixed(1)}° · Martabat{' '}
                          <span
                            className={
                              sample.dignityScore > 0
                                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                : sample.dignityScore < 0
                                ? 'text-rose-600 dark:text-rose-400 font-bold'
                                : ''
                            }
                          >
                            {sample.dignityScore > 0
                              ? `+${sample.dignityScore}`
                              : sample.dignityScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`p-3 rounded-xl border text-xs space-y-1 ${subSurface}`}>
                <div className="font-semibold opacity-80">Separasi Zuhal – al-Mushtari</div>
                <div className="text-lg font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {inspectedEpoch.saturnJupiterSeparation.toFixed(2)}°
                </div>
                <p className="text-[11px] opacity-75 leading-relaxed">
                  {inspectedEpoch.saturnJupiterSeparation <= 10
                    ? 'Fase Qirān (Konjungsi Agung) — transisi siklus sosio-historis besar dalam kitab Ahkam al-Mawlayin.'
                    : inspectedEpoch.saturnJupiterSeparation >= 170
                    ? 'Fase Muqābalah (Oposisi 180°) — puncak polarisasi siklus dua planet luar.'
                    : Math.abs(inspectedEpoch.saturnJupiterSeparation - 90) <= 10
                    ? 'Fase Tarbīʿ (Kuartil 90°) — titik uji ketegangan struktural siklus 20 tahunan.'
                    : 'Fase perjalanan orbital antar-konjungsi (siklus sinodik ~19,86 tahun).'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* HISTORICAL RESEARCH TABLES: GREAT CONJUNCTIONS + 7 KAWKAB CENTURY STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Great Conjunctions Table (5 cols) */}
        <div className={`lg:col-span-5 rounded-2xl border p-4 sm:p-5 space-y-3 ${cardSurface}`}>
          <div className="flex items-center justify-between gap-2 border-b border-current/10 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Daftar Qirān Agung 100 Tahun</span>
              </h2>
              <p className="text-[11px] opacity-75">
                Konjungsi Zuhal–Mushtari ({dataset.startYear}–{dataset.endYear} M) · klik baris untuk zoom
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums opacity-75">
              {dataset.greatConjunctions.length} peristiwa
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-current/15 text-[11px] opacity-75">
                  <th className="py-2 pr-2 font-semibold">Tarikh Masehi / Hijri</th>
                  <th className="py-2 px-2 font-semibold">Buruj &amp; Unsur</th>
                  <th className="py-2 pl-2 text-right font-semibold">Bujur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/10 font-mono tabular-nums">
                {dataset.greatConjunctions.map((ev) => (
                  <tr
                    key={ev.year}
                    onClick={() => {
                      const minY = Math.max(dataset.startYear, ev.year - 6);
                      const maxY = Math.min(dataset.endYear, ev.year + 6);
                      setYearDomain([minY, maxY]);
                      const closest = dataset.points.reduce((best, curr) =>
                        Math.abs(curr.decimalYear - ev.decimalYear) <
                        Math.abs(best.decimalYear - ev.decimalYear)
                          ? curr
                          : best
                      );
                      setPinnedEpoch(closest);
                    }}
                    className="hover:bg-amber-500/10 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 pr-2">
                      <div className="font-bold">{ev.gregorianLabel}</div>
                      <div className="text-[10px] font-sans opacity-75">{ev.hijriLabel}</div>
                    </td>
                    <td className="py-2.5 px-2 font-sans">
                      <div className="font-semibold">
                        {ZODIAC_SIGNS[ev.signIndex].symbol} {ev.signLatin}{' '}
                        <span className="font-arabic text-sm opacity-80">{ev.signArabic}</span>
                      </div>
                      <div className="text-[10px] opacity-75">
                        Unsur {ev.element} · Δ {ev.separationDeg}°
                      </div>
                    </td>
                    <td className="py-2.5 pl-2 text-right font-bold text-amber-600 dark:text-amber-400">
                      {ev.longitude.toFixed(1)}°
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 100-Year 7 Kawkab Statistical Summary Table (7 cols) */}
        <div className={`lg:col-span-7 rounded-2xl border p-4 sm:p-5 space-y-3 ${cardSurface}`}>
          <div className="border-b border-current/10 pb-3">
            <h2 className="text-sm sm:text-base font-serif font-bold">
              Ringkasan Statistik 100 Tahun (7 Kawkab)
            </h2>
            <p className="text-[11px] opacity-75">
              Rerata martabat, puncak kekuatan (<em>Sharaf/Bayt</em>), estimasi putaran revolusi zodiak, dan rasio <em>Iḥtirāq</em>.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-current/15 text-[11px] opacity-75">
                  <th className="py-2 pr-3 font-semibold">Kawkab</th>
                  <th className="py-2 px-2 text-right font-semibold">Revolusi</th>
                  <th className="py-2 px-2 text-right font-semibold">Rerata Martabat</th>
                  <th className="py-2 px-2 font-semibold">Puncak Martabat</th>
                  <th className="py-2 px-2 font-semibold">Posisi Akhir ({dataset.endYear})</th>
                  <th className="py-2 pl-2 text-right font-semibold">Iḥtirāq</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/10 font-mono tabular-nums">
                {dataset.summaries.map((row) => {
                  const meta = KAWKAB_META[row.key];
                  return (
                    <tr key={row.key} className="hover:bg-current/5 transition-colors">
                      <td className="py-2.5 pr-3 font-sans whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-xs shrink-0"
                            style={{ backgroundColor: getPlanetColor(row.key) }}
                          />
                          <span className="font-mono">{meta.symbol}</span>
                          <span className="font-bold">{meta.transliteration}</span>
                          <span className="font-arabic text-sm opacity-75">{meta.arabicName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right">{row.estimatedRevolutions}×</td>
                      <td className="py-2.5 px-2 text-right">
                        <span
                          className={
                            row.avgDignity > 0
                              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                              : row.avgDignity < 0
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : ''
                          }
                        >
                          {row.avgDignity > 0 ? `+${row.avgDignity.toFixed(2)}` : row.avgDignity.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-sans whitespace-nowrap">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{row.maxDignity}
                        </span>{' '}
                        <span className="opacity-80">
                          ({row.maxDignityYear} · {row.maxDignitySign})
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-sans whitespace-nowrap">
                        {row.latestSignLabel}
                      </td>
                      <td className="py-2.5 pl-2 text-right opacity-80">
                        {row.key === 'sun' ? '—' : `${row.combustionRatioPct}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* D3.JS 100-YEAR BURUJ OCCUPANCY HEATMAP (7 KAWKAB × 12 BURUJ) */}
      <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardSurface}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/10 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-serif font-bold flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-amber-500" />
              <span>Peta Distribusi 12 Buruj 100 Tahun (D3.js Heatmap)</span>
            </h2>
            <p className="text-[11px] opacity-75">
              Persentase durasi keberadaan tiap kawkab di 12 rasi zodiak ({dataset.startYear}–{dataset.endYear} M). Klik sel mana pun untuk memfokuskan kurva planet tersebut di grafik utama.
            </p>
          </div>
          <div className="text-xs font-mono tabular-nums opacity-85">
            {hoveredHeatmapCell ? (
              <span>
                {KAWKAB_META[hoveredHeatmapCell.planet].symbol}{' '}
                {KAWKAB_META[hoveredHeatmapCell.planet].transliteration} ·{' '}
                {ZODIAC_SIGNS[hoveredHeatmapCell.signIndex].symbol}{' '}
                {ZODIAC_SIGNS[hoveredHeatmapCell.signIndex].latinName}:{' '}
                <strong className="text-amber-500">{hoveredHeatmapCell.pct.toFixed(1)}%</strong>
              </span>
            ) : (
              <span>7 Kawkab × 12 Buruj</span>
            )}
          </div>
        </div>

        <div ref={heatmapWrapperRef} className={`w-full rounded-xl border p-2 overflow-hidden ${subSurface}`}>
          <svg ref={heatmapSvgRef} className="w-full block select-none" />
        </div>
      </div>
    </div>
  );
};
