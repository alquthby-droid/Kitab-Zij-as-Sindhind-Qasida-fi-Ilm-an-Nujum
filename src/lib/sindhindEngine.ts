/**
 * Astronomical and Classical Astrological Calculation Engine
 * Grounded in Zij as-Sindhind (al-Khwarizmi / Maslama al-Majriti)
 * and classical astrological didactic poetry (Qasida fi 'Ilm an-Nujum)
 */

import {
  AspectRelation,
  AstrologicalHouse,
  CelestialCoordinate,
  LunarMansion,
  PlanetInfo,
  PlanetKey,
  PlanetaryDignity,
  PlanetaryPosition,
  ZodiacSign,
} from '../types';

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    index: 0,
    arabicName: 'الحمل',
    transliteration: 'al-Haml',
    latinName: 'Aries',
    symbol: '♈',
    element: 'Nar',
    modality: 'Munqalib',
    ruler: 'mars',
    exaltationPlanet: 'sun',
    triplicityDay: 'sun',
    triplicityNight: 'jupiter',
    triplicityParticipating: 'saturn',
  },
  {
    index: 1,
    arabicName: 'الثور',
    transliteration: 'ath-Thawr',
    latinName: 'Taurus',
    symbol: '♉',
    element: 'Turab',
    modality: 'Thabit',
    ruler: 'venus',
    exaltationPlanet: 'moon',
    triplicityDay: 'venus',
    triplicityNight: 'moon',
    triplicityParticipating: 'mars',
  },
  {
    index: 2,
    arabicName: 'الجوزاء',
    transliteration: 'al-Jawza\'',
    latinName: 'Gemini',
    symbol: '♊',
    element: 'Hawa',
    modality: 'Dhu Jasadayn',
    ruler: 'mercury',
    exaltationPlanet: 'rahu',
    triplicityDay: 'saturn',
    triplicityNight: 'mercury',
    triplicityParticipating: 'jupiter',
  },
  {
    index: 3,
    arabicName: 'السرطان',
    transliteration: 'as-Saratan',
    latinName: 'Cancer',
    symbol: '♋',
    element: 'Ma',
    modality: 'Munqalib',
    ruler: 'moon',
    exaltationPlanet: 'jupiter',
    triplicityDay: 'venus',
    triplicityNight: 'mars',
    triplicityParticipating: 'moon',
  },
  {
    index: 4,
    arabicName: 'الأسد',
    transliteration: 'al-Asad',
    latinName: 'Leo',
    symbol: '♌',
    element: 'Nar',
    modality: 'Thabit',
    ruler: 'sun',
    triplicityDay: 'sun',
    triplicityNight: 'jupiter',
    triplicityParticipating: 'saturn',
  },
  {
    index: 5,
    arabicName: 'السنبلة',
    transliteration: 'as-Sunbulah',
    latinName: 'Virgo',
    symbol: '♍',
    element: 'Turab',
    modality: 'Dhu Jasadayn',
    ruler: 'mercury',
    exaltationPlanet: 'mercury',
    triplicityDay: 'venus',
    triplicityNight: 'moon',
    triplicityParticipating: 'mars',
  },
  {
    index: 6,
    arabicName: 'الميزان',
    transliteration: 'al-Mizan',
    latinName: 'Libra',
    symbol: '♎',
    element: 'Hawa',
    modality: 'Munqalib',
    ruler: 'venus',
    exaltationPlanet: 'saturn',
    triplicityDay: 'saturn',
    triplicityNight: 'mercury',
    triplicityParticipating: 'jupiter',
  },
  {
    index: 7,
    arabicName: 'العقرب',
    transliteration: 'al-\'Aqrab',
    latinName: 'Scorpio',
    symbol: '♏',
    element: 'Ma',
    modality: 'Thabit',
    ruler: 'mars',
    triplicityDay: 'venus',
    triplicityNight: 'mars',
    triplicityParticipating: 'moon',
  },
  {
    index: 8,
    arabicName: 'القوس',
    transliteration: 'al-Qaws',
    latinName: 'Sagittarius',
    symbol: '♐',
    element: 'Nar',
    modality: 'Dhu Jasadayn',
    ruler: 'jupiter',
    exaltationPlanet: 'ketu',
    triplicityDay: 'sun',
    triplicityNight: 'jupiter',
    triplicityParticipating: 'saturn',
  },
  {
    index: 9,
    arabicName: 'الجدي',
    transliteration: 'al-Jady',
    latinName: 'Capricorn',
    symbol: '♑',
    element: 'Turab',
    modality: 'Munqalib',
    ruler: 'saturn',
    exaltationPlanet: 'mars',
    triplicityDay: 'venus',
    triplicityNight: 'moon',
    triplicityParticipating: 'mars',
  },
  {
    index: 10,
    arabicName: 'الدلو',
    transliteration: 'ad-Dalw',
    latinName: 'Aquarius',
    symbol: '♒',
    element: 'Hawa',
    modality: 'Thabit',
    ruler: 'saturn',
    triplicityDay: 'saturn',
    triplicityNight: 'mercury',
    triplicityParticipating: 'jupiter',
  },
  {
    index: 11,
    arabicName: 'الحوت',
    transliteration: 'al-Hut',
    latinName: 'Pisces',
    symbol: '♓',
    element: 'Ma',
    modality: 'Dhu Jasadayn',
    ruler: 'jupiter',
    exaltationPlanet: 'venus',
    triplicityDay: 'venus',
    triplicityNight: 'mars',
    triplicityParticipating: 'moon',
  },
];

