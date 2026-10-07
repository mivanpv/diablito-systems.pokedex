import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col px-3 py-4 sm:px-6 sm:py-6">
      <div className="dex-device mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-3 sm:p-5">
          <Outlet />
        </main>
      </div>
      <footer className="px-4 pt-6 text-center text-sm text-dex-muted">
        Datos de{' '}
        <a className="underline hover:text-dex-ink" href="https://pokeapi.co" target="_blank" rel="noreferrer">
          PokéAPI
        </a>
        ,{' '}
        <a className="underline hover:text-dex-ink" href="https://tcgdex.dev" target="_blank" rel="noreferrer">
          TCGdex
        </a>{' '}
        y{' '}
        <a
          className="underline hover:text-dex-ink"
          href="https://www.exchangerate-api.com"
          target="_blank"
          rel="noreferrer"
        >
          ExchangeRate-API
        </a>
        . Pokémon y sus marcas pertenecen a sus respectivos dueños.
      </footer>
    </div>
  );
}
