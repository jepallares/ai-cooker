import type { PantryItem, Recipe, WeeklyMenu, ShoppingItem } from '@/types';

export const pantryItems: PantryItem[] = [
  { id: 'p1', name: 'Eggs', quantity: 12, unit: 'units', category: 'dairy', expiresAt: '2026-03-28' },
  { id: 'p2', name: 'Chicken breast', quantity: 600, unit: 'g', category: 'meat', expiresAt: '2026-03-22' },
  { id: 'p3', name: 'Pasta', quantity: 500, unit: 'g', category: 'pantry' },
  { id: 'p4', name: 'Tomato sauce', quantity: 2, unit: 'cans', category: 'pantry' },
  { id: 'p5', name: 'Olive oil', quantity: 1, unit: 'bottle', category: 'pantry' },
  { id: 'p6', name: 'Onion', quantity: 3, unit: 'units', category: 'produce', expiresAt: '2026-04-01' },
  { id: 'p7', name: 'Garlic', quantity: 1, unit: 'head', category: 'produce' },
  { id: 'p8', name: 'Spinach', quantity: 200, unit: 'g', category: 'produce', expiresAt: '2026-03-23' },
  { id: 'p9', name: 'Greek yogurt', quantity: 500, unit: 'g', category: 'dairy', expiresAt: '2026-03-25' },
  { id: 'p10', name: 'Oats', quantity: 800, unit: 'g', category: 'pantry' },
  { id: 'p11', name: 'Banana', quantity: 5, unit: 'units', category: 'produce', expiresAt: '2026-03-24' },
  { id: 'p12', name: 'Lentils', quantity: 400, unit: 'g', category: 'pantry' },
];

export const recipes: Recipe[] = [
  {
    id: 'r1',
    name: 'Scrambled eggs with spinach',
    description: 'Quick and nutritious breakfast with eggs and fresh spinach.',
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    tags: ['breakfast', 'quick', 'vegetarian'],
    ingredients: [
      { pantryItemId: 'p1', name: 'Eggs', quantity: 4, unit: 'units' },
      { pantryItemId: 'p8', name: 'Spinach', quantity: 80, unit: 'g' },
      { pantryItemId: 'p5', name: 'Olive oil', quantity: 1, unit: 'tbsp' },
    ],
    steps: [
      'Whisk eggs in a bowl and season with salt and pepper.',
      'Heat olive oil in a pan over medium heat.',
      'Add spinach and sauté until wilted, about 2 minutes.',
      'Pour in the eggs and stir gently until cooked through.',
    ],
  },
  {
    id: 'r2',
    name: 'Banana oat porridge',
    description: 'Creamy oat porridge topped with sliced banana.',
    prepTime: 2,
    cookTime: 8,
    servings: 1,
    tags: ['breakfast', 'quick', 'vegan'],
    ingredients: [
      { pantryItemId: 'p10', name: 'Oats', quantity: 80, unit: 'g' },
      { pantryItemId: 'p11', name: 'Banana', quantity: 1, unit: 'unit' },
      { name: 'Milk or plant milk', quantity: 200, unit: 'ml' },
    ],
    steps: [
      'Combine oats and milk in a saucepan.',
      'Cook over medium heat, stirring, for 5-7 minutes until thick.',
      'Pour into a bowl and top with sliced banana.',
    ],
  },
  {
    id: 'r3',
    name: 'Pasta with tomato sauce',
    description: 'Classic Italian pasta with homemade tomato sauce.',
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    tags: ['dinner', 'vegetarian', 'family'],
    ingredients: [
      { pantryItemId: 'p3', name: 'Pasta', quantity: 400, unit: 'g' },
      { pantryItemId: 'p4', name: 'Tomato sauce', quantity: 1, unit: 'can' },
      { pantryItemId: 'p6', name: 'Onion', quantity: 1, unit: 'unit' },
      { pantryItemId: 'p7', name: 'Garlic', quantity: 2, unit: 'cloves' },
      { pantryItemId: 'p5', name: 'Olive oil', quantity: 2, unit: 'tbsp' },
    ],
    steps: [
      'Cook pasta according to package instructions.',
      'Dice onion and mince garlic.',
      'Sauté onion in olive oil until soft, then add garlic for 1 minute.',
      'Add tomato sauce and simmer for 10 minutes.',
      'Drain pasta and toss with sauce.',
    ],
  },
  {
    id: 'r4',
    name: 'Grilled chicken with lentils',
    description: 'Protein-packed dinner with grilled chicken breast and spiced lentils.',
    prepTime: 15,
    cookTime: 30,
    servings: 2,
    tags: ['dinner', 'high-protein', 'healthy'],
    ingredients: [
      { pantryItemId: 'p2', name: 'Chicken breast', quantity: 300, unit: 'g' },
      { pantryItemId: 'p12', name: 'Lentils', quantity: 200, unit: 'g' },
      { pantryItemId: 'p6', name: 'Onion', quantity: 1, unit: 'unit' },
      { pantryItemId: 'p7', name: 'Garlic', quantity: 2, unit: 'cloves' },
      { pantryItemId: 'p5', name: 'Olive oil', quantity: 1, unit: 'tbsp' },
    ],
    steps: [
      'Rinse lentils and cook in salted water for 20-25 minutes.',
      'Season chicken with salt, pepper, and a drizzle of olive oil.',
      'Grill chicken over medium-high heat, 6-7 minutes per side.',
      'Sauté onion and garlic, add drained lentils and season.',
      'Serve chicken over lentils.',
    ],
  },
  {
    id: 'r5',
    name: 'Greek yogurt bowl',
    description: 'Simple and refreshing lunch with yogurt and toppings.',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    tags: ['lunch', 'quick', 'vegetarian'],
    ingredients: [
      { pantryItemId: 'p9', name: 'Greek yogurt', quantity: 200, unit: 'g' },
      { pantryItemId: 'p11', name: 'Banana', quantity: 1, unit: 'unit' },
      { name: 'Honey', quantity: 1, unit: 'tsp' },
    ],
    steps: [
      'Spoon yogurt into a bowl.',
      'Slice banana and arrange on top.',
      'Drizzle with honey.',
    ],
  },
];

