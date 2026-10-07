import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addToList,
  CollectionsState,
  countSaved,
  createList as createListState,
  deleteList as deleteListState,
  isInList,
  parseCollections,
  PokemonList,
  removeFromList,
  toggleInList,
} from '../utils/collections';

const STORAGE_KEY = 'pokedex:collections';

type PokemonRef = { id: number; name: string };

interface CollectionsContextValue {
  lists: PokemonList[];
  lastListId: string;
  savedCount: number;
  isIn: (listId: string, pokemonId: number) => boolean;
  add: (listId: string, pokemon: PokemonRef) => void;
  remove: (listId: string, pokemonId: number) => void;
  toggle: (listId: string, pokemon: PokemonRef) => void;
  /** Creates (or reuses, by name) a list, selects it, and optionally saves a Pokémon into it. */
  createList: (name: string, pokemon?: PokemonRef) => string | null;
  deleteList: (listId: string) => void;
}

const CollectionsContext = createContext<CollectionsContextValue | null>(null);

function load(): CollectionsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return parseCollections(raw ? JSON.parse(raw) : null);
  } catch {
    return parseCollections(null);
  }
}

/** Collections live in localStorage (no backend); other tabs stay in sync via the storage event. */
export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable (private mode): collections last for this visit only.
    }
  }, [state]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        setState(parseCollections(event.newValue ? JSON.parse(event.newValue) : null));
      } catch {
        // ignore malformed data written elsewhere
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((listId: string, pokemon: PokemonRef) => setState((s) => addToList(s, listId, pokemon)), []);
  const remove = useCallback((listId: string, id: number) => setState((s) => removeFromList(s, listId, id)), []);
  const toggle = useCallback((listId: string, pokemon: PokemonRef) => setState((s) => toggleInList(s, listId, pokemon)), []);
  const deleteList = useCallback((listId: string) => setState((s) => deleteListState(s, listId)), []);

  const createList = useCallback(
    (name: string, pokemon?: PokemonRef) => {
      // computed from the current state so the new id can be returned synchronously
      const result = createListState(state, name);
      if (result.listId === null) return null;
      const listId = result.listId;
      setState(pokemon ? addToList(result.state, listId, pokemon) : result.state);
      return listId;
    },
    [state]
  );

  const value = useMemo<CollectionsContextValue>(
    () => ({
      lists: state.lists,
      lastListId: state.lastListId,
      savedCount: countSaved(state),
      isIn: (listId, pokemonId) => isInList(state, listId, pokemonId),
      add,
      remove,
      toggle,
      createList,
      deleteList,
    }),
    [state, add, remove, toggle, createList, deleteList]
  );

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}

export function useCollections(): CollectionsContextValue {
  const context = useContext(CollectionsContext);
  if (!context) throw new Error('useCollections debe usarse dentro de <CollectionsProvider>');
  return context;
}
