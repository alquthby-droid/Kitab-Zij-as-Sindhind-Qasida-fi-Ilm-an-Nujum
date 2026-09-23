/**
 * Secondary Progressions Calculation Engine
 * (عِلْمُ التَّسْيِيرِ الثَّانَوِيِّ فِي زِيجِ السِّنْدِهِنْدِ - يَوْمٌ لِكُلِّ سَنَةٍ)
 *
 * Classical Principles:
 * - 1 Solar Day of Planetary Movement after Birth = 1 Solar Year of Lived Life.
 * - Classical source: Zij as-Sindhind (al-Khwarizmi, al-Fazari),
 *   Abu Ma'shar's Kitab al-Milal wa ad-Duwal, and Al-Biruni's Kitab at-Tafhim.
 * - Progressed Moon (Al-Qamar al-Muntasyir): primary clock of emotional/character evolution (~13°/year).
 * - Progressed Sun (Ash-Shams al-Muntasyirah): primary clock of destiny, vitality and identity (~1°/year).
 * - Progressed Lunar Phases: 8 distinct 30-year macro-cycles of psychological fruition.
 */

import {
  PlanetKey,
  PlanetaryPosition,
  ZodiacSign,
  LunarMansion,
  HistoricalDateInfo,
} from '../types';
import {
  calculateSindhindPositions,
  ZODIAC_SIGNS,
  PLANETS_INFO,
  LUNAR_MANSIONS,
} from './sindhindEngine';
import { dateToJdn, jdnToGregorian, getFullHistoricalDate } from './calendarConverter';

export interface ProgressedLunarPhase {
  phaseIndex: number; // 0 to 7
  phaseKey: 'new_moon' | 'crescent' | 'first_quarter' | 'gibbous' | 'full_moon' | 'disseminating' | 'last_quarter' | 'balsamic';
  arabicName: string;
  transliteration: string;
  latinName: string;
  symbol: string;
  phaseAngle: number; // 0 - 360
  illuminationPercent: number;
  stageTitle: string;
  psychologicalFocus: string;
  spiritualWisdom: string;
  advisoryText: string;
}

export interface ProgressedAspectToNatal {
  id: string;
  progressedPlanet: PlanetKey;
  natalPlanet: PlanetKey;
  aspectType: 'qiran' | 'tasdis' | 'tarbi' | 'tathlith' | 'muqabalah';
  aspectArabic: string;
  aspectLatin: string;
  symbol: string;
  orb: number;
  isExact: boolean;
  nature: 'Sa\'d' | 'Nahs' | 'Mu\'tadil';
  natureArabic: string;
  title: string;
  characterImpact: string;
  lifeDomain: string;
}

export interface ProgressedPlanetSummary {
  key: PlanetKey;
  arabicName: string;
  latinName: string;
  symbol: string;
  color: string;

  // Natal State
  natalLongitude: number;
  natalSign: ZodiacSign;
  natalDegreeInSign: number;
  natalManzil: LunarMansion;
  natalHouse: number;

  // Progressed State
  progressedLongitude: number;
  progressedSign: ZodiacSign;
  progressedDegreeInSign: number;
  progressedManzil: LunarMansion;
  progressedHouse: number;

  // Movement & Transformation
  degreesTraveled: number; // Total degrees moved from natal
  hasChangedSign: boolean;
  hasChangedManzil: boolean;
  speedPerYear: string;
  characterSignificance: string;
}

export interface SufiPsychologyStage {
  stageKey: 'ammarah' | 'lawwamah' | 'mulhamah' | 'mutmainnah';
  arabicName: string;
  transliteration: string;
  meaning: string;
  ageSpan: string;
  stateOfHeart: string;
  centralStruggle: string;
  spiritualMilestone: string;
}

export interface AnnualProgressionReport {
  age: number;
  currentCalendarYear: number;
  birthJdn: number;
  progressedJdn: number;
  progressedDateInfo: HistoricalDateInfo;

  // Progressed Planets
  planets: Record<PlanetKey, ProgressedPlanetSummary>;

  // Lunar Phase of Progression
  progressedLunarPhase: ProgressedLunarPhase;

  // Aspects between Progressed and Natal
  aspectsToNatal: ProgressedAspectToNatal[];

  // Sufi Character Evolution
  sufiStage: SufiPsychologyStage;

  // Elemental balance
  natalDominantElement: 'Nar' | 'Turab' | 'Hawa' | 'Ma';
  progressedDominantElement: 'Nar' | 'Turab' | 'Hawa' | 'Ma';
  elementShiftNarrative: string;

  // Core Annual Theme & Verdict
  primaryLifeTheme: string;
  innerEvolutionSummary: string;
  muamalahAdvice: string;
  classicalVerse: {
    arabic: string;
    transliteration: string;
    translation: string;
    source: string;
  };
}

export interface MilestoneEvent {
  age: number;
  year: number;
  type: 'lunar_phase' | 'sign_ingress' | 'manzil_ingress' | 'major_aspect';
  planet: PlanetKey;
  title: string;
  arabicTitle: string;
  description: string;
  tone: 'pemberkahan' | 'tantangan' | 'transformasi' | 'kematangan' | 'hening';
}

export interface ProgressionPresetProfile {
  id: string;
  name: string;
  arabicName: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  locationName: string;
  biographicalNote: string;
  notableMilestoneAges: { age: number; event: string }[];
}

// ============================================================================
// PRESET PROFILES
// ============================================================================

