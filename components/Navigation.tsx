'use client';

import type { Section } from '@/types';

type NavItem = {
  id: Section;
  label: string;
  icon: React.ReactNode;
};

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M3 9h18M8 2v4M16 2v4" strokeLinecap="round" />
  </svg>
);

const ChecklistIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FridgeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
    <rect x="5" y="2" width="14" height="20" rx="3" />
    <path d="M5 10h14" strokeLinecap="round" />
    <path d="M9 6v2M9 14v3" strokeLinecap="round" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
    <path d="M4 4v16c0 1.1.9 2 2 2h13a1 1 0 000-2H6V4h13a1 1 0 011 1v13" strokeLinecap="round" />
    <path d="M9 8h6M9 12h4" strokeLinecap="round" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
  </svg>
);

const navItems: NavItem[] = [
  { id: 'menu',     label: 'Menú',      icon: <CalendarIcon /> },
  { id: 'planner',  label: 'Planificar',icon: <ChecklistIcon /> },
  { id: 'pantry',   label: 'Despensa',  icon: <FridgeIcon /> },
  { id: 'recipes',  label: 'Recetario', icon: <BookIcon /> },
  { id: 'shopping', label: 'Compra',    icon: <CartIcon /> },
];

type Props = {
  active: Section;
  onChange: (section: Section) => void;
};

/** Bottom tab bar with 5 sections. Edit navItems above to rename or reorder tabs. */
export default function Navigation({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {item.icon}
              {item.label}
              {isActive && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-zinc-900" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
