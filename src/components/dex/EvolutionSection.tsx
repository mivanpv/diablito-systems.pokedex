import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useDexFilters } from '../../hooks/useDexFilters';
import { useEvolutionStages } from '../../hooks/useEvolutionStages';
import { spriteUrl } from '../../services/pokeapi';
import type { PokemonSpecies } from '../../types/pokeapi';
import type { EvolutionNode, Relation } from '../../utils/evolution';
import { capitalize, padId } from '../../utils/format';
import ErrorMessage from '../ErrorMessage';
import Loader from '../Loader';

const RELATION_LABEL: Record<Relation, string | null> = {
  anterior: 'Anterior',
  actual: 'Actual',
  proxima: 'Próxima',
  otra: null,
};

/** "Evolución" tab: the whole chain by stage; clicking a species selects it in the viewer. */
export default function EvolutionSection({ species }: { species: PokemonSpecies }) {
  const { stages, error, loading } = useEvolutionStages(species);

  return (
    <div className="dex-tile flex flex-col gap-3">
      <span className="dex-label">Cadena evolutiva</span>

      {loading && <Loader label="Cargando evoluciones" />}
      {error && <ErrorMessage>No se pudo cargar la cadena evolutiva: {error.message}</ErrorMessage>}
      {!loading && !error && stages.length <= 1 && (
        <p className="text-sm text-dex-muted">Este Pokémon no tiene evoluciones.</p>
      )}

      {stages.length > 1 && (
        <ol className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          {stages.map((stage, index) => (
            <Fragment key={index}>
              {index > 0 && (
                <li aria-hidden="true" className="text-center font-display text-lg font-bold text-dex-muted">
                  <span className="sm:hidden">↓</span>
                  <span className="hidden sm:inline">→</span>
                </li>
              )}
              <li className="min-w-0 flex-1">
                <ul className={`grid gap-2 ${stage.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {stage.map((node) => (
                    <li key={node.name}>
                      <EvolutionCard node={node} />
                    </li>
                  ))}
                </ul>
              </li>
            </Fragment>
          ))}
        </ol>
      )}
    </div>
  );
}

function EvolutionCard({ node }: { node: EvolutionNode }) {
  const { search } = useDexFilters();
  const isCurrent = node.relation === 'actual';
  const label = RELATION_LABEL[node.relation];

  const content = (
    <>
      <div className="flex w-full items-start justify-between gap-1">
        <span className={`font-display text-[10px] ${isCurrent ? 'text-white/70' : 'text-dex-muted'}`}>{padId(node.id)}</span>
        {label && (
          <span
            className={`rounded px-1 font-display text-[9px] font-bold uppercase ${
              isCurrent ? 'bg-dex-accent text-white' : 'border border-dex-ink'
            }`}
          >
            {label}
          </span>
        )}
      </div>
      <img src={spriteUrl(node.id)} alt="" loading="lazy" className="sprite h-14 w-14" />
      <span className="w-full truncate text-center text-sm font-bold">{capitalize(node.name)}</span>
      {node.condition && (
        <span className={`text-center text-[11px] leading-tight ${isCurrent ? 'text-white/70' : 'text-dex-muted'}`}>
          {node.condition}
        </span>
      )}
    </>
  );

  const base = 'flex flex-col items-center gap-1 rounded-md border-2 p-2 transition';

  if (isCurrent) {
    return (
      <div className={`${base} border-dex-ink bg-dex-ink text-white`} aria-current="true">
        {content}
      </div>
    );
  }

  // Navigate by id: some species (e.g. deoxys) have no Pokémon with the same name.
  return (
    <Link
      to={{ pathname: `/pokemon/${node.id}`, search }}
      title={`Ver ${capitalize(node.name)}`}
      className={`${base} border-dex-line bg-dex-paper hover:-translate-y-0.5 hover:border-dex-ink ${
        node.relation === 'otra' ? 'opacity-70 hover:opacity-100' : ''
      }`}
    >
      {content}
    </Link>
  );
}
