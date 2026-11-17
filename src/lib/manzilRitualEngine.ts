/**
 * Manzil Ritual Scheduler & Rising-Time Astronomical Engine
 * Computes daily rising (Shurūq al-Manzil), culmination (Tawassut), and setting (Ghurūb)
 * times for all 28 Lunar Mansions based on observer latitude, longitude, and date,
 * aligned with planetary hours and classical ritual affinities.
 */

import { DetailedManzil, MANZIL_DETAILED_DATA } from '../data/manzilDetailedData';
import { PlanetKey } from '../types';
import { dateToJdn, calculatePlanetaryHours, jdnToHijri } from './calendarConverter';
import { calculateSindhindPositions, PLANETS_INFO } from './sindhindEngine';

const PLANET_DISPLAY_LATIN: Partial<Record<PlanetKey, string>> = {
  sun: 'Matahari (Sun)',
  moon: 'Bulan (Moon)',
  mars: 'Mars (al-Marrikh)',
  mercury: 'Merkurius (\'Utarid)',
  jupiter: 'Jupiter (al-Mushtari)',
  venus: 'Venus (az-Zuhrah)',
  saturn: 'Saturnus (Zuhal)',
};

export type RitualCategoryId =
  | 'all'
  | 'protection'
  | 'wealth'
  | 'love'
  | 'wisdom'
  | 'spiritual'
  | 'wafaq'
  | 'safar';

export interface RitualCategoryMeta {
  id: RitualCategoryId;
  label: string;
  arabicLabel: string;
  description: string;
  recommendedActionHints: string[];
}

export const RITUAL_CATEGORIES: RitualCategoryMeta[] = [
  {
    id: 'all',
    label: 'Semua Amalan',
    arabicLabel: 'جَمِيعُ الأَعْمَال',
    description: 'Menampilkan seluruh 28 Manzil beserta jam terbit (rising) dan kelayakan umumnya.',
    recommendedActionHints: [],
  },
  {
    id: 'protection',
    label: 'Perlindungan & Tolak Bala',
    arabicLabel: 'الحِفْظُ وَالسَّلَامَة',
    description: 'Doa benteng diri, keselamatan keluarga, dan penjagaan tempat tinggal.',
    recommendedActionHints: ['Doa perlindungan, membaca Ayat Kursi & Mu\'awwidzatain', 'Riyadhah keteguhan batin dan penjagaan diri'],
  },
  {
    id: 'wealth',
    label: 'Rezeki & Perniagaan',
    arabicLabel: 'جَلْبُ الأَرْزَاقِ وَالتِّجَارَة',
    description: 'Shalat Dhuha, doa kelapangan rezeki, memulai akad dagang, dan ikhtiar usaha.',
    recommendedActionHints: ['Wirid Ya Razzaq & Ya Fattah saat Manzil mulai terbit', 'Memulai akad jual-beli atau menanam benih keberkahan'],
  },
  {
    id: 'love',
    label: 'Mahabbah & Kerukunan',
    arabicLabel: 'المَحَبَّةُ وَالأُلْفَة',
    description: 'Doa keharmonisan rumah tangga, ishlah/perdamaian, dan mempererat silaturahmi.',
    recommendedActionHints: ['Wirid Ya Wadud & doa penyatu hati', 'Silaturahmi, khitbah, atau mendamaikan sengketa'],
  },
  {
    id: 'wisdom',
    label: 'Ilmu, Hafalan & Hikmah',
    arabicLabel: 'طَلَبُ العِلْمِ وَالحِكْمَة',
    description: 'Muthola\'ah kitab, hafalan Al-Qur\'an, tafakur falak, dan doa pembuka bashirah.',
    recommendedActionHints: ['Membaca wirid Ya \'Alim Ya Hakim sebelum belajar', 'Menelaah naskah ilmu & menulis catatan riset'],
  },
  {
    id: 'spiritual',
    label: 'Riyadhah & Dzikir Malam',
    arabicLabel: 'الرِّيَاضَةُ وَالذِّكْر',
    description: 'Tahajjud, istighfar sahur, dzikir asmaul husna, dan penyucian jiwa (tazkiyah).',
    recommendedActionHints: ['Dzikir khalwat yang tenang sesuai jam terbit Manzil', 'Muhasabah dan membaca shalawat'],
  },
  {
    id: 'wafaq',
    label: 'Penulisan Wafaq & Rajah',
    arabicLabel: 'كِتَابَةُ الأَوْفَاق',
    description: 'Menulis rajah atau mengukir Wafaq bertepatan dengan terbitnya Manzil dan jam planetnya.',
    recommendedActionHints: ['Menyiapkan tinta Za\'faran & media suci tepat saat Manzil terbit', 'Mengisi kotak Wafaq sesuai kaidah Mizan'],
  },
  {
    id: 'safar',
    label: 'Perjalanan & Hijrah (Safar)',
    arabicLabel: 'السَّفَرُ وَالحَرَكَة',
    description: 'Doa safar, melangkah keluar rumah untuk perjalanan jauh, dan keberangkatan misi.',
    recommendedActionHints: ['Membaca doa safar dan memulai langkah tepat di awal jendela terbit'],
  },
];

