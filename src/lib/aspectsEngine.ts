import { PlanetKey, PlanetaryPosition } from '../types';
import { PLANETS_INFO, ZODIAC_SIGNS } from './sindhindEngine';

export interface DetailedAspect {
  id: string;
  planetA: PlanetKey;
  planetB: PlanetKey;
  aspectType: 'qiran' | 'tasdis' | 'tarbi' | 'tathlith' | 'muqabalah';
  aspectArabic: string;
  aspectName: string;
  symbol: string;
  exactAngle: number;
  actualAngle: number;
  orbDifference: number;
  maxAllowedOrb: number;
  isApplying: boolean; // Ittisal (Muqbil) vs Infisal (Mudbir)
  isPartile: boolean; // Daqiqi (<= 1.0°)
  nature: 'Sa\'d' | 'Nahs' | 'Mu\'tadil';
  natureArabic: string;
  strengthPercent: number; // 0 to 100% based on exactness
  traditionalInterpretation: {
    summary: string;
    arabicPhrase: string;
    elementRelation: string;
    impactDescription: string;
  };
}

/**
 * Classical Sindhind Orb of Light (Jurm al-Kawkab) in degrees
 * Source: Zij as-Sindhind, Abu Ma'shar (Kitab al-Madkhal), Al-Biruni (Kitab al-Tafhim)
 */
export const SINDHIND_ORB_OF_LIGHT: Record<PlanetKey, number> = {
  sun: 15,
  moon: 12,
  mercury: 7,
  venus: 8,
  mars: 8,
  jupiter: 9,
  saturn: 9,
  rahu: 6,
  ketu: 6,
};

export const ASPECT_DEFINITIONS = [
  {
    type: 'qiran' as const,
    arabic: 'القران والمقارنة',
    name: 'Konjungsi (Conjunction)',
    symbol: '☌',
    angle: 0,
    nature: 'Mu\'tadil' as const,
    natureArabic: 'معتدل (بحسب طبيعة الكوكبين)',
    baseOrb: 8,
    description: 'Penyatuan esensi dan percampuran pengaruh dua kawkab dalam satu derajat ekliptika.',
  },
  {
    type: 'tasdis' as const,
    arabic: 'التسديس والمودة المتوسطة',
    name: 'Sekstil (Sextile)',
    symbol: '⚹',
    angle: 60,
    nature: 'Sa\'d' as const,
    natureArabic: 'سعد ومودة معتدلة',
    baseOrb: 6,
    description: 'Sudut keselarasan bersahabat (2 zodiak) antara unsur yang bersesuaian (Api-Udara atau Tanah-Air).',
  },
  {
    type: 'tarbi' as const,
    arabic: 'التربيع والعداوة المتوسطة',
    name: 'Kuadrat (Square)',
    symbol: '□',
    angle: 90,
    nature: 'Nahs' as const,
    natureArabic: 'نحس وعداوة وعسر',
    baseOrb: 7,
    description: 'Sudut tegangan dan friksi (3 zodiak) antar unsur yang bertolak belakang; memicu dinamika ujian.',
  },
  {
    type: 'tathlith' as const,
    arabic: 'التثليث والمودة الكاملة',
    name: 'Trina (Trine)',
    symbol: '△',
    angle: 120,
    nature: 'Sa\'d' as const,
    natureArabic: 'سعد عظيم ومودة تامة',
    baseOrb: 8,
    description: 'Sudut persahabatan sempurna (4 zodiak) menghubungkan zodiak dari unsur alam yang persis sama (Triplisitas).',
  },
  {
    type: 'muqabalah' as const,
    arabic: 'المقابلة والعداوة القوية',
    name: 'Oposisi (Opposition)',
    symbol: '☍',
    angle: 180,
    nature: 'Nahs' as const,
    natureArabic: 'نحس ومقابلة ومنازعة',
    baseOrb: 8,
    description: 'Sudut pertentangan frontal di dua ufuk berlawanan (6 zodiak); menuntut penyelarasan polaritas.',
  },
];

/**
 * Generate traditional astrological interpretation for specific planet pairs and aspects
 */