export const PROGRESSION_PRESETS: ProgressionPresetProfile[] = [
  {
    id: 'ibn_sina',
    name: 'Ibnu Sina (Avicenna)',
    arabicName: 'أَبُو عَلِي الحُسَيْن بن عَبْدِ الله بن سِينَا',
    year: 980,
    month: 8,
    day: 23,
    hour: 5,
    minute: 30,
    latitude: 39.7747,
    longitude: 64.4286,
    locationName: 'Afshana, Bukhara',
    biographicalNote: 'Bapak kedokteran modern, pengarang Al-Qanun fi at-Tibb dan Asy-Syifa\'. Menghafal Al-Qur\'an usia 10 tahun dan menjadi dokter istana usia 18 tahun.',
    notableMilestoneAges: [
      { age: 10, event: 'Khatam Al-Qur\'an & Fikih Bukhara' },
      { age: 18, event: 'Menyembuhkan Sultan Nuh bin Mansur' },
      { age: 32, event: 'Mulai Menulis Al-Qanun fi at-Tibb' },
      { age: 44, event: 'Puncak Kepengarangan Ensiklopedia Asy-Syifa\'' },
    ],
  },
  {
    id: 'al_biruni',
    name: 'Abu Rayhan Al-Biruni',
    arabicName: 'أَبُو الرَّيْحَانِ مُحَمَّدُ بن أَحْمَدَ البِيرُونِيّ',
    year: 973,
    month: 9,
    day: 4,
    hour: 6,
    minute: 15,
    latitude: 41.5562,
    longitude: 60.6315,
    locationName: 'Kath, Khwarizm',
    biographicalNote: 'Pakar falak, trigonometri dan kartografi pengarang Kitab at-Tafhim dan Al-Qanun al-Mas\'udi. Pengukur keliling bumi terakurat di zamannya.',
    notableMilestoneAges: [
      { age: 17, event: 'Pengukuran Lintang Kath Pertama' },
      { age: 27, event: 'Karya Agung Al-Athar al-Baqiyah' },
      { age: 44, event: 'Ekspedisi Penelitian India (Tahqiq ma li-al-Hind)' },
    ],
  },
  {
    id: 'al_fatih',
    name: 'Sultan Muhammad Al-Fatih (Mehmed II)',
    arabicName: 'السُّلْطَانُ مُحَمَّدُ الثَّانِي الفَاتِح',
    year: 1432,
    month: 3,
    day: 30,
    hour: 3,
    minute: 0,
    latitude: 41.6772,
    longitude: 26.5557,
    locationName: 'Edirne, Utsmaniyah',
    biographicalNote: 'Pemimpin muda penakluk Konstantinopel pada usia 21 tahun, menguasai 7 bahasa, saintis militer, perancang meriam raksasa Urban Basilic.',
    notableMilestoneAges: [
      { age: 12, event: 'Naik Takhta Pertama Masa Krisis' },
      { age: 19, event: 'Kembali Menjadi Sultan Berdaulat Penuh' },
      { age: 21, event: 'Penaklukan Agung Konstantinopel (1453 M)' },
      { age: 38, event: 'Ekspansi Otranto & Kodifikasi Kanunname' },
    ],
  },
  {
    id: 'gus_dur',
    name: 'KH. Abdurrahman Wahid (Gus Dur)',
    arabicName: 'عَبْدُ الرَّحْمَنِ وَاحِد (غُوس دُور)',
    year: 1940,
    month: 9,
    day: 7,
    hour: 12,
    minute: 30,
    latitude: -7.5469,
    longitude: 112.2331,
    locationName: 'Jombang, Jawa Timur',
    biographicalNote: 'Presiden ke-4 RI, cendekiawan Muslim pejuang hak minoritas, pemikir pluralisme dan kemanusiaan universal Nusantara.',
    notableMilestoneAges: [
      { age: 24, event: 'Studi Al-Azhar Kairo & Baghdad' },
      { age: 44, event: 'Terpilih Jadi Ketua Umum PBNU (Muktamar Situbondo 1984)' },
      { age: 50, event: 'Mendirikan Forum Demokrasi & Gerakan Kemanusiaan' },
    ],
  },
  {
    id: 'habibie',
    name: 'B.J. Habibie',
    arabicName: 'بَحْرُ الدِّينِ يُوسُف حَبِيبِي',
    year: 1936,
    month: 6,
    day: 25,
    hour: 19,
    minute: 0,
    latitude: -4.0108,
    longitude: 119.6264,
    locationName: 'Parepare, Sulawesi Selatan',
    biographicalNote: 'Presiden ke-3 RI, pakar aeronautika dunia penemu Teori Crack Habibie, peletak fondasi industri teknologi tinggi dan transisi demokrasi Indonesia.',
    notableMilestoneAges: [
      { age: 28, event: 'Doktor Teknik Jerman & Teori Crack Progression' },
      { age: 38, event: 'Dipanggil Pulang Mendirikan IPTN / N-250' },
      { age: 42, event: 'Menteri Negara Riset dan Teknologi' },
    ],
  },
  {
    id: 'kartini',
    name: 'R.A. Kartini',
    arabicName: 'رَادِين أَنْجِينج كَارْتِينِي',
    year: 1879,
    month: 4,
    day: 21,
    hour: 5,
    minute: 0,
    latitude: -6.7487,
    longitude: 110.6725,
    locationName: 'Mayong, Jepara',
    biographicalNote: 'Pahlawan pelopor emansipasi wanita, literasi pencerahan, dan pengajar budi pekerti luhur anak bangsa Nusantara.',
    notableMilestoneAges: [
      { age: 12, event: 'Awal Masa Pingitan & Korespondensi Eropa' },
      { age: 20, event: 'Menuliskan Pikiran Habis Gelap Terbitlah Terang' },
      { age: 24, event: 'Mendirikan Sekolah Kartini Jepara' },
    ],
  },
];

// ============================================================================
// CLASSICAL PROGRESSED LUNAR PHASES DEFINITIONS (8 ADWAR AL-QAMAR)
// ============================================================================

