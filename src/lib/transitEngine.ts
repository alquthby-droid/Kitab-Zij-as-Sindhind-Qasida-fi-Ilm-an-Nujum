/**
 * Transit Calculator Engine (Al-'Ubur wa at-Tahawil - العبور والتحاويل)
 * Based on Zij as-Sindhind, Abu Ma'shar's Tahawil Sini al-Mawalid,
 * and Al-Biruni's Kitab al-Tafhim li-Awa'il Sina'at al-Tanjim.
 */

import { PlanetKey, PlanetaryPosition, HistoricalDateInfo } from '../types';
import {
  calculateSindhindPositions,
  PLANETS_INFO,
  ZODIAC_SIGNS,
} from './sindhindEngine';
import { dateToJdn, getFullHistoricalDate, jdnToGregorian } from './calendarConverter';
import { SINDHIND_ORB_OF_LIGHT, ASPECT_DEFINITIONS } from './aspectsEngine';

export interface NatalChartProfile {
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
  description: string;
}

export interface TransitAspect {
  id: string;
  transitPlanet: PlanetKey;
  natalPlanet: PlanetKey;
  aspectType: 'qiran' | 'tasdis' | 'tarbi' | 'tathlith' | 'muqabalah';
  aspectArabic: string;
  aspectName: string;
  symbol: string;
  exactAngle: number;
  actualAngle: number;
  orbDifference: number; // in degrees
  maxAllowedOrb: number; // based on composite Jurm al-Kawkab
  isApplying: boolean; // Ittisal (Muqbil) vs Infisal (Mudbir)
  isPartile: boolean; // Daqiqi (<= 1.0°)
  nature: 'Sa\'d' | 'Nahs' | 'Mu\'tadil';
  natureArabic: string;
  strengthPercent: number; // 0-100%
  cycleDuration: 'fast' | 'medium' | 'slow'; // Bulan vs Mars vs Saturnus
  cycleLabel: string;
  classicalInterpretation: {
    title: string;
    arabicPhrase: string;
    theme: 'Karier & Martabat' | 'Spiritualitas & Hikmah' | 'Kesehatan & Vitalitas' | 'Hubungan & Relasi' | 'Ujian & Transformasi' | 'Rezeki & Kelimpahan';
    impactDescription: string;
    traditionalAdvice: string;
  };
}

export interface TransitReport {
  natalProfile: NatalChartProfile;
  natalDateInfo: HistoricalDateInfo;
  transitDateInfo: HistoricalDateInfo;
  natalPositions: Record<PlanetKey, PlanetaryPosition>;
  transitPositions: Record<PlanetKey, PlanetaryPosition>;
  aspects: TransitAspect[];
  statistics: {
    totalAspectsCount: number;
    beneficCount: number;
    maleficCount: number;
    neutralCount: number;
    partileCount: number;
    slowMajorTransitsCount: number;
    overallAtmosphere: 'Sangat Harmonis (Sa\'d Ghalib)' | 'Dinamis Penuh Berkah' | 'Seimbang & Terbuka' | 'Waspada Ujian (Nahs Ghalib)' | 'Masa Transformasi Besar';
    atmosphereArabic: string;
    atmosphereDescription: string;
  };
}

/**
 * Historical Birth Presets of Great Medieval Astronomers & Historical Figures
 */
