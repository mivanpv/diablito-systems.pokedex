import { Link, useLocation } from 'react-router-dom';
import { useCollections } from '../context/CollectionsContext';
import { usePortfolios } from '../context/PortfoliosContext';
import CurrencySelector from './CurrencySelector';

// Already on the page? Replace instead of pushing, so "Volver" doesn't land on the same page.
const useIsCurrent = (path: string) => useLocation().pathname === path;

function CollectionLink() {
  const { savedCount } = useCollections();
  const isCurrent = useIsCurrent('/colecciones');
  return (
    <Link
      to="/colecciones"
      replace={isCurrent}
      aria-current={isCurrent ? 'page' : undefined}
      className="dex-btn gap-1.5 py-1"
      aria-label={`Mi colección: ${savedCount} Pokémon guardados`}
    >
      <span aria-hidden="true" className="text-yellow-500">★</span>
      <span className="hidden sm:inline">COLECCIÓN</span>
      <span className="min-w-[1.25rem] rounded-full bg-dex-accent px-1.5 text-center text-[10px] leading-4 text-white">
        {savedCount}
      </span>
    </Link>
  );
}

function PortfolioLink() {
  const { cardCount } = usePortfolios();
  const isCurrent = useIsCurrent('/portafolios');
  return (
    <Link
      to="/portafolios"
      replace={isCurrent}
      aria-current={isCurrent ? 'page' : undefined}
      className="dex-btn gap-1.5 py-1"
      aria-label={`Mis portafolios: ${cardCount} cartas`}
    >
      <span aria-hidden="true">💼</span>
      <span className="hidden sm:inline">PORTAFOLIO</span>
      <span className="min-w-[1.25rem] rounded-full bg-dex-accent px-1.5 text-center text-[10px] leading-4 text-white">
        {cardCount}
      </span>
    </Link>
  );
}

function Light({ className }: { className: string }) {
  return <span className={`h-3 w-3 rounded-full border-2 border-dex-ink ${className}`} />;
}

export default function Header() {
  return (
    <header className="grid grid-cols-[auto_1fr] items-center gap-3 sm:grid-cols-[auto_1fr_auto] border-b-[3px] border-dex-ink bg-dex-frame px-3 py-3 sm:px-5">
      <Link to="/" className="flex items-center gap-3" aria-label="Pokédex, inicio">
        {/* Blue lens + status lights from the original device */}
        <span className="relative h-11 w-11 shrink-0 rounded-full border-[3px] border-dex-ink bg-gradient-to-br from-sky-300 via-sky-500 to-blue-700 shadow-[0_0_0_3px_#fff_inset]">
          <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-white/80" />
        </span>
        <span className="hidden gap-1.5 sm:flex">
          <Light className="bg-red-500" />
          <Light className="bg-yellow-400" />
          <Light className="bg-green-500" />
        </span>
      </Link>

      <Link to="/" className="text-center">
        <span className="block font-display text-xl font-bold tracking-[0.25em] sm:text-2xl">POKÉDEX</span>
        <span className="hidden font-display text-[10px] uppercase tracking-[0.2em] text-dex-muted sm:block">
          Sistema receptor portátil
        </span>
      </Link>

      <div className="col-span-2 flex flex-wrap items-center justify-center gap-2 sm:col-span-1 sm:justify-end">
        <CollectionLink />
        <PortfolioLink />
        <CurrencySelector />
      </div>
    </header>
  );
}
