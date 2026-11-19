import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  RefreshCw,
  Search,
  Plus,
  Upload,
  Trash2,
  ExternalLink,
  LogOut,
  AlertTriangle,
  Check,
  BookmarkPlus,
  Table2,
  X,
  ShieldCheck,
  KeyRound,
  Lock,
  Clock,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Code2,
} from 'lucide-react';
import { AppsScriptExportPanel } from './AppsScriptExportPanel';
import {
  HistoricalDateInfo,
  PlanetKey,
  PlanetaryPosition,
  ResearchAnnotation,
  ThemeMode,
} from '../types';
import { ZODIAC_SIGNS } from '../lib/sindhindEngine';
import {
  loadScheduledRituals,
  transliterateToArabic,
} from '../lib/manzilRitualEngine';
import {
  SEVEN_KAWKAB_KEYS,
  KAWKAB_META,
  generateCenturyPlanetaryAnalysis,
} from '../lib/planetaryAnalysisEngine';
import {
  DriveSpreadsheetItem,
  SpreadsheetMetadata,
  OAuthSessionInfo,
  GOOGLE_SHEETS_SCOPE_DETAILS,
  WorkspaceAuthExpiredError,
  initGoogleWorkspaceAuth,
  googleWorkspaceSignIn,
  googleWorkspaceSignOut,
  verifyGoogleOAuthToken,
  revokeGoogleWorkspaceOAuth,
  getOAuthSessionInfo,
  listUserSpreadsheets,
  getSpreadsheetMetadata,
  readSheetValues,
  createZijSpreadsheet,
  appendSheetRows,
  overwriteSheetValues,
  trashSpreadsheet,
} from '../lib/googleSheetsClient';

interface GoogleSheetsSyncViewProps {
  currentDateInfo: HistoricalDateInfo;
  positions: Record<PlanetKey, PlanetaryPosition>;
  observerLocation: {
    latitude: number;
    longitude: number;
    name: string;
  };
  annotations: ResearchAnnotation[];
  theme: ThemeMode;
  onAnnotate?: (title: string, content: string) => void;
}

type ExportDatasetKind = 'ephemeris' | 'century_100y' | 'rituals' | 'annotations';
type WriteStrategy = 'append' | 'overwrite';

interface PendingConfirmation {
  title: string;
  description: string;
  details: string[];
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => Promise<void>;
}

const GoogleLogoSvg: React.FC = () => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="w-5 h-5 shrink-0"
    aria-hidden="true"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

