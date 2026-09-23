/**
 * Manzil Calculator Engine
 * Calculates real-time Lunar Mansion status, progress, affinity (muhibbah),
 * temperament (tabi'at), and classical daily action recommendations.
 */

import { PlanetaryPosition, AspectRelation } from '../types';
import { DetailedManzil, MANZIL_DETAILED_DATA } from '../data/manzilDetailedData';
import { calculateSindhindPositions, ZODIAC_SIGNS } from './sindhindEngine';
import { jdnToGregorian, jdnToHijri } from './calendarConverter';

export interface ActiveManzilAnalysis {
  mansion: DetailedManzil;
  mansionIndex: number; // 0 to 27
  mansionNumber: number; // 1 to 28
  moonLongitude: number; // 0 to 360
  degreeInMansion: number; // 0 to 12.8571
  degreeInMansionFormatted: string; // e.g. "07° 25' 18\""
  totalSpanFormatted: string; // e.g. "12° 51' 26\""
  progressPercent: number; // 0 to 100%
  remainingDegree: number;
  remainingDegreeFormatted: string;
  estimatedHoursRemaining: number;
  nextMansion: DetailedManzil;
  dynamicMuhibbahScore: number; // adjusted by planetary aspects & combustion
  muhibbahQuality: 'Sangat Harmonis' | 'Harmonis' | 'Netral / Waspada' | 'Rentan Gesekan';
  influencingAspects: {
    planetKey: string;
    planetName: string;
    aspectType: string;
    isBenefic: boolean;
    effectNote: string;
  }[];
  isCombust: boolean;
  isRetrograde: boolean; // Moon is never retrograde, but good for completeness
  dailyRecommendationSummary: {
    favorable: string[];
    caution: string[];
    dailyAffinityBadge: string;
  };
}

const MANSION_WIDTH = 360 / 28; // ~12.857142857142858°

/**
 * Format decimal degrees into degrees, minutes, seconds string
 */
export function formatDegreesDMS(val: number): string {
  const normalized = Math.max(0, val);
  const deg = Math.floor(normalized);
  const remMinutes = (normalized - deg) * 60;
  const min = Math.floor(remMinutes);
  const sec = Math.round((remMinutes - min) * 60);
  return `${deg.toString().padStart(2, '0')}° ${min.toString().padStart(2, '0')}' ${sec.toString().padStart(2, '0')}"`;
}

/**
 * Calculate active Manzil status from current planetary positions
 */
