'use client';

import { useState } from 'react';

const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];
const DAY_NAMES = ['L','M','X','J','V','S','D'];

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** 0 = Monday offset for the first day of the month */
function firstDayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay(); // 0=Sun
  return (day + 6) % 7; // shift so Mon=0
}

type Props = {
  startDate: string | null;
  endDate: string | null;
  onChange: (start: string, end: string) => void;
};

/** Mini calendar with date-range selection. Click once for start, again for end. */
export default function MiniCalendar({ startDate, endDate, onChange }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  // pendingStart is fully internal — tracks whether we're waiting for the second click.
  // It is NOT derived from props so it never conflicts with the parent's startDate/endDate.
  const [pendingStart, setPendingStart] = useState<string | null>(null);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  function handleDayClick(iso: string) {
    if (pendingStart === null) {
      // First click: mark the start and wait for the second click.
      // Parent is not notified yet — the range is incomplete.
      setPendingStart(iso);
    } else {
      // Second click: range is complete. Notify parent and clear internal state.
      const [s, e] = iso >= pendingStart ? [pendingStart, iso] : [iso, pendingStart];
      setPendingStart(null);
      onChange(s, e);
    }
  }

  const days = daysInMonth(viewYear, viewMonth);
  const offset = firstDayOffset(viewYear, viewMonth);
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  // While the user is picking (pendingStart set), highlight only the pending start.
  // Once complete (pendingStart null), reflect the confirmed range from props.
  const displayStart = pendingStart ?? startDate;
  const displayEnd   = pendingStart ? null : endDate;

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors">‹</button>
        <span className="text-sm font-semibold text-zinc-800">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors">›</button>
      </div>

      {/* Hint text */}
      <p className="text-[10px] text-zinc-400 mb-3 text-center">
        {pendingStart ? 'Ahora selecciona la fecha fin' : 'Selecciona la fecha de inicio'}
      </p>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-zinc-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* Empty cells before first day */}
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}

        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const iso = toISO(viewYear, viewMonth, d);
          const isToday = iso === todayISO;
          const isStart = iso === displayStart;
          const isEnd   = iso === displayEnd;
          const inRange = displayStart && displayEnd && iso > displayStart && iso < displayEnd;
          const isPast  = iso < todayISO;

          let cellClass = 'text-zinc-700 hover:bg-zinc-100';
          if (isPast)                         cellClass = 'text-zinc-300 cursor-not-allowed';
          if (isToday && !isStart && !isEnd)  cellClass = 'text-zinc-900 font-bold hover:bg-zinc-100';
          if (inRange)                        cellClass = 'bg-zinc-100 text-zinc-700';
          if (isStart || isEnd)               cellClass = 'bg-zinc-900 text-white';

          return (
            <button
              key={d}
              disabled={isPast}
              onClick={() => !isPast && handleDayClick(iso)}
              className={`aspect-square flex items-center justify-center text-xs rounded-full transition-colors ${cellClass}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
