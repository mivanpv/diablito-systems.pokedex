import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { getRates } from '../services/exchange';
import { convert } from '../utils/format';

export const SUPPORTED_CURRENCIES = ['MXN', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'ARS', 'CLP', 'COP', 'PEN'];
const DEFAULT_CURRENCY = 'MXN';
const STORAGE_KEY = 'pokedex:currency';

interface CurrencyContextValue {
  currency: string;
  setCurrency: (currency: string) => void;
  ratesLoading: boolean;
  ratesError: Error | null;
  lastUpdate: string | null;
  /** Converts `amount` from `from` to the selected currency; null if rates are unavailable. */
  convertToSelected: (amount: number, from: string) => number | null;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStoredCurrency(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && SUPPORTED_CURRENCIES.includes(stored) ? stored : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState(readStoredCurrency);
  const { data, error, loading } = useAsync((signal) => getRates(signal), []);

  const setCurrency = useCallback((next: string) => {
    setCurrencyState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not persisted; the selection still applies for this visit.
    }
  }, []);

  const convertToSelected = useCallback(
    (amount: number, from: string) => (data ? convert(amount, from, currency, data.rates) : null),
    [data, currency]
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      ratesLoading: loading,
      ratesError: error,
      lastUpdate: data?.time_last_update_utc ?? null,
      convertToSelected,
    }),
    [currency, setCurrency, loading, error, data, convertToSelected]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency debe usarse dentro de <CurrencyProvider>');
  return context;
}
