'use client';

import { useState } from 'react';
import type { DayMenu, Recipe, PantryItem } from '@/types';
import RecipeView from './RecipeView';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDayFull(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

function missingCount(recipe: Recipe, pantry: PantryItem[]): number {
  const ids = new Set(pantry.map((p) => p.id));
  return recipe.ingredients.filter((ing) => ing.pantryItemId && !ids.has(ing.pantryItemId)).length;
}

// ─── Component ───────────────────────────────────────────────────────────────

type Props = {
  day: string;
  date: string;
  dayMenu: DayMenu;
  recipes: Recipe[];
  pantry: PantryItem[];
  onBack: () => void;
};

/** Day view: two cards (lunch + dinner) each showing name, time, kcal and ingredient status. */
export default function DayView({ day, date, dayMenu, recipes, pantry, onBack }: Props) {
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);

  const activeRecipe = recipes.find((r) => r.id === activeRecipeId) ?? null;

  if (activeRecipe) {
    return (
      <RecipeView
        recipe={activeRecipe}
        pantry={pantry}
        onBack={() => setActiveRecipeId(null)}
      />
    );
  }

  const lunchRecipe  = dayMenu.lunch?.recipeId  ? recipes.find((r) => r.id === dayMenu.lunch!.recipeId)  : undefined;
  const dinnerRecipe = dayMenu.dinner?.recipeId ? recipes.find((r) => r.id === dayMenu.dinner!.recipeId) : undefined;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Back + title ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors"
        >
          ‹
        </button>
        <div>
          <h2 className="text-base font-bold text-zinc-900 capitalize">{fmtDayFull(date)}</h2>
        </div>
      </div>

      {/* ── Meal cards ── */}
      <div className="flex flex-col gap-3">
        <MealCard
          emoji="☀️"
          label="Comida"
          recipe={lunchRecipe}
          pantry={pantry}
          onTap={() => lunchRecipe && setActiveRecipeId(lunchRecipe.id)}
        />
        <MealCard
          emoji="🌙"
          label="Cena"
          recipe={dinnerRecipe}
          pantry={pantry}
          onTap={() => dinnerRecipe && setActiveRecipeId(dinnerRecipe.id)}
        />
      </div>

    </div>
  );
}

// ─── MealCard ─────────────────────────────────────────────────────────────────

type MealCardProps = {
  emoji: string;
  label: string;
  recipe: Recipe | undefined;
  pantry: PantryItem[];
  onTap: () => void;
};

function MealCard({ emoji, label, recipe, pantry, onTap }: MealCardProps) {
  const missing = recipe ? missingCount(recipe, pantry) : 0;
  const allOk   = recipe ? missing === 0 : false;
  const total   = recipe ? recipe.prepTime + recipe.cookTime : 0;

  return (
    <div
      onClick={recipe ? onTap : undefined}
      className={`rounded-xl border bg-white p-4 flex flex-col gap-3 ${
        recipe
          ? 'border-zinc-100 cursor-pointer hover:bg-zinc-50 transition-colors'
          : 'border-zinc-100 opacity-60'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{emoji}</span>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{label}</span>
        </div>
        {recipe && <span className="text-zinc-300 text-lg leading-none">›</span>}
      </div>

      {recipe ? (
        <>
          {/* Recipe name */}
          <p className="text-base font-bold text-zinc-900 leading-snug">{recipe.name}</p>

          {/* Stats row */}
          <div className="flex gap-4 text-xs text-zinc-500">
            <span>⏱ {total} min</span>
            {recipe.kcal && <span>🔥 {recipe.kcal} kcal</span>}
            <span>👤 {recipe.servings} pers.</span>
          </div>

          {/* Ingredient status */}
          <div className="flex items-center gap-2">
            {/* Dot row — one dot per ingredient */}
            <div className="flex gap-1">
              {recipe.ingredients.map((ing, i) => {
                const ids = new Set(pantry.map((p) => p.id));
                const ok  = !ing.pantryItemId || ids.has(ing.pantryItemId);
                return (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${ok ? 'bg-green-400' : 'bg-red-400'}`}
                  />
                );
              })}
            </div>
            <span className={`text-xs font-medium ${allOk ? 'text-green-600' : 'text-red-500'}`}>
              {allOk
                ? 'Ingredientes OK'
                : `${missing} ingrediente${missing > 1 ? 's' : ''} ${missing > 1 ? 'faltan' : 'falta'}`}
            </span>
          </div>
        </>
      ) : (
        <p className="text-sm text-zinc-300 italic">Sin planificar</p>
      )}
    </div>
  );
}
