/**
 * Converts between two currencies using rates that share one base
 * (ExchangeRate-API returns everything relative to USD).
 * Returns null when either currency is missing from `rates`.
 */
export function convert(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number | null {
  if (from === to) return amount;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return null;
  return (amount / fromRate) * toRate;
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);
}

/** "mr-mime" -> "Mr Mime" */
export function capitalize(value: string): string {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** 25 -> "#0025" */
export function padId(id: number): string {
  return `#${String(id).padStart(4, '0')}`;
}
