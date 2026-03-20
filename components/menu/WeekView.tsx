'use client';

import { useState } from 'react';
import type { DayOfWeek, WeeklyMenu, Recipe, PantryItem } from '@/types';
import DayView from './DayView';

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DAY_SHORT: Record<DayOfWeek, string> = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié',
  thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom',
};

const DAY_LONG: Record<DayOfWeek, string> = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dayDate(weekStart: string, dayIndex: number): string {
  const d = new Date(weekStart + 'T00:00:00');
  d.setDate(d.getDate() + dayIndex);
  return d.toISOString().slice(0, 10);
}

function fmtShortDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function fmtWeekLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return `Semana del ${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
}

function shiftWeek(iso: string, delta: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + delta * 7);
  return d.toISOString().slice(0, 10);
}

type DayStatusResult = 'complete' | 'missing' | 'empty';

function getDayStatus(
  day: DayOfWeek,
  menu: WeeklyMenu,
  recipes: Recipe[],
  pantry: PantryItem[],
): DayStatusResult {
  const dm = menu.days[day];
  const ids = [dm.lunch?.recipeId, dm.dinner?.recipeId].filter(Boolean) as string[];
  if (ids.length === 0) return 'empty';
  const pantryIds = new Set(pantry.map((p) => p.id));
  const hasMissing = ids.some((rid) =>
    recipes.find((r) => r.id === rid)?.ingredients.some(
      (ing) => ing.pantryItemId && !pantryIds.has(ing.pantryItemId),
    ),
  );
  return hasMissing ? 'missing' : 'complete';
}

const DOT: Record<DayStatusResult, string> = {
  complete: 'bg-green-400',
  missing:  'bg-red-400',
  empty:    'bg-zinc-200',
};

// ─── Component ───────────────────────────────────────────────────────────────

type Props = {
  menu: WeeklyMenu;
  recipes: Recipe[];
  pantry: PantryItem[];
};

/** Week view: horizontal day pills + vertical day summary list. Tapping a day opens DayView. */
export default function WeekView({ menu, recipes, pantry }: Props) {
  const [weekStart, setWeekStart]   = useState(menu.weekStart);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);

  const isDataWeek = weekStart === menu.weekStart;

  if (selectedDay) {
    return (
      <DayView
        day={selectedDay}
        date={dayDate(weekStart, DAYS.indexOf(selectedDay))}
        dayMenu={
          isDataWeek
            ? menu.days[selectedDay]
            : { lunch: { recipeId: null }, dinner: { recipeId: null } }
        }
        recipes={recipes}
        pantry={pantry}
        onBack={() => setSelectedDay(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Week navigation ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekStart((w) => shiftWeek(w, -1))}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-zinc-800">{fmtWeekLabel(weekStart)}</span>
        <button
          onClick={() => setWeekStart((w) => shiftWeek(w, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors"
        >
          ›
        </button>
      </div>

      {/* ── Horizontal day pills ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {DAYS.map((day, i) => {
          const status = isDataWeek ? getDayStatus(day, menu, recipes, pantry) : 'empty';
          const date   = dayDate(weekStart, i);
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className="flex flex-col items-center gap-1.5 min-w-[48px] py-3 px-1 rounded-2xl border border-zinc-100 bg-white hover:bg-zinc-50 transition-colors"
            >
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">{DAY_SHORT[day]}</span>
              <span className="text-sm font-bold text-zinc-800">{new Date(date + 'T00:00:00').getDate()}</span>
              <span className={`w-2 h-2 rounded-full ${DOT[status]}`} />
            </button>
          );
        })}
      </div>

      {/* ── Vertical day summary list ── */}
      <div className="flex flex-col gap-2">
        {DAYS.map((day, i) => {
          const date   = dayDate(weekStart, i);
          const dm     = isDataWeek ? menu.days[day] : { lunch: { recipeId: null }, dinner: { recipeId: null } };
          const status = isDataWeek ? getDayStatus(day, menu, recipes, pantry) : 'empty';

          const lunchRecipe  = dm.lunch?.recipeId  ? recipes.find((r) => r.id === dm.lunch!.recipeId)  : undefined;
          const dinnerRecipe = dm.dinner?.recipeId ? recipes.find((r) => r.id === dm.dinner!.recipeId) : undefined;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
            >
              {/* Day label + date */}
              <div className="w-[72px] flex-shrink-0 pt-0.5">
                <p className="text-sm font-semibold text-zinc-800">{DAY_LONG[day]}</p>
                <p className="text-xs text-zinc-400">{fmtShortDate(date)}</p>
              </div>

              {/* Meals summary */}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <MealLine emoji="☀️" label="Comida" recipe={lunchRecipe} />
                <MealLine emoji="🌙" label="Cena"   recipe={dinnerRecipe} />
              </div>

              {/* Alert badge if ingredients are missing */}
              <div className="flex-shrink-0 flex items-center gap-2 pt-0.5">
                {status === 'missing' && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                    ⚠ Faltan
                  </span>
                )}
                <span className="text-zinc-300 text-base">›</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex gap-4 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" />Completo</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400"   />Faltan ingredientes</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-zinc-200"  />Sin planificar</span>
      </div>

    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function MealLine({ emoji, label, recipe }: { emoji: string; label: string; recipe?: Recipe }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-sm leading-none">{emoji}</span>
      <span className="text-zinc-400 w-[40px] flex-shrink-0">{label}</span>
      <span className={`truncate ${recipe ? 'text-zinc-700 font-medium' : 'text-zinc-300 italic'}`}>
        {recipe ? recipe.name : '—'}
      </span>
    </div>
  );
}
