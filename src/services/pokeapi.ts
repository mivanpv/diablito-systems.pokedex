import type {
  Ability,
  EvolutionChain,
  Move,
  NamedAPIResourceList,
  Pokemon,
  PokemonSpecies,
  PokemonSummary,
  TypeDetail,
} from '../types/pokeapi';
import { capitalize } from '../utils/format';
import { fetchJson } from './http';

const BASE_URL = 'https://pokeapi.co/api/v2';
const SPRITES_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// Ids above this are alternate forms (megas, regional variants...). The Pokédex lists species only.
const MAX_SPECIES_ID = 10000;

function toSummaries(resources: { name: string; url: string }[]): PokemonSummary[] {
  return resources
    .map((r) => ({ id: idFromUrl(r.url), name: r.name }))
    .filter((p) => p.id < MAX_SPECIES_ID)
    .sort((a, b) => a.id - b.id);
}

/** Every Pokémon species (~1000 entries, one request, cached for the session). */
export async function getAllPokemon(signal?: AbortSignal): Promise<PokemonSummary[]> {
  const list = await fetchJson<NamedAPIResourceList>(`${BASE_URL}/pokemon?limit=2000`, {
    persist: true,
    signal,
  });
  return toSummaries(list.results);
}

export async function getPokemonByType(type: string, signal?: AbortSignal): Promise<PokemonSummary[]> {
  const detail = await fetchJson<TypeDetail>(`${BASE_URL}/type/${encodeURIComponent(type)}`, {
    persist: true,
    signal,
  });
  return toSummaries(detail.pokemon.map((p) => p.pokemon));
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

/** Small pixel sprite built from the id, so lists need no per-Pokémon request. */
export function spriteUrl(id: number): string {
  return `${SPRITES_URL}/${id}.png`;
}

/** Animated Black/White sprite when available (Gen I–V), otherwise the static one. */
export function bestSprite(pokemon: Pokemon, shiny = false): string {
  const animated = pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated;
  if (shiny) {
    const shinySprite = animated?.front_shiny ?? pokemon.sprites.front_shiny;
    if (shinySprite) return shinySprite;
  }
  return animated?.front_default ?? pokemon.sprites.front_default ?? spriteUrl(pokemon.id);
}

export function hasShiny(pokemon: Pokemon): boolean {
  return Boolean(pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_shiny ?? pokemon.sprites.front_shiny);
}

export function spanishName(species: PokemonSpecies): string | null {
  return species.names.find((n) => n.language.name === 'es')?.name ?? null;
}

export function spanishGenus(species: PokemonSpecies): string | null {
  return species.genera.find((g) => g.language.name === 'es')?.genus ?? null;
}

/** Removes the form-feed/newline/soft-hyphen artifacts PokéAPI keeps from the games' text boxes. */
function cleanGameText(text: string): string {
  return text.replace(/[\f\n\r­]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Latest Spanish Pokédex entry. */
export function spanishDescription(species: PokemonSpecies): string | null {
  const entries = species.flavor_text_entries.filter((e) => e.language.name === 'es');
  const latest = entries[entries.length - 1];
  return latest ? cleanGameText(latest.flavor_text) : null;
}

/**
 * Move details. Memory cache only (no sessionStorage): each response is ~50 KB because
 * it lists every Pokémon that learns the move, and a moveset can have 100+ moves.
 */
export function getMove(name: string, signal?: AbortSignal) {
  return fetchJson<Move>(`${BASE_URL}/move/${encodeURIComponent(name)}`, { signal });
}

export function moveName(move: Move): string {
  return move.names.find((n) => n.language.name === 'es')?.name ?? capitalize(move.name);
}

/** Latest Spanish in-game description of the move. */
export function moveDescription(move: Move): string | null {
  const entries = move.flavor_text_entries.filter((e) => e.language.name === 'es');
  const latest = entries[entries.length - 1];
  return latest ? cleanGameText(latest.flavor_text) : null;
}

/** Precise battle effect (English only), with `$effect_chance` filled in. */
export function moveEffect(move: Move): string | null {
  const entry = move.effect_entries.find((e) => e.language.name === 'en');
  if (!entry) return null;
  return cleanGameText(entry.short_effect.replace(/\$effect_chance/g, String(move.effect_chance ?? '?')));
}

/** `url` comes from `species.evolution_chain.url`. */
export function getEvolutionChain(url: string, signal?: AbortSignal) {
  return fetchJson<EvolutionChain>(url, { persist: true, signal });
}

export function getAbility(name: string, signal?: AbortSignal) {
  return fetchJson<Ability>(`${BASE_URL}/ability/${encodeURIComponent(name)}`, { persist: true, signal });
}

export function abilityName(ability: Ability): string {
  return ability.names.find((n) => n.language.name === 'es')?.name ?? capitalize(ability.name);
}

/** Latest Spanish in-game description of what the ability does. */
export function abilityDescription(ability: Ability): string | null {
  const entries = ability.flavor_text_entries.filter((e) => e.language.name === 'es');
  const latest = entries[entries.length - 1];
  return latest ? cleanGameText(latest.flavor_text) : null;
}

/** Precise battle effect (English only in PokéAPI). */
export function abilityBattleEffect(ability: Ability): string | null {
  const entry = ability.effect_entries.find((e) => e.language.name === 'en');
  return entry ? cleanGameText(entry.short_effect) : null;
}
