import { Link } from 'react-router-dom';
import CurrencySelector from './CurrencySelector';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-poke-red text-white shadow-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <img src={`${process.env.PUBLIC_URL}/favicon.svg`} alt="" className="h-8 w-8" />
          Pokédex Web
        </Link>
        <CurrencySelector />
      </div>
    </header>
  );
}
