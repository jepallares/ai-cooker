import type { Location } from '@/types';

export type ParsedVoice = {
  name: string;
  quantity: number;
  unit: string;
  location: Location;
};

// ─── Lookup tables ────────────────────────────────────────────────────────────

const NUMBER_WORDS: Record<string, number> = {
  medio: 0.5, media: 0.5,
  un: 1, uno: 1, una: 1,
  dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, trece: 13, catorce: 14, quince: 15,
  veinte: 20,
};

const UNIT_WORDS: Record<string, string> = {
  kilo: 'kg', kilos: 'kg', kilogramo: 'kg', kilogramos: 'kg', kg: 'kg',
  gramo: 'g', gramos: 'g',
  litro: 'L', litros: 'L',
  mililitro: 'ml', mililitros: 'ml', ml: 'ml',
  pieza: 'units', piezas: 'units',
  unidad: 'units', unidades: 'units',
  lata: 'latas', latas: 'latas',
  bote: 'botes', botes: 'botes',
  bolsa: 'bolsas', bolsas: 'bolsas',
};

const LOCATION_WORDS: Record<string, Location> = {
  nevera: 'fridge', frigorifico: 'fridge', frigorífico: 'fridge',
  refrigerador: 'fridge', frio: 'fridge', frío: 'fridge',
  congelador: 'freezer', congeladora: 'freezer',
  despensa: 'pantry', armario: 'pantry', cocina: 'pantry', alacena: 'pantry',
};

// Words that are purely structural and should be stripped before extracting the name
const SKIP_WORDS = new Set([
  'en', 'el', 'la', 'los', 'las', 'de', 'del', 'al', 'y', 'e',
  'que', 'con', 'por', 'para', 'a', 'o',
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Normalise to lowercase ASCII (strips accents) for matching */
function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ─── Main parser ─────────────────────────────────────────────────────────────

/**
 * Parses a Spanish voice transcript into pantry fields.
 * Examples:
 *   "dos calabacines en la nevera"    → { name: "calabacines", quantity: 2, unit: "units", location: "fridge" }
 *   "medio kilo de harina en despensa"→ { name: "harina", quantity: 0.5, unit: "kg", location: "pantry" }
 *   "3 yogures en el congelador"      → { name: "yogures", quantity: 3, unit: "units", location: "freezer" }
 */
export function parseTranscript(text: string): ParsedVoice {
  const rawWords = text.trim().split(/\s+/);
  const words    = rawWords.map(norm);

  let quantity: number  = 1;
  let unit: string      = 'units';
  let location: Location = 'pantry';
  const usedIndexes = new Set<number>();

  // 1. Scan for location
  for (let i = 0; i < words.length; i++) {
    const loc = LOCATION_WORDS[words[i]];
    if (loc) { location = loc; usedIndexes.add(i); break; }
  }

  // 2. Scan for quantity (digit or number-word), then optional unit right after
  for (let i = 0; i < words.length; i++) {
    if (usedIndexes.has(i)) continue;
    const asNum = parseFloat(words[i]);
    const wordNum = NUMBER_WORDS[words[i]];
    const q = !isNaN(asNum) ? asNum : wordNum;
    if (q !== undefined) {
      quantity = q;
      usedIndexes.add(i);
      // Check next word for unit
      const next = words[i + 1];
      if (next && UNIT_WORDS[next]) {
        unit = UNIT_WORDS[next];
        usedIndexes.add(i + 1);
      }
      break;
    }
  }

  // 3. Scan for explicit unit (in case it wasn't right after quantity)
  for (let i = 0; i < words.length; i++) {
    if (usedIndexes.has(i)) continue;
    if (UNIT_WORDS[words[i]]) {
      unit = UNIT_WORDS[words[i]];
      usedIndexes.add(i);
      break;
    }
  }

  // 4. Remaining words (minus skip-words) form the name — use original casing
  const nameParts = rawWords.filter((_, i) => !usedIndexes.has(i) && !SKIP_WORDS.has(words[i]));
  const name = nameParts.join(' ') || text;

  return { name, quantity, unit, location };
}