export const PLANETS_INFO: Record<PlanetKey, PlanetInfo> = {
  sun: {
    key: 'sun',
    arabicName: 'الشمس',
    transliteration: 'ash-Shams',
    symbol: '☉',
    nature: 'Sa\'d Akbar',
    temperament: 'Harr Yabis',
    gender: 'Dhakari',
    dayNight: 'Nahari',
    exaltationDegree: { sign: 0, degree: 19 }, // 19° Aries
    fallDegree: { sign: 6, degree: 19 }, // 19° Libra
    rulershipSigns: [4], // Leo
    detrimentSigns: [10], // Aquarius
    color: '#eab308',
  },
  moon: {
    key: 'moon',
    arabicName: 'القمر',
    transliteration: 'al-Qamar',
    symbol: '☽',
    nature: 'Sa\'d Asghar',
    temperament: 'Barid Ratb',
    gender: 'Unthawi',
    dayNight: 'Layli',
    exaltationDegree: { sign: 1, degree: 3 }, // 3° Taurus
    fallDegree: { sign: 7, degree: 3 }, // 3° Scorpio
    rulershipSigns: [3], // Cancer
    detrimentSigns: [9], // Capricorn
    color: '#e2e8f0',
  },
  mercury: {
    key: 'mercury',
    arabicName: 'عطارد',
    transliteration: '\'Utarid',
    symbol: '☿',
    nature: 'Mu\'tadil',
    temperament: 'Barid Yabis',
    gender: 'Dhakari',
    dayNight: 'Nahari',
    exaltationDegree: { sign: 5, degree: 15 }, // 15° Virgo
    fallDegree: { sign: 11, degree: 15 }, // 15° Pisces
    rulershipSigns: [2, 5], // Gemini, Virgo
    detrimentSigns: [8, 11], // Sagittarius, Pisces
    color: '#38bdf8',
  },
  venus: {
    key: 'venus',
    arabicName: 'الزهرة',
    transliteration: 'az-Zuhrah',
    symbol: '♀',
    nature: 'Sa\'d Asghar',
    temperament: 'Barid Ratb',
    gender: 'Unthawi',
    dayNight: 'Layli',
    exaltationDegree: { sign: 11, degree: 27 }, // 27° Pisces
    fallDegree: { sign: 5, degree: 27 }, // 27° Virgo
    rulershipSigns: [1, 6], // Taurus, Libra
    detrimentSigns: [7, 0], // Scorpio, Aries
    color: '#f472b6',
  },
  mars: {
    key: 'mars',
    arabicName: 'المريخ',
    transliteration: 'al-Marrikh',
    symbol: '♂',
    nature: 'Nahs Asghar',
    temperament: 'Harr Yabis',
    gender: 'Dhakari',
    dayNight: 'Layli',
    exaltationDegree: { sign: 9, degree: 28 }, // 28° Capricorn
    fallDegree: { sign: 3, degree: 28 }, // 28° Cancer
    rulershipSigns: [0, 7], // Aries, Scorpio
    detrimentSigns: [6, 1], // Libra, Taurus
    color: '#ef4444',
  },
  jupiter: {
    key: 'jupiter',
    arabicName: 'المشتري',
    transliteration: 'al-Mushtari',
    symbol: '♃',
    nature: 'Sa\'d Akbar',
    temperament: 'Harr Ratb',
    gender: 'Dhakari',
    dayNight: 'Nahari',
    exaltationDegree: { sign: 3, degree: 15 }, // 15° Cancer
    fallDegree: { sign: 9, degree: 15 }, // 15° Capricorn
    rulershipSigns: [8, 11], // Sagittarius, Pisces
    detrimentSigns: [2, 5], // Gemini, Virgo
    color: '#fbbf24',
  },
  saturn: {
    key: 'saturn',
    arabicName: 'زحل',
    transliteration: 'Zuhal',
    symbol: '♄',
    nature: 'Nahs Akbar',
    temperament: 'Barid Yabis',
    gender: 'Dhakari',
    dayNight: 'Nahari',
    exaltationDegree: { sign: 6, degree: 21 }, // 21° Libra
    fallDegree: { sign: 0, degree: 21 }, // 21° Aries
    rulershipSigns: [9, 10], // Capricorn, Aquarius
    detrimentSigns: [3, 4], // Cancer, Leo
    color: '#94a3b8',
  },
  rahu: {
    key: 'rahu',
    arabicName: 'الرأس (الجوزهر)',
    transliteration: 'ar-Ra\'s (al-Jawzahar)',
    symbol: '☊',
    nature: 'Sa\'d Asghar',
    temperament: 'Harr Ratb',
    gender: 'Dhakari',
    dayNight: 'Nahari',
    exaltationDegree: { sign: 2, degree: 3 }, // 3° Gemini
    fallDegree: { sign: 8, degree: 3 }, // 3° Sagittarius
    rulershipSigns: [2],
    detrimentSigns: [8],
    color: '#c084fc',
  },
  ketu: {
    key: 'ketu',
    arabicName: 'الذنب (الجوزهر)',
    transliteration: 'adh-Dhanab',
    symbol: '☋',
    nature: 'Nahs Asghar',
    temperament: 'Barid Yabis',
    gender: 'Unthawi',
    dayNight: 'Layli',
    exaltationDegree: { sign: 8, degree: 3 }, // 3° Sagittarius
    fallDegree: { sign: 2, degree: 3 }, // 3° Gemini
    rulershipSigns: [8],
    detrimentSigns: [2],
    color: '#a855f7',
  },
};

/**
 * 28 Lunar Mansions (Manazil al-Qamar)
 * Exactly 360 / 28 = 12° 51' 25.71" per mansion
 */
