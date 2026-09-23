import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun,
  Moon,
  Compass,
  Wifi,
  WifiOff,
  Smartphone,
  Laptop,
  Flame,
  Sparkles,
  Layers,
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Download,
  Share2,
  Calendar,
  Compass as CompassIcon,
  Maximize2,
  Minimize2,
  Info,
} from 'lucide-react';
import {
  HistoricalDateInfo,
  AspectRelation,
  PlanetaryPosition,
  PlanetKey,
} from '../types';
import { ZODIAC_SIGNS } from '../lib/sindhindEngine';
import { calculateActiveManzil, ActiveManzilAnalysis } from '../lib/manzilCalculatorEngine';

export interface DashboardRingkasanViewProps {
  chartData: {
    positions: Record<PlanetKey, PlanetaryPosition>;
    aspects: AspectRelation[];
    ascendant: any;
    midheaven: any;
    houses: any[];
  };
  currentDateInfo: HistoricalDateInfo;
  theme: 'night' | 'parchment';
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onSelectDateStep: (hoursOffset: number) => void;
  onResetToNow?: () => void;
  compassHeading?: number;
  isCompassSynced?: boolean;
  onToggleCompassSync?: (synced: boolean) => void;
}

export const DashboardRingkasanView: React.FC<DashboardRingkasanViewProps> = ({
  chartData,
  currentDateInfo,
  theme,
  activeTab,
  onNavigateTab,
  onSelectDateStep,
  onResetToNow,
  compassHeading = 0,
  isCompassSynced = false,
  onToggleCompassSync,
}) => {
  const isNight = theme === 'night';

  // Card collapsed / expanded state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sindhind_dashboard_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sindhind_dashboard_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Mini-tab inside the card
  type MiniTab = 'planets' | 'aspects' | 'manzil' | 'device';
  const [activeMiniTab, setActiveMiniTab] = useState<MiniTab>('planets');

  // =========================================================================
  // ONLINE / OFFLINE STATUS DETECTION
  // =========================================================================
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastOnlineCheck, setLastOnlineCheck] = useState<Date>(new Date());
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineCheck(new Date());
      setPingResult('Tersambung kembali ke internet');
      setTimeout(() => setPingResult(null), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastOnlineCheck(new Date());
      setPingResult('Mode Nir-Internet Aktif (100% Hisab Lokal)');
      setTimeout(() => setPingResult(null), 4000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTestConnection = async () => {
    setIsPinging(true);
    setPingResult('Memeriksa konektivitas jaringan...');
    try {
      // Small lightweight request to check real connectivity
      const start = performance.now();
      await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
      const duration = Math.round(performance.now() - start);
      setIsOnline(true);
      setPingResult(`Koneksi aktif • Latensi lokal: ${duration} ms`);
    } catch {
      setIsOnline(navigator.onLine);
      setPingResult(
        navigator.onLine
          ? 'Koneksi aktif (Layanan lokal berjalan lancar)'
          : 'Perangkat berada dalam mode offline / pesawat'
      );
    } finally {
      setIsPinging(false);
      setTimeout(() => setPingResult(null), 4000);
    }
  };

  // =========================================================================
  // ANDROID & iOS DEVICE ACCESS RESPONSE DETECTION
  // =========================================================================
  interface DevicePlatformInfo {
    os: 'android' | 'ios' | 'macos' | 'windows' | 'linux' | 'other';
    osName: string;
    isMobile: boolean;
    isStandalone: boolean; // PWA home screen installed
    browserName: string;
    touchSupport: boolean;
    orientation: 'portrait' | 'landscape';
  }

  const [deviceInfo, setDeviceInfo] = useState<DevicePlatformInfo>(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        os: 'other',
        osName: 'Desktop / Browser',
        isMobile: false,
        isStandalone: false,
        browserName: 'Browser',
        touchSupport: false,
        orientation: 'landscape',
      };
    }

    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const isWindows = /Windows/.test(ua);
    const isMac = /Macintosh/.test(ua) && !isIOS;
    const isLinux = /Linux/.test(ua) && !isAndroid;

    let os: DevicePlatformInfo['os'] = 'other';
    let osName = 'Desktop / Web';
    if (isIOS) {
      os = 'ios';
      osName = /iPad/.test(ua) ? 'Apple iPadOS' : 'Apple iOS (iPhone)';
    } else if (isAndroid) {
      os = 'android';
      osName = 'Android OS';
    } else if (isMac) {
      os = 'macos';
      osName = 'Apple macOS';
    } else if (isWindows) {
      os = 'windows';
      osName = 'Microsoft Windows';
    } else if (isLinux) {
      os = 'linux';
      osName = 'GNU/Linux';
    }

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    let browserName = 'Web Browser';
    if (/Chrome/.test(ua) && !/Edge|OPR/.test(ua)) browserName = 'Google Chrome';
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browserName = 'Apple Safari';
    else if (/Firefox/.test(ua)) browserName = 'Mozilla Firefox';
    else if (/Edge/.test(ua)) browserName = 'Microsoft Edge';

    return {
      os,
      osName,
      isMobile: isIOS || isAndroid || /Mobi|Tablet/.test(ua),
      isStandalone,
      browserName,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    };
  });

  // Track install prompt event on Android/Chrome
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setInstallSuccess(true);
      setDeferredPrompt(null);
    };

    const handleResize = () => {
      setDeviceInfo((prev) => ({
        ...prev,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
        setInstallSuccess(true);
      }
      setDeferredPrompt(null);
    }
  };

  // =========================================================================
  // ASTRONOMICAL COMPUTATIONS (PLANETS, ASPECTS, MANZIL)
  // =========================================================================
  const { positions, aspects, ascendant } = chartData;

  // Key classical 7 planets + nodes
  const planetKeys: PlanetKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'];

  // Current Moon Mansion Analysis
  const activeManzil: ActiveManzilAnalysis = useMemo(() => {
    return calculateActiveManzil(positions.moon, positions, aspects);
  }, [positions, aspects]);

  // Major aspects breakdown
  const majorAspects = useMemo(() => {
    return aspects
      .filter((asp) => asp.orbDifference <= 6.5) // tighter orb for prominent aspects
      .slice(0, 8);
  }, [aspects]);

  const harmoniousAspectsCount = useMemo(() => {
    return aspects.filter((a) => a.nature === 'Sa\'d').length;
  }, [aspects]);

  const challengingAspectsCount = useMemo(() => {
    return aspects.filter((a) => a.nature === 'Nahs').length;
  }, [aspects]);

  const retrogradePlanets = useMemo(() => {
    return planetKeys
      .map((k) => positions[k])
      .filter((p) => p && p.isRetrograde);
  }, [positions]);

  const combustPlanets = useMemo(() => {
    return planetKeys
      .map((k) => positions[k])
      .filter((p) => p && p.isCombust && p.planet.key !== 'sun');
  }, [positions]);

  const ascSign = ZODIAC_SIGNS[ascendant.signIndex];

  return (
    <div
      className={`mb-6 rounded-2xl border transition-all duration-300 shadow-lg overflow-hidden ${
        isNight
          ? 'bg-gradient-to-b from-[#111726] via-[#0d1320] to-[#0a0f19] border-[#22314a] text-[#e2d8c3]'
          : 'bg-gradient-to-b from-[#fbf8f0] via-[#f7f2e6] to-[#eee4d0] border-[#ded1bb] text-[#2c2419]'
      }`}
    >
      {/* ===================================================================== */}
      {/* 1. TOP STATUS TICKER & CONTROL BAR                                   */}
      {/* ===================================================================== */}
      <div
        className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
          isNight ? 'border-[#1e2b42] bg-[#0c111c]/70' : 'border-[#e4d7c0] bg-[#f4ebe0]/80'
        }`}
      >
        {/* Left: Module Title & Islamic Inscription */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#c59a43]/20 border border-[#c59a43]/40 flex items-center justify-center text-[#c59a43] shrink-0 shadow-inner">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm sm:text-base text-[#c59a43]">
                Ikhtisar Cepat Falak &amp; Manāzil
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-current/10 border border-current/20 hidden sm:inline-block">
                الخلاصة الفلكية
              </span>
            </div>
            <p className="text-[11px] opacity-75 font-serif">
              Sinkronisasi Kondisi Langit, Aspek Dominan &amp; Respon Akses
            </p>
          </div>
        </div>

        {/* Center: Live Status Badges (Online/Offline + Device OS) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Online / Offline Live Indicator Chip */}
          <div
            onClick={handleTestConnection}
            className={`px-2.5 py-1 rounded-full border text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition-all ${
              isOnline
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                : 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
            }`}
            title="Klik untuk menguji latensi dan status sambungan jaringan lokal"
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="font-semibold hidden xs:inline">Online • Hisab Aktif</span>
                <span className="font-semibold xs:hidden">Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span className="font-semibold">Nir-Internet (100% Offline Lokal)</span>
              </>
            )}
          </div>

          {/* OS & Device Platform Badge */}
          <button
            type="button"
            onClick={() => {
              setIsCollapsed(false);
              setActiveMiniTab('device');
            }}
            className={`px-2.5 py-1 rounded-full border text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              deviceInfo.os === 'android'
                ? 'bg-emerald-600/15 border-emerald-600/30 text-emerald-300'
                : deviceInfo.os === 'ios'
                ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                : isNight
                ? 'bg-[#162035] border-[#253552] text-amber-300'
                : 'bg-[#ede5d5] border-[#dacdb0] text-stone-800'
            }`}
            title="Lihat status kesiapan responsif perangkat Android/iOS & instalasi PWA"
          >
            {deviceInfo.isMobile ? (
              <Smartphone className="w-3 h-3" />
            ) : (
              <Laptop className="w-3 h-3" />
            )}
            <span>{deviceInfo.osName}</span>
            {deviceInfo.isStandalone && (
              <span className="px-1 py-0.2 rounded bg-amber-500/20 text-[#c59a43] text-[9px] uppercase font-bold">
                PWA
              </span>
            )}
          </button>

          {/* Time Navigation: -1h, Now, +1h */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg border bg-black/10 border-current/15">
            <button
              type="button"
              onClick={() => onSelectDateStep(-1)}
              className="px-2 py-0.5 rounded hover:bg-current/10 text-[11px] font-mono font-bold transition-colors"
              title="Mundur 1 Jam"
            >
              -1j
            </button>
            {onResetToNow && (
              <button
                type="button"
                onClick={onResetToNow}
                className="px-2 py-0.5 rounded hover:bg-[#c59a43]/20 text-[#c59a43] text-[11px] font-mono font-bold transition-colors"
                title="Kembalikan ke Waktu Riil Sekarang"
              >
                Sekarang
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectDateStep(1)}
              className="px-2 py-0.5 rounded hover:bg-current/10 text-[11px] font-mono font-bold transition-colors"
              title="Maju 1 Jam"
            >
              +1j
            </button>
          </div>

          {/* Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className={`p-1.5 rounded-lg border transition-colors ${
              isNight
                ? 'bg-[#151c2e] hover:bg-[#1d273f] border-[#25344f]'
                : 'bg-[#ede5d5] hover:bg-[#e4dac6] border-[#dacdb2]'
            }`}
            title={isCollapsed ? 'Buka Panel Ringkasan Lengkap' : 'Ciutkan Panel'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4 text-[#c59a43]" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Ping / Connection Feedback Notification Toast */}
      {pingResult && (
        <div className="px-4 py-2 bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{pingResult}</span>
          </div>
          <span className="text-[10px] opacity-75">
            {lastOnlineCheck.toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. COMPACT SUMMARY STRIP (Shown always, clickable to expand)         */}
      {/* ===================================================================== */}
      <div
        className={`px-4 sm:px-6 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b ${
          isNight ? 'border-[#1e2b42]/60 bg-[#0e1424]/40' : 'border-[#e4d7c0]/60 bg-[#faf6ee]/50'
        }`}
      >
        {/* Metric 1: Moon Mansion */}
        <div
          onClick={() => {
            setIsCollapsed(false);
            setActiveMiniTab('manzil');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Klik untuk ringkasan Manzil Bulan"
        >
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
            <Moon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] opacity-70 font-mono flex items-center gap-1">
              <span>MANZIL HARI INI</span>
              <span className="font-bold text-sky-400">#{activeManzil.mansionNumber}</span>
            </div>
            <div className="font-serif font-bold text-xs truncate group-hover:text-sky-400 transition-colors">
              {activeManzil.mansion.transliteration} ({activeManzil.mansion.arabicName})
            </div>
          </div>
        </div>

        {/* Metric 2: Sun & Ascendant */}
        <div
          onClick={() => {
            setIsCollapsed(false);
            setActiveMiniTab('planets');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Klik untuk melihat posisi planet lengkap"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#c59a43] shrink-0 group-hover:scale-105 transition-transform">
            <Sun className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] opacity-70 font-mono">
              SYAMS • ASYSYAMS
            </div>
            <div className="font-serif font-bold text-xs truncate group-hover:text-[#c59a43] transition-colors">
              {positions.sun.coordinate.signDegree}° {positions.sun.coordinate.signDegreeMinutes}' {ZODIAC_SIGNS[positions.sun.coordinate.signIndex]?.latinName}
            </div>
          </div>
        </div>

        {/* Metric 3: Major Aspects Balance */}
        <div
          onClick={() => {
            setIsCollapsed(false);
            setActiveMiniTab('aspects');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Klik untuk melihat rincian aspek planet aktif"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
            <Activity className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] opacity-70 font-mono">
              ASPEK AKTIF
            </div>
            <div className="font-serif font-bold text-xs flex items-center gap-1.5">
              <span className="text-emerald-400">{harmoniousAspectsCount} Sa'd</span>
              <span className="opacity-40">•</span>
              <span className="text-rose-400">{challengingAspectsCount} Nahs</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Day & Hour Ruler */}
        <div
          onClick={() => {
            setIsCollapsed(false);
            setActiveMiniTab('planets');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Penguasa Falak Waktu Ini"
        >
          <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] opacity-70 font-mono">
              PENGUASA FALAK
            </div>
            <div className="font-serif font-bold text-xs truncate">
              Hari: <span className="text-purple-400">{currentDateInfo.dayRuler.toUpperCase()}</span> • Jam: <span className="text-[#c59a43]">{currentDateInfo.hourRuler.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. EXPANDABLE INTERACTIVE BODY                                       */}
      {/* ===================================================================== */}
      {!isCollapsed && (
        <div className="p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
          {/* Subtabs Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-current/10">
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border bg-black/10 border-current/15 text-xs">
              <button
                type="button"
                onClick={() => setActiveMiniTab('planets')}
                className={`px-3 py-1.5 rounded-lg font-serif font-semibold transition-all flex items-center gap-1.5 ${
                  activeMiniTab === 'planets'
                    ? 'bg-[#c59a43] text-black shadow-sm'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Kondisi 7 Planet</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMiniTab('aspects')}
                className={`px-3 py-1.5 rounded-lg font-serif font-semibold transition-all flex items-center gap-1.5 ${
                  activeMiniTab === 'aspects'
                    ? 'bg-[#c59a43] text-black shadow-sm'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Ringkasan Aspek</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
                  {majorAspects.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMiniTab('manzil')}
                className={`px-3 py-1.5 rounded-lg font-serif font-semibold transition-all flex items-center gap-1.5 ${
                  activeMiniTab === 'manzil'
                    ? 'bg-[#c59a43] text-black shadow-sm'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Manzil Bulan Saat Ini</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/20 text-sky-300 font-mono">
                  #{activeManzil.mansionNumber}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMiniTab('device')}
                className={`px-3 py-1.5 rounded-lg font-serif font-semibold transition-all flex items-center gap-1.5 ${
                  activeMiniTab === 'device'
                    ? 'bg-[#c59a43] text-black shadow-sm'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Akses Android / iOS &amp; Offline</span>
                {deviceInfo.isMobile && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>
            </div>

            {/* Quick jump link to full modules */}
            <div className="flex items-center gap-2 text-xs">
              <span className="opacity-60 hidden md:inline font-mono">Navigasi Langsung:</span>
              <button
                type="button"
                onClick={() => onNavigateTab('ephemeris')}
                className="px-2.5 py-1 rounded-lg border border-current/20 hover:border-[#c59a43] hover:text-[#c59a43] transition-colors font-serif"
              >
                Ephemeris
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('aspects')}
                className="px-2.5 py-1 rounded-lg border border-current/20 hover:border-[#c59a43] hover:text-[#c59a43] transition-colors font-serif"
              >
                Aspek
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('manzil')}
                className="px-2.5 py-1 rounded-lg border border-current/20 hover:border-[#c59a43] hover:text-[#c59a43] transition-colors font-serif"
              >
                Manzil
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('wafaq')}
                className="px-2.5 py-1 rounded-lg border border-current/20 hover:border-[#c59a43] hover:text-[#c59a43] transition-colors font-serif"
              >
                Wafaq
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* TAB 1: KONDISI PLANET SAAT INI (Kondisi 7 Kawkab + Rahu & Ketu)    */}
          {/* ================================================================= */}
          {activeMiniTab === 'planets' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {planetKeys.map((key) => {
                  const pos = positions[key];
                  if (!pos) return null;
                  const sign = ZODIAC_SIGNS[pos.coordinate.signIndex];
                  const isDayRuler = currentDateInfo.dayRuler === key;
                  const isHourRuler = currentDateInfo.hourRuler === key;

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-xl border relative transition-all duration-150 hover:shadow-md ${
                        isNight
                          ? 'bg-[#121929]/90 border-[#23334e] hover:border-[#c59a43]/50'
                          : 'bg-[#faf6ee] border-[#dfd4bd] hover:border-[#c59a43]/60'
                      }`}
                    >
                      {/* Top Header: Name, Arabic & Motion status */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs"
                            style={{ backgroundColor: `${pos.planet.color}25`, color: pos.planet.color }}
                          >
                            {pos.planet.symbol}
                          </span>
                          <span className="font-serif font-bold text-xs">
                            {pos.planet.transliteration}
                          </span>
                        </div>
                        <span className="font-serif text-[11px] opacity-70">
                          {pos.planet.arabicName}
                        </span>
                      </div>

                      {/* Position & Sign */}
                      <div className="font-mono text-xs font-semibold text-[#c59a43] mb-1">
                        {pos.coordinate.signDegree}° {pos.coordinate.signDegreeMinutes}' {sign.latinName}
                      </div>

                      {/* House & Motion Status Tags */}
                      <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                        <span className="px-1.5 py-0.2 rounded bg-current/10 opacity-75">
                          Bayt {pos.houseNumber}
                        </span>

                        {pos.isRetrograde && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-0.5">
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Rāji' (Rx)</span>
                          </span>
                        )}

                        {pos.isCombust && key !== 'sun' && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" />
                            <span>Muḥtariq</span>
                          </span>
                        )}

                        {pos.dignity.isExalted && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            Sharaf
                          </span>
                        )}

                        {pos.dignity.isDomicile && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">
                            Bayt
                          </span>
                        )}
                      </div>

                      {/* Ruler Highlights */}
                      {(isDayRuler || isHourRuler) && (
                        <div className="mt-2 pt-1.5 border-t border-current/10 flex items-center gap-1 text-[9px] font-mono font-bold text-purple-400">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{isDayRuler && isHourRuler ? 'Penguasa Hari & Jam' : isDayRuler ? 'Penguasa Hari Ini' : 'Penguasa Jam Ini'}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status Warning Summary (Retrograde / Combustion alerts) */}
              {(retrogradePlanets.length > 0 || combustPlanets.length > 0) && (
                <div
                  className={`p-3 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-3 ${
                    isNight ? 'bg-[#181d2c] border-[#293a55]' : 'bg-[#f4efe4] border-[#ded3be]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {retrogradePlanets.length > 0 && (
                        <span>
                          <strong>{retrogradePlanets.length} Planet Mundur (Rāji'):</strong>{' '}
                          {retrogradePlanets.map((p) => p.planet.transliteration).join(', ')}.{' '}
                        </span>
                      )}
                      {combustPlanets.length > 0 && (
                        <span className="opacity-90">
                          <strong>{combustPlanets.length} Planet Terbakar Matahari (Iḥtirāq):</strong>{' '}
                          {combustPlanets.map((p) => p.planet.transliteration).join(', ')}.
                        </span>
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('ephemeris')}
                    className="inline-flex items-center gap-1 text-[#c59a43] hover:underline font-serif font-semibold text-xs shrink-0"
                  >
                    <span>Buka Tabel Ephemeris Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: RINGKASAN ASPEK UTAMA (Ahkam al-Ittisal)                   */}
          {/* ================================================================= */}
          {activeMiniTab === 'aspects' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {majorAspects.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-xs opacity-75 font-serif">
                    Tidak ada aspek utama ber-orb ketat (≤ 6.5°) pada waktu hisab ini.
                  </div>
                ) : (
                  majorAspects.map((asp, idx) => {
                    const posA = positions[asp.planetA];
                    const posB = positions[asp.planetB];
                    if (!posA || !posB) return null;

                    const isSaad = asp.nature === 'Sa\'d';

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isNight
                            ? 'bg-[#121929]/90 border-[#23334e]'
                            : 'bg-[#faf6ee] border-[#dfd4bd]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              isSaad
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {asp.nature} ({asp.aspectName})
                          </span>
                          <span className="font-serif text-xs font-bold opacity-80">
                            {asp.aspectArabic}
                          </span>
                        </div>

                        {/* Planets pair */}
                        <div className="flex items-center justify-between text-xs font-serif font-bold mb-1.5">
                          <span className="flex items-center gap-1">
                            <span style={{ color: posA.planet.color }}>{posA.planet.symbol}</span>
                            <span>{posA.planet.transliteration}</span>
                          </span>
                          <span className="opacity-40 font-mono">↔</span>
                          <span className="flex items-center gap-1">
                            <span style={{ color: posB.planet.color }}>{posB.planet.symbol}</span>
                            <span>{posB.planet.transliteration}</span>
                          </span>
                        </div>

                        {/* Exact degree and orb difference */}
                        <div className="text-[11px] font-mono opacity-80 flex items-center justify-between">
                          <span>Sudut: {asp.actualAngle.toFixed(1)}°</span>
                          <span className={asp.orbDifference <= 2.0 ? 'text-amber-400 font-bold' : ''}>
                            Orb: {asp.orbDifference.toFixed(2)}°
                          </span>
                        </div>

                        {/* Applying vs Separating */}
                        <div className="mt-1 text-[10px] font-mono opacity-70">
                          {asp.isApplying ? '↗ Muttasil (Mendekat / Kuat)' : '↘ Munfasil (Menjauh / Melemah)'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-current/10 text-xs">
                <div className="flex items-center gap-4 opacity-80 font-mono">
                  <span>Total {aspects.length} Aspek Terhitung</span>
                  <span className="text-emerald-400 font-semibold">• {harmoniousAspectsCount} Aspek Harmonis (Tathlith/Tasdis)</span>
                  <span className="text-rose-400 font-semibold">• {challengingAspectsCount} Aspek Tegang (Tarbi'/Muqabalah)</span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab('aspects')}
                  className="inline-flex items-center gap-1 text-[#c59a43] hover:underline font-serif font-bold text-xs"
                >
                  <span>Buka Tabel Aspek &amp; Matriks Synastry Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: MANZIL BULAN SAAT INI (Manāzil al-Qamar & Ikhtiyarat)       */}
          {/* ================================================================= */}
          {activeMiniTab === 'manzil' && (
            <div className="space-y-4">
              <div
                className={`p-4 sm:p-5 rounded-xl border relative overflow-hidden ${
                  isNight
                    ? 'bg-gradient-to-br from-[#121c2e] via-[#101726] to-[#0a101b] border-[#22334f]'
                    : 'bg-gradient-to-br from-[#faf4e8] via-[#f7efe0] to-[#ece0cb] border-[#dfd2ba]'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Mansion Info & Calligraphy */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#c59a43]/20 border border-[#c59a43]/40 text-[#c59a43]">
                        MANZIL BULAN AKTIF #{activeManzil.mansionNumber} / 28
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          activeManzil.mansion.fortune === 'Sa\'d'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : activeManzil.mansion.fortune === 'Nahs'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {activeManzil.mansion.fortune === 'Sa\'d' ? 'Keberuntungan (Sa\'d)' : activeManzil.mansion.fortune === 'Nahs' ? 'Pantangan / Waspada (Naḥs)' : 'Sedang / Mu\'tadil'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#c59a43]">
                        {activeManzil.mansion.transliteration}
                      </h4>
                      <span className="text-2xl sm:text-3xl font-serif font-arabic text-amber-400/90">
                        {activeManzil.mansion.arabicName}
                      </span>
                    </div>

                    <p className="text-xs opacity-85 leading-relaxed font-serif">
                      Gugus Bintang: <strong>{activeManzil.mansion.starGroup}</strong> • Tabi'at: <strong>{activeManzil.mansion.temperament}</strong> • Makna: <em>{activeManzil.mansion.meaningIndonesian}</em>
                    </p>

                    {/* Progress Bar within mansion */}
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono opacity-80">
                        <span>Transit dalam Manzil: {activeManzil.degreeInMansionFormatted} / {activeManzil.totalSpanFormatted}</span>
                        <span className="font-bold text-[#c59a43]">{activeManzil.progressPercent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#c59a43] to-[#e4be65] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(5, activeManzil.progressPercent))}%` }}
                        />
                      </div>
                      <div className="text-[10px] opacity-70 font-mono flex items-center justify-between">
                        <span>Sisa Transit: ~{activeManzil.estimatedHoursRemaining.toFixed(1)} Jam lagi</span>
                        <span>Berikutnya: #{activeManzil.nextMansion.number} {activeManzil.nextMansion.transliteration} ({activeManzil.nextMansion.arabicName})</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex flex-col gap-2 shrink-0 min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => onNavigateTab('manzil')}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-serif font-bold text-xs bg-[#c59a43] hover:bg-[#d4af37] text-black shadow-md transition-all active:scale-95"
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Buka Manzil Detail &amp; Kalender</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigateTab('wafaq')}
                      className={`w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-serif font-semibold text-xs border transition-all ${
                        isNight
                          ? 'bg-[#182338] border-[#293a55] text-amber-300 hover:bg-[#202f48]'
                          : 'bg-white border-[#ded3be] text-stone-800 hover:bg-[#f2e9db]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#c59a43]" />
                      <span>Rancang Wafaq Manzil Ini</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigateTab('manzil3d')}
                      className={`w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-serif font-semibold text-xs border transition-all ${
                        isNight
                          ? 'bg-[#182338] border-[#293a55] text-sky-300 hover:bg-[#202f48]'
                          : 'bg-white border-[#ded3be] text-sky-800 hover:bg-[#f2e9db]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-sky-400" />
                      <span>Bola Langit 3D 28 Manzil</span>
                    </button>
                  </div>
                </div>

                {/* Quick Ikhtiyarat Summary */}
                <div className="mt-4 pt-3 border-t border-current/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                    <span className="font-serif font-bold text-emerald-400 block mb-1">
                      ✓ Al-Mustahabb (Dianjurkan):
                    </span>
                    <p className="text-[11px] opacity-90 line-clamp-2">
                      {activeManzil.mansion.recommendedActions.slice(0, 3).join(', ')}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25">
                    <span className="font-serif font-bold text-rose-400 block mb-1">
                      ✗ Al-Makruh (Dihindari):
                    </span>
                    <p className="text-[11px] opacity-90 line-clamp-2">
                      {activeManzil.mansion.avoidedActions.slice(0, 3).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: RESPON AKSES ANDROID / iOS & RESPON ONLINE / OFFLINE        */}
          {/* ================================================================= */}
          {activeMiniTab === 'device' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Status Responsif Online / Offline */}
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isNight ? 'bg-[#121929]/90 border-[#23334e]' : 'bg-[#faf6ee] border-[#dfd4bd]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-[#c59a43] flex items-center gap-2">
                      {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
                      <span>Respon Jaringan &amp; Offline Engine</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isOnline
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isOnline ? 'Online (Tersambung)' : 'Offline (Mandiri)'}
                    </span>
                  </div>

                  <p className="text-xs opacity-85 leading-relaxed">
                    Aplikasi ini dirancang dengan arsitektur <strong>100% Client-Side Astrological Math Engine</strong>. Seluruh formula trigonometri bola naskah <em>Zij as-Sindhind</em>, perhitungan orbit 7 kawkab, 28 Manzil, konversi kalender Hijri/Sunda/Jawa/Yazdajird, dan tabel aspek dihitung langsung di prosesor perangkat Anda secara lokal tanpa ketergantungan API server eksternal.
                  </p>

                  <div className="p-3 rounded-lg bg-black/15 border border-current/10 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="opacity-75">Status Sambungan:</span>
                      <span className={isOnline ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {isOnline ? 'Terhubung ke Jaringan' : 'Mode Offline Mandiri'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="opacity-75">Kalkulasi Falak Lokal:</span>
                      <span className="text-emerald-400 font-bold">100% Berfungsi Normal</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="opacity-75">Penyimpanan Catatan:</span>
                      <span className="text-emerald-400 font-bold">LocalStorage Tersimpan Lokal</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isPinging}
                      className="px-3 py-1.5 rounded-lg border border-[#c59a43]/50 text-[#c59a43] hover:bg-[#c59a43]/15 text-xs font-serif font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Activity className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                      <span>{isPinging ? 'Menguji Sambungan...' : 'Uji Konektivitas Jaringan'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Respon Akses Android & Apple iOS */}
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isNight ? 'bg-[#121929]/90 border-[#23334e]' : 'bg-[#faf6ee] border-[#dfd4bd]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-[#c59a43] flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-sky-400" />
                      <span>Respon Akses Perangkat ({deviceInfo.osName})</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono">
                      {deviceInfo.isStandalone ? 'PWA Terpasang' : 'Peramban Web'}
                    </span>
                  </div>

                  <p className="text-xs opacity-85 leading-relaxed">
                    Aplikasi mendukung penuh antarmuka sentuh, navigasi gestur, serta kemampuan diinstal langsung ke Layar Utama (Home Screen) perangkat Android dan iOS seperti aplikasi asli (*Native App*).
                  </p>

                  <div className="p-3 rounded-lg bg-black/15 border border-current/10 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="opacity-75">Sistem Operasi:</span>
                      <span className="text-sky-300 font-bold">{deviceInfo.osName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="opacity-75">Peramban:</span>
                      <span>{deviceInfo.browserName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="opacity-75">Layar &amp; Orientasi:</span>
                      <span className="capitalize">{deviceInfo.orientation} • {deviceInfo.touchSupport ? 'Sentuh (Touch)' : 'Mouse/Kursor'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="opacity-75">Sensor Kompas Arah:</span>
                      <span className={isCompassSynced ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {isCompassSynced ? `Tersinkron (${Math.round(compassHeading)}°)` : 'Tersedia di Perangkat Bergerak'}
                      </span>
                    </div>
                  </div>

                  {/* PWA / Home Screen Install Recommendations */}
                  <div className="pt-1">
                    {deviceInfo.os === 'android' && (
                      <div>
                        {isInstallable ? (
                          <button
                            type="button"
                            onClick={handleInstallPwa}
                            className="w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-serif font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
                          >
                            <Download className="w-4 h-4" />
                            <span>Pasang Aplikasi di Layar Utama Android</span>
                          </button>
                        ) : installSuccess ? (
                          <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Aplikasi telah berhasil terpasang di perangkat Android Anda!</span>
                          </div>
                        ) : (
                          <div className="text-[11px] opacity-80 font-serif bg-current/5 p-2 rounded-lg border border-current/10">
                            💡 <strong>Tip Android:</strong> Tekan menu titik tiga (⋮) di pojok kanan atas Google Chrome, lalu pilih <em>"Tambahkan ke Layar Utama"</em> atau <em>"Pasang Aplikasi"</em> untuk akses offline instan.
                          </div>
                        )}
                      </div>
                    )}

                    {deviceInfo.os === 'ios' && (
                      <div className="text-[11px] opacity-90 font-serif bg-sky-500/10 p-2.5 rounded-lg border border-sky-500/25 space-y-1">
                        <div className="font-bold text-sky-400 flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Panduan Pasang di iPhone / iPad (Apple iOS):</span>
                        </div>
                        <p>
                          1. Tekan tombol <strong>Bagikan (Share)</strong> di bilah bawah Safari (ikon kotak bertanda panah ke atas).
                        </p>
                        <p>
                          2. Gulir ke bawah lalu pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.
                        </p>
                        <p>
                          Aplikasi akan muncul sebagai ikon mandiri dengan layar penuh tanpa bilah alamat Safari.
                        </p>
                      </div>
                    )}

                    {deviceInfo.os !== 'android' && deviceInfo.os !== 'ios' && (
                      <div className="text-[11px] opacity-80 font-serif bg-current/5 p-2 rounded-lg border border-current/10">
                        💡 <strong>Akses Desktop / Laptop:</strong> Anda dapat menekan ikon pasang di bilah alamat peramban (Chrome/Edge) untuk menginstal aplikasi ini sebagai jendela aplikasi desktop yang mandiri.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
