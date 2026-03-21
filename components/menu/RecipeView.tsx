'use client';

import { useState } from 'react';
import type { Recipe, PantryItem } from '@/types';
import Pill from '@/components/ui/Pill';

// ─── Emoji icon per first matching tag ───────────────────────────────────────

const TAG_EMOJI: Record<string, string> = {
  breakfast: '🌅', lunch: '☀️', dinner: '🌙',
  quick: '⚡', vegetarian: '🥦', vegan: '🌱',
  'high-protein': '💪', healthy: '🥗', family: '👨‍👩‍👧',
};

function recipeEmoji(tags: string[]): string {
  for (const tag of tags) if (TAG_EMOJI[tag]) return TAG_EMOJI[tag];
  return '🍽';
}

// ─── Component ───────────────────────────────────────────────────────────────

type Props = {
  recipe: Recipe;
  pantry: PantryItem[];
  onBack: () => void;
};

/** Recipe detail: hero image, stats, ingredient list with pantry status, expandable steps, cooking mode. */
export default function RecipeView({ recipe, pantry, onBack }: Props) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [cookingMode, setCookingMode]   = useState(false);
  const [activeStep, setActiveStep]     = useState(0);
  const [imgError, setImgError]         = useState(false);

  const showImage = !!recipe.imageUrl && !imgError;

  const pantryIds = new Set(pantry.map((p) => p.id));
  const totalTime = recipe.prepTime + recipe.cookTime;
  const missing   = recipe.ingredients.filter((ing) => ing.pantryItemId && !pantryIds.has(ing.pantryItemId));

  // ── Cooking mode ──────────────────────────────────────────────────────────
  if (cookingMode) {
    const isLast = activeStep === recipe.steps.length - 1;
    return (
      <div className="flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCookingMode(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors"
          >
            ‹
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-400">Cocinando</p>
            <h2 className="text-sm font-bold text-zinc-900 truncate">{recipe.name}</h2>
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Paso {activeStep + 1} de {recipe.steps.length}</span>
            <span>{Math.round(((activeStep + 1) / recipe.steps.length) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-900 rounded-full transition-all duration-300"
              style={{ width: `${((activeStep + 1) / recipe.steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step card */}
        <div className="rounded-xl border border-zinc-100 bg-white p-6 flex flex-col gap-4">
          <div className="w-9 h-9 rounded-full bg-zinc-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
            {activeStep + 1}
          </div>
          <p className="text-base text-zinc-800 leading-relaxed">{recipe.steps[activeStep]}</p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5">
          {recipe.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === activeStep ? 'bg-zinc-900' : 'bg-zinc-200'}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            disabled={activeStep === 0}
            className="flex-1 py-3 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 disabled:opacity-30 hover:bg-zinc-50 transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={() => isLast ? setCookingMode(false) : setActiveStep((s) => s + 1)}
            className="flex-1 py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
          >
            {isLast ? '¡Listo!' : 'Siguiente'}
          </button>
        </div>

      </div>
    );
  }

  // ── Detail view ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      {/* ── Back ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors"
        >
          ‹
        </button>
      </div>

      {/* ── Hero image + name ── */}
      <div className="flex flex-col gap-3">
        <div className="w-full h-48 rounded-2xl overflow-hidden bg-zinc-100 flex items-center justify-center">
          {showImage ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-5xl">{recipeEmoji(recipe.tags)}</span>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 leading-snug">{recipe.name}</h2>
          {recipe.description && (
            <p className="text-sm text-zinc-500 leading-relaxed mt-1">{recipe.description}</p>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-2">
        <StatChip icon="⏱" label={`${totalTime}m`}   sub="Tiempo" />
        {recipe.kcal
          ? <StatChip icon="🔥" label={`${recipe.kcal}`} sub="kcal" />
          : <StatChip icon="👤" label={`${recipe.servings}`} sub="raciones" />
        }
        <StatChip icon="📋" label={`${recipe.steps.length}`} sub="pasos" />
        <StatChip icon="👤" label={`${recipe.servings}`}     sub="pers." />
      </div>

      {/* ── Tags ── */}
      <div className="flex gap-1.5 flex-wrap">
        {recipe.tags.map((tag) => <Pill key={tag} label={tag} />)}
      </div>

      {/* ── Ingredients ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-800">Ingredientes</h3>
          {missing.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              {missing.length} faltan
            </span>
          )}
        </div>
        <div className="rounded-xl border border-zinc-100 bg-white divide-y divide-zinc-50">
          {recipe.ingredients.map((ing, i) => {
            const ok = !ing.pantryItemId || pantryIds.has(ing.pantryItemId);
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ok ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className={`text-sm flex-1 ${ok ? 'text-zinc-700' : 'text-red-500 font-medium'}`}>
                  {ing.name}
                </span>
                <span className="text-sm text-zinc-400">{ing.quantity} {ing.unit}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Steps ── */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-800 mb-3">Pasos</h3>
        <div className="flex flex-col gap-2">
          {recipe.steps.map((step, i) => {
            const open = expandedStep === i;
            return (
              <button
                key={i}
                onClick={() => setExpandedStep(open ? null : i)}
                className="flex gap-3 items-start rounded-xl border border-zinc-100 bg-white px-4 py-3 text-left hover:bg-zinc-50 transition-colors w-full"
              >
                <span className="w-6 h-6 flex-shrink-0 rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {open ? (
                    <p className="text-sm text-zinc-800 leading-relaxed">{step}</p>
                  ) : (
                    <p className="text-sm text-zinc-600 truncate">{step}</p>
                  )}
                </div>
                <span className={`text-zinc-400 text-sm transition-transform flex-shrink-0 mt-0.5 ${open ? 'rotate-90' : ''}`}>›</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Start cooking button ── */}
      <button
        onClick={() => { setActiveStep(0); setCookingMode(true); }}
        className="w-full py-4 rounded-xl bg-zinc-900 text-sm font-bold text-white hover:bg-zinc-700 transition-colors"
      >
        Empezar a cocinar →
      </button>

    </div>
  );
}

// ─── StatChip ─────────────────────────────────────────────────────────────────

function StatChip({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white flex flex-col items-center py-3 gap-0.5">
      <span className="text-base leading-none">{icon}</span>
      <span className="text-sm font-bold text-zinc-900">{label}</span>
      <span className="text-[10px] text-zinc-400">{sub}</span>
    </div>
  );
}
