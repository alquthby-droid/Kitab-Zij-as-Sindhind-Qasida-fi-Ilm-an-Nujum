/**
/**
 * Ahkam al-Mawlayin: Ancient Astrometeorological Seasonal Weather Forecasting
 * Based on Zij as-Sindhind, Qasida fi 'Ilm an-Nujum, and Al-Kindi's Risalah fi al-Anwa'
 */

import { PlanetKey, PlanetaryPosition, HistoricalDateInfo } from '../types';
import {
  calculateSindhindPositions,
  PLANETS_INFO,
  ZODIAC_SIGNS,
  LUNAR_MANSIONS,
} from './sindhindEngine';
import { dateToJdn, getFullHistoricalDate } from './calendarConverter';

export type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonalForecast {
  seasonKey: SeasonKey;
  seasonArabic: string;
  seasonName: string;
  seasonSubtitle: string;
  cardinalSign: string;
  cardinalDegree: number;
  ingressDate: {
    year: number;
    month: number;
    day: number;
    hijriMonthArabic: string;
    hijriYear: number;
  };
  elementNature: {
    temperamentArabic: string;
    temperamentLatin: string;
    quality: string;
    humorArabic: string; // Khilt (Dam, Safra', Sawda', Balgham)
  };
  mawlaAlFasl: {
    planetKey: PlanetKey;
    arabicName: string;
    transliteration: string;
    role: string;
    temperament: string;
    influenceDescription: string;
  };
  mawlaAlAnwa: {
    planetKey: PlanetKey;
    arabicName: string;
    transliteration: string;
    mansionNumber: number;
    mansionArabic: string;
    mansionTransliteration: string;
    windDirection: string;
    windArabic: string;
  };
  weatherIndices: {
    temperature: {
      value: number; // 0 to 100
      label: string;
      arabic: string;
      level: 'extrem_cold' | 'cold' | 'moderate' | 'hot' | 'extreme_heat';
    };
    precipitation: {
      value: number; // 0 to 100%
      label: string;
      arabic: string;
      rainType: string;
    };
    wind: {
      direction: string;
      directionArabic: string;
      speedLabel: string;
      quality: string;
    };
    gateStatus: {
      isOpen: boolean; // Fath al-Bab
      arabic: string;
      condition: string;
    };
  };
  agriculturalImpact: {
    soilCondition: string;
    cropOutlook: string;
    traditionalAdvice: string;
    arabicVerse: string;
  };
  dominantAspects: {
    planets: string;
    aspectType: string;
    symbol: string;
    meteorologicalEffect: string;
  }[];
}

export interface YearWeatherReport {
  year: number;
  hijriYear: number;
  currentActiveSeason: SeasonKey;
  seasons: Record<SeasonKey, SeasonalForecast>;
  annualSummary: {
    dominantElementalBalance: string;
    rainfallExpectation: string;
    agriculturalSummary: string;
    generalAdvisoryArabic: string;
  };
}

/**
 * Determine which season corresponds to a given solar ecliptic longitude (0-360°)
 */
export function getSeasonFromSunLongitude(sunLongitude: number): SeasonKey {
  const norm = ((sunLongitude % 360) + 360) % 360;
  if (norm >= 0 && norm < 90) return 'spring'; // 0° Aries to 90° Cancer
  if (norm >= 90 && norm < 180) return 'summer'; // 90° Cancer to 180° Libra
  if (norm >= 180 && norm < 270) return 'autumn'; // 180° Libra to 270° Capricorn
  return 'winter'; // 270° Capricorn to 360° Aries
}

/**
 * Approximate ingress Julian Day Numbers for the 4 cardinal solar points for a given Julian/Gregorian year
 */
function getIngressDatesForYear(year: number) {
  // Approximate equinoxes/solstices dates:
  // Spring Equinox: ~March 20/21
  // Summer Solstice: ~June 21/22
  // Autumn Equinox: ~September 22/23
  // Winter Solstice: ~December 21/22
  return {
    spring: { month: 3, day: 21, hour: 12 },
    summer: { month: 6, day: 21, hour: 12 },
    autumn: { month: 9, day: 22, hour: 12 },
    winter: { month: 12, day: 21, hour: 12 },
  };
}

/**
 * Evaluate Mawla al-Fasl (The Primary Seasonal Ingress Planetary Master)
 * In Sindhind: Determined by ruler of the cardinal sign, exaltation, and planets in water/earth/fire/air signs.
 */
