'use client';

import { useState } from 'react';
import type { Section } from '@/types';
import { pantryItems, recipes, weeklyMenu, shoppingList } from '@/lib/data';

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
 * Root page — owns the active section state and routes to each section component.
 * To add a new section: add it to the Section type, SECTION_TITLE map, and the switch below.
 */
export default function Home() {
  const [section, setSection] = useState<Section>('menu');

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 pt-safe">
        <div className="max-w-lg mx-auto py-4">
          <h1 className="text-lg font-bold text-zinc-900">{SECTION_TITLE[section]}</h1>
        </div>
      </header>

      {/* Main content — pb-24 leaves room for the fixed bottom nav */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-5 pb-24">
        {section === 'menu' && (
          <WeekView menu={weeklyMenu} recipes={recipes} pantry={pantryItems} />
        )}
        {section === 'planner' && (
          <PlannerSection recipes={recipes} />
        )}
        {section === 'pantry' && (
          <PantrySection initialItems={pantryItems} />
        )}
        {section === 'recipes' && (
          <RecipesSection initialRecipes={recipes} pantry={pantryItems} />
        )}
        {section === 'shopping' && (
          <ShoppingSection initialItems={shoppingList} />
        )}
      </main>

      {/* Bottom navigation */}
      <Navigation active={section} onChange={setSection} />
    </div>
  );
}
