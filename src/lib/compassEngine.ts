/**
 * Classical Astrolabe Compass & Device Orientation Engine
 * Handles DeviceOrientationEvent, True North calculation via Magnetic Declination,
 * Tilt compensation, and Sky Observation Azimuth targeting for Peta Langit.
 */

export interface CompassHeadingState {
  heading: number; // 0 to 359.9 (degrees from True North if useTrueNorth=true, else Magnetic)
  trueHeading: number; // True North (Ash-Shamal al-Haqiqi)
  magneticHeading: number; // Magnetic North (Inhiraf al-Ibrah)
  cardinal: string; // 'U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'
  cardinalLatin: string; // 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'
  cardinalArabic: string; // 'الشَّمَال', 'شَمَال شَرْقِيّ', etc.
  accuracy: number | null; // degrees accuracy
  isCalibrated: boolean;
  pitch: number; // Device pitch (beta)
  roll: number; // Device roll (gamma)
  sensorAvailable: boolean;
  sensorActive: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  useTrueNorth: boolean;
  magneticDeclination: number; // in degrees: positive East (+), negative West (-)
  isSimulated: boolean;
}

export interface CardinalDirectionInfo {
  deg: number;
  code: string;
  latin: string;
  nameIndo: string;
  nameArabic: string;
}

export const CARDINAL_POINTS: CardinalDirectionInfo[] = [
  { deg: 0, code: 'U', latin: 'N', nameIndo: 'Utara', nameArabic: 'الشَّمَال' },
  { deg: 45, code: 'TL', latin: 'NE', nameIndo: 'Timur Laut', nameArabic: 'شَمَال شَرْقِيّ' },
  { deg: 90, code: 'T', latin: 'E', nameIndo: 'Timur', nameArabic: 'الشَّرْق' },
  { deg: 135, code: 'TG', latin: 'SE', nameIndo: 'Tenggara', nameArabic: 'جَنُوب شَرْقِيّ' },
  { deg: 180, code: 'S', latin: 'S', nameIndo: 'Selatan', nameArabic: 'الجَنُوب' },
  { deg: 225, code: 'BD', latin: 'SW', nameIndo: 'Barat Daya', nameArabic: 'جَنُوب غَرْبِيّ' },
  { deg: 270, code: 'B', latin: 'W', nameIndo: 'Barat', nameArabic: 'الغَرْب' },
  { deg: 315, code: 'BL', latin: 'NW', nameIndo: 'Barat Laut', nameArabic: 'شَمَال غَرْبِيّ' },
];

/**
 * Approximate magnetic declination (variation) based on observer location for ~2024-2026.
 * Positive = Magnetic North is East of True North (Declination East).
 * Negative = Magnetic North is West of True North (Declination West).
 */
export function estimateMagneticDeclination(latitude: number, longitude: number): number {
  // Baghdad: ~ +4.8°
  // Mecca: ~ +3.4°
  // Jakarta: ~ +0.9°
  // Damascus: ~ +4.6°
  // Cairo: ~ +4.2°
  // Western Europe / Spain: ~ +0.5° to -1°

  if (Math.abs(latitude - 33.3) < 3 && Math.abs(longitude - 44.4) < 3) return 4.8;
  if (Math.abs(latitude - 21.4) < 3 && Math.abs(longitude - 39.8) < 3) return 3.4;
  if (Math.abs(latitude - (-6.2)) < 3 && Math.abs(longitude - 106.8) < 4) return 0.9;
  if (Math.abs(latitude - 33.5) < 3 && Math.abs(longitude - 36.3) < 3) return 4.6;
  if (Math.abs(latitude - 30.0) < 3 && Math.abs(longitude - 31.2) < 3) return 4.2;
  if (Math.abs(latitude - 37.9) < 4 && Math.abs(longitude - (-4.8)) < 4) return 0.4;
  if (Math.abs(latitude - 23.2) < 3 && Math.abs(longitude - 75.8) < 3) return 0.6;

  // General low-order approximation for mid-latitudes
  const latR = (latitude * Math.PI) / 180;
  const lonR = (longitude * Math.PI) / 180;
  const approx = 3.5 * Math.sin(lonR - 0.5) - 2.0 * Math.sin(latR * 2) + 1.2;
  return parseFloat(approx.toFixed(1));
}

/**
 * Get cardinal direction information for a given degree (0-360)
 */
export function getCardinalInfo(deg: number): CardinalDirectionInfo {
  const normalized = (deg % 360 + 360) % 360;
  const step = 45;
  const index = Math.round(normalized / step) % 8;
  return CARDINAL_POINTS[index];
}

/**
 * Compute Qibla direction (azimuth from True North) from any observer location
 * Ka'bah coordinates: Lat 21.4225° N, Lon 39.8262° E
 */
export function calculateQiblaAzimuth(lat: number, lon: number): number {
  const phiK = (21.4225 * Math.PI) / 180;
  const lambdaK = (39.8262 * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const lambda = (lon * Math.PI) / 180;

  const deltaLambda = lambdaK - lambda;
  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);
  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;
  return (qiblaDeg + 360) % 360;
}

/**
 * Compute compass heading from device orientation angles (alpha, beta, gamma)
 * with tilt compensation when device is held flat or angled towards the sky.
 */
export function computeHeadingFromAngles(
  alpha: number | null,
  beta: number | null,
  gamma: number | null
): number {
  if (alpha === null) return 0;

  // If phone is flat on table (pitch & roll near 0)
  if (beta === null || gamma === null || (Math.abs(beta) < 15 && Math.abs(gamma) < 15)) {
    return (360 - alpha) % 360;
  }

  // Tilt-compensated heading calculation
  const _beta = (beta * Math.PI) / 180;
  const _gamma = (gamma * Math.PI) / 180;
  const _alpha = (alpha * Math.PI) / 180;

  // Calculate unit vector pointing forward on device
  const cA = Math.cos(_alpha);
  const sA = Math.sin(_alpha);
  const cB = Math.cos(_beta);
  const sB = Math.sin(_beta);
  const cG = Math.cos(_gamma);
  const sG = Math.sin(_gamma);

  const rA = -cA * sG - sA * sB * cG;
  const rB = -sA * sG + cA * sB * cG;

  let headingRad = Math.atan2(rA, rB);
  let headingDeg = (headingRad * 180) / Math.PI;
  if (headingDeg < 0) headingDeg += 360;

  return headingDeg;
}
