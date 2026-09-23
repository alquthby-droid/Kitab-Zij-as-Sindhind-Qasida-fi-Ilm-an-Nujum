/**
 * Wafaq & Islamic Amulet Generator Engine (عِلْمُ الأَوْفَاقِ وَالطَّلَاسِمِ المَنَازِلِيَّة)
 * Classical Islamic mathematical magic squares, lunar mansion correspondences,
 * talismanic seals, and sacred geometric designs based on:
 * - Kitab Syams al-Ma'arif al-Kubra (Syaikh Ahmad bin Ali al-Buni)
 * - Kitab al-Awfaq (Imam Abu Hamid al-Ghazali)
 * - Ghayat al-Hakim fi at-Talsamat (Picatrix - Maslama al-Majriti)
 * - Taj al-Muluk wa Mujarobat al-Falakiyyah
 */

import { DetailedManzil, MANZIL_DETAILED_DATA } from '../data/manzilDetailedData';
import { ABJAD_TABLE } from './hisabJumalEngine';

export type WafaqGridType = '3x3' | '4x4' | 'circle';
export type NumeralStyle = 'arabic' | 'abjad' | 'latin';
export type AmuletThemeId = 'parchment' | 'midnight_gold' | 'saffron_ruby' | 'emerald_sufi';
export type HajatPurpose = 'protection' | 'wealth' | 'love' | 'wisdom' | 'prestige';

export interface AmuletThemeConfig {
  id: AmuletThemeId;
  name: string;
  nameArabic: string;
  bgColor: string;
  bgTextureOverlay?: string;
  primaryBorder: string;
  secondaryBorder: string;
  gridLineColor: string;
  primaryText: string;
  accentText: string;
  sigilColor: string;
  goldAccent: string;
  shadowColor: string;
}

export const AMULET_THEMES: Record<AmuletThemeId, AmuletThemeConfig> = {
  parchment: {
    id: 'parchment',
    name: 'Makhthūṭāt Dhahabī (Perkamen Emas Kuno)',
    nameArabic: 'مَخْطُوطَاتٌ ذَهَبِيَّة',
    bgColor: '#f7f1e1',
    primaryBorder: '#8a6225',
    secondaryBorder: '#c49a45',
    gridLineColor: '#8a6225',
    primaryText: '#2b1d0c',
    accentText: '#a32a2a', // Saffron red (Za'faran)
    sigilColor: '#a32a2a',
    goldAccent: '#d4af37',
    shadowColor: 'rgba(92, 64, 25, 0.25)',
  },
  midnight_gold: {
    id: 'midnight_gold',
    name: 'Layl Aswad wa Dhahab (Malam Emas Kerajaan)',
    nameArabic: 'لَيْلٌ أَسْوَدٌ وَذَهَب',
    bgColor: '#0d131f',
    primaryBorder: '#d4af37',
    secondaryBorder: '#e6c86e',
    gridLineColor: '#c59a43',
    primaryText: '#fbf7ee',
    accentText: '#38bdf8', // Celestial cyan
    sigilColor: '#e6c86e',
    goldAccent: '#ffd700',
    shadowColor: 'rgba(0, 0, 0, 0.7)',
  },
  saffron_ruby: {
    id: 'saffron_ruby',
    name: 'Za\'farān wa Yāqūt (Tinta Za\'faran & Delima)',
    nameArabic: 'زَعْفَرَانٌ وَيَاقُوت',
    bgColor: '#faf3eb',
    primaryBorder: '#991b1b',
    secondaryBorder: '#c59a43',
    gridLineColor: '#b91c1c',
    primaryText: '#450a0a',
    accentText: '#b91c1c',
    sigilColor: '#dc2626',
    goldAccent: '#eab308',
    shadowColor: 'rgba(153, 27, 27, 0.2)',
  },
  emerald_sufi: {
    id: 'emerald_sufi',
    name: 'Zumurrud Ṣūfī (Zamrud Hijau Khidir)',
    nameArabic: 'زُمُرُّدٌ صُوفِيّ',
    bgColor: '#072018',
    primaryBorder: '#c59a43',
    secondaryBorder: '#4ade80',
    gridLineColor: '#22c55e',
    primaryText: '#f0fdf4',
    accentText: '#eab308',
    sigilColor: '#fbbf24',
    goldAccent: '#ffd700',
    shadowColor: 'rgba(0, 0, 0, 0.65)',
  },
};

