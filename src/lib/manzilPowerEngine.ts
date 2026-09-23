/**
 * Manzil Power & Astrometeorological Annual Trend Engine
 * Computes the 1-year historical/forward cyclical potency of the 28 Lunar Mansions (Manazil al-Qamar)
 * and their cross-sectional impact on seasonal climate (Anwa') and daily activities (Ikhtiyarat).
 * 
 * Based on:
 * - Zij as-Sindhind al-Kabir (Al-Khwarizmi)
 * - Kitab al-Anwa' (Ibn Qutaybah)
 * - Risalah fi al-Anwa' & Ahkam al-Mawlayin (Al-Kindi)
 * - Qasida fi 'Ilm an-Nujum
 */

import { DetailedManzil, MANZIL_DETAILED_DATA } from '../data/manzilDetailedData';
import { LUNAR_MANSIONS, ZODIAC_SIGNS } from './sindhindEngine';
import { jdnToGregorian, jdnToHijri } from './calendarConverter';

export type ActivityPowerCategory = 'composite' | 'climate' | 'ziraah' | 'tijarah' | 'safar' | 'tibb' | 'uqud';

export interface ManzilPowerTrendPoint {
  index: number;
  jdn: number;
  date: Date;
  dateFormatted: string;
  hijriFormatted: string;
  seasonKey: 'spring' | 'summer' | 'autumn' | 'winter';
  seasonName: string;
  seasonArabic: string;
  
  // Moon metrics
  moonLongitude: number;
  manzilIndex: number; // 0 to 27
  manzilNumber: number; // 1 to 28
  manzil: DetailedManzil;
  
  // Calculated power indices (0 - 100)
  compositePowerScore: number;
  climateIndex: number;
  climateLabel: string;
  weatherAnomalyNote: string;
  
  // Daily activity indices
  activityScores: {
    ziraah: number; // Pertanian & Irigasi
    tijarah: number; // Perniagaan & Pasar
    safar: number; // Pelayaran & Perjalanan
    tibb: number; // Kesehatan & Terapi
    uqud: number; // Perjanjian & Diplomasi
  };
  
  // Astrological & Climatic Qualities
  anwaStarName: string;
  fortuneLevel: 'Sa\'d Mahd' | 'Sa\'d' | 'Muntasif' | 'Nahs' | 'Nahs Mahd';
  element: 'Nar' | 'Turab' | 'Hawa' | 'Ma';
  moonPhasePercent: number; // 0 to 100
  moonPhaseName: string;
}

export interface AnnualManzilPowerSummary {
  baseJdn: number;
  yearNumber: number;
  points: ManzilPowerTrendPoint[];
  peakPowerDay: ManzilPowerTrendPoint;
  lowestPowerDay: ManzilPowerTrendPoint;
  averagePowerScore: number;
  dominantBeneficManzil: DetailedManzil;
  seasonSummaries: {
    seasonKey: 'spring' | 'summer' | 'autumn' | 'winter';
    seasonName: string;
    seasonArabic: string;
    avgPower: number;
    avgClimate: number;
    recommendedActivity: string;
  }[];
}

const MANSION_WIDTH = 360 / 28; // ~12.857142857°

/**
 * Calculates seasonal classification based on approximate day of the solar year (relative to spring equinox ~March 21)
 */
function getSeasonFromJdn(jdn: number): {
  seasonKey: 'spring' | 'summer' | 'autumn' | 'winter';
  seasonName: string;
  seasonArabic: string;
} {
  const greg = jdnToGregorian(jdn);
  const m = greg.month;
  const d = greg.day;

  // Spring: March 21 - June 20
  if ((m === 3 && d >= 21) || m === 4 || m === 5 || (m === 6 && d < 21)) {
    return { seasonKey: 'spring', seasonName: 'Musim Semi (ar-Rabi\')', seasonArabic: 'الرَّبِيع' };
  }
  // Summer: June 21 - September 22
  if ((m === 6 && d >= 21) || m === 7 || m === 8 || (m === 9 && d < 23)) {
    return { seasonKey: 'summer', seasonName: 'Musim Panas (as-Saif)', seasonArabic: 'الصَّيْف' };
  }
  // Autumn: September 23 - December 20
  if ((m === 9 && d >= 23) || m === 10 || m === 11 || (m === 12 && d < 21)) {
    return { seasonKey: 'autumn', seasonName: 'Musim Gugur (al-Khareef)', seasonArabic: 'الخَرِيف' };
  }
  // Winter: December 21 - March 20
  return { seasonKey: 'winter', seasonName: 'Musim Dingin (ash-Shita\')', seasonArabic: 'الشِّتَاء' };
}

