/**
 * Ahkam al-Mawlayin Engine (أحكام الموليين والكواكب العلوية)
 * Classical Islamic Mundane Astrology based on Zij as-Sindhind,
 * Abu Ma'shar al-Balkhi's Kitab al-Milal wa-d-Duwal (Book of Religions and Dynasties),
 * and Al-Biruni's Kitab al-Tafhim li-Awa'il Sina'at al-Tanjim.
 *
 * Focuses on the Superior Planets (Al-Kawakib al-'Ulwiyyah):
 * - Saturn (Zuhal - Al-Mawla al-Awwal: Governance, Law, State Structure)
 * - Jupiter (Al-Mushtari - Al-Mawla ath-Thani: Justice, Economy, Public Welfare)
 * - Mars (Al-Mirrikh - Sahib as-Sayf: Security, Military, Collective Friction)
 */

import { PlanetKey, PlanetaryPosition, HistoricalDateInfo } from '../types';
import {
  calculateSindhindPositions,
  PLANETS_INFO,
  ZODIAC_SIGNS,
} from './sindhindEngine';
import { SINDHIND_ORB_OF_LIGHT, ASPECT_DEFINITIONS } from './aspectsEngine';
import { dateToJdn, getFullHistoricalDate, jdnToGregorian } from './calendarConverter';

export type SuperiorPlanetKey = 'saturn' | 'jupiter' | 'mars';

export type DignityLevel = 'Sharaf' | 'Bayt' | 'Muthallathah' | 'Gharib' | 'Hubut' | 'Wabal';

export interface SuperiorPlanetDignity {
  planet: SuperiorPlanetKey;
  position: PlanetaryPosition;
  signName: string;
  signArabic: string;
  signElement: 'Api' | 'Tanah' | 'Udara' | 'Air';
  signElementArabic: string;
  signModality: 'Kardinal (Munqalib)' | 'Tetap (Thabit)' | 'Ganda (Dhu Jasadayn)';
  dignity: DignityLevel;
  dignityScore: number; // -5 to +5
  dignityDescription: string;
  dignityArabic: string;
  isRetrograde: boolean;
  mundaneRole: string;
  mundaneRoleArabic: string;
}

export interface SuperiorAspectInteraction {
  id: string;
  planetA: SuperiorPlanetKey;
  planetB: SuperiorPlanetKey;
  aspectType: 'qiran' | 'tasdis' | 'tarbi' | 'tathlith' | 'muqabalah' | 'none';
  aspectArabic: string;
  aspectName: string;
  symbol: string;
  exactAngle: number;
  actualAngle: number;
  orbDifference: number;
  nature: 'Sa\'d' | 'Nahs' | 'Mu\'tadil';
  natureArabic: string;
  influencePower: number; // 0-100%
  mundaneTheme: string;
  societalImpact: string;
  historicalPrecedent: string;
}

export interface GrandConjunctionCycle {
  saturnLongitude: number;
  jupiterLongitude: number;
  angularSeparation: number;
  phase: 'Qiran Eksak' | 'Aproksimasi Qiran' | 'Separasi (Infisal)' | 'Fase Aspek Lain';
  activeTriplicity: 'Api (Hamal/Asad/Qaws)' | 'Tanah (Thawr/Sunbulah/Jady)' | 'Udara (Jawza/Mizan/Dalw)' | 'Air (Saratan/Aqrab/Hut)';
  activeTriplicityArabic: string;
  epochSignificance: string;
  approxYearsToNextExact: number;
}

export interface HistoricalMundanePreset {
  id: string;
  name: string;
  arabicName: string;
  year: number;
  month: number;
  day: number;
  location: string;
  historicalContext: string;
  historicalOutcome: string;
}

export interface AhkamMawlayinReport {
  dateInfo: HistoricalDateInfo;
  planetsDignity: Record<SuperiorPlanetKey, SuperiorPlanetDignity>;
  aspectInteractions: SuperiorAspectInteraction[];
  grandConjunction: GrandConjunctionCycle;
  metrics: {
    governanceStabilityIndex: number; // 0-100
    socialWelfareIndex: number; // 0-100
    publicSecurityIndex: number; // 0-100
    overallMundaneTone: 'Zaman Keadilan & Kemakmuran (Izdihar)' | 'Stabilitas Struktural & Reformasi' | 'Dinamika Kritis & Ujian Sosial' | 'Peringatan Ketegangan & Pengetatan' | 'Masa Transisi Besar (Tahawwul)';
    toneArabic: string;
    toneSummary: string;
    dominantRuler: 'Saturnus (Zuhal - Pengetatan & Hukum)' | 'Yupiter (Musytari - Keadilan & Rezeki)' | 'Mars (Mirrikh - Ketegasan Militer)' | 'Perimbangan Berimbang (Tawazun)';
    dominantRulerArabic: string;
  };
  sectorForecasts: {
    governanceAndState: {
      title: string;
      arabicTitle: string;
      verdict: string;
      detailedAnalysis: string;
      policyAdvice: string;
    };
    publicWelfareAndEconomy: {
      title: string;
      arabicTitle: string;
      verdict: string;
      detailedAnalysis: string;
      societalAdvice: string;
    };
    securityAndDefense: {
      title: string;
      arabicTitle: string;
      verdict: string;
      detailedAnalysis: string;
      securityAdvice: string;
    };
  };
  classicalQuote: {
    textArabic: string;
    textIndonesian: string;
    source: string;
    author: string;
  };
}

