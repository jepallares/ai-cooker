export type PantryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: 'produce' | 'dairy' | 'meat' | 'pantry' | 'frozen' | 'other';
  expiresAt?: string; // ISO date string
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  tags: string[];
  ingredients: {
    pantryItemId?: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  steps: string[];
  imageUrl?: string;
};

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

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
  weekStart: string; // ISO date string (Monday)
  days: Record<DayOfWeek, DayMenu>;
};

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: PantryItem['category'];
  checked: boolean;
  recipeIds: string[]; // which recipes need this
};
