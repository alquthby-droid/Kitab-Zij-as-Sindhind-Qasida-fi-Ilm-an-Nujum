import { PlanetKey, PlanetaryPosition, HistoricalDateInfo } from '../types';
import { PLANETS_INFO, ZODIAC_SIGNS } from './sindhindEngine';
import { SINDHIND_ORB_OF_LIGHT, ASPECT_DEFINITIONS } from './aspectsEngine';

export interface SynastryAspect {
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
  isPartile: boolean; // <= 1.0°
  nature: 'Sa\'d' | 'Nahs' | 'Mu\'tadil';
  natureArabic: string;
  score: number;
  category: 'affection' | 'intellect' | 'vitality' | 'stability';
  categoryArabic: string;
  classicalInterpretation: {
    title: string;
    arabicPhrase: string;
    synastryDynamic: string;
    advice: string;
  };
}

export interface SynastryReport {
  chartAInfo: {
    title: string;
    date: HistoricalDateInfo;
    ascendantDeg: number;
    ascendantSignIndex: number;
  };
  chartBInfo: {
    title: string;
    date: HistoricalDateInfo;
    ascendantDeg: number;
    ascendantSignIndex: number;
  };
  aspects: SynastryAspect[];
  compatibilityIndex: number; // 0 to 100%
  overallVerdict: {
    arabic: string;
    latin: string;
    summary: string;
    level: 'Al-Ittifaq al-Kamil' | 'Al-Mawaddah al-Qawiyyah' | 'Mu\'tadil Maqbul' | 'Kuthrah al-Munaza\'ah' | 'Nahs Shadid';
  };
  categoryScores: {
    affection: { score: number; max: number; percent: number; label: string; arabic: string; desc: string };
    intellect: { score: number; max: number; percent: number; label: string; arabic: string; desc: string };
    vitality: { score: number; max: number; percent: number; label: string; arabic: string; desc: string };
    stability: { score: number; max: number; percent: number; label: string; arabic: string; desc: string };
  };
  totalBeneficCount: number;
  totalMaleficCount: number;
  totalNeutralCount: number;
}

/**
 * Determine category of planetary interaction in synastry
 */
function getAspectCategory(pA: PlanetKey, pB: PlanetKey): 'affection' | 'intellect' | 'vitality' | 'stability' {
  const set = new Set([pA, pB]);
  if (set.has('venus') || set.has('moon')) return 'affection';
  if (set.has('mercury') || set.has('jupiter')) return 'intellect';
  if (set.has('mars') || set.has('sun')) return 'vitality';
  return 'stability';
}

/**
 * Classical Synastry interpretation based on Abu Ma'shar & Zij as-Sindhind
 */
