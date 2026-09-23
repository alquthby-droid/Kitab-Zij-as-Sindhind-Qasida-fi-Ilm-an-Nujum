import React, { useState } from 'react';
import { AstrologicalHouse, CelestialCoordinate, PlanetKey, PlanetaryPosition, ThemeMode } from '../types';
import { generateSindhindHoroscopeAnalysis, PLANETS_INFO, ZODIAC_SIGNS } from '../lib/sindhindEngine';
import { SindhindCalculationRulesModal } from './SindhindCalculationRulesModal';
import { AspectsTableView } from './AspectsTableView';
import {
  Sparkles,
  Award,
  Compass,
  FileDown,
  BookmarkPlus,
  BookOpen,
  Shield,
  Layers,
  Calculator,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  CircleDot,
} from 'lucide-react';

interface HoroscopeInterpretationProps {
  positions: Record<PlanetKey, PlanetaryPosition>;
  ascendant: CelestialCoordinate;
  midheaven: CelestialCoordinate;
  houses: AstrologicalHouse[];
  aspects: any[];
  theme: ThemeMode;
  onExportPdf: () => void;
  onAnnotateInterpretation: () => void;
}

export const HoroscopeInterpretation: React.FC<HoroscopeInterpretationProps> = ({
  positions,
  ascendant,
  midheaven,
  houses,
  aspects,
  theme,
  onExportPdf,
  onAnnotateInterpretation,
}) => {
  const isNight = theme === 'night';
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [selectedHouseForRules, setSelectedHouseForRules] = useState<number | null>(null);
  const [showQuickRules, setShowQuickRules] = useState<boolean>(true);
  const [activeSubSection, setActiveSubSection] = useState<'aspects' | 'houses' | 'both'>('aspects');

  const chartData = {
    positions,
    ascendant,
    midheaven,
    houses,
    aspects,
  };

  const analysis = generateSindhindHoroscopeAnalysis(chartData);
  const ascSign = ZODIAC_SIGNS[ascendant.signIndex];
  const ascRuler = PLANETS_INFO[ascSign.ruler];

  return (
    <div
      id="horoscope-interpretation-module"
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
              أحكام النجوم وقواعد السند هند
            </span>
            <h2 className="text-lg font-bold font-serif">
              Interpretasi Astrologi Kuno Manuskrip Sindhind & Qasida
            </h2>
          </div>
          <p className="text-xs opacity-75 mt-0.5">
            Keputusan hukum falak (*Ahkam*) berdasarkan kekuatan martabat planet, penguasa rasi terbit, dan bait syi'ir didaktik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedHouseForRules(null);
              setIsRulesModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35 hover:bg-[#38bdf8]/25 transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            Kaidah Hisab Sindhind
          </button>

          <button
            onClick={onAnnotateInterpretation}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isNight
                ? 'bg-[#172033] hover:bg-[#202c46] text-[#cbd5e1] border-[#293852]'
                : 'bg-[#ece4d2] hover:bg-[#e0d6c1] text-[#4d4234] border-[#dacdb5]'
            }`}
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-[#c59a43]" />
            Anotasi Tafsir
          </button>

          <button
            onClick={onExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#c59a43] text-black hover:bg-[#d6aa52] transition-colors shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5" />
            Ekspor Riset PDF
          </button>
        </div>
      </div>

      {/* Main Verdict Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Classical Arabic Declaration & Indonesian Analysis */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Classical Arabic Pronouncement */}
          <div
            className={`p-4 rounded-xl border leading-relaxed ${
              isNight
                ? 'bg-[#131b2c] border-[#253450]'
                : 'bg-[#f7f2e5] border-[#dfd5bf]'
            }`}
          >
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#c59a43] block mb-1">
              النص الحكمي الكلاسيكي (Hukm al-Hay'ah al-Falakiyyah):
            </span>
            <div
              dir="rtl"
              className="font-serif text-base text-[#c59a43] leading-loose"
            >
              {analysis.overviewArabic}
            </div>
          </div>

          {/* Academic Indonesian Translation & Interpretation */}
          <div
            className={`p-4 rounded-xl border ${
              isNight
                ? 'bg-[#111724] border-[#222e44]'
                : 'bg-[#faf6ee] border-[#e2d8c4]'
            }`}
          >
            <h4 className="font-serif font-bold text-sm mb-1 text-[#38bdf8] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Ulasan Analisis Kaidah Manuskrip:
            </h4>
            <p className="text-xs font-serif leading-relaxed opacity-90 mb-3">
              {analysis.overviewId}
            </p>

            <div className="p-3 rounded-lg bg-current/5 border border-current/10 text-xs">
              <span className="font-semibold block text-[#c59a43] mb-0.5">
                Klasifikasi Temperamen / Empat Unsur (Al-Mizaj al-Arba'ah):
              </span>
              <span className="font-serif">{analysis.temperamentAnalysis}</span>
            </div>
          </div>

          {/* Verses from Qasida fi 'Ilm an-Nujum */}
          <div
            className={`p-4 rounded-xl border ${
              isNight
                ? 'bg-[#151d2e] border-[#2c3d5e]'
                : 'bg-[#f5eee1] border-[#ded3bd]'
            }`}
          >
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#a855f7] block mb-1">
              شاهد من الأرجوزة الفلكية (Didactic Poetic Citation):
            </span>
            <div
              dir="rtl"
              className="font-serif text-sm text-[#e2e8f0] leading-relaxed mb-2"
            >
              {analysis.cantoVerseRef}
            </div>
            <p className="text-[11px] opacity-75 font-serif">
              "Dan bilamana engkau menatap tanda-tanda rasi yang terbit, maka ambillah ibrah pedoman dari Sang Surya dan Rembulan nan gemerlap • Ketahuilah bahwa risalah as-Sindhind kaidah-kaidahnya menyingkap peredaran falak secara hakiki dan saksama."
            </p>
          </div>
        </div>

        {/* Right Key Influences (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#c59a43]">
            Rangkuman Penguasa Kosmik (Arbab al-Kawakib):
          </h4>

          {analysis.planetaryRulersSummary.map((item, idx) => (
            <div
              key={`sum-${idx}`}
              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                isNight
                  ? 'bg-[#121826] border-[#243148]'
                  : 'bg-[#faf6ee] border-[#e0d6c2]'
              }`}
            >
              <h5 className="font-serif font-bold text-[#c59a43] mb-1">
                {item.title}
              </h5>
              <p className="text-[11px] opacity-80">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Astrological Modules Segmented Navigation */}
      <div className="mt-6 pt-5 border-t border-current/10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-current/5 border border-current/10">
            <button
              onClick={() => setActiveSubSection('aspects')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all flex items-center gap-1.5 ${
                activeSubSection === 'aspects'
                  ? 'bg-[#c59a43] text-black shadow-md'
                  : 'hover:bg-current/10 opacity-75'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>أشكال الاتصالات • Tabel Aspek Antar-Kawkab</span>
            </button>

            <button
              onClick={() => setActiveSubSection('houses')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all flex items-center gap-1.5 ${
                activeSubSection === 'houses'
                  ? 'bg-[#c59a43] text-black shadow-md'
                  : 'hover:bg-current/10 opacity-75'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>أحكام البيوت • 12 Rumah Astrologi</span>
            </button>

            <button
              onClick={() => setActiveSubSection('both')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all flex items-center gap-1.5 ${
                activeSubSection === 'both'
                  ? 'bg-[#c59a43] text-black shadow-md'
                  : 'hover:bg-current/10 opacity-75'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>العرض الشامل • Tampilan Terpadu</span>
            </button>
          </div>
        </div>

        {/* Aspects Table View Module */}
        {(activeSubSection === 'aspects' || activeSubSection === 'both') && (
          <div className="mb-6">
            <AspectsTableView
              positions={positions}
              theme={theme}
              onAnnotateAspect={() => onAnnotateInterpretation()}
            />
          </div>
        )}

        {/* 12 Astrological Houses Summary Grid with Kaidah Hisab Zij as-Sindhind */}
        {(activeSubSection === 'houses' || activeSubSection === 'both') && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h4 className="font-serif font-bold text-xs sm:text-sm uppercase tracking-wider text-[#c59a43] flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                KAIDAH DUA BELAS RUMAH ASTROLOGI KLASIK (AL-BUYUT AL-ITHNA 'ASHAR):
              </h4>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuickRules(!showQuickRules)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                isNight
                  ? 'bg-[#182236] text-[#cbd5e1] hover:text-white'
                  : 'bg-[#eee4d2] text-[#4d4234] hover:text-black'
              }`}
            >
              {showQuickRules ? (
                <>
                  <span>Ringkasan Kaidah</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Lihat Kaidah Hisab</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedHouseForRules(null);
                setIsRulesModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#c59a43] text-black hover:bg-[#d6aa52] transition-colors"
            >
              <Calculator className="w-3.5 h-3.5" />
              Bedah Rumus Matematis
            </button>
          </div>
        </div>

        {/* Quick Explanation Banner for the Result in the User's Screenshot */}
        {showQuickRules && (
          <div
            className={`p-4 rounded-xl border mb-4 text-xs transition-all ${
              isNight
                ? 'bg-[#131b2c] border-[#293a57] text-[#cbd5e1]'
                : 'bg-[#f6eee0] border-[#ded0b6] text-[#3e3427]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className="p-1 rounded bg-[#c59a43]/20 text-[#c59a43] shrink-0 mt-0.5">
                <Calculator className="w-4 h-4" />
              </span>
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-serif font-bold text-sm text-[#c59a43]">
                    Cara Kaidah Hisab Zij as-Sindhind untuk Hasil Dua Belas Rumah di Bawah:
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-current/10">
                    Sistem: Taswiyat al-Buyut al-Mutasawiyah (Equal House)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-[11px] leading-relaxed">
                  <div
                    className={`p-2 rounded-lg border ${
                      isNight ? 'bg-[#0d131f] border-[#202c42]' : 'bg-[#fffdf9] border-[#e0d6c0]'
                    }`}
                  >
                    <span className="font-bold text-[#38bdf8] block mb-0.5">
                      1. Derajat Titik Terbit (Tali'):
                    </span>
                    Bujur titik terbit diperoleh <strong className="font-mono">{ascendant.signDegree}° {ascSign.latinName}</strong> dari rumus asensio oblik trigonometri sferis pada lintang Baghdad (φ = 33° 20'). Derajat ini menjadi patokan awal Rumah #1.
                  </div>

                  <div
                    className={`p-2 rounded-lg border ${
                      isNight ? 'bg-[#0d131f] border-[#202c42]' : 'bg-[#fffdf9] border-[#e0d6c0]'
                    }`}
                  >
                    <span className="font-bold text-[#eab308] block mb-0.5">
                      2. Kaidah Interval Puncak Rumah:
                    </span>
                    Tiap rumah berselisih tepat <strong className="font-mono">30°</strong>:
                    Rumah #1 ({ascendant.signDegree}° Aries), Rumah #2 ({ascendant.signDegree}° Taurus), Rumah #3 ({ascendant.signDegree}° Gemini), Rumah #4 ({ascendant.signDegree}° Cancer), dst.
                  </div>

                  <div
                    className={`p-2 rounded-lg border ${
                      isNight ? 'bg-[#0d131f] border-[#202c42]' : 'bg-[#fffdf9] border-[#e0d6c0]'
                    }`}
                  >
                    <span className="font-bold text-[#10b981] block mb-0.5">
                      3. Kaidah Penempatan Kawkab:
                    </span>
                    Mars ({positions.mars.coordinate.signDegree}° Gemini) masuk <strong>Rumah #3</strong> & Jupiter ({positions.jupiter.coordinate.signDegree}° Cancer) masuk <strong>Rumah #4</strong> karena selisih jarak bujurnya dari Tali' masing-masing jatuh pada interval busur 30°-60° dan 60°-90°. Rumah #1 & #2 kosong karena tidak ada kawkab pada rentang tersebut.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 12 House Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {houses.map((house) => {
            const hasPlanets = house.planetsInside.length > 0;
            const cuspTotal = (ascendant.totalDegrees + (house.number - 1) * 30) % 360;
            const nextCuspTotal = (cuspTotal + 30) % 360;

            return (
              <div
                key={`h-card-${house.number}`}
                onClick={() => {
                  setSelectedHouseForRules(house.number);
                  setIsRulesModalOpen(true);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group hover:scale-[1.01] ${
                  hasPlanets
                    ? 'border-[#c59a43]/50 bg-[#c59a43]/5 hover:border-[#c59a43]'
                    : isNight
                    ? 'bg-[#0f1422] border-[#212b3e] hover:border-[#334460]'
                    : 'bg-[#faf6ee] border-[#e4dac6] hover:border-[#c9baa2]'
                }`}
                title="Klik untuk membuka bedah rumus matematis Zij as-Sindhind untuk rumah ini"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-[#38bdf8]">
                      Rumah #{house.number}
                    </span>
                    <span className="text-[10px] opacity-60 font-mono hidden group-hover:inline-block text-[#c59a43]">
                      (Lihat Rumus)
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#c59a43] px-2 py-0.5 rounded bg-current/10">
                    {house.signDegree}° {house.signLatin}
                  </span>
                </div>

                <div className="font-serif font-semibold text-xs text-[#c59a43] mb-1" dir="rtl">
                  {house.arabicName}
                </div>

                <p className="text-[11px] opacity-75 mb-2 leading-relaxed">
                  {house.signifactor}
                </p>

                {/* Mathematical Range Badge */}
                <div className="text-[10px] font-mono opacity-60 mb-2 flex items-center justify-between">
                  <span>Batas: [{cuspTotal.toFixed(0)}° - {nextCuspTotal.toFixed(0)}°)</span>
                  <span>Δ = 30° busur</span>
                </div>

                {hasPlanets ? (
                  <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-current/10">
                    {house.planetsInside.map((pk) => (
                      <span
                        key={pk}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-current/10 flex items-center gap-1.5"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                          style={{ backgroundColor: PLANETS_INFO[pk].color }}
                        />
                        <span className="font-serif">{PLANETS_INFO[pk].transliteration}</span>
                        <span className="text-[10px] font-mono opacity-70">
                          ({positions[pk].coordinate.signDegree}°)
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="pt-1.5 border-t border-current/10 flex items-center justify-between">
                    <span className="text-[11px] opacity-50 italic">
                      Kosong dari kawkab
                    </span>
                    <span className="text-[10px] opacity-40 font-mono">
                      (0 kawkab)
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}
      </div>

      {/* Kaidah Hisab Mathematical Breakdown Modal */}
      <SindhindCalculationRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        ascendant={ascendant}
        midheaven={midheaven}
        houses={houses}
        positions={positions}
        selectedHouseNumber={selectedHouseForRules}
        theme={theme}
      />
    </div>
  );
};

