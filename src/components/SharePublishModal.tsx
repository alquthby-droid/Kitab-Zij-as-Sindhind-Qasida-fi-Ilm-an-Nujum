import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Type,
  Code2,
  MessageSquare,
  Settings,
  HardDriveDownload,
  Upload,
  ShieldCheck,
  Clock,
  Moon,
  Sun,
  FileJson,
} from 'lucide-react';
import { ThemeMode } from '../types';
import {
  ARABIC_FONT_PRESETS,
  GlobalArabicFontId,
} from '../lib/arabicFonts';
import {
  BackupSelection,
  LocalDataInventory,
  ParsedBackupPreview,
  RestoreResult,
  createLocalBackupSnapshot,
  downloadLocalBackupJson,
  getLocalDataInventory,
  parseAndValidateBackupJson,
  restoreLocalBackupSnapshot,
} from '../lib/localBackupManager';

export type SettingsModalSection = 'backup' | 'appearance' | 'publish';

interface SharePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  arabicFontId: GlobalArabicFontId;
  onChangeArabicFont: (id: GlobalArabicFontId) => void;
  onChangeTheme?: (next: ThemeMode) => void;
  onBackupRestored?: (result: RestoreResult) => void;
  initialSection?: SettingsModalSection;
}

const SID_LINK_STORAGE_KEY = 'sindhind_custom_sid_link_v1';