export interface HajatDetail {
  id: HajatPurpose;
  titleLatin: string;
  titleArabic: string;
  meaning: string;
  defaultAsma: string[];
  defaultVerseArabic: string;
  defaultVerseLatin: string;
  cardinalLabel: string;
  colorHex: string;
}

export const HAJAT_PRESETS: Record<HajatPurpose, HajatDetail> = {
  protection: {
    id: 'protection',
    titleLatin: 'Hifz & Aman (Perlindungan & Keselamatan)',
    titleArabic: 'حِفْظٌ وَسَلَامَةٌ مِنَ الشُّرُور',
    meaning: 'Membentengi diri, keluarga, dan kediaman dari marabahaya, kedengkian, dan godaan.',
    defaultAsma: ['يَا حَفِيظُ', 'يَا نَصِيرُ', 'يَا مُهَيْمِنُ', 'يَا سَلَامُ'],
    defaultVerseArabic: 'فَاللَّهُ خَيْرٌ حَافِظًا وَهُوَ أَرْحَمُ الرَّاحِمِينَ',
    defaultVerseLatin: 'Fallāhu khayrun ḥāfiẓan wa Huwa arḥamu ar-rāḥimīn.',
    cardinalLabel: 'Benteng 4 Penjuru (Al-Arkan al-Arba\'ah)',
    colorHex: '#3b82f6',
  },
  wealth: {
    id: 'wealth',
    titleLatin: 'Jalb al-Arzaq (Kelancaran Rezeki & Kemakmuran)',
    titleArabic: 'جَلْبُ الأَرْزَاقِ وَالبَرَكَةِ فِي التِّجَارَة',
    meaning: 'Membukakan jalan perniagaan, mendatangkan rezeki berkah melimpah, dan kemudahan hajat duniawi.',
    defaultAsma: ['يَا رَزَّاقُ', 'يَا فَتَّاحُ', 'يَا بَاسِطُ', 'يَا غَنِيُّ'],
    defaultVerseArabic: 'إِنَّ اللَّهَ يَرْزُقُ مَنْ يَشَاءُ بِغَيْرِ حِسَابٍ',
    defaultVerseLatin: 'Innallāha yarzuqu man yasyā’u bi-ghayri ḥisāb.',
    cardinalLabel: 'Pintu Rezeki Samudra & Bumi',
    colorHex: '#eab308',
  },
  love: {
    id: 'love',
    titleLatin: 'Mahabbah & Ulfah (Kasih Sayang & Kerukunan)',
    titleArabic: 'مَحَبَّةٌ وَأُلْفَةٌ وَتَأْلِيفُ القُلُوب',
    meaning: 'Menautkan hati sanubari, mendamaikan perselisihan, menyemai rasa cinta dan simpati sesama.',
    defaultAsma: ['يَا وَدُودُ', 'يَا رَؤُوفُ', 'يَا عَطُوفُ', 'يَا جَامِعُ'],
    defaultVerseArabic: 'وَأَلَّفَ بَيْنَ قُلُوبِهِمْ لَوْ أَنْفَقْتَ مَا فِي الأَرْضِ جَمِيعًا',
    defaultVerseLatin: 'Wa allafa bayna qulūbihim law anfaqta mā fī al-arḍi jamī‘an.',
    cardinalLabel: 'Penyatu Jiwa & Rasa Cinta',
    colorHex: '#ec4899',
  },
  wisdom: {
    id: 'wisdom',
    titleLatin: 'Fath al-Futuh & Shifa\' (Kecerdasan & Kesembuhan)',
    titleArabic: 'فَتْحُ الفُتُوحِ وَالشِّفَاءُ وَنُورُ البَصِيرَة',
    meaning: 'Menerangi akal budi, menajamkan hafalan ilmu, dan mendatangkan kesembuhan jiwa raga.',
    defaultAsma: ['يَا عَلِيمُ', 'يَا حَكِيمُ', 'يَا شَافِي', 'يَا نُورُ'],
    defaultVerseArabic: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنْكُمْ وَالَّذِينَ أُوتُوا العِلْمَ دَرَجَاتٍ',
    defaultVerseLatin: 'Yarfa‘illāhullażīna āmanū minkum wallażīna ūtul-‘ilma darajāt.',
    cardinalLabel: 'Pelita Ilmu & Rahasia Syifa',
    colorHex: '#10b981',
  },
  prestige: {
    id: 'prestige',
    titleLatin: 'Nasr & Haybah (Kewibawaan & Kemenangan)',
    titleArabic: 'هَيْبَةٌ وَقَبُولٌ وَنَصْرٌ عَلَى الصِّعَاب',
    meaning: 'Memancarkan wibawa terhormat, disegani khalayak, dan memenangkan persaingan secara bermartabat.',
    defaultAsma: ['يَا عَزِيزُ', 'يَا جَبَّارُ', 'يَا مَلِكُ', 'يَا ظَاهِرُ'],
    defaultVerseArabic: 'إِنَّا فَتَحْنَا لَكَ فَتْحًا مُبِينًا وَيَنْصُرَكَ اللَّهُ نَصْرًا عَزِيزًا',
    defaultVerseLatin: 'Innā fataḥnā laka fatḥan mubīnā wa yanṣurakallāhu naṣran ‘azīzā.',
    cardinalLabel: 'Wibawa Singgasana Kemenangan',
    colorHex: '#8b5cf6',
  },
};

