import { CSSProperties, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDexFilters } from '../../hooks/useDexFilters';
import { useEvolutionStages } from '../../hooks/useEvolutionStages';
import { spriteUrl } from '../../services/pokeapi';
import type { PokemonSpecies } from '../../types/pokeapi';
import type { EvolutionNode } from '../../utils/evolution';
import { capitalize } from '../../utils/format';

// Bubbles sit on an ellipse around the sprite, as % of the stage size.
const RADIUS_X = 38;
const RADIUS_Y = 36;

/** Angles (degrees, 0 = right, 90 = up) for `count` bubbles fanned around `center`. */
function fan(count: number, center: number): number[] {
  const spread = count > 1 ? Math.min(55, 150 / (count - 1)) : 0;
  const start = center + (spread * (count - 1)) / 2;
  return Array.from({ length: count }, (_, i) => start - i * spread);
}

function position(angle: number): CSSProperties {
  const rad = (angle * Math.PI) / 180;
  return {
    left: `${50 + RADIUS_X * Math.cos(rad)}%`,
    top: `${50 - RADIUS_Y * Math.sin(rad)}%`,
  };
}

interface EvolutionBubblesProps {
  species: PokemonSpecies;
  onClose: () => void;
}

/**
 * Overlay for the sprite stage: previous stages float on the left, next stages on the
 * right. Clicking a bubble selects that Pokémon. Closes on backdrop click or Escape.
 */
export default function EvolutionBubbles({ species, onClose }: EvolutionBubblesProps) {
  const { stages, loading, error } = useEvolutionStages(species);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const nodes = stages.flat();
  const previous = nodes.filter((n) => n.relation === 'anterior');
  const next = nodes.filter((n) => n.relation === 'proxima');
  // left arc for previous stages, right arc for next ones
  const placed = [
    ...previous.reverse().map((node, i, all) => ({ node, angle: fan(all.length, 180)[i] })),
    ...next.map((node, i, all) => ({ node, angle: fan(all.length, 0)[i] })),
  ];

  let message: string | null = null;
  if (loading) message = 'Buscando evoluciones…';
  else if (error) message = 'No se pudieron cargar las evoluciones';
  else if (placed.length === 0) message = 'Este Pokémon no tiene evoluciones';

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar evoluciones"
        onClick={onClose}
        className="absolute inset-0 z-10 animate-fade cursor-default rounded-lg bg-dex-ink/15 backdrop-blur-[1px]"
      />
      <ul aria-label="Evoluciones" className="contents">
        {placed.map(({ node, angle }, index) => (
          <li key={node.name} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={position(angle)}>
            <Bubble node={node} delay={index * 45} />
          </li>
        ))}
      </ul>
      {message && (
        <p className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 animate-fade whitespace-nowrap rounded-full border-2 border-dex-ink bg-dex-paper px-3 py-1 font-display text-[11px] font-bold">
          {message}
        </p>
      )}
    </>
  );
}

function Bubble({ node, delay }: { node: EvolutionNode; delay: number }) {
  const { search } = useDexFilters();
  const name = capitalize(node.name);
  const isPrevious = node.relation === 'anterior';

  return (
    <Link
      to={{ pathname: `/pokemon/${node.id}`, search }}
      aria-label={`Ir a ${name} (${isPrevious ? 'evolución anterior' : 'próxima evolución'})`}
      title={node.condition ? `${name} · ${node.condition}` : name}
      className="group flex animate-pop flex-col items-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-dex-ink bg-dex-paper shadow-hard transition-transform group-hover:scale-110 sm:h-16 sm:w-16">
        <img src={spriteUrl(node.id)} alt="" className="sprite h-12 w-12 sm:h-14 sm:w-14" />
        <span
          aria-hidden="true"
          className={`absolute -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-dex-ink font-display text-[9px] text-white ${
            isPrevious ? '-left-1.5 bg-dex-muted' : '-right-1.5 bg-dex-accent'
          }`}
        >
          {isPrevious ? '◄' : '►'}
        </span>
      </span>
      <span className="mt-1 whitespace-nowrap rounded-full bg-dex-ink px-2 py-0.5 font-display text-[10px] font-bold text-white">
        {name}
      </span>
    </Link>
  );
}