export function getTraditionalInterpretation(
  pA: PlanetKey,
  pB: PlanetKey,
  aspectType: DetailedAspect['aspectType'],
  nature: DetailedAspect['nature']
): DetailedAspect['traditionalInterpretation'] {
  const pAInfo = PLANETS_INFO[pA];
  const pBInfo = PLANETS_INFO[pB];

  // Specific canonical pairings in classical Islamic astrology
  const key = [pA, pB].sort().join('_');

  if (key === 'moon_sun') {
    if (aspectType === 'qiran') {
      return {
        summary: 'Ijtima\' an-Nayyirayn (Konjungsi Dua Lentera Langit)',
        arabicPhrase: 'اجتماع النيرين والمحاق: بداية الشهر القمري وفناء الضوء الظاهر في الباطن',
        elementRelation: 'Penyatuan Api Hakiki (Matahari) dan Air Reseptif (Bulan)',
        impactDescription: 'Titik nol siklus lunar baru; dorongan keheningan, pembaruan niat besar, namun energi fisik cenderung surut sejenak.',
      };
    }
    if (aspectType === 'muqabalah') {
      return {
        summary: 'Istiqbal an-Nayyirayn (Oposisi Purnama Sempurna)',
        arabicPhrase: 'استقبال النيرين والبدر التام: كمال التجلي وفيض النور ومنازعة النفس للروح',
        elementRelation: 'Polaritas penuh kutub siang dan malam',
        impactDescription: 'Kejelasan wawasan batin maksimal, buah dari usaha tampak nyata, namun diiringi ketegangan antara emosi dan ego rasional.',
      };
    }
    if (aspectType === 'tathlith' || aspectType === 'tasdis') {
      return {
        summary: 'Ittifaq an-Nayyirayn (Keselarasan Dua Lentera)',
        arabicPhrase: 'اتفاق الشمس والقمر: بركة في المعاش وصحة في الجسد ومودة بين الحكام والرعية',
        elementRelation: 'Harmoni seimbang antara kehendak batin dan perasaan jiwa',
        impactDescription: 'Keseimbangan prima antara pikiran dan tindakan; mempermudah tercapainya simpati sosial dan kelancaran hajat.',
      };
    }
    return {
      summary: 'Tarbi\' an-Nayyirayn (Kuadrat Kuartir Bulan)',
      arabicPhrase: 'تربيع النيرين: انقسام العزيمة ونقصان في اعتدال المزاج',
      elementRelation: 'Friksi sudut tegak antara cahaya dan penampungan',
      impactDescription: 'Tantangan menyeimbangkan tuntutan karier/publik (Matahari) dengan kebutuhan privasi/keluarga (Bulan).',
    };
  }

  if (key === 'jupiter_venus') {
    if (aspectType === 'qiran' || aspectType === 'tathlith' || aspectType === 'tasdis') {
      return {
        summary: 'Ijtima\' as-Sa\'dayn (Pertemuan Dua Bintang Keberuntungan)',
        arabicPhrase: 'اجتماع السعدين الأكبر والأصغر: ذروة الإقبال والنعمة وظهور المحاسن والأرزاق',
        elementRelation: 'Kombinasi Dingin-Lembab Venus dengan Panas-Lembab Yupiter (Puncak Kesuburan)',
        impactDescription: 'Aspek paling diberkahi dalam tradisi Sindhind: mendatangkan kemudahan rezeki, perdamaian, kehalusan budi, dan kemakmuran.',
      };
    }
    return {
      summary: 'Munafasat as-Sa\'dayn (Kuadrat/Oposisi Dua Sa\'d)',
      arabicPhrase: 'منافسة السعدين: الإسراف في اللذات والغفلة بالإنفاق والميل إلى الترف الزائد',
      elementRelation: 'Ekspansi berlebih melampaui ukuran proporsional',
      impactDescription: 'Kebaikan melimpah namun rawan pemborosan materi, kelonggaran disiplin, atau ekspektasi yang berlebihan.',
    };
  }

  if (key === 'mars_saturn') {
    if (aspectType === 'qiran' || aspectType === 'tarbi' || aspectType === 'muqabalah') {
      return {
        summary: 'Ijtima\' an-Nahsayn (Pertemuan Dua Bintang Ujian Keras)',
        arabicPhrase: 'اقتران النحسين الأكبر والأصغر: شدة عارضة ومصادمة بين السيف والحديد',
        elementRelation: 'Panas Kering Mars (Api) berbenturan keras dengan Dingin Kering Saturnus (Batu/Es)',
        impactDescription: 'Friksi tajam antara dorongan impulsif ingin menyerang dengan rintangan kaku yang menahan; membutuhkan kesabaran dan kehati-hatian tinggi.',
      };
    }
    return {
      summary: 'Sulh an-Nahsayn (Keselarasan Mars dan Saturnus)',
      arabicPhrase: 'صلح النحسين بالتثليث: حزم في الأمور وثبات كالجبال وتطويع الصعاب',
      elementRelation: 'Energi aksi dikendalikan oleh ketetapan disiplin',
      impactDescription: 'Daya juang yang luar biasa tabah, kemampuan menuntaskan pekerjaan berat yang memerlukan disiplin baja.',
    };
  }

  if (key === 'jupiter_mars') {
    if (nature === 'Sa\'d') {
      return {
        summary: 'Hammasah wa Shaja\'ah (Keberanian Berbudi Luhur)',
        arabicPhrase: 'امتزاج المشتري بالمريخ: شجاعة في الحق وعلو الهمة ونصرة المظلومين',
        elementRelation: 'Ekspansi kemuliaan mendorong keberanian ksatria',
        impactDescription: 'Keyakinan diri kokoh, semangat pantang menyerah, inisiatif kepemimpinan yang adil dan berani.',
      };
    }
    return {
      summary: 'Ghurur wa Ta\'ajjul (Keberanian Berlebih & Ketergesaan)',
      arabicPhrase: 'نزاع المشتري والمريخ: إفراط في الجرأة ومجازفة غير مأمونة العواقب',
      elementRelation: 'Ketidaksabaran mendahului pertimbangan bijak',
      impactDescription: 'Potensi perdebatan keras, kecenderungan spekulasi gegabah atau fanatisme pandangan.',
    };
  }

  if (key === 'mercury_saturn') {
    if (nature === 'Sa\'d') {
      return {
        summary: 'Daqqah al-Fikr (Ketajaman Hisab & Kehati-hatian)',
        arabicPhrase: 'امتزاج عطارد بزحل: عمق في الاستنباط ورسوخ في علوم الأعداد والصمت الحكيم',
        elementRelation: 'Kecerdasan lincah dipadatkan oleh keheningan Saturnus',
        impactDescription: 'Bakat luar biasa dalam hisab matematika, riset mendalam, ketelitian arsip, dan kebijaksanaan kata-kata.',
      };
    }
    return {
      summary: 'Qabdh al-Khatir (Keraguan & Beban Pikiran)',
      arabicPhrase: 'تربيع عطارد بزحل: وسواس في النفس وبطء في البيان وثقل في الخاطر',
      elementRelation: 'Kekakuan menghambat aliran komunikasi',
      impactDescription: 'Kecenderungan ragu-ragu, kekhawatiran berlebih terhadap kegagalan, atau kesulitan menyampaikan gagasan.',
    };
  }

  if (key === 'mercury_venus') {
    return {
      summary: 'Husn al-Bayan (Keindahan Sastra & Diplomasi)',
      arabicPhrase: 'امتزاج عطارد بالزهرة: فصاحة اللسان ولطافة المعاشرة ونظم القوافي البديعة',
      elementRelation: 'Persaudaraan akal dan keindahan estetika',
      impactDescription: 'Kemampuan berdiplomasi halus, keanggunan berbicara, bakat seni dan penulisan yang memikat pendengar.',
    };
  }

  if (key === 'jupiter_sun') {
    if (nature === 'Sa\'d') {
      return {
        summary: "Dawlah wa 'Izz (Kemuliaan Martabat & Kekuasaan Adil)",
        arabicPhrase: 'اتصال الشمس بالمشتري: رفعة الشأن ومحبة الأكابر وتيسير المقاصد الكبرى',
        elementRelation: 'Penyatuan Cahaya Raja dengan Kebijaksanaan Qadhi',
        impactDescription: 'Kharisma kepemimpinan luhur, kemurahan hati, perlindungan dari bencana dan pengakuan atas kebajikan.',
      };
    }
    return {
      summary: 'Kibriya\' wa Mubalaghah (Kemewahan & Kesombongan)',
      arabicPhrase: 'تربيع الشمس بالمشتري: عجب بالنفس وتجاوز للحدود في المطالب',
      elementRelation: 'Ego membesar melebihi kapasitas wadah',
      impactDescription: 'Ujian agar tidak bersikap arogan atau meremehkan nasihat pihak lain.',
    };
  }

  // Generic fallback based on planet natures and aspect
  const pAName = pAInfo.transliteration;
  const pBName = pBInfo.transliteration;

  if (aspectType === 'qiran') {
    return {
      summary: `Konjungsi ${pAName} & ${pBName}`,
      arabicPhrase: `اقتران ${pAInfo.arabicName} مع ${pBInfo.arabicName}: امتزاج القوتين في موضع واحد`,
      elementRelation: 'Penggabungan langsung kedua kawkab',
      impactDescription: `Penyatuan energi ${pAName} (${pAInfo.temperament}) dan ${pBName} (${pBInfo.temperament}), menghasilkan pengaruh dominan terpadu.`,
    };
  }
  if (aspectType === 'tathlith') {
    return {
      summary: `Trina Harmonis ${pAName} & ${pBName}`,
      arabicPhrase: `تثليث ${pAInfo.arabicName} مع ${pBInfo.arabicName}: مودة تامة وتوافق في العناصر`,
      elementRelation: 'Aliran energi selaras 120°',
      impactDescription: `Hubungan saling mendukung secara alamiah tanpa hambatan besar; memancarkan kemudahan dan bakat laten.`,
    };
  }
  if (aspectType === 'tasdis') {
    return {
      summary: `Sekstil Bersahabat ${pAName} & ${pBName}`,
      arabicPhrase: `تسديس ${pAInfo.arabicName} مع ${pBInfo.arabicName}: مودة معتدلة وفرص سانحة`,
      elementRelation: 'Peluang sinergis 60°',
      impactDescription: `Membuka peluang kerja sama yang produktif apabila ditindaklanjuti dengan ketekunan nyata.`,
    };
  }
  if (aspectType === 'tarbi') {
    return {
      summary: `Kuadrat Friktif ${pAName} & ${pBName}`,
      arabicPhrase: `تربيع ${pAInfo.arabicName} مع ${pBInfo.arabicName}: مدافعة ومنازعة تتطلب إصلاحاً`,
      elementRelation: 'Tegangan sudut siku 90°',
      impactDescription: `Menimbulkan tantangan internal atau eksternal yang menuntut upaya keras, kedewasaan, dan resolusi konflik.`,
    };
  }
  // muqabalah
  return {
    summary: `Oposisi Polar ${pAName} & ${pBName}`,
    arabicPhrase: `مقابلة ${pAInfo.arabicName} مع ${pBInfo.arabicName}: مواجهة صريحة وتنازع في النفوذ`,
    elementRelation: 'Ketegangan kutub berlawanan 180°',
    impactDescription: `Menghadapkan dua kutub yang saling tarik-menarik; menuntut kompromi dan introspeksi agar tidak terjadi benturan terbuka.`,
  };
}

