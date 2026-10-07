import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addCard,
  CardRef,
  countCards,
  createPortfolio as createPortfolioState,
  deletePortfolio as deletePortfolioState,
  isInPortfolio,
  parsePortfolios,
  Portfolio,
  PortfoliosState,
  removeCard,
  setQuantity as setQuantityState,
  toggleCard,
} from '../utils/portfolios';

const STORAGE_KEY = 'pokedex:portfolios';

interface PortfoliosContextValue {
  portfolios: Portfolio[];
  lastPortfolioId: string;
  cardCount: number;
  isIn: (portfolioId: string, cardId: string) => boolean;
  add: (portfolioId: string, card: CardRef) => void;
  remove: (portfolioId: string, cardId: string) => void;
  toggle: (portfolioId: string, card: CardRef) => void;
  setQuantity: (portfolioId: string, cardId: string, quantity: number) => void;
  /** Creates (or reuses, by name) a portfolio, selects it, and optionally saves a card into it. */
  createPortfolio: (name: string, card?: CardRef) => string | null;
  deletePortfolio: (portfolioId: string) => void;
}

const PortfoliosContext = createContext<PortfoliosContextValue | null>(null);

function load(): PortfoliosState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return parsePortfolios(raw ? JSON.parse(raw) : null);
  } catch {
    return parsePortfolios(null);
  }
}

/** Portfolios live in localStorage (no backend); other tabs stay in sync via the storage event. */
export function PortfoliosProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable (private mode): portfolios last for this visit only.
    }
  }, [state]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        setState(parsePortfolios(event.newValue ? JSON.parse(event.newValue) : null));
      } catch {
        // ignore malformed data written elsewhere
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((id: string, card: CardRef) => setState((s) => addCard(s, id, card)), []);
  const remove = useCallback((id: string, cardId: string) => setState((s) => removeCard(s, id, cardId)), []);
  const toggle = useCallback((id: string, card: CardRef) => setState((s) => toggleCard(s, id, card)), []);
  const setQuantity = useCallback(
    (id: string, cardId: string, quantity: number) => setState((s) => setQuantityState(s, id, cardId, quantity)),
    []
  );
  const deletePortfolio = useCallback((id: string) => setState((s) => deletePortfolioState(s, id)), []);

  const createPortfolio = useCallback(
    (name: string, card?: CardRef) => {
      // computed from the current state so the new id can be returned synchronously
      const result = createPortfolioState(state, name);
      if (result.portfolioId === null) return null;
      const portfolioId = result.portfolioId;
      setState(card ? addCard(result.state, portfolioId, card) : result.state);
      return portfolioId;
    },
    [state]
  );

  const value = useMemo<PortfoliosContextValue>(
    () => ({
      portfolios: state.portfolios,
      lastPortfolioId: state.lastPortfolioId,
      cardCount: countCards(state),
      isIn: (portfolioId, cardId) => isInPortfolio(state, portfolioId, cardId),
      add,
      remove,
      toggle,
      setQuantity,
      createPortfolio,
      deletePortfolio,
    }),
    [state, add, remove, toggle, setQuantity, createPortfolio, deletePortfolio]
  );

  return <PortfoliosContext.Provider value={value}>{children}</PortfoliosContext.Provider>;
}

export function usePortfolios(): PortfoliosContextValue {
  const context = useContext(PortfoliosContext);
  if (!context) throw new Error('usePortfolios debe usarse dentro de <PortfoliosProvider>');
  return context;
}
