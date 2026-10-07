import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500">
        Datos de{' '}
        <a className="underline" href="https://pokeapi.co" target="_blank" rel="noreferrer">
          PokéAPI
        </a>
        ,{' '}
        <a className="underline" href="https://tcgdex.dev" target="_blank" rel="noreferrer">
          TCGdex
        </a>{' '}
        y{' '}
        <a className="underline" href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">
          ExchangeRate-API
        </a>
        . Pokémon y sus marcas pertenecen a sus respectivos dueños.
      </footer>
    </div>
  );
}
