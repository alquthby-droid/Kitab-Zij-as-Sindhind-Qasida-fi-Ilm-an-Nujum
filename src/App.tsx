import React, { useState } from 'react';
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
  PLANETS_INFO,
} from './lib/sindhindEngine';
import { getFullHistoricalDate } from './lib/calendarConverter';
import { getStoredAnnotations } from './lib/annotationsStorage';
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
import { StarMapView } from './components/StarMapView';
import { ManzilCalculatorView } from './components/ManzilCalculatorView';
import { ManzilGlobe3DView } from './components/ManzilGlobe3DView';
import { AstrolabeManzilPowerChart } from './components/AstrolabeManzilPowerChart';
import { ExportPdfModal } from './components/ExportPdfModal';
import { UserGuideModal } from './components/UserGuideModal';
import { InteractiveCompassHeader } from './components/InteractiveCompassHeader';
import {
  Compass,
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
} from 'lucide-react';

export function App() {
  // Navigation tabs
  type ActiveTab =
    | 'astrolabe'
    | 'orbits'
    | 'starmap'
    | 'manzil3d'
    | 'manzil'
    | 'aspects'
    | 'transit'
    | 'progressions'
    | 'synastry'
    | 'mawlayin'
    | 'weather'
    | 'jumal'
    | 'wafaq'
    | 'ephemeris'
    | 'calendar'
    | 'manuscripts'
    | 'search'
    | 'annotations'
    | 'interpretation';

  const [activeTab, setActiveTab] = useState<ActiveTab>('astrolabe');
  const [astrolabeViewMode, setAstrolabeViewMode] = useState<'both' | 'sphere' | 'power_chart'>('both');

  // Night Mode state (persisted)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('sindhind_theme') as ThemeMode) || 'night';
  });

  const toggleTheme = () => {
    const next = theme === 'night' ? 'parchment' : 'night';
    setTheme(next);
    localStorage.setItem('sindhind_theme', next);
  };

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

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-200 ${
        isNight
          ? 'bg-[#0a0d14] text-[#e2d8c3]'
          : 'bg-[#f4efe4] text-[#2c2419]'
      }`}
    >
      {/* Top Header / Astrological Banner */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
          isNight
            ? 'bg-[#0f1422]/90 border-[#1f2a3f]'
            : 'bg-[#faf6ee]/90 border-[#dfd5be]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Title & Arabic Classical Inscription */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c59a43]/20 border border-[#c59a43]/40 flex items-center justify-center text-[#c59a43] shadow-sm">
                <Compass className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-bold text-lg tracking-wide text-[#c59a43]">
                    علم النجوم • Zij as-Sindhind
                  </h1>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-current/10 border border-current/20 hidden sm:inline-block">
                    الزيج السندهند وأرجوزة النجوم
                  </span>
                </div>
                <p className="text-xs opacity-75 font-serif">
                  Hisab Ephemeris Falak Kuno, Kalender Klasik & Interpretasi Manuskrip
                </p>
              </div>
            </div>

            {/* Quick Chronology Bar & Actions */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs">
              {/* Synchronized Date Badge */}
              <div
                onClick={() => setActiveTab('calendar')}
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
                onSelectTab={(tab) => setActiveTab(tab)}
                onApplyHeadingToStarMap={(heading, syncLive) => {
                  setCompassHeading(heading);
                  setIsCompassSynced(syncLive);
                }}
                isLiveSyncedToStarMap={isCompassSynced}
              />

              {/* User Guide Button */}
              <button
                onClick={() => setIsUserGuideOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-sm ${
                  isNight
                    ? 'bg-[#151c2e] hover:bg-[#202c46] border-[#25344f] text-[#c59a43]'
                    : 'bg-[#ede5d5] hover:bg-[#e4dac6] border-[#dacdb2] text-[#825c1d]'
                }`}
                title="Buka Panduan Pengguna & Glosarium Falak"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Panduan Pengguna</span>
              </button>

              {/* PDF Export Button */}
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#c59a43] text-black hover:bg-[#d4a84e] transition-colors shadow-sm"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ekspor PDF</span>
              </button>

              {/* Night Mode Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg border transition-colors ${
                  isNight
                    ? 'bg-[#151c2e] hover:bg-[#202c46] border-[#25344f] text-amber-400'
                    : 'bg-[#ede5d5] hover:bg-[#e4dac6] border-[#dacdb2] text-slate-700'
                }`}
                title={isNight ? 'Beralih ke Mode Kertas (Parchment)' : 'Beralih ke Mode Malam (Night Mode)'}
              >
                {isNight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 mt-3 pt-2 border-t border-current/10 overflow-x-auto no-scrollbar text-xs">
            {[
              { id: 'astrolabe', label: 'فلك الأسطرلاب', sub: 'Astrolab', icon: Compass },
              { id: 'orbits', label: 'مدارات الكواكب', sub: 'Orbit D3 (Helio/Geo)', icon: CircleDot },
              { id: 'starmap', label: 'خريطة السماء', sub: 'Peta Langit & Manzil', icon: Globe2 },
              { id: 'manzil3d', label: 'كرة المنازل 3D', sub: 'Manzil 3D Globe', icon: Globe },
              { id: 'manzil', label: 'حاسبة المنازل', sub: 'Manzil Calculator', icon: Moon },
              { id: 'aspects', label: 'أشكال الاتصالات', sub: 'Tabel Aspek & Matriks', icon: Layers },
              { id: 'transit', label: 'حاسبة العبور', sub: 'Transit Calculator', icon: TrendingUp },
              { id: 'progressions', label: 'التسيير الثانوي', sub: 'Progresi 50 Th', icon: Milestone },
              { id: 'synastry', label: 'مصفوفة التوافق', sub: 'Synastry Matrix', icon: GitCompare },
              { id: 'mawlayin', label: 'أحكام الموليين', sub: 'Pemerintahan & Sosial', icon: Landmark },
              { id: 'weather', label: 'الأنواء والطقس', sub: 'Cuaca Musiman', icon: CloudRain },
              { id: 'jumal', label: 'حساب الجمل والفال', sub: 'Hisab Jumal & Pasaran', icon: Hash },
              { id: 'wafaq', label: 'طِلَسْم وَأَوْفَاق', sub: 'Amulet & Wafaq', icon: Shield },
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
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-serif transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#c59a43] text-black font-bold shadow-sm'
                      : isNight
                      ? 'hover:bg-[#162035] text-[#cbd5e1]'
                      : 'hover:bg-[#ebe1cf] text-[#4a3f31]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.sub}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content View Switcher */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            onNavigateToWafaq={() => setActiveTab('wafaq')}
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
      </main>

      {/* Global Application Footer */}
      <footer className="border-t border-[#dacdb2]/60 dark:border-[#25344f] bg-[#f7f2e7]/90 dark:bg-[#0c101a]/95 backdrop-blur-md py-6 px-4 sm:px-8 mt-auto">
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

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/6281915949627"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30 text-xs font-semibold transition-all active:scale-95"
            >
              WhatsApp 1 (+6281915949627)
            </a>
            <a
              href="https://wa.me/6285239163085"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30 text-xs font-semibold transition-all active:scale-95"
            >
              WhatsApp 2 (+6285239163085)
            </a>
          </div>
        </div>
      </footer>

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        onNavigateToTab={(tabId) => setActiveTab(tabId as ActiveTab)}
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
    </div>
  );
}

export default App;
