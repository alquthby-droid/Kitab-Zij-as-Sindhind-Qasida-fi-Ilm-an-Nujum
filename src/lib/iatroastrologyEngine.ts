import {
  AspectRelation,
  HistoricalDateInfo,
  PlanetKey,
  PlanetaryPosition,
} from '../types';
import { ZODIAC_SIGNS } from './sindhindEngine';

export type HumorType = 'dam' | 'safra' | 'balgham' | 'sawda';

export interface HumorDefinition {
  id: HumorType;
  arabic: string;
  latin: string;
  indonesian: string;
  element: string;
  temperament: string;
  color: string;
  description: string;
}

export const FOUR_HUMORS: Record<HumorType, HumorDefinition> = {
  dam: {
    id: 'dam',
    arabic: 'الدَّمُ (الأحمر)',
    latin: 'Ad-Dam (Sanguinis)',
    indonesian: 'Darah / Sanguinis',
    element: 'Udara (Hawā’)',
    temperament: 'Panas & Lembab (Ḥārr Raṭb)',
    color: '#ef4444',
    description: 'Vitalitas sirkulasi, kehangatan darah, dan nutrisi jaringan (Mushtarī & Zuhrah).',
  },
  safra: {
    id: 'safra',
    arabic: 'الصَّفْرَاءُ',
    latin: 'Aṣ-Ṣafrā’ (Koleris)',
    indonesian: 'Empedu Kuning / Koleris',
    element: 'Api (Nār)',
    temperament: 'Panas & Kering (Ḥārr Yābis)',
    color: '#f59e0b',
    description: 'Panas metabolisme, empedu, peradangan, dan daya gerak (Shams & Mirrīkh).',
  },
  balgham: {
    id: 'balgham',
    arabic: 'البَلْغَمُ',
    latin: 'Al-Balgham (Flegmatis)',
    indonesian: 'Lendir / Flegmatis',
    element: 'Air (Mā’)',
    temperament: 'Dingin & Lembab (Bārid Raṭb)',
    color: '#38bdf8',
    description: 'Cairan tubuh, otak, paru-paru, limfa, dan keseimbangan dingin (Qamar & Zuhrah).',
  },
  sawda: {
    id: 'sawda',
    arabic: 'السَّوْدَاءُ',
    latin: 'As-Sawdā’ (Melankolis)',
    indonesian: 'Empedu Hitam / Melankolis',
    element: 'Tanah (Turāb)',
    temperament: 'Dingin & Kering (Bārid Yābis)',
    color: '#a855f7',
    description: 'Struktur tulang, limpa, saraf halus, dan retensi dingin (Zuḥal & ‘Uṭārid).',
  },
};

export interface KawkabAnatomyProfile {
  planetKey: PlanetKey;
  arabicName: string;
  transliteration: string;
  symbol: string;
  color: string;
  primaryHumor: HumorType;
  temperamentIndo: string;
  primaryOrgansId: string;
  organsArabic: string;
  organsList: string[];
  bodyRegionId: 'head' | 'chest_heart' | 'abdomen_liver' | 'nervous_throat' | 'kidneys_pelvis' | 'bones_spleen' | 'blood_muscles' | 'nodes';
  svgAnchor: { x: number; y: number };
  governedSigns: string[];
  symptomsOnAffliction: string[];
  balancingGuidance: string;
  manuscriptReference: string;
}

