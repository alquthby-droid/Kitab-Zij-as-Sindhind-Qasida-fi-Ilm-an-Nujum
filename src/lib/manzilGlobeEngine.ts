/**
 * Manzil 3D Globe Astronomy & Coordinate Engine
 * Projects 28 Lunar Mansions, Classical Fixed Stars, Constellations, and Planets
 * onto a 3D Celestial Sphere using D3.js orthographic projections.
 * 
 * Supports three primary reference perspectives:
 * 1. 'horizontal': Local Observer's Horizon & Zenith (Alt-Azimuth coordinates)
 * 2. 'equatorial': Celestial Equator & North/South Celestial Poles (RA-Dec coordinates)
 * 3. 'ecliptic': Ecliptic Plane & 28 Manzil Belt (Ecliptic Longitude & Latitude)
 */

import { PlanetKey, PlanetaryPosition } from '../types';
import {
  ObserverLocation,
  HISTORICAL_OBSERVATORIES,
  CLASSICAL_FIXED_STARS,
  FixedStar,
  eclipticToEquatorial,
  equatorialToHorizontal,
  calculateLAST,
} from './starMapEngine';
import { LUNAR_MANSIONS, PLANETS_INFO, ZODIAC_SIGNS } from './sindhindEngine';
import { DetailedManzil, MANZIL_DETAILED_DATA } from '../data/manzilDetailedData';

export type GlobeCoordinateSystem = 'horizontal' | 'equatorial' | 'ecliptic';

export interface GlobeStarPoint {
  id: string;
  nameArabic: string;
  transliteration: string;
  nameLatin: string;
  bayer: string;
  constellation: string;
  magnitude: number;
  spectralColor: string;
  classicalDescription: string;
  isManzilMarker?: boolean;
  manzilNumber?: number;
  // Raw Celestial Coordinates
  raHours: number;
  decDeg: number;
  altitude: number;
  azimuth: number;
  eclLongDeg: number;
  eclLatDeg: number;
  // D3 Geo coordinates [longitude, latitude] in degrees (-180..180, -90..90) for the selected system
  geoCoords: [number, number];
  isVisibleInSky: boolean; // altitude >= 0
}

export interface GlobeManzilSector {
  number: number;
  arabicName: string;
  transliteration: string;
  meaningId: string;
  fortune: string;
  temperament: string;
  fortuneScore: number;
  element: string;
  startEclipticDeg: number;
  endEclipticDeg: number;
  midEclipticDeg: number;
  // Coordinates in current frame
  centerGeo: [number, number];
  // 3D polygon ring on the sphere
  boundaryPolygon: [number, number][];
  // Horizontal coordinates for observer
  altitude: number;
  azimuth: number;
  isVisibleInSky: boolean;
  isCurrentMoonMansion: boolean;
  detailedData?: DetailedManzil;
}

export interface GlobePlanetPoint {
  key: PlanetKey;
  arabicName: string;
  transliteration: string;
  symbol: string;
  color: string;
  eclLong: number;
  eclLat: number;
  raHours: number;
  decDeg: number;
  altitude: number;
  azimuth: number;
  geoCoords: [number, number];
  isVisibleInSky: boolean;
  isRetrograde: boolean;
}

export interface ConstellationLineSegment {
  constellationId: string;
  constellationName: string;
  constellationArabic: string;
  startStarId: string;
  endStarId: string;
  startGeo: [number, number];
  endGeo: [number, number];
}

/**
 * Extended constellation stars mapping for classic Arabic sky lore
 * (Abd al-Rahman as-Sufi, Suwar al-Kawakib ath-Thabitah, 964 CE)
 */
