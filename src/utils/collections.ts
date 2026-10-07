/**
 * Pokémon collections ("listas"), stored in the browser. Pure state transitions so the
 * context stays thin and the rules are unit-tested.
 */

export const DEFAULT_LIST_ID = 'favoritos';
const DEFAULT_LIST_NAME = 'Favoritos';

export interface SavedPokemon {
  id: number;
  /** PokéAPI name, used for links (`/pokemon/{name}`). */
  name: string;
  addedAt: number;
}

export interface PokemonList {
  id: string;
  name: string;
  pokemon: SavedPokemon[];
}

export interface CollectionsState {
  /** The default "Favoritos" list is always first and can't be deleted. */
  lists: PokemonList[];
  /** Last list the user saved into; pre-selected for the next save. */
  lastListId: string;
}

export function initialCollections(): CollectionsState {
  return { lists: [{ id: DEFAULT_LIST_ID, name: DEFAULT_LIST_NAME, pokemon: [] }], lastListId: DEFAULT_LIST_ID };
}

/** Validates data read from storage; anything malformed is dropped instead of crashing the app. */
export function parseCollections(raw: unknown): CollectionsState {
  const state = initialCollections();
  if (!raw || typeof raw !== 'object') return state;
  const { lists, lastListId } = raw as Partial<CollectionsState>;

  if (Array.isArray(lists)) {
    const valid = lists
      .filter((l): l is PokemonList => !!l && typeof l.id === 'string' && typeof l.name === 'string' && Array.isArray(l.pokemon))
      .map((l) => ({
        id: l.id,
        name: l.name,
        pokemon: l.pokemon.filter((p) => !!p && typeof p.id === 'number' && typeof p.name === 'string'),
      }));
    const stored = valid.find((l) => l.id === DEFAULT_LIST_ID);
    state.lists = [stored ?? state.lists[0], ...valid.filter((l) => l.id !== DEFAULT_LIST_ID)];
  }

  if (typeof lastListId === 'string' && state.lists.some((l) => l.id === lastListId)) state.lastListId = lastListId;
  return state;
}

function updateList(state: CollectionsState, listId: string, update: (list: PokemonList) => PokemonList): CollectionsState {
  return { ...state, lists: state.lists.map((l) => (l.id === listId ? update(l) : l)) };
}

export function isInList(state: CollectionsState, listId: string, pokemonId: number): boolean {
  return !!state.lists.find((l) => l.id === listId)?.pokemon.some((p) => p.id === pokemonId);
}

/** Adds the Pokémon (once) and makes that list the default for the next save. */
export function addToList(
  state: CollectionsState,
  listId: string,
  pokemon: { id: number; name: string },
  now = Date.now()
): CollectionsState {
  if (!state.lists.some((l) => l.id === listId)) return state;
  const next = isInList(state, listId, pokemon.id)
    ? state
    : updateList(state, listId, (l) => ({ ...l, pokemon: [...l.pokemon, { id: pokemon.id, name: pokemon.name, addedAt: now }] }));
  return { ...next, lastListId: listId };
}

/** Removing doesn't change the default list: only saving does. */
export function removeFromList(state: CollectionsState, listId: string, pokemonId: number): CollectionsState {
  return updateList(state, listId, (l) => ({ ...l, pokemon: l.pokemon.filter((p) => p.id !== pokemonId) }));
}

export function toggleInList(state: CollectionsState, listId: string, pokemon: { id: number; name: string }): CollectionsState {
  return isInList(state, listId, pokemon.id) ? removeFromList(state, listId, pokemon.id) : addToList(state, listId, pokemon);
}

/**
 * Creates a list and selects it as the default. A name that already exists (ignoring case)
 * reuses that list. Returns the state unchanged with listId null for a blank name.
 */
export function createList(
  state: CollectionsState,
  name: string,
  id = `lista-${Date.now().toString(36)}`
): { state: CollectionsState; listId: string | null } {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { state, listId: null };

  const existing = state.lists.find((l) => l.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) return { state: { ...state, lastListId: existing.id }, listId: existing.id };

  return {
    state: { lists: [...state.lists, { id, name: trimmed, pokemon: [] }], lastListId: id },
    listId: id,
  };
}

export function deleteList(state: CollectionsState, listId: string): CollectionsState {
  if (listId === DEFAULT_LIST_ID) return state;
  const lists = state.lists.filter((l) => l.id !== listId);
  return { lists, lastListId: state.lastListId === listId ? DEFAULT_LIST_ID : state.lastListId };
}

/** Distinct Pokémon saved across all lists (for the header badge). */
export function countSaved(state: CollectionsState): number {
  return new Set(state.lists.flatMap((l) => l.pokemon.map((p) => p.id))).size;
}