function getSynastryInterpretation(
  pA: PlanetKey,
  pB: PlanetKey,
  aspectType: 'qiran' | 'tasdis' | 'tarbi' | 'tathlith' | 'muqabalah',
  nature: 'Sa\'d' | 'Nahs' | 'Mu\'tadil'
): SynastryAspect['classicalInterpretation'] {
  const pAInfo = PLANETS_INFO[pA];
  const pBInfo = PLANETS_INFO[pB];
  const pair = [pA, pB].sort().join('_');

  // Specific key classical synastry combinations
  if (pair === 'moon_sun') {
    if (aspectType === 'qiran' || aspectType === 'tathlith' || aspectType === 'tasdis') {
      return {
        title: "Ittifaq ash-Shams wa al-Qamar (Keselarasan Rohani & Jiwa)",
        arabicPhrase: 'موافقة الشمس للقمر بين الطالعين: ألفة الروح وطمأنينة النفس ودوام المودة',
        synastryDynamic: 'Matahari pada Tanggal A dan Bulan pada Tanggal B memancarkan polaritas maskulin-feminin yang harmonis; memperkuat saling pengertian batin.',
        advice: 'Pondasi yang sangat kokoh untuk kemitraan jangka panjang dan sinergi tujuan hidup.',
      };
    }
    return {
      title: "Munaza'at ash-Shams wa al-Qamar (Friksi Kehendak & Emosi)",
      arabicPhrase: 'اختلاف النيرين بالتربيع أو المقابلة: تنازع بين الإرادة الصريحة والمشاعر الباطنة',
      synastryDynamic: 'Tuntutan ego dari satu pihak sering bertentangan dengan respon emosional pihak kedua.',
      advice: 'Perlu kompromi sadar dalam menyikapi perbedaan cara berekspresi dan pengambilan keputusan.',
    };
  }

  if (pair === 'jupiter_venus') {
    if (nature === 'Sa\'d' || aspectType === 'qiran') {
      return {
        title: "Iltiqa' as-Sa'dayn (Pertemuan Dua Bintang Berkah)",
        arabicPhrase: 'التئام السعدين بين الوقتين: يمن وبركة وسعة في الرزق وحسن المعاشرة',
        synastryDynamic: 'Kemurahan hati Yupiter melimpahi kelembutan Venus; menghadirkan suasana penuh berkah, estetika, dan kerukunan.',
        advice: 'Hubungan yang mendatangkan kelapangan rezeki dan saling menghargai martabat.',
      };
    }
    return {
      title: "Israf as-Sa'dayn (Kemewahan Berlebih)",
      arabicPhrase: 'منافسة السعدين: إفراط في الإنفاق والغفلة عن تدبير العواقب',
      synastryDynamic: 'Saling memanjakan secara berlebihan yang dapat melemahkan disiplin finansial atau komitmen tugas.',
      advice: 'Tetapkan batas praktis dalam pengeluaran dan ekspektasi bersama.',
    };
  }

  if (pair === 'mars_venus') {
    if (nature === 'Sa\'d' || aspectType === 'qiran') {
      return {
        title: "Injizab az-Zuhrah wa al-Marrikh (Daya Tarik Estetika & Dinamika)",
        arabicPhrase: 'موافقة الزهرة للمريخ: رغبة متقدة وجاذبية قوية وتوافق في الميول والهمة',
        synastryDynamic: 'Kombinasi daya tarik rasa dan inisiatif gerak; menumbuhkan antusiasme dan pesona interaktif yang hangat.',
        advice: 'Gunakan energi dinamis ini untuk menciptakan karya bersama dan menjaga kehangatan relasi.',
      };
    }
    return {
      title: "Khilaf az-Zuhrah wa al-Marrikh (Tegangan Hasrat & Ketidaksabaran)",
      arabicPhrase: 'تربيع الزهرة للمريخ: نفور عارض من حدة الطبع وسرعة الانفعال',
      synastryDynamic: 'Ketidaksabaran Mars berisiko menyinggung sensitivitas Venus; memicu pertengkaran kecil yang tak perlu.',
      advice: 'Kembangkan kelemahlembutan dalam komunikasi agar tidak merusak perasaan.',
    };
  }

  if (pair === 'mercury_mercury' || pair === 'jupiter_mercury') {
    if (nature === 'Sa\'d' || aspectType === 'qiran') {
      return {
        title: "Tawaqud al-Adhhan (Keserasian Intelektual & Wacana)",
        arabicPhrase: 'موافقة الفكر واللسان: تفاهم سريع في الرأي وصواب في المشورة وحسن الاستنباط',
        synastryDynamic: 'Aliran dialog berlangsung cair, terbuka, dan produktif dalam menyelesaikan perkara rumit.',
        advice: 'Sangat ideal untuk kerja sama riset, pertukaran ilmu, diplomasi, dan musyawarah.',
      };
    }
    return {
      title: "Jadal wa Ikhtilaf (Perbedaan Paradigma)",
      arabicPhrase: 'منازعة العقلين: لجاجة في الخصومة واختلاف في مآخذ الاستدلال',
      synastryDynamic: 'Kecenderungan saling mendebat atau salah menangkap maksud kata-kata mitra bicara.',
      advice: 'Dengarkan secara utuh sebelum membantah; utamakan substansi daripada adu retorika.',
    };
  }

  if (pair === 'mars_saturn') {
    if (nature === 'Nahs' || aspectType === 'qiran') {
      return {
        title: "Sudan an-Nahsayn (Benturan Energi Keras)",
        arabicPhrase: 'مقابلة النحسين بين التاريخين: شدة في المعاملة وعناد وصعوبة في التراضي',
        synastryDynamic: 'Benturan antara dorongan mendesak ingin cepat dengan penolakan atau hambatan yang kaku.',
        advice: 'Hindari pemaksaan kehendak; butuh kesabaran ekstra dan pembagian tanggung jawab yang tidak tumpang tindih.',
      };
    }
    return {
      title: "Inqiyad an-Nahsayn (Ketabahan Mengatasi Rintangan)",
      arabicPhrase: 'تثليث النحسين: حزم وعزيمة راسخة في إنجاز المهام الشاقة',
      synastryDynamic: 'Ketahanan yang tangguh untuk memikul tanggung jawab besar secara bersama.',
      advice: 'Fokuskan energi pada tujuan praktis jangka panjang.',
    };
  }

  // Generic fallback
  const aName = pAInfo.transliteration;
  const bName = pBInfo.transliteration;

  if (nature === 'Sa\'d') {
    return {
      title: `Keselarasan ${aspectType === 'tathlith' ? 'Trina' : 'Sekstil'} ${aName} & ${bName}`,
      arabicPhrase: `اتصال سعد ومودة بين ${pAInfo.arabicName} و${pBInfo.arabicName}`,
      synastryDynamic: `Pengaruh ${aName} pada Tanggal A saling melengkapi dengan ${bName} pada Tanggal B secara harmonis.`,
      advice: 'Manfaatkan kemudahan ini untuk memperkuat kebersamaan dan sinergi.',
    };
  }
  if (nature === 'Nahs') {
    return {
      title: `Tegangan ${aspectType === 'tarbi' ? 'Kuadrat' : 'Oposisi'} ${aName} & ${bName}`,
      arabicPhrase: `منافرة وعسر بين ${pAInfo.arabicName} و${pBInfo.arabicName}`,
      synastryDynamic: `Terdapat potensi friksi atau polaritas sudut pandang antara karakter ${aName} dan ${bName}.`,
      advice: 'Sikapi dengan kedewasaan, batasan yang jelas, dan empati.',
    };
  }
  return {
    title: `Konjungsi Pertemuan ${aName} & ${bName}`,
    arabicPhrase: `اجتماع طاقة ${pAInfo.arabicName} مع ${pBInfo.arabicName}`,
    synastryDynamic: `Penggabungan langsung kedua energi kawkab di derajat zodiak yang berdekatan.`,
    advice: 'Hasilnya bergantung pada cara kedua pihak mengarahkan potensi gabungan tersebut.',
  };
}