export const PROGRESSED_LUNAR_PHASES_DATA = [
  {
    phaseKey: 'new_moon' as const,
    minAngle: 0,
    maxAngle: 45,
    arabicName: 'المُحَاقُ الجَدِيد وَالهِلَالُ الأَوَّل',
    transliteration: 'Al-Hilal al-Jadid',
    latinName: 'Progressed New Moon',
    symbol: '🌑',
    stageTitle: 'Babak Penanaman Benih Hidup (The Seed Planting Era)',
    psychologicalFocus: 'Insting pembaruan, pembersihan siklus masa lalu, dan peletakan visi hidup 30 tahun baru secara mendalam.',
    spiritualWisdom: 'Jiwa kembali ke keadaan fithrah bening; saat yang suci untuk merumuskan niat suci (tashhih an-niyyah) tanpa terikat beban silam.',
    advisoryText: 'Jangan terburu-buru menuntut buah hasil yang kasat mata. Rawatlah benih kesadaran baru ini dengan istiqamah dan doa hening.',
  },
  {
    phaseKey: 'crescent' as const,
    minAngle: 45,
    maxAngle: 90,
    arabicName: 'هِلَالُ التَّأْسِيسِ وَالنُّمُوّ',
    transliteration: 'Hilal at-Ta\'sis',
    latinName: 'Progressed Crescent Moon',
    symbol: '🌒',
    stageTitle: 'Babak Perjuangan Menembus Rintangan (The Emergence & Breakthrough)',
    psychologicalFocus: 'Mengatasi rasa gentar menghadapi dunia luar, penguatan fondasi keberanian, dan pengorbanan tenaga untuk bertumbuh.',
    spiritualWisdom: 'Benih yang terbenam dalam tanah mulai mendobrak kerak bumi demi menggapai cahaya matahari rahmat Ilahi.',
    advisoryText: 'Kuatkan disiplin kerja dan bangun jejaring pertemanan yang saling menguatkan kebaikan. Singkirkan keraguan batin.',
  },
  {
    phaseKey: 'first_quarter' as const,
    minAngle: 90,
    maxAngle: 135,
    arabicName: 'التَّرْبِيعُ الأَوَّل: كُرْبَةُ الفِعْل',
    transliteration: 'At-Tarbi\' al-Awwal',
    latinName: 'Progressed First Quarter',
    symbol: '🌓',
    stageTitle: 'Babak Krisis Aksi & Ketegasan (Crisis in Action & Decision)',
    psychologicalFocus: 'Pilihan berani merombak kebiasaan lama, konfrontasi konstruktif, pembuktian kompetensi dan keberanian mengambil risiko.',
    spiritualWisdom: 'Saat iman diuji lewat ketegasan memilih yang hak di hadapan keraguan; pedang tekad (azm) harus dihunus dengan tawakkal.',
    advisoryText: 'Hindari sikap plin-plan. Ambil tanggung jawab kepemimpinan penuh atas nasib diri dan jangan menyalahkan masa lalu.',
  },
  {
    phaseKey: 'gibbous' as const,
    minAngle: 135,
    maxAngle: 180,
    arabicName: 'الأَحْدَبُ الأَوَّل: صَقْلُ المَهَارَة',
    transliteration: 'Al-Ahdab al-Awwal',
    latinName: 'Progressed Gibbous Moon',
    symbol: '🌔',
    stageTitle: 'Babak Pemurnian & Ketelitian (Refinement & Mastery)',
    psychologicalFocus: 'Menyempurnakan karya, ketelitian metode, analisis mendalam, dan pematangan profesionalisme sebelum panen raya.',
    spiritualWisdom: 'Proses riyadhah batin dan penyucian jiwa (tazkiyah); menempa logam mentah menjadi pedang mustika yang berkilau.',
    advisoryText: 'Fokus pada peningkatan kualitas bukan sekadar kuantitas. Mintalah koreksi dari guru pembimbing atau sahabat berilmu.',
  },
  {
    phaseKey: 'full_moon' as const,
    minAngle: 180,
    maxAngle: 225,
    arabicName: 'البَدْرُ الكَامِل: كَمَالُ الظُّهُور',
    transliteration: 'Al-Badr al-Kamil',
    latinName: 'Progressed Full Moon',
    symbol: '🌕',
    stageTitle: 'Puncak Pencerahan & Visibilitas (The Culmination & Illumination)',
    psychologicalFocus: 'Kesadaran penuh atas jati diri sejati, pembuahan cita-cita, penerimaan pengakuan luas, atau kejelasan mutlak realitas.',
    spiritualWisdom: 'Hati yang bening memantulkan cahaya makrifat seutuhnya; segala tirai tersingkap dan hakikat perkara tampak nyata tanpa tabir.',
    advisoryText: 'Syukuri nikmat dengan membagikan kebaikan. Jangan biarkan riya\' atau keangkuhan meredupkan cahaya berkah yang sedang melimpah.',
  },
  {
    phaseKey: 'disseminating' as const,
    minAngle: 225,
    maxAngle: 270,
    arabicName: 'الأَحْدَبُ الثَّانِي: بَثُّ الحِكْمَة',
    transliteration: 'Al-Ahdab ath-Thani',
    latinName: 'Progressed Disseminating Moon',
    symbol: '🌖',
    stageTitle: 'Babak Berbagi Ilmu & Mentorship (Sharing & Distribution)',
    psychologicalFocus: 'Menyalurkan pengalaman berharga kepada generasi penerus, pengabdian sosial, pengajaran, dan dedikasi nilai luhur.',
    spiritualWisdom: 'Pohon rimbun yang telah berbuah lebat menunduk tawadhu\' membagikan buahnya kepada para musafir lapar di jalan Allah.',
    advisoryText: 'Aktiflah mengajar, menulis catatan hikmah, atau mendirikan wadah sosial yang abadi (amal jariyah).',
  },
  {
    phaseKey: 'last_quarter' as const,
    minAngle: 270,
    maxAngle: 315,
    arabicName: 'التَّرْبِيعُ الثَّانِي: كُرْبَةُ الوَعْي',
    transliteration: 'At-Tarbi\' ath-Thani',
    latinName: 'Progressed Last Quarter',
    symbol: '🌗',
    stageTitle: 'Krisis Kesadaran & Reorientasi (Crisis in Consciousness & Pivot)',
    psychologicalFocus: 'Merombak paradigma yang sudah usang, melepaskan keterikatan struktural formal, dan merintis reorientasi batiniah.',
    spiritualWisdom: 'Zuhud yang matang; memilah mana yang abadi untuk akhirat dan mana hiasan fana dunia yang harus diikhlaskan dengan lapang dada.',
    advisoryText: 'Bersiaplah menyederhanakan ritme hidup. Jangan memaksakan diri mempertahankan status quo yang tidak lagi menumbuhkan jiwa.',
  },
  {
    phaseKey: 'balsamic' as const,
    minAngle: 315,
    maxAngle: 360,
    arabicName: 'المُحَاقُ الرُّوحِيُّ وَالسُّكُون',
    transliteration: 'Al-Muhaq ar-Ruhi',
    latinName: 'Progressed Balsamic Moon',
    symbol: '🌘',
    stageTitle: 'Babak Hening & Penyerahan Diri (Incubation, Rest & Surrender)',
    psychologicalFocus: 'Penyembuhan luka batin lama, keheningan kontemplatif, penuntasan utang karma hidup, dan persiapan suci siklus baru.',
    spiritualWisdom: 'Malam Lailatul Qadar jiwa; dalam kegelapan suci sebelum fajar terbit, tersimpan ketenteraman abadi bersama Sang Khaliq.',
    advisoryText: 'Perbanyak uzlah positif, ibadah munajat hening, dan maafkan semua orang yang pernah berselisih. Bersiaplah lahir kembali.',
  },
];