export function calculateActiveManzil(
  moonPosition: PlanetaryPosition,
  allPositions?: Record<string, PlanetaryPosition>,
  aspects?: AspectRelation[]
): ActiveManzilAnalysis {
  const moonLong = ((moonPosition.trueLongitude % 360) + 360) % 360;
  const mansionIndex = Math.min(27, Math.max(0, Math.floor(moonLong / MANSION_WIDTH)));
  const mansionNumber = mansionIndex + 1;
  const mansion = MANZIL_DETAILED_DATA[mansionIndex];

  const mansionStart = mansionIndex * MANSION_WIDTH;
  const mansionEnd = (mansionIndex + 1) * MANSION_WIDTH;
  const degreeInMansion = moonLong - mansionStart;
  const progressPercent = Math.min(100, Math.max(0, (degreeInMansion / MANSION_WIDTH) * 100));
  const remainingDegree = Math.max(0, mansionEnd - moonLong);

  // Daily motion of moon (typically ~13.176°/day)
  const dailyMotion = moonPosition.dailyMotion > 0 ? moonPosition.dailyMotion : 13.176;
  const hoursRemaining = (remainingDegree / dailyMotion) * 24;

  const nextIndex = (mansionIndex + 1) % 28;
  const nextMansion = MANZIL_DETAILED_DATA[nextIndex];

  // Calculate dynamic Muhibbah (Affinity) score based on aspects and conditions
  let dynamicScore = mansion.muhibbahScore;
  const influencingAspects: ActiveManzilAnalysis['influencingAspects'] = [];

  // Check combustion
  const isCombust = !!moonPosition.isCombust;
  if (isCombust) {
    dynamicScore -= 15;
  }

  // Check aspectual influences on the Moon if provided
  if (aspects && aspects.length > 0) {
    aspects.forEach((asp) => {
      // Find aspects involving the Moon
      if (asp.planetA === 'moon' || asp.planetB === 'moon') {
        const otherKey = asp.planetA === 'moon' ? asp.planetB : asp.planetA;
        const aspectType = asp.aspectType;

        // Trines (Tathlith) and Sextiles (Tasdis) with Benefics boost sympathy
        if (aspectType === 'tathlith' || aspectType === 'tasdis') {
          if (otherKey === 'jupiter') {
            dynamicScore += 12;
            influencingAspects.push({
              planetKey: 'jupiter',
              planetName: 'Yupiter (Al-Musytari)',
              aspectType: `${asp.aspectName} (${asp.aspectArabic})`,
              isBenefic: true,
              effectNote: 'Memancarkan sinar Sa\'d Akbar, melipatgandakan kelimpahan rezeki dan cinta damai.',
            });
          } else if (otherKey === 'venus') {
            dynamicScore += 10;
            influencingAspects.push({
              planetKey: 'venus',
              planetName: 'Venus (Az-Zuharah)',
              aspectType: `${asp.aspectName} (${asp.aspectArabic})`,
              isBenefic: true,
              effectNote: 'Memancarkan kelembutan muhibbah, pesona daya tarik, dan kerukunan asmara.',
            });
          } else if (otherKey === 'sun') {
            dynamicScore += 6;
            influencingAspects.push({
              planetKey: 'sun',
              planetName: 'Matahari (Asy-Syams)',
              aspectType: `${asp.aspectName} (${asp.aspectArabic})`,
              isBenefic: true,
              effectNote: 'Menambah wibawa agung dan kejernihan batin dalam berdiplomasi.',
            });
          }
        }

        // Squares (Tarbī') and Oppositions (Muqābalah) with Malefics add friction
        if (aspectType === 'tarbi' || aspectType === 'muqabalah') {
          if (otherKey === 'saturn') {
            dynamicScore -= 14;
            influencingAspects.push({
              planetKey: 'saturn',
              planetName: 'Saturnus (Zuhal)',
              aspectType: `${asp.aspectName} (${asp.aspectArabic})`,
              isBenefic: false,
              effectNote: 'Tegangan Nahs Akbar: waspadai kedinginan emosi, penundaan hajat, atau rasa ragu.',
            });
          } else if (otherKey === 'mars') {
            dynamicScore -= 12;
            influencingAspects.push({
              planetKey: 'mars',
              planetName: 'Mars (Al-Mirrikh)',
              aspectType: `${asp.aspectName} (${asp.aspectArabic})`,
              isBenefic: false,
              effectNote: 'Tegangan Nahs Asghar: rentan amarah sesaat dan perselisihan verbal.',
            });
          }
        }

        // Conjunctions (Qiran)
        if (aspectType === 'qiran') {
          if (otherKey === 'jupiter' || otherKey === 'venus') {
            dynamicScore += 15;
            influencingAspects.push({
              planetKey: otherKey,
              planetName: otherKey === 'jupiter' ? 'Yupiter' : 'Venus',
              aspectType: `☌ Konjungsi (Iqtiran)`,
              isBenefic: true,
              effectNote: 'Penyatuan berkah agung; doa muhibbah dan kesepakatan sangat didukung naskah klasik.',
            });
          } else if (otherKey === 'saturn' || otherKey === 'mars') {
            dynamicScore -= 15;
            influencingAspects.push({
              planetKey: otherKey,
              planetName: otherKey === 'saturn' ? 'Saturnus' : 'Mars',
              aspectType: `☌ Konjungsi (Iqtiran)`,
              isBenefic: false,
              effectNote: 'Konjungsi planet keras; naskah menyarankan menahan diri dan memperbanyak sedekah.',
            });
          }
        }
      }
    });
  }

  // Constrain dynamic score between 5 and 100
  dynamicScore = Math.min(100, Math.max(5, Math.round(dynamicScore)));

  let muhibbahQuality: ActiveManzilAnalysis['muhibbahQuality'] = 'Netral / Waspada';
  if (dynamicScore >= 85) {
    muhibbahQuality = 'Sangat Harmonis';
  } else if (dynamicScore >= 65) {
    muhibbahQuality = 'Harmonis';
  } else if (dynamicScore <= 35) {
    muhibbahQuality = 'Rentan Gesekan';
  }

  return {
    mansion,
    mansionIndex,
    mansionNumber,
    moonLongitude: moonLong,
    degreeInMansion,
    degreeInMansionFormatted: formatDegreesDMS(degreeInMansion),
    totalSpanFormatted: "12° 51' 26\"",
    progressPercent: Math.round(progressPercent * 10) / 10,
    remainingDegree,
    remainingDegreeFormatted: formatDegreesDMS(remainingDegree),
    estimatedHoursRemaining: Math.round(hoursRemaining * 10) / 10,
    nextMansion,
    dynamicMuhibbahScore: dynamicScore,
    muhibbahQuality,
    influencingAspects,
    isCombust,
    isRetrograde: false,
    dailyRecommendationSummary: {
      favorable: mansion.recommendedActions,
      caution: mansion.avoidedActions,
      dailyAffinityBadge: mansion.primaryAffinities.join(', '),
    },
  };
}

