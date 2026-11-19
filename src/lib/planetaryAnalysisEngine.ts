/**
 * Historical Planetary Trend Analysis Engine (100-Year Lookback)
 * Computes 100-year historical positions, essential dignities, great conjunctions,
 * and orbital statistics for the 7 classical Kawkab based on Zij as-Sindhind.
 */

import { PlanetKey } from '../types';
import { dateToJdn, jdnToGregorian, jdnToHijri } from './calendarConverter';
import { calculateSindhindPositions, PLANETS_INFO, ZODIAC_SIGNS } from './sindhindEngine';

export type ClassicalKawkabKey =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn';

export const SEVEN_KAWKAB_KEYS: ClassicalKawkabKey[] = [
  'saturn',
  'jupiter',
  'mars',
  'sun',
  'venus',
  'mercury',
  'moon',
];

export interface KawkabVisualMeta {
  key: ClassicalKawkabKey;
  arabicName: string;
  transliteration: string;
  indonesianName: string;
  symbol: string;
  colorNight: string;
  colorParchment: string;
  orbitalPeriodYears: number;
  group: 'upper' | 'luminary' | 'lower';
}

export const KAWKAB_META: Record<ClassicalKawkabKey, KawkabVisualMeta> = {
  saturn: {
    key: 'saturn',
    arabicName: 'زحل',
    transliteration: 'Zuhal',
    indonesianName: 'Saturnus',
    symbol: '♄',
    colorNight: '#a78bfa',
    colorParchment: '#6d28d9',
    orbitalPeriodYears: 29.46,
    group: 'upper',
  },
  jupiter: {
    key: 'jupiter',
    arabicName: 'المشتري',
    transliteration: 'al-Mushtari',
    indonesianName: 'Jupiter',
    symbol: '♃',
    colorNight: '#38bdf8',
    colorParchment: '#0369a1',
    orbitalPeriodYears: 11.86,
    group: 'upper',
  },
  mars: {
    key: 'mars',
    arabicName: 'المريخ',
    transliteration: 'al-Marrikh',
    indonesianName: 'Mars',
    symbol: '♂',
    colorNight: '#fb7185',
    colorParchment: '#be123c',
    orbitalPeriodYears: 1.88,
    group: 'upper',
  },
  sun: {
    key: 'sun',
    arabicName: 'الشمس',
    transliteration: 'ash-Shams',
    indonesianName: 'Matahari',
    symbol: '☉',
    colorNight: '#fbbf24',
    colorParchment: '#b45309',
    orbitalPeriodYears: 1.0,
    group: 'luminary',
  },
  venus: {
    key: 'venus',
    arabicName: 'الزهرة',
    transliteration: 'az-Zuhrah',
    indonesianName: 'Venus',
    symbol: '♀',
    colorNight: '#34d399',
    colorParchment: '#047857',
    orbitalPeriodYears: 0.615,
    group: 'lower',
  },
  mercury: {
    key: 'mercury',
    arabicName: 'عطارد',
    transliteration: "'Utarid",
    indonesianName: 'Merkurius',
    symbol: '☿',
    colorNight: '#22d3ee',
    colorParchment: '#0e7490',
    orbitalPeriodYears: 0.241,
    group: 'lower',
  },
  moon: {
    key: 'moon',
    arabicName: 'القمر',
    transliteration: 'al-Qamar',
    indonesianName: 'Bulan',
    symbol: '☽',
    colorNight: '#e2e8f0',
    colorParchment: '#475569',
    orbitalPeriodYears: 0.0748,
    group: 'luminary',
  },
};

export interface HistoricalPlanetSample {
  longitude: number; // 0..360
  signIndex: number; // 0..11
  signDegree: number; // 0..29
  signMinutes: number; // 0..59
  dignityScore: number;
  dignityLabel: string;
  isCombust: boolean;
  manzilNumber: number;
  manzilName: string;
}

export interface HistoricalEpochPoint {
  index: number;
  jdn: number;
  date: Date;
  decimalYear: number;
  year: number;
  month: number;
  day: number;
  gregorianLabel: string;
  hijriYear: number;
  hijriLabel: string;
  planets: Record<ClassicalKawkabKey, HistoricalPlanetSample>;
  saturnJupiterSeparation: number; // 0..180 deg
}

export interface GreatConjunctionEvent {
  year: number;
  month: number;
  day: number;
  decimalYear: number;
  gregorianLabel: string;
  hijriYear: number;
  hijriLabel: string;
  longitude: number;
  signIndex: number;
  signArabic: string;
  signLatin: string;
  element: string;
  separationDeg: number;
}

export interface KawkabCenturySummary {
  key: ClassicalKawkabKey;
  avgDignity: number;
  maxDignity: number;
  maxDignityYear: number;
  maxDignitySign: string;
  minDignity: number;
  minDignityYear: number;
  dominantSignIndex: number;
  dominantSignLabel: string;
  signDistributionPct: number[];
  combustionRatioPct: number;
  estimatedRevolutions: number;
  latestLongitude: number;
  latestSignLabel: string;
}