/**
 * Seven Mystical Talismanic Symbols (Al-Khatam as-Sulaymani / Al-Asma' as-Sab'ah)
 * from Shams al-Ma'arif al-Kubra
 */
export interface TalismanicSigilInfo {
  symbolChar: string;
  nameArabic: string;
  nameLatin: string;
  mysteryMeaning: string;
}

export const SEVEN_TALISMANIC_SIGILS: TalismanicSigilInfo[] = [
  { symbolChar: '★', nameArabic: 'نَجْمَةٌ خُمَاسِيَّةٌ / ثُمَانِيَّة', nameLatin: 'An-Najmah (Bintang Segel Rahasia)', mysteryMeaning: 'Pusat poros cahaya ketuhanan yang menghimpun segala rahasia wujud.' },
  { symbolChar: '|||', nameArabic: 'ثَلَاثُ عِصِيٍّ فِي الرُّوحِ', nameLatin: "Ath-Thalath 'Isiyyan (Tiga Tombak Cahaya)", mysteryMeaning: 'Tiga garis keteguhan jiwa, akal, dan raga menembus tirai kegelapan.' },
  { symbolChar: 'مـ', nameArabic: 'مِيمٌ مَحْلُولَةٌ طَلْسَمِيَّة', nameLatin: 'Mim Mahlulah (Mim Kunci Pembuka)', mysteryMeaning: 'Huruf Mim rahasia perbendaharaan Muhammadiah dan keselamatan batin.' },
  { symbolChar: '☲', nameArabic: 'سُلَّمٌ ذُو دَرَجَتَيْنِ', nameLatin: 'As-Sullam (Tangga Mi\'raj Kasyaf)', mysteryMeaning: 'Tangga kenaikan derajat spiritual dan peningkatan maqam manusia.' },
  { symbolChar: '||||', nameArabic: 'أَرْبَعَةُ أَصَابِعَ قُدْسِيَّة', nameLatin: 'Arba\'ah Asabi\' (Empat Jari Wibawa)', mysteryMeaning: 'Empat pilar kekuasaan ilahi pengatur empat penjuru mata angin.' },
  { symbolChar: 'هـ', nameArabic: 'هَاءٌ مَشْقُوقَةٌ شَرِيفَة', nameLatin: 'Ha\' Masyquqah (Ha\' Nafas Hayat)', mysteryMeaning: 'Isyarat rahasia Dzat Yang Maha Hidup Kekal Abadi.' },
  { symbolChar: 'و', nameArabic: 'وَاوٌ مَقْلُوبَةٌ فَلَكِيَّة', nameLatin: 'Waw Maqlubah (Waw Cakra Perlindungan)', mysteryMeaning: 'Kait perlindungan ilahi yang mengikat segala keberkahan dan kebaikan.' },
];