/**
 * Filter mansions by primary affinity category
 */
export function filterMansionsByAffinity(
  affinity: 'all' | 'nikah' | 'tijarah' | 'safar' | 'ziraah' | 'tibb' | 'bina' | 'hikmah'
): DetailedManzil[] {
  if (affinity === 'all') return MANZIL_DETAILED_DATA;
  return MANZIL_DETAILED_DATA.filter((m) => m.primaryAffinities.includes(affinity));
}

/**
 * Find best mansions for specific classical intent
 */
export interface AuspiciousIntent {
  id: string;
  title: string;
  category: string;
  bestMansionNumbers: number[];
  practicalAdvice: string;
}

export const AUSPICIOUS_INTENTS: AuspiciousIntent[] = [
  {
    id: 'nikah_muhibbah',
    title: 'Akad Nikah, Khitbah & Membina Asmara (النكاح والمودة)',
    category: 'Relasi & Cinta',
    bestMansionNumbers: [24, 3, 6, 13, 15, 20, 26, 28],
    practicalAdvice:
      'Pilih hari saat Bulan melintasi Sa\'d as-Su\'ud (#24), Ath-Thurayya (#3), Al-Han\'ah (#6), atau Al-\'Awwa\' (#13). Naskah Qasida fi \'Ilm an-Nujum menegaskan ikatan di manzil ini langgeng, penuh pengertian, dan jauh dari fitnah.',
  },
  {
    id: 'tijarah_perniagaan',
    title: 'Membuka Usaha, Investasi & Dagang (التجارة والربح)',
    category: 'Finansial & Bisnis',
    bestMansionNumbers: [2, 3, 7, 10, 13, 20, 24, 28],
    practicalAdvice:
      'Manzil Al-Buṭayn (#2), Ath-Thurayya (#3), Adh-Dhirā\' (#7), dan Sa\'d as-Su\'ud (#24) membawa berkah berlipat ganda dalam timbangan perniagaan dan kemitraan modal.',
  },
  {
    id: 'safar_perjalanan',
    title: 'Bepergian Jauh, Mudik & Ekspedisi (السفر والترحال)',
    category: 'Mobilitas & Ekspedisi',
    bestMansionNumbers: [1, 5, 7, 11, 14, 20, 26, 28],
    practicalAdvice:
      'Untuk perjalanan darat gunakan Ash-Sharatan (#1), Az-Zubrah (#11), atau An-Na\'aim (#20). Untuk pelayaran laut gunakan Simak al-A\'zal (#14) atau Al-Fargh al-Muqaddam (#26). Hindari Ad-Dabaran (#4) dan Al-Qalb (#18).',
  },
  {
    id: 'bina_properti',
    title: 'Membangun Rumah, Renovasi & Beli Properti (البناء والعقار)',
    category: 'Pondasi & Hunian',
    bestMansionNumbers: [2, 10, 17, 21, 24],
    practicalAdvice:
      'Peletakan batu pertama sangat baik di bawah Al-Baldah (#21), Al-Jabhah (#10), dan Sa\'d as-Su\'ud (#24) agar fondasi bangunan kokoh bertahan turun-temurun.',
  },
  {
    id: 'tibb_pengobatan',
    title: 'Terapi Kesehatan, Bekam & Minum Obat (الطب والعلاج)',
    category: 'Kebugaran & Penyembuhan',
    bestMansionNumbers: [1, 7, 8, 13, 14, 22, 23, 25],
    practicalAdvice:
      'Untuk mengonsumsi ramuan pembersih darah gunakan Ash-Sharatan (#1) atau An-Nathrah (#8). Untuk penyembuhan luka menahun gunakan Sa\'d al-Akhbiyah (#25) atau Simak al-A\'zal (#14).',
  },
  {
    id: 'hikmah_studi',
    title: 'Menuntut Ilmu, Menulis Risalah & Riset (طلب العلم والكتابة)',
    category: 'Intelektual & Ruhani',
    bestMansionNumbers: [5, 7, 10, 15, 21, 24],
    practicalAdvice:
      'Al-Haq\'ah (#5) dan Adh-Dhira\' (#7) mempercepat daya serap pikiran dalam memahami rahasia astronomi, matematika, dan penulisan naskah akademis.',
  },
];

