export type GlobalArabicFontId =
  | 'scheherazade'
  | 'amiri'
  | 'lateef'
  | 'noto-naskh'
  | 'aref-ruqaa'
  | 'reem-kufi';

export interface ArabicFontPreset {
  id: GlobalArabicFontId;
  name: string;
  arabicLabel: string;
  cssFamily: string;
  description: string;
  sampleText: string;
}

export const ARABIC_FONT_PRESETS: ArabicFontPreset[] = [
  {
    id: 'scheherazade',
    name: 'Scheherazade New',
    arabicLabel: 'نَسْخٌ كِلَاسِيكِيٌّ وَاضِح',
    cssFamily: '"Scheherazade New", "Amiri", "Noto Naskh Arabic", serif',
    description: 'Naskh klasik berharakat sangat jernih, proporsi harakat rapi dan mudah dibaca.',
    sampleText: 'عِلْمُ النُّجُومِ وَالزِّيجِ السِّنْدِهِنْد',
  },
  {
    id: 'amiri',
    name: 'Amiri (Turats Bulaq)',
    arabicLabel: 'خَطُّ الأَمِيرِي التُّرَاثِي',
    cssFamily: '"Amiri", "Scheherazade New", "Noto Naskh Arabic", serif',
    description: 'Kaligrafi kitab turats klasik bergaya cetak Bulaq Mesir yang anggun & berwibawa.',
    sampleText: 'عِلْمُ النُّجُومِ وَالزِّيجِ السِّنْدِهِنْد',
  },
  {
    id: 'lateef',
    name: 'Lateef (Naskh Lembut)',
    arabicLabel: 'خَطٌّ لَطِيفٌ رَشِيق',
    cssFamily: '"Lateef", "Scheherazade New", "Amiri", serif',
    description: 'Goresan Naskh halus yang luwes dan nyaman dibaca pada teks bait syair panjang.',
    sampleText: 'عِلْمُ النُّجُومِ وَالزِّيجِ السِّنْدِهِنْد',
  },
  {
    id: 'noto-naskh',
    name: 'Noto Naskh Arabic',
    arabicLabel: 'نُوتُو نَسْخ العَرَبِي',
    cssFamily: '"Noto Naskh Arabic", "Scheherazade New", serif',
    description: 'Tipografi Naskh modern seimbang, tajam di layar ponsel Android/iOS maupun tabel.',
    sampleText: 'عِلْمُ النُّجُومِ وَالزِّيجِ السِّنْدِهِنْد',
  },
  {
    id: 'aref-ruqaa',
    name: 'Aref Ruqaa (Kaligrafi Pena)',
    arabicLabel: 'خَطُّ الرُّقْعَةِ العَارِف',
    cssFamily: '"Aref Ruqaa", "Amiri", serif',
    description: 'Gaya kaligrafi pena kalam Riq\'ah artistik untuk tajuk bab dan manuskrip.',
    sampleText: 'عِلْمُ النُّجُومِ وَالزِّيجِ السِّنْدِهِنْد',
  },
  {
    id: 'reem-kufi',
    name: 'Reem Kufi (Kufi Geometris)',
    arabicLabel: 'الخَطُّ الكُوفِيُّ الهَنْدَسِي',
    cssFamily: '"Reem Kufi", "Noto Kufi Arabic", sans-serif',
    description: 'Gaya Kufi geometris tegas yang selaras dengan astrolab dan diagram falak.',
    sampleText: 'عِلْمُ النُّجُومِ وَالزِّيجِ السِّنْدِهِنْد',
  },
];

const STORAGE_KEY = 'sindhind_arabic_font_v1';

export function getSavedArabicFontId(): GlobalArabicFontId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as GlobalArabicFontId | null;
    if (saved && ARABIC_FONT_PRESETS.some((p) => p.id === saved)) {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return 'scheherazade';
}

export function applyGlobalArabicFont(fontId: GlobalArabicFontId): ArabicFontPreset {
  const preset =
    ARABIC_FONT_PRESETS.find((p) => p.id === fontId) || ARABIC_FONT_PRESETS[0];
  try {
    localStorage.setItem(STORAGE_KEY, preset.id);
    document.documentElement.style.setProperty('--font-arabic', preset.cssFamily);
  } catch {
    // ignore DOM/storage errors
  }
  return preset;
}
