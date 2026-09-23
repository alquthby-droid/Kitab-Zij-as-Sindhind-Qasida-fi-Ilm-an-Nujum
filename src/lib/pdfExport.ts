/**
 * Advanced PDF Export Generator for Astronomical & Astrological Research
 * Zij as-Sindhind & Qasida fi 'Ilm an-Nujum
 * 
 * Features:
 * - Dynamic page margin & custom typography scaling
 * - Modular visual elements (Chronology, Ephemeris, Elemental Mizaj, Aspects Matrix, Horoscope, Annotations)
 * - Multiple decorative border styles (Ornate Gold, Minimalist, Borderless)
 * - 100% sanitized Latin transliteration for Standard PDF PostScript fonts (zero mojibake)
 * - Proportional column math & automated multi-page overflow management
 */

import { jsPDF } from 'jspdf';
import {
  HistoricalDateInfo,
  PlanetaryPosition,
  ResearchAnnotation,
  AspectRelation,
  PlanetKey,
} from '../types';
import { ZODIAC_SIGNS } from './sindhindEngine';

export interface ExportPdfOptions {
  researcherName: string;
  notesCommentary?: string;
  fontSizePt?: number; // Base font size, default 7.8 pt
  pageMarginMm?: number; // Margin in mm (e.g. 10, 14, 18), default 14
  borderStyle?: 'ornate_gold' | 'minimalist' | 'none';
  orientation?: 'portrait' | 'landscape';
  
  // Element visibility toggles
  includeChronology?: boolean;
  includeEphemerisTable?: boolean;
  includeElementsDistribution?: boolean;
  includeAspectsTable?: boolean;
  includeHoroscopeInterpretation?: boolean;
  includeAnnotations?: boolean;

  // Data inputs
  historicalDate: HistoricalDateInfo;
  positions: Record<string, PlanetaryPosition>;
  ascendantSign: string;
  ascendantDegree: string;
  analysisText: string;
  aspects?: AspectRelation[];
  annotations?: ResearchAnnotation[];
}

// Clean transliteration for 12 zodiac signs
const SIGN_TRANSLITERATIONS = [
  'al-Hamal (Aries)',
  'ath-Thawr (Taurus)',
  'al-Jawza\' (Gemini)',
  'as-Saratan (Cancer)',
  'al-Asad (Leo)',
  'as-Sunbulah (Virgo)',
  'al-Mizan (Libra)',
  'al-\'Aqrab (Scorpio)',
  'al-Qaws (Sagittarius)',
  'al-Jady (Capricorn)',
  'ad-Dalw (Aquarius)',
  'al-Hut (Pisces)',
];

const PLANET_DISPLAY_NAMES: Record<string, { latin: string; id: string }> = {
  sun: { latin: 'ash-Shams', id: 'Matahari' },
  moon: { latin: 'al-Qamar', id: 'Rembulan' },
  mercury: { latin: '\'Utarid', id: 'Merkurius' },
  venus: { latin: 'az-Zuhrah', id: 'Venus' },
  mars: { latin: 'al-Marrikh', id: 'Mars' },
  jupiter: { latin: 'al-Mushtari', id: 'Jupiter' },
  saturn: { latin: 'Zuhal', id: 'Saturnus' },
  rahu: { latin: 'ar-Ra\'s', id: 'Rahu (Utara)' },
  ketu: { latin: 'adh-Dhanab', id: 'Ketu (Selatan)' },
};

/**
 * Sanitizes any raw string for reliable rendering in jsPDF standard fonts.
 * Replaces Arabic scripts, non-Latin1 macrons, quotes, and cleans excess whitespace.
 */
