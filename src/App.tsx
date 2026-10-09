import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { CollectionsProvider } from './context/CollectionsContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { PortfoliosProvider } from './context/PortfoliosContext';
import CollectionsPage from './pages/CollectionsPage';
import DexPage from './pages/DexPage';
import HelpPage from './pages/HelpPage';
import NotFoundPage from './pages/NotFoundPage';
import PortfoliosPage from './pages/PortfoliosPage';
import TcgCardPage from './pages/TcgCardPage';

// HashRouter is required: GitHub Pages serves static files and would return 404
// for deep links such as /pokemon/pikachu when using BrowserRouter.
export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CurrencyProvider>
        <CollectionsProvider>
          <PortfoliosProvider>
            <Routes>
              <Route element={<Layout />}>
                {/* Pathless parent keeps DexPage mounted between "/" and "/pokemon/:name"
                    (list scroll position) — DexPage reads the name via useMatch. */}
                <Route element={<DexPage />}>
                  <Route index element={null} />
                  <Route path="pokemon/:name" element={null} />
                </Route>
                <Route path="carta/:lang/:id" element={<TcgCardPage />} />
                <Route path="colecciones" element={<CollectionsPage />} />
                <Route path="portafolios" element={<PortfoliosPage />} />
                <Route path="ayuda" element={<HelpPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </PortfoliosProvider>
        </CollectionsProvider>
      </CurrencyProvider>
    </HashRouter>
  );
}
