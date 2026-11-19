/**
 * Client-Side Google OAuth 2.0 (Google Sheets & Drive) Auth and REST API Client
 * Uses Firebase Authentication + GoogleAuthProvider for OAuth 2.0 popup sign-in.
 * Access tokens are stored strictly in memory and cleared on sign-out or revocation.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const GOOGLE_SHEETS_SCOPES: string[] = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
];

export interface OAuthScopeDescriptor {
  scope: string;
  label: string;
  purpose: string;
}

export const GOOGLE_SHEETS_SCOPE_DETAILS: OAuthScopeDescriptor[] = [
  {
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    label: 'Baca & Tulis Google Sheets',
    purpose: 'Membaca tab sheet serta menulis/mengekspor data Ephemeris, Tren 100 Tahun, Ritual Manzil, dan Anotasi.',
  },
  {
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    label: 'Akses Baca Google Sheets',
    purpose: 'Memuat metadata tab dan pratinjau sel dari spreadsheet pribadi Anda.',
  },
  {
    scope: 'https://www.googleapis.com/auth/drive.file',
    label: 'Kelola File Spreadsheet Aplikasi',
    purpose: 'Membuat dan memperbarui spreadsheet baru yang dibuat lewat aplikasi Zij as-Sindhind.',
  },
  {
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    label: 'Telusuri Daftar Spreadsheet Drive',
    purpose: 'Menampilkan dan mencari daftar file Google Sheets milik Anda di Google Drive.',
  },
  {
    scope: 'https://www.googleapis.com/auth/drive',
    label: 'Manajemen File Google Drive',
    purpose: 'Memindahkan spreadsheet yang tidak terpakai ke Sampah (Trash) dengan konfirmasi eksplisit.',
  },
];

export interface OAuthSessionInfo {
  grantedAtMs: number;
  expiresAtMs: number;
  grantedScopes: string[];
  verified: boolean;
  email: string | null;
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

function buildGoogleOAuthProvider(forceConsent = false): GoogleAuthProvider {
  const oauthProvider = new GoogleAuthProvider();
  GOOGLE_SHEETS_SCOPES.forEach((scope) => oauthProvider.addScope(scope));
  oauthProvider.setCustomParameters({
    prompt: forceConsent ? 'consent select_account' : 'select_account',
  });
  return oauthProvider;
}

// Strict in-memory OAuth 2.0 access token cache (never stored in localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedSessionInfo: OAuthSessionInfo | null = null;

export const getOAuthSessionInfo = (): OAuthSessionInfo | null => {
  if (!cachedAccessToken || !cachedSessionInfo) return null;
  if (Date.now() >= cachedSessionInfo.expiresAtMs) {
    cachedAccessToken = null;
    cachedSessionInfo = null;
    return null;
  }
  return cachedSessionInfo;
};

export const getWorkspaceAccessToken = (): string | null => {
  if (!cachedAccessToken) return null;
  if (cachedSessionInfo && Date.now() >= cachedSessionInfo.expiresAtMs) {
    cachedAccessToken = null;
    cachedSessionInfo = null;
    return null;
  }
  return cachedAccessToken;
};

export const initGoogleWorkspaceAuth = (
  onAuthSuccess?: (user: User, token: string, session: OAuthSessionInfo) => void,
  onAuthFailure?: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    const activeToken = getWorkspaceAccessToken();
    if (user) {
      if (activeToken && cachedSessionInfo) {
        onAuthSuccess?.(user, activeToken, cachedSessionInfo);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        cachedSessionInfo = null;
        onAuthFailure?.(user);
      }
    } else {
      cachedAccessToken = null;
      cachedSessionInfo = null;
      onAuthFailure?.(null);
    }
  });
};

function mapOAuthErrorMessage(error: unknown): Error {
  const code = (error as { code?: string })?.code || '';
  if (code === 'auth/popup-blocked') {
    return new Error(
      'Popup login Google OAuth 2.0 diblokir oleh browser. Izinkan popup untuk situs ini lalu coba Sign in with Google kembali.'
    );
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return new Error('Proses login Google OAuth 2.0 dibatalkan sebelum selesai.');
  }
  if (code === 'auth/unauthorized-domain') {
    return new Error(
      'Domain pratinjau belum terdaftar di daftar domain terotorisasi Firebase Authentication.'
    );
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error('Gagal menyelesaikan autentikasi Google OAuth 2.0.');
}

/**
 * Initiates the client-side Google OAuth 2.0 popup flow and caches the token strictly in memory.
 */
