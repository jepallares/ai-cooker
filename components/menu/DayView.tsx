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

type IngredientStatus = {
  /** Total ingredients with a pantryItemId */
  total: number;
  /** How many of those are insufficient for the requested people */
  missing: number;
};

/**
 * Check pantry stock for a recipe scaled to `people`.
 * An ingredient is considered missing when:
 *   pantryItem.quantity < ingredient.quantity × (people / recipe.servings)
 */
function checkIngredients(recipe: Recipe, pantry: PantryItem[], people: number): IngredientStatus {
  const pantryById = new Map(pantry.map((p) => [p.id, p]));
  const ratio = people / recipe.servings;
  let total = 0;
  let missing = 0;
  for (const ing of recipe.ingredients) {
    if (!ing.pantryItemId) continue;
    total++;
    const item = pantryById.get(ing.pantryItemId);
    if (!item || item.quantity < ing.quantity * ratio) missing++;
  }
  return { total, missing };
}

// ─── Component ───────────────────────────────────────────────────────────────

type Props = {
  day: string;
  date: string;
  dayMenu: DayMenu;
  recipes: Recipe[];
  pantry: PantryItem[];
  defaultPeople: number;
  onBack: () => void;
};

/** Day view: lunch and dinner cards with per-meal people adjuster and quantity-aware ingredient check. */
export default function DayView({ day, date, dayMenu, recipes, pantry, defaultPeople, onBack }: Props) {
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);

  const activeRecipe = recipes.find((r) => r.id === activeRecipeId) ?? null;

  if (activeRecipe) {
    return (
      <RecipeView recipe={activeRecipe} pantry={pantry} onBack={() => setActiveRecipeId(null)} />
    );
  }

  const lunchRecipe  = dayMenu.lunch?.recipeId  ? recipes.find((r) => r.id === dayMenu.lunch!.recipeId)  : undefined;
  const dinnerRecipe = dayMenu.dinner?.recipeId ? recipes.find((r) => r.id === dayMenu.dinner!.recipeId) : undefined;

  return (
    <div className="flex flex-col gap-5">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors">
          ‹
        </button>
        <h2 className="text-base font-bold text-zinc-900 capitalize">{fmtDayFull(date)}</h2>
      </div>

      {/* Meal cards */}
      <div className="flex flex-col gap-3">
        <MealCard emoji="☀️" label="Comida"  recipe={lunchRecipe}  pantry={pantry} defaultPeople={defaultPeople}
          onTap={() => lunchRecipe  && setActiveRecipeId(lunchRecipe.id)} />
        <MealCard emoji="🌙" label="Cena"    recipe={dinnerRecipe} pantry={pantry} defaultPeople={defaultPeople}
          onTap={() => dinnerRecipe && setActiveRecipeId(dinnerRecipe.id)} />
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
  defaultPeople: number;
  onTap: () => void;
};

function MealCard({ emoji, label, recipe, pantry, defaultPeople, onTap }: MealCardProps) {
  const [people, setPeople] = useState(defaultPeople);

  const status = recipe ? checkIngredients(recipe, pantry, people) : null;
  const allOk  = status ? status.missing === 0 : false;
  const total  = recipe ? recipe.prepTime + recipe.cookTime : 0;

  // Scale kcal to current people count
  const scaledKcal = recipe?.kcal
    ? Math.round(recipe.kcal * (people / recipe.servings))
    : undefined;

  return (
    <div
      className={`rounded-xl border bg-white p-4 flex flex-col gap-3 ${
        recipe ? 'border-zinc-100' : 'border-zinc-100 opacity-60'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{emoji}</span>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{label}</span>
        </div>
        {recipe && <span className="text-zinc-300 text-lg leading-none cursor-pointer" onClick={onTap}>›</span>}
      </div>

      {recipe ? (
        <>
          {/* Recipe name — tappable */}
          <button onClick={onTap} className="text-base font-bold text-zinc-900 leading-snug text-left">
            {recipe.name}
          </button>

          {/* Stats row */}
          <div className="flex gap-4 text-xs text-zinc-500">
            <span>⏱ {total} min</span>
            {scaledKcal && <span>🔥 {scaledKcal} kcal</span>}
          </div>

          {/* People adjuster */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">👤 Personas:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPeople((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-full border border-zinc-200 text-zinc-600 font-bold flex items-center justify-center hover:bg-zinc-50 transition-colors text-sm"
              >
                −
              </button>
              <span className="text-sm font-bold text-zinc-900 w-4 text-center">{people}</span>
              <button
                onClick={() => setPeople((p) => p + 1)}
                className="w-7 h-7 rounded-full border border-zinc-200 text-zinc-600 font-bold flex items-center justify-center hover:bg-zinc-50 transition-colors text-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* Ingredient status */}
          {status && status.total > 0 && (
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
              allOk ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}>
              <span>{allOk ? '✓' : '⚠'}</span>
              <span>
                {allOk
                  ? `Ingredientes suficientes para ${people} ${people === 1 ? 'persona' : 'personas'}`
                  : `${status.missing} ingrediente${status.missing > 1 ? 's' : ''} insuficiente${status.missing > 1 ? 's' : ''} para ${people} ${people === 1 ? 'persona' : 'personas'}`}
              </span>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-zinc-300 italic">Sin planificar</p>
      )}
    </div>
  );
}
