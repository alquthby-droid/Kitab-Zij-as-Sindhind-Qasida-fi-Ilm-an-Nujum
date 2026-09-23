/**
 * Classical Islamic Compatibility & Competition Engine
 * (عِلْمُ التَّوَافُقِ بَيْنَ الزَّوْجَيْنِ وَحِسَابُ الغَالِبِ وَالمَغْلُوبِ)
 *
 * References:
 * - Kitab Syams al-Ma'arif al-Kubra (Syaikh Ahmad al-Buni)
 * - Kitab at-Tafhim li-Awa'il Sina'at at-Tanjim (Abu Rayhan Al-Biruni)
 * - Kitab al-Awfaq (Imam Al-Ghazali)
 * - Tajul Muluk & Primbon Petung Jodoh Salokantara
 */

import {
  calculateSimpleJumal,
  ABJAD_TABLE,
  DayKey,
  PasaranKey,
  SAPTA_WARA,
  PANCA_WARA,
  ElementType,
} from './hisabJumalEngine';

// ============================================================================
// PART 1: TAWAFUQ AZ-ZAWJAYN (HISAB KESERASIAN JODOH PASANGAN)
// ============================================================================

export interface PartnerInput {
  name: string;
  nameArabic?: string;
  motherName?: string;
  motherNameArabic?: string;
  day: DayKey;
  pasaran: PasaranKey;
}

export interface CompatibilityReport {
  partner1: {
    name: string;
    arabicName: string;
    jumalName: number;
    jumalMother: number;
    totalJumal: number;
    neptuDay: number;
    neptuPasaran: number;
    totalNeptu: number;
    dominantElement: ElementType;
  };
  partner2: {
    name: string;
    arabicName: string;
    jumalName: number;
    jumalMother: number;
    totalJumal: number;
    neptuDay: number;
    neptuPasaran: number;
    totalNeptu: number;
    dominantElement: ElementType;
  };
  // Islamic Modulo 9 Root Harmony
  rootModulo9: number;
  rootCategoryArabic: string;
  rootCategoryLatin: string;
  rootDescription: string;
  // Elemental Chemistry (Api, Tanah, Udara, Air)
  elementalRelation: 'muin' | 'muwafiq' | 'mutadil' | 'mudhadd';
  elementalRelationLabel: string;
  elementalDescription: string;
  // Javanese Petung Weton Jodoh (Siklus 8)
  combinedNeptu: number;
  petungJodohSiklus8: {
    category: 'Pegat' | 'Ratu' | 'Jodoh' | 'Topo' | 'Tinari' | 'Padu' | 'Sujanan' | 'Pesthi';
    javaneseMotto: string;
    description: string;
    fortuneTier: 'Sangat Baik' | 'Baik' | 'Netral' | 'Perlu Ikhtiar';
  };
  // Composite Harmony Score (0 - 100%)
  harmonyScore: number;
  qualityTier: 'Mumtaz (Istimewa)' | 'Jayyid Jiddan (Sangat Baik)' | 'Jayyid (Baik)' | 'Muhtaj ila ash-Sabr (Butuh Kesabaran)';
  // Advice & Wisdom
  maritalVirtues: string[];
  vulnerabilities: string[];
  reconciliationAdvice: string;
  recommendedAsmaulHusna: {
    arabic: string;
    transliteration: string;
    meaning: string;
  }[];
}

const MODULO_9_MARRIAGE_INTERPRETATIONS: Record<
  number,
  { arabic: string; latin: string; description: string; scoreBoost: number }