export const KAWKAB_ANATOMY: Record<PlanetKey, KawkabAnatomyProfile> = {
  sun: {
    planetKey: 'sun',
    arabicName: 'الشمس',
    transliteration: 'ash-Shams',
    symbol: '☉',
    color: '#eab308',
    primaryHumor: 'safra',
    temperamentIndo: 'Panas & Kering (Ḥārr Yābis)',
    primaryOrgansId: 'Jantung, Vitalitas (Rūḥ Ḥayawānī), Mata Kanan & Tulang Punggung',
    organsArabic: 'القَلْبُ وَالرُّوحُ الحَيَوَانِيُّ وَالعَيْنُ اليُمْنَى',
    organsList: ['Jantung (Al-Qalb)', 'Pneuma Vital', 'Arteri Aorta', 'Punggung Atas', 'Mata Kanan'],
    bodyRegionId: 'chest_heart',
    svgAnchor: { x: 118, y: 118 },
    governedSigns: ['Leo (Al-Asad)'],
    symptomsOnAffliction: [
      'Jantung berdebar atau sesak di dada',
      'Kelelahan vitalitas & panas dalam berlebihan',
      'Ketegangan mata atau punggung atas terasa kaku',
    ],
    balancingGuidance: 'Istirahat teratur, hindari paparan panas berlebih, konsumsi asupan penyejuk ringan (air mawar, delima, kurma secukupnya).',
    manuscriptReference: 'Zij as-Sindhind & Al-Biruni at-Tafhim §382 (Wilayah Shams atas Qalb)',
  },
  moon: {
    planetKey: 'moon',
    arabicName: 'القمر',
    transliteration: 'al-Qamar',
    symbol: '☽',
    color: '#94a3b8',
    primaryHumor: 'balgham',
    temperamentIndo: 'Dingin & Lembab (Bārid Raṭb)',
    primaryOrgansId: 'Otak, Lambung, Cairan Tubuh & Paru-paru',
    organsArabic: 'الدِّمَاغُ وَالمَعِدَةُ وَالرُّطُوبَاتُ',
    organsList: ['Otak (Ad-Dimāgh)', 'Lambung (Al-Ma‘idah)', 'Paru-paru Kiri', 'Kelenjar Limfa', 'Mata Kiri'],
    bodyRegionId: 'head',
    svgAnchor: { x: 100, y: 40 },
    governedSigns: ['Cancer (As-Saraṭān)'],
    symptomsOnAffliction: [
      'Sakit kepala sebelah / rasa berat di kepala',
      'Lambung kembung, mual, atau pencernaan lembab lambat',
      'Retensi cairan, flu berdahak, atau tidur tidak nyenyak',
    ],
    balancingGuidance: 'Jaga kehangatan perut sebelum tidur, kurangi makanan dingin/berlendir saat malam, perbanyak minuman hangat jahe atau madu.',
    manuscriptReference: 'Qasida fi ‘Ilm an-Nujum & Al-Qanun fi at-Tibb (Pengaruh Fase Qamar terhadap Balgham)',
  },
  mercury: {
    planetKey: 'mercury',
    arabicName: 'عطارد',
    transliteration: '‘Uṭārid',
    symbol: '☿',
    color: '#06b6d4',
    primaryHumor: 'sawda',
    temperamentIndo: 'Campuran / Adaptif (Mumtazij)',
    primaryOrgansId: 'Sistem Saraf, Otak Berpikir, Lidah, Pernapasan & Usus Halus',
    organsArabic: 'الأَعْصَابُ وَاللِّسَانُ وَالحَوَاسُّ',
    organsList: ['Sistem Saraf (Al-A‘ṣāb)', 'Lidah & Pita Suara', 'Bahu & Tangan', 'Saluran Napas Atas', 'Usus Halus'],
    bodyRegionId: 'nervous_throat',
    svgAnchor: { x: 100, y: 74 },
    governedSigns: ['Gemini (Al-Jawzā’)', 'Virgo (As-Sunbulah)'],
    symptomsOnAffliction: [
      'Gelisah saraf, sulit fokus, atau ketegangan bahu/tangan',
      'Gangguan pencernaan fungsional akibat stres pikiran',
      'Tenggorokan kering atau kelelahan vokal/sensorik',
    ],
    balancingGuidance: 'Kurangi beban stimulasi mental, latihan pernapasan teratur, konsumsi minyak zaitun atau kacang badam untuk menenangkan saraf.',
    manuscriptReference: 'Zij as-Sindhind Bab Ahkam al-Kawakib (‘Uṭārid penguasa A‘ṣāb & Fikr)',
  },
  venus: {
    planetKey: 'venus',
    arabicName: 'الزهرة',
    transliteration: 'az-Zuhrah',
    symbol: '♀',
    color: '#ec4899',
    primaryHumor: 'dam',
    temperamentIndo: 'Lembab Sedang & Sejuk (Bārid Raṭb Mu‘tadil)',
    primaryOrgansId: 'Ginjal, Tenggorokan, Sistem Hormon & Pembuluh Vena',
    organsArabic: 'الكُلْيَتَانِ وَالحَلْقُ وَالعُرُوقُ',
    organsList: ['Ginjal (Al-Kulyatān)', 'Tenggorokan', 'Kelenjar Leher', 'Sistem Reproduksi', 'Kulit Halus'],
    bodyRegionId: 'kidneys_pelvis',
    svgAnchor: { x: 82, y: 162 },
    governedSigns: ['Taurus (Ath-Thawr)', 'Libra (Al-Mīzān)'],
    symptomsOnAffliction: [
      'Nyeri pinggang bawah atau rasa tidak nyaman area ginjal',
      'Radang tenggorokan ringan atau leher tegang',
      'Ketidakseimbangan cairan / kelelahan akibat pola makan manis berlebih',
    ],
    balancingGuidance: 'Cukupi hidrasi air murni, jaga pola makan seimbang rendah gula olahan, hindari udara dingin langsung ke area leher.',
    manuscriptReference: 'Al-Majriti & At-Tafhim §390 (Wilayah Zuhrah atas Kulyatān & Halq)',
  },
  mars: {
    planetKey: 'mars',
    arabicName: 'المريخ',
    transliteration: 'al-Mirrīkh',
    symbol: '♂',
    color: '#f97316',
    primaryHumor: 'safra',
    temperamentIndo: 'Panas & Kering Ekstrem (Ḥārr Yābis Mufrit)',
    primaryOrgansId: 'Kantong Empedu, Otot, Darah Panas & Peradangan',
    organsArabic: 'المَرَارَةُ وَالعَضَلَاتُ وَالدَّمُ الحَارُّ',
    organsList: ['Kantong Empedu (Al-Marārah)', 'Jaringan Otot', 'Telinga Kiri', 'Hidung & Sinus', 'Kepala/Pelipis'],
    bodyRegionId: 'blood_muscles',
    svgAnchor: { x: 142, y: 132 },
    governedSigns: ['Aries (Al-Ḥaml)', 'Scorpio (Al-‘Aqrab)'],
    symptomsOnAffliction: [
      'Demam mendadak, migrain berdenyut, atau peradangan akut',
      'Kram otot, iritasi kulit merah, atau nyeri empedu',
      'Sifat mudah tersulut emosi dan tekanan darah meningkat',
    ],
    balancingGuidance: 'Perbanyak asupan berserat dingin (mentimun, labu air, air kelapa), hindari makanan pedas/gorengan berlebih, kendalikan emosi.',
    manuscriptReference: 'Zij as-Sindhind & Qasida fi ‘Ilm an-Nujum (Mirrīkh Nahs Asghar penguasa Marārah & Harārah)',
  },
  jupiter: {
    planetKey: 'jupiter',
    arabicName: 'المشتري',
    transliteration: 'al-Mushtarī',
    symbol: '♃',
    color: '#22c55e',
    primaryHumor: 'dam',
    temperamentIndo: 'Panas & Lembab Seimbang (Ḥārr Raṭb)',
    primaryOrgansId: 'Hati (Liver), Paru-paru Kanan, Darah Utama & Pertumbuhan',
    organsArabic: 'الكَبِدُ وَالرِّئَةُ وَالدَّمُ الصَّافِي',
    organsList: ['Hati (Al-Kabid)', 'Paru-paru (Ar-Ri’ah)', 'Aliran Arteri', 'Paha & Pinggul', 'Metabolisme Nutrisi'],
    bodyRegionId: 'abdomen_liver',
    svgAnchor: { x: 80, y: 134 },
    governedSigns: ['Sagittarius (Al-Qaws)', 'Pisces (Al-Ḥūt)'],
    symptomsOnAffliction: [
      'Rasa penuh di perut kanan atas (hati) atau gangguan metabolisme',
      'Kelebihan berat/kadar lemak atau darah terasa berat',
      'Pegal pada pangkal paha atau sesak napas setelah makan berat',
    ],
    balancingGuidance: 'Jaga porsi makan agar tidak berlebihan, perbanyak buah asam-manis alami dan sayuran hijau pahit ringan untuk mendukung fungsi hati.',
    manuscriptReference: 'At-Tafhim & Zij al-Kabir (Mushtarī Sa‘d Akbar penguasa Kabid & Dam)',
  },
  saturn: {
    planetKey: 'saturn',
    arabicName: 'زحل',
    transliteration: 'Zuḥal',
    symbol: '♄',
    color: '#6366f1',
    primaryHumor: 'sawda',
    temperamentIndo: 'Dingin & Kering Ekstrem (Bārid Yābis)',
    primaryOrgansId: 'Limpa, Tulang, Sendi, Gigi & Kulit Kering',
    organsArabic: 'الطِّحَالُ وَالعِظَامُ وَالمَفَاصِلُ',
    organsList: ['Limpa (Aṭ-Ṭiḥāl)', 'Tulang & Rangka', 'Sendi Lutut', 'Gigi & Gusi', 'Telinga Kanan'],
    bodyRegionId: 'bones_spleen',
    svgAnchor: { x: 118, y: 194 },
    governedSigns: ['Capricorn (Al-Jady)', 'Aquarius (Ad-Dalw)'],
    symptomsOnAffliction: [
      'Nyeri sendi lutut, kaku tulang, atau ngilu saat cuaca dingin',
      'Kulit terasa sangat kering, kelelahan kronis, atau pencernaan melambat',
      'Rasa murung berkepanjangan (kelebihan Sawdā’) & pegal telinga kanan',
    ],
    balancingGuidance: 'Pemanasan sendi, berjemur matahari pagi lembut, konsumsi makanan hangat-lembab (sup kaldu, madu, habbatussauda secukupnya).',
    manuscriptReference: 'Zij as-Sindhind & Al-Qanun (Zuḥal Nahs Akbar penguasa Ṭiḥāl & ‘Iẓām)',
  },
  rahu: {
    planetKey: 'rahu',
    arabicName: 'الرأس (الجوزهر)',
    transliteration: 'ar-Ra’s (Node Utara)',
    symbol: '☊',
    color: '#8b5cf6',
    primaryHumor: 'sawda',
    temperamentIndo: 'Penguat Panas/Angin Tidak Teratur',
    primaryOrgansId: 'Simpul Saraf Kranial & Pembesaran Gejala Organ Konjungsi',
    organsArabic: 'عُقْدَةُ الرَّأْسِ وَالأَبْخِرَةُ',
    organsList: ['Simpul Saraf Kepala', 'Sensitivitas Psikosomatik'],
    bodyRegionId: 'nodes',
    svgAnchor: { x: 64, y: 42 },
    governedSigns: ['Gemini (Eksaltasi klasik)'],
    symptomsOnAffliction: [
      'Gejala fisik yang fluktuatif atau sulit dilokalisasi',
      'Gangguan tidur dan kecemasan berulang',
    ],
    balancingGuidance: 'Periksa kawkab yang berkonjungsi dengan ar-Ra’s; prioritaskan ketenangan ritme harian dan tidur teratur.',
    manuscriptReference: 'Zij as-Sindhind Bab al-Jawzahar',
  },
  ketu: {
    planetKey: 'ketu',
    arabicName: 'الذنب',
    transliteration: 'adh-Dhanab (Node Selatan)',
    symbol: '☋',
    color: '#a855f7',
    primaryHumor: 'sawda',
    temperamentIndo: 'Penurun Energi & Penyusutan Dingin',
    primaryOrgansId: 'Penurunan Vitalitas Laten & Saraf Bawah',
    organsArabic: 'عُقْدَةُ الذَّنَبِ وَالنُّقْصَانُ',
    organsList: ['Ujung Saraf Bawah', 'Penurunan Imunitas/Stamina'],
    bodyRegionId: 'nodes',
    svgAnchor: { x: 136, y: 186 },
    governedSigns: ['Sagittarius (Eksaltasi klasik)'],
    symptomsOnAffliction: [
      'Lemah stamina mendadak atau kelelahan tanpa sebab jelas',
      'Kaki terasa dingin / sirkulasi perifer menurun',
    ],
    balancingGuidance: 'Fokus pada pemulihan stamina, hidrasi elektrolit alami, dan penghangatan ekstremitas.',
    manuscriptReference: 'Zij as-Sindhind Bab al-Jawzahar',
  },
};