export const LUNAR_MANSIONS: LunarMansion[] = [
  {
    number: 1,
    arabicName: 'الشرطان',
    transliteration: 'ash-Sharatan',
    startDegree: 0,
    endDegree: 12.8571,
    starGroup: 'β & γ Arietis (Tanduk Domba)',
    temperament: 'Harr Yabis',
    fortune: 'Muntasif',
    indication: 'Awal permulaan urusan, perjalanan laut dan darat, pengobatan.',
  },
  {
    number: 2,
    arabicName: 'البطين',
    transliteration: 'al-Butayn',
    startDegree: 12.8571,
    endDegree: 25.7143,
    starGroup: 'δ, ε, ρ Arietis (Perut Domba)',
    temperament: 'Barid Yabis',
    fortune: 'Sa\'d',
    indication: 'Mencari harta terpendam, menanam pohon, perkongsian dagang.',
  },
  {
    number: 3,
    arabicName: 'الثريا',
    transliteration: 'ath-Thurayya',
    startDegree: 25.7143,
    endDegree: 38.5714,
    starGroup: 'Pleiades / Bintang Tujuh',
    temperament: 'Harr Ratb',
    fortune: 'Sa\'d',
    indication: 'Keberuntungan dalam berniaga, ilmu kimia, pernikahan agung.',
  },
  {
    number: 4,
    arabicName: 'الدبران',
    transliteration: 'ad-Dabaran',
    startDegree: 38.5714,
    endDegree: 51.4286,
    starGroup: 'α Tauri (Aldebaran)',
    temperament: 'Harr Yabis',
    fortune: 'Nahs',
    indication: 'Peringatan perselisihan, membangun benteng, waspada permusuhan.',
  },
  {
    number: 5,
    arabicName: 'الهقعة',
    transliteration: 'al-Haq\'ah',
    startDegree: 51.4286,
    endDegree: 64.2857,
    starGroup: 'λ, φ1, φ2 Orionis',
    temperament: 'Barid Ratb',
    fortune: 'Sa\'d',
    indication: 'Belajar sastra, bepergian mencari guru, berdamai dengan kawan.',
  },
  {
    number: 6,
    arabicName: 'الهنعة',
    transliteration: 'al-Han\'ah',
    startDegree: 64.2857,
    endDegree: 77.1429,
    starGroup: 'γ & ξ Geminorum (Alhena)',
    temperament: 'Harr Ratb',
    fortune: 'Sa\'d',
    indication: 'Perburuan, kemitraan, pertemuan dengan para pembesar wilayah.',
  },
  {
    number: 7,
    arabicName: 'الذراع',
    transliteration: 'adh-Dhira\'',
    startDegree: 77.1429,
    endDegree: 90.0,
    starGroup: 'α & β Geminorum (Castor & Pollux)',
    temperament: 'Harr Yabis',
    fortune: 'Sa\'d',
    indication: 'Keuntungan berlimpah, memohon hajat kepada penguasa, pelayaran.',
  },
  {
    number: 8,
    arabicName: 'النثرة',
    transliteration: 'an-Nathrah',
    startDegree: 90.0,
    endDegree: 102.8571,
    starGroup: 'Praesepe / M44 Cancri',
    temperament: 'Barid Ratb',
    fortune: 'Sa\'d',
    indication: 'Cinta kasih, menjalin tali pernikahan, penyembuhan penyakit kronis.',
  },
  {
    number: 9,
    arabicName: 'الطرف',
    transliteration: 'at-Tarf',
    startDegree: 102.8571,
    endDegree: 115.7143,
    starGroup: 'λ Leonis & κ Cancri (Mata Singa)',
    temperament: 'Harr Yabis',
    fortune: 'Nahs',
    indication: 'Hindari perjalanan jauh, baik untuk melemahkan musuh.',
  },
  {
    number: 10,
    arabicName: 'الجبهة',
    transliteration: 'al-Jabhah',
    startDegree: 115.7143,
    endDegree: 128.5714,
    starGroup: 'α, η, γ, ζ Leonis (Regulus)',
    temperament: 'Harr Yabis',
    fortune: 'Sa\'d',
    indication: 'Kemuliaan, martabat tinggi, keberanian dalam memimpin pasukan.',
  },
  {
    number: 11,
    arabicName: 'الزبرة',
    transliteration: 'az-Zubrah',
    startDegree: 128.5714,
    endDegree: 141.4286,
    starGroup: 'δ & θ Leonis (Zosma)',
    temperament: 'Harr Ratb',
    fortune: 'Sa\'d',
    indication: 'Mendirikan bangunan megah, bepergian, pelepasan tawanan.',
  },
  {
    number: 12,
    arabicName: 'الصرفة',
    transliteration: 'as-Sarfah',
    startDegree: 141.4286,
    endDegree: 154.2857,
    starGroup: 'β Leonis (Denebola)',
    temperament: 'Barid Yabis',
    fortune: 'Muntasif',
    indication: 'Pertanian, memanen hasil bumi, perubahan musim dan cuaca.',
  },
  {
    number: 13,
    arabicName: 'العواء',
    transliteration: 'al-\'Awwa',
    startDegree: 154.2857,
    endDegree: 167.1429,
    starGroup: 'β, η, γ, δ, ε Virginis',
    temperament: 'Barid Ratb',
    fortune: 'Sa\'d',
    indication: 'Pernikahan harmonis, penaburan benih, perbaikan hubungan keluarga.',
  },
  {
    number: 14,
    arabicName: 'السماك الأعزل',
    transliteration: 'as-Simak al-A\'zal',
    startDegree: 167.1429,
    endDegree: 180.0,
    starGroup: 'α Virginis (Spica)',
    temperament: 'Harr Ratb',
    fortune: 'Sa\'d',
    indication: 'Kemakmuran spiritual, ilmu falak dan hikmah, keberkahan pelayaran.',
  },
  {
    number: 15,
    arabicName: 'الغفر',
    transliteration: 'al-Ghafr',
    startDegree: 180.0,
    endDegree: 192.8571,
    starGroup: 'ι, κ, λ Virginis',
    temperament: 'Barid Yabis',
    fortune: 'Sa\'d',
    indication: 'Menyimpan rahasia, menjaga pusaka, mencari petunjuk batin.',
  },
  {
    number: 16,
    arabicName: 'الزبانا',
    transliteration: 'az-Zubana',
    startDegree: 192.8571,
    endDegree: 205.7143,
    starGroup: 'α & β Librae (Zubenelgenubi)',
    temperament: 'Harr Yabis',
    fortune: 'Muntasif',
    indication: 'Perniagaan seimbang, penimbangan hak, waspada sengketa pasar.',
  },
  {
    number: 17,
    arabicName: 'الإكليل',
    transliteration: 'al-Iklil',
    startDegree: 205.7143,
    endDegree: 218.5714,
    starGroup: 'β, δ, π Scorpii (Mahkota Kalajengking)',
    temperament: 'Barid Ratb',
    fortune: 'Sa\'d',
    indication: 'Membangun persekutuan kokoh, perlindungan diri dari sihir.',
  },
  {
    number: 18,
    arabicName: 'القلب',
    transliteration: 'al-Qalb',
    startDegree: 218.5714,
    endDegree: 231.4286,
    starGroup: 'α Scorpii (Antares / Qalb al-\'Aqrab)',
    temperament: 'Harr Yabis',
    fortune: 'Nahs',
    indication: 'Waspada tipu daya, pertempuran rahasia, penguatan jiwa ketahanan.',
  },
  {
    number: 19,
    arabicName: 'الشولة',
    transliteration: 'ash-Shawlah',
    startDegree: 231.4286,
    endDegree: 244.2857,
    starGroup: 'λ & υ Scorpii (Shaula)',
    temperament: 'Harr Yabis',
    fortune: 'Nahs',
    indication: 'Penggalian parit, serangan kilat, hindari memulai pernikahan.',
  },
  {
    number: 20,
    arabicName: 'النعائم',
    transliteration: 'an-Na\'a\'im',
    startDegree: 244.2857,
    endDegree: 257.1429,
    starGroup: 'γ, δ, ε, η, σ, ζ, φ, τ Sagittarii',
    temperament: 'Harr Ratb',
    fortune: 'Sa\'d',
    indication: 'Ternak berkembang pesat, perburuan hewan jinak, bepergian aman.',
  },
  {
    number: 21,
    arabicName: 'البلدة',
    transliteration: 'al-Baldah',
    startDegree: 257.1429,
    endDegree: 270.0,
    starGroup: 'Wilayah kosong di antara bintang Sagitarius',
    temperament: 'Barid Yabis',
    fortune: 'Muntasif',
    indication: 'Mendirikan pemukiman baru, peletakan batu fondasi kota.',
  },
  {
    number: 22,
    arabicName: 'سعد الذابح',
    transliteration: 'Sa\'d adh-Dhabih',
    startDegree: 270.0,
    endDegree: 282.8571,
    starGroup: 'α & β Capricorni (Dabih)',
    temperament: 'Barid Yabis',
    fortune: 'Muntasif',
    indication: 'Pelepasan nadzar, pengorbanan hewan, pengobatan penyakit dingin.',
  },
  {
    number: 23,
    arabicName: 'سعد بلع',
    transliteration: 'Sa\'d Bula\'',
    startDegree: 282.8571,
    endDegree: 295.7143,
    starGroup: 'ε, μ, ν Aquarii (Albali)',
    temperament: 'Barid Ratb',
    fortune: 'Sa\'d',
    indication: 'Pengeboran sumur air, irigasi sawah ladang, pengobatan herbal.',
  },
  {
    number: 24,
    arabicName: 'سعد السعود',
    transliteration: 'Sa\'d as-Su\'ud',
    startDegree: 295.7143,
    endDegree: 308.5714,
    starGroup: 'β & ξ Aquarii',
    temperament: 'Harr Ratb',
    fortune: 'Sa\'d',
    indication: 'Puncak keberuntungan agung, pernikahan berkah, kemakmuran dinasti.',
  },
  {
    number: 25,
    arabicName: 'سعد الأخبية',
    transliteration: 'Sa\'d al-Akhbiyah',
    startDegree: 308.5714,
    endDegree: 321.4286,
    starGroup: 'γ, π, ζ, η Aquarii',
    temperament: 'Barid Ratb',
    fortune: 'Sa\'d',
    indication: 'Membongkar rahasia kuno, penanaman pohon buah, pemulihan luka.',
  },
  {
    number: 26,
    arabicName: 'الفرغ المقدم',
    transliteration: 'al-Fargh al-Muqaddam',
    startDegree: 321.4286,
    endDegree: 334.2857,
    starGroup: 'α & β Pegasi (Markab & Scheat)',
    temperament: 'Harr Yabis',
    fortune: 'Sa\'d',
    indication: 'Perjalanan ziarah spiritual, pembangunan perahu, persahabatan.',
  },
  {
    number: 27,
    arabicName: 'الفرغ المؤخر',
    transliteration: 'al-Fargh al-Mu\'akhkhar',
    startDegree: 334.2857,
    endDegree: 347.1429,
    starGroup: 'γ Pegasi & α Andromedae (Algenib)',
    temperament: 'Barid Ratb',
    fortune: 'Sa\'d',
    indication: 'Penggalian saluran air, penangkapan ikan, penyelesaian persengketaan.',
  },
  {
    number: 28,
    arabicName: 'بطن الحوت / الرشاء',
    transliteration: 'Batn al-Hut (ar-Risha)',
    startDegree: 347.1429,
    endDegree: 360.0,
    starGroup: 'β Andromedae (Mirach)',
    temperament: 'Barid Ratb',
    fortune: 'Sa\'d',
    indication: 'Penutup siklus, keselamatan dalam bahaya, kesuksesan perdagangan lintas batas.',
  },
];