export const CONSTELLATION_EXTRA_STARS: Record<string, { raHours: number; decDeg: number; name: string; nameAr: string }> = {
  // Ursa Major (Banat Na'sh al-Kubra)
  dubhe: { raHours: 11.062, decDeg: 61.751, name: 'Dubhe', nameAr: 'ظَهْرُ الدُّبِّ' },
  merak: { raHours: 11.031, decDeg: 56.382, name: 'Merak', nameAr: 'مَرَاقُ الدُّبِّ' },
  phecda: { raHours: 11.897, decDeg: 53.695, name: 'Phecda', nameAr: 'فَخِذُ الدُّبِّ' },
  megrez: { raHours: 12.257, decDeg: 57.032, name: 'Megrez', nameAr: 'مَغْرَزُ الدُّبِّ' },
  alioth: { raHours: 12.900, decDeg: 55.960, name: 'Alioth', nameAr: 'الأَلْيَةُ' },
  mizar: { raHours: 13.399, decDeg: 54.925, name: 'Mizar', nameAr: 'المِئْزَرُ' },
  alkaid: { raHours: 13.792, decDeg: 49.313, name: 'Alkaid', nameAr: 'قَائِدُ بَنَاتِ نَعْشٍ' },
  // Ursa Minor (Banat Na'sh as-Sughra)
  kochab: { raHours: 14.845, decDeg: 74.155, name: 'Kochab', nameAr: 'الكَوْكَبُ الشَّمَالِيُّ' },
  pherkad: { raHours: 15.346, decDeg: 71.834, name: 'Pherkad', nameAr: 'الفَرْقَدُ' },
  // Orion (Al-Jabbar / Al-Jawza')
  bellatrix: { raHours: 5.419, decDeg: 6.349, name: 'Bellatrix', nameAr: 'النَّاجِذُ' },
  alnilam: { raHours: 5.604, decDeg: -1.201, name: 'Alnilam', nameAr: 'النِّظَامُ' },
  alnitak: { raHours: 5.679, decDeg: -1.943, name: 'Alnitak', nameAr: 'النِّطَاقُ' },
  mintaka: { raHours: 5.533, decDeg: -0.299, name: 'Mintaka', nameAr: 'المِنْطَقَةُ' },
  saiph: { raHours: 5.795, decDeg: -9.669, name: 'Saiph', nameAr: 'سَيْفُ الجَبَّارِ' },
  // Cassiopeia (Dhat al-Kursi)
  schedar: { raHours: 0.675, decDeg: 56.537, name: 'Schedar', nameAr: 'صَدْرُ ذَاتِ الكُرْسِيِّ' },
  caph: { raHours: 0.153, decDeg: 59.150, name: 'Caph', nameAr: 'الكف الخضيب' },
  gamma_cas: { raHours: 0.945, decDeg: 60.717, name: 'Navi', nameAr: 'سَنَامُ النَّاقَةِ' },
  ruchbah: { raHours: 1.427, decDeg: 60.235, name: 'Ruchbah', nameAr: 'رُكْبَةُ ذَاتِ الكُرْسِيِّ' },
  // Cygnus (Ad-Dajajah)
  sadr: { raHours: 20.373, decDeg: 40.257, name: 'Sadr', nameAr: 'صَدْرُ الدَّجَاجَةِ' },
  albireo: { raHours: 19.512, decDeg: 27.960, name: 'Albireo', nameAr: 'مِنْقَارُ الدَّجَاجَةِ' },
  // Scorpius (Al-'Aqrab)
  graffias: { raHours: 16.091, decDeg: -19.805, name: 'Graffias', nameAr: 'الإِكْلِيلُ' },
  dschubba: { raHours: 16.007, decDeg: -22.622, name: 'Dschubba', nameAr: 'الجَبْهَةُ' },
  shaula: { raHours: 17.560, decDeg: -37.104, name: 'Shaula', nameAr: 'الشَّوْلَةُ' },
  // Leo (Al-Asad)
  algieba: { raHours: 10.333, decDeg: 19.841, name: 'Algieba', nameAr: 'الجَبْهَةُ' },
  denebola: { raHours: 11.818, decDeg: 14.572, name: 'Denebola', nameAr: 'ذَنَبُ الأَسَدِ (الصَّرْفَةُ)' },
  // Gemini (At-Taw'aman)
  castor: { raHours: 7.577, decDeg: 31.888, name: 'Castor', nameAr: 'رَأْسُ التَّوْأَمِ المُقَدَّمُ' },
  alhena: { raHours: 6.629, decDeg: 16.399, name: 'Alhena', nameAr: 'الهَنْعَةُ' },
  // Pegasus (Al-Faras al-A'zam)
  markab: { raHours: 23.079, decDeg: 15.205, name: 'Markab', nameAr: 'مَرْكَبُ الفَرَسِ' },
  scheat: { raHours: 23.063, decDeg: 28.083, name: 'Scheat', nameAr: 'سَاقُ الفَرَسِ' },
  algenib: { raHours: 0.221, decDeg: 15.184, name: 'Algenib', nameAr: 'جَنَاحُ الفَرَسِ' },
  alpheratz: { raHours: 0.139, decDeg: 29.090, name: 'Alpheratz', nameAr: 'سُرَّةُ الفَرَسِ' },
};

