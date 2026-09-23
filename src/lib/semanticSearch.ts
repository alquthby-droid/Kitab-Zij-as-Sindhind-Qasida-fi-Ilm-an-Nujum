/**
 * Classical Semantic Search Engine
 * Features Arabic root matching, diacritic-insensitive normalization,
 * transliteration aliases, thematic categorization, and weighted relevance ranking.
 */

import { MANUSCRIPT_DOCUMENTS } from '../data/manuscriptsData';
import { LUNAR_MANSIONS, PLANETS_INFO, ZODIAC_SIGNS } from './sindhindEngine';
import { SemanticSearchItem } from '../types';

/**
 * Normalize Arabic text by removing vowels (tashkeel), normalizing alef/yeh/teh marbuta
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Remove diacritics / harakat
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alefs
    .replace(/[\u0622\u0623\u0625]/g, '\u0627')
    // Normalize Taa Marbuta to Haa
    .replace(/\u0629/g, '\u0647')
    // Normalize Alif Maqsura to Yaa
    .replace(/\u0649/g, '\u064A')
    .toLowerCase()
    .trim();
}

/**
 * Common Arabic Astrological Root Thesaurus
 */
export const ARABIC_ROOTS_MAP: Record<string, { root: string; meaning: string; terms: string[] }> = {
  nujum: {
    root: 'ن-ج-م',
    meaning: 'Bintang, astronomi, astrologi, ilmu falak',
    terms: ['نجم', 'نجوم', 'منجم', 'تنجيم', 'علم النجوم', 'nujum', 'astrology'],
  },
  falak: {
    root: 'ف-ل-ك',
    meaning: 'Cakrawala, orbit peredaran langit, bola langit',
    terms: ['فلك', 'أفلاك', 'فلكي', 'فلك التدوير', 'falak', 'orbit', 'celestial sphere'],
  },
  sharaf: {
    root: 'ش-ر-ف',
    meaning: 'Eksaltasi, derajat kemuliaan planet tertinggi',
    terms: ['شرف', 'أشراف', 'مشرف', 'شرفه الأقصى', 'sharaf', 'exaltation', 'kemuliaan'],
  },
  hubut: {
    root: 'ه-ب-ط',
    meaning: 'Kejatuhan planet, pelemahan derajat lawan dari eksaltasi',
    terms: ['هبوط', 'هابط', 'hubut', 'fall', 'kejatuhan'],
  },
  saad: {
    root: 'س-ع-د',
    meaning: 'Kemujuran, kebahagiaan, planet bertuah (Jupiter & Venus)',
    terms: ['سعد', 'سعود', 'السعد الأكبر', 'السعد الأصغر', 'sa\'d', 'fortune', 'benefic'],
  },
  nahs: {
    root: 'ن-ح-س',
    meaning: 'Nahas, tantangan, rintangan kosmik (Saturnus & Mars)',
    terms: ['نحس', 'منحوس', 'النحس الأكبر', 'النحس الأصغر', 'nahs', 'malefic', 'infortune'],
  },
  qiran: {
    root: 'ق-ر-ن',
    meaning: 'Konjungsi, perjumpaan dua kawkab pada derajat yang sama',
    terms: ['قران', 'مقارنة', 'قيران', 'qiran', 'conjunction'],
  },
  ruju: {
    root: 'ر-ج-ع',
    meaning: 'Gerak mundur semu planet (retrograde)',
    terms: ['رجوع', 'راجع', 'استقامة', 'ruju\'', 'retrograde', 'mundur'],
  },
  ihtiraq: {
    root: 'ح-ر-ق',
    meaning: 'Pembakaran planet karena dekat matahari (combustion)',
    terms: ['احتراق', 'محترق', 'تحت الشعاع', 'ihtiraq', 'combust', 'terbakar'],
  },
  tali: {
    root: 'ط-ل-ع',
    meaning: 'Ascendant, rasi bintang yang sedang terbit di ufuk timur',
    terms: ['طالع', 'مطالع', 'طوالع', 'tali\'', 'ascendant', 'rasi terbit'],
  },
  manzil: {
    root: 'ن-ز-ل',
    meaning: 'Manzil bulan, 28 stasiun persinggahan rembulan',
    terms: ['منزل', 'منازل', 'منازل القمر', 'manzil', 'manazil', 'lunar mansion'],
  },
  bayt: {
    root: 'ب-ي-ت',
    meaning: 'Rumah astrologi, persemayaman penguasa rasi bintang',
    terms: ['بيت', 'بيوت', 'أرباب البيوت', 'bayt', 'house', 'domicile'],
  },
};