function determineMawlaAlFasl(
  season: SeasonKey,
  positions: Record<PlanetKey, PlanetaryPosition>
): SeasonalForecast['mawlaAlFasl'] {
  const mars = positions.mars;
  const saturn = positions.saturn;
  const jupiter = positions.jupiter;
  const venus = positions.venus;
  const mercury = positions.mercury;
  const sun = positions.sun;

  if (season === 'spring') {
    // Spring (Aries ingress) - Natural ruler Mars (Domicile) & Sun (Exaltation), with Jupiter (Air/growth)
    if (jupiter.coordinate.signIndex === 0 || jupiter.coordinate.signIndex === 11) {
      return {
        planetKey: 'jupiter',
        arabicName: PLANETS_INFO.jupiter.arabicName,
        transliteration: PLANETS_INFO.jupiter.transliteration,
        role: 'Penguasa Kesuburan & Kehangatan Bersemi',
        temperament: 'Harr Ratb (Hangat & Lembab Seimbang)',
        influenceDescription: 'Yupiter mendominasi pintu musim semi; memancarkan hawa sejuk bersahabat, hujan berkah (Ghayth), dan pertumbuhan tunas yang subur.',
      };
    }
    return {
      planetKey: 'sun',
      arabicName: PLANETS_INFO.sun.arabicName,
      transliteration: PLANETS_INFO.sun.transliteration,
      role: 'Penguasa Lentera Musim Semi (Syaraf al-Hamal)',
      temperament: 'Harr Yabis (Penggerak Sirkulasi Panas Bumi)',
      influenceDescription: 'Matahari di derajat kemuliaan Aries mencairkan sisa es musim dingin, membangkitkan kehangatan udara dan aliran air tanah.',
    };
  }

  if (season === 'summer') {
    // Summer (Cancer ingress) - Moon (Domicile) & Jupiter (Exaltation), but Mars drives extreme heat
    if (mars.coordinate.signIndex === 4 || mars.coordinate.signIndex === 0) {
      return {
        planetKey: 'mars',
        arabicName: PLANETS_INFO.mars.arabicName,
        transliteration: PLANETS_INFO.mars.transliteration,
        role: 'Pemicu Gelombang Panas & Kemarau Terik',
        temperament: 'Harr Yabis Shadid (Sangat Panas & Kering)',
        influenceDescription: 'Mars mengobarkan gelombang panas (Samum); udara kering menyengat dengan potensi penguapan tinggi dan gersang di padang pasir.',
      };
    }
    return {
      planetKey: 'sun',
      arabicName: PLANETS_INFO.sun.arabicName,
      transliteration: PLANETS_INFO.sun.transliteration,
      role: 'Sultan Musim Panas (Qutb ash-Sharaf)',
      temperament: 'Harr Yabis (Puncak Insolasi Surya)',
      influenceDescription: 'Matahari mencapai deklinasi utara terjauh; siang hari terpanjang dengan kehangatan intensif yang mematangkan bulir gandum dan kurma.',
    };
  }

  if (season === 'autumn') {
    // Autumn (Libra ingress) - Venus (Domicile) & Saturn (Exaltation)
    if (saturn.coordinate.signIndex === 6 || saturn.coordinate.signIndex === 9 || saturn.coordinate.signIndex === 10) {
      return {
        planetKey: 'saturn',
        arabicName: PLANETS_INFO.saturn.arabicName,
        transliteration: PLANETS_INFO.saturn.transliteration,
        role: 'Penguasa Angin Dingin & Pengering Dedaunan',
        temperament: 'Barid Yabis Shadid (Dingin & Kering Membeku)',
        influenceDescription: 'Saturnus berkuasa penuh di ufuk musim gugur; menghadirkan penurunan suhu drastis, kabut kelabu, dan mengeringnya dedaunan.',
      };
    }
    return {
      planetKey: 'venus',
      arabicName: PLANETS_INFO.venus.arabicName,
      transliteration: PLANETS_INFO.venus.transliteration,
      role: 'Penyelaras Hawa Sejuk & Kelembaban Senja',
      temperament: 'Barid Ratb Mu\'tadil (Sejuk Lembab)',
      influenceDescription: 'Venus melembutkan pergantian musim; mendatangkan embun fajar yang tebal dan ketenangan cuaca di peralihan menuju musim dingin.',
    };
  }

  // Winter (Capricorn ingress) - Saturn (Domicile) & Mars (Exaltation)
  if (venus.coordinate.signIndex === 11 || positions.moon.coordinate.signIndex === 3) {
    return {
      planetKey: 'venus',
      arabicName: PLANETS_INFO.venus.arabicName,
      transliteration: PLANETS_INFO.venus.transliteration,
      role: 'Pembawa Hujan Deras & Curahan Air Langit',
      temperament: 'Barid Ratb (Dingin & Sangat Basah)',
      influenceDescription: 'Venus di buruj berair membuka perbendaharaan uap langit; memicu curah hujan lebat beruntun dan melimpahnya mata air.',
    };
  }

  return {
    planetKey: 'saturn',
    arabicName: PLANETS_INFO.saturn.arabicName,
    transliteration: PLANETS_INFO.saturn.transliteration,
    role: 'Penguasa Dingin Beku & Salju Pegunungan',
    temperament: 'Barid Yabis (Puncak Dingin Ekstrem)',
    influenceDescription: 'Saturnus merajai rumah musim dingin (Capricorn); udara membeku, es menutupi permukaan tanah, dan angin utara bertiup menusuk.',
  };
}

