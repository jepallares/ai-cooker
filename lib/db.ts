import { supabase } from './supabase';
import type {
  PantryItem, Recipe, RecipeIngredient,
  WeeklyMenu, ShoppingItem,
  DayOfWeek, MealType, DayMenu,
} from '@/types';

// ─── Type converters ──────────────────────────────────────────────────────────

function dbToPantryItem(row: Record<string, unknown>): PantryItem {
  return {
    id:        row.id as string,
    name:      row.name as string,
    quantity:  Number(row.quantity),
    unit:      row.unit as string,
    category:  row.category as PantryItem['category'],
    location:  row.location as PantryItem['location'],
    expiresAt: (row.expires_at as string | null) ?? undefined,
  };
}

function pantryItemToDb(item: Omit<PantryItem, 'id'>) {
  return {
    name:       item.name,
    quantity:   item.quantity,
    unit:       item.unit,
    category:   item.category,
    location:   item.location,
    expires_at: item.expiresAt ?? null,
  };
}

function dbToRecipe(row: Record<string, unknown>): Recipe {
  const rawIngs = (row.recipe_ingredients ?? []) as Record<string, unknown>[];
  const ingredients: RecipeIngredient[] = rawIngs
    .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
    .map((ing) => ({
      pantryItemId: (ing.pantry_item_id as string | null) ?? undefined,
      name:         ing.name as string,
      quantity:     Number(ing.quantity),
      unit:         ing.unit as string,
    }));

  return {
    id:          row.id as string,
    name:        row.name as string,
    description: (row.description as string) ?? '',
    prepTime:    row.prep_time as number,
    cookTime:    row.cook_time as number,
    servings:    row.servings as number,
    kcal:        (row.kcal as number | null) ?? undefined,
    tags:        (row.tags as string[]) ?? [],
    ingredients,
    steps:       (row.steps as string[]) ?? [],
    imageUrl:    (row.image_url as string | null) ?? undefined,
  };
}

function recipeToDb(recipe: Omit<Recipe, 'id' | 'ingredients' | 'steps'>) {
  return {
    name:        recipe.name,
    description: recipe.description,
    prep_time:   recipe.prepTime,
    cook_time:   recipe.cookTime,
    servings:    recipe.servings,
    kcal:        recipe.kcal ?? null,
    tags:        recipe.tags,
    image_url:   recipe.imageUrl ?? null,
  };
}

const ALL_DAYS: DayOfWeek[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

function dbRowsToWeeklyMenu(rows: Record<string, unknown>[], weekStart: string): WeeklyMenu {
  const days = Object.fromEntries(
    ALL_DAYS.map((d) => [d, {}])
  ) as Record<DayOfWeek, DayMenu>;

  for (const row of rows) {
    const day  = row.day_of_week as DayOfWeek;
    const meal = row.meal_type as MealType;
    days[day][meal] = {
      recipeId: (row.recipe_id as string | null),
      notes:    (row.notes as string | null) ?? undefined,
    };
  }

  return { id: weekStart, weekStart, days };
}

function dbToShoppingItem(row: Record<string, unknown>): ShoppingItem {
  return {
    id:        row.id as string,
    name:      row.name as string,
    quantity:  Number(row.quantity),
    unit:      row.unit as string,
    category:  row.category as ShoppingItem['category'],
    checked:   row.checked as boolean,
    recipeIds: (row.recipe_ids as string[]) ?? [],
  };
}

// ─── Pantry ───────────────────────────────────────────────────────────────────

export async function getPantryItems(): Promise<PantryItem[]> {
  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(dbToPantryItem);
}

export async function savePantryItem(item: PantryItem): Promise<PantryItem> {
  const { data, error } = await supabase
    .from('pantry_items')
    .upsert({ id: item.id, ...pantryItemToDb(item) })
    .select()
    .single();
  if (error) throw error;
  return dbToPantryItem(data as Record<string, unknown>);
}

// ─── Recipes ─────────────────────────────────────────────────────────────────

export async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, recipe_ingredients(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(dbToRecipe);
}

export async function saveRecipe(recipe: Recipe): Promise<Recipe> {
  // Upsert recipe row
  const { data: recipeRow, error: recipeErr } = await supabase
    .from('recipes')
    .upsert({
      id:    recipe.id,
      steps: recipe.steps,
      ...recipeToDb(recipe),
    })
    .select()
    .single();
  if (recipeErr) throw recipeErr;

  // Replace ingredients: delete old, insert new
  await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipe.id);
  if (recipe.ingredients.length > 0) {
    const ingRows = recipe.ingredients.map((ing, i) => ({
      recipe_id:       recipe.id,
      pantry_item_id:  ing.pantryItemId ?? null,
      name:            ing.name,
      quantity:        ing.quantity,
      unit:            ing.unit,
      sort_order:      i,
    }));
    const { error: ingErr } = await supabase.from('recipe_ingredients').insert(ingRows);
    if (ingErr) throw ingErr;
  }

  return dbToRecipe({ ...recipeRow as Record<string, unknown>, recipe_ingredients: recipe.ingredients.map((ing, i) => ({
    pantry_item_id: ing.pantryItemId ?? null,
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit,
    sort_order: i,
  })) });
}

// ─── Weekly menu ─────────────────────────────────────────────────────────────

export async function getWeeklyMenu(weekStart: string): Promise<WeeklyMenu> {
  const { data, error } = await supabase
    .from('weekly_menus')
    .select('*')
    .eq('week_start', weekStart);
  if (error) throw error;
  return dbRowsToWeeklyMenu((data ?? []) as Record<string, unknown>[], weekStart);
}

// ─── Shopping ─────────────────────────────────────────────────────────────────

export async function getShoppingItems(): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(dbToShoppingItem);
}

export async function toggleShoppingItem(id: string, checked: boolean): Promise<void> {
  const { error } = await supabase
    .from('shopping_items')
    .update({ checked })
    .eq('id', id);
  if (error) throw error;
}

export async function deletePantryItem(id: string): Promise<void> {
  const { error } = await supabase.from('pantry_items').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteShoppingItem(id: string): Promise<void> {
  const { error } = await supabase.from('shopping_items').delete().eq('id', id);
  if (error) throw error;
}

// ─── Week helper ──────────────────────────────────────────────────────────────

export function getCurrentWeekStart(): string {
  const today = new Date();
  const day   = today.getDay(); // 0=Sun
  const diff  = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}