export const SharePublishModal: React.FC<SharePublishModalProps> = ({
  isOpen,
  onClose,
  theme,
  arabicFontId,
  onChangeArabicFont,
  onChangeTheme,
  onBackupRestored,
  initialSection = 'backup',
}) => {
  const isNight = theme === 'night';
  const [activeSection, setActiveSection] = useState<SettingsModalSection>(initialSection);

  // s.id Publish & Share states
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [copiedSidUrl, setCopiedSidUrl] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedWaText, setCopiedWaText] = useState(false);
  const [deployMode, setDeployMode] = useState<'shortlink' | 'microsite' | 'domain'>('shortlink');
  const [customSidSlug, setCustomSidSlug] = useState<string>(() => {
    try {
      return localStorage.getItem(SID_LINK_STORAGE_KEY) || 'https://s.id/zij-sindhind';
    } catch {
      return 'https://s.id/zij-sindhind';
    }
  });

  // Local Backup & Restore states
  const [inventory, setInventory] = useState<LocalDataInventory>(() => getLocalDataInventory());
  const [backupSelection, setBackupSelection] = useState<BackupSelection>({
    includeAnnotations: true,
    includeRituals: true,
    includeIatroastrology: true,
    includePreferences: true,
  });
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [parsedImport, setParsedImport] = useState<ParsedBackupPreview | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '';
  const isDevPreviewUrl = currentUrl.includes('ais-dev-');
  const suggestedShareUrl = isDevPreviewUrl
    ? currentUrl.replace('ais-dev-', 'ais-pre-')
    : currentUrl;

  useEffect(() => {
    if (isOpen) {
      setInventory(getLocalDataInventory());
      setActiveSection(initialSection);
      setBackupError(null);
    }
  }, [isOpen, initialSection]);

  useEffect(() => {
    try {
      localStorage.setItem(SID_LINK_STORAGE_KEY, customSidSlug);
    } catch {
      // ignore storage errors
    }
  }, [customSidSlug]);

  if (!isOpen) return null;

  const hasAnySelection =
    backupSelection.includeAnnotations ||
    backupSelection.includeRituals ||
    backupSelection.includeIatroastrology ||
    backupSelection.includePreferences;

  const embedIframeCode = `<iframe src="${suggestedShareUrl}" title="Zij as-Sindhind & Qasida fi 'Ilm an-Nujum" style="width:100%;min-height:85vh;border:0;border-radius:16px;" allow="geolocation" loading="lazy"></iframe>`;
  const whatsappShareText = `Zij as-Sindhind & Qasida fi 'Ilm an-Nujum — Aplikasi Falak Klasik, Ephemeris 7 Kawkab, 28 Manzil, Wafaq Kaligrafi Arab & Analisis Historis 100 Tahun.\n\nAkses langsung: ${
    customSidSlug.trim() || suggestedShareUrl
  }`;

  const handleCopy = async (text: string, target: 'app' | 'sid' | 'embed' | 'wa') => {
    try {
      await navigator.clipboard.writeText(text);
      if (target === 'app') {
        setCopiedAppUrl(true);
        setTimeout(() => setCopiedAppUrl(false), 2000);
      } else if (target === 'sid') {
        setCopiedSidUrl(true);
        setTimeout(() => setCopiedSidUrl(false), 2000);
      } else if (target === 'embed') {
        setCopiedEmbed(true);
        setTimeout(() => setCopiedEmbed(false), 2000);
      } else {
        setCopiedWaText(true);
        setTimeout(() => setCopiedWaText(false), 2000);
      }
    } catch {
      // fallback ignored
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: "Zij as-Sindhind & Qasida fi 'Ilm an-Nujum",
          text: 'Aplikasi Falak Klasik, 28 Manzil, Penjadwal Ritual & Wafaq Kaligrafi Arab',
          url: suggestedShareUrl,
        });
      } catch {
        // user cancelled share sheet
      }
    } else {
      handleCopy(suggestedShareUrl, 'app');
    }
  };

  const handleDownloadBackup = () => {
    if (!hasAnySelection) {
      setBackupError('Pilih minimal satu kategori data untuk diunduh.');
      return;
    }
    setBackupError(null);
    const { filename, sizeKb } = downloadLocalBackupJson(backupSelection);
    setInventory(getLocalDataInventory());
    setBackupNotice(`Backup berhasil diunduh: ${filename} (${sizeKb} KB). Simpan file ini di tempat aman.`);
  };

  const handleCopyBackupJson = async () => {
    if (!hasAnySelection) {
      setBackupError('Pilih minimal satu kategori data untuk disalin.');
      return;
    }
    setBackupError(null);
    try {
      const snapshot = createLocalBackupSnapshot(backupSelection);
      await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
      setCopiedJson(true);
      setBackupNotice('Isi JSON backup lokal berhasil disalin ke papan klip.');
      setTimeout(() => setCopiedJson(false), 2200);
    } catch {
      setBackupError('Salin otomatis diblokir browser. Gunakan tombol Unduh Backup JSON.');
    }
  };

  const handleSelectRestoreFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBackupError(null);
    setBackupNotice(null);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : '';
        const preview = parseAndValidateBackupJson(text);
        setParsedImport(preview);
        setImportFileName(file.name);
      } catch (err) {
        setParsedImport(null);
        setImportFileName('');
        setBackupError(err instanceof Error ? err.message : 'Gagal membaca file JSON backup.');
      }
    };
    reader.onerror = () => {
      setBackupError('Terjadi kesalahan saat membaca file dari perangkat Anda.');
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleConfirmRestore = () => {
    if (!parsedImport) return;
    setBackupError(null);
    const result = restoreLocalBackupSnapshot(parsedImport.payload, restoreMode);
    setInventory(getLocalDataInventory());
    setParsedImport(null);
    setImportFileName('');
    onBackupRestored?.(result);

    const modeLabel = restoreMode === 'merge' ? 'digabungkan' : 'dipulihkan (timpa)';
    setBackupNotice(
      `Data berhasil ${modeLabel}: ${result.annotationsRestored} anotasi, ${result.ritualsRestored} konfigurasi ritual, dan ${result.iatroastrologyRestored} catatan iatroastrology.`
    );
  };

  const panelClass = isNight
    ? 'bg-[#141c2f] border-[#25344f]'
    : 'bg-[#f4ede0] border-[#dfd3bc]';

  const subCardClass = isNight
    ? 'bg-[#0e1422] border-[#24324d]'
    : 'bg-white/85 border-[#dacdb2]';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border shadow-2xl pb-safe ${
          isNight
            ? 'bg-[#0f1524] border-[#263552] text-[#e6ded0]'
            : 'bg-[#faf6ee] border-[#dacdb2] text-[#2c2419]'
        }`}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 px-5 pt-4 pb-3 border-b border-current/10 backdrop-blur-md bg-inherit space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#c59a43]/20 border border-[#c59a43]/40 flex items-center justify-center text-[#c59a43] shrink-0">
                <Settings className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="font-serif font-bold text-base text-[#c59a43] truncate">
                  Pengaturan, Backup Data Lokal &amp; Publikasi
                </h2>
                <p className="text-[11px] opacity-75 truncate">
                  Cadangkan anotasi &amp; ritual ke JSON, atur font Arab, atau bagikan via s.id
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center border border-current/15 hover:bg-current/10 cursor-pointer shrink-0"
              aria-label="Tutup menu pengaturan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {(
              [
                { id: 'backup', label: 'Backup Data Lokal', icon: HardDriveDownload },
                { id: 'appearance', label: 'Font Arab & Tema', icon: Type },
                { id: 'publish', label: 'Publikasi s.id', icon: Share2 },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`min-h-[40px] px-2.5 py-1.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#c59a43] text-black border-[#c59a43]'
                      : `${subCardClass} opacity-80 hover:opacity-100`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* ==================== SECTION 1: BACKUP DATA LOKAL ==================== */}
          {activeSection === 'backup' && (
            <div className="space-y-4">
              {backupNotice && (
                <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{backupNotice}</span>
                </div>
              )}
              {backupError && (
                <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{backupError}</span>
                </div>
              )}

              {/* Export Card */}
              <div className={`p-4 rounded-2xl border space-y-4 ${panelClass}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FileJson className="w-4 h-4 text-emerald-500" />
                      <h3 className="font-serif font-bold text-sm">
                        Unduh Backup Data Lokal (JSON)
                      </h3>
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed">
                      Simpan salinan mandiri seluruh catatan anotasi riset, jadwal &amp; konfigurasi ritual Manzil, catatan Iatroastrology, serta preferensi aplikasi ke perangkat Anda.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono opacity-75 tabular-nums">
                    ~{inventory.estimatedSizeKb} KB
                  </span>
                </div>

                {/* Live Data Summary Counts */}
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-3 rounded-xl border ${subCardClass}`}>
                    <div className="text-[11px] opacity-70">Anotasi Riset</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-[#c59a43]">
                      {inventory.annotationsCount}
                    </div>
                    <div className="text-[10px] opacity-65">catatan tersimpan</div>
                  </div>
                  <div className={`p-3 rounded-xl border ${subCardClass}`}>
                    <div className="text-[11px] opacity-70">Ritual Manzil</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-emerald-500">
                      {inventory.ritualsCount}
                    </div>
                    <div className="text-[10px] opacity-65">
                      {inventory.enabledRitualsCount} pengingat aktif
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border ${subCardClass}`}>
                    <div className="text-[11px] opacity-70">Iatroastrology</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-sky-500">
                      {inventory.iatroastrologyLogsCount}
                    </div>
                    <div className="text-[10px] opacity-65">log keluhan fisik</div>
                  </div>
                </div>

                {/* Selective Data Checkboxes */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold opacity-80">
                    Pilih Data yang Disertakan dalam File JSON:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(
                      [
                        {
                          key: 'includeAnnotations',
                          label: `Anotasi & Marginalia Riset (${inventory.annotationsCount})`,
                        },
                        {
                          key: 'includeRituals',
                          label: `Konfigurasi & Jadwal Ritual (${inventory.ritualsCount})`,
                        },
                        {
                          key: 'includeIatroastrology',
                          label: `Catatan Iatroastrology (${inventory.iatroastrologyLogsCount})`,
                        },
                        {
                          key: 'includePreferences',
                          label: 'Preferensi Font Arab, Tema & Profil Natal',
                        },
                      ] as const
                    ).map((item) => (
                      <label
                        key={item.key}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer ${subCardClass}`}
                      >
                        <input
                          type="checkbox"
                          checked={backupSelection[item.key]}
                          onChange={(e) =>
                            setBackupSelection((prev) => ({
                              ...prev,
                              [item.key]: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 accent-[#c59a43] rounded cursor-pointer shrink-0"
                        />
                        <span className="leading-snug">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Last backup metadata + Download CTA */}
                <div className="pt-2 border-t border-current/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] opacity-75 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {inventory.lastBackupAt
                        ? `Backup terakhir: ${new Date(inventory.lastBackupAt).toLocaleString('id-ID')}`
                        : 'Belum pernah mengunduh backup lokal'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={!hasAnySelection}
                      onClick={() => void handleCopyBackupJson()}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${subCardClass} hover:border-amber-500`}
                    >
                      {copiedJson ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>{copiedJson ? 'JSON Disalin' : 'Salin JSON'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={!hasAnySelection}
                      onClick={handleDownloadBackup}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      <HardDriveDownload className="w-4 h-4" />
                      <span>Unduh Backup JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Restore from JSON Card */}
              <div className={`p-4 rounded-2xl border space-y-3.5 ${panelClass}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#c59a43]" />
                      <h3 className="font-serif font-bold text-sm">
                        Pulihkan Data dari File Backup JSON
                      </h3>
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed">
                      Muat ulang file <code className="font-mono">.json</code> hasil backup sebelumnya saat berpindah perangkat atau setelah membersihkan cache browser.
                    </p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleSelectRestoreFile}
                  className="hidden"
                />

                {!parsedImport ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full min-h-[48px] px-4 py-3 rounded-xl border border-dashed text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${subCardClass} hover:border-[#c59a43]`}
                  >
                    <Upload className="w-4 h-4 text-[#c59a43]" />
                    <span>Pilih File Backup (.json) dari Perangkat</span>
                  </button>
                ) : (
                  <div className={`p-3.5 rounded-xl border space-y-3 ${subCardClass}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>File Backup Valid: {importFileName}</span>
                        </div>
                        <div className="text-[11px] opacity-75 mt-0.5 font-mono">
                          Dibuat: {new Date(parsedImport.exportedAt).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setParsedImport(null);
                          setImportFileName('');
                        }}
                        className="p-1 rounded-lg hover:bg-current/10 cursor-pointer"
                        aria-label="Batalkan pilihan file backup"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs font-mono tabular-nums">
                      <div className="p-2 rounded-lg border border-current/10">
                        <div className="text-[10px] opacity-70">Anotasi</div>
                        <div className="font-bold">{parsedImport.annotationsCount}</div>
                      </div>
                      <div className="p-2 rounded-lg border border-current/10">
                        <div className="text-[10px] opacity-70">Ritual</div>
                        <div className="font-bold">{parsedImport.ritualsCount}</div>
                      </div>
                      <div className="p-2 rounded-lg border border-current/10">
                        <div className="text-[10px] opacity-70">Iatroastrology</div>
                        <div className="font-bold">{parsedImport.iatroastrologyLogsCount}</div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold opacity-80">Mode Pemulihan:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setRestoreMode('merge')}
                          className={`min-h-[40px] px-3 py-2 rounded-xl border text-left cursor-pointer transition-colors ${
                            restoreMode === 'merge'
                              ? 'border-emerald-500 bg-emerald-500/15 font-bold'
                              : 'border-current/15 opacity-80'
                          }`}
                        >
                          Gabungkan (Merge — Aman)
                        </button>
                        <button
                          type="button"
                          onClick={() => setRestoreMode('replace')}
                          className={`min-h-[40px] px-3 py-2 rounded-xl border text-left cursor-pointer transition-colors ${
                            restoreMode === 'replace'
                              ? 'border-rose-500 bg-rose-500/15 font-bold'
                              : 'border-current/15 opacity-80'
                          }`}
                        >
                          Timpa Data Lama (Replace)
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setParsedImport(null);
                          setImportFileName('');
                        }}
                        className="min-h-[42px] px-3.5 py-2 rounded-xl border border-current/20 text-xs font-semibold hover:bg-current/10 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmRestore}
                        className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer ${
                          restoreMode === 'replace'
                            ? 'bg-rose-600 hover:bg-rose-500'
                            : 'bg-emerald-600 hover:bg-emerald-500'
                        }`}
                      >
                        {restoreMode === 'replace'
                          ? 'Konfirmasi Timpa & Pulihkan'
                          : 'Konfirmasi Gabungkan Data'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== SECTION 2: FONT ARAB & TEMA ==================== */}
          {activeSection === 'appearance' && (
            <div className="space-y-4">
              {onChangeTheme && (
                <div className={`p-4 rounded-2xl border space-y-3 ${panelClass}`}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif font-bold text-sm flex items-center gap-2">
                      {isNight ? (
                        <Moon className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-600" />
                      )}
                      <span>Tema Tampilan Aplikasi</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => onChangeTheme('night')}
                      className={`min-h-[48px] px-3.5 py-2.5 rounded-xl border flex items-center justify-center gap-2 font-semibold cursor-pointer ${
                        isNight
                          ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#c59a43]'
                          : `${subCardClass} opacity-80`
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      <span>Mode Malam (Observatorium)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeTheme('parchment')}
                      className={`min-h-[48px] px-3.5 py-2.5 rounded-xl border flex items-center justify-center gap-2 font-semibold cursor-pointer ${
                        !isNight
                          ? 'bg-[#c59a43]/20 border-[#c59a43] text-[#825c1d]'
                          : `${subCardClass} opacity-80`
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      <span>Mode Kertas (Manuskrip)</span>
                    </button>
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-2xl border space-y-3 ${panelClass}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-[#c59a43]" />
                    <h3 className="font-serif font-bold text-sm">
                      Pilihan Gaya Font Arab Global
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono opacity-75">
                    Tersimpan Otomatis
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ARABIC_FONT_PRESETS.map((preset) => {
                    const selected = preset.id === arabicFontId;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onChangeArabicFont(preset.id)}
                        className={`min-h-[56px] p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#c59a43]/20 border-[#c59a43] shadow-sm'
                            : isNight
                            ? 'bg-[#0e1422] border-[#24324d] hover:border-[#c59a43]/50'
                            : 'bg-white/80 border-[#dacdb2] hover:border-[#c59a43]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold">{preset.name}</span>
                          {selected && (
                            <Check className="w-3.5 h-3.5 text-[#c59a43] shrink-0" />
                          )}
                        </div>
                        <div
                          dir="rtl"
                          className="text-lg text-[#c59a43] mt-1 leading-relaxed"
                          style={{
                            fontFamily: preset.cssFamily,
                            letterSpacing: 0,
                          }}
                        >
                          {preset.arabicLabel}
                        </div>
                        <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== SECTION 3: PUBLIKASI s.id ==================== */}
          {activeSection === 'publish' && (
            <div className={`p-4 rounded-2xl border space-y-3.5 ${panelClass}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-serif font-bold text-sm">
                    Tautan Publik untuk Shortlink / Microsite s.id
                  </h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isDevPreviewUrl
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isDevPreviewUrl ? 'Mode Preview' : 'URL Publik Aktif'}
                </span>
              </div>

              {isDevPreviewUrl ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Gunakan Tautan Shared App sebelum ditempel ke s.id</span>
                  </div>
                  <p className="opacity-85 leading-relaxed">
                    Saat ini Anda membuka tautan editor (<code className="font-mono">ais-dev-</code>). Agar pengunjung dari <strong>s.id</strong> bisa membuka aplikasi tanpa login, klik tombol <strong>Share App / Publish</strong> di AI Studio lalu gunakan URL publik (<code className="font-mono">ais-pre-...run.app</code>) di bawah ini.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Tautan publik aktif dan siap ditautkan ke s.id atau dibagikan langsung.</span>
                </div>
              )}

              {/* Target URL Copy Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold opacity-80 block">
                  URL Aplikasi Target (Salin untuk s.id):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    readOnly
                    value={suggestedShareUrl}
                    className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl border text-xs font-mono select-all ${
                      isNight
                        ? 'bg-[#0b101d] border-[#263552] text-stone-200'
                        : 'bg-white border-[#dacdb2] text-stone-800'
                    }`}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(suggestedShareUrl, 'app')}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#c59a43] hover:bg-[#d4a84e] text-black text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {copiedAppUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedAppUrl ? 'Tersalin' : 'Salin URL'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isNight
                          ? 'bg-[#192338] border-[#2d3f61] hover:bg-[#22304c]'
                          : 'bg-white border-[#dacdb2] hover:bg-[#f0e7d6]'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Bagikan</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom s.id bookmark field */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold opacity-80 block">
                  Simpan Tautan s.id Anda (Opsional untuk Catatan Cepat):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customSidSlug}
                    onChange={(e) => setCustomSidSlug(e.target.value)}
                    placeholder="https://s.id/nama-tautan"
                    className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl border text-xs font-mono ${
                      isNight
                        ? 'bg-[#0b101d] border-[#263552] text-emerald-300'
                        : 'bg-white border-[#dacdb2] text-emerald-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(customSidSlug, 'sid')}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isNight
                        ? 'bg-[#192338] border-[#2d3f61] hover:bg-[#22304c]'
                        : 'bg-white border-[#dacdb2] hover:bg-[#f0e7d6]'
                    }`}
                  >
                    {copiedSidUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSidUrl ? 'Disalin' : 'Salin s.id'}</span>
                  </button>
                </div>
              </div>

              {/* 3 Jalur Deploy / Publikasi Domain s.id */}
              <div className="pt-2 border-t border-current/10 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-serif font-bold text-[#c59a43]">
                    Panduan Deploy &amp; Tautkan ke Domain s.id:
                  </div>
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: 'shortlink', label: 'Shortlink s.id' },
                        { id: 'microsite', label: 'Microsite Embed' },
                        { id: 'domain', label: 'Custom Domain' },
                      ] as const
                    ).map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setDeployMode(mode.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                          deployMode === mode.id
                            ? 'bg-[#c59a43] text-black border-[#c59a43]'
                            : 'border-current/20 opacity-80 hover:opacity-100'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {deployMode === 'shortlink' && (
                  <ol className="list-decimal list-inside space-y-1.5 opacity-85 leading-relaxed">
                    <li>
                      Pastikan aplikasi sudah dibagikan ke publik via tombol <strong>Share App</strong> sehingga tautan <code className="font-mono">ais-pre-...run.app</code> aktif untuk umum.
                    </li>
                    <li>
                      Klik <strong>Salin URL</strong> di atas, lalu buka <strong>home.s.id → Links → Create New Link</strong>.
                    </li>
                    <li>
                      Tempel URL aplikasi di kolom tujuan dan isi custom back-half (mis. <code className="font-mono">s.id/zij-sindhind</code>), lalu simpan.
                    </li>
                  </ol>
                )}

                {deployMode === 'microsite' && (
                  <div className="space-y-2">
                    <p className="opacity-85 leading-relaxed">
                      Untuk menanam aplikasi langsung di halaman <strong>Microsite s.id</strong> atau menambahkan tombol akses cepat, salin potongan kode Embed di bawah ini:
                    </p>
                    <textarea
                      readOnly
                      rows={3}
                      value={embedIframeCode}
                      className={`w-full p-2.5 rounded-xl border text-[11px] font-mono select-all ${
                        isNight
                          ? 'bg-[#0b101d] border-[#263552] text-stone-200'
                          : 'bg-white border-[#dacdb2] text-stone-800'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(embedIframeCode, 'embed')}
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                        isNight
                          ? 'bg-[#192338] border-[#2d3f61] hover:bg-[#22304c]'
                          : 'bg-white border-[#dacdb2] hover:bg-[#f0e7d6]'
                      }`}
                    >
                      {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
                      <span>{copiedEmbed ? 'Kode Embed Disalin' : 'Salin Kode Embed Microsite'}</span>
                    </button>
                  </div>
                )}

                {deployMode === 'domain' && (
                  <ol className="list-decimal list-inside space-y-1.5 opacity-85 leading-relaxed">
                    <li>
                      Jalankan <code className="font-mono">npm run build</code> untuk menghasilkan folder statis <code className="font-mono">dist/</code> (sudah dilengkapi PWA manifest &amp; Service Worker).
                    </li>
                    <li>
                      Unggah folder <code className="font-mono">dist/</code> ke <strong>Cloudflare Pages</strong>, <strong>Vercel</strong>, atau <strong>Netlify</strong> (gratis SSL HTTPS).
                    </li>
                    <li>
                      Hubungkan custom domain Anda di <strong>s.id Custom Domain</strong> atau arahkan DNS <code className="font-mono">CNAME</code> dari registrar domain <code className="font-mono">.id</code> Anda ke host statis tersebut.
                    </li>
                  </ol>
                )}

                <div className="pt-1 flex flex-wrap gap-2">
                  <a
                    href="https://home.s.id/links"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCopy(suggestedShareUrl, 'app')}
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Salin URL &amp; Buka Shortlink s.id</span>
                  </a>
                  <a
                    href="https://home.s.id/microsite"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCopy(suggestedShareUrl, 'app')}
                    className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                      isNight
                        ? 'bg-[#192338] border-emerald-500/40 text-emerald-300 hover:bg-[#22304c]'
                        : 'bg-white border-emerald-600/40 text-emerald-800 hover:bg-[#f0e7d6]'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Microsite s.id</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(whatsappShareText, 'wa')}
                    className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      isNight
                        ? 'bg-[#192338] border-[#2d3f61] hover:bg-[#22304c]'
                        : 'bg-white border-[#dacdb2] hover:bg-[#f0e7d6]'
                    }`}
                  >
                    {copiedWaText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <MessageSquare className="w-3.5 h-3.5" />}
                    <span>{copiedWaText ? 'Teks WA Disalin' : 'Salin Teks Bagikan WA'}</span>
                  </button>
                  {customSidSlug.startsWith('https://s.id/') && (
                    <a
                      href={customSidSlug}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                        isNight
                          ? 'bg-[#192338] border-[#2d3f61] hover:bg-[#22304c]'
                          : 'bg-white border-[#dacdb2] hover:bg-[#f0e7d6]'
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Uji Buka {customSidSlug.replace('https://', '')}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