> = {
  1: {
    arabic: 'المَحَبَّةُ وَالاتِّحَادُ القَلْبِيّ',
    latin: 'Al-Mahabbah wal-Ittihad (Cinta Sejati & Persatuan Kalbu)',
    description: 'Pasangan ini memiliki ikatan batin yang sangat kuat. Pikiran dan rasa saling mengisi secara intuitif, mudah menyelesaikan silang pendapat dengan kelembutan kasih sayang.',
    scoreBoost: 95,
  },
  2: {
    arabic: 'الخَيْرُ وَالبَرَكَةُ فِي الرِّزْق',
    latin: 'Al-Khayr wal-Barakah (Kebaikan & Kelimpahan Rezeki)',
    description: 'Pernikahan yang membuka pintu-pintu kemudahan rezeki dan sandang pangan. Disukai oleh sanak keluarga dan memiliki stabilitas ekonomi yang terus bertumbuh.',
    scoreBoost: 90,
  },
  3: {
    arabic: 'المَنَاعَةُ وَتَكْوِينُ الأُصُول',
    latin: 'Al-Muna\'ah wal-Iktisab (Ujian Ketekunan & Penumpukan Aset)',
    description: 'Karakter pasangan saling melengkapi dalam bekerja keras. Mungkin di awal rumah tangga diuji kesabaran dan perjuangan, namun membuahkan aset keluarga yang kokoh.',
    scoreBoost: 75,
  },
  4: {
    arabic: 'الأُلْفَةُ وَالوِفَاقُ المَنْزِلِيّ',
    latin: 'Al-Ulfah wal-Wifaq (Kerukunan & Kehangatan Rumah Tangga)',
    description: 'Rumah tangga dinaungi ketenangan (*Sakinah*). Suasana tempat tinggal terasa sejuk dan damai, saling menghargai privasi dan peran masing-masing.',
    scoreBoost: 88,
  },
  5: {
    arabic: 'التَّدْبِيرُ وَبَرَكَةُ الذُّرِّيَّة',
    latin: 'At-Tadbir wal-Awlad (Keturunan Shalih & Manajemen Cerdas)',
    description: 'Diberkahi keturunan yang cerdas dan berbakti. Pasangan memiliki kemampuan manajemen rumah tangga yang rapi dan visi jangka panjang yang terarah.',
    scoreBoost: 86,
  },
  6: {
    arabic: 'السَّعَادَةُ وَالأَمْنُ الدَّائِم',
    latin: 'As-Sa\'adah wal-Aman (Kebahagiaan & Rasa Aman Sentosa)',
    description: 'Satu sama lain menjadi benteng perlindungan dan tempat berteduh teraman dari badai kehidupan luar. Kepercayaan timbal balik sangat tinggi.',
    scoreBoost: 92,
  },
  7: {
    arabic: 'الامْتِحَانُ وَنُضْجُ الصَّبْر',
    latin: 'Al-Imtihan wan-Nudhj (Ujian Pendewasaan Jiwa)',
    description: 'Hubungan ini sarat dengan proses belajar dan saling mendewasakan. Membutuhkan kelapangan dada dan komunikasi terbuka agar ego tidak menjadi sandungan.',
    scoreBoost: 68,
  },
  8: {
    arabic: 'العِزُّ وَالجَاهُ وَالوِجَاهَة',
    latin: 'Al-Izz wal-Jah (Kemuliaan & Kehormatan Sosial)',
    description: 'Pasangan yang mengangkat martabat keluarga besar di hadapan masyarakat. Sering dipercaya mengemban amanah sosial dan memiliki wibawa kepemimpinan.',
    scoreBoost: 85,
  },
  0: {
    arabic: 'كَمَالُ التَّأْلِيفِ وَالتَّوَافُق',
    latin: 'Kamal at-Ta\'lif (Kesempurnaan Keselarasan Jiwa)',
    description: 'Derajat keserasian tertinggi dalam hisab kuno. Pertemuan dua jiwa yang seakan telah saling mengenal di alam ruh (*Arwah Mutajannisah*).',
    scoreBoost: 98,
  },
};

const PETUNG_JODOH_SIKLUS_8: Record<
  number,
  {
    category: 'Pegat' | 'Ratu' | 'Jodoh' | 'Topo' | 'Tinari' | 'Padu' | 'Sujanan' | 'Pesthi';
    javaneseMotto: string;
    description: string;
    fortuneTier: 'Sangat Baik' | 'Baik' | 'Netral' | 'Perlu Ikhtiar';
  }
