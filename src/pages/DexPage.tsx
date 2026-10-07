import { useEffect, useRef } from 'react';
import { useMatch } from 'react-router-dom';
import AdvancedSearch from '../components/dex/AdvancedSearch';
import DirectSearch from '../components/dex/DirectSearch';
import PokemonViewer from '../components/dex/PokemonViewer';
import { useAsync } from '../hooks/useAsync';
import { getAllPokemon } from '../services/pokeapi';

/**
 * Single-screen Pokédex: search sections on the left, selected Pokémon on the right.
 * Mounted for both `/` and `/pokemon/:name` so the list keeps its state while browsing.
 */
export default function DexPage() {
  const match = useMatch('/pokemon/:name');
  const selected = match?.params.name ?? null;
  const viewerRef = useRef<HTMLElement>(null);
  const all = useAsync((signal) => getAllPokemon(signal), []);

  // On narrow screens the viewer sits below the list: bring it into view after a selection.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!selected || !viewer) return;
    const { top } = viewer.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight * 0.5) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      viewer.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }, [selected]);

  return (
    // Desktop: viewer on the left, search sections on the right. Mobile: search first, viewer last.
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
      <div className="flex flex-col gap-5 lg:order-2">
        <DirectSearch all={all.data} offline={all.error !== null} />
        <AdvancedSearch selected={selected} total={all.data?.length ?? null} />
      </div>
      <div className="lg:order-1">
        <PokemonViewer ref={viewerRef} name={selected} />
      </div>
    </div>
  );
}