/**
 * Historical Mundane Presets for testing & study
 */
export const HISTORICAL_MUNDANE_PRESETS: HistoricalMundanePreset[] = [
  {
    id: 'baghdad_golden_age',
    name: 'Masa Keemasan Bayt al-Hikmah (Baghdad)',
    arabicName: 'عَصْرُ بَيْتِ الحِكْمَةِ بِبَغْدَاد',
    year: 813,
    month: 10,
    day: 1,
    location: 'Baghdad (Khilafah Abbasiyyah)',
    historicalContext: 'Awal kepemimpinan Khalifah Al-Ma\'mun, masa penerjemahan besar-besaran karya sains dan falak serta berdirinya peradaban ilmu pengetahuan terkaya di dunia.',
    historicalOutcome: 'Kombinasi harmonis Yupiter dan Saturnus melahirkan stabilitas moneter, kemajuan astronomi, dan toleransi akademik puncak.',
  },
  {
    id: 'nizam_al_mulk',
    name: 'Reformasi Wazir Nizam al-Mulk & Observatorium Malikshah',
    arabicName: 'إِصْلَاحَاتُ نِظَامِ المُلْكِ وَمَرْصَدُ مَلِكْشَاه',
    year: 1075,
    month: 3,
    day: 15,
    location: 'Isfahan (Kesultanan Seljuk)',
    historicalContext: 'Penyusunan kitab Siyasatnama (Kitab Tata Pemerintahan) oleh Wazir Agung Nizam al-Mulk dan pendirian Observatorium Agung Isfahan oleh Umar Khayyam.',
    historicalOutcome: 'Stabilitas birokrasi madrasah Nizhamiyyah, perapian administrasi perpajakan, dan pembakuan kalender Jalali.',
  },
  {
    id: 'salahuddin_syria',
    name: 'Penyatuan Wilayah Syam & Mesir oleh Sultan Shalahuddin',
    arabicName: 'تَوْحِيدُ الشَّامِ وَمِصْرَ بِقِيَادَةِ صَلَاحِ الدِّين',
    year: 1182,
    month: 6,
    day: 10,
    location: 'Damaskus / Kairo',
    historicalContext: 'Konsolidasi kekuatan militer berdisiplin tinggi, penertiban para panglima, dan pembelaan keamanan wilayah.',
    historicalOutcome: 'Penyatuan kekuatan pertahanan di bawah kepemimpinan berwibawa yang mengutamakan keluhuran etika dan keadilan hukum.',
  },
  {
    id: 'great_mutation_air_2020',
    name: 'Konjungsi Agung Saturnus-Yupiter 2020 (Transisi ke Unsur Udara)',
    arabicName: 'القِرَانُ الأَعْظَمُ فِي بُرْجِ الدَّلْو (انْتِقَالُ عُنْصُرِ الهَوَاء)',
    year: 2020,
    month: 12,
    day: 21,
    location: 'Global (0° Akuarius)',
    historicalContext: 'Konjungsi terdekat dalam 800 tahun yang menandai berakhirnya era konjungsi unsur Tanah (200 tahun materialisme & industri fisik) dan dimulainya era unsur Udara (jaringan data, digitalisasi, & desentralisasi sosial).',
    historicalOutcome: 'Transformasi radikal cara kerja masyarakat global, akselerasi ekonomi digital, dan redefinisi kedaulatan informasi.',
  },
];

/**
 * Classical Zodiac Sign Elements and Modalities
 */
const ZODIAC_PROPERTIES = [
  { element: 'Api' as const, elementArabic: 'نَارِيّ', modality: 'Kardinal (Munqalib)' as const }, // Aries (0)
  { element: 'Tanah' as const, elementArabic: 'تُرَابِيّ', modality: 'Tetap (Thabit)' as const }, // Taurus (1)
  { element: 'Udara' as const, elementArabic: 'هَوَائِيّ', modality: 'Ganda (Dhu Jasadayn)' as const }, // Gemini (2)
  { element: 'Air' as const, elementArabic: 'مَائِيّ', modality: 'Kardinal (Munqalib)' as const }, // Cancer (3)
  { element: 'Api' as const, elementArabic: 'نَارِيّ', modality: 'Tetap (Thabit)' as const }, // Leo (4)
  { element: 'Tanah' as const, elementArabic: 'تُرَابِيّ', modality: 'Ganda (Dhu Jasadayn)' as const }, // Virgo (5)
  { element: 'Udara' as const, elementArabic: 'هَوَائِيّ', modality: 'Kardinal (Munqalib)' as const }, // Libra (6)
  { element: 'Air' as const, elementArabic: 'مَائِيّ', modality: 'Tetap (Thabit)' as const }, // Scorpio (7)
  { element: 'Api' as const, elementArabic: 'نَارِيّ', modality: 'Ganda (Dhu Jasadayn)' as const }, // Sagittarius (8)
  { element: 'Tanah' as const, elementArabic: 'تُرَابِيّ', modality: 'Kardinal (Munqalib)' as const }, // Capricorn (9)
  { element: 'Udara' as const, elementArabic: 'هَوَائِيّ', modality: 'Tetap (Thabit)' as const }, // Aquarius (10)
  { element: 'Air' as const, elementArabic: 'مَائِيّ', modality: 'Ganda (Dhu Jasadayn)' as const }, // Pisces (11)
];

