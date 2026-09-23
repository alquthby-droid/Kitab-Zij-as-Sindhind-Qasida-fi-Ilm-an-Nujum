import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Camera,
  Compass,
  Crosshair,
  Sparkles,
  Sun,
  Moon,
  RotateCcw,
  Sliders,
  X,
  Eye,
  Maximize2,
  Minimize2,
  Lock,
  Zap,
  Info,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { SkyDomeData, ProjectedStar, ProjectedPlanet, ProjectedManzil } from '../lib/starMapEngine';
import { CardinalDirectionInfo, getCardinalInfo } from '../lib/compassEngine';

interface ARSkyViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  skyData: SkyDomeData;
  observerLocation: {
    name: string;
    latitude: number;
    longitude: number;
  };
  magneticDeclination: number;
  initialHeading?: number;
  onSelectObject: (obj: { type: 'star' | 'planet' | 'manzil'; data: ProjectedStar | ProjectedPlanet | ProjectedManzil }) => void;
}

interface CameraAttitude {
  azimuth: number; // 0 to 359.9° from True North
  altitude: number; // -90° (Nadir) to +90° (Zenith)
  roll: number; // -180° to +180°
}

export const ARSkyViewModal: React.FC<ARSkyViewModalProps> = ({
  isOpen,
  onClose,
  skyData,
  observerLocation,
  magneticDeclination,
  initialHeading = 0,
  onSelectObject,
}) => {
  // Camera feed states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);

  // Sensor states
  const [sensorAvailable, setSensorAvailable] = useState<boolean>(false);
  const [sensorActive, setSensorActive] = useState<boolean>(false);
  const [isIOSPromptNeeded, setIsIOSPromptNeeded] = useState<boolean>(false);

  // Attitude state (with smoothing)
  const [attitude, setAttitude] = useState<CameraAttitude>({
    azimuth: initialHeading,
    altitude: 20, // Default slightly looking up at sky
    roll: 0,
  });

  // Calibration offsets (manual nudge)
  const [azimuthOffset, setAzimuthOffset] = useState<number>(0);
  const [altitudeOffset, setAltitudeOffset] = useState<number>(0);
  const [useTrueNorth, setUseTrueNorth] = useState<boolean>(true);

  // Display and rendering settings
  const [fieldOfView, setFieldOfView] = useState<number>(55); // Horizontal FOV in degrees
  const [isRedNightMode, setIsRedNightMode] = useState<boolean>(false);
  const [showPlanets, setShowPlanets] = useState<boolean>(true);
  const [showStars, setShowStars] = useState<boolean>(true);
  const [showManzils, setShowManzils] = useState<boolean>(true);
  const [showHorizon, setShowHorizon] = useState<boolean>(true);
  const [showAlmucantars, setShowAlmucantars] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Target lock state
  const [targetedObject, setTargetedObject] = useState<{
    type: 'star' | 'planet' | 'manzil';
    data: ProjectedStar | ProjectedPlanet | ProjectedManzil;
    distanceDeg: number;
  } | null>(null);

  // Modal inspection detail state
  const [inspectedObject, setInspectedObject] = useState<{
    type: 'star' | 'planet' | 'manzil';
    data: ProjectedStar | ProjectedPlanet | ProjectedManzil;
  } | null>(null);

  // Container viewport dimensions
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  });

  // Ref for attitude smoothing filter
  const currentAttitudeRef = useRef<CameraAttitude>({
    azimuth: initialHeading,
    altitude: 20,
    roll: 0,
  });
  const targetAttitudeRef = useRef<CameraAttitude>({
    azimuth: initialHeading,
    altitude: 20,
    roll: 0,
  });

  // Touch drag state for manual look-around
  const touchStartRef = useRef<{ x: number; y: number; az: number; alt: number } | null>(null);

  // Update viewport dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setViewportSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      } else {
        setViewportSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Request Camera Stream on Mount
  useEffect(() => {
    if (!isOpen) return;

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Kamera tidak didukung oleh peramban ini.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        activeStream = stream;
        setCameraStream(stream);
        setCameraActive(true);
        setCameraError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Check torch availability
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
          if (capabilities.torch) {
            setHasTorch(true);
          }
        }
      } catch (err: any) {
        console.warn('AR Camera access failed, continuing in simulation mode:', err);
        setCameraActive(false);
        setCameraError(err.message || 'Izin kamera belum diberikan atau kamera tidak tersedia.');
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      setCameraStream(null);
      setCameraActive(false);
    };
  }, [isOpen]);

  // Handle Torch Toggle
  const handleToggleTorch = async () => {
    if (!cameraStream) return;
    const track = cameraStream.getVideoTracks()[0];
    if (!track) return;

    try {
      const newTorchState = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: newTorchState }],
      });
      setIsTorchOn(newTorchState);
    } catch (e) {
      console.warn('Torch constraint error:', e);
    }
  };

  // Process Device Orientation Angles into Camera 3D Attitude
  const processOrientationAngles = useCallback(
    (alpha: number | null, beta: number | null, gamma: number | null, isAbsolute: boolean) => {
      if (beta === null || gamma === null) return;

      const betaRad = (beta * Math.PI) / 180;
      const gammaRad = (gamma * Math.PI) / 180;

      // 1. Calculate camera Altitude (Elevation above horizon):
      // The rear camera vector pointing along -Z in device frame has world Z component:
      // z_world = -cos(beta)*cos(gamma)
      // Altitude = arcsin(z_world)
      const sinAlt = Math.max(-1, Math.min(1, -Math.cos(betaRad) * Math.cos(gammaRad)));
      let altDeg = (Math.asin(sinAlt) * 180) / Math.PI;

      // 2. Calculate camera Azimuth:
      let azDeg = 0;
      if (alpha !== null) {
        const alphaRad = (alpha * Math.PI) / 180;
        // World coordinates of rear camera optical axis (-Z):
        // x_world (East) = -cos(alpha)*sin(gamma) - sin(alpha)*sin(beta)*cos(gamma)
        // y_world (North) = -sin(alpha)*sin(gamma) + cos(alpha)*sin(beta)*cos(gamma)
        const xWorld = -Math.cos(alphaRad) * Math.sin(gammaRad) - Math.sin(alphaRad) * Math.sin(betaRad) * Math.cos(gammaRad);
        const yWorld = -Math.sin(alphaRad) * Math.sin(gammaRad) + Math.cos(alphaRad) * Math.sin(betaRad) * Math.cos(gammaRad);

        let bearingRad = Math.atan2(xWorld, yWorld);
        azDeg = (bearingRad * 180) / Math.PI;
        azDeg = (azDeg + 360) % 360;

        // Apply True North declination if selected and sensor is not already absolute
        if (useTrueNorth && !isAbsolute) {
          azDeg = (azDeg + magneticDeclination + 360) % 360;
        }
      }

      // 3. Screen roll angle
      const rollDeg = gamma;

      targetAttitudeRef.current = {
        azimuth: azDeg,
        altitude: altDeg,
        roll: rollDeg,
      };
      setSensorActive(true);
      setSensorAvailable(true);
    },
    [useTrueNorth, magneticDeclination]
  );

  // Setup Orientation Listeners
  useEffect(() => {
    if (!isOpen) return;

    // Check iOS permission requirement
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any)?.requestPermission === 'function'
    ) {
      setIsIOSPromptNeeded(true);
    }

    const handleAbsolute = (e: any) => {
      processOrientationAngles(e.alpha, e.beta, e.gamma, true);
    };

    const handleStandard = (e: DeviceOrientationEvent) => {
      const isWebKit = (e as any).webkitCompassHeading !== undefined;
      const alpha = isWebKit ? 360 - (e as any).webkitCompassHeading : e.alpha;
      processOrientationAngles(alpha, e.beta, e.gamma, isWebKit);
    };

    if ('ondeviceorientationabsolute' in window) {
      (window as any).addEventListener('deviceorientationabsolute', handleAbsolute);
    } else {
      (window as any).addEventListener('deviceorientation', handleStandard);
    }

    return () => {
      if ('ondeviceorientationabsolute' in window) {
        (window as any).removeEventListener('deviceorientationabsolute', handleAbsolute);
      }
      (window as any).removeEventListener('deviceorientation', handleStandard);
    };
  }, [isOpen, processOrientationAngles]);

  // Request iOS Sensor Permission
  const handleRequestIOSPermission = async () => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') {
          setIsIOSPromptNeeded(false);
          setSensorActive(true);
        }
      } catch (e) {
        console.error('iOS Sensor permission error:', e);
      }
    }
  };

  // Smooth attitude update loop (60 fps lerp to prevent jitter)
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    const updateLoop = () => {
      const cur = currentAttitudeRef.current;
      const target = targetAttitudeRef.current;

      // Smoothing factor
      const factor = 0.18;

      // Wrap azimuth delta correctly across 0/360 boundary
      let dAz = target.azimuth - cur.azimuth;
      if (dAz > 180) dAz -= 360;
      if (dAz < -180) dAz += 360;

      const dAlt = target.altitude - cur.altitude;
      const dRoll = target.roll - cur.roll;

      cur.azimuth = (cur.azimuth + dAz * factor + 360) % 360;
      cur.altitude = Math.max(-90, Math.min(90, cur.altitude + dAlt * factor));
      cur.roll = cur.roll + dRoll * factor;

      setAttitude({
        azimuth: cur.azimuth,
        altitude: cur.altitude,
        roll: cur.roll,
      });

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  // Touch / Mouse Drag Look-Around (for testing and manual alignment)
  const handlePointerDown = (e: React.PointerEvent) => {
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      az: targetAttitudeRef.current.azimuth,
      alt: targetAttitudeRef.current.altitude,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.clientX - touchStartRef.current.x;
    const dy = e.clientY - touchStartRef.current.y;

    const degPerPixelX = fieldOfView / viewportSize.width;
    const degPerPixelY = (fieldOfView * (viewportSize.height / viewportSize.width)) / viewportSize.height;

    // Dragging right moves view left (decreases azimuth)
    const newAz = (touchStartRef.current.az - dx * degPerPixelX + 360) % 360;
    // Dragging down moves view down (decreases altitude)
    const newAlt = Math.max(-90, Math.min(90, touchStartRef.current.alt + dy * degPerPixelY));

    targetAttitudeRef.current.azimuth = newAz;
    targetAttitudeRef.current.altitude = newAlt;
  };

  const handlePointerUp = () => {
    touchStartRef.current = null;
  };

  // Effective Camera Pointing Direction (including user calibration offsets)
  const effectiveCamera = useMemo(() => {
    const az = (attitude.azimuth + azimuthOffset + 360) % 360;
    const alt = Math.max(-90, Math.min(90, attitude.altitude + altitudeOffset));
    return {
      azimuth: az,
      altitude: alt,
      roll: attitude.roll,
    };
  }, [attitude, azimuthOffset, altitudeOffset]);

  const activeCardinal = useMemo(() => getCardinalInfo(effectiveCamera.azimuth), [effectiveCamera.azimuth]);

  // Project spherical sky coordinate (azimuth, altitude) to AR screen coordinates (X, Y)
  const projectToScreen = useCallback(
    (objAzimuth: number, objAltitude: number) => {
      const centerX = viewportSize.width / 2;
      const centerY = viewportSize.height / 2;

      // Angular distance from camera center
      let dAz = objAzimuth - effectiveCamera.azimuth;
      if (dAz > 180) dAz -= 360;
      if (dAz < -180) dAz += 360;

      const dAlt = objAltitude - effectiveCamera.altitude;

      // Tangent projection (Gnomonic camera perspective)
      // Focal length in pixels:
      const fovRad = (fieldOfView * Math.PI) / 180;
      const f = (viewportSize.width / 2) / Math.tan(fovRad / 2);

      const dAzRad = (dAz * Math.PI) / 180;
      const dAltRad = (dAlt * Math.PI) / 180;

      // Check if object is in front of camera hemisphere
      const cosDist = Math.cos(dAltRad) * Math.cos(dAzRad);
      if (cosDist <= 0.2) {
        return { isVisible: false, x: 0, y: 0, distanceDeg: 999 };
      }

      // Screen displacement
      const xOffset = Math.tan(dAzRad) * f;
      const yOffset = -Math.tan(dAltRad) * f; // In screen space, -y is UP

      const screenX = centerX + xOffset;
      const screenY = centerY + yOffset;

      // Angular distance from camera center
      const dDeg = Math.sqrt(dAz * dAz + dAlt * dAlt);

      // Check if inside visible screen boundary (with small padding)
      const margin = 50;
      const isInScreen =
        screenX >= -margin &&
        screenX <= viewportSize.width + margin &&
        screenY >= -margin &&
        screenY <= viewportSize.height + margin;

      return {
        isVisible: isInScreen,
        x: screenX,
        y: screenY,
        distanceDeg: dDeg,
      };
    },
    [effectiveCamera, fieldOfView, viewportSize]
  );

  // Compute Projected Celestial Objects in AR View
  const projectedARObjects = useMemo(() => {
    // 1. Projected Stars
    const stars = showStars
      ? skyData.stars
          .map((star) => {
            const proj = projectToScreen(star.projected.azimuth, star.projected.altitude);
            return {
              ...star,
              ar: proj,
            };
          })
          .filter((s) => s.ar.isVisible)
      : [];

    // 2. Projected Planets
    const planets = showPlanets
      ? skyData.planets
          .map((p) => {
            const proj = projectToScreen(p.azimuth, p.altitude);
            return {
              ...p,
              ar: proj,
            };
          })
          .filter((p) => p.ar.isVisible)
      : [];

    // 3. Projected 28 Lunar Mansions
    const manzils = showManzils
      ? skyData.manzils
          .map((m) => {
            const proj = projectToScreen(m.azimuth, m.altitude);
            return {
              ...m,
              ar: proj,
            };
          })
          .filter((m) => m.ar.isVisible)
      : [];

    return { stars, planets, manzils };
  }, [skyData, projectToScreen, showStars, showPlanets, showManzils]);

  // Real-Time Optical Target Lock: find nearest celestial object to center reticle
  useEffect(() => {
    let closest: {
      type: 'star' | 'planet' | 'manzil';
      data: ProjectedStar | ProjectedPlanet | ProjectedManzil;
      distanceDeg: number;
    } | null = null;
    let minDistance = 7.5; // Within 7.5 degrees of center crosshair to lock

    // Check planets first (high priority)
    projectedARObjects.planets.forEach((p) => {
      if (p.ar.distanceDeg < minDistance) {
        minDistance = p.ar.distanceDeg;
        closest = { type: 'planet', data: p, distanceDeg: p.ar.distanceDeg };
      }
    });

    // Check stars
    projectedARObjects.stars.forEach((s) => {
      if (s.ar.distanceDeg < minDistance) {
        minDistance = s.ar.distanceDeg;
        closest = { type: 'star', data: s, distanceDeg: s.ar.distanceDeg };
      }
    });

    // Check lunar mansions
    projectedARObjects.manzils.forEach((m) => {
      if (m.ar.distanceDeg < minDistance) {
        minDistance = m.ar.distanceDeg;
        closest = { type: 'manzil', data: m, distanceDeg: m.ar.distanceDeg };
      }
    });

    setTargetedObject(closest);
  }, [projectedARObjects]);

  // Cardinal Horizon Markers (North, East, South, West)
  const cardinalMarkers = useMemo(() => {
    if (!showHorizon) return [];
    const cardinals = [
      { name: 'U • الشَّمَال (Utara)', az: 0 },
      { name: 'TL • شَمَال شَرْقِيّ (Timur Laut)', az: 45 },
      { name: 'T • الشَّرْق (Timur)', az: 90 },
      { name: 'TG • جَنُوب شَرْقِيّ (Tenggara)', az: 135 },
      { name: 'S • الجَنُوب (Selatan)', az: 180 },
      { name: 'BD • جَنُوب غَرْبِيّ (Barat Daya)', az: 225 },
      { name: 'B • الغَرْب (Barat)', az: 270 },
      { name: 'BL • شَمَال غَرْبِيّ (Barat Laut)', az: 315 },
    ];

    return cardinals
      .map((c) => {
        const proj = projectToScreen(c.az, 0); // Altitude 0 = Real Horizon
        return {
          ...c,
          ...proj,
        };
      })
      .filter((c) => c.isVisible);
  }, [showHorizon, projectToScreen]);

  // Zenith Marker (Samt ar-Ra's at Altitude +90°)
  const zenithMarker = useMemo(() => {
    return projectToScreen(effectiveCamera.azimuth, 90);
  }, [effectiveCamera.azimuth, projectToScreen]);

  // Horizon Path (Khatt al-Ufuq) across the screen
  const horizonPoints = useMemo(() => {
    if (!showHorizon) return null;
    const pts: { x: number; y: number }[] = [];
    const step = 5;
    for (let az = -60; az <= 60; az += step) {
      const azTest = (effectiveCamera.azimuth + az + 360) % 360;
      const pt = projectToScreen(azTest, 0);
      if (pt.isVisible) {
        pts.push({ x: pt.x, y: pt.y });
      }
    }
    if (pts.length < 2) return null;
    return pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }, [showHorizon, effectiveCamera.azimuth, projectToScreen]);

  // Almucantar +30° and +60° Altitude Circles
  const almucantarPaths = useMemo(() => {
    if (!showAlmucantars) return [];
    const lines: { alt: number; d: string }[] = [];
    const alts = [30, 60];

    alts.forEach((alt) => {
      const pts: { x: number; y: number }[] = [];
      for (let az = -60; az <= 60; az += 5) {
        const azTest = (effectiveCamera.azimuth + az + 360) % 360;
        const pt = projectToScreen(azTest, alt);
        if (pt.isVisible) {
          pts.push({ x: pt.x, y: pt.y });
        }
      }
      if (pts.length >= 2) {
        lines.push({
          alt,
          d: pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '),
        });
      }
    });

    return lines;
  }, [showAlmucantars, effectiveCamera.azimuth, projectToScreen]);

  // Reset Calibration Offsets
  const handleResetCalibration = () => {
    setAzimuthOffset(0);
    setAltitudeOffset(0);
    targetAttitudeRef.current.azimuth = initialHeading;
    targetAttitudeRef.current.altitude = 20;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 overflow-hidden select-none touch-none ${
        isRedNightMode ? 'text-red-400' : 'text-slate-100'
      } bg-black`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Background Video Stream from Device Camera */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          cameraActive ? 'opacity-85' : 'opacity-0'
        } ${isRedNightMode ? 'filter sepia(1) saturate(5) hue-rotate(-50deg) contrast(1.2)' : ''}`}
      />

      {/* Atmospheric Starry Simulation Backdrop (Active when camera is off or in desktop mode) */}
      {!cameraActive && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isRedNightMode
              ? 'bg-gradient-to-b from-[#1a0505] via-[#2a0808] to-[#0d0202]'
              : 'bg-gradient-to-b from-[#030712] via-[#0b132b] to-[#040817]'
          }`}
        >
          {/* Subtle grid and horizon atmosphere */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,#1e293b22,transparent_70%)]" />
        </div>
      )}

      {/* Night-Vision Red Light Screen Filter Overlay */}
      {isRedNightMode && (
        <div className="absolute inset-0 pointer-events-none bg-red-950/25 mix-blend-color-burn z-0" />
      )}

      {/* SVG Canvas for Sky Projection (Celestial Objects, Astrolabe Rings, Horizon) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`}
      >
        <defs>
          {/* Glow filter */}
          <filter id="arGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Real Horizon Line (Khatt al-Ufuq) */}
        {horizonPoints && (
          <g className="ar-horizon">
            <path
              d={horizonPoints}
              fill="none"
              stroke={isRedNightMode ? '#ef4444' : '#38bdf8'}
              strokeWidth="2"
              strokeDasharray="6,4"
              strokeOpacity="0.8"
            />
          </g>
        )}

        {/* 2. Almucantar Altitude Rings (+30°, +60°) */}
        {almucantarPaths.map((almu) => (
          <g key={almu.alt} className="ar-almucantar">
            <path
              d={almu.d}
              fill="none"
              stroke={isRedNightMode ? '#b91c1c' : '#c59a43'}
              strokeWidth="1"
              strokeDasharray="3,5"
              strokeOpacity="0.5"
            />
          </g>
        ))}

        {/* 3. Cardinal Direction Markers along the Horizon */}
        {cardinalMarkers.map((c, idx) => (
          <g key={idx} transform={`translate(${c.x}, ${c.y})`} className="pointer-events-auto">
            <line x1="0" y1="-8" x2="0" y2="8" stroke={isRedNightMode ? '#ef4444' : '#f59e0b'} strokeWidth="1.5" />
            <rect
              x="-45"
              y="-26"
              width="90"
              height="18"
              rx="4"
              fill={isRedNightMode ? '#450a0a' : '#0f172a'}
              fillOpacity="0.8"
              stroke={isRedNightMode ? '#ef4444' : '#f59e0b'}
              strokeWidth="1"
            />
            <text
              x="0"
              y="-14"
              textAnchor="middle"
              fill={isRedNightMode ? '#fca5a5' : '#fef08a'}
              fontSize="9.5px"
              fontFamily="serif"
              fontWeight="bold"
            >
              {c.name.split('(')[0]}
            </text>
          </g>
        ))}

        {/* 4. Zenith Marker (Samt ar-Ra's) if pointing high overhead */}
        {zenithMarker.isVisible && (
          <g transform={`translate(${zenithMarker.x}, ${zenithMarker.y})`}>
            <circle
              cx="0"
              cy="0"
              r="18"
              fill="none"
              stroke={isRedNightMode ? '#ef4444' : '#c59a43'}
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <circle cx="0" cy="0" r="4" fill={isRedNightMode ? '#ef4444' : '#c59a43'} />
            <text
              x="0"
              y="-24"
              textAnchor="middle"
              fill={isRedNightMode ? '#fca5a5' : '#fef08a'}
              fontSize="11px"
              fontFamily="serif"
              fontWeight="bold"
            >
              سَمْتُ الرَّأْسِ (Zenith • 90°)
            </text>
          </g>
        )}

        {/* 5. Projected Classical Fixed Stars (Al-Kawakib ath-Thabitah) */}
        {projectedARObjects.stars.map((s) => {
          const isTargeted = targetedObject?.type === 'star' && (targetedObject.data as ProjectedStar).id === s.id;
          const starRadius = Math.max(3, 7 - (s.magnitude + 1.5) * 1.3);

          return (
            <g
              key={s.id}
              transform={`translate(${s.ar.x}, ${s.ar.y})`}
              className="pointer-events-auto cursor-pointer"
              onClick={() => setInspectedObject({ type: 'star', data: s })}
            >
              {/* Target lock pulsing ring */}
              {isTargeted && (
                <circle
                  cx="0"
                  cy="0"
                  r={starRadius + 14}
                  fill="none"
                  stroke={isRedNightMode ? '#ef4444' : '#38bdf8'}
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  className="animate-spin"
                />
              )}

              {/* Star Glow */}
              <circle
                cx="0"
                cy="0"
                r={starRadius + 6}
                fill={isRedNightMode ? '#ef4444' : s.spectralColor}
                opacity="0.35"
                filter="url(#arGlow)"
              />

              {/* Star Core */}
              <circle
                cx="0"
                cy="0"
                r={starRadius}
                fill={isRedNightMode ? '#fca5a5' : s.spectralColor}
                stroke="#0f172a"
                strokeWidth="1"
              />

              {/* Star Sparkle rays for magnitude < 1 */}
              {s.magnitude < 1.0 && (
                <>
                  <line
                    x1={-starRadius - 5}
                    y1="0"
                    x2={starRadius + 5}
                    y2="0"
                    stroke={isRedNightMode ? '#fca5a5' : s.spectralColor}
                    strokeWidth="1"
                    opacity="0.8"
                  />
                  <line
                    x1="0"
                    y1={-starRadius - 5}
                    x2="0"
                    y2={starRadius + 5}
                    stroke={isRedNightMode ? '#fca5a5' : s.spectralColor}
                    strokeWidth="1"
                    opacity="0.8"
                  />
                </>
              )}

              {/* Label */}
              <rect
                x={starRadius + 6}
                y="-12"
                width={s.transliteration.length * 7 + 10}
                height="20"
                rx="4"
                fill="#000000"
                fillOpacity="0.65"
              />
              <text
                x={starRadius + 11}
                y="2"
                fill={isTargeted ? '#38bdf8' : isRedNightMode ? '#fca5a5' : '#e2e8f0'}
                fontSize="11px"
                fontFamily="serif"
                fontWeight={isTargeted ? 'bold' : 'normal'}
              >
                {s.transliteration}
              </text>
              <text
                x={starRadius + 11}
                y="14"
                fill={isRedNightMode ? '#ef4444' : '#c59a43'}
                fontSize="8.5px"
                fontFamily="serif"
                direction="rtl"
              >
                {s.nameArabic}
              </text>
            </g>
          );
        })}

        {/* 6. Projected Planets (Al-Kawakib as-Sayyarah) */}
        {projectedARObjects.planets.map((p) => {
          const isTargeted = targetedObject?.type === 'planet' && (targetedObject.data as ProjectedPlanet).key === p.key;

          return (
            <g
              key={p.key}
              transform={`translate(${p.ar.x}, ${p.ar.y})`}
              className="pointer-events-auto cursor-pointer"
              onClick={() => setInspectedObject({ type: 'planet', data: p })}
            >
              {/* Target lock indicator */}
              {isTargeted && (
                <circle
                  cx="0"
                  cy="0"
                  r="24"
                  fill="none"
                  stroke={isRedNightMode ? '#ef4444' : '#f59e0b'}
                  strokeWidth="2"
                  strokeDasharray="6,3"
                  className="animate-spin"
                />
              )}

              {/* Planetary disk outer halo */}
              <circle
                cx="0"
                cy="0"
                r="16"
                fill={isRedNightMode ? '#ef4444' : p.color}
                opacity="0.3"
                filter="url(#arGlow)"
              />

              {/* Planetary body */}
              <circle
                cx="0"
                cy="0"
                r="10"
                fill={isRedNightMode ? '#f87171' : p.color}
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              {/* Planet glyph symbol */}
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill="#000000"
                fontSize="12px"
                fontWeight="bold"
              >
                {p.symbol}
              </text>

              {/* Label badge */}
              <rect
                x="-40"
                y="-32"
                width="80"
                height="18"
                rx="4"
                fill="#000000"
                fillOpacity="0.75"
                stroke={isRedNightMode ? '#ef4444' : p.color}
                strokeWidth="1"
              />
              <text
                x="0"
                y="-20"
                textAnchor="middle"
                fill={isRedNightMode ? '#fca5a5' : '#ffffff'}
                fontSize="10px"
                fontFamily="serif"
                fontWeight="bold"
              >
                {p.transliteration} {p.symbol}
              </text>
            </g>
          );
        })}

        {/* 7. Projected 28 Lunar Mansions (Manazil al-Qamar) */}
        {projectedARObjects.manzils.map((m) => {
          return (
            <g
              key={m.number}
              transform={`translate(${m.ar.x}, ${m.ar.y})`}
              className="pointer-events-auto cursor-pointer"
              onClick={() => setInspectedObject({ type: 'manzil', data: m })}
            >
              <circle
                cx="0"
                cy="0"
                r={m.isCurrentMoonMansion ? 6 : 4}
                fill={m.isCurrentMoonMansion ? '#f59e0b' : '#38bdf8'}
                stroke="#0f172a"
                strokeWidth="1"
              />
              {m.isCurrentMoonMansion && (
                <circle cx="0" cy="0" r="12" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
              )}
              <text
                x="8"
                y="-4"
                fill={m.isCurrentMoonMansion ? '#f59e0b' : '#94a3b8'}
                fontSize="9px"
                fontFamily="serif"
              >
                #{m.number} {m.arabicName}
              </text>
            </g>
          );
        })}
      </svg>

      {/* CENTER ASTROLABE TARGET RETICLE (AL-HADAF) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Outer Astrolabe Sight Ring */}
          <div
            className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
              targetedObject
                ? isRedNightMode
                  ? 'border-red-500 scale-105 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
                  : 'border-[#c59a43] scale-105 shadow-[0_0_25px_rgba(197,154,67,0.5)]'
                : 'border-slate-400/30 scale-100'
            }`}
          />

          {/* Inner 4-Point Crosshair Reticle */}
          <div
            className={`w-16 h-16 rounded-full border flex items-center justify-center transition-colors ${
              targetedObject
                ? isRedNightMode
                  ? 'border-red-400'
                  : 'border-sky-400'
                : 'border-slate-400/40'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                targetedObject
                  ? isRedNightMode
                    ? 'bg-red-500 animate-ping'
                    : 'bg-sky-400 animate-ping'
                  : 'bg-slate-400/60'
              }`}
            />
          </div>

          {/* Crosshair Spikes */}
          <div className="absolute top-0 w-0.5 h-4 bg-slate-400/60" />
          <div className="absolute bottom-0 w-0.5 h-4 bg-slate-400/60" />
          <div className="absolute left-0 w-4 h-0.5 bg-slate-400/60" />
          <div className="absolute right-0 w-4 h-0.5 bg-slate-400/60" />

          {/* Target locked notification card right below crosshair */}
          {targetedObject && (
            <div className="absolute -bottom-14 pointer-events-auto">
              <button
                onClick={() => setInspectedObject(targetedObject)}
                className={`px-3 py-1.5 rounded-xl border backdrop-blur-md flex items-center gap-2 shadow-2xl transition-all ${
                  isRedNightMode
                    ? 'bg-red-950/90 border-red-500 text-red-200'
                    : 'bg-slate-950/90 border-[#c59a43] text-amber-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <div className="text-left text-xs">
                  <div className="font-serif font-bold">
                    {targetedObject.type === 'star'
                      ? (targetedObject.data as ProjectedStar).transliteration
                      : targetedObject.type === 'planet'
                      ? `${(targetedObject.data as ProjectedPlanet).transliteration} ${(targetedObject.data as ProjectedPlanet).symbol}`
                      : `Manzil #${(targetedObject.data as ProjectedManzil).number} ${(targetedObject.data as ProjectedManzil).transliteration}`}
                  </div>
                  <div className="text-[9px] opacity-70 font-mono">
                    Terkunci di hadapan • Jarak {targetedObject.distanceDeg.toFixed(1)}°
                  </div>
                </div>
                <Eye className="w-3 h-3 ml-1 opacity-75" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TOP HUD BAR (Live Sensor Attitude, Location, Controls) */}
      <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between z-30 pointer-events-none">
        {/* Left: Device Attitude & Compass Telemetry */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div
            className={`p-2.5 rounded-2xl border backdrop-blur-md shadow-xl flex items-center gap-3 text-xs ${
              isRedNightMode
                ? 'bg-red-950/80 border-red-900/80 text-red-200'
                : 'bg-slate-900/85 border-slate-700/80 text-slate-200'
            }`}
          >
            {/* Live Compass Icon */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner ${
                isRedNightMode
                  ? 'bg-red-900/40 border-red-700 text-red-400'
                  : 'bg-sky-500/20 border-sky-400 text-sky-300'
              }`}
            >
              <Compass
                className="w-5 h-5 transition-transform duration-200"
                style={{ transform: `rotate(${-effectiveCamera.azimuth}deg)` }}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-bold font-mono text-sm">
                <span className={isRedNightMode ? 'text-red-400' : 'text-sky-400'}>
                  {Math.round(effectiveCamera.azimuth)}° {activeCardinal.code}
                </span>
                <span className="opacity-40">•</span>
                <span className="text-[#c59a43]">{activeCardinal.nameIndo}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] opacity-75 font-mono">
                <span>
                  Alt:{' '}
                  <strong className={effectiveCamera.altitude >= 0 ? 'text-emerald-400' : 'text-slate-400'}>
                    {effectiveCamera.altitude >= 0
                      ? `+${effectiveCamera.altitude.toFixed(1)}°`
                      : `${effectiveCamera.altitude.toFixed(1)}°`}
                  </strong>
                </span>
                <span>•</span>
                <span>{effectiveCamera.altitude >= 0 ? 'Langit Terbuka' : 'Di Bawah Ufuk'}</span>
              </div>
            </div>
          </div>

          {/* Sensor State Badge */}
          <div
            className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-mono backdrop-blur-md flex items-center gap-1.5 ${
              sensorActive
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
            }`}
            title={sensorActive ? 'Sensor akselerometer & giroskop aktif' : 'Mode simulasi manual'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${sensorActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}
            />
            <span>{sensorActive ? 'Giroskop & Sensor Aktif' : 'Simulasi AR'}</span>
          </div>
        </div>

        {/* Right: Quick Action Buttons & Close */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Torch Toggle (if camera torch is supported) */}
          {hasTorch && (
            <button
              onClick={handleToggleTorch}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-colors ${
                isTorchOn
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300'
              }`}
              title="Senter Kamera"
            >
              <Zap className="w-4 h-4" />
            </button>
          )}

          {/* Red Astronomical Night Mode Toggle */}
          <button
            onClick={() => setIsRedNightMode(!isRedNightMode)}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-colors ${
              isRedNightMode
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-red-400'
            }`}
            title="Mode Penglihatan Malam Astronomi (Filter Merah)"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Settings & Calibration Drawer Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-colors ${
              showSettings
                ? 'bg-sky-500 text-black border-sky-400 font-bold'
                : 'bg-slate-900/80 border-slate-700 text-slate-300'
            }`}
            title="Pengaturan & Kalibrasi Sensor AR"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Close AR View */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl border bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-red-600 hover:border-red-500 hover:text-white transition-colors backdrop-blur-md"
            title="Tutup Mode AR"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* IOS SENSOR PERMISSION PROMPT BANNER */}
      {isIOSPromptNeeded && (
        <div className="absolute top-20 left-4 right-4 z-40 p-4 rounded-2xl bg-slate-900/95 border border-sky-400 text-slate-100 shadow-2xl backdrop-blur-xl max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-bold text-sm text-sky-300">Izinkan Sensor Orientasi Perangkat</h4>
              <p className="text-xs text-slate-300 mt-1">
                Perangkat iOS (iPhone / iPad) memerlukan izin khusus untuk membaca data akselerometer & giroskop secara real-time.
              </p>
              <button
                onClick={handleRequestIOSPermission}
                className="mt-3 px-4 py-2 rounded-xl font-bold text-xs bg-sky-500 text-black hover:bg-sky-400 transition-colors shadow-lg"
              >
                Aktifkan Akselerometer & Giroskop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM HUD BAR (Observer location, cardinal quick buttons, and objects count) */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-wrap items-end justify-between gap-2 z-30 pointer-events-none">
        {/* Left: Quick Look Azimuth Shortcuts */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md text-xs">
          {[
            { label: 'U (0°)', az: 0 },
            { label: 'T (90°)', az: 90 },
            { label: 'S (180°)', az: 180 },
            { label: 'B (270°)', az: 270 },
            { label: 'Zenith (90°)', alt: 85 },
            { label: 'Ufuk (0°)', alt: 0 },
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (preset.az !== undefined) targetAttitudeRef.current.azimuth = preset.az;
                if (preset.alt !== undefined) targetAttitudeRef.current.altitude = preset.alt;
              }}
              className="px-2 py-1 rounded-lg text-[10px] font-mono border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800 text-slate-200 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Center/Right: Manual Pan D-Pad for devices without gyro */}
        {!sensorActive && (
          <div className="pointer-events-auto flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
            <button
              onClick={() => (targetAttitudeRef.current.azimuth = (targetAttitudeRef.current.azimuth - 15 + 360) % 360)}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200"
              title="Arahkan Kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                (targetAttitudeRef.current.altitude = Math.min(90, targetAttitudeRef.current.altitude + 10))
              }
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200"
              title="Arahkan Naik"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                (targetAttitudeRef.current.altitude = Math.max(-90, targetAttitudeRef.current.altitude - 10))
              }
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200"
              title="Arahkan Turun"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => (targetAttitudeRef.current.azimuth = (targetAttitudeRef.current.azimuth + 15) % 360)}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200"
              title="Arahkan Kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Observer Station & Objects in Sight count */}
        <div className="pointer-events-auto bg-slate-950/85 px-3 py-2 rounded-2xl border border-slate-800 text-right backdrop-blur-md text-xs">
          <div className="font-serif font-bold text-[#c59a43]">{observerLocation.name.split('(')[0]}</div>
          <div className="text-[10px] opacity-70 font-mono">
            {projectedARObjects.stars.length} Bintang • {projectedARObjects.planets.length} Planet dalam Layar
          </div>
        </div>
      </div>

      {/* SETTINGS & CALIBRATION SIDE DRAWER */}
      {showSettings && (
        <div className="absolute top-16 right-3 w-80 max-h-[calc(100vh-5rem)] overflow-y-auto z-40 p-4 rounded-2xl bg-slate-950/95 border border-slate-700 shadow-2xl backdrop-blur-xl text-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-serif font-bold text-[#c59a43] flex items-center gap-1.5 text-sm">
              <Sliders className="w-4 h-4" />
              Pengaturan & Kalibrasi AR
            </span>
            <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-slate-800 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* True North vs Magnetic Compass */}
          <div className="space-y-1.5">
            <label className="text-[11px] opacity-80 block font-serif">Koreksi Deklinasi Magnetik:</label>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs">Utara Sejati (True North)</span>
              <button
                onClick={() => setUseTrueNorth(!useTrueNorth)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-colors ${
                  useTrueNorth
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {useTrueNorth ? `Aktif (${magneticDeclination >= 0 ? `+${magneticDeclination}°` : `${magneticDeclination}°`})` : 'Magnetik Saja'}
              </button>
            </div>
            <p className="text-[9.5px] opacity-60">
              Menyesuaikan kutub magnetik bumi ke Kutub Langit Utara Sejati untuk lokasi {observerLocation.name.split('(')[0]}.
            </p>
          </div>

          {/* Azimuth Fine Nudge Offset */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="opacity-80">Kalibrasi Sudut Azimuth:</span>
              <span className="font-mono text-sky-400 font-bold">{azimuthOffset >= 0 ? `+${azimuthOffset}°` : `${azimuthOffset}°`}</span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="0.5"
              value={azimuthOffset}
              onChange={(e) => setAzimuthOffset(parseFloat(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Altitude Fine Nudge Offset */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="opacity-80">Kalibrasi Sudut Ketinggian (Altitude):</span>
              <span className="font-mono text-amber-400 font-bold">{altitudeOffset >= 0 ? `+${altitudeOffset}°` : `${altitudeOffset}°`}</span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="0.5"
              value={altitudeOffset}
              onChange={(e) => setAltitudeOffset(parseFloat(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Camera Field of View (FOV) Zoom */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="opacity-80">Sudut Pandang Lensa (FOV):</span>
              <span className="font-mono text-emerald-400 font-bold">{fieldOfView}°</span>
            </div>
            <input
              type="range"
              min="35"
              max="80"
              step="1"
              value={fieldOfView}
              onChange={(e) => setFieldOfView(parseInt(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Celestial Layers Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] opacity-80 block font-serif">Lapisan Langit AR:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowStars(!showStars)}
                className={`p-2 rounded-xl border text-[11px] font-serif text-left flex items-center gap-1.5 ${
                  showStars ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-900 border-slate-800 opacity-60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bintang Tetap</span>
              </button>

              <button
                onClick={() => setShowPlanets(!showPlanets)}
                className={`p-2 rounded-xl border text-[11px] font-serif text-left flex items-center gap-1.5 ${
                  showPlanets ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-800 opacity-60'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Planet & Bulan</span>
              </button>

              <button
                onClick={() => setShowManzils(!showManzils)}
                className={`p-2 rounded-xl border text-[11px] font-serif text-left flex items-center gap-1.5 ${
                  showManzils ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300' : 'bg-slate-900 border-slate-800 opacity-60'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>28 Manzil</span>
              </button>

              <button
                onClick={() => setShowHorizon(!showHorizon)}
                className={`p-2 rounded-xl border text-[11px] font-serif text-left flex items-center gap-1.5 ${
                  showHorizon ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-800 opacity-60'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Garis Ufuk</span>
              </button>
            </div>
          </div>

          {/* Reset Calibration */}
          <button
            onClick={handleResetCalibration}
            className="w-full py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 font-serif text-xs flex items-center justify-center gap-1.5 text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Kalibrasi ke Posisi Awal</span>
          </button>
        </div>
      )}

      {/* OBJECT DETAIL INSPECTION MODAL (When user clicks an object in AR) */}
      {inspectedObject && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-5 rounded-3xl bg-slate-950 border border-[#c59a43] text-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#c59a43]">
                  {inspectedObject.type === 'star'
                    ? 'Bintang Tetap Klasik (كَوْكَبٌ ثَابِتٌ)'
                    : inspectedObject.type === 'planet'
                    ? 'Planet Berjalan (كَوْكَبٌ سَيَّارٌ)'
                    : 'Manzil Bulan (مَنْزِلُ القَمَرِ)'}
                </span>
                <h3 className="font-serif font-bold text-xl text-amber-300">
                  {inspectedObject.type === 'star'
                    ? (inspectedObject.data as ProjectedStar).transliteration
                    : inspectedObject.type === 'planet'
                    ? (inspectedObject.data as ProjectedPlanet).transliteration
                    : (inspectedObject.data as ProjectedManzil).transliteration}
                </h3>
                <div className="text-sm font-serif text-[#c59a43]" dir="rtl">
                  {inspectedObject.type === 'star'
                    ? (inspectedObject.data as ProjectedStar).nameArabic
                    : inspectedObject.type === 'planet'
                    ? (inspectedObject.data as ProjectedPlanet).arabicName
                    : (inspectedObject.data as ProjectedManzil).arabicName}
                </div>
              </div>
              <button
                onClick={() => setInspectedObject(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Coordinates in Current Observer Horizon */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] opacity-60 block">Ketinggian (Irtifa'):</span>
                <span className="font-bold text-sm text-emerald-400">
                  {inspectedObject.type === 'star'
                    ? `${(inspectedObject.data as ProjectedStar).projected.altitude.toFixed(1)}°`
                    : inspectedObject.type === 'planet'
                    ? `${(inspectedObject.data as ProjectedPlanet).altitude.toFixed(1)}°`
                    : `${(inspectedObject.data as ProjectedManzil).altitude.toFixed(1)}°`}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] opacity-60 block">Azimuth (As-Samt):</span>
                <span className="font-bold text-sm text-sky-400">
                  {inspectedObject.type === 'star'
                    ? `${(inspectedObject.data as ProjectedStar).projected.azimuth.toFixed(1)}°`
                    : inspectedObject.type === 'planet'
                    ? `${(inspectedObject.data as ProjectedPlanet).azimuth.toFixed(1)}°`
                    : `${(inspectedObject.data as ProjectedManzil).azimuth.toFixed(1)}°`}
                </span>
              </div>
            </div>

            {/* Classical Description & Sindhind Lore */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] opacity-60 block font-serif">Keterangan Astronomis Klasik:</span>
              <p className="leading-relaxed text-slate-300">
                {inspectedObject.type === 'star'
                  ? (inspectedObject.data as ProjectedStar).classicalDescription
                  : inspectedObject.type === 'planet'
                  ? `Planet ${(inspectedObject.data as ProjectedPlanet).transliteration} memiliki bujur ekliptika ${(inspectedObject.data as ProjectedPlanet).eclipticLongitude.toFixed(1)}° menurut perhitungan hisab Zij as-Sindhind.`
                  : (inspectedObject.data as ProjectedManzil).fortune}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  onSelectObject(inspectedObject);
                  setInspectedObject(null);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl font-bold bg-[#c59a43] text-black hover:bg-[#d6aa52] transition-colors text-xs flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Eye className="w-4 h-4" />
                <span>Buka Detail di Peta Langit Utama</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
