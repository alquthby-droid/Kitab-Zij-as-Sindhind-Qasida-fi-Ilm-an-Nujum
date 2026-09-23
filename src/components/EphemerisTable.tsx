import React from 'react';
import { PlanetKey, PlanetaryPosition, ThemeMode } from '../types';
import { ZODIAC_SIGNS } from '../lib/sindhindEngine';
import { BookmarkPlus, Flame, RotateCcw, Award } from 'lucide-react';

interface EphemerisTableProps {
  positions: Record<PlanetKey, PlanetaryPosition>;
  theme: ThemeMode;
  onAnnotatePlanet: (planetKey: PlanetKey, planetName: string) => void;
  onSelectPlanet?: (planetKey: PlanetKey) => void;
}

export const EphemerisTable: React.FC<EphemerisTableProps> = ({
  positions,
  theme,
  onAnnotatePlanet,
  onSelectPlanet,
}) => {
  const isNight = theme === 'night';
  const planetList = Object.values(positions);

  return (
    <div
      id="ephemeris-table-container"
      className={`rounded-2xl border p-5 transition-all overflow-hidden ${
        isNight
          ? 'bg-[#101420]/90 border-[#2a3449] text-[#e6ded0]'
          : 'bg-[#faf6ee] border-[#dfd6c3] text-[#2c241c] shadow-sm'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
              جدول مواضع الكواكب
            </span>
            <h2 className="text-lg font-bold font-serif">
              Tabel Ephemeris Falak Klasik (Zij as-Sindhind)
            </h2>
          </div>
          <p className="text-xs opacity-75 mt-0.5">
            Hisab bujur bintang (Tûl al-Kawkab), gerak harian, penguasa term/decan, dan martabat kosmik.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr
              className={`border-b font-serif text-[11px] uppercase tracking-wider ${
                isNight
                  ? 'border-[#2d3a52] bg-[#141b2b] text-[#c59a43]'
                  : 'border-[#dfd6c3] bg-[#f2ebd9] text-[#855914]'
              }`}
            >
              <th className="py-2.5 px-3">الكوكب (Kawkab)</th>
              <th className="py-2.5 px-3">البرج والدرجة (Bujur Zodiak)</th>
              <th className="py-2.5 px-3">الحركة (Gerak)</th>
              <th className="py-2.5 px-3">البيت (Rumah)</th>
              <th className="py-2.5 px-3">شرف / هبوط (Martabat)</th>
              <th className="py-2.5 px-3">الحد والوجه (Term/Decan)</th>
              <th className="py-2.5 px-3">منزلة القمر (Manzil)</th>
              <th className="py-2.5 px-3 text-right">إجراء (Aksi)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-current/10">
            {planetList.map((pos) => {
              const sign = ZODIAC_SIGNS[pos.coordinate.signIndex];
              const isSelected = false;

              return (
                <tr
                  key={`ephemeris-row-${pos.planet.key}`}
                  className={`transition-colors hover:bg-current/5 ${
                    isSelected ? 'bg-[#c59a43]/10' : ''
                  }`}
                >
                  {/* Planet Name */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-black shrink-0 shadow-sm"
                        style={{ backgroundColor: pos.planet.color }}
                      >
                        {pos.planet.symbol}
                      </span>
                      <div>
                        <span className="font-semibold block font-serif">
                          {pos.planet.transliteration}
                        </span>
                        <span className="text-[11px] font-serif opacity-70" dir="rtl">
                          {pos.planet.arabicName}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Zodiac Longitude */}
                  <td className="py-3 px-3">
                    <div className="font-mono font-medium">
                      {pos.coordinate.signDegree}° {String(pos.coordinate.signDegreeMinutes).padStart(2, '0')}'
                    </div>
                    <div className="text-[11px] font-serif opacity-80 flex items-center gap-1">
                      <span>{sign.symbol}</span>
                      <span>{sign.latinName}</span>
                      <span className="opacity-70">({sign.arabicName})</span>
                    </div>
                  </td>

                  {/* Motion Status */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1 items-start">
                      {pos.isRetrograde ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/15 text-rose-500 border border-rose-500/30">
                          <RotateCcw className="w-3 h-3" />
                          راجع (Ruju')
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                          مستقيم (Direct)
                        </span>
                      )}

                      {pos.isCombust && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-500 border border-amber-500/30">
                          <Flame className="w-3 h-3" />
                          محترق (Combust)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* House */}
                  <td className="py-3 px-3">
                    <span className="font-mono font-semibold px-2 py-0.5 rounded text-xs bg-current/10">
                      #{pos.houseNumber}
                    </span>
                  </td>

                  {/* Dignity */}
                  <td className="py-3 px-3 max-w-[200px]">
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#c59a43] shrink-0" />
                      <span className="text-[11px] leading-tight font-serif">
                        {pos.dignity.description}
                      </span>
                    </div>
                  </td>

                  {/* Term / Decan */}
                  <td className="py-3 px-3 text-[11px]">
                    <div className="font-mono">
                      <span className="opacity-70">حد:</span> {pos.termRuler}
                    </div>
                    <div className="font-mono">
                      <span className="opacity-70">وجه:</span> {pos.decanRuler}
                    </div>
                  </td>

                  {/* Lunar Mansion */}
                  <td className="py-3 px-3">
                    <div className="font-serif font-medium">
                      {pos.lunarMansion.transliteration}
                    </div>
                    <div className="text-[10px] opacity-70">
                      Manzil #{pos.lunarMansion.number} • {pos.lunarMansion.fortune}
                    </div>
                  </td>

                  {/* Action / Annotate */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() =>
                        onAnnotatePlanet(pos.planet.key, pos.planet.transliteration)
                      }
                      title="Tambahkan catatan riset untuk planet ini"
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        isNight
                          ? 'bg-[#1b2438] hover:bg-[#c59a43] hover:text-black text-[#c59a43] border border-[#2a374e]'
                          : 'bg-[#ebe3d3] hover:bg-[#c59a43] hover:text-black text-[#855914] border border-[#d9ccb4]'
                      }`}
                    >
                      <BookmarkPlus className="w-3 h-3" />
                      Anotasi
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