/**
 * Calculate Essential Dignity based on Sindhind & Classical Islamic Astrology
 */
function calculateMundaneDignity(
  planet: SuperiorPlanetKey,
  pos: PlanetaryPosition
): SuperiorPlanetDignity {
  const signIdx = pos.coordinate.signIndex;
  const signDegree = pos.coordinate.signDegree;
  const signInfo = ZODIAC_SIGNS[signIdx];
  const props = ZODIAC_PROPERTIES[signIdx];

  let dignity: DignityLevel = 'Gharib';
  let dignityScore = 0;
  let dignityDescription = 'Kedudukan netral biasa (al-kawkab al-gharib).';
  let dignityArabic = 'غَرِيب';

  // 1. Saturn
  if (planet === 'saturn') {
    if (signIdx === 9 || signIdx === 10) {
      // Capricorn or Aquarius: Domus (Bayt)
      dignity = 'Bayt';
      dignityScore = 5;
      dignityDescription = 'Berada di rumah takhta kekuasaannya sendiri (Jady / Dalw). Memperkokoh hukum, keteguhan birokrasi, dan ketertiban sistemik.';
      dignityArabic = 'فِي بَيْتِهِ (شِدَّةُ السُّلْطَان)';
    } else if (signIdx === 6) {
      // Libra: Exaltation (Sharaf)
      dignity = 'Sharaf';
      dignityScore = 4;
      dignityDescription = 'Mencapai derajat kemuliaan tertinggi (Sharaf fi al-Mizan). Keadilan struktural, ketegasan hakim agung, dan kepatuhan hukum tanpa pilih kasih.';
      dignityArabic = 'فِي شَرَفِهِ (عَدَالَةُ القَضَاء)';
    } else if (signIdx === 0) {
      // Aries: Fall (Hubut)
      dignity = 'Hubut';
      dignityScore = -4;
      dignityDescription = 'Jatuh dalam kehinaan kelemahan (Hubut fi al-Hamal). Birokrasi rapuh, pelemahan wibawa penguasa, dan kekakuan regulasi yang memicu friksi.';
      dignityArabic = 'فِي هُبُوطِهِ (ضَعْفُ النِّظَام)';
    } else if (signIdx === 3 || signIdx === 4) {
      // Cancer or Leo: Detriment (Wabal)
      dignity = 'Wabal';
      dignityScore = -5;
      dignityDescription = 'Mengalami kesukaran terasing (Wabal fi as-Saratan/al-Asad). Otoritarianisme kaku yang ditentang rakyat, kelambanan reformasi, atau kelesuan ekonomi.';
      dignityArabic = 'فِي وَبَالِهِ (اضْطِرَابُ السِّيَاسَة)';
    } else if (props.element === 'Udara') {
      dignity = 'Muthallathah';
      dignityScore = 2;
      dignityDescription = 'Berada di triplisitas sahabat udara, mendukung rasionalitas undang-undang.';
      dignityArabic = 'فِي مُثَلَّثَتِهِ';
    }
  }

  // 2. Jupiter
  if (planet === 'jupiter') {
    if (signIdx === 8 || signIdx === 11) {
      // Sagittarius or Pisces: Domus
      dignity = 'Bayt';
      dignityScore = 5;
      dignityDescription = 'Berada di singgasana keadilannya (al-Qaws / al-Hut). Kelimpahan rezeki rakyat, perbendaharaan negara makmur, dan kebijakan sarat kebajikan.';
      dignityArabic = 'فِي بَيْتِهِ (رَخَاءُ النَّاس)';
    } else if (signIdx === 3) {
      // Cancer: Exaltation
      dignity = 'Sharaf';
      dignityScore = 4;
      dignityDescription = 'Mencapai kemuliaan mutlak (Sharaf fi as-Saratan). Perekonomian rakyat subur, subsidi & pangan terjamin, dan persatuan sosial menguat.';
      dignityArabic = 'فِي شَرَفِهِ (بَرَكَةُ الرِّزْق)';
    } else if (signIdx === 9) {
      // Capricorn: Fall
      dignity = 'Hubut';
      dignityScore = -4;
      dignityDescription = 'Terkekang dalam kejatuhan (Hubut fi al-Jady). Penghematan anggaran ekstrem, beban pajak menekan kaum lemah, dan kelesuan kedermawanan sosial.';
      dignityArabic = 'فِي هُبُوطِهِ (تَعَسُّرُ المَعِيشَة)';
    } else if (signIdx === 2 || signIdx === 5) {
      // Gemini or Virgo: Detriment
      dignity = 'Wabal';
      dignityScore = -5;
      dignityDescription = 'Tersesat dalam pertimbangan berlebihan (Wabal fi al-Jawza/al-Sunbulah). Spekulasi finansial membingungkan, kebijakan ekonomi inkonsisten, dan krisis kepercayaan.';
      dignityArabic = 'فِي وَبَالِهِ (تَذَبْذُبُ الخِطَط)';
    } else if (props.element === 'Api') {
      dignity = 'Muthallathah';
      dignityScore = 2;
      dignityDescription = 'Didukung energi triplisitas api, mendorong inisiatif pembangunan besar.';
      dignityArabic = 'فِي مُثَلَّثَتِهِ';
    }
  }

  // 3. Mars
  if (planet === 'mars') {
    if (signIdx === 0 || signIdx === 7) {
      // Aries or Scorpio: Domus
      dignity = 'Bayt';
      dignityScore = 5;
      dignityDescription = 'Berada di markas kekuatannya (al-Hamal / al-Aqrab). Kekuatan militer berdaya tangkal tinggi, ketegasan aparat, dan keberanian eksekusi program berani.';
      dignityArabic = 'فِي بَيْتِهِ (قُوَّةُ الجُنْد)';
    } else if (signIdx === 9) {
      // Capricorn: Exaltation
      dignity = 'Sharaf';
      dignityScore = 4;
      dignityDescription = 'Mencapai kemuliaan strategis (Sharaf fi al-Jady). Disiplin tentara tertata rapi, komando militer terkendali hukum, dan perlindungan keamanan maksimal.';
      dignityArabic = 'فِي شَرَفِهِ (انْضِبَاطُ السَّيْف)';
    } else if (signIdx === 3) {
      // Cancer: Fall
      dignity = 'Hubut';
      dignityScore = -4;
      dignityDescription = 'Jatuh dalam kelemahan emosional (Hubut fi as-Saratan). Friksi internal aparat, kecerobohan taktis, atau ketidakstabilan emosi publik di akar rumput.';
      dignityArabic = 'فِي هُبُوطِهِ (اضْطِرَابُ الحِمَايَة)';
    } else if (signIdx === 1 || signIdx === 6) {
      // Taurus or Libra: Detriment
      dignity = 'Wabal';
      dignityScore = -5;
      dignityDescription = 'Terhambat dalam kompromi semu (Wabal fi ath-Thawr/al-Mizan). Kelambanan merespons ancaman, ketidaktegasan hukum, atau letupan protes tak terduga.';
      dignityArabic = 'فِي وَبَالِهِ (تَرَدُّدُ العَزْم)';
    } else if (props.element === 'Air') {
      dignity = 'Muthallathah';
      dignityScore = 2;
      dignityDescription = 'Triplisitas air memberikan ketajaman intelijen dan kewaspadaan tersembunyi.';
      dignityArabic = 'فِي مُثَلَّثَتِهِ';
    }
  }

  // Roles in Classical Mundane Astrology
  let mundaneRole = 'Pengatur Fondasi Negara & Hukum';
  let mundaneRoleArabic = 'المَوْلَى الأَوَّل - زُحَل (القَانُون وَالبُنْيَان)';
  if (planet === 'jupiter') {
    mundaneRole = 'Pemelihara Keadilan, Kas Negara, & Kesejahteraan';
    mundaneRoleArabic = 'المَوْلَى الثَّانِي - المُشْتَرِي (العَدْل وَالخَزِينَة)';
  } else if (planet === 'mars') {
    mundaneRole = 'Panglima Keamanan, Angkatan Bersenjata, & Dinamika Aksi';
    mundaneRoleArabic = 'صَاحِبُ السَّيْف - المِرِّيخ (الجَيْش وَالحَرَكَة)';
  }

  // Deduct if retrograde
  if (pos.isRetrograde) {
    dignityScore -= 2;
    dignityDescription += ' [Tawalluf / Raji\': Gerak mundur menandakan perlambatan, peninjauan ulang kebijakan masa lalu, atau audit ketat].';
  }

  return {
    planet,
    position: pos,
    signName: signInfo.latinName,
    signArabic: signInfo.arabicName,
    signElement: props.element,
    signElementArabic: props.elementArabic,
    signModality: props.modality,
    dignity,
    dignityScore,
    dignityDescription,
    dignityArabic,
    isRetrograde: pos.isRetrograde,
    mundaneRole,
    mundaneRoleArabic,
  };
}