> = {
  1: {
    category: 'Pegat',
    javaneseMotto: 'Kudu eling lan waspada, jembar dhadhane',
    description: 'Rentan menghadapi perselisihan prinsip atau terpisah jarak/pekerjaan. Kunci keselamatannya adalah saling memaafkan dan tidak mengungkit masa lalu.',
    fortuneTier: 'Perlu Ikhtiar',
  },
  2: {
    category: 'Ratu',
    javaneseMotto: 'Kinasihan ing sesami, kajen keringan',
    description: 'Dihormati dan disegani lingkungan. Rumah tangga harmonis, rezeki lancar, dan keberadaannya menjadi teladan bagi tetangga.',
    fortuneTier: 'Sangat Baik',
  },
  3: {
    category: 'Jodoh',
    javaneseMotto: 'Cocok lair lan batin, runtung-runtung saparan',
    description: 'Tingkat keserasian sangat tinggi. Saling menerima kelebihan dan kekurangan pasangan, langgeng sampai hari tua.',
    fortuneTier: 'Sangat Baik',
  },
  4: {
    category: 'Topo',
    javaneseMotto: 'Pait ing ngarep, manis ing pungkasan',
    description: 'Di awal pernikahan sering menghadapi tempaan hidup atau prihatin, namun ketabahan bersama akan mengantarkan pada kejayaan di masa depan.',
    fortuneTier: 'Baik',
  },
  5: {
    category: 'Tinari',
    javaneseMotto: 'Murakabi sandang pangan, nemu kamulyan',
    description: 'Mudah menemukan rezeki yang cukup dan berkah. Sering mendapatkan pertolongan tak terduga dalam urusan ekonomi.',
    fortuneTier: 'Sangat Baik',
  },
  6: {
    category: 'Padu',
    javaneseMotto: 'Sanajan padu nanging ora pisah',
    description: 'Sering terjadi adu pendapat atau perdebatan kecil sehari-hari mengenai hal sepele, namun cinta mereka tetap mengikat dan tidak sampai berpisah.',
    fortuneTier: 'Netral',
  },
  7: {
    category: 'Sujanan',
    javaneseMotto: 'Nyingkiri sujana lan cemburu wuta',
    description: 'Rentan ujian rasa cemburu atau godaan pihak ketiga. Membutuhkan keterbukaan mutlak dan menjaga pergaulan agar keharmonisan tetap terjaga.',
    fortuneTier: 'Perlu Ikhtiar',
  },
  0: {
    category: 'Pesthi',
    javaneseMotto: 'Tentrem ayem tentrem, rukun nganti kaki nini',
    description: 'Rumah tangga damai, tenteram, dan kokoh dari goncangan. Segala ujian dapat dilalui dengan senyuman dan kebersamaan sejati.',
    fortuneTier: 'Sangat Baik',
  },
};

/**
 * Determine element from Arabic text letters
 */
function getDominantElement(text: string): ElementType {
  const counts: Record<ElementType, number> = { Api: 0, Tanah: 0, Udara: 0, Air: 0 };
  for (const ch of text) {
    const base = ch.normalize('NFD').replace(/[\u064B-\u065F\u0670]/g, '');
    if (ABJAD_TABLE[base]) {
      counts[ABJAD_TABLE[base].element]++;
    }
  }
  let dominant: ElementType = 'Api';
  let max = -1;
  (Object.keys(counts) as ElementType[]).forEach((el) => {
    if (counts[el] > max) {
      max = counts[el];
      dominant = el;
    }
  });
  return dominant;
}

/**
 * Calculate full compatibility between two partners
 */