export const weeklyMenu: WeeklyMenu = {
  id: 'wm1',
  weekStart: '2026-03-17',
  days: {
    monday: {
      breakfast: { recipeId: 'r1' },
      lunch: { recipeId: 'r5' },
      dinner: { recipeId: 'r3' },
    },
    tuesday: {
      breakfast: { recipeId: 'r2' },
      lunch: { recipeId: null },
      dinner: { recipeId: 'r4' },
    },
    wednesday: {
      breakfast: { recipeId: 'r1' },
      lunch: { recipeId: 'r5' },
      dinner: { recipeId: 'r3' },
    },
    thursday: {
      breakfast: { recipeId: 'r2' },
      lunch: { recipeId: null },
      dinner: { recipeId: 'r4' },
    },
    friday: {
      breakfast: { recipeId: 'r1' },
      lunch: { recipeId: 'r5' },
      dinner: { recipeId: 'r3' },
    },
    saturday: {
      breakfast: { recipeId: 'r2' },
      lunch: { recipeId: null },
      dinner: { recipeId: null },
    },
    sunday: {
      breakfast: { recipeId: null },
      lunch: { recipeId: null },
      dinner: { recipeId: null },
    },
  },
};

export const shoppingList: ShoppingItem[] = [
  { id: 's1', name: 'Milk', quantity: 1, unit: 'L', category: 'dairy', checked: false, recipeIds: ['r2'] },
  { id: 's2', name: 'Honey', quantity: 1, unit: 'jar', category: 'pantry', checked: false, recipeIds: ['r5'] },
  { id: 's3', name: 'Parmesan', quantity: 100, unit: 'g', category: 'dairy', checked: true, recipeIds: ['r3'] },
  { id: 's4', name: 'Bell pepper', quantity: 2, unit: 'units', category: 'produce', checked: false, recipeIds: [] },
  { id: 's5', name: 'Salmon fillet', quantity: 400, unit: 'g', category: 'meat', checked: false, recipeIds: [] },
];