/**
 * Convert number to Eastern Arabic numerals
 */
export function toEasternArabicDigits(num: number): string {
  const easternDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((d) => (d >= '0' && d <= '9' ? easternDigits[parseInt(d, 10)] : d))
    .join('');
}

/**
 * Convert number to Abjad string representation (using classical Abjad table)
 */
export function toAbjadNumerals(num: number): string {
  if (num <= 0) return '٠';

  let remaining = num;
  let result = '';

  const descendingAbjad: [number, string][] = [
    [1000, 'غ'],
    [900, 'ظ'],
    [800, 'ض'],
    [700, 'ذ'],
    [600, 'خ'],
    [500, 'ث'],
    [400, 'ت'],
    [300, 'ش'],
    [200, 'ر'],
    [100, 'ق'],
    [90, 'ص'],
    [80, 'ف'],
    [70, 'ع'],
    [60, 'س'],
    [50, 'ن'],
    [40, 'م'],
    [30, 'ل'],
    [20, 'ك'],
    [10, 'ي'],
    [9, 'ط'],
    [8, 'ح'],
    [7, 'ز'],
    [6, 'و'],
    [5, 'هـ'],
    [4, 'د'],
    [3, 'ج'],
    [2, 'ب'],
    [1, 'ا'],
  ];

  for (const [val, letter] of descendingAbjad) {
    while (remaining >= val) {
      result += letter;
      remaining -= val;
    }
  }

  return result || toEasternArabicDigits(num);
}

/**
 * Calculate authentic mathematical 3x3 Magic Square (Musallas Ghazali / Buduh)
 * For a specified target sum S (where S is typically the Jumal total of Name + Manzil).
 * Classical Algorithm of Al-Buni & Al-Ghazali:
 * Base 3x3 square:
 *  4  9  2
 *  3  5  7
 *  8  1  6
 * Target S = 15 base.
 * For general S >= 15:
 * Q = Math.floor((S - 12) / 3);
 * R = (S - 12) % 3;
 * If R == 0: add Q to all cells.
 * If R == 1: add Q to cells 1-6, add Q+1 to cells 7-9 (broken jump at 7).
 * If R == 2: add Q to cells 1-4, add Q+1 to cells 5-9.
 */