export function calculateCompatibilityReport(
  partner1: PartnerInput,
  partner2: PartnerInput
): CompatibilityReport {
  const p1Arabic = partner1.nameArabic || partner1.name;
  const p2Arabic = partner2.nameArabic || partner2.name;

  const j1Name = calculateSimpleJumal(p1Arabic);
  const j2Name = calculateSimpleJumal(p2Arabic);

  const j1Mother = partner1.motherNameArabic
    ? calculateSimpleJumal(partner1.motherNameArabic)
    : calculateSimpleJumal(partner1.motherName || '');
  const j2Mother = partner2.motherNameArabic
    ? calculateSimpleJumal(partner2.motherNameArabic)
    : calculateSimpleJumal(partner2.motherName || '');

  const totalJ1 = j1Name + j1Mother;
  const totalJ2 = j2Name + j2Mother;

  const neptuDay1 = SAPTA_WARA[partner1.day].neptu;
  const neptuPas1 = PANCA_WARA[partner1.pasaran].neptu;
  const totalNeptu1 = neptuDay1 + neptuPas1;

  const neptuDay2 = SAPTA_WARA[partner2.day].neptu;
  const neptuPas2 = PANCA_WARA[partner2.pasaran].neptu;
  const totalNeptu2 = neptuDay2 + neptuPas2;

  const combinedNeptu = totalNeptu1 + totalNeptu2;

  // Modulo 9 Islamic calculation
  const rootMod9 = (totalJ1 + totalJ2) % 9;
  const mod9Info = MODULO_9_MARRIAGE_INTERPRETATIONS[rootMod9];

  // Elemental relation
  const elem1 = getDominantElement(p1Arabic);
  const elem2 = getDominantElement(p2Arabic);

  let elementalRelation: CompatibilityReport['elementalRelation'] = 'mutadil';
  let elementalRelationLabel = 'Netral / Sedang (Al-I\'tidāl)';
  let elementalDescription = 'Dua unsur memiliki karakteristik mandiri yang dapat saling berdampingan jika ada tenggang rasa.';

  if (
    (elem1 === 'Api' && elem2 === 'Udara') ||
    (elem1 === 'Udara' && elem2 === 'Api')
  ) {
    elementalRelation = 'muin';
    elementalRelationLabel = 'Saling Menguatkan (Mu\'īn - Api & Udara)';
    elementalDescription = 'Udara menghembuskan oksigen inspirasi yang menyalakan semangat Api. Hubungan ini penuh gairah, ide visioner, dan optimisme tinggi.';
  } else if (
    (elem1 === 'Air' && elem2 === 'Tanah') ||
    (elem1 === 'Tanah' && elem2 === 'Air')
  ) {
    elementalRelation = 'muwafiq';
    elementalRelationLabel = 'Sangat Subur (Muwāfiq - Air & Tanah)';
    elementalDescription = 'Air menyirami tanah hingga menumbuhkan benih kemakmuran, sementara tanah menjadi wadah kokoh bagi aliran air. Pasangan yang saling merawat dan membangun keluarga yang mapan.';
  } else if (elem1 === elem2) {
    elementalRelation = 'mutadil';
    elementalRelationLabel = `Unsur Seiras (${elem1})`;
    elementalDescription = 'Memiliki karakter dasar yang sangat mirip. Sangat mudah memahami perasaan pasangan, namun perlu waspada jika sama-sama sedang emosi atau keras kepala.';
  } else if (
    (elem1 === 'Api' && elem2 === 'Air') ||
    (elem1 === 'Air' && elem2 === 'Api')
  ) {
    elementalRelation = 'mudhadd';
    elementalRelationLabel = 'Berlawanan (Mudlādd - Api & Air)';
    elementalDescription = 'Api yang panas dapat mendidihkan air, dan air yang dingin dapat memadamkan api. Memerlukan penyejuk komunikasi dan kerendahan hati agar tidak saling memadamkan semangat.';
  }

  // Petung Siklus 8
  const siklus8Mod = combinedNeptu % 8;
  const petungSiklus8 = PETUNG_JODOH_SIKLUS_8[siklus8Mod];

  // Calculate composite Harmony Score (0 - 100)
  let score = mod9Info.scoreBoost * 0.45;
  if (elementalRelation === 'muin' || elementalRelation === 'muwafiq') score += 25;
  else if (elementalRelation === 'mutadil') score += 18;
  else score += 10;

  if (petungSiklus8.fortuneTier === 'Sangat Baik') score += 30;
  else if (petungSiklus8.fortuneTier === 'Baik') score += 22;
  else if (petungSiklus8.fortuneTier === 'Netral') score += 15;
  else score += 10;

  score = Math.min(99, Math.max(45, Math.round(score)));

  let qualityTier: CompatibilityReport['qualityTier'] = 'Jayyid (Baik)';
  if (score >= 90) qualityTier = 'Mumtaz (Istimewa)';
  else if (score >= 78) qualityTier = 'Jayyid Jiddan (Sangat Baik)';
  else if (score >= 65) qualityTier = 'Jayyid (Baik)';
  else qualityTier = 'Muhtaj ila ash-Sabr (Butuh Kesabaran)';

  // Virtues & Advice
  const maritalVirtues = [
    `Keserasian Akar Jumal: ${mod9Info.latin}`,
    `Interaksi Unsur Alamiah: ${elementalRelationLabel}`,
    `Petung Weton Neptu ${combinedNeptu}: Kategori ${petungSiklus8.category} (${petungSiklus8.javaneseMotto})`,
    'Potensi melahirkan keturunan berakhlak mulia dan saling mendukung pencapaian cita-cita.',
  ];

  const vulnerabilities = [
    elementalRelation === 'mudhadd'
      ? 'Perbedaan temperamen mendasar yang dapat meletup jika terjadi perselisihan sengit.'
      : 'Ego pribadi yang enggan mengalah saat terjadi perbedaan prioritas pengeluaran atau gaya hidup.',
    petungSiklus8.category === 'Padu' || petungSiklus8.category === 'Pegat'
      ? 'Kecenderungan sering mendebat perkara kecil yang sebenarnya tidak prinsipil.'
      : 'Kurangnya waktu berdua secara intim akibat kesibukan aktivitas kerja di luar rumah.',
  ];

  const reconciliationAdvice =
    'Biasakan membaca doa penenteram hati bersama sebelum tidur. Jangan biarkan matahari terbit sementara kemarahan semalam masih terpendam di dada. Jadikan musyawarah dengan kepala dingin sebagai panglima dalam setiap keputusan besar.';

  const recommendedAsmaulHusna = [
    { arabic: 'يَا وَدُودُ', transliteration: 'Yā Wadūd', meaning: 'Wahai Dzat Yang Maha Menyayangi dan Menautkan Kasih' },
    { arabic: 'Yَا جَامِعُ', transliteration: 'Yā Jāmi\'', meaning: 'Wahai Dzat Yang Menghimpun Hati dalam Kedamaian' },
    { arabic: 'يَا رَؤُوفُ', transliteration: 'Yā Ra’ūf', meaning: 'Wahai Dzat Yang Maha Berbelas Kasih' },
    { arabic: 'يَا سَلَامُ', transliteration: 'Yā Salām', meaning: 'Wahai Dzat Sumber Keselamatan dan Ketenangan' },
  ];

  return {
    partner1: {
      name: partner1.name,
      arabicName: p1Arabic,
      jumalName: j1Name,
      jumalMother: j1Mother,
      totalJumal: totalJ1,
      neptuDay: neptuDay1,
      neptuPasaran: neptuPas1,
      totalNeptu: totalNeptu1,
      dominantElement: elem1,
    },
    partner2: {
      name: partner2.name,
      arabicName: p2Arabic,
      jumalName: j2Name,
      jumalMother: j2Mother,
      totalJumal: totalJ2,
      neptuDay: neptuDay2,
      neptuPasaran: neptuPas2,
      totalNeptu: totalNeptu2,
      dominantElement: elem2,
    },
    rootModulo9: rootMod9,
    rootCategoryArabic: mod9Info.arabic,
    rootCategoryLatin: mod9Info.latin,
    rootDescription: mod9Info.description,
    elementalRelation,
    elementalRelationLabel,
    elementalDescription,
    combinedNeptu,
    petungJodohSiklus8: petungSiklus8,
    harmonyScore: score,
    qualityTier,
    maritalVirtues,
    vulnerabilities,
    reconciliationAdvice,
    recommendedAsmaulHusna,
  };
}