export interface ZodiacMelothesiaInfo {
  signIndex: number;
  arabic: string;
  latin: string;
  symbol: string;
  bodyPartId: string;
  bodyPartArabic: string;
  hijamahPrecaution: string;
}

export const ZODIAC_MELOTHESIA: ZodiacMelothesiaInfo[] = [
  { signIndex: 0, arabic: 'الحمل', latin: 'Aries', symbol: '♈', bodyPartId: 'Kepala, Otak Depan & Wajah', bodyPartArabic: 'الرَّأْسُ وَالوَجْهُ', hijamahPrecaution: 'Hindari bekam berat atau tindakan bedah di area kepala saat Bulan melintasi Aries.' },
  { signIndex: 1, arabic: 'الثور', latin: 'Taurus', symbol: '♉', bodyPartId: 'Leher, Tenggorokan & Pita Suara', bodyPartArabic: 'العُنُقُ وَالحَنْجَرَةُ', hijamahPrecaution: 'Tunda tindakan invasif pada leher dan tenggorokan ketika Bulan berada di Taurus.' },
  { signIndex: 2, arabic: 'الجوزاء', latin: 'Gemini', symbol: '♊', bodyPartId: 'Bahu, Lengan, Tangan & Paru Atas', bodyPartArabic: 'المَنْكِبَانِ وَاليَدَانِ', hijamahPrecaution: 'Hindari sayatan medis di bahu/lengan ketika Bulan di Gemini.' },
  { signIndex: 3, arabic: 'السرطان', latin: 'Cancer', symbol: '♋', bodyPartId: 'Dada, Lambung & Rongga Toraks', bodyPartArabic: 'الصَّدْرُ وَالمَعِدَةُ', hijamahPrecaution: 'Kurangi tindakan keras pada area lambung & dada saat Bulan di Cancer.' },
  { signIndex: 4, arabic: 'الأسد', latin: 'Leo', symbol: '♌', bodyPartId: 'Jantung, Punggung Atas & Diafragma', bodyPartArabic: 'القَلْبُ وَالظَّهْرُ', hijamahPrecaution: 'Jaga detak jantung tetap tenang dan hindari tindakan bedah jantung/punggung saat Bulan di Leo.' },
  { signIndex: 5, arabic: 'السنبلة', latin: 'Virgo', symbol: '♍', bodyPartId: 'Perut, Usus & Pencernaan', bodyPartArabic: 'البَطْنُ وَالأَمْعَاءُ', hijamahPrecaution: 'Utamakan diet lembut; tunda operasi perut bila tidak darurat saat Bulan di Virgo.' },
  { signIndex: 6, arabic: 'الميزان', latin: 'Libra', symbol: '♎', bodyPartId: 'Pinggang, Ginjal & Kelenjar Adrenal', bodyPartArabic: 'الخَاصِرَةُ وَالكُلْيَتَانِ', hijamahPrecaution: 'Jaga hidrasi ginjal; hindari bekam punggung bawah terlalu dalam saat Bulan di Libra.' },
  { signIndex: 7, arabic: 'العقرب', latin: 'Scorpio', symbol: '♏', bodyPartId: 'Kandung Kemih, Pelvis & Organ Ekskresi', bodyPartArabic: 'المَثَانَةُ وَالحَوْضُ', hijamahPrecaution: 'Hindari intervensi area pelvis/ekskresi selama transit Bulan di Scorpio.' },
  { signIndex: 8, arabic: 'القوس', latin: 'Sagittarius', symbol: '♐', bodyPartId: 'Paha, Pinggul, Hati & Saraf Skatik', bodyPartArabic: 'الفَخِذَانِ وَالكَبِدُ', hijamahPrecaution: 'Hindari tindakan pada paha dan saraf skatik saat Bulan berada di Sagittarius.' },
  { signIndex: 9, arabic: 'الجدي', latin: 'Capricorn', symbol: '♑', bodyPartId: 'Lutut, Sendi & Rangka Tulang', bodyPartArabic: 'الرُّكْبَتَانِ وَالعِظَامُ', hijamahPrecaution: 'Sendi lutut lebih sensitif terhadap dingin/tindakan saat Bulan di Capricorn.' },
  { signIndex: 10, arabic: 'الدلو', latin: 'Aquarius', symbol: '♒', bodyPartId: 'Betis, Pergelangan Kaki & Vena', bodyPartArabic: 'السَّاقَانِ وَالكَعْبَانِ', hijamahPrecaution: 'Jaga sirkulasi tungkai; hindari tindakan pembuluh kaki saat Bulan di Aquarius.' },
  { signIndex: 11, arabic: 'الحوت', latin: 'Pisces', symbol: '♓', bodyPartId: 'Telapak Kaki, Jari Kaki & Cairan Limfa', bodyPartArabic: 'القَدَمَانِ وَالأَعْصَابُ', hijamahPrecaution: 'Hindari prosedur pada telapak kaki & jari kaki saat Bulan melintasi Pisces.' },
];