/**
 * Determine Mawla al-Anwa' (The Ruler of Wind, Lunar Mansion, and Moisture Gate)
 */
function determineMawlaAlAnwa(
  positions: Record<PlanetKey, PlanetaryPosition>
): SeasonalForecast['mawlaAlAnwa'] {
  const moon = positions.moon;
  const mansionIndex = Math.min(27, Math.floor(moon.trueLongitude / (360 / 28)));
  const mansion = LUNAR_MANSIONS[mansionIndex] || LUNAR_MANSIONS[0];

  // Wind direction determined by mansion element/quadrant
  let windDirection = 'Angin Timur (as-Saba)';
  let windArabic = 'الرِّيَاح الصَّبَا (شرقية مباركة)';
  if (mansionIndex >= 7 && mansionIndex < 14) {
    windDirection = 'Angin Selatan (al-Janub)';
    windArabic = 'الرِّيَاح الجَنُوب (يمانية رطبة حارة)';
  } else if (mansionIndex >= 14 && mansionIndex < 21) {
    windDirection = 'Angin Barat (ad-Dabur)';
    windArabic = 'الرِّيَاح الدَّبُور (غربية بحرية عاصفة)';
  } else if (mansionIndex >= 21) {
    windDirection = 'Angin Utara (ash-Shamal)';
    windArabic = 'الرِّيَاح الشَّمَال (شمالية باردة صافية)';
  }

  // Key moisture / wind controller
  const mercury = positions.mercury;
  const moonSign = positions.moon.coordinate.signIndex;
  const isWaterSign = moonSign === 3 || moonSign === 7 || moonSign === 11;

  const controller: PlanetKey = isWaterSign ? 'moon' : mercury.isRetrograde ? 'mercury' : 'venus';

  return {
    planetKey: controller,
    arabicName: PLANETS_INFO[controller].arabicName,
    transliteration: PLANETS_INFO[controller].transliteration,
    mansionNumber: mansion.number,
    mansionArabic: mansion.arabicName,
    mansionTransliteration: mansion.transliteration,
    windDirection,
    windArabic,
  };
}

/**
 * Calculate detailed meteorological indices for a given seasonal ingress
 */
