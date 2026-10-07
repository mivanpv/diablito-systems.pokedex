import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDexFilters } from '../../hooks/useDexFilters';
import type { PokemonSummary } from '../../types/pokeapi';
import SectionPanel from '../SectionPanel';

interface DirectSearchProps {
  /** Full species list, used for autocomplete and the random pick (null while loading). */
  all: PokemonSummary[] | null;
  /** True when the species list failed to load. */
  offline: boolean;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function Status({ all, offline }: DirectSearchProps) {
  const [color, label] = offline ? ['bg-dex-accent', 'SIN CONEXIÓN'] : all ? ['bg-dex-ok', 'EN LÍNEA'] : ['bg-yellow-400', 'CONECTANDO'];
  return (
    <span className="flex items-center gap-1.5 font-bold">
      <span className={`h-2 w-2 rounded-full ${color}`} aria-hidden="true" />
      <span className={offline ? 'text-dex-accent' : all ? 'text-dex-ok' : ''}>{label}</span>
    </span>
  );
}

/** Section 1: jump straight to a Pokémon by name or number. */
export default function DirectSearch({ all, offline }: DirectSearchProps) {
  const navigate = useNavigate();
  const { search } = useDexFilters();
  const [query, setQuery] = useState('');

  const open = (target: string) => navigate({ pathname: `/pokemon/${encodeURIComponent(target)}`, search });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    // "#025" or "025" -> 25; anything else is treated as a name ("mr mime" -> "mr-mime").
    const numeric = value.replace(/^#/, '');
    open(/^\d+$/.test(numeric) ? String(Number(numeric)) : value.toLowerCase().replace(/\s+/g, '-'));
    setQuery('');
  };

  const openRandom = () => {
    if (all && all.length > 0) open(all[Math.floor(Math.random() * all.length)].name);
  };

  return (
    <SectionPanel title="Búsqueda directa" aside={<Status all={all} offline={offline} />}>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="search"
          list="pokemon-names"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nombre o número…"
          aria-label="Nombre o número del Pokémon"
          autoComplete="off"
          className="dex-input flex-1"
        />
        <datalist id="pokemon-names">
          {all?.map((p) => (
            <option key={p.id} value={p.name} />
          ))}
        </datalist>
        <button type="submit" className="dex-btn dex-btn-accent px-4 text-sm">
          <SearchIcon />
          BUSCAR
        </button>
      </form>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-dex-muted">Ej. pikachu, 25 o #006</p>
        <button type="button" className="dex-btn" onClick={openRandom} disabled={!all}>
          ⚄ Aleatorio
        </button>
      </div>
    </SectionPanel>
  );
}