export interface KawkabHealthEvaluation {
  planetKey: PlanetKey;
  position: PlanetaryPosition;
  anatomy: KawkabAnatomyProfile;
  vitalityScore: number; // 0-100
  statusLabel: 'Kuat & Seimbang' | 'Sensitif (Perlu Perhatian)' | 'Tertekan Aspek / Nahs';
  statusTone: 'good' | 'caution' | 'strained';
  afflictionFactors: string[];
  harmoniousFactors: string[];
  activeAspects: AspectRelation[];
}

export interface IatroastrologyReport {
  evaluations: Record<PlanetKey, KawkabHealthEvaluation>;
  orderedPlanets: KawkabHealthEvaluation[];
  humors: Record<HumorType, number>; // normalized percentage summing to 100
  dominantHumor: HumorType;
  moonSignMelothesia: ZodiacMelothesiaInfo;
  strainedAspects: {
    aspect: AspectRelation;
    affectedOrgans: string;
    clinicalNote: string;
  }[];
}

const SEVEN_MAIN_PLANETS: PlanetKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

export function evaluateIatroastrologyState(
  positions: Record<PlanetKey, PlanetaryPosition>,
  aspects: AspectRelation[]
): IatroastrologyReport {
  const evaluations = {} as Record<PlanetKey, KawkabHealthEvaluation>;
  const humorRaw: Record<HumorType, number> = {
    dam: 20,
    safra: 20,
    balgham: 20,
    sawda: 20,
  };

  (Object.keys(KAWKAB_ANATOMY) as PlanetKey[]).forEach((key) => {
    const pos = positions[key];
    const anatomy = KAWKAB_ANATOMY[key];
    const relAspects = aspects.filter((a) => a.planetA === key || a.planetB === key);

    let score = 68;
    const afflictionFactors: string[] = [];
    const harmoniousFactors: string[] = [];

    if (pos.dignity.isDomicile) {
      score += 14;
      harmoniousFactors.push('Berada di rumah kekuasaan sendiri (Bayt / Domicile)');
    }
    if (pos.dignity.isExalted) {
      score += 12;
      harmoniousFactors.push('Berada di derajat kemuliaan (Sharaf / Exaltation)');
    }
    if (pos.dignity.isDetriment) {
      score -= 14;
      afflictionFactors.push('Berada di rumah keterasingan (Wabāl / Detriment)');
    }
    if (pos.dignity.isFall) {
      score -= 14;
      afflictionFactors.push('Berada di derajat kejatuhan (Hubūṭ / Fall)');
    }
    if (pos.isRetrograde) {
      score -= 11;
      afflictionFactors.push('Gerak mundur (Rujū‘ / Retrograde) melemahkan aliran normal organ');
    }
    if (pos.isCombust && key !== 'sun') {
      score -= 15;
      afflictionFactors.push('Terbakar sinar Matahari (Iḥtirāq / Combust < 8.5°)');
    } else if (pos.isUnderBeams && key !== 'sun') {
      score -= 7;
      afflictionFactors.push('Di bawah berkas cahaya Matahari (Taḥta ash-Shu‘ā‘)');
    }

    relAspects.forEach((asp) => {
      const other = asp.planetA === key ? asp.planetB : asp.planetA;
      const otherName = KAWKAB_ANATOMY[other]?.transliteration || other;
      const orbStr = `${asp.orbDifference.toFixed(1)}°`;

      if (asp.aspectType === 'tarbi' || asp.aspectType === 'muqabalah') {
        const maleficMultiplier = other === 'saturn' || other === 'mars' || other === 'ketu' ? 14 : 9;
        score -= maleficMultiplier;
        afflictionFactors.push(`${asp.aspectName} (${asp.exactAngle}°) dengan ${otherName} [orb ${orbStr}]`);
      } else if (asp.aspectType === 'qiran') {
        if (other === 'saturn' || other === 'mars' || other === 'ketu') {
          score -= 12;
          afflictionFactors.push(`Konjungsi berat (Qirān) bersama ${otherName} [orb ${orbStr}]`);
        } else if (other === 'jupiter' || other === 'venus') {
          score += 10;
          harmoniousFactors.push(`Konjungsi penyembuh (Qirān) bersama ${otherName} [orb ${orbStr}]`);
        }
      } else if (asp.aspectType === 'tathlith' || asp.aspectType === 'tasdis') {
        score += other === 'jupiter' || other === 'venus' ? 11 : 7;
        harmoniousFactors.push(`Aspek harmonis ${asp.aspectName} (${asp.exactAngle}°) dengan ${otherName} [orb ${orbStr}]`);
      }
    });

    score = Math.max(12, Math.min(98, Math.round(score)));

    let statusLabel: KawkabHealthEvaluation['statusLabel'] = 'Kuat & Seimbang';
    let statusTone: KawkabHealthEvaluation['statusTone'] = 'good';
    if (score < 48) {
      statusLabel = 'Tertekan Aspek / Nahs';
      statusTone = 'strained';
    } else if (score < 68) {
      statusLabel = 'Sensitif (Perlu Perhatian)';
      statusTone = 'caution';
    }

    // Contribute to classical 4-humor calculation based on zodiac element + planet temperament
    const sign = ZODIAC_SIGNS[pos.coordinate.signIndex];
    const elementHumorMap: Record<'Hawa' | 'Nar' | 'Ma' | 'Turab', HumorType> = {
      Hawa: 'dam',
      Nar: 'safra',
      Ma: 'balgham',
      Turab: 'sawda',
    };
    const weight = key === 'sun' || key === 'moon' ? 16 : SEVEN_MAIN_PLANETS.includes(key) ? 10 : 5;
    humorRaw[anatomy.primaryHumor] += weight * 0.65;
    if (sign) {
      humorRaw[elementHumorMap[sign.element]] += weight * 0.55;
    }
    if (statusTone === 'strained') {
      humorRaw[anatomy.primaryHumor] += 4;
    }

    evaluations[key] = {
      planetKey: key,
      position: pos,
      anatomy,
      vitalityScore: score,
      statusLabel,
      statusTone,
      afflictionFactors,
      harmoniousFactors,
      activeAspects: relAspects,
    };
  });

  const totalHumor = humorRaw.dam + humorRaw.safra + humorRaw.balgham + humorRaw.sawda;
  const humors: Record<HumorType, number> = {
    dam: Math.round((humorRaw.dam / totalHumor) * 100),
    safra: Math.round((humorRaw.safra / totalHumor) * 100),
    balgham: Math.round((humorRaw.balgham / totalHumor) * 100),
    sawda: 0,
  };
  humors.sawda = Math.max(0, 100 - (humors.dam + humors.safra + humors.balgham));

  const dominantHumor = (Object.keys(humors) as HumorType[]).reduce((best, cur) =>
    humors[cur] > humors[best] ? cur : best
  , 'dam' as HumorType);

  const moonSignIndex = positions.moon?.coordinate?.signIndex ?? 0;
  const moonSignMelothesia = ZODIAC_MELOTHESIA[moonSignIndex] || ZODIAC_MELOTHESIA[0];

  const strainedAspects = aspects
    .filter(
      (a) =>
        a.aspectType === 'tarbi' ||
        a.aspectType === 'muqabalah' ||
        (a.aspectType === 'qiran' &&
          (['saturn', 'mars', 'ketu', 'rahu'].includes(a.planetA) ||
            ['saturn', 'mars', 'ketu', 'rahu'].includes(a.planetB)))
    )
    .map((asp) => {
      const aInfo = KAWKAB_ANATOMY[asp.planetA];
      const bInfo = KAWKAB_ANATOMY[asp.planetB];
      return {
        aspect: asp,
        affectedOrgans: `${aInfo.organsList[0]} ↔ ${bInfo.organsList[0]}`,
        clinicalNote:
          asp.aspectType === 'muqabalah'
            ? `Oposisi 180° antara ${aInfo.transliteration} dan ${bInfo.transliteration} memicu tarik-menarik tegangan humoral antara ${aInfo.organsList[0]} dan ${bInfo.organsList[0]}.`
            : asp.aspectType === 'tarbi'
            ? `Kuartil 90° menekan keseimbangan ${aInfo.organsList[0]} serta ${bInfo.organsList[0]}; kurangi pemicu kelelahan organ terkait.`
            : `Pertemuan langsung (Qirān) memperbesar sensitivitas pada ${aInfo.organsList[0]} dan ${bInfo.organsList[0]}.`,
      };
    });

  const orderedPlanets = SEVEN_MAIN_PLANETS.map((k) => evaluations[k]);

  return {
    evaluations,
    orderedPlanets,
    humors,
    dominantHumor,
    moonSignMelothesia,
    strainedAspects,
  };
}

