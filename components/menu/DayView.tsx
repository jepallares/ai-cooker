'use client';

import { useState } from 'react';
import type { DayMenu, MealType, Recipe, PantryItem } from '@/types';
import Pill from '@/components/ui/Pill';
import RecipeView from './RecipeView';

const MEAL_LABEL: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch:     'Comida',
  dinner:    'Cena',
};

const MEAL_EMOJI: Record<MealType, string> = {
  breakfast: '🌅',
  lunch:     '☀️',
  dinner:    '🌙',
};

/** Check if all ingredients with a pantryItemId are in the pantry */
function allIngredientsAvailable(recipe: Recipe, pantry: PantryItem[]): boolean {
  const ids = new Set(pantry.map((p) => p.id));
  return recipe.ingredients.every((ing) => !ing.pantryItemId || ids.has(ing.pantryItemId));
}

/** Format ISO date string as "lunes, 17 de marzo" */
function fmtDayFull(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

type Props = {
  day: string;
  date: string;
  dayMenu: DayMenu;
  recipes: Recipe[];
  pantry: PantryItem[];
  onBack: () => void;
};

/** Shows breakfast, lunch and dinner for a given day. Tap a meal to open RecipeView. */
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

  const meals: MealType[] = ['breakfast', 'lunch', 'dinner'];

  return (
    <div className="flex flex-col gap-4">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors"
        >
          ‹
        </button>
        <div>
          <p className="text-xs text-zinc-400 capitalize">{day}</p>
          <h2 className="text-sm font-semibold text-zinc-800 capitalize">{fmtDayFull(date)}</h2>
        </div>
      </div>

      {/* Meal cards */}
      <div className="flex flex-col gap-3">
        {meals.map((meal) => {
          const slot = dayMenu[meal];
          const recipe = slot?.recipeId ? recipes.find((r) => r.id === slot.recipeId) : undefined;
          const ok = recipe ? allIngredientsAvailable(recipe, pantry) : null;

          return (
            <div
              key={meal}
              onClick={() => recipe && setActiveRecipeId(recipe.id)}
              className={`rounded-xl border border-zinc-100 bg-white p-4 flex items-center gap-4 ${
                recipe ? 'cursor-pointer hover:bg-zinc-50 transition-colors' : ''
              }`}
            >
              <span className="text-2xl">{MEAL_EMOJI[meal]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-400 mb-0.5">{MEAL_LABEL[meal]}</p>
                {recipe ? (
                  <>
                    <p className="text-sm font-semibold text-zinc-800 truncate">{recipe.name}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {recipe.tags.slice(0, 2).map((tag) => (
                        <Pill key={tag} label={tag} />
                      ))}
                      <span
                        className={`text-xs font-medium ${ok ? 'text-green-600' : 'text-amber-600'}`}
                      >
                        {ok ? '✓ Ingredientes OK' : '⚠ Faltan ingredientes'}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-zinc-300 italic">Sin planificar</p>
                )}
              </div>
              {recipe && (
                <span className="text-zinc-300 text-lg">›</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
