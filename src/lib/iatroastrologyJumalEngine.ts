import { PlanetKey } from '../types';
import {
  ABJAD_TABLE,
  AnalyzedLetter,
  ElementType,
  transliterateLatinToArabic,
} from './hisabJumalEngine';
import {
  FOUR_HUMORS,
  HumorType,
  IatroastrologyReport,
  KAWKAB_ANATOMY,
  KawkabAnatomyProfile,
  ZODIAC_MELOTHESIA,
} from './iatroastrologyEngine';

type SevenKawkabKey = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn';
type ZodiacMelothesiaItem = (typeof ZODIAC_MELOTHESIA)[number];

export interface MedicalJumalInput {
  patientNameLatin: string;
  patientNameArabicOverride?: string;
  motherNameLatin?: string;
  motherNameArabicOverride?: string;
  complaintNote?: string;
}

export interface MedicalJumalPrognosisMod3 {
  remainder: 1 | 2 | 3;
  arabicTitle: string;
  latinTitle: string;
  severityTone: 'good' | 'caution' | 'strained';
  summaryId: string;
  guidanceId: string;
}

export interface MedicalJumalRootMod4 {
  remainder: 1 | 2 | 3 | 4;
  humor: HumorType;
  arabicTitle: string;
  causeProfileId: string;
  counterBalancingId: string;
}

export interface MedicalJumalResult {
  patientNameLatin: string;
  patientNameArabic: string;
  motherNameLatin: string;
  motherNameArabic: string;
  complaintNote: string;

  patientLetters: AnalyzedLetter[];
  motherLetters: AnalyzedLetter[];
  patientJumal: number;
  motherJumal: number;
  totalJumalKabir: number;
  jumalSaghir: number; // 1-9

  // Mod 7 -> Ruling Kawkab
  mod7Remainder: number; // 1-7
  rulingPlanetKey: SevenKawkabKey;
  rulingAnatomy: KawkabAnatomyProfile;

  // Mod 12 -> Anatomical Burj
  mod12Remainder: number; // 1-12
  rulingBurj: ZodiacMelothesiaItem;

  // Mod 3 -> Classical Hisab al-Marid course/intensity
  prognosisMod3: MedicalJumalPrognosisMod3;

  // Mod 4 -> Elemental Root of Complaint
  rootMod4: MedicalJumalRootMod4;

  // Name Elemental / 4-Humors Distribution
  humorBreakdown: Array<{
    humor: HumorType;
    element: ElementType;
    count: number;
    valueSum: number;
    percentage: number;
  }>;
  dominantNameHumor: HumorType;
  celestialAlignmentNote: string;
  isCelestialExcessWarning: boolean;

  // Recommended balancing & spiritual ikhtiar
  auspiciousTherapyDay: string;
  recommendedAsma: {
    arabic: string;
    latin: string;
    meaning: string;
    recommendedCount: number;
  };
  suggestedSymptoms: string[];
  disclaimerId: string;
}

const MOD7_TO_PLANET: Record<number, SevenKawkabKey> = {
  1: 'sun',     // Ahad - Asy-Syams
  2: 'moon',    // Senin - Al-Qamar
  3: 'mars',    // Selasa - Al-Mirrikh
  4: 'mercury', // Rabu - 'Utarid
  5: 'jupiter', // Kamis - Al-Musytari
  6: 'venus',   // Jum'at - Az-Zuhrah
  7: 'saturn',  // Sabtu - Zuhal
};

const PLANET_THERAPY_DAYS: Record<SevenKawkabKey, string> = {
  sun: 'Ahad (Hari Syams — jam pertama setelah terbit fajar/matahari)',
  moon: 'Senin (Hari Qamar — waktu teduh pagi atau sore)',
  mars: 'Selasa (Hari Mirrikh — hindari tindakan panas berlebih, pilih sore yang tenang)',
  mercury: 'Rabu (Hari ‘Uṭārid — pagi hari untuk konsultasi & peracikan herbal)',
  jupiter: 'Kamis (Hari Musytarī — waktu terbaik ikhtiar pengobatan, doa & bekam ringan)',
  venus: 'Jum‘at (Hari Zuhrah — waktu penuh ketenangan, relaksasi & pemulihan stamina)',
  saturn: 'Sabtu (Hari Zuḥal — utamakan istirahat hangat, kompres & pemulihan sendi/tulang)',
};

