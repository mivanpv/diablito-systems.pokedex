import { useMemo } from 'react';
import { getEvolutionChain } from '../services/pokeapi';
import type { PokemonSpecies } from '../types/pokeapi';
import { buildStages } from '../utils/evolution';
import { useAsync } from './useAsync';

/** Evolution chain of `species`, flattened into stages (shared by the tab and the sprite bubbles). */
export function useEvolutionStages(species: PokemonSpecies) {
  const chainUrl = species.evolution_chain?.url ?? null;
  const { data, error, loading } = useAsync(
    async (signal) => (chainUrl ? getEvolutionChain(chainUrl, signal) : null),
    [chainUrl]
  );

  const stages = useMemo(() => (data ? buildStages(data.chain, species.name) : []), [data, species.name]);

  return { stages, error, loading };
}
