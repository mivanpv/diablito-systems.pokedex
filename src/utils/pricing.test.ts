import type { TcgPricing } from '../types/tcgdex';
import { summarizePricing } from './pricing';

describe('summarizePricing', () => {
  it('uses the main TCGplayer variant: market price and low–high range', () => {
    const pricing: TcgPricing = {
      tcgplayer: {
        updated: '',
        unit: 'USD',
        'reverse-holofoil': { lowPrice: 0.17, marketPrice: 0.44, highPrice: 19.8 },
        normal: { lowPrice: 0.02, midPrice: 0.25, marketPrice: 0.25, highPrice: 25.26 },
      },
    };
    expect(summarizePricing(pricing)).toEqual({
      source: 'TCGplayer',
      currency: 'USD',
      market: 0.25,
      low: 0.02,
      high: 25.26,
    });
  });

  it('skips variants without prices and falls back to the mid price for the market', () => {
    const pricing: TcgPricing = {
      tcgplayer: {
        updated: '',
        unit: 'USD',
        normal: { lowPrice: null, marketPrice: null, highPrice: null },
        holofoil: { lowPrice: 3, midPrice: 5, marketPrice: null, highPrice: 9 },
      },
    };
    expect(summarizePricing(pricing)).toMatchObject({ market: 5, low: 3, high: 9 });
  });

  it('falls back to Cardmarket (EUR, no maximum) when TCGplayer has nothing', () => {
    const pricing: TcgPricing = {
      tcgplayer: null,
      cardmarket: { updated: '', unit: 'EUR', avg: 0.08, low: 0.02, trend: 0.09 },
    };
    expect(summarizePricing(pricing)).toEqual({
      source: 'Cardmarket',
      currency: 'EUR',
      market: 0.09,
      low: 0.02,
      high: null,
    });
  });

  it('returns null when there are no prices at all', () => {
    expect(summarizePricing(undefined)).toBeNull();
    expect(summarizePricing({ cardmarket: { updated: '', unit: 'EUR', avg: 0, low: null, trend: null } })).toBeNull();
  });
});