/**
 * Classical Terms (al-Hudud) according to the Egyptian / Sindhind system
 * Sign terms: array of [PlanetKey, degreeLimit]
 */
export const CLASSICAL_TERMS: Record<number, [PlanetKey, number][]> = {
  0: [['jupiter', 6], ['venus', 12], ['mercury', 20], ['mars', 25], ['saturn', 30]], // Aries
  1: [['venus', 8], ['mercury', 14], ['jupiter', 22], ['saturn', 27], ['mars', 30]], // Taurus
  2: [['mercury', 6], ['jupiter', 12], ['venus', 17], ['mars', 24], ['saturn', 30]], // Gemini
  3: [['mars', 7], ['venus', 13], ['mercury', 19], ['jupiter', 26], ['saturn', 30]], // Cancer
  4: [['jupiter', 6], ['venus', 11], ['saturn', 18], ['mercury', 24], ['mars', 30]], // Leo
  5: [['mercury', 7], ['venus', 17], ['jupiter', 21], ['mars', 28], ['saturn', 30]], // Virgo
  6: [['saturn', 6], ['mercury', 14], ['jupiter', 21], ['venus', 28], ['mars', 30]], // Libra
  7: [['mars', 7], ['venus', 11], ['mercury', 19], ['jupiter', 24], ['saturn', 30]], // Scorpio
  8: [['jupiter', 12], ['venus', 17], ['mercury', 21], ['saturn', 26], ['mars', 30]], // Sagittarius
  9: [['mercury', 7], ['jupiter', 14], ['venus', 22], ['saturn', 26], ['mars', 30]], // Capricorn
  10: [['mercury', 7], ['venus', 13], ['jupiter', 20], ['mars', 25], ['saturn', 30]], // Aquarius
  11: [['venus', 12], ['jupiter', 16], ['mercury', 19], ['mars', 28], ['saturn', 30]], // Pisces
};

/**
 * Decans / Faces (al-Wujuh) according to Chaldean order (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon)
 */
export const CLASSICAL_DECANS: PlanetKey[] = [
  'mars', 'sun', 'venus', // Aries 0-10, 10-20, 20-30
  'mercury', 'moon', 'saturn', // Taurus
  'jupiter', 'mars', 'sun', // Gemini
  'venus', 'mercury', 'moon', // Cancer
  'saturn', 'jupiter', 'mars', // Leo
  'sun', 'venus', 'mercury', // Virgo
  'moon', 'saturn', 'jupiter', // Libra
  'mars', 'sun', 'venus', // Scorpio
  'mercury', 'moon', 'saturn', // Sagittarius
  'jupiter', 'mars', 'sun', // Capricorn
  'venus', 'mercury', 'moon', // Aquarius
  'saturn', 'jupiter', 'mars', // Pisces
];

