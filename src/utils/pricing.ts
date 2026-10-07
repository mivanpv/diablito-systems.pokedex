import type { TcgPricing, TcgplayerVariantPricing } from '../types/tcgdex';

export interface PriceSummary {
  source: 'TCGplayer' | 'Cardmarket';
  /** Currency the amounts are in (USD for TCGplayer, EUR for Cardmarket). */
  currency: string;
  market: number | null;
  low: number | null;
  /** Cardmarket publishes no maximum, so this can be null. */
  high: number | null;
}

// The card's "main" printing first; any other variant TCGplayer reports comes after.
const VARIANT_PRIORITY = [
  'normal',
  'holofoil',
  'reverse-holofoil',
  'unlimited-holofoil',
  'unlimited',
  '1st-edition-holofoil',
  '1st-edition',
];

const positive = (value: number | null | undefined): number | null =>
  typeof value === 'number' && value > 0 ? value : null;

/**
 * One market price plus min–max range for a card tile, preferring TCGplayer (USD)
 * and falling back to Cardmarket (EUR). Returns null when the card has no prices.
 */
export function summarizePricing(pricing: TcgPricing | undefined): PriceSummary | null {
  const tcgplayer = pricing?.tcgplayer;
  if (tcgplayer) {
    const variants = Object.entries(tcgplayer)
      .filter((entry): entry is [string, TcgplayerVariantPricing] => typeof entry[1] === 'object' && entry[1] !== null)
      .sort(([a], [b]) => rank(a) - rank(b));

    const variant = variants.find(([, v]) => positive(v.marketPrice) ?? positive(v.midPrice) ?? positive(v.lowPrice));
    if (variant) {
      const [, v] = variant;
      return {
        source: 'TCGplayer',
        currency: tcgplayer.unit,
        market: positive(v.marketPrice) ?? positive(v.midPrice),
        low: positive(v.lowPrice),
        high: positive(v.highPrice),
      };
    }
  }

  const cardmarket = pricing?.cardmarket;
  if (cardmarket) {
    const market = positive(cardmarket.trend) ?? positive(cardmarket.avg) ?? positive(cardmarket.avg30);
    const low = positive(cardmarket.low);
    if (market !== null || low !== null) {
      return { source: 'Cardmarket', currency: cardmarket.unit, market, low, high: null };
    }
  }

  return null;
}

function rank(variant: string): number {
  const index = VARIANT_PRIORITY.indexOf(variant);
  return index === -1 ? VARIANT_PRIORITY.length : index;
}
