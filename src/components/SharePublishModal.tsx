import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { ThemeMode } from '../types';
import {
  ARABIC_FONT_PRESETS,
  GlobalArabicFontId,
} from '../lib/arabicFonts';

interface SharePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  arabicFontId: GlobalArabicFontId;
  onChangeArabicFont: (id: GlobalArabicFontId) => void;
}

const SID_LINK_STORAGE_KEY = 'sindhind_custom_sid_link_v1';

export const SharePublishModal: React.FC<SharePublishModalProps> = ({
  isOpen,
  onClose,
  theme,
  arabicFontId,
  onChangeArabicFont,
}) => {
  const isNight = theme === 'night';
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [copiedSidUrl, setCopiedSidUrl] = useState(false);
  const [customSidSlug, setCustomSidSlug] = useState<string>(() => {
    try {
      return localStorage.getItem(SID_LINK_STORAGE_KEY) || 'https://s.id/zij-sindhind';
    } catch {
      return 'https://s.id/zij-sindhind';
    }
  });

  const currentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '';
  const isDevPreviewUrl = currentUrl.includes('ais-dev-');
  const suggestedShareUrl = isDevPreviewUrl
    ? currentUrl.replace('ais-dev-', 'ais-pre-')
    : currentUrl;

  useEffect(() => {
    try {
      localStorage.setItem(SID_LINK_STORAGE_KEY, customSidSlug);
    } catch {
      // ignore storage errors
    }
  }, [customSidSlug]);

  if (!isOpen) return null;

  const handleCopy = async (text: string, target: 'app' | 'sid') => {
    try {
      await navigator.clipboard.writeText(text);
      if (target === 'app') {
        setCopiedAppUrl(true);
        setTimeout(() => setCopiedAppUrl(false), 2000);
      } else {
        setCopiedSidUrl(true);
        setTimeout(() => setCopiedSidUrl(false), 2000);
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border shadow-2xl pb-safe ${
          isNight
            ? 'bg-[#0f1524] border-[#263552] text-[#e6ded0]'
            : 'bg-[#faf6ee] border-[#dacdb2] text-[#2c2419]'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-current/10 backdrop-blur-md bg-inherit">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#c59a43]/20 border border-[#c59a43]/40 flex items-center justify-center text-[#c59a43]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#c59a43]">
                Publikasi s.id &amp; Pengaturan Font Arab
              </h2>
              <p className="text-[11px] opacity-75">
                Siap dibagikan ke shortlink/microsite s.id, WhatsApp, &amp; perangkat seluler
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center border border-current/15 hover:bg-current/10"
            aria-label="Tutup modal publikasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Section 1: Arabic Typography Picker */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isNight ? 'bg-[#141c2f] border-[#25344f]' : 'bg-[#f4ede0] border-[#dfd3bc]'
            }`}
          >
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
                    className={`min-h-[56px] p-3 rounded-xl border text-left transition-all ${
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

          {/* Section 2: Publish to s.id */}
          <div
            className={`p-4 rounded-2xl border space-y-3.5 ${
              isNight ? 'bg-[#141c2f] border-[#25344f]' : 'bg-[#f4ede0] border-[#dfd3bc]'
            }`}
          >
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
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#c59a43] hover:bg-[#d4a84e] text-black text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    {copiedAppUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAppUrl ? 'Tersalin' : 'Salin URL'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
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
                  className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
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

            {/* 3-step s.id publish guide + direct anchor */}
            <div className="pt-2 border-t border-current/10 space-y-2.5 text-xs">
              <div className="font-serif font-bold text-[#c59a43]">
                Langkah Publish ke s.id:
              </div>
              <ol className="list-decimal list-inside space-y-1 opacity-85 leading-relaxed">
                <li>
                  Pastikan tombol <strong>Share</strong> di Google AI Studio aktif agar URL publik (<code className="font-mono">ais-pre-...</code>) dapat dibuka umum.
                </li>
                <li>
                  Klik <strong>Salin URL</strong> di atas, lalu masuk ke dashboard <strong>s.id</strong> untuk membuat <em>Shortlink</em> atau komponen tombol di <em>Microsite s.id</em>.
                </li>
                <li>
                  Metadata OpenGraph, ikon astrolab, dan tata letak seluler Android/iOS sudah dikonfigurasi agar tampil rapi saat link <code className="font-mono">s.id</code> Anda dibagikan.
                </li>
              </ol>

              <div className="pt-1 flex flex-wrap gap-2">
                <a
                  href="https://home.s.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Dashboard s.id</span>
                </a>
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
        </div>
      </div>
    </div>
  );
};
