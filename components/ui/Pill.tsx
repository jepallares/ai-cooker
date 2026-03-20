'use client';

import type { Category } from '@/types';

// Color map shared across the app — edit here to retheme all badges at once
const categoryColors: Record<Category, string> = {
  produce: 'bg-green-100 text-green-700',
  dairy:   'bg-blue-100 text-blue-700',
  meat:    'bg-red-100 text-red-700',
  pantry:  'bg-amber-100 text-amber-700',
  frozen:  'bg-cyan-100 text-cyan-700',
  other:   'bg-zinc-100 text-zinc-600',
};

const tagColors: Record<string, string> = {
  breakfast:    'bg-orange-100 text-orange-700',
  lunch:        'bg-yellow-100 text-yellow-700',
  dinner:       'bg-purple-100 text-purple-700',
  quick:        'bg-sky-100 text-sky-700',
  vegetarian:   'bg-green-100 text-green-700',
  vegan:        'bg-emerald-100 text-emerald-700',
  'high-protein':'bg-red-100 text-red-700',
  healthy:      'bg-teal-100 text-teal-700',
  family:       'bg-indigo-100 text-indigo-700',
};

type PillVariant = 'category' | 'tag' | 'custom';

type Props = {
  label: string;
  variant?: PillVariant;
  /** Used when variant="category" */
  category?: Category;
  /** Custom Tailwind color classes, used when variant="custom" */
  colorClass?: string;
};

/** Reusable badge/pill. Handles category colours, tag colours, or custom classes. */
export default function Pill({ label, variant = 'tag', category, colorClass }: Props) {
  let classes = 'bg-zinc-100 text-zinc-600';

  if (variant === 'category' && category) {
    classes = categoryColors[category] ?? classes;
  } else if (variant === 'tag') {
    classes = tagColors[label] ?? 'bg-zinc-100 text-zinc-600';
  } else if (variant === 'custom' && colorClass) {
    classes = colorClass;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
