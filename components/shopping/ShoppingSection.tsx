'use client';

import { useState } from 'react';
import type { ShoppingItem } from '@/types';
import Pill from '@/components/ui/Pill';
import { toggleShoppingItem, deleteShoppingItem } from '@/lib/db';
import AlertBanner from '@/components/ui/AlertBanner';

type Props = {
  initialItems: ShoppingItem[];
};

/** Shopping list with animated progress bar, AI banner and checkable items. */
export default function ShoppingSection({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [aiDismissed, setAiDismissed] = useState(false);
  const [aiApproved, setAiApproved] = useState(false);

  const checkedCount = items.filter((i) => i.checked).length;
  const total = items.length;
  const progress = total === 0 ? 0 : Math.round((checkedCount / total) * 100);

  function toggleItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newChecked = !item.checked;
    toggleShoppingItem(id, newChecked).catch(console.error);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: newChecked } : i)),
    );
  }

  // Sort: unchecked first, then checked (done items sink to bottom)
  const sorted = [...items].sort((a, b) => Number(a.checked) - Number(b.checked));

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>{checkedCount} de {total} artículos</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-900 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* AI banner */}
      {!aiDismissed && !aiApproved && (
        <AlertBanner
          variant="info"
          title="Sugerencia IA"
          message="He detectado 3 recetas con ingredientes que faltan. ¿Añado los que necesitas a la lista?"
          actionLabel="Aprobar"
          onAction={() => setAiApproved(true)}
          secondaryLabel="Editar"
          onSecondary={() => {}}
          onDismiss={() => setAiDismissed(true)}
        />
      )}
      {aiApproved && (
        <AlertBanner
          variant="success"
          message="Lista actualizada con los ingredientes que faltan."
          onDismiss={() => setAiApproved(false)}
        />
      )}

      {/* Items */}
      <div className="rounded-xl border border-zinc-100 bg-white divide-y divide-zinc-100">
        {sorted.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors"
          >
            {/* Checkbox */}
            <div
              onClick={() => toggleItem(item.id)}
              className={`w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                item.checked
                  ? 'bg-zinc-900 border-zinc-900'
                  : 'border-zinc-300'
              }`}
            >
              {item.checked && (
                <svg viewBox="0 0 10 8" className="w-3 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            {/* Name + badge */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium transition-colors ${item.checked ? 'line-through text-zinc-300' : 'text-zinc-800'}`}>
                {item.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Pill label={item.category} variant="category" category={item.category} />
              </div>
            </div>

            {/* Quantity */}
            <span className={`text-sm whitespace-nowrap transition-colors ${item.checked ? 'text-zinc-300' : 'text-zinc-500'}`}>
              {item.quantity} {item.unit}
            </span>

            {/* Delete button */}
            <button
              onClick={(e) => { e.preventDefault(); deleteShoppingItem(item.id).catch(console.error); setItems((prev) => prev.filter((i) => i.id !== item.id)); }}
              title="Eliminar"
              className="p-1 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
                <path d="M5 5h10l-1 11H6L5 5zm3-2h4M3 5h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </label>
        ))}
      </div>

      {/* Add item shortcut */}
      <button className="w-full py-3 rounded-xl border border-dashed border-zinc-300 text-sm text-zinc-400 hover:bg-zinc-50 transition-colors">
        + Añadir artículo
      </button>
    </div>
  );
}
