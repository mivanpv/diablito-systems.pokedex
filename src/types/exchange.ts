export interface ExchangeRatesResponse {
  result: 'success' | 'error';
  base_code: string;
  time_last_update_utc: string;
  rates: Record<string, number>;
  'error-type'?: string;
}
