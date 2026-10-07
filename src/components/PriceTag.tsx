import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/format';

interface PriceTagProps {
  amount: number;
  /** Currency the source API reports the price in (USD for TCGplayer, EUR for Cardmarket). */
  sourceCurrency: string;
}

/** Shows a price converted to the selected currency, with the original amount underneath. */
export default function PriceTag({ amount, sourceCurrency }: PriceTagProps) {
  const { currency, convertToSelected } = useCurrency();
  const converted = convertToSelected(amount, sourceCurrency);
  const original = formatCurrency(amount, sourceCurrency);

  if (converted === null || currency === sourceCurrency) {
    return <span className="font-semibold tabular-nums">{original}</span>;
  }

  return (
    <span className="flex flex-col items-end leading-tight">
      <span className="font-semibold tabular-nums">{formatCurrency(converted, currency)}</span>
      <span className="text-xs text-slate-400 tabular-nums">{original}</span>
    </span>
  );
}
