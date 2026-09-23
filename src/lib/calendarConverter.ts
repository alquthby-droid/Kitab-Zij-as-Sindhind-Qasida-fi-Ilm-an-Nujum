/**
 * Multi-Era Ancient Astronomical Calendar Converter
 * Converts between Hijri, Julian/Gregorian, Yazdajird, Seleucid/Dhul-Qarnayn,
 * Nabonassar, and Sindhind/Kaliyuga eras with Planetary Hours and Day Rulers.
 */

import { HistoricalDateInfo, PlanetKey } from '../types';

export const HIJRI_MONTHS = [
  { index: 1, arabic: 'المحرّم', transliteration: 'Muharram', days: 30 },
  { index: 2, arabic: 'صفر', transliteration: 'Safar', days: 29 },
  { index: 3, arabic: 'ربيع الأول', transliteration: 'Rabi\' al-Awwal', days: 30 },
  { index: 4, arabic: 'ربيع الآخر', transliteration: 'Rabi\' al-Akhir', days: 29 },
  { index: 5, arabic: 'جمادى الأولى', transliteration: 'Jumada al-Ula', days: 30 },
  { index: 6, arabic: 'جمادى الآخرة', transliteration: 'Jumada al-Akhirah', days: 29 },
  { index: 7, arabic: 'رجب', transliteration: 'Rajab', days: 30 },
  { index: 8, arabic: 'شعبان', transliteration: 'Sha\'ban', days: 29 },
  { index: 9, arabic: 'رمضان', transliteration: 'Ramadan', days: 30 },
  { index: 10, arabic: 'شوّال', transliteration: 'Shawwal', days: 29 },
  { index: 11, arabic: 'ذو القعدة', transliteration: 'Dhu al-Qa\'dah', days: 30 },
  { index: 12, arabic: 'ذو الحجة', transliteration: 'Dhu al-Hijjah', days: 29 }, // 30 in leap year
];

export const YAZDAJIRD_MONTHS = [
  'فروردين (Farwardin)',
  'أرديبهشت (Urdibihisht)',
  'خرداد (Khurdadh)',
  'تير (Tir)',
  'مرداد (Murdadh)',
  'شهريور (Shahriwar)',
  'مهر (Mihr)',
  'آبان (Aban)',
  'آذر (Adhar)',
  'دي (Day)',
  'بهمن (Bahman)',
  'إسفندار مذ (Isfandarmudh)',
  'خمسة مسترقة (Andargah / Epagomenal Days)',
];

export const SELEUCID_MONTHS = [
  'تشرين الأول (Tishrin I)',
  'تشرين الثاني (Tishrin II)',
  'كانون الأول (Kanun I)',
  'كانون الثاني (Kanun II)',
  'شباط (Shubat)',
  'آذار (Adhar)',
  'نيسان (Nisan)',
  'أيار (Ayyar)',
  'حزيران (Haziran)',
  'تموز (Tammuz)',
  'آب (Ab)',
  'أيلول (Aylul)',
];

export const WEEKDAYS = [
  { arabic: 'الأحد (al-Ahad)', latin: 'Sunday', ruler: 'sun' as PlanetKey },
  { arabic: 'الإثنين (al-Ithnayn)', latin: 'Monday', ruler: 'moon' as PlanetKey },
  { arabic: 'الثلاثاء (ath-Thulatha\')', latin: 'Tuesday', ruler: 'mars' as PlanetKey },
  { arabic: 'الأربعاء (al-Arba\'a\')', latin: 'Wednesday', ruler: 'mercury' as PlanetKey },
  { arabic: 'الخميس (al-Khamis)', latin: 'Thursday', ruler: 'jupiter' as PlanetKey },
  { arabic: 'الجمعة (al-Jumu\'ah)', latin: 'Friday', ruler: 'venus' as PlanetKey },
  { arabic: 'السبت (as-Sabt)', latin: 'Saturday', ruler: 'saturn' as PlanetKey },
];

// Chaldean order of planetary hours: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon
export const CHALDEAN_ORDER: PlanetKey[] = [
  'saturn',
  'jupiter',
  'mars',
  'sun',
  'venus',
  'mercury',
  'moon',
];

/**
 * Check if a Hijri year is a leap year (kabisa) in the 30-year astronomical cycle
 * Years 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29
 */
export function isHijriLeapYear(hYear: number): boolean {
  const remainder = ((hYear % 30) + 30) % 30;
  return [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(remainder);
}

/**
 * Gregorian / Julian Date to Julian Day Number (JDN)
 */
export function dateToJdn(
  year: number,
  month: number,
  day: number,
  hour: number = 12,
  minute: number = 0
): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  // Gregorian calendar adopted on 1582-10-15
  const isGregorian = year > 1582 || (year === 1582 && (month > 10 || (month === 10 && day >= 15)));
  const b = isGregorian ? 2 - a + Math.floor(a / 4) : 0;

  const dayFraction = (hour + minute / 60) / 24.0;
  const jdnInt =
    Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  return jdnInt + dayFraction;
}

/**
 * Julian Day Number to Gregorian Date
 */