/**
 * Pre-build searchable corpus index
 */
export function buildCorpusSearchIndex(): SemanticSearchItem[] {
  const index: SemanticSearchItem[] = [];

  // 1. Index Manuscript Chapters & Verses
  MANUSCRIPT_DOCUMENTS.forEach((doc) => {
    doc.chapters.forEach((ch) => {
      index.push({
        id: `ch-${ch.id}`,
        type: 'manuscript_chapter',
        titleArabic: ch.titleArabic,
        titleLatin: ch.titleLatin,
        snippetArabic: ch.contentSummary,
        snippetLatin: `${doc.titleLatin} • ${ch.contentSummary}`,
        relevanceScore: 10,
        category: 'Bab Manuskrip',
        sourceDoc: doc.titleArabic,
        referenceId: doc.id,
      });

      ch.versesOrPassages.forEach((verse) => {
        index.push({
          id: `verse-${verse.id}`,
          type: 'verse',
          titleArabic: `${verse.cantoTitleArabic} [بيت ${verse.verseNumber}]`,
          titleLatin: `${verse.cantoTitleLatin} [Bait ${verse.verseNumber}]`,
          arabicRoot: verse.tags.join(', '),
          snippetArabic: verse.arabicText,
          snippetLatin: `${verse.translationId} (${verse.meter})`,
          relevanceScore: 12,
          category: 'Bait Syair (Poetic Verse)',
          sourceDoc: doc.titleArabic,
          referenceId: doc.id,
        });
      });
    });
  });

  // 2. Index 28 Lunar Mansions
  LUNAR_MANSIONS.forEach((mansion) => {
    index.push({
      id: `mansion-${mansion.number}`,
      type: 'mansion',
      titleArabic: `منزلة ${mansion.arabicName}`,
      titleLatin: `Manzil ke-${mansion.number}: ${mansion.transliteration}`,
      arabicRoot: 'ن-ز-ل',
      snippetArabic: `المنزلة رقم ${mansion.number} في الفلك (${mansion.starGroup}) - طبعها ${mansion.temperament}`,
      snippetLatin: `${mansion.indication} Gugusan bintang: ${mansion.starGroup}. Watak: ${mansion.fortune}.`,
      relevanceScore: 9,
      category: 'Manzil Rembulan',
      sourceDoc: 'منازل القمر في السند هند',
      referenceId: `mansion-${mansion.number}`,
    });
  });

  // 3. Index Planets Concepts & Dignities
  Object.values(PLANETS_INFO).forEach((planet) => {
    index.push({
      id: `planet-${planet.key}`,
      type: 'planet_concept',
      titleArabic: `كوكب ${planet.arabicName} (${planet.nature})`,
      titleLatin: `Planet ${planet.transliteration} (${planet.key.toUpperCase()})`,
      snippetArabic: `طبيعة الكوكب: ${planet.temperament} • جنسه: ${planet.gender} • شرفه في برج ${ZODIAC_SIGNS[planet.exaltationDegree.sign].arabicName} درجة ${planet.exaltationDegree.degree}°`,
      snippetLatin: `Watak: ${planet.nature} (${planet.temperament}). Persemayaman (Bayt): ${planet.rulershipSigns.map((s) => ZODIAC_SIGNS[s].latinName).join(', ')}. Eksaltasi: ${planet.exaltationDegree.degree}° ${ZODIAC_SIGNS[planet.exaltationDegree.sign].latinName}.`,
      relevanceScore: 11,
      category: 'Hakikat Kawkab (Planets)',
      sourceDoc: 'الأرجوزة الفلكية',
      referenceId: planet.key,
    });
  });

  // 4. Index Zodiac Signs
  ZODIAC_SIGNS.forEach((sign) => {
    index.push({
      id: `sign-${sign.index}`,
      type: 'term',
      titleArabic: `برج ${sign.arabicName} (${sign.transliteration})`,
      titleLatin: `Rasi ${sign.latinName} (${sign.symbol})`,
      snippetArabic: `طبيعته ${sign.element === 'Nar' ? 'نارية' : sign.element === 'Turab' ? 'ترابية' : sign.element === 'Hawa' ? 'هوائية' : 'مائية'} • صاحبه ${PLANETS_INFO[sign.ruler].arabicName}`,
      snippetLatin: `Elemen: ${sign.element}. Penguasa rasi: ${PLANETS_INFO[sign.ruler].transliteration}. Triplicity: ${PLANETS_INFO[sign.triplicityDay].transliteration} (siang) / ${PLANETS_INFO[sign.triplicityNight].transliteration} (malam).`,
      relevanceScore: 8,
      category: 'Buruj Falak (Zodiac)',
      sourceDoc: 'صور البروج الاثني عشر',
      referenceId: `sign-${sign.index}`,
    });
  });

  return index;
}

