import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TYPE_INFO } from '../utils/i18n';

export const ALL_TYPES = 'todos';
/** A letter is always active so the index never renders the whole Pokédex at once. */
export const DEFAULT_LETTER = 'A';

/**
 * Advanced-search filters live in the URL (`?tipo=fire&letra=C`) so they survive
 * selecting a Pokémon, reloading, and sharing the link.
 */
export function useDexFilters() {
  const [params, setParams] = useSearchParams();

  const rawType = params.get('tipo');
  const type = rawType && rawType in TYPE_INFO ? rawType : ALL_TYPES;
  const rawLetter = params.get('letra')?.toUpperCase() ?? '';
  const letter = /^[A-Z]$/.test(rawLetter) ? rawLetter : DEFAULT_LETTER;

  // Viewer tab (`?pestana=cartas`): in the URL so "Volver" from a card page lands on the same tab.
  // Validated by the viewer; null means the default tab.
  const tab = params.get('pestana');

  const update = useCallback(
    (key: 'tipo' | 'letra' | 'pestana', value: string | null) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value === null) next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const setType = useCallback((t: string) => update('tipo', t === ALL_TYPES ? null : t), [update]);
  const setLetter = useCallback((l: string) => update('letra', l === DEFAULT_LETTER ? null : l), [update]);
  /** Pass null for the default tab, which keeps it out of the URL. */
  const setTab = useCallback((t: string | null) => update('pestana', t), [update]);

  /** Current query string, to carry filters (and the open tab) along when linking to a Pokémon. */
  const search = params.toString() ? `?${params.toString()}` : '';

  return { type, letter, tab, setType, setLetter, setTab, search };
}
