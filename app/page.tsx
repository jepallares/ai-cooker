'use client';

import { useState, useEffect } from 'react';
import type { Section, PantryItem, Recipe, WeeklyMenu, ShoppingItem } from '@/types';
import { getPantryItems, getRecipes, getWeeklyMenu, getShoppingItems, getCurrentWeekStart } from '@/lib/db';

import Navigation from '@/components/Navigation';
import WeekView from '@/components/menu/WeekView';
import PantrySection from '@/components/pantry/PantrySection';
import RecipesSection from '@/components/recipes/RecipesSection';
import PlannerSection from '@/components/planner/PlannerSection';
import ShoppingSection from '@/components/shopping/ShoppingSection';

const SECTION_TITLE: Record<Section, string> = {
  menu:     'Menú semanal',
  planner:  'Planificar',
  pantry:   'Despensa',
  recipes:  'Recetario',
  shopping: 'Lista de la compra',
};

/**
 * Root page — owns active section and global people count.
 * Data is loaded from Supabase on mount.
 */
export default function Home() {
  const [section, setSection] = useState<Section>('menu');
  const [people, setPeople]   = useState(2);

  const [pantry,   setPantry]   = useState<PantryItem[]>([]);
  const [recipes,  setRecipes]  = useState<Recipe[]>([]);
  const [menu,     setMenu]     = useState<WeeklyMenu | null>(null);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const weekStart = getCurrentWeekStart();
    Promise.all([
      getPantryItems(),
      getRecipes(),
      getWeeklyMenu(weekStart),
      getShoppingItems(),
    ])
      .then(([p, r, m, s]) => {
        setPantry(p);
        setRecipes(r);
        setMenu(m);
        setShopping(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !menu) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 pt-safe">
        <div className="max-w-lg mx-auto py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-zinc-900">{SECTION_TITLE[section]}</h1>
          {/* Global people counter — visible in menu and planner */}
          {(section === 'menu' || section === 'planner') && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400">👤</span>
              <button onClick={() => setPeople((p) => Math.max(1, p - 1))}
                className="w-6 h-6 rounded-full border border-zinc-200 text-zinc-600 text-sm font-bold flex items-center justify-center hover:bg-zinc-50 transition-colors">
                −
              </button>
              <span className="text-sm font-semibold text-zinc-800 w-4 text-center">{people}</span>
              <button onClick={() => setPeople((p) => p + 1)}
                className="w-6 h-6 rounded-full border border-zinc-200 text-zinc-600 text-sm font-bold flex items-center justify-center hover:bg-zinc-50 transition-colors">
                +
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-5 pb-24">
        {section === 'menu' && (
          <WeekView menu={menu} recipes={recipes} pantry={pantry} people={people} />
        )}
        {section === 'planner' && (
          <PlannerSection recipes={recipes} pantry={pantry} people={people} onPeopleChange={setPeople} />
        )}
        {section === 'pantry' && (
          <PantrySection initialItems={pantry} />
        )}
        {section === 'recipes' && (
          <RecipesSection initialRecipes={recipes} pantry={pantry} />
        )}
        {section === 'shopping' && (
          <ShoppingSection initialItems={shopping} />
        )}
      </main>

      <Navigation active={section} onChange={setSection} />
    </div>
  );
}
