import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { CurrencyProvider } from './context/CurrencyContext';
import NotFoundPage from './pages/NotFoundPage';
import PokedexPage from './pages/PokedexPage';
import PokemonDetailPage from './pages/PokemonDetailPage';
import TcgCardPage from './pages/TcgCardPage';

// HashRouter is required: GitHub Pages serves static files and would return 404
// for deep links such as /pokemon/pikachu when using BrowserRouter.
export default function App() {
  return (
    <HashRouter>
      <CurrencyProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<PokedexPage />} />
            <Route path="pokemon/:name" element={<PokemonDetailPage />} />
            <Route path="carta/:lang/:id" element={<TcgCardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </CurrencyProvider>
    </HashRouter>
  );
}