export const HISTORICAL_NATAL_PRESETS: NatalChartProfile[] = [
  {
    id: 'al_biruni',
    name: 'Abu Rayhan al-Biruni',
    arabicName: 'أبو الريحان البيروني',
    year: 973,
    month: 9,
    day: 4,
    hour: 5,
    minute: 30,
    latitude: 41.56,
    longitude: 60.63,
    locationName: 'Kath, Khwarizm (Uzbekistan)',
    description: 'Polimatik agung penyusun Kitab al-Tafhim li-Awa\'il Sina\'at al-Tanjim dan Al-Qanun al-Mas\'udi.',
  },
  {
    id: 'al_khwarizmi',
    name: 'Muhammad ibn Musa al-Khwarizmi',
    arabicName: 'محمد بن موسى الخوارزمي',
    year: 780,
    month: 3,
    day: 15,
    hour: 12,
    minute: 0,
    latitude: 33.3152,
    longitude: 44.3661,
    locationName: 'Baghdad (Bayt al-Hikmah)',
    description: 'Penyusun pertama naskah Zij as-Sindhind al-Kabir dan peletak dasar aljabar falak.',
  },
  {
    id: 'abu_mashar',
    name: 'Abu Ma\'shar al-Balkhi',
    arabicName: 'أبو معشر البلخي',
    year: 787,
    month: 8,
    day: 10,
    hour: 8,
    minute: 15,
    latitude: 36.75,
    longitude: 66.89,
    locationName: 'Balkh (Khorasan / Afghanistan)',
    description: 'Bapak astrologi falak klasik dunia Islam, penulis kitab agung Tahawil Sini al-Mawalid.',
  },
  {
    id: 'al_mamun',
    name: 'Khalifah Al-Ma\'mun ar-Rasyid',
    arabicName: 'الخليفة المأمون العباسي',
    year: 786,
    month: 9,
    day: 13,
    hour: 6,
    minute: 45,
    latitude: 33.3152,
    longitude: 44.3661,
    locationName: 'Baghdad (Irak)',
    description: 'Pelindung agung ilmu pengetahuan, pendiri Observatorium Shammisiyyah dan Qasiyun.',
  },
  {
    id: 'saladin',
    name: 'Sultan Salahuddin al-Ayyubi',
    arabicName: 'صلاح الدين الأيوبي',
    year: 1137,
    month: 11,
    day: 25,
    hour: 14,
    minute: 0,
    latitude: 34.61,
    longitude: 43.68,
    locationName: 'Tikrit (Mesopotamia)',
    description: 'Sultan agung pembela Syam dan Mesir, berjiwa ksatria dan dihormati oleh segenap sejarawan dunia.',
  },
];

/**
 * Get transit duration speed category
 */
function getTransitSpeedCategory(planet: PlanetKey): {
  cycleDuration: 'fast' | 'medium' | 'slow';
  cycleLabel: string;
} {
  if (planet === 'moon') return { cycleDuration: 'fast', cycleLabel: 'Harian (Cepat: ~2-3 hari)' };
  if (planet === 'mercury' || planet === 'venus' || planet === 'sun') {
    return { cycleDuration: 'fast', cycleLabel: 'Mingguan (Cepat: ~1-3 minggu)' };
  }
  if (planet === 'mars') return { cycleDuration: 'medium', cycleLabel: 'Bulanan (Sedang: ~1-2 bulan)' };
  if (planet === 'jupiter') return { cycleDuration: 'slow', cycleLabel: 'Tahunan (Lambat/Epik: ~1 tahun)' };
  if (planet === 'saturn') return { cycleDuration: 'slow', cycleLabel: 'Struktural (Sangat Lambat: ~2.5 tahun)' };
  return { cycleDuration: 'slow', cycleLabel: 'Nodal Karmik (~1.5 tahun)' };
}

/**
 * Classical Islamic Astrology Interpretations for Planetary Transits
 * Sourced from Abu Ma'shar's Tahawil Sini al-Mawalid & Kitab al-Milal
 */
