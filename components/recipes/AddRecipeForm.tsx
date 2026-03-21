'use client';

import { useState } from 'react';
import type { Recipe, RecipeIngredient } from '@/types';

type IngredientDraft = { name: string; quantity: string; unit: string };

type FormState = {
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  kcal: string;
  tags: string;   // comma-separated
  steps: string;  // one per line
};

function recipeToForm(r: Recipe): FormState {
  return {
    name:        r.name,
    description: r.description ?? '',
    prepTime:    String(r.prepTime),
    cookTime:    String(r.cookTime),
    servings:    String(r.servings),
    kcal:        r.kcal != null ? String(r.kcal) : '',
    tags:        r.tags.join(', '),
    steps:       r.steps.join('\n'),
  };
}

function recipeToIngDrafts(r: Recipe): IngredientDraft[] {
  if (!r.ingredients.length) return [{ name: '', quantity: '', unit: '' }];
  return r.ingredients.map((i) => ({
    name:     i.name,
    quantity: String(i.quantity),
    unit:     i.unit,
  }));
}

const EMPTY_FORM: FormState = {
  name: '', description: '', prepTime: '', cookTime: '',
  servings: '2', kcal: '', tags: '', steps: '',
};

type Props = {
  /** When provided the form is in edit mode — pre-fills all fields and preserves the recipe id. */
  initialData?: Recipe;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
};

/** Inline form to add or edit a recipe. Tags are comma-separated; steps are one per line. */
export default function AddRecipeForm({ initialData, onSave, onCancel }: Props) {
  const isEditing = !!initialData;
  const [form, setForm]             = useState<FormState>(() => initialData ? recipeToForm(initialData) : EMPTY_FORM);
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(() =>
    initialData ? recipeToIngDrafts(initialData) : [{ name: '', quantity: '', unit: '' }],
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  function setField<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function setIngredient(i: number, key: keyof IngredientDraft, value: string) {
    setIngredients((prev) => prev.map((ing, idx) => idx === i ? { ...ing, [key]: value } : ing));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim())                              e.name     = 'Obligatorio';
    if (!form.prepTime || isNaN(Number(form.prepTime))) e.prepTime = 'Número válido';
    if (!form.cookTime || isNaN(Number(form.cookTime))) e.cookTime = 'Número válido';
    if (!form.servings || isNaN(Number(form.servings))) e.servings = 'Número válido';
    if (!form.steps.trim())                             e.steps    = 'Al menos un paso';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const parsedIngredients: RecipeIngredient[] = ingredients
      .filter((i) => i.name.trim())
      .map((i) => ({ name: i.name.trim(), quantity: Number(i.quantity) || 1, unit: i.unit.trim() || 'units' }));

    onSave({
      id:          initialData?.id ?? `r-${Date.now()}`,
      name:        form.name.trim(),
      description: form.description.trim(),
      prepTime:    Number(form.prepTime),
      cookTime:    Number(form.cookTime),
      servings:    Number(form.servings),
      kcal:        form.kcal ? Number(form.kcal) : undefined,
      tags:        form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      ingredients: parsedIngredients,
      steps:       form.steps.split('\n').map((s) => s.trim()).filter(Boolean),
      imageUrl:    initialData?.imageUrl,
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-zinc-800">{isEditing ? 'Editar receta' : 'Nueva receta'}</h3>

      <Field label="Nombre" error={errors.name}>
        <input type="text" placeholder="p.ej. Tortilla española" value={form.name}
          onChange={(e) => setField('name', e.target.value)} className={ic(!!errors.name)} />
      </Field>

      <Field label="Descripción (opcional)">
        <input type="text" placeholder="Breve descripción..." value={form.description}
          onChange={(e) => setField('description', e.target.value)} className={ic(false)} />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Prep (min)" error={errors.prepTime}>
          <input type="number" min={0} placeholder="5" value={form.prepTime}
            onChange={(e) => setField('prepTime', e.target.value)} className={ic(!!errors.prepTime)} />
        </Field>
        <Field label="Cocción (min)" error={errors.cookTime}>
          <input type="number" min={0} placeholder="20" value={form.cookTime}
            onChange={(e) => setField('cookTime', e.target.value)} className={ic(!!errors.cookTime)} />
        </Field>
        <Field label="Raciones" error={errors.servings}>
          <input type="number" min={1} placeholder="2" value={form.servings}
            onChange={(e) => setField('servings', e.target.value)} className={ic(!!errors.servings)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Kcal (opcional)">
          <input type="number" min={0} placeholder="450" value={form.kcal}
            onChange={(e) => setField('kcal', e.target.value)} className={ic(false)} />
        </Field>
        <Field label="Tags (coma)">
          <input type="text" placeholder="dinner, quick" value={form.tags}
            onChange={(e) => setField('tags', e.target.value)} className={ic(false)} />
        </Field>
      </div>

      {/* Ingredients */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-zinc-500">Ingredientes</label>
        {ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input type="text" placeholder="Nombre" value={ing.name}
              onChange={(e) => setIngredient(i, 'name', e.target.value)}
              className={`${ic(false)} flex-[3]`} />
            <input type="number" placeholder="Cant." min={0} value={ing.quantity}
              onChange={(e) => setIngredient(i, 'quantity', e.target.value)}
              className={`${ic(false)} flex-[1] min-w-0`} />
            <input type="text" placeholder="Ud." value={ing.unit}
              onChange={(e) => setIngredient(i, 'unit', e.target.value)}
              className={`${ic(false)} flex-[1] min-w-0`} />
            {ingredients.length > 1 && (
              <button type="button" onClick={() => setIngredients((p) => p.filter((_, idx) => idx !== i))}
                className="mt-0.5 text-zinc-400 hover:text-red-500 transition-colors text-lg leading-none px-1">×</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setIngredients((p) => [...p, { name: '', quantity: '', unit: '' }])}
          className="self-start text-xs font-medium text-zinc-500 hover:text-zinc-800 transition-colors">
          + Añadir ingrediente
        </button>
      </div>

      <Field label="Pasos (uno por línea)" error={errors.steps}>
        <textarea rows={4} placeholder={"Calienta el aceite.\nAñade los huevos..."}
          value={form.steps} onChange={(e) => setField('steps', e.target.value)}
          className={`${ic(!!errors.steps)} resize-none`} />
      </Field>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          Cancelar
        </button>
        <button type="button" onClick={handleSubmit}
          className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
          {isEditing ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

function ic(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow ${
    hasError ? 'border-red-400 bg-red-50' : 'border-zinc-200 bg-white'
  }`;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
