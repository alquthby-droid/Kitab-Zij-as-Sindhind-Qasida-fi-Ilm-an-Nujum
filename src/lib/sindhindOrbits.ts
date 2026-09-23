/**
 * Planetary Orbital Model and Parameters based on Zij as-Sindhind
 * Supports both:
 * 1. Classical Geocentric Model (Al-Falak al-Hamil & Al-Falak at-Tadwir / Deferent & Epicycle)
 * 2. Heliocentric Mathematical Projection (Falak ash-Shams / Planetary semi-major axes & sidereal motions)
 */

export interface SindhindOrbitParams {
  key: string;
  arabicName: string;
  transliteration: string;
  symbol: string;
  color: string;
  trailColor: string;
  radiusAU: number; // Heliocentric semi-major axis (AU)
  siderealPeriodDays: number; // Days for full revolution around Sun (Helio)
  synodicPeriodDays: number; // Synodic loop period
  epicycleRadiusRatio: number; // r/R ratio in Sindhind 60-part deferent system
  epicycleParts: string; // e.g. "39p 30'" in 60-parts system
  equationOfCenterMaxDeg: number; // Max Ta'dil al-Markaz
  equationOfAnomalyMaxDeg: number; // Max Ta'dil al-Khashah
  meanDailyMotionDeg: number; // Degrees per day
  apogeeDeg: number; // Auj (Longitude of Apogee / Aphelion in classical Zij)
  nodePeriodDays?: number;
  traditionalOrder: number; // Order from Earth outwards in Ptolemaic-Sindhind cosmology
  manuscriptNote: string;
}