export function cleanPdfText(raw: string | undefined | null): string {
  if (!raw) return '';

  let text = raw;

  // Specific classical dignity phrase replacements
  text = text.replace(/في بيته/g, 'Fi Baytihi');
  text = text.replace(/في شرفه الأقصى/g, 'Fi Sharafihi al-Aqsa');
  text = text.replace(/في شرفه/g, 'Fi Sharafihi');
  text = text.replace(/في وباله/g, 'Fi Wabalihi');
  text = text.replace(/في هبوطه/g, 'Fi Hubutihi');
  text = text.replace(/صاحب المثلثة/g, 'Sahib al-Muthallathah');
  text = text.replace(/حائر \/ معتدل/g, 'Mu\'tadil');
  text = text.replace(/حائر/g, 'Peregrine');

  // Strip raw Arabic script characters
  text = text.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '');

  // Normalize Unicode diacritics and macrons to standard Latin equivalents
  text = text
    .replace(/[āĀ]/g, 'a')
    .replace(/[īĪ]/g, 'i')
    .replace(/[ūŪ]/g, 'u')
    .replace(/[ēĒ]/g, 'e')
    .replace(/[ōŌ]/g, 'o')
    .replace(/[ṣṢ]/g, 's')
    .replace(/[ḍḌ]/g, 'd')
    .replace(/[ṭṬ]/g, 't')
    .replace(/[ẓẒ]/g, 'z')
    .replace(/[ḥḤ]/g, 'h')
    .replace(/[‘'ʻʼʿʾ]/g, '\'')
    .replace(/[–—]/g, '-')
    .replace(/[•]/g, '-')
    .replace(/[«»]/g, '"');

  // Clean empty parentheses or brackets left behind by removed Arabic script
  text = text.replace(/\(\s*\)/g, '');
  text = text.replace(/\[\s*\]/g, '');
  text = text.replace(/\(\s*-\s*\)/g, '');
  text = text.replace(/\(\s*•\s*\)/g, '');

  // Collapse multiple spaces and trim
  text = text.replace(/\s{2,}/g, ' ').trim();

  return text;
}

