import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import {
  HistoricalDateInfo,
  ResearchAnnotation,
  SemanticSearchItem,
  ThemeMode,
} from './types';
import {
  calculateSindhindPositions,
  generateSindhindHoroscopeAnalysis,
  ZODIAC_SIGNS,
} from './lib/sindhindEngine';
import { getFullHistoricalDate } from './lib/calendarConverter';
import { getStoredAnnotations } from './lib/annotationsStorage';
import {
  loadScheduledRituals,
  saveScheduledRituals,
  getRitualReminderTargetMs,
  playRitualChime,
  transliterateToArabic,
  ScheduledRitual,
} from './lib/manzilRitualEngine';
import {
  syncRitualsToServiceWorker,
  triggerServiceWorkerNotification,
} from './lib/pushNotificationManager';
import {
  getSavedArabicFontId,
  applyGlobalArabicFont,
  GlobalArabicFontId,
} from './lib/arabicFonts';
import { AstrolabeSphere } from './components/AstrolabeSphere';
import { EphemerisTable } from './components/EphemerisTable';
import { CalendarConverterView } from './components/CalendarConverterView';
import { ManuscriptsArchiveView } from './components/ManuscriptsArchiveView';
import { ResearchAnnotationsView } from './components/ResearchAnnotationsView';
import { SemanticSearchView } from './components/SemanticSearchView';
import { HoroscopeInterpretation } from './components/HoroscopeInterpretation';
import { DynamicOrbitsD3View } from './components/DynamicOrbitsD3View';
import { AspectsTableView } from './components/AspectsTableView';
import { SynastryMatrixView } from './components/SynastryMatrixView';
import { TransitCalculatorView } from './components/TransitCalculatorView';
import { AhkamMawlayinView } from './components/AhkamMawlayinView';
import { SeasonalWeatherForecastView } from './components/SeasonalWeatherForecastView';
import { SecondaryProgressionsView } from './components/SecondaryProgressionsView';
import { HisabJumalPasaranView } from './components/HisabJumalPasaranView';
import { AmuletWafaqGeneratorView } from './components/AmuletWafaqGeneratorView';
import { IatroastrologyView } from './components/IatroastrologyView';
import { PlanetaryHistoricalAnalysisView } from './components/PlanetaryHistoricalAnalysisView';
import { GoogleSheetsSyncView } from './components/GoogleSheetsSyncView';
import { StarMapView } from './components/StarMapView';
import { ManzilCalculatorView } from './components/ManzilCalculatorView';
import { ManzilRitualSchedulerView } from './components/ManzilRitualSchedulerView';
import { ManzilGlobe3DView } from './components/ManzilGlobe3DView';
import { AstrolabeManzilPowerChart } from './components/AstrolabeManzilPowerChart';
import { DashboardRingkasanView } from './components/DashboardRingkasanView';
import { ExportPdfModal } from './components/ExportPdfModal';
import { UserGuideModal } from './components/UserGuideModal';
import { SharePublishModal, SettingsModalSection } from './components/SharePublishModal';
import { InteractiveCompassHeader } from './components/InteractiveCompassHeader';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Compass,
  Bell,
  BellRing,
  Menu,
  X,
  Settings,
  Rocket,
  Moon,
  Sun,
  BookOpen,
  Calendar,
  Search,
  Bookmark,
  FileDown,
  Sparkles,
  Info,
  CircleDot,
  Layers,
  GitCompare,
  CloudRain,
  HelpCircle,
  Globe2,
  Globe,
  TrendingUp,
  Landmark,
  Activity,
  Hash,
  Shield,
  Milestone,
  Stethoscope,
  LineChart,
  FileSpreadsheet,
} from 'lucide-react';

