/**
 * Manzil Influencer Score Engine (مُؤَشِّرُ تَأْثِيرِ الكَوَاكِبِ فِي المَنَازِلِ)
 * Computes planetary dignities, weights, and influences across the 28 Lunar Mansions
 * based on the classical text: Qasida fi 'Ilm an-Nujum & Zij as-Sindhind.
 */

import { DetailedManzil, MANZIL_DETAILED_DATA } from '../data/manzilDetailedData';
import { PlanetaryPosition } from '../types';

export interface PlanetManzilInfluence {
  planetKey: string;
  planetNameArabic: string;
  planetNameLatin: string;
  planetSymbol: string;
  currentLongitude: number;
  mansionNumber: number;
  mansion: DetailedManzil;
  dignityStatus: 'Sa\'d Mahd' | 'Sa\'d' | 'Muntasif' | 'Nahs' | 'Nahs Mahd';
  dignityScore: number; // -25 to +25
  qasidaVerseArabic: string;
  qasidaVerseLatin: string;
  qasidaVerseTranslation: string;
  practicalInfluence: string;
  advisedAction: string;
}

export interface ManzilInfluencerReport {
  compositeScore: number; // 0 to 100
  overallQuality: 'Sa\'d Akbar (Mahkota Berkah Langit)' | 'Sa\'d Rajih (Dominan Beruntung)' | 'Mu\'tadil (Seimbang & Waspada)' | 'Nahs Muzdawij (Ujian & Kehati-hatian)';
  planetaryInfluences: PlanetManzilInfluence[];
  beneficPlanetsCount: number;
  maleficPlanetsCount: number;
  neutralPlanetsCount: number;
  leadingBenefic: PlanetManzilInfluence;
  mostAfflicted: PlanetManzilInfluence;
  qasidaSynthesis: string;
  globalAdvice: {
    trading: string;
    marriage: string;
    governance: string;
    health: string;
  };
}

const MANSION_WIDTH = 360 / 28; // ~12.857142857°

// Classical Qasida astrological rules per planet across mansions
interface PlanetRule {
  exaltedMansions: number[];
  friendlyMansions: number[];
  detrimentMansions: number[];
  verses: Record<number, { arabic: string; latin: string; translation: string; influence: string; advice: string }>;
}