// =========================================================================
// SYMPTOM PRESETS & LOCAL STORAGE CLINICAL LOG
// =========================================================================

export interface CommonSymptomPreset {
  id: string;
  label: string;
  defaultPlanet: PlanetKey;
  defaultOrgan: string;
  humor: HumorType;
}

export const COMMON_SYMPTOM_PRESETS: CommonSymptomPreset[] = [
  { id: 'headache', label: 'Sakit Kepala / Pusing', defaultPlanet: 'moon', defaultOrgan: 'Otak (Ad-Dimāgh)', humor: 'balgham' },
  { id: 'palpitation', label: 'Jantung Berdebar / Lelah Dada', defaultPlanet: 'sun', defaultOrgan: 'Jantung (Al-Qalb)', humor: 'safra' },
  { id: 'stomach', label: 'Nyeri Lambung / Kembung', defaultPlanet: 'moon', defaultOrgan: 'Lambung (Al-Ma‘idah)', humor: 'balgham' },
  { id: 'nerve', label: 'Gelisah Saraf / Insomnia', defaultPlanet: 'mercury', defaultOrgan: 'Sistem Saraf (Al-A‘ṣāb)', humor: 'sawda' },
  { id: 'joint', label: 'Nyeri Sendi / Lutut Kaku', defaultPlanet: 'saturn', defaultOrgan: 'Tulang & Sendi', humor: 'sawda' },
  { id: 'fever', label: 'Demam / Peradangan Otot', defaultPlanet: 'mars', defaultOrgan: 'Empedu & Otot', humor: 'safra' },
  { id: 'kidney', label: 'Pegal Pinggang / Tenggorokan', defaultPlanet: 'venus', defaultOrgan: 'Ginjal & Tenggorokan', humor: 'dam' },
  { id: 'liver', label: 'Perut Kanan Penuh / Metabolik', defaultPlanet: 'jupiter', defaultOrgan: 'Hati (Al-Kabid)', humor: 'dam' },
];