export function App() {
  // Navigation tabs
  type ActiveTab =
    | 'astrolabe'
    | 'orbits'
    | 'starmap'
    | 'manzil3d'
    | 'manzil'
    | 'ritual'
    | 'aspects'
    | 'transit'
    | 'progressions'
    | 'synastry'
    | 'mawlayin'
    | 'weather'
    | 'jumal'
    | 'wafaq'
    | 'iatroastrology'
    | 'planetary_analysis'
    | 'google_sheets'
    | 'ephemeris'
    | 'calendar'
    | 'manuscripts'
    | 'search'
    | 'annotations'
    | 'interpretation';

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const tabParam = new URLSearchParams(window.location.search).get('tab');
      if (tabParam === 'ritual') return 'ritual';
      if (tabParam === 'planetary_analysis') return 'planetary_analysis';
    }
    return 'astrolabe';
  });
  const [astrolabeViewMode, setAstrolabeViewMode] = useState<'both' | 'sphere' | 'power_chart'>('both');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Night Mode state (persisted)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('sindhind_theme') as ThemeMode) || 'night';
  });

  // Global Arabic font state (persisted)
  const [arabicFontId, setArabicFontId] = useState<GlobalArabicFontId>(() =>
    getSavedArabicFontId()
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [settingsModalSection, setSettingsModalSection] =
    useState<SettingsModalSection>('backup');
  const [dataRefreshVersion, setDataRefreshVersion] = useState<number>(0);

  const openSettingsModal = (section: SettingsModalSection) => {
    setSettingsModalSection(section);
    setIsShareModalOpen(true);
  };

  // Keep Tailwind dark: variant and mobile status bar theme-color synchronized
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'night');
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'night' ? '#0a0d14' : '#f4efe4');
    }
  }, [theme]);

  // Apply chosen global Arabic font CSS variable
  useEffect(() => {
    applyGlobalArabicFont(arabicFontId);
  }, [arabicFontId]);

  // Sync canonical link, og:url, and absolute og:image / twitter:image for s.id & social sharing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    const absoluteIconUrl = `${window.location.origin}/pwa-512x512.png`;

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const upsertMeta = (attr: 'property' | 'name', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', absoluteIconUrl);
    upsertMeta('name', 'twitter:image', absoluteIconUrl);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'night' ? 'parchment' : 'night';
    setTheme(next);
    localStorage.setItem('sindhind_theme', next);
  };

  // App-wide Ritual Reminder Watcher
  const [scheduledRitualCount, setScheduledRitualCount] = useState<number>(() =>
    loadScheduledRituals().filter((r) => r.enabled).length
  );
  const [activeRitualAlert, setActiveRitualAlert] = useState<ScheduledRitual | null>(null);

  const refreshRitualCount = () => {
    setScheduledRitualCount(loadScheduledRituals().filter((r) => r.enabled).length);
  };

  useEffect(() => {
    const checkDueRituals = () => {
      const items = loadScheduledRituals();
      setScheduledRitualCount(items.filter((r) => r.enabled).length);
      void syncRitualsToServiceWorker(items);
      const now = Date.now();
      let updated = false;

      const nextItems = items.map((r) => {
        if (!r.enabled) return r;
        const targetMs = getRitualReminderTargetMs(r);
        if (targetMs === null) return r;
        const risingMs = targetMs + r.reminderMinutesBefore * 60 * 1000;
        const notifKey = `${r.id}_${r.dateISO}_${r.risingTime}`;

        if (now >= targetMs && now <= risingMs + 35 * 60 * 1000 && r.lastNotifiedKey !== notifKey) {
          updated = true;
          playRitualChime();
          setActiveRitualAlert(r);

          const arabMelayu =
            r.manzilArabMelayu || transliterateToArabic(r.manzilTransliteration, r.manzilNumber);

          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            void triggerServiceWorkerNotification({
              id: r.id,
              title: `Terbit Manzil #${r.manzilNumber} (${r.manzilTransliteration})`,
              body: `${r.title} • ${arabMelayu} • Jam terbit ${r.risingTime}–${r.windowEnd} • Planet: ${r.planetaryHour}`,
              manzilNumber: r.manzilNumber,
              manzilTransliteration: r.manzilTransliteration,
              manzilArabMelayu: arabMelayu,
              risingTime: `${r.risingTime}–${r.windowEnd}`,
              planetaryHour: r.planetaryHour,
              ritualTitle: r.title,
              tag: notifKey,
              url: '/?tab=ritual',
            });
          }

          return { ...r, lastNotifiedKey: notifKey };
        }
        return r;
      });

      if (updated) {
        saveScheduledRituals(nextItems);
      }
    };

    checkDueRituals();
    const timer = window.setInterval(checkDueRituals, 15000);

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NAVIGATE_RITUAL') {
        setActiveTab('ritual');
      }
    };
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      window.clearInterval(timer);
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, []);

  // Synchronized Historical Date State
  const [dateState, setDateState] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
    };
  });

  const [historicalDate, setHistoricalDate] = useState<HistoricalDateInfo>(() =>
    getFullHistoricalDate(
      dateState.year,
      dateState.month,
      dateState.day,
      dateState.hour,
      dateState.minute
    )
  );

  // Astrological Data State calculated from Zij as-Sindhind
  const [chartData, setChartData] = useState(() => {
    return calculateSindhindPositions(
      historicalDate.jdn,
      33.3152, // Baghdad Latitude (cradle of Zij as-Sindhind)
      44.3661 // Baghdad Longitude
    );
  });

  // Observer Coordinates State (Default: Baghdad)
  const [observerLocation, setObserverLocation] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  }>({
    latitude: 33.3152,
    longitude: 44.3661,
    name: 'Baghdad (Bayt al-Hikmah)',
  });

  // Real-time device orientation & compass heading for True North observation
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [isCompassSynced, setIsCompassSynced] = useState<boolean>(false);

  // Re-calculate when date changes
  const applyNewDate = (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number
  ) => {
    setDateState({ year, month, day, hour, minute });
    const hDate = getFullHistoricalDate(year, month, day, hour, minute);
    setHistoricalDate(hDate);

    const calculated = calculateSindhindPositions(
      hDate.jdn,
      observerLocation.latitude,
      observerLocation.longitude
    );
    setChartData(calculated);
  };

  const handleLocationChange = (lat: number, lon: number, name: string) => {
    setObserverLocation({ latitude: lat, longitude: lon, name });
    const calculated = calculateSindhindPositions(historicalDate.jdn, lat, lon);
    setChartData(calculated);
  };

  const handleDateHoursOffset = (hoursOffset: number) => {
    const curDate = new Date(
      dateState.year,
      dateState.month - 1,
      dateState.day,
      dateState.hour,
      dateState.minute
    );
    curDate.setHours(curDate.getHours() + hoursOffset);
    applyNewDate(
      curDate.getFullYear(),
      curDate.getMonth() + 1,
      curDate.getDate(),
      curDate.getHours(),
      curDate.getMinutes()
    );
  };

  // Annotations state
  const [annotations, setAnnotations] = useState<ResearchAnnotation[]>(() =>
    getStoredAnnotations()
  );
  const [annotationTarget, setAnnotationTarget] = useState<
    | {
        type: 'manuscript' | 'verse' | 'planet' | 'horoscope' | 'date_epoch';
        id: string;
        title: string;
      }
    | undefined
  >(undefined);

  const refreshAnnotations = () => {
    setAnnotations(getStoredAnnotations());
  };

  const handleOpenAnnotation = (
    type: 'manuscript' | 'verse' | 'planet' | 'horoscope' | 'date_epoch',
    id: string,
    title: string
  ) => {
    setAnnotationTarget({ type, id, title });
    setActiveTab('annotations');
  };

  // PDF Export Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // User Guide Modal State
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);

  // Handle semantic search navigation
  const handleNavigateFromSearch = (item: SemanticSearchItem) => {
    if (item.category.includes('Syair') || item.category.includes('Manuskrip')) {
      setActiveTab('manuscripts');
    } else if (item.category.includes('Kawkab') || item.category.includes('Manzil')) {
      setActiveTab('ephemeris');
    } else {
      setActiveTab('astrolabe');
    }
  };

  const isNight = theme === 'night';
  const ascSign = ZODIAC_SIGNS[chartData.ascendant.signIndex];
  const analysis = generateSindhindHoroscopeAnalysis(chartData);

  const navTabs: Array<{ id: ActiveTab; label: string; sub: string; icon: any; badge?: number }> = [
    { id: 'astrolabe', label: 'فلك الأسطرلاب', sub: 'Astrolab', icon: Compass },
    { id: 'orbits', label: 'مدارات الكواكب', sub: 'Orbit D3 (Helio/Geo)', icon: CircleDot },
    { id: 'starmap', label: 'خريطة السماء', sub: 'Peta Langit & Manzil', icon: Globe2 },
    { id: 'manzil3d', label: 'كرة المنازل 3D', sub: 'Manzil 3D Globe', icon: Globe },
    { id: 'manzil', label: 'حاسبة المنازل', sub: 'Manzil Calculator', icon: Moon },
    { id: 'ritual', label: 'أوقات الأوراد', sub: 'Ritual Manzil', icon: Bell, badge: scheduledRitualCount },
    { id: 'aspects', label: 'أشكال الاتصالات', sub: 'Tabel Aspek & Matriks', icon: Layers },
    { id: 'transit', label: 'حاسبة العبور', sub: 'Transit Calculator', icon: TrendingUp },
    { id: 'progressions', label: 'التسيير الثانوي', sub: 'Progresi 50 Th', icon: Milestone },
    { id: 'synastry', label: 'مصفوفة التوافق', sub: 'Synastry Matrix', icon: GitCompare },
    { id: 'mawlayin', label: 'أحكام الموليين', sub: 'Pemerintahan & Sosial', icon: Landmark },
    { id: 'weather', label: 'الأنواء والطقس', sub: 'Cuaca Musiman', icon: CloudRain },
    { id: 'jumal', label: 'حساب الجمل والفال', sub: 'Hisab Jumal & Pasaran', icon: Hash },
    { id: 'wafaq', label: 'طِلَسْم وَأَوْفَاق', sub: 'Amulet & Wafaq', icon: Shield },
    { id: 'iatroastrology', label: 'الطب النجومي', sub: 'Iatroastrology', icon: Stethoscope },
    { id: 'planetary_analysis', label: 'تحليل الكواكب', sub: 'Data Analisis Planet', icon: LineChart },
    { id: 'google_sheets', label: 'جداول جوجل', sub: 'Google Sheets', icon: FileSpreadsheet },
    { id: 'ephemeris', label: 'جدول الكواكب', sub: 'Ephemeris', icon: Sparkles },
    { id: 'calendar', label: 'تحويل التواريخ', sub: 'Tarikh & Kalender', icon: Calendar },
    { id: 'interpretation', label: 'أحكام النجوم', sub: 'Tafsir Astrologi', icon: Info },
    { id: 'manuscripts', label: 'خزانة المخطوطات', sub: 'Arsip & API Naskah', icon: BookOpen },
    { id: 'search', label: 'الفهرس الدلالي', sub: 'Indeks Semantik', icon: Search },
    {
      id: 'annotations',
      label: 'التعليقات',
      sub: `Anotasi (${annotations.length})`,
      icon: Bookmark,
    },
  ];

  const selectTabAndScrollTop = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`min-h-dvh font-sans transition-colors duration-200 flex flex-col overflow-x-clip ${
        isNight
          ? 'bg-[#0a0d14] text-[#e2d8c3]'
          : 'bg-[#f4efe4] text-[#2c2419]'
      }`}
    >
      {/* Top Header / Astrological Banner */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors pt-safe px-safe ${
          isNight
            ? 'bg-[#0f1422]/90 border-[#1f2a3f]'
            : 'bg-[#faf6ee]/90 border-[#dfd5be]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Title & Arabic Classical Inscription */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-[#c59a43]/20 border border-[#c59a43]/40 flex items-center justify-center text-[#c59a43] shadow-sm">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-bold text-sm sm:text-lg text-[#c59a43] truncate">
                    <span className="font-arabic text-base sm:text-xl font-bold">علم النجوم</span> • Zij as-Sindhind
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-arabic bg-current/10 border border-current/20 hidden lg:inline-block shrink-0">
                    الزيج السندهند وأرجوزة النجوم
                  </span>
                </div>
                <p className="text-xs opacity-75 font-serif hidden sm:block truncate">
                  Hisab Ephemeris Falak Kuno, Kalender Klasik & Interpretasi Manuskrip
                </p>
                <p className="text-[10px] opacity-75 font-mono sm:hidden truncate">
                  {historicalDate.hijri.day} {historicalDate.hijri.monthNameLatin} {historicalDate.hijri.year} H · {historicalDate.gregorian.day}/{historicalDate.gregorian.month} M
                </p>
              </div>
            </div>

            {/* Quick Chronology Bar & Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3 text-xs shrink-0">
              {/* Synchronized Date Badge */}
              <div
                onClick={() => selectTabAndScrollTop('calendar')}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                  isNight
                    ? 'bg-[#151c2e] hover:bg-[#1f2b44] border-[#25344f]'
                    : 'bg-[#ede5d5] hover:bg-[#e4dac6] border-[#dacdb2]'
                }`}
                title="Klik untuk membuka modul konversi kalender"
              >
                <Calendar className="w-3.5 h-3.5 text-[#c59a43]" />
                <span className="font-serif">
                  {historicalDate.hijri.day} {historicalDate.hijri.monthNameLatin}{' '}
                  {historicalDate.hijri.year} H
                </span>
                <span className="opacity-50">•</span>
                <span className="font-mono">
                  {historicalDate.gregorian.day}/{historicalDate.gregorian.month}/{historicalDate.gregorian.year} M
                </span>
              </div>

              {/* Interactive Device Compass Component (Header) */}
              <InteractiveCompassHeader
                theme={theme}
                observerLatitude={observerLocation.latitude}
                observerLongitude={observerLocation.longitude}
                observerName={observerLocation.name}
                onSelectTab={(tab) => selectTabAndScrollTop(tab)}
                onApplyHeadingToStarMap={(heading, syncLive) => {
                  setCompassHeading(heading);
                  setIsCompassSynced(syncLive);
                }}
                isLiveSyncedToStarMap={isCompassSynced}
              />

              {/* User Guide Button (Desktop/Tablet header; mobile uses Drawer Quick Actions) */}
              <button
                onClick={() => setIsUserGuideOpen(true)}
                className={`hidden sm:inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-sm ${
                  isNight
                    ? 'bg-[#151c2e] hover:bg-[#202c46] border-[#25344f] text-[#c59a43]'
                    : 'bg-[#ede5d5] hover:bg-[#e4dac6] border-[#dacdb2] text-[#825c1d]'
                }`}
                title="Buka Panduan Pengguna & Glosarium Falak"
                aria-label="Panduan Pengguna"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Panduan Pengguna</span>
              </button>

              {/* Install PWA Button (Android / iOS / Desktop) */}
              <PWAInstallButton theme={theme} compact />

              {/* 1-Click Publish Otomatis s.id Button */}
              <button
                onClick={() => openSettingsModal('publish')}
                className={`hidden sm:inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-sm cursor-pointer ${
                  isNight
                    ? 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-500/45 text-emerald-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-600/40 text-emerald-800'
                }`}
                title="Publish Otomatis Shortlink s.id & Bagikan Aplikasi"
                aria-label="Publish Otomatis s.id"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Publish s.id</span>
              </button>

              {/* Settings, Local JSON Backup, Arabic Font & s.id Publish Button */}
              <button
                onClick={() => openSettingsModal('backup')}
                className={`hidden sm:inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-sm cursor-pointer ${
                  isNight
                    ? 'bg-[#151c2e] hover:bg-[#202c46] border-amber-500/35 text-amber-300'
                    : 'bg-[#ede5d5] hover:bg-[#e4dac6] border-amber-600/35 text-amber-900'
                }`}
                title="Pengaturan Aplikasi, Backup Data Lokal (JSON) & Font Arab"
                aria-label="Pengaturan dan Backup Data Lokal"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Pengaturan</span>
              </button>

              {/* PDF Export Button (Desktop/Tablet header; mobile uses Drawer) */}
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#c59a43] text-black hover:bg-[#d4a84e] transition-colors shadow-sm"
                title="Ekspor PDF"
                aria-label="Ekspor PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Ekspor PDF</span>
              </button>

              {/* Night Mode Toggle */}
              <button
                onClick={toggleTheme}
                className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2 rounded-lg border transition-colors ${
                  isNight
                    ? 'bg-[#151c2e] hover:bg-[#202c46] border-[#25344f] text-amber-400'
                    : 'bg-[#ede5d5] hover:bg-[#e4dac6] border-[#dacdb2] text-slate-700'
                }`}
                title={isNight ? 'Beralih ke Mode Kertas (Parchment)' : 'Beralih ke Mode Malam (Night Mode)'}
                aria-label="Ubah Tema"
              >
                {isNight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Desktop/Tablet Navigation Bar Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 mt-3 pt-2 border-t border-current/10 overflow-x-auto no-scrollbar text-xs">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => selectTabAndScrollTop(tab.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-serif transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#c59a43] text-black font-bold shadow-sm'
                      : isNight
                      ? 'hover:bg-[#162035] text-[#cbd5e1]'
                      : 'hover:bg-[#ebe1cf] text-[#4a3f31]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.sub}</span>
                  {typeof tab.badge === 'number' && tab.badge > 0 && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                        isActive ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Active Ritual Reminder Banner */}
      {activeRitualAlert && (
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4">
          <div
            role="alert"
            className={`rounded-2xl border p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg ${
              isNight
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-100'
                : 'bg-emerald-50 border-emerald-400 text-emerald-950'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 animate-bounce">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <div className="font-serif font-bold text-sm flex flex-wrap items-center gap-2">
                  <span>
                    Pengingat Waktu Terbit Manzil #{activeRitualAlert.manzilNumber} ({activeRitualAlert.manzilTransliteration})
                  </span>
                  <span className="font-arabic text-base font-normal text-amber-500 dark:text-amber-300" dir="rtl">
                    {activeRitualAlert.manzilArabMelayu ||
                      transliterateToArabic(
                        activeRitualAlert.manzilTransliteration,
                        activeRitualAlert.manzilNumber
                      )}
                  </span>
                </div>
                <p className="text-xs opacity-90 mt-0.5">
                  Amalan: <span className="font-semibold">{activeRitualAlert.title}</span> • Jendela terbit{' '}
                  <span className="font-mono font-bold tabular-nums">
                    {activeRitualAlert.risingTime}–{activeRitualAlert.windowEnd}
                  </span>{' '}
                  • Planet: {activeRitualAlert.planetaryHour}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  selectTabAndScrollTop('ritual');
                  setActiveRitualAlert(null);
                }}
                className="min-h-[44px] sm:min-h-0 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                Buka Penjadwal
              </button>
              <button
                type="button"
                onClick={() => setActiveRitualAlert(null)}
                className="min-h-[44px] sm:min-h-0 px-3 py-2 rounded-xl border border-current/25 text-xs font-semibold hover:bg-current/10 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content View Switcher */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 flex-1">
        <DashboardRingkasanView
          chartData={chartData}
          currentDateInfo={historicalDate}
          theme={theme}
          activeTab={activeTab}
          onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
          onSelectDateStep={handleDateHoursOffset}
          onResetToNow={() => {
            const now = new Date();
            applyNewDate(
              now.getFullYear(),
              now.getMonth() + 1,
              now.getDate(),
              now.getHours(),
              now.getMinutes()
            );
          }}
          compassHeading={compassHeading}
          isCompassSynced={isCompassSynced}
          onToggleCompassSync={(synced) => setIsCompassSynced(synced)}
        />

        <MotionConfig reducedMotion="user">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="will-change-[opacity,transform]"
            >
        {activeTab === 'astrolabe' && (
          <div className="space-y-6">
            {/* View Mode Selector in Astrolabe Area */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border bg-current/5 border-current/10">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#c59a43]" />
                <span className="font-serif font-bold text-sm">Mode Tampilan Area Astrolabe:</span>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl border text-xs bg-current/5 border-current/10">
                <button
                  type="button"
                  onClick={() => setAstrolabeViewMode('both')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    astrolabeViewMode === 'both'
                      ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Semua (Astrolab & Tren D3)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAstrolabeViewMode('sphere')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    astrolabeViewMode === 'sphere'
                      ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Bola Astrolab Saja</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAstrolabeViewMode('power_chart')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    astrolabeViewMode === 'power_chart'
                      ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Tren Manzil Power (1 Tahun)</span>
                </button>
              </div>
            </div>

            {/* Astrolabe Sphere Visualization */}
            {(astrolabeViewMode === 'both' || astrolabeViewMode === 'sphere') && (
              <>
                <AstrolabeSphere
                  positions={chartData.positions}
                  ascendant={chartData.ascendant}
                  midheaven={chartData.midheaven}
                  houses={chartData.houses}
                  aspects={chartData.aspects}
                  theme={theme}
                  onSelectPlanet={(pk) => {
                    // highlight planet
                  }}
                />

                {/* Quick summary below astrolabe */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`p-4 rounded-xl border ${
                      isNight ? 'bg-[#101522] border-[#212b3e]' : 'bg-[#faf6ee] border-[#dfd5be]'
                    }`}
                  >
                    <span className="font-serif font-bold text-xs text-[#c59a43] block mb-1">
                      طالع الوقت (Ascendant):
                    </span>
                    <p className="text-sm font-semibold">
                      {chartData.ascendant.signDegree}° {chartData.ascendant.signDegreeMinutes}' {ascSign.latinName} ({ascSign.arabicName})
                    </p>
                    <p className="text-[11px] opacity-75 mt-1">
                      Penguasa rasi terbit: {ascSign.ruler.toUpperCase()}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-xl border ${
                      isNight ? 'bg-[#101522] border-[#212b3e]' : 'bg-[#faf6ee] border-[#dfd5be]'
                    }`}
                  >
                    <span className="font-serif font-bold text-xs text-[#38bdf8] block mb-1">
                      منزلة القمر السائدة:
                    </span>
                    <p className="text-sm font-semibold">
                      {chartData.positions.moon.lunarMansion.transliteration} (#{chartData.positions.moon.lunarMansion.number})
                    </p>
                    <p className="text-[11px] opacity-75 mt-1">
                      Sifat: {chartData.positions.moon.lunarMansion.fortune}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-xl border ${
                      isNight ? 'bg-[#101522] border-[#212b3e]' : 'bg-[#faf6ee] border-[#dfd5be]'
                    }`}
                  >
                    <span className="font-serif font-bold text-xs text-[#a855f7] block mb-1">
                      صاحب اليوم والساعة:
                    </span>
                    <p className="text-sm font-semibold">
                      Hari: {historicalDate.dayRuler.toUpperCase()} • Jam: {historicalDate.hourRuler.toUpperCase()}
                    </p>
                    <p className="text-[11px] opacity-75 mt-1 font-mono">
                      Ahargana Sindhind: {historicalDate.sindhindEra.aharganaDays} hari
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* D3 1-Year Manzil Power Trend Module */}
            {(astrolabeViewMode === 'both' || astrolabeViewMode === 'power_chart') && (
              <AstrolabeManzilPowerChart
                currentDateInfo={historicalDate}
                theme={theme}
                onSelectDateStep={handleDateHoursOffset}
                onAnnotateTrend={(title, content) =>
                  handleOpenAnnotation('horoscope', 'manzil_power', `${title}\n\n${content}`)
                }
              />
            )}
          </div>
        )}

        {activeTab === 'orbits' && (
          <DynamicOrbitsD3View
            currentDateInfo={historicalDate}
            positions={chartData.positions}
            theme={theme}
            onApplyDate={applyNewDate}
            onOpenAnnotation={(title) =>
              handleOpenAnnotation('planet', 'orbit', title)
            }
          />
        )}

        {activeTab === 'starmap' && (
          <StarMapView
            currentDateInfo={historicalDate}
            positions={chartData.positions}
            theme={theme}
            onAnnotateStar={(title, content) =>
              handleOpenAnnotation('horoscope', 'starmap', `${title} - ${content}`)
            }
            onLocationChange={handleLocationChange}
            compassHeading={compassHeading}
            isCompassSynced={isCompassSynced}
            onToggleCompassSync={(synced) => setIsCompassSynced(synced)}
            onHeadingChange={(heading) => setCompassHeading(heading)}
          />
        )}

        {activeTab === 'manzil3d' && (
          <ManzilGlobe3DView
            currentDateInfo={historicalDate}
            moonPosition={chartData.positions.moon}
            allPositions={chartData.positions}
            theme={theme}
            onAnnotateManzil={(manzilNum, title, content) =>
              handleOpenAnnotation('horoscope', 'manzil3d', `${title}\n\n${content}`)
            }
            onSelectDateStep={handleDateHoursOffset}
          />
        )}

        {activeTab === 'manzil' && (
          <ManzilCalculatorView
            currentDateInfo={historicalDate}
            moonPosition={chartData.positions.moon}
            allPositions={chartData.positions}
            aspects={chartData.aspects}
            theme={theme}
            onAnnotateManzil={(title, content) =>
              handleOpenAnnotation('horoscope', 'manzil', `${title}\n\n${content}`)
            }
            onSelectDateStep={handleDateHoursOffset}
            onNavigateToWafaq={() => selectTabAndScrollTop('wafaq')}
          />
        )}

        {activeTab === 'ritual' && (
          <ManzilRitualSchedulerView
            key={`ritual-${dataRefreshVersion}`}
            currentDateInfo={historicalDate}
            observerLocation={observerLocation}
            theme={theme}
            onAnnotate={(title, content) =>
              handleOpenAnnotation('horoscope', 'ritual', `${title}\n\n${content}`)
            }
            onSchedulesChanged={refreshRitualCount}
          />
        )}

        {activeTab === 'aspects' && (
          <AspectsTableView
            positions={chartData.positions}
            theme={theme}
            onAnnotateAspect={(title) =>
              handleOpenAnnotation('horoscope', 'aspect', title)
            }
          />
        )}

        {activeTab === 'transit' && (
          <TransitCalculatorView
            currentDateInfo={historicalDate}
            theme={theme}
            onAnnotateTransit={(title, content) =>
              handleOpenAnnotation('horoscope', 'transit', `${title} - ${content}`)
            }
          />
        )}

        {activeTab === 'progressions' && (
          <SecondaryProgressionsView
            currentDateInfo={historicalDate}
            theme={theme}
            onAnnotate={(title, content) =>
              handleOpenAnnotation('horoscope', 'progressions', `${title}\n\n${content}`)
            }
          />
        )}

        {activeTab === 'synastry' && (
          <SynastryMatrixView
            currentDateInfo={historicalDate}
            theme={theme}
            onAnnotateSynastry={(title, summary) =>
              handleOpenAnnotation('horoscope', 'synastry', `${title} - ${summary}`)
            }
          />
        )}

        {activeTab === 'mawlayin' && (
          <AhkamMawlayinView
            currentDateInfo={historicalDate}
            theme={theme}
            onAnnotateMundane={(title, content) =>
              handleOpenAnnotation('horoscope', 'mawlayin', `${title} - ${content}`)
            }
          />
        )}

        {activeTab === 'weather' && (
          <SeasonalWeatherForecastView
            currentDateInfo={historicalDate}
            currentSunLongitude={chartData.positions.sun.trueLongitude}
            currentMoonLongitude={chartData.positions.moon.trueLongitude}
            theme={theme}
            onAnnotateForecast={(title, content) =>
              handleOpenAnnotation('horoscope', 'weather', `${title} - ${content}`)
            }
          />
        )}

        {activeTab === 'jumal' && (
          <HisabJumalPasaranView
            currentDateInfo={historicalDate}
            theme={theme}
            onAnnotate={(title, content) =>
              handleOpenAnnotation('horoscope', 'jumal', `${title} - ${content}`)
            }
          />
        )}

        {activeTab === 'wafaq' && (
          <AmuletWafaqGeneratorView
            currentMoonPosition={chartData.positions.moon}
            allPositions={chartData.positions}
            aspects={chartData.aspects}
            currentDateInfo={historicalDate}
            theme={theme}
            onAnnotate={(title, content) =>
              handleOpenAnnotation('horoscope', 'wafaq', `${title} - ${content}`)
            }
          />
        )}

        {activeTab === 'iatroastrology' && (
          <IatroastrologyView
            key={`iatro-${dataRefreshVersion}`}
            positions={chartData.positions}
            aspects={chartData.aspects}
            currentDateInfo={historicalDate}
            theme={theme}
            onAnnotate={(title, content) =>
              handleOpenAnnotation('horoscope', 'iatroastrology', `${title}\n\n${content}`)
            }
          />
        )}

        {activeTab === 'planetary_analysis' && (
          <PlanetaryHistoricalAnalysisView
            currentDateInfo={historicalDate}
            observerLocation={observerLocation}
            theme={theme}
            onApplyDate={applyNewDate}
            onAnnotate={(title, content) =>
              handleOpenAnnotation('planet', 'planetary_analysis', `${title}\n\n${content}`)
            }
          />
        )}

        {activeTab === 'google_sheets' && (
          <GoogleSheetsSyncView
            currentDateInfo={historicalDate}
            positions={chartData.positions}
            observerLocation={observerLocation}
            annotations={annotations}
            theme={theme}
            onAnnotate={(title, content) =>
              handleOpenAnnotation('horoscope', 'google_sheets', `${title}\n\n${content}`)
            }
          />
        )}

        {activeTab === 'ephemeris' && (
          <EphemerisTable
            positions={chartData.positions}
            theme={theme}
            onAnnotatePlanet={(key, name) =>
              handleOpenAnnotation('planet', key, `Kawkab ${name}`)
            }
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarConverterView
            currentDateInfo={historicalDate}
            theme={theme}
            onApplyDate={applyNewDate}
            onAnnotateEpoch={(epochName) =>
              handleOpenAnnotation('date_epoch', 'epoch', epochName)
            }
          />
        )}

        {activeTab === 'interpretation' && (
          <HoroscopeInterpretation
            positions={chartData.positions}
            ascendant={chartData.ascendant}
            midheaven={chartData.midheaven}
            houses={chartData.houses}
            aspects={chartData.aspects}
            theme={theme}
            onExportPdf={() => setIsPdfModalOpen(true)}
            onAnnotateInterpretation={() =>
              handleOpenAnnotation('horoscope', 'chart', `Tafsir Hukm Nujum ${historicalDate.hijri.year} H`)
            }
          />
        )}

        {activeTab === 'manuscripts' && (
          <ManuscriptsArchiveView
            theme={theme}
            onAnnotateItem={(targetType, targetId, title) =>
              handleOpenAnnotation(
                targetType as any,
                targetId,
                title
              )
            }
          />
        )}

        {activeTab === 'search' && (
          <SemanticSearchView
            theme={theme}
            onNavigateToResult={handleNavigateFromSearch}
          />
        )}

        {activeTab === 'annotations' && (
          <ResearchAnnotationsView
            annotations={annotations}
            theme={theme}
            onRefreshAnnotations={refreshAnnotations}
            initialTarget={annotationTarget}
          />
        )}
            </motion.div>
          </AnimatePresence>
        </MotionConfig>
      </main>

      {/* Global Application Footer */}
      <footer className="border-t border-[#dacdb2]/60 dark:border-[#25344f] bg-[#f7f2e7]/90 dark:bg-[#0c101a]/95 backdrop-blur-md pt-6 pb-24 md:pb-6 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                Pengembang Aplikasi: Al-Faqir Husni Bin Sabri Sapri
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                Khadim Turats Falak
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Beremi Jagaraga Kuripan Lombok Barat, Nusa Tenggara Barat • Telp/WA: +6281915949627 &amp; +6285239163085
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href="https://wa.me/6281915949627"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] sm:min-h-0 inline-flex items-center px-3 py-2 sm:py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30 text-xs font-semibold transition-all active:scale-95"
            >
              WhatsApp 1 (+6281915949627)
            </a>
            <a
              href="https://wa.me/6285239163085"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] sm:min-h-0 inline-flex items-center px-3 py-2 sm:py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30 text-xs font-semibold transition-all active:scale-95"
            >
              WhatsApp 2 (+6285239163085)
            </a>
          </div>
        </div>
      </footer>

      {/* Android & iOS Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Navigasi Cepat Seluler"
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-lg pb-safe ${
          isNight
            ? 'bg-[#0f1422]/95 border-[#24324d] text-[#cbd5e1]'
            : 'bg-[#faf6ee]/95 border-[#dacdb2] text-[#4a3f31]'
        }`}
      >
        <div className="grid grid-cols-5 items-stretch max-w-lg mx-auto">
          {[
            { id: 'astrolabe' as ActiveTab, label: 'Astrolab', icon: Compass },
            { id: 'manzil' as ActiveTab, label: 'Manzil', icon: Moon },
            { id: 'ritual' as ActiveTab, label: 'Ritual', icon: Bell, badge: scheduledRitualCount },
            { id: 'wafaq' as ActiveTab, label: 'Wafaq', icon: Shield },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !isMobileMenuOpen;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTabAndScrollTop(item.id)}
                className={`relative flex flex-col items-center justify-center gap-0.5 min-h-[54px] px-1 py-1.5 text-[11px] font-medium transition-colors active:scale-95 ${
                  isActive
                    ? 'text-[#c59a43] font-bold'
                    : 'opacity-75 hover:opacity-100'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-white text-[9px] font-mono font-bold flex items-center justify-center tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="truncate max-w-full">{item.label}</span>
                {isActive && (
                  <span className="absolute top-0 inset-x-3 h-0.5 rounded-full bg-[#c59a43]" />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={`relative flex flex-col items-center justify-center gap-0.5 min-h-[54px] px-1 py-1.5 text-[11px] font-medium transition-colors active:scale-95 ${
              isMobileMenuOpen ? 'text-[#c59a43] font-bold' : 'opacity-75 hover:opacity-100'
            }`}
            aria-expanded={isMobileMenuOpen}
            aria-label="Buka semua modul falak"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span>Semua</span>
          </button>
        </div>
      </nav>

      {/* Mobile "Semua Modul" Bottom Sheet Drawer */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-h-[82vh] rounded-t-3xl border-t shadow-2xl flex flex-col pb-safe ${
              isNight
                ? 'bg-[#101626] border-[#273654] text-[#e2d8c3]'
                : 'bg-[#faf6ee] border-[#dacdb2] text-[#2c2419]'
            }`}
          >
            <div className="w-10 h-1.5 bg-current/20 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />
            <div className="flex items-center justify-between px-4 py-3 border-b border-current/10">
              <div>
                <h2 className="font-serif font-bold text-sm text-[#c59a43]">
                  Menu &amp; Modul Zij as-Sindhind
                </h2>
                <p className="text-[11px] opacity-75 font-mono">
                  {historicalDate.hijri.day} {historicalDate.hijri.monthNameLatin} {historicalDate.hijri.year} H · {observerLocation.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center border border-current/15 hover:bg-current/10"
                aria-label="Tutup daftar modul"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Quick Utility Actions (Panduan, Publish s.id, Pengaturan, Ekspor PDF) */}
            <div className="px-3 pt-3 pb-1 grid grid-cols-4 gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsUserGuideOpen(true);
                }}
                className={`min-h-[48px] px-1.5 py-2 rounded-xl border text-[10px] font-semibold flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform ${
                  isNight
                    ? 'bg-[#151e32] border-[#25344f] text-[#c59a43]'
                    : 'bg-[#f1e9d9] border-[#dacdb2] text-[#825c1d]'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Panduan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openSettingsModal('publish');
                }}
                className={`min-h-[48px] px-1.5 py-2 rounded-xl border text-[10px] font-semibold flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform ${
                  isNight
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-600/40 text-emerald-800'
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span>Publish s.id</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openSettingsModal('backup');
                }}
                className={`min-h-[48px] px-1.5 py-2 rounded-xl border text-[10px] font-semibold flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform ${
                  isNight
                    ? 'bg-[#151e32] border-amber-500/35 text-amber-300'
                    : 'bg-[#f1e9d9] border-amber-600/35 text-amber-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Pengaturan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsPdfModalOpen(true);
                }}
                className="min-h-[48px] px-1.5 py-2 rounded-xl bg-[#c59a43] text-black text-[10px] font-bold flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
              >
                <FileDown className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>

            <div className="overflow-y-auto p-3 grid grid-cols-2 gap-2">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => selectTabAndScrollTop(tab.id)}
                    className={`min-h-[52px] p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 active:scale-[0.98] ${
                      isActive
                        ? 'bg-[#c59a43] text-black border-[#c59a43] font-bold shadow-sm'
                        : isNight
                        ? 'bg-[#151e32] border-[#25344f] text-[#e2d8c3]'
                        : 'bg-[#f1e9d9] border-[#dacdb2] text-[#2c2419]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-serif leading-tight truncate">{tab.sub}</div>
                      <div className="text-[10px] opacity-70 font-arabic truncate">{tab.label}</div>
                    </div>
                    {typeof tab.badge === 'number' && tab.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
                          isActive ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Settings, Local Data Backup (JSON), Arabic Font & s.id Publish Modal */}
      <SharePublishModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        theme={theme}
        arabicFontId={arabicFontId}
        initialSection={settingsModalSection}
        onChangeArabicFont={(fontId) => setArabicFontId(fontId)}
        onChangeTheme={(nextTheme) => {
          setTheme(nextTheme);
          localStorage.setItem('sindhind_theme', nextTheme);
        }}
        onBackupRestored={(result) => {
          refreshAnnotations();
          refreshRitualCount();
          if (result.restoredTheme) {
            setTheme(result.restoredTheme);
          }
          if (result.restoredArabicFontId) {
            setArabicFontId(result.restoredArabicFontId);
          }
          setDataRefreshVersion((v) => v + 1);
        }}
      />

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        onNavigateToTab={(tabId) => selectTabAndScrollTop(tabId as ActiveTab)}
        theme={theme}
      />

      {/* PDF Export Modal */}
      <ExportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        historicalDate={historicalDate}
        positions={chartData.positions}
        ascendantSign={`${ascSign.latinName} (${ascSign.arabicName})`}
        ascendantDegree={`${chartData.ascendant.signDegree}° ${chartData.ascendant.signDegreeMinutes}'`}
        analysisText={`${analysis.overviewId} ${analysis.temperamentAnalysis}`}
        aspects={chartData.aspects}
        annotations={annotations}
        theme={theme}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}

export default App;