/**
 * Constellation stick-figure connections (Classical Star Links)
 */
export const CONSTELLATION_CONNECTIONS = [
  // Ursa Major (Wagon / Plough)
  { constId: 'ursa_major', name: 'Ursa Major (Ad-Dubb al-Akbar)', ar: 'الدب الأكبر', from: 'dubhe', to: 'merak' },
  { constId: 'ursa_major', name: 'Ursa Major (Ad-Dubb al-Akbar)', ar: 'الدب الأكبر', from: 'merak', to: 'phecda' },
  { constId: 'ursa_major', name: 'Ursa Major (Ad-Dubb al-Akbar)', ar: 'الدب الأكبر', from: 'phecda', to: 'megrez' },
  { constId: 'ursa_major', name: 'Ursa Major (Ad-Dubb al-Akbar)', ar: 'الدب الأكبر', from: 'megrez', to: 'dubhe' },
  { constId: 'ursa_major', name: 'Ursa Major (Ad-Dubb al-Akbar)', ar: 'الدب الأكبر', from: 'megrez', to: 'alioth' },
  { constId: 'ursa_major', name: 'Ursa Major (Ad-Dubb al-Akbar)', ar: 'الدب الأكبر', from: 'alioth', to: 'mizar' },
  { constId: 'ursa_major', name: 'Ursa Major (Ad-Dubb al-Akbar)', ar: 'الدب الأكبر', from: 'mizar', to: 'alkaid' },
  // Ursa Minor (Little Dipper to Polaris)
  { constId: 'ursa_minor', name: 'Ursa Minor (Ad-Dubb al-Asghar)', ar: 'الدب الأصغر', from: 'polaris', to: 'pherkad' },
  { constId: 'ursa_minor', name: 'Ursa Minor (Ad-Dubb al-Asghar)', ar: 'الدب الأصغر', from: 'pherkad', to: 'kochab' },
  // Orion (Al-Jabbar / Al-Jawza')
  { constId: 'orion', name: 'Orion (Al-Jabbar)', ar: 'الجبار', from: 'betelgeuse', to: 'bellatrix' },
  { constId: 'orion', name: 'Orion (Al-Jabbar)', ar: 'الجبار', from: 'betelgeuse', to: 'alnitak' },
  { constId: 'orion', name: 'Orion (Al-Jabbar)', ar: 'الجبار', from: 'bellatrix', to: 'mintaka' },
  { constId: 'orion', name: 'Orion (Al-Jabbar)', ar: 'الجبار', from: 'mintaka', to: 'alnilam' },
  { constId: 'orion', name: 'Orion (Al-Jabbar)', ar: 'الجبار', from: 'alnilam', to: 'alnitak' },
  { constId: 'orion', name: 'Orion (Al-Jabbar)', ar: 'الجبار', from: 'alnitak', to: 'saiph' },
  { constId: 'orion', name: 'Orion (Al-Jabbar)', ar: 'الجبار', from: 'mintaka', to: 'rigel' },
  { constId: 'orion', name: 'Orion (Al-Jabbar)', ar: 'الجبار', from: 'saiph', to: 'rigel' },
  // Summer Triangle (As-Sufi Summer Trio)
  { constId: 'summer_triangle', name: 'Segitiga Musim Panas (Al-Muthallath)', ar: 'المثلث الصيفي', from: 'vega', to: 'deneb' },
  { constId: 'summer_triangle', name: 'Segitiga Musim Panas (Al-Muthallath)', ar: 'المثلث الصيفي', from: 'deneb', to: 'altair' },
  { constId: 'summer_triangle', name: 'Segitiga Musim Panas (Al-Muthallath)', ar: 'المثلث الصيفي', from: 'altair', to: 'vega' },
  // Cygnus (The Swan / Ad-Dajajah)
  { constId: 'cygnus', name: 'Cygnus (Ad-Dajajah)', ar: 'الدجاجة', from: 'deneb', to: 'sadr' },
  { constId: 'cygnus', name: 'Cygnus (Ad-Dajajah)', ar: 'الدجاجة', from: 'sadr', to: 'albireo' },
  // Cassiopeia (W / Dhat al-Kursi)
  { constId: 'cassiopeia', name: 'Cassiopeia (Dhat al-Kursi)', ar: 'ذات الكرسي', from: 'caph', to: 'schedar' },
  { constId: 'cassiopeia', name: 'Cassiopeia (Dhat al-Kursi)', ar: 'ذات الكرسي', from: 'schedar', to: 'gamma_cas' },
  { constId: 'cassiopeia', name: 'Cassiopeia (Dhat al-Kursi)', ar: 'ذات الكرسي', from: 'gamma_cas', to: 'ruchbah' },
  // Scorpius (Al-'Aqrab)
  { constId: 'scorpius', name: 'Scorpius (Al-\'Aqrab)', ar: 'العقرب', from: 'graffias', to: 'dschubba' },
  { constId: 'scorpius', name: 'Scorpius (Al-\'Aqrab)', ar: 'العقرب', from: 'dschubba', to: 'antares' },
  { constId: 'scorpius', name: 'Scorpius (Al-\'Aqrab)', ar: 'العقرب', from: 'antares', to: 'shaula' },
  // Leo (Al-Asad)
  { constId: 'leo', name: 'Leo (Al-Asad)', ar: 'الأسد', from: 'regulus', to: 'algieba' },
  { constId: 'leo', name: 'Leo (Al-Asad)', ar: 'الأسد', from: 'algieba', to: 'denebola' },
  // Gemini (At-Taw'aman)
  { constId: 'gemini', name: 'Gemini (At-Taw\'aman)', ar: 'التوأمان', from: 'pollux', to: 'castor' },
  { constId: 'gemini', name: 'Gemini (At-Taw\'aman)', ar: 'التوأمان', from: 'pollux', to: 'alhena' },
  // Pegasus Great Square (Al-Faras al-A'zam)
  { constId: 'pegasus', name: 'Pegasus (Al-Faras al-A\'zam)', ar: 'الفرس الأعظم', from: 'markab', to: 'scheat' },
  { constId: 'pegasus', name: 'Pegasus (Al-Faras al-A\'zam)', ar: 'الفرس الأعظم', from: 'scheat', to: 'alpheratz' },
  { constId: 'pegasus', name: 'Pegasus (Al-Faras al-A\'zam)', ar: 'الفرس الأعظم', from: 'alpheratz', to: 'algenib' },
  { constId: 'pegasus', name: 'Pegasus (Al-Faras al-A\'zam)', ar: 'الفرس الأعظم', from: 'algenib', to: 'markab' },
  // Taurus (Ath-Thawr)
  { constId: 'taurus', name: 'Taurus (Ath-Thawr)', ar: 'الثور', from: 'aldebaran', to: 'pleiades' },
];