/**
 * Compute the Aspect Interactions between Superior Planets
 */
function computeSuperiorAspects(
  dignities: Record<SuperiorPlanetKey, SuperiorPlanetDignity>
): SuperiorAspectInteraction[] {
  const pairs: [SuperiorPlanetKey, SuperiorPlanetKey][] = [
    ['saturn', 'jupiter'], // The Two Sovereigns (Al-Mawlayan)
    ['saturn', 'mars'], // The Two Infortunes (An-Nahsan)
    ['jupiter', 'mars'], // The Benefic & The Warrior (As-Sa'd wa Sahib as-Sayf)
  ];

  const interactions: SuperiorAspectInteraction[] = [];

  for (const [pA, pB] of pairs) {
    const posA = dignities[pA].position;
    const posB = dignities[pB].position;

    const diff = Math.abs(posA.trueLongitude - posB.trueLongitude);
    const angle = diff > 180 ? 360 - diff : diff;

    let matchedDef = null;
    let minOrbDiff = 999;

    for (const def of ASPECT_DEFINITIONS) {
      const orbDiff = Math.abs(angle - def.angle);
      const orbA = SINDHIND_ORB_OF_LIGHT[pA] || 9;
      const orbB = SINDHIND_ORB_OF_LIGHT[pB] || 9;
      const allowedOrb = (orbA + orbB) / 2;

      if (orbDiff <= allowedOrb && orbDiff < minOrbDiff) {
        minOrbDiff = orbDiff;
        matchedDef = def;
      }
    }

    if (matchedDef) {
      const power = Math.max(15, Math.round(100 - (minOrbDiff / 10) * 85));
      let mundaneTheme = '';
      let societalImpact = '';
      let historicalPrecedent = '';

      // Detailed thematic breakdowns
      if (pA === 'saturn' && pB === 'jupiter') {
        if (matchedDef.type === 'qiran') {
          mundaneTheme = 'Konjungsi Agung Dua Penguasa (Qiran al-Mawlayayn)';
          societalImpact = 'Pergantian era kenegaraan mendasar. Restrukturisasi tatanan konstitusi, perubahan dinasti atau rezim pemerintahan, dan pembaharuan perjanjian sosial berdurasi 20 tahunan.';
          historicalPrecedent = 'Penyusun Abū Ma‘shar mencatat peristiwa ini sebagai poros utama peralihan daulah dan pergeseran kepemimpinan peradaban.';
        } else if (matchedDef.type === 'tathlith' || matchedDef.type === 'tasdis') {
          mundaneTheme = 'Harmonisasi Hukum & Kemakmuran (Sa\'d al-Mulk)';
          societalImpact = 'Zaman keemasan tata kelola. Keadilan sosial (Yupiter) ditegakkan oleh ketegasan undang-undang (Saturnus). Pasar stabil, kepercayaan rakyat tinggi, dan program infrastruktur jangka panjang berjalan sukses.';
          historicalPrecedent = 'Masa kemakmuran Baghdad abad ke-9 dan era damai Sultan Maliksyah di Isfahan.';
        } else {
          mundaneTheme = 'Friksi Institusional & Dilema Anggaran (Niza\' al-Qanun)';
          societalImpact = 'Ketegangan antara pengetatan fiskal (Saturnus) dengan tuntutan kesejahteraan sosial (Yupiter). Kebuntuan legislatif, perdebatan tajam perihal keadilan hukum, atau beban utang publik.';
          historicalPrecedent = 'Krisis keuangan Dinasti Buwaihiyah saat beban birokrasi melampaui kemampuan kas negara.';
        }
      } else if (pA === 'saturn' && pB === 'mars') {
        if (matchedDef.type === 'qiran' || matchedDef.type === 'tarbi' || matchedDef.type === 'muqabalah') {
          mundaneTheme = 'Pertemuan Dua Nahs (Ijtima\' an-Nahsayn / Shiddat al-Amn)';
          societalImpact = 'Peringatan kewaspadaan tinggi atas keamanan domestik, friksi buruh/pekerja, protes sosial terhadap kebijakan ketat, atau ketegangan militer perbatasan. Menuntut diplomasi bijak untuk meredam kekakuan.';
          historicalPrecedent = 'Pergolakan Zanj di Bashrah saat persilangan tegang Mars dan Saturnus memicu ketidakpuasan kelas pekerja.';
        } else {
          mundaneTheme = 'Disiplin Pertahanan & Pembangunan Kokoh (Intidham al-Jund)';
          societalImpact = 'Ketegasan aparat keamanan yang terkendali sistemik. Kerja keras fisik rakyat membuahkan hasil nyata dalam proyek ketahanan pangan dan pertahanan kedaulatan.';
          historicalPrecedent = 'Pembangunan benteng-benteng perbatasan Thughur oleh Khalifah Harun ar-Rasyid.';
        }
      } else if (pA === 'jupiter' && pB === 'mars') {
        if (matchedDef.type === 'tathlith' || matchedDef.type === 'tasdis' || matchedDef.type === 'qiran') {
          mundaneTheme = 'Kemenangan Diplomasi & Ksatria Berwibawa (Izzat ash-Shaja\'ah)';
          societalImpact = 'Inisiatif kepemimpinan yang berani dan diberkahi keberhasilan. Semangat optimisme kolektif, terobosan ekonomi agresif yang menguntungkan rakyat, serta keadilan yang dibela dengan tegas.';
          historicalPrecedent = 'Kemenangan diplomatik dan militer Sultan Salahuddin al-Ayyubi dalam memulihkan ketertiban Syam.';
        } else {
          mundaneTheme = 'Spekulasi Agresif & Pemborosan Modal (Israf al-Mawa\'id)';
          societalImpact = 'Kecenderungan belanja negara yang tergesa-gesa tanpa pertimbangan matang. Antusiasme publik meluap-luap yang berpotensi memicu kekecewaan jika janji ekonomi tidak realistis.';
          historicalPrecedent = 'Ekspedisi militer yang menghabiskan kas negara tanpa hasil strategis permanen.';
        }
      }

      interactions.push({
        id: `${pA}_${matchedDef.type}_${pB}`,
        planetA: pA,
        planetB: pB,
        aspectType: matchedDef.type,
        aspectArabic: matchedDef.arabic,
        aspectName: matchedDef.name,
        symbol: matchedDef.symbol,
        exactAngle: matchedDef.angle,
        actualAngle: Math.round(angle * 100) / 100,
        orbDifference: Math.round(minOrbDiff * 100) / 100,
        nature: matchedDef.nature,
        natureArabic: matchedDef.natureArabic,
        influencePower: power,
        mundaneTheme,
        societalImpact,
        historicalPrecedent,
      });
    } else {
      // No classical aspect within allowed orb
      interactions.push({
        id: `${pA}_none_${pB}`,
        planetA: pA,
        planetB: pB,
        aspectType: 'none',
        aspectArabic: 'لَا اتِّصَال مُبَاشِر',
        aspectName: 'Tanpa Aspek Mayor',
        symbol: '—',
        exactAngle: 0,
        actualAngle: Math.round(angle * 100) / 100,
        orbDifference: 0,
        nature: 'Mu\'tadil',
        natureArabic: 'مُعْتَدِل',
        influencePower: 20,
        mundaneTheme: 'Dua Energi Beroperasi Mandiri',
        societalImpact: 'Tidak ada resonansi sudut kritis langsung di antara kedua planet; pengaruh masing-masing ditentukan murni oleh martabat zodiak individunya.',
        historicalPrecedent: 'Fase konsolidasi biasa di mana masing-masing sektor kenegaraan berjalan sesuai rutinitas.',
      });
    }
  }

  return interactions;
}