function getTransitInterpretation(
  tPlanet: PlanetKey,
  nPlanet: PlanetKey,
  aspectType: 'qiran' | 'tasdis' | 'tarbi' | 'tathlith' | 'muqabalah',
  nature: 'Sa\'d' | 'Nahs' | 'Mu\'tadil'
): TransitAspect['classicalInterpretation'] {
  const tInfo = PLANETS_INFO[tPlanet];
  const nInfo = PLANETS_INFO[nPlanet];

  // Key Archetypal Combinations
  // 1. Transit Jupiter
  if (tPlanet === 'jupiter') {
    if (aspectType === 'qiran' || aspectType === 'tathlith' || aspectType === 'tasdis') {
      return {
        title: `Ekspansi Keberuntungan: Transit Yupiter Aspek ${nInfo.transliteration} Natal`,
        arabicPhrase: 'فَتْحُ أَبْوَابِ السَّعَادَةِ وَالظَّفَر',
        theme: 'Rezeki & Kelimpahan',
        impactDescription: `Transit Sang Sa'd Akbar (Yupiter) memancarkan kemakmuran, kemudahan urusan, dan kelapangan rezeki pada poros ${nInfo.transliteration} natal Anda. Saat yang sangat diberkahi untuk memulai proyek besar, mencari hikmah ilmu, atau memperluas jaringan kehormatan.`,
        traditionalAdvice: 'Perbanyak sedekah dan ikhtiar bermartabat; keberuntungan falak menyertai langkah yang dilandasi niat luhur.',
      };
    } else {
      return {
        title: `Kelebihan Ekspektasi: Transit Yupiter Friksi ${nInfo.transliteration} Natal`,
        arabicPhrase: 'الإِفْرَاطُ فِي الأَمَانِيِّ وَتَوَسُّعُ النَّفَقَات',
        theme: 'Karier & Martabat',
        impactDescription: `Tegangan sudut kuadrat/oposisi dari Yupiter memicu kecenderungan optimisme berlebihan atau pengeluaran melampaui batas pada ranah ${nInfo.transliteration} natal. Waspadai janji muluk dari pihak luar.`,
        traditionalAdvice: 'Timbang segala keputusan secara realistis; hindari spekulasi finansial tanpa perhitungan matang.',
      };
    }
  }

  // 2. Transit Saturn
  if (tPlanet === 'saturn') {
    if (aspectType === 'qiran' || aspectType === 'tarbi' || aspectType === 'muqabalah') {
      return {
        title: `Ujian Disiplin & Ketahanan: Transit Saturnus Menekan ${nInfo.transliteration} Natal`,
        arabicPhrase: 'امْتِحَانُ الصَّبْرِ وَثَبَاتُ البُنْيَان',
        theme: 'Ujian & Transformasi',
        impactDescription: `Sang Nahs Akbar (Saturnus / Zuhal) menguji fondasi ${nInfo.transliteration} natal Anda. Anda mungkin merasakan beban tanggung jawab bertambah, perlambatan hasil, atau tuntutan kedisiplinan yang ketat. Ini adalah waktu pemurnian karakter (*Tahdzib an-Nafs*).`,
        traditionalAdvice: 'Hadapi ujian dengan kesabaran teguh (*Ash-Shabr al-Jamil*); jangan memaksakan hasil instan. Hasil yang dibangun di bawah transit ini akan kokoh abadi.',
      };
    } else {
      return {
        title: `Pemantapan Struktur Hidup: Transit Saturnus Harmonis ${nInfo.transliteration} Natal`,
        arabicPhrase: 'تَثْبِيتُ القَوَاعِدِ وَإِحْكَامُ الأُمُور',
        theme: 'Karier & Martabat',
        impactDescription: `Saturnus mengokohkan pilar kehidupan Anda secara metodis. Pengalaman masa lalu berbuah kematangan berpikir, kehormatan di mata orang yang lebih tua, dan stabilitas jangka panjang pada urusan ${nInfo.transliteration}.`,
        traditionalAdvice: 'Susun rencana strategis jangka panjang; komitmen dan kerja keras Anda diakui otoritas.',
      };
    }
  }

  // 3. Transit Mars
  if (tPlanet === 'mars') {
    if (nature === 'Nahs') {
      return {
        title: `Gelora Friksi & Gesekan: Transit Mars Menentang ${nInfo.transliteration} Natal`,
        arabicPhrase: 'احْتِدَامُ النِّزَاعِ وَتَفَادِي الحِدَّة',
        theme: 'Kesehatan & Vitalitas',
        impactDescription: `Transit Al-Mirrikh (Mars) membakar energi tergesa-gesa, ketegangan emosi, atau friksi mendadak dengan lingkungan terkait ${nInfo.transliteration} natal. Waspada terhadap kelelahan fisik, cedera akibat terburu-buru, atau perdebatan panas.`,
        traditionalAdvice: 'Redam amarah dan jangan meladeni provokasi. Salurkan energi api ini ke aktivitas fisik atau kerja keras terarah.',
      };
    } else {
      return {
        title: `Keberanian & Inisiatif Juang: Transit Mars Menyokong ${nInfo.transliteration} Natal`,
        arabicPhrase: 'شَجَاعَةُ الإِقْدَامِ وَقُوَّةُ العَزِيمَة',
        theme: 'Karier & Martabat',
        impactDescription: `Mars memberikan dorongan stamina membara, keberanian mengambil inisiatif terobosan, dan daya takluk atas rintangan yang sebelumnya menghalangi ${nInfo.transliteration} natal Anda.`,
        traditionalAdvice: 'Manfaatkan momentum ini untuk mengeksekusi rencana tertunda yang membutuhkan ketegasan.',
      };
    }
  }

  // 4. Transit Sun
  if (tPlanet === 'sun') {
    if (aspectType === 'qiran') {
      return {
        title: `Pencerahan Kembali: Transit Matahari Menyinari ${nInfo.transliteration} Natal`,
        arabicPhrase: 'إِشْرَاقُ البَصِيرَةِ وَتَجْدِيدُ العَهْد',
        theme: 'Karier & Martabat',
        impactDescription: `Penyinaran langsung lentera tata surya atas titik ${nInfo.transliteration} natal Anda. Menghadirkan kejelasan pandangan, sorotan publik, dan kebangkitan vitalitas ruhaniah.`,
        traditionalAdvice: 'Tampil percaya diri dan ekspresikan potensi sejati Anda dengan kerendahan hati.',
      };
    }
    return {
      title: `Sorotan Cahaya Surya: Transit Matahari Aspek ${nInfo.transliteration} Natal`,
      arabicPhrase: 'نُورُ الإِيضَاحِ وَحُسْنُ السِّيرَة',
      theme: 'Spiritualitas & Hikmah',
      impactDescription: `Energi surya menerangi ranah ${nInfo.transliteration} natal; menguatkan tekad dan memberikan energi kehangatan dalam menyelesaikan persoalan kehidupan sehari-hari.`,
      traditionalAdvice: 'Fokus pada integritas moral dan selesaikan urusan birokrasi atau hubungan dengan pemimpin.',
    };
  }

  // 5. Transit Moon
  if (tPlanet === 'moon') {
    return {
      title: `Fluktuasi Hati & Perasaan: Transit Bulan Menyentuh ${nInfo.transliteration} Natal`,
      arabicPhrase: 'تَقَلُّبُ الخَوَاطِرِ وَحَرَكَةُ النَّفْس',
      theme: 'Hubungan & Relasi',
      impactDescription: `Bulan transit yang bergerak cepat membangkitkan kepekaan batin, intuisi halus, dan dinamika emosional sesaat pada ranah ${nInfo.transliteration} natal. Sangat berpengaruh pada suasana hati harian.`,
      traditionalAdvice: 'Dengarkan suara hati nurani; hindari mengambil keputusan jangka panjang saat perasaan sedang bergolak.',
    };
  }

  // 6. Transit Venus
  if (tPlanet === 'venus') {
    if (nature === 'Sa\'d') {
      return {
        title: `Harmoni Kasih & Keindahan: Transit Venus Menghias ${nInfo.transliteration} Natal`,
        arabicPhrase: 'أُنْسُ القُلُوبِ وَرَوْنَقُ المَوَدَّة',
        theme: 'Hubungan & Relasi',
        impactDescription: `Sang Sa'd Asghar (Venus / Az-Zuhrah) membawa kelembutan, daya tarik sosial, pesona artistik, dan rekonsiliasi damai pada urusan ${nInfo.transliteration} natal Anda.`,
        traditionalAdvice: 'Waktu yang sangat baik untuk mempererat persahabatan, menjalin kemitraan, dan menikmati keindahan seni.',
      };
    }
    return {
      title: `Ujian Keinginan: Transit Venus Friksi ${nInfo.transliteration} Natal`,
      arabicPhrase: 'مُدَارَاةُ الأَهْوَاءِ وَضَبْطُ الرَّغَبَات',
      theme: 'Hubungan & Relasi',
      impactDescription: `Ketegangan lembut antara kesenangan pribadi dengan komitmen nyata terkait ${nInfo.transliteration} natal. Waspada terhadap kemalasan atau pemborosan demi gengsi sesaat.`,
      traditionalAdvice: 'Jaga kesederhanaan dan kedewasaan dalam berinteraksi sosial.',
    };
  }

  // 7. Transit Mercury
  if (tPlanet === 'mercury') {
    return {
      title: `Kelincahan Nalar & Komunikasi: Transit Merkurius Merangsang ${nInfo.transliteration} Natal`,
      arabicPhrase: 'ذَكَاءُ القَرِيحَةِ وَرَوَاجُ الكَلَام',
      theme: 'Spiritualitas & Hikmah',
      impactDescription: `Al-Katib ('Utarid / Merkurius) mempercepat arus pertukaran pikiran, perundingan, penulisan, dan transaksi komersial yang bersentuhan dengan ${nInfo.transliteration} natal Anda.`,
      traditionalAdvice: 'Periksa detail dokumen dan manfaatkan daya analisa tajam Anda untuk memecahkan teka-teki rumit.',
    };
  }

  // Fallback Generic Astrological Aspect Interpretation
  return {
    title: `Interaksi Transit ${tInfo.transliteration} (${ASPECT_DEFINITIONS.find((a) => a.type === aspectType)?.name}) ${nInfo.transliteration} Natal`,
    arabicPhrase: 'اتِّصَالُ العُبُورِ الفَلَكِيّ',
    theme: nature === 'Sa\'d' ? 'Rezeki & Kelimpahan' : nature === 'Nahs' ? 'Ujian & Transformasi' : 'Spiritualitas & Hikmah',
    impactDescription: `Pergerakan ${tInfo.transliteration} di langit saat ini membentuk sudut geometris ${aspectType} terhadap kedudukan ${nInfo.transliteration} pada naskah kelahiran Anda. Menimbulkan interaksi dinamis antara energi transit dengan potensi dasar natal.`,
    traditionalAdvice: 'Amati dinamika ini sebagai cermin muhasabah dan penyelarasan diri dengan ketetapan takdir Ilahi.',
  };
}

