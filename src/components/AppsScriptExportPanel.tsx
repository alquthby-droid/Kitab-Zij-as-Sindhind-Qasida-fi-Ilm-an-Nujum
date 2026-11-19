import React, { useMemo, useState } from 'react';
import {
  Code2,
  FileCode,
  Download,
  Copy,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { ThemeMode } from '../types';
import {
  AppsScriptConfig,
  DEFAULT_APPS_SCRIPT_CONFIG,
  generateCodeGs,
  generateIndexHtml,
  downloadAppsScriptFile,
} from '../lib/appsScriptTemplates';

interface AppsScriptExportPanelProps {
  theme: ThemeMode;
}

type ScriptFileTab = 'code_gs' | 'index_html';

export const AppsScriptExportPanel: React.FC<AppsScriptExportPanelProps> = ({ theme }) => {
  const isNight = theme === 'night';

  const [config, setConfig] = useState<AppsScriptConfig>(DEFAULT_APPS_SCRIPT_CONFIG);
  const [activeFile, setActiveFile] = useState<ScriptFileTab>('code_gs');
  const [showDefaultPass, setShowDefaultPass] = useState<boolean>(false);
  const [copiedTarget, setCopiedTarget] = useState<ScriptFileTab | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const codeGsContent = useMemo(() => generateCodeGs(config), [config]);
  const indexHtmlContent = useMemo(() => generateIndexHtml(config), [config]);

  const activeContent = activeFile === 'code_gs' ? codeGsContent : indexHtmlContent;
  const activeFilename = activeFile === 'code_gs' ? 'Code.gs' : 'Index.html';
  const activeLineCount = useMemo(() => activeContent.split('\n').length, [activeContent]);

  const showNotice = (msg: string) => {
    setDownloadNotice(msg);
    window.setTimeout(() => setDownloadNotice(null), 4000);
  };

  const handleDownloadCodeGs = () => {
    downloadAppsScriptFile('Code.gs', codeGsContent, 'text/javascript;charset=utf-8');
    showNotice('File Code.gs berhasil diunduh.');
  };

  const handleDownloadIndexHtml = () => {
    downloadAppsScriptFile('Index.html', indexHtmlContent, 'text/html;charset=utf-8');
    showNotice('File Index.html berhasil diunduh.');
  };

  const handleDownloadBoth = () => {
    downloadAppsScriptFile('Code.gs', codeGsContent, 'text/javascript;charset=utf-8');
    window.setTimeout(() => {
      downloadAppsScriptFile('Index.html', indexHtmlContent, 'text/html;charset=utf-8');
    }, 250);
    showNotice('File Code.gs dan Index.html telah diunduh.');
  };

  const handleCopyActive = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopiedTarget(activeFile);
      window.setTimeout(() => setCopiedTarget(null), 2200);
    } catch {
      showNotice('Salin otomatis diblokir browser. Gunakan tombol Download di atas.');
    }
  };

  const handleResetDefault = () => {
    setConfig(DEFAULT_APPS_SCRIPT_CONFIG);
    showNotice('Pengaturan dikembalikan ke default (Husni75 / 12345678).');
  };

  const cardSurface = isNight
    ? 'bg-[#101624] border-[#212e46] text-[#e5dccb]'
    : 'bg-[#faf6ee] border-[#dacdb2] text-[#2c2419]';

  const subSurface = isNight
    ? 'bg-[#0b101b] border-[#1d283e]'
    : 'bg-white border-[#e2d6bd]';

  return (
    <section
      id="apps-script-download-panel"
      className={`rounded-2xl border p-4 sm:p-6 space-y-5 ${cardSurface}`}
    >
      {/* Header & Primary Download Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-current/10 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Code2 className="w-4 h-4 shrink-0" />
            <span>Google Apps Script Web App · Siap Download</span>
          </div>
          <h2 className="text-lg sm:text-xl font-serif font-bold">
            Generator File Code.gs &amp; Index.html untuk Google Sheets
          </h2>
          <p className="text-xs sm:text-sm opacity-80 max-w-3xl leading-relaxed">
            Dilengkapi autentikasi login aman (hash SHA-256 + salt di sheet <code className="font-mono">{config.usersSheetName}</code>),
            fitur <strong>Ubah Password</strong> langsung ke Google Sheet, dan panel kelola baris data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadCodeGs}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Code.gs</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadIndexHtml}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#c59a43] hover:bg-[#d4a84e] text-black text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Index.html</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadBoth}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${subSurface} hover:border-amber-500`}
          >
            <FileCode className="w-4 h-4 text-amber-500" />
            <span>Unduh Keduanya</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Configuration Grid */}
      <div className={`rounded-xl border p-4 space-y-3 ${subSurface}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>Konfigurasi Akun Default &amp; Sheet (Langsung Tertanam ke File Unduhan)</span>
          </div>
          <button
            type="button"
            onClick={handleResetDefault}
            className="text-[11px] font-semibold opacity-75 hover:opacity-100 inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset ke Husni75</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold opacity-80 block">
              User Name Default
            </label>
            <input
              type="text"
              value={config.defaultUsername}
              onChange={(e) => setConfig((prev) => ({ ...prev, defaultUsername: e.target.value }))}
              className={`w-full min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-mono ${cardSurface}`}
              placeholder="Husni75"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold opacity-80 block">
              Password Default
            </label>
            <div className="relative">
              <input
                type={showDefaultPass ? 'text' : 'password'}
                value={config.defaultPassword}
                onChange={(e) => setConfig((prev) => ({ ...prev, defaultPassword: e.target.value }))}
                className={`w-full min-h-[40px] pl-3 pr-9 py-1.5 rounded-lg border text-xs font-mono ${cardSurface}`}
                placeholder="12345678"
              />
              <button
                type="button"
                onClick={() => setShowDefaultPass((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100 cursor-pointer"
                aria-label={showDefaultPass ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showDefaultPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold opacity-80 block">
              Nama Tab Users
            </label>
            <input
              type="text"
              value={config.usersSheetName}
              onChange={(e) => setConfig((prev) => ({ ...prev, usersSheetName: e.target.value }))}
              className={`w-full min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-mono ${cardSurface}`}
              placeholder="Users"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold opacity-80 block">
              Nama Tab Data
            </label>
            <input
              type="text"
              value={config.dataSheetName}
              onChange={(e) => setConfig((prev) => ({ ...prev, dataSheetName: e.target.value }))}
              className={`w-full min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-mono ${cardSurface}`}
              placeholder="DataSheet"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold opacity-80 block">
              Judul Web App
            </label>
            <input
              type="text"
              value={config.appTitle}
              onChange={(e) => setConfig((prev) => ({ ...prev, appTitle: e.target.value }))}
              className={`w-full min-h-[40px] px-3 py-1.5 rounded-lg border text-xs ${cardSurface}`}
              placeholder="Portal Login Google Sheet"
            />
          </div>
        </div>
      </div>

      {/* Code Preview Tabs + Deployment Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Code Viewer (8 cols) */}
        <div className={`lg:col-span-8 rounded-xl border overflow-hidden ${subSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 border-b border-current/10">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveFile('code_gs')}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold font-mono cursor-pointer transition-colors ${
                  activeFile === 'code_gs'
                    ? 'bg-emerald-600 text-white'
                    : 'hover:bg-current/10 opacity-75'
                }`}
              >
                Code.gs
              </button>
              <button
                type="button"
                onClick={() => setActiveFile('index_html')}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold font-mono cursor-pointer transition-colors ${
                  activeFile === 'index_html'
                    ? 'bg-[#c59a43] text-black'
                    : 'hover:bg-current/10 opacity-75'
                }`}
              >
                Index.html
              </button>
              <span className="text-[11px] font-mono opacity-60 pl-1.5 tabular-nums">
                {activeLineCount} baris
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => void handleCopyActive()}
                className="min-h-[34px] px-2.5 py-1 rounded-lg border border-current/15 hover:border-amber-500 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copiedTarget === activeFile ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin {activeFilename}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={activeFile === 'code_gs' ? handleDownloadCodeGs : handleDownloadIndexHtml}
                className="min-h-[34px] px-2.5 py-1 rounded-lg border border-current/15 hover:border-emerald-500 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Unduh</span>
              </button>
            </div>
          </div>

          <pre className="p-4 text-[11px] sm:text-xs font-mono leading-relaxed overflow-auto max-h-[420px] select-all">
            <code>{activeContent}</code>
          </pre>
        </div>

        {/* Right: Step-by-Step Deployment Guide & Security Notes (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`rounded-xl border p-4 space-y-3 ${subSurface}`}>
            <h3 className="font-serif font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Cara Pasang di Google Sheets</span>
            </h3>
            <ol className="space-y-2.5 text-xs opacity-85 list-decimal list-inside leading-relaxed">
              <li>
                Buka Google Sheet Anda, lalu klik menu <strong>Ekstensi (Extensions) &rarr; Apps Script</strong>.
              </li>
              <li>
                Ganti seluruh isi file <strong>Code.gs</strong> dengan kode dari file <code className="font-mono">Code.gs</code> yang telah diunduh.
              </li>
              <li>
                Klik ikon <strong>+</strong> di samping <em>File</em> &rarr; pilih <strong>HTML</strong> &rarr; beri nama persis <code className="font-mono font-bold">Index</code> (otomatis menjadi <code className="font-mono">Index.html</code>), lalu tempel isi <code className="font-mono">Index.html</code>.
              </li>
              <li>
                Simpan (<code className="font-mono">Ctrl+S</code>), pilih fungsi <code className="font-mono">setupInitialSheets</code> lalu klik <strong>Jalankan (Run)</strong> sekali untuk membuat tab <code className="font-mono">{config.usersSheetName}</code> &amp; akun <code className="font-mono">{config.defaultUsername}</code>.
              </li>
              <li>
                Klik <strong>Terapkan (Deploy) &rarr; Deployment baru &rarr; Aplikasi Web</strong>. Set <em>Execute as</em>: <strong>Me</strong>, dan <em>Who has access</em>: <strong>Anyone</strong>, lalu buka URL Web App-nya.
              </li>
            </ol>
          </div>

          <div className={`rounded-xl border p-4 space-y-2 text-xs ${subSurface}`}>
            <div className="font-bold text-amber-600 dark:text-amber-400">
              Fitur Keamanan Bawaan
            </div>
            <ul className="space-y-1.5 opacity-80 leading-relaxed list-disc list-inside">
              <li>
                Password disimpan dalam bentuk <strong>Hash SHA-256 + Salt acak</strong> di tab <code className="font-mono">{config.usersSheetName}</code> (bukan teks polos).
              </li>
              <li>
                Fitur <strong>Ubah Password</strong> memverifikasi password lama, membuat salt baru, dan memperbarui Google Sheet seketika.
              </li>
              <li>
                Token sesi aktif selama 6 jam di <code className="font-mono">CacheService</code> dan dibersihkan otomatis saat klik <strong>Keluar</strong>.
              </li>
              <li>
                Tersedia menu <strong>Sistem Login Sheet &rarr; Reset Password Akun Default</strong> di Google Sheet jika lupa password.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