export const googleWorkspaceSignIn = async (options?: {
  forceConsent?: boolean;
}): Promise<{
  user: User;
  accessToken: string;
  session: OAuthSessionInfo;
}> => {
  try {
    isSigningIn = true;
    const oauthProvider = buildGoogleOAuthProvider(Boolean(options?.forceConsent));
    const result = await signInWithPopup(auth, oauthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Tidak menerima access token Google OAuth 2.0 dari sesi login.');
    }

    const now = Date.now();
    cachedAccessToken = credential.accessToken;
    cachedSessionInfo = {
      grantedAtMs: now,
      expiresAtMs: now + 55 * 60 * 1000, // Conservative 55-min client window (Google tokens expire at 60 min)
      grantedScopes: [...GOOGLE_SHEETS_SCOPES],
      verified: false,
      email: result.user.email,
    };

    // Best-effort tokeninfo verification to populate exact TTL and granted scopes
    const verifiedSession = await verifyGoogleOAuthToken().catch(() => cachedSessionInfo!);

    return {
      user: result.user,
      accessToken: cachedAccessToken,
      session: verifiedSession,
    };
  } catch (err) {
    throw mapOAuthErrorMessage(err);
  } finally {
    isSigningIn = false;
  }
};

/**
 * Verifies the in-memory OAuth 2.0 access token against Google's tokeninfo endpoint.
 */
export async function verifyGoogleOAuthToken(): Promise<OAuthSessionInfo> {
  const token = getWorkspaceAccessToken();
  if (!token) {
    throw new WorkspaceAuthExpiredError();
  }

  const res = await fetch(
    `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(token)}`
  );

  if (res.status === 400 || res.status === 401) {
    cachedAccessToken = null;
    cachedSessionInfo = null;
    throw new WorkspaceAuthExpiredError('Token OAuth 2.0 sudah kedaluwarsa atau dicabut. Silakan login ulang.');
  }

  if (!res.ok) {
    throw new Error(`Verifikasi token OAuth gagal (HTTP ${res.status}).`);
  }

  const info = (await res.json()) as {
    expires_in?: string | number;
    scope?: string;
    email?: string;
  };

  const expiresInSec = Number(info.expires_in) || 3300;
  const now = Date.now();
  const parsedScopes = info.scope
    ? info.scope.split(/\s+/).filter(Boolean)
    : [...GOOGLE_SHEETS_SCOPES];

  cachedSessionInfo = {
    grantedAtMs: cachedSessionInfo?.grantedAtMs ?? now,
    expiresAtMs: now + expiresInSec * 1000,
    grantedScopes: parsedScopes,
    verified: true,
    email: info.email || cachedSessionInfo?.email || auth.currentUser?.email || null,
  };

  return cachedSessionInfo;
}

/**
 * Signs out of Firebase Auth and clears the in-memory OAuth 2.0 access token.
 */
export const googleWorkspaceSignOut = async (): Promise<void> => {
  await auth.signOut();
  cachedAccessToken = null;
  cachedSessionInfo = null;
};

/**
 * Explicitly revokes the active OAuth 2.0 token with Google before signing out.
 */
export const revokeGoogleWorkspaceOAuth = async (): Promise<void> => {
  const token = cachedAccessToken;
  if (token) {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    } catch {
      // Proceed with local sign-out even if network revocation fails
    }
  }
  await googleWorkspaceSignOut();
};

export interface DriveSpreadsheetItem {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface SheetTabMeta {
  sheetId: number;
  title: string;
  rowCount?: number;
  columnCount?: number;
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheets: SheetTabMeta[];
}

export class WorkspaceAuthExpiredError extends Error {
  constructor(message = 'Sesi akses Google OAuth 2.0 berakhir. Silakan Sign in with Google kembali.') {
    super(message);
    this.name = 'WorkspaceAuthExpiredError';
  }
}

async function workspaceFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = getWorkspaceAccessToken();
  if (!token) {
    throw new WorkspaceAuthExpiredError();
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  if (res.status === 401) {
    cachedAccessToken = null;
    cachedSessionInfo = null;
    throw new WorkspaceAuthExpiredError();
  }

  if (!res.ok) {
    let errDetail = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errDetail = errJson?.error?.message || errDetail;
    } catch {
      // ignore parse failure
    }
    throw new Error(errDetail);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}

/**
 * List Google Sheets files from the user's Google Drive.
 */
export async function listUserSpreadsheets(searchQuery = ''): Promise<DriveSpreadsheetItem[]> {
  const escaped = searchQuery.trim().replace(/'/g, "\\'");
  const qParts = [
    "mimeType='application/vnd.google-apps.spreadsheet'",
    'trashed=false',
  ];
  if (escaped) {
    qParts.push(`name contains '${escaped}'`);
  }

  const params = new URLSearchParams({
    q: qParts.join(' and '),
    pageSize: '25',
    orderBy: 'modifiedTime desc',
    fields: 'files(id,name,modifiedTime,webViewLink)',
  });

  const data = await workspaceFetch<{ files?: DriveSpreadsheetItem[] }>(
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`
  );
  return data.files || [];
}

/**
 * Fetch spreadsheet metadata including real sheet tab names (never hardcoding "Sheet1").
 */
export async function getSpreadsheetMetadata(
  spreadsheetId: string
): Promise<SpreadsheetMetadata> {
  const params = new URLSearchParams({
    fields: 'spreadsheetId,spreadsheetUrl,properties.title,sheets.properties(sheetId,title,gridProperties)',
  });

  const data = await workspaceFetch<{
    spreadsheetId: string;
    spreadsheetUrl: string;
    properties?: { title?: string };
    sheets?: Array<{
      properties: {
        sheetId: number;
        title: string;
        gridProperties?: { rowCount?: number; columnCount?: number };
      };
    }>;
  }>(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?${params.toString()}`);

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Spreadsheet Tanpa Judul',
    spreadsheetUrl:
      data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`,
    sheets: (data.sheets || []).map((s) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      rowCount: s.properties.gridProperties?.rowCount,
      columnCount: s.properties.gridProperties?.columnCount,
    })),
  };
}

function escapeSheetTitle(sheetTitle: string): string {
  return `'${sheetTitle.replace(/'/g, "''")}'`;
}

