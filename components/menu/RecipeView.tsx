'use client';

import { useState } from 'react';
import type { Recipe, PantryItem } from '@/types';
import Pill from '@/components/ui/Pill';

type Props = {
  recipe: Recipe;
  pantry: PantryItem[];
  onBack: () => void;
};

/** Full recipe detail with interactive step-by-step cooking mode. */
export default function RecipeView({ recipe, pantry, onBack }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [cookingMode, setCookingMode] = useState(false);

  const pantryIds = new Set(pantry.map((p) => p.id));
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors"
        >
          ‹
        </button>
        <h2 className="text-base font-bold text-zinc-900 flex-1 leading-tight">{recipe.name}</h2>
      </div>

      {/* Meta row */}
      <div className="flex gap-4 text-xs text-zinc-500">
        <span>⏱ {totalTime} min</span>
        <span>👤 {recipe.servings} pers.</span>
        {recipe.kcal && <span>🔥 {recipe.kcal} kcal</span>}
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 flex-wrap">
        {recipe.tags.map((tag) => <Pill key={tag} label={tag} />)}
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-500 leading-relaxed">{recipe.description}</p>

      {/* Ingredients */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-800 mb-3">Ingredientes</h3>
        <div className="flex flex-col gap-2">
          {recipe.ingredients.map((ing, i) => {
            const available = !ing.pantryItemId || pantryIds.has(ing.pantryItemId);
            return (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${available ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className={`text-sm flex-1 ${available ? 'text-zinc-700' : 'text-red-500'}`}>
                  {ing.name}
                </span>
                <span className="text-sm text-zinc-400">
                  {ing.quantity} {ing.unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-800">Pasos</h3>
          <button
            onClick={() => { setCookingMode((v) => !v); setActiveStep(0); }}
            className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
          >
            {cookingMode ? 'Ver todos' : 'Modo cocina'}
          </button>
        </div>

        {cookingMode ? (
          /* Cooking mode: one step at a time */
          <div className="rounded-xl border border-zinc-100 bg-white p-5 flex flex-col gap-5">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Paso {activeStep + 1} de {recipe.steps.length}</span>
              <span>{Math.round(((activeStep + 1) / recipe.steps.length) * 100)}%</span>
            </div>
            <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 rounded-full transition-all"
                style={{ width: `${((activeStep + 1) / recipe.steps.length) * 100}%` }}
              />
            </div>
            <p className="text-base text-zinc-800 leading-relaxed">{recipe.steps[activeStep]}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                disabled={activeStep === 0}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 disabled:opacity-30 hover:bg-zinc-50 transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setActiveStep((s) => Math.min(recipe.steps.length - 1, s + 1))}
                disabled={activeStep === recipe.steps.length - 1}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-sm font-semibold text-white disabled:opacity-30 hover:bg-zinc-700 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        ) : (
          /* List mode: all steps */
          <div className="flex flex-col gap-3">
            {recipe.steps.map((step, i) => (
              <div
                key={i}
                onClick={() => { setCookingMode(true); setActiveStep(i); }}
                className="flex gap-3 p-3 rounded-xl border border-zinc-100 bg-white cursor-pointer hover:bg-zinc-50 transition-colors"
              >
                <span className="w-6 h-6 flex-shrink-0 rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-zinc-700 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