export type ActivityCategoryKey = 'all' | 'nikah' | 'tijarah' | 'safar' | 'ziraah' | 'tibb' | 'bina' | 'hikmah';

export interface ActivityCategoryConfig {
  key: ActivityCategoryKey;
  label: string;
  arabic: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export const ACTIVITY_CATEGORIES: ActivityCategoryConfig[] = [
  {
    key: 'nikah',
    label: 'Pernikahan & Asmara',
    arabic: 'النكاح والمودة',
    description: 'Akad nikah, lamaran, rekonsiliasi keluarga, dan keharmonisan.',
    color: '#f43f5e',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
    badgeText: 'text-rose-400',
  },
  {
    key: 'tijarah',
    label: 'Perniagaan & Finansial',
    arabic: 'التجارة والربح',
    description: 'Membuka usaha, tanda tangan kontrak, investasi, dan laba dagang.',
    color: '#10b981',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-400',
  },
  {
    key: 'safar',
    label: 'Bepergian & Ekspedisi',
    arabic: 'السفر والترحال',
    description: 'Perjalanan darat, pelayaran laut, eksplorasi, dan relokasi.',
    color: '#0ea5e9',
    badgeBg: 'bg-sky-500/10',
    badgeBorder: 'border-sky-500/30',
    badgeText: 'text-sky-400',
  },
  {
    key: 'bina',
    label: 'Pondasi & Properti',
    arabic: 'البناء والعقار',
    description: 'Peletakan batu pertama, renovasi rumah, dan pembelian tanah.',
    color: '#f59e0b',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
  },
  {
    key: 'tibb',
    label: 'Kesehatan & Terapi',
    arabic: 'الطب والعلاج',
    description: 'Pengobatan herbal, bekam, pemulihan fisik, dan terapi batin.',
    color: '#14b8a6',
    badgeBg: 'bg-teal-500/10',
    badgeBorder: 'border-teal-500/30',
    badgeText: 'text-teal-400',
  },
  {
    key: 'hikmah',
    label: 'Keilmuan & Riset',
    arabic: 'طلب العلم والكتابة',
    description: 'Menulis risalah naskah, riset falak/astronomi, dan tafakur.',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-400',
  },
  {
    key: 'ziraah',
    label: 'Agrikultur & Tanam',
    arabic: 'الزراعة والغرس',
    description: 'Penyemaian benih, panen hasil bumi, dan pemeliharaan kebun.',
    color: '#84cc16',
    badgeBg: 'bg-lime-500/10',
    badgeBorder: 'border-lime-500/30',
    badgeText: 'text-lime-400',
  },
];

export interface DailyActivityHistoryPoint {
  dayIndex: number; // 0 (29 days ago) to 29 (current day)
  dayOffset: number; // -29 to 0
  jdn: number;
  gregorian: {
    year: number;
    month: number;
    day: number;
    dateFormatted: string; // e.g. "23 Sep 2026"
    shortDate: string; // e.g. "23/09"
  };
  hijri: {
    year: number;
    month: number;
    day: number;
    monthNameLatin: string;
    monthNameArabic: string;
    formatted: string; // e.g. "11 Rabi' al-Awwal 1448 H"
  };
  moonLongitude: number;
  signNameLatin: string;
  signNameArabic: string;
  signDegree: number;
  signMinute: number;
  mansion: DetailedManzil;
  dynamicMuhibbahScore: number;
  fortuneScore: number; // +2 for Sa'd Mahd, +1 for Sa'd, 0 for Muntasif, -1 for Nahs, -2 for Nahs Mahd
  favorableCount: number;
  avoidedCount: number;
  primaryAffinities: DetailedManzil['primaryAffinities'];
  categoryScores: Record<string, number>; // key -> 0 to 100
  recommendedActions: string[];
  avoidedActions: string[];
  isToday: boolean;
}

export interface ActivityHistorySummary {
  days: DailyActivityHistoryPoint[];
  totalDays: number;
  topRecommendedActions: { action: string; count: number; categoryHints: string[] }[];
  categoryStats: {
    key: string;
    label: string;
    arabic: string;
    color: string;
    daysCount: number;
    avgScore: number;
    peakDay: DailyActivityHistoryPoint | null;
  }[];
  peakAuspiciousDays: DailyActivityHistoryPoint[];
  criticalCautionDays: DailyActivityHistoryPoint[];
  elementDistribution: {
    Nar: number;
    Turab: number;
    Hawa: number;
    Ma: number;
  };
}

const GREG_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Calculate 30-day activity recommendations history leading up to current date
 */
export function calculate30DayActivityHistory(
  currentJdn: number,
  latitude: number = 33.3152,
  longitude: number = 44.3661
): ActivityHistorySummary {
  const days: DailyActivityHistoryPoint[] = [];
  const actionFrequencyMap: Record<string, { count: number; categoryHints: Set<string> }> = {};

  const elementDistribution = {
    Nar: 0,
    Turab: 0,
    Hawa: 0,
    Ma: 0,
  };

  for (let i = 29; i >= 0; i--) {
    const dayOffset = -i;
    const dayJdn = currentJdn + dayOffset;
    const greg = jdnToGregorian(dayJdn);
    const hijri = jdnToHijri(dayJdn);

    const positionsResult = calculateSindhindPositions(dayJdn, latitude, longitude);
    const moonPos = positionsResult.positions.moon;
    const analysis = calculateActiveManzil(moonPos, positionsResult.positions, positionsResult.aspects);
    const mansion = analysis.mansion;

    // Track element
    if (mansion.element in elementDistribution) {
      elementDistribution[mansion.element]++;
    }

    // Fortune numerical mapping
    let fortuneScore = 0;
    let baseScore = 50;
    switch (mansion.fortune) {
      case 'Sa\'d Mahd':
        fortuneScore = 2;
        baseScore = 80;
        break;
      case 'Sa\'d':
        fortuneScore = 1;
        baseScore = 68;
        break;
      case 'Muntasif':
        fortuneScore = 0;
        baseScore = 50;
        break;
      case 'Nahs':
        fortuneScore = -1;
        baseScore = 32;
        break;
      case 'Nahs Mahd':
        fortuneScore = -2;
        baseScore = 18;
        break;
    }

    // Category scores computation for this day
    const categoryScores: Record<string, number> = {};
    ACTIVITY_CATEGORIES.forEach((cat) => {
      let score = baseScore;
      const isAffinity = mansion.primaryAffinities.includes(cat.key as any);
      if (isAffinity) {
        score += 24;
      }
      // Aspect sympathy modulation
      const aspectSympathyMod = (analysis.dynamicMuhibbahScore - 50) * 0.16;
      score += aspectSympathyMod;
      categoryScores[cat.key] = Math.min(100, Math.max(5, Math.round(score)));
    });

    // Record action frequencies
    mansion.recommendedActions.forEach((act) => {
      if (!actionFrequencyMap[act]) {
        actionFrequencyMap[act] = { count: 0, categoryHints: new Set() };
      }
      actionFrequencyMap[act].count += 1;
      mansion.primaryAffinities.forEach((aff) => actionFrequencyMap[act].categoryHints.add(aff));
    });

    const signIdx = moonPos.coordinate?.signIndex ?? Math.floor(moonPos.trueLongitude / 30);
    const sign = ZODIAC_SIGNS[signIdx % 12];
    const signDegree = moonPos.coordinate?.signDegree ?? Math.floor(moonPos.trueLongitude % 30);
    const signMinute = moonPos.coordinate?.minutes ?? Math.floor(((moonPos.trueLongitude % 30) - signDegree) * 60);

    const monthName = GREG_MONTHS_SHORT[greg.month - 1] || `${greg.month}`;
    const dateFormatted = `${greg.day} ${monthName} ${greg.year}`;
    const shortDate = `${greg.day.toString().padStart(2, '0')}/${greg.month.toString().padStart(2, '0')}`;
    const hijriFormatted = `${hijri.day} ${hijri.monthNameLatin} ${hijri.year} H`;

    days.push({
      dayIndex: 29 - i,
      dayOffset,
      jdn: dayJdn,
      gregorian: {
        year: greg.year,
        month: greg.month,
        day: greg.day,
        dateFormatted,
        shortDate,
      },
      hijri: {
        year: hijri.year,
        month: hijri.month,
        day: hijri.day,
        monthNameLatin: hijri.monthNameLatin,
        monthNameArabic: hijri.monthNameArabic,
        formatted: hijriFormatted,
      },
      moonLongitude: moonPos.trueLongitude,
      signNameLatin: sign?.latinName || 'Aries',
      signNameArabic: sign?.arabicName || 'الحمل',
      signDegree,
      signMinute,
      mansion,
      dynamicMuhibbahScore: analysis.dynamicMuhibbahScore,
      fortuneScore,
      favorableCount: mansion.recommendedActions.length,
      avoidedCount: mansion.avoidedActions.length,
      primaryAffinities: mansion.primaryAffinities,
      categoryScores,
      recommendedActions: mansion.recommendedActions,
      avoidedActions: mansion.avoidedActions,
      isToday: i === 0,
    });
  }

  // Top recommended actions across 30 days
  const topRecommendedActions = Object.entries(actionFrequencyMap)
    .map(([action, data]) => ({
      action,
      count: data.count,
      categoryHints: Array.from(data.categoryHints),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Category statistics across 30 days
  const categoryStats = ACTIVITY_CATEGORIES.map((cat) => {
    let totalScore = 0;
    let daysCount = 0;
    let peakDay: DailyActivityHistoryPoint | null = null;
    let peakScore = -1;

    days.forEach((d) => {
      const score = d.categoryScores[cat.key] || 0;
      totalScore += score;
      if (d.primaryAffinities.includes(cat.key as any)) {
        daysCount++;
      }
      if (score > peakScore) {
        peakScore = score;
        peakDay = d;
      }
    });

    const avgScore = Math.round(totalScore / days.length);

    return {
      key: cat.key,
      label: cat.label,
      arabic: cat.arabic,
      color: cat.color,
      daysCount,
      avgScore,
      peakDay,
    };
  });

  const peakAuspiciousDays = days
    .filter((d) => d.mansion.fortune === 'Sa\'d Mahd' || (d.mansion.fortune === 'Sa\'d' && d.dynamicMuhibbahScore >= 75))
    .sort((a, b) => b.dynamicMuhibbahScore - a.dynamicMuhibbahScore)
    .slice(0, 7);

  const criticalCautionDays = days
    .filter((d) => d.mansion.fortune === 'Nahs Mahd' || d.mansion.fortune === 'Nahs')
    .sort((a, b) => a.dynamicMuhibbahScore - b.dynamicMuhibbahScore)
    .slice(0, 6);

  return {
    days,
    totalDays: 30,
    topRecommendedActions,
    categoryStats,
    peakAuspiciousDays,
    criticalCautionDays,
    elementDistribution,
  };
}

