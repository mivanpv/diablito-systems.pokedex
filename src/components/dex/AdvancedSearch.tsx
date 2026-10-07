import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { ALL_TYPES, useDexFilters } from '../../hooks/useDexFilters';
import { getAllPokemon, getPokemonByType, spriteUrl } from '../../services/pokeapi';
import { capitalize, padId } from '../../utils/format';
import { TYPE_INFO } from '../../utils/i18n';
import ErrorMessage from '../ErrorMessage';
import Loader from '../Loader';
import SectionPanel from '../SectionPanel';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const firstLetter = (name: string) => name.charAt(0).toUpperCase();

interface AdvancedSearchProps {
  selected: string | null;
  /** Size of the whole Pokédex, for the "indexados" counter. */
  total: number | null;
}

/** Section 2: filter by type ("Todos" by default) and initial letter, then pick from the list. */
export default function AdvancedSearch({ selected, total }: AdvancedSearchProps) {
  const { type, letter, setType, setLetter, search } = useDexFilters();

  const { data, error, loading } = useAsync(
    (signal) => (type === ALL_TYPES ? getAllPokemon(signal) : getPokemonByType(type, signal)),
    [type]
  );

  const availableLetters = useMemo(() => new Set((data ?? []).map((p) => firstLetter(p.name))), [data]);
  // If the chosen letter has no Pokémon of this type (e.g. Hielo + X), use the first letter that does,
  // so the list is never empty and never falls back to the whole Pokédex.
  const activeLetter =
    !data || availableLetters.has(letter) ? letter : LETTERS.find((l) => availableLetters.has(l)) ?? letter;
  const results = useMemo(
    () => (data ? data.filter((p) => firstLetter(p.name) === activeLetter) : []),
    [data, activeLetter]
  );

  const typeLabel = type === ALL_TYPES ? 'Todos' : TYPE_INFO[type].label;

  return (
    <SectionPanel
      title="Índice por tipo y letra"
      aside={total !== null && `${total} Pokémon indexados`}
    >
      {/* Type grid */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 flex w-full items-center justify-between">
          <span className="dex-label">Tipo seleccionado:</span>
          <span className="font-display text-xs font-bold uppercase text-dex-accent">{typeLabel}</span>
        </legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          <button className="dex-btn" aria-pressed={type === ALL_TYPES} onClick={() => setType(ALL_TYPES)}>
            Todos
          </button>
          {Object.entries(TYPE_INFO).map(([key, info]) => (
            <button key={key} className="dex-btn" aria-pressed={type === key} onClick={() => setType(key)}>
              {info.label}
            </button>
          ))}
        </div>
      </fieldset>

      <hr className="dex-divider" />

      {/* Letter grid */}
      <fieldset className="flex flex-col gap-2">
        <legend className="dex-label mb-2">Filtrar por primera letra:</legend>
        <div className="grid grid-cols-7 gap-2 sm:grid-cols-[repeat(13,minmax(0,1fr))]">
          {LETTERS.map((l) => (
            <button
              key={l}
              className="dex-btn dex-chip-accent aspect-square p-0 text-sm"
              aria-pressed={activeLetter === l}
              disabled={data !== null && !availableLetters.has(l)}
              onClick={() => setLetter(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Results */}
      <div className="rounded-lg border-[3px] border-dex-ink bg-dex-paper">
        <div className="flex items-center gap-2 border-b-2 border-dex-line px-3 py-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-dex-ink font-display text-xs font-bold text-white">
            {activeLetter}
          </span>
          <span className="flex-1 font-display text-xs text-dex-muted">
            {loading ? 'Buscando…' : `${results.length} Pokémon encontrados`}
          </span>
        </div>

        {loading && <Loader />}
        {error && (
          <div className="p-3">
            <ErrorMessage>No se pudo cargar la lista: {error.message}</ErrorMessage>
          </div>
        )}
        {data && results.length === 0 && (
          <p className="p-4 text-sm text-dex-muted">Ningún Pokémon coincide con estos filtros.</p>
        )}

        {results.length > 0 && (
          <div className="max-h-[22rem] overflow-y-auto p-2 lg:max-h-[26rem]">
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {/* Render every result (sprites are lazy-loaded): the counter must match what can be scrolled to. */}
              {results.map((p) => {
                // the viewer can be opened by name (search, list) or by id (evolutions, prev/next)
                const isSelected = p.name === selected || String(p.id) === selected;
                return (
                  <li key={p.id}>
                    <Link
                      to={{ pathname: `/pokemon/${p.name}`, search }}
                      aria-current={isSelected ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-md border-2 px-2 py-1 transition ${
                        isSelected
                          ? 'border-dex-ink bg-dex-ink text-white'
                          : 'border-dex-line bg-dex-paper hover:border-dex-ink'
                      }`}
                    >
                      <img src={spriteUrl(p.id)} alt="" loading="lazy" className="sprite h-10 w-10 shrink-0" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">{capitalize(p.name)}</span>
                        <span className={`block font-display text-[11px] ${isSelected ? 'text-white/70' : 'text-dex-muted'}`}>
                          {padId(p.id)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </SectionPanel>
  );
}