export function generateResearchPdf(options: ExportPdfOptions): void {
  const orientation = options.orientation || 'portrait';
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Margins and scale
  const marginX = options.pageMarginMm !== undefined ? options.pageMarginMm : 14;
  const contentWidth = pageWidth - marginX * 2;
  const baseFontSize = options.fontSizePt || 7.8;
  const fontScale = baseFontSize / 7.8; // Normalized scale (1.0 = standard)
  const borderStyle = options.borderStyle || 'ornate_gold';

  // Visibility flags (all default to true if undefined)
  const showChronology = options.includeChronology !== false;
  const showEphemeris = options.includeEphemerisTable !== false;
  const showElements = options.includeElementsDistribution !== false;
  const showAspects = options.includeAspectsTable !== false;
  const showInterpretation = options.includeHoroscopeInterpretation !== false;
  const showAnnotations = options.includeAnnotations !== false;

  let currentY = marginX + 3;
  let pageNumber = 1;

  // Helper to draw border on current page
  const drawPageBorders = (pageNum: number) => {
    if (borderStyle === 'ornate_gold') {
      const bMargin = Math.max(5, marginX / 2);
      doc.setDrawColor(185, 145, 65); // Antique Gold
      doc.setLineWidth(0.5);
      doc.rect(bMargin, bMargin, pageWidth - bMargin * 2, pageHeight - bMargin * 2);

      doc.setDrawColor(215, 190, 130);
      doc.setLineWidth(0.2);
      doc.rect(bMargin + 1.4, bMargin + 1.4, pageWidth - (bMargin + 1.4) * 2, pageHeight - (bMargin + 1.4) * 2);

      // Decorative corner notches
      const cSize = 2.8;
      doc.setDrawColor(185, 145, 65);
      doc.setLineWidth(0.3);
      doc.line(bMargin, bMargin + cSize, bMargin + cSize, bMargin);
      doc.line(pageWidth - bMargin - cSize, bMargin, pageWidth - bMargin, bMargin + cSize);
      doc.line(bMargin, pageHeight - bMargin - cSize, bMargin + cSize, pageHeight - bMargin);
      doc.line(pageWidth - bMargin - cSize, pageHeight - bMargin, pageWidth - bMargin, pageHeight - bMargin - cSize);
    } else if (borderStyle === 'minimalist') {
      const bMargin = Math.max(5, marginX / 2);
      doc.setDrawColor(170, 175, 185);
      doc.setLineWidth(0.3);
      doc.rect(bMargin, bMargin, pageWidth - bMargin * 2, pageHeight - bMargin * 2);
      // Top accent bar
      doc.setFillColor(60, 80, 110);
      doc.rect(bMargin, bMargin, pageWidth - bMargin * 2, 1.2, 'F');
    }
  };

  // Helper to draw footer on current page
  const drawPageFooter = (pageNum: number) => {
    const footerY = pageHeight - Math.max(8, marginX - 2);
    doc.setDrawColor(200, 180, 140);
    doc.setLineWidth(0.25);
    doc.line(marginX, footerY - 2.5, pageWidth - marginX, footerY - 2.5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.6 * fontScale);
    doc.setTextColor(115, 115, 115);
    doc.text(
      'Disusun berdasarkan manuskrip Paris BnF Arabe 2478, Bodleian Seld. Arch. A. 32, dan Escorial Arabe 908.',
      marginX,
      footerY + 1.2
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.0 * fontScale);
    doc.setTextColor(90, 80, 70);
    doc.text(`Hal. ${pageNum}`, pageWidth - marginX, footerY + 1.2, { align: 'right' });
  };

  // Check if a block fits on current page; if not, trigger a clean page break
  const ensureSpace = (neededHeight: number, sectionTitle?: string): void => {
    const maxBottom = pageHeight - Math.max(12, marginX);
    if (currentY + neededHeight > maxBottom) {
      drawPageFooter(pageNumber);
      doc.addPage();
      pageNumber++;
      drawPageBorders(pageNumber);
      currentY = marginX + 3;

      if (sectionTitle) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5 * fontScale);
        doc.setTextColor(30, 41, 59);
        doc.text(`${sectionTitle} (Lanjutan)`, marginX, currentY);
        currentY += 4.5;
      }
    }
  };

  // Initialize Page 1
  drawPageBorders(pageNumber);

  // =========================================================================
  // 1. HEADER SECTION
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.0 * fontScale);
  doc.setTextColor(30, 41, 59);
  doc.text('ZIJ AS-SINDHIND & QASIDA FI \'ILM AN-NUJUM', pageWidth / 2, currentY, {
    align: 'center',
  });
  currentY += 5.2;

  doc.setFontSize(8.5 * fontScale);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(140, 100, 30);
  doc.text(
    'Laporan Riset Hisab Astronomi & Astrologi Manuskrip Klasik',
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );
  currentY += 4.8;

  // Header Divider
  doc.setDrawColor(190, 155, 80);
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 4.5;

  // Metadata Bar: Researcher & Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0 * fontScale);
  doc.setTextColor(45, 55, 72);
  const cleanResearcher = cleanPdfText(options.researcherName) || 'Peneliti Falak & Filologi';
  doc.text(`Peneliti: ${cleanResearcher}`, marginX, currentY);

  const printDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`Waktu Cetak: ${printDateStr}`, pageWidth - marginX, currentY, {
    align: 'right',
  });
  currentY += 5.2;

  // =========================================================================
  // 2. CHRONOLOGY BOX (Synchronized Eras)
  // =========================================================================
  if (showChronology) {
    const chronoBoxHeight = 31;
    ensureSpace(chronoBoxHeight + 5);

    doc.setFillColor(248, 246, 240);
    doc.roundedRect(marginX, currentY, contentWidth, chronoBoxHeight, 1.5, 1.5, 'F');
    doc.setDrawColor(215, 200, 175);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, currentY, contentWidth, chronoBoxHeight, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.0 * fontScale);
    doc.setTextColor(130, 85, 20);
    doc.text('SINKRONISASI TARIKH & ERA FALAK KUNO (Zij Chronology):', marginX + 3.5, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5 * fontScale);
    doc.setTextColor(40, 45, 55);

    const d = options.historicalDate;
    const col1X = marginX + 4;
    const col2X = marginX + contentWidth / 2 + 2;
    const lineSpacing = 4.8;
    const chronoStartY = currentY + 10.2;

    const cleanHijriMonth = cleanPdfText(d.hijri.monthNameLatin) || 'Rabi\' al-Akhir';
    const cleanYazMonth = cleanPdfText(d.yazdajird.monthNamePersian) || 'Khurdadh';
    const cleanWeekday = cleanPdfText(d.weekdayLatin) || 'Selasa';

    // Left column
    doc.text(`- Tarikh Hijriah: ${d.hijri.day} ${cleanHijriMonth} ${d.hijri.year} H`, col1X, chronoStartY);
    doc.text(
      `- Masehi / Julian: ${d.gregorian.day}/${d.gregorian.month}/${d.gregorian.year} M (${String(
        d.gregorian.hour
      ).padStart(2, '0')}:${String(d.gregorian.minute).padStart(2, '0')} LMT)`,
      col1X,
      chronoStartY + lineSpacing
    );
    doc.text(`- Julian Day Number (JDN): ${d.jdn}`, col1X, chronoStartY + lineSpacing * 2);
    doc.text(
      `- Rasi Terbit (Tali' / ASC): ${cleanPdfText(options.ascendantSign)} ${options.ascendantDegree}`,
      col1X,
      chronoStartY + lineSpacing * 3
    );

    // Right column
    doc.text(`- Tarikh Yazdajird III: ${d.yazdajird.day} ${cleanYazMonth} ${d.yazdajird.year} Y`, col2X, chronoStartY);
    doc.text(
      `- Era Sindhind (Ahargana): ${d.sindhindEra.aharganaDays.toLocaleString('id-ID')} hari (Kaliyuga: ${d.sindhindEra.kaliyugaYears} thn)`,
      col2X,
      chronoStartY + lineSpacing
    );
    doc.text(
      `- Penguasa Hari & Jam: ${cleanWeekday} (Hari: ${d.dayRuler.toUpperCase()} / Jam: ${d.hourRuler.toUpperCase()})`,
      col2X,
      chronoStartY + lineSpacing * 2
    );
    doc.text(
      `- Kaidah Hisab: Taswiyat al-Buyut al-Mutasawiyah (Equal House 30 deg)`,
      col2X,
      chronoStartY + lineSpacing * 3
    );

    currentY += chronoBoxHeight + 5;
  }

  // =========================================================================
  // 3. PLANETARY EPHEMERIS TABLE
  // =========================================================================
  if (showEphemeris) {
    const tableHeaderHeight = 6.2;
    const rowHeight = 6.0;
    const planetEntries = Object.values(options.positions);
    const estimatedTableHeight = tableHeaderHeight + planetEntries.length * rowHeight + 10;
    ensureSpace(estimatedTableHeight, 'Tabel Hisab Ephemeris');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.6 * fontScale);
    doc.setTextColor(30, 41, 59);
    doc.text('TABEL HISAB EPHEMERIS PLANET (Jadwal Mawaqi\' al-Kawakib as-Sab\'ah)', marginX, currentY);
    currentY += 3.5;

    // Dynamic Column Widths based on contentWidth
    // Ratio: Planet (20%), Bujur (18%), Rasi (20%), Martabat (21%), Manzil (21%)
    const colRatios = [0.20, 0.18, 0.20, 0.21, 0.21];
    const colWidths = colRatios.map((r) => r * contentWidth);
    const colLefts: number[] = [];
    let accumX = marginX;
    colWidths.forEach((w) => {
      colLefts.push(accumX);
      accumX += w;
    });

    const headers = [
      'Planet (Kawkab)',
      'Bujur Ekliptika',
      'Rasi (Burj)',
      'Status Martabat (Dignitas)',
      'Manzil Rembulan',
    ];

    // Header row
    doc.setFillColor(236, 230, 216);
    doc.rect(marginX, currentY, contentWidth, tableHeaderHeight, 'F');
    doc.setDrawColor(200, 175, 130);
    doc.setLineWidth(0.3);
    doc.rect(marginX, currentY, contentWidth, tableHeaderHeight, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2 * fontScale);
    doc.setTextColor(45, 40, 30);

    headers.forEach((h, i) => {
      if (i > 0) {
        doc.line(colLefts[i], currentY, colLefts[i], currentY + tableHeaderHeight);
      }
      doc.text(h, colLefts[i] + 2, currentY + 4.3);
    });
    currentY += tableHeaderHeight;

    // Table rows
    planetEntries.forEach((pos, idx) => {
      const isEven = idx % 2 === 1;
      if (isEven) {
        doc.setFillColor(252, 250, 245);
        doc.rect(marginX, currentY, contentWidth, rowHeight, 'F');
      }

      doc.setDrawColor(225, 218, 205);
      doc.setLineWidth(0.2);
      doc.rect(marginX, currentY, contentWidth, rowHeight, 'S');

      for (let c = 1; c < colLefts.length; c++) {
        doc.line(colLefts[c], currentY, colLefts[c], currentY + rowHeight);
      }

      const planetMeta = PLANET_DISPLAY_NAMES[pos.planet.key] || {
        latin: pos.planet.transliteration,
        id: '',
      };
      const planetCell = planetMeta.id
        ? `${planetMeta.latin} (${planetMeta.id})`
        : planetMeta.latin;

      const degStr = `${pos.coordinate.signDegree}deg ${pos.coordinate.signDegreeMinutes}'`;
      const totDeg = `[${Math.round(pos.trueLongitude)}deg]`;
      const motionStr = pos.isRetrograde ? ' (Ruju\')' : '';
      const bujurCell = `${degStr} ${totDeg}${motionStr}`;

      const rasiCell = SIGN_TRANSLITERATIONS[pos.coordinate.signIndex] || 'Aries';

      let dignityClean = cleanPdfText(pos.dignity.description);
      if (!dignityClean || dignityClean.length === 0) {
        dignityClean = 'Mu\'tadil (Peregrine)';
      }
      if (dignityClean.length > 27) {
        dignityClean = dignityClean.substring(0, 26) + '...';
      }
      if (pos.isCombust) {
        dignityClean += ' [Combust]';
      }

      const manzilClean = `${cleanPdfText(pos.lunarMansion.transliteration)} (#${pos.lunarMansion.number})`;

      // Draw text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8 * fontScale);
      doc.setTextColor(30, 35, 45);
      doc.text(planetCell, colLefts[0] + 2, currentY + 4.1);

      doc.setFont('helvetica', 'normal');
      doc.text(bujurCell, colLefts[1] + 2, currentY + 4.1);
      doc.text(rasiCell, colLefts[2] + 2, currentY + 4.1);

      if (pos.dignity.isFall || pos.dignity.isDetriment) {
        doc.setTextColor(140, 30, 30);
      } else if (pos.dignity.isDomicile || pos.dignity.isExalted) {
        doc.setTextColor(20, 110, 45);
      } else {
        doc.setTextColor(50, 55, 65);
      }
      doc.text(dignityClean, colLefts[3] + 2, currentY + 4.1);

      doc.setTextColor(40, 45, 55);
      doc.text(manzilClean, colLefts[4] + 2, currentY + 4.1);

      currentY += rowHeight;
    });

    currentY += 4.5;
  }

  // =========================================================================
  // 4. ELEMENTAL DISTRIBUTION (MIZAJ FALAK) VISUAL BAR GRAPH
  // =========================================================================
  if (showElements) {
    const mizajBoxHeight = 22;
    ensureSpace(mizajBoxHeight + 5, 'Bagan Distribusi 4 Unsur');

    // Count elements from planet positions
    const elCounts = { Nar: 0, Turab: 0, Hawa: 0, Ma: 0 };
    const allPos = Object.values(options.positions);
    allPos.forEach((p) => {
      const sign = ZODIAC_SIGNS[p.coordinate.signIndex];
      elCounts[sign.element as keyof typeof elCounts]++;
    });
    const totalPlanets = allPos.length || 1;

    doc.setFillColor(250, 248, 242);
    doc.roundedRect(marginX, currentY, contentWidth, mizajBoxHeight, 1.5, 1.5, 'F');
    doc.setDrawColor(215, 200, 175);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, currentY, contentWidth, mizajBoxHeight, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8 * fontScale);
    doc.setTextColor(115, 75, 20);
    doc.text('DISTRIBUSI 4 TABIAT & UNSUR KOSMIS (Mizaj al-Kawakib):', marginX + 3.5, currentY + 4.5);

    // 4 Columns for Nar, Turab, Hawa, Ma
    const elemList = [
      { name: 'Api (Nar)', temper: 'Kolerik (Harr Yabis)', count: elCounts.Nar, color: [220, 75, 50] },
      { name: 'Tanah (Turab)', temper: 'Melankolik (Barid Yabis)', count: elCounts.Turab, color: [170, 125, 45] },
      { name: 'Udara (Hawa)', temper: 'Sanguinis (Harr Ratb)', count: elCounts.Hawa, color: [45, 140, 195] },
      { name: 'Air (Ma)', temper: 'Flegmatik (Barid Ratb)', count: elCounts.Ma, color: [35, 140, 125] },
    ];

    const eColWidth = contentWidth / 4;
    elemList.forEach((el, i) => {
      const eX = marginX + i * eColWidth + 3.5;
      const pct = Math.round((el.count / totalPlanets) * 100);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2 * fontScale);
      doc.setTextColor(el.color[0], el.color[1], el.color[2]);
      doc.text(`${el.name}: ${el.count} Kawkab (${pct}%)`, eX, currentY + 9.5);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.2 * fontScale);
      doc.setTextColor(90, 95, 105);
      doc.text(el.temper, eX, currentY + 13.5);

      // Mini progress bar
      const barMaxW = eColWidth - 7;
      doc.setFillColor(230, 225, 215);
      doc.rect(eX, currentY + 15.2, barMaxW, 2.2, 'F');

      const filledW = Math.max(1, (pct / 100) * barMaxW);
      doc.setFillColor(el.color[0], el.color[1], el.color[2]);
      doc.rect(eX, currentY + 15.2, filledW, 2.2, 'F');
    });

    currentY += mizajBoxHeight + 4.5;
  }

  // =========================================================================
  // 5. PLANETARY ASPECTS TABLE (Bagan Aspek & Sudut Antar Planet)
  // =========================================================================
  if (showAspects && options.aspects && options.aspects.length > 0) {
    const aspList = options.aspects.slice(0, 6); // Top 6 prominent aspects
    const aspRowHeight = 5.2;
    const aspTableHeight = 6.0 + aspList.length * aspRowHeight + 8;
    ensureSpace(aspTableHeight, 'Bagan Aspek Hubungan Planet');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.6 * fontScale);
    doc.setTextColor(30, 41, 59);
    doc.text('BAGAN ASPEK HUBUNGAN PLANET (Ittisal al-Kawakib)', marginX, currentY);
    currentY += 3.5;

    // Aspect Table Columns: Planet A (24%), Planet B (24%), Jenis Aspek (26%), Sudut & Orb (13%), Sifat (13%)
    const aspRatios = [0.24, 0.24, 0.26, 0.13, 0.13];
    const aspWidths = aspRatios.map((r) => r * contentWidth);
    const aspLefts: number[] = [];
    let aspAccum = marginX;
    aspWidths.forEach((w) => {
      aspLefts.push(aspAccum);
      aspAccum += w;
    });

    // Header row
    doc.setFillColor(236, 230, 216);
    doc.rect(marginX, currentY, contentWidth, 5.5, 'F');
    doc.setDrawColor(200, 175, 130);
    doc.setLineWidth(0.3);
    doc.rect(marginX, currentY, contentWidth, 5.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.0 * fontScale);
    doc.setTextColor(45, 40, 30);

    const aspHdrs = ['Planet Pertama', 'Planet Kedua', 'Bentuk Aspek Falak', 'Sudut / Orb', 'Watak'];
    aspHdrs.forEach((h, i) => {
      if (i > 0) {
        doc.line(aspLefts[i], currentY, aspLefts[i], currentY + 5.5);
      }
      doc.text(h, aspLefts[i] + 2, currentY + 3.8);
    });
    currentY += 5.5;

    // Aspect Data Rows
    aspList.forEach((asp, idx) => {
      const isEven = idx % 2 === 1;
      if (isEven) {
        doc.setFillColor(252, 250, 245);
        doc.rect(marginX, currentY, contentWidth, aspRowHeight, 'F');
      }

      doc.setDrawColor(225, 218, 205);
      doc.setLineWidth(0.2);
      doc.rect(marginX, currentY, contentWidth, aspRowHeight, 'S');

      for (let c = 1; c < aspLefts.length; c++) {
        doc.line(aspLefts[c], currentY, aspLefts[c], currentY + aspRowHeight);
      }

      const pA = PLANET_DISPLAY_NAMES[asp.planetA]?.latin || asp.planetA;
      const pB = PLANET_DISPLAY_NAMES[asp.planetB]?.latin || asp.planetB;
      const aspName = `${cleanPdfText(asp.aspectName)} (${asp.exactAngle}deg)`;
      const orbStr = `${asp.actualAngle}deg [${asp.orbDifference}deg]`;
      const natureStr = cleanPdfText(asp.nature);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8 * fontScale);
      doc.setTextColor(40, 45, 55);
      doc.text(pA, aspLefts[0] + 2, currentY + 3.6);
      doc.text(pB, aspLefts[1] + 2, currentY + 3.6);

      doc.setFont('helvetica', 'normal');
      doc.text(aspName, aspLefts[2] + 2, currentY + 3.6);
      doc.text(orbStr, aspLefts[3] + 2, currentY + 3.6);

      if (natureStr.includes('Nahs')) {
        doc.setTextColor(150, 35, 35);
      } else if (natureStr.includes('Sa\'d')) {
        doc.setTextColor(25, 120, 50);
      } else {
        doc.setTextColor(70, 75, 85);
      }
      doc.text(natureStr, aspLefts[4] + 2, currentY + 3.6);

      currentY += aspRowHeight;
    });

    currentY += 4.5;
  }

  // =========================================================================
  // 6. CLASSICAL HOROSCOPE INTERPRETATION BOX
  // =========================================================================
  if (showInterpretation) {
    const cleanAnalysis = cleanPdfText(options.analysisText);
    const textPadding = 3.5;
    const textWidth = contentWidth - textPadding * 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5 * fontScale);
    const analysisLines = doc.splitTextToSize(cleanAnalysis, textWidth);
    const displayedAnalysisLines = analysisLines.slice(0, 5);

    const textLineHeight = 4.3;
    const noteLineHeight = 3.8;
    const interpBoxHeight = 8 + displayedAnalysisLines.length * textLineHeight + noteLineHeight + 4;

    ensureSpace(interpBoxHeight + 8, 'Interpretasi Falak Kuno');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.6 * fontScale);
    doc.setTextColor(25, 45, 80);
    doc.text('INTERPRETASI FALAK KUNO (Ahkam an-Nujum sesuai Manuskrip Sindhind & Qasida)', marginX, currentY);
    currentY += 3.5;

    doc.setFillColor(245, 248, 252);
    doc.roundedRect(marginX, currentY, contentWidth, interpBoxHeight, 1.5, 1.5, 'F');
    doc.setDrawColor(205, 220, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, currentY, contentWidth, interpBoxHeight, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8 * fontScale);
    doc.setTextColor(30, 65, 115);
    doc.text('Ringkasan Sintesis Tali\', Aspek Rembulan & Tabiat Unsur Dominan:', marginX + textPadding, currentY + 5.0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.4 * fontScale);
    doc.setTextColor(35, 45, 55);

    let textY = currentY + 9.5;
    displayedAnalysisLines.forEach((line: string) => {
      doc.text(line, marginX + textPadding, textY);
      textY += textLineHeight;
    });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.6 * fontScale);
    doc.setTextColor(95, 105, 120);
    const formulaNote = 'Kaidah Hisab Rumah: Taswiyat al-Buyut al-Mutasawiyah (Equal House) Cusp(n) = Tali\' + (n-1)*30 deg.';
    doc.text(formulaNote, marginX + textPadding, textY + 1.2);

    currentY += interpBoxHeight + 4.5;
  }

  // =========================================================================
  // 7. EDITORIAL COMMENTARY (If provided)
  // =========================================================================
  if (options.notesCommentary && options.notesCommentary.trim()) {
    const cleanComm = cleanPdfText(options.notesCommentary);
    const textPadding = 3.5;
    const textWidth = contentWidth - textPadding * 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2 * fontScale);
    const commLines = doc.splitTextToSize(cleanComm, textWidth);
    const commBoxHeight = 6 + Math.min(commLines.length, 3) * 4.0;

    ensureSpace(commBoxHeight + 6, 'Catatan Pengantar');

    doc.setFillColor(254, 252, 246);
    doc.roundedRect(marginX, currentY, contentWidth, commBoxHeight, 1.2, 1.2, 'F');
    doc.setDrawColor(220, 205, 175);
    doc.setLineWidth(0.25);
    doc.roundedRect(marginX, currentY, contentWidth, commBoxHeight, 1.2, 1.2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5 * fontScale);
    doc.setTextColor(115, 80, 25);
    doc.text('Catatan Pengantar Dokumen:', marginX + textPadding, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.0 * fontScale);
    doc.setTextColor(50, 55, 65);
    let commY = currentY + 8.5;
    commLines.slice(0, 3).forEach((line: string) => {
      doc.text(line, marginX + textPadding, commY);
      commY += 3.8;
    });

    currentY += commBoxHeight + 4.5;
  }

  // =========================================================================
  // 8. RESEARCH ANNOTATIONS SECTION
  // =========================================================================
  const annotationsToPrint = options.annotations || [];
  if (showAnnotations && annotationsToPrint.length > 0) {
    ensureSpace(35, 'Catatan Riset Peneliti');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.6 * fontScale);
    doc.setTextColor(30, 41, 59);
    doc.text('CATATAN RISET PENELITI (Personal Research Annotations)', marginX, currentY);
    currentY += 4.0;

    annotationsToPrint.forEach((ann) => {
      const cleanTitle = cleanPdfText(ann.title);
      const cleanContent = cleanPdfText(ann.content);
      const cleanCitation = ann.referenceCitation ? cleanPdfText(ann.referenceCitation) : '';

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2 * fontScale);
      const annLines = doc.splitTextToSize(cleanContent, contentWidth - 8);
      const displayedAnnLines = annLines.slice(0, 3);
      const cardHeight = 10 + displayedAnnLines.length * 3.8 + (cleanCitation ? 4.5 : 0);

      ensureSpace(cardHeight + 4, 'Catatan Riset Peneliti');

      doc.setFillColor(255, 254, 250);
      doc.roundedRect(marginX, currentY, contentWidth, cardHeight, 1.2, 1.2, 'F');
      doc.setDrawColor(215, 200, 165);
      doc.setLineWidth(0.25);
      doc.roundedRect(marginX, currentY, contentWidth, cardHeight, 1.2, 1.2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5 * fontScale);
      doc.setTextColor(120, 80, 20);
      const targetLabel = cleanPdfText(ann.targetType).toUpperCase();
      doc.text(`[${targetLabel}] ${cleanTitle}`, marginX + 3.5, currentY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.0 * fontScale);
      doc.setTextColor(50, 55, 65);
      let cardTextY = currentY + 8.5;
      displayedAnnLines.forEach((l: string) => {
        doc.text(l, marginX + 3.5, cardTextY);
        cardTextY += 3.7;
      });

      if (cleanCitation) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.4 * fontScale);
        doc.setTextColor(115, 110, 100);
        doc.text(`Rujukan: ${cleanCitation}`, marginX + 3.5, cardTextY + 1.0);
      }

      currentY += cardHeight + 3.5;
    });
  }

  // Draw final page footer
  drawPageFooter(pageNumber);

  // Synchronize total page count across all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const footerY = pageHeight - Math.max(8, marginX - 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.0 * fontScale);
    doc.setTextColor(90, 80, 70);

    // Clear old page number with white block
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth - marginX - 28, footerY - 1, 28, 4, 'F');
    doc.text(`Hal. ${p} dari ${totalPages}`, pageWidth - marginX, footerY + 1.2, { align: 'right' });
  }

  // File download trigger
  const dateStamp = `${options.historicalDate.gregorian.year}${String(
    options.historicalDate.gregorian.month
  ).padStart(2, '0')}${String(options.historicalDate.gregorian.day).padStart(2, '0')}`;
  const filename = `Zij_Sindhind_Riset_${dateStamp}_${options.historicalDate.hijri.year}H.pdf`;
  doc.save(filename);
}