export interface AspectSnapshot {
  planetA: string;
  planetB: string;
  aspectName: string;
  aspectArabic: string;
  exactAngle: number;
  orbDifference: number;
  nature: AspectRelation['nature'];
}

export interface MedicalSymptomLog {
  id: string;
  createdAtISO: string;
  dateLabel: string;
  hijriDateLabel: string;
  symptomTitle: string;
  planetKey: PlanetKey;
  organTarget: string;
  severity: 1 | 2 | 3 | 4 | 5;
  notes: string;
  moonSignLabel: string;
  dominantHumorLabel: string;
  capturedAspects: AspectSnapshot[];
}

const SYMPTOM_LOGS_STORAGE_KEY = 'sindhind_iatroastrology_logs_v1';

export function loadSymptomLogs(): MedicalSymptomLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SYMPTOM_LOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSymptomLogs(logs: MedicalSymptomLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SYMPTOM_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // ignore storage quota errors
  }
}

export function buildAspectSnapshotsForPlanet(
  planetKey: PlanetKey,
  aspects: AspectRelation[]
): AspectSnapshot[] {
  return aspects
    .filter((a) => a.planetA === planetKey || a.planetB === planetKey)
    .map((a) => ({
      planetA: KAWKAB_ANATOMY[a.planetA]?.transliteration || a.planetA,
      planetB: KAWKAB_ANATOMY[a.planetB]?.transliteration || a.planetB,
      aspectName: a.aspectName,
      aspectArabic: a.aspectArabic,
      exactAngle: a.exactAngle,
      orbDifference: a.orbDifference,
      nature: a.nature,
    }));
}

