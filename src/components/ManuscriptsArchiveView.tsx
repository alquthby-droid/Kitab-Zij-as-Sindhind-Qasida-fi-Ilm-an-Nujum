import React, { useState } from 'react';
import {
  ManuscriptDocument,
  ManuscriptVerse,
  RemoteManuscriptSearchResult,
  ThemeMode,
} from '../types';
import {
  MANUSCRIPT_DOCUMENTS,
  REMOTE_ARCHIVE_CATALOG,
} from '../data/manuscriptsData';
import {
  BookOpen,
  Search,
  ExternalLink,
  BookmarkPlus,
  Layers,
  FileText,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ManuscriptsArchiveViewProps {
  theme: ThemeMode;
  onAnnotateItem: (targetType: string, targetId: string, title: string) => void;
}

export const ManuscriptsArchiveView: React.FC<ManuscriptsArchiveViewProps> = ({
  theme,
  onAnnotateItem,
}) => {
  const isNight = theme === 'night';

  const [selectedDocId, setSelectedDocId] = useState<string>('zij-as-sindhind');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('ch-chronology');
  const [remoteSearchQuery, setRemoteSearchQuery] = useState<string>('Sindhind');
  const [remoteResults, setRemoteResults] = useState<RemoteManuscriptSearchResult[]>(
    REMOTE_ARCHIVE_CATALOG
  );
  const [isSearchingApi, setIsSearchingApi] = useState<boolean>(false);
  const [comparisonTarget, setComparisonTarget] = useState<RemoteManuscriptSearchResult | null>(
    REMOTE_ARCHIVE_CATALOG[0]
  );

  const currentDoc =
    MANUSCRIPT_DOCUMENTS.find((d) => d.id === selectedDocId) || MANUSCRIPT_DOCUMENTS[0];
  const currentChapter =
    currentDoc.chapters.find((c) => c.id === selectedChapterId) || currentDoc.chapters[0];

  const handleRemoteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchingApi(true);

    setTimeout(() => {
      const q = remoteSearchQuery.toLowerCase().trim();
      const filtered = REMOTE_ARCHIVE_CATALOG.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.shelfmark.toLowerCase().includes(q) ||
          item.repositoryName.toLowerCase().includes(q)
      );
      setRemoteResults(filtered.length > 0 ? filtered : REMOTE_ARCHIVE_CATALOG);
      setIsSearchingApi(false);
    }, 350);
  };

  return (
    <div
      id="manuscripts-archive-module"
      className={`rounded-2xl border p-5 transition-all ${
        isNight
          ? 'bg-[#101420]/90 border-[#2a3449] text-[#e6ded0]'
          : 'bg-[#faf6ee] border-[#dfd6c3] text-[#2c241c] shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b pb-3 border-current/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
              خزانة المخطوطات والوثائق
            </span>
            <h2 className="text-lg font-bold font-serif">
              Arsip Naskah Kuno & Integrasi API Manuskrip Komparatif
            </h2>
          </div>
          <p className="text-xs opacity-75 mt-0.5">
            Kajian filologi teks Zij as-Sindhind, bait Qasida an-Nujum, serta perbandingan katalog digital internasional.
          </p>
        </div>

        {/* Document Switcher */}
        <div className="flex items-center gap-2">
          {MANUSCRIPT_DOCUMENTS.map((doc) => (
            <button
              key={doc.id}
              onClick={() => {
                setSelectedDocId(doc.id);
                setSelectedChapterId(doc.chapters[0].id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-medium border transition-all ${
                selectedDocId === doc.id
                  ? 'bg-[#c59a43] text-black border-[#c59a43] shadow-sm font-bold'
                  : isNight
                  ? 'bg-[#172033] hover:bg-[#1e2a44] text-[#cbd5e1] border-[#293852]'
                  : 'bg-[#ece4d2] hover:bg-[#e2d8c3] text-[#524536] border-[#dacdb5]'
              }`}
            >
              {doc.titleLatin.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Document Reader & Right Comparison / API Tool */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Column: Manuscript Folios & Verses (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          {/* Metadata Card */}
          <div
            className={`p-4 rounded-xl border ${
              isNight ? 'bg-[#131b2c] border-[#2a3854]' : 'bg-[#f6f1e3] border-[#ded4bd]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-base leading-snug">
                  {currentDoc.titleLatin}
                </h3>
                <p className="font-serif text-sm text-[#c59a43]" dir="rtl">
                  {currentDoc.titleArabic}
                </p>
                <p className="text-xs opacity-80 mt-1">
                  Penyusun: <span className="font-medium">{currentDoc.authorLatin}</span>
                </p>
              </div>

              <button
                onClick={() =>
                  onAnnotateItem('manuscript', currentDoc.id, currentDoc.titleLatin)
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors shrink-0 ${
                  isNight
                    ? 'bg-[#1e2a44] hover:bg-[#c59a43] hover:text-black text-[#c59a43] border border-[#314368]'
                    : 'bg-[#ebe1cf] hover:bg-[#c59a43] hover:text-black text-[#855914] border border-[#d5c6ab]'
                }`}
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                Anotasi Naskah
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-current/10 text-[11px]">
              <div>
                <span className="opacity-70 block">Repositori & Shelfmark:</span>
                <span className="font-mono">{currentDoc.shelfmark}</span>
              </div>
              <div>
                <span className="opacity-70 block">Masa Penulisan:</span>
                <span>{currentDoc.dateEra}</span>
              </div>
            </div>

            {/* Chapter Selection Pills */}
            <div className="mt-3 pt-3 border-t border-current/10 flex flex-wrap gap-1.5">
              {currentDoc.chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-serif transition-colors ${
                    selectedChapterId === ch.id
                      ? 'bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/50 font-bold'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {ch.titleLatin.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Content & Verses */}
          <div className="flex flex-col gap-3">
            {currentChapter.versesOrPassages.map((verse) => (
              <div
                key={verse.id}
                className={`p-4 rounded-xl border transition-all ${
                  isNight
                    ? 'bg-[#121927] border-[#25324a]'
                    : 'bg-[#faf6ee] border-[#e2d8c3]'
                }`}
              >
                {/* Verse Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-current/10">
                    Bait #{verse.verseNumber} • {verse.meter}
                  </span>

                  <button
                    onClick={() =>
                      onAnnotateItem(
                        'verse',
                        verse.id,
                        `${currentDoc.titleLatin} - Bait ${verse.verseNumber}`
                      )
                    }
                    className="text-xs opacity-70 hover:opacity-100 hover:text-[#c59a43] flex items-center gap-1"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    Catat
                  </button>
                </div>

                {/* Arabic Calligraphy Text */}
                <div
                  dir="rtl"
                  className="p-3 rounded-lg mb-3 leading-relaxed font-serif text-base text-[#c59a43] bg-current/5 border border-current/10"
                >
                  {verse.arabicText}
                </div>

                {/* Transliteration */}
                <p className="text-xs font-mono opacity-80 italic mb-2">
                  {verse.transliteration}
                </p>

                {/* Indonesian Translation */}
                <div className="text-xs font-serif mb-2 leading-relaxed">
                  <span className="font-semibold block text-[11px] opacity-75 mb-0.5">
                    Terjemahan Akademik (Indonesia):
                  </span>
                  {verse.translationId}
                </div>

                {/* Commentary */}
                <div
                  className={`p-2.5 rounded-lg text-[11px] leading-relaxed border ${
                    isNight
                      ? 'bg-[#0e1420] border-[#1e2a40] text-[#94a3b8]'
                      : 'bg-[#f4efe3] border-[#ded4be] text-[#554b3f]'
                  }`}
                >
                  <span className="font-semibold block text-[#c59a43] mb-0.5">
                    Komentar Filologis & Kaidah Falak:
                  </span>
                  {verse.commentary}
                </div>
              </div>
            ))}
          </div>

          {/* Featured Folios of Document */}
          <div
            className={`p-4 rounded-xl border ${
              isNight ? 'bg-[#111724] border-[#233047]' : 'bg-[#f6f0e2] border-[#ddd3bc]'
            }`}
          >
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider mb-2 text-[#c59a43] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Transkripsi Folio Manuskrip Terpilih ({currentDoc.featuredFolios.length} Lembaran):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentDoc.featuredFolios.map((folio, idx) => (
                <div
                  key={`folio-${idx}`}
                  className={`p-3 rounded-lg border text-xs ${
                    isNight
                      ? 'bg-[#0d121c] border-[#1e283b]'
                      : 'bg-[#ffffff] border-[#e2d8c3]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-semibold text-[11px] text-[#38bdf8] mb-1">
                    <span>{folio.folioNumber}</span>
                    <span className="text-[10px] opacity-75 font-serif font-normal">
                      {folio.diagramType}
                    </span>
                  </div>
                  <p className="font-serif text-xs opacity-90 line-clamp-3 mb-1" dir="rtl">
                    {folio.transcription}
                  </p>
                  <p className="text-[11px] opacity-75 line-clamp-2">
                    {folio.translation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Remote Archive API & Side-by-side Inspection (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          {/* API Search Box */}
          <div
            className={`p-4 rounded-xl border ${
              isNight ? 'bg-[#131b2c] border-[#2a3854]' : 'bg-[#f6f1e3] border-[#ded4bd]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-[#c59a43]" />
              <h3 className="font-serif font-bold text-sm">
                Integrasi API Basis Data Naskah Kuno Internasional
              </h3>
            </div>
            <p className="text-xs opacity-75 mb-3">
              Pencarian metadata terdistribusi pada arsip digital BnF Gallica, Digital Bodleian, dan British Library / QDL.
            </p>

            <form onSubmit={handleRemoteSearch} className="flex gap-2">
              <input
                type="text"
                value={remoteSearchQuery}
                onChange={(e) => setRemoteSearchQuery(e.target.value)}
                placeholder="Cari shelfmark, naskah, atau judul..."
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs ${
                  isNight
                    ? 'bg-[#0b0f17] border-[#2d3a54] text-[#e2e8f0]'
                    : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                }`}
              />
              <button
                type="submit"
                disabled={isSearchingApi}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#c59a43] text-black hover:bg-[#d6aa52] transition-colors"
              >
                {isSearchingApi ? 'Mencari...' : 'Cari API'}
              </button>
            </form>
          </div>

          {/* Remote API Search Results List */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-serif font-medium opacity-80">
              Hasil Katalog Digital ({remoteResults.length} Rekod Naskah):
            </span>

            {remoteResults.map((item) => {
              const isSelected = comparisonTarget?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setComparisonTarget(item)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#c59a43] bg-[#c59a43]/10 ring-1 ring-[#c59a43]/50'
                      : isNight
                      ? 'bg-[#101624] border-[#222f46] hover:border-[#344563]'
                      : 'bg-[#faf6ee] border-[#dfd5c0] hover:border-[#cbbea3]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-current/10 font-semibold text-[#38bdf8]">
                        {item.shelfmark}
                      </span>
                      <h4 className="font-serif font-bold text-xs mt-1 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] opacity-75 mt-0.5">
                        {item.repositoryName} ({item.city}) • {item.date}
                      </p>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#c59a43] shrink-0" />
                    )}
                  </div>

                  <p className="text-xs opacity-80 mt-2 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10 text-[10px]">
                    <span className="text-[#c59a43] font-medium">
                      {item.relevance}
                    </span>
                    {item.iiifManifestUrl && (
                      <span className="font-mono opacity-60 flex items-center gap-1">
                        IIIF API <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparative Analysis Box */}
          {comparisonTarget && (
            <div
              className={`p-4 rounded-xl border ${
                isNight
                  ? 'bg-[#141d30] border-[#2e3e60]'
                  : 'bg-[#f5ede0] border-[#d8cca8]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-xs text-[#c59a43] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Perbandingan Teks & Varian Bacaan
                </span>
                <button
                  onClick={() =>
                    onAnnotateItem(
                      'manuscript',
                      comparisonTarget.id,
                      `Perbandingan: ${comparisonTarget.shelfmark}`
                    )
                  }
                  className="text-xs text-[#c59a43] hover:underline flex items-center gap-1"
                >
                  <BookmarkPlus className="w-3 h-3" />
                  Anotasi Komparasi
                </button>
              </div>

              <div className="text-xs space-y-2 leading-relaxed">
                <div>
                  <span className="opacity-70 block text-[10px]">
                    Naskah Utama di Layar:
                  </span>
                  <span className="font-semibold">{currentDoc.titleLatin}</span>
                </div>
                <div>
                  <span className="opacity-70 block text-[10px]">
                    Naskah Pembanding Terpilih:
                  </span>
                  <span className="font-semibold font-mono text-[#38bdf8]">
                    {comparisonTarget.shelfmark} ({comparisonTarget.repositoryName})
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded-lg border text-[11px] ${
                    isNight
                      ? 'bg-[#0d131f] border-[#23314c] text-[#cbd5e1]'
                      : 'bg-white border-[#dcd0b8] text-[#334155]'
                  }`}
                >
                  <span className="font-semibold block mb-0.5 text-[#eab308]">
                    Catatan Varian Filologis:
                  </span>
                  Salinan {comparisonTarget.shelfmark} mempertahankan parameter radius R=150
                  sesuai terjemahan Adelard of Bath, sedangkan naskah Paris Arabe 2478
                  menggunakan modifikasi R=60 dari tradisi Al-Battani. Hal ini membuktikan
                  proses akulturasi ilmu falak Andalusia dengan risalah as-Sindhind orisinal Baghdad.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