// ============================================================================
// SUFI CHARACTER EVOLUTION PHASES
// ============================================================================

export function getSufiStageByAge(age: number): SufiPsychologyStage {
  if (age <= 14) {
    return {
      stageKey: 'ammarah',
      arabicName: 'مَرْحَلَةُ التَّكْوِينِ وَالفِطْرَة',
      transliteration: 'Marhalat at-Takwin wa al-Fitrah',
      meaning: 'Fase Fitrah, Penyerapan Sensorik & Pembentukan Watak Dasar',
      ageSpan: 'Usia 0 - 14 Tahun',
      stateOfHeart: 'Qalb Thifli (Hati murni bak kertas putih menyerap teladan lingkungan)',
      centralStruggle: 'Penanaman adab, penjinakan ego naluriah awal, dan pengenalan norma sosial.',
      spiritualMilestone: 'Pembentukan fitrah tauhid dan fondasi rasa aman emosional seumur hidup.',
    };
  } else if (age <= 28) {
    return {
      stageKey: 'ammarah',
      arabicName: 'مَرْحَلَةُ النَّفْسِ الأَمَّارَةِ وَالاِكْتِشَاف',
      transliteration: 'Marhalat an-Nafs al-Ammarah wa al-Iktisyaf',
      meaning: 'Fase Gelora Pencarian Jati Diri, Ambisi & Pembuktian Eksistensi',
      ageSpan: 'Usia 15 - 28 Tahun',
      stateOfHeart: 'Ghalayan ad-Dam (Darah muda bergolak penuh gairah cita-cita dan hasrat independensi)',
      centralStruggle: 'Menundukkan hawa nafsu impulsif menuju disiplin ilmu dan tanggung jawab mandiri.',
      spiritualMilestone: 'Menemukan panggilan jiwa (dharma / risalah pribadi) dan menempa ketahanan mental.',
    };
  } else if (age <= 42) {
    return {
      stageKey: 'lawwamah',
      arabicName: 'مَرْحَلَةُ النَّفْسِ اللَّوَّامَةِ وَالبِنَاء',
      transliteration: 'Marhalat an-Nafs al-Lawwamah wa al-Bina\'',
      meaning: 'Fase Konsolidasi Karier, Pemurnian Nilai & Nurani Kritis',
      ageSpan: 'Usia 29 - 42 Tahun',
      stateOfHeart: 'Yaqazah Batiniah (Kesadaran kritis atas kekurangan diri dan tuntutan integritas)',
      centralStruggle: 'Menyeimbangkan tuntutan kesuksesan duniawi dengan ketenangan nurani spiritual.',
      spiritualMilestone: 'Pematangan keahlian, pembentukan keluarga mandiri, dan kepemimpinan berwibawa.',
    };
  } else {
    return {
      stageKey: 'mulhamah',
      arabicName: 'مَرْحَلَةُ النَّفْسِ المُلْهَمَةِ وَالحِكْمَة',
      transliteration: 'Marhalat an-Nafs al-Mulhamah wa al-Hikmah',
      meaning: 'Fase Kematangan Kebijaksanaan, Inspirasi Luhur & Warisan Abadi',
      ageSpan: 'Usia 43 - 50+ Tahun',
      stateOfHeart: 'Thuma\'ninah wa Sakinah (Kedamaian hati yang ridha dan memancarkan hikmah menyejukkan)',
      centralStruggle: 'Menjaga keikhlasan amal, mewariskan ilmu tanpa pamrih, dan merawat kedekatan Ilahiah.',
      spiritualMilestone: 'Mencapai derajat Mutmainnah (jiwa yang tenang), kearifan holistik, dan keteladanan.',
    };
  }
}

// ============================================================================
// HELPER CALCULATIONS
// ============================================================================

export function getMansionFromDegree(deg: number): LunarMansion {
  const norm = ((deg % 360) + 360) % 360;
  const idx = Math.min(27, Math.max(0, Math.floor(norm / (360 / 28))));
  return LUNAR_MANSIONS[idx];
}

/**
 * Calculate the progressed lunar phase based on angle between progressed Moon and Sun
 */
