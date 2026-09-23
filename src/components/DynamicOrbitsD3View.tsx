import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  HistoricalDateInfo,
  PlanetKey,
  PlanetaryPosition,
  ThemeMode,
} from '../types';
import {
  SINDHIND_PLANET_ORBIT_PARAMS,
  calculateHeliocentricPosition,
  calculateGeocentricSindhindPosition,
  SindhindOrbitParams,
} from '../lib/sindhindOrbits';
import { ZODIAC_SIGNS, PLANETS_INFO } from '../lib/sindhindEngine';
import { getFullHistoricalDate } from '../lib/calendarConverter';
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Sliders,
  Sparkles,
  Compass,
  Info,
  Check,
  ChevronRight,
  HelpCircle,
  Calendar,
  Layers,
} from 'lucide-react';

interface DynamicOrbitsD3ViewProps {
  currentDateInfo: HistoricalDateInfo;
  positions: Record<PlanetKey, PlanetaryPosition>;
  theme: ThemeMode;
  onApplyDate: (year: number, month: number, day: number, hour: number, minute: number) => void;
  onOpenAnnotation?: (targetTitle: string) => void;
}

type ModelPerspective = 'heliocentric' | 'geocentric';

interface TrailPoint {
  x: number;
  y: number;
  jdn: number;
}

