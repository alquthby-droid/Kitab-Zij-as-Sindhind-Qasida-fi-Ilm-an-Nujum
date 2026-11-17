import React, { useState } from 'react';
import { Download, Smartphone, Share2, X, MoreVertical, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ThemeMode } from '../types';

interface PWAInstallButtonProps {
  theme: ThemeMode;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  theme,
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState<'ios' | 'android' | null>(null);
  const isNight = theme === 'night';

  // Suppress button when already running in standalone installed mode
  if (isInstalled) {
    return null;
  }

  // Native Chromium / Android / Desktop install prompt available
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 ${
          isNight
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
            : 'bg-emerald-700 hover:bg-emerald-600 text-white'
        }`}
        title="Pasang aplikasi ke Layar Utama perangkat"
        aria-label="Pasang Aplikasi"
      >
        <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
        <span className={compact ? 'hidden sm:inline' : ''}>Pasang App</span>
      </button>
    );
  }

  // iOS Safari & Android manual Add-to-Home-Screen fallback
  if (isIOS || isAndroid) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowGuideModal(isIOS ? 'ios' : 'android')}
          className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm active:scale-95 ${
            isNight
              ? 'bg-emerald-950/60 hover:bg-emerald-900/70 border-emerald-500/40 text-emerald-300'
              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-600/35 text-emerald-800'
          }`}
          title={isIOS ? 'Panduan Pasang di iPhone / iPad' : 'Panduan Pasang di Android'}
          aria-label={isIOS ? 'Pasang di iOS' : 'Pasang di Android'}
        >
          <Smartphone className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className={compact ? 'hidden sm:inline' : ''}>
            {isIOS ? 'Pasang iOS' : 'Pasang Android'}
          </span>
        </button>

        {showGuideModal && (
          <div
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowGuideModal(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl border p-5 shadow-2xl pb-safe space-y-4 ${
                isNight
                  ? 'bg-[#101626] border-[#263552] text-[#e6ded0]'
                  : 'bg-[#faf6ee] border-[#dacdb2] text-[#2c2419]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#c59a43]">
                      {showGuideModal === 'ios'
                        ? 'Pasang di iPhone / iPad (iOS)'
                        : 'Pasang di Perangkat Android'}
                    </h3>
                    <p className="text-[11px] opacity-75">
                      Mode aplikasi mandiri &amp; akses offline
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(null)}
                  className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center border border-current/15 hover:bg-current/10"
                  aria-label="Tutup panduan instalasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {showGuideModal === 'ios' ? (
                <ol className="space-y-2.5 text-xs leading-relaxed">
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-current/5 border border-current/10">
                    <Share2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>
                      1. Buka aplikasi melalui <strong>Safari</strong>, lalu ketuk tombol{' '}
                      <strong>Bagikan (Share)</strong> di bilah bawah/atas.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-current/5 border border-current/10">
                    <PlusSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      2. Gulir ke bawah dan pilih{' '}
                      <strong>&ldquo;Tambah ke Layar Utama&rdquo; (Add to Home Screen)</strong>, lalu ketuk{' '}
                      <strong>Tambah</strong>.
                    </span>
                  </li>
                </ol>
              ) : (
                <ol className="space-y-2.5 text-xs leading-relaxed">
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-current/5 border border-current/10">
                    <MoreVertical className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      1. Buka tautan publik aplikasi di <strong>Google Chrome / Edge</strong>, lalu ketuk ikon menu{' '}
                      <strong>⋮</strong> di pojok kanan atas.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-current/5 border border-current/10">
                    <Download className="w-4 h-4 text-[#c59a43] shrink-0 mt-0.5" />
                    <span>
                      2. Pilih <strong>&ldquo;Instal Aplikasi&rdquo;</strong> atau{' '}
                      <strong>&ldquo;Tambahkan ke Layar Utama&rdquo;</strong> untuk memasang ikon mandiri.
                    </span>
                  </li>
                </ol>
              )}

              <button
                type="button"
                onClick={() => setShowGuideModal(null)}
                className="w-full min-h-[44px] rounded-xl bg-[#c59a43] hover:bg-[#d4a84e] text-black font-bold text-xs transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
