'use client';

import type { PantryItem } from '@/types';
import Pill from '@/components/ui/Pill';

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(iso + 'T00:00:00').getTime() - today.getTime()) / 86_400_000);
}

const LOCATION_LABEL: Record<string, string> = {
  fridge:  '❄️ Nevera',
  freezer: '🧊 Congelador',
  pantry:  '🗄 Despensa',
};

type Props = {
  item: PantryItem;
  onEdit: () => void;
};

/** Pantry item row with category badge, location, expiry colour, and edit button. */
export default function PantryItemCard({ item, onEdit }: Props) {
  const days = item.expiresAt ? daysUntil(item.expiresAt) : null;

  let expiryClass = 'text-zinc-400';
  let expiryLabel = '';
  if (days !== null) {
    if (days < 0)       { expiryClass = 'text-red-500';   expiryLabel = 'Caducado'; }
    else if (days === 0){ expiryClass = 'text-red-500';   expiryLabel = 'Caduca hoy'; }
    else if (days <= 3) { expiryClass = 'text-amber-500'; expiryLabel = `${days}d`; }
    else                { expiryLabel = `${days}d`; }
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-zinc-100 last:border-b-0">
      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-800 truncate">{item.name}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <Pill label={item.category} variant="category" category={item.category} />
          <span className="text-xs text-zinc-400">{LOCATION_LABEL[item.location]}</span>
        </div>
      </div>

      {/* Quantity */}
      <span className="text-sm text-zinc-500 whitespace-nowrap">
        {item.quantity} {item.unit}
      </span>

      {/* Expiry */}
      {days !== null && (
        <span className={`text-xs font-semibold whitespace-nowrap ${expiryClass}`}>
          {expiryLabel}
        </span>
      )}

      {/* Edit button */}
      <button
        onClick={onEdit}
        title="Editar"
        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors flex-shrink-0"
      >
        {/* Pencil icon */}
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
          <path d="M13.5 3.5l3 3L6 17H3v-3L13.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
