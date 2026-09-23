import React, { useState } from 'react';
import { HistoricalDateInfo, ThemeMode } from '../types';
import {
  HIJRI_MONTHS,
  YAZDAJIRD_MONTHS,
  SELEUCID_MONTHS,
  dateToJdn,
  hijriToJdn,
  getFullHistoricalDate,
} from '../lib/calendarConverter';
import { Calendar, Clock, Globe, Moon, Sparkles, RefreshCw, BookmarkPlus } from 'lucide-react';

interface CalendarConverterViewProps {
  currentDateInfo: HistoricalDateInfo;
  theme: ThemeMode;
  onApplyDate: (year: number, month: number, day: number, hour: number, minute: number) => void;
  onAnnotateEpoch: (epochName: string) => void;
}

export const CalendarConverterView: React.FC<CalendarConverterViewProps> = ({
  currentDateInfo,
  theme,
  onApplyDate,
  onAnnotateEpoch,
}) => {
  const isNight = theme === 'night';

  // Input states
  const [hijriYear, setHijriYear] = useState<number>(currentDateInfo.hijri.year);
  const [hijriMonth, setHijriMonth] = useState<number>(currentDateInfo.hijri.month);
  const [hijriDay, setHijriDay] = useState<number>(currentDateInfo.hijri.day);

  const [gregYear, setGregYear] = useState<number>(currentDateInfo.gregorian.year);
  const [gregMonth, setGregMonth] = useState<number>(currentDateInfo.gregorian.month);
  const [gregDay, setGregDay] = useState<number>(currentDateInfo.gregorian.day);
  const [gregHour, setGregHour] = useState<number>(currentDateInfo.gregorian.hour);
  const [gregMinute, setGregMinute] = useState<number>(currentDateInfo.gregorian.minute);

  // Quick Presets
  const applyPreset = (y: number, m: number, d: number, h: number = 12, min: number = 0) => {
    setGregYear(y);
    setGregMonth(m);
    setGregDay(d);
    setGregHour(h);
    setGregMinute(min);

    const full = getFullHistoricalDate(y, m, d, h, min);
    setHijriYear(full.hijri.year);
    setHijriMonth(full.hijri.month);
    setHijriDay(full.hijri.day);

    onApplyDate(y, m, d, h, min);
  };

  const handleHijriChange = (y: number, m: number, d: number) => {
    setHijriYear(y);
    setHijriMonth(m);
    setHijriDay(d);

    const newJdn = hijriToJdn(y, m, d, gregHour);
    const full = getFullHistoricalDate(
      currentDateInfo.gregorian.year,
      currentDateInfo.gregorian.month,
      currentDateInfo.gregorian.day,
      gregHour,
      gregMinute
    );
    // Convert newJdn to Gregorian
    const date = new Date((newJdn - 2440587.5) * 86400000);
    if (!isNaN(date.getTime())) {
      setGregYear(date.getUTCFullYear());
      setGregMonth(date.getUTCMonth() + 1);
      setGregDay(date.getUTCDate());
      onApplyDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), gregHour, gregMinute);
    }
  };

  const handleGregorianChange = (y: number, m: number, d: number, h: number, min: number) => {
    setGregYear(y);
    setGregMonth(m);
    setGregDay(d);
    setGregHour(h);
    setGregMinute(min);

    const full = getFullHistoricalDate(y, m, d, h, min);
    setHijriYear(full.hijri.year);
    setHijriMonth(full.hijri.month);
    setHijriDay(full.hijri.day);

    onApplyDate(y, m, d, h, min);
  };

  return (
    <div
      id="calendar-converter-module"
      className={`rounded-2xl border p-5 transition-all ${
        isNight
          ? 'bg-[#101420]/90 border-[#2a3449] text-[#e6ded0]'
          : 'bg-[#faf6ee] border-[#dfd6c3] text-[#2c241c] shadow-sm'
      }`}
    >
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b pb-3 border-current/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
              تحويل التواريخ الفلكية
            </span>
            <h2 className="text-lg font-bold font-serif">
              Modul Konversi Kalender & Tarikh Falak Kuno
            </h2>
          </div>
          <p className="text-xs opacity-75 mt-0.5">
            Sinkronisasi Tarikh Hijriah, Yazdajird, Iskandar (Seleucid), Bukhtanashar, dan Ahargana Kaliyuga.
          </p>
        </div>

        <button
          onClick={() => {
            const now = new Date();
            applyPreset(
              now.getFullYear(),
              now.getMonth() + 1,
              now.getDate(),
              now.getHours(),
              now.getMinutes()
            );
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isNight
              ? 'bg-[#1c253b] hover:bg-[#c59a43] hover:text-black text-[#c59a43] border border-[#2d3a54]'
              : 'bg-[#ebe3d1] hover:bg-[#c59a43] hover:text-black text-[#7a5110] border border-[#d6c7ab]'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Gunakan Waktu Sekarang
        </button>
      </div>

      {/* Historical Presets */}
      <div className="mb-5">
        <span className="text-xs font-serif font-medium opacity-80 block mb-2">
          Pilihan Tarikh Bersejarah Naskah Zij as-Sindhind:
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            {
              label: 'Mabda\' al-Hijrah (16 Juli 622 M)',
              y: 622,
              m: 7,
              d: 16,
              h: 12,
            },
            {
              label: 'Era Yazdajird III (16 Juni 632 M)',
              y: 632,
              m: 6,
              d: 16,
              h: 12,
            },
            {
              label: 'Penerjemahan Sindhind di Baghdad (771 M)',
              y: 771,
              m: 3,
              d: 15,
              h: 12,
            },
            {
              label: 'Masa Al-Khwarizmi (c. 820 M)',
              y: 820,
              m: 1,
              d: 1,
              h: 12,
            },
            {
              label: 'Tahzib Maslama al-Majriti (c. 979 M)',
              y: 979,
              m: 9,
              d: 15,
              h: 12,
            },
          ].map((preset, idx) => (
            <button
              key={`preset-${idx}`}
              onClick={() => applyPreset(preset.y, preset.m, preset.d, preset.h)}
              className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                isNight
                  ? 'bg-[#151c2e] hover:bg-[#202c46] border-[#29364f] text-[#cbd5e1]'
                  : 'bg-[#f3ecd9] hover:bg-[#eae1ca] border-[#d8ccb3] text-[#4b4033]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Inputs: Hijri vs Gregorian */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Hijri Inputs */}
        <div
          className={`p-4 rounded-xl border ${
            isNight
              ? 'bg-[#131a29] border-[#26334a]'
              : 'bg-[#f7f2e5] border-[#ded4bf]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-serif font-bold text-sm flex items-center gap-1.5 text-[#c59a43]">
              <Moon className="w-4 h-4" />
              التاريخ الهجري الفلكي (Tabular Hijri)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-current/10">
              {currentDateInfo.hijri.isLeapYear ? 'سنة كبيسة (Kabisat)' : 'سنة بسيطة'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block text-[11px] opacity-75 mb-1">Hari (اليوم):</label>
              <input
                type="number"
                min="1"
                max="30"
                value={hijriDay}
                onChange={(e) =>
                  handleHijriChange(hijriYear, hijriMonth, parseInt(e.target.value) || 1)
                }
                className={`w-full p-2 rounded-lg border font-mono font-medium ${
                  isNight
                    ? 'bg-[#0d121c] border-[#2c3850] text-[#f1f5f9]'
                    : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] opacity-75 mb-1">Bulan (الشهر):</label>
              <select
                value={hijriMonth}
                onChange={(e) =>
                  handleHijriChange(hijriYear, parseInt(e.target.value), hijriDay)
                }
                className={`w-full p-2 rounded-lg border font-serif text-xs ${
                  isNight
                    ? 'bg-[#0d121c] border-[#2c3850] text-[#f1f5f9]'
                    : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                }`}
              >
                {HIJRI_MONTHS.map((m) => (
                  <option key={`m-${m.index}`} value={m.index}>
                    {m.index}. {m.arabic} ({m.transliteration})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] opacity-75 mb-1">Tahun (السنة):</label>
              <input
                type="number"
                value={hijriYear}
                onChange={(e) =>
                  handleHijriChange(parseInt(e.target.value) || 1, hijriMonth, hijriDay)
                }
                className={`w-full p-2 rounded-lg border font-mono font-medium ${
                  isNight
                    ? 'bg-[#0d121c] border-[#2c3850] text-[#f1f5f9]'
                    : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Gregorian / Julian Inputs */}
        <div
          className={`p-4 rounded-xl border ${
            isNight
              ? 'bg-[#131a29] border-[#26334a]'
              : 'bg-[#f7f2e5] border-[#ded4bf]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-serif font-bold text-sm flex items-center gap-1.5 text-[#38bdf8]">
              <Calendar className="w-4 h-4" />
              التاريخ الميلادي / اليولياني (Solar Date)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-current/10">
              {gregYear <= 1582 ? 'Julian Calendar' : 'Gregorian'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-xs">
            <div>
              <label className="block text-[11px] opacity-75 mb-1">Hari:</label>
              <input
                type="number"
                min="1"
                max="31"
                value={gregDay}
                onChange={(e) =>
                  handleGregorianChange(
                    gregYear,
                    gregMonth,
                    parseInt(e.target.value) || 1,
                    gregHour,
                    gregMinute
                  )
                }
                className={`w-full p-2 rounded-lg border font-mono font-medium ${
                  isNight
                    ? 'bg-[#0d121c] border-[#2c3850] text-[#f1f5f9]'
                    : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                }`}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] opacity-75 mb-1">Bulan:</label>
              <select
                value={gregMonth}
                onChange={(e) =>
                  handleGregorianChange(
                    gregYear,
                    parseInt(e.target.value),
                    gregDay,
                    gregHour,
                    gregMinute
                  )
                }
                className={`w-full p-2 rounded-lg border text-xs ${
                  isNight
                    ? 'bg-[#0d121c] border-[#2c3850] text-[#f1f5f9]'
                    : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                }`}
              >
                {[
                  'Januari',
                  'Februari',
                  'Maret',
                  'April',
                  'Mei',
                  'Juni',
                  'Juli',
                  'Agustus',
                  'September',
                  'Oktober',
                  'November',
                  'Desember',
                ].map((name, i) => (
                  <option key={`gm-${i + 1}`} value={i + 1}>
                    {i + 1}. {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] opacity-75 mb-1">Tahun:</label>
              <input
                type="number"
                value={gregYear}
                onChange={(e) =>
                  handleGregorianChange(
                    parseInt(e.target.value) || 1,
                    gregMonth,
                    gregDay,
                    gregHour,
                    gregMinute
                  )
                }
                className={`w-full p-2 rounded-lg border font-mono font-medium ${
                  isNight
                    ? 'bg-[#0d121c] border-[#2c3850] text-[#f1f5f9]'
                    : 'bg-white border-[#d2c5aa] text-[#1e293b]'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Era Synchronization Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-4">
        {/* Yazdajird Era */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isNight
              ? 'bg-[#0e1320] border-[#222c40]'
              : 'bg-[#f4eee0] border-[#d8cca9]'
          }`}
        >
          <div>
            <span className="font-serif font-bold text-[#c59a43] block">
              تاريخ يزدجرد الفارسية
            </span>
            <span className="text-[11px] opacity-70">Era Yazdegerd III (Persian)</span>
          </div>
          <div className="mt-2 font-mono font-bold text-sm text-[#e2e8f0]">
            {currentDateInfo.yazdajird.day} {currentDateInfo.yazdajird.monthNamePersian}
            <span className="block text-xs font-normal opacity-80">
              Tahun {currentDateInfo.yazdajird.year} Yazdajirdi
            </span>
          </div>
        </div>

        {/* Seleucid / Dhul-Qarnayn */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isNight
              ? 'bg-[#0e1320] border-[#222c40]'
              : 'bg-[#f4eee0] border-[#d8cca9]'
          }`}
        >
          <div>
            <span className="font-serif font-bold text-[#38bdf8] block">
              تاريخ الإسكندر (ذو القرنين)
            </span>
            <span className="text-[11px] opacity-70">Era Seleucid / Rumi</span>
          </div>
          <div className="mt-2 font-mono font-bold text-sm text-[#e2e8f0]">
            {currentDateInfo.seleucid.day} {currentDateInfo.seleucid.monthNameSyriac}
            <span className="block text-xs font-normal opacity-80">
              Tahun {currentDateInfo.seleucid.year} Iskandari
            </span>
          </div>
        </div>

        {/* Sindhind / Kaliyuga Ahargana */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isNight
              ? 'bg-[#0e1320] border-[#222c40]'
              : 'bg-[#f4eee0] border-[#d8cca9]'
          }`}
        >
          <div>
            <span className="font-serif font-bold text-[#a855f7] block">
              أيام الأهرجان (السند هند)
            </span>
            <span className="text-[11px] opacity-70">Ahargana (Siddhanta Era)</span>
          </div>
          <div className="mt-2 font-mono font-bold text-sm text-[#e2e8f0]">
            {currentDateInfo.sindhindEra.aharganaDays.toLocaleString('id-ID')} hari
            <span className="block text-xs font-normal opacity-80">
              Kaliyuga: {currentDateInfo.sindhindEra.kaliyugaYears} thn
            </span>
          </div>
        </div>

        {/* Julian Day Number (JDN) */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isNight
              ? 'bg-[#0e1320] border-[#222c40]'
              : 'bg-[#f4eee0] border-[#d8cca9]'
          }`}
        >
          <div>
            <span className="font-serif font-bold text-[#10b981] block">
              اليوم اليولياني (JDN)
            </span>
            <span className="text-[11px] opacity-70">Astronomical Day Number</span>
          </div>
          <div className="mt-2 font-mono font-bold text-sm text-[#e2e8f0]">
            {currentDateInfo.jdn.toFixed(2)}
            <span className="block text-xs font-normal opacity-80">
              Hari: {currentDateInfo.weekdayArabic}
            </span>
          </div>
        </div>
      </div>

      {/* Planetary Hour & Lunar Phase Bar */}
      <div
        className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
          isNight
            ? 'bg-[#121826] border-[#28354c]'
            : 'bg-[#fbf7ed] border-[#ded4be]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-serif">
            <Clock className="w-3.5 h-3.5 text-[#c59a43]" />
            <span className="opacity-75">صاحب اليوم (Day Ruler):</span>
            <span className="font-bold text-[#c59a43]">
              {currentDateInfo.dayRuler.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-serif">
            <span className="opacity-75">صاحب الساعة (Hour Ruler):</span>
            <span className="font-bold text-[#38bdf8]">
              {currentDateInfo.hourRuler.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Moon className="w-3.5 h-3.5 text-[#fbbf24]" />
          <span className="opacity-75">Fase Rembulan:</span>
          <span className="font-serif font-semibold">
            {currentDateInfo.lunarPhase.nameArabic} ({currentDateInfo.lunarPhase.nameLatin})
          </span>
          <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-amber-500/15 text-amber-500">
            {currentDateInfo.lunarPhase.illumination}% Cahaya
          </span>
        </div>

        <button
          onClick={() =>
            onAnnotateEpoch(
              `Era ${currentDateInfo.hijri.year} H / ${currentDateInfo.yazdajird.year} Yazdajirdi`
            )
          }
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
            isNight
              ? 'bg-[#1b253b] hover:bg-[#c59a43] hover:text-black text-[#c59a43] border border-[#2e3d5b]'
              : 'bg-[#ece4d2] hover:bg-[#c59a43] hover:text-black text-[#855914] border border-[#d6c7ab]'
          }`}
        >
          <BookmarkPlus className="w-3 h-3" />
          Anotasi Tarikh Ini
        </button>
      </div>
    </div>
  );
};