const QASIDA_RULES: Record<string, PlanetRule> = {
  moon: {
    exaltedMansions: [3, 17, 24],
    friendlyMansions: [2, 10, 14, 25, 28],
    detrimentMansions: [8, 16, 18],
    verses: {
      3: {
        arabic: 'وَإِذَا حَلَّ القَمَرُ فِي الثُّرَيَّا، تَوَالَتِ المَسَرَّاتُ وَطَابَ المَحْيَا',
        latin: 'Wa idhā ḥalla al-qamaru fī ath-thurayyā, tawālat al-masarrātu wa ṭāba al-maḥyā.',
        translation: 'Tatkala Bulan singgah di Ath-Thurayya, beruntunlah kegembiraan dan makmurlah kehidupan.',
        influence: 'Daya pikat kasih sayang meluap, rezeki perniagaan mengalir deras, dan suasana batin penuh kedamaian.',
        advice: 'Sangat mustajab untuk mengikat janji nikah, meluncurkan produk dagang baru, dan silaturahmi.',
      },
      17: {
        arabic: 'وَفِي الإِكْلِيلِ يَظْهَرُ التَّاجُ وَالوِفَاقُ، وَتَسْتَقِيمُ الصِّلَاتُ وَالأَرْزَاقُ',
        latin: 'Wa fī al-iklīli yaẓharu at-tāju wal-wifāq, wa tastaqīmu aṣ-ṣilātu wal-arzāq.',
        translation: 'Dan di Al-Iklil tampak mahkota kerukunan; luruslah ikatan janji dan kelapangan rezeki.',
        influence: 'Kepemimpinan yang welas asih dan rekonsiliasi perselisihan yang sukses.',
        advice: 'Lakukan mediasi damai atau penandatanganan kontrak kemitraan.',
      },
      24: {
        arabic: 'سَعْدُ السُّعُودِ يُنِيرُ آيَاتِ القَبُولِ، وَتَنْزِلُ الرَّحَمَاتُ فِي كُلِّ فُصُولِ',
        latin: 'Sa\'du as-su\'ūdi yunīru āyāti al-qabūl, wa tanzilu ar-raḥamātu fī kulli fuṣūl.',
        translation: 'Sa\'d as-Su\'ud memancarkan tanda-tanda terkabulnya hajat, dan rahmat turun di setiap musim.',
        influence: 'Waktu terkabulnya doa (Ijabah) dan penyembuhan raga yang lekas.',
        advice: 'Bermunajat doa, sedekah, dan memulai terapi pengobatan jamu.',
      },
    },
  },
  sun: {
    exaltedMansions: [1, 10, 14],
    friendlyMansions: [3, 11, 21, 22],
    detrimentMansions: [15, 16, 27],
    verses: {
      1: {
        arabic: 'وَشَمْسٌ فِي الشَّرَطَانِ تَفْتَحُ العُصُورَ، وَتَبْعَثُ فِي النُّفُوسِ العِزَّ وَالنُّورَ',
        latin: 'Wa syamsun fī ash-syaraṭāni taftaḥu al-‘uṣūr, wa tab‘athu fīn-nufūsi al-‘izza wan-nūr.',
        translation: 'Matahari di Ash-Sharatan membuka lembaran masa; meniupkan kemuliaan dan cahaya tekad.',
        influence: 'Semangat inisiatif membara, keberanian mengambil risiko strategis, dan wibawa kepemimpinan.',
        advice: 'Awali proyek pembangunan besar, pelantikan, atau perjalanan darat penting.',
      },
      10: {
        arabic: 'وَإِذَا اسْتَقَرَّتْ فِي الجَبْهَةِ الشَّمْسُ، أَطَاعَتْ لَهَا النُّفُوسُ وَالجِنْسُ',
        latin: 'Wa idhā istaqarrat fī al-jabhāti ash-syamsu, aṭā‘at lahā an-nufūsu wal-jinsu.',
        translation: 'Tatkala Matahari bersemayam di Al-Jabhah, tunduk patuhlah khalayak pada wibawa sang raja.',
        influence: 'Kharisma sosial tak terbantahkan, kemudahan meraih simpati atasan atau pejabat tinggi.',
        advice: 'Menghadap pengambil kebijakan, mengajukan permohonan promosi jabatan.',
      },
      14: {
        arabic: 'وَفِي السِّمَاكِ تَعْلُو رَايَاتُ العَدَالَةِ، وَيَطِيبُ الحُكْمُ وَتَزُولُ الضَّلَالَةُ',
        latin: 'Wa fī as-simāki ta‘lū rāyātu al-‘adālati, wa yaṭību al-ḥukmu wa tazūlu aḍ-ḍalālah.',
        translation: 'Di As-Simak berkibarlah panji keadilan; tatanan hukum tegak dan kepalsuan sirna.',
        influence: 'Kejelasan integritas hukum, keberhasilan diplomasi, dan kejernihan akal budi.',
        advice: 'Selesaikan sengketa agraria atau penegakan aturan perhimpunan.',
      },
    },
  },
  jupiter: {
    exaltedMansions: [16, 25, 26],
    friendlyMansions: [1, 4, 12, 14, 24],
    detrimentMansions: [18, 19, 8],
    verses: {
      16: {
        arabic: 'مُشْتَرٍ فِي الزُّبَانَى مِيزَانُ الهُدَى، يَحْمِي الأَنَامَ وَيَقْمَعُ الرَّدَى',
        latin: 'Musytarin fī az-zubānā mīzānu al-hudā, yaḥmī al-anāma wa yaqma‘u ar-radā.',
        translation: 'Jupiter di Az-Zubana adalah timbangan petunjuk; melindungi rakyat dan menumpas kezaliman.',
        influence: 'Keseimbangan tatanan ekonomi makro, perlindungan kaum tertindas, dan kelimpahan berkah.',
        advice: 'Melakukan perniagaan lintas negeri, wakaf, dan musyawarah keluarga besar.',
      },
      25: {
        arabic: 'سَعْدُ الأَخْبِيَةِ يَكْشِفُ الكُنُوزَ، وَيَفْتَحُ لِكُلِّ طَالِبٍ أَنْ يَفُوزَ',
        latin: 'Sa‘du al-akhbiyati yaksyifu al-kunūza, wa yaftaḥu li-kulli ṭālibin an yafūza.',
        translation: 'Sa\'d al-Akhbiyah menyingkap harta terpendam, membuka jalan bagi pencari ilmu untuk menang.',
        influence: 'Penyingkapan rahasia sains falak, penemuan solusi teknologi yang buntu.',
        advice: 'Riset ilmiah mendalam, risalah pembukuan, dan penggalian sumur air bersih.',
      },
    },
  },
  venus: {
    exaltedMansions: [2, 6, 28],
    friendlyMansions: [3, 10, 15, 24],
    detrimentMansions: [8, 17, 21],
    verses: {
      2: {
        arabic: 'وَزُهْرَةٌ فِي البُطَيْنِ حُبٌّ وَوَفَاءُ، وَيَنْمُو المَالُ وَيَصْدُقُ الرَّجَاءُ',
        latin: 'Wa zuhratun fī al-buṭayni ḥubbun wa wafā’, wa yanmū al-mālu wa yaṣduqu ar-rajā’.',
        translation: 'Venus di Al-Butayn adalah cinta dan kesetiaan; harta berkembang dan harapan terwujud.',
        influence: 'Keharmonisan asmara, cita rasa estetika seni tinggi, dan keuntungan dari produk wewangian/busana.',
        advice: 'Meminang pasangan, membeli perhiasan, dan merias kediaman.',
      },
      28: {
        arabic: 'بَطْنُ الحُوتِ أَمَانٌ وَسَكَنٌ قَلْبِيّ، تَفِيضُ فِيهِ السَّعَادَةُ مِنْ كُلِّ جَنْبِ',
        latin: 'Baṭnu al-ḥūti amānun wa sakanun qalbiyy, tafīḍu fīhi as-sa‘ādatu min kulli janb.',
        translation: 'Batn al-Hut adalah rasa aman dan ketenteraman kalbu; kebahagiaan meluap dari segala penjuru.',
        influence: 'Kedamaian batin tanpa rasa cemas, persahabatan yang tulus tanpa pamrih.',
        advice: 'Mengadakan jamuan makan bersama, bermeditasi, dan karya amal sosial.',
      },
    },
  },
  mars: {
    exaltedMansions: [1, 21],
    friendlyMansions: [9, 11, 22],
    detrimentMansions: [3, 5, 18],
    verses: {
      1: {
        arabic: 'مِرِّيخُ فِي الشَّرَطَانِ سَيْفٌ حَاسِمٌ، يَحْمِي الحُدُودَ وَلَا يَخِيبُ عَازِمٌ',
        latin: 'Mirrīkhu fī ash-syaraṭāni sayfun ḥāsimun, yaḥmī al-ḥudūda wa lā yakhību ‘āzimun.',
        translation: 'Mars di Ash-Sharatan adalah pedang ketegasan; menjaga perbatasan dan tekad takkan goyah.',
        influence: 'Ketangkasan fisik tinggi, kedisiplinan militer, dan keberanian membela kebenaran.',
        advice: 'Latihan ketangkasan raga, audit internal yang tegas, dan perlindungan aset.',
      },
      3: {
        arabic: 'فَإِنْ حَلَّ فِي الثُّرَيَّا فَاحْذَرِ العَجَلَةَ، فَفِيهِ خِلَافٌ يُورِثُ الوَجَلَ',
        latin: 'Fa-in ḥalla fī ath-thurayyā faḥdhari al-‘ajalah, fa-fīhi khilāfun yūrithu al-wajal.',
        translation: 'Bila ia singgah di Ath-Thurayya, waspadailah ketergesaan; di situ ada silang pendapat pemicu cemas.',
        influence: 'Gesekan ego asmara, belanja impulsif, dan pertengkaran tak perlu.',
        advice: 'Tahan lisan dari amarah, tunda perdebatan rumah tangga hingga pikiran dingin.',
      },
    },
  },
  saturn: {
    exaltedMansions: [21, 22],
    friendlyMansions: [4, 16, 26],
    detrimentMansions: [5, 13, 20],
    verses: {
      22: {
        arabic: 'وَفِي سَعْدِ الذَّابِحِ يَثْبُتُ البُنْيَانُ، وَيَبْلُغُ الصَّابِرُ مَا ابْتَغَى الزَّمَانُ',
        latin: 'Wa fī sa‘di adh-dhābiḥi yathbutu al-bunyānu, wa yablughu aṣ-ṣābiru mā ibtaghā az-zamānu.',
        translation: 'Di Sa\'d ad-Dhabih kokohlah fondasi bangunan; dan orang yang bersabar mencapai cita-cita zaman.',
        influence: 'Kekuatan pondasi jangka panjang, ketahanan menghadapi krisis, dan kematangan strategi tua.',
        advice: 'Investasi tanah dan properti, peletakan batu pertama, penyusunan undang-undang permanen.',
      },
    },
  },
  mercury: {
    exaltedMansions: [6, 12, 13],
    friendlyMansions: [1, 2, 14, 25],
    detrimentMansions: [17, 28],
    verses: {
      12: {
        arabic: 'عُطَارِدٌ فِي الصَّرْفَةِ حِكْمَةُ الكَاتِبِ، تُنِيرُ الفِكْرَ وَتَكْشِفُ المَطَالِبَ',
        latin: '‘Uṭāridun fī aṣ-ṣarfati ḥikmatu al-kātibi, tunīru al-fikra wa taksyifu al-maṭāliba.',
        translation: 'Merkurius di As-Sarfah adalah hikmah sang juru tulis; menerangi akal dan menyingkap maksud.',
        influence: 'Ketajaman analisis logika, kelancaran menulis buku, dan kecerdasan menghitung neraca dagang.',
        advice: 'Menulis riset ilmiah, audit keuangan, dan negosiasi kontrak rumit.',
      },
    },
  },
};