/**
 * Format raw degrees (0-360) into CelestialCoordinate
 */
export function formatDegree(deg: number): CelestialCoordinate {
  const normalized = ((deg % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const signDegreeRaw = normalized - signIndex * 30;
  const signDegree = Math.floor(signDegreeRaw);
  const minutesRaw = (signDegreeRaw - signDegree) * 60;
  const minutes = Math.floor(minutesRaw);
  const seconds = Math.round((minutesRaw - minutes) * 60);

  return {
    degrees: Math.floor(normalized),
    minutes: Math.floor((normalized % 1) * 60),
    seconds: Math.round(((normalized % 1) * 60 - Math.floor((normalized % 1) * 60)) * 60),
    totalDegrees: normalized,
    signIndex,
    signDegree,
    signDegreeMinutes: minutes,
  };
}

/**
 * Find Lunar Mansion corresponding to celestial degree
 */
export function getLunarMansion(degree: number): LunarMansion {
  const normalized = ((degree % 360) + 360) % 360;
  const mansionIndex = Math.floor(normalized / (360 / 28));
  return LUNAR_MANSIONS[Math.min(mansionIndex, 27)];
}

/**
 * Get Term ruler (al-Hadd) for sign and degree
 */
export function getTermRuler(signIndex: number, degreeInSign: number): string {
  const terms = CLASSICAL_TERMS[signIndex] || CLASSICAL_TERMS[0];
  for (const [planet, limit] of terms) {
    if (degreeInSign < limit) {
      return PLANETS_INFO[planet].transliteration;
    }
  }
  return PLANETS_INFO[terms[terms.length - 1][0]].transliteration;
}

/**
 * Get Decan/Face ruler (al-Wajh)
 */
export function getDecanRuler(signIndex: number, degreeInSign: number): string {
  const decanIndex = signIndex * 3 + Math.min(Math.floor(degreeInSign / 10), 2);
  const planetKey = CLASSICAL_DECANS[decanIndex % CLASSICAL_DECANS.length];
  return PLANETS_INFO[planetKey].transliteration;
}

/**
 * Compute Planetary Dignity
 */
export function calculateDignity(
  planetKey: PlanetKey,
  coord: CelestialCoordinate,
  dayNight: 'Nahari' | 'Layli'
): PlanetaryDignity {
  const info = PLANETS_INFO[planetKey];
  const isDomicile = info.rulershipSigns.includes(coord.signIndex);
  const isDetriment = info.detrimentSigns.includes(coord.signIndex);
  const isExalted = info.exaltationDegree.sign === coord.signIndex;
  const isExactExaltation = isExalted && Math.abs(coord.signDegree - info.exaltationDegree.degree) <= 1;
  const isFall = info.fallDegree.sign === coord.signIndex;

  let totalScore = 0;
  const descriptions: string[] = [];

  if (isDomicile) {
    totalScore += 5;
    descriptions.push('في بيته (Fi Baytihi - Penguasa Domicile)');
  }
  if (isExalted) {
    totalScore += 4;
    descriptions.push(
      isExactExaltation
        ? 'في شرفه الأقصى (Fi Sharafihi al-Aqsa - Puncak Eksaltasi)'
        : 'في شرفه (Fi Sharafihi - Eksaltasi)'
    );
  }
  if (isDetriment) {
    totalScore -= 5;
    descriptions.push('في وباله (Fi Wabalihi - Detriment)');
  }
  if (isFall) {
    totalScore -= 4;
    descriptions.push('في هبوطه (Fi Hubutihi - Fall/Kejatuhan)');
  }

  // Triplicity check
  const sign = ZODIAC_SIGNS[coord.signIndex];
  const triplicityRuler = dayNight === 'Nahari' ? sign.triplicityDay : sign.triplicityNight;
  if (triplicityRuler === planetKey) {
    totalScore += 3;
    descriptions.push('صاحب المثلثة (Sahib al-Muthallathah)');
  }

  return {
    isDomicile,
    isExalted,
    isExactExaltation,
    isFall,
    isDetriment,
    totalScore,
    description: descriptions.length > 0 ? descriptions.join(' • ') : 'حائر / معتدل (Peregrine)',
  };
}

/**
 * Calculate historical ephemeris from Julian Day Number (JDN)
 * Based on Zij as-Sindhind mean motions and sinusoidal equations of center.
 * Epoch: Hijra epoch JDN 1948439 (16 July 622 CE), Yazdajird epoch JDN 1952063.
 */
export function calculateSindhindPositions(
  jdn: number,
  latitude: number = 33.3152, // Baghdad default latitude for Zij as-Sindhind
  longitude: number = 44.3661
): {
  positions: Record<PlanetKey, PlanetaryPosition>;
  ascendant: CelestialCoordinate;
  midheaven: CelestialCoordinate;
  houses: AstrologicalHouse[];
  aspects: AspectRelation[];
} {
  // Days elapsed since J2000.0 (JDN 2451545.0)
  const d = jdn - 2451545.0;
  const T = d / 36525.0; // Julian centuries

  // 1. Sun (ash-Shams)
  const sunMean = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
  const sunAnom = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360;
  const sunAnomRad = (sunAnom * Math.PI) / 180;
  // Sindhind equation of center for Sun (approx 1° 55' = 1.914° max)
  const sunEqCenter =
    (1.914602 - 0.004817 * T) * Math.sin(sunAnomRad) +
    0.019993 * Math.sin(2 * sunAnomRad);
  const sunTrue = (sunMean + sunEqCenter + 360) % 360;

  // 2. Moon (al-Qamar)
  const moonMean = (218.3165 + 481267.8813 * T) % 360;
  const moonAnom = (134.9634 + 477198.8675 * T) % 360;
  const moonAnomRad = (moonAnom * Math.PI) / 180;
  const moonEqCenter = 6.289 * Math.sin(moonAnomRad) + 1.274 * Math.sin(2 * (moonMean - sunTrue) * Math.PI / 180 - moonAnomRad);
  const moonTrue = (moonMean + moonEqCenter + 360) % 360;

  // 3. Rahu / Ketu (ar-Ra's & adh-Dhanab - Moon's North & South Node)
  // Retrograde motion: ~19.34° per year
  const nodeMean = (125.0445 - 1934.1363 * T + 0.002075 * T * T + 360000) % 360;
  const rahuTrue = nodeMean;
  const ketuTrue = (rahuTrue + 180) % 360;

  // 4. Mercury ('Utarid)
  const mercMean = (sunMean + (d * 4.0923344) % 360 + 360) % 360;
  const mercAnom = ((d * 4.0923344) % 360 + 174.0 + 360) % 360;
  const mercAnomRad = (mercAnom * Math.PI) / 180;
  const mercEq = 22.5 * Math.sin(mercAnomRad) * 0.9;
  const mercTrue = (sunTrue + mercEq + 360) % 360;

  // 5. Venus (az-Zuhrah)
  const venMean = sunMean;
  const venAnom = ((d * 1.6021302) % 360 + 50.0 + 360) % 360;
  const venAnomRad = (venAnom * Math.PI) / 180;
  const venEq = 46.5 * Math.sin(venAnomRad) * 0.95;
  const venTrue = (sunTrue + venEq + 360) % 360;

  // 6. Mars (al-Marrikh)
  const marsMean = (355.433 + 19140.299 * T) % 360;
  const marsAnom = (19.373 + 19139.858 * T) % 360;
  const marsAnomRad = (marsAnom * Math.PI) / 180;
  const marsEq = 10.69 * Math.sin(marsAnomRad);
  const marsTrue = (marsMean + marsEq + 360) % 360;

  // 7. Jupiter (al-Mushtari)
  const jupMean = (34.351 + 3034.906 * T) % 360;
  const jupAnom = (20.02 + 3034.69 * T) % 360;
  const jupAnomRad = (jupAnom * Math.PI) / 180;
  const jupEq = 5.55 * Math.sin(jupAnomRad);
  const jupTrue = (jupMean + jupEq + 360) % 360;

  // 8. Saturn (Zuhal)
  const satMean = (50.077 + 1222.114 * T) % 360;
  const satAnom = (317.02 + 1221.55 * T) % 360;
  const satAnomRad = (satAnom * Math.PI) / 180;
  const satEq = 6.35 * Math.sin(satAnomRad);
  const satTrue = (satMean + satEq + 360) % 360;

  // Local Sidereal Time and Ascendant calculation
  // GMST at 0h UT
  const utHours = ((jdn + 0.5) % 1) * 24;
  const gmst = (280.46061837 + 360.98564736629 * d + 0.000387933 * T * T) % 360;
  const lmst = (gmst + longitude + 360) % 360;
  const lmstRad = (lmst * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;
  const obliq = (23.43929 - 0.0130042 * T) * (Math.PI / 180);

  // Ascendant formula (al-Tali')
  const y = -Math.cos(lmstRad);
  const x = Math.sin(lmstRad) * Math.cos(obliq) + Math.tan(latRad) * Math.sin(obliq);
  let ascendantDeg = (Math.atan2(y, x) * 180) / Math.PI + 90;
  ascendantDeg = (ascendantDeg + 360) % 360;

  // Midheaven (Wast as-Sama' / MC)
  const mcY = Math.sin(lmstRad);
  const mcX = Math.cos(lmstRad) * Math.cos(obliq);
  let mcDeg = (Math.atan2(mcY, mcX) * 180) / Math.PI;
  mcDeg = (mcDeg + 360) % 360;

  const ascCoord = formatDegree(ascendantDeg);
  const mcCoord = formatDegree(mcDeg);

  // Day or Night chart? Sun relative to horizon (Houses 7-12 are above horizon)
  const sunDiffAsc = (sunTrue - ascendantDeg + 360) % 360;
  const isDayChart: 'Nahari' | 'Layli' = sunDiffAsc >= 180 ? 'Nahari' : 'Layli';

  // Build raw longitudes list
  const rawLongitudes: Record<PlanetKey, { trueLong: number; meanLong: number; dailySpeed: number }> = {
    sun: { trueLong: sunTrue, meanLong: sunMean, dailySpeed: 0.9856 },
    moon: { trueLong: moonTrue, meanLong: moonMean, dailySpeed: 13.176 },
    mercury: { trueLong: mercTrue, meanLong: mercMean, dailySpeed: 1.1 },
    venus: { trueLong: venTrue, meanLong: venMean, dailySpeed: 1.2 },
    mars: { trueLong: marsTrue, meanLong: marsMean, dailySpeed: 0.524 },
    jupiter: { trueLong: jupTrue, meanLong: jupMean, dailySpeed: 0.083 },
    saturn: { trueLong: satTrue, meanLong: satMean, dailySpeed: 0.033 },
    rahu: { trueLong: rahuTrue, meanLong: nodeMean, dailySpeed: -0.0529 },
    ketu: { trueLong: ketuTrue, meanLong: (nodeMean + 180) % 360, dailySpeed: -0.0529 },
  };

  // 12 Equal Houses based on Ascendant (traditional method favored in ancient Zij manuals)
  const houses: AstrologicalHouse[] = [];
  const houseMeanings = [
    { name: 'الطالع: النفس والحياة', trans: 'at-Tali\': an-Nafs wa al-Hayat', latin: '1st: Life & Vitality', sig: 'Fisik, rupa, watak dasar dan umur' },
    { name: 'بيت المال والمعاش', trans: 'Bayt al-Mal wa al-Ma\'ash', latin: '2nd: Wealth & Resources', sig: 'Harta benda, rezeki, perolehan niaga' },
    { name: 'بيت الإخوة والأسفار القريبة', trans: 'Bayt al-Ikhwah wa al-Asfar', latin: '3rd: Siblings & Journeys', sig: 'Saudara, kerabat, musafir pendek' },
    { name: 'بيت الآباء والعواقب', trans: 'Bayt al-Aba\' wa al-\'Awaqib', latin: '4th: Parents & Roots', sig: 'Ayah, tanah pusaka, akhir segala perkara' },
    { name: 'بيت الأولاد والسرور', trans: 'Bayt al-Awlad wa as-Surur', latin: '5th: Children & Joy', sig: 'Keturunan, kegembiraan, hadiah dan utusan' },
    { name: 'بيت الأسقام والعبيد', trans: 'Bayt al-Asqam wa al-\'Abid', latin: '6th: Illness & Labors', sig: 'Penyakit, keletihan, pembantu dan pelayan' },
    { name: 'بيت الزوج والخصوم', trans: 'Bayt az-Zawj wa al-Khusum', latin: '7th: Marriage & Rivals', sig: 'Pasangan hidup, pernikahan, perselisihan terbuka' },
    { name: 'بيت الموت والمواريث', trans: 'Bayt al-Mawt wa al-Mawarith', latin: '8th: Mortality & Inheritance', sig: 'Kematian, harta warisan, ketakutan batin' },
    { name: 'بيت السفر والدين والعلم', trans: 'Bayt as-Safar wa ad-Din', latin: '9th: Voyages & Religion', sig: 'Pelayaran jauh, agama, falsafah dan hikmah' },
    { name: 'وسط السماء: الملك والسلطان', trans: 'Wast as-Sama\': al-Mulk', latin: '10th: Authority & Honor', sig: 'Jabatan, raja, kehormatan dan profesi' },
    { name: 'بيت الرجاء والأصدقاء', trans: 'Bayt ar-Raja\' wa al-Asdiqa\'', latin: '11th: Hopes & Friends', sig: 'Harapan mulia, sahabat karib, dukungan petinggi' },
    { name: 'بيت الأعداء والغموم', trans: 'Bayt al-A\'da\' wa al-Ghumum', latin: '12th: Enemies & Sorrows', sig: 'Musuh tersembunyi, penjara, duka nestapa' },
  ];

  for (let i = 0; i < 12; i++) {
    const cusp = (ascendantDeg + i * 30) % 360;
    const cCoord = formatDegree(cusp);
    const sign = ZODIAC_SIGNS[cCoord.signIndex];
    houses.push({
      number: i + 1,
      arabicName: houseMeanings[i].name,
      transliteration: houseMeanings[i].trans,
      latinName: houseMeanings[i].latin,
      cuspDegree: cusp,
      signIndex: cCoord.signIndex,
      signDegree: cCoord.signDegree,
      signDegreeMinutes: cCoord.signDegreeMinutes,
      signArabic: sign.arabicName,
      signLatin: sign.latinName,
      signifactor: houseMeanings[i].sig,
      traditionalMeaning: houseMeanings[i].sig,
      planetsInside: [],
    });
  }

  // Calculate planetary positions & assign to houses
  const positions: Partial<Record<PlanetKey, PlanetaryPosition>> = {};

  (Object.keys(PLANETS_INFO) as PlanetKey[]).forEach((key) => {
    const raw = rawLongitudes[key];
    const coord = formatDegree(raw.trueLong);
    const mansion = getLunarMansion(raw.trueLong);
    const dignity = calculateDignity(key, coord, isDayChart);
    const termRuler = getTermRuler(coord.signIndex, coord.signDegree);
    const decanRuler = getDecanRuler(coord.signIndex, coord.signDegree);

    // Determine House Number
    const diffFromAsc = (raw.trueLong - ascendantDeg + 360) % 360;
    const houseNumber = Math.floor(diffFromAsc / 30) + 1;
    if (houses[houseNumber - 1]) {
      houses[houseNumber - 1].planetsInside.push(key);
    }

    // Combustion (Ihtiraq) - within 8°30' of Sun (except Sun itself, Rahu, Ketu)
    let isCombust = false;
    let isUnderBeams = false;
    if (key !== 'sun' && key !== 'rahu' && key !== 'ketu') {
      const distFromSun = Math.abs((raw.trueLong - sunTrue + 180 + 360) % 360 - 180);
      isCombust = distFromSun <= 8.5;
      isUnderBeams = distFromSun > 8.5 && distFromSun <= 15.0;
    }

    // Retrograde check
    const isRetrograde = key === 'rahu' || key === 'ketu' ? true : raw.dailySpeed < 0;

    positions[key] = {
      planet: PLANETS_INFO[key],
      meanLongitude: raw.meanLong,
      trueLongitude: raw.trueLong,
      coordinate: coord,
      dailyMotion: raw.dailySpeed,
      isRetrograde,
      isStationary: Math.abs(raw.dailySpeed) < 0.01,
      isCombust,
      isUnderBeams,
      dignity,
      termRuler,
      decanRuler,
      houseNumber,
      lunarMansion: mansion,
    };
  });

  // Calculate Aspects between planets
  const aspects: AspectRelation[] = [];
  const planetKeys = Object.keys(positions) as PlanetKey[];

  const classicalAspects: {
    type: AspectRelation['aspectType'];
    arabic: string;
    name: string;
    angle: number;
    orb: number;
    nature: AspectRelation['nature'];
  }[] = [
    { type: 'qiran', arabic: 'مقارنة (قران)', name: 'Conjunction', angle: 0, orb: 8, nature: 'Mu\'tadil' },
    { type: 'tasdis', arabic: 'تسديس', name: 'Sextile', angle: 60, orb: 6, nature: 'Sa\'d' },
    { type: 'tarbi', arabic: 'تربيع', name: 'Square', angle: 90, orb: 7, nature: 'Nahs' },
    { type: 'tathlith', arabic: 'تثليث', name: 'Trine', angle: 120, orb: 8, nature: 'Sa\'d' },
    { type: 'muqabalah', arabic: 'مقابلة', name: 'Opposition', angle: 180, orb: 8, nature: 'Nahs' },
  ];

  for (let i = 0; i < planetKeys.length; i++) {
    for (let j = i + 1; j < planetKeys.length; j++) {
      const pA = planetKeys[i];
      const pB = planetKeys[j];
      const longA = positions[pA]!.trueLongitude;
      const longB = positions[pB]!.trueLongitude;
      const angle = Math.abs((longA - longB + 180 + 360) % 360 - 180);

      for (const asp of classicalAspects) {
        const diff = Math.abs(angle - asp.angle);
        if (diff <= asp.orb) {
          aspects.push({
            planetA: pA,
            planetB: pB,
            aspectType: asp.type,
            aspectArabic: asp.arabic,
            aspectName: asp.name,
            exactAngle: asp.angle,
            actualAngle: Math.round(angle * 10) / 10,
            orbDifference: Math.round(diff * 10) / 10,
            isApplying: true,
            nature: asp.nature,
          });
          break;
        }
      }
    }
  }

  return {
    positions: positions as Record<PlanetKey, PlanetaryPosition>,
    ascendant: ascCoord,
    midheaven: mcCoord,
    houses,
    aspects,
  };
}

/**
 * Classical Astrological Interpretation Synthesizer
 * Formulates classical verdicts based on the rules in Zij as-Sindhind and Qasida fi 'Ilm an-Nujum
 */
export function generateSindhindHoroscopeAnalysis(
  chartData: ReturnType<typeof calculateSindhindPositions>
): {
  overviewArabic: string;
  overviewId: string;
  temperamentAnalysis: string;
  planetaryRulersSummary: { title: string; desc: string }[];
  cantoVerseRef: string;
} {
  const sun = chartData.positions.sun;
  const moon = chartData.positions.moon;
  const jupiter = chartData.positions.jupiter;
  const saturn = chartData.positions.saturn;
  const asc = chartData.ascendant;
  const ascSign = ZODIAC_SIGNS[asc.signIndex];

  // Element breakdown
  const elementsCount = { Nar: 0, Turab: 0, Hawa: 0, Ma: 0 };
  Object.values(chartData.positions).forEach((pos) => {
    const s = ZODIAC_SIGNS[pos.coordinate.signIndex];
    elementsCount[s.element]++;
  });

  const dominantElement = Object.entries(elementsCount).sort((a, b) => b[1] - a[1])[0][0] as
    | 'Nar'
    | 'Turab'
    | 'Hawa'
    | 'Ma';

  const mizajMap = {
    Nar: 'صفراوي حار يابس (Kolerik / Api: dinamis, tegas, pemberani)',
    Turab: 'سوداوي بارد يابس (Melankolik / Tanah: analitis, teguh, teliti)',
    Hawa: 'دموي حار رطب (Sanguinis / Udara: komunikatif, cerdas, bersahabat)',
    Ma: 'بلغمي بارد رطب (Flegmatik / Air: peka rasa, intuitif, sabar)',
  };

  const overviewArabic = `إن طالع هذه الهيئة الفلكية هو ${ascSign.arabicName} (${ascSign.transliteration}) بدرجة ${asc.signDegree}° و${asc.signDegreeMinutes}'، وصاحب الطالع هو كوكب ${PLANETS_INFO[ascSign.ruler].arabicName}. وحيث إن القمر نازل في منزلة ${moon.lunarMansion.arabicName} (${moon.lunarMansion.transliteration}) والشمس في برج ${ZODIAC_SIGNS[sun.coordinate.signIndex].arabicName}، فإن الهيئة تشهد على طباع ${dominantElement === 'Nar' ? 'نارية' : dominantElement === 'Turab' ? 'ترابية' : dominantElement === 'Hawa' ? 'هوائية' : 'مائية'}.`;

  const overviewId = `Berdasarkan kaidah hisab Zij as-Sindhind, rasi terbit (At-Tali' / Ascendant) berada pada rasi ${ascSign.latinName} (${ascSign.arabicName}) pada koordinat ${asc.signDegree}° ${asc.signDegreeMinutes}'. Penguasa rasi terbit adalah ${PLANETS_INFO[ascSign.ruler].transliteration}. Sang Surya bersemayam di rasi ${ZODIAC_SIGNS[sun.coordinate.signIndex].latinName} (${ZODIAC_SIGNS[sun.coordinate.signIndex].arabicName}), sedangkan Sang Rembulan menempati Manzil ke-${moon.lunarMansion.number}: ${moon.lunarMansion.transliteration} (${moon.lunarMansion.arabicName}) yang berwatak ${moon.lunarMansion.fortune === 'Sa\'d' ? 'Maha Berkah (Sa\'d)' : moon.lunarMansion.fortune === 'Nahs' ? 'Waspada (Nahs)' : 'Netral (Muntasif)'}.`;

  const planetaryRulersSummary = [
    {
      title: `صاحب الطالع (${PLANETS_INFO[ascSign.ruler].transliteration}) - Penguasa Ascendant`,
      desc: `Kesejahteraan diri dan fisik dipandu oleh ${PLANETS_INFO[ascSign.ruler].transliteration} yang berkedudukan di rasi ${ZODIAC_SIGNS[chartData.positions[ascSign.ruler].coordinate.signIndex].latinName} (Rumah ke-${chartData.positions[ascSign.ruler].houseNumber}). Status martabat: ${chartData.positions[ascSign.ruler].dignity.description}.`,
    },
    {
      title: `منزلة القمر (${moon.lunarMansion.transliteration}) - Lunar Mansion`,
      desc: `Rembulan bersemayam pada bintang gugus ${moon.lunarMansion.starGroup}. Teks Qasida an-Nujum menyebutkan: "${moon.lunarMansion.indication}".`,
    },
    {
      title: `السعد الأكبر (Al-Mushtari / Jupiter)`,
      desc: `Jupiter menempati rasi ${ZODIAC_SIGNS[jupiter.coordinate.signIndex].latinName} pada Rumah ke-${jupiter.houseNumber}. ${jupiter.dignity.isExalted ? 'Mencapai puncak kemuliaan (Sharaf) yang membawa kearifan besar dan keberlimpahan rezeki.' : jupiter.dignity.isDomicile ? 'Kuat di persemayamannya sendiri mengindikasikan pertolongan kebaikan.' : 'Memberikan pengaruh kebajikan dan ilmu hikmah.'}`,
    },
    {
      title: `النحس الأكبر (Zuhal / Saturnus)`,
      desc: `Saturnus berada di rasi ${ZODIAC_SIGNS[saturn.coordinate.signIndex].latinName} pada Rumah ke-${saturn.houseNumber}. ${saturn.dignity.isFall ? 'Mengalami kejatuhan (Hubut), memerlukan ketabahan dalam memikul tanggung jawab dan ujian kesabaran.' : saturn.dignity.isExalted ? 'Terangkat di rasi timbangan (Mizan) memberikan keadilan hukum yang kokoh.' : 'Menguji keteguhan niat dan kedisiplinan hidup.'}`,
    },
  ];

  const cantoVerseRef = `«وإذا نظرت إلى الطوالع فاعتبر • بالشمس والقمر المنير الأزهرِ / واعلم بأن السند هند أصوله • تبدي مسير الفلك بالتحقيقِ» (من بحر الرجز في قصيدة علم النجوم)`;

  return {
    overviewArabic,
    overviewId,
    temperamentAnalysis: mizajMap[dominantElement],
    planetaryRulersSummary,
    cantoVerseRef,
  };
}
