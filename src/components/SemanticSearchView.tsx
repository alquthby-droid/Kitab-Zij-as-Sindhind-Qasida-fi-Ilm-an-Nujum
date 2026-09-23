import React, { useState, useMemo } from 'react';
import { SemanticSearchItem, ThemeMode } from '../types';
import {
  ARABIC_ROOTS_MAP,
  searchSemanticCorpus,
} from '../lib/semanticSearch';
import { Search, Sparkles, BookOpen, Tag, Compass, ArrowRight } from 'lucide-react';

interface SemanticSearchViewProps {
  theme: ThemeMode;
  onNavigateToResult: (item: SemanticSearchItem) => void;
}

export const SemanticSearchView: React.FC<SemanticSearchViewProps> = ({
  theme,
  onNavigateToResult,
}) => {
  const isNight = theme === 'night';
  const [query, setQuery] = useState<string>('sharaf');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = [
    'Semua',
    'Bait Syair (Poetic Verse)',
    'Bab Manuskrip',
    'Manzil Rembulan',
    'Hakikat Kawkab (Planets)',
    'Buruj Falak (Zodiac)',
  ];

  const results = useMemo(() => {
    const cat = selectedCategory === 'Semua' ? '' : selectedCategory;
    return searchSemanticCorpus(query, cat);
  }, [query, selectedCategory]);

  return (
    <div
      id="semantic-search-module"
      className={`rounded-2xl border p-5 transition-all ${
        isNight
          ? 'bg-[#101420]/90 border-[#2a3449] text-[#e6ded0]'
          : 'bg-[#faf6ee] border-[#dfd6c3] text-[#2c241c] shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b pb-3 border-current/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
              الفهرس الدلالي للمخطوطات
            </span>
            <h2 className="text-lg font-bold font-serif">
              Sistem Pencarian Indeks Semantik Falak & Manuskrip
            </h2>
          </div>
          <p className="text-xs opacity-75 mt-0.5">
            Pencarian berbasis akar kata bahasa Arab (Juzur Lughawiyyah), konsep astrologi kuno, dan bait-bait syi'ir.
          </p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 opacity-60 text-[#c59a43]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari konsep (misal: شرف, ihtiraq, ruju', nahs, manzil, ahargana)..."
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c59a43] ${
            isNight
              ? 'bg-[#0b0f17] border-[#2c3952] text-[#f1f5f9]'
              : 'bg-white border-[#d2c5aa] text-[#1e293b]'
          }`}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-3 text-xs opacity-60 hover:opacity-100"
          >
            Bersihkan
          </button>
        )}
      </div>

      {/* Semantic Root Suggestions Chips */}
      <div className="mb-4">
        <span className="text-xs font-serif opacity-75 block mb-1.5">
          Eksplorasi Berdasarkan Akar Semantik Falak (Juzur):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(ARABIC_ROOTS_MAP).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setQuery(info.terms[0])}
              className={`px-2.5 py-1 rounded-full text-xs font-serif border transition-all ${
                query.toLowerCase().includes(info.terms[0].toLowerCase())
                  ? 'bg-[#c59a43] text-black border-[#c59a43] font-bold'
                  : isNight
                  ? 'bg-[#151c2e] hover:bg-[#1f2b44] text-[#cbd5e1] border-[#293750]'
                  : 'bg-[#ede5d5] hover:bg-[#e2d8c3] text-[#4d4234] border-[#d8cca9]'
              }`}
            >
              <span className="font-bold text-[#c59a43] mr-1">{info.root}</span>
              <span>{info.terms[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-4 border-b pb-3 border-current/10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === 'Semua' ? '' : cat)}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
              (cat === 'Semua' && !selectedCategory) || selectedCategory === cat
                ? 'bg-[#c59a43] text-black font-semibold'
                : isNight
                ? 'bg-[#131a29] text-[#94a3b8] hover:text-[#f8fafc]'
                : 'bg-[#f4efe3] text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Results List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs opacity-75">
          <span>Ditemukan {results.length} rekod semantik yang relevan:</span>
          {results.length > 0 && (
            <span className="font-mono text-[11px]">
              Skor relevansi tertinggi: {results[0].relevanceScore} pts
            </span>
          )}
        </div>

        {results.length === 0 ? (
          <div className="text-center py-8 opacity-60 text-xs">
            Tidak ditemukan rekod untuk istilah "{query}". Coba cari menggunakan aksara Arab atau kata kunci seperti "sharaf", "kawkab", atau "manzil".
          </div>
        ) : (
          results.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all hover:border-[#c59a43]/60 ${
                isNight
                  ? 'bg-[#121927] border-[#233149]'
                  : 'bg-[#faf6ee] border-[#ded4be]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c59a43]/15 text-[#c59a43] font-semibold">
                      {item.category}
                    </span>
                    <span className="text-[11px] opacity-70 font-serif">
                      Sumber: {item.sourceDoc}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm mt-1">
                    {item.titleLatin}
                  </h4>
                  <p className="font-serif text-xs text-[#c59a43]" dir="rtl">
                    {item.titleArabic}
                  </p>
                </div>

                <button
                  onClick={() => onNavigateToResult(item)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors shrink-0 ${
                    isNight
                      ? 'bg-[#1b253b] hover:bg-[#c59a43] hover:text-black text-[#c59a43] border border-[#2b3a54]'
                      : 'bg-[#eee6d5] hover:bg-[#c59a43] hover:text-black text-[#7a5110] border border-[#d6c7aa]'
                  }`}
                >
                  Buka Rujukan <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Arabic snippet */}
              <div
                dir="rtl"
                className="mt-2 p-2 rounded bg-current/5 text-xs font-serif leading-relaxed text-[#c59a43]"
              >
                {item.snippetArabic}
              </div>

              {/* Latin snippet */}
              <p className="mt-1.5 text-xs opacity-80 leading-relaxed font-serif">
                {item.snippetLatin}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
