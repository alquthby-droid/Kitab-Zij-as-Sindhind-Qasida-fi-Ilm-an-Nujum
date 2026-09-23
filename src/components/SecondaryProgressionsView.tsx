import React, { useState, useMemo, useEffect } from 'react';
import { ThemeMode, HistoricalDateInfo } from '../types';
import {
  PROGRESSION_PRESETS,
  calculateSecondaryProgressionReport,
  generate50YearTimeline,
  ProgressionPresetProfile,
  TimelineYearSummary,
} from '../lib/secondaryProgressionsEngine';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Compass,
  Calendar,
  Clock,
  Layers,
  Award,
  BookOpen,
  Bookmark,
  Activity,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Milestone,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface SecondaryProgressionsViewProps {
  currentDateInfo: HistoricalDateInfo;
  theme: ThemeMode;
  onAnnotate?: (title: string, content: string) => void;
}

export function SecondaryProgressionsView({
  currentDateInfo,
  theme,
  onAnnotate,
}: SecondaryProgressionsViewProps) {
  const isNight = theme === 'night';

  // Selected Preset or Custom
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ibn_sina');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Custom Input State
  const [customName, setCustomName] = useState('Pribadi / Peneliti');
  const [customYear, setCustomYear] = useState(1990);
  const [customMonth, setCustomMonth] = useState(6);
  const [customDay, setCustomDay] = useState(15);
  const [customHour, setCustomHour] = useState(12);
  const [customMinute, setCustomMinute] = useState(0);
  const [customLat, setCustomLat] = useState(-6.2088); // Jakarta default
  const [customLon, setCustomLon] = useState(106.8456);

  // Age slider state (0 to 50)
  const [selectedAge, setSelectedAge] = useState<number>(20);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step

  // Sub-tab view: 'annual' | 'timeline' | 'planets_table'
  const [activeSubTab, setActiveSubTab] = useState<'annual' | 'timeline' | 'planets_table'>('annual');

  // Active preset profile
  const activePreset = useMemo(() => {
    return PROGRESSION_PRESETS.find((p) => p.id === selectedPresetId) || PROGRESSION_PRESETS[0];
  }, [selectedPresetId]);

  // Active birth parameters
  const birthParams = useMemo(() => {
    if (isCustomMode) {
      return {
        name: customName,
        arabicName: 'المَوْلُودُ الشَّخْصِيّ',
        year: customYear,
        month: customMonth,
        day: customDay,
        hour: customHour,
        minute: customMinute,
        latitude: customLat,
        longitude: customLon,
        locationName: 'Koordinat Pengguna',
        note: 'Hisab progresi berdasarkan data kelahiran pribadi pengguna.',
      };
    }
    return {
      name: activePreset.name,
      arabicName: activePreset.arabicName,
      year: activePreset.year,
      month: activePreset.month,
      day: activePreset.day,
      hour: activePreset.hour,
      minute: activePreset.minute,
      latitude: activePreset.latitude,
      longitude: activePreset.longitude,
      locationName: activePreset.locationName,
      note: activePreset.biographicalNote,
    };
  }, [isCustomMode, customName, customYear, customMonth, customDay, customHour, customMinute, customLat, customLon, activePreset]);

  // Compute 50-Year Timeline
  const timeline50Years: TimelineYearSummary[] = useMemo(() => {
    return generate50YearTimeline(
      birthParams.year,
      birthParams.month,
      birthParams.day,
      birthParams.hour,
      birthParams.minute,
      birthParams.latitude,
      birthParams.longitude
    );
  }, [birthParams]);

  // Compute Current Age Detailed Progression Report
  const currentReport = useMemo(() => {
    return calculateSecondaryProgressionReport(
      birthParams.year,
      birthParams.month,
      birthParams.day,
      birthParams.hour,
      birthParams.minute,
      selectedAge,
      birthParams.latitude,
      birthParams.longitude
    );
  }, [birthParams, selectedAge]);

  // Automatic timeline playback
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setSelectedAge((prev) => {
          if (prev >= 50) {
            setIsPlaying(false);
            return 50;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playbackSpeed]);

  // Handle Preset change
  const handleSelectPreset = (id: string) => {
    setSelectedPresetId(id);
    setIsCustomMode(false);
    setIsPlaying(false);
    setSelectedAge(18); // Default to prime youth age
  };

  // Handle Annotation save
  const handleSaveToNotebook = () => {
    if (!onAnnotate) return;
    const title = `Tasyir Tsanawi (Progresi Sekunder) - ${birthParams.name} Usia ${selectedAge} (${currentReport.currentCalendarYear} M)`;
    const content = `Analisis Evolusi Karakter Berdasarkan Zij as-Sindhind:
- Fase Bulan Progresi: ${currentReport.progressedLunarPhase.latinName} (${currentReport.progressedLunarPhase.arabicName})
- Tahapan Nafs: ${currentReport.sufiStage.meaning} (${currentReport.sufiStage.arabicName})
- Matahari Progresi: Rasi ${currentReport.planets.sun?.progressedSign.latinName} (${currentReport.planets.sun?.progressedDegreeInSign}°)
- Rembulan Progresi: Rasi ${currentReport.planets.moon?.progressedSign.latinName} (${currentReport.planets.moon?.progressedDegreeInSign}°), Manzil ${currentReport.planets.moon?.progressedManzil.transliteration}
- Ringkasan Hikmah: ${currentReport.innerEvolutionSummary}
- Nasihat Muamalah: ${currentReport.muamalahAdvice}
- Kutipan Syair: "${currentReport.classicalVerse.arabic}" (${currentReport.classicalVerse.translation})`;

    onAnnotate(title, content);
  };

  // Element icon helper
  const renderElementIcon = (elem: 'Nar' | 'Turab' | 'Hawa' | 'Ma') => {
    switch (elem) {
      case 'Nar':
        return <Flame className="w-4 h-4 text-rose-500 inline-block mr-1" />;
      case 'Turab':
        return <Mountain className="w-4 h-4 text-amber-600 inline-block mr-1" />;
      case 'Hawa':
        return <Wind className="w-4 h-4 text-sky-400 inline-block mr-1" />;
      case 'Ma':
        return <Droplets className="w-4 h-4 text-blue-500 inline-block mr-1" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isNight
            ? 'bg-gradient-to-br from-[#0c1222] via-[#101a30] to-[#151f38] border-[#202f4a]'
            : 'bg-gradient-to-br from-[#f8f5ee] via-[#f1ebe0] to-[#e8decb] border-[#d8cbb5]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xs text-[#c59a43] tracking-widest uppercase">
                Zij as-Sindhind • At-Tasyir ath-Thanawi
              </span>
              <span className="text-xs opacity-40">•</span>
              <span className="text-xs font-arabic text-amber-500/80">
                يَوْمٌ لِكُلِّ سَنَةٍ مِنَ العُمْرِ
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#c59a43] tracking-tight">
              Secondary Progressions (Progresi Sekunder 50 Tahun)
            </h2>
            <p className="text-xs sm:text-sm opacity-80 max-w-3xl leading-relaxed">
              Kaidah falak klasik di mana <strong>1 hari pergerakan planet setelah lahir setara dengan 1 tahun usia kehidupan manusia</strong>.
              Mengungkap evolusi batiniah, pergeseran fithrah jiwa, pergantian babak psikologis 30 tahunan <em>(Adwār al-Qamar)</em>, serta kematangan watak dalam kurun waktu 50 tahun ke depan.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSaveToNotebook}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-serif font-medium border transition-colors ${
                isNight
                  ? 'bg-[#152037] hover:bg-[#1c2c4d] border-[#293d63] text-[#e2e8f0]'
                  : 'bg-[#ede3cf] hover:bg-[#e4d6bc] border-[#cfbe9e] text-[#4a3920]'
              }`}
              title="Simpan rangkuman tahun ini ke Buku Catatan Riset"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#c59a43]" />
              <span>Catat ke Riset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset & Custom Profile Selector */}
      <div
        className={`p-5 rounded-xl border ${
          isNight ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#fcfaf6] border-[#e2d9c8]'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#c59a43]">
              Subjek Penelitian Karakter
            </div>
            <div className="text-sm font-serif">
              Pilih tokoh sejarah untuk menelaah jejak hidupnya atau masukkan tanggal lahir sendiri:
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {PROGRESSION_PRESETS.map((preset) => {
              const isSelected = !isCustomMode && selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`px-3 py-1.5 rounded-lg font-serif transition-colors ${
                    isSelected
                      ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                      : isNight
                      ? 'bg-[#1e293b] hover:bg-[#283852] text-slate-300'
                      : 'bg-[#ede5d5] hover:bg-[#e2d6bf] text-slate-700'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}

            <button
              onClick={() => {
                setIsCustomMode(true);
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-serif transition-colors ${
                isCustomMode
                  ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                  : isNight
                  ? 'bg-[#1e293b] hover:bg-[#283852] text-slate-300'
                  : 'bg-[#ede5d5] hover:bg-[#e2d6bf] text-slate-700'
              }`}
            >
              + Data Pribadi / Kustom
            </button>
          </div>
        </div>

        {/* Custom Input Form (Collapsible when isCustomMode is active) */}
        {isCustomMode && (
          <div className="mt-4 pt-4 border-t border-current/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div>
              <label className="block text-[11px] opacity-70 mb-1">Nama Subjek</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border font-serif ${
                  isNight ? 'bg-[#151f33] border-[#293d63]' : 'bg-white border-[#d8cbb5]'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] opacity-70 mb-1">Tahun Lahir (M)</label>
              <input
                type="number"
                value={customYear}
                onChange={(e) => setCustomYear(Number(e.target.value))}
                className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${
                  isNight ? 'bg-[#151f33] border-[#293d63]' : 'bg-white border-[#d8cbb5]'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] opacity-70 mb-1">Bulan Lahir (1-12)</label>
              <input
                type="number"
                min={1}
                max={12}
                value={customMonth}
                onChange={(e) => setCustomMonth(Number(e.target.value))}
                className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${
                  isNight ? 'bg-[#151f33] border-[#293d63]' : 'bg-white border-[#d8cbb5]'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] opacity-70 mb-1">Hari Lahir (1-31)</label>
              <input
                type="number"
                min={1}
                max={31}
                value={customDay}
                onChange={(e) => setCustomDay(Number(e.target.value))}
                className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${
                  isNight ? 'bg-[#151f33] border-[#293d63]' : 'bg-white border-[#d8cbb5]'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] opacity-70 mb-1">Jam Lahir (0-23)</label>
              <input
                type="number"
                min={0}
                max={23}
                value={customHour}
                onChange={(e) => setCustomHour(Number(e.target.value))}
                className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${
                  isNight ? 'bg-[#151f33] border-[#293d63]' : 'bg-white border-[#d8cbb5]'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] opacity-70 mb-1">Menit Lahir (0-59)</label>
              <input
                type="number"
                min={0}
                max={59}
                value={customMinute}
                onChange={(e) => setCustomMinute(Number(e.target.value))}
                className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${
                  isNight ? 'bg-[#151f33] border-[#293d63]' : 'bg-white border-[#d8cbb5]'
                }`}
              />
            </div>
          </div>
        )}

        {/* Active Profile Info Banner */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs opacity-75">
          <span>
            <strong>Subjek:</strong> {birthParams.name}
          </span>
          <span>•</span>
          <span>
            <strong>Lahir:</strong> {birthParams.day}/{birthParams.month}/{birthParams.year} M (Jam {birthParams.hour}:{String(birthParams.minute).padStart(2, '0')})
          </span>
          <span>•</span>
          <span>
            <strong>Lokasi:</strong> {birthParams.locationName} ({birthParams.latitude.toFixed(2)}°, {birthParams.longitude.toFixed(2)}°)
          </span>
        </div>
      </div>

      {/* Interactive 50-Year Slider & Stepper Bar */}
      <div
        className={`p-6 rounded-2xl border ${
          isNight ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#fcfaf6] border-[#e2d9c8]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-[#c59a43] font-semibold">
              Kinetika Waktu Progresi (0 s/d 50 Tahun)
            </div>
            <div className="flex items-baseline gap-3 mt-0.5">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#c59a43]">
                Usia {selectedAge} Tahun
              </span>
              <span className="text-sm font-serif opacity-75">
                (Tahun {currentReport.currentCalendarYear} M / Hari ke-{selectedAge} Pasca Lahir)
              </span>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedAge((prev) => Math.max(0, prev - 1))}
              disabled={selectedAge <= 0}
              className={`p-2 rounded-xl border transition-colors ${
                selectedAge <= 0 ? 'opacity-30 cursor-not-allowed' : ''
              } ${isNight ? 'bg-[#151f33] hover:bg-[#1e2d4a] border-[#293d63]' : 'bg-[#ede3cf] hover:bg-[#e4d6bc] border-[#cfbe9e]'}`}
              title="Mundur 1 Tahun"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all shadow-sm ${
                isPlaying
                  ? 'bg-amber-500 text-black animate-pulse'
                  : 'bg-[#c59a43] text-black hover:bg-[#d6aa52]'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Hentikan Simulasi' : 'Jalankan Simulasi'}</span>
            </button>

            <button
              onClick={() => setSelectedAge((prev) => Math.min(50, prev + 1))}
              disabled={selectedAge >= 50}
              className={`p-2 rounded-xl border transition-colors ${
                selectedAge >= 50 ? 'opacity-30 cursor-not-allowed' : ''
              } ${isNight ? 'bg-[#151f33] hover:bg-[#1e2d4a] border-[#293d63]' : 'bg-[#ede3cf] hover:bg-[#e4d6bc] border-[#cfbe9e]'}`}
              title="Maju 1 Tahun"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setSelectedAge(0);
                setIsPlaying(false);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                isNight ? 'bg-[#151f33] hover:bg-[#1e2d4a] border-[#293d63]' : 'bg-[#ede3cf] hover:bg-[#e4d6bc] border-[#cfbe9e]'}`}
              title="Reset ke Usia Lahir (0 Tahun)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={50}
            value={selectedAge}
            onChange={(e) => {
              setSelectedAge(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full h-2.5 bg-current/20 rounded-lg appearance-none cursor-pointer accent-[#c59a43]"
          />

          {/* Key Milestones Tickmarks on the slider */}
          <div className="flex justify-between items-center text-[10px] opacity-60 font-mono pt-1">
            <span>Usia 0 (Lahir)</span>
            <span>10 Th</span>
            <span>20 Th</span>
            <span className="text-[#c59a43] font-bold">28 Th (Return Qamar)</span>
            <span>40 Th (Kematangan)</span>
            <span>50 Th (Wisdom)</span>
          </div>
        </div>

        {/* Historical Notable Milestones for active preset */}
        {!isCustomMode && activePreset.notableMilestoneAges.length > 0 && (
          <div className="mt-4 pt-3 border-t border-current/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] opacity-60 font-serif">Momen Kunci Biografi:</span>
            {activePreset.notableMilestoneAges.map((item) => (
              <button
                key={item.age}
                onClick={() => {
                  setSelectedAge(item.age);
                  setIsPlaying(false);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-serif transition-colors ${
                  selectedAge === item.age
                    ? 'bg-[#c59a43] text-black font-bold'
                    : isNight
                    ? 'bg-[#182338] hover:bg-[#223352] text-slate-300'
                    : 'bg-[#eee5d4] hover:bg-[#e2d5bd] text-slate-700'
                }`}
              >
                Usia {item.age}: {item.event}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-current/10 pb-2 text-xs font-serif">
        <button
          onClick={() => setActiveSubTab('annual')}
          className={`px-4 py-2 rounded-xl transition-colors font-medium flex items-center gap-2 ${
            activeSubTab === 'annual'
              ? 'bg-[#c59a43] text-black font-bold shadow-sm'
              : isNight
              ? 'hover:bg-[#151f33] text-slate-300'
              : 'hover:bg-[#ede5d5] text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Analisis Tahunan Usia {selectedAge}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`px-4 py-2 rounded-xl transition-colors font-medium flex items-center gap-2 ${
            activeSubTab === 'timeline'
              ? 'bg-[#c59a43] text-black font-bold shadow-sm'
              : isNight
              ? 'hover:bg-[#151f33] text-slate-300'
              : 'hover:bg-[#ede5d5] text-slate-700'
          }`}
        >
          <Milestone className="w-4 h-4" />
          <span>Matriks Kronologi 50 Tahun</span>
        </button>

        <button
          onClick={() => setActiveSubTab('planets_table')}
          className={`px-4 py-2 rounded-xl transition-colors font-medium flex items-center gap-2 ${
            activeSubTab === 'planets_table'
              ? 'bg-[#c59a43] text-black font-bold shadow-sm'
              : isNight
              ? 'hover:bg-[#151f33] text-slate-300'
              : 'hover:bg-[#ede5d5] text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tabel Komparasi Planet (Natal vs Progresi)</span>
        </button>
      </div>

      {/* TAB 1: ANNUAL PROGRESSION DETAIL FOR SELECTED AGE */}
      {activeSubTab === 'annual' && (
        <div className="space-y-6">
          {/* Top Grid: Progressed Lunar Phase & Sufi Psychology Stage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progressed Lunar Phase Card */}
            <div
              className={`p-6 rounded-2xl border flex flex-col justify-between ${
                isNight ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#fcfaf6] border-[#e2d9c8]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-serif font-semibold text-[#c59a43] uppercase tracking-wider">
                    Fase Bulan Progresi (Adwār al-Qamar)
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-current/10">
                    Iluminasi: {currentReport.progressedLunarPhase.illuminationPercent}%
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#c59a43]/15 border border-[#c59a43]/30 flex items-center justify-center text-3xl shadow-sm">
                    {currentReport.progressedLunarPhase.symbol}
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#c59a43]">
                      {currentReport.progressedLunarPhase.latinName}
                    </h3>
                    <div className="text-sm font-arabic text-amber-500/80">
                      {currentReport.progressedLunarPhase.arabicName}
                    </div>
                    <div className="text-xs opacity-75 font-serif mt-0.5">
                      Sudut Fase: {currentReport.progressedLunarPhase.phaseAngle}° dari Matahari Progresi
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-current/5 border border-current/10">
                    <strong className="text-[#c59a43] block mb-1">
                      {currentReport.progressedLunarPhase.stageTitle}
                    </strong>
                    <p className="opacity-85 leading-relaxed">
                      {currentReport.progressedLunarPhase.psychologicalFocus}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-current/5 border border-current/10">
                    <strong className="text-amber-500 block mb-1">Hikmah Batiniah:</strong>
                    <p className="opacity-85 leading-relaxed">
                      {currentReport.progressedLunarPhase.spiritualWisdom}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-current/10 text-xs opacity-80 italic">
                Nasihat: {currentReport.progressedLunarPhase.advisoryText}
              </div>
            </div>

            {/* Sufi Psychology & Spiritual Stage Card */}
            <div
              className={`p-6 rounded-2xl border flex flex-col justify-between ${
                isNight ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#fcfaf6] border-[#e2d9c8]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-serif font-semibold text-[#c59a43] uppercase tracking-wider">
                    Tahapan Jiwa & Nafs (Marātib an-Nafs)
                  </span>
                  <span className="text-xs font-serif px-2 py-0.5 rounded bg-current/10">
                    {currentReport.sufiStage.ageSpan}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#c59a43]">
                      {currentReport.sufiStage.transliteration}
                    </h3>
                    <div className="text-sm font-arabic text-amber-500/80">
                      {currentReport.sufiStage.arabicName}
                    </div>
                    <div className="text-xs opacity-75 font-serif mt-0.5">
                      {currentReport.sufiStage.meaning}
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-current/5 border border-current/10">
                    <strong className="text-[#c59a43] block mb-1">Kondisi Qalb (Hati):</strong>
                    <p className="opacity-85 leading-relaxed">
                      {currentReport.sufiStage.stateOfHeart}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-current/5 border border-current/10">
                    <strong className="text-amber-500 block mb-1">Medan Pergulatan Karakter:</strong>
                    <p className="opacity-85 leading-relaxed">
                      {currentReport.sufiStage.centralStruggle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-current/10 text-xs">
                <span className="text-[#c59a43] font-semibold">Pencapaian Ruhani: </span>
                <span className="opacity-80">{currentReport.sufiStage.spiritualMilestone}</span>
              </div>
            </div>
          </div>

          {/* Elemental Shift Narrative */}
          <div
            className={`p-5 rounded-2xl border ${
              isNight ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#fcfaf6] border-[#e2d9c8]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-[#c59a43]" />
              <h4 className="text-xs font-serif font-semibold uppercase tracking-wider text-[#c59a43]">
                Dinamika Kimiawi 4 Unsur (Thaba'i' al-Arba'ah)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-current/5 border border-current/10 flex items-center justify-between">
                <div>
                  <span className="opacity-60 block text-[11px]">Unsur Dominan Lahir (Natal):</span>
                  <span className="font-serif font-bold text-sm">
                    {renderElementIcon(currentReport.natalDominantElement)}
                    {currentReport.natalDominantElement === 'Nar'
                      ? 'Api (An-Nar)'
                      : currentReport.natalDominantElement === 'Turab'
                      ? 'Tanah (At-Turab)'
                      : currentReport.natalDominantElement === 'Hawa'
                      ? 'Udara (Al-Hawa)'
                      : 'Air (Al-Ma\')'}
                  </span>
                </div>
                <div className="text-right opacity-70">Watak Dasar</div>
              </div>

              <div className="p-3 rounded-xl bg-current/5 border border-current/10 flex items-center justify-between">
                <div>
                  <span className="opacity-60 block text-[11px]">Unsur Dominan Usia {selectedAge} (Progresi):</span>
                  <span className="font-serif font-bold text-sm text-[#c59a43]">
                    {renderElementIcon(currentReport.progressedDominantElement)}
                    {currentReport.progressedDominantElement === 'Nar'
                      ? 'Api (An-Nar)'
                      : currentReport.progressedDominantElement === 'Turab'
                      ? 'Tanah (At-Turab)'
                      : currentReport.progressedDominantElement === 'Hawa'
                      ? 'Udara (Al-Hawa)'
                      : 'Air (Al-Ma\')'}
                  </span>
                </div>
                <div className="text-right opacity-70">Fokus Aktualisasi</div>
              </div>
            </div>
            <p className="text-xs opacity-80 mt-3 leading-relaxed">
              {currentReport.elementShiftNarrative}
            </p>
          </div>

          {/* Active Aspects of Progression to Natal Chart */}
          <div
            className={`p-6 rounded-2xl border ${
              isNight ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#fcfaf6] border-[#e2d9c8]'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-serif font-bold text-[#c59a43]">
                  Aspek Falak Aktif: Planet Progresi ke Planet Natal
                </h4>
                <p className="text-xs opacity-75">
                  Interaksi sudut derajat antara planet hasil peredaran progresi dengan titik kedudukan lahir asal:
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-current/10">
                {currentReport.aspectsToNatal.length} Aspek Terdeteksi
              </span>
            </div>

            {currentReport.aspectsToNatal.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-current/20 text-center text-xs opacity-60">
                Pada usia {selectedAge} tahun, belum ada planet progresi yang membentuk aspek mayor dalam batas toleransi orb ketat (&le; 1.5°). Fokus batiniah lebih dipandu oleh fase siklus Bulan Progresi.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {currentReport.aspectsToNatal.map((asp) => (
                  <div
                    key={asp.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      asp.nature === 'Sa\'d'
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : asp.nature === 'Nahs'
                        ? 'border-rose-500/30 bg-rose-500/5'
                        : 'border-amber-500/30 bg-amber-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold">{asp.symbol}</span>
                        <span className="font-serif font-bold text-sm text-[#c59a43]">
                          {asp.title}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] opacity-75">
                        Orb: {asp.orb}° {asp.isExact && '★ Eksak'}
                      </span>
                    </div>

                    <div className="text-[11px] opacity-70 mb-2">
                      Ranah Pengaruh: {asp.lifeDomain} • Sifat: {asp.nature === 'Sa\'d' ? 'Keberkahan (Sa\'d)' : asp.nature === 'Nahs' ? 'Tempaan Ujian (Nahs)' : 'Netral Harmonis (Mu\'tadil)'}
                    </div>

                    <p className="opacity-90 leading-relaxed text-[11px]">
                      {asp.characterImpact}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Classical Synthetic Verdict & Verse */}
          <div
            className={`p-6 rounded-2xl border ${
              isNight
                ? 'bg-gradient-to-br from-[#121c32] via-[#0f182c] to-[#0a101f] border-[#233554]'
                : 'bg-gradient-to-br from-[#f5ede0] via-[#ede3cf] to-[#e4d6bf] border-[#d8cbb5]'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-[#c59a43]" />
              <h4 className="text-sm font-serif font-bold text-[#c59a43]">
                Tafsir Falak Hikmah Usia {selectedAge} Tahun
              </h4>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed mb-4">
              {currentReport.innerEvolutionSummary}
            </p>

            <div className="p-3.5 rounded-xl bg-current/5 border border-current/10 text-xs mb-4">
              <strong className="text-[#c59a43] block mb-1">Tuntunan Ikhtiar & Muamalah:</strong>
              <p className="opacity-85 leading-relaxed">{currentReport.muamalahAdvice}</p>
            </div>

            {/* Classical Poetry Verse */}
            <div className="pt-3 border-t border-current/10">
              <div className="font-arabic text-base sm:text-lg text-amber-500/90 text-right leading-loose mb-1">
                {currentReport.classicalVerse.arabic}
              </div>
              <div className="text-xs font-serif opacity-75 italic mb-1">
                "{currentReport.classicalVerse.transliteration}"
              </div>
              <div className="text-xs opacity-85 leading-relaxed">
                Artinya: {currentReport.classicalVerse.translation}
              </div>
              <div className="text-[10px] opacity-50 mt-1 font-mono">
                Rujukan: {currentReport.classicalVerse.source}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 50-YEAR CHRONOLOGY MATRIX */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs opacity-75">
            <span>
              Menampilkan lintasan kronologi 51 tahun (Usia 0 s/d 50). Klik pada baris tahun untuk langsung memuat analisis detailnya:
            </span>
            <span className="font-mono">51 Titik Hisab</span>
          </div>

          <div
            className={`rounded-2xl border overflow-hidden ${
              isNight ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#fcfaf6] border-[#e2d9c8]'
            }`}
          >
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={`sticky top-0 z-10 font-serif border-b ${
                    isNight ? 'bg-[#151f33] border-[#293d63] text-slate-200' : 'bg-[#ede5d5] border-[#dacbb2] text-slate-800'
                  }`}
                >
                  <tr>
                    <th className="py-2.5 px-3">Usia</th>
                    <th className="py-2.5 px-3">Tahun</th>
                    <th className="py-2.5 px-3">Matahari Progresi</th>
                    <th className="py-2.5 px-3">Rembulan Progresi</th>
                    <th className="py-2.5 px-3">Manzil Bulan</th>
                    <th className="py-2.5 px-3">Fase Bulan Progresi</th>
                    <th className="py-2.5 px-3">Sorotan Milestone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-current/10">
                  {timeline50Years.map((item) => {
                    const isCurrent = item.age === selectedAge;
                    return (
                      <tr
                        key={item.age}
                        onClick={() => setSelectedAge(item.age)}
                        className={`cursor-pointer transition-colors ${
                          isCurrent
                            ? isNight
                              ? 'bg-[#c59a43]/20 font-semibold text-[#c59a43]'
                              : 'bg-[#c59a43]/25 font-semibold text-amber-900'
                            : isNight
                            ? 'hover:bg-[#152037]'
                            : 'hover:bg-[#f2eadc]'
                        }`}
                      >
                        <td className="py-2 px-3 font-mono">
                          {isCurrent ? '▶ ' : ''}Usia {item.age}
                        </td>
                        <td className="py-2 px-3 font-mono opacity-80">{item.year} M</td>
                        <td className="py-2 px-3 font-serif">
                          {item.sunSign} {item.sunDegree}°
                        </td>
                        <td className="py-2 px-3 font-serif font-medium">
                          {item.moonSign} {item.moonDegree}°
                        </td>
                        <td className="py-2 px-3 font-serif text-[11px] opacity-85">
                          #{item.moonManzilNum} {item.moonManzilName}
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center gap-1 font-serif">
                            <span>{item.lunarPhaseSymbol}</span>
                            <span>{item.lunarPhaseName}</span>
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {item.isNewMoon ? (
                            <span className="text-amber-500 font-bold">🌑 Awal Daur Baru 30 Th</span>
                          ) : item.isFullMoon ? (
                            <span className="text-sky-400 font-bold">🌕 Purnama Progresi</span>
                          ) : item.isSignIngress ? (
                            <span className="text-emerald-500">{item.ingressDescription}</span>
                          ) : (
                            <span className="opacity-60">{item.highlightText}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PLANETARY COMPARISON TABLE (NATAL VS PROGRESSED) */}
      {activeSubTab === 'planets_table' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs opacity-75">
            <span>
              Perbandingan posisi falak saat lahir (Natal) dengan peredaran hari ke-{selectedAge} (Progresi Usia {selectedAge} Tahun):
            </span>
            <span className="font-mono">7 Kaukab Klasik + Simpul Rahu/Ketu</span>
          </div>

          <div
            className={`rounded-2xl border overflow-hidden ${
              isNight ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#fcfaf6] border-[#e2d9c8]'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={`font-serif border-b ${
                    isNight ? 'bg-[#151f33] border-[#293d63] text-slate-200' : 'bg-[#ede5d5] border-[#dacbb2] text-slate-800'
                  }`}
                >
                  <tr>
                    <th className="py-3 px-3">Kaukab / Planet</th>
                    <th className="py-3 px-3">Posisi Lahir (Natal)</th>
                    <th className="py-3 px-3">Posisi Usia {selectedAge} (Progresi)</th>
                    <th className="py-3 px-3">Pergeseran Derajat</th>
                    <th className="py-3 px-3">Kecepatan Progresi</th>
                    <th className="py-3 px-4">Makna Transformasi Karakter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-current/10">
                  {Object.values(currentReport.planets).map((p) => (
                    <tr
                      key={p.key}
                      className={isNight ? 'hover:bg-[#141f35]' : 'hover:bg-[#f4ebe0]'}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm"
                            style={{ backgroundColor: `${p.color}22`, color: p.color }}
                          >
                            {p.symbol}
                          </span>
                          <div>
                            <div className="font-serif font-bold text-sm text-[#c59a43]">
                              {p.latinName}
                            </div>
                            <div className="text-[11px] font-arabic opacity-70">
                              {p.arabicName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-serif">
                        <div>
                          {p.natalSign.latinName} ({p.natalSign.symbol}) {p.natalDegreeInSign}°
                        </div>
                        <div className="text-[11px] opacity-70">
                          Manzil #{p.natalManzil.number}: {p.natalManzil.transliteration}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-serif">
                        <div className={p.hasChangedSign ? 'text-[#c59a43] font-bold' : ''}>
                          {p.progressedSign.latinName} ({p.progressedSign.symbol}) {p.progressedDegreeInSign}°
                          {p.hasChangedSign && ' ★ Berganti Rasi'}
                        </div>
                        <div className="text-[11px] opacity-70">
                          Manzil #{p.progressedManzil.number}: {p.progressedManzil.transliteration}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-medium">
                        +{p.degreesTraveled.toFixed(2)}°
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] opacity-80">
                        {p.speedPerYear}
                      </td>

                      <td className="py-3 px-4 text-xs opacity-90 leading-relaxed max-w-sm">
                        {p.characterSignificance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
