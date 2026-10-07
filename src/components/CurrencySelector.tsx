import { SUPPORTED_CURRENCIES, useCurrency } from '../context/CurrencyContext';

export default function CurrencySelector() {
  const { currency, setCurrency, ratesError } = useCurrency();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span>Moneda</span>
      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
        className="rounded-md border-0 bg-white px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-poke-yellow"
      >
        {SUPPORTED_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
      {ratesError && (
        <span title={ratesError.message} className="text-poke-yellow">
          ⚠ sin tipos de cambio
        </span>
      )}
    </label>
  );
}
