/**
 * Amulet & Wafaq Generator View (طِلَسْمُ وَأَوْفَاقُ المَنَازِلِ الفَلَكِيَّة)
 * Allows users to create, customize, and export classical Islamic talismans and magic squares
 * based on the 28 Lunar Mansions (Manāzil al-Qamar) according to classical texts:
 * Shams al-Ma'arif al-Kubra (Al-Buni) and Kitab al-Awfaq (Al-Ghazali).
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  Shield,
  Download,
  Printer,
  Sparkles,
  BookOpen,
  Check,
  Copy,
  Layers,
  Palette,
  Eye,
  RefreshCw,
  Info,
  HelpCircle,
  Hash,
  Flame,
  Mountain,
  Wind,
  Droplets,
  Bookmark,
  Share2,
  Phone,
  MessageCircle,
  MapPin,
  Award,
  ExternalLink,
  HeartHandshake,
  Compass,
} from 'lucide-react';
import { DetailedManzil, MANZIL_DETAILED_DATA } from '../data/manzilDetailedData';
import { calculateActiveManzil } from '../lib/manzilCalculatorEngine';
import {
  generateAmuletData,
  AMULET_THEMES,
  HAJAT_PRESETS,
  SEVEN_TALISMANIC_SIGILS,
  AmuletThemeId,
  HajatPurpose,
  WafaqGridType,
  NumeralStyle,
  APP_DEVELOPER_INFO,
  getIntisariAmuletWafaq,
} from '../lib/wafaqEngine';
import { transliterateLatinToArabic } from '../lib/hisabJumalEngine';
import { AmuletCanvasRenderer } from './AmuletCanvasRenderer';
import { HistoricalDateInfo, PlanetaryPosition, AspectRelation } from '../types';

interface AmuletWafaqGeneratorViewProps {
  currentMoonPosition?: PlanetaryPosition;
  allPositions?: Record<string, PlanetaryPosition>;
  aspects?: AspectRelation[];
  currentDateInfo?: HistoricalDateInfo;
  theme?: string;
  onAnnotate?: (title: string, content: string) => void;
}

export const AmuletWafaqGeneratorView: React.FC<AmuletWafaqGeneratorViewProps> = ({
  currentMoonPosition,
  allPositions,
  aspects,
  currentDateInfo,
  theme: appTheme,
  onAnnotate,
}) => {
  // Determine active mansion from current Moon position
  const activeManzilAnalysis = useMemo(() => {
    if (!currentMoonPosition) return null;
    return calculateActiveManzil(currentMoonPosition, allPositions, aspects);
  }, [currentMoonPosition, allPositions, aspects]);

  const defaultManzilNum = activeManzilAnalysis?.mansion.number || 1;

  // Generator State
  const [selectedManzilNum, setSelectedManzilNum] = useState<number>(defaultManzilNum);
  const [selectedHajat, setSelectedHajat] = useState<HajatPurpose>('protection');
  const [selectedTheme, setSelectedTheme] = useState<AmuletThemeId>('parchment');
  const [gridType, setGridType] = useState<WafaqGridType>('3x3');
  const [numeralStyle, setNumeralStyle] = useState<NumeralStyle>('arabic');
  const [personName, setPersonName] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [showClassicalGuidelines, setShowClassicalGuidelines] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Hidden high-res canvas ref for raster exports
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-transliterate person name to Arabic
  const personNameArabic = useMemo(() => {
    if (!personName.trim()) return '';
    return transliterateLatinToArabic(personName);
  }, [personName]);

  // Generate full amulet data
  const amuletData = useMemo(() => {
    return generateAmuletData({
      manzilNumber: selectedManzilNum,
      hajatId: selectedHajat,
      themeId: selectedTheme,
      gridType,
      numeralStyle,
      personName: personName.trim(),
      personNameArabic: personNameArabic,
    });
  }, [selectedManzilNum, selectedHajat, selectedTheme, gridType, numeralStyle, personName, personNameArabic]);

  // Synchronize with active moon mansion
  const handleSyncActiveMoon = () => {
    if (activeManzilAnalysis) {
      setSelectedManzilNum(activeManzilAnalysis.mansion.number);
    }
  };

  // Export to PNG Image
  const handleDownloadImage = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    try {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const fileExt = format === 'png' ? 'png' : 'jpg';
      const dataUrl = canvas.toDataURL(mimeType, 0.95);

      const link = document.createElement('a');
      link.download = `Amulet-Wafaq-Manzil-${amuletData.manzil.number}-${amuletData.manzil.transliteration.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setCopiedNotification(`Gambar ${format.toUpperCase()} berhasil diunduh!`);
      setTimeout(() => setCopiedNotification(null), 3000);
    } catch (err) {
      console.error('Failed to export amulet image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Print Amulet (Triggers window.print with dedicated clean print styling)
  const handlePrint = () => {
    window.print();
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const intisari = getIntisariAmuletWafaq(amuletData);
    const summary = `=== TALISMAN & WAFAQ MANZIL AL-QAMAR ===
Manzil: #${amuletData.manzil.number} ${amuletData.manzil.arabicName} (${amuletData.manzil.transliteration})
Makna: ${amuletData.manzil.meaningId}
Khadim Falak: ${amuletData.angelicForceArabic} (${amuletData.manzil.angelicForce})
Huruf Abjad: ${amuletData.manzil.abjadLetter}
Penguasa Planet: ${amuletData.manzil.spiritualRuler}
Unsur / Tabi'at: ${amuletData.manzil.elementLabel}
Hajat: ${amuletData.hajat.titleLatin} (${amuletData.hajat.meaning})
Mizan al-Wafaq (Target Sum): ${amuletData.totalTargetJumal} (Jumal Manzil: ${amuletData.manzilJumalValue}${amuletData.customNameJumal > 0 ? ` + Jumal Nama: ${amuletData.customNameJumal}` : ''})
Format Grid: ${gridType.toUpperCase()} (${numeralStyle})
Ayat Suci: «${amuletData.quranicInscription}»
Asmaul Husna: ${amuletData.sacredAsmaText}

--- INTISARI AMULET & WAFAQ ---
• Hakikat Sirr: ${intisari.hakikatSirr}
• Mizan Numerologi: ${intisari.mizanNumerologi}
• Wirid Riyadhah: ${intisari.asmaulHusnaWirid}
• Khasiat Utama: ${intisari.khasiatUtama}
• Kaidah Penulisan: ${intisari.kaidahPenulisan}

--- PENGEMBANG APLIKASI ---
Nama: ${APP_DEVELOPER_INFO.name} (${APP_DEVELOPER_INFO.nameArabic})
Alamat: ${APP_DEVELOPER_INFO.address}
Kontak Telp/WA: ${APP_DEVELOPER_INFO.phone1} & ${APP_DEVELOPER_INFO.phone2}
Berdasarkan kaidah Syams al-Ma'arif al-Kubra (Al-Buni) & Kitab al-Awfaq (Al-Ghazali).`;

    navigator.clipboard.writeText(summary);
    setCopiedNotification('Intisari & Ikhtisar Wafaq disalin ke papan klip!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Record to Application Annotations
  const handleSaveAnnotation = () => {
    if (!onAnnotate) return;
    const title = `Jimat & Wafaq Manzil #${amuletData.manzil.number} ${amuletData.manzil.arabicName} - ${amuletData.hajat.titleLatin}`;
    const content = `Analisis Talisman Manzil ${amuletData.manzil.transliteration} (${amuletData.manzil.meaningId})
• Hajat: ${amuletData.hajat.titleLatin} (${amuletData.hajat.meaning})
• Khadim: ${amuletData.manzil.angelicForce} | Huruf Abjad: ${amuletData.manzil.abjadLetter}
• Mizan Target Wafaq: ${amuletData.totalTargetJumal} (Jumal Manzil: ${amuletData.manzilJumalValue}${amuletData.customNameJumal > 0 ? ` + Jumal Nama: ${amuletData.customNameJumal}` : ''})
• Format Grid: ${gridType} (${numeralStyle})
• Ayat: "${amuletData.quranicInscription}"
• Asmaul Husna: ${amuletData.sacredAsmaText}
• Rekomendasi Tinta: Sari Za'faran (Saffron), Air Mawar & Misik.`;

    onAnnotate(title, content);
    setCopiedNotification('Tersimpan ke Jurnal Anotasi Riset!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Element Icon Helper
  const renderElementIcon = (elem: string) => {
    switch (elem) {
      case 'Nar':
        return <Flame className="w-3.5 h-3.5 text-amber-500 inline" />;
      case 'Turab':
        return <Mountain className="w-3.5 h-3.5 text-emerald-600 inline" />;
      case 'Hawa':
        return <Wind className="w-3.5 h-3.5 text-sky-500 inline" />;
      case 'Ma':
        return <Droplets className="w-3.5 h-3.5 text-blue-500 inline" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-stone-950 font-medium px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Shield className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>طِلَسْمُ وَأَوْفَاقُ المَنَازِلِ الفَلَكِيَّة</span>
                  <span className="text-xs sm:text-sm font-sans px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold">
                    Amulet & Wafaq Generator
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans mt-0.5">
                  Desain visual jimat rajah &amp; bujur sangkar magis (*Al-Awfāq*) berbasis 28 Manzil Bulan klasik menurut naskah <span className="italic font-serif">Syams al-Ma'ārif al-Kubrā</span> (Al-Būnī) &amp; <span className="italic font-serif">Kitāb al-Awfāq</span> (Al-Ghazālī).
                </p>
              </div>
            </div>
          </div>

          {/* Quick Active Moon Mansion Indicator & Sync Button */}
          {activeManzilAnalysis && (
            <div className="flex items-center gap-3 bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 rounded-xl p-3">
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 tracking-wider">
                  Manzil Bulan Aktif Saat Ini
                </div>
                <div className="font-arabic font-bold text-sm sm:text-base text-stone-800 dark:text-stone-100">
                  #{activeManzilAnalysis.mansion.number} {activeManzilAnalysis.mansion.arabicName} ({activeManzilAnalysis.mansion.transliteration})
                </div>
              </div>
              <button
                onClick={handleSyncActiveMoon}
                disabled={selectedManzilNum === activeManzilAnalysis.mansion.number}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm ${
                  selectedManzilNum === activeManzilAnalysis.mansion.number
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer active:scale-95'
                }`}
                title="Terapkan Manzil aktif saat ini ke perancang jimat"
              >
                {selectedManzilNum === activeManzilAnalysis.mansion.number ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersinkron</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sinkronkan</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Controls & Configurations (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. SELEKSI MANZIL AL-QAMAR */}
          <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Pilih dari 28 Manzil Bulan</span>
              </label>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                {selectedManzilNum} / 28
              </span>
            </div>

            {/* Dropdown Selector */}
            <select
              value={selectedManzilNum}
              onChange={(e) => setSelectedManzilNum(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2.5 rounded-xl border border-[#dacdb2] dark:border-[#2b3a58] bg-white dark:bg-[#0f1422] text-stone-800 dark:text-stone-100 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {MANZIL_DETAILED_DATA.map((m) => (
                <option key={m.number} value={m.number}>
                  Manzil #{m.number}: {m.arabicName} ({m.transliteration}) - {m.meaningId} [{m.elementLabel}]
                </option>
              ))}
            </select>

            {/* Selected Manzil Mini Capsule Summary */}
            <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-arabic font-bold text-base text-amber-800 dark:text-amber-300">
                  {amuletData.manzil.arabicName} • {amuletData.manzil.transliteration}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  {amuletData.manzil.fortuneLabel}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 dark:text-stone-400 pt-1 border-t border-current/10">
                <div>
                  <span className="opacity-70">Unsur:</span>{' '}
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {amuletData.manzil.elementLabel} {renderElementIcon(amuletData.manzil.element)}
                  </span>
                </div>
                <div>
                  <span className="opacity-70">Planet:</span>{' '}
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {amuletData.manzil.spiritualRuler}
                  </span>
                </div>
                <div>
                  <span className="opacity-70">Khādim:</span>{' '}
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {amuletData.manzil.angelicForce}
                  </span>
                </div>
                <div>
                  <span className="opacity-70">Huruf Abjad:</span>{' '}
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {amuletData.manzil.abjadLetter}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. TUJUAN HAJAT SPIRITUAL */}
          <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-500" />
              <span>Niat &amp; Hajat Spiritual (Al-Maqṣid)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(HAJAT_PRESETS) as HajatPurpose[]).map((key) => {
                const hajatItem = HAJAT_PRESETS[key];
                const isSelected = selectedHajat === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedHajat(key)}
                    className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 dark:bg-amber-500/20 text-stone-900 dark:text-stone-100 shadow-sm'
                        : 'border-[#dacdb2] dark:border-[#25344f] hover:bg-stone-100 dark:hover:bg-[#1a233a] text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <div className="font-semibold text-stone-800 dark:text-stone-200 flex items-center justify-between">
                      <span>{hajatItem.titleLatin.split('(')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                    </div>
                    <div className="text-[10px] opacity-75 line-clamp-1 mt-1 font-arabic">
                      {hajatItem.titleArabic}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
              «{amuletData.hajat.meaning}»
            </p>
          </div>

          {/* 3. PERSONALISASI NAMA PEMILIK / HAJAT */}
          <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-amber-500" />
              <span>Personalisasi Nama &amp; Hisab Jumal</span>
            </label>

            <div className="space-y-2">
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Ketik nama lengkap (cth: Ahmad Zaki, Nur Fatimah)..."
                className="w-full px-3 py-2 rounded-xl border border-[#dacdb2] dark:border-[#2b3a58] bg-white dark:bg-[#0f1422] text-stone-800 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />

              {personName.trim() && (
                <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-[#111728] border border-stone-200 dark:border-[#23314d] text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">Transliterasi Arab:</span>{' '}
                    <span className="font-arabic font-bold text-sm text-amber-600 dark:text-amber-400">
                      {personNameArabic}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">Jumal Nama:</span>{' '}
                    <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                      {amuletData.customNameJumal}
                    </span>
                  </div>
                </div>
              )}

              {/* Mizan Calculation Breakdown */}
              <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between pt-1">
                <span>Jumal Manzil: <strong>{amuletData.manzilJumalValue}</strong></span>
                <span>+</span>
                <span>Jumal Nama: <strong>{amuletData.customNameJumal}</strong></span>
                <span>=</span>
                <span className="text-amber-700 dark:text-amber-400 font-bold">
                  Mizan: {amuletData.totalTargetJumal}
                </span>
              </div>
            </div>
          </div>

          {/* 4. KONFIGURASI GRID & TAMPILAN ANGKA */}
          <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {/* Grid Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ukuran Wafaq</span>
                </label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setGridType('3x3')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-serif font-bold transition-all ${
                      gridType === '3x3'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    3×3 (Muthallath)
                  </button>
                  <button
                    onClick={() => setGridType('4x4')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-serif font-bold transition-all ${
                      gridType === '4x4'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    4×4 (Murabba')
                  </button>
                </div>
              </div>

              {/* Numeral Style */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  <span>Aksara Angka</span>
                </label>
                <select
                  value={numeralStyle}
                  onChange={(e) => setNumeralStyle(e.target.value as NumeralStyle)}
                  className="w-full px-2 py-1.5 rounded-lg border border-[#dacdb2] dark:border-[#2b3a58] bg-white dark:bg-[#0f1422] text-stone-800 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500"
                >
                  <option value="arabic">Arab Timur (١ ٢ ٣)</option>
                  <option value="abjad">Abjad Hijaiyyah (ا ب ج)</option>
                  <option value="latin">Angka Latin (1 2 3)</option>
                </select>
              </div>
            </div>

            {/* 5. TEMA VISUAL MANUSKRIP */}
            <div className="space-y-1.5 pt-2 border-t border-current/10">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Tema Estetika Manuskrip
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(AMULET_THEMES) as AmuletThemeId[]).map((themeKey) => {
                  const t = AMULET_THEMES[themeKey];
                  const isSelected = selectedTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      onClick={() => setSelectedTheme(themeKey)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                          : 'border-stone-200 dark:border-[#23314d] hover:brightness-95'
                      }`}
                      style={{ backgroundColor: t.bgColor }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border shadow-xs shrink-0"
                        style={{ backgroundColor: t.primaryBorder, borderColor: t.secondaryBorder }}
                      />
                      <div className="overflow-hidden">
                        <div
                          className="text-[11px] font-serif font-bold truncate"
                          style={{ color: t.primaryText }}
                        >
                          {t.name.split('(')[0]}
                        </div>
                        <div
                          className="text-[9px] font-arabic truncate"
                          style={{ color: t.accentText }}
                        >
                          {t.nameArabic}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Amulet Canvas & Action Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col items-center">
          {/* Action Bar (Download, Print, Copy) */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              {/* Download PNG Button */}
              <button
                onClick={() => handleDownloadImage('png')}
                disabled={isExporting}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                title="Unduh jimat resolusi tinggi format PNG (2400x2400 px)"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Gambar PNG</span>
              </button>

              {/* Download JPEG Button */}
              <button
                onClick={() => handleDownloadImage('jpeg')}
                disabled={isExporting}
                className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Unduh gambar dalam format JPEG"
              >
                <span>JPEG</span>
              </button>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cetak jimat langsung ke printer atau simpan sebagai dokumen PDF cetak"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Cetak</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Copy Summary */}
              <button
                onClick={handleCopySummary}
                className="p-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs transition-colors"
                title="Salin ikhtisar talisman ke clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>

              {/* Record to Research Journal */}
              {onAnnotate && (
                <button
                  onClick={handleSaveAnnotation}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                  title="Simpan jimat ini ke Jurnal Catatan Anotasi Riset"
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Catat Riset</span>
                </button>
              )}
            </div>
          </div>

          {/* VISUAL AMULET CANVAS RENDERER */}
          <div className="w-full flex justify-center py-2">
            <AmuletCanvasRenderer
              amuletData={amuletData}
              canvasRef={canvasRef}
              width={2400}
              height={2400}
            />
          </div>

          {/* Talismanic Sigils Mystery Legend */}
          <div className="w-full bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-4 shadow-sm text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-stone-800 dark:text-stone-200">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-500" />
                <span>Rahasia 7 Segel Talismanik (Al-Khawātim as-Sab'ah)</span>
              </span>
              <span className="text-[10px] font-serif text-stone-500 dark:text-stone-400">
                Syams al-Ma'arif al-Kubra
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {SEVEN_TALISMANIC_SIGILS.map((sig, idx) => (
                <div
                  key={idx}
                  className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/50 flex flex-col items-center"
                  title={sig.mysteryMeaning}
                >
                  <span className="text-base font-arabic font-bold text-amber-600 dark:text-amber-400">
                    {sig.symbolChar}
                  </span>
                  <span className="text-[9px] font-serif truncate w-full mt-0.5 opacity-75">
                    {sig.nameLatin.split('(')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. INTISARI AMULET & WAFAQ (إِنْتِهَازُ السِّرِّ وَجَوْهَرُ الوَفْقِ) */}
      {(() => {
        const intisari = getIntisariAmuletWafaq(amuletData);
        return (
          <div className="bg-gradient-to-br from-[#fbf8f1] to-[#f4ecd8] dark:from-[#131b2e] dark:to-[#0f1728] border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>Intisari Amulet &amp; Wafaq</span>
                    <span className="font-arabic text-sm text-amber-700 dark:text-amber-400 font-bold">
                      (إِنْتِهَازُ السِّرِّ وَجَوْهَرُ الوَفْقِ)
                    </span>
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-400 font-sans mt-0.5">
                    Esensi kosmologi falak, mizan hisab matematis, wirid asmaul husna, dan khasiat spiritual Manzil #{amuletData.manzil.number}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  const text = `INTISARI AMULET & WAFAQ MANZIL #${amuletData.manzil.number} (${amuletData.manzil.transliteration})\n` +
                    `• Hakikat Sirr: ${intisari.hakikatSirr}\n` +
                    `• Mizan Numerologi: ${intisari.mizanNumerologi}\n` +
                    `• Khasiat Utama: ${intisari.khasiatUtama}\n` +
                    `• Ayat Suci: «${amuletData.quranicInscription}»\n` +
                    `• Wirid Asmaul Husna: ${intisari.asmaulHusnaWirid}\n` +
                    `• Kaidah Penulisan: ${intisari.kaidahPenulisan}\n` +
                    `Pengembang: ${APP_DEVELOPER_INFO.name} (${APP_DEVELOPER_INFO.address}, Telp/WA: ${APP_DEVELOPER_INFO.phone1} & ${APP_DEVELOPER_INFO.phone2})`;
                  navigator.clipboard.writeText(text);
                  setCopiedNotification('Intisari Amulet & Wafaq disalin!');
                  setTimeout(() => setCopiedNotification(null), 3000);
                }}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-amber-600/15 hover:bg-amber-600/25 text-amber-800 dark:text-amber-200 border border-amber-600/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Salin intisari lengkap amulet & wafaq ini"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Intisari</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Card 1: Hakikat Kosmik & Ruhani */}
              <div className="p-4 rounded-xl bg-white/80 dark:bg-[#111728]/80 border border-amber-500/20 shadow-xs space-y-2">
                <div className="flex items-center gap-2 font-serif font-bold text-amber-800 dark:text-amber-300">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>١. Hakikat Sirr al-Falak (Kosmologi)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-700 dark:text-stone-300">
                  {intisari.hakikatSirr}
                </p>
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold">
                    Unsur: {amuletData.manzil.elementLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold">
                    Planet: {amuletData.manzil.spiritualRuler}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold font-arabic">
                    حَرْف: {amuletData.manzil.abjadLetter}
                  </span>
                </div>
              </div>

              {/* Card 2: Mizan Numerologi & Baduh */}
              <div className="p-4 rounded-xl bg-white/80 dark:bg-[#111728]/80 border border-amber-500/20 shadow-xs space-y-2">
                <div className="flex items-center gap-2 font-serif font-bold text-amber-800 dark:text-amber-300">
                  <Hash className="w-4 h-4 text-amber-600" />
                  <span>٢. Mīzān Matematika Ilahi</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-700 dark:text-stone-300">
                  {intisari.mizanNumerologi}
                </p>
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-stone-500 dark:text-stone-400">Kunci 4 Sudut Badūḥ:</span>
                  <span className="font-arabic font-bold text-sm text-amber-700 dark:text-amber-300">
                    ب • د • و • ح (٢-٤-٦-٨)
                  </span>
                </div>
              </div>

              {/* Card 3: Wirid Asmaul Husna & Riyadhah */}
              <div className="p-4 rounded-xl bg-white/80 dark:bg-[#111728]/80 border border-amber-500/20 shadow-xs space-y-2">
                <div className="flex items-center gap-2 font-serif font-bold text-amber-800 dark:text-amber-300">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>٣. Ayat Hifzh &amp; Wirid Riyadhah</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-700 dark:text-stone-300">
                  {intisari.ayatFadilah}
                </p>
                <p className="text-[11px] leading-relaxed text-stone-700 dark:text-stone-300 pt-1">
                  {intisari.asmaulHusnaWirid}
                </p>
              </div>

              {/* Card 4: Khasiat & Fadilah Hajat */}
              <div className="p-4 rounded-xl bg-white/80 dark:bg-[#111728]/80 border border-amber-500/20 shadow-xs space-y-2">
                <div className="flex items-center gap-2 font-serif font-bold text-amber-800 dark:text-amber-300">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>٤. Khasiat &amp; Karakter Muhibbah</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-700 dark:text-stone-300">
                  {intisari.khasiatUtama}
                </p>
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400 italic">
                  «{amuletData.manzil.muhibbahNature}»
                </div>
              </div>

              {/* Card 5: Kaidah Penulisan & Tinta Suci */}
              <div className="p-4 rounded-xl bg-white/80 dark:bg-[#111728]/80 border border-amber-500/20 shadow-xs space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 font-serif font-bold text-amber-800 dark:text-amber-300">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>٥. Syarat Penulisan &amp; Waktu Sa'ah Ijabah</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-700 dark:text-stone-300">
                  {intisari.kaidahPenulisan}
                </p>
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-3 text-[11px] text-stone-600 dark:text-stone-400">
                  <span><strong>Khadam Malaikat:</strong> {amuletData.angelicForceArabic} ({amuletData.manzil.angelicForce})</span>
                  <span>•</span>
                  <span><strong>4 Penjaga Langit:</strong> Jibril (Timur), Mikail (Barat), Israfil (Utara), Izrail (Selatan)</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CLASSICAL MANUSCRIPT GUIDELINES & HIKMAH (COLLAPSIBLE) */}
      <div className="bg-[#f7f2e7] dark:bg-[#151c2e] border border-[#dacdb2] dark:border-[#25344f] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              Kaidah Penulisan Manuskrip Kuno (Syurūṭ al-Kitābah wa al-Hikmah)
            </h2>
          </div>
          <button
            onClick={() => setShowClassicalGuidelines(!showClassicalGuidelines)}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
          >
            {showClassicalGuidelines ? 'Sembunyikan Panduan' : 'Lihat Panduan Lengkap'}
          </button>
        </div>

        {showClassicalGuidelines && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-current/10 text-xs text-stone-700 dark:text-stone-300">
            {/* Box 1: Waktu Ijabah */}
            <div className="p-3.5 rounded-xl bg-stone-100/80 dark:bg-[#111728] border border-stone-200 dark:border-[#23314d] space-y-1.5">
              <h3 className="font-bold font-serif text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <span>١. سَاعَةُ الإِجَابَة (Waktu Penulisan Afdal)</span>
              </h3>
              <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                Menurut Al-Buni, rajah manzil paling mustajab ditulis ketika Bulan tepat bertengger pada derajat Manzil #{amuletData.manzil.number} ({amuletData.manzil.transliteration}), bertepatan dengan jam penguasa falaknya (<span className="font-semibold text-stone-800 dark:text-stone-200">{amuletData.manzil.spiritualRuler}</span>).
              </p>
            </div>

            {/* Box 2: Tinta & Media */}
            <div className="p-3.5 rounded-xl bg-stone-100/80 dark:bg-[#111728] border border-stone-200 dark:border-[#23314d] space-y-1.5">
              <h3 className="font-bold font-serif text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <span>٢. المِدَادُ وَالقِرْطَاس (Tinta &amp; Media Suci)</span>
              </h3>
              <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                Media tradisional menggunakan kertas perkamen atau daluwang wangi. Tinta yang dianjurkan adalah racikan sari bunga Za'faran (kuma-kuma), air mawar murni (*Mā’ al-Ward*), dan sedikit bubuk minyak misik (*Misk*), ditulis dengan kalam bambu atau bulu unggas.
              </p>
            </div>

            {/* Box 3: Mizan al-Wafaq */}
            <div className="p-3.5 rounded-xl bg-stone-100/80 dark:bg-[#111728] border border-stone-200 dark:border-[#23314d] space-y-1.5">
              <h3 className="font-bold font-serif text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <span>٣. مِيزَانُ الوَفْق (Keseimbangan Matematis)</span>
              </h3>
              <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                Setiap baris, kolom, dan diagonal wafaq dijumlahkan secara presisi menghasilkan angka Mizan <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{amuletData.totalTargetJumal}</span>. Harmoni angka ini mencerminkan keseimbangan makrokosmos bintang dan mikrokosmos jiwa manusia.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* KARTU PENGEMBANG APLIKASI (AL-FAQIR HUSNI BIN SABRI SAPRI) */}
      <div className="bg-gradient-to-r from-[#fbf8f1] via-[#f7f1e1] to-[#f4ecd8] dark:from-[#131b2e] dark:via-[#162038] dark:to-[#101729] border-2 border-[#dacdb2] dark:border-[#2b3a58] rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Developer Identity Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pengembang Aplikasi Falak &amp; Naskah Turats</span>
              </span>
              <span className="font-arabic text-xs text-amber-700 dark:text-amber-400 font-bold hidden sm:inline">
                خَادِمُ عِلْمِ الفَلَكِ وَالتُّرَاثِ
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-baseline gap-2 flex-wrap">
                <span>{APP_DEVELOPER_INFO.name}</span>
                <span className="font-arabic text-base sm:text-lg text-amber-700 dark:text-amber-400 font-bold">
                  ({APP_DEVELOPER_INFO.nameArabic})
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mt-1 font-medium">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{APP_DEVELOPER_INFO.address}, Nusa Tenggara Barat</span>
              </p>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed italic pt-1">
              "Aplikasi ini dikembangkan dan disanadkan oleh Al-Faqir Husni Bin Sabri Sapri sebagai wasilah ikhtiar menghidupkan khazanah sains astronomi Islam (*Zij as-Sindhind*), hisab Jumal Abjad, serta kaidah wafaq salafush-shalihin. Semoga membawa keberkahan lahir dan batin."
            </p>
          </div>

          {/* Contact Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            {/* WhatsApp 1 */}
            <a
              href={APP_DEVELOPER_INFO.waLink1}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-emerald-200" />
              <span>WhatsApp 1: {APP_DEVELOPER_INFO.phone1}</span>
            </a>

            {/* WhatsApp 2 */}
            <a
              href={APP_DEVELOPER_INFO.waLink2}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Phone className="w-4 h-4 text-emerald-200" />
              <span>WhatsApp 2: {APP_DEVELOPER_INFO.phone2}</span>
            </a>

            {/* Copy Info Button */}
            <button
              onClick={() => {
                const info = `Pengembang Aplikasi: ${APP_DEVELOPER_INFO.name}\nAlamat: ${APP_DEVELOPER_INFO.address}\nTelp/WA 1: ${APP_DEVELOPER_INFO.phone1}\nTelp/WA 2: ${APP_DEVELOPER_INFO.phone2}`;
                navigator.clipboard.writeText(info);
                setCopiedNotification('Kontak Pengembang berhasil disalin!');
                setTimeout(() => setCopiedNotification(null), 3000);
              }}
              className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Informasi Kontak</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY DEDICATED LAYOUT (Visible only when user clicks Print / Cmd+P) */}
      <div className="hidden print:block print:w-full print:p-6 print:bg-white print:text-black">
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-bold font-serif mb-1">
            طِلَسْمُ وَأَوْفَاقُ المَنَازِلِ الفَلَكِيَّة
          </h1>
          <p className="text-sm italic">
            Classical Islamic Lunar Mansion Amulet &amp; Wafaq - Shams al-Ma'arif al-Kubra
          </p>
          <p className="text-xs mt-1">
            Manzil #{amuletData.manzil.number}: {amuletData.manzil.arabicName} ({amuletData.manzil.transliteration}) • Hajat: {amuletData.hajat.titleLatin}
          </p>
        </div>

        <div className="w-[500px] h-[520px] mx-auto mb-6">
          <AmuletCanvasRenderer
            amuletData={amuletData}
            canvasRef={canvasRef}
            width={1200}
            height={1250}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs border-t border-black pt-4">
          <div>
            <p><strong>Khādim al-Falak:</strong> {amuletData.angelicForceArabic} ({amuletData.manzil.angelicForce})</p>
            <p><strong>Huruf Abjad:</strong> {amuletData.manzil.abjadLetter}</p>
            <p><strong>Planet Penguasa:</strong> {amuletData.manzil.spiritualRuler}</p>
            <p><strong>Unsur:</strong> {amuletData.manzil.elementLabel}</p>
          </div>
          <div>
            <p><strong>Mīzān al-Wafaq:</strong> {amuletData.totalTargetJumal}</p>
            <p><strong>Asmaul Husna:</strong> {amuletData.sacredAsmaText}</p>
            <p><strong>Ayat Pelindung:</strong> {amuletData.quranicInscription}</p>
            <p><strong>Nama Pemilik:</strong> {personName || 'Umum'}</p>
          </div>
        </div>

        <div className="border-t border-black mt-4 pt-2 text-[10px] text-center">
          <p><strong>Pengembang Aplikasi:</strong> {APP_DEVELOPER_INFO.name} ({APP_DEVELOPER_INFO.nameArabic})</p>
          <p>{APP_DEVELOPER_INFO.address} • Telp/WA: {APP_DEVELOPER_INFO.phone1} &amp; {APP_DEVELOPER_INFO.phone2}</p>
        </div>
      </div>
    </div>
  );
};