export const DynamicOrbitsD3View: React.FC<DynamicOrbitsD3ViewProps> = ({
  currentDateInfo,
  positions,
  theme,
  onApplyDate,
  onOpenAnnotation,
}) => {
  const isNight = theme === 'night';
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Perspective Mode: Heliosentris vs Geosentris (Al-Hamil & At-Tadwir)
  const [perspective, setPerspective] = useState<ModelPerspective>('geocentric');

  // Animation and Simulation state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simSpeedDaysPerSec, setSimSpeedDaysPerSec] = useState<number>(10); // days per second
  const [simJdn, setSimJdn] = useState<number>(currentDateInfo.jdn);

  // Selected planet for details inspection
  const [selectedPlanetKey, setSelectedPlanetKey] = useState<string>('mars');

  // Visibility toggles
  const [visiblePlanets, setVisiblePlanets] = useState<Record<string, boolean>>({
    moon: true,
    mercury: true,
    venus: true,
    sun: true,
    earth: true,
    mars: true,
    jupiter: true,
    saturn: true,
  });

  const [showEpicycles, setShowEpicycles] = useState<boolean>(true);
  const [showSightlines, setShowSightlines] = useState<boolean>(true);
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showZodiacRing, setShowZodiacRing] = useState<boolean>(true);
  const [showArabicLabels, setShowArabicLabels] = useState<boolean>(true);

  // Trail storage for geocentric spirograph / retrograde loops
  const trailsRef = useRef<Record<string, TrailPoint[]>>({});

  // Sync simulation JDN when external currentDateInfo changes and simulation is paused
  useEffect(() => {
    if (!isPlaying) {
      setSimJdn(currentDateInfo.jdn);
      // Reset trails when date significantly jumps
      trailsRef.current = {};
    }
  }, [currentDateInfo.jdn, isPlaying]);

  // Animation loop with requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      setSimJdn((prevJdn) => {
        const nextJdn = prevJdn + deltaSec * simSpeedDaysPerSec;
        return nextJdn;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, simSpeedDaysPerSec]);

  // Sync back to global app when user stops or applies simulation
  const handleApplySimulatedDateToApp = () => {
    // Convert current simJdn back to Gregorian date
    const z = Math.floor(simJdn + 0.5);
    const a = Math.floor((z - 1867216.25) / 36524.25);
    const b = z + 1 + a - Math.floor(a / 4);
    const c = b + 1524;
    const d = Math.floor((c - 122.1) / 365.25);
    const e = Math.floor(365.25 * d);
    const g = Math.floor((c - e) / 30.6001);
    const day = Math.floor(c - e - Math.floor(30.6001 * g));
    const month = g < 14 ? g - 1 : g - 13;
    const year = month > 2 ? d - 4716 : d - 4715;

    onApplyDate(year, month, day, 12, 0);
  };

  // Convert simulated JDN to display dates
  const simDateInfo = useMemo(() => {
    const z = Math.floor(simJdn + 0.5);
    const a = Math.floor((z - 1867216.25) / 36524.25);
    const b = z + 1 + a - Math.floor(a / 4);
    const c = b + 1524;
    const d = Math.floor((c - 122.1) / 365.25);
    const e = Math.floor(365.25 * d);
    const g = Math.floor((c - e) / 30.6001);
    const day = Math.floor(c - e - Math.floor(30.6001 * g));
    const month = g < 14 ? g - 1 : g - 13;
    const year = month > 2 ? d - 4716 : d - 4715;
    return { year, month, day };
  }, [simJdn]);

  // Planetary positions calculated from Sindhind models
  const calculatedPositions = useMemo(() => {
    const result: Record<string, ReturnType<typeof calculateHeliocentricPosition>> = {};
    const keys = ['moon', 'mercury', 'venus', 'earth', 'sun', 'mars', 'jupiter', 'saturn'];

    keys.forEach((k) => {
      if (perspective === 'heliocentric') {
        result[k] = calculateHeliocentricPosition(k, simJdn);
      } else {
        result[k] = calculateGeocentricSindhindPosition(k, simJdn, 1.0);
      }
    });

    return result;
  }, [perspective, simJdn]);

  // Update trails for visible planets
  useEffect(() => {
    const keys = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'sun', 'moon'];
    keys.forEach((k) => {
      if (!trailsRef.current[k]) trailsRef.current[k] = [];
      const pos = calculatedPositions[k];
      if (pos) {
        trailsRef.current[k].push({ x: pos.x, y: pos.y, jdn: simJdn });
        // Keep trail length constrained
        if (trailsRef.current[k].length > 180) {
          trailsRef.current[k].shift();
        }
      }
    });
  }, [calculatedPositions, simJdn]);

  // D3 Render effect with Zoom/Pan & Responsive ResizeObserver
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const { clientWidth: width, clientHeight: height } = container;

    if (width === 0 || height === 0) return;

    svg.attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    // Definitions (gradients, glow filters, marker arrows)
    const defs = svg.append('defs');

    // Glow filter for Sun
    const filter = defs.append('filter').attr('id', 'sun-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Central transformation group
    const g = svg.append('g').attr('id', 'orbit-stage');

    // Configure Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Initial centering and scale
    const baseRadius = Math.min(width, height) * 0.44;
    // Scale domain: in heliocentric mode, Saturn is at ~9.6 AU; in geocentric mode, Saturn is at ~2.8 units
    const maxAU = perspective === 'heliocentric' ? 10.5 : 3.4;
    const scale = d3.scaleLinear().domain([-maxAU, maxAU]).range([-baseRadius, baseRadius]);

    // Center transform
    const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2);
    svg.call(zoom.transform, initialTransform);

    // 1. Draw Zodiac Outer Ring (Falak al-Buruj)
    if (showZodiacRing) {
      const zodiacRadius = baseRadius * 0.98;
      const zodiacInnerRadius = baseRadius * 0.88;

      const zodiacGroup = g.append('g').attr('class', 'zodiac-ring');

      // Outer and inner rim circles
      zodiacGroup
        .append('circle')
        .attr('r', zodiacRadius)
        .attr('fill', 'none')
        .attr('stroke', isNight ? '#384b6d' : '#c9baa0')
        .attr('stroke-width', 1.5);

      zodiacGroup
        .append('circle')
        .attr('r', zodiacInnerRadius)
        .attr('fill', 'none')
        .attr('stroke', isNight ? '#26344d' : '#dfd4be')
        .attr('stroke-width', 1);

      // 12 Sector Dividers & Names
      ZODIAC_SIGNS.forEach((sign, idx) => {
        const startAngle = (idx * 30 * Math.PI) / 180;
        const midAngle = ((idx * 30 + 15) * Math.PI) / 180;

        // Radial boundary line
        const x1 = zodiacInnerRadius * Math.cos(startAngle);
        const y1 = zodiacInnerRadius * Math.sin(startAngle);
        const x2 = zodiacRadius * Math.cos(startAngle);
        const y2 = zodiacRadius * Math.sin(startAngle);

        zodiacGroup
          .append('line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('stroke', isNight ? '#26344d' : '#dfd4be')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '2,2');

        // Sector arc label
        const textR = (zodiacRadius + zodiacInnerRadius) / 2;
        const tx = textR * Math.cos(midAngle);
        const ty = textR * Math.sin(midAngle);

        zodiacGroup
          .append('text')
          .attr('x', tx)
          .attr('y', ty)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', '10px')
          .attr('font-family', 'Amiri, serif')
          .attr('fill', isNight ? '#c59a43' : '#8c6114')
          .attr('opacity', 0.85)
          .text(showArabicLabels ? sign.arabicName : sign.symbol);
      });
    }

    // 2. Draw Trails (Spirograf / Orbit Loop)
    if (showTrails) {
      const trailsGroup = g.append('g').attr('class', 'trails');
      Object.keys(trailsRef.current).forEach((k) => {
        if (!visiblePlanets[k]) return;
        const pts = trailsRef.current[k];
        if (!pts || pts.length < 2) return;

        const lineGenerator = d3
          .line<TrailPoint>()
          .x((d) => scale(d.x))
          .y((d) => scale(d.y))
          .curve(d3.curveBasis);

        const params = SINDHIND_PLANET_ORBIT_PARAMS[k];
        trailsGroup
          .append('path')
          .datum(pts)
          .attr('d', lineGenerator)
          .attr('fill', 'none')
          .attr('stroke', params?.color || '#cbd5e1')
          .attr('stroke-width', k === selectedPlanetKey ? 2 : 1)
          .attr('stroke-opacity', k === selectedPlanetKey ? 0.75 : 0.35)
          .attr('stroke-dasharray', k === 'moon' ? '2,3' : 'none');
      });
    }

    // 3. Draw Deferent Circles & Epicycles (Geocentric Mode) OR Orbital Ellipses (Heliocentric Mode)
    const orbitsGroup = g.append('g').attr('class', 'orbits');

    if (perspective === 'geocentric') {
      // In Geocentric mode: Draw Deferent circles around Earth
      const geocentricKeys = ['moon', 'mercury', 'venus', 'sun', 'mars', 'jupiter', 'saturn'];

      geocentricKeys.forEach((k) => {
        if (!visiblePlanets[k]) return;
        const params = SINDHIND_PLANET_ORBIT_PARAMS[k];
        const pos = calculatedPositions[k];
        if (!pos) return;

        // Radius of Deferent from Earth
        const rDef = Math.sqrt(
          (pos.deferentX ?? pos.x) * (pos.deferentX ?? pos.x) +
          (pos.deferentY ?? pos.y) * (pos.deferentY ?? pos.y)
        );

        // Deferent ring
        orbitsGroup
          .append('circle')
          .attr('r', Math.abs(scale(rDef) - scale(0)))
          .attr('fill', 'none')
          .attr('stroke', params.color)
          .attr('stroke-opacity', k === selectedPlanetKey ? 0.45 : 0.18)
          .attr('stroke-width', k === selectedPlanetKey ? 1.5 : 1)
          .attr('stroke-dasharray', '4,4');

        // Epicycle (Falak at-Tadwir)
        if (showEpicycles && k !== 'sun') {
          const defX = scale(pos.deferentX ?? 0);
          const defY = scale(pos.deferentY ?? 0);
          const pX = scale(pos.x);
          const pY = scale(pos.y);
          const rEpi = Math.sqrt((pX - defX) * (pX - defX) + (pY - defY) * (pY - defY));

          // Epicycle center node
          orbitsGroup
            .append('circle')
            .attr('cx', defX)
            .attr('cy', defY)
            .attr('r', 2)
            .attr('fill', params.color)
            .attr('opacity', 0.6);

          // Epicycle perimeter
          orbitsGroup
            .append('circle')
            .attr('cx', defX)
            .attr('cy', defY)
            .attr('r', Math.max(rEpi, 3))
            .attr('fill', params.color)
            .attr('fill-opacity', k === selectedPlanetKey ? 0.08 : 0.03)
            .attr('stroke', params.color)
            .attr('stroke-width', k === selectedPlanetKey ? 1.5 : 0.8)
            .attr('stroke-opacity', k === selectedPlanetKey ? 0.7 : 0.3)
            .attr('stroke-dasharray', '2,2');

          // Radius vector from epicycle center to planet
          orbitsGroup
            .append('line')
            .attr('x1', defX)
            .attr('y1', defY)
            .attr('x2', pX)
            .attr('y2', pY)
            .attr('stroke', params.color)
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.5);
        }

        // Sightline from Earth (center) through planet to zodiac
        if (showSightlines && k === selectedPlanetKey) {
          const pX = scale(pos.x);
          const pY = scale(pos.y);
          const dist = Math.sqrt(pX * pX + pY * pY);
          const normX = pX / dist;
          const normY = pY / dist;
          const zodiacR = baseRadius * 0.95;

          orbitsGroup
            .append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', normX * zodiacR)
            .attr('y2', normY * zodiacR)
            .attr('stroke', '#38bdf8')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '3,3')
            .attr('opacity', 0.7);
        }
      });
    } else {
      // In Heliocentric mode: Draw circular orbits around Sun
      const helioKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn'];

      helioKeys.forEach((k) => {
        if (!visiblePlanets[k]) return;
        const params = SINDHIND_PLANET_ORBIT_PARAMS[k];
        const rOrbit = params.radiusAU;

        orbitsGroup
          .append('circle')
          .attr('r', Math.abs(scale(rOrbit) - scale(0)))
          .attr('fill', 'none')
          .attr('stroke', params.color)
          .attr('stroke-opacity', k === selectedPlanetKey ? 0.45 : 0.2)
          .attr('stroke-width', k === selectedPlanetKey ? 1.5 : 1)
          .attr('stroke-dasharray', '3,3');

        // Line of sight from Earth to Selected Planet
        if (showSightlines && k === selectedPlanetKey && k !== 'earth') {
          const earthPos = calculatedPositions['earth'];
          const targetPos = calculatedPositions[k];
          if (earthPos && targetPos) {
            orbitsGroup
              .append('line')
              .attr('x1', scale(earthPos.x))
              .attr('y1', scale(earthPos.y))
              .attr('x2', scale(targetPos.x))
              .attr('y2', scale(targetPos.y))
              .attr('stroke', '#38bdf8')
              .attr('stroke-width', 1.2)
              .attr('stroke-dasharray', '3,3')
              .attr('opacity', 0.8);
          }
        }
      });
    }

    // 4. Center Body (Earth in Geocentric, Sun in Heliocentric)
    const centerGroup = g.append('g').attr('class', 'center-body');
    if (perspective === 'geocentric') {
      // Earth at Center
      centerGroup
        .append('circle')
        .attr('r', 9)
        .attr('fill', '#38bdf8')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5)
        .attr('filter', 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.6))');

      centerGroup
        .append('text')
        .attr('y', 17)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'Amiri, serif')
        .attr('fill', isNight ? '#e2e8f0' : '#1e293b')
        .text('الأرض (Baghdad, 33°N)');
    } else {
      // Sun at Center
      centerGroup
        .append('circle')
        .attr('r', 13)
        .attr('fill', '#fbbf24')
        .attr('stroke', '#fef08a')
        .attr('stroke-width', 2)
        .attr('filter', 'url(#sun-glow)');

      centerGroup
        .append('text')
        .attr('y', 23)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-family', 'Amiri, serif')
        .attr('font-weight', 'bold')
        .attr('fill', '#f59e0b')
        .text('الشمس (Markaz al-Falak)');
    }

    // 5. Draw Planet Nodes with Interactive Clicks & Tooltips
    const planetsGroup = g.append('g').attr('class', 'planets');

    const activeKeys =
      perspective === 'geocentric'
        ? ['moon', 'mercury', 'venus', 'sun', 'mars', 'jupiter', 'saturn']
        : ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn'];

    activeKeys.forEach((k) => {
      if (!visiblePlanets[k]) return;
      const params = SINDHIND_PLANET_ORBIT_PARAMS[k];
      const pos = calculatedPositions[k];
      if (!pos) return;

      const px = scale(pos.x);
      const py = scale(pos.y);
      const isSelected = k === selectedPlanetKey;

      const node = planetsGroup
        .append('g')
        .attr('class', `planet-node planet-${k}`)
        .attr('transform', `translate(${px}, ${py})`)
        .style('cursor', 'pointer')
        .on('click', () => {
          setSelectedPlanetKey(k);
        });

      // Highlight pulse halo if selected
      if (isSelected) {
        node
          .append('circle')
          .attr('r', 14)
          .attr('fill', 'none')
          .attr('stroke', params.color)
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '3,2')
          .attr('opacity', 0.85);
      }

      // Planet sphere body
      const bodyRadius = k === 'sun' ? 10 : k === 'jupiter' ? 7.5 : k === 'saturn' ? 7 : k === 'moon' ? 4 : 5.5;
      node
        .append('circle')
        .attr('r', bodyRadius)
        .attr('fill', params.color)
        .attr('stroke', isNight ? '#0b0f19' : '#ffffff')
        .attr('stroke-width', 1.2)
        .attr('filter', isSelected ? 'drop-shadow(0 0 6px rgba(197, 154, 67, 0.8))' : 'none');

      // Saturn Rings
      if (k === 'saturn') {
        node
          .append('ellipse')
          .attr('rx', 13)
          .attr('ry', 4.5)
          .attr('fill', 'none')
          .attr('stroke', params.color)
          .attr('stroke-width', 1.2)
          .attr('transform', 'rotate(-25)')
          .attr('opacity', 0.8);
      }

      // Retrograde Indicator (Raju')
      if (perspective === 'geocentric' && pos.isRetrograde) {
        node
          .append('text')
          .attr('x', 9)
          .attr('y', -7)
          .attr('font-size', '9px')
          .attr('font-family', 'Cinzel, sans-serif')
          .attr('font-weight', 'bold')
          .attr('fill', '#ef4444')
          .text('℞');
      }

      // Label
      node
        .append('text')
        .attr('x', 0)
        .attr('y', bodyRadius + 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'Amiri, serif')
        .attr('fill', isNight ? '#e2e8f0' : '#1e293b')
        .attr('font-weight', isSelected ? 'bold' : 'normal')
        .text(showArabicLabels ? `${params.arabicName}` : params.transliteration);
    });
  }, [
    perspective,
    calculatedPositions,
    selectedPlanetKey,
    visiblePlanets,
    showEpicycles,
    showSightlines,
    showTrails,
    showZodiacRing,
    showArabicLabels,
    isNight,
  ]);

  // Selected Planet Sindhind parameters data
  const selectedParams: SindhindOrbitParams = SINDHIND_PLANET_ORBIT_PARAMS[selectedPlanetKey] || SINDHIND_PLANET_ORBIT_PARAMS.mars;
  const selectedPos = calculatedPositions[selectedPlanetKey];

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Deck */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isNight
            ? 'bg-[#101726] border-[#23324d] text-[#e2d9c8]'
            : 'bg-[#faf5ec] border-[#e2d8c3] text-[#2d2417]'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Title & Perspective Tabs */}
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#c59a43]/20 flex items-center justify-center text-[#c59a43]">
                <Compass className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#c59a43]">
                  Visualisasi Orbit Dinamis Zij as-Sindhind (D3.js)
                </h3>
                <p className="text-xs font-serif opacity-80" dir="rtl">
                  هيئة مسير الأفلاك: الفلك الحامل والتدوير وفلك الشمس في زيج السندهند
                </p>
              </div>
            </div>
          </div>

          {/* Perspective Selector (Geocentric vs Heliocentric) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-current/5 border border-current/10 self-stretch sm:self-auto">
            <button
              onClick={() => {
                setPerspective('geocentric');
                trailsRef.current = {};
              }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all flex items-center justify-center gap-1.5 ${
                perspective === 'geocentric'
                  ? 'bg-[#c59a43] text-black shadow-md'
                  : 'hover:bg-current/10 opacity-75'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Geosentris: Al-Hamil & At-Tadwir (Bumi)</span>
            </button>

            <button
              onClick={() => {
                setPerspective('heliocentric');
                trailsRef.current = {};
              }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all flex items-center justify-center gap-1.5 ${
                perspective === 'heliocentric'
                  ? 'bg-[#c59a43] text-black shadow-md'
                  : 'hover:bg-current/10 opacity-75'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Heliosentris: Falak ash-Shams (Matahari)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Timeline Player & Controls */}
        <div className="mt-4 pt-3 border-t border-current/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Playback buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-[#c59a43] hover:bg-[#d6aa52] text-black'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Jeda Simulasi' : 'Jalankan Orbit'}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setSimJdn(currentDateInfo.jdn);
                trailsRef.current = {};
              }}
              className={`p-1.5 rounded-lg border transition-colors ${
                isNight
                  ? 'bg-[#182236] hover:bg-[#22314d] border-[#293954]'
                  : 'bg-[#eee4d2] hover:bg-[#e4dac6] border-[#dacdb2]'
              }`}
              title="Reset ke Tarikh Hisab Asli"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Step Controls */}
            <div className="flex items-center rounded-lg border border-current/10 overflow-hidden">
              <button
                onClick={() => setSimJdn((j) => j - 1)}
                className="px-2 py-1 hover:bg-current/10 text-[11px] font-mono"
                title="-1 Hari"
              >
                -1h
              </button>
              <button
                onClick={() => setSimJdn((j) => j - 30)}
                className="px-2 py-1 hover:bg-current/10 text-[11px] font-mono border-l border-current/10"
                title="-30 Hari"
              >
                -30h
              </button>
              <button
                onClick={() => setSimJdn((j) => j + 1)}
                className="px-2 py-1 hover:bg-current/10 text-[11px] font-mono border-l border-current/10"
                title="+1 Hari"
              >
                +1h
              </button>
              <button
                onClick={() => setSimJdn((j) => j + 30)}
                className="px-2 py-1 hover:bg-current/10 text-[11px] font-mono border-l border-current/10"
                title="+30 Hari"
              >
                +30h
              </button>
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2">
            <span className="opacity-70 text-[11px]">Kecepatan:</span>
            {[
              { val: 1, label: '1x' },
              { val: 10, label: '10x' },
              { val: 30, label: '30x' },
              { val: 90, label: '90x' },
              { val: 365, label: '1 thn/dtk' },
            ].map((spd) => (
              <button
                key={spd.val}
                onClick={() => setSimSpeedDaysPerSec(spd.val)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  simSpeedDaysPerSec === spd.val
                    ? 'bg-[#c59a43] text-black font-bold'
                    : 'bg-current/5 hover:bg-current/10 opacity-75'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>

          {/* Simulated Date Readout & Sync Button */}
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-lg border font-mono text-[11px] flex items-center gap-2 ${
                isNight ? 'bg-[#0a0f18] border-[#1e2a3f]' : 'bg-[#ffffff] border-[#d8cca8]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#c59a43]" />
              <span>
                {simDateInfo.day}/{simDateInfo.month}/{simDateInfo.year} M
              </span>
              <span className="opacity-40">|</span>
              <span className="text-[#38bdf8]">JDN {simJdn.toFixed(1)}</span>
            </div>

            <button
              onClick={handleApplySimulatedDateToApp}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35 hover:bg-[#38bdf8]/25 transition-colors"
              title="Terapkan tarikh hasil simulasi ini ke seluruh aplikasi"
            >
              Sinkronkan Tarikh
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualizer Area: Canvas + Planet Selection & Sindhind Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left/Center: D3 SVG Canvas (3 Cols) */}
        <div
          ref={containerRef}
          className={`lg:col-span-3 rounded-2xl border relative overflow-hidden min-h-[520px] h-[68vh] shadow-inner transition-colors flex flex-col ${
            isNight
              ? 'bg-[#080c14] border-[#1f2b42]'
              : 'bg-[#f7f2e7] border-[#dfd4bd]'
          }`}
        >
          {/* Floating Canvas Top Overlay: View Toggles & Presets */}
          <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 pointer-events-auto text-[11px] text-[#e2e8f0]">
              <button
                onClick={() => setShowEpicycles(!showEpicycles)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  showEpicycles ? 'bg-[#c59a43] text-black font-semibold' : 'hover:bg-white/10 opacity-70'
                }`}
                title="Tampilkan lingkaran episiklus (falak at-tadwir)"
              >
                Episiklus
              </button>
              <button
                onClick={() => setShowSightlines(!showSightlines)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  showSightlines ? 'bg-[#c59a43] text-black font-semibold' : 'hover:bg-white/10 opacity-70'
                }`}
                title="Tampilkan garis pandang bumi/matahari"
              >
                Garis Pandang
              </button>
              <button
                onClick={() => setShowTrails(!showTrails)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  showTrails ? 'bg-[#c59a43] text-black font-semibold' : 'hover:bg-white/10 opacity-70'
                }`}
                title="Tampilkan jejak orbit spirograf"
              >
                Jejak (Trails)
              </button>
              <button
                onClick={() => setShowZodiacRing(!showZodiacRing)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  showZodiacRing ? 'bg-[#c59a43] text-black font-semibold' : 'hover:bg-white/10 opacity-70'
                }`}
                title="Tampilkan sabuk 12 zodiak klasik"
              >
                Falak al-Buruj
              </button>
            </div>

            {/* Perspective Indicator badge */}
            <div className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-[#c59a43]/30 text-[#c59a43] text-[11px] font-serif font-bold">
              {perspective === 'geocentric'
                ? 'نظام التدوير والحامل (Ptolemaic-Sindhind)'
                : 'نظام فلك الشمس (Heliocentric Coplanar)'}
            </div>
          </div>

          {/* D3 SVG Element */}
          <svg ref={svgRef} className="w-full h-full flex-1" />

          {/* Floating Canvas Bottom Legend & Quick Tip */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px]">
            <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[#cbd5e1] pointer-events-auto flex items-center gap-2">
              <span className="opacity-75">Interaksi:</span>
              <span className="text-[#38bdf8]">Scroll mouse untuk Zoom</span>
              <span className="opacity-40">•</span>
              <span className="text-[#eab308]">Drag untuk Pan</span>
              <span className="opacity-40">•</span>
              <span className="text-[#10b981]">Klik kawkab untuk inspeksi</span>
            </div>

            {perspective === 'geocentric' && (
              <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-rose-500/30 text-rose-300 pointer-events-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
                <span>Simbol (℞) menandakan Gerak Mundur Semu (ar-Ruju')</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Planet Selection & Detailed Zij as-Sindhind Parameters (1 Col) */}
        <div className="space-y-4">
          {/* Planet Selector Grid */}
          <div
            className={`p-3.5 rounded-2xl border ${
              isNight
                ? 'bg-[#101726] border-[#23324d] text-[#e2d9c8]'
                : 'bg-[#faf5ec] border-[#e2d8c3] text-[#2d2417]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#c59a43]">
                Pilih Kawkab (الكواكب):
              </span>
              <span className="text-[10px] opacity-60 font-mono">Sindhind Orbits</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {(
                [
                  'moon',
                  'mercury',
                  'venus',
                  'sun',
                  'mars',
                  'jupiter',
                  'saturn',
                ] as const
              ).map((k) => {
                const p = SINDHIND_PLANET_ORBIT_PARAMS[k];
                const isSelected = selectedPlanetKey === k;
                const isVis = visiblePlanets[k] ?? true;

                return (
                  <button
                    key={k}
                    onClick={() => setSelectedPlanetKey(k)}
                    className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#c59a43] bg-[#c59a43]/15 font-semibold'
                        : isNight
                        ? 'border-[#1e2a3f] bg-[#0c121e] hover:border-[#2d3e5e]'
                        : 'border-[#dfd4bd] bg-[#ffffff] hover:border-[#c9baa2]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="truncate">{p.transliteration}</span>
                    </div>

                    <span className="font-serif text-[11px] opacity-75 shrink-0" dir="rtl">
                      {p.arabicName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sindhind Classical Parameters Card */}
          <div
            className={`p-4 rounded-2xl border leading-relaxed text-xs space-y-3 ${
              isNight
                ? 'bg-[#101726] border-[#23324d] text-[#e2d9c8]'
                : 'bg-[#faf5ec] border-[#e2d8c3] text-[#2d2417]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-current/10">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full inline-block"
                  style={{ backgroundColor: selectedParams.color }}
                />
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#c59a43]">
                    {selectedParams.transliteration} ({selectedParams.arabicName})
                  </h4>
                  <span className="text-[10px] opacity-70 font-mono">
                    Urutan Kosmologis: Falak ke-{selectedParams.traditionalOrder}
                  </span>
                </div>
              </div>

              {selectedPos?.isRetrograde && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Raji' (Retrograde)
                </span>
              )}
            </div>

            {/* Numerical Parameter Readouts */}
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded bg-current/5">
                <span className="opacity-75">Bujur Astronomis (λ):</span>
                <span className="font-bold text-[#38bdf8]">
                  {selectedPos ? `${selectedPos.longitudeDeg.toFixed(2)}°` : '-'}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-current/5">
                <span className="opacity-75">Radius Episiklus (r/R):</span>
                <span className="font-bold text-[#eab308]">
                  {selectedParams.epicycleParts} ({selectedParams.epicycleRadiusRatio.toFixed(3)})
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-current/5">
                <span className="opacity-75">Ta'dil al-Markaz Maks:</span>
                <span>{selectedParams.equationOfCenterMaxDeg}°</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-current/5">
                <span className="opacity-75">Ta'dil al-Khashah Maks:</span>
                <span>{selectedParams.equationOfAnomalyMaxDeg}°</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-current/5">
                <span className="opacity-75">Kecepatan Harian:</span>
                <span>{selectedParams.meanDailyMotionDeg.toFixed(4)}° / hari</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-current/5">
                <span className="opacity-75">Periode Sideris:</span>
                <span>{selectedParams.siderealPeriodDays.toFixed(1)} hari</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-current/5">
                <span className="opacity-75">Periode Sinodis:</span>
                <span>{selectedParams.synodicPeriodDays.toFixed(1)} hari</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-current/5">
                <span className="opacity-75">Titik Auj (Apogee):</span>
                <span>{selectedParams.apogeeDeg}°</span>
              </div>
            </div>

            {/* Manuscript Excerpt */}
            <div
              className={`p-2.5 rounded-xl border text-[11px] font-serif leading-relaxed ${
                isNight ? 'bg-[#0d131f] border-[#1d273a]' : 'bg-[#ffffff] border-[#ded4bd]'
              }`}
            >
              <div className="text-[#c59a43] font-semibold mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>Kutipan Naskah Zij as-Sindhind:</span>
              </div>
              <p className="opacity-85 text-xs italic" dir="rtl">
                «{selectedParams.manuscriptNote}»
              </p>
            </div>

            {/* Annotation Trigger */}
            {onOpenAnnotation && (
              <button
                onClick={() =>
                  onOpenAnnotation(
                    `Orbit ${selectedParams.transliteration} (${selectedParams.arabicName})`
                  )
                }
                className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold bg-[#c59a43]/15 text-[#c59a43] border border-[#c59a43]/30 hover:bg-[#c59a43]/25 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Catat Anotasi Riset Orbit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