export const GoogleSheetsSyncView: React.FC<GoogleSheetsSyncViewProps> = ({
  currentDateInfo,
  positions,
  observerLocation,
  annotations,
  theme,
  onAnnotate,
}) => {
  const isNight = theme === 'night';

  // OAuth 2.0 Auth state (token stays strictly in memory inside googleSheetsClient.ts)
  const [user, setUser] = useState<User | null>(null);
  const [oauthSession, setOAuthSession] = useState<OAuthSessionInfo | null>(() =>
    getOAuthSessionInfo()
  );
  const [needsAuth, setNeedsAuth] = useState<boolean>(() => !getOAuthSessionInfo());
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);
  const [showScopesDetail, setShowScopesDetail] = useState<boolean>(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [sheetsSubTab, setSheetsSubTab] = useState<'apps_script' | 'oauth_sync'>('apps_script');

  // Spreadsheets & active sheet state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [spreadsheets, setSpreadsheets] = useState<DriveSpreadsheetItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [selectedMeta, setSelectedMeta] = useState<SpreadsheetMetadata | null>(null);
  const [activeSheetTitle, setActiveSheetTitle] = useState<string>('');
  const [sheetRows, setSheetRows] = useState<string[][]>([]);
  const [isLoadingSheet, setIsLoadingSheet] = useState<boolean>(false);

  // Create new spreadsheet form
  const [newSpreadsheetTitle, setNewSpreadsheetTitle] = useState<string>(
    `Riset Zij as-Sindhind ${currentDateInfo.gregorian.year}`
  );
  const [newTabTitle, setNewTabTitle] = useState<string>('Ephemeris_Falak');

  // Export configuration
  const [exportKind, setExportKind] = useState<ExportDatasetKind>('ephemeris');
  const [writeStrategy, setWriteStrategy] = useState<WriteStrategy>('append');

  // Feedback & explicit confirmation modal
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmation | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);

  // Update remaining OAuth session countdown every 30s
  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const showStatus = (msg: string) => {
    setErrorMessage(null);
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const handleApiError = useCallback((err: unknown) => {
    if (err instanceof WorkspaceAuthExpiredError) {
      setNeedsAuth(true);
      setOAuthSession(null);
      setErrorMessage(err.message);
      return;
    }
    const msg =
      err instanceof Error
        ? err.message
        : 'Terjadi kesalahan saat menghubungi Google Sheets API.';
    setErrorMessage(msg);
  }, []);

  const loadFiles = useCallback(
    async (query = '') => {
      setIsLoadingFiles(true);
      setErrorMessage(null);
      try {
        const files = await listUserSpreadsheets(query);
        setSpreadsheets(files);
      } catch (err) {
        handleApiError(err);
      } finally {
        setIsLoadingFiles(false);
      }
    },
    [handleApiError]
  );

  // Initialize Firebase Google OAuth 2.0 listener on mount
  useEffect(() => {
    const unsubscribe = initGoogleWorkspaceAuth(
      (authedUser, _token, session) => {
        setUser(authedUser);
        setOAuthSession(session);
        setNeedsAuth(false);
      },
      (maybeUser) => {
        setUser(maybeUser);
        setOAuthSession(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Load Drive spreadsheets automatically once authenticated with active OAuth 2.0 token
  useEffect(() => {
    if (!needsAuth) {
      void loadFiles('');
    }
  }, [needsAuth, loadFiles]);

  const handleSignIn = async (forceConsent = false) => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const result = await googleWorkspaceSignIn({ forceConsent });
      setUser(result.user);
      setOAuthSession(result.session);
      setNeedsAuth(false);
      setSheetsSubTab('oauth_sync');
      showStatus(
        `Autentikasi Google OAuth 2.0 berhasil sebagai ${
          result.user.email || result.user.displayName || 'Akun Google'
        }.`
      );
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyOAuthSession = async () => {
    setIsVerifyingToken(true);
    setErrorMessage(null);
    try {
      const verified = await verifyGoogleOAuthToken();
      setOAuthSession(verified);
      const minsLeft = Math.max(0, Math.round((verified.expiresAtMs - Date.now()) / 60000));
      showStatus(
        `Token Google OAuth 2.0 terverifikasi aktif (~${minsLeft} menit tersisa, ${verified.grantedScopes.length} izin aktif).`
      );
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleSignOut = async () => {
    await googleWorkspaceSignOut();
    setUser(null);
    setOAuthSession(null);
    setNeedsAuth(true);
    setSpreadsheets([]);
    setSelectedMeta(null);
    setActiveSheetTitle('');
    setSheetRows([]);
    showStatus('Anda telah keluar dan token OAuth 2.0 telah dihapus dari memori.');
  };

  const requestRevokeOAuth = () => {
    setPendingConfirm({
      title: 'Konfirmasi Cabut Akses OAuth 2.0',
      description:
        'Token akses Google OAuth 2.0 saat ini akan dicabut di server Google dan sesi login akan diakhiri.',
      details: [
        `Akun Google: ${user?.email || 'Tidak diketahui'}`,
        'Tindakan: Memanggil endpoint pencabutan OAuth 2.0 Google lalu menghapus sesi.',
      ],
      confirmLabel: 'Cabut Akses & Keluar',
      destructive: true,
      onConfirm: async () => {
        await revokeGoogleWorkspaceOAuth();
        setUser(null);
        setOAuthSession(null);
        setNeedsAuth(true);
        setSpreadsheets([]);
        setSelectedMeta(null);
        setActiveSheetTitle('');
        setSheetRows([]);
        showStatus('Akses OAuth 2.0 berhasil dicabut dan sesi telah ditutup.');
      },
    });
  };

  const handleSelectSpreadsheet = async (spreadsheetId: string) => {
    setIsLoadingSheet(true);
    setErrorMessage(null);
    try {
      const meta = await getSpreadsheetMetadata(spreadsheetId);
      setSelectedMeta(meta);
      const firstTab = meta.sheets[0]?.title || '';
      setActiveSheetTitle(firstTab);
      if (firstTab) {
        const values = await readSheetValues(meta.spreadsheetId, firstTab);
        setSheetRows(values);
      } else {
        setSheetRows([]);
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleChangeSheetTab = async (tabTitle: string) => {
    if (!selectedMeta) return;
    setActiveSheetTitle(tabTitle);
    setIsLoadingSheet(true);
    setErrorMessage(null);
    try {
      const values = await readSheetValues(selectedMeta.spreadsheetId, tabTitle);
      setSheetRows(values);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const buildDatasetRows = (kind: ExportDatasetKind): {
    label: string;
    rows: Array<Array<string | number>>;
  } => {
    const g = currentDateInfo.gregorian;
    const dateStr = `${String(g.day).padStart(2, '0')}/${String(g.month).padStart(2, '0')}/${g.year} M`;
    const hijriStr = `${currentDateInfo.hijri.day} ${currentDateInfo.hijri.monthNameLatin} ${currentDateInfo.hijri.year} H`;

    if (kind === 'ephemeris') {
      const header = [
        'Tanggal_Masehi',
        'Tarikh_Hijriah',
        'JDN',
        'Kawkab',
        'Arab',
        'Bujur_Ekliptika_Deg',
        'Buruj',
        'Derajat_Buruj',
        'Manzil',
        'Martabat_Skor',
        'Status_Ihtiraq',
        'Rumah',
        'Lokasi',
      ];
      const body = (Object.keys(positions) as PlanetKey[]).map((key) => {
        const p = positions[key];
        const sign = ZODIAC_SIGNS[p.coordinate.signIndex];
        return [
          dateStr,
          hijriStr,
          Number(currentDateInfo.jdn.toFixed(2)),
          p.planet.transliteration,
          p.planet.arabicName,
          Number(p.trueLongitude.toFixed(2)),
          sign.latinName,
          `${p.coordinate.signDegree}° ${p.coordinate.signDegreeMinutes}'`,
          `#${p.lunarMansion.number} ${p.lunarMansion.transliteration}`,
          p.dignity.totalScore,
          p.isCombust ? 'Ihtiraq' : p.isUnderBeams ? "Taht as-Syu'a" : 'Bebas',
          p.houseNumber,
          observerLocation.name,
        ];
      });
      return { label: 'Ephemeris Kawkab Aktif', rows: [header, ...body] };
    }

    if (kind === 'century_100y') {
      const dataset = generateCenturyPlanetaryAnalysis({
        endYear: g.year,
        endMonth: g.month,
        endDay: g.day,
        latitude: observerLocation.latitude,
        longitude: observerLocation.longitude,
        cadence: 'annual',
        yearsBack: 100,
      });
      const header = [
        'Tahun_Masehi',
        'Tanggal_Masehi',
        'Tarikh_Hijriah',
        ...SEVEN_KAWKAB_KEYS.flatMap((k) => [
          `${KAWKAB_META[k].transliteration}_Deg`,
          `${KAWKAB_META[k].transliteration}_Buruj`,
        ]),
        'Separasi_Zuhal_Mushtari_Deg',
      ];
      const body = dataset.points.map((pt) => [
        pt.year,
        pt.gregorianLabel,
        pt.hijriLabel,
        ...SEVEN_KAWKAB_KEYS.flatMap((k) => [
          pt.planets[k].longitude,
          ZODIAC_SIGNS[pt.planets[k].signIndex].latinName,
        ]),
        pt.saturnJupiterSeparation,
      ]);
      return {
        label: `Tren Historis 7 Kawkab 100 Tahun (${dataset.startYear}–${dataset.endYear})`,
        rows: [header, ...body],
      };
    }

    if (kind === 'rituals') {
      const rituals = loadScheduledRituals();
      const header = [
        'Judul_Amalan',
        'Arab_Melayu_Judul',
        'Manzil_No',
        'Manzil_Latin',
        'Manzil_Arab_Melayu',
        'Tanggal',
        'Jam_Terbit',
        'Jendela_Akhir',
        'Planet_Jam',
        'Lokasi',
        'Catatan',
      ];
      const body = rituals.map((r) => [
        r.title,
        r.titleArabic || transliterateToArabic(r.title),
        r.manzilNumber,
        r.manzilTransliteration,
        r.manzilArabMelayu || transliterateToArabic(r.manzilTransliteration, r.manzilNumber),
        r.dateISO,
        r.risingTime,
        r.windowEnd,
        r.planetaryHour,
        r.locationName,
        r.notes,
      ]);
      return { label: 'Jadwal Ritual Terbit Manzil', rows: [header, ...body] };
    }

    const header = [
      'Judul_Anotasi',
      'Target',
      'Tipe',
      'Penulis',
      'Tanggal_Dibuat',
      'Catatan_Riset',
      'Tag',
    ];
    const body = annotations.map((a) => [
      a.title || a.targetTitle,
      a.targetTitle,
      a.targetType,
      a.authorName,
      a.createdAt,
      a.content,
      (a.tags || []).join(', '),
    ]);
    return { label: 'Jurnal Anotasi Riset', rows: [header, ...body] };
  };

  // Trigger confirmation dialog before creating a new spreadsheet
  const requestCreateSpreadsheet = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newSpreadsheetTitle.trim() || `Zij as-Sindhind ${currentDateInfo.gregorian.year}`;
    const tab = newTabTitle.trim() || 'Ephemeris_Falak';

    setPendingConfirm({
      title: 'Konfirmasi Pembuatan Spreadsheet Baru',
      description: 'Aplikasi akan membuat file Google Spreadsheet baru di Google Drive Anda.',
      details: [`Nama Spreadsheet: "${title}"`, `Nama Tab Awal: "${tab}"`],
      confirmLabel: 'Buat Spreadsheet',
      onConfirm: async () => {
        const meta = await createZijSpreadsheet(title, tab);
        setSelectedMeta(meta);
        setActiveSheetTitle(meta.sheets[0]?.title || tab);
        setSheetRows([]);
        await loadFiles(searchQuery);
        showStatus(`Spreadsheet "${meta.title}" berhasil dibuat di Google Drive.`);
      },
    });
  };

  // Trigger confirmation dialog before writing/overwriting Google Sheet data
  const requestWriteDataset = () => {
    if (!selectedMeta || !activeSheetTitle) {
      setErrorMessage('Pilih spreadsheet dan tab sheet tujuan terlebih dahulu.');
      return;
    }
    const { label, rows } = buildDatasetRows(exportKind);
    if (rows.length <= 1) {
      setErrorMessage(`Dataset "${label}" belum memiliki baris data untuk dikirim.`);
      return;
    }

    const isOverwrite = writeStrategy === 'overwrite';
    setPendingConfirm({
      title: isOverwrite
        ? 'Konfirmasi Timpa Data Google Sheets'
        : 'Konfirmasi Tambah Baris ke Google Sheets',
      description: isOverwrite
        ? `Seluruh isi lama pada tab "${activeSheetTitle}" (rentang A1:Z2000) akan dihapus dan digantikan dengan dataset baru.`
        : `Sebanyak ${rows.length} baris baru akan ditambahkan ke bagian bawah tab "${activeSheetTitle}".`,
      details: [
        `Spreadsheet Tujuan: "${selectedMeta.title}"`,
        `Tab Sheet: "${activeSheetTitle}"`,
        `Dataset: ${label} (${rows.length} baris termasuk header)`,
        `Mode Penulisan: ${
          isOverwrite ? 'TIMPA SELURUH ISI TAB (Overwrite)' : 'TAMBAH BARIS BARU (Append)'
        }`,
      ],
      confirmLabel: isOverwrite ? 'Timpa Isi Tab' : 'Kirim ke Google Sheets',
      destructive: isOverwrite,
      onConfirm: async () => {
        const result = isOverwrite
          ? await overwriteSheetValues(selectedMeta.spreadsheetId, activeSheetTitle, rows)
          : await appendSheetRows(selectedMeta.spreadsheetId, activeSheetTitle, rows);
        const refreshed = await readSheetValues(selectedMeta.spreadsheetId, activeSheetTitle);
        setSheetRows(refreshed);
        showStatus(
          `Berhasil menulis ${result.updatedRows} baris ke "${selectedMeta.title}" (${result.updatedRange}).`
        );
      },
    });
  };

  // Trigger confirmation dialog before moving a spreadsheet to Drive Trash
  const requestTrashSpreadsheet = (file: DriveSpreadsheetItem) => {
    setPendingConfirm({
      title: 'Konfirmasi Pindahkan ke Sampah Google Drive',
      description: `Apakah Anda yakin ingin memindahkan spreadsheet "${file.name}" ke Sampah (Trash) Google Drive Anda?`,
      details: [
        `File Terdampak: "${file.name}"`,
        `ID File: ${file.id}`,
        'Tindakan ini memindahkan file ke folder Trash Google Drive Anda.',
      ],
      confirmLabel: 'Pindahkan ke Sampah',
      destructive: true,
      onConfirm: async () => {
        await trashSpreadsheet(file.id);
        if (selectedMeta?.spreadsheetId === file.id) {
          setSelectedMeta(null);
          setActiveSheetTitle('');
          setSheetRows([]);
        }
        await loadFiles(searchQuery);
        showStatus(`Spreadsheet "${file.name}" telah dipindahkan ke Sampah Google Drive.`);
      },
    });
  };

  const executePendingConfirmation = async () => {
    if (!pendingConfirm) return;
    setIsExecutingAction(true);
    setErrorMessage(null);
    try {
      await pendingConfirm.onConfirm();
      setPendingConfirm(null);
    } catch (err) {
      setPendingConfirm(null);
      handleApiError(err);
    } finally {
      setIsExecutingAction(false);
    }
  };

  const remainingSessionMinutes = oauthSession
    ? Math.max(0, Math.round((oauthSession.expiresAtMs - nowMs) / 60000))
    : 0;

  const cardSurface = isNight
    ? 'bg-[#101624] border-[#212e46] text-[#e5dccb]'
    : 'bg-[#faf6ee] border-[#dacdb2] text-[#2c2419]';

  const subSurface = isNight
    ? 'bg-[#0b101b] border-[#1d283e]'
    : 'bg-white border-[#e2d6bd]';

  return (
    <div className="space-y-6 pb-8">
      {/* Explicit Confirmation Modal for Mutating / Destructive Operations */}
      {pendingConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => !isExecutingAction && setPendingConfirm(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl space-y-4 ${cardSurface}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    pendingConfirm.destructive
                      ? 'bg-rose-500/15 text-rose-500 border border-rose-500/35'
                      : 'bg-amber-500/15 text-amber-500 border border-amber-500/35'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base">{pendingConfirm.title}</h3>
                  <p className="text-xs opacity-85 mt-1 leading-relaxed">
                    {pendingConfirm.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isExecutingAction}
                onClick={() => setPendingConfirm(null)}
                className="p-1.5 rounded-lg hover:bg-current/10 cursor-pointer"
                aria-label="Tutup dialog konfirmasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 font-mono ${subSurface}`}>
              {pendingConfirm.details.map((line, idx) => (
                <div key={idx} className="leading-snug">
                  {line}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={isExecutingAction}
                onClick={() => setPendingConfirm(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-current/20 text-xs font-semibold hover:bg-current/10 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isExecutingAction}
                onClick={executePendingConfirmation}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer disabled:opacity-60 ${
                  pendingConfirm.destructive
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isExecutingAction ? 'Memproses...' : pendingConfirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER & OAUTH 2.0 SESSION BAR */}
      <div className={`rounded-2xl border p-4 sm:p-6 space-y-4 ${cardSurface}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="font-arabic text-base">مُزَامَنَةُ جَدَاوِلِ جُوجِلْ بِتَوْثِيقِ OAuth 2.0</span>
              <span aria-hidden="true">·</span>
              <span>Google Sheets OAuth 2.0</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold">
              Sinkronisasi Data Falak ke Google Sheets
            </h1>
            <p className="text-xs sm:text-sm opacity-80 max-w-3xl leading-relaxed">
              Login dengan akun Google melalui alur autentikasi Google OAuth 2.0 sisi klien untuk membaca, mengelola, dan mengekspor data riset *Zij as-Sindhind* langsung ke spreadsheet pribadi Anda.
            </p>
          </div>

          {/* Primary OAuth 2.0 Sign-In or Account Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {!needsAuth && user ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isVerifyingToken}
                  onClick={() => void handleVerifyOAuthSession()}
                  className={`min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${subSurface} hover:border-emerald-500`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{isVerifyingToken ? 'Memeriksa...' : 'Verifikasi Token'}</span>
                </button>
                <button
                  type="button"
                  disabled={isLoggingIn}
                  onClick={() => void handleSignIn(true)}
                  className={`min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${subSurface} hover:border-amber-500`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ganti Akun</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="min-h-[42px] px-3 py-1.5 rounded-xl border border-current/20 hover:bg-current/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
                <button
                  type="button"
                  onClick={requestRevokeOAuth}
                  className="min-h-[42px] px-3 py-1.5 rounded-xl border border-rose-500/35 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  Cabut Akses
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isLoggingIn}
                onClick={() => void handleSignIn(false)}
                className="gsi-material-button min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#1f1f1f] border border-[#747775] shadow-xs flex items-center gap-3 text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
                aria-label="Sign in with Google"
              >
                <GoogleLogoSvg />
                <span>{isLoggingIn ? 'Menghubungkan OAuth 2.0...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Active OAuth 2.0 Identity & Session Telemetry Strip */}
        {!needsAuth && user && (
          <div className="pt-3 border-t border-current/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profil Google'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-current/15 shrink-0 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-500 border border-emerald-500/35 flex items-center justify-center font-bold text-xs shrink-0">
                  {(user.displayName || user.email || 'G').slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-semibold flex flex-wrap items-center gap-x-2">
                  <span className="truncate">{user.displayName || 'Pengguna Google'}</span>
                  <span aria-hidden="true" className="opacity-40">·</span>
                  <span className="font-mono text-[11px] opacity-80 truncate">{user.email}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] opacity-75">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {oauthSession?.verified ? 'OAuth 2.0 Terverifikasi' : 'OAuth 2.0 Aktif (RAM-Only)'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                    <Clock className="w-3 h-3" />
                    Sisa sesi ~{remainingSessionMinutes} menit
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {oauthSession?.grantedScopes.length ?? GOOGLE_SHEETS_SCOPE_DETAILS.length} izin Sheets &amp; Drive
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowScopesDetail((prev) => !prev)}
              className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Rincian Izin OAuth 2.0</span>
              {showScopesDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Collapsible Granted Scopes Details */}
        {showScopesDetail && (
          <div className={`rounded-xl border p-3.5 space-y-2 text-xs ${subSurface}`}>
            <div className="font-semibold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Cakupan Izin Google OAuth 2.0 (Token Hanya di Memori Sesi)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {GOOGLE_SHEETS_SCOPE_DETAILS.map((item) => (
                <div key={item.scope} className="p-2.5 rounded-lg border border-current/10 space-y-0.5">
                  <div className="font-semibold text-xs">{item.label}</div>
                  <div className="text-[11px] opacity-80 leading-snug">{item.purpose}</div>
                  <div className="text-[10px] font-mono opacity-60 break-all">{item.scope}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status / Error Alerts */}
        {statusMessage && (
          <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {/* Sub-Navigation: Code.gs & Index.html Download vs Google OAuth 2.0 Live Sync */}
        <div className="pt-3 border-t border-current/10 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSheetsSubTab('apps_script')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors ${
              sheetsSubTab === 'apps_script'
                ? 'bg-[#c59a43] text-black'
                : `${subSurface} border hover:border-amber-500`
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Code.gs &amp; Index.html (Siap Download)</span>
          </button>
          <button
            type="button"
            onClick={() => setSheetsSubTab('oauth_sync')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors ${
              sheetsSubTab === 'oauth_sync'
                ? 'bg-emerald-600 text-white'
                : `${subSurface} border hover:border-emerald-500`
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sinkronisasi Google OAuth 2.0</span>
          </button>
        </div>
      </div>

      {/* APPS SCRIPT CODE.GS & INDEX.HTML DOWNLOAD GENERATOR */}
      {sheetsSubTab === 'apps_script' ? (
        <AppsScriptExportPanel theme={theme} />
      ) : needsAuth ? (
        <div className={`rounded-2xl border p-5 sm:p-7 space-y-6 ${cardSurface}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-current/10 pb-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {user
                    ? 'Sesi OAuth 2.0 Memori-Only Perlu Diperbarui'
                    : 'Alur Autentikasi Google OAuth 2.0 Aman'}
                </span>
              </div>
              <h2 className="font-serif font-bold text-lg sm:text-xl">
                {user
                  ? `Lanjutkan Akses Google Sheets untuk ${user.email || user.displayName}`
                  : 'Masuk dengan Akun Google untuk Mengakses Spreadsheet Pribadi Anda'}
              </h2>
              <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                {user
                  ? 'Demi keamanan, token akses OAuth 2.0 tidak disimpan di penyimpanan lokal browser dan dibersihkan saat halaman dimuat ulang. Klik tombol di samping untuk memperbarui token OAuth 2.0 sesi ini.'
                  : 'Aplikasi menggunakan autentikasi Google OAuth 2.0 sisi klien. Token akses hanya disimpan di memori RAM selama sesi aktif dan langsung dihapus ketika Anda keluar atau menutup tab.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={isLoggingIn}
                onClick={() => void handleSignIn(false)}
                className="gsi-material-button min-h-[46px] px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#1f1f1f] border border-[#747775] shadow-sm inline-flex items-center justify-center gap-3 text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
              >
                <GoogleLogoSvg />
                <span>
                  {isLoggingIn
                    ? 'Membuka Popup OAuth 2.0...'
                    : user
                    ? 'Lanjutkan dengan Google'
                    : 'Sign in with Google'}
                </span>
              </button>
              {user && (
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="min-h-[46px] px-3.5 py-2 rounded-xl border border-current/20 hover:bg-current/10 text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  Gunakan Akun Lain
                </button>
              )}
            </div>
          </div>

          {/* 3-Step OAuth 2.0 Flow Explainer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className={`p-4 rounded-xl border space-y-1.5 ${subSurface}`}>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>01. Pilih Akun Google</span>
              </div>
              <p className="text-xs opacity-80 leading-relaxed">
                Jendela popup resmi Google akan terbuka agar Anda memilih akun Google pribadi tanpa pernah memasukkan kata sandi ke aplikasi ini.
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-1.5 ${subSurface}`}>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>02. Persetujuan Izin Sheets</span>
              </div>
              <p className="text-xs opacity-80 leading-relaxed">
                Anda meninjau dan menyetujui akses Google Sheets &amp; Drive secara eksplisit. Token OAuth 2.0 diverifikasi dan disimpan khusus di memori sesi.
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-1.5 ${subSurface}`}>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                <Lock className="w-4 h-4 shrink-0" />
                <span>03. Akses &amp; Konfirmasi Penuh</span>
              </div>
              <p className="text-xs opacity-80 leading-relaxed">
                Telusuri spreadsheet pribadi Anda dengan aman. Setiap penulisan, penimpaan tab, atau penghapusan selalu meminta konfirmasi Anda terlebih dahulu.
              </p>
            </div>
          </div>

          {/* Transparent OAuth Scope List */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowScopesDetail((prev) => !prev)}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {showScopesDetail
                  ? 'Sembunyikan Rincian Izin OAuth 2.0'
                  : 'Lihat Rincian Izin Google OAuth 2.0 yang Diminta (5 Cakupan)'}
              </span>
              {showScopesDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Drive Spreadsheet List & Create Form (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Create New Spreadsheet Card */}
            <form
              onSubmit={requestCreateSpreadsheet}
              className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardSurface}`}
            >
              <div className="flex items-center gap-2 font-serif font-bold text-sm">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Buat Google Spreadsheet Baru</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold opacity-80 block">
                    Judul Spreadsheet
                  </label>
                  <input
                    type="text"
                    required
                    value={newSpreadsheetTitle}
                    onChange={(e) => setNewSpreadsheetTitle(e.target.value)}
                    className={`w-full min-h-[42px] px-3 py-1.5 rounded-xl border text-xs ${subSurface}`}
                    placeholder="Riset Falak Zij as-Sindhind"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold opacity-80 block">
                    Nama Tab Awal
                  </label>
                  <input
                    type="text"
                    required
                    value={newTabTitle}
                    onChange={(e) => setNewTabTitle(e.target.value)}
                    className={`w-full min-h-[42px] px-3 py-1.5 rounded-xl border text-xs ${subSurface}`}
                    placeholder="Ephemeris_Falak"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Buat Spreadsheet di Drive</span>
              </button>
            </form>

            {/* Existing Drive Spreadsheets Browser */}
            <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardSurface}`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-serif font-bold text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Spreadsheet di Google Drive ({spreadsheets.length})</span>
                </h2>
                <button
                  type="button"
                  disabled={isLoadingFiles}
                  onClick={() => void loadFiles(searchQuery)}
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 cursor-pointer ${subSurface} hover:border-amber-500`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span>Muat Ulang</span>
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void loadFiles(searchQuery);
                    }
                  }}
                  placeholder="Cari nama spreadsheet di Drive..."
                  className={`flex-1 min-h-[42px] px-3 py-1.5 rounded-xl border text-xs ${subSurface}`}
                />
                <button
                  type="button"
                  onClick={() => void loadFiles(searchQuery)}
                  className={`min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${subSurface} hover:border-amber-500`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Cari</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {isLoadingFiles ? (
                  <div className="p-6 text-center text-xs opacity-75">
                    Memuat daftar Google Sheets dari Drive...
                  </div>
                ) : spreadsheets.length === 0 ? (
                  <div className={`p-5 rounded-xl border text-center text-xs opacity-75 ${subSurface}`}>
                    Belum ada spreadsheet yang ditemukan. Buat spreadsheet baru di atas atau ubah kata kunci pencarian.
                  </div>
                ) : (
                  spreadsheets.map((file) => {
                    const isSelected = selectedMeta?.spreadsheetId === file.id;
                    return (
                      <div
                        key={file.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : `${subSurface} hover:border-amber-500/60`
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => void handleSelectSpreadsheet(file.id)}
                          className="min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <div className="text-xs font-bold truncate">{file.name}</div>
                          {file.modifiedTime && (
                            <div className="text-[10px] font-mono opacity-70 mt-0.5">
                              Diubah: {new Date(file.modifiedTime).toLocaleString('id-ID')}
                            </div>
                          )}
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center hover:bg-current/10"
                              title="Buka di Google Sheets"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => requestTrashSpreadsheet(file)}
                            className="min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            title="Pindahkan ke Sampah Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Export Dataset & Sheet Tab Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {!selectedMeta ? (
              <div className={`rounded-2xl border p-8 text-center space-y-2 ${cardSurface}`}>
                <Table2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                <h3 className="font-serif font-bold text-base">
                  Pilih Spreadsheet untuk Membaca atau Menulis Data
                </h3>
                <p className="text-xs opacity-75 max-w-md mx-auto leading-relaxed">
                  Pilih salah satu file di daftar sebelah kiri atau buat spreadsheet baru. Nama tab sheet akan dibaca langsung dari metadata Google Sheets Anda.
                </p>
              </div>
            ) : (
              <>
                {/* Export Controls for Selected Spreadsheet */}
                <div className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-current/10 pb-3">
                    <div>
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Spreadsheet Terpilih
                      </div>
                      <h2 className="text-base sm:text-lg font-serif font-bold">
                        {selectedMeta.title}
                      </h2>
                    </div>
                    <a
                      href={selectedMeta.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 ${subSurface} hover:border-emerald-500`}
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Buka di Google Sheets</span>
                    </a>
                  </div>

                  {/* Dynamic Sheet Tab Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold opacity-80 block">
                        Tab Sheet ({selectedMeta.sheets.length} tersedia)
                      </label>
                      <select
                        value={activeSheetTitle}
                        onChange={(e) => void handleChangeSheetTab(e.target.value)}
                        className={`w-full min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-medium ${subSurface}`}
                      >
                        {selectedMeta.sheets.map((s) => (
                          <option key={s.sheetId} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold opacity-80 block">
                        Dataset Zij as-Sindhind
                      </label>
                      <select
                        value={exportKind}
                        onChange={(e) => setExportKind(e.target.value as ExportDatasetKind)}
                        className={`w-full min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-medium ${subSurface}`}
                      >
                        <option value="ephemeris">Ephemeris Kawkab Aktif</option>
                        <option value="century_100y">Tren 7 Kawkab 100 Tahun</option>
                        <option value="rituals">Jadwal Ritual Manzil</option>
                        <option value="annotations">Jurnal Anotasi ({annotations.length})</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold opacity-80 block">
                        Mode Penulisan
                      </label>
                      <select
                        value={writeStrategy}
                        onChange={(e) => setWriteStrategy(e.target.value as WriteStrategy)}
                        className={`w-full min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-medium ${subSurface}`}
                      >
                        <option value="append">Tambah Baris (Append)</option>
                        <option value="overwrite">Timpa Isi Tab (Overwrite)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] opacity-75">
                      Dialog konfirmasi eksplisit akan ditampilkan sebelum perubahan dikirim ke Google Sheets.
                    </span>
                    <button
                      type="button"
                      onClick={requestWriteDataset}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#c59a43] hover:bg-[#d4a84e] text-black text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Kirim Dataset ke Tab "{activeSheetTitle}"</span>
                    </button>
                  </div>
                </div>

                {/* Live Sheet Data Preview */}
                <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardSurface}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/10 pb-3">
                    <div>
                      <h3 className="font-serif font-bold text-sm flex items-center gap-2">
                        <Table2 className="w-4 h-4 text-amber-500" />
                        <span>Pratinjau Tab "{activeSheetTitle}"</span>
                      </h3>
                      <p className="text-[11px] opacity-75 font-mono tabular-nums">
                        {sheetRows.length} baris terbaca (rentang A1:Z200)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {onAnnotate && sheetRows.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const snippet = sheetRows
                              .slice(0, 12)
                              .map((r) => r.join(' | '))
                              .join('\n');
                            onAnnotate(
                              `Impor Google Sheets: ${selectedMeta.title} (${activeSheetTitle})`,
                              `Sumber: ${selectedMeta.spreadsheetUrl}\n\n${snippet}`
                            );
                          }}
                          className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${subSurface} hover:border-amber-500`}
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 text-amber-500" />
                          <span>Salin ke Anotasi</span>
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isLoadingSheet}
                        onClick={() => void handleChangeSheetTab(activeSheetTitle)}
                        className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1 cursor-pointer ${subSurface} hover:border-amber-500`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSheet ? 'animate-spin' : ''}`} />
                        <span>Segarkan</span>
                      </button>
                    </div>
                  </div>

                  {isLoadingSheet ? (
                    <div className="p-8 text-center text-xs opacity-75">
                      Membaca sel dari Google Sheets...
                    </div>
                  ) : sheetRows.length === 0 ? (
                    <div className={`p-6 rounded-xl border text-center text-xs opacity-75 ${subSurface}`}>
                      Tab "{activeSheetTitle}" masih kosong. Kirim salah satu dataset Zij as-Sindhind di atas untuk mengisinya.
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[420px] rounded-xl border border-current/10">
                      <table className="w-full text-left text-xs border-collapse font-mono tabular-nums">
                        <thead>
                          <tr className="border-b border-current/15 bg-current/5">
                            <th className="py-2 px-2.5 text-[10px] opacity-60">#</th>
                            {sheetRows[0].map((col, ci) => (
                              <th key={ci} className="py-2 px-2.5 font-bold whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-current/10">
                          {sheetRows.slice(1, 101).map((row, ri) => (
                            <tr key={ri} className="hover:bg-current/5">
                              <td className="py-1.5 px-2.5 text-[10px] opacity-60">{ri + 1}</td>
                              {sheetRows[0].map((_, ci) => (
                                <td
                                  key={ci}
                                  className="py-1.5 px-2.5 whitespace-nowrap max-w-[260px] truncate"
                                >
                                  {row[ci] ?? ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
