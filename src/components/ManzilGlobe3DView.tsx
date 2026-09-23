import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  GlobeCoordinateSystem,
  GlobeStarPoint,
  GlobeManzilSector,
  GlobePlanetPoint,
  ConstellationLineSegment,
  computeManzilGlobeData,
} from '../lib/manzilGlobeEngine';
import {
  ObserverLocation,
  HISTORICAL_OBSERVATORIES,
} from '../lib/starMapEngine';
import {
  HistoricalDateInfo,
  PlanetKey,
  PlanetaryPosition,
  ThemeMode,
} from '../types';
import { DetailedManzil } from '../data/manzilDetailedData';
import {
  Globe,
  Compass,
  Eye,
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Moon,
  Sun,
  MapPin,
  Navigation,
  Info,
  Layers,
  BookmarkPlus,
  ArrowRight,
  Check,
  ChevronRight,
  Crosshair,
  Calendar,
  SlidersHorizontal,
  Award,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

interface ManzilGlobe3DViewProps {
  currentDateInfo: HistoricalDateInfo;
  moonPosition: PlanetaryPosition;
  allPositions: Record<PlanetKey, PlanetaryPosition>;
  theme: ThemeMode;
  onAnnotateManzil?: (manzilNumber: number, title: string, content: string) => void;
  onSelectDateStep?: (hoursOffset: number) => void;
}

type InspectedItem =
  | { type: 'manzil'; data: GlobeManzilSector }
  | { type: 'star'; data: GlobeStarPoint }
  | { type: 'planet'; data: GlobePlanetPoint };

export const ManzilGlobe3DView: React.FC<ManzilGlobe3DViewProps> = ({
  currentDateInfo,
  moonPosition,
  allPositions,
  theme,
  onAnnotateManzil,
  onSelectDateStep,
}) => {
  const isNight = theme === 'night';
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Responsive dimensions
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 640,
    height: 640,
  });

  // Coordinate System Frame
  const [coordSystem, setCoordSystem] = useState<GlobeCoordinateSystem>('horizontal');

  // Observer Location (Default: Baghdad Bayt al-Hikmah)
  const [selectedObserver, setSelectedObserver] = useState<ObserverLocation>(
    HISTORICAL_OBSERVATORIES[0]
  );
  const [customLat, setCustomLat] = useState<number>(selectedObserver.latitude);
  const [customLon, setCustomLon] = useState<number>(selectedObserver.longitude);
  const [isCustomLocOpen, setIsCustomLocOpen] = useState<boolean>(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  // 3D Globe Rotation [yaw, pitch, roll] in degrees
  const [rotation, setRotation] = useState<[number, number, number]>([0, -20, 0]);
  const [scaleFactor, setScaleFactor] = useState<number>(1.0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);

  // Visibility Toggles
  const [showManzils, setShowManzils] = useState<boolean>(true);
  const [showConstellations, setShowConstellations] = useState<boolean>(true);
  const [showStars, setShowStars] = useState<boolean>(true);
  const [showPlanets, setShowPlanets] = useState<boolean>(true);
  const [showEcliptic, setShowEcliptic] = useState<boolean>(true);
  const [showEquator, setShowEquator] = useState<boolean>(true);
  const [showHorizon, setShowHorizon] = useState<boolean>(true);
  const [showGraticule, setShowGraticule] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [filterVisibleOnly, setFilterVisibleOnly] = useState<boolean>(false);

  // Selection / Inspector state
  const [inspectedItem, setInspectedItem] = useState<InspectedItem | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<{
    text: string;
    sub: string;
    x: number;
    y: number;
  } | null>(null);

  // Resize observer to ensure responsive canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const size = Math.max(340, Math.min(680, width));
        setDimensions({ width: size, height: size });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute 3D Globe data from astronomical engine
  const globeData = useMemo(() => {
    return computeManzilGlobeData(
      currentDateInfo.jdn,
      selectedObserver,
      allPositions,
      coordSystem
    );
  }, [currentDateInfo.jdn, selectedObserver, allPositions, coordSystem]);

  // Set default inspected item to current Moon Manzil on first load
  useEffect(() => {
    if (!inspectedItem && globeData.globeManzils.length > 0) {
      const activeM = globeData.globeManzils.find((m) => m.isCurrentMoonMansion);
      if (activeM) {
        setInspectedItem({ type: 'manzil', data: activeM });
      }
    }
  }, [globeData.globeManzils]);

  // Handle auto-rotation loop
  useEffect(() => {
    if (!isAutoRotating) return;
    let animId: number;
    const animate = () => {
      setRotation((prev) => [(prev[0] + 0.25) % 360, prev[1], prev[2]]);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isAutoRotating]);

  // D3 Orthographic Projection & Path Generator
  const radius = (Math.min(dimensions.width, dimensions.height) / 2) * 0.78 * scaleFactor;
  const projection = useMemo(() => {
    return d3
      .geoOrthographic()
      .scale(radius)
      .translate([dimensions.width / 2, dimensions.height / 2])
      .rotate(rotation)
      .clipAngle(90);
  }, [dimensions.width, dimensions.height, radius, rotation]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // Setup interactive drag with D3
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startRot: [number, number, number] = [0, 0, 0];

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startRot = [...rotation];
      svg.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const sensitivity = 0.4;
      const newYaw = (startRot[0] + dx * sensitivity) % 360;
      const newPitch = Math.max(-88, Math.min(88, startRot[1] - dy * sensitivity));
      setRotation([newYaw, newPitch, startRot[2]]);
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        svg.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    svg.addEventListener('pointerdown', onPointerDown);
    svg.addEventListener('pointermove', onPointerMove);
    svg.addEventListener('pointerup', onPointerUp);
    svg.addEventListener('pointercancel', onPointerUp);

    return () => {
      svg.removeEventListener('pointerdown', onPointerDown);
      svg.removeEventListener('pointermove', onPointerMove);
      svg.removeEventListener('pointerup', onPointerUp);
      svg.removeEventListener('pointercancel', onPointerUp);
    };
  }, [rotation]);

  // Orientation presets
  const handlePresetOrientation = (target: 'zenith' | 'north' | 'east' | 'south' | 'west' | 'moon' | 'polaris') => {
    if (target === 'zenith') {
      setRotation([0, -80, 0]);
    } else if (target === 'north') {
      setRotation([0, -20, 0]);
    } else if (target === 'east') {
      setRotation([-90, -20, 0]);
    } else if (target === 'south') {
      setRotation([180, -20, 0]);
    } else if (target === 'west') {
      setRotation([90, -20, 0]);
    } else if (target === 'polaris') {
      // Look at celestial north pole
      setRotation([0, -selectedObserver.latitude, 0]);
    } else if (target === 'moon') {
      // Find moon geo coordinates and rotate to center
      const moonPt = globeData.globePlanets.find((p) => p.key === 'moon');
      if (moonPt) {
        setRotation([-moonPt.geoCoords[0], -moonPt.geoCoords[1], 0]);
      }
    }
  };

  // Center view on inspected item
  const handleCenterOnInspected = () => {
    if (!inspectedItem) return;
    let targetGeo: [number, number] | null = null;
    if (inspectedItem.type === 'manzil') {
      targetGeo = inspectedItem.data.centerGeo;
    } else if (inspectedItem.type === 'star') {
      targetGeo = inspectedItem.data.geoCoords;
    } else if (inspectedItem.type === 'planet') {
      targetGeo = inspectedItem.data.geoCoords;
    }
    if (targetGeo) {
      setRotation([-targetGeo[0], -targetGeo[1], 0]);
    }
  };

  // Detect GPS
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Peramban tidak mendukung geolokasi');
      return;
    }
    setGeoStatus('Mendeteksi koordinat GPS...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        const newLoc: ObserverLocation = {
          id: 'user_gps',
          name: `Lokasi Pengguna (${lat > 0 ? `${lat}°U` : `${Math.abs(lat)}°S`}, ${lon > 0 ? `${lon}°T` : `${Math.abs(lon)}°B`})`,
          arabicName: 'مَوْقِعُ الرَّاصِدِ الحَالِي',
          latitude: lat,
          longitude: lon,
          description: 'Koordinat GPS langsung dari perangkat pengamat falak.',
        };
        setSelectedObserver(newLoc);
        setCustomLat(lat);
        setCustomLon(lon);
        setGeoStatus(`GPS Terkunci: ${lat}°, ${lon}°`);
        setTimeout(() => setGeoStatus(null), 3000);
      },
      (err) => {
        setGeoStatus(`Gagal membaca GPS: ${err.message}`);
        setTimeout(() => setGeoStatus(null), 3500);
      }
    );
  };

  // D3 Graticule GeoJSON
  const graticuleGeo = useMemo(() => {
    return d3.geoGraticule().step([30, 30])();
  }, []);

  // Helper to check if a point is visible on the front hemisphere of the orthographic projection
  const isFrontHemisphere = useCallback(
    (geo: [number, number]): boolean => {
      const center = [-rotation[0], -rotation[1]];
      const d = d3.geoDistance(geo, center as [number, number]);
      return d <= Math.PI / 2 + 0.05;
    },
    [rotation]
  );

  // Ecliptic Line Path
  const eclipticPath = useMemo(() => {
    const feature: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: globeData.eclipticRingGeo,
      },
    };
    return pathGenerator(feature) || '';
  }, [globeData.eclipticRingGeo, pathGenerator]);

  // Celestial Equator Line Path
  const equatorPath = useMemo(() => {
    const feature: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: globeData.celestialEquatorRingGeo,
      },
    };
    return pathGenerator(feature) || '';
  }, [globeData.celestialEquatorRingGeo, pathGenerator]);

  // Local Horizon Line Path
  const horizonPath = useMemo(() => {
    const feature: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: globeData.localHorizonRingGeo,
      },
    };
    return pathGenerator(feature) || '';
  }, [globeData.localHorizonRingGeo, pathGenerator]);

  return (
    <div
      id="manzil-3d-globe-module"
      className={`rounded-2xl border p-4 md:p-6 transition-all shadow-lg ${
        isNight
          ? 'bg-[#0b101c] border-[#1f2b42] text-slate-100'
          : 'bg-[#faf6ee] border-[#dfd6c3] text-[#2c241c]'
      }`}
    >
      {/* Module Title Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-current/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#c59a43]/20 border border-[#c59a43]/40 text-[#d4af37]">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/30">
                  فَلَكُ المَنَازِلِ المُجَسَّمُ 3D
                </span>
                <span className="text-[11px] font-mono opacity-60">
                  LAST: {globeData.lastHours.toFixed(2)}h ({globeData.lastDeg.toFixed(1)}°)
                </span>
              </div>
              <h2 className="text-xl font-bold font-serif text-[#c59a43] mt-0.5">
                Bola Langit 3D 28 Manzil (Celestial Sphere)
              </h2>
            </div>
          </div>
          <p className="text-xs opacity-80 mt-1 max-w-2xl">
            Proyeksi bola langit tiga dimensi ortografik (D3.js). Memetakan 28 Manzil Bulan, rasi bintang klasik, dan 32 bintang navigasi (*Al-Kawakib ath-Thabitah*) secara presisi dari perspektif koordinat lokal maupun falak ekuatorial.
          </p>
        </div>

        {/* Coordinate Framework Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
          <div
            className={`p-1 rounded-xl border flex items-center gap-1 ${
              isNight ? 'bg-[#0f172a] border-[#223354]' : 'bg-[#ede5d4] border-[#d8ccb8]'
            }`}
          >
            <button
              id="coord-sys-horizontal"
              onClick={() => setCoordSystem('horizontal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                coordSystem === 'horizontal'
                  ? 'bg-[#c59a43] text-black shadow'
                  : isNight
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
              title="Koordinat Alt-Azimuth berbasis Ufuk & Zenit Pengamat"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Horisontal Lokal</span>
            </button>
            <button
              id="coord-sys-equatorial"
              onClick={() => setCoordSystem('equatorial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                coordSystem === 'equatorial'
                  ? 'bg-[#c59a43] text-black shadow'
                  : isNight
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
              title="Koordinat Ekuatorial (RA & Dec) berbasis Khatulistiwa Langit & Poros Kutub"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Ekuatorial Falak</span>
            </button>
            <button
              id="coord-sys-ecliptic"
              onClick={() => setCoordSystem('ecliptic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                coordSystem === 'ecliptic'
                  ? 'bg-[#c59a43] text-black shadow'
                  : isNight
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
              title="Koordinat Ekliptika (Longitude & Latitude) mengelilingi sabuk 28 Manzil"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ekliptika Zodiak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Observer Selector, Presets, Time Step & Auto-Rotate */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-3">
        {/* Observer Location Dropdown */}
        <div className="md:col-span-5 flex items-center gap-2">
          <div
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
              isNight ? 'bg-[#121929] border-[#22314d]' : 'bg-[#f4ebd9] border-[#ddd0b8]'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#c59a43] shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-mono uppercase tracking-wider block opacity-70">
                Lokasi Pengamat (Observatorium)
              </label>
              <select
                id="globe-observer-select"
                value={selectedObserver.id}
                onChange={(e) => {
                  const loc = HISTORICAL_OBSERVATORIES.find((o) => o.id === e.target.value);
                  if (loc) {
                    setSelectedObserver(loc);
                    setCustomLat(loc.latitude);
                    setCustomLon(loc.longitude);
                  }
                }}
                aria-label="Pilih Observatorium Pengamat Falak"
                className="w-full bg-transparent font-serif font-bold text-xs focus:outline-none truncate cursor-pointer text-inherit"
              >
                {HISTORICAL_OBSERVATORIES.map((obs) => (
                  <option
                    key={obs.id}
                    value={obs.id}
                    className={isNight ? 'bg-[#0f172a] text-slate-100' : 'bg-white text-slate-900'}
                  >
                    {obs.name} ({obs.latitude > 0 ? `${obs.latitude}°U` : `${Math.abs(obs.latitude)}°S`})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleDetectGPS}
              title="Gunakan GPS Browser saat ini"
              className="p-1.5 rounded-lg hover:bg-[#c59a43]/20 text-[#c59a43] transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Orientation Presets */}
        <div className="md:col-span-7 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="text-[10px] font-mono opacity-70 mr-1">Hadap:</span>
            <button
              onClick={() => handlePresetOrientation('zenith')}
              className={`px-2 py-1 rounded-lg border text-[11px] font-serif transition-colors ${
                isNight ? 'border-[#22314d] hover:bg-[#1f2c45]' : 'border-[#d8cdb8] hover:bg-[#eae0cd]'
              }`}
              title="Hadap Puncak Langit (Zenit)"
            >
              Zenit
            </button>
            <button
              onClick={() => handlePresetOrientation('north')}
              className={`px-2 py-1 rounded-lg border text-[11px] font-serif transition-colors ${
                isNight ? 'border-[#22314d] hover:bg-[#1f2c45]' : 'border-[#d8cdb8] hover:bg-[#eae0cd]'
              }`}
              title="Hadap Utara (Syamal)"
            >
              Utara
            </button>
            <button
              onClick={() => handlePresetOrientation('east')}
              className={`px-2 py-1 rounded-lg border text-[11px] font-serif transition-colors ${
                isNight ? 'border-[#22314d] hover:bg-[#1f2c45]' : 'border-[#d8cdb8] hover:bg-[#eae0cd]'
              }`}
              title="Hadap Timur (Masyriq - Tempat Terbit)"
            >
              Timur
            </button>
            <button
              onClick={() => handlePresetOrientation('south')}
              className={`px-2 py-1 rounded-lg border text-[11px] font-serif transition-colors ${
                isNight ? 'border-[#22314d] hover:bg-[#1f2c45]' : 'border-[#d8cdb8] hover:bg-[#eae0cd]'
              }`}
              title="Hadap Selatan (Janub)"
            >
              Selatan
            </button>
            <button
              onClick={() => handlePresetOrientation('west')}
              className={`px-2 py-1 rounded-lg border text-[11px] font-serif transition-colors ${
                isNight ? 'border-[#22314d] hover:bg-[#1f2c45]' : 'border-[#d8cdb8] hover:bg-[#eae0cd]'
              }`}
              title="Hadap Barat (Maghrib - Tempat Terbenam)"
            >
              Barat
            </button>
            <button
              onClick={() => handlePresetOrientation('moon')}
              className="px-2.5 py-1 rounded-lg border border-[#c59a43]/50 text-[#c59a43] bg-[#c59a43]/10 hover:bg-[#c59a43]/20 text-[11px] font-serif font-bold transition-colors flex items-center gap-1"
              title="Pusatkan langsung ke posisi Bulan saat ini"
            >
              <Moon className="w-3 h-3" />
              <span>Bulan</span>
            </button>
          </div>

          {/* Auto rotate and reset */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all ${
                isAutoRotating
                  ? 'bg-[#c59a43] text-black shadow'
                  : isNight
                  ? 'bg-[#152033] border border-[#263757] text-slate-300'
                  : 'bg-[#efe6d4] border border-[#d8ccb8] text-slate-700'
              }`}
              title="Putar bola langit secara otomatis"
            >
              {isAutoRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isAutoRotating ? 'Jeda' : 'Putar 3D'}</span>
            </button>
            <button
              onClick={() => {
                setRotation([0, -20, 0]);
                setScaleFactor(1.0);
              }}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                isNight ? 'border-[#22314d] hover:bg-[#1f2c45]' : 'border-[#d8cdb8] hover:bg-[#eae0cd]'
              }`}
              title="Reset rotasi dan perbesaran"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {geoStatus && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-[#c59a43]/20 border border-[#c59a43]/40 text-[#c59a43] text-xs font-mono">
          {geoStatus}
        </div>
      )}

      {/* Main Interactive Stage: 3D Globe + Astrometry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
        {/* Left Column: 3D Sphere Display & Canvas Controls */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {/* Status Chips */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-black/20 border border-current/10">
                {globeData.isNight ? (
                  <>
                    <Moon className="w-3 h-3 text-amber-300" />
                    <span>Malam (Matahari: {globeData.sunAltitude.toFixed(1)}°)</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3 h-3 text-amber-400" />
                    <span>Siang (Matahari: +{globeData.sunAltitude.toFixed(1)}°)</span>
                  </>
                )}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/30">
                {globeData.visibleManzilsCount} / 28 Manzil di Atas Ufuk
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono opacity-70">
              <span>Rotasi: [λ: {rotation[0].toFixed(0)}°, φ: {rotation[1].toFixed(0)}°]</span>
            </div>
          </div>

          {/* 3D Globe SVG Container */}
          <div
            ref={containerRef}
            className={`relative w-full aspect-square max-w-[640px] rounded-2xl border overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing shadow-inner select-none ${
              isNight
                ? 'bg-gradient-to-b from-[#060913] via-[#091024] to-[#04060c] border-[#1d273a]'
                : 'bg-gradient-to-b from-[#f2eade] via-[#ebe0cd] to-[#dfd2be] border-[#d4c6ae]'
            }`}
          >
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="touch-none w-full h-full"
            >
              <defs>
                {/* Celestial Sphere Radial Depth Gradient */}
                <radialGradient id="sphere-glow-gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={isNight ? '#17223b' : '#ede2cb'} stopOpacity="0.8" />
                  <stop offset="70%" stopColor={isNight ? '#0b1120' : '#dfd2be'} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={isNight ? '#040710' : '#cfbfab'} stopOpacity="1" />
                </radialGradient>

                {/* Shading for ground / under-horizon hemisphere in horizontal mode */}
                <linearGradient id="ground-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e1810" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#080705" stopOpacity="0.95" />
                </linearGradient>

                {/* Active Moon Pulsing Glow */}
                <filter id="glow-filter" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Base Celestial Sphere Sphere Disk */}
              <circle
                cx={dimensions.width / 2}
                cy={dimensions.height / 2}
                r={radius}
                fill="url(#sphere-glow-gradient)"
                stroke="#c59a43"
                strokeWidth={isNight ? 1.5 : 2}
                strokeOpacity={0.6}
              />

              {/* 2. Armillary / Graticule Coordinates Grid */}
              {showGraticule && (
                <path
                  d={pathGenerator(graticuleGeo) || ''}
                  fill="none"
                  stroke={isNight ? '#253554' : '#c9bc9e'}
                  strokeWidth={0.75}
                  strokeDasharray="2,3"
                  strokeOpacity={0.7}
                />
              )}

              {/* 3. Constellation Stick Lines */}
              {showConstellations && (
                <g id="constellation-lines-group">
                  {globeData.constellationLines.map((line, idx) => {
                    // Check if both stars are front-facing or interpolate
                    const p1 = projection(line.startGeo);
                    const p2 = projection(line.endGeo);
                    if (!p1 || !p2) return null;
                    const v1 = isFrontHemisphere(line.startGeo);
                    const v2 = isFrontHemisphere(line.endGeo);
                    if (!v1 && !v2) return null;

                    return (
                      <line
                        key={`const-line-${idx}`}
                        x1={p1[0]}
                        y1={p1[1]}
                        x2={p2[0]}
                        y2={p2[1]}
                        stroke={isNight ? '#38bdf8' : '#3b82f6'}
                        strokeWidth={v1 && v2 ? 1.2 : 0.6}
                        strokeOpacity={v1 && v2 ? 0.65 : 0.25}
                        strokeDasharray={v1 && v2 ? undefined : '2,2'}
                      />
                    );
                  })}
                </g>
              )}

              {/* 4. Great Circles: Celestial Equator & Ecliptic */}
              {showEquator && (
                <path
                  d={equatorPath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={1.2}
                  strokeDasharray="4,4"
                  strokeOpacity={0.8}
                />
              )}

              {showEcliptic && (
                <path
                  d={eclipticPath}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={1.8}
                  strokeOpacity={0.85}
                />
              )}

              {/* 5. Local Horizon Ring & Ground Disk (in Horizontal Mode) */}
              {showHorizon && (
                <g id="local-horizon-group">
                  <path
                    d={horizonPath}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth={2}
                    strokeOpacity={0.9}
                  />

                  {/* Cardinal Compass Markers on the Horizon */}
                  {globeData.cardinalPoints.map((cp, idx) => {
                    const pt = projection(cp.geo);
                    if (!pt || !isFrontHemisphere(cp.geo)) return null;
                    return (
                      <g key={`cardinal-${idx}`} transform={`translate(${pt[0]}, ${pt[1]})`}>
                        <circle r={3} fill="#22c55e" />
                        <text
                          y={-6}
                          textAnchor="middle"
                          fill="#22c55e"
                          fontSize="9"
                          fontFamily="sans-serif"
                          fontWeight="bold"
                        >
                          {cp.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 6. 28 Manzil Sectors on the 3D Sphere */}
              {showManzils && (
                <g id="manzils-group">
                  {globeData.globeManzils.map((manzil) => {
                    const centerPt = projection(manzil.centerGeo);
                    const isVisible = centerPt && isFrontHemisphere(manzil.centerGeo);

                    // Polyline for sector boundary
                    let polyPath = '';
                    if (manzil.boundaryPolygon.length > 0) {
                      const geoFeature: GeoJSON.Feature<GeoJSON.LineString> = {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                          type: 'LineString',
                          coordinates: manzil.boundaryPolygon,
                        },
                      };
                      polyPath = pathGenerator(geoFeature) || '';
                    }

                    const isSelected =
                      inspectedItem?.type === 'manzil' && inspectedItem.data.number === manzil.number;

                    // Fortune Color
                    const fortuneStroke = manzil.fortune.includes('Sa\'d')
                      ? '#10b981'
                      : manzil.fortune.includes('Nahs')
                      ? '#f43f5e'
                      : '#f59e0b';

                    return (
                      <g
                        key={`manzil-sector-${manzil.number}`}
                        className="cursor-pointer transition-opacity"
                        onClick={() => setInspectedItem({ type: 'manzil', data: manzil })}
                        onMouseEnter={(e) => {
                          const rect = containerRef.current?.getBoundingClientRect();
                          if (rect && centerPt) {
                            setHoveredTooltip({
                              text: `${manzil.number}. ${manzil.arabicName} (${manzil.transliteration})`,
                              sub: `Ufuk: ${manzil.altitude.toFixed(1)}° | ${manzil.fortune}`,
                              x: centerPt[0],
                              y: centerPt[1] - 14,
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredTooltip(null)}
                      >
                        {/* Sector Boundary Arc */}
                        {polyPath && (
                          <path
                            d={polyPath}
                            fill={manzil.isCurrentMoonMansion ? '#c59a43' : fortuneStroke}
                            fillOpacity={
                              isSelected ? 0.35 : manzil.isCurrentMoonMansion ? 0.25 : 0.08
                            }
                            stroke={manzil.isCurrentMoonMansion ? '#facc15' : fortuneStroke}
                            strokeWidth={
                              isSelected ? 2.5 : manzil.isCurrentMoonMansion ? 2 : 1
                            }
                            strokeOpacity={isVisible ? 0.9 : 0.2}
                          />
                        )}

                        {/* Center Marker & Label */}
                        {isVisible && centerPt && (
                          <g transform={`translate(${centerPt[0]}, ${centerPt[1]})`}>
                            {/* Moon presence indicator */}
                            {manzil.isCurrentMoonMansion && (
                              <circle
                                r={12}
                                fill="#fef08a"
                                fillOpacity={0.3}
                                stroke="#facc15"
                                strokeWidth={1.5}
                                filter="url(#glow-filter)"
                                className="animate-pulse"
                              />
                            )}

                            {/* Center Point */}
                            <circle
                              r={isSelected ? 6 : manzil.isCurrentMoonMansion ? 5 : 3.5}
                              fill={manzil.isCurrentMoonMansion ? '#facc15' : fortuneStroke}
                              stroke="#000"
                              strokeWidth={1}
                            />

                            {/* Label */}
                            {showLabels && (
                              <text
                                y={12}
                                textAnchor="middle"
                                fill={
                                  manzil.isCurrentMoonMansion
                                    ? '#facc15'
                                    : isNight
                                    ? '#f1f5f9'
                                    : '#1e293b'
                                }
                                fontSize={manzil.isCurrentMoonMansion ? '10' : '8.5'}
                                fontWeight={manzil.isCurrentMoonMansion ? 'bold' : 'normal'}
                                fontFamily="Amiri, serif"
                                className="pointer-events-none drop-shadow-sm"
                              >
                                {manzil.arabicName}
                              </text>
                            )}
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 7. Classical Fixed Stars */}
              {showStars && (
                <g id="fixed-stars-group">
                  {globeData.globeStars.map((star) => {
                    const pt = projection(star.geoCoords);
                    if (!pt || !isFrontHemisphere(star.geoCoords)) return null;

                    const starRadius = Math.max(2, 5.5 - star.magnitude * 0.9);
                    const isSelected =
                      inspectedItem?.type === 'star' && inspectedItem.data.id === star.id;

                    return (
                      <g
                        key={`star-${star.id}`}
                        className="cursor-pointer"
                        transform={`translate(${pt[0]}, ${pt[1]})`}
                        onClick={() => setInspectedItem({ type: 'star', data: star })}
                        onMouseEnter={() => {
                          setHoveredTooltip({
                            text: `${star.nameArabic} - ${star.nameLatin}`,
                            sub: `Mag: ${star.magnitude} | Alt: ${star.altitude.toFixed(1)}°`,
                            x: pt[0],
                            y: pt[1] - 12,
                          });
                        }}
                        onMouseLeave={() => setHoveredTooltip(null)}
                      >
                        {/* Glow halo for bright 1st magnitude stars */}
                        {star.magnitude < 1.2 && (
                          <circle
                            r={starRadius * 2.2}
                            fill={star.spectralColor}
                            fillOpacity={0.25}
                            filter="url(#glow-filter)"
                          />
                        )}
                        <circle
                          r={isSelected ? starRadius + 2 : starRadius}
                          fill={star.spectralColor}
                          stroke={isSelected ? '#c59a43' : '#000'}
                          strokeWidth={isSelected ? 1.5 : 0.5}
                        />

                        {/* Name Label */}
                        {showLabels && star.magnitude <= 1.2 && (
                          <text
                            x={starRadius + 4}
                            y={3}
                            fill={isNight ? '#cbd5e1' : '#334155'}
                            fontSize="8"
                            fontFamily="serif"
                            className="pointer-events-none"
                          >
                            {star.nameLatin}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 8. Classical Planets & Real-Time Moon */}
              {showPlanets && (
                <g id="planets-group">
                  {globeData.globePlanets.map((planet) => {
                    const pt = projection(planet.geoCoords);
                    if (!pt || !isFrontHemisphere(planet.geoCoords)) return null;

                    const isSelected =
                      inspectedItem?.type === 'planet' && inspectedItem.data.key === planet.key;

                    return (
                      <g
                        key={`planet-${planet.key}`}
                        className="cursor-pointer"
                        transform={`translate(${pt[0]}, ${pt[1]})`}
                        onClick={() => setInspectedItem({ type: 'planet', data: planet })}
                        onMouseEnter={() => {
                          setHoveredTooltip({
                            text: `${planet.symbol} ${planet.arabicName} (${planet.transliteration})`,
                            sub: `λ: ${planet.eclLong.toFixed(1)}° | Alt: ${planet.altitude.toFixed(1)}°`,
                            x: pt[0],
                            y: pt[1] - 14,
                          });
                        }}
                        onMouseLeave={() => setHoveredTooltip(null)}
                      >
                        {planet.key === 'moon' && (
                          <circle
                            r={14}
                            fill="#fde047"
                            fillOpacity={0.35}
                            filter="url(#glow-filter)"
                            className="animate-ping"
                          />
                        )}
                        <circle
                          r={planet.key === 'moon' || planet.key === 'sun' ? 9 : 7}
                          fill={planet.color}
                          stroke={isSelected ? '#ffffff' : '#000000'}
                          strokeWidth={1.5}
                        />
                        <text
                          y={3}
                          textAnchor="middle"
                          fill="#000"
                          fontSize="9"
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          {planet.symbol}
                        </text>
                        {showLabels && (
                          <text
                            y={-11}
                            textAnchor="middle"
                            fill={isNight ? '#fde047' : '#854d0e'}
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="serif"
                            className="pointer-events-none drop-shadow"
                          >
                            {planet.transliteration}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 9. Zenith and Nadir markers in horizontal coordinate mode */}
              {coordSystem === 'horizontal' && (
                <>
                  {(() => {
                    const zPt = projection(globeData.zenithPoint);
                    if (!zPt || !isFrontHemisphere(globeData.zenithPoint)) return null;
                    return (
                      <g transform={`translate(${zPt[0]}, ${zPt[1]})`}>
                        <Crosshair className="w-4 h-4 text-cyan-400" />
                        <text
                          y={-6}
                          textAnchor="middle"
                          fill="#38bdf8"
                          fontSize="9"
                          fontFamily="sans-serif"
                          fontWeight="bold"
                        >
                          Zenit (+90°)
                        </text>
                      </g>
                    );
                  })()}
                </>
              )}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredTooltip && (
              <div
                className="absolute pointer-events-none z-20 px-2.5 py-1.5 rounded-lg text-xs shadow-xl border bg-black/90 text-white border-[#c59a43]/60 -translate-x-1/2 -translate-y-full"
                style={{ left: hoveredTooltip.x, top: hoveredTooltip.y }}
              >
                <div className="font-bold font-serif text-[#d4af37]">{hoveredTooltip.text}</div>
                <div className="text-[10px] opacity-80">{hoveredTooltip.sub}</div>
              </div>
            )}

            {/* On-canvas Bottom Controls (Zoom & Quick Center) */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white z-10">
              <button
                onClick={() => setScaleFactor((s) => Math.min(2.5, s + 0.2))}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Perbesar (Zoom In)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScaleFactor((s) => Math.max(0.6, s - 0.2))}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Perkecil (Zoom Out)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleCenterOnInspected}
                className="p-1.5 rounded-lg hover:bg-[#c59a43]/30 text-[#d4af37] transition-colors"
                title="Pusatkan bola langit pada objek yang sedang diperiksa"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>

            {/* Hint Overlay */}
            <div className="absolute bottom-3 left-3 text-[10px] font-mono px-2 py-1 rounded bg-black/50 text-slate-300 backdrop-blur pointer-events-none">
              Geser mouse / sentuh untuk memutar bola langit 360°
            </div>
          </div>

          {/* Layer Visibility Toggles */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2 mt-3 text-xs">
            <button
              onClick={() => setShowManzils(!showManzils)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition-colors flex items-center gap-1 ${
                showManzils
                  ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#c59a43]'
                  : isNight
                  ? 'border-[#22314d] text-slate-400'
                  : 'border-[#d8ccb8] text-slate-600'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>28 Manzil</span>
            </button>
            <button
              onClick={() => setShowConstellations(!showConstellations)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition-colors flex items-center gap-1 ${
                showConstellations
                  ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]'
                  : isNight
                  ? 'border-[#22314d] text-slate-400'
                  : 'border-[#d8ccb8] text-slate-600'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Konstelasi Klasik</span>
            </button>
            <button
              onClick={() => setShowStars(!showStars)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition-colors flex items-center gap-1 ${
                showStars
                  ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                  : isNight
                  ? 'border-[#22314d] text-slate-400'
                  : 'border-[#d8ccb8] text-slate-600'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>32 Bintang Tetap</span>
            </button>
            <button
              onClick={() => setShowPlanets(!showPlanets)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition-colors flex items-center gap-1 ${
                showPlanets
                  ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#c59a43]'
                  : isNight
                  ? 'border-[#22314d] text-slate-400'
                  : 'border-[#d8ccb8] text-slate-600'
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Planet &amp; Bulan</span>
            </button>
            <button
              onClick={() => setShowHorizon(!showHorizon)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition-colors flex items-center gap-1 ${
                showHorizon
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : isNight
                  ? 'border-[#22314d] text-slate-400'
                  : 'border-[#d8ccb8] text-slate-600'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>Ufuk Lokal</span>
            </button>
            <button
              onClick={() => setShowEcliptic(!showEcliptic)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition-colors flex items-center gap-1 ${
                showEcliptic
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : isNight
                  ? 'border-[#22314d] text-slate-400'
                  : 'border-[#d8ccb8] text-slate-600'
              }`}
            >
              <span>Ekliptika</span>
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition-colors ${
                showLabels
                  ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#c59a43]'
                  : isNight
                  ? 'border-[#22314d] text-slate-400'
                  : 'border-[#d8ccb8] text-slate-600'
              }`}
            >
              Label Teks
            </button>
          </div>
        </div>

        {/* Right Column: Deep Astrometry Inspector Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {inspectedItem ? (
            <div
              className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all ${
                isNight ? 'bg-[#0e1626] border-[#223352]' : 'bg-[#f4ebd9] border-[#dcd0bc]'
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/30">
                  {inspectedItem.type === 'manzil'
                    ? `MANZIL KE-${inspectedItem.data.number} DARI 28`
                    : inspectedItem.type === 'star'
                    ? 'AL-KAWAKIB ATH-THABITAH'
                    : 'AL-KAWAKIB AS-SAYYARAH'}
                </span>
                <button
                  onClick={handleCenterOnInspected}
                  className="text-xs font-serif text-[#c59a43] hover:underline flex items-center gap-1"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Pusatkan 3D</span>
                </button>
              </div>

              {/* Title & Arabic Glyphs */}
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-bold font-serif text-[#c59a43]">
                    {inspectedItem.type === 'manzil'
                      ? inspectedItem.data.transliteration
                      : inspectedItem.type === 'star'
                      ? inspectedItem.data.nameLatin
                      : inspectedItem.data.transliteration}
                  </h3>
                  <span className="text-2xl font-serif text-amber-300 font-bold" dir="rtl">
                    {inspectedItem.type === 'manzil'
                      ? inspectedItem.data.arabicName
                      : inspectedItem.type === 'star'
                      ? inspectedItem.data.nameArabic
                      : inspectedItem.data.arabicName}
                  </span>
                </div>
                <p className="text-xs opacity-75 mt-0.5">
                  {inspectedItem.type === 'manzil'
                    ? inspectedItem.data.meaningId
                    : inspectedItem.type === 'star'
                    ? `${inspectedItem.data.bayer} • Rasi ${inspectedItem.data.constellation}`
                    : `Simbol Falak: ${inspectedItem.data.symbol}`}
                </p>
              </div>

              {/* Real-Time Astrometric Coordinates Grid */}
              <div
                className={`p-3 rounded-xl border grid grid-cols-2 gap-2 text-xs font-mono ${
                  isNight ? 'bg-[#080d17] border-[#1b263b]' : 'bg-[#ece1cd] border-[#d6c7af]'
                }`}
              >
                <div>
                  <span className="text-[10px] opacity-70 block">Ketinggian (Altitude):</span>
                  <span
                    className={`font-bold ${
                      (inspectedItem.type === 'manzil'
                        ? inspectedItem.data.altitude
                        : inspectedItem.data.altitude) >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {(inspectedItem.type === 'manzil'
                      ? inspectedItem.data.altitude
                      : inspectedItem.data.altitude
                    ).toFixed(2)}
                    °{' '}
                    {(inspectedItem.type === 'manzil'
                      ? inspectedItem.data.altitude
                      : inspectedItem.data.altitude) >= 0
                      ? '(Di Atas Ufuk)'
                      : '(Di Bawah Ufuk)'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] opacity-70 block">Azimuth:</span>
                  <span className="font-bold">
                    {(inspectedItem.type === 'manzil'
                      ? inspectedItem.data.azimuth
                      : inspectedItem.data.azimuth
                    ).toFixed(2)}
                    °
                  </span>
                </div>
                <div>
                  <span className="text-[10px] opacity-70 block">
                    {inspectedItem.type === 'manzil' ? 'Garis Ekliptika:' : 'Asensiorekta (RA):'}
                  </span>
                  <span className="font-bold">
                    {inspectedItem.type === 'manzil'
                      ? `${inspectedItem.data.startEclipticDeg.toFixed(1)}° - ${inspectedItem.data.endEclipticDeg.toFixed(1)}°`
                      : `${inspectedItem.data.raHours.toFixed(2)} jam`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] opacity-70 block">Deklinasi (Dec):</span>
                  <span className="font-bold">
                    {inspectedItem.type === 'manzil'
                      ? '± 0.00° (Sabuk Falak)'
                      : `${inspectedItem.data.decDeg.toFixed(2)}°`}
                  </span>
                </div>
              </div>

              {/* Manzil Specific Classical Data */}
              {inspectedItem.type === 'manzil' && (
                <div className="flex flex-col gap-2.5 text-xs">
                  {/* Fortune & Temperament Badges */}
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`p-2 rounded-xl border text-center ${
                        inspectedItem.data.fortune.includes('Sa\'d')
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : inspectedItem.data.fortune.includes('Nahs')
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono opacity-75">Derajat Falak</div>
                      <div className="font-bold font-serif">{inspectedItem.data.fortune}</div>
                    </div>
                    <div
                      className={`p-2 rounded-xl border text-center ${
                        isNight ? 'bg-[#152033] border-[#223454]' : 'bg-[#e7dcbf] border-[#d2c29e]'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono opacity-75">Tabi'at &amp; Unsur</div>
                      <div className="font-bold font-serif">{inspectedItem.data.temperament}</div>
                    </div>
                  </div>

                  {/* Classical Verse from Qasida */}
                  {inspectedItem.data.detailedData && (
                    <div
                      className={`p-3 rounded-xl border ${
                        isNight ? 'bg-[#090e1a] border-[#1d2b45]' : 'bg-[#f0e4cf] border-[#d8c7ad]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#c59a43] uppercase tracking-wider mb-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Bait Qasida fi 'Ilm an-Nujum</span>
                      </div>
                      <p className="font-serif text-sm text-right text-[#d4af37] leading-relaxed" dir="rtl">
                        {inspectedItem.data.detailedData.classicalVerseArabic}
                      </p>
                      <p className="font-serif italic text-xs mt-1 opacity-80">
                        "{inspectedItem.data.detailedData.classicalVerseTranslation}"
                      </p>
                    </div>
                  )}

                  {/* Recommended Activities (Al-Mustahabb) */}
                  {inspectedItem.data.detailedData && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                        Al-Mustahabb (Dianjurkan):
                      </span>
                      <ul className="space-y-1 pl-2 text-[11px] opacity-85">
                        {inspectedItem.data.detailedData.recommendedActions.slice(0, 3).map((act, i) => (
                          <li key={`rec-${i}`} className="flex items-start gap-1.5">
                            <span className="text-emerald-400">✓</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Annotate Button */}
                  {onAnnotateManzil && (
                    <button
                      onClick={() => {
                        onAnnotateManzil(
                          inspectedItem.data.number,
                          `Observasi Bola 3D: Manzil ${inspectedItem.data.number} (${inspectedItem.data.transliteration})`,
                          `Diamati dari ${selectedObserver.name} pada Altitude ${inspectedItem.data.altitude.toFixed(2)}° dan Azimuth ${inspectedItem.data.azimuth.toFixed(2)}°. Tabi'at: ${inspectedItem.data.temperament}, Falak: ${inspectedItem.data.fortune}.`
                        );
                      }}
                      className="mt-1 w-full py-2 rounded-xl text-xs font-serif font-bold bg-[#c59a43]/20 hover:bg-[#c59a43]/30 border border-[#c59a43]/40 text-[#d4af37] transition-all flex items-center justify-center gap-2"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      <span>Catat ke Buku Riset</span>
                    </button>
                  )}
                </div>
              )}

              {/* Star Specific Classical Data */}
              {inspectedItem.type === 'star' && (
                <div className="flex flex-col gap-2 text-xs">
                  <div
                    className={`p-3 rounded-xl border ${
                      isNight ? 'bg-[#090e1a] border-[#1d2b45]' : 'bg-[#f0e4cf] border-[#d8c7ad]'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-[#c59a43] uppercase tracking-wider mb-1">
                      Deskripsi Kitab Suwar al-Kawakib (As-Sufi)
                    </div>
                    <p className="font-serif text-xs leading-relaxed opacity-90">
                      {inspectedItem.data.classicalDescription}
                    </p>
                  </div>

                  {inspectedItem.data.isManzilMarker && (
                    <div className="p-2 rounded-xl bg-[#c59a43]/15 border border-[#c59a43]/30 text-[#d4af37] text-xs font-serif flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>
                        Bintang Penanda Utama Manzil ke-{inspectedItem.data.manzilNumber}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div
              className={`p-6 rounded-2xl border text-center flex flex-col items-center justify-center gap-3 ${
                isNight ? 'bg-[#0e1626] border-[#223352]' : 'bg-[#f4ebd9] border-[#dcd0bc]'
              }`}
            >
              <Compass className="w-8 h-8 text-[#c59a43] opacity-60 animate-spin-slow" />
              <div>
                <h4 className="font-serif font-bold text-sm text-[#c59a43]">
                  Pilih Objek pada Bola Langit
                </h4>
                <p className="text-xs opacity-75 mt-1 max-w-xs">
                  Klik salah satu dari 28 Manzil, rasi bintang, atau bintang tetap untuk menelaah koordinat horizontal lokal, bait qasida, dan pengaruh falaknya.
                </p>
              </div>
            </div>
          )}

          {/* Quick Guidance Box */}
          <div
            className={`p-3.5 rounded-xl border text-xs ${
              isNight ? 'bg-[#080d17]/80 border-[#1c273c]' : 'bg-[#eae0cd]/80 border-[#d0c2aa]'
            }`}
          >
            <div className="flex items-center gap-2 font-serif font-bold text-[#c59a43] mb-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>Panduan Proyeksi Koordinat Lokal</span>
            </div>
            <ul className="space-y-1.5 text-[11px] opacity-80 list-disc pl-4">
              <li>
                <strong className="text-inherit">Horisontal Lokal:</strong> Memposisikan Ufuk (Horizon) di lingkar tengah (alt = 0°). Benda di atas ufuk sedang terbit/tampak di langit malam tempat pengamatan.
              </li>
              <li>
                <strong className="text-inherit">Ekuatorial Falak:</strong> Berpusat pada poros langit kutub utara (Polaris) dan khatulistiwa langit (*Mu'addil an-Nahar*).
              </li>
              <li>
                <strong className="text-inherit">Ekliptika Zodiak:</strong> Membentangkan sabuk 28 Manzil secara simetris sepanjang jalur peredaran Bulan.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
