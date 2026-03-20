export type Category = 'produce' | 'dairy' | 'meat' | 'pantry' | 'frozen' | 'other';
export type Location = 'fridge' | 'freezer' | 'pantry';

export type PantryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: Category;
  location: Location;
  expiresAt?: string; // ISO date string YYYY-MM-DD
};

export type RecipeIngredient = {
  pantryItemId?: string;
  name: string;
  quantity: number;
  unit: string;
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  kcal?: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
  imageUrl?: string;
};

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type MealSlot = {
  recipeId: string | null;
  notes?: string;
};

export type DayMenu = {
  breakfast?: MealSlot;
  lunch?: MealSlot;
  dinner?: MealSlot;
};

export type WeeklyMenu = {
  id: string;
  weekStart: string; // ISO date string — always a Monday
  days: Record<DayOfWeek, DayMenu>;
};

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: Category;
  checked: boolean;
  recipeIds: string[];
};

// UI helpers
export type Section = 'menu' | 'planner' | 'pantry' | 'recipes' | 'shopping';
export type MealType = 'breakfast' | 'lunch' | 'dinner';
