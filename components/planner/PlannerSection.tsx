'use client';

import { useState } from 'react';
import type { Recipe, PantryItem } from '@/types';
import type { MenuDayProposal } from '@/lib/gemini';
import MiniCalendar from './MiniCalendar';

const DAY_NAMES = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const MEAL_OPTIONS: { id: 'breakfast' | 'lunch' | 'dinner' | 'all'; label: string }[] = [
  { id: 'all',       label: 'Todas' },
  { id: 'breakfast', label: 'Desayuno' },
  { id: 'lunch',     label: 'Comida' },
  { id: 'dinner',    label: 'Cena' },
];

/** Generate list of ISO dates between two dates inclusive */
function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/** Short day name from ISO date */
function dayName(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return DAY_NAMES[(d.getDay() + 6) % 7]; // Mon=0
}

type Props = {
  recipes: Recipe[];
  pantry: PantryItem[];
  people: number;
  onPeopleChange: (n: number) => void;
};

/** Planner: pick a date range, select days + meal type + tags, people count, then generate a proposal. */
export default function PlannerSection({ recipes, pantry, people, onPeopleChange }: Props) {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate]     = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [mealType, setMealType] = useState<'all' | 'breakfast' | 'lunch' | 'dinner'>('all');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [proposal, setProposal] = useState<Record<string, MenuDayProposal> | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const allTags = Array.from(new Set(recipes.flatMap((r) => r.tags))).sort();
  const range = startDate && endDate ? dateRange(startDate, endDate) : [];

  function handleCalendarChange(s: string, e: string) {
    setStartDate(s);
    setEndDate(e);
    const days = dateRange(s, e);
    setSelectedDays(days); // all selected by default
    setProposal(null);
  }

  function toggleDay(iso: string) {
    setSelectedDays((prev) =>
      prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso],
    );
  }

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function generateProposal() {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch('/api/gemini/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pantry, recipes, days: selectedDays, mealType, people }),
      });
      if (!res.ok) throw new Error('Error del servidor');
      setProposal(await res.json());
    } catch {
      setGenError('No se pudo generar la propuesta. Inténtalo de nuevo.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-zinc-500">Elige un rango de fechas para planificar tu menú.</p>

      {/* Calendar */}
      <MiniCalendar
        startDate={startDate}
        endDate={endDate}
        onChange={handleCalendarChange}
      />

      {/* Date range summary + day toggles */}
      {range.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            {fmtDate(startDate!)} → {fmtDate(endDate!)} · {range.length} días
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {range.map((iso) => {
              const active = selectedDays.includes(iso);
              return (
                <button
                  key={iso}
                  onClick={() => toggleDay(iso)}
                  className={`flex flex-col items-center min-w-[44px] py-2 px-1 rounded-xl border transition-colors ${
                    active
                      ? 'bg-zinc-900 border-zinc-900 text-white'
                      : 'bg-white border-zinc-200 text-zinc-400'
                  }`}
                >
                  <span className="text-[10px] font-medium">{dayName(iso)}</span>
                  <span className="text-sm font-bold">{new Date(iso + 'T00:00:00').getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Meal type selector */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Comidas</p>
        <div className="flex gap-1.5 flex-wrap">
          {MEAL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setMealType(opt.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                mealType === opt.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag filter */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Filtrar por etiquetas</p>
        <div className="flex gap-1.5 flex-wrap">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTags.includes(tag) ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* People count */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Personas</p>
        <div className="flex items-center gap-3">
          <button onClick={() => onPeopleChange(Math.max(1, people - 1))}
            className="w-9 h-9 rounded-full border border-zinc-200 text-zinc-600 text-lg font-bold flex items-center justify-center hover:bg-zinc-50 transition-colors">
            −
          </button>
          <span className="text-base font-bold text-zinc-900 w-6 text-center">{people}</span>
          <button onClick={() => onPeopleChange(people + 1)}
            className="w-9 h-9 rounded-full border border-zinc-200 text-zinc-600 text-lg font-bold flex items-center justify-center hover:bg-zinc-50 transition-colors">
            +
          </button>
          <span className="text-xs text-zinc-400">
            {people === 1 ? '1 persona' : `${people} personas`}
          </span>
        </div>
      </div>

      {/* Generate button */}
      <button
        disabled={selectedDays.length === 0 || generating}
        onClick={generateProposal}
        className="w-full py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white disabled:opacity-30 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generando…
          </>
        ) : '✨ Generar propuesta con IA'}
      </button>

      {genError && (
        <p className="text-xs text-red-500 text-center">{genError}</p>
      )}

      {/* Proposal result */}
      {proposal && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Propuesta IA</p>
          <div className="rounded-xl border border-zinc-100 bg-white divide-y divide-zinc-100">
            {Object.entries(proposal).map(([iso, entry]) => (
              <div key={iso} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-[52px] pt-0.5">
                  <p className="text-[10px] text-zinc-400 font-medium">{dayName(iso)}</p>
                  <p className="text-sm font-semibold text-zinc-800">{fmtDate(iso)}</p>
                </div>
                {entry ? (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-700 truncate">{entry.recipeName}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{entry.reason}</p>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-300 italic pt-0.5">Sin receta disponible</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