// ============================================================================
// PART 2: HISAB AL-GHALIB WA AL-MAGHLUB (HISAB KEMENANGAN & PERSAINGAN)
// ============================================================================

export interface CompetitorInput {
  id: string;
  name: string;
  nameArabic?: string;
  motherName?: string;
  motherNameArabic?: string;
  roleOrTeam?: string;
}

export interface CompetitorAnalysis {
  id: string;
  name: string;
  arabicName: string;
  jumalName: number;
  jumalMother: number;
  totalJumal: number;
  rootMod9: number;
  rootMod7: number;
  dominantElement: ElementType;
  winProbabilityScore: number; // 0 - 100
  rank: number;
  status: 'Al-Ghālib (Unggul Kuat)' | 'Al-Mutanāfis (Ketat Bersaing)' | 'Al-Maghlūb (Tertekan/Ujian)';
  tacticalAdvantage: string;
  tacticalVulnerability: string;
  optimalPlanetaryHour: string;
}

export interface CompetitionReport {
  dayOfCompetition: DayKey;
  dayRulerPlanet: string;
  competitors: CompetitorAnalysis[];
  projectedWinner: CompetitorAnalysis;
  competitionDynamics: string;
  strategicAdvice: string[];
}

const PLANETARY_DAY_RULERS: Record<DayKey, { planet: string; planetArabic: string; elementFavor: ElementType }> = {
  ahad: { planet: 'Matahari (Ash-Shams)', planetArabic: 'الشَّمْس', elementFavor: 'Api' },
  senin: { planet: 'Bulan (Al-Qamar)', planetArabic: 'القَمَر', elementFavor: 'Air' },
  selasa: { planet: 'Mars (Al-Mirrikh)', planetArabic: 'المِرِّيخ', elementFavor: 'Api' },
  rabu: { planet: 'Merkurius (\'Utarid)', planetArabic: 'عُطَارِد', elementFavor: 'Udara' },
  kamis: { planet: 'Jupiter (Al-Musytari)', planetArabic: 'المُشْتَرِي', elementFavor: 'Udara' },
  jumat: { planet: 'Venus (Az-Zuharah)', planetArabic: 'الزُّهَرَة', elementFavor: 'Tanah' },
  sabtu: { planet: 'Saturnus (Zuhal)', planetArabic: 'زُحَل', elementFavor: 'Tanah' },
};