function computeWeatherIndices(
  season: SeasonKey,
  mawlaFasl: SeasonalForecast['mawlaAlFasl'],
  mawlaAnwa: SeasonalForecast['mawlaAlAnwa'],
  positions: Record<PlanetKey, PlanetaryPosition>
): SeasonalForecast['weatherIndices'] {
  let tempBase = 50;
  let rainBase = 50;

  // Seasonal baselines
  if (season === 'spring') {
    tempBase = 58;
    rainBase = 62;
  } else if (season === 'summer') {
    tempBase = 88;
    rainBase = 18;
  } else if (season === 'autumn') {
    tempBase = 46;
    rainBase = 42;
  } else {
    // winter
    tempBase = 22;
    rainBase = 78;
  }

  // Modify by Mawla al-Fasl
  if (mawlaFasl.planetKey === 'mars') {
    tempBase += 16;
    rainBase -= 22;
  } else if (mawlaFasl.planetKey === 'saturn') {
    tempBase -= 18;
    rainBase -= 8;
  } else if (mawlaFasl.planetKey === 'venus') {
    rainBase += 18;
    tempBase -= 4;
  } else if (mawlaFasl.planetKey === 'jupiter') {
    tempBase += 4;
    rainBase += 12;
  }

  // Modify by Moon & Water signs
  const waterPlanetsCount = Object.values(positions).filter((p) => {
    const s = p.coordinate.signIndex;
    return s === 3 || s === 7 || s === 11; // Cancer, Scorpio, Pisces
  }).length;

  rainBase += waterPlanetsCount * 4;

  const finalTemp = Math.min(98, Math.max(8, tempBase));
  const finalRain = Math.min(98, Math.max(5, rainBase));

  // Gate opening (Fath al-Bab): Happens when Venus/Mercury aspect Saturn or Moon in moist signs
  const isGateOpen = waterPlanetsCount >= 2 || mawlaFasl.planetKey === 'venus';

  let tempLevel: SeasonalForecast['weatherIndices']['temperature']['level'] = 'moderate';
  let tempLabel = 'Sejuk Berimbang (Mu\'tadil)';
  let tempArabic = 'اعتدال في الحرارة والبرودة';

  if (finalTemp >= 80) {
    tempLevel = 'extreme_heat';
    tempLabel = 'Panas Sangat Terik (Harr Shadid)';
    tempArabic = 'حرارة شديدة وسموم ملتهب';
  } else if (finalTemp >= 65) {
    tempLevel = 'hot';
    tempLabel = 'Hangat Menghangatkan (Harr)';
    tempArabic = 'دفء وحرارة مائلة للصيف';
  } else if (finalTemp <= 30) {
    tempLevel = 'extrem_cold';
    tempLabel = 'Sangat Dingin Membeku (Zamharir)';
    tempArabic = 'زمهرير وبرودة شديدة قاسية';
  } else if (finalTemp <= 45) {
    tempLevel = 'cold';
    tempLabel = 'Dingin menusuk (Barid)';
    tempArabic = 'برودة ظاهرة مع صقيع';
  }

  let rainType = 'Hujan Rintik Berkah (Ghayth)';
  let rainArabic = 'أمطار نافعة متفرقة مع ندى غزير';
  if (finalRain >= 75) {
    rainType = 'Hujan Deras Melimpah & Banjir Lembah (Sayl)';
    rainArabic = 'أمطار غزيرة وسيول متتابعة تجري الأودية';
  } else if (finalRain <= 25) {
    rainType = 'Kering & Langit Bersih Tanpa Awan (Qahth)';
    rainArabic = 'قحط وجفاف وصفاء في الجو مع قلة السحاب';
  }

  return {
    temperature: {
      value: finalTemp,
      label: tempLabel,
      arabic: tempArabic,
      level: tempLevel,
    },
    precipitation: {
      value: finalRain,
      label: `${finalRain}% Potensi Presipitasi`,
      arabic: rainArabic,
      rainType,
    },
    wind: {
      direction: mawlaAnwa.windDirection,
      directionArabic: mawlaAnwa.windArabic,
      speedLabel: mawlaAnwa.planetKey === 'mercury' ? 'Kencang Bergolak' : 'Tenang Berhembus',
      quality: 'Membawa uap lembab dari penjuru mata angin penguasa.',
    },
    gateStatus: {
      isOpen: isGateOpen,
      arabic: isGateOpen ? 'بَابُ المَطَرِ مَفْتُوحٌ (Fat-h al-Bab)' : 'بَابُ المَطَرِ مَسْدُودٌ (Insidad)',
      condition: isGateOpen
        ? 'Gerbang uap air langit terbuka: kawkab basah menghadap kutub dingin.'
        : 'Gerbang air tertahan: hawa kering mendominasi atmosfer kubah langit.',
    },
  };
}

/**
 * Generate traditional astrological seasonal forecast for one season
 */