/**
 * Read cell values from a dynamically selected sheet tab.
 */
export async function readSheetValues(
  spreadsheetId: string,
  sheetTitle: string,
  cellRange = 'A1:Z200'
): Promise<string[][]> {
  const fullRange = `${escapeSheetTitle(sheetTitle)}!${cellRange}`;
  const data = await workspaceFetch<{ values?: string[][] }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(fullRange)}`
  );
  return data.values || [];
}

/**
 * Create a new Google Spreadsheet with named tabs ready for Zij as-Sindhind research.
 */
export async function createZijSpreadsheet(
  title: string,
  initialSheetTitle = 'Ephemeris_Falak'
): Promise<SpreadsheetMetadata> {
  const data = await workspaceFetch<{
    spreadsheetId: string;
    spreadsheetUrl: string;
    properties?: { title?: string };
    sheets?: Array<{
      properties: {
        sheetId: number;
        title: string;
        gridProperties?: { rowCount?: number; columnCount?: number };
      };
    }>;
  }>('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    body: JSON.stringify({
      properties: { title },
      sheets: [{ properties: { title: initialSheetTitle } }],
    }),
  });

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || title,
    spreadsheetUrl:
      data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`,
    sheets: (data.sheets || []).map((s) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      rowCount: s.properties.gridProperties?.rowCount,
      columnCount: s.properties.gridProperties?.columnCount,
    })),
  };
}

/**
 * Append rows to a specific sheet tab.
 */
export async function appendSheetRows(
  spreadsheetId: string,
  sheetTitle: string,
  rows: Array<Array<string | number>>
): Promise<{ updatedRows: number; updatedRange: string }> {
  const fullRange = `${escapeSheetTitle(sheetTitle)}!A1`;
  const data = await workspaceFetch<{
    updates?: { updatedRows?: number; updatedRange?: string };
  }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(fullRange)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      body: JSON.stringify({
        majorDimension: 'ROWS',
        values: rows,
      }),
    }
  );

  return {
    updatedRows: data.updates?.updatedRows ?? rows.length,
    updatedRange: data.updates?.updatedRange ?? fullRange,
  };
}

/**
 * Overwrite a sheet tab's values starting at A1 (clears previous values in A1:Z2000 first).
 */
export async function overwriteSheetValues(
  spreadsheetId: string,
  sheetTitle: string,
  rows: Array<Array<string | number>>
): Promise<{ updatedRows: number; updatedRange: string }> {
  const clearRange = `${escapeSheetTitle(sheetTitle)}!A1:Z2000`;
  await workspaceFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(clearRange)}:clear`,
    { method: 'POST', body: JSON.stringify({}) }
  );

  const writeRange = `${escapeSheetTitle(sheetTitle)}!A1`;
  const data = await workspaceFetch<{
    updatedRows?: number;
    updatedRange?: string;
  }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(writeRange)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      body: JSON.stringify({
        majorDimension: 'ROWS',
        values: rows,
      }),
    }
  );

  return {
    updatedRows: data.updatedRows ?? rows.length,
    updatedRange: data.updatedRange ?? writeRange,
  };
}

/**
 * Move a spreadsheet file to Google Drive Trash.
 */
export async function trashSpreadsheet(fileId: string): Promise<void> {
  await workspaceFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ trashed: true }),
  });
}