/**
 * Calculate cross-aspects and full Synastry analysis between two charts
 */
export function calculateSynastryReport(
  positionsA: Record<PlanetKey, PlanetaryPosition>,
  positionsB: Record<PlanetKey, PlanetaryPosition>,
  chartAInfo: SynastryReport['chartAInfo'],
  chartBInfo: SynastryReport['chartBInfo']
): SynastryReport {
  const planetKeys: PlanetKey[] = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'rahu',
    'ketu',
  ];

  const aspects: SynastryAspect[] = [];
  let totalWeightedScore = 0;
  let maxPossibleScore = 0;

  let beneficCount = 0;
  let maleficCount = 0;
  let neutralCount = 0;

  const categoryScores = {
    affection: { score: 0, max: 0, percent: 50, label: 'Mawaddah & Kasih Sayang', arabic: 'المودّة والألفة', desc: 'Keselarasan emosional, empati batin, dan kehangatan rasa.' },
    intellect: { score: 0, max: 0, percent: 50, label: 'Akal & Komunikasi', arabic: 'العقل والحوار', desc: 'Kelancaran musyawarah, pertukaran ide, dan kesepahaman logika.' },
    vitality: { score: 0, max: 0, percent: 50, label: 'Daya Gerak & Inisiatif', arabic: 'الهمّة والقوّة', desc: 'Antusiasme tindakan, semangat juang, dan kerja nyata bersama.' },
    stability: { score: 0, max: 0, percent: 50, label: 'Keteguhan & Komitmen', arabic: 'الثبات والمسؤولية', desc: 'Kesetiaan, daya tahan terhadap krisis, dan kepatuhan janji.' },
  };

  // Cross-compare every planet in Chart A with every planet in Chart B
  for (const pA of planetKeys) {
    const posA = positionsA[pA];
    if (!posA) continue;

    for (const pB of planetKeys) {
      const posB = positionsB[pB];
      if (!posB) continue;

      const longA = posA.trueLongitude;
      const longB = posB.trueLongitude;

      let angle = Math.abs(longA - longB);
      if (angle > 180) angle = 360 - angle;

      const orbA = SINDHIND_ORB_OF_LIGHT[pA] || 8;
      const orbB = SINDHIND_ORB_OF_LIGHT[pB] || 8;
      const maxAllowedOrb = (orbA + orbB) / 2;

      for (const def of ASPECT_DEFINITIONS) {
        const diff = Math.abs(angle - def.angle);

        if (diff <= maxAllowedOrb) {
          const isPartile = diff <= 1.0;
          const category = getAspectCategory(pA, pB);
          const categoryArabic = categoryScores[category].arabic;

          // Score weighting according to classical Sindhind tradition
          let baseScore = 0;
          if (def.type === 'tathlith') baseScore = 4.0;
          else if (def.type === 'tasdis') baseScore = 2.5;
          else if (def.type === 'tarbi') baseScore = -3.0;
          else if (def.type === 'muqabalah') baseScore = -3.5;
          else {
            // Conjunction: depends on planets involved
            const hasBenefic = pA === 'jupiter' || pA === 'venus' || pB === 'jupiter' || pB === 'venus';
            const hasMalefic = pA === 'mars' || pA === 'saturn' || pB === 'mars' || pB === 'saturn';
            if (hasBenefic && !hasMalefic) baseScore = 4.0;
            else if (hasMalefic && !hasBenefic) baseScore = -2.5;
            else baseScore = 1.5;
          }

          // Partile boost (+25% intensity if within 1°)
          if (isPartile) {
            baseScore *= 1.25;
          }

          // Exactness factor: tighter orbs have higher influence
          const tightness = 1 - diff / maxAllowedOrb;
          const finalScore = Math.round(baseScore * (0.6 + 0.4 * tightness) * 10) / 10;

          if (def.nature === 'Sa\'d') beneficCount++;
          else if (def.nature === 'Nahs') maleficCount++;
          else neutralCount++;

          categoryScores[category].score += finalScore;
          categoryScores[category].max += 5.0;

          totalWeightedScore += finalScore;
          maxPossibleScore += 5.0;

          const interpretation = getSynastryInterpretation(pA, pB, def.type, def.nature);

          aspects.push({
            id: `syn_${pA}_${pB}_${def.type}`,
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
            isPartile,
            nature: def.nature,
            natureArabic: def.natureArabic,
            score: finalScore,
            category,
            categoryArabic,
            classicalInterpretation: interpretation,
          });

          break; // take best matching aspect
        }
      }
    }
  }

  // Calculate normalized Compatibility Index (0 - 100%)
  // Baseline neutral is 50%. Positive scores move towards 100%, negative towards 0%.
  let compatibilityIndex = 50;
  if (aspects.length > 0) {
    const rawRatio = totalWeightedScore / Math.max(15, aspects.length * 2.5);
    compatibilityIndex = Math.min(98, Math.max(12, Math.round(50 + rawRatio * 28)));
  }

  // Calculate category percentages
  (Object.keys(categoryScores) as Array<keyof typeof categoryScores>).forEach((cat) => {
    const item = categoryScores[cat];
    if (item.max > 0) {
      const normalized = Math.round(50 + (item.score / item.max) * 50);
      item.percent = Math.min(99, Math.max(10, normalized));
    } else {
      item.percent = 50;
    }
  });

  // Overall verdict synthesis
  let overallVerdict: SynastryReport['overallVerdict'];
  if (compatibilityIndex >= 82) {
    overallVerdict = {
      level: 'Al-Ittifaq al-Kamil',
      arabic: 'الاتفاق الكامل والتوافق السعيد المبارك',
      latin: 'Harmoni Paripurna & Berkah Tinggi',
      summary: 'Kombinasi kedua tarikh memancarkan dominasi aspek Sa\'d (Trina dan Sekstil). Aliran energi saling menguatkan dengan tingkat keselarasan yang sangat tinggi.',
    };
  } else if (compatibilityIndex >= 68) {
    overallVerdict = {
      level: 'Al-Mawaddah al-Qawiyyah',
      arabic: 'المودّة القوية والتآلف المحمود',
      latin: 'Keselarasan Kuat & Menguntungkan',
      summary: 'Hubungan kedua data didominasi oleh kesepahaman yang baik dengan sedikit friksi wajar yang mudah diselaraskan lewat musyawarah.',
    };
  } else if (compatibilityIndex >= 48) {
    overallVerdict = {
      level: 'Mu\'tadil Maqbul',
      arabic: 'اعتدال مقبول مع لزوم التحفظ',
      latin: 'Netral Berimbang / Cukup',
      summary: 'Terdapat keseimbangan antara aspek berkah dan aspek tantangan. Membutuhkan upaya sadar untuk meredam friksi dan mengedepankan titik temu.',
    };
  } else if (compatibilityIndex >= 32) {
    overallVerdict = {
      level: 'Kuthrah al-Munaza\'ah',
      arabic: 'كثرة المنازعة والتباين في الطبائع',
      latin: 'Tingkat Friksi & Tantangan Dominan',
      summary: 'Dominasi aspek Kuadrat atau Oposisi mengharuskan kehati-hatian ekstra; potensi perselisihan atau perbedaan kepentingan cukup terasa.',
    };
  } else {
    overallVerdict = {
      level: 'Nahs Shadid',
      arabic: 'نحس شديد ومباينة واضحة',
      latin: 'Ketidakcocokan Tajam (Nahs)',
      summary: 'Aspek-aspek benturan kawkab keras mendominasi; menuntut penataan ulang ekspektasi dan kehati-hatian dalam bermitra.',
    };
  }

  // Sort aspects by orb tightness (most exact first)
  aspects.sort((a, b) => a.orbDifference - b.orbDifference);

  return {
    chartAInfo,
    chartBInfo,
    aspects,
    compatibilityIndex,
    overallVerdict,
    categoryScores,
    totalBeneficCount: beneficCount,
    totalMaleficCount: maleficCount,
    totalNeutralCount: neutralCount,
  };
}