export interface ManzilRisingSchedule {
  manzil: DetailedManzil;
  risingMinutesLocal: number; // 0 - 1439
  risingTimeFormatted: string; // HH:MM
  windowEndFormatted: string; // +35 mins
  transitTimeFormatted: string; // MC crossing
  settingTimeFormatted: string; // Western horizon crossing
  planetaryHourAtRising: string;
  planetaryHourArabic: string;
  isMoonOccupied: boolean;
  suitabilityScore: number; // 0 - 100
  suitabilityLabel: 'Sangat Utama (Mumtāz)' | 'Baik (Ṣāliḥ)' | 'Sedang (Mu\'tadil)' | 'Kurang Ideal (Taḥazzur)';
  recommendedRitualNote: string;
}

export interface ScheduledRitual {
  id: string;
  title: string;
  category: RitualCategoryId;
  manzilNumber: number;
  manzilArabic: string;
  manzilTransliteration: string;
  dateISO: string; // YYYY-MM-DD
  risingTime: string; // HH:MM
  windowEnd: string; // HH:MM
  planetaryHour: string;
  locationName: string;
  reminderMinutesBefore: number; // 0, 5, 10, 15, 30
  notes: string;
  enabled: boolean;
  createdAt: string;
  lastNotifiedKey?: string;
}

const STORAGE_KEY = 'sindhind_manzil_rituals_v1';

/**
 * Compute Ascendant and Midheaven ecliptic longitudes at a given JDN & observer coordinates
 */