/**
 * Analyze Grand Conjunction (Qiran al-Mawlayayn: Saturn & Jupiter)
 */
function analyzeGrandConjunction(
  saturnDignity: SuperiorPlanetDignity,
  jupiterDignity: SuperiorPlanetDignity
): GrandConjunctionCycle {
  const saturnLong = saturnDignity.position.trueLongitude;
  const jupiterLong = jupiterDignity.position.trueLongitude;

  const diff = Math.abs(saturnLong - jupiterLong);
  const angularSep = diff > 180 ? 360 - diff : diff;

  let phase: GrandConjunctionCycle['phase'] = 'Fase Aspek Lain';
  if (angularSep <= 1.5) {
    phase = 'Qiran Eksak';
  } else if (angularSep <= 10.0) {
    phase = 'Aproksimasi Qiran';
  } else if (angularSep <= 20.0) {
    phase = 'Separasi (Infisal)';
  }

  // Determine Active Triplicity of Conjunction or Position
  // Average longitude
  const avgLong = (saturnLong + jupiterLong) / 2;
  const signIdx = Math.floor(avgLong / 30) % 12;
  const element = ZODIAC_PROPERTIES[signIdx].element;

  let activeTriplicity: GrandConjunctionCycle['activeTriplicity'] = 'Udara (Jawza/Mizan/Dalw)';
  let activeTriplicityArabic = 'المُثَلَّثَةُ الهَوَائِيَّة';
  let epochSignificance = 'Fokus peradaban tertuju pada transmisi ilmu, jaringan informasi, diplomasi, hukum tertulis, dan konektivitas intelektual.';

  if (element === 'Api') {
    activeTriplicity = 'Api (Hamal/Asad/Qaws)';
    activeTriplicityArabic = 'المُثَلَّثَةُ النَّارِيَّة';
    epochSignificance = 'Fokus peradaban pada kepemimpinan militer, semangat kebangkitan kedaulatan, penaklukan teritorial, dan energi pembaharuan berani.';
  } else if (element === 'Tanah') {
    activeTriplicity = 'Tanah (Thawr/Sunbulah/Jady)';
    activeTriplicityArabic = 'المُثَلَّثَةُ التُّرَابِيَّة';
    epochSignificance = 'Fokus peradaban pada penguasaan tanah, komoditas fisik, tambang, kestabilan infrastruktur bangunan permanen, dan birokrasi materiel.';
  } else if (element === 'Air') {
    activeTriplicity = 'Air (Saratan/Aqrab/Hut)';
    activeTriplicityArabic = 'المُثَلَّثَةُ المَائِيَّة';
    epochSignificance = 'Fokus peradaban pada perdagangan maritim, spiritualitas batin, dinamika kultural mendalam, dan penanganan sumber daya perairan.';
  }

  // Estimated years until next exact conjunction (synodic cycle is approx 19.86 years)
  // Current separation / relative motion speed (~18° per year relative)
  const approxYears = Math.round((angularSep / 18) * 10) / 10;

  return {
    saturnLongitude: saturnLong,
    jupiterLongitude: jupiterLong,
    angularSeparation: Math.round(angularSep * 100) / 100,
    phase,
    activeTriplicity,
    activeTriplicityArabic,
    epochSignificance,
    approxYearsToNextExact: approxYears,
  };
}

