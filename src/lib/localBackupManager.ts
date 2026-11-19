import { ResearchAnnotation, ThemeMode } from '../types';
import { getStoredAnnotations, replaceAllAnnotations } from './annotationsStorage';
import {
  ScheduledRitual,
  loadScheduledRituals,
  saveScheduledRituals,
} from './manzilRitualEngine';
import {
  MedicalSymptomLog,
  loadSymptomLogs,
  saveSymptomLogs,
} from './iatroastrologyEngine';
import {
  GlobalArabicFontId,
  getSavedArabicFontId,
  applyGlobalArabicFont,
  ARABIC_FONT_PRESETS,
} from './arabicFonts';
import { syncRitualsToServiceWorker } from './pushNotificationManager';

export const BACKUP_SCHEMA_VERSION = 1;
const LAST_BACKUP_AT_KEY = 'sindhind_last_backup_at_v1';
const NATAL_PROFILE_KEY = 'sindhind_user_natal_profile';
const SID_LINK_STORAGE_KEY = 'sindhind_custom_sid_link_v1';
const DASHBOARD_COLLAPSED_KEY = 'sindhind_dashboard_collapsed';
const THEME_STORAGE_KEY = 'sindhind_theme';
const VAPID_STORAGE_KEY = 'sindhind_manzil_vapid_public_key_v1';

export interface BackupSelection {
  includeAnnotations: boolean;
  includeRituals: boolean;
  includeIatroastrology: boolean;
  includePreferences: boolean;
}

export interface LocalBackupPreferences {
  theme: ThemeMode;
  arabicFontId: GlobalArabicFontId;
  customSidLink?: string;
  dashboardCollapsed?: boolean;
  vapidPublicKey?: string;
  natalProfile?: Record<string, unknown> | null;
}

export interface LocalBackupPayload {
  app: 'Zij as-Sindhind & Qasida fi Ilm an-Nujum';
  schemaVersion: number;
  exportedAt: string;
  selection: BackupSelection;
  summary: {
    annotationsCount: number;
    ritualsCount: number;
    iatroastrologyLogsCount: number;
    hasNatalProfile: boolean;
  };
  data: {
    annotations?: ResearchAnnotation[];
    rituals?: ScheduledRitual[];
    iatroastrologyLogs?: MedicalSymptomLog[];
    preferences?: LocalBackupPreferences;
  };
}

export interface LocalDataInventory {
  annotationsCount: number;
  ritualsCount: number;
  enabledRitualsCount: number;
  iatroastrologyLogsCount: number;
  hasNatalProfile: boolean;
  estimatedSizeKb: number;
  lastBackupAt: string | null;
}

export interface ParsedBackupPreview {
  payload: LocalBackupPayload;
  annotationsCount: number;
  ritualsCount: number;
  iatroastrologyLogsCount: number;
  hasPreferences: boolean;
  exportedAt: string;
}

export interface RestoreResult {
  annotationsRestored: number;
  ritualsRestored: number;
  iatroastrologyRestored: number;
  preferencesApplied: boolean;
  restoredTheme?: ThemeMode;
  restoredArabicFontId?: GlobalArabicFontId;
}

