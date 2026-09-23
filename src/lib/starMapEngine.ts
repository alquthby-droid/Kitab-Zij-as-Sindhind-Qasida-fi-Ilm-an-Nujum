/**
 * Star Map & Astrometry Engine for Zij as-Sindhind
 * Local Sky Dome (Alt-Azimuth / Stereographic Horizon) & Ecliptic Projections
 * Aligned with classical Arabic astronomy and 28 Lunar Mansions (Manazil al-Qamar)
 */

import { PlanetKey, PlanetaryPosition } from '../types';
import { LUNAR_MANSIONS, PLANETS_INFO } from './sindhindEngine';

export interface ObserverLocation {
  id: string;
  name: string;
  arabicName: string;
  latitude: number; // degrees north (+), south (-)
  longitude: number; // degrees east (+), west (-)
  elevationMeters?: number;
  description: string;
  era?: string;
}

export const HISTORICAL_OBSERVATORIES: ObserverLocation[] = [
  {
    id: 'baghdad',
    name: 'Baghdad (Bayt al-Hikmah)',
    arabicName: 'بَغْدَاد (دَارُ الخِلَافَةِ)',
    latitude: 33.3152,
    longitude: 44.3661,
    description: 'Pusat observatorium resmi Khalifah Al-Ma\'mun dan tempat penyusunan Zij as-Sindhind oleh Al-Khwarizmi.',
    era: '145 - 218 H / 762 - 833 M',
  },
  {
    id: 'arin',
    name: 'Arin / Ujjain (Sindhind Prime Meridian)',
    arabicName: 'قُبَّةُ الأَرْضِ (أُوذَيْن)',
    latitude: 23.1765,
    longitude: 75.7772,
    description: 'Titik nol meridian bumi purba menurut tradisi ilmiah Sanskerta dan risalah Zij as-Sindhind al-Kabir.',
    era: 'Era Siddhanta & Brahmagupta (~628 M)',
  },
  {
    id: 'rayy',
    name: 'Ar-Rayy / Teheran',
    arabicName: 'الرَّيُّ (فَارِس)',
    latitude: 35.5900,
    longitude: 51.4400,
    description: 'Kota observasi astronom legendaris Abd al-Rahman as-Sufi (penulis Suwar al-Kawakib) dan Al-Khujandi.',
    era: 'Abad ke-4 H / Abad ke-10 M',
  },
  {
    id: 'damascus',
    name: 'Damaskus (Observatorium Jabal Qasiyun)',
    arabicName: 'دِمَشْق (جَبَل قَاسِيُون)',
    latitude: 33.5138,
    longitude: 36.2765,
    description: 'Observatorium resmi Dinasti Abbasiyah untuk mengukur kemiringan ekliptika dan peredaran Matahari.',
    era: 'Abad ke-3 H / Abad ke-9 M',
  },
  {
    id: 'cairo',
    name: 'Al-Qahirah / Fustat',
    arabicName: 'القَاهِرَة (الفُسْطَاط)',
    latitude: 30.0444,
    longitude: 31.2357,
    description: 'Pusat observasi astronom Mesir Ibn Yunus (penyusun az-Zij al-Kabir al-Hakimi).',
    era: 'Abad ke-4 H / Abad ke-10 M',
  },
  {
    id: 'cordoba',
    name: 'Qurtubah / Cordoba (Andalusia)',
    arabicName: 'قُرْطُبَة (الأَنْدَلُس)',
    latitude: 37.8882,
    longitude: -4.7794,
    description: 'Pusat transmisi sains Sindhind ke Barat oleh Maslama al-Majriti dan Abu Ishaq az-Zarqali.',
    era: 'Abad ke-4 s.d. 5 H / Abad 10-11 M',
  },
  {
    id: 'mecca',
    name: 'Makkah al-Mukarramah',
    arabicName: 'مَكَّةُ المُكَرَّمَةُ',
    latitude: 21.3891,
    longitude: 39.8579,
    description: 'Pusat arah kiblat umat Islam dan acuan hisab penentuan awal bulan kamariah dunia.',
    era: 'Pusat Kiblat Falak',
  },
  {
    id: 'jakarta',
    name: 'Jakarta (Nusantara / Jawa)',
    arabicName: 'جَاكَرْتَا (إِنْدُونِيسِيَا)',
    latitude: -6.2088,
    longitude: 106.8456,
    description: 'Koordinat lokal khatulistiwa belahan bumi selatan untuk pengamatan langit modern Indonesia.',
    era: 'Koordinat Kontemporer',
  },
];