export function jdnToGregorian(jdn: number): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const jd = jdn + 0.5;
  const z = Math.floor(jd);
  const f = jd - z;

  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }

  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const dayWithFraction = b - d - Math.floor(30.6001 * e) + f;
  const day = Math.floor(dayWithFraction);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  const totalDaySeconds = (dayWithFraction - day) * 86400;
  const hour = Math.floor(totalDaySeconds / 3600);
  const minute = Math.floor((totalDaySeconds % 3600) / 60);

  return { year, month, day, hour, minute };
}

/**
 * JDN to Astronomical Tabular Hijri Calendar
 * Epoch of Hijra: JDN 1948439 (Friday 16 July 622 CE)
 */
export function jdnToHijri(jdn: number): {
  year: number;
  month: number;
  day: number;
  monthNameArabic: string;
  monthNameLatin: string;
  isLeapYear: boolean;
} {
  const daysSinceHijra = Math.floor(jdn - 1948439 + 0.5);

  const cycle30 = Math.floor(daysSinceHijra / 10631);
  let remainder = daysSinceHijra % 10631;
  if (remainder < 0) {
    remainder += 10631;
  }

  // Count years inside 30-year cycle
  let yearInCycle = 1;
  while (yearInCycle <= 30) {
    const yDays = isHijriLeapYear(yearInCycle) ? 355 : 354;
    if (remainder < yDays) break;
    remainder -= yDays;
    yearInCycle++;
  }

  const hijriYear = cycle30 * 30 + yearInCycle;
  const leap = isHijriLeapYear(hijriYear);

  // Month calculation
  let month = 1;
  while (month <= 12) {
    let mDays = month % 2 === 1 ? 30 : 29;
    if (month === 12 && leap) mDays = 30;

    if (remainder < mDays) break;
    remainder -= mDays;
    month++;
  }

  const hijriDay = Math.floor(remainder) + 1;
  const safeMonth = Math.min(Math.max(month, 1), 12);
  const mInfo = HIJRI_MONTHS[safeMonth - 1];

  return {
    year: hijriYear,
    month: safeMonth,
    day: hijriDay,
    monthNameArabic: mInfo.arabic,
    monthNameLatin: mInfo.transliteration,
    isLeapYear: leap,
  };
}

/**
 * Hijri to JDN
 */
export function hijriToJdn(year: number, month: number, day: number, hour: number = 12): number {
  const y = year - 1;
  const cycle30 = Math.floor(y / 30);
  const yearInCycle = y % 30;

  let days = cycle30 * 10631;
  for (let i = 1; i <= yearInCycle; i++) {
    days += isHijriLeapYear(i) ? 355 : 354;
  }

  const isLeap = isHijriLeapYear(year);
  for (let m = 1; m < month; m++) {
    let mDays = m % 2 === 1 ? 30 : 29;
    if (m === 12 && isLeap) mDays = 30;
    days += mDays;
  }

  days += day - 1;
  return 1948439 + days + hour / 24.0;
}

/**
 * JDN to Yazdajird Era (Tarikh Yazdajird)
 * Epoch: 16 June 632 CE (Julian) = JDN 1952063
 * Exactly 365 days per year (12 months x 30 days + 5 epagomenal days)
 */
export function jdnToYazdajird(jdn: number): {
  year: number;
  month: number;
  monthNamePersian: string;
  day: number;
} {
  const daysSinceEpoch = Math.floor(jdn - 1952063 + 0.5);
  const year = Math.floor(daysSinceEpoch / 365) + 1;
  let dayOfYear = daysSinceEpoch % 365;
  if (dayOfYear < 0) dayOfYear += 365;

  let month = Math.floor(dayOfYear / 30) + 1;
  let day = (dayOfYear % 30) + 1;

  if (month > 12) {
    month = 13; // Andargah (the 5 supplementary days)
    day = dayOfYear - 360 + 1;
  }

  return {
    year,
    month,
    monthNamePersian: YAZDAJIRD_MONTHS[month - 1] || YAZDAJIRD_MONTHS[0],
    day,
  };
}

/**
 * JDN to Seleucid Era / Dhul-Qarnayn (Tarikh al-Iskandar)
 * Epoch: 1 October 312 BCE (Julian) = JDN 1607739
 */
export function jdnToSeleucid(jdn: number): {
  year: number;
  monthNameSyriac: string;
  day: number;
} {
  const days = jdn - 1607739;
  const approxYears = Math.floor(days / 365.25);
  const greg = jdnToGregorian(jdn);
  const syriacMonth = SELEUCID_MONTHS[greg.month - 1] || SELEUCID_MONTHS[0];

  return {
    year: approxYears + 1,
    monthNameSyriac: syriacMonth,
    day: greg.day,
  };
}

/**
 * JDN to Sindhind / Kaliyuga (Ahargana)
 * Epoch of Kaliyuga: 18 February 3102 BCE = JDN 588466
 */
export function jdnToSindhindEra(jdn: number): {
  aharganaDays: number;
  kaliyugaYears: number;
} {
  const ahargana = Math.floor(jdn - 588466 + 0.5);
  const kaliyugaYears = Math.floor(ahargana / 365.258756); // Sindhind sidereal year length

  return {
    aharganaDays: ahargana,
    kaliyugaYears,
  };
}

