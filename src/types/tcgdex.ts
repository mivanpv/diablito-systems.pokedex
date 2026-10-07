export type TcgLang = 'es' | 'en';

export interface TcgCardBrief {
  id: string;
  localId: string;
  name: string;
  /** Base asset URL; append `/low.webp` or `/high.webp`. Missing for some cards. */
  image?: string;
}

export interface CardmarketPricing {
  updated: string;
  unit: string; // EUR
  avg?: number | null;
  low?: number | null;
  trend?: number | null;
  avg7?: number | null;
  avg30?: number | null;
  'avg-holo'?: number | null;
  'low-holo'?: number | null;
  'trend-holo'?: number | null;
}

export interface TcgplayerVariantPricing {
  productId?: number;
  lowPrice?: number | null;
  midPrice?: number | null;
  highPrice?: number | null;
  marketPrice?: number | null;
  directLowPrice?: number | null;
}

/** `unit` and `updated` plus one entry per variant (normal, holofoil, reverse-holofoil...). */
export interface TcgplayerPricing {
  updated: string;
  unit: string; // USD
  [variant: string]: TcgplayerVariantPricing | string;
}

export interface TcgPricing {
  cardmarket?: CardmarketPricing | null;
  tcgplayer?: TcgplayerPricing | null;
}

export interface TcgCard extends TcgCardBrief {
  category: string;
  illustrator?: string;
  rarity?: string;
  hp?: number;
  types?: string[];
  stage?: string;
  set: {
    id: string;
    name: string;
    logo?: string;
    symbol?: string;
    cardCount?: { official: number; total: number };
  };
  pricing?: TcgPricing;
}