function generateSeasonForecast(
  season: SeasonKey,
  year: number,
  ingressMonth: number,
  ingressDay: number
): SeasonalForecast {
  const jdn = dateToJdn(year, ingressMonth, ingressDay, 12, 0);
  const dateInfo = getFullHistoricalDate(year, ingressMonth, ingressDay, 12, 0);
  const chart = calculateSindhindPositions(jdn, 33.33, 44.42);

  const mawlaFasl = determineMawlaAlFasl(season, chart.positions);
  const mawlaAnwa = determineMawlaAlAnwa(chart.positions);
  const indices = computeWeatherIndices(season, mawlaFasl, mawlaAnwa, chart.positions);

  let seasonArabic = 'فَصْلُ الرَّبِيعِ';
  let seasonName = 'Musim Semi (Ar-Rabi\')';
  let seasonSubtitle = 'Peralihan Siang-Malam Seimbang (I\'tidal Rabi\'i)';
  let cardinalSign = 'Al-Hamal (Aries 0°)';
  let cardinalDegree = 0;
  let tempArabic = 'حَارٌّ رَطْبٌ';
  let tempLatin = 'Panas & Lembab (Harr Ratb)';
  let quality = 'Darah (Dam) - Pembaharuan energi dan kehidupan tunas';
  let humorArabic = 'الدَّمُ (Al-Khilt ad-Damawi)';

  let soilCondition = 'Tanah gembur siap membajak, kelembaban humus optimal.';
  let cropOutlook = 'Tunas gandum, jelai, dan pohon zaitun mulai bersemi subur.';
  let traditionalAdvice = 'Waktu paling utama untuk menanam benih, mencangkok dahan, dan membersihkan saluran air.';
  let arabicVerse = 'إذا دخلت شمس السماء بحملها * تفتقت الأزهار من بعد ذلها';

  if (season === 'summer') {
    seasonArabic = 'فَصْلُ الصَّيْفِ';
    seasonName = 'Musim Panas (As-Sayf)';
    seasonSubtitle = 'Titik Balik Matahari Terjauh di Utara (Inqilab Sayfi)';
    cardinalSign = 'As-Saratan (Cancer 0°)';
    cardinalDegree = 90;
    tempArabic = 'حَارٌّ يَابِسٌ';
    tempLatin = 'Panas & Kering (Harr Yabis)';
    quality = 'Empedu Kuning (Safra\') - Panas pengering dan pematangan buah';
    humorArabic = 'الصَّفْرَاءُ (Al-Khilt as-Safrawi)';
    soilCondition = 'Tanah mengeras, penguapan air permukaan sangat cepat.';
    cropOutlook = 'Pematangan gandum sempurna, buah kurma dan anggur mengental manis.';
    traditionalAdvice = 'Giatkan irigasi malam hari, hindari penggembalaan di terik siang, dan simpan cadangan air sumur.';
    arabicVerse = 'وصيف أتى بالنار والحر ذائبا * لإنضاج أقوات الأنام وعنبها';
  } else if (season === 'autumn') {
    seasonArabic = 'فَصْلُ الخَرِيفِ';
    seasonName = 'Musim Gugur (Al-Kharif)';
    seasonSubtitle = 'Peralihan Menuju Dingin (I\'tidal Kharifi)';
    cardinalSign = 'Al-Mizan (Libra 0°)';
    cardinalDegree = 180;
    tempArabic = 'بَارِدٌ يَابِسٌ';
    tempLatin = 'Dingin & Kering (Barid Yabis)';
    quality = 'Empedu Hitam (Sawda\') - Pengurangan getah tanaman dan hembusan angin kencang';
    humorArabic = 'السَّوْدَاءُ (Al-Khilt as-Sawdawi)';
    soilCondition = 'Tanah mengering dingin, dedaunan gugur menutup lahan.';
    cropOutlook = 'Masa panen akhir selesai, persiapan benih tanaman musim dingin.';
    traditionalAdvice = 'Simpan hasil panen di lumbung kering, perbaiki atap rumah sebelum hujan musim dingin tiba.';
    arabicVerse = 'وخريف تساقطت الأوراق فيه بعزة * فسبحان من أحيا العظام ورمها';
  } else if (season === 'winter') {
    seasonArabic = 'فَصْلُ الشِّتَاءِ';
    seasonName = 'Musim Dingin (Ash-Shita\')';
    seasonSubtitle = 'Titik Balik Terjauh di Selatan & Malam Terpanjang (Inqilab Shatawi)';
    cardinalSign = 'Al-Jady (Capricorn 0°)';
    cardinalDegree = 270;
    tempArabic = 'بَارِدٌ رَطْبٌ';
    tempLatin = 'Dingin & Basah (Barid Ratb)';
    quality = 'Lendir/Flegma (Balgham) - Penyimpanan air bumi dan penumpukan salju pegunungan';
    humorArabic = 'البَلْغَمُ (Al-Khilt al-Balghami)';
    soilCondition = 'Tanah basah jenuh air, rawan genangan dan pembekuan es.';
    cropOutlook = 'Masa dormansi tanaman; akar pohon menguat di kedalaman tanah.';
    traditionalAdvice = 'Lindungi hewan ternak dari terpaan angin utara, rawat saluran drainase agar tidak banjir.';
    arabicVerse = 'شتاء كسا الآفاق ثوبا من الثرى * وأغدق بالماء الزلال وسحبها';
  }

  // Key meteorological aspects
  const dominantAspects = [
    {
      planets: `${mawlaFasl.transliteration} ↔ ${mawlaAnwa.transliteration}`,
      aspectType: 'Koneksi Penguasa Musim & Angin',
      symbol: '☍',
      meteorologicalEffect: `Penyelarasan hawa ${mawlaFasl.temperament} dengan arus angin ${mawlaAnwa.windDirection}.`,
    },
    {
      planets: 'Matahari ↔ Derajat Ingress',
      aspectType: 'Tahwil ash-Shams',
      symbol: '☉',
      meteorologicalEffect: `Pemberian energi termal primer pada busur zodiak ${cardinalSign}.`,
    },
  ];

  return {
    seasonKey: season,
    seasonArabic,
    seasonName,
    seasonSubtitle,
    cardinalSign,
    cardinalDegree,
    ingressDate: {
      year,
      month: ingressMonth,
      day: ingressDay,
      hijriMonthArabic: dateInfo.hijri.monthNameArabic,
      hijriYear: dateInfo.hijri.year,
    },
    elementNature: {
      temperamentArabic: tempArabic,
      temperamentLatin: tempLatin,
      quality,
      humorArabic,
    },
    mawlaAlFasl: mawlaFasl,
    mawlaAlAnwa: mawlaAnwa,
    weatherIndices: indices,
    agriculturalImpact: {
      soilCondition,
      cropOutlook,
      traditionalAdvice,
      arabicVerse,
    },
    dominantAspects,
  };
}

