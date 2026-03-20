'use client';

import { useState } from 'react';
import type { DayOfWeek, WeeklyMenu, Recipe, PantryItem } from '@/types';
import DayView from './DayView';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_SHORT: Record<DayOfWeek, string> = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié',
  thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom',
};
const MS_PER_DAY = 86_400_000;

/** Returns ISO date string for day offset from a Monday */
function dayDate(weekStart: string, dayIndex: number): string {
  const d = new Date(weekStart + 'T00:00:00');
  d.setDate(d.getDate() + dayIndex);
  return d.toISOString().slice(0, 10);
}

/** Format "Mar 17" from ISO string */
function fmtShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/** Format "Semana del 17 mar" */
function fmtWeekLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return `Semana del ${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
}

/** Add or subtract weeks from a Monday ISO string */
function shiftWeek(iso: string, delta: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + delta * 7);
  return d.toISOString().slice(0, 10);
}

/** Determine dot color for a day:
 *  green  — at least one meal planned and all ingredients in pantry
 *  amber  — at least one meal planned but some ingredients missing
 *  gray   — no meals planned */
function dayStatus(
  day: DayOfWeek,
  menu: WeeklyMenu,
  recipes: Recipe[],
  pantry: PantryItem[],
): 'green' | 'amber' | 'gray' {
  const dayMenu = menu.days[day];
  const recipeIds = [dayMenu.breakfast?.recipeId, dayMenu.lunch?.recipeId, dayMenu.dinner?.recipeId].filter(Boolean) as string[];
  if (recipeIds.length === 0) return 'gray';

  const pantryIds = new Set(pantry.map((p) => p.id));
  const hasMissing = recipeIds.some((rid) => {
    const recipe = recipes.find((r) => r.id === rid);
    return recipe?.ingredients.some((ing) => ing.pantryItemId && !pantryIds.has(ing.pantryItemId));
  });

  return hasMissing ? 'amber' : 'green';
}

const dotClass: Record<'green' | 'amber' | 'gray', string> = {
  green: 'bg-green-400',
  amber: 'bg-amber-400',
  gray:  'bg-zinc-300',
};

type Props = {
  menu: WeeklyMenu;
  recipes: Recipe[];
  pantry: PantryItem[];
};

/** Week view with prev/next navigation and day pills. Tapping a day opens DayView. */
export default function WeekView({ menu, recipes, pantry }: Props) {
  const [weekStart, setWeekStart] = useState(menu.weekStart);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);

  // Is the displayed week the same as the menu's data week?
  const isDataWeek = weekStart === menu.weekStart;

  if (selectedDay) {
    return (
      <DayView
        day={selectedDay}
        date={dayDate(weekStart, DAYS.indexOf(selectedDay))}
        dayMenu={isDataWeek ? menu.days[selectedDay] : { breakfast: { recipeId: null }, lunch: { recipeId: null }, dinner: { recipeId: null } }}
        recipes={recipes}
        pantry={pantry}
        onBack={() => setSelectedDay(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Week header */}
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

      {/* Day pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {DAYS.map((day, i) => {
          const status = isDataWeek ? dayStatus(day, menu, recipes, pantry) : 'gray';
          const date = dayDate(weekStart, i);
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className="flex flex-col items-center gap-1.5 min-w-[52px] py-3 px-1 rounded-2xl border border-zinc-100 bg-white hover:bg-zinc-50 transition-colors"
            >
              <span className="text-[10px] font-medium text-zinc-400 uppercase">{DAY_SHORT[day]}</span>
              <span className="text-sm font-semibold text-zinc-800">{new Date(date + 'T00:00:00').getDate()}</span>
              <span className={`w-2 h-2 rounded-full ${dotClass[status]}`} />
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" />Completo</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />Faltan ingredientes</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-zinc-300" />Sin planificar</span>
      </div>
    </div>
  );
}