export function generateMusallas3x3(targetSum: number): {
  grid: number[][];
  targetSum: number;
  rowSums: number[];
  colSums: number[];
  diagSums: [number, number];
  isPerfect: boolean;
} {
  const S = Math.max(15, targetSum);
  const diff = S - 12;
  const Q = Math.floor(diff / 3);
  const R = ((diff % 3) + 3) % 3;

  // Base indices (1 to 9) in standard 3x3 magic positions:
  // [ [4, 9, 2],
  //   [3, 5, 7],
  //   [8, 1, 6] ]
  const baseOrder: [number, number, number][] = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];

  const grid: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cellRank = baseOrder[r][c]; // rank 1..9
      let cellVal = cellRank + Q;
      if (R === 1) {
        if (cellRank >= 7) cellVal += 1;
      } else if (R === 2) {
        if (cellRank >= 5) cellVal += 1;
      }
      grid[r][c] = cellVal;
    }
  }

  // Verification
  const rowSums = grid.map((row) => row.reduce((a, b) => a + b, 0));
  const colSums = [0, 1, 2].map((c) => grid[0][c] + grid[1][c] + grid[2][c]);
  const diagSums: [number, number] = [
    grid[0][0] + grid[1][1] + grid[2][2],
    grid[0][2] + grid[1][1] + grid[2][0],
  ];

  const isPerfect =
    rowSums.every((s) => s === S) &&
    colSums.every((s) => s === S) &&
    diagSums[0] === S &&
    diagSums[1] === S;

  return { grid, targetSum: S, rowSums, colSums, diagSums, isPerfect };
}

/**
 * Calculate 4x4 Magic Square (Murabba' as-Sirr al-Maktum)
 * Base target is 34.
 * S >= 34:
 * Q = Math.floor((S - 30) / 4);
 * R = (S - 30) % 4;
 */
export function generateMurabba4x4(targetSum: number): {
  grid: number[][];
  targetSum: number;
  rowSums: number[];
  colSums: number[];
  diagSums: [number, number];
  isPerfect: boolean;
} {
  const S = Math.max(34, targetSum);
  const diff = S - 30;
  const Q = Math.floor(diff / 4);
  const R = ((diff % 4) + 4) % 4;

  // Standard classical 4x4 rank (1..16):
  const baseOrder: number[][] = [
    [16, 3, 2, 13],
    [5, 10, 11, 8],
    [9, 6, 7, 12],
    [4, 15, 14, 1],
  ];

  const grid: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cellRank = baseOrder[r][c];
      let val = cellRank + Q;
      if (R === 1) {
        if (cellRank >= 13) val += 1;
      } else if (R === 2) {
        if (cellRank >= 9) val += 1;
      } else if (R === 3) {
        if (cellRank >= 5) val += 1;
      }
      grid[r][c] = val;
    }
  }

  const rowSums = grid.map((row) => row.reduce((a, b) => a + b, 0));
  const colSums = [0, 1, 2, 3].map((c) => grid[0][c] + grid[1][c] + grid[2][c] + grid[3][c]);
  const diagSums: [number, number] = [
    grid[0][0] + grid[1][1] + grid[2][2] + grid[3][3],
    grid[0][3] + grid[1][2] + grid[2][1] + grid[3][0],
  ];

  const isPerfect =
    rowSums.every((s) => s === S) &&
    colSums.every((s) => s === S) &&
    diagSums[0] === S &&
    diagSums[1] === S;

  return { grid, targetSum: S, rowSums, colSums, diagSums, isPerfect };
}

export const APP_DEVELOPER_INFO = {
  name: 'Al-Faqir Husni Bin Sabri Sapri',
  nameArabic: 'الفَقِيرُ حُسْنِي بْنِ صَبْرِي سَابْرِي',
  address: 'Beremi Jagaraga Kuripan Lombok Barat',
  addressArabic: 'بِيرِيمِي، جَاغَارَاغَا، كُورِيبَان، لُومْبُوك الغَرْبِيَّة',
  phone1: '+6281915949627',
  phone2: '+6285239163085',
  waLink1: 'https://wa.me/6281915949627',
  waLink2: 'https://wa.me/6285239163085',
  title: 'Khadim Turats Falak & Pengembang Aplikasi',
};

/**
 * 28 Lunar Mansions Khadim Angel Arabic vocalization map
 */