function readSafeJsonObject(key: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function getLastBackupTimestamp(): string | null {
  try {
    return localStorage.getItem(LAST_BACKUP_AT_KEY);
  } catch {
    return null;
  }
}

export function createLocalBackupSnapshot(
  selection: BackupSelection = {
    includeAnnotations: true,
    includeRituals: true,
    includeIatroastrology: true,
    includePreferences: true,
  }
): LocalBackupPayload {
  const annotations = selection.includeAnnotations ? getStoredAnnotations() : undefined;
  const rituals = selection.includeRituals ? loadScheduledRituals() : undefined;
  const iatroastrologyLogs = selection.includeIatroastrology ? loadSymptomLogs() : undefined;

  let preferences: LocalBackupPreferences | undefined;
  const natalProfile = readSafeJsonObject(NATAL_PROFILE_KEY);

  if (selection.includePreferences) {
    const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'night';
    const savedSid = localStorage.getItem(SID_LINK_STORAGE_KEY) || undefined;
    const savedCollapsed = localStorage.getItem(DASHBOARD_COLLAPSED_KEY);
    const savedVapid = localStorage.getItem(VAPID_STORAGE_KEY) || undefined;

    preferences = {
      theme: savedTheme === 'parchment' ? 'parchment' : 'night',
      arabicFontId: getSavedArabicFontId(),
      customSidLink: savedSid,
      dashboardCollapsed: savedCollapsed === 'true',
      vapidPublicKey: savedVapid,
      natalProfile,
    };
  }

  return {
    app: 'Zij as-Sindhind & Qasida fi Ilm an-Nujum',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    selection,
    summary: {
      annotationsCount: annotations?.length ?? 0,
      ritualsCount: rituals?.length ?? 0,
      iatroastrologyLogsCount: iatroastrologyLogs?.length ?? 0,
      hasNatalProfile: Boolean(natalProfile),
    },
    data: {
      ...(annotations !== undefined ? { annotations } : {}),
      ...(rituals !== undefined ? { rituals } : {}),
      ...(iatroastrologyLogs !== undefined ? { iatroastrologyLogs } : {}),
      ...(preferences !== undefined ? { preferences } : {}),
    },
  };
}

export function getLocalDataInventory(): LocalDataInventory {
  const annotations = getStoredAnnotations();
  const rituals = loadScheduledRituals();
  const iatroastrologyLogs = loadSymptomLogs();
  const natalProfile = readSafeJsonObject(NATAL_PROFILE_KEY);

  const fullSnapshot = createLocalBackupSnapshot();
  const jsonBytes = new Blob([JSON.stringify(fullSnapshot)]).size;

  return {
    annotationsCount: annotations.length,
    ritualsCount: rituals.length,
    enabledRitualsCount: rituals.filter((r) => r.enabled).length,
    iatroastrologyLogsCount: iatroastrologyLogs.length,
    hasNatalProfile: Boolean(natalProfile),
    estimatedSizeKb: Math.max(0.5, Number((jsonBytes / 1024).toFixed(1))),
    lastBackupAt: getLastBackupTimestamp(),
  };
}

export function downloadLocalBackupJson(selection: BackupSelection): {
  filename: string;
  exportedAt: string;
  sizeKb: number;
} {
  const payload = createLocalBackupSnapshot(selection);
  const formattedJson = JSON.stringify(payload, null, 2);
  const blob = new Blob([formattedJson], { type: 'application/json;charset=utf-8' });

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(
    now.getHours()
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const filename = `zij-as-sindhind-backup-${stamp}.json`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);

  try {
    localStorage.setItem(LAST_BACKUP_AT_KEY, payload.exportedAt);
  } catch {
    // ignore storage quota errors
  }

  return {
    filename,
    exportedAt: payload.exportedAt,
    sizeKb: Math.max(0.5, Number((blob.size / 1024).toFixed(1))),
  };
}

export function parseAndValidateBackupJson(rawText: string): ParsedBackupPreview {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('Format file tidak valid. Pastikan Anda memilih file .json hasil backup.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Struktur JSON backup tidak dikenali.');
  }

  const obj = parsed as Partial<LocalBackupPayload>;
  if (!obj.data || typeof obj.data !== 'object') {
    throw new Error('File JSON tidak memiliki objek "data" backup Zij as-Sindhind.');
  }

  const annotations = Array.isArray(obj.data.annotations) ? obj.data.annotations : undefined;
  const rituals = Array.isArray(obj.data.rituals) ? obj.data.rituals : undefined;
  const iatroastrologyLogs = Array.isArray(obj.data.iatroastrologyLogs)
    ? obj.data.iatroastrologyLogs
    : undefined;
  const preferences =
    obj.data.preferences && typeof obj.data.preferences === 'object'
      ? obj.data.preferences
      : undefined;

  if (!annotations && !rituals && !iatroastrologyLogs && !preferences) {
    throw new Error(
      'File JSON tidak berisi data anotasi, jadwal ritual, catatan iatroastrology, atau preferensi.'
    );
  }

  const normalizedPayload: LocalBackupPayload = {
    app: 'Zij as-Sindhind & Qasida fi Ilm an-Nujum',
    schemaVersion: typeof obj.schemaVersion === 'number' ? obj.schemaVersion : 1,
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
    selection: obj.selection || {
      includeAnnotations: Boolean(annotations),
      includeRituals: Boolean(rituals),
      includeIatroastrology: Boolean(iatroastrologyLogs),
      includePreferences: Boolean(preferences),
    },
    summary: {
      annotationsCount: annotations?.length ?? 0,
      ritualsCount: rituals?.length ?? 0,
      iatroastrologyLogsCount: iatroastrologyLogs?.length ?? 0,
      hasNatalProfile: Boolean(preferences?.natalProfile),
    },
    data: {
      ...(annotations ? { annotations } : {}),
      ...(rituals ? { rituals } : {}),
      ...(iatroastrologyLogs ? { iatroastrologyLogs } : {}),
      ...(preferences ? { preferences } : {}),
    },
  };

  return {
    payload: normalizedPayload,
    annotationsCount: annotations?.length ?? 0,
    ritualsCount: rituals?.length ?? 0,
    iatroastrologyLogsCount: iatroastrologyLogs?.length ?? 0,
    hasPreferences: Boolean(preferences),
    exportedAt: normalizedPayload.exportedAt,
  };
}

