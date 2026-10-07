import { forwardRef, ReactNode, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { useDexFilters } from '../../hooks/useDexFilters';
import { isNotFound } from '../../services/http';
import {
  bestSprite,
  getPokemon,
  getSpecies,
  hasShiny,
  spanishDescription,
  spanishGenus,
  spanishName,
} from '../../services/pokeapi';
import { capitalize, padId } from '../../utils/format';
import { STAT_LABELS } from '../../utils/i18n';
import Loader from '../Loader';
import StatBar from '../StatBar';
import TypeBadge from '../TypeBadge';
import AbilitiesSection from './AbilitiesSection';
import EvolutionBubbles from './EvolutionBubbles';
import EvolutionSection from './EvolutionSection';
import MovesSection from './MovesSection';
import SaveToCollection from './SaveToCollection';
import TcgCardsSection from './TcgCardsSection';

type Tab = 'datos' | 'estadisticas' | 'evolucion' | 'movimientos' | 'cartas';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'datos', label: 'Datos', icon: '▤' },
  { id: 'estadisticas', label: 'Estadísticas', icon: '▥' },
  { id: 'evolucion', label: 'Evolución', icon: '⇄' },
  { id: 'movimientos', label: 'Movimientos', icon: '⚔' },
  { id: 'cartas', label: 'Cartas TCG', icon: '▦' },
];

/** Section 3: dark "matrix viewer" bezel around the selected Pokémon's card. */
const DEFAULT_TAB: Tab = 'datos';

const PokemonViewer = forwardRef<HTMLElement, { name: string | null }>(function PokemonViewer({ name }, ref) {
  // The tab lives in the URL (?pestana=...), so it survives visiting a card page and coming back,
  // and travels with the filters when switching Pokémon.
  const { tab: tabParam, setTab: setTabParam } = useDexFilters();
  const tab = TABS.find((t) => t.id === tabParam)?.id ?? DEFAULT_TAB;
  const setTab = useCallback((t: Tab) => setTabParam(t === DEFAULT_TAB ? null : t), [setTabParam]);
  // Outside the keyed content so the shiny toggle persists while browsing.
  const [shiny, setShiny] = useState(false);

  return (
    <section ref={ref} className="scroll-mt-4 rounded-xl border-[3px] border-dex-ink bg-dex-ink p-2 shadow-device sm:p-3">
      <div className="flex items-center gap-2 px-1 pb-2 pt-0.5 font-display text-[10px] uppercase tracking-[0.15em] text-white/50">
        <span className="h-2 w-2 rounded-full bg-dex-accent shadow-[0_0_6px_#dc2638]" aria-hidden="true" />
        <h2 className="flex-1 text-center">Pokémon seleccionado · visor matricial</h2>
        <span aria-hidden="true">|||||</span>
      </div>
      <div className="rounded-lg bg-dex-paper p-4 sm:p-5">
        {name ? (
          <ViewerContent key={name} name={name} tab={tab} onTab={setTab} shiny={shiny} onShiny={setShiny} />
        ) : (
          <EmptyScreen />
        )}
      </div>
    </section>
  );
});

export default PokemonViewer;

function EmptyScreen() {
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center gap-3 text-center">
      <p className="font-display text-lg font-bold">
        Selecciona un Pokémon<span className="animate-blink">_</span>
      </p>
      <p className="max-w-sm text-sm text-dex-muted">
        Escribe su nombre en la <b>búsqueda directa</b> o elígelo del <b>índice por tipo y letra</b>.
      </p>
    </div>
  );
}

interface ViewerContentProps {
  name: string;
  tab: Tab;
  onTab: (tab: Tab) => void;
  shiny: boolean;
  onShiny: (shiny: boolean) => void;
}

