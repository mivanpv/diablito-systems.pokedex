import { SUPPORTED_CURRENCIES, useCurrency } from '../context/CurrencyContext';

export default function CurrencySelector() {
  const { currency, setCurrency, ratesError } = useCurrency();

  return (
    <label className="dex-btn cursor-pointer gap-2 py-1" title={ratesError ? ratesError.message : 'Moneda para los precios de cartas TCG'}>
      <span className={`h-2 w-2 rounded-full ${ratesError ? 'bg-yellow-400' : 'bg-dex-ok'}`} aria-hidden="true" />
      <span className="hidden sm:inline">MONEDA</span>
      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
        aria-label="Moneda"
        className="cursor-pointer bg-transparent font-display text-xs font-bold focus:outline-none"
      >
        {SUPPORTED_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </label>
  );
}