export interface FixedStar {
  id: string;
  nameArabic: string;
  transliteration: string;
  nameLatin: string;
  bayer: string;
  constellation: string;
  constellationArabic: string;
  raHours: number; // Right Ascension in hours (0 to 24)
  decDeg: number; // Declination in degrees (-90 to +90)
  magnitude: number;
  spectralColor: string;
  classicalDescription: string;
  isManzilMarker?: boolean;
  manzilNumber?: number;
}

/**
 * 32 Major Classical Navigation Stars (Al-Kawakib ath-Thabitah)
 * from Suwar al-Kawakib (Abd al-Rahman as-Sufi, 964 CE) and Zij as-Sindhind
 */
export const CLASSICAL_FIXED_STARS: FixedStar[] = [
  {
    id: 'sirius',
    nameArabic: 'الشِّعْرَى اليَمَانِيَّةُ',
    transliteration: 'Ash-Shi‘rā al-Yamāniyyah',
    nameLatin: 'Sirius',
    bayer: 'α Canis Majoris',
    constellation: 'Canis Major',
    constellationArabic: 'الكلب الأكبر',
    raHours: 6.7525,
    decDeg: -16.7161,
    magnitude: -1.46,
    spectralColor: '#a6c8ff',
    classicalDescription: 'Bintang paling cemerlang di seluruh kubah langit, penanda datangnya puncak musim panas dan hawa Samum.',
  },
  {
    id: 'canopus',
    nameArabic: 'سُهَيْلُ اليَمَانِي',
    transliteration: 'Suhayl al-Yamānī',
    nameLatin: 'Canopus',
    bayer: 'α Carinae',
    constellation: 'Carina',
    constellationArabic: 'السفينة',
    raHours: 6.3992,
    decDeg: -52.6957,
    magnitude: -0.74,
    spectralColor: '#f8fafc',
    classicalDescription: 'Penuntun arah kiblat dan penunjuk arah selatan utama bagi kafilah padang pasir dan pelaut samudra.',
  },
  {
    id: 'arcturus',
    nameArabic: 'السِّمَاكُ الرَّامِحُ',
    transliteration: 'As-Simāk ar-Rāmiḥ',
    nameLatin: 'Arcturus',
    bayer: 'α Boötis',
    constellation: 'Boötes',
    constellationArabic: 'العواء / حارس السماء',
    raHours: 14.2611,
    decDeg: 19.1822,
    magnitude: -0.05,
    spectralColor: '#fdba74',
    classicalDescription: 'Sang Penombak Langit berwana jingga emas, berpasangan dengan Simak al-A\'zal (Spica).',
  },
  {
    id: 'vega',
    nameArabic: 'النَّسْرُ الوَاقِعُ',
    transliteration: 'An-Nasr al-Wāqi‘',
    nameLatin: 'Vega',
    bayer: 'α Lyrae',
    constellation: 'Lyra',
    constellationArabic: 'السلحفاة / اللورا',
    raHours: 18.6156,
    decDeg: 38.7836,
    magnitude: 0.03,
    spectralColor: '#bae6fd',
    classicalDescription: 'Rajawali yang sedang menukik melipat sayapnya, salah satu dari tiga pilar Segitiga Musim Panas kuno.',
  },
  {
    id: 'capella',
    nameArabic: 'العَيُّوقُ',
    transliteration: 'Al-‘Ayyūq',
    nameLatin: 'Capella',
    bayer: 'α Aurigae',
    constellation: 'Auriga',
    constellationArabic: 'ممسك الأعنة',
    raHours: 5.2781,
    decDeg: 45.998,
    magnitude: 0.08,
    spectralColor: '#fef08a',
    classicalDescription: 'Sang Penjaga Bintang Thurayya (Pleiades), selalu terbit mendahului dan mengawal gugusan bintang kembar.',
  },
  {
    id: 'rigel',
    nameArabic: 'رِجْلُ الجَوْزَاءِ اليُسْرَى',
    transliteration: 'Rijl al-Jawzā’',
    nameLatin: 'Rigel',
    bayer: 'β Orionis',
    constellation: 'Orion',
    constellationArabic: 'الجبار / الجوزاء',
    raHours: 5.2422,
    decDeg: -8.2016,
    magnitude: 0.13,
    spectralColor: '#93c5fd',
    classicalDescription: 'Kaki kiri sang pahlawan Orion yang memancarkan cahaya kebiruan tajam di langit musim dingin.',
  },
  {
    id: 'procyon',
    nameArabic: 'الشِّعْرَى الشَّأْمِيَّةُ',
    transliteration: 'Ash-Shi‘rā ash-Sha’miyyah',
    nameLatin: 'Procyon',
    bayer: 'α Canis Minoris',
    constellation: 'Canis Minor',
    constellationArabic: 'الكلب الأصغر / الغميصاء',
    raHours: 7.6528,
    decDeg: 5.225,
    magnitude: 0.38,
    spectralColor: '#fef9c3',
    classicalDescription: 'Bintang anjing utara yang menangis tersedu karena terpisah dari saudarinya (Sirius).',
  },
  {
    id: 'betelgeuse',
    nameArabic: 'مَنْكِبُ الجَوْزَاءِ / إِبْطُ الجَوْزَاءِ',
    transliteration: 'Mankib al-Jawzā’',
    nameLatin: 'Betelgeuse',
    bayer: 'α Orionis',
    constellation: 'Orion',
    constellationArabic: 'الجبار',
    raHours: 5.9194,
    decDeg: 7.4071,
    magnitude: 0.50,
    spectralColor: '#fb7185',
    classicalDescription: 'Bahu kanan sang pemburu langit, raksasa merah bertemperamen api panas kering (Harr Yabis).',
  },
  {
    id: 'altair',
    nameArabic: 'النَّسْرُ الطَّائِرُ',
    transliteration: 'An-Nasr aṭ-Ṭā’ir',
    nameLatin: 'Altair',
    bayer: 'α Aquilae',
    constellation: 'Aquila',
    constellationArabic: 'العقاب',
    raHours: 19.8464,
    decDeg: 8.8683,
    magnitude: 0.77,
    spectralColor: '#e2e8f0',
    classicalDescription: 'Sang Rajawali yang sedang membentangkan sayapnya terbang menembus garis Bima Sakti.',
  },
  {
    id: 'aldebaran',
    nameArabic: 'الدَّبَرَانُ (عَيْنُ الثَّوْرِ)',
    transliteration: 'Ad-Dabarān',
    nameLatin: 'Aldebaran',
    bayer: 'α Tauri',
    constellation: 'Taurus',
    constellationArabic: 'الثور',
    raHours: 4.5986,
    decDeg: 16.5093,
    magnitude: 0.85,
    spectralColor: '#f97316',
    classicalDescription: 'Manzil ke-4. "Sang Pengikut" yang senantiasa membuntuti gugusan Thurayya dengan mata merah menyala.',
    isManzilMarker: true,
    manzilNumber: 4,
  },
  {
    id: 'spica',
    nameArabic: 'السِّمَاكُ الأَعْزَلُ',
    transliteration: 'As-Simāk al-A‘zal',
    nameLatin: 'Spica',
    bayer: 'α Virginis',
    constellation: 'Virgo',
    constellationArabic: 'العذراء / السنبلة',
    raHours: 13.4199,
    decDeg: -11.1613,
    magnitude: 0.98,
    spectralColor: '#93c5fd',
    classicalDescription: 'Manzil ke-14. "Sang Penjaga Tanpa Senjata", melambangkan bulir gandum murni di tangan sang perawan.',
    isManzilMarker: true,
    manzilNumber: 14,
  },
  {
    id: 'antares',
    nameArabic: 'قَلْبُ العَقْرَبِ',
    transliteration: 'Qalb al-‘Aqrab',
    nameLatin: 'Antares',
    bayer: 'α Scorpii',
    constellation: 'Scorpius',
    constellationArabic: 'العقرب',
    raHours: 16.4901,
    decDeg: -26.432,
    magnitude: 1.06,
    spectralColor: '#ef4444',
    classicalDescription: 'Manzil ke-18. "Jantung Kalajengking" merah darah penanda perselisihan dan puncak masa petang.',
    isManzilMarker: true,
    manzilNumber: 18,
  },
  {
    id: 'pollux',
    nameArabic: 'رَأْسُ التَّوْأَمِ المُؤَخَّرُ',
    transliteration: 'Ra’s at-Taw’am al-Mu’akhkhar',
    nameLatin: 'Pollux',
    bayer: 'β Geminorum',
    constellation: 'Gemini',
    constellationArabic: 'التوأمان / الجوزاء',
    raHours: 7.7553,
    decDeg: 28.0262,
    magnitude: 1.14,
    spectralColor: '#fde047',
    classicalDescription: 'Kepala anak kembar yang kedua, berkilau keemasan di rasi Gemini.',
  },
  {
    id: 'fomalhaut',
    nameArabic: 'فَمُ الحُوتِ',
    transliteration: 'Fam al-Ḥūt',
    nameLatin: 'Fomalhaut',
    bayer: 'α Piscis Austrini',
    constellation: 'Piscis Austrinus',
    constellationArabic: 'الحوت الجنوبي',
    raHours: 22.9608,
    decDeg: -29.6222,
    magnitude: 1.17,
    spectralColor: '#cbd5e1',
    classicalDescription: 'Mulut ikan selatan yang menenggak aliran air dari guci rasi Akuarius.',
  },
  {
    id: 'deneb',
    nameArabic: 'ذَنَبُ الدَّجَاجَةِ',
    transliteration: 'Dhanab ad-Dajājah',
    nameLatin: 'Deneb',
    bayer: 'α Cygni',
    constellation: 'Cygnus',
    constellationArabic: 'الدجاجة',
    raHours: 20.6905,
    decDeg: 45.2803,
    magnitude: 1.25,
    spectralColor: '#e0f2fe',
    classicalDescription: 'Ekor sang angsa putih yang terbang membelah jalan susu angkasa.',
  },
  {
    id: 'regulus',
    nameArabic: 'قَلْبُ الأَسَدِ (المَلِكِي)',
    transliteration: 'Qalb al-Asad (Al-Malikī)',
    nameLatin: 'Regulus',
    bayer: 'α Leonis',
    constellation: 'Leo',
    constellationArabic: 'الأسد',
    raHours: 10.1395,
    decDeg: 11.9672,
    magnitude: 1.36,
    spectralColor: '#67e8f9',
    classicalDescription: 'Manzil ke-10 (Al-Jabhah). "Bintang Raja" di dada sang Singa, penanda kekuasaan dan kepemimpinan luhur.',
    isManzilMarker: true,
    manzilNumber: 10,
  },
  {
    id: 'polaris',
    nameArabic: 'الجَدْيُ / القُطْبُ الشَّمَالِيُّ',
    transliteration: 'Al-Jady / Al-Quṭb ash-Shamālī',
    nameLatin: 'Polaris',
    bayer: 'α Ursae Minoris',
    constellation: 'Ursa Minor',
    constellationArabic: 'الدب الأصغر',
    raHours: 2.5303,
    decDeg: 89.2641,
    magnitude: 1.98,
    spectralColor: '#f8fafc',
    classicalDescription: 'Kutub poros langit utara, poros tetap berputarnya seluruh falak perbintangan.',
  },
  {
    id: 'pleiades',
    nameArabic: 'الثُّرَيَّا (النَّجْمُ)',
    transliteration: 'Ath-Thurayyā (An-Najm)',
    nameLatin: 'Pleiades / Alcyone',
    bayer: 'η Tauri',
    constellation: 'Taurus',
    constellationArabic: 'الثور',
    raHours: 3.7914,
    decDeg: 24.105,
    magnitude: 1.6,
    spectralColor: '#bae6fd',
    classicalDescription: 'Manzil ke-3. Gugusan tujuh bintang kembar lambang keberkahan hujan dan kesuburan bumi.',
    isManzilMarker: true,
    manzilNumber: 3,
  },
];