export const SINDHIND_PLANET_ORBIT_PARAMS: Record<string, SindhindOrbitParams> = {
  moon: {
    key: 'moon',
    arabicName: 'القمر',
    transliteration: 'al-Qamar',
    symbol: '☽',
    color: '#cbd5e1',
    trailColor: 'rgba(203, 213, 225, 0.4)',
    radiusAU: 0.12, // Scaled for visualization relative to Earth
    siderealPeriodDays: 27.32166,
    synodicPeriodDays: 29.53059,
    epicycleRadiusRatio: 5.25 / 60,
    epicycleParts: "5° 15'",
    equationOfCenterMaxDeg: 5.02,
    equationOfAnomalyMaxDeg: 6.29,
    meanDailyMotionDeg: 13.176358,
    apogeeDeg: 110.0,
    traditionalOrder: 1,
    manuscriptNote: 'فلك القمر: أقرب الأفلاك إلى الأرض وأسرعها سيراً في المنازل الثمانية والعشرين.',
  },
  mercury: {
    key: 'mercury',
    arabicName: 'عطارد',
    transliteration: '\'Utarid',
    symbol: '☿',
    color: '#94a3b8',
    trailColor: 'rgba(148, 163, 184, 0.45)',
    radiusAU: 0.3871,
    siderealPeriodDays: 87.969,
    synodicPeriodDays: 115.88,
    epicycleRadiusRatio: 22.5 / 60,
    epicycleParts: "22° 30'",
    equationOfCenterMaxDeg: 4.03,
    equationOfAnomalyMaxDeg: 22.5,
    meanDailyMotionDeg: 4.092334,
    apogeeDeg: 220.0,
    traditionalOrder: 2,
    manuscriptNote: 'فلك عطارد: مركزه مساير للشمس في فلك الحامل، وتدويره يولد الرجوع والاستقامة في حدود 28 درجة.',
  },
  venus: {
    key: 'venus',
    arabicName: 'الزهرة',
    transliteration: 'az-Zuhrah',
    symbol: '♀',
    color: '#34d399',
    trailColor: 'rgba(52, 211, 153, 0.45)',
    radiusAU: 0.7233,
    siderealPeriodDays: 224.701,
    synodicPeriodDays: 583.92,
    epicycleRadiusRatio: 43.16 / 60,
    epicycleParts: "43° 10'",
    equationOfCenterMaxDeg: 2.23,
    equationOfAnomalyMaxDeg: 46.5,
    meanDailyMotionDeg: 1.60213,
    apogeeDeg: 80.0,
    traditionalOrder: 3,
    manuscriptNote: 'فلك الزهرة: السعد الأصغر، نصف قطر تدويرها يقارب 43 جزءاً وهو ما يفسر استطالتها القصوى البالغة 47 درجة.',
  },
  sun: {
    key: 'sun',
    arabicName: 'الشمس',
    transliteration: 'ash-Shams',
    symbol: '☉',
    color: '#fbbf24',
    trailColor: 'rgba(251, 191, 36, 0.5)',
    radiusAU: 1.000,
    siderealPeriodDays: 365.25636,
    synodicPeriodDays: 365.25636,
    epicycleRadiusRatio: 0, // No epicycle in classical theory (only eccentric / falak kharij al-markaz)
    epicycleParts: "0° (خارج المركز)",
    equationOfCenterMaxDeg: 1.914,
    equationOfAnomalyMaxDeg: 0,
    meanDailyMotionDeg: 0.985609,
    apogeeDeg: 77.0, // Auj ash-Shams in Zij as-Sindhind
    traditionalOrder: 4,
    manuscriptNote: 'فلك الشمس: نيرة النهار وقلب الأفلاك، تسير في فلك خارج المركز بمقدار جزأين و14 دقيقة.',
  },
  earth: {
    key: 'earth',
    arabicName: 'الأرض',
    transliteration: 'al-Ardh',
    symbol: '♁',
    color: '#38bdf8',
    trailColor: 'rgba(56, 189, 248, 0.45)',
    radiusAU: 1.000,
    siderealPeriodDays: 365.25636,
    synodicPeriodDays: 365.25636,
    epicycleRadiusRatio: 0,
    epicycleParts: "مركز الرصد",
    equationOfCenterMaxDeg: 1.914,
    equationOfAnomalyMaxDeg: 0,
    meanDailyMotionDeg: 0.985609,
    apogeeDeg: 102.0,
    traditionalOrder: 0,
    manuscriptNote: 'الأرض: مركز الرصد والمشاهدة في علم الهيئة الكلاسيكي، وحولها تدور القبة الفلكية.',
  },
  mars: {
    key: 'mars',
    arabicName: 'المريخ',
    transliteration: 'al-Marrikh',
    symbol: '♂',
    color: '#f87171',
    trailColor: 'rgba(248, 113, 113, 0.45)',
    radiusAU: 1.5237,
    siderealPeriodDays: 686.98,
    synodicPeriodDays: 779.94,
    epicycleRadiusRatio: 39.5 / 60, // 0.658 approx = 1 / 1.524
    epicycleParts: "39° 30'",
    equationOfCenterMaxDeg: 10.69,
    equationOfAnomalyMaxDeg: 41.2,
    meanDailyMotionDeg: 0.524033,
    apogeeDeg: 130.0,
    traditionalOrder: 5,
    manuscriptNote: 'فلك المريخ: النحس الأصغر، تدويره كبير النسبة (39.5/60) مما يسبب رجوعاً واسعاً وقوس احتراق مميزاً.',
  },
  jupiter: {
    key: 'jupiter',
    arabicName: 'المشتري',
    transliteration: 'al-Mushtari',
    symbol: '♃',
    color: '#fb923c',
    trailColor: 'rgba(251, 146, 60, 0.45)',
    radiusAU: 5.2026,
    siderealPeriodDays: 4332.59,
    synodicPeriodDays: 398.88,
    epicycleRadiusRatio: 11.5 / 60, // 0.192 approx = 1 / 5.20
    epicycleParts: "11° 30'",
    equationOfCenterMaxDeg: 5.55,
    equationOfAnomalyMaxDeg: 11.5,
    meanDailyMotionDeg: 0.083091,
    apogeeDeg: 160.0,
    traditionalOrder: 6,
    manuscriptNote: 'فلك المشتري: السعد الأكبر، يستغرق دورانه في البروج قرابة 12 سنة شمسية، وتدويره يمثل 11.5 جزءاً.',
  },
  saturn: {
    key: 'saturn',
    arabicName: 'زحل',
    transliteration: 'Zuhal',
    symbol: '♄',
    color: '#facc15',
    trailColor: 'rgba(250, 204, 21, 0.45)',
    radiusAU: 9.5549,
    siderealPeriodDays: 10759.22,
    synodicPeriodDays: 378.09,
    epicycleRadiusRatio: 6.25 / 60, // 0.104 approx = 1 / 9.58
    epicycleParts: "6° 15'",
    equationOfCenterMaxDeg: 6.35,
    equationOfAnomalyMaxDeg: 6.25,
    meanDailyMotionDeg: 0.033498,
    apogeeDeg: 233.0,
    traditionalOrder: 7,
    manuscriptNote: 'فلك زحل: النحس الأكبر وأعلى الكواكب السبعة السيارة في المنظومة التقليدية، يمكث في كل برج نحو سنتين ونصف.',
  },
};

