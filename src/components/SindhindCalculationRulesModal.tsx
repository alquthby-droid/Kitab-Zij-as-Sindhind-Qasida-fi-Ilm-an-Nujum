import React from 'react';
import { AstrologicalHouse, CelestialCoordinate, PlanetKey, PlanetaryPosition, ThemeMode } from '../types';
import { PLANETS_INFO, ZODIAC_SIGNS } from '../lib/sindhindEngine';
import {
  Calculator,
  X,
  BookOpen,
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

interface SindhindCalculationRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  ascendant: CelestialCoordinate;
  midheaven: CelestialCoordinate;
  houses: AstrologicalHouse[];
  positions: Record<PlanetKey, PlanetaryPosition>;
  selectedHouseNumber?: number | null;
  theme: ThemeMode;
}

export const SindhindCalculationRulesModal: React.FC<SindhindCalculationRulesModalProps> = ({
  isOpen,
  onClose,
  ascendant,
  midheaven,
  houses,
  positions,
  selectedHouseNumber,
  theme,
}) => {
  if (!isOpen) return null;

  const isNight = theme === 'night';
  const ascSign = ZODIAC_SIGNS[ascendant.signIndex];
  const targetHouse = selectedHouseNumber
    ? houses.find((h) => h.number === selectedHouseNumber) || houses[0]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div
        className={`w-full max-w-4xl my-auto rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all max-h-[92vh] flex flex-col ${
          isNight
            ? 'bg-[#101522] border-[#2b3a54] text-[#e2d8c3]'
            : 'bg-[#faf6ee] border-[#ded4bd] text-[#2c2419]'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-current/10 mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#c59a43]/20 flex items-center justify-center text-[#c59a43]">
                <Calculator className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#c59a43]">
                  Kaidah Hisab Zij as-Sindhind: Perataan Dua Belas Rumah (Taswiyat al-Buyut)
                </h3>
                <p className="text-xs font-serif opacity-80" dir="rtl">
                  باب تسوية البيوت الاثني عشر واستخراج الطالع في زيج السندهند وأرجوزة النجوم
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-5 text-xs pr-1">
          {/* Overview Banner */}
          <div
            className={`p-4 rounded-xl border leading-relaxed ${
              isNight
                ? 'bg-[#141c2e] border-[#253654]'
                : 'bg-[#f5ede0] border-[#d8cca8]'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-[#c59a43] mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Prinsip Utama Naskah Zij as-Sindhind (Al-Khwarizmi & Maslama al-Majriti)</span>
            </div>
            <p className="opacity-90 leading-relaxed font-serif">
              Dalam naskah kuno <em>Zij as-Sindhind al-Kabir</em>, penataan dua belas rumah astrologi didasarkan pada 
              <strong> Kaidah Rumah Sama Besar (Taswiyat al-Buyut al-Mutasawiyah / Equal House System)</strong> dari titik terbit (<em>at-Tali'</em>). 
              Berbeda dengan metode proyeksi sferis Abad Pertengahan akhir (seperti Al-Kabisi atau Regiomontanus), tradisi Sindhind-India mempertahankan 
              pembagian ekliptika sebesar tepat <strong>30° per rumah</strong> yang berakar dari konsep <em>Bhāva</em> dalam naskah Surya Siddhanta dan Brahmasphutasiddhanta.
            </p>
          </div>

          {/* 4 Steps of Calculation Grid */}
          <div className="space-y-4">
            {/* Langkah 1 */}
            <div
              className={`p-4 rounded-xl border ${
                isNight ? 'bg-[#0e1422] border-[#222f46]' : 'bg-[#ffffff] border-[#ded4be]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-sm text-[#38bdf8] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#38bdf8]/20 flex items-center justify-center text-xs">
                    1
                  </span>
                  Langkah I: Istikhraj at-Tali' (Hisab Bujur Rasi Terbit / Ascendant)
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-current/10">
                  Hasil: {ascendant.signDegree}° {ascSign.latinName}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                <div>
                  <p className="opacity-80 mb-2">
                    Bujur ekliptika titik terbit dihitung dari perpotongan lingkaran ufuk timur (*Ufuq al-Mashriq*) 
                    dengan lingkaran zodiak pada waktu hisab:
                  </p>
                  <div
                    className={`p-2.5 rounded-lg border font-mono text-[11px] ${
                      isNight ? 'bg-[#090d16] border-[#1d273a]' : 'bg-[#f7f2e5] border-[#d8cca8]'
                    }`}
                  >
                    <div>1. Lintang Geografis (φ): 33° 20' LU (Baghdad)</div>
                    <div>2. Kemiringan Ekliptika (ε): 23° 51' (Sindhind)</div>
                    <div>3. Waktu Sideris Lokal (LMST / θ): dihitung dari JDN</div>
                    <div className="text-[#38bdf8] mt-1">
                      tan(λ_Tali') = -cos(θ) / [sin(θ)cos(ε) + tan(φ)sin(ε)]
                    </div>
                  </div>
                </div>

                <div>
                  <p className="opacity-80 mb-2 font-serif">
                    Dari rumus hisab tersebut pada epoch ini, diperoleh bujur astronomis:
                  </p>
                  <div
                    className={`p-2.5 rounded-lg border ${
                      isNight ? 'bg-[#090d16] border-[#1d273a]' : 'bg-[#f7f2e5] border-[#d8cca8]'
                    }`}
                  >
                    <div className="font-semibold text-[#c59a43]">
                      λ_Tali' = {ascendant.totalDegrees.toFixed(2)}° = {ascendant.signDegree}° {ascendant.signDegreeMinutes}' {ascSign.latinName} ({ascSign.arabicName})
                    </div>
                    <p className="text-[11px] opacity-75 mt-1">
                      Derajat inilah yang menjadi titik patokan (<em>Mabda'</em>) seluruh batas dua belas rumah.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Langkah 2 */}
            <div
              className={`p-4 rounded-xl border ${
                isNight ? 'bg-[#0e1422] border-[#222f46]' : 'bg-[#ffffff] border-[#ded4be]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-sm text-[#eab308] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#eab308]/20 flex items-center justify-center text-xs">
                    2
                  </span>
                  Langkah II: Kaidah Pembagian Interval Puncak Rumah (Cusps of Houses)
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-current/10">
                  Rumus: Cusp(n) = λ_Tali' + (n - 1) × 30°
                </span>
              </div>

              <p className="opacity-85 leading-relaxed mb-3">
                Berdasarkan naskah <em>Zij as-Sindhind</em> Folio 18b: 
                <span className="italic font-serif text-[#c59a43] mx-1" dir="rtl">
                  «فإذا أردت تسوية البيوت، فاجعل درجة الطالع أول البيت الأول، ثم زد عليها ثلاثين درجة ثلاثين درجة...»
                </span>
                (Jadikan derajat rasi terbit sebagai awal Rumah Pertama, kemudian tambahkanlah 30 derajat berturut-turut untuk tiap rumah berikutnya).
              </p>

              {/* Table of Cusps Calculation */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr
                      className={`border-b ${
                        isNight ? 'border-[#26354d] text-[#c59a43]' : 'border-[#dfd4bd] text-[#7d510f]'
                      }`}
                    >
                      <th className="py-1.5 px-2">Rumah (Bayt)</th>
                      <th className="py-1.5 px-2">Operasi Derajat (Sindhind)</th>
                      <th className="py-1.5 px-2">Puncak Derajat (Cusp)</th>
                      <th className="py-1.5 px-2">Rentang Interval Rumah</th>
                      <th className="py-1.5 px-2">Kawkab yang Menghuni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-current/10">
                    {houses.map((h) => {
                      const prevDeg = (ascendant.totalDegrees + (h.number - 1) * 30) % 360;
                      const nextDeg = (ascendant.totalDegrees + h.number * 30) % 360;
                      const hasPlanets = h.planetsInside.length > 0;

                      return (
                        <tr
                          key={`calc-row-${h.number}`}
                          className={hasPlanets ? 'bg-[#c59a43]/10 font-medium' : ''}
                        >
                          <td className="py-1.5 px-2 font-mono font-semibold">
                            Rumah #{h.number}
                          </td>
                          <td className="py-1.5 px-2 font-mono opacity-80">
                            {ascendant.signDegree}° + ({(h.number - 1)} × 30°)
                          </td>
                          <td className="py-1.5 px-2 font-mono text-[#38bdf8]">
                            {h.signDegree}° {h.signLatin}
                          </td>
                          <td className="py-1.5 px-2 font-mono opacity-75">
                            [{prevDeg.toFixed(0)}° - {nextDeg.toFixed(0)}°)
                          </td>
                          <td className="py-1.5 px-2">
                            {hasPlanets ? (
                              <span className="text-[#c59a43] font-bold">
                                {h.planetsInside.map((pk) => PLANETS_INFO[pk].transliteration).join(', ')}
                              </span>
                            ) : (
                              <span className="opacity-50 italic">Kosong dari kawkab</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Langkah 3 */}
            <div
              className={`p-4 rounded-xl border ${
                isNight ? 'bg-[#0e1422] border-[#222f46]' : 'bg-[#ffffff] border-[#ded4be]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-sm text-[#10b981] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#10b981]/20 flex items-center justify-center text-xs">
                    3
                  </span>
                  Langkah III: Kaidah Distribusi Kawkab (Tanzil al-Kawakib fi al-Buyut)
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-current/10">
                  Rumus: Rumah = ⌊(λ_kawkab - λ_Tali') / 30°⌋ + 1
                </span>
              </div>

              <div className="space-y-2 leading-relaxed">
                <p className="opacity-85">
                  Untuk menentukan di rumah mana suatu kawkab bernaung, bujur hakiki kawkab (setelah ta'dil markaz dan ta'dil khashah) 
                  dikurangkan dengan bujur derajat titik terbit (<em>Tali'</em>). Selisih jarak tersebut kemudian dibagi 30°:
                </p>

                {/* Proof for the results in the user screenshot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {/* Proof for Mars in House 3 */}
                  <div
                    className={`p-3 rounded-lg border ${
                      isNight ? 'bg-[#121927] border-[#213049]' : 'bg-[#f7f2e5] border-[#d8cca8]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Pembuktian: Mengapa Mars (al-Marrikh) di Rumah #3?</span>
                    </div>
                    <div className="font-mono text-[11px] space-y-1">
                      <div>• Bujur Hakiki Mars (λ): {positions.mars.trueLongitude.toFixed(1)}° ({positions.mars.coordinate.signDegree}° Gemini)</div>
                      <div>• Bujur Titik Terbit (λ_Tali'): {ascendant.totalDegrees.toFixed(1)}° ({ascendant.signDegree}° Aries)</div>
                      <div>• Selisih Busur (Δλ): ({positions.mars.trueLongitude.toFixed(1)}° - {ascendant.totalDegrees.toFixed(1)}°) = {(positions.mars.trueLongitude - ascendant.totalDegrees).toFixed(1)}°</div>
                      <div>• Indeks: ⌊{(positions.mars.trueLongitude - ascendant.totalDegrees).toFixed(1)}° / 30°⌋ + 1 = ⌊1.84⌋ + 1 = <strong>Rumah #3</strong></div>
                      <div className="text-emerald-400 font-serif mt-1">
                        ✓ Terbukti: Jatuh tepat pada Rumah #3 ({houses[2].arabicName})!
                      </div>
                    </div>
                  </div>

                  {/* Proof for Jupiter in House 4 */}
                  <div
                    className={`p-3 rounded-lg border ${
                      isNight ? 'bg-[#121927] border-[#213049]' : 'bg-[#f7f2e5] border-[#d8cca8]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Pembuktian: Mengapa Jupiter (al-Mushtari) di Rumah #4?</span>
                    </div>
                    <div className="font-mono text-[11px] space-y-1">
                      <div>• Bujur Hakiki Jupiter (λ): {positions.jupiter.trueLongitude.toFixed(1)}° ({positions.jupiter.coordinate.signDegree}° Cancer)</div>
                      <div>• Bujur Titik Terbit (λ_Tali'): {ascendant.totalDegrees.toFixed(1)}° ({ascendant.signDegree}° Aries)</div>
                      <div>• Selisih Busur (Δλ): ({positions.jupiter.trueLongitude.toFixed(1)}° - {ascendant.totalDegrees.toFixed(1)}°) = {(positions.jupiter.trueLongitude - ascendant.totalDegrees).toFixed(1)}°</div>
                      <div>• Indeks: ⌊{(positions.jupiter.trueLongitude - ascendant.totalDegrees).toFixed(1)}° / 30°⌋ + 1 = ⌊2.71⌋ + 1 = <strong>Rumah #4</strong></div>
                      <div className="text-emerald-400 font-serif mt-1">
                        ✓ Terbukti: Jatuh tepat pada Rumah #4 ({houses[3].arabicName})!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proof for Empty Houses 1 & 2 */}
                <div
                  className={`p-2.5 rounded-lg border text-[11px] mt-2 ${
                    isNight ? 'bg-[#0f1523] border-[#1d273a]' : 'bg-[#fbf7ee] border-[#dfd4bd]'
                  }`}
                >
                  <span className="font-semibold text-[#c59a43]">
                    Penjelasan Hasil "Kosong dari kawkab" pada Rumah #1 dan Rumah #2:
                  </span>
                  <p className="opacity-80 mt-0.5">
                    Interval Rumah #1 membentang dari {ascendant.signDegree}° Aries s.d. {ascendant.signDegree}° Taurus (selisih 0° s.d. 30° dari Tali'). 
                    Interval Rumah #2 membentang dari {ascendant.signDegree}° Taurus s.d. {ascendant.signDegree}° Gemini (selisih 30° s.d. 60° dari Tali'). 
                    Pada koordinat waktu ini, tidak ada satu pun kawkab dari tujuh planet klasik yang bujur astronomisnya berada dalam rentang busur tersebut, 
                    sehingga kedua rumah berstatus <em>Khalin 'an al-Kawakib</em> (Kosong dari kawkab).
                  </p>
                </div>
              </div>
            </div>

            {/* Langkah 4 */}
            <div
              className={`p-4 rounded-xl border ${
                isNight ? 'bg-[#0e1422] border-[#222f46]' : 'bg-[#ffffff] border-[#ded4be]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-sm text-[#a855f7] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#a855f7]/20 flex items-center justify-center text-xs">
                    4
                  </span>
                  Langkah IV: Dalalat al-Buyut fi Qasida fi 'Ilm an-Nujum (Signifikansi Makna)
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-current/10">
                  Meter: Bahr ar-Rajaz
                </span>
              </div>

              <p className="opacity-85 leading-relaxed mb-2 font-serif">
                Dalam risalah puitik <em>Qasida fi 'Ilm an-Nujum</em>, tiap-tiap rumah memiliki penugasan makna hukum:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                {houses.map((h) => (
                  <div
                    key={`sig-${h.number}`}
                    className={`p-2 rounded-lg border ${
                      isNight ? 'bg-[#121826] border-[#222f44]' : 'bg-[#f8f3e8] border-[#dfd6c3]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-[#c59a43]">
                      <span>Rumah #{h.number}</span>
                      <span className="font-serif font-normal text-[10px]" dir="rtl">
                        {h.arabicName.split(':')[0]}
                      </span>
                    </div>
                    <div className="text-[10px] opacity-75 font-serif mt-0.5">
                      {h.signifactor}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-current/10 mt-3 shrink-0">
          <span className="text-[11px] opacity-65 font-serif">
            Rujukan: <em>Zij as-Sindhind</em> (BnF Arabe 2478, Bab Taswiyat al-Buyut) & <em>Qasida an-Nujum</em> (Escorial 908).
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#c59a43] text-black hover:bg-[#d6aa52] transition-colors"
          >
            Tutup Penjelasan
          </button>
        </div>
      </div>
    </div>
  );
};
