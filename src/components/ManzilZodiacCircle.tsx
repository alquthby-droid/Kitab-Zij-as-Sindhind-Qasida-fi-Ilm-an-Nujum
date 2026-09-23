import React, { useState, useMemo, useRef } from 'react';
import {
  ThemeMode,
  PlanetaryPosition,
  PlanetKey,
  HistoricalDateInfo,
  AspectRelation,
} from '../types';
import { MANZIL_DETAILED_DATA, DetailedManzil } from '../data/manzilDetailedData';
import {
  Moon,
  Sun,
  Sparkles,
  Layers,
  Compass,
  RotateCcw,
  Clock,
  ArrowRight,
  ArrowLeft,
  Info,
  BookmarkPlus,
  Flame,
  Droplets,
  Wind,
  Mountain,
  ShieldCheck,
  AlertTriangle,
  Heart,
  ChevronRight,
  X,
  Search,
  Filter,
} from 'lucide-react';

interface ManzilZodiacCircleProps {
  moonPosition: PlanetaryPosition;
  allPositions?: Record<PlanetKey, PlanetaryPosition>;
  aspects?: AspectRelation[];
  currentDateInfo: HistoricalDateInfo;
  activeManzilNumber: number;
  theme: ThemeMode;
  onSelectManzil?: (manzil: DetailedManzil) => void;
  onAnnotateManzil?: (title: string, content: string) => void;
  onSelectDateStep?: (hoursOffset: number) => void;
}

// Fixed Star on the Zodiacal Band associated with the 28 Lunar Mansions
interface ZodiacFixedStar {
  id: string;
  nameArabic: string;
  transliteration: string;
  nameLatin: string;
  bayer: string;
  eclipticLongitude: number; // 0 to 360
  eclipticLatitude: number;  // -15 to +15 deg approx
  magnitude: number;
  spectralColor: string;
  manzilNumber: number;
  constellation: string;
}