const GLOBAL_SEARCH_INDEX = buildCorpusSearchIndex();

/**
 * Execute semantic query over the corpus
 */
export function searchSemanticCorpus(
  query: string,
  categoryFilter?: string
): SemanticSearchItem[] {
  if (!query || query.trim().length === 0) {
    return categoryFilter
      ? GLOBAL_SEARCH_INDEX.filter((item) => item.category === categoryFilter)
      : GLOBAL_SEARCH_INDEX.slice(0, 8);
  }

  const cleanQuery = query.trim().toLowerCase();
  const normalizedQueryArabic = normalizeArabic(cleanQuery);
  const queryTokens = cleanQuery.split(/\s+/).filter((t) => t.length > 0);

  // Check if query matches any known semantic root
  let matchedRootSynonyms: string[] = [];
  Object.values(ARABIC_ROOTS_MAP).forEach((rootInfo) => {
    const hasMatch = rootInfo.terms.some(
      (term) =>
        cleanQuery.includes(term.toLowerCase()) ||
        term.toLowerCase().includes(cleanQuery) ||
        normalizeArabic(term).includes(normalizedQueryArabic)
    );
    if (hasMatch) {
      matchedRootSynonyms = matchedRootSynonyms.concat(rootInfo.terms);
    }
  });

  const scoredResults = GLOBAL_SEARCH_INDEX.map((item) => {
    let score = 0;
    const itemArabicNorm = normalizeArabic(item.titleArabic + ' ' + item.snippetArabic);
    const itemLatinNorm = (item.titleLatin + ' ' + item.snippetLatin + ' ' + (item.arabicRoot || '')).toLowerCase();

    // Direct exact matches in title
    if (itemArabicNorm.includes(normalizedQueryArabic)) score += 30;
    if (itemLatinNorm.includes(cleanQuery)) score += 25;

    // Token matches
    queryTokens.forEach((tok) => {
      const normTok = normalizeArabic(tok);
      if (itemArabicNorm.includes(normTok)) score += 10;
      if (itemLatinNorm.includes(tok)) score += 8;
    });

    // Root expansion matches
    matchedRootSynonyms.forEach((syn) => {
      const normSyn = normalizeArabic(syn);
      if (itemArabicNorm.includes(normSyn) || itemLatinNorm.includes(syn.toLowerCase())) {
        score += 15;
      }
    });

    // Category match bonus
    if (categoryFilter && item.category === categoryFilter) {
      score += 20;
    } else if (categoryFilter && item.category !== categoryFilter) {
      score = 0; // Filter out
    }

    return {
      ...item,
      relevanceScore: score,
    };
  })
    .filter((item) => item.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return scoredResults.slice(0, 15);
}
