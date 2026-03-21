'use client';

import { useState } from 'react';
import type { Recipe } from '@/types';
import Pill from '@/components/ui/Pill';

// Fallback emoji when imageUrl is absent or fails to load
const TAG_EMOJI: Record<string, string> = {
  breakfast: '🌅', lunch: '☀️', dinner: '🌙',
  quick: '⚡', vegetarian: '🥦', vegan: '🌱',
  'high-protein': '💪', healthy: '🥗', family: '👨‍👩‍👧',
};

function recipeEmoji(tags: string[]): string {
  for (const tag of tags) if (TAG_EMOJI[tag]) return TAG_EMOJI[tag];
  return '🍽';
}

type Props = {
  recipe: Recipe;
  onClick: () => void;
};

/** 2-column grid card with hero image (falls back to emoji on error), name, tags, time and kcal. */
export default function RecipeCard({ recipe, onClick }: Props) {
  const [imgError, setImgError] = useState(false);
  const totalTime = recipe.prepTime + recipe.cookTime;
  const showImage = !!recipe.imageUrl && !imgError;

  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-zinc-100 bg-white flex flex-col text-left hover:bg-zinc-50 transition-colors w-full overflow-hidden"
    >
      {/* Hero image / emoji fallback */}
      <div className="w-full aspect-video bg-zinc-100 flex items-center justify-center overflow-hidden">
        {showImage ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-3xl">{recipeEmoji(recipe.tags)}</span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        <p className="text-sm font-semibold text-zinc-800 leading-snug">{recipe.name}</p>

        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 2).map((tag) => <Pill key={tag} label={tag} />)}
        </div>

        <div className="flex gap-3 text-xs text-zinc-400">
          <span>⏱ {totalTime}m</span>
          {recipe.kcal && <span>🔥 {recipe.kcal}</span>}
          <span>👤 {recipe.servings}</span>
        </div>
      </div>
    </button>
  );
}
