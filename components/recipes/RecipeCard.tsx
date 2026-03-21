'use client';

import { useState } from 'react';
import type { Recipe } from '@/types';
import Pill from '@/components/ui/Pill';

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
  onEdit: () => void;
};

/** 2-column grid card with hero image, name, tags, time, kcal and edit button. */
export default function RecipeCard({ recipe, onClick, onEdit }: Props) {
  const [imgError, setImgError] = useState(false);
  const totalTime = recipe.prepTime + recipe.cookTime;
  const showImage = !!recipe.imageUrl && !imgError;

  return (
    <div className="rounded-xl border border-zinc-100 bg-white flex flex-col overflow-hidden relative">
      {/* Hero image / emoji fallback — tappable to open recipe */}
      <button onClick={onClick} className="w-full aspect-video bg-zinc-100 flex items-center justify-center overflow-hidden">
        {showImage ? (
          <img src={recipe.imageUrl} alt={recipe.name}
            className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <span className="text-3xl">{recipeEmoji(recipe.tags)}</span>
        )}
      </button>

      {/* Edit button — top-right corner overlay */}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        title="Editar receta"
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-3.5 h-3.5">
          <path d="M13.5 3.5l3 3L6 17H3v-3L13.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Content */}
      <button onClick={onClick} className="p-3 flex flex-col gap-2 text-left w-full">
        <p className="text-sm font-semibold text-zinc-800 leading-snug">{recipe.name}</p>
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 2).map((tag) => <Pill key={tag} label={tag} />)}
        </div>
        <div className="flex gap-3 text-xs text-zinc-400">
          <span>⏱ {totalTime}m</span>
          {recipe.kcal && <span>🔥 {recipe.kcal}</span>}
          <span>👤 {recipe.servings}</span>
        </div>
      </button>
    </div>
  );
}