function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  existing.forEach((item) => {
    if (item && typeof item.id === 'string') {
      map.set(item.id, item);
    }
  });
  incoming.forEach((item) => {
    if (item && typeof item.id === 'string') {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

export function restoreLocalBackupSnapshot(
  payload: LocalBackupPayload,
  mode: 'merge' | 'replace'
): RestoreResult {
  let annotationsRestored = 0;
  let ritualsRestored = 0;
  let iatroastrologyRestored = 0;
  let preferencesApplied = false;
  let restoredTheme: ThemeMode | undefined;
  let restoredArabicFontId: GlobalArabicFontId | undefined;

  if (Array.isArray(payload.data.annotations)) {
    const validAnnotations = payload.data.annotations.filter(
      (a): a is ResearchAnnotation => Boolean(a && typeof a.id === 'string' && typeof a.content === 'string')
    );
    const nextAnnotations =
      mode === 'merge'
        ? mergeById(getStoredAnnotations(), validAnnotations)
        : validAnnotations;
    replaceAllAnnotations(nextAnnotations);
    annotationsRestored = validAnnotations.length;
  }

  if (Array.isArray(payload.data.rituals)) {
    const validRituals = payload.data.rituals.filter(
      (r): r is ScheduledRitual =>
        Boolean(r && typeof r.id === 'string' && typeof r.manzilNumber === 'number')
    );
    const nextRituals =
      mode === 'merge' ? mergeById(loadScheduledRituals(), validRituals) : validRituals;
    saveScheduledRituals(nextRituals);
    void syncRitualsToServiceWorker(nextRituals);
    ritualsRestored = validRituals.length;
  }

  if (Array.isArray(payload.data.iatroastrologyLogs)) {
    const validLogs = payload.data.iatroastrologyLogs.filter(
      (l): l is MedicalSymptomLog =>
        Boolean(l && typeof l.id === 'string' && typeof l.symptomTitle === 'string')
    );
    const nextLogs =
      mode === 'merge' ? mergeById(loadSymptomLogs(), validLogs) : validLogs;
    saveSymptomLogs(nextLogs);
    iatroastrologyRestored = validLogs.length;
  }

  if (payload.data.preferences) {
    const prefs = payload.data.preferences;
    if (prefs.theme === 'night' || prefs.theme === 'parchment') {
      localStorage.setItem(THEME_STORAGE_KEY, prefs.theme);
      restoredTheme = prefs.theme;
    }
    if (
      prefs.arabicFontId &&
      ARABIC_FONT_PRESETS.some((p) => p.id === prefs.arabicFontId)
    ) {
      applyGlobalArabicFont(prefs.arabicFontId);
      restoredArabicFontId = prefs.arabicFontId;
    }
    if (typeof prefs.customSidLink === 'string' && prefs.customSidLink.trim()) {
      localStorage.setItem(SID_LINK_STORAGE_KEY, prefs.customSidLink.trim());
    }
    if (typeof prefs.dashboardCollapsed === 'boolean') {
      localStorage.setItem(DASHBOARD_COLLAPSED_KEY, String(prefs.dashboardCollapsed));
    }
    if (typeof prefs.vapidPublicKey === 'string' && prefs.vapidPublicKey.trim()) {
      localStorage.setItem(VAPID_STORAGE_KEY, prefs.vapidPublicKey.trim());
    }
    if (prefs.natalProfile && typeof prefs.natalProfile === 'object') {
      localStorage.setItem(NATAL_PROFILE_KEY, JSON.stringify(prefs.natalProfile));
    }
    preferencesApplied = true;
  }

  return {
    annotationsRestored,
    ritualsRestored,
    iatroastrologyRestored,
    preferencesApplied,
    restoredTheme,
    restoredArabicFontId,
  };
}