const ELEMENT_TO_HUMOR: Record<ElementType, HumorType> = {
  Api: 'safra',
  Udara: 'dam',
  Air: 'balgham',
  Tanah: 'sawda',
};

const PROGNOSIS_MOD3_TABLE: Record<1 | 2 | 3, MedicalJumalPrognosisMod3> = {
  1: {
    remainder: 1,
    arabicTitle: 'مَرَضٌ خَفِيفٌ سَرِيعُ البُرْءِ',
    latinTitle: 'Sisa 1 · Al-Khafīf (Cenderung Ringan & Cepat Pulih)',
    severityTone: 'good',
    summaryId:
      'Dalam kaidah Hisab al-Marīḍ (sisa bagi 3 = 1), keluhan cenderung bersifat sementara akibat kelelahan, perubahan cuaca, atau ketidakseimbangan hawa ringan.',
    guidanceId:
      'Perbanyak istirahat teratur, cukupi hidrasi hangat, seimbangkan pola makan sesuai lawan unsur, dan jaga ketenangan pikiran.',
  },
  2: {
    remainder: 2,
    arabicTitle: 'مَرَضٌ مُتَوَسِّطٌ يَحْتَاجُ إِلَى التَّدْبِيرِ',
    latinTitle: 'Sisa 2 · Al-Mutawassiṭ (Menengah & Perlu Tadbīr Teratur)',
    severityTone: 'caution',
    summaryId:
      'Sisa bagi 3 = 2 menandakan akumulasi akhlāṭ (cairan/tabi‘at tubuh) yang mulai menetap sehingga keluhan dapat kambuh bila pemicu harian tidak dikendalikan.',
    guidanceId:
      'Terapkan disiplin pola makan & tidur, pantau intensitas keluhan harian pada jurnal Iatroastrology, serta lakukan pemeriksaan kesehatan bila menetap lebih dari beberapa hari.',
  },
  3: {
    remainder: 3,
    arabicTitle: 'مَرَضٌ ثَقِيلٌ يَسْتَدْعِي العِنَايَةَ التَّامَّةَ',
    latinTitle: 'Sisa 3 (0) · Ats-Tsaqīl (Intensif & Perlu Perhatian Penuh)',
    severityTone: 'strained',
    summaryId:
      'Sisa bagi 3 = 0/3 dalam tradisi kitab falak medis klasik menandakan beban unsur tubuh yang cukup kuat atau kelelahan mendalam pada organ terkait.',
    guidanceId:
      'Jangan menunda pemeriksaan tenaga medis profesional, hindari aktivitas berat atau bekam ekstrem pada organ peka, serta perbanyak ketenangan batin dan doa kesembuhan.',
  },
};

