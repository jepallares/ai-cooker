'use client';

import { useState } from 'react';
import type { Recipe, PantryItem } from '@/types';
import RecipeCard from './RecipeCard';
import RecipeView from '@/components/menu/RecipeView';
import AddRecipeForm from './AddRecipeForm';

function allTags(recipes: Recipe[]): string[] {
  return Array.from(new Set(recipes.flatMap((r) => r.tags))).sort();
}

type Props = {
  initialRecipes: Recipe[];
  pantry: PantryItem[];
};

/** Recipe library: tag filter, 2-column grid, inline add and edit forms. */
export default function RecipesSection({ initialRecipes, pantry }: Props) {
  const [recipes, setRecipes]     = useState(initialRecipes);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewId, setViewId]       = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showAddForm, setShowAddForm]     = useState(false);

  const viewRecipe = recipes.find((r) => r.id === viewId) ?? null;

  // Full-screen recipe detail
  if (viewRecipe) {
    return (
      <RecipeView recipe={viewRecipe} pantry={pantry} onBack={() => setViewId(null)} />
    );
  }

  function handleSave(saved: Recipe) {
    setRecipes((prev) => {
      const exists = prev.some((r) => r.id === saved.id);
      return exists ? prev.map((r) => r.id === saved.id ? saved : r) : [saved, ...prev];
    });
    setEditingRecipe(null);
    setShowAddForm(false);
  }

  const tags    = allTags(recipes);
  const visible = activeTag ? recipes.filter((r) => r.tags.includes(activeTag)) : recipes;

  return (
    <div className="flex flex-col gap-5">
      {/* Add buttons */}
      <div className="flex gap-2">
        <button className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          📷 Foto
        </button>
        <button className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          🔗 URL
        </button>
        <button onClick={() => { setEditingRecipe(null); setShowAddForm(true); }}
          className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors">
          + Manual
        </button>
      </div>

      {/* Inline add form */}
      {showAddForm && !editingRecipe && (
        <AddRecipeForm onSave={handleSave} onCancel={() => setShowAddForm(false)} />
      )}

      {/* Inline edit form */}
      {editingRecipe && (
        <AddRecipeForm
          initialData={editingRecipe}
          onSave={handleSave}
          onCancel={() => setEditingRecipe(null)}
        />
      )}

      {/* Tag filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        <button onClick={() => setActiveTag(null)}
          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !activeTag ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}>
          Todo
        </button>
        {tags.map((tag) => (
          <button key={tag} onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTag === tag ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}>
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-400">Sin recetas para este filtro</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visible.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => setViewId(recipe.id)}
              onEdit={() => { setShowAddForm(false); setEditingRecipe(recipe); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