export interface ProjectedSkyPoint {
  x: number; // SVG coordinates relative to projection center
  y: number;
  altitude: number; // degrees (-90 to +90)
  azimuth: number; // degrees (0 to 360, from North clockwise)
  isVisible: boolean; // altitude >= 0
}

export interface ProjectedStar extends FixedStar {
  projected: ProjectedSkyPoint;
}

export interface ProjectedPlanet {
  key: PlanetKey;
  arabicName: string;
  transliteration: string;
  symbol: string;
  color: string;
  eclipticLongitude: number;
  eclipticLatitude: number;
  raHours: number;
  decDeg: number;
  altitude: number;
  azimuth: number;
  isVisible: boolean;
  projected: ProjectedSkyPoint;
  isRetrograde: boolean;
}

export interface ProjectedManzil {
  number: number;
  arabicName: string;
  transliteration: string;
  starGroup: string;
  fortune: 'Sa\'d' | 'Nahs' | 'Muntasif';
  startEclipticDeg: number;
  endEclipticDeg: number;
  midEclipticDeg: number;
  altitude: number;
  azimuth: number;
  isVisible: boolean;
  projected: ProjectedSkyPoint;
  isCurrentMoonMansion: boolean;
}

export interface SkyDomeData {
  observer: ObserverLocation;
  jdn: number;
  lastHours: number; // Local Apparent Sidereal Time in hours
  obliquityDeg: number; // Ecliptic obliquity (~23.51°)
  sunAltitude: number;
  isNight: boolean;
  twilightState: 'Day' | 'Civil Twilight' | 'Nautical Twilight' | 'Deep Night';
  stars: ProjectedStar[];
  planets: ProjectedPlanet[];
  manzils: ProjectedManzil[];
  currentMoonMansionNumber: number;
  horizonBoundaryRadius: number; // pixels radius for planisphere
  eclipticPoints: ProjectedSkyPoint[];
  celestialEquatorPoints: ProjectedSkyPoint[];
  meridianPoints: ProjectedSkyPoint[];
  primeVerticalPoints: ProjectedSkyPoint[];
}

