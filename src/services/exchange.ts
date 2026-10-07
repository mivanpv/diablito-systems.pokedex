import type { ExchangeRatesResponse } from '../types/exchange';
import { fetchJson } from './http';

// Open-access endpoint of ExchangeRate-API: no key required, rates refresh once a day.
const RATES_URL = 'https://open.er-api.com/v6/latest/USD';

export function getRates(signal?: AbortSignal) {
  return fetchJson<ExchangeRatesResponse>(RATES_URL, {
    persist: true,
    signal,
    validate: (data) => {
      if (data.result !== 'success') {
        throw new Error(`ExchangeRate-API respondió con error: ${data['error-type'] ?? 'desconocido'}`);
      }
    },
  });
}