export interface OrbitCoordinates {
  x: number;
  y: number;
  longitudeDeg: number;
  distanceAU: number;
  // Geocentric specific
  deferentX?: number;
  deferentY?: number;
  epicycleX?: number;
  epicycleY?: number;
  isRetrograde?: boolean;
}

/**
 * Compute heliocentric (x, y) coordinates for a given Julian Day Number (JDN)
 * Based on Zij as-Sindhind mean longitude and anomaly calculations
 */
export function calculateHeliocentricPosition(
  planetKey: string,
  jdn: number
): OrbitCoordinates {
  const d = jdn - 2451545.0; // days since J2000.0
  const T = d / 36525.0;

  let meanLong = 0;
  let semiMajorAxis = 1.0;

  switch (planetKey) {
    case 'mercury':
      semiMajorAxis = 0.3871;
      meanLong = (252.2509 + 149472.6746 * T + (d * 4.092334)) % 360;
      break;
    case 'venus':
      semiMajorAxis = 0.7233;
      meanLong = (181.9798 + 58517.8156 * T + (d * 1.60213)) % 360;
      break;
    case 'earth':
      semiMajorAxis = 1.000;
      meanLong = (280.46646 + 36000.76983 * T) % 360;
      break;
    case 'mars':
      semiMajorAxis = 1.5237;
      meanLong = (355.433 + 19140.299 * T) % 360;
      break;
    case 'jupiter':
      semiMajorAxis = 5.2026;
      meanLong = (34.351 + 3034.906 * T) % 360;
      break;
    case 'saturn':
      semiMajorAxis = 9.5549;
      meanLong = (50.077 + 1222.114 * T) % 360;
      break;
    default:
      semiMajorAxis = 1.0;
      meanLong = 0;
  }

  meanLong = (meanLong + 360000) % 360;
  const rad = (meanLong * Math.PI) / 180;

  return {
    x: semiMajorAxis * Math.cos(rad),
    y: semiMajorAxis * Math.sin(rad),
    longitudeDeg: meanLong,
    distanceAU: semiMajorAxis,
  };
}

/**
 * Compute geocentric (x, y) coordinates showing the Sindhind Deferent & Epicycle geometry
 */