/**
 * Convert Ecliptic coordinates (Longitude λ, Latitude β) to Equatorial (RA α, Dec δ)
 * Based on Zij as-Sindhind obliquity ε = 23° 33' (23.55°)
 */
export function eclipticToEquatorial(
  eclLongDeg: number,
  eclLatDeg: number = 0,
  obliquityDeg: number = 23.55
): { raHours: number; raDeg: number; decDeg: number } {
  const lambda = (eclLongDeg * Math.PI) / 180;
  const beta = (eclLatDeg * Math.PI) / 180;
  const eps = (obliquityDeg * Math.PI) / 180;

  // sin(dec) = sin(beta)*cos(eps) + cos(beta)*sin(eps)*sin(lambda)
  const sinDec =
    Math.sin(beta) * Math.cos(eps) +
    Math.cos(beta) * Math.sin(eps) * Math.sin(lambda);
  const decRad = Math.asin(Math.max(-1, Math.min(1, sinDec)));

  // y = sin(lambda)*cos(eps) - tan(beta)*sin(eps)
  // x = cos(lambda)
  const y = Math.sin(lambda) * Math.cos(eps) - Math.tan(beta) * Math.sin(eps);
  const x = Math.cos(lambda);
  let raRad = Math.atan2(y, x);
  if (raRad < 0) raRad += 2 * Math.PI;

  const raDeg = (raRad * 180) / Math.PI;
  const decDeg = (decRad * 180) / Math.PI;
  const raHours = raDeg / 15;

  return { raHours, raDeg, decDeg };
}