/**
 * Calculate Manzil index from true ecliptic longitude (0 - 360)
 */
function getMansionIndex(longitude: number): number {
  const norm = ((longitude % 360) + 360) % 360;
  return Math.min(27, Math.max(0, Math.floor(norm / MANSION_WIDTH)));
}

/**
 * Calculate the comprehensive Manzil Influencer Score report from celestial positions
 */
export function calculateManzilInfluencerReport(
  positions?: Record<string, PlanetaryPosition>,
  moonPosition?: PlanetaryPosition
): ManzilInfluencerReport {
  const allPos: Record<string, PlanetaryPosition> = {
    ...(positions || {}),
    ...(moonPosition ? { moon: moonPosition } : {}),
  };

  const targetPlanets: { key: string; arabic: string; latin: string; symbol: string }[] = [
    { key: 'moon', arabic: 'القَمَر', latin: 'Bulan (Al-Qamar)', symbol: '☽' },
    { key: 'sun', arabic: 'الشَّمْس', latin: 'Matahari (Ash-Shams)', symbol: '☉' },
    { key: 'jupiter', arabic: 'المُشْتَرِي', latin: 'Jupiter (Al-Musytari)', symbol: '♃' },
    { key: 'venus', arabic: 'الزُّهَرَة', latin: 'Venus (Az-Zuharah)', symbol: '♀' },
    { key: 'mercury', arabic: 'عُطَارِد', latin: 'Merkurius (\'Utarid)', symbol: '☿' },
    { key: 'mars', arabic: 'المِرِّيخ', latin: 'Mars (Al-Mirrikh)', symbol: '♂' },
    { key: 'saturn', arabic: 'زُحَل', latin: 'Saturnus (Zuhal)', symbol: '♄' },
  ];

  let totalDignityScore = 0;
  let maxPossibleDignity = targetPlanets.length * 25; // 175
  let beneficCount = 0;
  let maleficCount = 0;
  let neutralCount = 0;

  const influences: PlanetManzilInfluence[] = targetPlanets.map((p) => {
    const pos = allPos[p.key] || { trueLongitude: 0 };
    const long = pos.trueLongitude || 0;
    const mIndex = getMansionIndex(long);
    const mansion = MANZIL_DETAILED_DATA[mIndex];
    const mNum = mansion.number;

    const rule = QASIDA_RULES[p.key] || {
      exaltedMansions: [],
      friendlyMansions: [],
      detrimentMansions: [],
      verses: {},
    };

    let dignityStatus: PlanetManzilInfluence['dignityStatus'] = 'Muntasif';
    let dignityScore = 0;

    if (rule.exaltedMansions.includes(mNum)) {
      dignityStatus = 'Sa\'d Mahd';
      dignityScore = 25;
      beneficCount++;
    } else if (rule.friendlyMansions.includes(mNum)) {
      dignityStatus = 'Sa\'d';
      dignityScore = 15;
      beneficCount++;
    } else if (rule.detrimentMansions.includes(mNum)) {
      dignityStatus = 'Nahs';
      dignityScore = -15;
      maleficCount++;
    } else {
      dignityStatus = 'Muntasif';
      dignityScore = 5; // Neutral-mild
      neutralCount++;
    }

    // Check combustion with sun (except for sun itself)
    if (p.key !== 'sun' && pos.isCombust) {
      dignityScore -= 10;
      if (dignityStatus === 'Sa\'d') dignityStatus = 'Muntasif';
      else if (dignityStatus === 'Muntasif') dignityStatus = 'Nahs';
    }

    totalDignityScore += dignityScore;

    // Retrieve customized verse or fall back to mansion's classical verse
    const specificVerse = rule.verses[mNum];
    const qVerseArabic = specificVerse
      ? specificVerse.arabic
      : `${p.arabic} فِي مَنْزِلِ ${mansion.arabicName}: ${mansion.classicalVerseArabic}`;
    const qVerseLatin = specificVerse
      ? specificVerse.latin
      : `${p.latin} fi Manzil ${mansion.transliteration}.`;
    const qVerseTranslation = specificVerse
      ? specificVerse.translation
      : `Transit ${p.latin} di naungan ${mansion.transliteration} (${mansion.meaningId}).`;
    const practicalInfluence = specificVerse
      ? specificVerse.influence
      : `Energi ${p.latin} menyatu dengan sifat unsur ${mansion.elementLabel}. Memberikan nuansa ${mansion.fortuneLabel}.`;
    const advisedAction = specificVerse
      ? specificVerse.advice
      : `Utamakan aktivitas ${mansion.recommendedActions.slice(0, 2).join(' dan ')}.`;

    return {
      planetKey: p.key,
      planetNameArabic: p.arabic,
      planetNameLatin: p.latin,
      planetSymbol: p.symbol,
      currentLongitude: long,
      mansionNumber: mNum,
      mansion,
      dignityStatus,
      dignityScore,
      qasidaVerseArabic: qVerseArabic,
      qasidaVerseLatin: qVerseLatin,
      qasidaVerseTranslation: qVerseTranslation,
      practicalInfluence,
      advisedAction,
    };
  });

  // Calculate composite score (normalized to 0 - 100%)
  // Base raw score can range from -100 to +175
  const normalizedScore = Math.min(
    100,
    Math.max(20, Math.round(((totalDignityScore + 75) / (maxPossibleDignity + 75)) * 100))
  );

  let overallQuality: ManzilInfluencerReport['overallQuality'] = 'Mu\'tadil (Seimbang & Waspada)';
  if (normalizedScore >= 82) overallQuality = 'Sa\'d Akbar (Mahkota Berkah Langit)';
  else if (normalizedScore >= 68) overallQuality = 'Sa\'d Rajih (Dominan Beruntung)';
  else if (normalizedScore >= 45) overallQuality = 'Mu\'tadil (Seimbang & Waspada)';
  else overallQuality = 'Nahs Muzdawij (Ujian & Kehati-hatian)';

  // Find leading benefic & most afflicted
  const sorted = [...influences].sort((a, b) => b.dignityScore - a.dignityScore);
  const leadingBenefic = sorted[0];
  const mostAfflicted = sorted[sorted.length - 1];

  const qasidaSynthesis = `Berdasarkan kaidah Qasīdah fī ‘Ilm an-Nujūm, konstelasi langit saat ini menghasilkan Manzil Influencer Score sebesar ${normalizedScore}%. Planet pembawa berkah terkuat adalah ${leadingBenefic.planetNameLatin} yang singgah di Manzil #${leadingBenefic.mansionNumber} (${leadingBenefic.mansion.transliteration}), sementara yang membutuhkan ikhtiar kehati-hatian adalah ${mostAfflicted.planetNameLatin}.`;

  const globalAdvice = {
    trading:
      normalizedScore >= 65
        ? 'Iklim perniagaan sangat menguntungkan. Manfaatkan momentum transit Bulan dan Jupiter untuk negosiasi kontrak dan transaksi permodalan besar.'
        : 'Cermati detail klausul perjanjian dagang. Hindari spekulasi berisiko tinggi tanpa jaminan yang jelas.',
    marriage:
      influences.find((i) => i.planetKey === 'venus')?.dignityScore ?? 0 >= 10
        ? 'Dinaungi kelembutan cinta kasih dan keharmonisan batin. Sangat afdal untuk lamaran, pertemuan dua keluarga, atau mempererat komitmen sakinah.'
        : 'Jaga kehangatan komunikasi dan kedepankan rasa saling memaafkan jika muncul kesalahpahaman kecil.',
    governance:
      influences.find((i) => i.planetKey === 'sun')?.dignityScore ?? 0 >= 15
        ? 'Wibawa kepemimpinan dan stabilitas sosial berada pada puncak kekuatan. Waktu terbaik untuk mengumumkan kebijakan strategis.'
        : 'Kedepankan musyawarah mufakat dan dengarkan aspirasi khalayak dengan arif bijaksana.',
    health:
      'Imbangi aktivitas padat dengan pola istirahat teratur. Konsumsi ramuan alami yang selaras dengan unsur iklim saat ini.',
  };

  return {
    compositeScore: normalizedScore,
    overallQuality,
    planetaryInfluences: influences,
    beneficPlanetsCount: beneficCount,
    maleficPlanetsCount: maleficCount,
    neutralPlanetsCount: neutralCount,
    leadingBenefic,
    mostAfflicted,
    qasidaSynthesis,
    globalAdvice,
  };
}
