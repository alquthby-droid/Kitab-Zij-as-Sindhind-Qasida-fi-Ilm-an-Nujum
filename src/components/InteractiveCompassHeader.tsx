import React, { useState, useEffect, useRef } from 'react';
import {
  CompassHeadingState,
  getCardinalInfo,
  estimateMagneticDeclination,
  calculateQiblaAzimuth,
  computeHeadingFromAngles,
  CARDINAL_POINTS,
} from '../lib/compassEngine';
import { ThemeMode } from '../types';
import {
  Compass,
  Navigation,
  RotateCcw,
  Sliders,
  Check,
  ChevronRight,
  X,
  Smartphone,
  HelpCircle,
  Sparkles,
  Layers,
  Globe2,
} from 'lucide-react';

interface InteractiveCompassHeaderProps {
  theme: ThemeMode;
  observerLatitude: number;
  observerLongitude: number;
  observerName: string;
  onSelectTab?: (tab: any) => void;
  onApplyHeadingToStarMap?: (heading: number, syncLive: boolean) => void;
  isLiveSyncedToStarMap?: boolean;
}

export const InteractiveCompassHeader: React.FC<InteractiveCompassHeaderProps> = ({
  theme,
  observerLatitude,
  observerLongitude,
  observerName,
  onSelectTab,
  onApplyHeadingToStarMap,
  isLiveSyncedToStarMap = false,
}) => {
  const isNight = theme === 'night';
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Auto-calculated magnetic declination for current observer location
  const defaultDeclination = estimateMagneticDeclination(observerLatitude, observerLongitude);
  const qiblaAzimuth = calculateQiblaAzimuth(observerLatitude, observerLongitude);

  // Compass state
  const [useTrueNorth, setUseTrueNorth] = useState<boolean>(true);
  const [magneticDeclination, setMagneticDeclination] = useState<number>(defaultDeclination);
  const [liveSync, setLiveSync] = useState<boolean>(isLiveSyncedToStarMap);

  const [headingState, setHeadingState] = useState<CompassHeadingState>({
    heading: 0,
    trueHeading: 0,
    magneticHeading: (360 - defaultDeclination) % 360,
    cardinal: 'U',
    cardinalLatin: 'N',
    cardinalArabic: 'الشَّمَال',
    accuracy: null,
    isCalibrated: true,
    pitch: 0,
    roll: 0,
    sensorAvailable: false,
    sensorActive: false,
    permissionState: 'prompt',
    useTrueNorth: true,
    magneticDeclination: defaultDeclination,
    isSimulated: true,
  });

  const [simulatedHeading, setSimulatedHeading] = useState<number>(0);
  const [isDraggingDial, setIsDraggingDial] = useState<boolean>(false);
  const dialRef = useRef<SVGSVGElement | null>(null);

  // Update declination if observer coordinates change
  useEffect(() => {
    const newDec = estimateMagneticDeclination(observerLatitude, observerLongitude);
    setMagneticDeclination(newDec);
  }, [observerLatitude, observerLongitude]);

  // Handle liveSync changes
  useEffect(() => {
    setLiveSync(isLiveSyncedToStarMap);
  }, [isLiveSyncedToStarMap]);

  // Request & attach device orientation listeners
  const requestOrientationPermission = async () => {
    // Check if iOS 13+ permission is required
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any) !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') {
          startOrientationSensor();
          setHeadingState((prev) => ({ ...prev, permissionState: 'granted' }));
        } else {
          setHeadingState((prev) => ({
            ...prev,
            permissionState: 'denied',
            sensorActive: false,
          }));
        }
      } catch (err) {
        console.warn('Sensor permission error:', err);
        setHeadingState((prev) => ({
          ...prev,
          permissionState: 'denied',
          sensorActive: false,
        }));
      }
    } else {
      // Standard browser or Android
      startOrientationSensor();
    }
  };

  const startOrientationSensor = () => {
    if (typeof window === 'undefined') return;

    let hasReceivedEvent = false;

    const handleAbsoluteOrientation = (e: DeviceOrientationEvent) => {
      hasReceivedEvent = true;
      processOrientationData(e, true);
    };

    const handleStandardOrientation = (e: DeviceOrientationEvent) => {
      hasReceivedEvent = true;
      processOrientationData(e, false);
    };

    // Prefer deviceorientationabsolute if supported (provides true North)
    if ('ondeviceorientationabsolute' in window) {
      (window as any).addEventListener('deviceorientationabsolute', handleAbsoluteOrientation as any);
    } else {
      (window as any).addEventListener('deviceorientation', handleStandardOrientation as any);
    }

    // Set initial sensor active check
    setTimeout(() => {
      setHeadingState((prev) => ({
        ...prev,
        sensorAvailable: hasReceivedEvent,
        sensorActive: hasReceivedEvent,
        isSimulated: !hasReceivedEvent,
      }));
    }, 800);
  };

  // Process raw sensor event
  const processOrientationData = (e: DeviceOrientationEvent, isAbsolute: boolean) => {
    let magneticAngle = 0;
    let accuracyVal: number | null = null;

    // iOS Safari webkitCompassHeading
    if (typeof (e as any).webkitCompassHeading === 'number') {
      magneticAngle = (e as any).webkitCompassHeading;
      if (typeof (e as any).webkitCompassAccuracy === 'number') {
        accuracyVal = (e as any).webkitCompassAccuracy;
      }
    } else if (e.alpha !== null) {
      // Android / W3C standard
      magneticAngle = computeHeadingFromAngles(e.alpha, e.beta, e.gamma);
    }

    // Apply magnetic declination to get True North (Ash-Shamal al-Haqiqi)
    // True Heading = (Magnetic Heading + Declination) % 360
    const trueAngle = (magneticAngle + magneticDeclination + 360) % 360;
    const finalHeading = useTrueNorth ? trueAngle : magneticAngle;

    const card = getCardinalInfo(finalHeading);

    const pitchVal = Math.round(e.beta || 0);
    const rollVal = Math.round(e.gamma || 0);

    setHeadingState((prev) => ({
      ...prev,
      heading: parseFloat(finalHeading.toFixed(1)),
      trueHeading: parseFloat(trueAngle.toFixed(1)),
      magneticHeading: parseFloat(magneticAngle.toFixed(1)),
      cardinal: card.code,
      cardinalLatin: card.latin,
      cardinalArabic: card.nameArabic,
      accuracy: accuracyVal,
      pitch: pitchVal,
      roll: rollVal,
      sensorAvailable: true,
      sensorActive: true,
      isSimulated: false,
    }));

    // If live sync is on, notify parent
    if (liveSync && onApplyHeadingToStarMap) {
      onApplyHeadingToStarMap(finalHeading, true);
    }
  };

  // Set simulated heading for desktop / manual calibration
  const setManualAngle = (angle: number) => {
    const norm = (angle % 360 + 360) % 360;
    setSimulatedHeading(norm);
    const card = getCardinalInfo(norm);

    const trueAngle = norm;
    const magAngle = (norm - magneticDeclination + 360) % 360;
    const activeHeading = useTrueNorth ? trueAngle : magAngle;

    setHeadingState((prev) => ({
      ...prev,
      heading: parseFloat(activeHeading.toFixed(1)),
      trueHeading: parseFloat(trueAngle.toFixed(1)),
      magneticHeading: parseFloat(magAngle.toFixed(1)),
      cardinal: card.code,
      cardinalLatin: card.latin,
      cardinalArabic: card.nameArabic,
      isSimulated: true,
    }));

    if (liveSync && onApplyHeadingToStarMap) {
      onApplyHeadingToStarMap(activeHeading, true);
    }
  };

  // Drag interaction on SVG Dial
  const handleDialPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDraggingDial(true);
    updateDialAngleFromPointer(e);
  };

  const handleDialPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingDial) return;
    updateDialAngleFromPointer(e);
  };

  const handleDialPointerUp = () => {
    setIsDraggingDial(false);
  };

  const updateDialAngleFromPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    // Angle from North (0° top, 90° right, 180° bottom, 270° left)
    let rad = Math.atan2(dx, -dy);
    let deg = (rad * 180) / Math.PI;
    if (deg < 0) deg += 360;
    setManualAngle(deg);
  };

  // Try auto-listening on mount
  useEffect(() => {
    // Attempt non-prompt sensor start for Android/Desktop
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any)?.requestPermission !== 'function'
    ) {
      startOrientationSensor();
    }
  }, []);

  const currentDisplayHeading = headingState.heading;
  const currentCard = getCardinalInfo(currentDisplayHeading);

  return (
    <>
      {/* HEADER TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group relative inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border font-serif text-xs transition-all shadow-sm ${
          isNight
            ? 'bg-[#151c2e] hover:bg-[#1e2a44] border-[#293b5d] text-[#e6ded0]'
            : 'bg-[#ede5d5] hover:bg-[#e2d6bf] border-[#dacdb2] text-[#3d3326]'
        }`}
        title="Buka Kompas Interaktif Falak & Orientasi Langit (Zij as-Sindhind)"
      >
        {/* Animated Astrolabe Compass Dial Icon */}
        <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6" viewBox="0 0 36 36">
            {/* Outer Brass Ring */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="#c59a43"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />
            {/* Cardinal ticks */}
            <line x1="18" y1="3" x2="18" y2="6" stroke="#c59a43" strokeWidth="1.5" />
            <line x1="18" y1="30" x2="18" y2="33" stroke="#c59a43" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="3" y1="18" x2="6" y2="18" stroke="#c59a43" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="30" y1="18" x2="33" y2="18" stroke="#c59a43" strokeWidth="1" strokeOpacity="0.6" />

            {/* Rotating True North Needle (Rotates counter to heading to point to North) */}
            <g transform={`rotate(${-currentDisplayHeading}, 180, 180)`}>
              {/* North Pointer (Gold/Ruby) */}
              <polygon
                points="18,5 15.5,18 20.5,18"
                fill="#dc2626"
                stroke="#c59a43"
                strokeWidth="0.5"
              />
              {/* South Pointer (Silver/Navy) */}
              <polygon
                points="18,31 15.5,18 20.5,18"
                fill={isNight ? '#334155' : '#94a3b8'}
                stroke="#c59a43"
                strokeWidth="0.5"
              />
              {/* Center Pivot Gem */}
              <circle cx="18" cy="18" r="2.5" fill="#c59a43" />
              <circle cx="18" cy="18" r="1" fill="#fef08a" />
            </g>
          </svg>

          {/* Status Pip */}
          <span
            className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
              headingState.sensorActive
                ? 'bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse'
                : 'bg-amber-400/80 ring-1 ring-amber-400/40'
            }`}
          />
        </div>

        {/* Heading Readout */}
        <div className="flex flex-col items-start leading-tight">
          <div className="flex items-center gap-1 font-mono font-bold text-xs text-[#c59a43]">
            <span>{Math.round(currentDisplayHeading)}°</span>
            <span className="font-serif text-[11px] px-1 py-0.2 rounded bg-[#c59a43]/15 text-[#c59a43]">
              {currentCard.code}
            </span>
          </div>
          <span className="text-[10px] opacity-75 hidden sm:inline font-serif truncate max-w-[80px]">
            {useTrueNorth ? 'Utara Sejati' : 'Magnetik'}
          </span>
        </div>
      </button>

      {/* EXPANDED INTERACTIVE COMPASS MODAL / HUD */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div
            className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all my-auto ${
              isNight ? 'bg-[#0f1523] border-[#293b5d] text-[#e6ded0]' : 'bg-[#f7f2e7] border-[#d8caba] text-[#2c2419]'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-current/10 bg-current/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#c59a43]/20 border border-[#c59a43]/40 flex items-center justify-center text-[#c59a43]">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#c59a43] flex items-center gap-2">
                    <span>Kompas Falak & Orientasi Langit</span>
                    <span className="text-xs font-normal opacity-75 hidden sm:inline">
                      (بَيْتُ الإِبْرَةِ وَسَمْتُ الشَّمَالِ)
                    </span>
                  </h3>
                  <p className="text-[11px] opacity-70">
                    Arah Utara Sejati & Acuan Azimuth Pengamatan untuk Modul Peta Langit
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-current/10 transition-colors text-current/70 hover:text-current"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Main Visual Dial & Heading Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* SVG Astrolabe Compass Dial */}
                <div className="flex flex-col items-center">
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 select-none touch-none">
                    <svg
                      ref={dialRef}
                      className="w-full h-full cursor-grab active:cursor-grabbing"
                      viewBox="-130 -130 260 260"
                      onPointerDown={handleDialPointerDown}
                      onPointerMove={handleDialPointerMove}
                      onPointerUp={handleDialPointerUp}
                    >
                      <defs>
                        <radialGradient id="compassBgGrad" cx="0" cy="0" r="100%">
                          <stop offset="0%" stopColor={isNight ? '#162136' : '#ede2ce'} />
                          <stop offset="85%" stopColor={isNight ? '#0b111e' : '#ded0b8'} />
                          <stop offset="100%" stopColor={isNight ? '#070b14' : '#cfbf9f'} />
                        </radialGradient>
                        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Outer Brass Rims */}
                      <circle cx="0" cy="0" r="124" fill="none" stroke="#c59a43" strokeWidth="2.5" />
                      <circle cx="0" cy="0" r="118" fill="none" stroke="#c59a43" strokeWidth="1" strokeOpacity="0.6" />
                      <circle cx="0" cy="0" r="114" fill="url(#compassBgGrad)" />

                      {/* Degree ticks around outer rim */}
                      {Array.from({ length: 72 }).map((_, i) => {
                        const deg = i * 5;
                        const isMajor = deg % 30 === 0;
                        const isMed = deg % 10 === 0;
                        const len = isMajor ? 10 : isMed ? 6 : 4;
                        const rad = (deg * Math.PI) / 180;
                        const x1 = 114 * Math.sin(rad);
                        const y1 = -114 * Math.cos(rad);
                        const x2 = (114 - len) * Math.sin(rad);
                        const y2 = -(114 - len) * Math.cos(rad);
                        return (
                          <line
                            key={deg}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#c59a43"
                            strokeWidth={isMajor ? 1.5 : 0.8}
                            strokeOpacity={isMajor ? 0.9 : 0.5}
                          />
                        );
                      })}

                      {/* 8 Cardinal / Intercardinal Labels */}
                      {CARDINAL_POINTS.map((pt) => {
                        const rad = (pt.deg * Math.PI) / 180;
                        const r = 94;
                        const x = r * Math.sin(rad);
                        const y = -r * Math.cos(rad);
                        const isNorth = pt.deg === 0;
                        return (
                          <g key={pt.code} transform={`translate(${x}, ${y})`}>
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={isNorth ? '#ef4444' : '#c59a43'}
                              fontSize={isNorth ? '12px' : '9px'}
                              fontWeight="bold"
                              fontFamily="serif"
                            >
                              {pt.latin}
                            </text>
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                              y={isNorth ? 11 : 9}
                              fill={isNorth ? '#ef4444' : '#c59a43'}
                              fontSize={isNorth ? '9px' : '7.5px'}
                              fontFamily="serif"
                              opacity={0.8}
                            >
                              {pt.nameArabic}
                            </text>
                          </g>
                        );
                      })}

                      {/* Qibla Direction Indicator Line */}
                      {(() => {
                        const qRad = (qiblaAzimuth * Math.PI) / 180;
                        const qX = 114 * Math.sin(qRad);
                        const qY = -114 * Math.cos(qRad);
                        return (
                          <g opacity={0.85}>
                            <line
                              x1="0"
                              y1="0"
                              x2={qX}
                              y2={qY}
                              stroke="#10b981"
                              strokeWidth="1.2"
                              strokeDasharray="3,3"
                            />
                            <circle cx={qX * 0.92} cy={qY * 0.92} r="3" fill="#10b981" />
                            <text
                              x={qX * 0.8}
                              y={qY * 0.8}
                              fill="#10b981"
                              fontSize="7.5px"
                              fontFamily="serif"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              القِبْلَة
                            </text>
                          </g>
                        );
                      })()}

                      {/* Field of View (FOV) Wedge pointing to current heading */}
                      {(() => {
                        const fovHalf = 25; // 50° field of view
                        const startAngle = (currentDisplayHeading - fovHalf) * (Math.PI / 180);
                        const endAngle = (currentDisplayHeading + fovHalf) * (Math.PI / 180);
                        const fovR = 105;
                        const x1 = fovR * Math.sin(startAngle);
                        const y1 = -fovR * Math.cos(startAngle);
                        const x2 = fovR * Math.sin(endAngle);
                        const y2 = -fovR * Math.cos(endAngle);
                        return (
                          <path
                            d={`M 0 0 L ${x1} ${y1} A ${fovR} ${fovR} 0 0 1 ${x2} ${y2} Z`}
                            fill="#c59a43"
                            fillOpacity="0.12"
                            stroke="#c59a43"
                            strokeWidth="0.75"
                            strokeOpacity="0.3"
                          />
                        );
                      })()}

                      {/* True North vs Magnetic North Needle */}
                      {/* Rotates so needle points toward True North relative to device bezel */}
                      <g transform={`rotate(${-currentDisplayHeading})`}>
                        {/* True North Pointer (Gold & Vermilion Arrow) */}
                        <polygon
                          points="0,-102 -9,-14 9,-14"
                          fill="#dc2626"
                          stroke="#c59a43"
                          strokeWidth="1"
                          filter="url(#goldGlow)"
                        />
                        <polygon
                          points="0,-102 0,-14 9,-14"
                          fill="#ef4444"
                        />
                        {/* South Pointer */}
                        <polygon
                          points="0,102 -9,14 9,14"
                          fill={isNight ? '#334155' : '#94a3b8'}
                          stroke="#c59a43"
                          strokeWidth="1"
                        />
                        <polygon
                          points="0,102 0,14 9,14"
                          fill={isNight ? '#1e293b' : '#64748b'}
                        />

                        {/* If using True North, show Magnetic needle offset in faint cyan */}
                        {useTrueNorth && Math.abs(magneticDeclination) > 0.1 && (
                          <g transform={`rotate(${-magneticDeclination})`}>
                            <line
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="-90"
                              stroke="#38bdf8"
                              strokeWidth="1.2"
                              strokeDasharray="2,2"
                            />
                            <circle cx="0" cy="-90" r="2" fill="#38bdf8" />
                            <text
                              x="5"
                              y="-78"
                              fill="#38bdf8"
                              fontSize="7px"
                              fontFamily="monospace"
                            >
                              Mag N
                            </text>
                          </g>
                        )}

                        {/* Central Astrolabe Boss / Pivot */}
                        <circle cx="0" cy="0" r="14" fill="#c59a43" stroke="#fef08a" strokeWidth="1" />
                        <circle cx="0" cy="0" r="7" fill={isNight ? '#0b111e' : '#f7f2e7'} />
                        <circle cx="0" cy="0" r="3.5" fill="#dc2626" />
                      </g>

                      {/* Top Sightline Reticle Marker */}
                      <polygon points="0,-122 -5,-114 5,-114" fill="#c59a43" />
                    </svg>

                    <p className="text-[10px] text-center opacity-60 mt-1">
                      {headingState.sensorActive
                        ? 'Putar ponsel untuk mengarahkan pandangan'
                        : 'Seret piringan atau geser bilah untuk simulasi arah'}
                    </p>
                  </div>
                </div>

                {/* Status, Readings, & Direction Details */}
                <div className="space-y-4">
                  {/* Big Heading Display Box */}
                  <div
                    className={`p-4 rounded-xl border ${
                      isNight ? 'bg-[#151d2f] border-[#293b5d]' : 'bg-[#eee6d6] border-[#dacdb2]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-serif uppercase tracking-wider text-[#c59a43] font-bold">
                        Arah Hadap Pengamat (Azimuth)
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 ${
                          headingState.sensorActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            headingState.sensorActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                          }`}
                        />
                        {headingState.sensorActive ? 'Sensor Gerak Riil' : 'Manual / Simulasi'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#c59a43]">
                        {Math.round(currentDisplayHeading)}°
                      </span>
                      <div className="flex flex-col">
                        <span className="font-serif text-lg font-bold">
                          {currentCard.latin} ({currentCard.nameIndo})
                        </span>
                        <span className="font-serif text-xs opacity-75 text-[#c59a43]">
                          {currentCard.nameArabic}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-current/10 grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="opacity-60 block text-[10px]">Utara Sejati:</span>
                        <span className="font-semibold">{headingState.trueHeading}°</span>
                      </div>
                      <div>
                        <span className="opacity-60 block text-[10px]">Utara Magnetik:</span>
                        <span className="font-semibold">{headingState.magneticHeading}°</span>
                      </div>
                      <div>
                        <span className="opacity-60 block text-[10px]">Deklinasi Magnetik:</span>
                        <span className="font-semibold text-sky-400">
                          {magneticDeclination > 0 ? `+${magneticDeclination}° Timur` : `${magneticDeclination}° Barat`}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-60 block text-[10px]">Arah Kiblat Lokal:</span>
                        <span className="font-semibold text-emerald-400">
                          {Math.round(qiblaAzimuth)}° (
                          {Math.abs(Math.round(currentDisplayHeading - qiblaAzimuth)) < 5
                            ? 'Tepat Kiblat!'
                            : `${Math.round(qiblaAzimuth - currentDisplayHeading)}° offset`}
                          )
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tilt / Attitude Indicator (Mīzān al-Mā') */}
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      isNight ? 'bg-[#121826] border-[#22304d]' : 'bg-[#f0e8d9] border-[#ded3be]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#c59a43]" />
                      <div>
                        <span className="font-serif font-semibold block text-[11px]">
                          Kemiringan Perangkat (Mīzān al-Mā'):
                        </span>
                        <span className="font-mono text-[10px] opacity-75">
                          Pitch (Elevasi Langit): {headingState.pitch}° | Roll: {headingState.roll}°
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11px] font-bold text-[#c59a43]">
                      {Math.abs(headingState.pitch) < 15
                        ? 'Mendatar (Kompas Peta)'
                        : headingState.pitch > 45
                        ? 'Menengadah ke Langit'
                        : 'Tegak Normal'}
                    </div>
                  </div>

                  {/* Sensor Activation or Permission Button */}
                  {!headingState.sensorActive && (
                    <button
                      type="button"
                      onClick={requestOrientationPermission}
                      className="w-full py-2.5 px-4 rounded-xl font-serif font-bold text-xs bg-[#c59a43] text-black hover:bg-[#d6aa52] transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Aktifkan Sensor Gerak Perangkat (Giro/Kompas)</span>
                    </button>
                  )}

                  {headingState.sensorActive && (
                    <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>Sensor orientasi aktif & melacak arah hadap riil.</span>
                      </span>
                      <span className="text-[10px] font-mono opacity-80">
                        {headingState.accuracy ? `Akurasi: ±${headingState.accuracy}°` : 'Kalibrasi Otomatis'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CONTROLS SECTION */}
              <div className="space-y-4 pt-2 border-t border-current/10">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#c59a43] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Pengaturan Acuan & Koreksi Falak</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* True North vs Magnetic Toggle */}
                  <div
                    className={`p-3.5 rounded-xl border space-y-2 ${
                      isNight ? 'bg-[#121826] border-[#22304d]' : 'bg-[#f0e8d9] border-[#ded3be]'
                    }`}
                  >
                    <span className="font-serif font-semibold text-xs block">
                      Acuan Arah Utara (Al-Quthb):
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUseTrueNorth(true)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-serif transition-colors border ${
                          useTrueNorth
                            ? 'bg-[#c59a43] text-black font-bold border-[#c59a43]'
                            : 'border-current/20 hover:bg-current/5'
                        }`}
                      >
                        Utara Sejati (Haqiqi)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseTrueNorth(false)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-serif transition-colors border ${
                          !useTrueNorth
                            ? 'bg-[#c59a43] text-black font-bold border-[#c59a43]'
                            : 'border-current/20 hover:bg-current/5'
                        }`}
                      >
                        Utara Magnetik
                      </button>
                    </div>
                    <p className="text-[10px] opacity-70">
                      Utara Sejati (Ash-Shamal al-Haqiqi) mengompensasi kemiringan medan magnet bumi
                      berdasarkan letak observatorium pengamat ({observerName}).
                    </p>
                  </div>

                  {/* Manual / Simulated Azimuth Slider */}
                  <div
                    className={`p-3.5 rounded-xl border space-y-2 ${
                      isNight ? 'bg-[#121826] border-[#22304d]' : 'bg-[#f0e8d9] border-[#ded3be]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-serif">
                      <span className="font-semibold">Putar Arah Manual (Simulasi):</span>
                      <span className="font-mono text-[#c59a43] font-bold">
                        {Math.round(simulatedHeading)}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="359"
                      value={simulatedHeading}
                      onChange={(e) => setManualAngle(parseFloat(e.target.value))}
                      className="w-full accent-[#c59a43]"
                    />
                    {/* Quick Cardinal Direction Buttons */}
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar text-[10px] font-mono">
                      {[
                        { label: 'U (0°)', deg: 0 },
                        { label: 'T (90°)', deg: 90 },
                        { label: 'S (180°)', deg: 180 },
                        { label: 'B (270°)', deg: 270 },
                        { label: `Kiblat (${Math.round(qiblaAzimuth)}°)`, deg: Math.round(qiblaAzimuth) },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setManualAngle(item.deg)}
                          className="px-2 py-1 rounded bg-current/5 hover:bg-current/15 border border-current/10 whitespace-nowrap transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Magnetic Declination Fine-tuning */}
                <div
                  className={`p-3 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-3 ${
                    isNight ? 'bg-[#121826] border-[#22304d]' : 'bg-[#f0e8d9] border-[#ded3be]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-serif font-semibold block text-[11px]">
                      Koreksi Inhiraf al-Ibrah (Deklinasi Magnetik Lokal):
                    </span>
                    <span className="text-[10px] opacity-75">
                      Nilai estimasi untuk {observerName}: {defaultDeclination}°
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMagneticDeclination((prev) => parseFloat((prev - 0.5).toFixed(1)))}
                      className="px-2 py-1 rounded border border-current/20 hover:bg-current/10 font-mono"
                    >
                      -0.5°
                    </button>
                    <span className="font-mono font-bold text-[#c59a43] px-2">
                      {magneticDeclination > 0 ? `+${magneticDeclination}°` : `${magneticDeclination}°`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMagneticDeclination((prev) => parseFloat((prev + 0.5).toFixed(1)))}
                      className="px-2 py-1 rounded border border-current/20 hover:bg-current/10 font-mono"
                    >
                      +0.5°
                    </button>
                    <button
                      type="button"
                      onClick={() => setMagneticDeclination(defaultDeclination)}
                      className="p-1 rounded text-xs opacity-75 hover:opacity-100"
                      title="Reset ke nilai default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* STAR MAP INTEGRATION (PETA LANGIT ACTION) */}
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isNight
                    ? 'bg-gradient-to-r from-[#172238] to-[#121826] border-[#293b5d]'
                    : 'bg-gradient-to-r from-[#ede3cf] to-[#e4d6bf] border-[#dacdb2]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-[#c59a43]" />
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#c59a43]">
                        Orientasi Modul Peta Langit & Manzil
                      </h4>
                      <p className="text-[11px] opacity-75">
                        Arahkan pandangan kubah langit virtual sesuai dengan arah hadap kompas Anda ({Math.round(currentDisplayHeading)}° {currentCard.code}).
                      </p>
                    </div>
                  </div>

                  {/* Live Sync Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-serif shrink-0">
                    <input
                      type="checkbox"
                      checked={liveSync}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setLiveSync(checked);
                        if (onApplyHeadingToStarMap) {
                          onApplyHeadingToStarMap(currentDisplayHeading, checked);
                        }
                      }}
                      className="rounded accent-[#c59a43] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-[11px]">Sinkron Otomatis</span>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onApplyHeadingToStarMap) {
                        onApplyHeadingToStarMap(currentDisplayHeading, true);
                      }
                      if (onSelectTab) {
                        onSelectTab('starmap');
                      }
                      setIsOpen(false);
                    }}
                    className="flex-1 min-w-[200px] py-2 px-4 rounded-lg bg-[#c59a43] text-black font-serif font-bold text-xs hover:bg-[#d4a84e] transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Arahkan Peta Langit ke {Math.round(currentDisplayHeading)}° ({currentCard.code})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectTab) {
                        onSelectTab('starmap');
                      }
                      setIsOpen(false);
                    }}
                    className="py-2 px-3 rounded-lg border border-current/20 hover:bg-current/10 font-serif text-xs transition-colors"
                  >
                    Buka Peta Langit Saja
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-current/10 bg-current/5 flex items-center justify-between text-xs">
              <span className="opacity-70 font-serif text-[11px]">
                Zij as-Sindhind • Bayt al-Ibrah (Kompas Falak Klasik)
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-current/10 hover:bg-current/15 font-serif font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