/**
 * Convert Equatorial (RA α, Dec δ) to Horizontal (Altitude a, Azimuth A)
 * Local Hour Angle H = LAST - α
 * Altitude a = arcsin(sin(lat)*sin(dec) + cos(lat)*cos(dec)*cos(H))
 * Azimuth A = arctan2(-sin(H), tan(dec)*cos(lat) - sin(lat)*cos(H)) from North clockwise
 */
export function equatorialToHorizontal(
  raDeg: number,
  decDeg: number,
  latitudeDeg: number,
  lastDeg: number
): { altitude: number; azimuth: number; isVisible: boolean } {
  const lat = (latitudeDeg * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  const haDeg = (lastDeg - raDeg + 360) % 360;
  const H = (haDeg * Math.PI) / 180;

  // Altitude
  const sinAlt =
    Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H);
  const altRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const altitude = (altRad * 180) / Math.PI;

  // Azimuth from North (0° = N, 90° = E, 180° = S, 270° = W)
  const y = -Math.sin(H);
  const x = Math.tan(dec) * Math.cos(lat) - Math.sin(lat) * Math.cos(H);
  let azRad = Math.atan2(y, x);
  let azimuth = (azRad * 180) / Math.PI;
  azimuth = (azimuth + 360) % 360;

  return {
    altitude,
    azimuth,
    isVisible: altitude >= -0.56, // Include atmospheric refraction at horizon
  };
}