/**
 * Synthesize Mundane Report & Metrics
 */
export function calculateAhkamMawlayinReport(
  jdn: number
): AhkamMawlayinReport {
  const chart = calculateSindhindPositions(jdn);
  const greg = jdnToGregorian(jdn);
  const dateInfo = getFullHistoricalDate(greg.year, greg.month, greg.day);

  // 1. Dignity of the 3 Superiors
  const saturnDignity = calculateMundaneDignity('saturn', chart.positions.saturn);
  const jupiterDignity = calculateMundaneDignity('jupiter', chart.positions.jupiter);
  const marsDignity = calculateMundaneDignity('mars', chart.positions.mars);

  const planetsDignity: Record<SuperiorPlanetKey, SuperiorPlanetDignity> = {
    saturn: saturnDignity,
    jupiter: jupiterDignity,
    mars: marsDignity,
  };

  // 2. Aspect Interactions
  const aspectInteractions = computeSuperiorAspects(planetsDignity);

  // 3. Grand Conjunction Cycle
  const grandConjunction = analyzeGrandConjunction(saturnDignity, jupiterDignity);

  // 4. Calculate Core Mundane Metrics (0-100)
  // Baseline scores
  let govScore = 50 + saturnDignity.dignityScore * 5 + jupiterDignity.dignityScore * 3;
  let socialScore = 50 + jupiterDignity.dignityScore * 6 + saturnDignity.dignityScore * 2;
  let secScore = 50 + marsDignity.dignityScore * 5 - (marsDignity.isRetrograde ? 8 : 0);

  // Aspect modifiers
  for (const asp of aspectInteractions) {
    if (asp.aspectType === 'none') continue;

    const modifier = (asp.influencePower / 100) * 12;

    if (asp.planetA === 'saturn' && asp.planetB === 'jupiter') {
      if (asp.nature === 'Sa\'d' || asp.aspectType === 'qiran') {
        govScore += modifier;
        socialScore += modifier * 1.2;
      } else if (asp.nature === 'Nahs') {
        govScore -= modifier;
        socialScore -= modifier * 1.1;
      }
    }

    if (asp.planetA === 'saturn' && asp.planetB === 'mars') {
      if (asp.nature === 'Nahs' || asp.aspectType === 'qiran') {
        secScore -= modifier * 1.3;
        govScore -= modifier * 0.7;
      } else {
        secScore += modifier;
        govScore += modifier * 0.5;
      }
    }

    if (asp.planetA === 'jupiter' && asp.planetB === 'mars') {
      if (asp.nature === 'Sa\'d') {
        socialScore += modifier * 0.8;
        secScore += modifier * 0.8;
      } else {
        socialScore -= modifier * 0.5;
      }
    }
  }

  // Clamp 10-95
  const governanceStabilityIndex = Math.min(95, Math.max(15, Math.round(govScore)));
  const socialWelfareIndex = Math.min(95, Math.max(15, Math.round(socialScore)));
  const publicSecurityIndex = Math.min(95, Math.max(15, Math.round(secScore)));

  // Determine dominant tone
  let overallMundaneTone: AhkamMawlayinReport['metrics']['overallMundaneTone'] = 'Stabilitas Struktural & Reformasi';
  let toneArabic = 'اسْتِقْرَارُ البُنْيَانِ وَالإِصْلَاح';
  let toneSummary = 'Iklim kenegaraan berada dalam koridor penataan kelembagaan yang teratur, di mana stabilitas hukum menjadi tumpuan utama kehidupan sosial.';

  if (socialWelfareIndex >= 70 && governanceStabilityIndex >= 65) {
    overallMundaneTone = 'Zaman Keadilan & Kemakmuran (Izdihar)';
    toneArabic = 'عَصْرُ العَدْلِ وَالرَّخَاءِ الاِقْتِصَادِيّ';
    toneSummary = 'Konstelasi langit menandai masa lapang bagi kesejahteraan rakyat (*ar-ra\'iyyah*). Sinergi kebajikan Yupiter dan keteraturan hukum melahirkan kemakmuran pasar dan ketenteraman batin publik.';
  } else if (publicSecurityIndex < 40 || (saturnDignity.dignityScore < 0 && marsDignity.dignityScore < 0)) {
    overallMundaneTone = 'Peringatan Ketegangan & Pengetatan';
    toneArabic = 'تَحْذِيرُ الشِّدَّةِ وَاحْتِيَاجُ الحَزْم';
    toneSummary = 'Energi planet superior mengingatkan adanya potensi gesekan sosial, ketegangan keamanan, atau ketidakpuasan terhadap pengetatan birokrasi. Kebijakan harus dilandasi musyawarah dan kehati-hatian (*al-ihtiyat*).';
  } else if (grandConjunction.phase === 'Qiran Eksak' || grandConjunction.phase === 'Aproksimasi Qiran') {
    overallMundaneTone = 'Masa Transisi Besar (Tahawwul)';
    toneArabic = 'مَرْحَلَةُ التَّحَوُّلِ الكُبْرَى لِلدُّوَل';
    toneSummary = 'Kedekatan orbit Saturnus dan Yupiter menandakan fase pembaharuan mendasar atas tatanan rezim kekuasaan, reformasi konstitusi, dan pembentukan haluan peradaban baru.';
  } else if (governanceStabilityIndex < 45) {
    overallMundaneTone = 'Dinamika Kritis & Ujian Sosial';
    toneArabic = 'امْتِحَانُ الصَّبْرِ وَمُعَالَجَةُ النَّقْص';
    toneSummary = 'Tuntutan masyarakat terhadap reformasi birokrasi dan keadilan distribusi kekayaan mengemuka. Diperlukan evaluasi menyeluruh atas regulasi yang kaku.';
  }

  // Dominant planet
  let dominantRuler: AhkamMawlayinReport['metrics']['dominantRuler'] = 'Perimbangan Berimbang (Tawazun)';
  let dominantRulerArabic = 'تَوَازُنُ القُوَى العُلْوِيَّة';

  if (jupiterDignity.dignityScore > saturnDignity.dignityScore && jupiterDignity.dignityScore > marsDignity.dignityScore) {
    dominantRuler = 'Yupiter (Musytari - Keadilan & Rezeki)';
    dominantRulerArabic = 'غَلَبَةُ المُشْتَرِي (عَدْلٌ وَسَعَة)';
  } else if (saturnDignity.dignityScore > jupiterDignity.dignityScore && saturnDignity.dignityScore > marsDignity.dignityScore) {
    dominantRuler = 'Saturnus (Zuhal - Pengetatan & Hukum)';
    dominantRulerArabic = 'غَلَبَةُ زُحَل (ضَبْطٌ وَشِدَّة)';
  } else if (marsDignity.dignityScore > saturnDignity.dignityScore && marsDignity.dignityScore > jupiterDignity.dignityScore) {
    dominantRuler = 'Mars (Mirrikh - Ketegasan Militer)';
    dominantRulerArabic = 'غَلَبَةُ المِرِّيخ (حَمِيَّةٌ وَجُنْد)';
  }

  // Sector Forecasts
  const sectorForecasts: AhkamMawlayinReport['sectorForecasts'] = {
    governanceAndState: {
      title: 'Tata Kelola Pemerintahan & Kepemimpinan Negara',
      arabicTitle: 'سِيَاسَةُ المُلْكِ وَشُؤُونُ الحُكَّام',
      verdict:
        governanceStabilityIndex >= 65
          ? 'Institusi Kokoh & Wibawa Hukum Terjaga'
          : governanceStabilityIndex >= 45
          ? 'Konsolidasi Regulasi & Penataan Birokrasi'
          : 'Ujian Ketidakstabilan & Tuntutan Evaluasi',
      detailedAnalysis: `Kedudukan Saturnus di rasi ${saturnDignity.signName} (${saturnDignity.dignityArabic}) meletakkan asas struktural kepemimpinan. ${saturnDignity.dignityDescription} Pengaruh ini menentukan apakah aparatur negara bersikap bijaksana atau kaku dalam menegakkan wibawa hukum.`,
      policyAdvice:
        'Pemerintah dianjurkan menegakkan hukum secara adil tanpa pandang bulu, mendengarkan saran cendekiawan terpercaya, dan menghindari penambahan beban pungutan pada rakyat kecil.',
    },
    publicWelfareAndEconomy: {
      title: 'Kesejahteraan Sosial, Kas Negara, & Moral Publik',
      arabicTitle: 'أَحْوَالُ الرَّعِيَّةِ وَالمَعَاشِ وَالخَزِينَة',
      verdict:
        socialWelfareIndex >= 65
          ? 'Pasar Subur, Pangan Terjamin, & Harmoni Sosial'
          : socialWelfareIndex >= 45
          ? 'Kestabilan Terjaga dengan Kehati-hatian Fiskal'
          : 'Beban Biaya Hidup & Kerentanan Finansial',
      detailedAnalysis: `Yupiter di rasi ${jupiterDignity.signName} (${jupiterDignity.dignityArabic}) menjadi barometer kelapangan rezeki masyarakat (*al-ma'ash*). ${jupiterDignity.dignityDescription} Bila terbebas dari jerat friksi Mars, peredaran barang kebutuhan pokok berlangsung lancar dan etika kedermawanan tumbuh subur.`,
      societalAdvice:
        'Masyarakat disarankan menjaga solidaritas tolong-menolong, menghindari spekulasi perdagangan semu, dan mengamankan tabungan kebutuhan pokok menghadapi pergantian musim.',
    },
    securityAndDefense: {
      title: 'Pertahanan, Ketertiban Umum, & Angkatan Bersenjata',
      arabicTitle: 'الأَمْنُ وَالدِّفَاعُ وَحَرَكَةُ الجُنْد',
      verdict:
        publicSecurityIndex >= 65
          ? 'Ketahanan Nasional Kuat & Stabilitas Terjaga'
          : publicSecurityIndex >= 45
          ? 'Kesiapsiagaan Pasukan & Pengawasan Teratur'
          : 'Peringatan Gesekan Spontan & Ketegangan Internal',
      detailedAnalysis: `Mars di rasi ${marsDignity.signName} (${marsDignity.dignityArabic}) menggerakkan sayap kekuatan pertahanan negara. ${marsDignity.dignityDescription} Koordinasi yang terarah dengan kepemimpinan sipil menjamin ketenteraman warga dari ancaman luar maupun gejolak dalam negeri.`,
      securityAdvice:
        'Aparat keamanan dianjurkan mengedepankan pendekatan persuasif berbasis hukum, menjaga moralitas prajurit, dan senantiasa waspada terhadap provokasi desas-desus (*al-fitan*).',
    },
  };

  // Classical Quote
  const classicalQuote = {
    textArabic: 'المُلْكُ يَثْبُتُ مَعَ العَدْلِ وَلَوْ كَانَ مَعَ الكُفْر، وَلَا يَثْبُتُ مَعَ الجَوْرِ وَلَوْ كَانَ مَعَ الإِسْلَام',
    textIndonesian: 'Kekuasaan dan negara akan bertahan langgeng bersama keadilan, dan ia akan runtuh binasa bersama kezaliman.',
    source: 'Siyar al-Muluk (Siyasatnama) / Al-Kindi fi Ahkam al-Mulk',
    author: 'Wazir Agung Nizam al-Mulk / Abu Yusuf Ya\'qub al-Kindi',
  };

  return {
    dateInfo,
    planetsDignity,
    aspectInteractions,
    grandConjunction,
    metrics: {
      governanceStabilityIndex,
      socialWelfareIndex,
      publicSecurityIndex,
      overallMundaneTone,
      toneArabic,
      toneSummary,
      dominantRuler,
      dominantRulerArabic,
    },
    sectorForecasts,
    classicalQuote,
  };
}