export function calculateProgressedLunarPhase(
  progSunLong: number,
  progMoonLong: number
): ProgressedLunarPhase {
  const angle = ((progMoonLong - progSunLong + 360) % 360);
  const phaseData = PROGRESSED_LUNAR_PHASES_DATA.find(
    (p) => angle >= p.minAngle && angle < p.maxAngle
  ) || PROGRESSED_LUNAR_PHASES_DATA[0];

  const phaseIndex = PROGRESSED_LUNAR_PHASES_DATA.indexOf(phaseData);
  // Illumination calculation (0% at 0°, 100% at 180°, 0% at 360°)
  const illuminationPercent = Math.round(
    ((1 - Math.cos((angle * Math.PI) / 180)) / 2) * 100
  );

  return {
    phaseIndex,
    phaseKey: phaseData.phaseKey,
    arabicName: phaseData.arabicName,
    transliteration: phaseData.transliteration,
    latinName: phaseData.latinName,
    symbol: phaseData.symbol,
    phaseAngle: Math.round(angle * 10) / 10,
    illuminationPercent,
    stageTitle: phaseData.stageTitle,
    psychologicalFocus: phaseData.psychologicalFocus,
    spiritualWisdom: phaseData.spiritualWisdom,
    advisoryText: phaseData.advisoryText,
  };
}

/**
 * Aspect definitions between Progressed and Natal planets
 */
const PROGRESSED_ASPECT_TYPES: {
  type: ProgressedAspectToNatal['aspectType'];
  arabic: string;
  latin: string;
  symbol: string;
  exactAngle: number;
  allowedOrb: number;
  nature: ProgressedAspectToNatal['nature'];
  natureArabic: string;
}[] = [
  { type: 'qiran', arabic: 'مُقَارَنَة (قِرَان)', latin: 'Conjunction', symbol: '☌', exactAngle: 0, allowedOrb: 1.5, nature: 'Mu\'tadil', natureArabic: 'مُعْتَدِل' },
  { type: 'tasdis', arabic: 'تَسْدِيس', latin: 'Sextile', symbol: '⚹', exactAngle: 60, allowedOrb: 1.2, nature: 'Sa\'d', natureArabic: 'سَعْد' },
  { type: 'tarbi', arabic: 'تَرْبِيع', latin: 'Square', symbol: '□', exactAngle: 90, allowedOrb: 1.5, nature: 'Nahs', natureArabic: 'نَحْس' },
  { type: 'tathlith', arabic: 'تَثْلِيث', latin: 'Trine', symbol: '△', exactAngle: 120, allowedOrb: 1.5, nature: 'Sa\'d', natureArabic: 'سَعْد' },
  { type: 'muqabalah', arabic: 'مُقَابَلَة', latin: 'Opposition', symbol: '☍', exactAngle: 180, allowedOrb: 1.5, nature: 'Nahs', natureArabic: 'نَحْس' },
];

/**
 * Detect aspects formed between a Progressed planet and a Natal planet
 */
export function detectProgressedToNatalAspects(
  natalPositions: Record<PlanetKey, PlanetaryPosition>,
  progressedPositions: Record<PlanetKey, PlanetaryPosition>
): ProgressedAspectToNatal[] {
  const activeAspects: ProgressedAspectToNatal[] = [];
  const pKeys: PlanetKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

  for (const progKey of pKeys) {
    const pProg = progressedPositions[progKey];
    if (!pProg) continue;
    const progLong = pProg.trueLongitude;

    for (const natKey of pKeys) {
      const pNat = natalPositions[natKey];
      if (!pNat) continue;
      const natLong = pNat.trueLongitude;

      // Angular distance (0 to 180)
      const diffAngle = Math.abs(((progLong - natLong + 180 + 360) % 360) - 180);

      for (const aspDef of PROGRESSED_ASPECT_TYPES) {
        const orb = Math.abs(diffAngle - aspDef.exactAngle);
        if (orb <= aspDef.allowedOrb) {
          const isExact = orb <= 0.35;
          const progInfo = PLANETS_INFO[progKey];
          const natInfo = PLANETS_INFO[natKey];

          let title = `${aspDef.latin} Progresi: ${progInfo.transliteration} ke ${natInfo.transliteration} Asal`;
          let lifeDomain = 'Pengembangan Diri & Karakter';
          let characterImpact = '';

          if (progKey === 'moon') {
            lifeDomain = 'Kematangan Emosi & Hubungan Batin';
            characterImpact = `Rembulan Progresi mengaktifkan energi batiniah ${natInfo.transliteration}. Periode ini memicu respons rasa mendalam, keterbukaan hati, atau penataan ulang prioritas kenyamanan hidup.`;
          } else if (progKey === 'sun') {
            lifeDomain = 'Karier, Visi Hidup & Pengakuan';
            characterImpact = `Matahari Progresi menyinari ${natInfo.transliteration} asal. Ini menandai babak puncak pembuktian eksistensi diri, perwujudan kepemimpinan, dan keselarasan antara cita-cita dengan takdir.`;
          } else if (progKey === 'venus' || natKey === 'venus') {
            lifeDomain = 'Cinta Kasih, Harmoni & Nilai Luhur';
            characterImpact = `Menghangatkan rasa cinta, kedamaian rumah tangga, peningkatan apresiasi seni estetika, serta keterbukaan rezeki berkah.`;
          } else if (progKey === 'mars' || natKey === 'mars') {
            lifeDomain = 'Tekad Aksi, Keberanian & Ujian Ketahanan';
            characterImpact = `Menyalakan api semangat inisiatif. Perlu kehati-hatian mengendalikan amarah agar tidak terjadi gesekan tajam dengan mitra atau atasan.`;
          } else if (progKey === 'jupiter' || natKey === 'jupiter') {
            lifeDomain = 'Hikmah Keilmuan, Berkah & Spiritualitas';
            characterImpact = `Aspek kemuliaan agung yang memperluas cakrawala keilmuan, membuka pintu pertolongan tak terduga, dan memperdalam tawakal.`;
          } else if (progKey === 'saturn' || natKey === 'saturn') {
            lifeDomain = 'Disiplin, Fondasi Tanggung Jawab & Warisan';
            characterImpact = `Pematangan karakter melalui ujian kesabaran dan kerja keras nyata. Fondasi yang dibangun pada masa ini akan bertahan berpuluh tahun ke depan.`;
          } else {
            characterImpact = `Interaksi harmonis yang mematangkan daya nalar budi dan keluwesan bertutur kata.`;
          }

          activeAspects.push({
            id: `${progKey}_${natKey}_${aspDef.type}`,
            progressedPlanet: progKey,
            natalPlanet: natKey,
            aspectType: aspDef.type,
            aspectArabic: aspDef.arabic,
            aspectLatin: aspDef.latin,
            symbol: aspDef.symbol,
            orb: Math.round(orb * 100) / 100,
            isExact,
            nature: aspDef.nature,
            natureArabic: aspDef.natureArabic,
            title,
            characterImpact,
            lifeDomain,
          });
          break;
        }
      }
    }
  }

  // Sort by smallest orb (most exact first)
  return activeAspects.sort((a, b) => a.orb - b.orb);
}

