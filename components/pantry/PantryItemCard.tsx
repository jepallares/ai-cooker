'use client';

import type { PantryItem } from '@/types';
import Pill from '@/components/ui/Pill';

/** Days until expiry. Returns null if no expiry date. */
function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(iso + 'T00:00:00');
  return Math.round((exp.getTime() - today.getTime()) / 86_400_000);
}

const LOCATION_LABEL: Record<string, string> = {
  fridge:  '❄️ Nevera',
  freezer: '🧊 Congelador',
  pantry:  '🗄 Despensa',
};

type Props = {
  item: PantryItem;
};

/** Card for a single pantry item showing category, location and expiry. */
export default function PantryItemCard({ item }: Props) {
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
      {/* Name + tags */}
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
    </div>
  );
}
