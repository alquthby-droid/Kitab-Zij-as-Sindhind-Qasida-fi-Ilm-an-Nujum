/**
 * Types and interfaces for the Zij as-Sindhind and Qasida fi 'Ilm an-Nujum application
 */

export type ThemeMode = 'night' | 'parchment';

export interface CelestialCoordinate {
  degrees: number;
  minutes: number;
  seconds: number;
  totalDegrees: number; // 0 to 360
  signIndex: number; // 0 to 11 (Aries to Pisces)
  signDegree: number; // 0 to 30 within sign
  signDegreeMinutes: number;
}

export type PlanetKey =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'rahu' // North Node (ar-Ra's)
  | 'ketu'; // South Node (adh-Dhanab)

export interface PlanetInfo {
  key: PlanetKey;
  arabicName: string;
  transliteration: string;
  symbol: string;
  nature: 'Sa\'d Akbar' | 'Sa\'d Asghar' | 'Nahs Akbar' | 'Nahs Asghar' | 'Mu\'tadil';
  temperament: 'Harr Yabis' | 'Barid Ratb' | 'Harr Ratb' | 'Barid Yabis'; // Hot-Dry, Cold-Moist, etc.
  gender: 'Dhakari' | 'Unthawi'; // Masculine / Feminine
  dayNight: 'Nahari' | 'Layli'; // Diurnal / Nocturnal
  exaltationDegree: { sign: number; degree: number };
  fallDegree: { sign: number; degree: number };
  rulershipSigns: number[];
  detrimentSigns: number[];
  color: string;
}

export interface PlanetaryPosition {
  planet: PlanetInfo;
  meanLongitude: number; // al-wasat
  trueLongitude: number; // al-markaz al-mu'addal
  coordinate: CelestialCoordinate;
  dailyMotion: number; // degrees per day
  isRetrograde: boolean; // ruju'
  isStationary: boolean; // iqamah
  isCombust: boolean; // ihtiraq (within ~8.5° of Sun)
  isUnderBeams: boolean; // tahta ash-shu'a' (within 15° of Sun)
  dignity: PlanetaryDignity;
  termRuler: string; // al-hadd
  decanRuler: string; // al-wajh
  houseNumber: number; // 1 to 12
  lunarMansion: LunarMansion;
}

export interface PlanetaryDignity {
  isDomicile: boolean; // bayt
  isExalted: boolean; // sharaf
  isExactExaltation: boolean;
  isFall: boolean; // hubut
  isDetriment: boolean; // wabal
  totalScore: number;
  description: string;
}

export interface ZodiacSign {
  index: number;
  arabicName: string;
  transliteration: string;
  latinName: string;
  symbol: string;
  element: 'Nar' | 'Turab' | 'Hawa' | 'Ma'; // Fire, Earth, Air, Water
  modality: 'Munqalib' | 'Thabit' | 'Dhu Jasadayn'; // Cardinal, Fixed, Mutable
  ruler: PlanetKey;
  exaltationPlanet?: PlanetKey;
  triplicityDay: PlanetKey;
  triplicityNight: PlanetKey;
  triplicityParticipating: PlanetKey;
}

export interface LunarMansion {
  number: number; // 1 to 28
  arabicName: string;
  transliteration: string;
  startDegree: number;
  endDegree: number;
  starGroup: string;
  temperament: string;
  fortune: 'Sa\'d' | 'Nahs' | 'Muntasif';
  indication: string;
}

export interface AstrologicalHouse {
  number: number; // 1 to 12
  arabicName: string;
  transliteration: string;
  latinName: string;
  cuspDegree: number;
  signIndex: number;
  signDegree: number;
  signDegreeMinutes: number;
  signArabic: string;
  signLatin: string;
  signifactor: string;
  traditionalMeaning: string;
  planetsInside: PlanetKey[];
}

export interface AspectRelation {
  planetA: PlanetKey;
  planetB: PlanetKey;
  aspectType: 'qiran' | 'tasdis' | 'tarbi' | 'tathlith' | 'muqabalah';
  aspectArabic: string;
  aspectName: string;
  exactAngle: number;
  actualAngle: number;
  orbDifference: number;
  isApplying: boolean;
  nature: 'Sa\'d' | 'Nahs' | 'Mu\'tadil';
}

export interface HistoricalDateInfo {
  gregorian: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  julian: {
    year: number;
    month: number;
    day: number;
  };
  hijri: {
    year: number;
    month: number;
    monthNameArabic: string;
    monthNameLatin: string;
    day: number;
    isLeapYear: boolean;
  };
  yazdajird: {
    year: number;
    month: number;
    monthNamePersian: string;
    day: number;
  };
  seleucid: {
    year: number;
    monthNameSyriac: string;
    day: number;
  };
  nabonassar: {
    year: number;
    day: number;
  };
  sindhindEra: {
    aharganaDays: number;
    kaliyugaYears: number;
  };
  jdn: number; // Julian Day Number
  weekdayArabic: string;
  weekdayLatin: string;
  dayRuler: PlanetKey;
  hourRuler: PlanetKey;
  lunarPhase: {
    nameArabic: string;
    nameLatin: string;
    illumination: number; // 0 to 100%
    ageDays: number;
  };
}

export interface ManuscriptVerse {
  id: string;
  cantoNumber: number;
  cantoTitleArabic: string;
  cantoTitleLatin: string;
  verseNumber: number;
  arabicText: string;
  transliteration: string;
  meter: string; // e.g. Bahr ar-Rajaz, Bahr at-Tawil
  translationId: string;
  translationEn: string;
  commentary: string;
  astrologicalConcept: string;
  tags: string[];
}

export interface ManuscriptDocument {
  id: string;
  titleArabic: string;
  titleLatin: string;
  authorArabic: string;
  authorLatin: string;
  dateEra: string;
  provenance: string;
  repository: string;
  shelfmark: string;
  description: string;
  historicalContext: string;
  primaryLanguage: string;
  folioCount: number;
  featuredFolios: {
    folioNumber: string;
    imageUrl?: string;
    transcription: string;
    translation: string;
    diagramType?: string;
  }[];
  chapters: {
    id: string;
    titleArabic: string;
    titleLatin: string;
    contentSummary: string;
    versesOrPassages: ManuscriptVerse[];
  }[];
}

export interface ResearchAnnotation {
  id: string;
  targetType: 'manuscript' | 'verse' | 'planet' | 'horoscope' | 'date_epoch';
  targetId: string;
  targetTitle: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  title: string;
  content: string;
  tags: string[];
  referenceCitation?: string;
}

export interface SemanticSearchItem {
  id: string;
  type: 'manuscript_chapter' | 'verse' | 'planet_concept' | 'mansion' | 'term';
  titleArabic: string;
  titleLatin: string;
  arabicRoot?: string;
  snippetArabic: string;
  snippetLatin: string;
  relevanceScore: number;
  category: string;
  sourceDoc: string;
  referenceId: string;
}

export interface RemoteManuscriptSearchResult {
  id: string;
  repositoryName: string;
  city: string;
  shelfmark: string;
  title: string;
  date: string;
  summary: string;
  iiifManifestUrl?: string;
  thumbnailPlaceholderUrl?: string;
  relevance: string;
}