const ROOT_MOD4_TABLE: Record<1 | 2 | 3 | 4, MedicalJumalRootMod4> = {
  1: {
    remainder: 1,
    humor: 'safra',
    arabicTitle: 'غَلَبَةُ الصَّفْرَاءِ (حَارٌّ يَابِسٌ)',
    causeProfileId:
      'Dominasi unsur Api (Panas & Kering / Empedu Kuning): rentan pada rasa panas dalam, peradangan, sakit kepala berdenyut, mulut pahit, sulit tidur, dan kelelahan hati.',
    counterBalancingId:
      'Tadbīr penyeimbang Dingin & Basah: perbanyak air putih, buah berair (timun, pir, semangka, delima), kurangi gorengan/pedas berlebih, dan istirahat di ruangan sejuk.',
  },
  2: {
    remainder: 2,
    humor: 'sawda',
    arabicTitle: 'غَلَبَةُ السَّوْدَاءِ (بَارِدٌ يَابِسٌ)',
    causeProfileId:
      'Dominasi unsur Tanah (Dingin & Kering / Empedu Hitam): rentan pada kaku sendi/tulang, pegal menahun, lambung kembung kering, cemas, dan rasa berat pada limpa.',
    counterBalancingId:
      'Tadbīr penyeimbang Hangat & Basah: konsumsi kuah hangat, kurma, madu hangat, minyak zaitun, olahraga peregangan lembut, serta hindari begadang dan pikiran berlarut.',
  },
  3: {
    remainder: 3,
    humor: 'dam',
    arabicTitle: 'غَلَبَةُ الدَّمِ (حَارٌّ رَطْبٌ)',
    causeProfileId:
      'Dominasi unsur Udara (Panas & Basah / Darah): rentan pada rasa penuh di kepala/tengkuk, tekanan darah naik, dada terasa sesak hangat, serta kelelahan sirkulasi.',
    counterBalancingId:
      'Tadbīr penyeimbang Dingin & Kering moderat: kurangi asupan daging merah/manis pekat, perbanyak sayuran hijau berserat, gerak tubuh teratur, dan konsultasi cek tekanan darah.',
  },
  4: {
    remainder: 4,
    humor: 'balgham',
    arabicTitle: 'غَلَبَةُ البَلْغَمِ (بَارِدٌ رَطْبٌ)',
    causeProfileId:
      'Dominasi unsur Air (Dingin & Basah / Flegma): rentan pada lendir berlebih, masuk angin, flu/batuk berdahak, lambung dingin, ngantuk berlebih, dan bengkak ringan.',
    counterBalancingId:
      'Tadbīr penyeimbang Hangat & Kering: konsumsi minuman rempah hangat (jahe, kayu manis, kapulaga, madu), kurangi minuman es & makanan berminyak dingin, serta berjemur pagi.',
  },
};

const PLANET_HEALING_ASMA: Record<
  SevenKawkabKey,
  { arabic: string; latin: string; meaning: string }
> = {
  sun: {
    arabic: 'يَا نُورُ يَا حَيُّ يَا شَافِي',
    latin: 'Yā Nūr, Yā Ḥayy, Yā Syāfī',
    meaning: 'Wahai Sang Cahaya, Yang Maha Hidup, Yang Maha Menyembuhkan (penguat vitalitas jantung & ruhani)',
  },
  moon: {
    arabic: 'يَا سَلَامُ يَا لَطِيفُ يَا شَافِي',
    latin: 'Yā Salām, Yā Laṭīf, Yā Syāfī',
    meaning: 'Wahai Pemberi Keselamatan, Yang Maha Lembut, Yang Maha Menyembuhkan (penenang cairan & lambung)',
  },
  mars: {
    arabic: 'يَا حَلِيمُ يَا قَوِيُّ يَا شَافِي',
    latin: 'Yā Ḥalīm, Yā Qawiyy, Yā Syāfī',
    meaning: 'Wahai Yang Maha Penyantun, Maha Kuat, Maha Menyembuhkan (peredam panas & peradangan)',
  },
  mercury: {
    arabic: 'يَا عَلِيمُ يَا حَكِيمُ يَا شَافِي',
    latin: 'Yā ‘Alīm, Yā Ḥakīm, Yā Syāfī',
    meaning: 'Wahai Yang Maha Mengetahui, Maha Bijaksana, Maha Menyembuhkan (penenang saraf & pernapasan)',
  },
  jupiter: {
    arabic: 'يَا كَافِي يَا وَاسِعُ يَا شَافِي',
    latin: 'Yā Kāfī, Yā Wāsi‘, Yā Syāfī',
    meaning: 'Wahai Yang Maha Mencukupi, Maha Luas, Maha Menyembuhkan (penjaga hati & metabolisme)',
  },
  venus: {
    arabic: 'يَا رَؤُوفُ يَا رَحِيمُ يَا شَافِي',
    latin: 'Yā Ra’ūf, Yā Raḥīm, Yā Syāfī',
    meaning: 'Wahai Yang Maha Pengasih, Maha Penyayang, Maha Menyembuhkan (penyeimbang ginjal & ketenangan)',
  },
  saturn: {
    arabic: 'يَا مَتِينُ يَا صَبُورُ يَا شَافِي',
    latin: 'Yā Matīn, Yā Ṣabūr, Yā Syāfī',
    meaning: 'Wahai Yang Maha Kokoh, Maha Sabar, Maha Menyembuhkan (penguat tulang, sendi & limpa)',
  },
};