export type SamplingCadence = 'quarterly' | 'semiannual' | 'annual';

export interface CenturyPlanetaryDataset {
  startYear: number;
  endYear: number;
  cadence: SamplingCadence;
  points: HistoricalEpochPoint[];
  greatConjunctions: GreatConjunctionEvent[];
  summaries: KawkabCenturySummary[];
}

export function shortestAngularSeparation(lonA: number, lonB: number): number {
  const diff = Math.abs(((lonA - lonB + 540) % 360) - 180);
  return Number(diff.toFixed(2));
}

/**
 * Generates a 100-year historical lookback series ending at the active reference date.
 */
export function generateCenturyPlanetaryAnalysis(params: {
  endYear: number;
  endMonth: number;
  endDay: number;
  latitude: number;
  longitude: number;
  cadence?: SamplingCadence;
  yearsBack?: number;
}): CenturyPlanetaryDataset {
  const {
    endYear,
    endMonth,
    endDay,
    latitude,
    longitude,
    cadence = 'quarterly',
    yearsBack = 100,
  } = params;

  const startYear = endYear - yearsBack;
  const endJdn = dateToJdn(endYear, endMonth, endDay, 12, 0);
  const startJdn = dateToJdn(startYear, endMonth, endDay, 12, 0);

  const stepsPerYear = cadence === 'quarterly' ? 4 : cadence === 'semiannual' ? 2 : 1;
  const totalSteps = yearsBack * stepsPerYear;
  const stepDays = (endJdn - startJdn) / totalSteps;

  const points: HistoricalEpochPoint[] = [];

  for (let i = 0; i <= totalSteps; i++) {
    const jdn = startJdn + i * stepDays;
    const g = jdnToGregorian(jdn);
    const h = jdnToHijri(jdn);
    const chart = calculateSindhindPositions(jdn, latitude, longitude);

    const planets = {} as Record<ClassicalKawkabKey, HistoricalPlanetSample>;
    for (const key of SEVEN_KAWKAB_KEYS) {
      const p = chart.positions[key as PlanetKey];
      planets[key] = {
        longitude: Number(p.trueLongitude.toFixed(2)),
        signIndex: p.coordinate.signIndex,
        signDegree: p.coordinate.signDegree,
        signMinutes: p.coordinate.signDegreeMinutes,
        dignityScore: p.dignity.totalScore,
        dignityLabel: p.dignity.description,
        isCombust: p.isCombust,
        manzilNumber: p.lunarMansion.number,
        manzilName: p.lunarMansion.transliteration,
      };
    }

    const decimalYear = Number((g.year + (g.month - 1) / 12 + (g.day - 1) / 365.25).toFixed(3));
    const dateObj = new Date(Date.UTC(g.year, g.month - 1, g.day, 12, 0, 0));
    // Ensure years < 100 are preserved properly
    dateObj.setUTCFullYear(g.year);

    const satJupSep = shortestAngularSeparation(
      planets.saturn.longitude,
      planets.jupiter.longitude
    );

    points.push({
      index: i,
      jdn,
      date: dateObj,
      decimalYear,
      year: g.year,
      month: g.month,
      day: g.day,
      gregorianLabel: `${String(g.day).padStart(2, '0')}/${String(g.month).padStart(2, '0')}/${g.year} M`,
      hijriYear: h.year,
      hijriLabel: `${h.day} ${h.monthNameLatin} ${h.year} H`,
      planets,
      saturnJupiterSeparation: satJupSep,
    });
  }

  // Detect Saturn-Jupiter Great Conjunctions (local minima of separation <= 14°)
  const greatConjunctions: GreatConjunctionEvent[] = [];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1].saturnJupiterSeparation;
    const curr = points[i].saturnJupiterSeparation;
    const next = points[i + 1].saturnJupiterSeparation;

    if (curr <= prev && curr <= next && curr <= 14) {
      // Refine within +/- 60 days to pinpoint closest Qiran
      let bestJdn = points[i].jdn;
      let bestSep = curr;
      for (let dOffset = -55; dOffset <= 55; dOffset += 5) {
        const testJdn = points[i].jdn + dOffset;
        const testChart = calculateSindhindPositions(testJdn, latitude, longitude);
        const sep = shortestAngularSeparation(
          testChart.positions.saturn.trueLongitude,
          testChart.positions.jupiter.trueLongitude
        );
        if (sep < bestSep) {
          bestSep = sep;
          bestJdn = testJdn;
        }
      }

      const gBest = jdnToGregorian(bestJdn);
      const hBest = jdnToHijri(bestJdn);
      const cBest = calculateSindhindPositions(bestJdn, latitude, longitude);
      const midLon = cBest.positions.saturn.trueLongitude;
      const sign = ZODIAC_SIGNS[cBest.positions.saturn.coordinate.signIndex];

      // Avoid duplicates within 5 years
      const alreadyFound = greatConjunctions.some(
        (ev) => Math.abs(ev.year - gBest.year) < 5
      );
      if (!alreadyFound && bestSep <= 8) {
        greatConjunctions.push({
          year: gBest.year,
          month: gBest.month,
          day: gBest.day,
          decimalYear: Number((gBest.year + (gBest.month - 1) / 12).toFixed(2)),
          gregorianLabel: `${String(gBest.day).padStart(2, '0')}/${String(gBest.month).padStart(2, '0')}/${gBest.year} M`,
          hijriYear: hBest.year,
          hijriLabel: `${hBest.monthNameLatin} ${hBest.year} H`,
          longitude: Number(midLon.toFixed(2)),
          signIndex: sign.index,
          signArabic: sign.arabicName,
          signLatin: sign.latinName,
          element: sign.element,
          separationDeg: Number(bestSep.toFixed(2)),
        });
      }
    }
  }

  // Compute 100-year statistical summary for each of the 7 Kawkab
  const summaries: KawkabCenturySummary[] = SEVEN_KAWKAB_KEYS.map((key) => {
    let dignitySum = 0;
    let maxDignity = -99;
    let maxDignityYear = startYear;
    let maxDignitySignIndex = 0;
    let minDignity = 99;
    let minDignityYear = startYear;
    let combustCount = 0;
    const signHistogram = new Array(12).fill(0);

    for (const pt of points) {
      const sample = pt.planets[key];
      dignitySum += sample.dignityScore;
      signHistogram[sample.signIndex] += 1;
      if (sample.isCombust) combustCount += 1;

      if (sample.dignityScore > maxDignity) {
        maxDignity = sample.dignityScore;
        maxDignityYear = pt.year;
        maxDignitySignIndex = sample.signIndex;
      }
      if (sample.dignityScore < minDignity) {
        minDignity = sample.dignityScore;
        minDignityYear = pt.year;
      }
    }

    let dominantSignIndex = 0;
    for (let s = 1; s < 12; s++) {
      if (signHistogram[s] > signHistogram[dominantSignIndex]) {
        dominantSignIndex = s;
      }
    }

    const latest = points[points.length - 1].planets[key];
    const meta = KAWKAB_META[key];

    const totalSamples = Math.max(1, points.length);
    const signDistributionPct = signHistogram.map((count) =>
      Number(((count / totalSamples) * 100).toFixed(1))
    );

    return {
      key,
      avgDignity: Number((dignitySum / totalSamples).toFixed(2)),
      maxDignity,
      maxDignityYear,
      maxDignitySign: `${ZODIAC_SIGNS[maxDignitySignIndex].symbol} ${ZODIAC_SIGNS[maxDignitySignIndex].latinName}`,
      minDignity,
      minDignityYear,
      dominantSignIndex,
      dominantSignLabel: `${ZODIAC_SIGNS[dominantSignIndex].symbol} ${ZODIAC_SIGNS[dominantSignIndex].latinName}`,
      signDistributionPct,
      combustionRatioPct: Number(((combustCount / totalSamples) * 100).toFixed(1)),
      estimatedRevolutions: Number((yearsBack / meta.orbitalPeriodYears).toFixed(1)),
      latestLongitude: latest.longitude,
      latestSignLabel: `${ZODIAC_SIGNS[latest.signIndex].symbol} ${latest.signDegree}° ${ZODIAC_SIGNS[latest.signIndex].latinName}`,
    };
  });

  return {
    startYear,
    endYear,
    cadence,
    points,
    greatConjunctions,
    summaries,
  };
}

/**
 * Exports the 100-year dataset to CSV for external historical/academic spreadsheet research.
 */
export function exportCenturyDatasetToCsv(dataset: CenturyPlanetaryDataset): string {
  const headers = [
    'Tahun_Masehi',
    'Tanggal_Masehi',
    'Tarikh_Hijriah',
    'JDN',
    ...SEVEN_KAWKAB_KEYS.flatMap((k) => [
      `${PLANETS_INFO[k].transliteration}_LonDeg`,
      `${PLANETS_INFO[k].transliteration}_Buruj`,
      `${PLANETS_INFO[k].transliteration}_Martabat`,
    ]),
    'Separasi_Zuhal_Mushtari_Deg',
  ];

  const rows = dataset.points.map((pt) => [
    pt.year,
    pt.gregorianLabel,
    `"${pt.hijriLabel}"`,
    pt.jdn.toFixed(2),
    ...SEVEN_KAWKAB_KEYS.flatMap((k) => {
      const p = pt.planets[k];
      return [
        p.longitude.toFixed(2),
        ZODIAC_SIGNS[p.signIndex].latinName,
        p.dignityScore,
      ];
    }),
    pt.saturnJupiterSeparation.toFixed(2),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
