import React, { useState } from 'react';
import { ResearchAnnotation, ThemeMode } from '../types';
import {
  saveAnnotation,
  deleteAnnotation,
} from '../lib/annotationsStorage';
import {
  Bookmark,
  Plus,
  Trash2,
  Tag,
  Calendar,
  FileText,
  Search,
  Check,
  Edit3,
} from 'lucide-react';

interface ResearchAnnotationsViewProps {
  annotations: ResearchAnnotation[];
  theme: ThemeMode;
  onRefreshAnnotations: () => void;
  initialTarget?: {
    type: 'manuscript' | 'verse' | 'planet' | 'horoscope' | 'date_epoch';
    id: string;
    title: string;
  };
}

export const ResearchAnnotationsView: React.FC<ResearchAnnotationsViewProps> = ({
  annotations,
  theme,
  onRefreshAnnotations,
  initialTarget,
}) => {
  const isNight = theme === 'night';

  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [targetType, setTargetType] = useState<ResearchAnnotation['targetType']>(
    initialTarget?.type || 'manuscript'
  );
  const [targetTitle, setTargetTitle] = useState<string>(
    initialTarget?.title || 'Zij as-Sindhind al-Kabir'
  );
  const [authorName, setAuthorName] = useState<string>('Peneliti Falak');
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('Filologi, Zij, Ahkam');
  const [citation, setCitation] = useState<string>('');

  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  const allTags = Array.from(
    new Set(annotations.flatMap((a) => a.tags || []))
  );

  const filteredAnnotations = annotations.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ann.targetTitle.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesTag = !selectedTag || (ann.tags && ann.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setNoteTitle('');
    setContent('');
    setCitation('');
    if (initialTarget) {
      setTargetType(initialTarget.type);
      setTargetTitle(initialTarget.title);
    }
    setIsEditorOpen(true);
  };

  const handleEdit = (ann: ResearchAnnotation) => {
    setEditingId(ann.id);
    setTargetType(ann.targetType);
    setTargetTitle(ann.targetTitle);
    setAuthorName(ann.authorName);
    setNoteTitle(ann.title);
    setContent(ann.content);
    setTagsInput((ann.tags || []).join(', '));
    setCitation(ann.referenceCitation || '');
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus catatan penelitian ini?')) {
      deleteAnnotation(id);
      onRefreshAnnotations();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    saveAnnotation({
      id: editingId || undefined,
      targetType,
      targetId: editingId ? targetTitle : initialTarget?.id || targetType,
      targetTitle,
      authorName: authorName.trim() || 'Peneliti Falak',
      title: noteTitle.trim(),
      content: content.trim(),
      tags,
      referenceCitation: citation.trim() || undefined,
    });

    setIsEditorOpen(false);
    onRefreshAnnotations();
  };

  return (
    <div
      id="research-annotations-workspace"
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
              التعليقات وهوامش التحقيق
            </span>
            <h2 className="text-lg font-bold font-serif">
              Anotasi Riset Pribadi & Catatan Filologi Peneliti
            </h2>
          </div>
          <p className="text-xs opacity-75 mt-0.5">
            Menyimpan catatan marginalia, kutipan sumber primer, dan ulasan hisab astrologi klasik.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#c59a43] text-black hover:bg-[#d6aa52] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tulis Catatan Riset Baru
        </button>
      </div>

      {/* Editor Modal / Card */}
      {isEditorOpen && (
        <form
          onSubmit={handleSubmit}
          className={`p-5 rounded-2xl border mb-6 transition-all ${
            isNight
              ? 'bg-[#141d2f] border-[#2e4063]'
              : 'bg-[#f7f1e4] border-[#d8cca8]'
          }`}
        >
          <div className="flex items-center justify-between mb-4 border-b pb-2 border-current/10">
            <h3 className="font-serif font-bold text-sm text-[#c59a43]">
              {editingId ? 'Edit Catatan Riset' : 'Tulis Anotasi Baru'}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-xs">
            <div>
              <label className="block text-[11px] opacity-75 mb-1">
                Kategori Objek:
              </label>
              <select
                value={targetType}
                onChange={(e) =>
                  setTargetType(e.target.value as ResearchAnnotation['targetType'])
                }
                className={`w-full p-2 rounded-lg border ${
                  isNight
                    ? 'bg-[#0d121c] border-[#2c3952] text-[#f1f5f9]'
                    : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                }`}
              >
                <option value="manuscript">Naskah Manuskrip</option>
                <option value="verse">Bait Syair (Qasida)</option>
                <option value="planet">Planet & Koordinat</option>
                <option value="horoscope">Bagan Astrologi</option>
                <option value="date_epoch">Tarikh & Kalender</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] opacity-75 mb-1">
                Nama Objek / Rujukan:
              </label>
              <input
                type="text"
                value={targetTitle}
                onChange={(e) => setTargetTitle(e.target.value)}
                placeholder="Contoh: Zij as-Sindhind Folio 9b..."
                className={`w-full p-2 rounded-lg border ${
                  isNight
                    ? 'bg-[#0d121c] border-[#2c3952] text-[#f1f5f9]'
                    : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] opacity-75 mb-1">
                Nama Peneliti:
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className={`w-full p-2 rounded-lg border ${
                  isNight
                    ? 'bg-[#0d121c] border-[#2c3952] text-[#f1f5f9]'
                    : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                }`}
              />
            </div>
          </div>

          <div className="mb-3 text-xs">
            <label className="block text-[11px] opacity-75 mb-1">
              Judul Anotasi:
            </label>
            <input
              type="text"
              required
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Ringkasan poin temuan penelitian..."
              className={`w-full p-2 rounded-lg border font-semibold ${
                isNight
                  ? 'bg-[#0d121c] border-[#2c3952] text-[#f1f5f9]'
                  : 'bg-white border-[#d2c5aa] text-[#1e293b]'
              }`}
            />
          </div>

          <div className="mb-3 text-xs">
            <label className="block text-[11px] opacity-75 mb-1">
              Isi Catatan & Ulasan Ilmiah:
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan analisis, perbandingan teks, varian rumus ta'dil, atau korelasi historis..."
              className={`w-full p-2.5 rounded-lg border leading-relaxed ${
                isNight
                  ? 'bg-[#0d121c] border-[#2c3952] text-[#f1f5f9]'
                  : 'bg-white border-[#d2c5aa] text-[#1e293b]'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
            <div>
              <label className="block text-[11px] opacity-75 mb-1">
                Kata Kunci / Tag (pisahkan dengan koma):
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ahargana, Sindhind, BnF 2478"
                className={`w-full p-2 rounded-lg border ${
                  isNight
                    ? 'bg-[#0d121c] border-[#2c3952] text-[#f1f5f9]'
                    : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] opacity-75 mb-1">
                Rujukan Sitasi / Naskah:
              </label>
              <input
                type="text"
                value={citation}
                onChange={(e) => setCitation(e.target.value)}
                placeholder="Al-Khwarizmi, Zij as-Sindhind, bab 1; Neugebauer 1962"
                className={`w-full p-2 rounded-lg border ${
                  isNight
                    ? 'bg-[#0d121c] border-[#2c3952] text-[#f1f5f9]'
                    : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="px-4 py-2 rounded-lg text-xs opacity-80 hover:opacity-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#c59a43] text-black hover:bg-[#d6aa52]"
            >
              Simpan Anotasi Riset
            </button>
          </div>
        </form>
      )}

      {/* Filter and Tag Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 opacity-60" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Cari dalam catatan riset..."
            className={`w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs ${
              isNight
                ? 'bg-[#0d121c] border-[#26324a] text-[#e2e8f0]'
                : 'bg-white border-[#d6c7aa] text-[#1e293b]'
            }`}
          />
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-2.5 py-1 rounded-md text-[11px] ${
              !selectedTag
                ? 'bg-[#c59a43] text-black font-semibold'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Semua Tag ({annotations.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
              className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                selectedTag === tag
                  ? 'bg-[#c59a43] text-black border-[#c59a43] font-semibold'
                  : isNight
                  ? 'bg-[#151c2c] border-[#253249] text-[#94a3b8]'
                  : 'bg-[#ede5d5] border-[#d4c6a9] text-[#4d4234]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Annotations List */}
      <div className="flex flex-col gap-3">
        {filteredAnnotations.length === 0 ? (
          <div className="text-center py-10 opacity-60 text-xs">
            Belum ada catatan riset yang sesuai. Silakan klik tombol "Tulis Catatan Riset Baru" di atas.
          </div>
        ) : (
          filteredAnnotations.map((ann) => (
            <div
              key={ann.id}
              className={`p-4 rounded-xl border transition-all ${
                isNight
                  ? 'bg-[#121927] border-[#233149] hover:border-[#384c70]'
                  : 'bg-[#faf6ee] border-[#ded4be] hover:border-[#cbbea3]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[#c59a43]/15 text-[#c59a43]">
                      {ann.targetType}
                    </span>
                    <span className="text-xs font-semibold opacity-80">
                      Rujukan: {ann.targetTitle}
                    </span>
                    <span className="text-[11px] opacity-60">
                      • Oleh {ann.authorName}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#c59a43]">
                    {ann.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleEdit(ann)}
                    className="p-1.5 rounded hover:bg-current/10 text-xs opacity-75 hover:opacity-100"
                    title="Edit catatan"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1.5 rounded hover:bg-rose-500/20 text-rose-500 text-xs opacity-75 hover:opacity-100"
                    title="Hapus catatan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="mt-2 text-xs font-serif leading-relaxed opacity-90 whitespace-pre-wrap">
                {ann.content}
              </p>

              {ann.referenceCitation && (
                <div className="mt-2 text-[11px] opacity-75 italic font-mono border-l-2 border-[#c59a43] pl-2">
                  Sitasi: {ann.referenceCitation}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-current/10 text-[10px]">
                <Tag className="w-3 h-3 opacity-60" />
                {(ann.tags || []).map((t, idx) => (
                  <span
                    key={`tag-${idx}`}
                    className="px-1.5 py-0.5 rounded bg-current/10 opacity-80"
                  >
                    #{t}
                  </span>
                ))}
                <span className="ml-auto text-[10px] opacity-50 font-mono">
                  {new Date(ann.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
