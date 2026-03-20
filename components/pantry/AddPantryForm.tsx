'use client';

import { useState } from 'react';
import type { PantryItem, Category, Location } from '@/types';

const CATEGORIES: Category[] = ['produce', 'dairy', 'meat', 'pantry', 'frozen', 'other'];
const LOCATIONS: { id: Location; label: string }[] = [
  { id: 'fridge',  label: '❄️ Nevera' },
  { id: 'freezer', label: '🧊 Congelador' },
  { id: 'pantry',  label: '🗄 Despensa' },
];

type FormState = {
  name: string;
  quantity: string;
  unit: string;
  category: Category;
  location: Location;
  expiresAt: string;
};

const EMPTY: FormState = {
  name: '', quantity: '', unit: '', category: 'produce', location: 'fridge', expiresAt: '',
};

type Props = {
  onSave: (item: PantryItem) => void;
  onCancel: () => void;
};

/** Inline form to add a new pantry item. Calls onSave with the constructed PantryItem. */
export default function AddPantryForm({ onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim())          e.name     = 'Obligatorio';
    if (!form.quantity.trim() || isNaN(Number(form.quantity))) e.quantity = 'Número válido';
    if (!form.unit.trim())          e.unit     = 'Obligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave({
      id:        `p-${Date.now()}`,
      name:      form.name.trim(),
      quantity:  Number(form.quantity),
      unit:      form.unit.trim(),
      category:  form.category,
      location:  form.location,
      expiresAt: form.expiresAt || undefined,
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-zinc-800">Nuevo producto</h3>

      {/* Name */}
      <Field label="Nombre" error={errors.name}>
        <input
          type="text"
          placeholder="p.ej. Leche"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className={inputClass(!!errors.name)}
        />
      </Field>

      {/* Quantity + Unit */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cantidad" error={errors.quantity}>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
            className={inputClass(!!errors.quantity)}
          />
        </Field>
        <Field label="Unidad" error={errors.unit}>
          <input
            type="text"
            placeholder="g / L / units"
            value={form.unit}
            onChange={(e) => set('unit', e.target.value)}
            className={inputClass(!!errors.unit)}
          />
        </Field>
      </div>

      {/* Category */}
      <Field label="Categoría">
        <select value={form.category} onChange={(e) => set('category', e.target.value as Category)} className={inputClass(false)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      {/* Location */}
      <Field label="Ubicación">
        <div className="flex gap-2">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              type="button"
              onClick={() => set('location', loc.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                form.location === loc.id
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </Field>

      {/* Expiry date (optional) */}
      <Field label="Caduca (opcional)">
        <input
          type="date"
          value={form.expiresAt}
          onChange={(e) => set('expiresAt', e.target.value)}
          className={inputClass(false)}
        />
      </Field>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

function inputClass(hasError: boolean) {
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