function computeAscMcAtJdn(jdn: number, latitude: number, longitude: number): { asc: number; mc: number } {
  const d = jdn - 2451545.0;
  const T = d / 36525.0;
  const gmst = (280.46061837 + 360.98564736629 * d + 0.000387933 * T * T) % 360;
  const lmst = (gmst + longitude + 360) % 360;
  const lmstRad = (lmst * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;
  const obliq = (23.43929 - 0.0130042 * T) * (Math.PI / 180);

  const y = -Math.cos(lmstRad);
  const x = Math.sin(lmstRad) * Math.cos(obliq) + Math.tan(latRad) * Math.sin(obliq);
  let asc = (Math.atan2(y, x) * 180) / Math.PI + 90;
  asc = (asc + 360) % 360;

  const mcY = Math.sin(lmstRad);
  const mcX = Math.cos(lmstRad) * Math.cos(obliq);
  let mc = (Math.atan2(mcY, mcX) * 180) / Math.PI;
  mc = (mc + 360) % 360;

  return { asc, mc };
}

function formatMinutesToHHMM(mins: number): string {
  const normalized = ((Math.round(mins) % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Check if angle target lies in clockwise forward sweep [a, b]
 */
function crossedTargetForward(prevDeg: number, currDeg: number, targetDeg: number): boolean {
  const sweep = (currDeg - prevDeg + 360) % 360;
  if (sweep === 0 || sweep > 90) return false;
  const distToTarget = (targetDeg - prevDeg + 360) % 360;
  return distToTarget <= sweep;
}

/**
 * Calculate rising, transit, and setting times + ritual suitability for all 28 Manzils
 */
export function calculateDailyManzilRitualSchedules(params: {
  year: number;
  month: number;
  day: number;
  latitude: number;
  longitude: number;
  timezoneOffsetHours: number;
  category: RitualCategoryId;
}): {
  schedules: ManzilRisingSchedule[];
  moonManzilNumber: number;
  hijriFormatted: string;
} {
  const { year, month, day, latitude, longitude, timezoneOffsetHours, category } = params;

  // Base JDN at local 00:00 converted to UT
  const jdnLocalMidnight = dateToJdn(year, month, day, 0, 0) - timezoneOffsetHours / 24;
  const jdnLocalNoon = jdnLocalMidnight + 0.5;
  const moonData = calculateSindhindPositions(jdnLocalNoon, latitude, longitude);
  const moonManzilNumber = moonData.positions.moon.lunarMansion.number;
  const hijri = jdnToHijri(jdnLocalNoon);
  const hijriFormatted = `${hijri.day} ${hijri.monthNameLatin} ${hijri.year} H`;

  // Pre-sample Ascendant & MC every 2 minutes across the 24-hour local day (720 samples)
  const STEP_MIN = 2;
  const SAMPLES = 1440 / STEP_MIN;
  const samples: { min: number; asc: number; mc: number; dsc: number }[] = [];

  for (let i = 0; i <= SAMPLES; i++) {
    const localMin = i * STEP_MIN;
    const jdn = jdnLocalMidnight + localMin / 1440;
    const { asc, mc } = computeAscMcAtJdn(jdn, latitude, longitude);
    samples.push({
      min: localMin,
      asc,
      mc,
      dsc: (asc + 180) % 360,
    });
  }

  const schedules: ManzilRisingSchedule[] = MANZIL_DETAILED_DATA.map((manzil) => {
    const targetStart = manzil.startDegree;
    const targetMid = (manzil.startDegree + manzil.endDegree) / 2;

    let risingMin = (manzil.number * 51) % 1440; // fallback
    let transitMin = (risingMin + 360) % 1440;
    let settingMin = (risingMin + 720) % 1440;

    for (let i = 1; i < samples.length; i++) {
      const prev = samples[i - 1];
      const curr = samples[i];

      if (crossedTargetForward(prev.asc, curr.asc, targetStart)) {
        const sweep = (curr.asc - prev.asc + 360) % 360 || 0.001;
        const frac = ((targetStart - prev.asc + 360) % 360) / sweep;
        risingMin = Math.round(prev.min + frac * STEP_MIN) % 1440;
      }

      if (crossedTargetForward(prev.mc, curr.mc, targetMid)) {
        const sweep = (curr.mc - prev.mc + 360) % 360 || 0.001;
        const frac = ((targetMid - prev.mc + 360) % 360) / sweep;
        transitMin = Math.round(prev.min + frac * STEP_MIN) % 1440;
      }

      if (crossedTargetForward(prev.dsc, curr.dsc, targetStart)) {
        const sweep = (curr.dsc - prev.dsc + 360) % 360 || 0.001;
        const frac = ((targetStart - prev.dsc + 360) % 360) / sweep;
        settingMin = Math.round(prev.min + frac * STEP_MIN) % 1440;
      }
    }

    const risingHourDecimal = risingMin / 60;
    const risingJdn = jdnLocalMidnight + risingMin / 1440;
    const { hourRuler } = calculatePlanetaryHours(risingJdn, Math.floor(risingHourDecimal));

    const isMoonOccupied = manzil.number === moonManzilNumber;

    // Score calculation based on chosen ritual category
    let score = Math.round(manzil.fortuneScore * 0.45 + manzil.muhibbahScore * 0.15);

    const affinityMap: Record<Exclude<RitualCategoryId, 'all'>, string[]> = {
      protection: ['hikmah', 'bina', 'safar'],
      wealth: ['tijarah', 'ziraah', 'bina'],
      love: ['nikah', 'tijarah'],
      wisdom: ['hikmah', 'tibb'],
      spiritual: ['hikmah', 'nikah'],
      wafaq: ['hikmah', 'tijarah', 'bina'],
      safar: ['safar', 'tijarah'],
    };

    if (category === 'all') {
      score += 18;
    } else {
      const targetAffinities = affinityMap[category] || [];
      const matches = manzil.primaryAffinities.filter((a) => targetAffinities.includes(a)).length;
      score += matches * 14;

      if (category === 'love' && manzil.muhibbahScore >= 75) score += 14;
      if (category === 'protection' && (manzil.element === 'Nar' || manzil.element === 'Turab')) score += 8;
      if (category === 'wealth' && (manzil.fortune === 'Sa\'d Mahd' || manzil.fortune === 'Sa\'d')) score += 12;
      if (category === 'wisdom' && (manzil.element === 'Hawa' || manzil.spiritualRuler.toLowerCase().includes('merkurius') || manzil.spiritualRuler.toLowerCase().includes('jupiter'))) score += 12;
      if (category === 'spiritual' && (manzil.fortune !== 'Nahs Mahd')) score += 10;
      if (category === 'wafaq' && manzil.fortuneScore >= 60) score += 10;
    }

    // Planetary hour alignment bonus
    const rulerLower = manzil.spiritualRuler.toLowerCase();
    const hourLower = hourRuler.toLowerCase();
    const rulerMatch =
      (rulerLower.includes('matahari') && hourLower.includes('sun')) ||
      (rulerLower.includes('bulan') && hourLower.includes('moon')) ||
      (rulerLower.includes('mars') && hourLower.includes('mars')) ||
      (rulerLower.includes('merkurius') && hourLower.includes('mercury')) ||
      (rulerLower.includes('jupiter') && hourLower.includes('jupiter')) ||
      (rulerLower.includes('venus') && hourLower.includes('venus')) ||
      (rulerLower.includes('saturnus') && hourLower.includes('saturn'));

    const hourPlanetInfo = PLANETS_INFO[hourRuler];
    const hourLatinLabel = PLANET_DISPLAY_LATIN[hourRuler] || hourPlanetInfo?.transliteration || hourRuler;
    const hourArabicLabel = hourPlanetInfo?.arabicName || '';

    if (rulerMatch) score += 14;
    if (isMoonOccupied) score += 15;

    score = Math.min(99, Math.max(18, score));

    let suitabilityLabel: ManzilRisingSchedule['suitabilityLabel'] = 'Sedang (Mu\'tadil)';
    if (score >= 80) suitabilityLabel = 'Sangat Utama (Mumtāz)';
    else if (score >= 62) suitabilityLabel = 'Baik (Ṣāliḥ)';
    else if (score < 42) suitabilityLabel = 'Kurang Ideal (Taḥazzur)';

    const firstRec = manzil.recommendedActions[0] || 'Dzikir dan doa kebaikan';
    const recommendedRitualNote = isMoonOccupied
      ? `Bulan sedang bersemayam di Manzil ini (Sa'ah Kubrā). Dianjurkan: ${firstRec}.`
      : rulerMatch
      ? `Jam terbit berselaras langsung dengan planet penguasa ${manzil.spiritualRuler}. Baik untuk: ${firstRec}.`
      : `Jendela terbit cocok untuk: ${firstRec}.`;

    return {
      manzil,
      risingMinutesLocal: risingMin,
      risingTimeFormatted: formatMinutesToHHMM(risingMin),
      windowEndFormatted: formatMinutesToHHMM(risingMin + 35),
      transitTimeFormatted: formatMinutesToHHMM(transitMin),
      settingTimeFormatted: formatMinutesToHHMM(settingMin),
      planetaryHourAtRising: hourLatinLabel,
      planetaryHourArabic: hourArabicLabel,
      isMoonOccupied,
      suitabilityScore: score,
      suitabilityLabel,
      recommendedRitualNote,
    };
  });

  return {
    schedules,
    moonManzilNumber,
    hijriFormatted,
  };
}

/**
 * Storage helpers for scheduled rituals
 */
export function loadScheduledRituals(): ScheduledRitual[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScheduledRituals(items: ScheduledRitual[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Compute reminder trigger timestamp in ms for a scheduled ritual
 */
export function getRitualReminderTargetMs(ritual: ScheduledRitual): number | null {
  const parts = ritual.dateISO.split('-').map((n) => parseInt(n, 10));
  const timeParts = ritual.risingTime.split(':').map((n) => parseInt(n, 10));
  if (parts.length !== 3 || timeParts.length !== 2) return null;
  const [y, m, d] = parts;
  const [hh, mm] = timeParts;
  if ([y, m, d, hh, mm].some((n) => Number.isNaN(n))) return null;
  const risingDate = new Date(y, m - 1, d, hh, mm, 0, 0);
  return risingDate.getTime() - ritual.reminderMinutesBefore * 60 * 1000;
}

/**
 * Play a gentle offline harmonic chime using Web Audio API
 */
export function playRitualChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99]; // C5 - E5 - G5 soft chord
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + idx * 0.14;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.09, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 1.15);
    });
  } catch {
    // Audio playback may be blocked prior to user gesture
  }
}

/**
 * Export scheduled rituals as an .ics iCalendar file with VALARM notifications
 */
export function exportRitualsToIcs(rituals: ScheduledRitual[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zij as-Sindhind//Manzil Ritual Scheduler//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Jadwal Ritual Terbit Manzil',
  ];

  const pad2 = (n: number) => String(n).padStart(2, '0');

  rituals.forEach((r) => {
    const [y, m, d] = r.dateISO.split('-').map((n) => parseInt(n, 10));
    const [hh, mm] = r.risingTime.split(':').map((n) => parseInt(n, 10));
    if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return;

    const start = new Date(y, m - 1, d, hh, mm, 0);
    const end = new Date(start.getTime() + 35 * 60 * 1000);

    const fmtLocal = (dt: Date) =>
      `${dt.getFullYear()}${pad2(dt.getMonth() + 1)}${pad2(dt.getDate())}T${pad2(dt.getHours())}${pad2(dt.getMinutes())}00`;

    const desc = [
      `Amalan / Ritual: ${r.title}`,
      `Manzil #${r.manzilNumber}: ${r.manzilArabic} (${r.manzilTransliteration})`,
      `Waktu Terbit (Rising): ${r.risingTime} - ${r.windowEnd}`,
      `Penguasa Jam Falak: ${r.planetaryHour}`,
      `Lokasi Pengamat: ${r.locationName}`,
      r.notes ? `Catatan: ${r.notes}` : '',
    ]
      .filter(Boolean)
      .join('\\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:ritual-${r.id}@zij-sindhind.app`,
      `DTSTART:${fmtLocal(start)}`,
      `DTEND:${fmtLocal(end)}`,
      `SUMMARY:${r.title} (Terbit Manzil #${r.manzilNumber} ${r.manzilTransliteration})`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${r.locationName}`,
      'BEGIN:VALARM',
      `TRIGGER:-PT${Math.max(1, r.reminderMinutesBefore)}M`,
      'ACTION:DISPLAY',
      `DESCRIPTION:Pengingat Terbit Manzil #${r.manzilNumber} ${r.manzilTransliteration} untuk ${r.title}`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