/**
 * JDN to Nabonassar Era (Tarikh Bukhtanashar)
 * Epoch: 26 February 747 BCE = JDN 1448638 (vague 365-day year)
 */
export function jdnToNabonassar(jdn: number): {
  year: number;
  day: number;
} {
  const days = Math.floor(jdn - 1448638 + 0.5);
  const year = Math.floor(days / 365) + 1;
  const day = (days % 365) + 1;
  return { year, day };
}

/**
 * Calculate Planetary Day Ruler and Hour Ruler
 */
export function calculatePlanetaryHours(
  jdn: number,
  hour: number
): {
  dayRuler: PlanetKey;
  hourRuler: PlanetKey;
  hourNumber: number;
  isNightHour: boolean;
} {
  const weekdayIndex = (Math.floor(jdn + 1.5) % 7 + 7) % 7;
  const dayRuler = WEEKDAYS[weekdayIndex].ruler;

  // Day ruler index in Chaldean order
  const dayRulerIdx = CHALDEAN_ORDER.indexOf(dayRuler);

  // Approximate sunrise at 6:00, sunset at 18:00
  let hourFromSunrise = Math.floor(hour - 6);
  if (hourFromSunrise < 0) {
    hourFromSunrise += 24;
  }

  const hourRulerIdx = (dayRulerIdx + hourFromSunrise) % 7;
  const hourRuler = CHALDEAN_ORDER[hourRulerIdx];

  return {
    dayRuler,
    hourRuler,
    hourNumber: (hourFromSunrise % 12) + 1,
    isNightHour: hour < 6 || hour >= 18,
  };
}

/**
 * Calculate Lunar Phase & Illumination from JDN
 */
export function calculateLunarPhase(jdn: number): {
  nameArabic: string;
  nameLatin: string;
  illumination: number;
  ageDays: number;
} {
  // Known new moon: Jan 6 2000 JDN 2451549.5
  const synodicMonth = 29.53058867;
  const phaseCycle = ((jdn - 2451549.5) % synodicMonth + synodicMonth) % synodicMonth;
  const ageDays = Math.round(phaseCycle * 10) / 10;
  const phaseAngle = (phaseCycle / synodicMonth) * 2 * Math.PI;
  const illumination = Math.round((1 - Math.cos(phaseAngle)) / 2 * 100);

  let nameArabic = 'هلال متزايد';
  let nameLatin = 'Waxing Crescent';

  if (ageDays < 1.5) {
    nameArabic = 'محاق (ولادة الهلال)';
    nameLatin = 'New Moon (Mahaq)';
  } else if (ageDays < 6.5) {
    nameArabic = 'هلال أول الشهر';
    nameLatin = 'Waxing Crescent (Hilal)';
  } else if (ageDays < 8.5) {
    nameArabic = 'تربيع أول';
    nameLatin = 'First Quarter (Tarbi\' Awwal)';
  } else if (ageDays < 13.5) {
    nameArabic = 'أحدب متزايد';
    nameLatin = 'Waxing Gibbous';
  } else if (ageDays < 16.5) {
    nameArabic = 'بدر تام';
    nameLatin = 'Full Moon (Badr)';
  } else if (ageDays < 21.5) {
    nameArabic = 'أحدب متناقص';
    nameLatin = 'Waning Gibbous';
  } else if (ageDays < 23.5) {
    nameArabic = 'تربيع ثانٍ';
    nameLatin = 'Last Quarter (Tarbi\' Thani)';
  } else {
    nameArabic = 'هلال متناقص (سرار)';
    nameLatin = 'Waning Crescent (Sirar)';
  }

  return {
    nameArabic,
    nameLatin,
    illumination,
    ageDays,
  };
}

/**
 * Generate full Historical Date Info record
 */
export function getFullHistoricalDate(
  year: number,
  month: number,
  day: number,
  hour: number = 12,
  minute: number = 0
): HistoricalDateInfo {
  const jdn = dateToJdn(year, month, day, hour, minute);
  const weekdayIndex = (Math.floor(jdn + 1.5) % 7 + 7) % 7;
  const weekday = WEEKDAYS[weekdayIndex];

  const hijri = jdnToHijri(jdn);
  const yazdajird = jdnToYazdajird(jdn);
  const seleucid = jdnToSeleucid(jdn);
  const nabonassar = jdnToNabonassar(jdn);
  const sindhindEra = jdnToSindhindEra(jdn);
  const { dayRuler, hourRuler } = calculatePlanetaryHours(jdn, hour);
  const lunarPhase = calculateLunarPhase(jdn);

  return {
    gregorian: { year, month, day, hour, minute },
    julian: { year, month, day },
    hijri,
    yazdajird,
    seleucid,
    nabonassar,
    sindhindEra,
    jdn: Math.round(jdn * 1000) / 1000,
    weekdayArabic: weekday.arabic,
    weekdayLatin: weekday.latin,
    dayRuler,
    hourRuler,
    lunarPhase,
  };
}