/**
 * Classical Verse reference based on dominant planet/phase
 */
function getClassicalVerseForProgression(
  phaseKey: ProgressedLunarPhase['phaseKey'],
  dominantElement: 'Nar' | 'Turab' | 'Hawa' | 'Ma'
): AnnualProgressionReport['classicalVerse'] {
  if (phaseKey === 'full_moon') {
    return {
      arabic: 'وَإِذَا اسْتَتَبَّ لَكَ السُّرُورُ مَعَ الهُدَى • فَاشْكُرْ لِرَبِّكَ نِعْمَةَ الإِفْضَالِ',
      transliteration: 'Wa idha istatabba laka as-sururu ma\'a al-huda • Fasykur li-Rabbika ni\'mata al-ifdhal',
      translation: 'Dan apabila kegembiraan telah sempurna bagimu bersanding petunjuk hidayah, maka bersyukurlah kepada Rabbmu atas limpahan anugerah kemuliaan-Nya.',
      source: 'Qasida fi Hikmat al-Aflak wa at-Tasyir',
    };
  } else if (phaseKey === 'new_moon') {
    return {
      arabic: 'وَكُلُّ غِرَاسٍ فِي الطَّبِيعَةِ يَجْتَنِي • بِمِقْدَارِ صِدْقِ العَزْمِ وَالإِقْبَالِ',
      transliteration: 'Wa kullu ghirasin fi at-tabi\'ati yajtani • Bi-miqdari shidqi al-\'azmi wa al-iqbal',
      translation: 'Setiap benih yang ditanam di alam raya ini akan menuai hasil sebanding dengan ketulusan tekad dan kesungguhan langkahnya.',
      source: 'Zij as-Sindhind - Bab Matla\' as-Sinin',
    };
  } else if (dominantElement === 'Nar') {
    return {
      arabic: 'سَيْرُ اللَّيَالِي لِلنُّفُوسِ مُهَذِّبٌ • كَالنَّارِ تَجْلُو صَفْوَةَ العِقْيَانِ',
      transliteration: 'Sayru al-layali li-an-nufusi muhadh-dhibun • Ka-an-nari tajlu shafwata al-\'iqyani',
      translation: 'Perjalanan malam dan tahunan hidup itu mendidik jiwa, bagai api yang memurnikan emas murni dari segala kotoran.',
      source: 'Diwan al-Hikmah al-Falakiyyah',
    };
  } else {
    return {
      arabic: 'إِنَّ الزَّمَانَ وَإِنْ تَقَادَمَ عَهْدُهُ • يُبْدِي مِنَ الأَسْرَارِ كُلَّ خَفِيِّ',
      transliteration: 'Inna az-zamana wa in taqadama \'ahduhu • Yubdi mina al-asrari kulla khafiyyi',
      translation: 'Sesungguhnya sang waktu, meskipun berarak sekian lama, pasti akan menyingkapkan rahasia-rahasia batin yang tersembunyi.',
      source: 'Al-Biruni - Kitab at-Tafhim',
    };
  }
}

// ============================================================================
// MAIN PROGRESSION REPORT GENERATOR
// ============================================================================

