import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Flame,
  Mountain,
  Wind,
  Droplets,
  Compass,
  Calendar,
  User,
  Star,
  Shield,
  Award,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  Layers,
  Heart,
  Briefcase,
  AlertCircle,
  HelpCircle,
  Hash,
  Trophy,
  Swords,
} from 'lucide-react';
import { PartnerCompatibilitySubView } from './PartnerCompatibilitySubView';
import { CompetitionGhalibSubView } from './CompetitionGhalibSubView';
import {
  calculateHisabJumalReport,
  CULTURAL_JUMAL_PRESETS,
  DayKey,
  PasaranKey,
  SAPTA_WARA,
  PANCA_WARA,
  ABJAD_TABLE,
  HisabJumalReport,
} from '../lib/hisabJumalEngine';
import { HistoricalDateInfo } from '../types';

interface HisabJumalPasaranViewProps {
  currentDateInfo: HistoricalDateInfo;
  theme: 'night' | 'parchment';
  onAnnotate?: (title: string, content: string) => void;
}

export const HisabJumalPasaranView: React.FC<HisabJumalPasaranViewProps> = ({
  currentDateInfo,
  theme,
  onAnnotate,
}) => {
  const isNight = theme === 'night';

  // State
  type SubMode = 'personal' | 'jodoh' | 'competition';
  const [subMode, setSubMode] = useState<SubMode>('personal');

  const [nameInput, setNameInput] = useState<string>('Abdurrahman Wahid');
  const [customArabic, setCustomArabic] = useState<string>('عَبْدُ الرَّحْمَنِ وَاحِد');
  const [isCustomArabicMode, setIsCustomArabicMode] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<DayKey>('senin');
  const [selectedPasaran, setSelectedPasaran] = useState<PasaranKey>('wage');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Sync with current date's weekday & pasaran
  const handleSyncCurrentDate = () => {
    // Current historical date weekday from JDN
    const jdn = currentDateInfo.jdn;
    const weekdayIndex = (Math.floor(jdn + 1.5) % 7 + 7) % 7;
    const pasaranIndex = (Math.floor(jdn) % 5 + 5) % 5;

    const dayKeys: DayKey[] = ['ahad', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const pasaranKeys: PasaranKey[] = ['legi', 'pahing', 'pon', 'wage', 'kliwon'];

    setSelectedDay(dayKeys[weekdayIndex]);
    setSelectedPasaran(pasaranKeys[pasaranIndex]);
  };

  // Preset Selection
  const handleSelectPreset = (presetId: string) => {
    const preset = CULTURAL_JUMAL_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setNameInput(preset.nameLatin);
    setCustomArabic(preset.nameArabic);
    setSelectedDay(preset.day);
    setSelectedPasaran(preset.pasaran);
    setIsCustomArabicMode(true);
  };

  // Keyboard letter insert
  const handleInsertLetter = (char: string) => {
    setCustomArabic((prev) => prev + char);
    setIsCustomArabicMode(true);
  };

  // Recalculate Report
  const report: HisabJumalReport = useMemo(() => {
    return calculateHisabJumalReport(
      nameInput,
      selectedDay,
      selectedPasaran,
      isCustomArabicMode ? customArabic : undefined
    );
  }, [nameInput, selectedDay, selectedPasaran, isCustomArabicMode, customArabic]);

  // Copy full summary
  const handleCopySummary = () => {
    const summaryText = `[HISAB JUMAL & PETUNG WETON FALAKIAH]
Nama: ${report.inputNameLatin} (${report.arabicName})
Total Jumal Kabir: ${report.totalJumalKabir} | Jumal Saghir: ${report.totalJumalSaghir}
Weton: ${report.dayInfo.name} ${report.pasaranInfo.name} (Neptu: ${report.neptuWetonTotal})
Pancasuda: ${report.pancasuda.name}
Elemen Dominan: ${report.dominantElement} (${report.dominantElementArabic}) - ${report.elementalTemperament}
Kawkab Pelindung: ${report.rulerPlanet.name} (${report.rulerPlanet.arabicName}) - Hari Berkah: ${report.rulerPlanet.blessingDay}
Rasi Batin: ${report.spiritualBurj.name} (${report.spiritualBurj.arabicName})
Potensi Keberuntungan: ${report.fortuneDynamics.fortuneIndex}%
Asmaul Husna Resonan: ${report.spiritualRemedy.closestAsma.arabic} (${report.spiritualRemedy.closestAsma.latin})
Sektor Usaha: ${report.fortuneDynamics.bestSectors.join(', ')}
Nasihat Spiritual: ${report.spiritualRemedy.spiritualAdvice}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Save to Annotations
  const handleSaveToJournal = () => {
    if (onAnnotate) {
      onAnnotate(
        `Hisab Jumal: ${report.inputNameLatin} (${report.dayInfo.name} ${report.pasaranInfo.name})`,
        `Jumal: ${report.totalJumalKabir}, Weton: ${report.dayInfo.name} ${report.pasaranInfo.name} (Neptu ${report.neptuWetonTotal}), Elemen: ${report.dominantElement}, Kawkab: ${report.rulerPlanet.name}, Pancasuda: ${report.pancasuda.name}. Sektor: ${report.fortuneDynamics.bestSectors.join(', ')}. Asmaul Husna: ${report.spiritualRemedy.closestAsma.latin}.`
      );
    }
  };

  return (
    <div
      id="hisab-jumal-module"
      className={`rounded-2xl border p-4 sm:p-6 transition-all space-y-6 ${
        isNight
          ? 'bg-[#101420]/95 border-[#28364f] text-[#e6ded0]'
          : 'bg-[#faf6ee] border-[#dfd4be] text-[#2c261e]'
      }`}
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-[#c59a43]/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
              حِسَابُ الجُمَّلِ وَالفَالُ وَالطَّبَائِع
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#c59a43]">
              Hisab Jumal & Petung Weton Pasaran
            </h2>
          </div>
          <p className="text-xs sm:text-sm opacity-85 mt-1 font-serif max-w-3xl leading-relaxed">
            Kalkulasi numerologi huruf Hijaiyyah (*Hisāb al-Jummal al-Kabīr*), paduan weton Sapta Wara & Panca Wara Nusantara, watak empat elemen (*Al-Arkan al-Arba'ah*), bintang pelindung (*Al-Kawkab al-Hakim*), dan petung rezeki falakiah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-medium border transition-all ${
              copiedNotification
                ? 'bg-emerald-600 text-white border-emerald-500'
                : isNight
                ? 'bg-[#1c2438] hover:bg-[#25324e] border-[#3a4d70] text-[#c59a43]'
                : 'bg-[#ebdcc0] hover:bg-[#dec9a5] border-[#cbb793] text-[#5e411b]'
            }`}
            title="Salin ringkasan hasil hisab"
          >
            {copiedNotification ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedNotification ? 'Tersalin!' : 'Salin Ikhtisar'}</span>
          </button>

          {onAnnotate && (
            <button
              onClick={handleSaveToJournal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-medium border transition-all ${
                isNight
                  ? 'bg-[#c59a43]/20 hover:bg-[#c59a43]/30 border-[#c59a43]/50 text-[#c59a43]'
                  : 'bg-[#c59a43] hover:bg-[#af8433] text-white border-[#af8433]'
              }`}
              title="Simpan ke Jurnal Catatan Riset"
            >
              <BookOpen size={14} />
              <span>Catat ke Jurnal</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Sub-Navigation Tabs */}
      <div className="flex flex-wrap border-b border-[#c59a43]/30 gap-2 pb-3">
        <button
          onClick={() => setSubMode('personal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all shadow-xs ${
            subMode === 'personal'
              ? 'bg-[#c59a43] text-black shadow-md'
              : isNight
              ? 'bg-[#151c2e] text-stone-300 hover:bg-[#1e273d]'
              : 'bg-[#ebdcc0] text-stone-800 hover:bg-[#dec9a5]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Karakter &amp; Fāl Pribadi</span>
        </button>

        <button
          onClick={() => setSubMode('jodoh')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all shadow-xs ${
            subMode === 'jodoh'
              ? 'bg-rose-600 text-white shadow-md'
              : isNight
              ? 'bg-[#151c2e] text-stone-300 hover:bg-[#1e273d]'
              : 'bg-[#ebdcc0] text-stone-800 hover:bg-[#dec9a5]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Keserasian Jodoh Pasangan</span>
        </button>

        <button
          onClick={() => setSubMode('competition')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all shadow-xs ${
            subMode === 'competition'
              ? 'bg-amber-600 text-white shadow-md'
              : isNight
              ? 'bg-[#151c2e] text-stone-300 hover:bg-[#1e273d]'
              : 'bg-[#ebdcc0] text-stone-800 hover:bg-[#dec9a5]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Kemenangan &amp; Persaingan</span>
        </button>
      </div>

      {/* SUBMODE 2: JODOH PASANGAN */}
      {subMode === 'jodoh' && (
        <PartnerCompatibilitySubView theme={theme} onAnnotate={onAnnotate} />
      )}

      {/* SUBMODE 3: KEMENANGAN PERSAINGAN */}
      {subMode === 'competition' && (
        <CompetitionGhalibSubView theme={theme} onAnnotate={onAnnotate} />
      )}

      {/* SUBMODE 1: KARAKTER PERSONAL */}
      {subMode === 'personal' && (
        <>
          {/* Preset Tokoh Nusantara & Falak */}
          <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-serif font-semibold tracking-wider text-[#c59a43] flex items-center gap-1.5">
            <Sparkles size={14} />
            Preset Tokoh Inspirator Nusantara & Falak:
          </span>
          <button
            onClick={handleSyncCurrentDate}
            className="text-xs flex items-center gap-1 opacity-70 hover:opacity-100 hover:text-[#c59a43] transition-colors"
            title="Samakan dengan hari pada kalender sejarah saat ini"
          >
            <Calendar size={13} />
            <span>Sinkronkan Weton Tanggal Aktif</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {CULTURAL_JUMAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`p-2 rounded-xl text-left border transition-all text-xs font-serif flex flex-col justify-between ${
                nameInput === preset.nameLatin
                  ? 'border-[#c59a43] bg-[#c59a43]/15 shadow-sm'
                  : isNight
                  ? 'bg-[#151b2c] border-[#222f47] hover:border-[#c59a43]/50'
                  : 'bg-[#f4ede0] border-[#d8cbbb] hover:border-[#c59a43]/50'
              }`}
            >
              <div>
                <p className="font-bold text-[#c59a43] truncate">{preset.nameLatin}</p>
                <p className="text-[10px] opacity-75 font-mono truncate">{preset.fameRole}</p>
              </div>
              <div className="mt-1.5 pt-1 border-t border-current/10 flex items-center justify-between text-[10px] opacity-80">
                <span className="capitalize">{preset.day} {preset.pasaran}</span>
                <span className="font-mono text-[9px] text-[#c59a43]">Pilih →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form & Parameters */}
      <div
        className={`p-4 rounded-xl border space-y-4 ${
          isNight ? 'bg-[#141a29] border-[#24334f]' : 'bg-[#f3ebd9] border-[#d6c7af]'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Name in Latin */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-serif font-bold text-[#c59a43] flex items-center gap-1.5">
              <User size={14} />
              Nama Seseorang (Huruf Latin):
            </label>
            <div className="relative">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (!isCustomArabicMode) {
                    // Automatically transliterate
                    setCustomArabic(report.arabicName);
                  }
                }}
                placeholder="Ketik nama lengkap seseorang..."
                className={`w-full px-3 py-2 text-sm rounded-lg border font-serif outline-none transition-all ${
                  isNight
                    ? 'bg-[#1a2235] border-[#2e4063] focus:border-[#c59a43] text-white'
                    : 'bg-white border-[#c8b79d] focus:border-[#c59a43] text-black'
                }`}
              />
              {nameInput && (
                <button
                  onClick={() => setNameInput('')}
                  className="absolute right-2.5 top-2.5 text-xs opacity-50 hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-[11px] opacity-70">
              Mendukung nama Nusantara, Jawa, Sunda, Melayu, maupun Arab Islami.
            </p>
          </div>

          {/* Name in Arabic / Pegon */}
          <div className="md:col-span-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-serif font-bold text-[#c59a43] flex items-center gap-1.5">
                <Hash size={14} />
                Lafaz Arab / Pegon (الأَبْجَدِيَّة):
              </label>
              <button
                onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                className="text-[10px] text-[#c59a43] hover:underline flex items-center gap-1"
              >
                <span>{showVirtualKeyboard ? 'Tutup Papan Huruf' : 'Papan Huruf Hijaiyyah'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                dir="rtl"
                value={isCustomArabicMode ? customArabic : report.arabicName}
                onChange={(e) => {
                  setCustomArabic(e.target.value);
                  setIsCustomArabicMode(true);
                }}
                placeholder="الاسم بالعربية..."
                className={`w-full px-3 py-2 text-base font-serif rounded-lg border outline-none text-right transition-all font-arabic ${
                  isNight
                    ? 'bg-[#1a2235] border-[#2e4063] focus:border-[#c59a43] text-amber-200'
                    : 'bg-white border-[#c8b79d] focus:border-[#c59a43] text-amber-900'
                }`}
              />
              {isCustomArabicMode && (
                <button
                  onClick={() => setIsCustomArabicMode(false)}
                  className="absolute left-2.5 top-2.5 text-[10px] text-[#c59a43] hover:underline"
                  title="Kembalikan ke auto-transliterasi Latin"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
            <p className="text-[11px] opacity-70 flex items-center justify-between">
              <span>{isCustomArabicMode ? 'Mode Manual / Pegon Aktif' : 'Otomatis dari teks Latin'}</span>
              <span className="font-mono text-[10px] text-[#c59a43]">
                {report.lettersCount} Huruf Terhitung
              </span>
            </p>
          </div>

          {/* Day & Pasaran Selectors */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-serif font-bold text-[#c59a43] flex items-center gap-1.5">
              <Compass size={14} />
              Weton Hari & Pasaran:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value as DayKey)}
                className={`w-full px-2 py-2 text-xs rounded-lg border font-serif outline-none ${
                  isNight ? 'bg-[#1a2235] border-[#2e4063] text-white' : 'bg-white border-[#c8b79d] text-black'
                }`}
              >
                {Object.values(SAPTA_WARA).map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.name} ({d.neptu})
                  </option>
                ))}
              </select>

              <select
                value={selectedPasaran}
                onChange={(e) => setSelectedPasaran(e.target.value as PasaranKey)}
                className={`w-full px-2 py-2 text-xs rounded-lg border font-serif outline-none ${
                  isNight ? 'bg-[#1a2235] border-[#2e4063] text-white' : 'bg-white border-[#c8b79d] text-black'
                }`}
              >
                {Object.values(PANCA_WARA).map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.name} ({p.neptu})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] opacity-70">
              Neptu Weton Total: <span className="font-bold text-[#c59a43] font-mono">{report.neptuWetonTotal}</span> ({report.dayInfo.name} {report.pasaranInfo.name})
            </p>
          </div>
        </div>

        {/* Virtual Keyboard Hijaiyyah & Pegon */}
        {showVirtualKeyboard && (
          <div
            className={`p-3 rounded-lg border mt-2 space-y-2 animate-fadeIn ${
              isNight ? 'bg-[#182033] border-[#2a3c5a]' : 'bg-[#ece1cd] border-[#cebe9f]'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-[#c59a43] font-serif">
              <span>Klik huruf untuk menyisipkan ke Lafaz Arab/Pegon:</span>
              <button
                onClick={() => setCustomArabic('')}
                className="text-[10px] text-red-400 hover:underline"
              >
                Kosongkan
              </button>
            </div>
            <div className="flex flex-wrap gap-1 justify-center dir-rtl">
              {Object.keys(ABJAD_TABLE).map((char) => {
                const info = ABJAD_TABLE[char];
                return (
                  <button
                    key={char}
                    onClick={() => handleInsertLetter(char)}
                    className={`w-8 h-8 rounded text-sm font-serif flex flex-col items-center justify-center border transition-transform hover:scale-110 ${
                      isNight
                        ? 'bg-[#1f2940] hover:bg-[#c59a43]/30 border-[#324569] text-white'
                        : 'bg-white hover:bg-[#c59a43]/20 border-[#c4b399] text-black'
                    }`}
                    title={`${info.name} = ${info.value} (${info.element})`}
                  >
                    <span className="font-bold">{char}</span>
                    <span className="text-[8px] opacity-60 font-mono -mt-1">{info.value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main 6 Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Jumal Kabir */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isNight ? 'bg-[#131926] border-[#253654]' : 'bg-[#f5eeea] border-[#dbcab5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] opacity-75 font-serif">Jumal Kabīr</span>
            <Sparkles size={14} className="text-[#c59a43]" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-bold font-mono text-[#c59a43]">
              {report.totalJumalKabir}
            </span>
          </div>
          <div className="text-[10px] opacity-70 font-serif border-t border-current/10 pt-1">
            Jumal Shaghīr: <span className="font-bold font-mono text-[#c59a43]">{report.totalJumalSaghir}</span> (Akar 1-9)
          </div>
        </div>

        {/* Weton & Neptu */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isNight ? 'bg-[#131926] border-[#253654]' : 'bg-[#f5eeea] border-[#dbcab5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] opacity-75 font-serif">Weton Neptu</span>
            <Calendar size={14} className="text-blue-400" />
          </div>
          <div className="my-1.5">
            <span className="text-xl font-bold font-serif text-blue-400">
              {report.neptuWetonTotal}
            </span>
            <span className="text-xs opacity-75 ml-1">({report.dayInfo.neptu}+{report.pasaranInfo.neptu})</span>
          </div>
          <div className="text-[10px] opacity-70 font-serif border-t border-current/10 pt-1 truncate">
            {report.dayInfo.name.split(' ')[0]} {report.pasaranInfo.name.split(' ')[0]}
          </div>
        </div>

        {/* Pancasuda Category */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isNight ? 'bg-[#131926] border-[#253654]' : 'bg-[#f5eeea] border-[#dbcab5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] opacity-75 font-serif">Pancasuda</span>
            <Award size={14} className="text-emerald-400" />
          </div>
          <div className="my-1.5">
            <span className="text-lg font-bold font-serif text-emerald-400 truncate block">
              {report.pancasuda.javaneseTerm}
            </span>
          </div>
          <div className="text-[10px] opacity-70 font-serif border-t border-current/10 pt-1 truncate">
            Siklus Keberuntungan {report.pancasuda.index}/5
          </div>
        </div>

        {/* Dominant Element */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isNight ? 'bg-[#131926] border-[#253654]' : 'bg-[#f5eeea] border-[#dbcab5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] opacity-75 font-serif">Unsur Dominan</span>
            {report.dominantElement === 'Api' && <Flame size={14} className="text-red-400" />}
            {report.dominantElement === 'Tanah' && <Mountain size={14} className="text-yellow-400" />}
            {report.dominantElement === 'Udara' && <Wind size={14} className="text-sky-400" />}
            {report.dominantElement === 'Air' && <Droplets size={14} className="text-emerald-400" />}
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-lg font-bold font-serif text-[#c59a43]">
              {report.dominantElement}
            </span>
            <span className="text-xs font-serif opacity-75 font-arabic">
              ({report.dominantElementArabic})
            </span>
          </div>
          <div className="text-[10px] opacity-70 font-serif border-t border-current/10 pt-1 truncate">
            Sekunder: {report.secondaryElement}
          </div>
        </div>

        {/* Ruler Planet */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isNight ? 'bg-[#131926] border-[#253654]' : 'bg-[#f5eeea] border-[#dbcab5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] opacity-75 font-serif">Kawkab Pelindung</span>
            <Star size={14} className="text-purple-400" />
          </div>
          <div className="my-1.5 flex items-center gap-1.5">
            <span className="text-xl font-bold font-mono text-purple-400">
              {report.rulerPlanet.symbol}
            </span>
            <span className="text-xs font-serif font-bold truncate">
              {report.rulerPlanet.name.split(' ')[0]}
            </span>
          </div>
          <div className="text-[10px] opacity-70 font-serif border-t border-current/10 pt-1 truncate">
            Hari: {report.rulerPlanet.blessingDay}
          </div>
        </div>

        {/* Spiritual Zodiac */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isNight ? 'bg-[#131926] border-[#253654]' : 'bg-[#f5eeea] border-[#dbcab5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] opacity-75 font-serif">Rasi Batin</span>
            <Shield size={14} className="text-amber-400" />
          </div>
          <div className="my-1.5 flex items-center gap-1.5">
            <span className="text-xl font-bold font-mono text-amber-400">
              {report.spiritualBurj.symbol}
            </span>
            <span className="text-xs font-serif font-bold truncate">
              {report.spiritualBurj.latinSign}
            </span>
          </div>
          <div className="text-[10px] opacity-70 font-serif border-t border-current/10 pt-1 truncate font-arabic">
            {report.spiritualBurj.arabicName}
          </div>
        </div>
      </div>

      {/* Grid: Elements Analysis & Letters Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Col (5 cols): Elemental Balance & Temperament */}
        <div
          className={`lg:col-span-5 p-4 rounded-xl border space-y-4 ${
            isNight ? 'bg-[#131926] border-[#253654]' : 'bg-[#f8f2e6] border-[#dac9b3]'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-2 border-[#c59a43]/20">
            <h3 className="text-sm font-serif font-bold text-[#c59a43] flex items-center gap-1.5">
              <Layers size={15} />
              Keseimbangan Empat Unsur (Al-Arkan)
            </h3>
            <span className="text-[11px] font-mono text-[#c59a43]">
              {report.lettersCount} Huruf
            </span>
          </div>

          {/* Elemental Distribution Bars */}
          <div className="space-y-3">
            {report.elementsBreakdown.map((item) => (
              <div key={item.element} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-serif">
                  <span className="flex items-center gap-1.5 font-bold">
                    {item.element === 'Api' && <Flame size={13} className="text-red-400" />}
                    {item.element === 'Tanah' && <Mountain size={13} className="text-yellow-400" />}
                    {item.element === 'Udara' && <Wind size={13} className="text-sky-400" />}
                    {item.element === 'Air' && <Droplets size={13} className="text-emerald-400" />}
                    <span>{item.element}</span>
                    <span className="text-[10px] font-arabic opacity-75">({item.elementArabic})</span>
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] opacity-75">{item.count} Huruf (Nilai {item.valueSum})</span>
                    <span className="font-bold text-[#c59a43]">{item.percentage}%</span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden bg-black/20">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <p className="text-[10px] opacity-75 italic">{item.natureSummary}</p>
              </div>
            ))}
          </div>

          {/* Temperament Note */}
          <div
            className={`p-3 rounded-lg border text-xs font-serif space-y-1 ${
              isNight ? 'bg-[#182136] border-[#2b3e61]' : 'bg-[#efe3ce] border-[#cdbba1]'
            }`}
          >
            <div className="font-bold text-[#c59a43]">Diagnosis Temperamen Batin:</div>
            <p className="opacity-90 leading-relaxed text-[11px]">
              {report.elementalTemperament}. Dominasi unsur <span className="font-bold text-[#c59a43]">{report.dominantElement}</span> membentuk cara pandang hidup yang berfokus pada cita-cita dan keteguhan langkah, diimbangi unsur <span className="font-bold">{report.secondaryElement}</span> sebagai pengatur ritme emosional.
            </p>
          </div>
        </div>

        {/* Right Col (7 cols): Letter by Letter Abjad Table */}
        <div
          className={`lg:col-span-7 p-4 rounded-xl border space-y-4 ${
            isNight ? 'bg-[#131926] border-[#253654]' : 'bg-[#f8f2e6] border-[#dac9b3]'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-2 border-[#c59a43]/20">
            <h3 className="text-sm font-serif font-bold text-[#c59a43] flex items-center gap-1.5">
              <Hash size={15} />
              Tafsir Rincian Huruf Pembentuk Nama (تَفْصِيلُ حُرُوفِ الاِسْم)
            </h3>
            <span className="text-[11px] font-serif opacity-75">
              Total: <strong className="font-mono text-[#c59a43]">{report.totalJumalKabir}</strong>
            </span>
          </div>

          {/* Letter Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {report.lettersBreakdown.map((l, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all ${
                  isNight
                    ? 'bg-[#182236] border-[#2c3d5f] hover:border-[#c59a43]/60'
                    : 'bg-white border-[#d8c7b0] hover:border-[#c59a43]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold font-serif font-arabic text-[#c59a43]">
                    {l.char}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      l.element === 'Api'
                        ? 'bg-red-500/20 text-red-400'
                        : l.element === 'Tanah'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : l.element === 'Udara'
                        ? 'bg-sky-500/20 text-sky-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {l.element}
                  </span>
                </div>

                <div className="my-1">
                  <div className="text-xs font-serif font-semibold">{l.name}</div>
                  <div className="text-[11px] font-mono font-bold text-[#c59a43]">
                    Nilai = {l.value}
                  </div>
                </div>

                <div className="text-[9px] opacity-70 italic border-t border-current/10 pt-1 line-clamp-2">
                  {l.spiritualNote}
                </div>
              </div>
            ))}
          </div>

          {/* Jumal Formula Summary */}
          <div className="text-xs font-mono opacity-80 bg-black/20 p-2.5 rounded-lg border border-current/10 flex flex-wrap items-center justify-between gap-2">
            <span>
              Rumus: {report.lettersBreakdown.map((l) => `${l.char}(${l.value})`).join(' + ')} ={' '}
              <strong className="text-[#c59a43]">{report.totalJumalKabir}</strong>
            </span>
            <span className="text-[10px] text-[#c59a43] font-serif">
              Root Digit (Jumal Shaghir): {report.totalJumalSaghir}
            </span>
          </div>
        </div>
      </div>

      {/* Karakter, Hal Ihwal & Budi Pekerti */}
      <div
        className={`p-4 sm:p-5 rounded-xl border space-y-4 ${
          isNight ? 'bg-[#131926] border-[#253654]' : 'bg-[#f8f2e6] border-[#dac9b3]'
        }`}
      >
        <div className="border-b pb-2 border-[#c59a43]/20 flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-[#c59a43] flex items-center gap-2">
            <Heart size={16} />
            Hal Ihwal Karakter, Watak Asasi & Keistimewaan Pribadi
          </h3>
          <span className="text-xs font-serif italic opacity-75">
            Paduan Falak Arabiah & Primbon Jawi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Keistimewaan & Budi Pekerti Luhur */}
          <div
            className={`p-4 rounded-xl border space-y-2.5 ${
              isNight ? 'bg-[#172033] border-[#293c5d]' : 'bg-white border-[#d8c8b0]'
            }`}
          >
            <div className="text-xs font-serif font-bold text-emerald-400 flex items-center gap-1.5">
              <Check size={14} />
              Watak Asasi & Kelebihan Budi Pekerti:
            </div>
            <ul className="space-y-2 text-xs font-serif opacity-90">
              {report.characterTraits.coreVirtues.map((v, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sisi Rentan & Pantangan (Tarbiyah an-Nafs) */}
          <div
            className={`p-4 rounded-xl border space-y-2.5 ${
              isNight ? 'bg-[#172033] border-[#293c5d]' : 'bg-white border-[#d8c8b0]'
            }`}
          >
            <div className="text-xs font-serif font-bold text-amber-400 flex items-center gap-1.5">
              <AlertCircle size={14} />
              Sisi Rentan & Penawar Batin (Tarbiyah an-Nafs):
            </div>
            <ul className="space-y-2 text-xs font-serif opacity-90">
              {report.characterTraits.cautionPoints.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>Nasihat Weton {report.pancasuda.javaneseTerm}:</strong> {report.pancasuda.advice}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>Batu Permata & Aura:</strong> Selaras dengan {report.rulerPlanet.auspiciousStone} dan warna {report.rulerPlanet.auraColor}.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Keberuntungan, Rezeki & Usaha (Al-Fal as-Sa'id) */}
      <div
        className={`p-4 sm:p-5 rounded-xl border space-y-4 ${
          isNight ? 'bg-[#131926] border-[#253654]' : 'bg-[#f8f2e6] border-[#dac9b3]'
        }`}
      >
        <div className="border-b pb-2 border-[#c59a43]/20 flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-[#c59a43] flex items-center gap-2">
            <Briefcase size={16} />
            Dinamika Rezeki, Profesi Selaras, & Hari Keberuntungan
          </h3>
          <div className="flex items-center gap-1 font-mono text-xs text-[#c59a43]">
            <span>Indeks Keberuntungan:</span>
            <strong className="text-sm font-bold">{report.fortuneDynamics.fortuneIndex}%</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Best Career Sectors */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 ${
              isNight ? 'bg-[#172033] border-[#293c5d]' : 'bg-white border-[#d8c8b0]'
            }`}
          >
            <div className="text-xs font-serif font-bold text-[#c59a43] flex items-center gap-1.5">
              <Briefcase size={14} />
              Sektor Usaha & Profesi Paling Berkah:
            </div>
            <ul className="space-y-1.5 text-xs font-serif opacity-90">
              {report.fortuneDynamics.bestSectors.map((sector, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#c59a43] font-bold">✓</span>
                  <span>{sector}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Auspicious Day & Direction */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 ${
              isNight ? 'bg-[#172033] border-[#293c5d]' : 'bg-white border-[#d8c8b0]'
            }`}
          >
            <div className="text-xs font-serif font-bold text-sky-400 flex items-center gap-1.5">
              <Compass size={14} />
              Arah Penjemput Rezeki & Hari Naungan:
            </div>
            <div className="space-y-2 text-xs font-serif opacity-90">
              <div>
                <span className="opacity-75">Hari Berkah Utama:</span>
                <p className="font-bold text-[#c59a43]">
                  {report.fortuneDynamics.auspiciousDay} (Dinaungi Kawkab {report.rulerPlanet.name})
                </p>
              </div>
              <div>
                <span className="opacity-75">Arah Mata Angin Berkah:</span>
                <p className="font-bold text-sky-400">
                  {report.fortuneDynamics.auspiciousDirection} ({report.fortuneDynamics.auspiciousDirectionArabic})
                </p>
              </div>
              <p className="text-[11px] opacity-75 italic">
                {report.fortuneDynamics.practicalAdvice}
              </p>
            </div>
          </div>

          {/* Spiritual Remediation / Resonant Asmaul Husna */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 ${
              isNight ? 'bg-[#172033] border-[#293c5d]' : 'bg-white border-[#d8c8b0]'
            }`}
          >
            <div className="text-xs font-serif font-bold text-purple-400 flex items-center gap-1.5">
              <Star size={14} />
              Resonansi Asmā’ul Ḥusnā & Wirid Hikmah:
            </div>
            <div className="space-y-2 text-xs font-serif">
              <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-center">
                <span className="text-xl font-bold font-serif font-arabic text-purple-300 block">
                  {report.spiritualRemedy.closestAsma.arabic}
                </span>
                <span className="text-xs font-bold text-purple-400">
                  {report.spiritualRemedy.closestAsma.latin} (Nilai Jumal: {report.spiritualRemedy.closestAsma.jumalValue})
                </span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {report.spiritualRemedy.spiritualAdvice}
              </p>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Philosophical Note Footer */}
      <div
        className={`p-3 rounded-xl border text-[11px] font-serif opacity-80 flex items-center gap-2 ${
          isNight ? 'bg-[#151c2e] border-[#222e47]' : 'bg-[#f1e8d6] border-[#cfbea6]'
        }`}
      >
        <HelpCircle size={15} className="text-[#c59a43] shrink-0" />
        <span>
          <strong>Catatan Kearifan:</strong> Hisāb al-Jummal dan petung pasaran weton dalam khazanah ulama falak Nusantara dan Timur Tengah (*Kitāb Syams al-Ma‘ārif* & *Tāj al-Mulūk*) adalah sarana kontemplasi (*tafakkur*) untuk mengenali potensi batin, mengasah budi pekerti luhur, dan memilih ikhtiar yang selaras, dengan tawakal mutlak kepada takdir Allah SWT.
        </span>
      </div>
    </div>
  );
};
