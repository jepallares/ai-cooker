'use client';

import type { Recipe } from '@/types';
import Pill from '@/components/ui/Pill';

// Emoji icons per tag — add entries here to customise recipe card icons
const RECIPE_EMOJI: Record<string, string> = {
  breakfast:  '🌅',
  lunch:      '☀️',
  dinner:     '🌙',
  quick:      '⚡',
  vegetarian: '🥦',
  vegan:      '🌱',
  'high-protein': '💪',
  healthy:    '🥗',
  family:     '👨‍👩‍👧',
};

function recipeEmoji(tags: string[]): string {
  for (const tag of tags) {
    if (RECIPE_EMOJI[tag]) return RECIPE_EMOJI[tag];
  }
  return '🍽';
}

type Props = {
  recipe: Recipe;
  onClick: () => void;
};

/** 2-column grid card showing recipe icon, name, tags, time and kcal. */
export default function RecipeCard({ recipe, onClick }: Props) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-zinc-100 bg-white p-4 flex flex-col gap-3 text-left hover:bg-zinc-50 transition-colors w-full"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-xl">
        {recipeEmoji(recipe.tags)}
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-zinc-800 leading-snug">{recipe.name}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {recipe.tags.slice(0, 2).map((tag) => <Pill key={tag} label={tag} />)}
      </div>

      {/* Meta */}
      <div className="flex gap-3 text-xs text-zinc-400 mt-auto">
        <span>⏱ {totalTime}m</span>
        {recipe.kcal && <span>🔥 {recipe.kcal}</span>}
        <span>👤 {recipe.servings}</span>
      </div>
    </button>
  );
}