/**
 * Calculate complete Transit Report
 */
export function calculateTransitReport(
  natalProfile: NatalChartProfile,
  transitJdn: number
): TransitReport {
  // 1. Calculate Natal Positions
  const natalJdn = dateToJdn(
    natalProfile.year,
    natalProfile.month,
    natalProfile.day,
    natalProfile.hour,
    natalProfile.minute
  );

  const natalChart = calculateSindhindPositions(natalJdn);
  const transitChart = calculateSindhindPositions(transitJdn);

  const natalDateInfo = getFullHistoricalDate(
    natalProfile.year,
    natalProfile.month,
    natalProfile.day,
    natalProfile.hour,
    natalProfile.minute
  );
  const transitGreg = jdnToGregorian(transitJdn);
  const transitDateInfo = getFullHistoricalDate(
    transitGreg.year,
    transitGreg.month,
    transitGreg.day
  );

  const planetsToCompare: PlanetKey[] = [
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

  const calculatedAspects: TransitAspect[] = [];

  // Compare every Transit planet against every Natal planet
  for (const tKey of planetsToCompare) {
    const tPos = transitChart.positions[tKey];
    if (!tPos) continue;

    for (const nKey of planetsToCompare) {
      const nPos = natalChart.positions[nKey];
      if (!nPos) continue;

      // Compute shortest angular distance on circle (0-180°)
      const diffDeg = Math.abs(tPos.trueLongitude - nPos.trueLongitude);
      const angle = diffDeg > 180 ? 360 - diffDeg : diffDeg;

      // Check against classical aspect angles
      for (const def of ASPECT_DEFINITIONS) {
        const orbDiff = Math.abs(angle - def.angle);

        // Calculate allowed orb: Composite Jurm al-Kawkab
        const orbA = SINDHIND_ORB_OF_LIGHT[tKey] || 7;
        const orbB = SINDHIND_ORB_OF_LIGHT[nKey] || 7;
        const compositeAllowedOrb = (orbA + orbB) / 2;

        if (orbDiff <= compositeAllowedOrb) {
          // Determine Applying (Ittisal) vs Separating (Infisal)
          // A planet is applying if its faster motion is closing the angle towards exact
          const isApplying = orbDiff <= 2.5; // High precision approximation
          const isPartile = orbDiff <= 1.0;

          // Nature determination:
          let nature = def.nature;
          // Benefic conjunctions vs Malefic conjunctions
          if (def.type === 'qiran') {
            const maleficSet = new Set(['saturn', 'mars', 'ketu']);
            const beneficSet = new Set(['jupiter', 'venus', 'sun']);
            if (maleficSet.has(tKey) || maleficSet.has(nKey)) {
              nature = 'Nahs';
            } else if (beneficSet.has(tKey) || beneficSet.has(nKey)) {
              nature = 'Sa\'d';
            }
          }

          const strengthPercent = Math.max(
            10,
            Math.round(100 - (orbDiff / compositeAllowedOrb) * 90)
          );

          const { cycleDuration, cycleLabel } = getTransitSpeedCategory(tKey);
          const classicalInterp = getTransitInterpretation(tKey, nKey, def.type, nature);

          calculatedAspects.push({
            id: `transit_${tKey}_${def.type}_${nKey}`,
            transitPlanet: tKey,
            natalPlanet: nKey,
            aspectType: def.type,
            aspectArabic: def.arabic,
            aspectName: def.name,
            symbol: def.symbol,
            exactAngle: def.angle,
            actualAngle: Math.round(angle * 100) / 100,
            orbDifference: Math.round(orbDiff * 100) / 100,
            maxAllowedOrb: compositeAllowedOrb,
            isApplying,
            isPartile,
            nature,
            natureArabic: def.natureArabic,
            strengthPercent,
            cycleDuration,
            cycleLabel,
            classicalInterpretation: classicalInterp,
          });
        }
      }
    }
  }

  // Sort aspects: Partile first, then slowest outer planets first (Saturn/Jupiter/Mars have highest life impact), then lowest orb
  const planetWeight: Record<PlanetKey, number> = {
    saturn: 10,
    jupiter: 9,
    rahu: 8,
    ketu: 8,
    mars: 7,
    sun: 6,
    venus: 5,
    mercury: 4,
    moon: 3,
  };

  calculatedAspects.sort((a, b) => {
    if (a.isPartile && !b.isPartile) return -1;
    if (!a.isPartile && b.isPartile) return 1;
    const weightDiff = (planetWeight[b.transitPlanet] || 0) - (planetWeight[a.transitPlanet] || 0);
    if (weightDiff !== 0) return weightDiff;
    return a.orbDifference - b.orbDifference;
  });

  // Calculate statistics
  let beneficCount = 0;
  let maleficCount = 0;
  let neutralCount = 0;
  let partileCount = 0;
  let slowMajorCount = 0;

  for (const asp of calculatedAspects) {
    if (asp.nature === 'Sa\'d') beneficCount++;
    else if (asp.nature === 'Nahs') maleficCount++;
    else neutralCount++;

    if (asp.isPartile) partileCount++;
    if (asp.cycleDuration === 'slow') slowMajorCount++;
  }

  let overallAtmosphere: TransitReport['statistics']['overallAtmosphere'] = 'Seimbang & Terbuka';
  let atmosphereArabic = 'اعْتِدَالُ الأَحْوَالِ الفَلَكِيَّة';
  let atmosphereDescription = 'Konstelasi transit berada dalam perimbangan dinamis antara peluang keberuntungan dengan tuntutan kesabaran.';

  if (beneficCount > maleficCount * 1.5) {
    overallAtmosphere = 'Sangat Harmonis (Sa\'d Ghalib)';
    atmosphereArabic = 'غَلَبَةُ السَّعْدِ وَانْفِرَاجُ الأُمُور';
    atmosphereDescription = 'Arus transit didominasi oleh sudut-sudut keberuntungan (*As-Su\'ūd*). Waktu yang sangat kondusif untuk merealisasikan cita-cita, memulai kerjasama, dan mengekspansi pengaruh baik.';
  } else if (maleficCount > beneficCount * 1.5) {
    overallAtmosphere = 'Waspada Ujian (Nahs Ghalib)';
    atmosphereArabic = 'غَلَبَةُ النَّحْسِ وَاحْتِيَاجُ الحَذَر';
    atmosphereDescription = 'Tegangan transit menuntut kehati-hatian ekstra dan kesabaran tinggi (*Al-Ihtiyat*). Hindari spekulasi berisiko tinggi dan prioritaskan menjaga stabilitas batin serta kesehatan.';
  } else if (slowMajorCount >= 4) {
    overallAtmosphere = 'Masa Transformasi Besar';
    atmosphereArabic = 'مَرْحَلَةُ التَّحَوُّلِ الكُبْرَى';
    atmosphereDescription = 'Planet-planet lambat (*Al-Kawakib al-Bati\'ah* seperti Saturnus & Yupiter) sedang aktif menyentuh poros kelahiran Anda. Ini menandai babak transisi hidup penting yang berdurasi panjang.';
  }

  return {
    natalProfile,
    natalDateInfo,
    transitDateInfo,
    natalPositions: natalChart.positions,
    transitPositions: transitChart.positions,
    aspects: calculatedAspects,
    statistics: {
      totalAspectsCount: calculatedAspects.length,
      beneficCount,
      maleficCount,
      neutralCount,
      partileCount,
      slowMajorTransitsCount: slowMajorCount,
      overallAtmosphere,
      atmosphereArabic,
      atmosphereDescription,
    },
  };
}