// 28 Defining Fixed Stars/Asterisms positioned along the Zodiac Ecliptic
const MANZIL_FIXED_STARS: ZodiacFixedStar[] = [
  { id: 'sheratan', nameArabic: 'الشَّرَطَان', transliteration: 'Ash-Sharaṭān', nameLatin: 'Sheratan', bayer: 'β Arietis', eclipticLongitude: 3.97, eclipticLatitude: 8.49, magnitude: 2.64, spectralColor: '#a6c8ff', manzilNumber: 1, constellation: 'Aries' },
  { id: 'botein', nameArabic: 'البُطَيْن', transliteration: 'Al-Buṭayn', nameLatin: 'Botein', bayer: 'δ Arietis', eclipticLongitude: 20.85, eclipticLatitude: 9.95, magnitude: 4.35, spectralColor: '#fed7aa', manzilNumber: 2, constellation: 'Aries' },
  { id: 'pleiades', nameArabic: 'الثُّرَيَّا', transliteration: 'Ath-Thurayyā', nameLatin: 'Alcyone (Pleiades)', bayer: 'η Tauri', eclipticLongitude: 29.98, eclipticLatitude: 4.05, magnitude: 1.6, spectralColor: '#bae6fd', manzilNumber: 3, constellation: 'Taurus' },
  { id: 'aldebaran', nameArabic: 'الدَّبَرَان', transliteration: 'Ad-Dabarān', nameLatin: 'Aldebaran', bayer: 'α Tauri', eclipticLongitude: 39.79, eclipticLatitude: -5.47, magnitude: 0.85, spectralColor: '#fb923c', manzilNumber: 4, constellation: 'Taurus' },
  { id: 'meissa', nameArabic: 'الهَقْعَة', transliteration: 'Al-Haq‘ah', nameLatin: 'Meissa', bayer: 'λ Orionis', eclipticLongitude: 53.7, eclipticLatitude: -13.3, magnitude: 3.39, spectralColor: '#93c5fd', manzilNumber: 5, constellation: 'Orion' },
  { id: 'alhena', nameArabic: 'الهَنْعَة', transliteration: 'Al-Han‘ah', nameLatin: 'Alhena', bayer: 'γ Geminorum', eclipticLongitude: 69.1, eclipticLatitude: -6.7, magnitude: 1.93, spectralColor: '#e0f2fe', manzilNumber: 6, constellation: 'Gemini' },
  { id: 'castor_pollux', nameArabic: 'الذِّرَاع', transliteration: 'Adh-Dhirā‘', nameLatin: 'Castor & Pollux', bayer: 'α & β Geminorum', eclipticLongitude: 83.2, eclipticLatitude: 6.7, magnitude: 1.15, spectralColor: '#fef08a', manzilNumber: 7, constellation: 'Gemini' },
  { id: 'praesepe', nameArabic: 'النَّثْرَة', transliteration: 'An-Nathrah', nameLatin: 'Praesepe (Beehive)', bayer: 'M44 Cancri', eclipticLongitude: 97.3, eclipticLatitude: 1.5, magnitude: 3.1, spectralColor: '#cbd5e1', manzilNumber: 8, constellation: 'Cancer' },
  { id: 'tarf', nameArabic: 'الطَّرْف', transliteration: 'Aṭ-Ṭarf', nameLatin: 'Al Tarf', bayer: 'β Cancri', eclipticLongitude: 104.3, eclipticLatitude: -9.2, magnitude: 3.53, spectralColor: '#fed7aa', manzilNumber: 9, constellation: 'Cancer' },
  { id: 'regulus', nameArabic: 'الجَبْهَة (قَلْبُ الأَسَد)', transliteration: 'Al-Jabhah (Regulus)', nameLatin: 'Regulus', bayer: 'α Leonis', eclipticLongitude: 129.8, eclipticLatitude: 0.46, magnitude: 1.36, spectralColor: '#67e8f9', manzilNumber: 10, constellation: 'Leo' },
  { id: 'zosma', nameArabic: 'الزُّبْرَة', transliteration: 'Az-Zubrah', nameLatin: 'Zosma', bayer: 'δ Leonis', eclipticLongitude: 141.3, eclipticLatitude: 14.3, magnitude: 2.56, spectralColor: '#e0f2fe', manzilNumber: 11, constellation: 'Leo' },
  { id: 'denebola', nameArabic: 'الصَّرْفَة', transliteration: 'Aṣ-Ṣarfah', nameLatin: 'Denebola', bayer: 'β Leonis', eclipticLongitude: 151.6, eclipticLatitude: 12.3, magnitude: 2.14, spectralColor: '#bae6fd', manzilNumber: 12, constellation: 'Leo' },
  { id: 'porrima', nameArabic: 'العَوَّاء', transliteration: 'Al-‘Awwā’', nameLatin: 'Porrima', bayer: 'γ Virginis', eclipticLongitude: 160.1, eclipticLatitude: 2.8, magnitude: 2.74, spectralColor: '#fef9c3', manzilNumber: 13, constellation: 'Virgo' },
  { id: 'spica', nameArabic: 'السِّمَاكُ الأَعْزَل', transliteration: 'As-Simāk al-A‘zal', nameLatin: 'Spica', bayer: 'α Virginis', eclipticLongitude: 173.8, eclipticLatitude: -2.05, magnitude: 0.98, spectralColor: '#93c5fd', manzilNumber: 14, constellation: 'Virgo' },
  { id: 'syrma', nameArabic: 'الغَفْر', transliteration: 'Al-Ghafr', nameLatin: 'Syrma', bayer: 'ι Virginis', eclipticLongitude: 183.8, eclipticLatitude: 7.2, magnitude: 4.07, spectralColor: '#fde047', manzilNumber: 15, constellation: 'Virgo' },
  { id: 'zubenelgenubi', nameArabic: 'الزُّبَانَى', transliteration: 'Az-Zubānā', nameLatin: 'Zubenelgenubi', bayer: 'α Librae', eclipticLongitude: 205.1, eclipticLatitude: 0.33, magnitude: 2.75, spectralColor: '#e0f2fe', manzilNumber: 16, constellation: 'Libra' },
  { id: 'acrab', nameArabic: 'الإِكْلِيل', transliteration: 'Al-Iklīl', nameLatin: 'Acrab', bayer: 'β Scorpii', eclipticLongitude: 213.2, eclipticLatitude: 1.0, magnitude: 2.56, spectralColor: '#bae6fd', manzilNumber: 17, constellation: 'Scorpius' },
  { id: 'antares', nameArabic: 'قَلْبُ العَقْرَب', transliteration: 'Qalb al-‘Aqrab', nameLatin: 'Antares', bayer: 'α Scorpii', eclipticLongitude: 229.8, eclipticLatitude: -4.57, magnitude: 1.06, spectralColor: '#ef4444', manzilNumber: 18, constellation: 'Scorpius' },
  { id: 'shaula', nameArabic: 'الشَّوْلَة', transliteration: 'Ash-Shawlah', nameLatin: 'Shaula', bayer: 'λ Scorpii', eclipticLongitude: 244.6, eclipticLatitude: -13.8, magnitude: 1.62, spectralColor: '#93c5fd', manzilNumber: 19, constellation: 'Scorpius' },
  { id: 'kaus_australis', nameArabic: 'النَّعَائِم', transliteration: 'An-Na‘ā’im', nameLatin: 'Kaus Australis', bayer: 'ε Sagittarii', eclipticLongitude: 264.9, eclipticLatitude: -9.7, magnitude: 1.79, spectralColor: '#bae6fd', manzilNumber: 20, constellation: 'Sagittarius' },
  { id: 'albaldah', nameArabic: 'البَلْدَة', transliteration: 'Al-Baldah', nameLatin: 'Albaldah', bayer: 'π Sagittarii', eclipticLongitude: 274.3, eclipticLatitude: 1.4, magnitude: 2.88, spectralColor: '#fef08a', manzilNumber: 21, constellation: 'Sagittarius' },
  { id: 'dabih', nameArabic: 'سَعْدُ الذَّابِح', transliteration: 'Sa‘d adh-Dhābiḥ', nameLatin: 'Dabih', bayer: 'β Capricorni', eclipticLongitude: 284.1, eclipticLatitude: 4.97, magnitude: 3.05, spectralColor: '#fde047', manzilNumber: 22, constellation: 'Capricornus' },
  { id: 'albali', nameArabic: 'سَعْدُ بُلَع', transliteration: 'Sa‘d Bula‘', nameLatin: 'Albali', bayer: 'ε Aquarii', eclipticLongitude: 301.7, eclipticLatitude: -8.0, magnitude: 3.78, spectralColor: '#e0f2fe', manzilNumber: 23, constellation: 'Aquarius' },
  { id: 'sadalsuud', nameArabic: 'سَعْدُ السُّعُود', transliteration: 'Sa‘d as-Su‘ūd', nameLatin: 'Sadalsuud', bayer: 'β Aquarii', eclipticLongitude: 313.4, eclipticLatitude: 8.6, magnitude: 2.9, spectralColor: '#fef08a', manzilNumber: 24, constellation: 'Aquarius' },
  { id: 'sadachbia', nameArabic: 'سَعْدُ الأَخْبِيَة', transliteration: 'Sa‘d al-Akhbiyah', nameLatin: 'Sadachbia', bayer: 'γ Aquarii', eclipticLongitude: 326.6, eclipticLatitude: -1.7, magnitude: 3.86, spectralColor: '#bae6fd', manzilNumber: 25, constellation: 'Aquarius' },
  { id: 'markab', nameArabic: 'الفَرْغُ المُقَدَّم', transliteration: 'Al-Fargh al-Muqaddam', nameLatin: 'Markab', bayer: 'α Pegasi', eclipticLongitude: 343.5, eclipticLatitude: 19.4, magnitude: 2.49, spectralColor: '#bae6fd', manzilNumber: 26, constellation: 'Pegasus' },
  { id: 'algenib', nameArabic: 'الفَرْغُ المُؤَخَّر', transliteration: 'Al-Fargh al-Mu’akhkhar', nameLatin: 'Algenib', bayer: 'γ Pegasi', eclipticLongitude: 349.2, eclipticLatitude: 12.6, magnitude: 2.84, spectralColor: '#93c5fd', manzilNumber: 27, constellation: 'Pegasus' },
  { id: 'alrescha', nameArabic: 'بَطْنُ الحُوت (الرِّشَاء)', transliteration: 'Baṭn al-Ḥūt / Ar-Rishā’', nameLatin: 'Alrescha', bayer: 'α Piscium', eclipticLongitude: 359.4, eclipticLatitude: 9.05, magnitude: 3.82, spectralColor: '#e0f2fe', manzilNumber: 28, constellation: 'Pisces' },
];