export function calculateSecondaryProgressionReport(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number = 12,
  birthMinute: number = 0,
  targetAge: number = 0,
  latitude: number = 33.3152,
  longitude: number = 44.3661
): AnnualProgressionReport {
  const safeAge = Math.min(50, Math.max(0, targetAge));

  // 1. Calculate Birth Chart (Natal)
  const birthJdn = dateToJdn(birthYear, birthMonth, birthDay, birthHour, birthMinute);
  const natalChart = calculateSindhindPositions(birthJdn, latitude, longitude);

  // 2. Calculate Secondary Progressed Chart (1 day = 1 year)
  // Progressed JDN = birthJdn + ageInDays
  const progressedJdn = birthJdn + safeAge;
  const progressedChart = calculateSindhindPositions(progressedJdn, latitude, longitude);

  const progGreg = jdnToGregorian(progressedJdn);
  const progressedDateInfo = getFullHistoricalDate(progGreg.year, progGreg.month, progGreg.day);
  const currentCalendarYear = birthYear + safeAge;

  // 3. Planet comparison
  const pKeys: PlanetKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'];
  const planetsSummary: Partial<Record<PlanetKey, ProgressedPlanetSummary>> = {};

  const natalElementsCount = { Nar: 0, Turab: 0, Hawa: 0, Ma: 0 };
  const progElementsCount = { Nar: 0, Turab: 0, Hawa: 0, Ma: 0 };

  for (const key of pKeys) {
    const pNat = natalChart.positions[key];
    const pProg = progressedChart.positions[key];
    if (!pNat || !pProg) continue;

    const natSign = ZODIAC_SIGNS[pNat.coordinate.signIndex];
    const progSign = ZODIAC_SIGNS[pProg.coordinate.signIndex];

    natalElementsCount[natSign.element]++;
    progElementsCount[progSign.element]++;

    const natLong = pNat.trueLongitude;
    const progLong = pProg.trueLongitude;
    const degreesTraveled = ((progLong - natLong + 360) % 360);

    const hasChangedSign = pNat.coordinate.signIndex !== pProg.coordinate.signIndex;
    const natManzil = pNat.lunarMansion;
    const progManzil = pProg.lunarMansion;
    const hasChangedManzil = natManzil.number !== progManzil.number;

    let speedPerYear = '~1° per tahun';
    let characterSignificance = '';

    if (key === 'moon') {
      speedPerYear = '~13.2° per tahun (~1.1° per bulan)';
      characterSignificance = `Mengemban peran jam biologis batiniah paling aktif. Menempati rasi ${progSign.latinName} (${progSign.arabicName}) pada Manzil ke-${progManzil.number} (${progManzil.transliteration}). Ini mengarahkan fokus rasa pada: ${progManzil.indication}.`;
    } else if (key === 'sun') {
      speedPerYear = '~0.985° per tahun (~1° per tahun)';
      characterSignificance = `Matahari Progresi bergeser ${degreesTraveled.toFixed(1)}° sejak lahir. Bersemayam di rasi ${progSign.latinName}. Menjadi penentu arah panggilan hidup dan kepribadian inti yang semakin matang.`;
    } else if (key === 'mercury') {
      speedPerYear = '~1.1° per tahun';
      characterSignificance = `Mencerminkan cara berpikir, studi, dan literasi yang ${hasChangedSign ? 'mengalami revolusi gaya komunikasi baru' : 'semakin mendalam dalam pendekatan analisis'}.`;
    } else if (key === 'venus') {
      speedPerYear = '~1.2° per tahun';
      characterSignificance = `Menggambarkan kedewasaan dalam memandang cinta, komitmen rumah tangga, persahabatan, dan keluhuran selera keindahan.`;
    } else if (key === 'mars') {
      speedPerYear = '~0.52° per tahun';
      characterSignificance = `Mengarahkan daya juang fisik, stamina, keberanian mendobrak kesulitan, dan kepemimpinan dalam medan karya.`;
    } else if (key === 'jupiter') {
      speedPerYear = '~0.08° per tahun (pergerakan sangat lambat/dalam)';
      characterSignificance = `Fondasi keyakinan rohani, perluasan wawasan hikmah, dan kemurahan hati yang kokoh tak tergoyahkan.`;
    } else if (key === 'saturn') {
      speedPerYear = '~0.03° per tahun (pilar struktur abadi)';
      characterSignificance = `Tanggung jawab luhur, ketabahan menghadapi tempaan hidup, dan pemancangan fondasi warisan nama baik.`;
    } else {
      speedPerYear = '~0.05° per tahun (retrograde)';
      characterSignificance = `Simpul takdir ruhani (Al-Uqdatan) yang mengingatkan arah evolusi spiritual jiwa menuju ridha-Nya.`;
    }

    planetsSummary[key] = {
      key,
      arabicName: pNat.planet.arabicName,
      latinName: pNat.planet.transliteration,
      symbol: pNat.planet.symbol,
      color: pNat.planet.color,
      natalLongitude: natLong,
      natalSign: natSign,
      natalDegreeInSign: Math.floor(pNat.coordinate.signDegree),
      natalManzil: natManzil,
      natalHouse: pNat.houseNumber,
      progressedLongitude: progLong,
      progressedSign: progSign,
      progressedDegreeInSign: Math.floor(pProg.coordinate.signDegree),
      progressedManzil: progManzil,
      progressedHouse: pProg.houseNumber,
      degreesTraveled: Math.round(degreesTraveled * 100) / 100,
      hasChangedSign,
      hasChangedManzil,
      speedPerYear,
      characterSignificance,
    };
  }

  // 4. Progressed Lunar Phase
  const progSun = progressedChart.positions.sun;
  const progMoon = progressedChart.positions.moon;
  const progressedLunarPhase = calculateProgressedLunarPhase(
    progSun.trueLongitude,
    progMoon.trueLongitude
  );

  // 5. Aspects between Progressed and Natal
  const aspectsToNatal = detectProgressedToNatalAspects(
    natalChart.positions,
    progressedChart.positions
  );

  // 6. Sufi Stage
  const sufiStage = getSufiStageByAge(safeAge);

  // 7. Elemental Shift
  const natalDominantElement = (Object.entries(natalElementsCount).sort(
    (a, b) => b[1] - a[1]
  )[0][0] as 'Nar' | 'Turab' | 'Hawa' | 'Ma');

  const progressedDominantElement = (Object.entries(progElementsCount).sort(
    (a, b) => b[1] - a[1]
  )[0][0] as 'Nar' | 'Turab' | 'Hawa' | 'Ma');

  const elementNames = {
    Nar: 'Api (An-Nar - Semangat, Kepemimpinan, Keberanian)',
    Turab: 'Tanah (At-Turab - Kestabilan, Realisme, Ketekunan)',
    Hawa: 'Udara (Al-Hawa - Nalar, Komunikasi, Inovasi)',
    Ma: 'Air (Al-Ma\' - Empati, Kepekaan Batin, Kasih Sayang)',
  };

  let elementShiftNarrative = '';
  if (natalDominantElement === progressedDominantElement) {
    elementShiftNarrative = `Keseimbangan watak dasar tetap berakar kuat pada unsur ${elementNames[natalDominantElement]}, namun kini diperkaya kedewasaan pengalaman hidup.`;
  } else {
    elementShiftNarrative = `Terjadi pergeseran bertahap dari unsur bawaan lahir ${elementNames[natalDominantElement]} menuju unsur dominan progresi ${elementNames[progressedDominantElement]}. Karakter menjadi lebih lentur dan mampu merespons tantangan zaman dengan perspektif baru.`;
  }

  // 8. Verdicts & Annual Narrative
  const primaryLifeTheme = `Evolusi Usia ${safeAge} Tahun (${currentCalendarYear} M): ${progressedLunarPhase.stageTitle}`;

  const innerEvolutionSummary = `Berdasarkan kaidah Zij as-Sindhind (1 hari peredaran falak = 1 tahun usia insan), pada usia ${safeAge} tahun Sang Rembulan Progresi telah mengitari ${(safeAge * 13.2).toFixed(0)}° langit dan kini berada pada fase ${progressedLunarPhase.latinName} (${progressedLunarPhase.arabicName}). Di sisi lain, Matahari Progresi bergerak mantap di rasi ${planetsSummary.sun?.progressedSign.latinName}, memperkokoh wibawa jiwa. ${sufiStage.meaning}.`;

  const muamalahAdvice = `${progressedLunarPhase.advisoryText} Di ranah ikhtiar profesional dan muamalah sosial, fokuslah pada penyelarasan niat suci dengan karya yang berdaya tahan lama.`;

  const classicalVerse = getClassicalVerseForProgression(
    progressedLunarPhase.phaseKey,
    progressedDominantElement
  );

  return {
    age: safeAge,
    currentCalendarYear,
    birthJdn,
    progressedJdn,
    progressedDateInfo,
    planets: planetsSummary as Record<PlanetKey, ProgressedPlanetSummary>,
    progressedLunarPhase,
    aspectsToNatal,
    sufiStage,
    natalDominantElement,
    progressedDominantElement,
    elementShiftNarrative,
    primaryLifeTheme,
    innerEvolutionSummary,
    muamalahAdvice,
    classicalVerse,
  };
}

