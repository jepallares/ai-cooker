'use client';

'use client';

import { useState, useRef } from 'react';
import type { PantryItem, Location } from '@/types';
import PantryItemCard from './PantryItemCard';
import AddPantryForm from './AddPantryForm';
import VoiceButton from './VoiceButton';
import type { ParsedVoice } from '@/lib/voice';
import { savePantryItem, deletePantryItem } from '@/lib/db';

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

type FormMode =
  | { type: 'closed' }
  | { type: 'new'; prefill?: Partial<PantryItem> }
  | { type: 'edit'; item: PantryItem };

type Props = {
  initialItems: PantryItem[];
};

/** Pantry section: stat cards, voice + manual add, inline edit, location filter. */
export default function PantrySection({ initialItems }: Props) {
  const [items, setItems]   = useState(initialItems);
  const [filter, setFilter] = useState<Location | 'all'>('all');
  const [mode, setMode]     = useState<FormMode>({ type: 'closed' });
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setClassifying(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/gemini/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, mimeType: file.type }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVoiceTranscript(null);
      setMode({ type: 'new', prefill: data });
    } catch {
      alert('No se pudo clasificar la imagen. Inténtalo de nuevo.');
    } finally {
      setClassifying(false);
    }
  }

  const expiringSoon  = items.filter((i) => i.expiresAt && daysUntil(i.expiresAt) <= 3 && daysUntil(i.expiresAt) >= 0);
  const locationCount = new Set(items.map((i) => i.location)).size;
  const filtered      = filter === 'all' ? items : items.filter((i) => i.location === filter);

  function handleSave(saved: PantryItem) {
    savePantryItem(saved).catch(console.error);
    setItems((prev) => {
      const exists = prev.some((i) => i.id === saved.id);
      return exists
        ? prev.map((i) => i.id === saved.id ? saved : i)   // update
        : [saved, ...prev];                                  // prepend new
    });
    setMode({ type: 'closed' });
    setVoiceTranscript(null);
  }

  function handleVoiceResult(parsed: ParsedVoice, transcript: string) {
    setVoiceTranscript(transcript);
    setMode({ type: 'new', prefill: { name: parsed.name, quantity: parsed.quantity, unit: parsed.unit, location: parsed.location } });
  }

  const formInitialData = mode.type === 'edit' ? mode.item : mode.type === 'new' ? mode.prefill : undefined;

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard value={items.length}         label="Productos" />
        <StatCard value={expiringSoon.length}  label="Caducan pronto" highlight={expiringSoon.length > 0} />
        <StatCard value={locationCount}        label="Ubicaciones" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="flex-1">
          <VoiceButton onResult={handleVoiceResult} />
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoSelected}
        />
        <button
          onClick={() => photoInputRef.current?.click()}
          disabled={classifying}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
        >
          {classifying ? (
            <><span className="w-3.5 h-3.5 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" /> Analizando…</>
          ) : '📷 Foto IA'}
        </button>
        <button
          onClick={() => { setVoiceTranscript(null); setMode({ type: 'new' }); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
        >
          + Añadir
        </button>
      </div>

      {/* Inline form (add / voice prefill / edit) */}
      {mode.type !== 'closed' && (
        <div className="flex flex-col gap-2">
          {voiceTranscript && (
            <p className="text-xs text-zinc-500 px-1">
              🎙 "<span className="italic">{voiceTranscript}</span>" — revisa y confirma:
            </p>
          )}
          <AddPantryForm
            initialData={formInitialData}
            onSave={handleSave}
            onCancel={() => { setMode({ type: 'closed' }); setVoiceTranscript(null); }}
          />
        </div>
      )}

      {/* Location filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Item list */}
      <div className="rounded-xl border border-zinc-100 bg-white px-4">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">Sin productos en esta ubicación</p>
        ) : (
          filtered.map((item) => (
            <PantryItemCard
              key={item.id}
              item={item}
              onEdit={() => { setVoiceTranscript(null); setMode({ type: 'edit', item }); }}
              onDelete={() => { deletePantryItem(item.id).catch(console.error); setItems((prev) => prev.filter((i) => i.id !== item.id)); }}
            />
          ))
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