/**
 * Coordinate mapping helper: Converts (RA, Dec, Altitude, Azimuth, Ecliptic)
 * into D3 Geo projection [longitude, latitude] degrees in range [-180..180, -90..90]
 */
export function convertToD3GeoCoords(
  coordinateSystem: GlobeCoordinateSystem,
  params: {
    raDeg: number;
    decDeg: number;
    altitude: number;
    azimuth: number;
    eclLongDeg: number;
    eclLatDeg: number;
  }
): [number, number] {
  if (coordinateSystem === 'horizontal') {
    // Local Horizon perspective:
    // Altitude maps to Latitude (-90 to +90, with Horizon = 0, Zenith = +90, Nadir = -90)
    // Azimuth maps to Longitude:
    // In D3 orthographic, standard longitude is -180..180.
    // Let North (Azimuth = 0°) be at center (long = 0°),
    // East (Azimuth = 90°) at long = -90° (left on sky or +90° depending on view),
    // West (Azimuth = 270°) at long = +90°, South (Azimuth = 180°) at long = 180°.
    let lon = params.azimuth;
    if (lon > 180) lon -= 360;
    const lat = Math.max(-90, Math.min(90, params.altitude));
    return [lon, lat];
  }

  if (coordinateSystem === 'equatorial') {
    // Equatorial perspective:
    // RA maps to longitude (-180..180)
    // Dec maps to latitude (-90..90)
    let lon = params.raDeg;
    if (lon > 180) lon -= 360;
    const lat = Math.max(-90, Math.min(90, params.decDeg));
    return [lon, lat];
  }

  // Ecliptic perspective:
  // Ecliptic Longitude maps to longitude (-180..180)
  // Ecliptic Latitude maps to latitude (-90..90)
  let lon = params.eclLongDeg;
  if (lon > 180) lon -= 360;
  const lat = Math.max(-90, Math.min(90, params.eclLatDeg));
  return [lon, lat];
}