// 12 Classical Zodiac Signs metadata
const ZODIAC_SIGNS_WHEEL = [
  { index: 0, nameLatin: 'Aries', nameArabic: 'الحمل', symbol: '♈', startDeg: 0, endDeg: 30, color: '#f43f5e', element: 'Nar' },
  { index: 1, nameLatin: 'Taurus', nameArabic: 'الثور', symbol: '♉', startDeg: 30, endDeg: 60, color: '#10b981', element: 'Turab' },
  { index: 2, nameLatin: 'Gemini', nameArabic: 'الجوزاء', symbol: '♊', startDeg: 60, endDeg: 90, color: '#0ea5e9', element: 'Hawa' },
  { index: 3, nameLatin: 'Cancer', nameArabic: 'السرطان', symbol: '♋', startDeg: 90, endDeg: 120, color: '#8b5cf6', element: 'Ma' },
  { index: 4, nameLatin: 'Leo', nameArabic: 'الأسد', symbol: '♌', startDeg: 120, endDeg: 150, color: '#f43f5e', element: 'Nar' },
  { index: 5, nameLatin: 'Virgo', nameArabic: 'السنبلة', symbol: '♍', startDeg: 150, endDeg: 180, color: '#10b981', element: 'Turab' },
  { index: 6, nameLatin: 'Libra', nameArabic: 'الميزان', symbol: '♎', startDeg: 180, endDeg: 210, color: '#0ea5e9', element: 'Hawa' },
  { index: 7, nameLatin: 'Scorpio', nameArabic: 'العقرب', symbol: '♏', startDeg: 210, endDeg: 240, color: '#8b5cf6', element: 'Ma' },
  { index: 8, nameLatin: 'Sagittarius', nameArabic: 'القوس', symbol: '♐', startDeg: 240, endDeg: 270, color: '#f43f5e', element: 'Nar' },
  { index: 9, nameLatin: 'Capricorn', nameArabic: 'الجدي', symbol: '♑', startDeg: 270, endDeg: 300, color: '#10b981', element: 'Turab' },
  { index: 10, nameLatin: 'Aquarius', nameArabic: 'الدلو', symbol: '♒', startDeg: 300, endDeg: 330, color: '#0ea5e9', element: 'Hawa' },
  { index: 11, nameLatin: 'Pisces', nameArabic: 'الحوت', symbol: '♓', startDeg: 330, endDeg: 360, color: '#8b5cf6', element: 'Ma' },
];