/**
 * Generates an accurate 365-day annual trend dataset (sampled regularly for maximum smoothness and visual precision in D3)
 * @param centerJdn The Julian Day Number to anchor the 1-year analysis (default covers 365 days up to centerJdn)
 * @param sampleCount Number of samples along the year (e.g. 120 - 180 points for smooth curve and high responsiveness)
 */
export function generateAnnualManzilPowerData(
  centerJdn: number,
  sampleCount: number = 140
): AnnualManzilPowerSummary {
  const startJdn = centerJdn - 365;
  const stepDays = 365 / (sampleCount - 1);
  const points: ManzilPowerTrendPoint[] = [];

  let sumPower = 0;
  const manzilHits: Record<number, number> = {};

  for (let i = 0; i < sampleCount; i++) {
    const curJdn = startJdn + i * stepDays;
    const greg = jdnToGregorian(curJdn);
    const hijri = jdnToHijri(curJdn);
    const dateObj = new Date(Date.UTC(greg.year, greg.month - 1, greg.day, 12, 0, 0));

    // Fast & accurate mean-lunar longitude based on Sindhind ephemeris constants
    // J2000 epoch = 2451545.0, Mean lunar motion = 13.176396° per day
    const daysSinceEpoch = curJdn - 2451545.0;
    const meanMoonLong = ((218.3164 + 13.17639648 * daysSinceEpoch) % 360 + 360) % 360;
    const meanSunLong = ((280.4665 + 0.98564736 * daysSinceEpoch) % 360 + 360) % 360;

    // Lunar anomaly oscillation (equation of center ~ 6.289° * sin(M))
    const lunarAnomaly = ((134.9634 + 13.06499295 * daysSinceEpoch) % 360) * (Math.PI / 180);
    const trueMoonLong = ((meanMoonLong + 6.289 * Math.sin(lunarAnomaly)) % 360 + 360) % 360;

    // Elongation for lunar phase
    const elongation = ((trueMoonLong - meanSunLong) % 360 + 360) % 360;
    const moonPhasePercent = Math.round(((1 - Math.cos((elongation * Math.PI) / 180)) / 2) * 100);

    let moonPhaseName = 'Bulan Sabit (Hilal)';
    if (moonPhasePercent >= 90) moonPhaseName = 'Purnama Penuh (Badr)';
    else if (moonPhasePercent >= 70) moonPhaseName = 'Bulan Cembung (Ahdab)';
    else if (moonPhasePercent >= 40) moonPhaseName = 'Perbani (Tarbi\')';
    else if (moonPhasePercent <= 10) moonPhaseName = 'Bulan Mati (Muhaq)';

    // Mansion identification
    const manzilIndex = Math.min(27, Math.max(0, Math.floor(trueMoonLong / MANSION_WIDTH)));
    const manzilNumber = manzilIndex + 1;
    const manzil = MANZIL_DETAILED_DATA[manzilIndex];

    manzilHits[manzilIndex] = (manzilHits[manzilIndex] || 0) + 1;

    // Season determination
    const season = getSeasonFromJdn(curJdn);

    // Dynamic potency score base from manuscript dignity
    let baseScore = manzil.muhibbahScore; // ~30 - 95

    // Phase synergy bonus: waxing/full moon increases potency
    const phaseModifier = (moonPhasePercent - 50) * 0.15; // -7.5 to +7.5

    // Seasonal harmonization:
    // Fire mansions resonate with Summer; Water mansions with Winter/Spring rains; Earth with Autumn; Air with Spring.
    let seasonalHarmony = 0;
    if (manzil.element === 'Nar' && season.seasonKey === 'summer') seasonalHarmony += 6;
    if (manzil.element === 'Ma' && (season.seasonKey === 'winter' || season.seasonKey === 'spring')) seasonalHarmony += 6;
    if (manzil.element === 'Hawa' && season.seasonKey === 'spring') seasonalHarmony += 5;
    if (manzil.element === 'Turab' && season.seasonKey === 'autumn') seasonalHarmony += 5;

    // Composite Power Score clamped to 15 - 98
    const compositePowerScore = Math.min(98, Math.max(15, Math.round(baseScore + phaseModifier + seasonalHarmony)));
    sumPower += compositePowerScore;

    // Climate Index (Anwa' & meteorological impulse)
    // Water/Air mansions in rain seasons increase precipitation & storm index
    let climateImpulse = 45;
    if (manzil.element === 'Ma') climateImpulse += 30;
    if (manzil.element === 'Hawa') climateImpulse += 15;
    if (manzil.element === 'Nar') climateImpulse -= 15;
    if (season.seasonKey === 'winter' || season.seasonKey === 'spring') climateImpulse += 10;
    const climateIndex = Math.min(100, Math.max(10, Math.round(climateImpulse + (moonPhasePercent / 100) * 10)));

    let climateLabel = 'Cuaca Seimbang & Sedang';
    let weatherAnomalyNote = 'Sirkulasi angin normal dan suhu musiman stabil.';
    if (climateIndex > 75) {
      climateLabel = 'Potensi Hujan Lebat (Wasmi / Amtar)';
      weatherAnomalyNote = 'Kondisi lembap tinggi, awan tebal dan embun pagi melimpah.';
    } else if (climateIndex < 35) {
      climateLabel = 'Kering & Terik (Samum / Qait)';
      weatherAnomalyNote = 'Hawa panas kering mendominasi, penguapan tanah tinggi.';
    } else if (manzil.element === 'Hawa') {
      climateLabel = 'Angin Dinamis (Riyah)';
      weatherAnomalyNote = 'Hembusan angin sejuk bertiup dari ufuk timur-utara.';
    }

    // Daily Activities (Ikhtiyarat) specialized scores
    const activityScores = {
      ziraah: Math.min(98, Math.max(15, Math.round(baseScore * 0.5 + climateIndex * 0.4 + (manzil.element === 'Turab' || manzil.element === 'Ma' ? 15 : 0)))),
      tijarah: Math.min(98, Math.max(15, Math.round(baseScore * 0.7 + (manzil.fortune === 'Sa\'d' || manzil.fortune === 'Sa\'d Mahd' ? 20 : 0)))),
      safar: Math.min(98, Math.max(15, Math.round(baseScore * 0.6 + (climateIndex < 65 ? 15 : -15) + (manzil.element === 'Hawa' ? 10 : 0)))),
      tibb: Math.min(98, Math.max(15, Math.round(baseScore * 0.6 + (moonPhasePercent >= 50 && moonPhasePercent <= 80 ? 20 : 5)))),
      uqud: Math.min(98, Math.max(15, Math.round(baseScore * 0.8 + (manzil.fortune === 'Sa\'d Mahd' ? 18 : 0)))),
    };

    const dateFormatted = `${greg.day} ${new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(dateObj)} ${greg.year}`;
    const hijriFormatted = `${hijri.day} ${hijri.monthNameLatin.substring(0, 10)} ${hijri.year} H`;

    points.push({
      index: i,
      jdn: curJdn,
      date: dateObj,
      dateFormatted,
      hijriFormatted,
      seasonKey: season.seasonKey,
      seasonName: season.seasonName,
      seasonArabic: season.seasonArabic,
      moonLongitude: trueMoonLong,
      manzilIndex,
      manzilNumber,
      manzil,
      compositePowerScore,
      climateIndex,
      climateLabel,
      weatherAnomalyNote,
      activityScores,
      anwaStarName: manzil.starGroup || manzil.transliteration,
      fortuneLevel: manzil.fortune,
      element: manzil.element,
      moonPhasePercent,
      moonPhaseName,
    });
  }

  // Find peak and lowest points
  let peakPowerDay = points[0];
  let lowestPowerDay = points[0];

  points.forEach((p) => {
    if (p.compositePowerScore > peakPowerDay.compositePowerScore) {
      peakPowerDay = p;
    }
    if (p.compositePowerScore < lowestPowerDay.compositePowerScore) {
      lowestPowerDay = p;
    }
  });

  const averagePowerScore = Math.round(sumPower / points.length);

  // Dominant benefic manzil based on frequency and score
  const dominantBeneficManzil = MANZIL_DETAILED_DATA[peakPowerDay.manzilIndex] || MANZIL_DETAILED_DATA[0];

  // Group seasonal summaries
  const seasonsMap: Record<string, { totalP: number; totalC: number; count: number }> = {
    spring: { totalP: 0, totalC: 0, count: 0 },
    summer: { totalP: 0, totalC: 0, count: 0 },
    autumn: { totalP: 0, totalC: 0, count: 0 },
    winter: { totalP: 0, totalC: 0, count: 0 },
  };

  points.forEach((p) => {
    const s = seasonsMap[p.seasonKey];
    if (s) {
      s.totalP += p.compositePowerScore;
      s.totalC += p.climateIndex;
      s.count++;
    }
  });

  const seasonSummaries: AnnualManzilPowerSummary['seasonSummaries'] = [
    {
      seasonKey: 'spring',
      seasonName: 'Musim Semi (ar-Rabi\')',
      seasonArabic: 'الرَّبِيع',
      avgPower: seasonsMap.spring.count > 0 ? Math.round(seasonsMap.spring.totalP / seasonsMap.spring.count) : 70,
      avgClimate: seasonsMap.spring.count > 0 ? Math.round(seasonsMap.spring.totalC / seasonsMap.spring.count) : 65,
      recommendedActivity: 'Pertanian & Ekspedisi Perniagaan',
    },
    {
      seasonKey: 'summer',
      seasonName: 'Musim Panas (as-Saif)',
      seasonArabic: 'الصَّيْف',
      avgPower: seasonsMap.summer.count > 0 ? Math.round(seasonsMap.summer.totalP / seasonsMap.summer.count) : 68,
      avgClimate: seasonsMap.summer.count > 0 ? Math.round(seasonsMap.summer.totalC / seasonsMap.summer.count) : 38,
      recommendedActivity: 'Pelayaran Laut & Terapi Kebugaran',
    },
    {
      seasonKey: 'autumn',
      seasonName: 'Musim Gugur (al-Khareef)',
      seasonArabic: 'الخَرِيف',
      avgPower: seasonsMap.autumn.count > 0 ? Math.round(seasonsMap.autumn.totalP / seasonsMap.autumn.count) : 64,
      avgClimate: seasonsMap.autumn.count > 0 ? Math.round(seasonsMap.autumn.totalC / seasonsMap.autumn.count) : 48,
      recommendedActivity: 'Perjanjian Kontrak & Panen Hasil Bumi',
    },
    {
      seasonKey: 'winter',
      seasonName: 'Musim Dingin (ash-Shita\')',
      seasonArabic: 'الشِّتَاء',
      avgPower: seasonsMap.winter.count > 0 ? Math.round(seasonsMap.winter.totalP / seasonsMap.winter.count) : 62,
      avgClimate: seasonsMap.winter.count > 0 ? Math.round(seasonsMap.winter.totalC / seasonsMap.winter.count) : 74,
      recommendedActivity: 'Pengolahan Tanah & Perencanaan Riset',
    },
  ];

  const currentGreg = jdnToGregorian(centerJdn);

  return {
    baseJdn: centerJdn,
    yearNumber: currentGreg.year,
    points,
    peakPowerDay,
    lowestPowerDay,
    averagePowerScore,
    dominantBeneficManzil,
    seasonSummaries,
  };
}