export function calculateGeocentricSindhindPosition(
  planetKey: string,
  jdn: number,
  baseScaleAU: number = 1.0
): OrbitCoordinates {
  const d = jdn - 2451545.0;
  const T = d / 36525.0;

  // Sun's geocentric mean longitude
  const sunMean = (280.46646 + 36000.76983 * T) % 360;
  const sunAnomRad = (((357.52911 + 35999.05029 * T) % 360) * Math.PI) / 180;
  const sunEq = 1.914 * Math.sin(sunAnomRad);
  const sunTrue = (sunMean + sunEq + 360) % 360;

  if (planetKey === 'sun') {
    const sunRad = (sunTrue * Math.PI) / 180;
    const dist = 1.0 * baseScaleAU;
    return {
      x: dist * Math.cos(sunRad),
      y: dist * Math.sin(sunRad),
      longitudeDeg: sunTrue,
      distanceAU: 1.0,
      deferentX: dist * Math.cos(sunRad),
      deferentY: dist * Math.sin(sunRad),
      epicycleX: dist * Math.cos(sunRad),
      epicycleY: dist * Math.sin(sunRad),
      isRetrograde: false,
    };
  }

  if (planetKey === 'moon') {
    const moonMean = (218.3165 + 481267.8813 * T) % 360;
    const moonAnom = (134.9634 + 477198.8675 * T) % 360;
    const moonAnomRad = (moonAnom * Math.PI) / 180;
    const moonEq = 6.289 * Math.sin(moonAnomRad);
    const moonTrue = (moonMean + moonEq + 360) % 360;

    const rDeferent = 0.28 * baseScaleAU;
    const rEpicycle = 0.06 * baseScaleAU;

    const defRad = (moonMean * Math.PI) / 180;
    const defX = rDeferent * Math.cos(defRad);
    const defY = rDeferent * Math.sin(defRad);

    const epiRad = (moonAnom * Math.PI) / 180;
    const pX = defX + rEpicycle * Math.cos(epiRad);
    const pY = defY + rEpicycle * Math.sin(epiRad);

    return {
      x: pX,
      y: pY,
      longitudeDeg: moonTrue,
      distanceAU: Math.sqrt(pX * pX + pY * pY),
      deferentX: defX,
      deferentY: defY,
      epicycleX: pX,
      epicycleY: pY,
      isRetrograde: false,
    };
  }

  // Inferior Planets (Mercury, Venus):
  // Deferent center carries the Mean Sun, while the planet revolves around the epicycle
  if (planetKey === 'mercury' || planetKey === 'venus') {
    const isMerc = planetKey === 'mercury';
    const rDef = isMerc ? 0.45 * baseScaleAU : 0.70 * baseScaleAU;
    const rEpi = isMerc ? 0.17 * baseScaleAU : 0.34 * baseScaleAU;

    // Mean motion of deferent is mean Sun
    const defRad = (sunMean * Math.PI) / 180;
    const defX = rDef * Math.cos(defRad);
    const defY = rDef * Math.sin(defRad);

    // Epicycle anomaly
    const anomDeg = isMerc
      ? ((d * 4.0923344) % 360 + 174.0 + 360) % 360
      : ((d * 1.6021302) % 360 + 50.0 + 360) % 360;
    const anomRad = (anomDeg * Math.PI) / 180;

    const pX = defX + rEpi * Math.cos(defRad + anomRad);
    const pY = defY + rEpi * Math.sin(defRad + anomRad);

    const trueLong = (Math.atan2(pY, pX) * 180) / Math.PI;
    const isRetro = Math.cos(anomRad) < -0.4;

    return {
      x: pX,
      y: pY,
      longitudeDeg: (trueLong + 360) % 360,
      distanceAU: Math.sqrt(pX * pX + pY * pY),
      deferentX: defX,
      deferentY: defY,
      epicycleX: pX,
      epicycleY: pY,
      isRetrograde: isRetro,
    };
  }

  // Superior Planets (Mars, Jupiter, Saturn):
  // Deferent carries the planet's mean orbital motion, while the epicycle radius reflects Earth's motion
  const params = SINDHIND_PLANET_ORBIT_PARAMS[planetKey];
  let rDef = 1.0 * baseScaleAU;
  let rEpi = 0.5 * baseScaleAU;
  let planetMean = 0;

  if (planetKey === 'mars') {
    rDef = 1.25 * baseScaleAU;
    rEpi = 0.65 * baseScaleAU;
    planetMean = (355.433 + 19140.299 * T) % 360;
  } else if (planetKey === 'jupiter') {
    rDef = 1.85 * baseScaleAU;
    rEpi = 0.35 * baseScaleAU;
    planetMean = (34.351 + 3034.906 * T) % 360;
  } else if (planetKey === 'saturn') {
    rDef = 2.45 * baseScaleAU;
    rEpi = 0.25 * baseScaleAU;
    planetMean = (50.077 + 1222.114 * T) % 360;
  }

  planetMean = (planetMean + 360000) % 360;
  const defRad = (planetMean * Math.PI) / 180;
  const defX = rDef * Math.cos(defRad);
  const defY = rDef * Math.sin(defRad);

  // Anomaly angle in epicycle = Sun mean - Planet mean
  const synodicRad = (((sunMean - planetMean + 360000) % 360) * Math.PI) / 180;
  const pX = defX + rEpi * Math.cos(synodicRad);
  const pY = defY + rEpi * Math.sin(synodicRad);

  const trueLong = (Math.atan2(pY, pX) * 180) / Math.PI;
  // Retrograde happens when planet is near opposition to Sun (synodic angle around 180°)
  const angleDiff = Math.abs(((sunMean - planetMean + 180 + 360) % 360) - 180);
  const isRetro = angleDiff < 35;

  return {
    x: pX,
    y: pY,
    longitudeDeg: (trueLong + 360) % 360,
    distanceAU: Math.sqrt(pX * pX + pY * pY),
    deferentX: defX,
    deferentY: defY,
    epicycleX: pX,
    epicycleY: pY,
    isRetrograde: isRetro,
  };
}