/**
 * Generate full 4-season astrometeorological forecast for a given historical year
 */
export function generateAnnualWeatherReport(
  year: number,
  currentSunLongitude: number
): YearWeatherReport {
  const ingressDates = getIngressDatesForYear(year);

  const spring = generateSeasonForecast('spring', year, ingressDates.spring.month, ingressDates.spring.day);
  const summer = generateSeasonForecast('summer', year, ingressDates.summer.month, ingressDates.summer.day);
  const autumn = generateSeasonForecast('autumn', year, ingressDates.autumn.month, ingressDates.autumn.day);
  const winter = generateSeasonForecast('winter', year, ingressDates.winter.month, ingressDates.winter.day);

  const currentActiveSeason = getSeasonFromSunLongitude(currentSunLongitude);

  // Compute average rain index across 4 seasons
  const avgRain = Math.round(
    (spring.weatherIndices.precipitation.value +
      summer.weatherIndices.precipitation.value +
      autumn.weatherIndices.precipitation.value +
      winter.weatherIndices.precipitation.value) /
      4
  );

  let rainfallExpectation = 'Curah Hujan Tahunan Sedang & Seimbang (Muwazanah)';
  if (avgRain >= 60) {
    rainfallExpectation = 'Tahun Basah Melimpah Air & Hujan Lebat (Sanah Khashibah Mutirah)';
  } else if (avgRain <= 35) {
    rainfallExpectation = 'Tahun Kering dengan Curah Hujan Terbatas (Sanah Qalilat al-Matar)';
  }

  return {
    year,
    hijriYear: spring.ingressDate.hijriYear,
    currentActiveSeason,
    seasons: {
      spring,
      summer,
      autumn,
      winter,
    },
    annualSummary: {
      dominantElementalBalance: 'Peredaran empat unsur (Api, Tanah, Udara, Air) bergulir seimbang mengikuti busur deklinasi Matahari.',
      rainfallExpectation,
      agriculturalSummary: 'Kondisi musim gugur dan musim semi memberikan jendela penanaman optimal dengan resiko badai terkendali.',
      generalAdvisoryArabic: '«مَدَارُ الفُصُولِ بِأَمْرِ اللهِ جَارٍ * وَلِلْكَوْكَبَيْنِ عَلَيْهَا دَلِيلٌ وَمِقْدَارٌ»',
    },
  };
}