export const MANZIL_ANGELIC_ARABIC: Record<number, string> = {
  1: 'إِسْرَافِيل / رُوقْيَائِيل',
  2: 'جِبْرَائِيل / سَمَائِيل',
  3: 'مِيكَائِيل / ثَالِيل',
  4: 'عِزْرَائِيل / دَرْدَائِيل',
  5: 'كَلْكَائِيل',
  6: 'شَمْخَائِيل',
  7: 'بُورْيَائِيل',
  8: 'عَطْوَائِيل',
  9: 'طُوفْيَائِيل',
  10: 'هَمْيَائِيل',
  11: 'شَمَائِيل',
  12: 'رُوقْيَائِيل',
  13: 'جِبْرَائِيل',
  14: 'مِيكَائِيل',
  15: 'صَرْفِيَائِيل',
  16: 'عَنْقْيَائِيل',
  17: 'طَلْحَيَائِيل',
  18: 'مَهْكَائِيل',
  19: 'عَزْرَائِيل',
  20: 'سَلْبَائِيل',
  21: 'دَعْوَائِيل',
  22: 'شَمْشَائِيل',
  23: 'طَرْخِيل',
  24: 'عَلْفْيَائِيل',
  25: 'مِهْرَائِيل',
  26: 'عَطْوَائِيل',
  27: 'لَوْكَائِيل',
  28: 'عَمَّائِيل',
};

/**
 * Intisari (Core Essence) of an Amulet & Wafaq
 */
export interface IntisariAmuletWafaq {
  hakikatSirr: string;
  mizanNumerologi: string;
  ayatFadilah: string;
  asmaulHusnaWirid: string;
  khasiatUtama: string;
  kaidahPenulisan: string;
}

export function getIntisariAmuletWafaq(amulet: GeneratedAmuletData): IntisariAmuletWafaq {
  const m = amulet.manzil;
  const h = amulet.hajat;
  const angelAr = MANZIL_ANGELIC_ARABIC[m.number] || m.angelicForce;

  return {
    hakikatSirr: `Manzil #${m.number} ${m.arabicName} (${m.transliteration}) mengandung intisari "${m.meaningId}". Menghubungkan getaran makrokosmos langit derajat ${m.zodiacSpan} dengan unsur ${m.elementLabel}, dipimpin oleh kekuatan ruhani malaikat ${angelAr} (${m.angelicForce}) serta huruf sirr Abjad "${m.abjadLetter}".`,
    mizanNumerologi: `Wafaq ${amulet.gridType.toUpperCase()} dibangun atas Mīzān Target Jumal ${amulet.totalTargetJumal}, memadukan nilai hisab Manzil (${amulet.manzilJumalValue})${amulet.customNameJumal > 0 ? ` dan nilai nama ${amulet.customPersonName} (${amulet.customNameJumal})` : ''}. Seluruh baris, kolom, dan diagonal berada dalam keseimbangan sempurna, dikunci oleh empat huruf rahasia Badūḥ (ب-د-و-ح).`,
    ayatFadilah: `Intisari ayat pelindung dan pembuka: «${amulet.quranicInscription}» sebagai wasilah permohonan kepada Allah SWT.`,
    asmaulHusnaWirid: `Untaian Asmaul Husna pengiring: ${amulet.sacredAsmaText}. Dianjurkan untuk diwiridkan sebanyak nilai Mizan (${amulet.totalTargetJumal}x) atau kelipatannya saat riyadhah batin.`,
    khasiatUtama: `${h.titleLatin}: ${h.meaning}. ${m.muhibbahDescription}`,
    kaidahPenulisan: `Ditulis pada sa'ah ijabah (saat Bulan bertengger pada Manzil #${m.number} berpadu jam ${m.spiritualRuler}) di atas kertas perkamen suci bertinta sari Za'faran (kuma-kuma), air mawar murni, dan minyak misik.`,
  };
}

/**
 * Manzil Amulet Configuration & Generated Data
 */
