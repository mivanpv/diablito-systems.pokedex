import type { NamedAPIResourceList, Pokemon, PokemonSpecies } from '../types/pokeapi';
import { fetchJson } from './http';

const BASE_URL = 'https://pokeapi.co/api/v2';
const ARTWORK_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

export const PAGE_SIZE = 20;

export function getPokemonList(offset: number, signal?: AbortSignal) {
  return fetchJson<NamedAPIResourceList>(
    `${BASE_URL}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`,
    { persist: true, signal }
  );
}

export function getPokemon(nameOrId: string | number, signal?: AbortSignal) {
  const key = String(nameOrId).trim().toLowerCase();
  return fetchJson<Pokemon>(`${BASE_URL}/pokemon/${encodeURIComponent(key)}`, { signal });
}

export function getSpecies(name: string, signal?: AbortSignal) {
  return fetchJson<PokemonSpecies>(`${BASE_URL}/pokemon-species/${encodeURIComponent(name)}`, {
    signal,
  });
}

/** Extracts the numeric id from a resource URL like `.../pokemon/25/`. */
export function idFromUrl(url: string): number {
  const segments = url.split('/').filter(Boolean);
  return Number(segments[segments.length - 1]);
}

/** Official artwork URL, built from the id so the list view needs no per-Pokémon request. */
export function artworkUrl(id: number): string {
  return `${ARTWORK_URL}/${id}.png`;
}

export function spanishName(species: PokemonSpecies): string | null {
  return species.names.find((n) => n.language.name === 'es')?.name ?? null;
}

export function spanishGenus(species: PokemonSpecies): string | null {
  return species.genera.find((g) => g.language.name === 'es')?.genus ?? null;
}

/** Latest Spanish Pokédex entry, with the API's form-feed/newline artifacts cleaned up. */
export function spanishDescription(species: PokemonSpecies): string | null {
  const entries = species.flavor_text_entries.filter((e) => e.language.name === 'es');
  const latest = entries[entries.length - 1];
  return latest ? latest.flavor_text.replace(/[\f\n\r­]+/g, ' ').replace(/\s+/g, ' ').trim() : null;
}