/**
 * Calculate classical Al-Ghalib wa al-Maghlub competition report for 2 or more contenders
 */
export function calculateCompetitionReport(
  competitorsInput: CompetitorInput[],
  day: DayKey = 'ahad'
): CompetitionReport {
  if (competitorsInput.length < 2) {
    throw new Error('Kompetisi membutuhkan minimal 2 peserta untuk dianalisis.');
  }

  const dayInfo = PLANETARY_DAY_RULERS[day];

  // Process raw competitors
  const evaluated = competitorsInput.map((c) => {
    const arabicName = c.nameArabic || c.name;
    const jName = calculateSimpleJumal(arabicName);
    const jMother = c.motherNameArabic
      ? calculateSimpleJumal(c.motherNameArabic)
      : calculateSimpleJumal(c.motherName || '');
    const totalJ = jName + jMother;

    const mod9 = totalJ % 9 === 0 ? 9 : totalJ % 9;
    const mod7 = totalJ % 7 === 0 ? 7 : totalJ % 7;
    const dominantElem = getDominantElement(arabicName);

    // Initial base power from classical Abjad Root
    let baseScore = mod9 * 7 + (totalJ % 17);

    // Day of competition planetary resonance
    if (dominantElem === dayInfo.elementFavor) {
      baseScore += 18; // Resonates with day's planetary ruler
    }

    // Parity advantage (ganjil/genap terhadap hari)
    if (mod9 % 2 !== 0) {
      baseScore += 8; // Odd numbers carry dynamic initiative
    }

    return {
      id: c.id,
      name: c.name,
      arabicName,
      jumalName: jName,
      jumalMother: jMother,
      totalJumal: totalJ,
      rootMod9: mod9,
      rootMod7: mod7,
      dominantElement: dominantElem,
      rawScore: baseScore,
    };
  });

  // Normalize scores to probabilities summing to 100%
  const totalRaw = evaluated.reduce((sum, e) => sum + e.rawScore, 0);

  const scoredCompetitors = evaluated.map((e) => {
    const prob = Math.round((e.rawScore / totalRaw) * 100);
    return { ...e, winProbabilityScore: prob };
  });

  // Sort descending
  scoredCompetitors.sort((a, b) => b.winProbabilityScore - a.winProbabilityScore);

  const finalCompetitors: CompetitorAnalysis[] = scoredCompetitors.map((item, idx) => {
    let status: CompetitorAnalysis['status'] = 'Al-Mutanāfis (Ketat Bersaing)';
    if (idx === 0) status = 'Al-Ghālib (Unggul Kuat)';
    else if (idx === scoredCompetitors.length - 1 && scoredCompetitors.length > 2) status = 'Al-Maghlūb (Tertekan/Ujian)';

    let tacticalAdvantage = '';
    let tacticalVulnerability = '';
    let optimalHour = '';

    switch (item.dominantElement) {
      case 'Api':
        tacticalAdvantage = 'Serangan agresif, inisiatif memimpin sejak awal, dan wibawa panggung yang mengintimidasi lawan.';
        tacticalVulnerability = 'Cepat kehabisan napas stamina dan rawan terpancing provokasi emosional.';
        optimalHour = 'Jam ke-1 & ke-8 (Dipimpin Matahari / Mars)';
        break;
      case 'Tanah':
        tacticalAdvantage = 'Ketahanan mental membaja, pertahanan disiplin, dan kalkulasi logistik yang sangat matang.';
        tacticalVulnerability = 'Lambat mengantisipasi manuver mendadak dan cenderung kaku dalam improvisasi.';
        optimalHour = 'Jam ke-3 & ke-10 (Dipimpin Venus / Saturnus)';
        break;
      case 'Udara':
        tacticalAdvantage = 'Kelincahan taktik, kecerdasan retorika membalikkan argumen, dan kecepatan beradaptasi.';
        tacticalVulnerability = 'Kurang konsisten dalam duel adu fisik panjang dan mudah terpecah konsentrasinya.';
        optimalHour = 'Jam ke-4 & ke-11 (Dipimpin Merkurius / Jupiter)';
        break;
      case 'Air':
        tacticalAdvantage = 'Intuisi tajam membaca kelemahan lawan, ketenangan di bawah tekanan, dan daya tahan lentur.';
        tacticalVulnerability = 'Ragu-ragu mengambil keputusan eksekusi cepat di detik-detik genting.';
        optimalHour = 'Jam ke-2 & ke-9 (Dipimpin Bulan)';
        break;
    }

    return {
      id: item.id,
      name: item.name,
      arabicName: item.arabicName,
      jumalName: item.jumalName,
      jumalMother: item.jumalMother,
      totalJumal: item.totalJumal,
      rootMod9: item.rootMod9,
      rootMod7: item.rootMod7,
      dominantElement: item.dominantElement,
      winProbabilityScore: item.winProbabilityScore,
      rank: idx + 1,
      status,
      tacticalAdvantage,
      tacticalVulnerability,
      optimalPlanetaryHour: optimalHour,
    };
  });

  const projectedWinner = finalCompetitors[0];

  const competitionDynamics = `Kompetisi pada hari ${SAPTA_WARA[day].arabicName} (${day.toUpperCase()}) dinaungi oleh ${dayInfo.planet} yang menguntungkan unsur ${dayInfo.elementFavor}. Kandidat ${projectedWinner.name} menduduki posisi Al-Ghālib dengan probabilitas ${projectedWinner.winProbabilityScore}%, ditopang oleh resonansi angka akar ${projectedWinner.rootMod9}.`;

  const strategicAdvice = [
    `Bagi ${projectedWinner.name} (Unggul): Jaga kestabilan fokus, jangan meremehkan lawan, dan manfaatkan jam ${projectedWinner.optimalPlanetaryHour} untuk melakukan gebrakan penentu.`,
    `Bagi penantang runner-up: Hindari bertarung di medan keahlian utama ${projectedWinner.name}. Ubah tempo pertandingan dan serang sisi rentannya (${finalCompetitors[1]?.tacticalVulnerability || 'ritme stamina'}).`,
    'Menurut Al-Biruni: Kemenangan sejati dalam hisab falak diraih oleh siapa yang mampu menyeimbangkan hisab lahiriah (latihan keras) dengan kesiapan batiniah (doa dan ketenangan jiwa).',
  ];

  return {
    dayOfCompetition: day,
    dayRulerPlanet: dayInfo.planet,
    competitors: finalCompetitors,
    projectedWinner,
    competitionDynamics,
    strategicAdvice,
  };
}
