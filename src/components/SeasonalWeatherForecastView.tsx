import React, { useState, useMemo } from 'react';
import { ThemeMode, HistoricalDateInfo, PlanetKey } from '../types';
import {
  generateAnnualWeatherReport,
  SeasonKey,
  SeasonalForecast,
} from '../lib/weatherEngine';
import { PLANETS_INFO, calculateSindhindPositions } from '../lib/sindhindEngine';
import { ManzilWeatherCorrelationChart } from './ManzilWeatherCorrelationChart';
import {
  CloudRain,
  Sun,
  Wind,
  Compass,
  Thermometer,
  Calendar,
  Layers,
  Sparkles,
  BookmarkPlus,
  HelpCircle,
  Sprout,
  Droplets,
  Flame,
  Snowflake,
  ShieldAlert,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

interface SeasonalWeatherForecastViewProps {
  currentDateInfo: HistoricalDateInfo;
  currentSunLongitude: number;
  currentMoonLongitude?: number;
  theme: ThemeMode;
  onAnnotateForecast?: (title: string, content: string) => void;
}

export const SeasonalWeatherForecastView: React.FC<SeasonalWeatherForecastViewProps> = ({
  currentDateInfo,
  currentSunLongitude,
  currentMoonLongitude,
  theme,
  onAnnotateForecast,
}) => {
  const isNight = theme === 'night';

  // Calculate effective Moon longitude if not provided from parent
  const effectiveMoonLongitude = useMemo(() => {
    if (typeof currentMoonLongitude === 'number') return currentMoonLongitude;
    return calculateSindhindPositions(currentDateInfo.jdn).positions.moon.trueLongitude;
  }, [currentMoonLongitude, currentDateInfo.jdn]);

  // Year selection state (default to currently inspected year in calendar)
  const [selectedYear, setSelectedYear] = useState<number>(currentDateInfo.julian.year);

  // Generate annual weather report based on Zij as-Sindhind
  const report = useMemo(() => {
    return generateAnnualWeatherReport(selectedYear, currentSunLongitude);
  }, [selectedYear, currentSunLongitude]);

  // Selected season for detailed view (defaults to current active season)
  const [activeSeasonKey, setActiveSeasonKey] = useState<SeasonKey>(report.currentActiveSeason);

  // Theory guide accordion
  const [showTheory, setShowTheory] = useState<boolean>(false);

  const selectedSeason: SeasonalForecast = report.seasons[activeSeasonKey];

  const seasonIcons = {
    spring: Sprout,
    summer: Flame,
    autumn: Wind,
    winter: Snowflake,
  };

  const seasonColors = {
    spring: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    summer: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    autumn: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
    winter: 'text-sky-400 border-sky-500/40 bg-sky-500/10',
  };

  return (
    <div
      id="al-anwa-weather-module"
      className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-5 ${
        isNight
          ? 'bg-[#101420]/95 border-[#28364f] text-[#e6ded0]'
          : 'bg-[#faf6ee] border-[#dfd6c3] text-[#2c241c] shadow-sm'
      }`}
    >
      {/* Module Title Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-current/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
              الأَنْوَاءُ وَأَحْوَالُ الجَوِّ وَالفُصُول
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-[#c59a43]">
              Al-Anwā’ & Ahwāl al-Jaww: Prediksi Cuaca Musiman
            </h2>
          </div>
          <p className="text-xs opacity-80 mt-1 font-serif">
            Hisab kecenderungan iklim empat musim, fluktuasi suhu udara, curah hujan (*Amṭār*), arah angin (*Riyāḥ*), dan tuntunan masa tanam pertanian berdasarkan *Zīj as-Sindhind* dan risalah Al-Kindī (*Risālah fī al-Anwā'*).
          </p>
        </div>

        {/* Year Selector & Guidance Toggle */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto text-xs">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-current/5 border border-current/10 font-mono">
            <span className="opacity-60 text-[11px] pl-1">Tahun:</span>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value) || selectedYear)}
              className={`w-20 p-1 rounded border text-center font-bold outline-none ${
                isNight ? 'bg-[#080d17] border-[#1d2a40]' : 'bg-[#fcf8f0] border-[#d8ccb4]'
              }`}
            />
            <span className="opacity-60 text-[10px] pr-1">M</span>
          </div>

          <button
            onClick={() => setShowTheory(!showTheory)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-semibold transition-colors ${
              showTheory
                ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#c59a43]'
                : isNight
                ? 'bg-[#182236] border-[#293954] hover:bg-[#202d46]'
                : 'bg-[#ede5d3] border-[#ded0b6] hover:bg-[#e4dac6]'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kaidah Mawlayin</span>
            {showTheory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Classical Astrometeorology Theory Collapsible */}
      {showTheory && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
            isNight
              ? 'bg-[#121929] border-[#253552] text-[#d6e0ef]'
              : 'bg-[#f5ede0] border-[#ded0b6] text-[#332b1f]'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <span className="p-1 rounded bg-[#c59a43]/20 text-[#c59a43] shrink-0 mt-0.5">
              <CloudRain className="w-4 h-4" />
            </span>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-serif font-bold text-sm text-[#c59a43]">
                  Kaidah Astrometeorologi Klasik: Dua Penguasa Cuaca (*Al-Mawlayān*):
                </h4>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-current/10">
                  Rujukan: Zīj as-Sindhind, Risālah fī al-Anwā' (Al-Kindī)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px]">
                <div
                  className={`p-2.5 rounded-lg border ${
                    isNight ? 'bg-[#0b101c] border-[#1d2940]' : 'bg-[#ffffff] border-[#e2d8c3]'
                  }`}
                >
                  <span className="font-bold text-[#38bdf8] block mb-1">
                    1. Mawlā al-Faṣl (Penguasa Ingress):
                  </span>
                  Kawkab yang mendominasi saat Matahari menembus derajat 0° buruj kardinal (*Aries, Cancer, Libra, Capricorn*). Menentukan kualitas dasar suhu dan temperamen musim (Panas, Dingin, Lembab, Kering).
                </div>

                <div
                  className={`p-2.5 rounded-lg border ${
                    isNight ? 'bg-[#0b101c] border-[#1d2940]' : 'bg-[#ffffff] border-[#e2d8c3]'
                  }`}
                >
                  <span className="font-bold text-[#eab308] block mb-1">
                    2. Mawlā al-Anwā' wa ar-Riyāḥ:
                  </span>
                  Kawkab penguasa manzil Bulan dan pergerakan angin. Menentukan arah hembusan angin (*ash-Shamāl*, *al-Janūb*, *aṣ-Ṣabā*, *ad-Dabūr*) dan pembawa uap air laut.
                </div>

                <div
                  className={`p-2.5 rounded-lg border ${
                    isNight ? 'bg-[#0b101c] border-[#1d2940]' : 'bg-[#ffffff] border-[#e2d8c3]'
                  }`}
                >
                  <span className="font-bold text-[#10b981] block mb-1">
                    3. Fatḥ al-Bāb (Pintu Hujan Langit):
                  </span>
                  Kondisi meteorologis ketika planet berunsur basah (Venus & Merkurius) berkonfigurasi dengan Bulan di buruj berair (*Cancer, Scorpio, Pisces*), membuka pintu presipitasi lebat.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Seasons Overview Cards Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-serif font-semibold opacity-80 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#c59a43]" />
            Empat Gerbang Musim Matahari (Tahun {report.year} M / ~{report.hijriYear} H):
          </span>
          <span className="text-[11px] font-serif text-[#c59a43]">
            Musim aktif saat ini: <strong>{report.seasons[report.currentActiveSeason].seasonName}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {(['spring', 'summer', 'autumn', 'winter'] as SeasonKey[]).map((sKey) => {
            const season = report.seasons[sKey];
            const isSelected = activeSeasonKey === sKey;
            const isCurrentActive = report.currentActiveSeason === sKey;
            const Icon = seasonIcons[sKey];

            return (
              <button
                key={sKey}
                onClick={() => setActiveSeasonKey(sKey)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#c59a43] bg-[#c59a43]/15 shadow-sm ring-1 ring-[#c59a43]'
                    : isNight
                    ? 'border-[#223147] bg-[#121826] hover:bg-[#182133]'
                    : 'border-[#ded1b9] bg-[#ffffff] hover:bg-[#f6efe2]'
                }`}
              >
                {/* Active marker badge */}
                {isCurrentActive && (
                  <span className="absolute -top-2 right-3 text-[9px] px-2 py-0.5 rounded-full font-bold bg-[#c59a43] text-black">
                    Musim Berjalan
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif font-bold text-xs flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-[#c59a43]" />
                      {season.seasonName}
                    </span>
                    <span className="text-[11px] font-serif font-semibold opacity-75" dir="rtl">
                      {season.seasonArabic}
                    </span>
                  </div>

                  <p className="text-[10px] opacity-70 mb-2 line-clamp-1">
                    {season.cardinalSign} • {season.ingressDate.day}/{season.ingressDate.month}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono py-1 border-t border-current/10">
                    <span className="opacity-80">Suhu:</span>
                    <span className="font-bold">{season.weatherIndices.temperature.value}°</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="opacity-80">Presipitasi:</span>
                    <span className="font-bold text-sky-400">
                      {season.weatherIndices.precipitation.value}%
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-serif opacity-75 pt-1.5 border-t border-current/10 truncate">
                  Mawla: <strong>{season.mawlaAlFasl.transliteration}</strong>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Forecast for Selected Season */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-4 ${
          isNight
            ? 'bg-[#131b2e] border-[#293d61] text-[#e8ded0]'
            : 'bg-[#f8f0e1] border-[#d8cbaf] text-[#2c241c] shadow-sm'
        }`}
      >
        {/* Season Spotlight Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-current/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#c59a43]/20 border border-[#c59a43]/40 flex items-center justify-center text-xl font-bold text-[#c59a43]">
              {React.createElement(seasonIcons[selectedSeason.seasonKey], { className: 'w-6 h-6' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-serif text-[#c59a43]">
                  {selectedSeason.seasonName} ({selectedSeason.seasonArabic})
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-current/10">
                  {selectedSeason.cardinalSign}
                </span>
              </div>
              <p className="text-xs opacity-75 font-serif mt-0.5">
                {selectedSeason.seasonSubtitle} • Ingress Surya:{' '}
                {selectedSeason.ingressDate.day}/{selectedSeason.ingressDate.month}/{selectedSeason.ingressDate.year} M (~{selectedSeason.ingressDate.hijriMonthArabic} {selectedSeason.ingressDate.hijriYear} H)
              </p>
            </div>
          </div>

          {onAnnotateForecast && (
            <button
              onClick={() =>
                onAnnotateForecast(
                  `Ramalan Cuaca Musiman: ${selectedSeason.seasonName} (${selectedSeason.ingressDate.year} M)`,
                  `Mawla al-Fasl: ${selectedSeason.mawlaAlFasl.transliteration}. Suhu: ${selectedSeason.weatherIndices.temperature.label}. Hujan: ${selectedSeason.weatherIndices.precipitation.label}. Nasihat: ${selectedSeason.agriculturalImpact.traditionalAdvice}`
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#c59a43] text-black hover:bg-[#d6aa52] transition-colors self-start md:self-auto"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              Catat Hasil Prediksi
            </button>
          )}
        </div>

        {/* Al-Mawlayan (The Two Cosmic Governors of the Season) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 1. Mawla al-Fasl */}
          <div
            className={`p-3.5 rounded-xl border ${
              isNight ? 'bg-[#0d1322] border-[#22334f]' : 'bg-[#ffffff] border-[#dfd5be]'
            }`}
          >
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-current/10">
              <span className="font-serif font-bold text-xs text-[#38bdf8] flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                المَوْلَى الأَوَّل: مَوْلَى الفَصْلِ (Penguasa Ingress)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-current/10">
                Pilar Suhu & Hawa
              </span>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <span
                className="w-4 h-4 rounded-full inline-block shadow-sm"
                style={{ backgroundColor: PLANETS_INFO[selectedSeason.mawlaAlFasl.planetKey].color }}
              />
              <div>
                <span className="font-serif font-bold text-sm text-[#c59a43]">
                  {selectedSeason.mawlaAlFasl.transliteration} ({selectedSeason.mawlaAlFasl.arabicName})
                </span>
                <span className="text-[11px] opacity-75 block">
                  {selectedSeason.mawlaAlFasl.role}
                </span>
              </div>
            </div>

            <p className="text-xs opacity-85 leading-relaxed font-sans mb-2">
              {selectedSeason.mawlaAlFasl.influenceDescription}
            </p>

            <div className="text-[11px] font-mono opacity-75 pt-2 border-t border-current/10 flex justify-between">
              <span>Temperamen Alami:</span>
              <span className="font-semibold text-[#38bdf8]">{selectedSeason.mawlaAlFasl.temperament}</span>
            </div>
          </div>

          {/* 2. Mawla al-Anwa' wa ar-Riyah */}
          <div
            className={`p-3.5 rounded-xl border ${
              isNight ? 'bg-[#0d1322] border-[#22334f]' : 'bg-[#ffffff] border-[#dfd5be]'
            }`}
          >
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-current/10">
              <span className="font-serif font-bold text-xs text-[#eab308] flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5" />
                المَوْلَى الثَّانِي: مَوْلَى الأَنْوَاءِ وَالرِّيَاحِ (Penguasa Angin & Hujan)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-current/10">
                Pilar Arah Angin
              </span>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <span
                className="w-4 h-4 rounded-full inline-block shadow-sm"
                style={{ backgroundColor: PLANETS_INFO[selectedSeason.mawlaAlAnwa.planetKey].color }}
              />
              <div>
                <span className="font-serif font-bold text-sm text-[#c59a43]">
                  {selectedSeason.mawlaAlAnwa.transliteration} ({selectedSeason.mawlaAlAnwa.arabicName})
                </span>
                <span className="text-[11px] opacity-75 block">
                  Manzil #{selectedSeason.mawlaAlAnwa.mansionNumber}: {selectedSeason.mawlaAlAnwa.mansionTransliteration} ({selectedSeason.mawlaAlAnwa.mansionArabic})
                </span>
              </div>
            </div>

            <p className="text-xs opacity-85 leading-relaxed font-sans mb-2">
              Mengendalikan arus uap air di kubah langit dan menentukan arah tiupan angin musim: <strong>{selectedSeason.mawlaAlAnwa.windDirection}</strong>.
            </p>

            <div className="text-[11px] font-mono opacity-75 pt-2 border-t border-current/10 flex justify-between">
              <span>Arah Tiupan Utama:</span>
              <span className="font-semibold text-[#eab308]">{selectedSeason.mawlaAlAnwa.windDirection}</span>
            </div>
          </div>
        </div>

        {/* Astrometeorological Indices Bar (Suhu, Presipitasi, Pintu Hujan, Angin) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Suhu */}
          <div
            className={`p-3 rounded-xl border ${
              isNight ? 'bg-[#0d1322] border-[#22334f]' : 'bg-[#ffffff] border-[#dfd5be]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-serif font-bold text-[#f97316] flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5" />
                Derajat Suhu (الحَرَارَة)
              </span>
              <span className="font-mono font-bold text-xs">
                {selectedSeason.weatherIndices.temperature.value}°
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-current/10 mb-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  selectedSeason.weatherIndices.temperature.value >= 70
                    ? 'bg-rose-500'
                    : selectedSeason.weatherIndices.temperature.value >= 40
                    ? 'bg-amber-400'
                    : 'bg-sky-400'
                }`}
                style={{ width: `${selectedSeason.weatherIndices.temperature.value}%` }}
              />
            </div>
            <div className="font-serif font-semibold text-xs text-[#c59a43]">
              {selectedSeason.weatherIndices.temperature.label}
            </div>
            <div className="text-[10px] opacity-75 mt-0.5" dir="rtl">
              {selectedSeason.weatherIndices.temperature.arabic}
            </div>
          </div>

          {/* Curah Hujan */}
          <div
            className={`p-3 rounded-xl border ${
              isNight ? 'bg-[#0d1322] border-[#22334f]' : 'bg-[#ffffff] border-[#dfd5be]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-serif font-bold text-sky-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                Presipitasi Hujan (الأَمْطَار)
              </span>
              <span className="font-mono font-bold text-xs text-sky-400">
                {selectedSeason.weatherIndices.precipitation.value}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-current/10 mb-2 overflow-hidden">
              <div
                className="h-full bg-sky-400 rounded-full"
                style={{ width: `${selectedSeason.weatherIndices.precipitation.value}%` }}
              />
            </div>
            <div className="font-serif font-semibold text-xs text-[#c59a43]">
              {selectedSeason.weatherIndices.precipitation.rainType}
            </div>
            <div className="text-[10px] opacity-75 mt-0.5" dir="rtl">
              {selectedSeason.weatherIndices.precipitation.arabic}
            </div>
          </div>

          {/* Status Fath al-Bab */}
          <div
            className={`p-3 rounded-xl border ${
              isNight ? 'bg-[#0d1322] border-[#22334f]' : 'bg-[#ffffff] border-[#dfd5be]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-serif font-bold text-[#c59a43] flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5" />
                Pintu Air Langit (فَتْحُ البَاب)
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedSeason.weatherIndices.gateStatus.isOpen
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {selectedSeason.weatherIndices.gateStatus.isOpen ? 'Maftuh (Terbuka)' : 'Insidad'}
              </span>
            </div>
            <div className="font-serif font-semibold text-xs text-[#c59a43]">
              {selectedSeason.weatherIndices.gateStatus.arabic}
            </div>
            <p className="text-[10px] opacity-75 mt-1 leading-snug">
              {selectedSeason.weatherIndices.gateStatus.condition}
            </p>
          </div>

          {/* Arah Angin */}
          <div
            className={`p-3 rounded-xl border ${
              isNight ? 'bg-[#0d1322] border-[#22334f]' : 'bg-[#ffffff] border-[#dfd5be]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-serif font-bold text-teal-400 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5" />
                Arus Angin (الرِّيَاح)
              </span>
              <span className="font-mono text-[10px] opacity-75">
                {selectedSeason.weatherIndices.wind.speedLabel}
              </span>
            </div>
            <div className="font-serif font-semibold text-xs text-[#c59a43]">
              {selectedSeason.weatherIndices.wind.direction}
            </div>
            <div className="text-[10px] opacity-75 mt-0.5" dir="rtl">
              {selectedSeason.weatherIndices.wind.directionArabic}
            </div>
            <p className="text-[10px] opacity-75 mt-1 leading-snug">
              {selectedSeason.weatherIndices.wind.quality}
            </p>
          </div>
        </div>

        {/* 28 Lunar Mansions Rainfall & Weather Patterns Correlation Chart */}
        <ManzilWeatherCorrelationChart
          currentMoonLongitude={effectiveMoonLongitude}
          currentSunLongitude={currentSunLongitude}
          activeSeasonKey={activeSeasonKey}
          seasonalRainfallBase={selectedSeason.weatherIndices.precipitation.value}
          theme={theme}
          onAnnotate={onAnnotateForecast}
        />

        {/* Agricultural Guidance & Medieval Manuscript Insights */}
        <div
          className={`p-4 rounded-xl border ${
            isNight ? 'bg-[#0a0f1a] border-[#1d293d]' : 'bg-[#ffffff] border-[#e2d8c3]'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-current/10">
            <Sprout className="w-4 h-4 text-[#c59a43]" />
            <h4 className="font-serif font-bold text-sm text-[#c59a43]">
              Tuntunan Agrikultur Klasik & Pengelolaan Lahan (*Aḥkām az-Zirā‘ah*):
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
            <div>
              <span className="font-bold opacity-75 block text-[11px] mb-0.5">
                Kondisi Tanah & Humus:
              </span>
              <p className="opacity-85">{selectedSeason.agriculturalImpact.soilCondition}</p>
            </div>

            <div>
              <span className="font-bold opacity-75 block text-[11px] mb-0.5">
                Prospek Panen & Tanaman:
              </span>
              <p className="opacity-85">{selectedSeason.agriculturalImpact.cropOutlook}</p>
            </div>

            <div>
              <span className="font-bold opacity-75 block text-[11px] mb-0.5">
                Nasihat Filahah Tradisional:
              </span>
              <p className="opacity-85">{selectedSeason.agriculturalImpact.traditionalAdvice}</p>
            </div>
          </div>

          {/* Arabic Poetic Inscription */}
          <div className="mt-3 pt-2 border-t border-current/10 text-center">
            <span className="font-serif italic text-xs text-[#c59a43]" dir="rtl">
              «{selectedSeason.agriculturalImpact.arabicVerse}»
            </span>
          </div>
        </div>

        {/* Annual Astrometeorological Summary Footer */}
        <div className="text-xs pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 opacity-80 font-serif">
          <span>
            Rangkuman Tahunan: <strong>{report.annualSummary.rainfallExpectation}</strong>
          </span>
          <span className="italic" dir="rtl">
            {report.annualSummary.generalAdvisoryArabic}
          </span>
        </div>
      </div>
    </div>
  );
};