function parseArabicLetters(arabicText: string): AnalyzedLetter[] {
  const letters: AnalyzedLetter[] = [];
  for (const ch of arabicText) {
    const base = ch.normalize('NFD').replace(/[\u064B-\u065F\u0670]/g, '');
    const info = ABJAD_TABLE[base];
    if (info) {
      letters.push({
        char: info.char,
        name: info.name,
        value: info.value,
        element: info.element,
        elementArabic: info.elementArabic,
        nature: info.nature,
        natureArabic: info.natureArabic,
        spiritualNote: info.spiritualNote,
      });
    }
  }
  return letters;
}

function digitalRootMod9(n: number): number {
  if (n <= 0) return 0;
  const r = n % 9;
  return r === 0 ? 9 : r;
}

export function calculateMedicalJumal(
  input: MedicalJumalInput,
  celestialReport: IatroastrologyReport
): MedicalJumalResult | null {
  const cleanedPatientLatin = input.patientNameLatin.trim();
  const cleanedPatientArabicOverride = (input.patientNameArabicOverride || '').trim();
  const patientNameArabic =
    cleanedPatientArabicOverride || transliterateLatinToArabic(cleanedPatientLatin);

  if (!patientNameArabic) return null;

  const cleanedMotherLatin = (input.motherNameLatin || '').trim();
  const cleanedMotherArabicOverride = (input.motherNameArabicOverride || '').trim();
  const motherNameArabic =
    cleanedMotherArabicOverride ||
    (cleanedMotherLatin ? transliterateLatinToArabic(cleanedMotherLatin) : '');

  const patientLetters = parseArabicLetters(patientNameArabic);
  if (patientLetters.length === 0) return null;

  const motherLetters = motherNameArabic ? parseArabicLetters(motherNameArabic) : [];

  const patientJumal = patientLetters.reduce((sum, l) => sum + l.value, 0);
  const motherJumal = motherLetters.reduce((sum, l) => sum + l.value, 0);
  const totalJumalKabir = patientJumal + motherJumal;
  const jumalSaghir = digitalRootMod9(totalJumalKabir);

  // Modulo 7 (1..7) -> Kawkab
  const rawMod7 = totalJumalKabir % 7;
  const mod7Remainder = rawMod7 === 0 ? 7 : rawMod7;
  const rulingPlanetKey = MOD7_TO_PLANET[mod7Remainder];
  const rulingAnatomy = KAWKAB_ANATOMY[rulingPlanetKey];

  // Modulo 12 (1..12) -> Burj Melothesia (0-indexed 0..11)
  const rawMod12 = totalJumalKabir % 12;
  const mod12Remainder = rawMod12 === 0 ? 12 : rawMod12;
  const rulingBurj = ZODIAC_MELOTHESIA[mod12Remainder - 1];

  // Modulo 3 (1..3) -> Prognosis course
  const rawMod3 = totalJumalKabir % 3;
  const mod3Key = (rawMod3 === 0 ? 3 : rawMod3) as 1 | 2 | 3;
  const prognosisMod3 = PROGNOSIS_MOD3_TABLE[mod3Key];

  // Modulo 4 (1..4) -> Elemental root of ailment
  const rawMod4 = totalJumalKabir % 4;
  const mod4Key = (rawMod4 === 0 ? 4 : rawMod4) as 1 | 2 | 3 | 4;
  const rootMod4 = ROOT_MOD4_TABLE[mod4Key];

  // 4-Humor breakdown from all analyzed letters
  const allLetters = [...patientLetters, ...motherLetters];
  const elementBuckets: Record<ElementType, { count: number; valueSum: number }> = {
    Api: { count: 0, valueSum: 0 },
    Udara: { count: 0, valueSum: 0 },
    Air: { count: 0, valueSum: 0 },
    Tanah: { count: 0, valueSum: 0 },
  };
  allLetters.forEach((l) => {
    elementBuckets[l.element].count += 1;
    elementBuckets[l.element].valueSum += l.value;
  });

  const totalLettersCount = Math.max(1, allLetters.length);
  const humorBreakdown = (['Api', 'Udara', 'Air', 'Tanah'] as ElementType[])
    .map((el) => ({
      humor: ELEMENT_TO_HUMOR[el],
      element: el,
      count: elementBuckets[el].count,
      valueSum: elementBuckets[el].valueSum,
      percentage: Math.round((elementBuckets[el].count / totalLettersCount) * 100),
    }))
    .sort((a, b) => b.count - a.count || b.valueSum - a.valueSum);

  const dominantNameHumor = humorBreakdown[0].humor;
  const celestialDominant = celestialReport.dominantHumor;
  const rulingEval = celestialReport.evaluations[rulingPlanetKey];

  let celestialAlignmentNote = '';
  let isCelestialExcessWarning = false;

  if (dominantNameHumor === celestialDominant) {
    isCelestialExcessWarning = true;
    celestialAlignmentNote = `Perhatian Ghalabah al-Khilṭ: Unsur dominan nama (${FOUR_HUMORS[dominantNameHumor].latin}) berhimpitan langsung dengan mizāj langit saat ini (${FOUR_HUMORS[celestialDominant].latin} ${celestialReport.humors[celestialDominant]}%). Potensi ekses unsur meningkat, sehingga penyeimbangan pola makan/istirahat sangat dianjurkan.`;
  } else if (rulingEval.statusTone === 'strained') {
    isCelestialExcessWarning = true;
    celestialAlignmentNote = `Kawkab penguasa nama (${rulingAnatomy.transliteration}) sedang mengalami tekanan langit (skor vitalitas ${rulingEval.vitalityScore}/100). Fokuskan perawatan lembut pada ${rulingAnatomy.organsList.slice(0, 2).join(' dan ')}.`;
  } else {
    celestialAlignmentNote = `Mizāj nama (${FOUR_HUMORS[dominantNameHumor].latin}) relatif seimbang terhadap mizāj langit saat ini (${FOUR_HUMORS[celestialDominant].latin}), dengan vitalitas kawkab ${rulingAnatomy.transliteration} sebesar ${rulingEval.vitalityScore}/100 (${rulingEval.statusLabel}).`;
  }

  const baseAsma = PLANET_HEALING_ASMA[rulingPlanetKey];
  const recommendedCount = Math.max(11, Math.min(313, jumalSaghir * 11));

  return {
    patientNameLatin: cleanedPatientLatin || patientNameArabic,
    patientNameArabic,
    motherNameLatin: cleanedMotherLatin,
    motherNameArabic,
    complaintNote: (input.complaintNote || '').trim(),
    patientLetters,
    motherLetters,
    patientJumal,
    motherJumal,
    totalJumalKabir,
    jumalSaghir,
    mod7Remainder,
    rulingPlanetKey,
    rulingAnatomy,
    mod12Remainder,
    rulingBurj,
    prognosisMod3,
    rootMod4,
    humorBreakdown,
    dominantNameHumor,
    celestialAlignmentNote,
    isCelestialExcessWarning,
    auspiciousTherapyDay: PLANET_THERAPY_DAYS[rulingPlanetKey],
    recommendedAsma: {
      ...baseAsma,
      recommendedCount,
    },
    suggestedSymptoms: rulingAnatomy.symptomsOnAffliction,
    disclaimerId:
      'Catatan Ilmiah: Kalkulator Hisab Jumal Medis ini adalah rekonstruksi khazanah turats klasik (at-Ṭibb an-Nujūmī & Abū Ma‘syar) untuk keperluan riset budaya, filologi falak, dan refleksi tadbīr gaya hidup — bukan pengganti diagnosis atau terapi dokter medis profesional.',
  };
}