export function createSymptomLogEntry(params: {
  symptomTitle: string;
  planetKey: PlanetKey;
  organTarget: string;
  severity: 1 | 2 | 3 | 4 | 5;
  notes: string;
  currentDateInfo: HistoricalDateInfo;
  positions: Record<PlanetKey, PlanetaryPosition>;
  aspects: AspectRelation[];
  dominantHumor: HumorType;
}): MedicalSymptomLog {
  const {
    symptomTitle,
    planetKey,
    organTarget,
    severity,
    notes,
    currentDateInfo,
    positions,
    aspects,
    dominantHumor,
  } = params;

  const moonSignIdx = positions.moon?.coordinate?.signIndex ?? 0;
  const moonSign = ZODIAC_SIGNS[moonSignIdx];
  const gregorian = currentDateInfo.gregorian;
  const hijri = currentDateInfo.hijri;

  const dateLabel = `${String(gregorian.day).padStart(2, '0')}/${String(gregorian.month).padStart(
    2,
    '0'
  )}/${gregorian.year} ${String(gregorian.hour).padStart(2, '0')}:${String(
    gregorian.minute
  ).padStart(2, '0')}`;

  const hijriDateLabel = `${hijri.day} ${hijri.monthNameLatin} ${hijri.year} H`;

  return {
    id: `iatro_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAtISO: new Date().toISOString(),
    dateLabel,
    hijriDateLabel,
    symptomTitle: symptomTitle.trim(),
    planetKey,
    organTarget: organTarget.trim(),
    severity,
    notes: notes.trim(),
    moonSignLabel: moonSign ? `${moonSign.latinName} (${moonSign.arabicName})` : 'Aries',
    dominantHumorLabel: FOUR_HUMORS[dominantHumor].latin,
    capturedAspects: buildAspectSnapshotsForPlanet(planetKey, aspects),
  };
}