export const ManzilZodiacCircle: React.FC<ManzilZodiacCircleProps> = ({
  moonPosition,
  allPositions,
  aspects,
  currentDateInfo,
  activeManzilNumber,
  theme,
  onSelectManzil,
  onAnnotateManzil,
  onSelectDateStep,
}) => {
  const isNight = theme === 'night';
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Hovered and inspected manzil state
  const [hoveredManzilNumber, setHoveredManzilNumber] = useState<number | null>(null);
  const [selectedManzilNumber, setSelectedManzilNumber] = useState<number>(activeManzilNumber);
  const [showFixedStars, setShowFixedStars] = useState<boolean>(true);
  const [showOtherPlanets, setShowOtherPlanets] = useState<boolean>(true);
  const [showAspectRays, setShowAspectRays] = useState<boolean>(true);
  const [fortuneFilter, setFortuneFilter] = useState<'all' | 'sad' | 'nahs' | 'high_muhibbah'>('all');
  const [viewMode, setViewMode] = useState<'wheel' | 'split'>('split');

  // Currently active manzil data object
  const activeManzil = useMemo(() => {
    return MANZIL_DETAILED_DATA.find((m: DetailedManzil) => m.number === activeManzilNumber) || MANZIL_DETAILED_DATA[0];
  }, [activeManzilNumber]);

  // Selected manzil data object (defaulting to active or clicked)
  const currentInspectManzil = useMemo(() => {
    const num = hoveredManzilNumber || selectedManzilNumber || activeManzilNumber;
    return MANZIL_DETAILED_DATA.find((m: DetailedManzil) => m.number === num) || activeManzil;
  }, [hoveredManzilNumber, selectedManzilNumber, activeManzilNumber, activeManzil]);

  // Moon's ecliptic longitude (0 - 360 deg)
  const moonLongitude = useMemo(() => {
    const deg = moonPosition.trueLongitude ?? moonPosition.coordinate?.totalDegrees ?? 0;
    return (deg % 360 + 360) % 360;
  }, [moonPosition]);

  const moonSignName = useMemo(() => {
    const sIdx = moonPosition.coordinate?.signIndex ?? 0;
    return ZODIAC_SIGNS_WHEEL[sIdx]?.nameLatin || 'Aries';
  }, [moonPosition]);

  const moonSignDeg = moonPosition.coordinate?.signDegree ?? 0;
  const moonSignMin = moonPosition.coordinate?.minutes ?? 0;

  // Geometry dimensions for SVG circle
  const size = 680;
  const center = size / 2;
  const radiusOuterZodiac = 310;
  const radiusInnerZodiac = 270;
  const radiusOuterManzil = 265;
  const radiusInnerManzil = 205;
  const radiusStarDisk = 195;
  const radiusCenterHub = 65;

  // Helper to convert ecliptic degree (0-360, counterclockwise from East/3 o'clock)
  // We orient 0° Aries at East (angle = 0 in polar coordinates), growing counter-clockwise
  const degreeToPolar = (deg: number, r: number) => {
    const rad = (-deg * Math.PI) / 180; // Negative for standard counter-clockwise astronomical orientation
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };

  // SVG Arc generator helper
  const describeArc = (x: number, y: number, rInner: number, rOuter: number, startAngle: number, endAngle: number) => {
    const radStart = (-startAngle * Math.PI) / 180;
    const radEnd = (-endAngle * Math.PI) / 180;

    const p1 = { x: x + rOuter * Math.cos(radStart), y: y + rOuter * Math.sin(radStart) };
    const p2 = { x: x + rOuter * Math.cos(radEnd), y: y + rOuter * Math.sin(radEnd) };
    const p3 = { x: x + rInner * Math.cos(radEnd), y: y + rInner * Math.sin(radEnd) };
    const p4 = { x: x + rInner * Math.cos(radStart), y: y + rInner * Math.sin(radStart) };

    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? 0 : 1;

    return [
      `M ${p1.x} ${p1.y}`,
      `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 0 ${p2.x} ${p2.y}`,
      `L ${p3.x} ${p3.y}`,
      `A ${rInner} ${rInner} 0 ${largeArcFlag} 1 ${p4.x} ${p4.y}`,
      'Z',
    ].join(' ');
  };

  // Color mapping based on Element
  const getElementColor = (el: DetailedManzil['element'], opacity = 0.25) => {
    switch (el) {
      case 'Nar':
        return `rgba(244, 63, 94, ${opacity})`; // Rose
      case 'Turab':
        return `rgba(16, 185, 129, ${opacity})`; // Emerald
      case 'Hawa':
        return `rgba(14, 165, 233, ${opacity})`; // Sky
      case 'Ma':
        return `rgba(139, 92, 246, ${opacity})`; // Violet
      default:
        return `rgba(197, 154, 67, ${opacity})`;
    }
  };

  // Filter check for a mansion
  const isManzilFiltered = (m: DetailedManzil) => {
    if (fortuneFilter === 'sad') return m.fortune.includes('Sa\'d');
    if (fortuneFilter === 'nahs') return m.fortune.includes('Nahs');
    if (fortuneFilter === 'high_muhibbah') return m.muhibbahScore >= 75;
    return true;
  };

  // Moon coordinates on the disk
  const moonCoord = degreeToPolar(moonLongitude, radiusInnerManzil - 18);
  const moonOuterRay = degreeToPolar(moonLongitude, radiusOuterZodiac + 8);

  // Handle annotation
  const handleAnnotateCurrent = () => {
    if (!onAnnotateManzil) return;
    const m = currentInspectManzil;
    const title = `Telaah Grafis Falak: Manzil ke-${m.number} ${m.transliteration} (${m.arabicName})`;
    const content = `Analisis Lingkaran Zodiak Manzil (Falak 360°):
- Nama Manzil: ${m.number}. ${m.transliteration} (${m.arabicName}) - "${m.meaningId}"
- Busur Zodiak: ${m.zodiacSpan} (${m.startDegree.toFixed(2)}° - ${m.endDegree.toFixed(2)}°)
- Posisi Bulan Saat Ini: ${moonSignName} ${moonSignDeg}° ${moonSignMin}' (Bujur Ekliptika: ${moonLongitude.toFixed(2)}°)
- Hubungan Manzil Aktif: ${m.number === activeManzilNumber ? 'SEDANG DISINGGAHI BULAN (MANZIL AKTIF)' : 'Manzil Sekunder'}
- Derajat Muhibbah: ${m.muhibbahScore} / 100 (${m.muhibbahNature})
- Tabi'at: ${m.temperamentLabel} • Anasir: ${m.elementLabel}
- Khadim & Huruf: ${m.angelicForce} • ${m.abjadLetter}
- Bait Klasik: "${m.classicalVerseArabic}" (${m.classicalVerseTranslation})
- Tanggal Analisis: ${currentDateInfo.gregorian.day}/${currentDateInfo.gregorian.month}/${currentDateInfo.gregorian.year} M (${currentDateInfo.hijri.day} ${currentDateInfo.hijri.monthNameLatin} ${currentDateInfo.hijri.year} H).`;
    onAnnotateManzil(title, content);
  };

  return (
    <div
      id="manzil-zodiac-circle-view"
      className={`rounded-2xl border transition-all duration-300 ${
        isNight
          ? 'bg-[#0f1422]/95 border-[#c59a43]/30 text-[#e6ded0] shadow-2xl'
          : 'bg-[#fcfbf7] border-[#c59a43]/40 text-[#2b2416] shadow-xl'
      }`}
    >
      {/* Top Banner & Control Bar */}
      <div className="p-4 sm:p-6 border-b border-[#c59a43]/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-bold bg-[#c59a43]/20 border border-[#c59a43]/40 text-[#d4af37]">
              FALAK AD-DAWA'IR 360°
            </span>
            <span className="text-xs font-mono opacity-60">
              Bujur Bulan: {moonSignName} {moonSignDeg}° {moonSignMin}' ({moonLongitude.toFixed(2)}°)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#c59a43] flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#c59a43] shrink-0" />
            <span>دَائِرَةُ مَنَازِلِ القَمَرِ وَالكَبَائِرِ الثَّابِتَةِ</span>
          </h2>
          <p className="text-xs sm:text-sm opacity-75 mt-0.5">
            Lingkaran zodiak 28 Manzil &amp; bintang tetap (*Al-Kawakib ath-Thabitah*) berdasarkan hisab ekliptika *Zij as-Sindhind*.
          </p>
        </div>

        {/* Quick Actions & Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Layer toggles */}
          <button
            id="toggle-stars-btn"
            onClick={() => setShowFixedStars(!showFixedStars)}
            className={`px-2.5 py-1.5 rounded-lg border font-mono flex items-center gap-1.5 transition-colors ${
              showFixedStars
                ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#d4af37]'
                : isNight
                ? 'bg-[#182033] border-white/10 opacity-60 text-slate-400'
                : 'bg-stone-200 border-stone-300 opacity-60 text-stone-600'
            }`}
            title="Tampilkan / sembunyikan bintang tetap manzil"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bintang Tetap</span>
          </button>

          <button
            id="toggle-planets-btn"
            onClick={() => setShowOtherPlanets(!showOtherPlanets)}
            className={`px-2.5 py-1.5 rounded-lg border font-mono flex items-center gap-1.5 transition-colors ${
              showOtherPlanets
                ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#d4af37]'
                : isNight
                ? 'bg-[#182033] border-white/10 opacity-60 text-slate-400'
                : 'bg-stone-200 border-stone-300 opacity-60 text-stone-600'
            }`}
            title="Tampilkan posisi planet lain di lingkaran zodiak"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Planet Klasik</span>
          </button>

          <button
            id="toggle-aspects-btn"
            onClick={() => setShowAspectRays(!showAspectRays)}
            className={`px-2.5 py-1.5 rounded-lg border font-mono flex items-center gap-1.5 transition-colors ${
              showAspectRays
                ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#d4af37]'
                : isNight
                ? 'bg-[#182033] border-white/10 opacity-60 text-slate-400'
                : 'bg-stone-200 border-stone-300 opacity-60 text-stone-600'
            }`}
            title="Tampilkan garis sinar aspek kawkab ke Bulan"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sinar Aspek</span>
          </button>

          {/* Time Stepper Buttons */}
          {onSelectDateStep && (
            <div className="flex items-center gap-1 bg-[#c59a43]/10 border border-[#c59a43]/30 rounded-lg p-1">
              <button
                onClick={() => onSelectDateStep(-12)}
                className="px-2 py-1 rounded hover:bg-[#c59a43]/20 text-[#c59a43] transition-colors"
                title="Mundur 12 Jam"
              >
                -12j
              </button>
              <button
                onClick={() => onSelectDateStep(12)}
                className="px-2 py-1 rounded hover:bg-[#c59a43]/20 text-[#c59a43] transition-colors"
                title="Maju 12 Jam"
              >
                +12j
              </button>
              <button
                onClick={() => onSelectDateStep(24)}
                className="px-2 py-1 rounded hover:bg-[#c59a43]/20 text-[#c59a43] font-semibold transition-colors"
                title="Maju 24 Jam (1 Manzil)"
              >
                +24j
              </button>
            </div>
          )}

          {/* Center on Moon */}
          <button
            id="focus-moon-btn"
            onClick={() => setSelectedManzilNumber(activeManzilNumber)}
            className="px-2.5 py-1.5 rounded-lg bg-[#c59a43] text-[#0c0f17] font-semibold hover:bg-[#d4af37] transition-all flex items-center gap-1.5 shadow"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Fokus Bulan</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Workspace (Chart + Side Inspector) */}
      <div className="p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Zodiac Circle Graphical SVG Stage (Col 1 to 7/8) */}
        <div className="xl:col-span-7 flex flex-col items-center justify-center relative">
          {/* Filter Bar above SVG */}
          <div className="w-full flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="opacity-60 font-mono text-[11px]">Filter Sifat:</span>
              <div className="flex rounded-lg border border-[#c59a43]/30 overflow-hidden text-[11px]">
                <button
                  onClick={() => setFortuneFilter('all')}
                  className={`px-2 py-1 transition-colors ${
                    fortuneFilter === 'all'
                      ? 'bg-[#c59a43] text-black font-semibold'
                      : isNight ? 'bg-[#141b2d] hover:bg-white/5' : 'bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  Semua (28)
                </button>
                <button
                  onClick={() => setFortuneFilter('sad')}
                  className={`px-2 py-1 transition-colors ${
                    fortuneFilter === 'sad'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : isNight ? 'bg-[#141b2d] hover:bg-white/5 text-emerald-400' : 'bg-stone-100 text-emerald-700'
                  }`}
                >
                  Sa'd
                </button>
                <button
                  onClick={() => setFortuneFilter('nahs')}
                  className={`px-2 py-1 transition-colors ${
                    fortuneFilter === 'nahs'
                      ? 'bg-rose-600 text-white font-semibold'
                      : isNight ? 'bg-[#141b2d] hover:bg-white/5 text-rose-400' : 'bg-stone-100 text-rose-700'
                  }`}
                >
                  Nahs
                </button>
                <button
                  onClick={() => setFortuneFilter('high_muhibbah')}
                  className={`px-2 py-1 transition-colors ${
                    fortuneFilter === 'high_muhibbah'
                      ? 'bg-amber-600 text-white font-semibold'
                      : isNight ? 'bg-[#141b2d] hover:bg-white/5 text-amber-400' : 'bg-stone-100 text-amber-700'
                  }`}
                >
                  Muhibbah Tinggi (≥75)
                </button>
              </div>
            </div>

            <div className="text-[11px] font-mono opacity-60 hidden sm:block">
              *Klik segmen manzil untuk telaah detail
            </div>
          </div>

          {/* SVG Canvas */}
          <div
            ref={containerRef}
            className="w-full max-w-[620px] aspect-square relative select-none flex items-center justify-center"
          >
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full drop-shadow-2xl overflow-visible"
              aria-label="Lingkaran Falak 28 Manzil dan Zodiak 360 Derajat"
            >
              <defs>
                {/* Center Hub Glow */}
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#0f172a" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="1" />
                </radialGradient>

                {/* Moon Beam Glow */}
                <radialGradient id="moonBeamGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                  <stop offset="40%" stopColor="#facc15" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#c59a43" stopOpacity="0" />
                </radialGradient>

                {/* Active Sector Radiant Highlight */}
                <radialGradient id="activeSectorHighlight" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
                  <stop offset="80%" stopColor="#b45309" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#78350f" stopOpacity="0.05" />
                </radialGradient>

                {/* Glow Filter */}
                <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background circular plate */}
              <circle
                cx={center}
                cy={center}
                r={radiusOuterZodiac + 12}
                fill={isNight ? '#0b0f19' : '#f5f3ec'}
                stroke="#c59a43"
                strokeWidth="1.5"
                strokeOpacity="0.3"
              />

              {/* Background Inner Disc */}
              <circle
                cx={center}
                cy={center}
                r={radiusInnerManzil}
                fill={isNight ? '#070a12' : '#faf8f2'}
                stroke="#c59a43"
                strokeWidth="1"
                strokeDasharray="3 3"
                strokeOpacity="0.25"
              />

              {/* Concentric sky rings */}
              {[45, 90, 135].map((r, i) => (
                <circle
                  key={`sky-ring-${i}`}
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke={isNight ? '#ffffff' : '#000000'}
                  strokeWidth="0.7"
                  strokeOpacity="0.08"
                />
              ))}

              {/* Cross Cardinal Lines (Equinoxes & Solstices: 0°, 90°, 180°, 270°) */}
              {[0, 90, 180, 270].map((deg) => {
                const p1 = degreeToPolar(deg, radiusCenterHub + 5);
                const p2 = degreeToPolar(deg, radiusOuterZodiac + 10);
                return (
                  <line
                    key={`cross-${deg}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#c59a43"
                    strokeWidth="0.8"
                    strokeOpacity="0.2"
                  />
                );
              })}

              {/* ---------------------------------------------------- */}
              {/* 1. OUTER RING: 12 SIGNS OF THE ZODIAC (BURUJ) */}
              {/* ---------------------------------------------------- */}
              {ZODIAC_SIGNS_WHEEL.map((sign) => {
                const arcPath = describeArc(
                  center,
                  center,
                  radiusInnerZodiac,
                  radiusOuterZodiac,
                  sign.startDeg,
                  sign.endDeg
                );
                const midDeg = (sign.startDeg + sign.endDeg) / 2;
                const labelPos = degreeToPolar(midDeg, (radiusInnerZodiac + radiusOuterZodiac) / 2);
                const symbolPos = degreeToPolar(midDeg - 7, (radiusInnerZodiac + radiusOuterZodiac) / 2);

                return (
                  <g key={`zodiac-sign-${sign.index}`} className="zodiac-segment">
                    <path
                      d={arcPath}
                      fill={isNight ? '#131b2e' : '#ede8dc'}
                      stroke="#c59a43"
                      strokeWidth="1"
                      strokeOpacity="0.35"
                      className="transition-colors duration-200"
                    />
                    {/* Zodiac Symbol */}
                    <text
                      x={symbolPos.x}
                      y={symbolPos.y}
                      fill="#d4af37"
                      fontSize="13"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {sign.symbol}
                    </text>
                    {/* Zodiac Latin Name */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      fill={isNight ? '#e2e8f0' : '#475569'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {sign.nameLatin.slice(0, 3).toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* ---------------------------------------------------- */}
              {/* 2. MIDDLE RING: 28 LUNAR MANSIONS (MANAZIL AL-QAMAR) */}
              {/* ---------------------------------------------------- */}
              {MANZIL_DETAILED_DATA.map((m: DetailedManzil) => {
                const isActive = m.number === activeManzilNumber;
                const isSelected = m.number === selectedManzilNumber;
                const isHovered = m.number === hoveredManzilNumber;
                const isMatchFilter = isManzilFiltered(m);

                const arcPath = describeArc(
                  center,
                  center,
                  radiusInnerManzil,
                  radiusOuterManzil,
                  m.startDegree,
                  m.endDegree
                );

                const midDeg = (m.startDegree + m.endDegree) / 2;
                const labelCoord = degreeToPolar(midDeg, (radiusInnerManzil + radiusOuterManzil) / 2);
                const numCoord = degreeToPolar(midDeg - 3.2, radiusOuterManzil - 11);

                // Base fill by status
                let fill = getElementColor(m.element, isNight ? 0.15 : 0.12);
                let stroke = '#c59a43';
                let strokeWidth = 0.8;
                let strokeOpacity = 0.3;

                if (isActive) {
                  fill = 'url(#activeSectorHighlight)';
                  stroke = '#facc15';
                  strokeWidth = 2.5;
                  strokeOpacity = 1;
                } else if (isSelected || isHovered) {
                  fill = 'rgba(197, 154, 67, 0.4)';
                  stroke = '#eab308';
                  strokeWidth = 1.8;
                  strokeOpacity = 0.9;
                }

                if (!isMatchFilter) {
                  fill = isNight ? 'rgba(15, 23, 42, 0.4)' : 'rgba(226, 232, 240, 0.3)';
                  strokeOpacity = 0.1;
                }

                return (
                  <g
                    key={`manzil-sector-${m.number}`}
                    id={`manzil-sector-${m.number}`}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredManzilNumber(m.number)}
                    onMouseLeave={() => setHoveredManzilNumber(null)}
                    onClick={() => {
                      setSelectedManzilNumber(m.number);
                      if (onSelectManzil) onSelectManzil(m);
                    }}
                  >
                    {/* Sector Wedge */}
                    <path
                      d={arcPath}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeOpacity={strokeOpacity}
                      className="hover:opacity-95"
                    />

                    {/* Active Pulsing Indicator Ring */}
                    {isActive && (
                      <circle
                        cx={numCoord.x}
                        cy={numCoord.y}
                        r="6"
                        fill="#eab308"
                        className="animate-pulse"
                        opacity="0.9"
                      />
                    )}

                    {/* Number Badge */}
                    <text
                      x={numCoord.x}
                      y={numCoord.y}
                      fill={isActive ? '#000000' : isNight ? '#e2e8f0' : '#1e293b'}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {m.number}
                    </text>

                    {/* Short Arabic Name */}
                    <text
                      x={labelCoord.x}
                      y={labelCoord.y}
                      fill={
                        isActive
                          ? '#fef08a'
                          : isSelected
                          ? '#facc15'
                          : isNight
                          ? '#cbd5e1'
                          : '#334155'
                      }
                      fontSize="9"
                      fontFamily="serif"
                      fontWeight={isActive || isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                      dominantBaseline="central"
                      opacity={isMatchFilter ? 1 : 0.4}
                      transform={`rotate(${
                        midDeg > 90 && midDeg < 270 ? -midDeg + 180 : -midDeg
                      }, ${labelCoord.x}, ${labelCoord.y})`}
                    >
                      {m.arabicName}
                    </text>
                  </g>
                );
              })}

              {/* ---------------------------------------------------- */}
              {/* 3. INNER CELESTIAL STAGE: FIXED STARS OF THE MANZILS */}
              {/* ---------------------------------------------------- */}
              {showFixedStars && (
                <g className="fixed-stars-layer">
                  {MANZIL_FIXED_STARS.map((star) => {
                    // Star radius in sky disk (offset by latitude)
                    const starDist = radiusStarDisk - 50 + (star.eclipticLatitude || 0) * 3;
                    const pos = degreeToPolar(star.eclipticLongitude, starDist);
                    const isForActive = star.manzilNumber === activeManzilNumber;
                    const isForSelected = star.manzilNumber === selectedManzilNumber;
                    const starSize = Math.max(2.2, 5.5 - star.magnitude * 0.7);

                    return (
                      <g
                        key={`star-${star.id}`}
                        className="transition-all duration-200 cursor-pointer"
                        onClick={() => setSelectedManzilNumber(star.manzilNumber)}
                      >
                        {/* Glow for active or selected manzil star */}
                        {(isForActive || isForSelected) && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={starSize + 4}
                            fill="#d4af37"
                            opacity="0.35"
                            className="animate-ping"
                          />
                        )}

                        {/* Star core dot */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={starSize}
                          fill={isForActive ? '#fef08a' : star.spectralColor}
                          stroke="#000000"
                          strokeWidth="0.5"
                        />

                        {/* Star label for key stars */}
                        {(isForActive || isForSelected || star.magnitude < 2.0) && (
                          <text
                            x={pos.x}
                            y={pos.y - 7}
                            fill={isForActive ? '#facc15' : isNight ? '#94a3b8' : '#475569'}
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="600"
                            textAnchor="middle"
                          >
                            {star.nameLatin}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* ---------------------------------------------------- */}
              {/* 4. OTHER PLANETS LAYER (Sun, Venus, Jupiter, etc.) */}
              {/* ---------------------------------------------------- */}
              {showOtherPlanets && allPositions && (
                <g className="planets-layer">
                  {(
                    Object.keys(allPositions) as PlanetKey[]
                  ).map((pKey) => {
                    if (pKey === 'moon') return null; // Moon has prominent custom rendering
                    const p = allPositions[pKey];
                    if (!p) return null;

                    const pDeg = p.trueLongitude ?? p.coordinate?.totalDegrees ?? 0;
                    const pLong = (pDeg % 360 + 360) % 360;
                    const pos = degreeToPolar(pLong, radiusStarDisk - 25);

                    // Planet symbol & color
                    let pSymbol = '●';
                    let pColor = '#c59a43';
                    if (pKey === 'sun') { pSymbol = '☉'; pColor = '#eab308'; }
                    if (pKey === 'mercury') { pSymbol = '☿'; pColor = '#38bdf8'; }
                    if (pKey === 'venus') { pSymbol = '♀'; pColor = '#ec4899'; }
                    if (pKey === 'mars') { pSymbol = '♂'; pColor = '#ef4444'; }
                    if (pKey === 'jupiter') { pSymbol = '♃'; pColor = '#a855f7'; }
                    if (pKey === 'saturn') { pSymbol = '♄'; pColor = '#f97316'; }
                    if (pKey === 'rahu') { pSymbol = '☊'; pColor = '#94a3b8'; }
                    if (pKey === 'ketu') { pSymbol = '☋'; pColor = '#64748b'; }

                    return (
                      <g key={`planet-dot-${pKey}`}>
                        {/* Radial spoke */}
                        <line
                          x1={center}
                          y1={center}
                          x2={pos.x}
                          y2={pos.y}
                          stroke={pColor}
                          strokeWidth="0.5"
                          strokeDasharray="2 3"
                          strokeOpacity="0.3"
                        />
                        <circle cx={pos.x} cy={pos.y} r="8" fill={isNight ? '#090d16' : '#ffffff'} stroke={pColor} strokeWidth="1" />
                        <text
                          x={pos.x}
                          y={pos.y}
                          fill={pColor}
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="central"
                        >
                          {pSymbol}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* ---------------------------------------------------- */}
              {/* 5. ASPECT RAYS CONNECTING MOON TO OTHER PLANETS */}
              {/* ---------------------------------------------------- */}
              {showAspectRays && aspects && allPositions && (
                <g className="aspect-rays-layer">
                  {aspects
                    .filter((asp) => asp.planetA === 'moon' || asp.planetB === 'moon')
                    .map((asp, idx) => {
                      const otherKey = asp.planetA === 'moon' ? asp.planetB : asp.planetA;
                      const otherPlanet = allPositions[otherKey];
                      if (!otherPlanet) return null;

                      const otherDeg = otherPlanet.trueLongitude ?? otherPlanet.coordinate?.totalDegrees ?? 0;
                      const otherPos = degreeToPolar(
                        (otherDeg % 360 + 360) % 360,
                        radiusStarDisk - 25
                      );

                      const isSaad = asp.aspectType === 'tathlith' || asp.aspectType === 'tasdis';
                      const isNahs = asp.aspectType === 'tarbi' || asp.aspectType === 'muqabalah';
                      const strokeColor = isSaad ? '#10b981' : isNahs ? '#ef4444' : '#eab308';

                      return (
                        <line
                          key={`aspect-ray-${idx}`}
                          x1={moonCoord.x}
                          y1={moonCoord.y}
                          x2={otherPos.x}
                          y2={otherPos.y}
                          stroke={strokeColor}
                          strokeWidth="1.2"
                          strokeDasharray={isNahs ? '4 3' : undefined}
                          strokeOpacity="0.65"
                        />
                      );
                    })}
                </g>
              )}

              {/* ---------------------------------------------------- */}
              {/* 6. PROMINENT CURRENT MOON BEAM & POSITION */}
              {/* ---------------------------------------------------- */}
              {/* Radial Golden Ray to Active Manzil */}
              <line
                x1={center}
                y1={center}
                x2={moonOuterRay.x}
                y2={moonOuterRay.y}
                stroke="#facc15"
                strokeWidth="2"
                strokeOpacity="0.8"
                filter="url(#glowGold)"
              />

              {/* Moon Glowing Halo at Current Degree */}
              <circle
                cx={moonCoord.x}
                cy={moonCoord.y}
                r="18"
                fill="url(#moonBeamGlow)"
              />
              <circle
                cx={moonCoord.x}
                cy={moonCoord.y}
                r="11"
                fill={isNight ? '#1e293b' : '#fef08a'}
                stroke="#facc15"
                strokeWidth="2"
              />
              {/* Crescent Moon Icon */}
              <text
                x={moonCoord.x}
                y={moonCoord.y}
                fill="#eab308"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
              >
                ☽
              </text>

              {/* Degree Callout Badge on Rim */}
              <g transform={`translate(${moonOuterRay.x}, ${moonOuterRay.y})`}>
                <circle r="4" fill="#facc15" />
              </g>

              {/* ---------------------------------------------------- */}
              {/* 7. CENTER HUB: AL-ARD (EARTH) & ASTROLABE MOTIF */}
              {/* ---------------------------------------------------- */}
              <circle
                cx={center}
                cy={center}
                r={radiusCenterHub}
                fill="url(#centerGlow)"
                stroke="#c59a43"
                strokeWidth="2"
              />
              <circle
                cx={center}
                cy={center}
                r={radiusCenterHub - 12}
                fill="none"
                stroke="#c59a43"
                strokeWidth="1"
                strokeDasharray="4 4"
                strokeOpacity="0.4"
              />
              <text
                x={center}
                y={center - 12}
                fill="#d4af37"
                fontSize="13"
                fontFamily="serif"
                fontWeight="bold"
                textAnchor="middle"
              >
                الأَرْضُ
              </text>
              <text
                x={center}
                y={center + 5}
                fill={isNight ? '#94a3b8' : '#475569'}
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                AL-ARD (0,0)
              </text>
              <text
                x={center}
                y={center + 18}
                fill="#eab308"
                fontSize="8"
                fontFamily="mono"
                fontWeight="600"
                textAnchor="middle"
              >
                {moonSignName.slice(0, 3)} {moonSignDeg}°{moonSignMin}'
              </text>
            </svg>

            {/* Quick floating hover indicator tooltip */}
            {hoveredManzilNumber && (
              <div
                className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full border text-xs font-mono shadow-lg pointer-events-none transition-all ${
                  isNight
                    ? 'bg-slate-900/90 border-[#c59a43] text-amber-300'
                    : 'bg-white/95 border-[#c59a43] text-amber-800'
                }`}
              >
                Manzil #{hoveredManzilNumber}: {MANZIL_DETAILED_DATA[hoveredManzilNumber - 1]?.transliteration} ({MANZIL_DETAILED_DATA[hoveredManzilNumber - 1]?.arabicName})
              </div>
            )}
          </div>
        </div>

        {/* Side Detailed Manzil Inspector Card (Col 8 to 12) */}
        <div className="xl:col-span-5 space-y-4">
          <div
            id="manzil-detail-card"
            className={`p-5 rounded-xl border transition-all ${
              isNight
                ? 'bg-[#131b2e]/90 border-[#c59a43]/30 shadow-lg'
                : 'bg-stone-50 border-[#c59a43]/30 shadow'
            }`}
          >
            {/* Header with Active badge */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#c59a43]/20 border border-[#c59a43]/40 text-[#d4af37]">
                    MANZIL #{currentInspectManzil.number} DARI 28
                  </span>
                  {currentInspectManzil.number === activeManzilNumber && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse flex items-center gap-1">
                      <Moon className="w-3 h-3" />
                      <span>BULAN SINGGAH</span>
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#c59a43]">
                  {currentInspectManzil.arabicName}
                </h3>
                <p className="text-sm font-semibold opacity-90">
                  {currentInspectManzil.transliteration} — "{currentInspectManzil.meaningId}"
                </p>
              </div>

              {/* Fortune Badge */}
              <div
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold text-center shrink-0 ${
                  currentInspectManzil.fortune.includes('Sa\'d')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : currentInspectManzil.fortune.includes('Nahs')
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
              >
                <div>{currentInspectManzil.fortuneLabel}</div>
                <div className="text-[10px] opacity-75 font-normal">
                  Skor: {currentInspectManzil.fortuneScore}/100
                </div>
              </div>
            </div>

            {/* Muhibbah / Afinitas Progress Meter */}
            <div className="p-3 rounded-lg bg-[#c59a43]/10 border border-[#c59a43]/20 mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-[#c59a43]">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>DARAJAT AL-MUHIBBAH (AFINITAS KASIH)</span>
                </span>
                <span className="font-mono font-bold text-[#d4af37]">
                  {currentInspectManzil.muhibbahScore} / 100
                </span>
              </div>
              <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-rose-400 to-[#c59a43] transition-all duration-500"
                  style={{ width: `${currentInspectManzil.muhibbahScore}%` }}
                />
              </div>
              <p className="text-xs opacity-80 mt-1.5 italic">
                {currentInspectManzil.muhibbahNature}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
              <div className="p-2 rounded bg-white/5 border border-white/10">
                <span className="text-[10px] opacity-60 block">RENTANG ZODIAK</span>
                <span className="font-semibold text-[#d4af37]">
                  {currentInspectManzil.zodiacSpan}
                </span>
              </div>
              <div className="p-2 rounded bg-white/5 border border-white/10">
                <span className="text-[10px] opacity-60 block">GUGUS BINTANG TETAP</span>
                <span className="font-semibold truncate block" title={currentInspectManzil.starGroup}>
                  {currentInspectManzil.starGroup}
                </span>
              </div>
              <div className="p-2 rounded bg-white/5 border border-white/10">
                <span className="text-[10px] opacity-60 block">TABI'AT &amp; ANASIR</span>
                <span className="font-semibold">
                  {currentInspectManzil.temperamentLabel}
                </span>
              </div>
              <div className="p-2 rounded bg-white/5 border border-white/10">
                <span className="text-[10px] opacity-60 block">KHADIM &amp; HURUF</span>
                <span className="font-semibold text-emerald-400">
                  {currentInspectManzil.angelicForce} ({currentInspectManzil.abjadLetter})
                </span>
              </div>
            </div>

            {/* Recommended & Avoided Actions according to manuscripts */}
            <div className="space-y-2 mb-4 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Aktivitas Dianjurkan (Al-Mustahabb):</span>
                </span>
                <ul className="list-disc list-inside space-y-0.5 opacity-90">
                  {currentInspectManzil.recommendedActions.slice(0, 3).map((act: string, i: number) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="font-bold text-rose-400 flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Aktivitas Dihindari (Al-Makruh):</span>
                </span>
                <ul className="list-disc list-inside space-y-0.5 opacity-90">
                  {currentInspectManzil.avoidedActions.slice(0, 2).map((act: string, i: number) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Classical Poetry Verse */}
            <div className="p-3 rounded-lg bg-[#c59a43]/5 border border-[#c59a43]/20 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#c59a43] block mb-1">
                Bait Syair Klasik (Qasida fi 'Ilm an-Nujum)
              </span>
              <p className="font-serif text-right text-sm text-[#e6ded0] leading-relaxed mb-1 dir-rtl">
                «{currentInspectManzil.classicalVerseArabic}»
              </p>
              <p className="text-xs italic opacity-75">
                "{currentInspectManzil.classicalVerseTranslation}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="annotate-manzil-wheel-btn"
                onClick={handleAnnotateCurrent}
                className="flex-1 py-2 px-3 rounded-lg bg-[#c59a43]/20 border border-[#c59a43]/40 text-[#d4af37] font-semibold text-xs hover:bg-[#c59a43]/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Catat ke Riset</span>
              </button>

              <button
                onClick={() => {
                  if (onSelectManzil) onSelectManzil(currentInspectManzil);
                }}
                className="py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold transition-colors flex items-center gap-1"
                title="Buka telaah komprehensif"
              >
                <span>Detail Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
