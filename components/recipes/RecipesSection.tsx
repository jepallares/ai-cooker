'use client';

import { useState, useRef } from 'react';
import type { Recipe, PantryItem } from '@/types';
import RecipeCard from './RecipeCard';
import RecipeView from '@/components/menu/RecipeView';
import AddRecipeForm from './AddRecipeForm';
import { saveRecipe, deleteRecipe } from '@/lib/db';

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
  const [extracting, setExtracting]       = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setExtracting(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/gemini/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, mimeType: file.type }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      // Pre-fill form as a new recipe (no id → form will generate one on save)
      setEditingRecipe(null);
      setShowAddForm(false);
      setEditingRecipe({
        id:          crypto.randomUUID(),
        name:        data.name        ?? '',
        description: data.description ?? '',
        prepTime:    data.prepTime    ?? 0,
        cookTime:    data.cookTime    ?? 0,
        servings:    data.servings    ?? 2,
        kcal:        data.kcal        ?? undefined,
        tags:        data.tags        ?? [],
        ingredients: (data.ingredients ?? []).map((i: { name: string; quantity: number; unit: string }) => ({
          name: i.name, quantity: i.quantity, unit: i.unit,
        })),
        steps:    data.steps    ?? [],
        imageUrl: undefined,
      });
    } catch {
      alert('No se pudo extraer la receta. Inténtalo de nuevo.');
    } finally {
      setExtracting(false);
    }
  }

  const viewRecipe = recipes.find((r) => r.id === viewId) ?? null;

  // Full-screen recipe detail
  if (viewRecipe) {
    return (
      <RecipeView recipe={viewRecipe} pantry={pantry} onBack={() => setViewId(null)} />
    );
  }

  function handleSave(saved: Recipe) {
    saveRecipe(saved).catch(console.error);
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
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoSelected}
        />
        <button
          onClick={() => photoInputRef.current?.click()}
          disabled={extracting}
          className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
        >
          {extracting ? (
            <><span className="w-3 h-3 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" /> Analizando…</>
          ) : '📷 Foto'}
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
              onDelete={() => { deleteRecipe(recipe.id).catch(console.error); setRecipes((prev) => prev.filter((r) => r.id !== recipe.id)); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
