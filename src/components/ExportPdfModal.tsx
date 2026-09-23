import React, { useState, useMemo } from 'react';
import {
  HistoricalDateInfo,
  PlanetaryPosition,
  ResearchAnnotation,
  AspectRelation,
  ThemeMode,
} from '../types';
import { generateResearchPdf } from '../lib/pdfExport';
import {
  FileDown,
  X,
  Type,
  Maximize2,
  Sliders,
  Eye,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
  RotateCcw,
  BookOpen,
  Calendar,
  Table,
  Compass,
  PieChart,
  GitCommit,
  FileText,
} from 'lucide-react';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  historicalDate: HistoricalDateInfo;
  positions: Record<string, PlanetaryPosition>;
  ascendantSign: string;
  ascendantDegree: string;
  analysisText: string;
  aspects?: AspectRelation[];
  annotations: ResearchAnnotation[];
  theme: ThemeMode;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  historicalDate,
  positions,
  ascendantSign,
  ascendantDegree,
  analysisText,
  aspects = [],
  annotations,
  theme,
}) => {
  if (!isOpen) return null;

  const isNight = theme === 'night';

  // Active sub-tab within the customization control panel
  type ControlTab = 'layout' | 'elements' | 'meta';
  const [activeControlTab, setActiveControlTab] = useState<ControlTab>('layout');

  // --- Document Metadata State ---
  const [researcherName, setResearcherName] = useState<string>('Peneliti Filologi & Falak Kuno');
  const [customCommentary, setCustomCommentary] = useState<string>(
    'Dokumentasi hisab ephemeris dan kaidah nujum berdasarkan naskah Zij as-Sindhind al-Kabir dan Qasida fi \'Ilm an-Nujum.'
  );

  // --- Typography & Margin Settings ---
  const [fontSizePt, setFontSizePt] = useState<number>(7.8);
  const [pageMarginMm, setPageMarginMm] = useState<number>(14);
  const [borderStyle, setBorderStyle] = useState<'ornate_gold' | 'minimalist' | 'none'>('ornate_gold');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // --- Visual Elements Toggles ---
  const [includeChronology, setIncludeChronology] = useState<boolean>(true);
  const [includeEphemerisTable, setIncludeEphemerisTable] = useState<boolean>(true);
  const [includeElementsDistribution, setIncludeElementsDistribution] = useState<boolean>(true);
  const [includeAspectsTable, setIncludeAspectsTable] = useState<boolean>(true);
  const [includeHoroscopeInterpretation, setIncludeHoroscopeInterpretation] = useState<boolean>(true);
  const [includeAnnotations, setIncludeAnnotations] = useState<boolean>(annotations.length > 0);

  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Reset to default balanced layout
  const handleResetDefaults = () => {
    setFontSizePt(7.8);
    setPageMarginMm(14);
    setBorderStyle('ornate_gold');
    setOrientation('portrait');
    setIncludeChronology(true);
    setIncludeEphemerisTable(true);
    setIncludeElementsDistribution(true);
    setIncludeAspectsTable(true);
    setIncludeHoroscopeInterpretation(true);
    setIncludeAnnotations(annotations.length > 0);
  };

  // Estimate total pages dynamically based on active elements, font size, and annotations
  const estimatedPages = useMemo(() => {
    let score = 25; // Header & base space
    if (includeChronology) score += 32;
    if (includeEphemerisTable) score += 62;
    if (includeElementsDistribution) score += 24;
    if (includeAspectsTable) score += 38;
    if (includeHoroscopeInterpretation) score += 42;
    if (customCommentary.trim()) score += 18;
    if (includeAnnotations) score += Math.min(annotations.length * 20, 60);

    // Font size & margin factor
    const densityFactor = (fontSizePt / 7.8) * (pageMarginMm > 14 ? 1.15 : pageMarginMm < 14 ? 0.9 : 1.0);
    const totalHeight = score * densityFactor;
    return totalHeight > 240 ? 2 : 1;
  }, [
    includeChronology,
    includeEphemerisTable,
    includeElementsDistribution,
    includeAspectsTable,
    includeHoroscopeInterpretation,
    customCommentary,
    includeAnnotations,
    annotations.length,
    fontSizePt,
    pageMarginMm,
  ]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        generateResearchPdf({
          researcherName,
          notesCommentary: customCommentary,
          fontSizePt,
          pageMarginMm,
          borderStyle,
          orientation,
          includeChronology,
          includeEphemerisTable,
          includeElementsDistribution,
          includeAspectsTable,
          includeHoroscopeInterpretation,
          includeAnnotations,
          historicalDate,
          positions,
          ascendantSign,
          ascendantDegree,
          analysisText,
          aspects,
          annotations: includeAnnotations ? annotations : [],
        });
        onClose();
      } catch (err) {
        console.error('PDF export error:', err);
      } finally {
        setIsExporting(false);
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl transition-all flex flex-col my-auto max-h-[92vh] ${
          isNight
            ? 'bg-[#121826] border-[#2c3d5e] text-[#e6ded0]'
            : 'bg-[#faf6ee] border-[#dfd5c0] text-[#2c241c]'
        }`}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-current/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c59a43]/20 border border-[#c59a43]/40 flex items-center justify-center text-[#c59a43]">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base tracking-wide">
                  Panel Pengaturan Cetak Riset PDF (Pre-Print Customizer)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/30">
                  Zij as-Sindhind
                </span>
              </div>
              <p className="text-xs opacity-75">
                Sesuaikan ukuran font, margin cetak, dan elemen visual sebelum mengunduh naskah.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-current/10 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Columns (Controls on Left, Live Mini-Preview on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto min-h-0">
          
          {/* Left Column: Customization Controls (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Sub-tab Navigation */}
            <div
              className={`flex items-center p-1 rounded-xl border text-xs shrink-0 ${
                isNight ? 'bg-[#0d121c] border-[#233148]' : 'bg-[#f2ece0] border-[#d8ccb0]'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveControlTab('layout')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                  activeControlTab === 'layout'
                    ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                    : 'opacity-75 hover:opacity-100'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Format & Margin</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveControlTab('elements')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                  activeControlTab === 'elements'
                    ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                    : 'opacity-75 hover:opacity-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Elemen Visual</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveControlTab('meta')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                  activeControlTab === 'meta'
                    ? 'bg-[#c59a43] text-black font-semibold shadow-sm'
                    : 'opacity-75 hover:opacity-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Metadata Riset</span>
              </button>
            </div>

            {/* TAB 1: FORMAT, FONT SIZE & MARGIN CONTROLS */}
            {activeControlTab === 'layout' && (
              <div className="space-y-4 text-xs">
                {/* Font Size Slider & Presets */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    isNight ? 'bg-[#0d121c] border-[#233148]' : 'bg-[#f4eee0] border-[#d8cca9]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-[#c59a43]" />
                      Ukuran Font Dasar Dokumen:
                    </span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/30">
                      {fontSizePt.toFixed(1)} pt
                    </span>
                  </div>

                  <input
                    type="range"
                    min={6.5}
                    max={9.5}
                    step={0.1}
                    value={fontSizePt}
                    onChange={(e) => setFontSizePt(parseFloat(e.target.value))}
                    className="w-full accent-[#c59a43] cursor-pointer mb-2.5"
                  />

                  {/* Preset quick buttons */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => setFontSizePt(7.0)}
                      className={`py-1.5 px-2 rounded-lg border transition-all ${
                        fontSizePt === 7.0
                          ? 'border-[#c59a43] bg-[#c59a43]/20 font-bold text-[#c59a43]'
                          : isNight
                          ? 'border-[#233148] bg-[#141b2b]'
                          : 'border-[#dfd3be] bg-white'
                      }`}
                    >
                      Kompak (7.0 pt)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSizePt(7.8)}
                      className={`py-1.5 px-2 rounded-lg border transition-all ${
                        fontSizePt === 7.8
                          ? 'border-[#c59a43] bg-[#c59a43]/20 font-bold text-[#c59a43]'
                          : isNight
                          ? 'border-[#233148] bg-[#141b2b]'
                          : 'border-[#dfd3be] bg-white'
                      }`}
                    >
                      Standar (7.8 pt)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSizePt(8.6)}
                      className={`py-1.5 px-2 rounded-lg border transition-all ${
                        fontSizePt === 8.6
                          ? 'border-[#c59a43] bg-[#c59a43]/20 font-bold text-[#c59a43]'
                          : isNight
                          ? 'border-[#233148] bg-[#141b2b]'
                          : 'border-[#dfd3be] bg-white'
                      }`}
                    >
                      Besar (8.6 pt)
                    </button>
                  </div>
                </div>

                {/* Page Margin Presets */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    isNight ? 'bg-[#0d121c] border-[#233148]' : 'bg-[#f4eee0] border-[#d8cca9]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Maximize2 className="w-4 h-4 text-[#c59a43]" />
                      Margin Halaman Cetak (Kertas A4):
                    </span>
                    <span className="font-mono text-[11px] opacity-75">{pageMarginMm} mm</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => setPageMarginMm(10)}
                      className={`p-2 rounded-lg border transition-all ${
                        pageMarginMm === 10
                          ? 'border-[#c59a43] bg-[#c59a43]/20 font-bold text-[#c59a43]'
                          : isNight
                          ? 'border-[#233148] bg-[#141b2b]'
                          : 'border-[#dfd3be] bg-white'
                      }`}
                    >
                      <div className="font-medium">Sempit (10 mm)</div>
                      <div className="text-[10px] opacity-65 mt-0.5">Area isi maksimal</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPageMarginMm(14)}
                      className={`p-2 rounded-lg border transition-all ${
                        pageMarginMm === 14
                          ? 'border-[#c59a43] bg-[#c59a43]/20 font-bold text-[#c59a43]'
                          : isNight
                          ? 'border-[#233148] bg-[#141b2b]'
                          : 'border-[#dfd3be] bg-white'
                      }`}
                    >
                      <div className="font-medium">Standar (14 mm)</div>
                      <div className="text-[10px] opacity-65 mt-0.5">Proporsi ideal</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPageMarginMm(18)}
                      className={`p-2 rounded-lg border transition-all ${
                        pageMarginMm === 18
                          ? 'border-[#c59a43] bg-[#c59a43]/20 font-bold text-[#c59a43]'
                          : isNight
                          ? 'border-[#233148] bg-[#141b2b]'
                          : 'border-[#dfd3be] bg-white'
                      }`}
                    >
                      <div className="font-medium">Lebar (18 mm)</div>
                      <div className="text-[10px] opacity-65 mt-0.5">Siap penjilidan fisik</div>
                    </button>
                  </div>
                </div>

                {/* Decorative Border Style */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    isNight ? 'bg-[#0d121c] border-[#233148]' : 'bg-[#f4eee0] border-[#d8cca9]'
                  }`}
                >
                  <label className="font-semibold block mb-2">Gaya Bingkai Halaman:</label>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => setBorderStyle('ornate_gold')}
                      className={`p-2 rounded-lg border transition-all ${
                        borderStyle === 'ornate_gold'
                          ? 'border-[#c59a43] bg-[#c59a43]/20 font-bold text-[#c59a43]'
                          : isNight
                          ? 'border-[#233148] bg-[#141b2b]'
                          : 'border-[#dfd3be] bg-white'
                      }`}
                    >
                      <div>Emas Klasik</div>
                      <div className="text-[10px] opacity-65 mt-0.5">Bingkai filologi kuno</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBorderStyle('minimalist')}
                      className={`p-2 rounded-lg border transition-all ${
                        borderStyle === 'minimalist'
                          ? 'border-[#c59a43] bg-[#c59a43]/20 font-bold text-[#c59a43]'
                          : isNight
                          ? 'border-[#233148] bg-[#141b2b]'
                          : 'border-[#dfd3be] bg-white'
                      }`}
                    >
                      <div>Minimalis</div>
                      <div className="text-[10px] opacity-65 mt-0.5">Garis modern bersih</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBorderStyle('none')}
                      className={`p-2 rounded-lg border transition-all ${
                        borderStyle === 'none'
                          ? 'border-[#c59a43] bg-[#c59a43]/20 font-bold text-[#c59a43]'
                          : isNight
                          ? 'border-[#233148] bg-[#141b2b]'
                          : 'border-[#dfd3be] bg-white'
                      }`}
                    >
                      <div>Tanpa Bingkai</div>
                      <div className="text-[10px] opacity-65 mt-0.5">Format polos</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VISUAL ELEMENTS TOGGLES */}
            {activeControlTab === 'elements' && (
              <div className="space-y-2.5 text-xs">
                <div className="text-[11px] opacity-75 mb-1">
                  Pilih elemen visual dan tabel hisab yang akan dicantumkan pada naskah cetak:
                </div>

                {/* Toggle Chronology */}
                <div
                  onClick={() => setIncludeChronology(!includeChronology)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    includeChronology
                      ? isNight
                        ? 'bg-[#141e30] border-[#c59a43]/50'
                        : 'bg-[#fbf7ee] border-[#c59a43]/60'
                      : isNight
                      ? 'bg-[#0d121c] border-[#233148] opacity-60'
                      : 'bg-[#f4eee0] border-[#d8cca9] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[#c59a43] shrink-0" />
                    <div>
                      <span className="font-semibold block">Sinkronisasi Tarikh & Kronologi</span>
                      <span className="text-[11px] opacity-70">
                        Hijriah, Yazdajird III, Ahargana Sindhind, JDN & Penguasa Jam/Hari
                      </span>
                    </div>
                  </div>
                  {includeChronology ? (
                    <CheckSquare className="w-4 h-4 text-[#c59a43]" />
                  ) : (
                    <Square className="w-4 h-4 opacity-40" />
                  )}
                </div>

                {/* Toggle Ephemeris Table */}
                <div
                  onClick={() => setIncludeEphemerisTable(!includeEphemerisTable)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    includeEphemerisTable
                      ? isNight
                        ? 'bg-[#141e30] border-[#c59a43]/50'
                        : 'bg-[#fbf7ee] border-[#c59a43]/60'
                      : isNight
                      ? 'bg-[#0d121c] border-[#233148] opacity-60'
                      : 'bg-[#f4eee0] border-[#d8cca9] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Table className="w-4 h-4 text-[#c59a43] shrink-0" />
                    <div>
                      <span className="font-semibold block">Tabel Ephemeris 7 Planet & Simpul</span>
                      <span className="text-[11px] opacity-70">
                        Bujur astronomis, rasi (burj), martabat falak & 28 Manzil Rembulan
                      </span>
                    </div>
                  </div>
                  {includeEphemerisTable ? (
                    <CheckSquare className="w-4 h-4 text-[#c59a43]" />
                  ) : (
                    <Square className="w-4 h-4 opacity-40" />
                  )}
                </div>

                {/* Toggle Elemental Distribution Graph */}
                <div
                  onClick={() => setIncludeElementsDistribution(!includeElementsDistribution)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    includeElementsDistribution
                      ? isNight
                        ? 'bg-[#141e30] border-[#c59a43]/50'
                        : 'bg-[#fbf7ee] border-[#c59a43]/60'
                      : isNight
                      ? 'bg-[#0d121c] border-[#233148] opacity-60'
                      : 'bg-[#f4eee0] border-[#d8cca9] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <PieChart className="w-4 h-4 text-[#c59a43] shrink-0" />
                    <div>
                      <span className="font-semibold block">Bagan Distribusi 4 Unsur (Mizaj Falak)</span>
                      <span className="text-[11px] opacity-70">
                        Visualisasi bar persentase Api (Nar), Tanah (Turab), Udara (Hawa), Air (Ma)
                      </span>
                    </div>
                  </div>
                  {includeElementsDistribution ? (
                    <CheckSquare className="w-4 h-4 text-[#c59a43]" />
                  ) : (
                    <Square className="w-4 h-4 opacity-40" />
                  )}
                </div>

                {/* Toggle Planetary Aspects Table */}
                <div
                  onClick={() => setIncludeAspectsTable(!includeAspectsTable)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    includeAspectsTable
                      ? isNight
                        ? 'bg-[#141e30] border-[#c59a43]/50'
                        : 'bg-[#fbf7ee] border-[#c59a43]/60'
                      : isNight
                      ? 'bg-[#0d121c] border-[#233148] opacity-60'
                      : 'bg-[#f4eee0] border-[#d8cca9] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GitCommit className="w-4 h-4 text-[#c59a43] shrink-0" />
                    <div>
                      <span className="font-semibold block">Bagan Aspek Hubungan Planet (Ittisal)</span>
                      <span className="text-[11px] opacity-70">
                        Daftar sudut aspek (Muqaranah, Tasdis, Tarbi', Tathlith, Muqabalah) & orb
                      </span>
                    </div>
                  </div>
                  {includeAspectsTable ? (
                    <CheckSquare className="w-4 h-4 text-[#c59a43]" />
                  ) : (
                    <Square className="w-4 h-4 opacity-40" />
                  )}
                </div>

                {/* Toggle Horoscope Interpretation */}
                <div
                  onClick={() => setIncludeHoroscopeInterpretation(!includeHoroscopeInterpretation)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    includeHoroscopeInterpretation
                      ? isNight
                        ? 'bg-[#141e30] border-[#c59a43]/50'
                        : 'bg-[#fbf7ee] border-[#c59a43]/60'
                      : isNight
                      ? 'bg-[#0d121c] border-[#233148] opacity-60'
                      : 'bg-[#f4eee0] border-[#d8cca9] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#c59a43] shrink-0" />
                    <div>
                      <span className="font-semibold block">Interpretasi Falak Kuno (Ahkam an-Nujum)</span>
                      <span className="text-[11px] opacity-70">
                        Sintesis rasi terbit (Tali'), watak Manzil rembulan & formula hisab buyut
                      </span>
                    </div>
                  </div>
                  {includeHoroscopeInterpretation ? (
                    <CheckSquare className="w-4 h-4 text-[#c59a43]" />
                  ) : (
                    <Square className="w-4 h-4 opacity-40" />
                  )}
                </div>

                {/* Toggle Research Annotations */}
                <div
                  onClick={() => setIncludeAnnotations(!includeAnnotations)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    includeAnnotations
                      ? isNight
                        ? 'bg-[#141e30] border-[#c59a43]/50'
                        : 'bg-[#fbf7ee] border-[#c59a43]/60'
                      : isNight
                      ? 'bg-[#0d121c] border-[#233148] opacity-60'
                      : 'bg-[#f4eee0] border-[#d8cca9] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#c59a43] shrink-0" />
                    <div>
                      <span className="font-semibold block">
                        Anotasi Riset Pribadi ({annotations.length})
                      </span>
                      <span className="text-[11px] opacity-70">
                        Catatan kajian filologi tersimpan (multi-halaman dengan penomoran rapi)
                      </span>
                    </div>
                  </div>
                  {includeAnnotations ? (
                    <CheckSquare className="w-4 h-4 text-[#c59a43]" />
                  ) : (
                    <Square className="w-4 h-4 opacity-40" />
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: METADATA & EDITORIAL */}
            {activeControlTab === 'meta' && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] opacity-75 mb-1 font-medium">
                    Nama Peneliti / Lembaga Akademik:
                  </label>
                  <input
                    type="text"
                    value={researcherName}
                    onChange={(e) => setResearcherName(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs ${
                      isNight
                        ? 'bg-[#0d121c] border-[#2b3a54] text-[#f1f5f9]'
                        : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] opacity-75 mb-1 font-medium">
                    Catatan Pengantar Dokumen (Editorial Commentary):
                  </label>
                  <textarea
                    rows={4}
                    value={customCommentary}
                    onChange={(e) => setCustomCommentary(e.target.value)}
                    placeholder="Tuliskan catatan pengantar dokumen riset ini..."
                    className={`w-full p-2.5 rounded-lg border text-xs ${
                      isNight
                        ? 'bg-[#0d121c] border-[#2b3a54] text-[#f1f5f9]'
                        : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                    }`}
                  />
                </div>

                <div className="p-3 rounded-lg bg-[#c59a43]/10 border border-[#c59a43]/30 text-[#c59a43] text-[11px] flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Metadata ini akan tertera pada bagian kepala naskah PDF lengkap dengan stempel digital algoritma manuskrip Paris BnF Arabe 2478.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Interactive A4 Sheet Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-semibold flex items-center gap-1.5 opacity-90">
                <Eye className="w-3.5 h-3.5 text-[#c59a43]" />
                Pratinjau Tata Letak (A4)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/30">
                Estimasi: {estimatedPages} Halaman
              </span>
            </div>

            {/* A4 Sheet Miniature Canvas */}
            <div
              className={`w-full max-w-[280px] aspect-[1/1.414] rounded-xl shadow-lg border relative flex flex-col p-3 transition-all ${
                isNight
                  ? 'bg-[#0c1017] border-[#26354d]'
                  : 'bg-white border-[#d8cca9]'
              }`}
              style={{
                padding: `${Math.max(6, pageMarginMm * 0.55)}px`,
              }}
            >
              {/* Decorative Border Preview */}
              {borderStyle === 'ornate_gold' && (
                <div className="absolute inset-1.5 border border-[#c59a43]/60 rounded pointer-events-none">
                  <div className="absolute inset-0.5 border border-[#c59a43]/30 rounded" />
                </div>
              )}
              {borderStyle === 'minimalist' && (
                <div className="absolute inset-1.5 border border-slate-400/40 rounded pointer-events-none">
                  <div className="h-1 bg-slate-600/60 w-full" />
                </div>
              )}

              {/* Miniature Document Header */}
              <div className="text-center pt-1 pb-1.5 border-b border-current/10 shrink-0">
                <div
                  className="font-bold tracking-tight text-[#c59a43] line-clamp-1"
                  style={{ fontSize: `${Math.max(7, fontSizePt * 0.95)}px` }}
                >
                  ZIJ AS-SINDHIND
                </div>
                <div className="text-[6px] opacity-60">Laporan Riset Falak Kuno</div>
              </div>

              {/* Dynamic Miniature Blocks Flow */}
              <div className="flex-1 space-y-1.5 py-1.5 overflow-hidden flex flex-col">
                {includeChronology && (
                  <div className="p-1 rounded bg-[#c59a43]/10 border border-[#c59a43]/20 text-[6px]">
                    <div className="font-bold text-[#c59a43] truncate">Sinkronisasi Tarikh (Hijri, Yazdajird, Ahargana)</div>
                    <div className="opacity-60 truncate">JDN 2461306 • Penguasa: Selasa (Mars/Sun)</div>
                  </div>
                )}

                {includeEphemerisTable && (
                  <div className="p-1 rounded bg-current/5 border border-current/10 text-[6px] space-y-0.5">
                    <div className="font-bold truncate opacity-85">Tabel Ephemeris Planet (7 Kawkab)</div>
                    <div className="grid grid-cols-3 gap-0.5 opacity-60 text-[5px]">
                      <div>Sun 29° Vir</div>
                      <div>Moon 14° Aqu</div>
                      <div>Mars 21° Gem</div>
                    </div>
                  </div>
                )}

                {includeElementsDistribution && (
                  <div className="p-1 rounded bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[6px]">
                    <div className="font-bold text-[#38bdf8] truncate">Distribusi 4 Tabiat & Unsur</div>
                    <div className="flex gap-1 h-1.5 mt-0.5">
                      <div className="bg-red-400 w-1/4 rounded-sm" />
                      <div className="bg-amber-400 w-1/4 rounded-sm" />
                      <div className="bg-sky-400 w-1/4 rounded-sm" />
                      <div className="bg-teal-400 w-1/4 rounded-sm" />
                    </div>
                  </div>
                )}

                {includeAspectsTable && (
                  <div className="p-1 rounded bg-amber-500/10 border border-amber-500/20 text-[6px]">
                    <div className="font-bold text-amber-500 truncate">Bagan Aspek Planet (Ittisal)</div>
                    <div className="opacity-65 truncate">Sun-Moon Trine • Mars-Saturn Square</div>
                  </div>
                )}

                {includeHoroscopeInterpretation && (
                  <div className="p-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[6px]">
                    <div className="font-bold text-indigo-400 truncate">Interpretasi Falak (Ahkam an-Nujum)</div>
                    <div className="opacity-65 line-clamp-2">Analisis Tali' Ascendant & kaidah hisab buyut...</div>
                  </div>
                )}

                {includeAnnotations && annotations.length > 0 && (
                  <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[6px]">
                    <div className="font-bold text-emerald-400 truncate">Catatan Riset ({annotations.length})</div>
                    <div className="opacity-60 truncate">Anotasi filologi & rujukan manuskrip</div>
                  </div>
                )}
              </div>

              {/* Miniature Footer */}
              <div className="pt-1 border-t border-current/10 flex justify-between items-center text-[5.5px] opacity-60 shrink-0">
                <span>Manuskrip BnF Arabe 2478</span>
                <span>Hal. 1</span>
              </div>
            </div>

            {/* Layout Summary Pill */}
            <div className="text-[10px] opacity-75 mt-2.5 text-center">
              Font: <strong className="text-[#c59a43]">{fontSizePt} pt</strong> • Margin:{' '}
              <strong className="text-[#c59a43]">{pageMarginMm} mm</strong> • Bingkai:{' '}
              <strong className="text-[#c59a43]">
                {borderStyle === 'ornate_gold'
                  ? 'Emas'
                  : borderStyle === 'minimalist'
                  ? 'Minimalis'
                  : 'Polos'}
              </strong>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-current/10 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs opacity-75 hover:opacity-100 hover:bg-current/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Pengaturan Awal</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs opacity-75 hover:opacity-100 transition-opacity"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#c59a43] text-black hover:bg-[#d6aa52] transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExporting ? 'Menyusun Dokumen PDF...' : 'Cetak & Unduh PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
