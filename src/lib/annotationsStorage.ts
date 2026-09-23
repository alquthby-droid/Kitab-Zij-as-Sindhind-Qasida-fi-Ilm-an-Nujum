/**
 * Personal Research Annotations Store
 * Persistent localStorage manager for scholarly notes, marginalia,
 * cross-references, and citations on manuscripts, verses, and astrological charts.
 */

import { ResearchAnnotation } from '../types';

const STORAGE_KEY = 'sindhind_nujum_research_annotations_v1';

export const INITIAL_SAMPLE_ANNOTATIONS: ResearchAnnotation[] = [
  {
    id: 'ann-1',
    targetType: 'manuscript',
    targetId: 'zij-as-sindhind',
    targetTitle: 'Zij as-Sindhind al-Kabir (Bab Ahargana)',
    authorName: 'Riset Filologi Falak',
    title: 'Catatan Perbandingan Hari Ahargana dengan Kalpa Brahmagupta',
    content:
      'Perlu dicermati bahwa Al-Khwarizmi memotong angka hari siklus Mahayuga menjadi era Kaliyuga (18 Feb 3102 SM) untuk mempercepat perhitungan tabel astronomi. Hal ini selaras dengan ulasan Al-Biruni dalam Kitab Tahqiq ma li-l-Hind.',
    tags: ['Ahargana', 'Kaliyuga', 'Al-Biruni', 'Filologi'],
    referenceCitation: 'Al-Biruni, Tahqiq ma li-l-Hind, Bab XLIX; Neugebauer 1962, hal. 8-12.',
    createdAt: '2026-09-18T10:30:00Z',
    updatedAt: '2026-09-18T10:30:00Z',
  },
  {
    id: 'ann-2',
    targetType: 'verse',
    targetId: 'q-1-1',
    targetTitle: 'Qasida fi \'Ilm an-Nujum (Bait 1: Saturnus & Jupiter)',
    authorName: 'Peneliti Astrologi Klasik',
    title: 'Analisis Meter Bahr Rajaz pada Hakikat Nahs dan Sa\'d',
    content:
      'Pola rima Mustaf\'ilun diulang secara berirama untuk memberikan penekanan memori didaktik. Bait mengontraskan secara tegas dingin-keringnya Saturnus dengan kehangatan berkeadilan Jupiter.',
    tags: ['Bahr Rajaz', 'Didaktik', 'Mizaj', 'Dignitas'],
    referenceCitation: 'Ibn Abi al-Rijal, Al-Bari\' fi Ahkam an-Nujum, Juz 1.',
    createdAt: '2026-09-20T14:15:00Z',
    updatedAt: '2026-09-20T14:15:00Z',
  },
  {
    id: 'ann-3',
    targetType: 'planet',
    targetId: 'sun',
    targetTitle: 'Matahari (ash-Shams) 19° Aries',
    authorName: 'Laboratorium Astronomi Sejarah',
    title: 'Konsep Sharaf Matahari pada Derajat ke-19 Hamal',
    content:
      'Derajat 19 Aries merupakan tradisi Babilonia kuno yang dipertahankan dalam astrologi Helenistik dan disepakati oleh seluruh Zij Islam klasik sebagai titik eksaltasi absolut Sang Surya.',
    tags: ['Sharaf', 'Aries', 'Eksaltasi', 'Babilonia'],
    referenceCitation: 'Zij as-Sindhind, Folio 14b; Al-Qabisi, Al-Madkhal.',
    createdAt: '2026-09-21T09:00:00Z',
    updatedAt: '2026-09-21T09:00:00Z',
  },
];

export function getStoredAnnotations(): ResearchAnnotation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_ANNOTATIONS));
      return INITIAL_SAMPLE_ANNOTATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAMPLE_ANNOTATIONS;
  }
}

export function saveAnnotation(annotation: Omit<ResearchAnnotation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ResearchAnnotation {
  const all = getStoredAnnotations();
  const now = new Date().toISOString();

  if (annotation.id) {
    const index = all.findIndex((a) => a.id === annotation.id);
    if (index !== -1) {
      const updated: ResearchAnnotation = {
        ...all[index],
        ...annotation,
        id: annotation.id,
        updatedAt: now,
      };
      all[index] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return updated;
    }
  }

  const newAnn: ResearchAnnotation = {
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...annotation,
    createdAt: now,
    updatedAt: now,
  };

  all.unshift(newAnn);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newAnn;
}

export function deleteAnnotation(id: string): boolean {
  try {
    const all = getStoredAnnotations();
    const filtered = all.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

export function getAnnotationsForTarget(targetType: string, targetId: string): ResearchAnnotation[] {
  const all = getStoredAnnotations();
  return all.filter((a) => a.targetType === targetType && a.targetId === targetId);
}
