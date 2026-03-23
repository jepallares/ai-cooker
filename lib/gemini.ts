import { GoogleGenerativeAI } from '@google/generative-ai';
import type { PantryItem, Recipe, Category, Location } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: { responseMimeType: 'application/json' },
});

// ─── Menu generation ──────────────────────────────────────────────────────────

export type MenuDayProposal = {
  recipeId: string;
  recipeName: string;
  reason: string;
} | null;

export async function generateMenuProposal(input: {
  pantry:    PantryItem[];
  recipes:   Recipe[];
  days:      string[];
  mealType:  'all' | 'breakfast' | 'lunch' | 'dinner';
  people:    number;
}): Promise<Record<string, MenuDayProposal>> {
  const { pantry, recipes, days, mealType, people } = input;

  const pantryText = pantry
    .map((p) => `- ${p.name}: ${p.quantity} ${p.unit}`)
    .join('\n');

  const recipesText = recipes
    .map((r) => {
      const ings = r.ingredients.map((i) => `    · ${i.name} ${i.quantity}${i.unit}`).join('\n');
      return `ID: ${r.id}\nNombre: ${r.name}\nTags: ${r.tags.join(', ')}\nRaciones: ${r.servings}\nIngredientes:\n${ings}`;
    })
    .join('\n\n');

  const mealLabel =
    mealType === 'all'       ? 'cualquier tipo de comida' :
    mealType === 'breakfast' ? 'desayuno' :
    mealType === 'lunch'     ? 'comida' : 'cena';

  const prompt = `Eres un asistente de planificación de menús. Asigna la mejor receta disponible a cada día indicado.

DESPENSA (stock actual):
${pantryText}

RECETAS DISPONIBLES:
${recipesText}

RESTRICCIONES:
- Días a planificar: ${days.join(', ')}
- Tipo de comida: ${mealLabel}
- Número de personas: ${people}
- Prioriza recetas cuyos ingredientes estén mayormente en la despensa.
- Varía las recetas entre días; evita repetir la misma receta dos días seguidos.
- Si ninguna receta encaja, devuelve null para ese día.

Devuelve ÚNICAMENTE un objeto JSON. Clave = fecha ISO (YYYY-MM-DD). Valor = null o:
{
  "recipeId": "<id exacto de la receta>",
  "recipeName": "<nombre de la receta>",
  "reason": "<motivo en español, máx. 1 frase>"
}

Usa sólo IDs que aparezcan en la lista de recetas. No incluyas markdown ni texto extra.`;

  const result = await model.generateContent(prompt);
  const text   = result.response.text();
  const parsed = JSON.parse(text) as Record<string, MenuDayProposal>;

  // Validate: ensure recipeId actually exists in our recipes list
  const validIds = new Set(recipes.map((r) => r.id));
  for (const key of Object.keys(parsed)) {
    const entry = parsed[key];
    if (entry && !validIds.has(entry.recipeId)) parsed[key] = null;
  }

  return parsed;
}

// ─── Photo classification ─────────────────────────────────────────────────────

export type ClassifiedProduct = {
  name:     string;
  quantity: number;
  unit:     string;
  category: Category;
  location: Location;
};

export async function classifyProductPhoto(
  base64:   string,
  mimeType: string,
): Promise<ClassifiedProduct> {
  const prompt = `Analiza esta foto de producto de supermercado y extrae los datos para una app de despensa.
Devuelve ÚNICAMENTE este JSON (sin markdown):
{
  "name": "<nombre del producto en español>",
  "quantity": <cantidad estimada, número>,
  "unit": "<unidad: g, kg, L, ml, units, cans, pack, bottle...>",
  "category": "<una de: produce, dairy, meat, pantry, frozen, other>",
  "location": "<ubicación más probable: fridge, freezer, pantry>"
}`;

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType, data: base64 } },
        { text: prompt },
      ],
    }],
  });

  return JSON.parse(result.response.text()) as ClassifiedProduct;
}
