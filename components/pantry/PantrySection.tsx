'use client';

import { useState } from 'react';
import type { PantryItem, Location } from '@/types';
import PantryItemCard from './PantryItemCard';
import AddPantryForm from './AddPantryForm';

const FILTERS: { id: Location | 'all'; label: string }[] = [
  { id: 'all',     label: 'Todo' },
  { id: 'fridge',  label: '❄️ Nevera' },
  { id: 'freezer', label: '🧊 Congelador' },
  { id: 'pantry',  label: '🗄 Despensa' },
];

function daysUntil(iso: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((new Date(iso + 'T00:00:00').getTime() - today.getTime()) / 86_400_000);
}

type Props = {
  initialItems: PantryItem[];
};

/** Pantry section: stat cards, location filter, item list, and inline add form. */
export default function PantrySection({ initialItems }: Props) {
  const [items, setItems]     = useState(initialItems);
  const [filter, setFilter]   = useState<Location | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  const expiringSoon  = items.filter((i) => i.expiresAt && daysUntil(i.expiresAt) <= 3 && daysUntil(i.expiresAt) >= 0);
  const locationCount = new Set(items.map((i) => i.location)).size;
  const filtered      = filter === 'all' ? items : items.filter((i) => i.location === filter);

  function handleSave(item: PantryItem) {
    setItems((prev) => [item, ...prev]);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard value={items.length} label="Productos" />
        <StatCard value={expiringSoon.length} label="Caducan pronto" highlight={expiringSoon.length > 0} />
        <StatCard value={locationCount} label="Ubicaciones" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          <span>📷</span> Foto IA
        </button>
        <button
          onClick={() => setShowForm(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
        >
          <span>+</span> Añadir
        </button>
      </div>

      {/* Inline add form */}
      {showForm && (
        <AddPantryForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {/* Location filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.id
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Item list */}
      <div className="rounded-xl border border-zinc-100 bg-white px-4">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">Sin productos en esta ubicación</p>
        ) : (
          filtered.map((item) => <PantryItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}

function StatCard({ value, label, highlight = false }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-3 text-center">
      <p className={`text-2xl font-bold ${highlight ? 'text-amber-500' : 'text-zinc-900'}`}>{value}</p>
      <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{label}</p>
    </div>
  );
}