/**
 * Project Horizontal Altitude/Azimuth to Stereographic Planisphere
 * Center is Zenith (alt = 90°), edge is Horizon (alt = 0°)
 * R = radius * cos(alt) / (1 + sin(alt)) or equidistant R = radius * (90 - alt) / 90
 */
export function projectHorizontalToCanvas(
  altitude: number,
  azimuth: number,
  canvasRadius: number,
  projectionType: 'stereographic' | 'equidistant' = 'equidistant'
): { x: number; y: number } {
  let r: number;
  if (projectionType === 'stereographic') {
    const zenithAngle = (90 - altitude) * (Math.PI / 180);
    r = canvasRadius * Math.tan(zenithAngle / 2);
  } else {
    // Equidistant: linear with zenith distance (matches classical Astrolabe plate)
    r = (canvasRadius * (90 - Math.max(0, altitude))) / 90;
  }

  // Azimuth 0° is North (top), 90° East (left on sky map), 180° South (bottom), 270° West (right)
  // In sky projection looking UP: North is up, East is LEFT, West is RIGHT
  const azRad = (azimuth * Math.PI) / 180;
  const x = -r * Math.sin(azRad); // Negative because East is to the left when looking up at the sky
  const y = -r * Math.cos(azRad);

  return { x, y };
}

/**
 * Calculate Local Apparent Sidereal Time (LAST) from JDN and Longitude
 */