// ============================================================================
// 50-YEAR TIMELINE GENERATOR
// ============================================================================

export interface TimelineYearSummary {
  age: number;
  year: number;
  sunSign: string;
  sunDegree: number;
  moonSign: string;
  moonDegree: number;
  moonManzilNum: number;
  moonManzilName: string;
  lunarPhaseKey: string;
  lunarPhaseSymbol: string;
  lunarPhaseName: string;
  isSignIngress: boolean;
  ingressDescription?: string;
  isPhaseTransition: boolean;
  isNewMoon: boolean;
  isFullMoon: boolean;
  activeAspectsCount: number;
  highlightText: string;
}

export function generate50YearTimeline(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number = 12,
  birthMinute: number = 0,
  latitude: number = 33.3152,
  longitude: number = 44.3661
): TimelineYearSummary[] {
  const timeline: TimelineYearSummary[] = [];
  const birthJdn = dateToJdn(birthYear, birthMonth, birthDay, birthHour, birthMinute);

  let prevSunSignIdx = -1;
  let prevMoonSignIdx = -1;
  let prevPhaseKey = '';

  for (let age = 0; age <= 50; age++) {
    const progJdn = birthJdn + age;
    const chart = calculateSindhindPositions(progJdn, latitude, longitude);
    const sunPos = chart.positions.sun;
    const moonPos = chart.positions.moon;

    const sunSignIdx = sunPos.coordinate.signIndex;
    const moonSignIdx = moonPos.coordinate.signIndex;

    const phase = calculateProgressedLunarPhase(
      sunPos.trueLongitude,
      moonPos.trueLongitude
    );

    const isSunIngress = prevSunSignIdx !== -1 && sunSignIdx !== prevSunSignIdx;
    const isMoonIngress = prevMoonSignIdx !== -1 && moonSignIdx !== prevMoonSignIdx;
    const isSignIngress = isSunIngress || isMoonIngress;

    let ingressDescription = '';
    if (isSunIngress) {
      ingressDescription = `Matahari Progresi beralih ke ${ZODIAC_SIGNS[sunSignIdx].latinName}`;
    } else if (isMoonIngress) {
      ingressDescription = `Rembulan Progresi memasuki ${ZODIAC_SIGNS[moonSignIdx].latinName}`;
    }

    const isPhaseTransition = prevPhaseKey !== '' && prevPhaseKey !== phase.phaseKey;
    const isNewMoon = phase.phaseKey === 'new_moon' && isPhaseTransition;
    const isFullMoon = phase.phaseKey === 'full_moon' && isPhaseTransition;

    // Detect if key aspects are active
    const aspects = detectProgressedToNatalAspects(
      calculateSindhindPositions(birthJdn, latitude, longitude).positions,
      chart.positions
    );

    let highlightText = `${phase.symbol} ${phase.latinName}`;
    if (isNewMoon) {
      highlightText = '🌑 Awal Daur 30 Tahun (New Moon Progresi)';
    } else if (isFullMoon) {
      highlightText = '🌕 Puncak Purnama Progresi (Full Moon)';
    } else if (isSunIngress) {
      highlightText = `☀️ Ingress Matahari: ${ZODIAC_SIGNS[sunSignIdx].latinName}`;
    } else if (isMoonIngress) {
      highlightText = `🌙 Rembulan Masuk ${ZODIAC_SIGNS[moonSignIdx].latinName}`;
    } else if (aspects.length > 0) {
      highlightText = aspects[0].title;
    }

    timeline.push({
      age,
      year: birthYear + age,
      sunSign: ZODIAC_SIGNS[sunSignIdx].latinName,
      sunDegree: Math.floor(sunPos.coordinate.signDegree),
      moonSign: ZODIAC_SIGNS[moonSignIdx].latinName,
      moonDegree: Math.floor(moonPos.coordinate.signDegree),
      moonManzilNum: moonPos.lunarMansion.number,
      moonManzilName: moonPos.lunarMansion.transliteration,
      lunarPhaseKey: phase.phaseKey,
      lunarPhaseSymbol: phase.symbol,
      lunarPhaseName: phase.latinName,
      isSignIngress,
      ingressDescription,
      isPhaseTransition,
      isNewMoon,
      isFullMoon,
      activeAspectsCount: aspects.length,
      highlightText,
    });

    prevSunSignIdx = sunSignIdx;
    prevMoonSignIdx = moonSignIdx;
    prevPhaseKey = phase.phaseKey;
  }

  return timeline;
}
