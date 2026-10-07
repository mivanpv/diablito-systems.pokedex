import type { TcgCard, TcgCardBrief, TcgLang } from '../types/tcgdex';
import { fetchJson } from './http';

const BASE_URL = 'https://api.tcgdex.net/v2';

export interface CardSearchResult {
  lang: TcgLang;
  cards: TcgCardBrief[];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * TCGdex's `name` filter is a "contains" match, so "mew" also returns "Mewtwo".
 * Keep only cards where the Pokémon name appears as a whole word ("Mew ex", "Mew V"...).
 * Falls back to the raw results if the filter removes everything.
 */
function filterByWholeName(cards: TcgCardBrief[], pokemonName: string): TcgCardBrief[] {
  const normalize = (s: string) => s.toLowerCase().replace(/[.'’]/g, '').replace(/-/g, ' ');
  const pattern = new RegExp(`(^|\\s)${escapeRegExp(normalize(pokemonName))}(\\s|$)`);
  const filtered = cards.filter((card) => pattern.test(normalize(card.name)));
  return filtered.length > 0 ? filtered : cards;
}

async function searchIn(lang: TcgLang, name: string, signal?: AbortSignal) {
  const cards = await fetchJson<TcgCardBrief[]>(
    `${BASE_URL}/${lang}/cards?name=${encodeURIComponent(name)}`,
    { signal }
  );
  return filterByWholeName(cards, name);
}

/** Searches Spanish cards first and falls back to English when there are none. */
export async function searchCards(name: string, signal?: AbortSignal): Promise<CardSearchResult> {
  const es = await searchIn('es', name, signal);
  if (es.length > 0) return { lang: 'es', cards: es };
  return { lang: 'en', cards: await searchIn('en', name, signal) };
}

export function getCard(lang: string, id: string, signal?: AbortSignal) {
  return fetchJson<TcgCard>(`${BASE_URL}/${lang}/cards/${encodeURIComponent(id)}`, { signal });
}

export function cardImageUrl(card: TcgCardBrief, quality: 'low' | 'high'): string | null {
  return card.image ? `${card.image}/${quality}.webp` : null;
}