export function calculateLAST(jdn: number, longitudeDeg: number): { lastHours: number; lastDeg: number } {
  const d = jdn - 2451545.0;
  // GMST in degrees
  let gmstDeg = 280.46061837 + 360.98564736629 * d;
  gmstDeg = ((gmstDeg % 360) + 360) % 360;

  // Local Sidereal Time
  let lastDeg = (gmstDeg + longitudeDeg + 360) % 360;
  let lastHours = lastDeg / 15;

  return { lastHours, lastDeg };
}

/**
 * Generate complete sky dome data for given observer, date, and Sindhind planetary positions
 */
export function computeSkyDomeData(
  jdn: number,
  observer: ObserverLocation,
  planetaryPositions: Record<PlanetKey, PlanetaryPosition>,
  canvasRadius: number = 280
): SkyDomeData {
  const { lastHours, lastDeg } = calculateLAST(jdn, observer.longitude);
  const obliquityDeg = 23.55; // Sindhind classical obliquity

  // Sun position for day/night state
  const sunPos = planetaryPositions.sun;
  const sunEquat = eclipticToEquatorial(sunPos.trueLongitude, 0, obliquityDeg);
  const sunHoriz = equatorialToHorizontal(
    sunEquat.raDeg,
    sunEquat.decDeg,
    observer.latitude,
    lastDeg
  );

  let twilightState: 'Day' | 'Civil Twilight' | 'Nautical Twilight' | 'Deep Night' = 'Deep Night';
  if (sunHoriz.altitude > 0) {
    twilightState = 'Day';
  } else if (sunHoriz.altitude > -6) {
    twilightState = 'Civil Twilight';
  } else if (sunHoriz.altitude > -12) {
    twilightState = 'Nautical Twilight';
  } else {
    twilightState = 'Deep Night';
  }

  const isNight = sunHoriz.altitude <= 0;

  // 1. Project Fixed Stars
  const stars: ProjectedStar[] = CLASSICAL_FIXED_STARS.map((star) => {
    const raDeg = star.raHours * 15;
    const horiz = equatorialToHorizontal(raDeg, star.decDeg, observer.latitude, lastDeg);
    const canvasPt = projectHorizontalToCanvas(horiz.altitude, horiz.azimuth, canvasRadius);

    return {
      ...star,
      projected: {
        x: canvasPt.x,
        y: canvasPt.y,
        altitude: horiz.altitude,
        azimuth: horiz.azimuth,
        isVisible: horiz.isVisible,
      },
    };
  });

  // 2. Project Planets (Al-Kawakib as-Sayyarah)
  const planetKeys: PlanetKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'];
  const planets: ProjectedPlanet[] = planetKeys.map((pKey) => {
    const pPos = planetaryPositions[pKey];
    const equat = eclipticToEquatorial(pPos.trueLongitude, 0, obliquityDeg);
    const horiz = equatorialToHorizontal(equat.raDeg, equat.decDeg, observer.latitude, lastDeg);
    const canvasPt = projectHorizontalToCanvas(horiz.altitude, horiz.azimuth, canvasRadius);

    return {
      key: pKey,
      arabicName: PLANETS_INFO[pKey].arabicName,
      transliteration: PLANETS_INFO[pKey].transliteration,
      symbol: PLANETS_INFO[pKey].symbol,
      color: PLANETS_INFO[pKey].color,
      eclipticLongitude: pPos.trueLongitude,
      eclipticLatitude: 0,
      raHours: equat.raHours,
      decDeg: equat.decDeg,
      altitude: horiz.altitude,
      azimuth: horiz.azimuth,
      isVisible: horiz.isVisible,
      projected: {
        x: canvasPt.x,
        y: canvasPt.y,
        altitude: horiz.altitude,
        azimuth: horiz.azimuth,
        isVisible: horiz.isVisible,
      },
      isRetrograde: pPos.isRetrograde,
    };
  });

  // Active lunar mansion
  const moonLong = planetaryPositions.moon.trueLongitude;
  const currentMoonMansionNumber = Math.floor(moonLong / (360 / 28)) + 1;

  // 3. Project 28 Lunar Mansions
  const manzils: ProjectedManzil[] = LUNAR_MANSIONS.map((m) => {
    const midDeg = (m.startDegree + m.endDegree) / 2;
    const equat = eclipticToEquatorial(midDeg, 0, obliquityDeg);
    const horiz = equatorialToHorizontal(equat.raDeg, equat.decDeg, observer.latitude, lastDeg);
    const canvasPt = projectHorizontalToCanvas(horiz.altitude, horiz.azimuth, canvasRadius);

    return {
      number: m.number,
      arabicName: m.arabicName,
      transliteration: m.transliteration,
      starGroup: m.starGroup,
      fortune: m.fortune,
      startEclipticDeg: m.startDegree,
      endEclipticDeg: m.endDegree,
      midEclipticDeg: midDeg,
      altitude: horiz.altitude,
      azimuth: horiz.azimuth,
      isVisible: horiz.isVisible,
      projected: {
        x: canvasPt.x,
        y: canvasPt.y,
        altitude: horiz.altitude,
        azimuth: horiz.azimuth,
        isVisible: horiz.isVisible,
      },
      isCurrentMoonMansion: m.number === currentMoonMansionNumber,
    };
  });

  // 4. Ecliptic Line (Mintaqat al-Buruj) Points across 360°
  const eclipticPoints: ProjectedSkyPoint[] = [];
  for (let deg = 0; deg <= 360; deg += 4) {
    const eq = eclipticToEquatorial(deg, 0, obliquityDeg);
    const horiz = equatorialToHorizontal(eq.raDeg, eq.decDeg, observer.latitude, lastDeg);
    const pt = projectHorizontalToCanvas(horiz.altitude, horiz.azimuth, canvasRadius);
    eclipticPoints.push({
      x: pt.x,
      y: pt.y,
      altitude: horiz.altitude,
      azimuth: horiz.azimuth,
      isVisible: horiz.isVisible,
    });
  }

  // 5. Celestial Equator Points (Mu'addil an-Nahar - Dec = 0°)
  const celestialEquatorPoints: ProjectedSkyPoint[] = [];
  for (let ra = 0; ra <= 360; ra += 4) {
    const horiz = equatorialToHorizontal(ra, 0, observer.latitude, lastDeg);
    const pt = projectHorizontalToCanvas(horiz.altitude, horiz.azimuth, canvasRadius);
    celestialEquatorPoints.push({
      x: pt.x,
      y: pt.y,
      altitude: horiz.altitude,
      azimuth: horiz.azimuth,
      isVisible: horiz.isVisible,
    });
  }

  // 6. Meridian line points (Azimuth = 0° / 180°)
  const meridianPoints: ProjectedSkyPoint[] = [];
  for (let alt = 0; alt <= 90; alt += 5) {
    const ptN = projectHorizontalToCanvas(alt, 0, canvasRadius);
    meridianPoints.push({ x: ptN.x, y: ptN.y, altitude: alt, azimuth: 0, isVisible: true });
  }

  // 7. Prime vertical points (Azimuth = 90° / 270°)
  const primeVerticalPoints: ProjectedSkyPoint[] = [];
  for (let alt = 0; alt <= 90; alt += 5) {
    const ptE = projectHorizontalToCanvas(alt, 90, canvasRadius);
    primeVerticalPoints.push({ x: ptE.x, y: ptE.y, altitude: alt, azimuth: 90, isVisible: true });
  }

  return {
    observer,
    jdn,
    lastHours,
    obliquityDeg,
    sunAltitude: sunHoriz.altitude,
    isNight,
    twilightState,
    stars,
    planets,
    manzils,
    currentMoonMansionNumber,
    horizonBoundaryRadius: canvasRadius,
    eclipticPoints,
    celestialEquatorPoints,
    meridianPoints,
    primeVerticalPoints,
  };
}