function ViewerContent({ name, tab, onTab, shiny, onShiny }: ViewerContentProps) {
  const { search } = useDexFilters();
  // Evolution bubbles over the sprite; reset on every Pokémon because this component is keyed by name.
  const [showEvolutions, setShowEvolutions] = useState(false);
  const closeEvolutions = useCallback(() => setShowEvolutions(false), []);
  const { data, error, loading } = useAsync(
    async (signal) => {
      const pokemon = await getPokemon(name, signal);
      const species = await getSpecies(pokemon.species.name, signal);
      return { pokemon, species };
    },
    [name]
  );

  if (loading) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center">
        <Loader label="Leyendo datos" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[24rem] flex-col items-center justify-center gap-3 text-center">
        <p className="font-display text-lg font-bold text-dex-accent">
          {isNotFound(error) ? '¡Pokémon no encontrado!' : 'Error de lectura'}
        </p>
        <p className="text-sm text-dex-muted">
          {isNotFound(error) ? `No hay registros de «${name}». Revisa el nombre o el número.` : error?.message}
        </p>
      </div>
    );
  }

  const { pokemon, species } = data;
  const displayName = spanishName(species) ?? capitalize(pokemon.name);
  const genus = spanishGenus(species);
  const description = spanishDescription(species);
  const canShiny = hasShiny(pokemon);
  const total = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
  const linkTo = (id: number) => ({ pathname: `/pokemon/${id}`, search });

  return (
    <div className="flex flex-col gap-4">
      {/* Title row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-dex-line pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{displayName}</h3>
          <SaveToCollection pokemon={{ id: pokemon.id, name: pokemon.name }} displayName={displayName} />
        </div>
        <span className="font-display text-lg font-bold text-dex-accent">{padId(pokemon.id)}</span>
      </div>

      {/* Sprite stage */}
      <div className="relative flex h-56 items-center justify-center rounded-lg border-2 border-dex-line bg-dex-surface sm:h-64">
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {pokemon.types.map((t) => (
            <TypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </div>
        {/* The sprite itself toggles the evolution bubbles; it stays above the backdrop. */}
        <button
          type="button"
          onClick={() => setShowEvolutions((open) => !open)}
          aria-expanded={showEvolutions}
          aria-label={`${showEvolutions ? 'Ocultar' : 'Ver'} evoluciones de ${displayName}`}
          title={showEvolutions ? 'Ocultar evoluciones' : 'Clic para ver sus evoluciones'}
          className="relative z-20 rounded-full transition-transform hover:scale-105"
        >
          <img
            src={bestSprite(pokemon, shiny && canShiny)}
            alt={`${displayName}${shiny && canShiny ? ' (shiny)' : ''}`}
            className="sprite h-40 w-40 object-contain sm:h-48 sm:w-48"
          />
        </button>
        {showEvolutions && <EvolutionBubbles species={species} onClose={closeEvolutions} />}
        <button
          type="button"
          className="dex-btn absolute bottom-2 left-2 z-20 py-1"
          aria-pressed={showEvolutions}
          onClick={() => setShowEvolutions((open) => !open)}
        >
          ⇄ Evoluciones
        </button>
        {canShiny && (
          <button
            className="dex-btn absolute bottom-2 right-2 py-1"
            aria-pressed={shiny}
            onClick={() => onShiny(!shiny)}
          >
            ★ Shiny
          </button>
        )}
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Información del Pokémon" className="grid grid-cols-3 gap-1 rounded-lg border-2 border-dex-ink bg-dex-surface p-1 sm:grid-cols-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => onTab(t.id)}
            className={`flex items-center justify-center gap-1 rounded-md px-1 py-2 font-display text-[11px] font-bold transition ${
              tab === t.id ? 'border-2 border-dex-ink bg-dex-paper shadow-hard' : 'border-2 border-transparent text-dex-muted hover:text-dex-ink'
            }`}
          >
            <span aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="flex flex-col gap-3">
        {tab === 'datos' && (
          <>
            {description && (
              <blockquote className="rounded-r-lg border-l-4 border-dex-accent bg-dex-surface px-4 py-3 text-sm italic leading-relaxed">
                “{description}”
              </blockquote>
            )}
            <div className="grid grid-cols-2 gap-3">
              <DataTile label="ID">{padId(pokemon.id)}</DataTile>
              <DataTile label="Tipo">
                <span className="flex flex-wrap gap-1.5">
                  {pokemon.types.map((t) => (
                    <TypeBadge key={t.type.name} type={t.type.name} />
                  ))}
                </span>
              </DataTile>
              <DataTile label="Peso">{(pokemon.weight / 10).toFixed(1)} kg</DataTile>
              <DataTile label="Altura">{(pokemon.height / 10).toFixed(1)} m</DataTile>
            </div>
            {genus && (
              <div className="dex-tile flex items-center justify-between gap-3">
                <span className="dex-label">Especie</span>
                <span className="font-bold">{genus}</span>
              </div>
            )}
            <AbilitiesSection pokemon={pokemon} />
          </>
        )}

        {tab === 'estadisticas' && (
          <div className="dex-tile flex flex-col gap-2.5">
            {pokemon.stats.map((s) => (
              <StatBar key={s.stat.name} label={STAT_LABELS[s.stat.name] ?? s.stat.name} value={s.base_stat} />
            ))}
            <div className="mt-1 flex justify-between border-t-2 border-dashed border-dex-line pt-2">
              <span className="dex-label">Total</span>
              <span className="font-display text-sm font-bold">{total}</span>
            </div>
          </div>
        )}

        {tab === 'evolucion' && <EvolutionSection species={species} />}

        {tab === 'movimientos' && <MovesSection pokemon={pokemon} />}

        {tab === 'cartas' &&<TcgCardsSection pokemonName={species.name} displayName={displayName} />}
      </div>

      <nav className="flex justify-between gap-3 border-t-2 border-dashed border-dex-line pt-3" aria-label="Pokémon anterior y siguiente">
        {pokemon.id > 1 ? (
          <Link to={linkTo(pokemon.id - 1)} className="dex-btn">
            ◄ {padId(pokemon.id - 1)}
          </Link>
        ) : (
          <span />
        )}
        <Link to={linkTo(pokemon.id + 1)} className="dex-btn">
          {padId(pokemon.id + 1)} ►
        </Link>
      </nav>
    </div>
  );
}

function DataTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="dex-tile flex flex-col gap-1">
      <span className="dex-label">{label}</span>
      <span className="font-display text-base font-bold">{children}</span>
    </div>
  );
}