/**
 * Calculate all aspects with exact classical orbs, applying/separating state, and rich metadata
 */
export function calculateDetailedAspects(
  positions: Record<PlanetKey, PlanetaryPosition>
): DetailedAspect[] {
  const result: DetailedAspect[] = [];
  const planetKeys = (Object.keys(positions) as PlanetKey[]).filter(
    (k) => positions[k] !== undefined
  );

  for (let i = 0; i < planetKeys.length; i++) {
    for (let j = i + 1; j < planetKeys.length; j++) {
      const pA = planetKeys[i];
      const pB = planetKeys[j];
      const posA = positions[pA];
      const posB = positions[pB];

      if (!posA || !posB) continue;

      const longA = posA.trueLongitude;
      const longB = posB.trueLongitude;

      // Calculate shortest distance along ecliptic
      let angle = Math.abs(longA - longB);
      if (angle > 180) {
        angle = 360 - angle;
      }

      // Maximum allowable orb according to classical "Jurm al-Kawkab" moiety:
      // Half the sum of the two orbs of light
      const orbA = SINDHIND_ORB_OF_LIGHT[pA] || 8;
      const orbB = SINDHIND_ORB_OF_LIGHT[pB] || 8;
      const maxAllowedOrb = (orbA + orbB) / 2;

      for (const def of ASPECT_DEFINITIONS) {
        const diff = Math.abs(angle - def.angle);

        if (diff <= maxAllowedOrb) {
          // Determine Applying (Ittisal) vs Separating (Infisal)
          // The faster planet moves towards or away from the exact aspect angle
          const speedA = posA.dailyMotion;
          const speedB = posB.dailyMotion;
          const relativeSpeed = speedA - speedB; // speed difference per day

          // Predict angle after 1 day
          const nextLongA = (longA + speedA + 360) % 360;
          const nextLongB = (longB + speedB + 360) % 360;
          let nextAngle = Math.abs(nextLongA - nextLongB);
          if (nextAngle > 180) nextAngle = 360 - nextAngle;

          const nextDiff = Math.abs(nextAngle - def.angle);
          const isApplying = nextDiff < diff;
          const isPartile = diff <= 1.0;

          // Strength percentage: 100% at exact (diff = 0), down to 10% at maxAllowedOrb
          const strengthPercent = Math.max(
            10,
            Math.round((1 - diff / maxAllowedOrb) * 100)
          );

          const interpretation = getTraditionalInterpretation(
            pA,
            pB,
            def.type,
            def.nature
          );

          result.push({
            id: `${pA}_${pB}_${def.type}`,
            planetA: pA,
            planetB: pB,
            aspectType: def.type,
            aspectArabic: def.arabic,
            aspectName: def.name,
            symbol: def.symbol,
            exactAngle: def.angle,
            actualAngle: Math.round(angle * 100) / 100,
            orbDifference: Math.round(diff * 100) / 100,
            maxAllowedOrb: Math.round(maxAllowedOrb * 10) / 10,
            isApplying,
            isPartile,
            nature: def.nature,
            natureArabic: def.natureArabic,
            strengthPercent,
            traditionalInterpretation: interpretation,
          });

          break; // Match the closest aspect type
        }
      }
    }
  }

  // Sort by tightness of orb (most exact / powerful first)
  return result.sort((a, b) => a.orbDifference - b.orbDifference);
}