/**
 * Calculate comprehensive 3D globe dataset
 */
export function computeManzilGlobeData(
  jdn: number,
  observer: ObserverLocation,
  planetaryPositions: Record<PlanetKey, PlanetaryPosition>,
  coordSystem: GlobeCoordinateSystem = 'horizontal'
) {
  const { lastHours, lastDeg } = calculateLAST(jdn, observer.longitude);
  const obliquityDeg = 23.55; // Classical Zij as-Sindhind obliquity

  // Sun horizontal position for night/day status
  const sunPos = planetaryPositions.sun;
  const sunEquat = eclipticToEquatorial(sunPos.trueLongitude, 0, obliquityDeg);
  const sunHoriz = equatorialToHorizontal(sunEquat.raDeg, sunEquat.decDeg, observer.latitude, lastDeg);
  const isNight = sunHoriz.altitude <= 0;

  // Active Moon Manzil number
  const moonLong = planetaryPositions.moon.trueLongitude;
  const activeMoonMansionNumber = Math.floor(moonLong / (360 / 28)) + 1;

  // Star lookup map for constellation links
  const allStarsCoordsMap = new Map<string, { raHours: number; decDeg: number }>();

  // 1. Compute 32 Classical Navigation Stars
  const globeStars: GlobeStarPoint[] = CLASSICAL_FIXED_STARS.map((star) => {
    const raDeg = star.raHours * 15;
    const horiz = equatorialToHorizontal(raDeg, star.decDeg, observer.latitude, lastDeg);

    // Ecliptic approximate coordinates (inverse conversion)
    const radDec = (star.decDeg * Math.PI) / 180;
    const radRa = (raDeg * Math.PI) / 180;
    const eps = (obliquityDeg * Math.PI) / 180;
    const sinBeta = Math.sin(radDec) * Math.cos(eps) - Math.cos(radDec) * Math.sin(eps) * Math.sin(radRa);
    const betaDeg = (Math.asin(Math.max(-1, Math.min(1, sinBeta))) * 180) / Math.PI;
    const yEcl = Math.sin(radRa) * Math.cos(eps) + Math.tan(radDec) * Math.sin(eps);
    const xEcl = Math.cos(radRa);
    let eclLong = (Math.atan2(yEcl, xEcl) * 180) / Math.PI;
    if (eclLong < 0) eclLong += 360;

    allStarsCoordsMap.set(star.id, { raHours: star.raHours, decDeg: star.decDeg });

    const geoCoords = convertToD3GeoCoords(coordSystem, {
      raDeg,
      decDeg: star.decDeg,
      altitude: horiz.altitude,
      azimuth: horiz.azimuth,
      eclLongDeg: eclLong,
      eclLatDeg: betaDeg,
    });

    return {
      id: star.id,
      nameArabic: star.nameArabic,
      transliteration: star.transliteration,
      nameLatin: star.nameLatin,
      bayer: star.bayer,
      constellation: star.constellation,
      magnitude: star.magnitude,
      spectralColor: star.spectralColor,
      classicalDescription: star.classicalDescription,
      isManzilMarker: star.isManzilMarker,
      manzilNumber: star.manzilNumber,
      raHours: star.raHours,
      decDeg: star.decDeg,
      altitude: horiz.altitude,
      azimuth: horiz.azimuth,
      eclLongDeg: eclLong,
      eclLatDeg: betaDeg,
      geoCoords,
      isVisibleInSky: horiz.isVisible,
    };
  });

  // Populate extra constellation stars
  for (const [starId, sData] of Object.entries(CONSTELLATION_EXTRA_STARS)) {
    allStarsCoordsMap.set(starId, { raHours: sData.raHours, decDeg: sData.decDeg });
  }

  // 2. Compute 28 Lunar Mansions (Manazil al-Qamar)
  const globeManzils: GlobeManzilSector[] = LUNAR_MANSIONS.map((m) => {
    const detailed = MANZIL_DETAILED_DATA.find((d) => d.number === m.number);
    const midDeg = (m.startDegree + m.endDegree) / 2;

    // Center point coordinates
    const centerEquat = eclipticToEquatorial(midDeg, 0, obliquityDeg);
    const centerHoriz = equatorialToHorizontal(centerEquat.raDeg, centerEquat.decDeg, observer.latitude, lastDeg);
    const centerGeo = convertToD3GeoCoords(coordSystem, {
      raDeg: centerEquat.raDeg,
      decDeg: centerEquat.decDeg,
      altitude: centerHoriz.altitude,
      azimuth: centerHoriz.azimuth,
      eclLongDeg: midDeg,
      eclLatDeg: 0,
    });

    // Construct 3D boundary polygon around each sector (ecliptic band from -6° to +6°)
    const boundaryPoints: [number, number][] = [];
    const stepDeg = 2;

    // North edge (lat = +6°)
    for (let deg = m.startDegree; deg <= m.endDegree; deg += stepDeg) {
      const eq = eclipticToEquatorial(deg, 6, obliquityDeg);
      const hz = equatorialToHorizontal(eq.raDeg, eq.decDeg, observer.latitude, lastDeg);
      boundaryPoints.push(
        convertToD3GeoCoords(coordSystem, {
          raDeg: eq.raDeg,
          decDeg: eq.decDeg,
          altitude: hz.altitude,
          azimuth: hz.azimuth,
          eclLongDeg: deg,
          eclLatDeg: 6,
        })
      );
    }
    // East edge
    const eqEast = eclipticToEquatorial(m.endDegree, -6, obliquityDeg);
    const hzEast = equatorialToHorizontal(eqEast.raDeg, eqEast.decDeg, observer.latitude, lastDeg);
    boundaryPoints.push(
      convertToD3GeoCoords(coordSystem, {
        raDeg: eqEast.raDeg,
        decDeg: eqEast.decDeg,
        altitude: hzEast.altitude,
        azimuth: hzEast.azimuth,
        eclLongDeg: m.endDegree,
        eclLatDeg: -6,
      })
    );

    // South edge (lat = -6°)
    for (let deg = m.endDegree; deg >= m.startDegree; deg -= stepDeg) {
      const eq = eclipticToEquatorial(deg, -6, obliquityDeg);
      const hz = equatorialToHorizontal(eq.raDeg, eq.decDeg, observer.latitude, lastDeg);
      boundaryPoints.push(
        convertToD3GeoCoords(coordSystem, {
          raDeg: eq.raDeg,
          decDeg: eq.decDeg,
          altitude: hz.altitude,
          azimuth: hz.azimuth,
          eclLongDeg: deg,
          eclLatDeg: -6,
        })
      );
    }
    // Close polygon
    if (boundaryPoints.length > 0) {
      boundaryPoints.push(boundaryPoints[0]);
    }

    return {
      number: m.number,
      arabicName: m.arabicName,
      transliteration: m.transliteration,
      meaningId: detailed ? detailed.meaningId : m.transliteration,
      fortune: detailed ? detailed.fortuneLabel : m.fortune,
      temperament: detailed ? detailed.temperamentLabel : 'Mu\'tadil',
      fortuneScore: detailed ? detailed.fortuneScore : 50,
      element: detailed ? detailed.elementLabel : 'Falak',
      startEclipticDeg: m.startDegree,
      endEclipticDeg: m.endDegree,
      midEclipticDeg: midDeg,
      centerGeo,
      boundaryPolygon: boundaryPoints,
      altitude: centerHoriz.altitude,
      azimuth: centerHoriz.azimuth,
      isVisibleInSky: centerHoriz.isVisible,
      isCurrentMoonMansion: m.number === activeMoonMansionNumber,
      detailedData: detailed,
    };
  });

  // 3. Compute Planets (Al-Kawakib as-Sayyarah)
  const planetKeys: PlanetKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'];
  const globePlanets: GlobePlanetPoint[] = planetKeys.map((pKey) => {
    const pos = planetaryPositions[pKey];
    const eq = eclipticToEquatorial(pos.trueLongitude, 0, obliquityDeg);
    const hz = equatorialToHorizontal(eq.raDeg, eq.decDeg, observer.latitude, lastDeg);
    const geoCoords = convertToD3GeoCoords(coordSystem, {
      raDeg: eq.raDeg,
      decDeg: eq.decDeg,
      altitude: hz.altitude,
      azimuth: hz.azimuth,
      eclLongDeg: pos.trueLongitude,
      eclLatDeg: 0,
    });

    return {
      key: pKey,
      arabicName: PLANETS_INFO[pKey].arabicName,
      transliteration: PLANETS_INFO[pKey].transliteration,
      symbol: PLANETS_INFO[pKey].symbol,
      color: PLANETS_INFO[pKey].color,
      eclLong: pos.trueLongitude,
      eclLat: 0,
      raHours: eq.raHours,
      decDeg: eq.decDeg,
      altitude: hz.altitude,
      azimuth: hz.azimuth,
      geoCoords,
      isVisibleInSky: hz.isVisible,
      isRetrograde: pos.isRetrograde,
    };
  });

  // 4. Compute Constellation Stick Lines
  const constellationLines: ConstellationLineSegment[] = [];
  for (const conn of CONSTELLATION_CONNECTIONS) {
    const s1 = allStarsCoordsMap.get(conn.from);
    const s2 = allStarsCoordsMap.get(conn.to);
    if (!s1 || !s2) continue;

    const ra1Deg = s1.raHours * 15;
    const ra2Deg = s2.raHours * 15;
    const hz1 = equatorialToHorizontal(ra1Deg, s1.decDeg, observer.latitude, lastDeg);
    const hz2 = equatorialToHorizontal(ra2Deg, s2.decDeg, observer.latitude, lastDeg);

    const startGeo = convertToD3GeoCoords(coordSystem, {
      raDeg: ra1Deg,
      decDeg: s1.decDeg,
      altitude: hz1.altitude,
      azimuth: hz1.azimuth,
      eclLongDeg: ra1Deg, // approx
      eclLatDeg: s1.decDeg,
    });

    const endGeo = convertToD3GeoCoords(coordSystem, {
      raDeg: ra2Deg,
      decDeg: s2.decDeg,
      altitude: hz2.altitude,
      azimuth: hz2.azimuth,
      eclLongDeg: ra2Deg, // approx
      eclLatDeg: s2.decDeg,
    });

    constellationLines.push({
      constellationId: conn.constId,
      constellationName: conn.name,
      constellationArabic: conn.ar,
      startStarId: conn.from,
      endStarId: conn.to,
      startGeo,
      endGeo,
    });
  }

  // 5. Great Circles (Ecliptic Ring, Celestial Equator, Local Horizon)
  // Generate high-density GeoJSON lines across 360°
  const eclipticRingGeo: [number, number][] = [];
  for (let deg = 0; deg <= 360; deg += 3) {
    const eq = eclipticToEquatorial(deg, 0, obliquityDeg);
    const hz = equatorialToHorizontal(eq.raDeg, eq.decDeg, observer.latitude, lastDeg);
    eclipticRingGeo.push(
      convertToD3GeoCoords(coordSystem, {
        raDeg: eq.raDeg,
        decDeg: eq.decDeg,
        altitude: hz.altitude,
        azimuth: hz.azimuth,
        eclLongDeg: deg,
        eclLatDeg: 0,
      })
    );
  }

  const celestialEquatorRingGeo: [number, number][] = [];
  for (let deg = 0; deg <= 360; deg += 3) {
    const hz = equatorialToHorizontal(deg, 0, observer.latitude, lastDeg);
    celestialEquatorRingGeo.push(
      convertToD3GeoCoords(coordSystem, {
        raDeg: deg,
        decDeg: 0,
        altitude: hz.altitude,
        azimuth: hz.azimuth,
        eclLongDeg: deg,
        eclLatDeg: 0,
      })
    );
  }

  const localHorizonRingGeo: [number, number][] = [];
  for (let az = 0; az <= 360; az += 3) {
    // Horizon is alt = 0
    localHorizonRingGeo.push(
      convertToD3GeoCoords(coordSystem, {
        raDeg: az,
        decDeg: 0,
        altitude: 0,
        azimuth: az,
        eclLongDeg: az,
        eclLatDeg: 0,
      })
    );
  }

  // Local Cardinal Points (N, E, S, W) on horizon
  const cardinalPoints = [
    { label: 'U (شمال)', name: 'Syamal / Utara', az: 0, geo: convertToD3GeoCoords(coordSystem, { raDeg: 0, decDeg: 0, altitude: 0, azimuth: 0, eclLongDeg: 0, eclLatDeg: 0 }) },
    { label: 'T (مشرق)', name: 'Masyriq / Timur', az: 90, geo: convertToD3GeoCoords(coordSystem, { raDeg: 90, decDeg: 0, altitude: 0, azimuth: 90, eclLongDeg: 90, eclLatDeg: 0 }) },
    { label: 'S (جنوب)', name: 'Janub / Selatan', az: 180, geo: convertToD3GeoCoords(coordSystem, { raDeg: 180, decDeg: 0, altitude: 0, azimuth: 180, eclLongDeg: 180, eclLatDeg: 0 }) },
    { label: 'B (مغرب)', name: 'Maghrib / Barat', az: 270, geo: convertToD3GeoCoords(coordSystem, { raDeg: 270, decDeg: 0, altitude: 0, azimuth: 270, eclLongDeg: 270, eclLatDeg: 0 }) },
  ];

  // Zenith & Nadir points
  const zenithPoint = convertToD3GeoCoords(coordSystem, {
    raDeg: lastDeg,
    decDeg: observer.latitude,
    altitude: 90,
    azimuth: 0,
    eclLongDeg: 0,
    eclLatDeg: 0,
  });

  const nadirPoint = convertToD3GeoCoords(coordSystem, {
    raDeg: (lastDeg + 180) % 360,
    decDeg: -observer.latitude,
    altitude: -90,
    azimuth: 180,
    eclLongDeg: 0,
    eclLatDeg: 0,
  });

  // Count how many Manzils currently sit above the observer's horizon
  const visibleManzilsCount = globeManzils.filter((m) => m.isVisibleInSky).length;

  return {
    observer,
    jdn,
    lastHours,
    lastDeg,
    isNight,
    sunAltitude: sunHoriz.altitude,
    activeMoonMansionNumber,
    coordSystem,
    globeStars,
    globeManzils,
    globePlanets,
    constellationLines,
    eclipticRingGeo,
    celestialEquatorRingGeo,
    localHorizonRingGeo,
    cardinalPoints,
    zenithPoint,
    nadirPoint,
    visibleManzilsCount,
  };
}