export interface GeneratedAmuletData {
  manzil: DetailedManzil;
  hajat: HajatDetail;
  theme: AmuletThemeConfig;
  gridType: WafaqGridType;
  numeralStyle: NumeralStyle;
  customPersonName: string;
  customNameJumal: number;
  manzilJumalValue: number;
  totalTargetJumal: number;
  grid3x3: ReturnType<typeof generateMusallas3x3>;
  grid4x4: ReturnType<typeof generateMurabba4x4>;
  cardinalArchangels: {
    east: string;
    west: string;
    north: string;
    south: string;
  };
  angelicForceArabic: string;
  talismanicFormula: string;
  sacredAsmaText: string;
  quranicInscription: string;
}

/**
 * Calculate total Jumal of Arabic string
 */
export function calculateSimpleJumal(text: string): number {
  if (!text) return 0;
  let total = 0;
  for (const ch of text) {
    const base = ch.normalize('NFD').replace(/[\u064B-\u065F\u0670]/g, '');
    if (ABJAD_TABLE[base]) {
      total += ABJAD_TABLE[base].value;
    }
  }
  return total;
}

/**
 * Generate full Amulet / Wafaq specification
 */
export function generateAmuletData({
  manzilNumber,
  hajatId,
  themeId,
  gridType,
  numeralStyle,
  personName = '',
  personNameArabic = '',
}: {
  manzilNumber: number;
  hajatId: HajatPurpose;
  themeId: AmuletThemeId;
  gridType: WafaqGridType;
  numeralStyle: NumeralStyle;
  personName?: string;
  personNameArabic?: string;
}): GeneratedAmuletData {
  const index = Math.min(27, Math.max(0, manzilNumber - 1));
  const manzil = MANZIL_DETAILED_DATA[index];
  const hajat = HAJAT_PRESETS[hajatId] || HAJAT_PRESETS.protection;
  const theme = AMULET_THEMES[themeId] || AMULET_THEMES.parchment;

  // Calculate Jumal of Manzil Name
  const manzilJumalValue = calculateSimpleJumal(manzil.arabicName) || manzil.number * 27;

  // Calculate Jumal of Person
  const customNameJumal = personNameArabic
    ? calculateSimpleJumal(personNameArabic)
    : calculateSimpleJumal(personName) || (personName ? personName.length * 15 : 0);

  // Target Sum for Wafaq:
  // Classical formula: Target = Manzil Jumal + (Optional Person Jumal) + Hajat Base Factor
  let targetSum = manzilJumalValue;
  if (customNameJumal > 0) {
    targetSum += customNameJumal;
  }
  // Ensure minimum viable sum for grid type
  if (gridType === '3x3') {
    targetSum = Math.max(15, targetSum);
  } else {
    targetSum = Math.max(34, targetSum);
  }

  const grid3x3 = generateMusallas3x3(targetSum);
  const grid4x4 = generateMurabba4x4(targetSum);

  const cardinalArchangels = {
    east: 'جَبْرَائِيل',
    west: 'مِيكَائِيل',
    north: 'إِسْرَافِيل',
    south: 'عِزْرَائِيل',
  };

  const sacredAsmaText = hajat.defaultAsma.join(' • ');
  const quranicInscription = hajat.defaultVerseArabic;
  const talismanicFormula = `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • مَنْزِلُ ${manzil.arabicName} • خَادِمُهُ ${manzil.angelicForce} • حَرْفُهُ ${manzil.abjadLetter}`;

  const angelicForceArabic = MANZIL_ANGELIC_ARABIC[manzil.number] || manzil.angelicForce;

  return {
    manzil,
    hajat,
    theme,
    gridType,
    numeralStyle,
    customPersonName: personName,
    customNameJumal,
    manzilJumalValue,
    totalTargetJumal: targetSum,
    grid3x3,
    grid4x4,
    cardinalArchangels,
    angelicForceArabic,
    talismanicFormula,
    sacredAsmaText,
    quranicInscription,
  };
}
